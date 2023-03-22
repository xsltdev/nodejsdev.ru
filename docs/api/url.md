# Модуль url

> Стабильность: 2 - Стабильный

Модуль `node:url` предоставляет утилиты для разрешения и разбора URL. Доступ к нему можно получить, используя:

```mjs
import url from 'node:url';
```

```cjs
const url = require('node:url');
```

## Строки URL и объекты URL

Строка URL - это структурированная строка, содержащая несколько значимых компонентов. При разборе возвращается объект URL, содержащий свойства для каждого из этих компонентов.

Модуль `node:url` предоставляет два API для работы с URL: устаревший API, специфичный для Node.js, и более новый API, реализующий тот же [WHATWG URL Standard](https://url.spec.whatwg.org/), который используется веб-браузерами.

Сравнение между WHATWG и унаследованным API представлено ниже. Над URL `'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'` показаны свойства объекта, возвращаемого традиционным `url.parse()`. Ниже показаны свойства объекта WHATWG `URL`.

Свойство `origin` WHATWG URL включает `protocol` и `host`, но не `username` или `password`.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ href │
├──────────┬──┬─────────────────────┬────────────────────────┬───────────────────────────┬───────┤
│ протокол │ │ auth │ host │ path │ hash │
│ │ │ ├─────────────────┬──────┼──────────┬────────────────┤ │
│ │ │ │ │ имя хоста │ порт │ имя пути │ поиск │ │ │ │ │ │
│ │ │ │ │ │ ├─┬──────────────┤ │
│ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
" https: // user : pass @ sub.example.com : 8080 /p/a/t/h ? query=string #hash "
│ │ │ │ │ │ │ hostname │ │ │ │ │ │ port │ │ │ │ │ │ │ │
│ │ │ │ ├─────────────────┴──────┤ │ │ │
│ протокол │ │ имя пользователя │ пароль │ │ хост │ │ │ │ │ │
├──────────┴──┼──────────┴──────────┼────────────────────────┤ │ │ │
│ origin │ │ origin │ origin │ pathname │ search │ hash │
├─────────────┴─────────────────────┴────────────────────────┴──────────┴────────────────┴───────┤
│ href │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
(Все пробелы в строке "" следует игнорировать. Они предназначены исключительно для форматирования).
```

Разбор строки URL с помощью WHATWG API:

```js
const myURL = new URL(
  'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'
);
```

Разбор строки URL с помощью унаследованного API:

```mjs
import url from 'node:url';
const myURL = url.parse(
  'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'
);
```

```cjs
const url = require('node:url');
const myURL = url.parse(
  'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'
);
```

### Конструирование URL из составных частей и получение сконструированной строки

Можно построить URL WHATWG из составных частей, используя либо параметры свойств, либо литеральную строку шаблона:

```js
const myURL = new URL('https://example.org');
myURL.pathname = '/a/b/c';
myURL.search = '?d=e';
myURL.hash = '#fgh';
```

```js
const pathname = '/a/b/c';
const search = '?d=e';
const hash = '#fgh';
const myURL = new URL(
  `https://example.org${pathname}${search}${hash}`
);
```

Чтобы получить построенную строку URL, используйте аксессор свойства `href`:

```js
console.log(myURL.href);
```

## WHATWG URL API

### Класс: `URL`

Совместимый с браузером класс `URL`, реализованный в соответствии со стандартом URL WHATWG. [Примеры разобранных URL](https://url.spec.whatwg.org/#example-url-parsing) можно найти в самом Стандарте. Класс `URL` также доступен в глобальном объекте.

В соответствии с традициями браузеров, все свойства объектов `URL` реализованы как геттеры и сеттеры прототипа класса, а не как свойства данных самого объекта. Таким образом, в отличие от [legacy `urlObject`](#legacy-urlobject)s, использование ключевого слова `delete` для любых свойств объектов `URL` (например, `delete myURL.protocol`, `delete myURL.pathname` и т.д.) не имеет никакого эффекта, но все равно вернет `true`.

#### `новый URL(input[, base])`

- `input` {string} Абсолютный или относительный входной URL для разбора. Если `input` относительный, то требуется `base`. Если `input` абсолютный, то `base` игнорируется. Если `input` не является строкой, то сначала она [преобразуется в строку](https://tc39.es/ecma262/#sec-tostring).
- `base` {строка} Базовый URL для разрешения, если `input` не является абсолютным. Если `base` не является строкой, то сначала [преобразуется в строку](https://tc39.es/ecma262/#sec-tostring).

Создает новый объект `URL`, анализируя `input` относительно `base`. Если `base` передана как строка, она будет разобрана эквивалентно `new URL(base)`.

```js
const myURL = new URL('/foo', 'https://example.org/');
// https://example.org/foo
```

Конструктор URL доступен как свойство глобального объекта. Он также может быть импортирован из встроенного модуля url:

```mjs
import { URL } from 'node:url';
console.log(URL === globalThis.URL); // Выводит "true".
```

```cjs
console.log(URL === require('node:url').URL); // Выводит 'true'.
```

Ошибка `TypeError` будет выброшена, если `input` или `base` не являются корректными URL. Обратите внимание, что будет предпринята попытка преобразовать заданные значения в строки. Например:

```js
const myURL = new URL({
  toString: () => 'https://example.org/',
});
// https://example.org/
```

Символы юникода, появляющиеся в имени хоста `input`, будут автоматически преобразованы в ASCII с помощью алгоритма [Punycode](https://tools.ietf.org/html/rfc5891#section-4.4).

```js
const myURL = new URL('https://測試');
// https://xn--g6w251d/
```

Эта возможность доступна только в том случае, если исполняемый файл `node` был скомпилирован с включенным [ICU](intl.md#options-for-building-nodejs). В противном случае доменные имена передаются без изменений.

В случаях, когда заранее неизвестно, является ли `input` абсолютным URL и предоставляется `base`, рекомендуется проверить, что `origin` объекта `URL` является тем, что ожидается.

```js
let myURL = new URL(
  'http://Example.com/',
  'https://example.org/'
);
// http://example.com/

myURL = new URL(
  'https://Example.com/',
  'https://example.org/'
);
// https://example.com/

myURL = new URL(
  'foo://Example.com/',
  'https://example.org/'
);
// foo://Example.com/

myURL = new URL(
  'http:Example.com/',
  'https://example.org/'
);
// http://example.com/

myURL = new URL(
  'https:Example.com/',
  'https://example.org/'
);
// https://example.org/Example.com/

myURL = new URL('foo:Example.com/', 'https://example.org/');
// foo:Example.com/
```

#### `url.hash`

- {строка}

Получает и задает фрагмент части URL.

```js
const myURL = new URL('https://example.org/foo#bar');
console.log(myURL.hash);
// Печатает #bar

myURL.hash = 'baz';
console.log(myURL.href);
// Печатает https://example.org/foo#baz
```

Недопустимые символы URL, включенные в значение, присвоенное свойству `hash`, кодируются [percent-encoded](#percent-encoding-in-urls). Выбор символов для кодирования может несколько отличаться от того, что выдают методы [`url.parse()`](#urlparseurlstring-parsequerystring-slashesdenotehost) и [`url.format()`](#urlformaturlobject).

#### `url.host`

- {строка}

Получает и устанавливает часть URL, содержащую хост.

```js
const myURL = new URL('https://example.org:81/foo');
console.log(myURL.host);
// Печатает example.org:81

myURL.host = 'example.com:82';
console.log(myURL.href);
// Печатает https://example.com:82/foo
```

Неверные значения хоста, присвоенные свойству `host`, игнорируются.

#### `url.hostname`

- {строка}

Получает и устанавливает часть имени хоста в URL. Ключевое различие между `url.host` и `url.hostname` заключается в том, что `url.hostname` _не_ включает порт.

```js
const myURL = new URL('https://example.org:81/foo');
console.log(myURL.hostname);
// Печатает example.org

// Установка имени хоста не изменяет порт
myURL.hostname = 'example.com';
console.log(myURL.href);
// Печатает https://example.com:81/foo

// Используйте myURL.host для изменения имени хоста и порта
myURL.host = 'example.org:82';
console.log(myURL.href);
// Печатает https://example.org:82/foo
```

Неверные значения имени хоста, присвоенные свойству `hostname`, игнорируются.

#### `url.href`

- {строка}

Получает и устанавливает сериализованный URL.

```js
const myURL = new URL('https://example.org/foo');
console.log(myURL.href);
// Выводит https://example.org/foo

myURL.href = 'https://example.com/bar';
console.log(myURL.href);
// Печатает https://example.com/bar
```

Получение значения свойства `href` эквивалентно вызову [`url.toString()`](#urltostring).

Установка значения этого свойства на новое значение эквивалентна созданию нового объекта `URL` с помощью [`new URL(value)`](#new-urlinput-base). Каждое из свойств объекта `URL` будет изменено.

Если значение, присвоенное свойству `href`, не является действительным URL, будет выдана ошибка `TypeError`.

#### `url.origin`

- {строка}

Получает доступную только для чтения сериализацию происхождения URL.

```js
const myURL = new URL('https://example.org/foo/bar?baz');
console.log(myURL.origin);
// Печатает https://example.org
```

```js
const idnURL = new URL('https://測試');
console.log(idnURL.origin);
// Печатает https://xn--g6w251d

console.log(idnURL.hostname);
// Печатает xn--g6w251d
```

#### `url.password`

- {строка}

Получает и устанавливает часть URL, содержащую пароль.

```js
const myURL = new URL('https://abc:xyz@example.com');
console.log(myURL.password);
// Печатает xyz

myURL.password = '123';
console.log(myURL.href);
// Печатает https://abc:123@example.com/
```

Недопустимые символы URL, включенные в значение, присвоенное свойству `password`, кодируются [percent-encoded](#percent-encoding-in-urls). Выбор символов для кодирования может несколько отличаться от того, что выдают методы [`url.parse()`](#urlparseurlstring-parsequerystring-slashesdenotehost) и [`url.format()`](#urlformaturlobject).

#### `url.pathname`

- {строка}

Получает и устанавливает часть пути URL.

```js
const myURL = new URL('https://example.org/abc/xyz?123');
console.log(myURL.pathname);
// Печатает /abc/xyz

myURL.pathname = '/abcdef';
console.log(myURL.href);
// Печатает https://example.org/abcdef?123
```

Недопустимые символы URL, включенные в значение, присвоенное свойству `pathname`, [percent-encoded](#percent-encoding-in-urls). Выбор символов для кодирования может несколько отличаться от того, что выдают методы [`url.parse()`](#urlparseurlstring-parsequerystring-slashesdenotehost) и [`url.format()`](#urlformaturlobject).

#### `url.port`

- {строка}

Получает и устанавливает порт части URL.

Значение порта может быть числом или строкой, содержащей число в диапазоне от `0` до `65535` (включительно). Установка значения порта по умолчанию для объектов `URL`, заданных `protocol`, приведет к тому, что значение `port` станет пустой строкой (`''`).

Значение порта может быть пустой строкой, в этом случае порт зависит от протокола/схемы:

<table>
<thead>
<tr class="header">
<th>протокол</th>
<th>port</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>"ftp"</td>
<td>21</td>
</tr>
<tr class="even">
<td>"файл"</td>
<td></td>
</tr>
<tr class="odd">
<td>"http"</td>
<td>80</td>
</tr>
<tr class="even">
<td>"https"</td>
<td>443</td>
</tr>
<tr class="odd">
<td>"ws"</td>
<td>80</td>
</tr>
<tr class="even">
<td>"wss"</td>
<td>443</td>
</tr>
</tbody>
</table>

При присвоении значения порту, значение сначала преобразуется в строку с помощью `.toString()`.

Если эта строка недействительна, но начинается с числа, то ведущее число присваивается `port`. Если число находится вне обозначенного выше диапазона, оно игнорируется.

```js
const myURL = new URL('https://example.org:8888');
console.log(myURL.port);
// Выводит 8888

// Порты по умолчанию автоматически преобразуются в пустую строку.
// (порт по умолчанию протокола HTTPS - 443)
myURL.port = '443';
console.log(myURL.port);
// Выводит пустую строку
console.log(myURL.href);
// Печатает https://example.org/

myURL.port = 1234;
console.log(myURL.port);
// Печатает 1234
console.log(myURL.href);
// Печатает https://example.org:1234/

// Полностью недействительные строки портов игнорируются
myURL.port = 'abcd';
console.log(myURL.port);
// Выводит 1234

// Ведущие числа рассматриваются как номер порта
myURL.port = '5678abcd';
console.log(myURL.port);
// Печатается 5678

// Нецелые числа усекаются
myURL.port = 1234.5678;
console.log(myURL.port);
// Печатает 1234

// Числа вне диапазона, не представленные в научной нотации.
// будут проигнорированы.
myURL.port = 1e10; // 100000000, будет проверено на диапазон, как описано ниже
console.log(myURL.port);
// Выводит 1234
```

Числа, содержащие десятичную точку, такие как числа с плавающей точкой или числа в научной нотации, не являются исключением из этого правила. Ведущие числа до десятичной точки будут установлены в качестве порта URL, если они действительны:

```js
myURL.port = 4.567e21;
console.log(myURL.port);
// Выводит 4 (потому что это ведущее число в строке '4.567e21')
```

#### `url.protocol`

- {строка}

Получает и устанавливает протокольную часть URL.

```js
const myURL = new URL('https://example.org');
console.log(myURL.protocol);
// Выводит https:

myURL.protocol = 'ftp';
console.log(myURL.href);
// Печатает ftp://example.org/
```

Неверные значения протокола URL, присвоенные свойству `protocol`, игнорируются.

##### Специальные схемы

В [WHATWG URL Standard](https://url.spec.whatwg.org/) несколько схем протоколов URL считаются _специальными_ с точки зрения того, как они анализируются и сериализуются. Когда URL анализируется с использованием одного из этих специальных протоколов, свойство `url.protocol` может быть изменено на другой специальный протокол, но не может быть изменено на неспециальный протокол, и наоборот.

Например, изменение `http` на `https` работает:

```js
const u = new URL('http://example.org');
u.protocol = 'https';
console.log(u.href);
// https://example.org/
```

Однако переход от протокола `http` к гипотетическому протоколу `fish` не приводит к этому, поскольку новый протокол не является специальным.

```js
const u = new URL('http://example.org');
u.protocol = 'fish';
console.log(u.href);
// http://example.org/
```

Аналогично, переход от неспециального протокола к специальному также не разрешен:

```js
const u = new URL('fish://example.org');
u.protocol = 'http';
console.log(u.href);
// fish://example.org
```

Согласно стандарту URL WHATWG, специальными схемами протоколов являются `ftp`, `file`, `http`, `https`, `ws` и `wss`.

#### `url.search`

- {строка}

Получает и задает сериализованный запрос части URL.

```js
const myURL = new URL('https://example.org/abc?123');
console.log(myURL.search);
// Выводит ?123

myURL.search = 'abc=xyz';
console.log(myURL.href);
// Печатает https://example.org/abc?abc=xyz
```

Любые недопустимые символы URL, появляющиеся в значении, присвоенном свойству `search`, будут [percent-encoded](#percent-encoding-in-urls). Выбор символов для кодирования может несколько отличаться от того, что выдают методы [`url.parse()`](#urlparseurlstring-parsequerystring-slashesdenotehost) и [`url.format()`](#urlformaturlobject).

#### `url.searchParams`

- {URLSearchParams}

Получает объект [`URLSearchParams`](#class-urlsearchparams), представляющий параметры запроса URL. Это свойство доступно только для чтения, но объект `URLSearchParams`, который оно предоставляет, может быть использован для изменения экземпляра URL; чтобы заменить все параметры запроса URL, используйте сеттер [`url.search`](#urlsearch). Подробнее см. документацию по [`URLSearchParams`](#class-urlsearchparams).

Будьте осторожны при использовании `.searchParams` для изменения `URL`, поскольку, согласно спецификации WHATWG, объект `URLSearchParams` использует различные правила для определения того, какие символы следует кодировать. Например, объект `URL` не будет кодировать в процентах символ ASCII тильда (`~`), в то время как `URLSearchParams` всегда будет его кодировать:

```js
const myURL = new URL('https://example.org/abc?foo=~bar');

console.log(myURL.search); // печатает ?foo=~bar

// Модифицируем URL через searchParams...
myURL.searchParams.sort();

console.log(myURL.search); // печатает ?foo=%7Ebar
```

#### `url.username`

- {строка}

Получает и устанавливает часть имени пользователя URL.

```js
const myURL = new URL('https://abc:xyz@example.com');
console.log(myURL.username);
// Печатает abc

myURL.username = '123';
console.log(myURL.href);
// Печатает https://123:xyz@example.com/
```

Любые недопустимые символы URL, появляющиеся в значении, присвоенном свойству `username`, будут [percent-encoded](#percent-encoding-in-urls). Выбор символов для процентного кодирования может несколько отличаться от того, что выдают методы [`url.parse()`](#urlparseurlstring-parsequerystring-slashesdenotehost) и [`url.format()`](#urlformaturlobject).

#### `url.toString()`

- Возвращает: {строка}

Метод `toString()` объекта `URL` возвращает сериализованный URL. Возвращаемое значение эквивалентно значениям [`url.href`](#urlhref) и [`url.toJSON()`](#urltojson).

#### `url.toJSON()`

- Возвращает: {строка}

Метод `toJSON()` для объекта `URL` возвращает сериализованный URL. Возвращаемое значение эквивалентно значениям [`url.href`](#urlhref) и [`url.toString()`](#urltostring).

Этот метод вызывается автоматически, когда объект `URL` сериализуется с помощью [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

```js
const myURLs = [
  new URL('https://www.example.com'),
  new URL('https://test.example.org'),
];
console.log(JSON.stringify(myURLs));
// Печатает ["https://www.example.com/", "https://test.example.org/"].
```

#### `URL.createObjectURL(blob)`

> Стабильность: 1 - Экспериментальный

- `blob` {Blob}
- Возвращает: {строка}

Создает URL-строку `'blob:nodedata:...'`, которая представляет данный объект {Blob} и может быть использована для получения `Blob` позже.

```js
const { Blob, resolveObjectURL } = require('node:buffer');

const blob = new Blob(['hello']);
const id = URL.createObjectURL(blob);

// позже...

const otherBlob = resolveObjectURL(id);
console.log(otherBlob.size);
```

Данные, хранящиеся в зарегистрированном {Blob}, будут оставаться в памяти до тех пор, пока не будет вызвана функция `URL.revokeObjectURL()` для их удаления.

Объекты `Blob` регистрируются в текущем потоке. При использовании рабочих потоков объекты `Blob`, зарегистрированные в одном рабочем потоке, будут недоступны для других рабочих или главного потока.

#### `URL.revokeObjectURL(id)`

> Стабильность: 1 - Экспериментальный

- `id` {string} Строка URL `'blob:nodedata:...`, возвращенная предыдущим вызовом `URL.createObjectURL()`.

Удаляет сохраненный {Blob}, идентифицированный заданным ID. Попытка отозвать ID, который не зарегистрирован, завершится молчаливым отказом.

### Класс: `URLSearchParams`

API `URLSearchParams` предоставляет доступ на чтение и запись к запросу `URL`. Класс `URLSearchParams` также может быть использован отдельно с помощью одного из четырех следующих конструкторов. Класс `URLSearchParams` также доступен в глобальном объекте.

Интерфейс WHATWG `URLSearchParams` и модуль [`querystring`](querystring.md) имеют сходное назначение, но назначение модуля [`querystring`](querystring.md) более общее, поскольку он позволяет настраивать символы-разделители (`&` и `=`). С другой стороны, этот API предназначен исключительно для строк запросов URL.

```js
const myURL = new URL('https://example.org/?abc=123');
console.log(myURL.searchParams.get('abc'));
// Выводит 123

myURL.searchParams.append('abc', 'xyz');
console.log(myURL.href);
// Печатает https://example.org/?abc=123&abc=xyz

myURL.searchParams.delete('abc');
myURL.searchParams.set('a', 'b');
console.log(myURL.href);
// Печатает https://example.org/?a=b

const newSearchParams = new URLSearchParams(
  myURL.searchParams
);
// Вышеприведенное эквивалентно
// const newSearchParams = new URLSearchParams(myURL.search);

newSearchParams.append('a', 'c');
console.log(myURL.href);
// Выводит https://example.org/?a=b
console.log(newSearchParams.toString());
// Печатает a=b&a=c

// newSearchParams.toString() вызывается неявно
myURL.search = newSearchParams;
console.log(myURL.href);
// Выводит https://example.org/?a=b&a=c
newSearchParams.delete('a');
console.log(myURL.href);
// Печатается https://example.org/?a=b&a=c
```

#### `new URLSearchParams()`

Создает новый пустой объект `URLSearchParams`.

#### `новый URLSearchParams(string)`

- `string` {string} Строка запроса

Разбирает `string` как строку запроса и использует ее для создания нового объекта `URLSearchParams`. Ведущий символ `'?'`, если он присутствует, игнорируется.

```js
let params;

params = new URLSearchParams('user=abc&query=xyz');
console.log(params.get('user'));
// Печатает 'abc'
console.log(params.toString());
// Выводит 'user=abc&query=xyz'

params = new URLSearchParams('?user=abc&query=xyz');
console.log(params.toString());
// Печатает 'user=abc&query=xyz'
```

#### `new URLSearchParams(obj)`

- `obj` {Object} Объект, представляющий коллекцию пар ключ-значение.

Создайте новый объект `URLSearchParams` с хэш-картой запроса. Ключ и значение каждого свойства `obj` всегда приводятся к строкам.

В отличие от модуля [`querystring`](querystring.md), дублирование ключей в виде значений массива не допускается. Массивы строятся с помощью функции [`array.toString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toString), которая просто соединяет все элементы массива запятыми.

```js
const params = new URLSearchParams({
  user: 'abc',
  запрос: ['first', 'second'],
});
console.log(params.getAll('query'));
// Печатает [ 'first,second'].
console.log(params.toString());
// Печатает 'user=abc&query=first%2Csecond'
```

#### `new URLSearchParams(iterable)`

- `iterable` {Iterable} Итерабельный объект, элементами которого являются пары ключ-значение.

Создайте новый объект `URLSearchParams` с помощью итерируемой карты способом, аналогичным конструктору [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map). `iterable` может быть `Array` или любым итерируемым объектом. Это означает, что `iterable` может быть другим `URLSearchParams`, в этом случае конструктор просто создаст клон предоставленного `URLSearchParams`. Элементы `iterable` представляют собой пары ключ-значение и сами могут быть любыми объектами итерабельного типа.

Допускается дублирование ключей.

```js
let params;

// Использование массива
params = new URLSearchParams([
  ['user', 'abc'],
  ['query', 'first'],
  ['query', 'second'],
]);
console.log(params.toString());
// Выводит 'user=abc&query=first&query=second'

// Использование объекта Map
const map = new Map();
map.set('user', 'abc');
map.set('query', 'xyz');
params = new URLSearchParams(map);
console.log(params.toString());
// Выводит 'user=abc&query=xyz'

// Использование функции-генератора
function* getQueryPairs() {
  yield ['user', 'abc'];
  yield ['query', 'first'];
  yield ['query', 'second'];
}
params = new URLSearchParams(getQueryPairs());
console.log(params.toString());
// Выводит 'user=abc&query=first&query=second'

// Каждая пара ключ-значение должна содержать ровно два элемента
new URLSearchParams([['user', 'abc', 'error']]);
// Выброс TypeError [ERR_INVALID_TUPLE]:
// Каждая пара запросов должна быть итерируемым кортежем [имя, значение].
```

#### `urlSearchParams.append(name, value)`

- `name` {string}
- `значение` {строка}

Добавляет новую пару имя-значение к строке запроса.

#### `urlSearchParams.delete(name)`

- `name` {string}

Удаляет все пары имя-значение, имя которых равно `name`.

#### `urlSearchParams.entries()`

- Возвращает: {Итератор}

Возвращает ES6 `итератор` по каждой из пар имя-значение в запросе. Каждый элемент итератора представляет собой JavaScript `массив`. Первый элемент `массива` - это `имя`, второй элемент `массива` - это `значение`.

Псевдоним для [`urlSearchParams[@@iterator]()`](#urlsearchparamssymboliterator).

#### `urlSearchParams.forEach(fn[, thisArg])`

- `fn` {Функция} Вызывается для каждой пары имя-значение в запросе
- `thisArg` {Объект} Используется в качестве значения `this` при вызове `fn`.

Итерация по каждой паре имя-значение в запросе и вызов заданной функции.

```js
const myURL = new URL('https://example.org/?a=b&c=d');
myURL.searchParams.forEach((value, name, searchParams) => {
  console.log(
    name,
    value,
    myURL.searchParams === searchParams
  );
});
// Печатает:
// a b true
// c d true
```

#### `urlSearchParams.get(name)`

- `name` {строка}
- Возвращает: {string} или `null`, если не существует пары имя-значение с заданным `name`.

Возвращает значение первой пары имя-значение, имя которой равно `name`. Если таких пар нет, возвращается `null`.

#### `urlSearchParams.getAll(name)`

- `name` {строка}
- Возвращает: {string\[\]}

Возвращает значения всех пар имя-значение, имя которых равно `name`. Если таких пар нет, возвращается пустой массив.

#### `urlSearchParams.has(name)`

- `name` {string}
- Возвращает: {boolean}

Возвращает `true`, если существует хотя бы одна пара имя-значение, имя которой равно `name`.

#### `urlSearchParams.keys()`

- Возвращает: {Итератор}

Возвращает ES6 `итератор` над именами каждой пары имя-значение.

```js
const params = new URLSearchParams('foo=bar&foo=baz');
for (const name of params.keys()) {
  console.log(name);
}
// Печатает:
// foo
// foo
```

#### `urlSearchParams.set(name, value)`

- `name` {string}
- `value` {строка}

Устанавливает значение в объекте `URLSearchParams`, связанном с `name`, в `value`. Если существуют уже существующие пары имя-значение, имена которых равны `name`, установите значение первой такой пары в `value` и удалите все остальные. Если нет, добавьте пару имя-значение к строке запроса.

```js
const params = new URLSearchParams();
params.append('foo', 'bar');
params.append('foo', 'baz');
params.append('abc', 'def');
console.log(params.toString());
// Выводит foo=bar&foo=baz&abc=def

params.set('foo', 'def');
params.set('xyz', 'opq');
console.log(params.toString());
// Выводит foo=def&abc=def&xyz=opq
```

#### `urlSearchParams.size`

Общее количество записей параметров.

#### `urlSearchParams.sort()`

Сортирует все существующие пары имя-значение на месте по их именам. Сортировка выполняется с помощью [стабильного алгоритма сортировки](https://en.wikipedia.org/wiki/Sorting_algorithm#Stability), поэтому относительный порядок между парами имя-значение с одинаковыми именами сохраняется.

Этот метод может быть использован, в частности, для увеличения количества просмотров кэша.

```js
const params = new URLSearchParams(
  'query[]=abc&type=search&query[]=123'
);
params.sort();
console.log(params.toString());
// Выводит запрос%5B%5D=abc&query%5B%5D=123&type=search
```

#### `urlSearchParams.toString()`

- Возвращает: {string}

Возвращает параметры поиска, сериализованные в виде строки, с кодировкой символов в процентах, где это необходимо.

#### `urlSearchParams.values()`

- Возвращает: {Итератор}

Возвращает ES6 `итератор` над значениями каждой пары имя-значение.

#### `urlSearchParams[Symbol.iterator]()`

- Возвращает: {Итератор}

Возвращает ES6 `Итератор` по каждой из пар имя-значение в строке запроса. Каждый элемент итератора представляет собой JavaScript `массив`. Первый элемент `массива` - это `имя`, второй элемент `массива` - это `значение`.

Псевдоним для [`urlSearchParams.entries()`](#urlsearchparamsentries).

```js
const params = new URLSearchParams('foo=bar&xyz=baz');
for (const [name, value] of params) {
  console.log(name, value);
}
// Выводит:
// foo bar
// xyz baz
```

### `url.domainToASCII(domain)`

- `домен` {строка}
- Возвращает: {string}

Возвращает [Punycode](https://tools.ietf.org/html/rfc5891#section-4.4) ASCII сериализацию `домена`. Если `domain` является недопустимым доменом, возвращается пустая строка.

Выполняется обратная операция по отношению к [`url.domainToUnicode()`](#urldomaintounicodedomain).

Эта функция доступна, только если исполняемый файл `node` был скомпилирован с включенным [ICU](intl.md#options-for-building-nodejs). В противном случае доменные имена передаются без изменений.

```mjs
import url from 'node:url';

console.log(url.domainToASCII('español.com'));
// Печатает xn--espaol-zwa.com
console.log(url.domainToASCII('中文.com'));
// Печатает xn--fiq228c.com
console.log(url.domainToASCII('xn--iñvalid.com'));
// Печатает пустую строку
```

```cjs
const url = require('node:url');

console.log(url.domainToASCII('español.com'));
// Печатает xn--espaol-zwa.com
console.log(url.domainToASCII('中文.com'));
// Печатает xn--fiq228c.com
console.log(url.domainToASCII('xn--iñvalid.com'));
// Печатает пустую строку
```

### `url.domainToUnicode(domain)`

- `домен` {строка}
- Возвращает: {string}

Возвращает Unicode сериализацию `домена`. Если `domain` является недопустимым доменом, возвращается пустая строка.

Выполняется обратная операция по отношению к [`url.domainToASCII()`](#urldomaintoasciidomain).

Эта функция доступна, только если исполняемый файл `node` был скомпилирован с включенным [ICU](intl.md#options-for-building-nodejs). В противном случае доменные имена передаются без изменений.

```mjs
import url from 'node:url';

console.log(url.domainToUnicode('xn--espaol-zwa.com'));
// Печатает español.com
console.log(url.domainToUnicode('xn--fiq228c.com'));
// Печатает 中文.com
console.log(url.domainToUnicode('xn--iñvalid.com'));
// Печатает пустую строку
```

```cjs
const url = require('node:url');

console.log(url.domainToUnicode('xn--espaol-zwa.com'));
// Печатает español.com
console.log(url.domainToUnicode('xn--fiq228c.com'));
// Печатает 中文.com
console.log(url.domainToUnicode('xn--iñvalid.com'));
// Печатает пустую строку
```

### `url.fileURLToPath(url)`

- `url` {URL | string} Строка URL файла или объект URL для преобразования в путь.
- Возвращает: {строка} Полностью преобразованный специфичный для платформы Node.js путь к файлу.

Эта функция обеспечивает правильное декодирование символов с процентным кодированием, а также обеспечивает кроссплатформенную корректную строку абсолютного пути.

```mjs
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);

new URL('file:///C:/path/').pathname; // Неверно: /C:/path/
fileURLToPath('file:///C:/path/'); // Правильно:   C:\path\ (Windows)

new URL('file://nas/foo.txt').pathname; // Неправильно: /foo.txt
fileURLToPath('file://nas/foo.txt'); // Правильно:   \nas\foo.txt (Windows)

new URL('file:///你好.txt').pathname; // Неправильно: /%E4%BD%A0%E5%A5%BD.txt
fileURLToPath('file:///你好.txt'); // Правильно:   /你好.txt (POSIX)

new URL('file:///hello world').pathname; // Неправильно: /hello%20world
fileURLToPath('file:///hello world'); // Правильно:   /hello world (POSIX)
```

```cjs
const { fileURLToPath } = require('node:url');
new URL('file:///C:/path/').pathname; // Неправильно: /C:/path/
fileURLToPath('file:///C:/path/'); // Правильно:   C:\path\ (Windows)

new URL('file://nas/foo.txt').pathname; // Неправильно: /foo.txt
fileURLToPath('file://nas/foo.txt'); // Правильно:   \nas\foo.txt (Windows)

new URL('file:///你好.txt').pathname; // Неправильно: /%E4%BD%A0%E5%A5%BD.txt
fileURLToPath('file:///你好.txt'); // Правильно:   /你好.txt (POSIX)

new URL('file:///hello world').pathname; // Неправильно: /hello%20world
fileURLToPath('file:///hello world'); // Правильно:   /hello world (POSIX)
```

### `url.format(URL[, options])`

- `URL` {URL} объект [WHATWG URL](#the-whatwg-url-api)
- `options` {Object}
  - `auth` {boolean} `true`, если сериализованная строка URL должна включать имя пользователя и пароль, `false` в противном случае. **По умолчанию:** `true`.
  - `фрагмент` {boolean} `true`, если сериализованная строка URL должна включать фрагмент, `false` в противном случае. **По умолчанию:** `true`.
  - `search` {boolean} `true`, если сериализованная строка URL должна включать поисковый запрос, `false` в противном случае. **По умолчанию:** `true`.
  - `unicode` {boolean} `true`, если символы Unicode, появляющиеся в компоненте host строки URL, должны быть закодированы напрямую, а не в кодировке Punycode. **По умолчанию:** `false`.
- Возвращает: {string}

Возвращает настраиваемую сериализацию представления URL `String` объекта [WHATWG URL](#the-whatwg-url-api).

Объект URL имеет метод `toString()` и свойство `href`, которые возвращают строковую сериализацию URL. Однако они никак не настраиваются. Метод `url.format(URL[, options])` позволяет выполнить базовую настройку вывода.

```mjs
import url from 'node:url';
const myURL = new URL('https://a:b@測試?abc#foo');

console.log(myURL.href);
// Печатает https://a:b@xn--g6w251d/?abc#foo

console.log(myURL.toString());
// Печатает https://a:b@xn--g6w251d/?abc#foo

console.log(
  url.format(myURL, {
    fragment: false,
    unicode: true,
    auth: false,
  })
);
// Печатает 'https://測試/?abc'
```

```cjs
const url = require('node:url');
const myURL = new URL('https://a:b@測試?abc#foo');

console.log(myURL.href);
// Печатает https://a:b@xn--g6w251d/?abc#foo

console.log(myURL.toString());
// Печатает https://a:b@xn--g6w251d/?abc#foo

console.log(
  url.format(myURL, {
    fragment: false,
    unicode: true,
    auth: false,
  })
);
// Печатает 'https://測試/?abc'
```

### `url.pathToFileURL(path)`

- `path` {string} Путь для преобразования в URL файла.
- Возвращает: {URL} Объект URL файла.

Эта функция гарантирует, что `path` разрешается абсолютно, и что управляющие символы URL правильно кодируются при преобразовании в URL файла.

```mjs
import { pathToFileURL } from 'node:url';

new URL('/foo#1', 'file:'); // Неправильно: file:///foo#1
pathToFileURL('/foo#1'); // Правильно: file:///foo%231 (POSIX)

new URL('/some/path%.c', 'file:'); // Неправильно: file:///some/path%.c
pathToFileURL('/some/path%.c'); // Правильно: file:///some/path%25.c (POSIX)
```

```cjs
const { pathToFileURL } = require('node:url');
new URL(__filename); // Неправильно: бросает (POSIX)
new URL(__filename); // Неверно: C:\... (Windows)
pathToFileURL(__filename); // Правильно: file:///... (POSIX)
pathToFileURL(__filename); // Правильно: file:///C:/... (Windows)

new URL('/foo#1', 'file:'); // Неправильно: file:///foo#1
pathToFileURL('/foo#1'); // Правильно: file:///foo%231 (POSIX)

new URL('/some/path%.c', 'file:'); // Неправильно: file:///some/path%.c
pathToFileURL('/some/path%.c'); // Правильно: file:///some/path%25.c (POSIX)
```

### `url.urlToHttpOptions(url)`.

- `url` {URL} Объект [WHATWG URL](#the-whatwg-url-api) для преобразования в объект опций.
- Возвращает: {Object} объект опций
  - `protocol` {string} Используемый протокол.
  - `hostname` {string} Доменное имя или IP-адрес сервера, на который будет отправлен запрос.
  - `hash` {string} Фрагмент части URL.
  - `search` {string} Сериализованный запрос части URL.
  - `pathname` {string} Часть URL, содержащая путь.
  - `path` {string} Путь запроса. Должен включать строку запроса, если таковая имеется. Например, `'/index.html?page=12'`. Исключение возникает, если путь запроса содержит недопустимые символы. В настоящее время отклоняются только пробелы, но в будущем это может измениться.
  - `href` {строка} Сериализованный URL.
  - `port` {number} Порт удаленного сервера.
  - `auth` {string} Базовая аутентификация, т.е. `'user:password'` для вычисления заголовка Authorization.

Эта служебная функция преобразует объект URL в обычный объект options, как ожидается API [`http.request()`](http.md#httprequestoptions-callback) и [`https.request()`](https.md#httpsrequestoptions-callback).

```mjs
import { urlToHttpOptions } from 'node:url';
const myURL = new URL('https://a:b@測試?abc#foo');

console.log(urlToHttpOptions(myURL));
/*
{
  протокол: 'https:',
  hostname: 'xn--g6w251d',
  хэш: '#foo',
  поиск: '?abc',
  имя пути: '/',
  путь: '/?abc',
  href: 'https://a:b@xn--g6w251d/?abc#foo',
  auth: 'a:b'
}
*/
```

```cjs
const { urlToHttpOptions } = require('node:url');
const myURL = new URL('https://a:b@測試?abc#foo');

console.log(urlToHttpOptions(myURL));
/*
{
  протокол: 'https:',
  hostname: 'xn--g6w251d',
  хэш: '#foo',
  поиск: '?abc',
  имя пути: '/',
  путь: '/?abc',
  href: 'https://a:b@xn--g6w251d/?abc#foo',
  auth: 'a:b'
}
*/
```

## Legacy URL API

> Стабильность: 3 - Устаревший: Вместо него используйте API URL WHATWG.

### Legacy `urlObject`

> Стабильность: 3 - Устаревший: Вместо этого используйте WHATWG URL API.

Унаследованный `urlObject` (`require('node:url').Url` или `import { Url } from 'node:url'`) создается и возвращается функцией `url.parse()`.

#### `urlObject.auth`

Свойство `auth` - это имя пользователя и пароль части URL, также называемые _userinfo_. Это подмножество строк следует за `protocol` и двойной косой чертой (если присутствует) и предшествует компоненту `host`, отделенному символом `@`. Строка представляет собой либо имя пользователя, либо имя пользователя и пароль, разделенные символом `:`.

Например: `'user:pass'`.

#### `urlObject.hash`

Свойство `hash` - это часть идентификатора фрагмента URL, включая ведущий символ `#`.

Например: `'#hash'`.

#### `urlObject.host`

Свойство `host` - это полная часть URL, написанная строчными буквами, включая `port`, если он указан.

Например: `'sub.example.com:8080'`.

#### `urlObject.hostname`

Свойство `hostname` - это часть имени хоста, написанная строчными буквами в компоненте `host` без включенного `port`.

Например: `'sub.example.com'`.

#### `urlObject.href`

Свойство `href` - это полная строка URL, которая была разобрана с компонентами `protocol` и `host`, преобразованными в нижний регистр.

Например: `'http://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'`.

#### `urlObject.path`

Свойство `path` представляет собой конкатенацию компонентов `pathname` и `search`.

Например: `'/p/a/t/h?query=string'`.

Декодирование `пути` не производится.

#### `urlObject.pathname`

Свойство `pathname` состоит из всей секции пути URL. Это все, что следует за `host` (включая `port`) и до начала компонентов `query` или `hash`, разделенных либо ASCII вопросительным знаком (`?`), либо символом хэша (`#`).

Например: `'/p/a/t/h'`.

Декодирование строки пути не выполняется.

#### `urlObject.port`

Свойство `port` - это числовая часть порта компонента `host`.

Например: `8080`.

#### `urlObject.protocol`

Свойство `protocol` определяет схему протокола URL со строчной буквы.

Например: ` http:`.

#### `urlObject.query`

Свойство `query` - это либо строка запроса без ведущего ASCII вопросительного знака (`?`), либо объект, возвращаемый методом `parse()` модуля [`querystring`](querystring.md). Является ли свойство `query` строкой или объектом, определяется аргументом `parseQueryString`, переданным в `url.parse()`.

Например: `'query=string'` или `{'query': 'string'}`.

Если запрос возвращается как строка, то декодирование строки запроса не производится. Если запрос возвращается как объект, то декодируются и ключи, и значения.

#### `urlObject.search`

Свойство `search` состоит из всей части URL "строка запроса", включая ведущий символ ASCII вопросительный знак (`?`).

Например: `'?query=string'`.

Декодирование строки запроса не производится.

#### `urlObject.slashes`

Свойство `slashes` представляет собой `булево` со значением `true`, если после двоеточия в `протоколе` требуется два ASCII символа прямой косой черты (`/`).

### `url.format(urlObject)`

> Стабильность: 3 - Наследие: Вместо этого используйте WHATWG URL API.

- `urlObject` {Object|string} Объект URL (возвращенный функцией `url.parse()` или построенный иным образом). Если это строка, она преобразуется в объект путем передачи в `url.parse()`.

Метод `url.format()` возвращает отформатированную строку URL, полученную из `urlObject`.

```js
const url = require("node:url");
url.format({
  протокол: "https",
  hostname: "example.com",
  имя пути: "/some/path",
  запрос: {
    страница: 1,
    формат: "json",
  },
});


// => 'https://example.com/some/path?page=1&format=json'
```

Если `urlObject` не является объектом или строкой, `url.format()` выбросит [`TypeError`](errors.md#class-typeerror).

Процесс форматирования происходит следующим образом:

- Создается новая пустая строка `result`.
- Если `urlObject.protocol` является строкой, то она добавляется к `result` как есть.
- В противном случае, если `urlObject.protocol` не является `undefined` и не является строкой, выдается [`Error`](errors.md#class-error).
- Для всех строковых значений `urlObject.protocol`, которые _не заканчиваются_ символом двоеточия ASCII (`:`), к `result` будет добавлена литеральная строка `:`.
- Если одно из следующих условий истинно, то к `result` будет добавлена литеральная строка `//`:
  - Свойство `urlObject.slashes` истинно;
  - `urlObject.protocol` начинается с `http`, `https`, `ftp`, `gopher` или `file`;
- Если значение свойства `urlObject.auth` истинно, а `urlObject.host` или `urlObject.hostname` не являются `undefined`, то значение `urlObject.auth` будет преобразовано в строку и добавлено к `result`, за которым следует литеральная строка `@`.
- Если свойство `urlObject.host` является `undefined`, то:
  - Если `urlObject.hostname` является строкой, то она добавляется к `result`.
  - В противном случае, если `urlObject.hostname` не `undefined` и не является строкой, выдается [`Error`](errors.md#class-error).
  - Если значение свойства `urlObject.port` истинно, а `urlObject.hostname` не является `undefined`:
    - Буквальная строка `:` добавляется к `result`, и
    - Значение `urlObject.port` преобразуется в строку и добавляется к `result`.
- В противном случае, если значение свойства `urlObject.host` истинно, значение `urlObject.host` принудительно преобразуется в строку и добавляется к `result`.
- Если свойство `urlObject.pathname` является строкой, которая не является пустой строкой:
  - Если `urlObject.pathname` _не начинается_ с прямой косой черты ASCII (`/`), то к `result` добавляется литеральная строка `'/'`.
  - Значение `urlObject.pathname` добавляется к `result`.
- В противном случае, если `urlObject.pathname` не является `undefined` и не является строкой, выдается [`Error`](errors.md#class-error).
- Если свойство `urlObject.search` является `undefined` и если свойство `urlObject.query` является `Object`, к `result` добавляется литеральная строка `?`, за которой следует результат вызова метода `stringify()` модуля [`querystring`](querystring.md), передающего значение `urlObject.query`.
- Иначе, если `urlObject.search` является строкой:
  - Если значение `urlObject.search` _не начинается_ с символа ASCII вопросительного знака (`?`), то к `result` добавляется литеральная строка `?`.
  - Значение `urlObject.search` добавляется к `result`.
- В противном случае, если `urlObject.search` не является `undefined` и не является строкой, будет выдана ошибка [`Error`](errors.md#class-error).
- Если свойство `urlObject.hash` является строкой:
  - Если значение `urlObject.hash` _не начинается_ с символа ASCII hash (`#`), к `result` добавляется литеральная строка `#`.
  - Значение `urlObject.hash` добавляется к `result`.
- В противном случае, если свойство `urlObject.hash` не является `undefined` и не является строкой, выдается ошибка [`Error`](errors.md#class-error).
- Возвращается `result`.

### `url.parse(urlString[, parseQueryString[, slashesDenoteHost]])`

> Стабильность: 0 - Утратил актуальность: Вместо этого используйте WHATWG URL API.

- `urlString` {string} Строка URL для разбора.
- `parseQueryString` {boolean} Если `true`, свойство `query` всегда будет установлено в объект, возвращаемый методом `parse()` модуля [`querystring`](querystring.md). Если `false`, свойство `query` возвращаемого объекта URL будет представлять собой непарсированную, не декодированную строку. **По умолчанию:** `false`.
- `slashesDenoteHost` {boolean} Если `true`, то первая лексема после литеральной строки `///` и перед следующей `/` будет интерпретироваться как `host`. Например, если задано `//foo/bar`, результатом будет `{host: 'foo', pathname: '/bar'}`, а не `{pathname: '//foo/bar'}`. **По умолчанию:** `false`.

Метод `url.parse()` принимает строку URL, разбирает ее и возвращает объект URL.

Если `urlString` не является строкой, возникает `TypeError`.

Ошибка `URIError` возникает, если свойство `auth` присутствует, но не может быть декодировано.

`url.parse()` использует мягкий, нестандартный алгоритм для разбора строк URL. Он подвержен таким проблемам безопасности, как [подмена имени хоста](https://hackerone.com/reports/678487) и некорректная обработка имен пользователей и паролей. Не используйте с недоверенными входными данными. CVE не выдаются для уязвимостей `url.parse()`. Вместо этого используйте API [WHATWG URL](#the-whatwg-url-api).

### `url.resolve(from, to)`

> Стабильность: 3 - Наследие: Вместо этого используйте WHATWG URL API.

- `from` {string} Базовый URL, который следует использовать, если `to` - относительный URL.
- `to` {строка} Целевой URL для преобразования.

Метод `url.resolve()` разрешает целевой URL относительно базового URL аналогично тому, как веб-браузер разрешает тег якоря.

```js
const url = require('node:url');
url.resolve('/one/two/three', 'four'); // '/one/two/four'
url.resolve('http://example.com/', '/one'); // 'http://example.com/one'
url.resolve('http://example.com/one', '/two'); // 'http://example.com/two'
```

Для достижения того же результата с помощью WHATWG URL API:

```js
function resolve(from, to) {
  const resolvedUrl = new URL(
    to,
    new URL(from, 'resolve://')
  );
  if (resolvedUrl.protocol === 'resolve:') {
    // `from` - это относительный URL.
    const { pathname, search, hash } = resolvedUrl;
    return pathname + search + hash;
  }
  return resolvedUrl.toString();
}

resolve('/one/two/three', 'four'); // '/one/two/four'
resolve('http://example.com/', '/one'); // 'http://example.com/one'
resolve('http://example.com/one', '/two'); // 'http://example.com/two'
```

## Процентное кодирование в URL-адресах

URL-адреса могут содержать только определенный диапазон символов. Любой символ, выходящий за пределы этого диапазона, должен быть закодирован. Как кодировать такие символы и какие символы кодировать, полностью зависит от того, где символ находится в структуре URL.

### Legacy API

В Legacy API пробелы (`' '`) и следующие символы будут автоматически экранироваться в свойствах объектов URL:

```
текст < > " ` \r \n \t { } | \ ^ '
```

Например, символ пробела ASCII (`' '`) кодируется как `%20`. Символ прямой косой черты ASCII (`/`) кодируется как `%3C`.

### WHATWG API

В [WHATWG URL Standard](https://url.spec.whatwg.org/) используется более избирательный и тонкий подход к выбору кодированных символов, чем в Legacy API.

Алгоритм WHATWG определяет четыре "набора процентного кодирования", которые описывают диапазоны символов, которые должны быть закодированы в процентах:

- Набор _C0 control percent-encode set_ включает кодовые точки в диапазоне от U+0000 до U+001F (включительно) и все кодовые точки больше U+007E.
- Набор _фрагментных процентов кодирования_ включает набор _C0 управляющих процентов кодирования_ и кодовые точки U+0020, U+0022, U+003C, U+003E и U+0060.
- Набор кодов _path percent-encode set_ включает набор кодов _C0 control percent-encode set_ и кодовые точки U+0020, U+0022, U+0023, U+003C, U+003E, U+003F, U+0060, U+007B и U+007D.
- Набор кодов _userinfo_ включает набор кодов _path percent-encode set_ и кодовые точки U+002F, U+003A, U+003B, U+003D, U+0040, U+005B, U+005C, U+005D, U+005E и U+007C.

Набор кодировок _userinfo percent-encode set_ используется исключительно для имени пользователя и паролей, закодированных в URL. Набор кодировок _path percent-encode set_ используется для пути большинства URL. Набор _fragment percent-encode set_ используется для фрагментов URL. Набор кодировок _C0 control percent-encode set_ используется для хоста и пути при определенных условиях, а также во всех остальных случаях.

Когда в имени хоста появляются символы, не относящиеся к кодировке ASCII, имя хоста кодируется с использованием алгоритма [Punycode](https://tools.ietf.org/html/rfc5891#section-4.4). Заметим, однако, что имя хоста _может_ содержать как кодированные Punycode, так и кодированные процентами символы:

```js
const myURL = new URL('https://%CF%80.example.com/foo');
console.log(myURL.href);
// Печатает https://xn--1xa.example.com/foo
console.log(myURL.origin);
// Печатает https://xn--1xa.example.com
```
