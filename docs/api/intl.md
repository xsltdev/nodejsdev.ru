---
title: Интернационализация
description: Возможности Node.js для интернационализации, сборка с ICU и проверка поддержки Intl
---

# Поддержка интернационализации

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/intl.html)

<!--introduced_in=v8.2.0-->

<!-- type=misc -->

У Node.js есть множество возможностей, облегчающих написание интернационализированных программ. Вот некоторые из них:

* Функции, чувствительные к локали или осведомлённые об Unicode, из [спецификации языка ECMAScript][ECMA-262]:
  * [`String.prototype.normalize()`][]
  * [`String.prototype.toLowerCase()`][]
  * [`String.prototype.toUpperCase()`][]
* Вся функциональность, описанная в [спецификации ECMAScript Internationalization API][ECMA-402] (она же ECMA-402):
  * объект [`Intl`][]
  * методы, чувствительные к локали, например [`String.prototype.localeCompare()`][] и [`Date.prototype.toLocaleString()`][]
* Поддержка [интернационализированных доменных имён][internationalized domain names] (IDN) в [парсере URL WHATWG][WHATWG URL parser]
* [`require('node:buffer').transcode()`][]
* Более точное редактирование строк в [REPL][]
* [`require('node:util').TextDecoder`][]
* [`RegExp` Unicode Property Escapes][]

Node.js и лежащий в основе движок V8 используют [International Components for Unicode (ICU)][ICU] для реализации этих возможностей в нативном коде на C/C++. Полный набор данных ICU поставляется с Node.js по умолчанию. Однако из‑за размера файла данных ICU при сборке или запуске Node.js доступны несколько вариантов настройки набора данных ICU.

## Опции сборки Node.js

Чтобы управлять использованием ICU в Node.js, при компиляции доступны четыре опции `configure`. Дополнительные сведения о сборке Node.js описаны в [BUILDING.md][].

* `--with-intl=none`/`--without-intl`
* `--with-intl=system-icu`
* `--with-intl=small-icu`
* `--with-intl=full-icu` (по умолчанию)

Обзор доступных возможностей Node.js и JavaScript для каждой опции `configure`:

| Возможность                              | `none`                            | `system-icu`                 | `small-icu`            | `full-icu` |
| ---------------------------------------- | --------------------------------- | ---------------------------- | ---------------------- | ---------- |
| [`String.prototype.normalize()`][]       | нет (функция — no-op)             | полная                       | полная                 | полная     |
| `String.prototype.to*Case()`             | полная                            | полная                       | полная                 | полная     |
| [`Intl`][]                               | нет (объект отсутствует)          | частичная/полная (зависит от ОС) | частичная (только английский) | полная |
| [`String.prototype.localeCompare()`][]   | частичная (без учёта локали)      | полная                       | полная                 | полная     |
| `String.prototype.toLocale*Case()`       | частичная (без учёта локали)      | полная                       | полная                 | полная     |
| [`Number.prototype.toLocaleString()`][]  | частичная (без учёта локали)      | частичная/полная (зависит от ОС) | частичная (только английский) | полная |
| `Date.prototype.toLocale*String()`       | частичная (без учёта локали)      | частичная/полная (зависит от ОС) | частичная (только английский) | полная |
| [Legacy URL Parser][]                    | частичная (без поддержки IDN)    | полная                       | полная                 | полная     |
| [WHATWG URL Parser][]                    | частичная (без поддержки IDN)    | полная                       | полная                 | полная     |
| [`require('node:buffer').transcode()`][] | нет (функция отсутствует)        | полная                       | полная                 | полная     |
| [REPL][]                                 | частичная (неточное редактирование строк) | полная                | полная                 | полная     |
| [`require('node:util').TextDecoder`][]   | частичная (базовые кодировки)     | частичная/полная (зависит от ОС) | частичная (только Unicode) | полная |
| [`RegExp` Unicode Property Escapes][]    | нет (ошибка недопустимого `RegExp`) | полная                    | полная                 | полная     |

Обозначение «(без учёта локали)» означает, что функция ведёт себя так же, как версия без `Locale`, если такая есть. Например, в режиме `none` поведение `Date.prototype.toLocaleString()` совпадает с `Date.prototype.toString()`.

### Отключить все возможности интернационализации (`none`)

Если выбрана эта опция, ICU отключён, и большинство перечисленных выше возможностей интернационализации в получившемся бинарнике `node` будут **недоступны**.

### Сборка с уже установленным ICU (`system-icu`)

Node.js может линковаться с ICU, уже установленным в системе. На большинстве дистрибутивов Linux ICU уже есть, и эта опция позволяет использовать тот же набор данных, что и другие компоненты ОС.

Функции, которым нужна только библиотека ICU, например [`String.prototype.normalize()`][] и [парсер URL WHATWG][WHATWG URL parser], при `system-icu` поддерживаются полностью. Возможности, которым дополнительно нужны локальные данные ICU, например [`Intl.DateTimeFormat`][], _могут_ быть полностью или частично поддержаны в зависимости от полноты данных ICU в системе.

### Встроить ограниченный набор данных ICU (`small-icu`)

В этом случае бинарник статически линкуется с ICU и включает подмножество данных ICU (обычно только английскую локаль) внутрь исполняемого файла `node`.

Функции, которым нужна только библиотека ICU, например [`String.prototype.normalize()`][] и [парсер URL WHATWG][WHATWG URL parser], при `small-icu` поддерживаются полностью. Возможности, которым дополнительно нужны локальные данные ICU, например [`Intl.DateTimeFormat`][], как правило работают только с английской локалью:

```js
const january = new Date(9e8);
const english = new Intl.DateTimeFormat('en', { month: 'long' });
const spanish = new Intl.DateTimeFormat('es', { month: 'long' });

console.log(english.format(january));
// Выводит "January"
console.log(spanish.format(january));
// Выводит "M01" или "January" при small-icu в зависимости от локали по умолчанию
// Ожидается вывод "enero"
```

Этот режим компромисс между возможностями и размером бинарника.

#### Поставка данных ICU во время выполнения

Если используется опция `small-icu`, дополнительные локальные данные можно подключить во время выполнения, чтобы JS-методы работали для всех локалей ICU. Пусть файл данных лежит в `/runtime/directory/with/dat/file`, тогда ICU может получить к нему доступ одним из способов:

* Опция `configure` `--with-icu-default-data-dir`:

  ```bash
  ./configure --with-icu-default-data-dir=/runtime/directory/with/dat/file --with-intl=small-icu
  ```

  При этом в бинарник встраивается только путь к каталогу данных по умолчанию. Сам файл данных будет загружаться во время выполнения из этого каталога.

* Переменная окружения [`NODE_ICU_DATA`][]:

  ```bash
  env NODE_ICU_DATA=/runtime/directory/with/dat/file node
  ```

* Параметр CLI [`--icu-data-dir`][]:

  ```bash
  node --icu-data-dir=/runtime/directory/with/dat/file
  ```

Если указано несколько вариантов, наивысший приоритет у параметра CLI `--icu-data-dir`, затем переменная окружения `NODE_ICU_DATA`, затем опция `configure` `--with-icu-default-data-dir`.

ICU умеет автоматически находить и загружать разные форматы данных, но данные должны соответствовать версии ICU, а файл — иметь корректное имя. Чаще всего файл данных называется `icudtX[bl].dat`, где `X` — целевая версия ICU, а `b` или `l` — порядок байт системы. Node.js не загрузится, если ожидаемый файл данных нельзя прочитать из указанного каталога. Имя файла данных для текущей версии Node.js можно вычислить так:

```js
`icudt${process.versions.icu.split('.')[0]}${os.endianness()[0].toLowerCase()}.dat`;
```

См. статью ["ICU Data"][] в ICU User Guide про другие поддерживаемые форматы и подробности про данные ICU в целом.

Модуль npm [full-icu][] сильно упрощает установку данных ICU: он определяет версию ICU у запущенного `node` и скачивает подходящий файл. После `npm i full-icu` файл будет в `./node_modules/full-icu`. Этот путь можно передать в `NODE_ICU_DATA` или `--icu-data-dir`, как показано выше, чтобы включить полную поддержку `Intl`.

### Встроить полный ICU (`full-icu`)

В этом случае бинарник статически линкуется с ICU и включает полный набор данных ICU. Такой бинарник не имеет внешних зависимостей по ICU и поддерживает все локали, но может быть довольно большим. Такое поведение по умолчанию, если не передавать флаг `--with-intl`. Официальные сборки тоже собираются в этом режиме.

## Определение поддержки интернационализации

Чтобы убедиться, что ICU включён вообще (`system-icu`, `small-icu` или `full-icu`), достаточно проверить наличие `Intl`:

```js
const hasICU = typeof Intl === 'object';
```

Альтернатива — проверка `process.versions.icu`: это свойство есть только при включённом ICU:

```js
const hasICU = typeof process.versions.icu === 'string';
```

Чтобы проверить поддержку неанглийской локали (т.е. `full-icu` или `system-icu`), хорошо подходит [`Intl.DateTimeFormat`][]:

```js
const hasFullICU = (() => {
  try {
    const january = new Date(9e8);
    const spanish = new Intl.DateTimeFormat('es', { month: 'long' });
    return spanish.format(january) === 'enero';
  } catch (err) {
    return false;
  }
})();
```

Для более подробных тестов поддержки `Intl` могут пригодиться:

* [btest402][]: обычно используют, чтобы проверить, что Node.js с поддержкой `Intl` собран корректно.
* [Test262][]: официальный набор тестов соответствия ECMAScript включает раздел, посвящённый ECMA-402.

["ICU Data"]: http://userguide.icu-project.org/icudata
[BUILDING.md]: https://github.com/nodejs/node/blob/HEAD/BUILDING.md
[ECMA-262]: https://tc39.github.io/ecma262/
[ECMA-402]: https://tc39.github.io/ecma402/
[ICU]: http://site.icu-project.org/
[Legacy URL parser]: url.md#legacy-url-api
[REPL]: repl.md#repl
[Test262]: https://github.com/tc39/test262/tree/HEAD/test/intl402
[WHATWG URL parser]: url.md#the-whatwg-url-api
[`--icu-data-dir`]: cli.md#--icu-data-dirfile
[`Date.prototype.toLocaleString()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
[`Intl.DateTimeFormat`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
[`Intl`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
[`NODE_ICU_DATA`]: cli.md#node_icu_datafile
[`Number.prototype.toLocaleString()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
[`RegExp` Unicode Property Escapes]: https://github.com/tc39/proposal-regexp-unicode-property-escapes
[`String.prototype.localeCompare()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
[`String.prototype.normalize()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
[`String.prototype.toLowerCase()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase
[`String.prototype.toUpperCase()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase
[`require('node:buffer').transcode()`]: buffer.md#buffertranscodesource-fromenc-toenc
[`require('node:util').TextDecoder`]: util.md#class-utiltextdecoder
[btest402]: https://github.com/srl295/btest402
[full-icu]: https://www.npmjs.com/package/full-icu
[internationalized domain names]: https://en.wikipedia.org/wiki/Internationalized_domain_name
