---
title: Utilities
description: Модуль util поддерживает потребности внутренних API Node.js. Многие из утилит полезны и для разработчиков приложений и модулей
---

# Утилиты

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/util.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:util` поддерживает потребности внутренних API Node.js. Многие из утилит полезны и для разработчиков приложений и модулей. Чтобы получить к нему доступ:

<!-- 0001.part.md -->

```js
const util = require('node:util');
```

<!-- 0002.part.md -->

## `util.callbackify(original)`

- `original` {Function} Функция `async`.
- Возвращает: {Function} функцию в стиле обратного вызова

Принимает функцию `async` (или функцию, возвращающую `Promise`) и возвращает функцию в стиле обратного вызова по ошибке, т.е. принимая в качестве последнего аргумента обратный вызов `(err, value) => ...`. В обратном вызове первым аргументом будет причина отказа (или `null`, если `Promise` разрешилась), а вторым аргументом будет разрешенное значение.

<!-- 0003.part.md -->

```js
const util = require('node:util');

async function fn() {
  return 'hello world';
}
const callbackFunction = util.callbackify(fn);

callbackFunction((err, ret) => {
  if (err) throw err;
  console.log(ret);
});
```

<!-- 0004.part.md -->

Будет печататься:

<!-- 0005.part.md -->

```text
hello world
```

<!-- 0006.part.md -->

Обратный вызов выполняется асинхронно и имеет ограниченный стек-трейс. Если обратный вызов отбрасывается, процесс выдает событие [`'uncaughtException'`](process.md#event-uncaughtexception), и, если оно не обработано, завершается.

Поскольку `null` имеет особое значение в качестве первого аргумента обратного вызова, если обернутая функция отклоняет `Promise` с ложным значением в качестве причины, значение обертывается в `Error` с сохранением исходного значения в поле с именем `reason`.

<!-- 0007.part.md -->

```js
function fn() {
  return Promise.reject(null);
}
const callbackFunction = util.callbackify(fn);

callbackFunction((err, ret) => {
  // When the Promise was rejected with `null` it is wrapped with an Error and
  // the original value is stored in `reason`.
  err &&
    Object.hasOwn(err, 'reason') &&
    err.reason === null; // true
});
```

<!-- 0008.part.md -->

## `util.debuglog(section[, callback])`.

- `section` {string} Строка, идентифицирующая часть приложения, для которой создается функция `debuglog`.
- `callback` {функция} Обратный вызов, вызываемый при первом вызове функции логирования с аргументом функции, который является более оптимизированной функцией логирования.
- Возвращает: {Function} Функция протоколирования.

Метод `util.debuglog()` используется для создания функции, которая условно записывает отладочные сообщения в `stderr` на основе существования переменной окружения `NODE_DEBUG`. Если имя `section` встречается в значении этой переменной окружения, то возвращаемая функция работает аналогично [`console.error()`](console.md#consoleerrordata-args). Если нет, то возвращаемая функция не работает.

<!-- 0009.part.md -->

```js
const util = require('node:util');
const debuglog = util.debuglog('foo');

debuglog('hello from foo [%d]', 123);
```

<!-- 0010.part.md -->

Если эту программу запустить с `NODE_DEBUG=foo` в окружении, то она выдаст что-то вроде:

<!-- 0011.part.md -->

```console
FOO 3245: hello from foo [123]
```

<!-- 0012.part.md -->

где `3245` - идентификатор процесса. Если программа не запущена с установленной переменной окружения, то она ничего не выведет.

Секция `section` также поддерживает подстановочный знак:

<!-- 0013.part.md -->

```js
const util = require('node:util');
const debuglog = util.debuglog('foo-bar');

debuglog("hi there, it's foo-bar [%d]", 2333);
```

<!-- 0014.part.md -->

если его запустить с `NODE_DEBUG=foo*` в окружении, то он выдаст что-то вроде:

<!-- 0015.part.md -->

```console
FOO-BAR 3257: hi there, it's foo-bar [2333]
```

<!-- 0016.part.md -->

В переменной окружения `NODE_DEBUG` можно указать несколько имен `section`, разделенных запятыми: `NODE_DEBUG=fs,net,tls`.

Необязательный аргумент `callback` может быть использован для замены функции протоколирования другой функцией, не имеющей инициализации или ненужной обертки.

<!-- 0017.part.md -->

```js
const util = require('node:util');
let debuglog = util.debuglog('internals', (debug) => {
  // Replace with a logging function that optimizes out
  // testing if the section is enabled
  debuglog = debug;
});
```

<!-- 0018.part.md -->

### `debuglog().enabled`

- {boolean}

Геттер `util.debuglog().enabled` используется для создания теста, который может быть использован в условиях, основанных на существовании переменной окружения `NODE_DEBUG`. Если имя `section` встречается в значении этой переменной окружения, то возвращаемое значение будет `true`. Если нет, то возвращаемое значение будет `false`.

<!-- 0019.part.md -->

```js
const util = require('node:util');
const enabled = util.debuglog('foo').enabled;
if (enabled) {
  console.log('hello from foo [%d]', 123);
}
```

<!-- 0020.part.md -->

Если эту программу запустить с `NODE_DEBUG=foo` в окружении, то она выдаст что-то вроде:

<!-- 0021.part.md -->

```console
hello from foo [123]
```

<!-- 0022.part.md -->

## `util.debug(section)`.

Псевдоним для `util.debuglog`. Использование позволяет читать то, что не подразумевает ведение журнала при использовании только `util.debuglog().enabled`.

## `util.deprecate(fn, msg[, code])`.

- `fn` {Функция} Функция, которая устаревает.
- `msg` {string} Предупреждающее сообщение, которое будет отображаться при вызове устаревшей функции.
- `code` {string} Код устаревания. Список кодов см. в [list of deprecated APIs](deprecations.md#list-of-deprecated-apis).
- Возвращает: {Функция} Устаревшая функция, обернутая для выдачи предупреждения.

Метод `util.deprecate()` оборачивает `fn` (которая может быть функцией или классом) таким образом, что она помечается как устаревшая.

<!-- 0023.part.md -->

```js
const util = require('node:util');

exports.obsoleteFunction = util.deprecate(() => {
  // Do something here.
}, 'obsoleteFunction() is deprecated. Use newShinyFunction() instead.');
```

<!-- 0024.part.md -->

При вызове `util.deprecate()` возвращает функцию, которая выдает `DeprecationWarning`, используя событие [`'warning'`](process.md#event-warning). Предупреждение будет выдано и выведено в `stderr` при первом вызове возвращаемой функции. После того, как предупреждение будет выдано, обернутая функция будет вызвана без выдачи предупреждения.

Если в нескольких вызовах `util.deprecate()` указан один и тот же необязательный `code`, предупреждение будет выдано только один раз для этого `code`.

<!-- 0025.part.md -->

```js
const util = require('node:util');

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

<!-- 0026.part.md -->

Если используются флаги командной строки `--no-deprecation` или `--no-warnings`, или если свойство `process.noDeprecation` установлено в `true` _до_ первого предупреждения об износе, метод `util.deprecate()` ничего не делает.

Если установлены флаги командной строки `--trace-deprecation` или `--trace-warnings`, или свойство `process.traceDeprecation` установлено в `true`, предупреждение и трассировка стека печатаются в `stderr` при первом вызове обесценивающейся функции.

Если установлен флаг командной строки `--throw-deprecation` или свойство `process.throwDeprecation` установлено в `true`, то при вызове устаревшей функции будет вызвано исключение.

Флаг командной строки `--throw-deprecation` и свойство `process.throwDeprecation` имеют приоритет над `--trace-deprecation` и `process.traceDeprecation`.

## `util.format(format[, ...args])`

- `format` {string} Строка формата, подобная `printf`.

Метод `util.format()` возвращает отформатированную строку, используя первый аргумент как `printf`-подобную строку формата, которая может содержать ноль или более спецификаторов формата. Каждый спецификатор заменяется преобразованным значением соответствующего аргумента. Поддерживаются следующие спецификаторы:

- `%s`: `String` будет использоваться для преобразования всех значений, кроме `BigInt`, `Object` и `-0`. Значения `BigInt` будут представлены символом `n`, а Объекты, не имеющие определенной пользователем функции `toString`, проверяются с помощью `util.inspect()` с опциями `{ depth: 0, colors: false, compact: 3 }`.
- `%d`: `Number` будет использоваться для преобразования всех значений, кроме `BigInt` и `Symbol`.
- `%i`: `parseInt(value, 10)` используется для всех значений, кроме `BigInt` и `Symbol`.
- `%f`: `parseFloat(value)` используется для всех значений, кроме `Symbol`.
- `%j`: JSON. Заменяется строкой `'[Circular]'`, если аргумент содержит круговые ссылки.
- `%o`: `Object`. Строковое представление объекта с общим форматированием объектов JavaScript. Аналогично `util.inspect()` с опциями `{ showHidden: true, showProxy: true }`. Это покажет полный объект, включая неперечисляемые свойства и прокси.
- `%O`: `Object`. Строковое представление объекта с общим форматированием объекта JavaScript. Аналогично `util.inspect()` без опций. Будет показан полный объект, не включая неперечисляемые свойства и прокси.
- `%c`: `CSS`. Этот спецификатор игнорируется и пропускает все переданные CSS.
- `%%`: одиночный знак процента (`'%'`). Аргумент не используется.
- Возвращает: {строка} форматированная строка.

Если спецификатор не имеет соответствующего аргумента, он не заменяется:

<!-- 0027.part.md -->

```js
util.format('%s:%s', 'foo');
// Returns: 'foo:%s'
```

<!-- 0028.part.md -->

Значения, не являющиеся частью строки формата, форматируются с помощью `util.inspect()`, если их тип не `string`.

Если в метод `util.format()` передано больше аргументов, чем количество спецификаторов, дополнительные аргументы конкатенируются в возвращаемую строку, разделяясь пробелами:

<!-- 0029.part.md -->

```js
util.format('%s:%s', 'foo', 'bar', 'baz');
// Returns: 'foo:bar baz'
```

<!-- 0030.part.md -->

Если первый аргумент не содержит допустимого спецификатора формата, `util.format()` возвращает строку, которая является конкатенацией всех аргументов, разделенных пробелами:

<!-- 0031.part.md -->

```js
util.format(1, 2, 3);
// Returns: '1 2 3'
```

<!-- 0032.part.md -->

Если в `util.format()` передан только один аргумент, он возвращается в исходном виде без какого-либо форматирования:

<!-- 0033.part.md -->

```js
util.format('%% %s');
// Returns: '%% %s'
```

<!-- 0034.part.md -->

`util.format()` - это синхронный метод, который предназначен для отладки. Некоторые входные значения могут иметь значительный перерасход производительности, который может заблокировать цикл событий. Используйте эту функцию с осторожностью и никогда в горячем пути кода.

## `util.formatWithOptions(inspectOptions, format[, ...args])`.

- `inspectOptions` {Object}
- `format` {string}

Эта функция идентична [`util.format()`](#utilformatformat-args), за исключением того, что она принимает аргумент `inspectOptions`, который определяет опции, передаваемые [`util.inspect()`](#utilinspectobject-options).

<!-- 0035.part.md -->

```js
util.formatWithOptions({ colors: true }, 'See object %O', {
  foo: 42,
});
// Returns 'See object { foo: 42 }', where `42` is colored as a number
// when printed to a terminal.
```

<!-- 0036.part.md -->

## `util.getSystemErrorName(err)`

- `err` {число}
- Возвращает: {строка}

Возвращает строковое имя для числового кода ошибки, который поступает из API Node.js. Сопоставление между кодами ошибок и именами ошибок зависит от платформы. Имена распространенных ошибок см. в [Common System Errors](errors.md#common-system-errors).

<!-- 0037.part.md -->

```js
fs.access('file/that/does/not/exist', (err) => {
  const name = util.getSystemErrorName(err.errno);
  console.error(name); // ENOENT
});
```

<!-- 0038.part.md -->

## `util.getSystemErrorMap()`.

- Возвращает: {Map}

Возвращает карту всех кодов системных ошибок, доступных из API Node.js. Сопоставление между кодами ошибок и именами ошибок зависит от платформы. Имена распространенных ошибок см. в [Common System Errors](errors.md#common-system-errors).

<!-- 0039.part.md -->

```js
fs.access('file/that/does/not/exist', (err) => {
  const errorMap = util.getSystemErrorMap();
  const name = errorMap.get(err.errno);
  console.error(name); // ENOENT
});
```

<!-- 0040.part.md -->

## `util.inherits(constructor, superConstructor)`.

> Стабильность: 3 - Наследие: Используйте синтаксис классов ES2015 и ключевое слово `extends` вместо этого.

- `constructor` {Function}
- `superConstructor` {Функция}

Использование `util.inherits()` не рекомендуется. Пожалуйста, используйте ключевые слова ES6 `class` и `extends`, чтобы получить поддержку наследования на уровне языка. Также обратите внимание, что эти два стиля [семантически несовместимы] (https://github.com/nodejs/node/issues/4179).

Наследуйте методы прототипа из одного [конструктора](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/constructor) в другой. Прототип `constructor` будет установлен на новый объект, созданный из `superConstructor`.

Это в основном добавляет некоторую проверку ввода поверх `Object.setPrototypeOf(constructor.prototype, superConstructor.prototype)`. В качестве дополнительного удобства, `superConstructor` будет доступен через свойство `constructor.super_`.

<!-- 0041.part.md -->

```js
const util = require('node:util');
const EventEmitter = require('node:events');

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

<!-- 0042.part.md -->

Пример ES6 с использованием `class` и `extends`:

<!-- 0043.part.md -->

```js
const EventEmitter = require('node:events');

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

<!-- 0044.part.md -->

## `util.inspect(object[, options])`

## `util.inspect(object[, showHidden[, depth[, colors]]])`.

- `object` {any} Любой примитив JavaScript или `Object`.
- `options` {Object}
  - `showHidden` {boolean} Если `true`, то неперечисляемые символы и свойства `объекта` будут включены в отформатированный результат. Также включаются записи [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) и [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet), а также определяемые пользователем свойства прототипа (за исключением свойств метода). **По умолчанию:** `false`.
  - `depth` {number} Определяет количество раз для перебора при форматировании `объекта`. Это полезно для проверки больших объектов. Для вызова до максимального размера стека вызовов передайте `Infinity` или `null`. **По умолчанию:** `2`.
  - `colors` {boolean} Если `true`, вывод будет оформлен с использованием цветовых кодов ANSI. Цвета можно настраивать. Смотрите [Настройка цветов `util.inspect`](#customizing-utilinspect-colors). **По умолчанию:** `false`.
  - `customInspect` {boolean}. Если `false`, то функции `[util.inspect.custom](depth, opts, inspect)` не вызываются. **По умолчанию:** `true`.
  - `showProxy` {boolean} Если `true`, то проверка `Proxy` включает объекты [`target` и `handler`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Terminology). **По умолчанию:** `false`.
  - `maxArrayLength` {целое число} Определяет максимальное количество элементов `Array`, [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set), [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) и [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet), которые следует включать при форматировании. Установите значение `null` или `Infinity`, чтобы показать все элементы. Установите значение `0` или отрицательное, чтобы не показывать никаких элементов. **По умолчанию:** `100`.
  - `maxStringLength` {целое число} Определяет максимальное количество символов для включения при форматировании. Установите значение `null` или `бесконечность`, чтобы показать все элементы. Установите `0` или отрицательное значение, чтобы не показывать никаких символов. **По умолчанию:** `10000`.
  - `breakLength` {целое число} Длина, при которой вводимые значения разбиваются на несколько строк. Установите значение `Infinity` для форматирования ввода в виде одной строки (в сочетании с `compact`, установленным в `true` или любым числом \>= `1`). **По умолчанию:** `80`.
  - `compact` {boolean|integer} Установка этого параметра в `false` приводит к тому, что каждый ключ объекта будет отображаться на новой строке. Текст, длина которого превышает `breakLength`, будет обрываться на новых строках. Если задано число, то наиболее `n` внутренних элементов объединяются на одной строке, пока все свойства помещаются в `breakLength`. Короткие элементы массива также группируются вместе. F

<!-- 0045.part.md -->

      - `sorted` {boolean|Function} Если установлено значение `true` или функция, все свойства объекта, а также записи `Set` и `Map` сортируются в результирующей строке. Если установлено значение `true`, то используется [сортировка по умолчанию](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort). Если задана функция, то она используется как [функция сравнения](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Parameters).
      - `getters` {boolean|string} Если установлено значение `true`, проверяются геттеры. Если установлено значение `'get'`, проверяются только геттеры без соответствующего сеттера. Если установлено значение `'set'`, проверяются только геттеры с соответствующим сеттером. Это может вызвать побочные эффекты в зависимости от функции getter. **По умолчанию:** `false`.
      - `numericSeparator` {boolean} Если установлено значение `true`, то подчеркивание используется для разделения каждых трех цифр во всех bigint и числах. **По умолчанию:** `false`.

- Возвращает: {строка} Представление `объекта`.

Метод `util.inspect()` возвращает строковое представление `объекта`, предназначенное для отладки. Вывод `util.inspect` может измениться в любой момент и не должен зависеть от него программно. Могут быть переданы дополнительные `опции`, которые изменяют результат. `util.inspect()` будет использовать имя конструктора и/или `@@toStringTag` для создания идентифицируемой метки для проверяемого значения.

<!-- 0046.part.md -->

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

<!-- 0047.part.md -->

Циркулярные ссылки указывают на свой якорь с помощью ссылочного индекса:

<!-- 0048.part.md -->

```js
const { inspect } = require('node:util');

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

<!-- 0049.part.md -->

В следующем примере проверяются все свойства объекта `util`:

<!-- 0050.part.md -->

```js
const util = require('node:util');

console.log(
  util.inspect(util, { showHidden: true, depth: null })
);
```

<!-- 0051.part.md -->

В следующем примере показан эффект опции `compact`:

<!-- 0052.part.md -->

```js
const util = require('node:util');

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

<!-- 0053.part.md -->

Опция `showHidden` позволяет просматривать записи [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) и [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet). Если записей больше, чем `maxArrayLength`, то нет гарантии, какие записи будут отображены. Это означает, что получение одних и тех же записей [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) дважды может привести к разным результатам. Более того, записи, в которых не осталось сильных ссылок, могут быть собраны в мусор в любое время.

<!-- 0054.part.md -->

```js
const { inspect } = require('node:util');

const obj = { a: 1 };
const obj2 = { b: 2 };
const weakSet = new WeakSet([obj, obj2]);

console.log(inspect(weakSet, { showHidden: true }));
// WeakSet { { a: 1 }, { b: 2 } }
```

<!-- 0055.part.md -->

Опция `sorted гарантирует, что порядок вставки свойств объекта не повлияет на результат работы `util.inspect()`.

<!-- 0056.part.md -->

```js
const { inspect } = require('node:util');
const assert = require('node:assert');

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

<!-- 0057.part.md -->

Опция `numericSeparator` добавляет ко всем числам подчеркивание через каждые три цифры.

<!-- 0058.part.md -->

```js
const { inspect } = require('node:util');

const thousand = 1_000;
const million = 1_000_000;
const bigNumber = 123_456_789n;
const bigDecimal = 1_234.123_45;

console.log(thousand, million, bigNumber, bigDecimal);
// 1_000 1_000_000 123_456_789n 1_234.123_45
```

<!-- 0059.part.md -->

`util.inspect()` - это синхронный метод, предназначенный для отладки. Его максимальная длина выходных данных составляет приблизительно 128 МиБ. Вводы, которые приводят к более длинному выводу, будут усечены.

### Настройка цветов `util.inspect`.

Вывод цвета (если он включен) в `util.inspect` настраивается глобально через свойства `util.inspect.styles` и `util.inspect.colors`.

`util.inspect.styles` - это карта, связывающая имя стиля с цветом из `util.inspect.colors`.

По умолчанию используются следующие стили и связанные с ними цвета:

- `bigint`: `yellow`.
- `булево`: `желтый`
- `дата`: `маджента`.
- `модуль`: `андерлайн`
- `имя`: (без стилизации)
- `null`: `жирный`
- `число`: `желтый`
- `regexp`: `red`
- `специальный`: `синий` (например, `Proxies`)
- `строка`: `зеленый`
- `символ`: `зеленый`
- `неопределенный`: `серый`

Цветовая стилизация использует управляющие коды ANSI, которые могут поддерживаться не на всех терминалах. Для проверки поддержки цветов используйте [`tty.hasColors()`](tty.md#writestreamhascolorscount-env).

Ниже перечислены предопределенные управляющие коды (сгруппированные как "Модификаторы", "Цвета переднего плана" и "Цвета заднего плана").

#### Модификаторы

Modifier support varies throughout different terminals. They will mostly be ignored, if not supported.

- `reset` - Resets all (color) modifiers to their defaults
- **bold** - Make text bold
- _italic_ - Make text italic
- <span style="border-bottom: 1px;">underline</span> - Make text underlined
- ~~strikethrough~~ - Puts a horizontal line through the center of the text (Alias: `strikeThrough`, `crossedout`, `crossedOut`)
- `hidden` - Prints the text, but makes it invisible (Alias: conceal)
- <span style="opacity: 0.5;">dim</span> - Decreased color intensity (Alias: `faint`)
- <span style="border-top: 1px">overlined</span> - Make text overlined
- blink - Hides and shows the text in an interval
- <span style="filter: invert(100%)">inverse</span> - Swap foreground and background colors (Alias: `swapcolors`, `swapColors`)
- <span style="border-bottom: 1px double;">doubleunderline</span> - Make text double underlined (Alias: `doubleUnderline`)
- <span style="border: 1px">framed</span> - Draw a frame around the text

#### Цвета переднего плана

- `черный`
- `красный`
- зелёный
- `жёлтый`
- `синий`
- маджента
- циан
- `белый`
- `серый` (псевдонимы: `grey`, `blackBright`)
- `redBright`
- `зеленый`
- `желто-светлый`
- `blueBright`
- `magentaBright`
- `cyanBright`
- `белый`

#### Фоновые цвета

- `bgBlack`
- `bgRed`
- `bgGreen`
- `bgYellow`
- `bgBlue`
- `bgMagenta`
- `bgCyan`
- `bgWhite`
- `bgGray` (псевдонимы: `bgGrey`, `bgBlackBright`)
- `bgRedBright`
- `bgGreenBright`
- `bgYellowBright`
- `bgBlueBright`
- `bgMagentaBright`
- `bgCyanBright`
- `bgWhiteBright`

### Пользовательские функции проверки объектов

Объекты могут также определять свои собственные [`[util.inspect.custom](depth, opts, inspect)`](#utilinspectcustom) функции, которые `util.inspect()` будет вызывать и использовать результат при инспектировании объекта.

<!-- 0060.part.md -->

```js
const util = require('node:util');

class Box {
  constructor(value) {
    this.value = value;
  }

  [util.inspect.custom](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize('[Box]', 'special');
    }

    const newOptions = Object.assign({}, options, {
      depth:
        options.depth === null ? null : options.depth - 1,
    });

    // Five space padding because that's the size of "Box< ".
    const padding = ' '.repeat(5);
    const inner = inspect(this.value, newOptions).replace(
      /\n/g,
      `\n${padding}`
    );
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

<!-- 0061.part.md -->

Пользовательские функции `[util.inspect.custom](depth, opts, inspect)` обычно возвращают строку, но могут возвращать значение любого типа, которое будет соответствующим образом отформатировано `util.inspect()`.

<!-- 0062.part.md -->

```js
const util = require('node:util');

const obj = {
  foo: 'this will not show up in the inspect() output',
};
obj[util.inspect.custom] = (depth) => {
  return { bar: 'baz' };
};

util.inspect(obj);
// Returns: "{ bar: 'baz' }"
```

<!-- 0063.part.md -->

### `util.inspect.custom`

- {символ}, который можно использовать для объявления пользовательских функций inspect.

Помимо того, что этот символ доступен через `util.inspect.custom`, он [зарегистрирован глобально](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for) и может быть доступен в любой среде как `Symbol.for('nodejs.util.inspect.custom')`.

Использование этого позволяет писать переносимый код, так что пользовательская функция inspect используется в среде Node.js и игнорируется в браузере. Сама функция `util.inspect()` передается в качестве третьего аргумента в пользовательскую функцию inspect, чтобы обеспечить дальнейшую переносимость.

<!-- 0064.part.md -->

```js
const customInspectSymbol = Symbol.for(
  'nodejs.util.inspect.custom'
);

class Password {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return 'xxxxxxxx';
  }

  [customInspectSymbol](depth, inspectOptions, inspect) {
    return `Password <${this.toString()}>`;
  }
}

const password = new Password('r0sebud');
console.log(password);
// Prints Password <xxxxxxxx>
```

<!-- 0065.part.md -->

Более подробную информацию смотрите в разделе [Пользовательские функции проверки объектов](#custom-inspection-functions-on-objects).

### `util.inspect.defaultOptions`.

Значение `defaultOptions` позволяет настраивать параметры по умолчанию, используемые `util.inspect`. Это полезно для таких функций, как `console.log` или `util.format`, которые неявно вызывают `util.inspect`. Он должен быть установлен в объект, содержащий одну или несколько допустимых опций [`util.inspect()`](#utilinspectobject-options). Также поддерживается непосредственная установка свойств опций.

<!-- 0066.part.md -->

```js
const util = require('node:util');
const arr = Array(101).fill(0);

console.log(arr); // Logs the truncated array
util.inspect.defaultOptions.maxArrayLength = null;
console.log(arr); // logs the full array
```

<!-- 0067.part.md -->

## `util.isDeepStrictEqual(val1, val2)`

- `val1` {любой}
- `val2` {любой}
- Возвращает: {boolean}

Возвращает `true`, если существует глубокое строгое равенство между `val1` и `val2`. В противном случае возвращается `false`.

Дополнительную информацию о глубоком строгом равенстве смотрите в [`assert.deepStrictEqual()`](assert.md#assertdeepstrictequalactual-expected-message).

## Класс: `util.MIMEType`

> Стабильность: 1 - Экспериментальная

Реализация [класса MIMEType](https://bmeck.github.io/node-proposal-mime-api/).

В соответствии с соглашениями браузера, все свойства объектов `MIMEType` реализованы как геттеры и сеттеры прототипа класса, а не как свойства данных самого объекта.

MIME-строка - это структурированная строка, содержащая несколько значимых компонентов. При разборе возвращается объект `MIMEType`, содержащий свойства для каждого из этих компонентов.

### Конструктор: `new MIMEType(input)`.

- `input` {string} Входной MIME для разбора

Создает новый объект `MIMEType` путем разбора `input`.

<!-- 0068.part.md -->

```mjs
import { MIMEType } from 'node:util';

const myMIME = new MIMEType('text/plain');
```

<!-- 0069.part.md -->

<!-- 0070.part.md -->

```cjs
const { MIMEType } = require('node:util');

const myMIME = new MIMEType('text/plain');
```

<!-- 0071.part.md -->

Если `вход` не является допустимым MIME, будет выдана ошибка `TypeError`. Обратите внимание, что будет предпринята попытка преобразовать заданные значения в строки. Например:

<!-- 0072.part.md -->

```mjs
import { MIMEType } from 'node:util';
const myMIME = new MIMEType({
  toString: () => 'text/plain',
});
console.log(String(myMIME));
// Prints: text/plain
```

<!-- 0073.part.md -->

<!-- 0074.part.md -->

```cjs
const { MIMEType } = require('node:util');
const myMIME = new MIMEType({
  toString: () => 'text/plain',
});
console.log(String(myMIME));
// Prints: text/plain
```

<!-- 0075.part.md -->

#### `mime.type`

- {строка}

Получает и устанавливает часть типа MIME.

<!-- 0076.part.md -->

```mjs
import { MIMEType } from 'node:util';

const myMIME = new MIMEType('text/javascript');
console.log(myMIME.type);
// Prints: text
myMIME.type = 'application';
console.log(myMIME.type);
// Prints: application
console.log(String(myMIME));
// Prints: application/javascript
```

<!-- 0077.part.md -->

<!-- 0078.part.md -->

```cjs
const { MIMEType } = require('node:util');

const myMIME = new MIMEType('text/javascript');
console.log(myMIME.type);
// Prints: text
myMIME.type = 'application';
console.log(myMIME.type);
// Prints: application
console.log(String(myMIME));
// Prints: application/javascript
```

<!-- 0079.part.md -->

#### `mime.subtype`

- {строка}

Получает и устанавливает часть подтипа MIME.

<!-- 0080.part.md -->

```mjs
import { MIMEType } from 'node:util';

const myMIME = new MIMEType('text/ecmascript');
console.log(myMIME.subtype);
// Prints: ecmascript
myMIME.subtype = 'javascript';
console.log(myMIME.subtype);
// Prints: javascript
console.log(String(myMIME));
// Prints: text/javascript
```

<!-- 0081.part.md -->

<!-- 0082.part.md -->

```cjs
const { MIMEType } = require('node:util');

const myMIME = new MIMEType('text/ecmascript');
console.log(myMIME.subtype);
// Prints: ecmascript
myMIME.subtype = 'javascript';
console.log(myMIME.subtype);
// Prints: javascript
console.log(String(myMIME));
// Prints: text/javascript
```

<!-- 0083.part.md -->

#### `mime.essence`

- {строка}

Получает сущность MIME. Это свойство доступно только для чтения. Используйте `mime.type` или `mime.subtype` для изменения MIME.

<!-- 0084.part.md -->

```mjs
import { MIMEType } from 'node:util';

const myMIME = new MIMEType('text/javascript;key=value');
console.log(myMIME.essence);
// Prints: text/javascript
myMIME.type = 'application';
console.log(myMIME.essence);
// Prints: application/javascript
console.log(String(myMIME));
// Prints: application/javascript;key=value
```

<!-- 0085.part.md -->

<!-- 0086.part.md -->

```cjs
const { MIMEType } = require('node:util');

const myMIME = new MIMEType('text/javascript;key=value');
console.log(myMIME.essence);
// Prints: text/javascript
myMIME.type = 'application';
console.log(myMIME.essence);
// Prints: application/javascript
console.log(String(myMIME));
// Prints: application/javascript;key=value
```

<!-- 0087.part.md -->

#### `mime.params`

- {MIMEParams}

Получает объект [`MIMEParams`](#class-utilmimeparams), представляющий параметры MIME. Это свойство доступно только для чтения. Подробности см. в документации [`MIMEParams`](#class-utilmimeparams).

#### `mime.toString()`.

- Возвращает: {string}

Метод `toString()` объекта `MIMEType` возвращает сериализованный MIME.

Из-за необходимости соответствия стандарту этот метод не позволяет пользователям настраивать процесс сериализации MIME.

#### `mime.toJSON()`.

- Возвращает: {строка}.

Псевдоним для [`mime.toString()`](#mimetostring).

Этот метод автоматически вызывается, когда объект `MIMEType` сериализуется с помощью [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

<!-- 0088.part.md -->

```mjs
import { MIMEType } from 'node:util';

const myMIMES = [
  new MIMEType('image/png'),
  new MIMEType('image/gif'),
];
console.log(JSON.stringify(myMIMES));
// Prints: ["image/png", "image/gif"]
```

<!-- 0089.part.md -->

<!-- 0090.part.md -->

```cjs
const { MIMEType } = require('node:util');

const myMIMES = [
  new MIMEType('image/png'),
  new MIMEType('image/gif'),
];
console.log(JSON.stringify(myMIMES));
// Prints: ["image/png", "image/gif"]
```

<!-- 0091.part.md -->

### Класс: `util.MIMEParams`.

API `MIMEParams` предоставляет доступ на чтение и запись к параметрам `MIMEType`.

#### Конструктор: `new MIMEParams()`.

Создает новый объект `MIMEParams` с пустыми параметрами

<!-- 0092.part.md -->

```mjs
import { MIMEParams } from 'node:util';

const myParams = new MIMEParams();
```

<!-- 0093.part.md -->

<!-- 0094.part.md -->

```cjs
const { MIMEParams } = require('node:util');

const myParams = new MIMEParams();
```

<!-- 0095.part.md -->

#### `mimeParams.delete(name)`.

- `name` {string}

Удаляет все пары имя-значение, имя которых равно `name`.

#### `mimeParams.entries()`.

- Возвращает: {Iterator}

Возвращает итератор по каждой из пар "имя-значение" в параметрах. Каждый элемент итератора представляет собой JavaScript `массив`. Первый элемент массива - это `имя`, второй элемент массива - `значение`.

#### `mimeParams.get(name)`.

- `name` {string}
- Возвращает: {string} или `null`, если не существует пары имя-значение с заданным `name`.

Возвращает значение первой пары имя-значение, имя которой равно `name`. Если таких пар нет, возвращается `null`.

#### `mimeParams.has(name)`.

- `name` {string}
- Возвращает: {boolean}

Возвращает `true`, если существует хотя бы одна пара имя-значение, имя которой равно `name`.

#### `mimeParams.keys()`.

- Возвращает: {Итератор}

Возвращает итератор по именам каждой пары имя-значение.

<!-- 0096.part.md -->

```mjs
import { MIMEType } from 'node:util';

const { params } = new MIMEType('text/plain;foo=0;bar=1');
for (const name of params.keys()) {
  console.log(name);
}
// Prints:
//   foo
//   bar
```

<!-- 0097.part.md -->

<!-- 0098.part.md -->

```cjs
const { MIMEType } = require('node:util');

const { params } = new MIMEType('text/plain;foo=0;bar=1');
for (const name of params.keys()) {
  console.log(name);
}
// Prints:
//   foo
//   bar
```

<!-- 0099.part.md -->

#### `mimeParams.set(name, value)`.

- `name` {string}
- `value` {строка}

Устанавливает значение в объекте `MIMEParams`, связанном с `name`, в `value`. Если существуют уже существующие пары имя-значение, имена которых равны `name`, установите значение первой такой пары в `value`.

<!-- 0100.part.md -->

```mjs
import { MIMEType } from 'node:util';

const { params } = new MIMEType('text/plain;foo=0;bar=1');
params.set('foo', 'def');
params.set('baz', 'xyz');
console.log(params.toString());
// Prints: foo=def&bar=1&baz=xyz
```

<!-- 0101.part.md -->

<!-- 0102.part.md -->

```cjs
const { MIMEType } = require('node:util');

const { params } = new MIMEType('text/plain;foo=0;bar=1');
params.set('foo', 'def');
params.set('baz', 'xyz');
console.log(params.toString());
// Prints: foo=def&bar=1&baz=xyz
```

<!-- 0103.part.md -->

#### `mimeParams.values()`.

- Возвращает: {Итератор}

Возвращает итератор по значениям каждой пары имя-значение.

#### `mimeParams[@@iterator]()`.

- Возвращает: {Итератор}

Псевдоним для [`mimeParams.entries()`](#mimeparamsentries).

<!-- 0104.part.md -->

```mjs
import { MIMEType } from 'node:util';

const { params } = new MIMEType(
  'text/plain;foo=bar;xyz=baz'
);
for (const [name, value] of params) {
  console.log(name, value);
}
// Prints:
//   foo bar
//   xyz baz
```

<!-- 0105.part.md -->

<!-- 0106.part.md -->

```cjs
const { MIMEType } = require('node:util');

const { params } = new MIMEType(
  'text/plain;foo=bar;xyz=baz'
);
for (const [name, value] of params) {
  console.log(name, value);
}
// Prints:
//   foo bar
//   xyz baz
```

<!-- 0107.part.md -->

## `util.parseArgs([config])`

- `config` {Объект} Используется для предоставления аргументов для разбора и для настройки парсера. `config` поддерживает следующие свойства:
  - `args` {string\[\]} массив строк аргументов. **По умолчанию:** `process.argv` с удаленными `execPath` и `filename`.
  - `options` {Object} Используется для описания аргументов, известных синтаксическому анализатору. Ключами `options` являются длинные имена опций, а значениями - {Object}, принимающие следующие свойства:
    - `type` {string} Тип аргумента, который должен быть либо `boolean`, либо `string`.
    - `multiple` {boolean} Может ли этот параметр быть указан несколько раз. Если `true`, все значения будут собраны в массив. Если `false`, то значения для опции будут последними. **По умолчанию:** `false`.
    - `short` {string} Односимвольный псевдоним для опции.
    - `default` {string | boolean | string\[\] | boolean\[\]} Значение опции по умолчанию, если оно не задано args. Оно должно быть того же типа, что и свойство `type`. Если `multiple` имеет значение `true`, это должен быть массив.
  - `strict` {boolean} Должна ли возникать ошибка при встрече неизвестных аргументов или при передаче аргументов, не соответствующих `типу`, заданному в `options`. **По умолчанию:** `true`.
  - `allowPositionals` {boolean} Принимает ли эта команда позиционные аргументы. **По умолчанию:** `false`, если `strict` равно `true`, иначе `true`.
  - `tokens` {boolean} Возвращает разобранные лексемы. Это полезно для расширения встроенного поведения, от добавления дополнительных проверок до переработки токенов различными способами. **По умолчанию:** `false`.
- Возвращает: {Object} Разобранные аргументы командной строки:
  - `values` {Object} Отображение разобранных имен опций с их значениями {string} или {boolean}.
  - `positionals` {string\[\]} Позиционные аргументы.
  - `токены` {Object\[\] | undefined} См. раздел [parseArgs tokens](#parseargs-tokens). Возвращается только если `config` включает `tokens: true`.

Предоставляет API более высокого уровня для разбора аргументов командной строки, чем непосредственное взаимодействие с `process.argv`. Принимает спецификацию ожидаемых аргументов и возвращает структурированный объект с разобранными опциями и позициями.

<!-- 0108.part.md -->

```mjs
import { parseArgs } from 'node:util';
const args = ['-f', '--bar', 'b'];
const options = {
  foo: {
    type: 'boolean',
    short: 'f',
  },
  bar: {
    type: 'string',
  },
};
const { values, positionals } = parseArgs({
  args,
  options,
});
console.log(values, positionals);
// Prints: [Object: null prototype] { foo: true, bar: 'b' } []
```

<!-- 0109.part.md -->

<!-- 0110.part.md -->

```cjs
const { parseArgs } = require('node:util');
const args = ['-f', '--bar', 'b'];
const options = {
  foo: {
    type: 'boolean',
    short: 'f',
  },
  bar: {
    type: 'string',
  },
};
const { values, positionals } = parseArgs({
  args,
  options,
});
console.log(values, positionals);
// Prints: [Object: null prototype] { foo: true, bar: 'b' } []
```

<!-- 0111.part.md -->

### `parseArgs` `tokens`.

Детальная информация о разборе доступна для добавления пользовательского поведения, если указать `tokens: true` в конфигурации. Возвращаемые токены имеют свойства, описывающие:

- все токены
  - `kind` {string} Одно из 'option', 'positional' или 'option-terminator'.
  - `index` {число} Индекс элемента в `args`, содержащего токен. Таким образом, исходным аргументом для токена является `args[token.index]`.
- токены опций
  - `name` {строка} Длинное имя опции.
  - `rawName` {строка} Как опция используется в args, например, `-f` из `--foo`.
  - `value` {string | undefined} Значение опции, указанное в args. Неопределено для булевых опций.
  - `inlineValue` {boolean | undefined} Указывается ли значение опции в строке, как `--foo=bar`.
- позиционные маркеры
  - `value` {string} Значение позиционного аргумента в args (т.е. `args[index]`).
- опция-терминатор токена

Возвращаемые лексемы располагаются в том порядке, в котором они встречаются во входных args. Опции, которые встречаются в args более одного раза, выдают маркер для каждого использования. Короткие группы опций, такие как `-xy`, расширяются до маркера для каждой опции. Таким образом, `-xxx` дает три токена.

Например, чтобы использовать возвращенные маркеры для добавления поддержки отрицаемой опции, такой как `--no-color`, маркеры могут быть обработаны для изменения значения, хранящегося для отрицаемой опции.

<!-- 0112.part.md -->

```mjs
import { parseArgs } from 'node:util';

const options = {
  color: { type: 'boolean' },
  'no-color': { type: 'boolean' },
  logfile: { type: 'string' },
  'no-logfile': { type: 'boolean' },
};
const { values, tokens } = parseArgs({
  options,
  tokens: true,
});

// Reprocess the option tokens and overwrite the returned values.
tokens
  .filter((token) => token.kind === 'option')
  .forEach((token) => {
    if (token.name.startsWith('no-')) {
      // Store foo:false for --no-foo
      const positiveName = token.name.slice(3);
      values[positiveName] = false;
      delete values[token.name];
    } else {
      // Resave value so last one wins if both --foo and --no-foo.
      values[token.name] = token.value ?? true;
    }
  });

const color = values.color;
const logfile = values.logfile ?? 'default.log';

console.log({ logfile, color });
```

<!-- 0113.part.md -->

<!-- 0114.part.md -->

```cjs
const { parseArgs } = require('node:util');

const options = {
  color: { type: 'boolean' },
  'no-color': { type: 'boolean' },
  logfile: { type: 'string' },
  'no-logfile': { type: 'boolean' },
};
const { values, tokens } = parseArgs({
  options,
  tokens: true,
});

// Reprocess the option tokens and overwrite the returned values.
tokens
  .filter((token) => token.kind === 'option')
  .forEach((token) => {
    if (token.name.startsWith('no-')) {
      // Store foo:false for --no-foo
      const positiveName = token.name.slice(3);
      values[positiveName] = false;
      delete values[token.name];
    } else {
      // Resave value so last one wins if both --foo and --no-foo.
      values[token.name] = token.value ?? true;
    }
  });

const color = values.color;
const logfile = values.logfile ?? 'default.log';

console.log({ logfile, color });
```

<!-- 0115.part.md -->

Пример использования, показывающий отрицаемые варианты, и когда вариант используется несколькими способами, выигрывает последний.

<!-- 0116.part.md -->

```console
$ node negate.js
{ logfile: 'default.log', color: undefined }
$ node negate.js --no-logfile --no-color
{ logfile: false, color: false }
$ node negate.js --logfile=test.log --color
{ logfile: 'test.log', color: true }
$ node negate.js --no-logfile --logfile=test.log --color --no-color
{ logfile: 'test.log', color: false }
```

<!-- 0117.part.md -->

## `util.promisify(original)`

- `original` {Функция}
- Возвращает: {Function}

Принимает функцию, следуя общему стилю обратного вызова по ошибке, т.е. принимая `(err, value) => ...` обратный вызов в качестве последнего аргумента, и возвращает версию, которая возвращает обещания.

<!-- 0118.part.md -->

```js
const util = require('node:util');
const fs = require('node:fs');

const stat = util.promisify(fs.stat);
stat('.')
  .then((stats) => {
    // Do something with `stats`
  })
  .catch((error) => {
    // Handle the error.
  });
```

<!-- 0119.part.md -->

Или, эквивалентно, используя `async function`:

<!-- 0120.part.md -->

```js
const util = require('node:util');
const fs = require('node:fs');

const stat = util.promisify(fs.stat);

async function callStat() {
  const stats = await stat('.');
  console.log(`This directory is owned by ${stats.uid}`);
}
```

<!-- 0121.part.md -->

Если присутствует свойство `original[util.promisify.custom]`, `promisify` вернет его значение, см. [Custom promisified functions](#custom-promisified-functions).

`promisify()` предполагает, что `original` - это функция, принимающая обратный вызов в качестве последнего аргумента во всех случаях. Если `original` не является функцией, `promisify()` выдаст ошибку. Если `original` является функцией, но ее последний аргумент не является обратным вызовом с ошибкой, то в качестве последнего аргумента ей будет передан обратный вызов с ошибкой.

Использование `promisify()` в методах класса или других методах, использующих `this`, может работать не так, как ожидается, если только это не будет обработано специальным образом:

<!-- 0122.part.md -->

```js
const util = require('node:util');

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

<!-- 0123.part.md -->

### Пользовательские промисифицированные функции

Используя символ `util.promisify.custom`, можно переопределить возвращаемое значение функции [`util.promisify()`](#utilpromisifyoriginal):

<!-- 0124.part.md -->

```js
const util = require('node:util');

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

<!-- 0125.part.md -->

Это может быть полезно в тех случаях, когда исходная функция не соответствует стандартному формату принятия обратного вызова, связанного с ошибкой, в качестве последнего аргумента.

Например, с функцией, принимающей `(foo, onSuccessCallback, onErrorCallback)`:

<!-- 0126.part.md -->

```js
doSomething[util.promisify.custom] = (foo) => {
  return new Promise((resolve, reject) => {
    doSomething(foo, resolve, reject);
  });
};
```

<!-- 0127.part.md -->

Если `promisify.custom` определена, но не является функцией, `promisify()` выдаст ошибку.

### `util.promisify.custom`

- {символ}, который можно использовать для объявления пользовательских промисифицированных вариантов функций, см. [Пользовательские промисифицированные функции](#custom-promisified-functions).

Помимо того, что этот символ доступен через `util.promisify.custom`, он [зарегистрирован глобально](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for) и может быть доступен в любом окружении как `Symbol.for('nodejs.util.promisify.custom')`.

Например, с функцией, которая принимает `(foo, onSuccessCallback, onErrorCallback)`:

<!-- 0128.part.md -->

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

<!-- 0129.part.md -->

## `util.stripVTControlCharacters(str)`

- `str` {строка}
- Возвращает: {string}

Возвращает `str` с удаленными кодами ANSI.

<!-- 0130.part.md -->

```js
console.log(
  util.stripVTControlCharacters('\u001B[4mvalue\u001B[0m')
);
// Prints "value"
```

<!-- 0131.part.md -->

## Класс: `util.TextDecoder`.

Реализация API `TextDecoder` [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/).

<!-- 0132.part.md -->

```js
const decoder = new TextDecoder();
const u8arr = new Uint8Array([72, 101, 108, 108, 111]);
console.log(decoder.decode(u8arr)); // Hello
```

<!-- 0133.part.md -->

### Поддерживаемые кодировки WHATWG

Согласно [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/), кодировки, поддерживаемые API `TextDecoder`, приведены в таблицах ниже. Для каждой кодировки может использоваться один или несколько псевдонимов.

Различные конфигурации сборки Node.js поддерживают разные наборы кодировок. (см. [Интернационализация](intl.md))

#### Кодировки, поддерживаемые по умолчанию (с полными данными ICU)

| Кодировка | Псевдонимы |
| --- | --- |
| `'ibm866'` | `'866'`, `'cp866'`, `'csibm866'` |
| `'iso-8859-2'` | `'csisolatin2'`, `'iso-ir-101'`, `'iso8859-2'`, `'iso88592'`, `'iso_8859-2'`, `'iso_8859-2:1987'`, `'l2'`, `'latin2'` |
| `'iso-8859-3'` | `'csisolatin3'`, `'iso-ir-109'`, `'iso8859-3'`, `'iso88593'`, `'iso_8859-3'`, `'iso_8859-3:1988'`, `'l3'`, `'latin3'` |
| `'iso-8859-4'` | `'csisolatin4'`, `'iso-ir-110'`, `'iso8859-4'`, `'iso88594'`, `'iso_8859-4'`, `'iso_8859-4:1988'`, `'l4'`, `'latin4'` |
| `'iso-8859-5'` | `'csisolatincyrillic'`, `'cyrillic'`, `'iso-ir-144'`, `'iso8859-5'`, `'iso88595'`, `'iso_8859-5'`, `'iso_8859-5:1988'` |
| ``iso-8859-6'` | `` arabic'`,  ``asmo-708'` , ``csiso88596e' `, `` csiso88596i'`,  ``csisolatinarabic'` , ``ecma-114' `, `iso-8859-6-e`, `iso-8859-6-i`, `iso-ir-127`, `iso8859-6`, `iso88596`, `iso_8859-6`, `iso_8859-6`, ``iso_8859-6: 1987'` |
| `'iso-8859-7'` | `'csisolatingreek'`, `'ecma-118'`, `'elot_928'`, `'greek'`, `'greek8'`, `'iso-ir-126'`, `'iso8859-7'`, `'iso88597'`, `'iso_8859-7'`, `'iso_8859-7:1987'`, `'sun_eu_greek'` |  |
| `'iso-8859-8'` | `'csiso88598e'`, `'csisolatinhebrew'`, `'hebrew'`, `'iso-8859-8-e'`, `'iso-ir-138'`, `'iso8859-8'`, `'iso88598'`, `'iso_8859-8'`, `'iso_8859-8'`, `'iso_8859-8:1988'`, `'visual'` |
| ``iso-8859-8-i'` | `` csiso88598i'`,  ``логический'` |

<!-- 0134.part.md -->

| `'iso-8859-10'` | `'csisolatin6'`, `'iso-ir-157'`, `'iso8859-10'`, `'iso885910'`, `'l6'`, `'latin6'` | | | `'iso-8859-13'` | `'iso8859-13'`, `'iso885913'` | | | `'iso-8859-14'` | `'iso8859-14'`, `'iso885914'` | | | `'iso-8859-15'` | `'csisolatin9'`, `'iso8859-15'`, `'iso885915'`, `'iso_8859-15'`, `'l9'` | | `'koi8-r'` | `'cskoi8r'`, `'koi'`, `'koi8'`, `'koi8_r'` | | `'koi8-u'` | `'koi8-ru'` | | `'macintosh'` | `'csmacintosh'`, `'mac'`, `'x-mac-roman'` | | | | `'windows-874'` | `'dos-874'`, `'iso-8859-11'`, `'iso8859-11'`, `'iso885911'`, `'tis-620'` | | `'windows-1250'` | `'cp1250'`, `'x-cp1250'` | | | `'windows-1251'` | `'cp1251'`, `'x-cp1251'` | | | `'windows-1252'` | `'ansi_x3. 4-1968'`, `'ascii'`, `'cp1252'`, `'cp819'`, `'csisolatin1'`, `'ibm819'`, `'iso-8859-1'`, `'iso-ir-100'`, `'iso8859-1'`, `'iso88591'`, `'iso_8859-1'`, `'iso_8859-1'`, `'iso_8859-1: 1987'`, `'l1'`, `'latin1'`, `'us-ascii'`, `'x-cp1252'` | | `'windows-1253'` | `'cp1253'`, `'x-cp1253'`.

<!-- 0135.part.md -->

| | `'windows-1254'` | `'cp1254'`, `'csisolatin5'`, `'iso-8859-9'`, `'iso-ir-148'`, `'iso8859-9'`, `'iso88599'`, `'iso_8859-9'`, `'iso_8859-9:1989'`, `'l5'`, `'latin5'`, `'x-cp1254'` | | `'windows-1255'` | `'cp1255'`, `'x-cp1255'` | | | `'windows-1256'` | `'cp1256'`, `'x-cp1256'` | | | `'windows-1257'` | `'cp1257'`, `'x-cp1257'` | | | `'windows-1258'` | `'cp1258'`, `'x-cp1258'` | | | `` x-mac-cyrillic'` |  ``x-mac-ukrainian'` | ``x-mac-ukrainian'` | | `'gbk'` | `'chinese'`, `'csgb2312'`, `'csiso58gb231280'`, `'gb2312'`, `'gb_2312'`, `'gb_2312-80'`, `'iso-ir-58'`, `'x-gbk'` | | | `'gb18030'| | | | | | `'big5`|`'big5-hkscs`` , `'cn-big5 ``, ` 'csbig5``,  `'x-x-big5``| | |`'euc-jp'`|`'cseucpkdfmtjapanese'`, `'x-euc-jp'`| | |`'iso-2022-jp'`|`'csiso2022jp'`| |`'shift_jis'`|`'csshiftjis'`, `'ms932'`, `'ms_kanji'`, `'shift-jis'`, `'sjis'`, `'windows-31j'`, `'x-sjis'`.

<!-- 0136.part.md -->

| `'euc-kr'| `'cseuckr'`, `'csksc56011987'`, `'iso-ir-149'`, `'korean'`, `'ks_c_5601-1987'`, `'ks_c_5601-1989'`, `'ksc5601'`, `'ksc_5601'`, `'windows-949'` |

#### Кодировки, поддерживаемые при сборке Node.js с опцией `small-icu`.

| Кодировка    | Псевдонимы                      |
| ------------ | ------------------------------- |
| `'utf-8'`    | `'unicode-1-1-utf-8'`, `'utf8'` |
| `'utf-16le'  |                                 | `'utf-16' |  |
| `'utf-16be'` |                                 |  |

#### Кодировки, поддерживаемые при отключенном ICU

| Кодировка   | Псевдонимы                      |
| ----------- | ------------------------------- |
| `'utf-8'`   | `'unicode-1-1-utf-8'`, `'utf8'` | } |
| `'utf-16le' |                                 | `'utf-16' | . |

Кодировка `'iso-8859-16'`, указанная в [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/), не поддерживается.

### `new TextDecoder([encoding[, options]])`.

- `encoding` {string} Определяет `кодировку`, которую поддерживает данный экземпляр `ТекстДекодера`. **По умолчанию:** `'utf-8'`.
- `options` {Object}
  - `fatal` {boolean} `true`, если сбои декодирования являются фатальными. Эта опция не поддерживается, если ICU отключен (см. [Интернационализация](intl.md)). **По умолчанию:** `false`.
  - `ignoreBOM` {boolean} Когда `true`, `TextDecoder` будет включать метку порядка байтов в результат декодирования. При `false` метка порядка байтов будет удалена из результата. Эта опция используется, только если `encoding` - `'utf-8'`, `'utf-16be'` или `'utf-16le'`. **По умолчанию:** `false`.

Создает новый экземпляр `TextDecoder`. В `encoding` может быть указана одна из поддерживаемых кодировок или псевдоним.

Класс `TextDecoder` также доступен в глобальном объекте.

### `textDecoder.decode([input[, options]])`.

- `вход` {ArrayBuffer|DataView|TypedArray} Экземпляр `ArrayBuffer`, `DataView` или `TypedArray`, содержащий закодированные данные.
- `options` {Object}
  - `stream` {boolean} `true`, если ожидаются дополнительные порции данных. **По умолчанию:** `false`.
- Возвращает: {строка}

Декодирует `input` и возвращает строку. Если `options.stream` имеет значение `true`, все неполные последовательности байтов, встречающиеся в конце `ввода`, буферизируются внутри и выдаются после следующего вызова `textDecoder.decode()`.

Если `textDecoder.fatal` имеет значение `true`, то возникающие ошибки декодирования приведут к выбросу `TypeError`.

### `textDecoder.encoding`

- {строка}

Кодировка, поддерживаемая экземпляром `TextDecoder`.

### `textDecoder.fatal`

- {boolean}

Значение будет `true`, если в результате ошибок декодирования будет выброшена `TypeError`.

### `textDecoder.ignoreBOM`

- {boolean}

Значение будет `true`, если результат декодирования будет включать метку порядка байтов.

## Класс: `util.TextEncoder`.

Реализация API `TextEncoder` [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/). Все экземпляры `TextEncoder` поддерживают только кодировку UTF-8.

<!-- 0137.part.md -->

```js
const encoder = new TextEncoder();
const uint8array = encoder.encode('this is some data');
```

<!-- 0138.part.md -->

Класс `TextEncoder` также доступен на глобальном объекте.

### `textEncoder.encode([input])`

- `ввод` {строка} Текст для кодирования. **По умолчанию:** пустая строка.
- Возвращает: {Uint8Array}

UTF-8 кодирует строку `input` и возвращает `Uint8Array`, содержащий закодированные байты.

### `textEncoder.encodeInto(src, dest)`.

- src` {строка} Текст для кодирования.
- `dest` {Uint8Array} Массив для хранения результата кодирования.
- Возвращает: {Object}
  - `read` {number} Прочитанные единицы кода Unicode src.
  - `written` {number} Записанные байты в формате UTF-8 из dest.

UTF-8 кодирует строку `rc` в Uint8Array `dest` и возвращает объект, содержащий считанные единицы кода Unicode и записанные байты UTF-8.

<!-- 0139.part.md -->

```js
const encoder = new TextEncoder();
const src = 'this is some data';
const dest = new Uint8Array(10);
const { read, written } = encoder.encodeInto(src, dest);
```

<!-- 0140.part.md -->

### `textEncoder.encoding`

- {строка}

Кодировка, поддерживаемая экземпляром `TextEncoder`. Всегда устанавливается на `'utf-8'`.

## `util.toUSVString(string)`.

- `string` {string}

Возвращает `строку` после замены любых суррогатных кодовых точек (или, эквивалентно, любых непарных суррогатных кодовых единиц) на "символ замены" Юникода U+FFFD.

## `util.transferableAbortController()`.

> Стабильность: 1 - Экспериментальный

Создает и возвращает экземпляр {AbortController}, чей {AbortSignal} помечен как передаваемый и может быть использован с `structuredClone()` или `postMessage()`.

## `util.transferableAbortSignal(signal)`.

> Стабильность: 1 - Экспериментальная

- `signal` {AbortSignal}
- Возвращает: {AbortSignal}

Маркирует данный {AbortSignal} как передаваемый, чтобы его можно было использовать с `structuredClone()` и `postMessage()`.

<!-- 0141.part.md -->

```js
const signal = transferableAbortSignal(
  AbortSignal.timeout(100)
);
const channel = new MessageChannel();
channel.port2.postMessage(signal, [signal]);
```

<!-- 0142.part.md -->

## `util.aborted(signal, resource)`.

> Стабильность: 1 - Экспериментальная

- `signal` {AbortSignal}
- `ресурс` {Объект} Любая ненулевая сущность, ссылка на которую удерживается слабо.
- Возвращает: {Promise}

Слушает событие прерывания на предоставленном `signal` и возвращает обещание, которое будет выполнено, когда `signal` будет прерван. Если переданный `ресурс` будет собран до прерывания `signal`, возвращаемое обещание будет оставаться невыполненным неопределенное время.

<!-- 0143.part.md -->

```cjs
const { aborted } = require('node:util');

const dependent = obtainSomethingAbortable();

aborted(dependent.signal, dependent).then(() => {
  // Do something when dependent is aborted.
});

dependent.on('event', () => {
  dependent.abort();
});
```

<!-- 0144.part.md -->

<!-- 0145.part.md -->

```mjs
import { aborted } from 'node:util';

const dependent = obtainSomethingAbortable();

aborted(dependent.signal, dependent).then(() => {
  // Do something when dependent is aborted.
});

dependent.on('event', () => {
  dependent.abort();
});
```

<!-- 0146.part.md -->

## `util.types`

`util.types` обеспечивает проверку типов для различных видов встроенных объектов. В отличие от `instanceof` или `Object.prototype.toString.call(value)`, эти проверки не проверяют свойства объекта, доступные из JavaScript (например, его прототип), и обычно имеют накладные расходы на обращение к C++.

Результат, как правило, не дает никаких гарантий относительно того, какие свойства или поведение значение раскрывает в JavaScript. Они в первую очередь полезны для разработчиков аддонов, которые предпочитают делать проверку типов в JavaScript.

API доступен через `require('node:util').types` или `require('node:util/types')`.

### `util.types.isAnyArrayBuffer(value)`

- `value` {any}
- Возвращает: {boolean}

Возвращает `true`, если значение является встроенным экземпляром [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) или [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer).

См. также [`util.types.isArrayBuffer()`](#utiltypesisarraybuffervalue) и [`util.types.isSharedArrayBuffer()`](#utiltypesissharedarraybuffervalue).

<!-- 0147.part.md -->

```js
util.types.isAnyArrayBuffer(new ArrayBuffer()); // Returns true
util.types.isAnyArrayBuffer(new SharedArrayBuffer()); // Returns true
```

<!-- 0148.part.md -->

### `util.types.isArrayBufferView(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром одного из представлений [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), таких как типизированные объекты массивов или [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView). Эквивалентно [`ArrayBuffer.isView()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView).

<!-- 0149.part.md -->

```js
util.types.isArrayBufferView(new Int8Array()); // true
util.types.isArrayBufferView(Buffer.from('hello world')); // true
util.types.isArrayBufferView(
  new DataView(new ArrayBuffer(16))
); // true
util.types.isArrayBufferView(new ArrayBuffer()); // false
```

<!-- 0150.part.md -->

### `util.types.isArgumentsObject(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является объектом `arguments`.

<!-- 0151.part.md -->

```js
function foo() {
  util.types.isArgumentsObject(arguments); // Returns true
}
```

<!-- 0152.part.md -->

### `util.types.isArrayBuffer(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). Это _не_ включает экземпляры [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer). Обычно желательно проверять оба варианта; см. об этом в [`util.types.isAnyArrayBuffer()`](#utiltypesisanyarraybuffervalue).

<!-- 0153.part.md -->

```js
util.types.isArrayBuffer(new ArrayBuffer()); // Returns true
util.types.isArrayBuffer(new SharedArrayBuffer()); // Returns false
```

<!-- 0154.part.md -->

### `util.types.isAsyncFunction(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является [асинхронной функцией](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function). Это только сообщает о том, что видит движок JavaScript; в частности, возвращаемое значение может не совпадать с исходным кодом, если использовался инструмент транспиляции.

<!-- 0155.part.md -->

```js
util.types.isAsyncFunction(function foo() {}); // Returns false
util.types.isAsyncFunction(async function foo() {}); // Returns true
```

<!-- 0156.part.md -->

### `util.types.isBigInt64Array(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром `BigInt64Array`.

<!-- 0157.part.md -->

```js
util.types.isBigInt64Array(new BigInt64Array()); // Returns true
util.types.isBigInt64Array(new BigUint64Array()); // Returns false
```

<!-- 0158.part.md -->

### `util.types.isBigUint64Array(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром `BigUint64Array`.

<!-- 0159.part.md -->

```js
util.types.isBigUint64Array(new BigInt64Array()); // Returns false
util.types.isBigUint64Array(new BigUint64Array()); // Returns true
```

<!-- 0160.part.md -->

### `util.types.isBooleanObject(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является булевым объектом, например, созданным с помощью `new Boolean()`.

<!-- 0161.part.md -->

```js
util.types.isBooleanObject(false); // Returns false
util.types.isBooleanObject(true); // Returns false
util.types.isBooleanObject(new Boolean(false)); // Returns true
util.types.isBooleanObject(new Boolean(true)); // Returns true
util.types.isBooleanObject(Boolean(false)); // Returns false
util.types.isBooleanObject(Boolean(true)); // Returns false
```

<!-- 0162.part.md -->

### `util.types.isBoxedPrimitive(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является любым объектом boxed primitive, например, созданным с помощью `new Boolean()`, `new String()` или `Object(Symbol())`.

Например:

<!-- 0163.part.md -->

```js
util.types.isBoxedPrimitive(false); // Returns false
util.types.isBoxedPrimitive(new Boolean(false)); // Returns true
util.types.isBoxedPrimitive(Symbol('foo')); // Returns false
util.types.isBoxedPrimitive(Object(Symbol('foo'))); // Returns true
util.types.isBoxedPrimitive(Object(BigInt(5))); // Returns true
```

<!-- 0164.part.md -->

### `util.types.isCryptoKey(value)`

- `значение` {Объект}
- Возвращает: {boolean}

Возвращает `true`, если `значение` является {CryptoKey}, `false` в противном случае.

### `util.types.isDataView(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является встроенным экземпляром [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView).

<!-- 0165.part.md -->

```js
const ab = new ArrayBuffer(20);
util.types.isDataView(new DataView(ab)); // Returns true
util.types.isDataView(new Float64Array()); // Returns false
```

<!-- 0166.part.md -->

См. также [`ArrayBuffer.isView()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView).

### `util.types.isDate(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является встроенным экземпляром [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date).

<!-- 0167.part.md -->

```js
util.types.isDate(new Date()); // Returns true
```

<!-- 0168.part.md -->

### `util.types.isExternal(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является родным `External` значением.

Родное `External` значение - это специальный тип объекта, который содержит необработанный указатель C++ (`void*`) для доступа из родного кода и не имеет других свойств. Такие объекты создаются либо внутренними компонентами Node.js, либо нативными аддонами. В JavaScript это [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) объекты с прототипом `null`.

<!-- 0169.part.md -->

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

<!-- 0170.part.md -->

<!-- 0171.part.md -->

```js
const native = require('napi_addon.node');
const data = native.myNapi();
util.types.isExternal(data); // returns true
util.types.isExternal(0); // returns false
util.types.isExternal(new String('foo')); // returns false
```

<!-- 0172.part.md -->

Более подробную информацию о `napi_create_external` смотрите в [`napi_create_external()`](n-api.md#napi_create_external).

### `util.types.isFloat32Array(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является встроенным экземпляром [`Float32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array).

<!-- 0173.part.md -->

```js
util.types.isFloat32Array(new ArrayBuffer()); // Returns false
util.types.isFloat32Array(new Float32Array()); // Returns true
util.types.isFloat32Array(new Float64Array()); // Returns false
```

<!-- 0174.part.md -->

### `util.types.isFloat64Array(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является встроенным экземпляром [`Float64Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array).

<!-- 0175.part.md -->

```js
util.types.isFloat64Array(new ArrayBuffer()); // Returns false
util.types.isFloat64Array(new Uint8Array()); // Returns false
util.types.isFloat64Array(new Float64Array()); // Returns true
```

<!-- 0176.part.md -->

### `util.types.isGeneratorFunction(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является генераторной функцией. Это только сообщает о том, что видит движок JavaScript; в частности, возвращаемое значение может не совпадать с исходным кодом, если использовался инструмент транспиляции.

<!-- 0177.part.md -->

```js
util.types.isGeneratorFunction(function foo() {}); // Returns false
util.types.isGeneratorFunction(function* foo() {}); // Returns true
```

<!-- 0178.part.md -->

### `util.types.isGeneratorObject(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является объектом генератора, возвращенным встроенной функцией генератора. Это только сообщает о том, что видит движок JavaScript; в частности, возвращаемое значение может не совпадать с исходным кодом, если использовался инструмент транспиляции.

<!-- 0179.part.md -->

```js
function* foo() {}
const generator = foo();
util.types.isGeneratorObject(generator); // Returns true
```

<!-- 0180.part.md -->

### `util.types.isInt8Array(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`Int8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array).

<!-- 0181.part.md -->

```js
util.types.isInt8Array(new ArrayBuffer()); // Returns false
util.types.isInt8Array(new Int8Array()); // Returns true
util.types.isInt8Array(new Float64Array()); // Returns false
```

<!-- 0182.part.md -->

### `util.types.isInt16Array(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`Int16Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int16Array).

<!-- 0183.part.md -->

```js
util.types.isInt16Array(new ArrayBuffer()); // Returns false
util.types.isInt16Array(new Int16Array()); // Returns true
util.types.isInt16Array(new Float64Array()); // Returns false
```

<!-- 0184.part.md -->

### `util.types.isInt32Array(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`Int32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array).

<!-- 0185.part.md -->

```js
util.types.isInt32Array(new ArrayBuffer()); // Returns false
util.types.isInt32Array(new Int32Array()); // Returns true
util.types.isInt32Array(new Float64Array()); // Returns false
```

<!-- 0186.part.md -->

### `util.types.isKeyObject(value)`

- `значение` {Объект}
- Возвращает: {boolean}

Возвращает `true`, если `value` является {KeyObject}, `false` в противном случае.

### `util.types.isMap(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенной [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

<!-- 0187.part.md -->

```js
util.types.isMap(new Map()); // Returns true
```

<!-- 0188.part.md -->

### `util.types.isMapIterator(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является итератором, возвращаемым для встроенного экземпляра [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

<!-- 0189.part.md -->

```js
const map = new Map();
util.types.isMapIterator(map.keys()); // Returns true
util.types.isMapIterator(map.values()); // Returns true
util.types.isMapIterator(map.entries()); // Returns true
util.types.isMapIterator(map[Symbol.iterator]()); // Returns true
```

<!-- 0190.part.md -->

### `util.types.isModuleNamespaceObject(value)`

- `значение` {любой}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром [Module Namespace Object](https://tc39.github.io/ecma262/#sec-module-namespace-exotic-objects).

<!-- 0191.part.md -->

```js
import * as ns from './a.js';

util.types.isModuleNamespaceObject(ns); // Returns true
```

<!-- 0192.part.md -->

### `util.types.isNativeError(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение было возвращено конструктором [встроенного типа `Error`](https://tc39.es/ecma262/#sec-error-objects).

<!-- 0193.part.md -->

```js
console.log(util.types.isNativeError(new Error())); // true
console.log(util.types.isNativeError(new TypeError())); // true
console.log(util.types.isNativeError(new RangeError())); // true
```

<!-- 0194.part.md -->

Подклассы собственных типов ошибок также являются собственными ошибками:

<!-- 0195.part.md -->

```js
class MyError extends Error {}
console.log(util.types.isNativeError(new MyError())); // true
```

<!-- 0196.part.md -->

Значение, являющееся `stanceof` класса нативной ошибки, не эквивалентно тому, что `isNativeError()` возвращает `true` для этого значения. `isNativeError()` возвращает `true` для ошибок, которые приходят из другой [сферы] (https://tc39.es/ecma262/#realm), в то время как `instanceof Error` возвращает `false` для этих ошибок:

<!-- 0197.part.md -->

```js
const vm = require('node:vm');
const context = vm.createContext({});
const myError = vm.runInContext('new Error', context);
console.log(util.types.isNativeError(myError)); // true
console.log(myError instanceof Error); // false
```

<!-- 0198.part.md -->

И наоборот, `isNativeError()` возвращает `false` для всех объектов, которые не были возвращены конструктором родной ошибки. Это включает значения, которые являются `instanceof` родных ошибок:

<!-- 0199.part.md -->

```js
const myError = { __proto__: Error.prototype };
console.log(util.types.isNativeError(myError)); // false
console.log(myError instanceof Error); // true
```

<!-- 0200.part.md -->

### `util.types.isNumberObject(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является числовым объектом, например, созданным с помощью `new Number()`.

<!-- 0201.part.md -->

```js
util.types.isNumberObject(0); // Returns false
util.types.isNumberObject(new Number(0)); // Returns true
```

<!-- 0202.part.md -->

### `util.types.isPromise(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является встроенным [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

<!-- 0203.part.md -->

```js
util.types.isPromise(Promise.resolve(42)); // Returns true
```

<!-- 0204.part.md -->

### `util.types.isProxy(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

<!-- 0205.part.md -->

```js
const target = {};
const proxy = new Proxy(target, {});
util.types.isProxy(target); // Returns false
util.types.isProxy(proxy); // Returns true
```

<!-- 0206.part.md -->

### `util.types.isRegExp(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является объектом регулярного выражения.

<!-- 0207.part.md -->

```js
util.types.isRegExp(/abc/); // Returns true
util.types.isRegExp(new RegExp('abc')); // Returns true
```

<!-- 0208.part.md -->

### `util.types.isSet(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

<!-- 0209.part.md -->

```js
util.types.isSet(new Set()); // Returns true
```

<!-- 0210.part.md -->

### `util.types.isSetIterator(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является итератором, возвращаемым для встроенного экземпляра [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

<!-- 0211.part.md -->

```js
const set = new Set();
util.types.isSetIterator(set.keys()); // Returns true
util.types.isSetIterator(set.values()); // Returns true
util.types.isSetIterator(set.entries()); // Returns true
util.types.isSetIterator(set[Symbol.iterator]()); // Returns true
```

<!-- 0212.part.md -->

### `util.types.isSharedArrayBuffer(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer). Это _не_ включает экземпляры [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). Обычно желательно проверять оба варианта; см. об этом в [`util.types.isAnyArrayBuffer()`](#utiltypesisanyarraybuffervalue).

<!-- 0213.part.md -->

```js
util.types.isSharedArrayBuffer(new ArrayBuffer()); // Returns false
util.types.isSharedArrayBuffer(new SharedArrayBuffer()); // Returns true
```

<!-- 0214.part.md -->

### `util.types.isStringObject(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является строковым объектом, например, созданным с помощью `new String()`.

<!-- 0215.part.md -->

```js
util.types.isStringObject('foo'); // Returns false
util.types.isStringObject(new String('foo')); // Returns true
```

<!-- 0216.part.md -->

### `util.types.isSymbolObject(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является объектом символа, созданным вызовом `Object()` на примитиве `Symbol`.

<!-- 0217.part.md -->

```js
const symbol = Symbol('foo');
util.types.isSymbolObject(symbol); // Returns false
util.types.isSymbolObject(Object(symbol)); // Returns true
```

<!-- 0218.part.md -->

### `util.types.isTypedArray(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).

<!-- 0219.part.md -->

```js
util.types.isTypedArray(new ArrayBuffer()); // Returns false
util.types.isTypedArray(new Uint8Array()); // Returns true
util.types.isTypedArray(new Float64Array()); // Returns true
```

<!-- 0220.part.md -->

См. также [`ArrayBuffer.isView()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView).

### `util.types.isUint8Array(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array).

<!-- 0221.part.md -->

```js
util.types.isUint8Array(new ArrayBuffer()); // Returns false
util.types.isUint8Array(new Uint8Array()); // Returns true
util.types.isUint8Array(new Float64Array()); // Returns false
```

<!-- 0222.part.md -->

### `util.types.isUint8ClampedArray(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является встроенным экземпляром [`Uint8ClampedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray).

<!-- 0223.part.md -->

```js
util.types.isUint8ClampedArray(new ArrayBuffer()); // Returns false
util.types.isUint8ClampedArray(new Uint8ClampedArray()); // Returns true
util.types.isUint8ClampedArray(new Float64Array()); // Returns false
```

<!-- 0224.part.md -->

### `util.types.isUint16Array(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`Uint16Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array).

<!-- 0225.part.md -->

```js
util.types.isUint16Array(new ArrayBuffer()); // Returns false
util.types.isUint16Array(new Uint16Array()); // Returns true
util.types.isUint16Array(new Float64Array()); // Returns false
```

<!-- 0226.part.md -->

### `util.types.isUint32Array(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`Uint32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array).

<!-- 0227.part.md -->

```js
util.types.isUint32Array(new ArrayBuffer()); // Returns false
util.types.isUint32Array(new Uint32Array()); // Returns true
util.types.isUint32Array(new Float64Array()); // Returns false
```

<!-- 0228.part.md -->

### `util.types.isWeakMap(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенной [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap).

<!-- 0229.part.md -->

```js
util.types.isWeakMap(new WeakMap()); // Returns true
```

<!-- 0230.part.md -->

### `util.types.isWeakSet(value)`

- `значение` {любое}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet).

<!-- 0231.part.md -->

```js
util.types.isWeakSet(new WeakSet()); // Returns true
```

<!-- 0232.part.md -->

### `util.types.isWebAssemblyCompiledModule(value)`.

> Стабильность: 0 - Утратил актуальность: Используйте `value instanceof WebAssembly.Module` вместо этого.

- `value` {any}
- Возвращает: {boolean}

Возвращает `true`, если значение является экземпляром встроенного [`WebAssembly.Module`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Module).

<!-- 0233.part.md -->

```js
const module = new WebAssembly.Module(wasmBuffer);
util.types.isWebAssemblyCompiledModule(module); // Returns true
```

<!-- 0234.part.md -->

## Устаревшие API

Следующие API являются устаревшими и больше не должны использоваться. Существующие приложения и модули должны быть обновлены для поиска альтернативных подходов.

### `util._extend(target, source)`.

> Стабильность: 0 - Устаревший: Вместо этого используйте [`Object.assign()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign).

- `target` {Object}
- `источник` {Объект}

Метод `util._extend()` никогда не предназначался для использования вне внутренних модулей Node.js. Однако сообщество все равно нашло и использовало его.

Он устарел и не должен использоваться в новом коде. JavaScript поставляется с очень похожей встроенной функциональностью через [`Object.assign()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign).

### `util.isArray(object)`.

> Стабильность: 0 - Утратил актуальность: Вместо этого используйте [`Array.isArray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray).

- `object` {any}
- Возвращает: {boolean}

Псевдоним для [`Array.isArray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray).

Возвращает `true`, если данный `объект` является `массивом`. В противном случае возвращается `false`.

<!-- 0235.part.md -->

```js
const util = require('node:util');

util.isArray([]);
// Returns: true
util.isArray(new Array());
// Returns: true
util.isArray({});
// Returns: false
```

<!-- 0236.part.md -->

### `util.isBoolean(object)`.

> Стабильность: 0 - Исправлено: Вместо этого используйте `typeof value === 'boolean'`.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` является `булевым`. В противном случае возвращается `false`.

<!-- 0237.part.md -->

```js
const util = require('node:util');

util.isBoolean(1);
// Returns: false
util.isBoolean(0);
// Returns: false
util.isBoolean(false);
// Returns: true
```

<!-- 0238.part.md -->

### `util.isBuffer(object)`.

> Стабильность: 0 - Исправлено: Используйте [`Buffer.isBuffer()`](buffer.md#static-method-bufferisbufferobj) вместо этого.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` является `буфером`. В противном случае возвращается `false`.

<!-- 0239.part.md -->

```js
const util = require('node:util');

util.isBuffer({ length: 0 });
// Returns: false
util.isBuffer([]);
// Returns: false
util.isBuffer(Buffer.from('hello world'));
// Returns: true
```

<!-- 0240.part.md -->

### `util.isDate(object)`.

> Стабильность: 0 - Исправлено: Используйте [`util.types.isDate()`](#utiltypesisdatevalue) вместо этого.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` является `датой`. В противном случае возвращает `false`.

<!-- 0241.part.md -->

```js
const util = require('node:util');

util.isDate(new Date());
// Returns: true
util.isDate(Date());
// false (without 'new' returns a String)
util.isDate({});
// Returns: false
```

<!-- 0242.part.md -->

### `util.isError(object)`.

> Стабильность: 0 - Исправлено: Используйте [`util.types.isNativeError()`](#utiltypesisnativeerrorvalue) вместо этого.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` является [`ошибкой`](errors.md#class-error). В противном случае возвращается `false`.

<!-- 0243.part.md -->

```js
const util = require('node:util');

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

<!-- 0244.part.md -->

Этот метод полагается на поведение `Object.prototype.toString()`. Возможно получение неправильного результата, когда аргумент `object` манипулирует `@@toStringTag`.

<!-- 0245.part.md -->

```js
const util = require('node:util');
const obj = { name: 'Error', message: 'an error occurred' };

util.isError(obj);
// Returns: false
obj[Symbol.toStringTag] = 'Error';
util.isError(obj);
// Returns: true
```

<!-- 0246.part.md -->

### `util.isFunction(object)`.

> Стабильность: 0 - Исправлено: Вместо этого используйте `typeof value === 'function'`.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` является `функцией`. В противном случае возвращает `false`.

<!-- 0247.part.md -->

```js
const util = require('node:util');

function Foo() {}
const Bar = () => {};

util.isFunction({});
// Returns: false
util.isFunction(Foo);
// Returns: true
util.isFunction(Bar);
// Returns: true
```

<!-- 0248.part.md -->

### `util.isNull(object)`.

> Стабильность: 0 - Исправлено: Вместо этого используйте `value === null`.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` строго `null`. В противном случае возвращается `false`.

<!-- 0249.part.md -->

```js
const util = require('node:util');

util.isNull(0);
// Returns: false
util.isNull(undefined);
// Returns: false
util.isNull(null);
// Returns: true
```

<!-- 0250.part.md -->

### `util.isNullOrUndefined(object)`.

> Стабильность: 0 - Исправлено: Вместо этого используйте `value === undefined || value === null`.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` является `null` или `undefined`. В противном случае возвращается `false`.

<!-- 0251.part.md -->

```js
const util = require('node:util');

util.isNullOrUndefined(0);
// Returns: false
util.isNullOrUndefined(undefined);
// Returns: true
util.isNullOrUndefined(null);
// Returns: true
```

<!-- 0252.part.md -->

### `util.isNumber(object)`.

> Стабильность: 0 - Исправлено: Вместо этого используйте `typeof value === 'number'`.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` является `число`. В противном случае возвращает `false`.

<!-- 0253.part.md -->

```js
const util = require('node:util');

util.isNumber(false);
// Returns: false
util.isNumber(Infinity);
// Returns: true
util.isNumber(0);
// Returns: true
util.isNumber(NaN);
// Returns: true
```

<!-- 0254.part.md -->

### `util.isObject(object)`.

> Стабильность: 0 - Исправлено: Используйте `value !== null && typeof value === 'object'` вместо этого.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `object` является строго `Object` **и** не `Function` (даже если функции являются объектами в JavaScript). В противном случае возвращается `false`.

<!-- 0255.part.md -->

```js
const util = require('node:util');

util.isObject(5);
// Returns: false
util.isObject(null);
// Returns: false
util.isObject({});
// Returns: true
util.isObject(() => {});
// Returns: false
```

<!-- 0256.part.md -->

### `util.isPrimitive(object)`.

> Стабильность: 0 - Исправлено: Используйте `(typeof value !== 'object' && typeof value !== 'function') || value === null` вместо этого.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `object` является примитивным типом. В противном случае возвращает `false`.

<!-- 0257.part.md -->

```js
const util = require('node:util');

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

<!-- 0258.part.md -->

### `util.isRegExp(object)`.

> Стабильность: 0 - Утратил актуальность

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` является `RegExp`. В противном случае возвращается `false`.

<!-- 0259.part.md -->

```js
const util = require('node:util');

util.isRegExp(/some regexp/);
// Returns: true
util.isRegExp(new RegExp('another regexp'));
// Returns: true
util.isRegExp({});
// Returns: false
```

<!-- 0260.part.md -->

### `util.isString(object)`.

> Стабильность: 0 - Исправлено: Вместо этого используйте `typeof value === 'string'`.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` является `строкой`. В противном случае возвращает `false`.

<!-- 0261.part.md -->

```js
const util = require('node:util');

util.isString('');
// Returns: true
util.isString('foo');
// Returns: true
util.isString(String('foo'));
// Returns: true
util.isString(5);
// Returns: false
```

<!-- 0262.part.md -->

### `util.isSymbol(object)`.

> Стабильность: 0 - Исправлено: Вместо этого используйте `typeof value === 'symbol'`.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` является `символом`. В противном случае возвращается `false`.

<!-- 0263.part.md -->

```js
const util = require('node:util');

util.isSymbol(5);
// Returns: false
util.isSymbol('foo');
// Returns: false
util.isSymbol(Symbol('foo'));
// Returns: true
```

<!-- 0264.part.md -->

### `util.isUndefined(object)`.

> Стабильность: 0 - Исправлено: Вместо этого используйте `value === undefined`.

- `object` {any}
- Возвращает: {boolean}

Возвращает `true`, если данный `объект` является `неопределенным`. В противном случае возвращает `false`.

<!-- 0265.part.md -->

```js
const util = require('node:util');

const foo = undefined;
util.isUndefined(5);
// Returns: false
util.isUndefined(foo);
// Returns: true
util.isUndefined(null);
// Returns: false
```

<!-- 0266.part.md -->

### `util.log(string)`.

> Стабильность: 0 - Утратил актуальность: Вместо этого используйте сторонний модуль.

- `string` {string}

Метод `util.log()` печатает заданную `строку` в `stdout` с включенной меткой времени.

<!-- 0267.part.md -->

```js
const util = require('node:util');

util.log('Timestamped message.');
```

<!-- 0268.part.md -->

<!-- 0269.part.md -->
