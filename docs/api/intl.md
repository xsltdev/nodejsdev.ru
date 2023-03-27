---
description: Node.js имеет множество функций, которые облегчают написание интернационализированных программ
---

# Поддержка интернационализации

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/intl.html)

Node.js имеет множество функций, которые облегчают написание интернационализированных программ. Вот некоторые из них:

- Функции, чувствительные к локали или Unicode в [ECMAScript Language Specification](https://tc39.github.io/ecma262/):
  - [`String.prototype.normalize()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)
  - [`String.prototype.toLowerCase()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase)
  - [`String.prototype.toUpperCase()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase)
- Вся функциональность, описанная в [ECMAScript Internationalization API Specification](https://tc39.github.io/ecma402/) (она же ECMA-402):
  - [`Intl`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) объект
  - Методы, чувствительные к локализации, такие как [`String.prototype.localeCompare()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare) и [`Date.prototype.toLocaleString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString)
- Поддержка [интернационализированных доменных имен](https://en.wikipedia.org/wiki/Internationalized_domain_name) (IDN) в [WHATWG URL parser](url.md#the-whatwg-url-api).
- [`require('node:buffer').transcode()`](buffer.md#buffertranscodesource-fromenc-toenc)
- Более точное редактирование строк [REPL](repl.md#repl)
- [`require('node:util').TextDecoder`](util.md#class-utiltextdecoder)
- [`RegExp` Unicode Property Escapes](https://github.com/tc39/proposal-regexp-unicode-property-escapes)

Node.js и лежащий в основе движок V8 используют [International Components for Unicode (ICU)](http://site.icu-project.org/) для реализации этих возможностей в родном коде на C/C++. Полный набор данных ICU предоставляется Node.js по умолчанию. Однако, из-за размера файла данных ICU, предоставляется несколько опций для настройки набора данных ICU при сборке или запуске Node.js.

## Опции для сборки Node.js

Чтобы контролировать использование ICU в Node.js, во время компиляции доступны четыре опции `configure`. Дополнительные подробности о том, как компилировать Node.js, описаны в [BUILDING.md](https://github.com/nodejs/node/blob/HEAD/BUILDING.md).

- `--with-intl=none`/`--without-intl`
- `--with-intl=system-icu`
- `--with-intl=small-icu`
- `--with-intl=full-icu` (default)

Обзор доступных возможностей Node.js и JavaScript для каждой опции `configure`:

<table>
<colgroup>
<col style="width: 30%" />
<col style="width: 24%" />
<col style="width: 21%" />
<col style="width: 16%" />
<col style="width: 7%" />
</colgroup>
<thead>
<tr class="header">
<th>Feature</th>
<th><code>none</code></th>
<th><code>system-icu</code></th>
<th><code>small-icu</code></th>
<th><code>full-icu</code></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize"><code>String.prototype.normalize()</code></a></td>
<td>none (function is no-op)</td>
<td>full</td>
<td>full</td>
<td>full</td>
</tr>
<tr class="even">
<td><code>String.prototype.to*Case()</code></td>
<td>full</td>
<td>full</td>
<td>full</td>
<td>full</td>
</tr>
<tr class="odd">
<td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl"><code>Intl</code></a></td>
<td>none (object does not exist)</td>
<td>partial/full (depends on OS)</td>
<td>partial (English-only)</td>
<td>full</td>
</tr>
<tr class="even">
<td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare"><code>String.prototype.localeCompare()</code></a></td>
<td>partial (not locale-aware)</td>
<td>full</td>
<td>full</td>
<td>full</td>
</tr>
<tr class="odd">
<td><code>String.prototype.toLocale*Case()</code></td>
<td>partial (not locale-aware)</td>
<td>full</td>
<td>full</td>
<td>full</td>
</tr>
<tr class="even">
<td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString"><code>Number.prototype.toLocaleString()</code></a></td>
<td>partial (not locale-aware)</td>
<td>partial/full (depends on OS)</td>
<td>partial (English-only)</td>
<td>full</td>
</tr>
<tr class="odd">
<td><code>Date.prototype.toLocale*String()</code></td>
<td>partial (not locale-aware)</td>
<td>partial/full (depends on OS)</td>
<td>partial (English-only)</td>
<td>full</td>
</tr>
<tr class="even">
<td><a href="url.md#legacy-url-api">Legacy URL Parser</a></td>
<td>partial (no IDN support)</td>
<td>full</td>
<td>full</td>
<td>full</td>
</tr>
<tr class="odd">
<td><a href="url.md#the-whatwg-url-api">WHATWG URL Parser</a></td>
<td>partial (no IDN support)</td>
<td>full</td>
<td>full</td>
<td>full</td>
</tr>
<tr class="even">
<td><a href="buffer.md#buffertranscodesource-fromenc-toenc"><code>require('node:buffer').transcode()</code></a></td>
<td>none (function does not exist)</td>
<td>full</td>
<td>full</td>
<td>full</td>
</tr>
<tr class="odd">
<td><a href="repl.md#repl">REPL</a></td>
<td>partial (inaccurate line editing)</td>
<td>full</td>
<td>full</td>
<td>full</td>
</tr>
<tr class="even">
<td><a href="util.md#class-utiltextdecoder"><code>require('node:util').TextDecoder</code></a></td>
<td>partial (basic encodings support)</td>
<td>partial/full (depends on OS)</td>
<td>partial (Unicode-only)</td>
<td>full</td>
</tr>
<tr class="odd">
<td><a href="https://github.com/tc39/proposal-regexp-unicode-property-escapes"><code>RegExp</code> Unicode Property Escapes</a></td>
<td>none (invalid <code>RegExp</code> error)</td>
<td>full</td>
<td>full</td>
<td>full</td>
</tr>
</tbody>
</table>

Обозначение "(not locale-aware)" означает, что функция выполняет свою работу так же, как и нелокальная версия функции, если таковая существует. Например, в режиме `none` работа `Date.prototype.toLocaleString()` идентична работе `Date.prototype.toString()`.

### Отключить все функции интернационализации (`none`)

Если выбрана эта опция, ICU отключается и большинство функций интернационализации, упомянутых выше, будут **недоступны** в результирующем бинарном файле `node`.

### Сборка с предустановленным ICU (`system-icu`)

Node.js может ссылаться на сборку ICU, уже установленную в системе. На самом деле, большинство дистрибутивов Linux уже поставляются с установленным ICU, и эта опция позволит повторно использовать тот же набор данных, который используется другими компонентами ОС.

Функции, которые требуют только саму библиотеку ICU, такие как [`String.prototype.normalize()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) и парсер URL [WHATWG](url.md#the-whatwg-url-api), полностью поддерживаются под `system-icu`. Функции, требующие дополнительных данных локали ICU, такие как [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat) _могут_ поддерживаться полностью или частично, в зависимости от полноты данных ICU, установленных в системе.

### Встраивание ограниченного набора данных ICU (`small-icu`)

Эта опция делает результирующий двоичный файл статически связанным с библиотекой ICU и включает подмножество данных ICU (обычно только английскую локаль) в исполняемый файл `node`.

Функции, требующие только саму библиотеку ICU, такие как [`String.prototype.normalize()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) и парсер URL [WHATWG](url.md#the-whatwg-url-api), полностью поддерживаются в `small-icu`. Функции, которые дополнительно требуют данные локали ICU, такие как [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat), обычно работают только с английской локалью:

```js
const january = new Date(9e8);
const english = new Intl.DateTimeFormat('en', {
  month: 'long',
});
const spanish = new Intl.DateTimeFormat('es', {
  month: 'long',
});

console.log(english.format(january));
// Печатает "январь"
console.log(spanish.format(january));
// Выводит либо "M01", либо "January" на small-icu, в зависимости от локали пользователя по умолчанию.
// Должно выводиться "enero"
```

Этот режим обеспечивает баланс между возможностями и размером двоичного файла.

#### Предоставление данных ICU во время выполнения.

Если используется опция `small-icu`, можно предоставить дополнительные данные о локали во время выполнения, чтобы методы JS работали для всех локалей ICU. Предполагая, что файл данных хранится в `/some/directory`, его можно сделать доступным для ICU либо через:

- [`NODE_ICU_DATA`](cli.md#node_icu_datafile) переменную окружения:

  ```bash
  env NODE_ICU_DATA=/some/directory node
  ```

- CLI-параметр [`--icu-data-dir`](cli.md#--icu-data-dirfile):

  ```bash
  node --icu-data-dir=/some/directory
  ```

(Если указаны оба параметра, приоритет имеет параметр CLI `--icu-data-dir`).

ICU может автоматически находить и загружать данные различных форматов, но данные должны соответствовать версии ICU, а файл должен быть правильно назван. Наиболее распространенное имя файла данных - `icudt6X[bl].dat`, где `6X` обозначает предполагаемую версию ICU, а `b` или `l` - эндианальность системы. Смотрите статью ["ICU Data"](http://userguide.icu-project.org/icudata) в Руководстве пользователя ICU для других поддерживаемых форматов и более подробную информацию о данных ICU в целом.

Модуль [full-icu](https://www.npmjs.com/package/full-icu) npm может значительно упростить установку данных ICU, определяя версию ICU запущенного исполняемого файла `node` и загружая соответствующий файл данных. После установки модуля через `npm i full-icu`, файл данных будет доступен по адресу `./node_modules/full-icu`. Этот путь можно передать в `NODE_ICU_DATA` или `--icu-data-dir`, как показано выше, чтобы включить полную поддержку `Intl`.

### Встраивание всего ICU (`full-icu`)

Эта опция заставляет результирующий двоичный файл статически связываться с ICU и включать полный набор данных ICU. Созданный таким образом двоичный файл не имеет дополнительных внешних зависимостей и поддерживает все локали, но может быть довольно большим. Это поведение по умолчанию, если не передан флаг `--with-intl`. Официальные двоичные файлы также собираются в этом режиме.

## Обнаружение поддержки интернационализации

Чтобы убедиться, что ICU вообще включен (`system-icu`, `small-icu` или `full-icu`), достаточно просто проверить существование `Intl`:

```js
const hasICU = typeof Intl === 'object';
```

Альтернативно, проверка на `process.versions.icu`, свойство, определяемое только при включенном ICU, тоже работает:

```js
const hasICU = typeof process.versions.icu === 'string';
```

Для проверки поддержки неанглийской локали (т. е. `full-icu` или `system-icu`), [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat) может быть хорошим отличительным фактором:

```js
const hasFullICU = (() => {
  попытка {
    const january = new Date(9e8);
    const spanish = new Intl.DateTimeFormat("es", { month: "long" });
    return spanish.format(january) === "enero";
  } catch (err) {
    return false;
  }
})();
```

Для более подробных тестов на поддержку `Intl` могут быть полезны следующие ресурсы:

- [btest402](https://github.com/srl295/btest402): Обычно используется для проверки правильности сборки Node.js с поддержкой `Intl`.
- [Test262](https://github.com/tc39/test262/tree/HEAD/test/intl402): Официальный набор тестов соответствия ECMAScript включает раздел, посвященный ECMA-402.
