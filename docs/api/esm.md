---
title: ECMAScript modules
description: Модули ECMAScript - это официальный стандартный формат для упаковки кода JavaScript для повторного использования
---

# ECMAScript модули

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/esm.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

## Введение

Модули ECMAScript - это [официальный стандартный формат](https://tc39.github.io/ecma262/#sec-modules) для упаковки кода JavaScript для повторного использования. Модули определяются с помощью различных операторов [`импорт`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) и [`экспорт`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export).

Следующий пример модуля ES экспортирует функцию:

```js
// addTwo.mjs
function addTwo(num) {
    return num + 2;
}

export { addTwo };
```

Следующий пример модуля ES импортирует функцию из `addTwo.mjs`:

```js
// app.mjs
import { addTwo } from './addTwo.mjs';

// Prints: 6
console.log(addTwo(4));
```

Node.js полностью поддерживает модули ECMAScript в их нынешнем виде и обеспечивает взаимодействие между ними и оригинальным форматом модулей, [CommonJS](modules.md).

## Включение

Node.js имеет две системы модулей: [CommonJS](modules.md) модули и ECMAScript модули.

Авторы могут указать Node.js использовать загрузчик модулей ECMAScript через расширение файла `.mjs`, поле `package.json` [`"type"`](packages.md#type), или флаг [`--input-type`](cli.md#--input-typetype). Вне этих случаев Node.js будет использовать загрузчик модулей CommonJS. Более подробную информацию смотрите в разделе [Определение системы модулей](packages.md#determining-module-system).

## Пакеты

Этот раздел был перемещен в [Модули: Пакеты](packages.md).

## Спецификаторы `импорта`

### Терминология

Спецификатор оператора `импорта` - это строка после ключевого слова `from`, например, `'node:path'` в `import { sep } from 'node:path'`. Спецификаторы также используются в операторах `export from` и в качестве аргумента выражения `import()`.

Существует три типа спецификаторов:

-   _Относительные спецификаторы_, такие как `'./startup.js'` или `'../config.mjs'`. Они указывают путь относительно местоположения импортируемого файла. Для них всегда необходимо расширение файла.

-   _Голые спецификаторы_, такие как `некоторый пакет` или `некоторый пакет/shuffle`. Они могут ссылаться на основную точку входа пакета по имени пакета или на конкретный функциональный модуль внутри пакета с префиксом имени пакета, как показано в примерах соответственно. Указание расширения файла необходимо только для пакетов без поля [` exports`](packages.md#exports).

-   _Абсолютные спецификаторы_, такие как `'file:///opt/nodejs/config.js'`. Они прямо и однозначно ссылаются на полный путь.

Разрешение голых спецификаторов обрабатывается [алгоритмом разрешения модулей Node.js](#resolver-algorithm-specification). Все остальные разрешения спецификаторов всегда разрешаются только с помощью стандартной семантики разрешения относительных [URL](https://url.spec.whatwg.org/).

Как и в CommonJS, доступ к файлам модулей внутри пакетов можно получить, добавив путь к имени пакета, если только [`package.json`](packages.md#nodejs-packagejson-field-definitions) не содержит поле [`"exports"`](packages.md#exports), в этом случае доступ к файлам внутри пакетов можно получить только по путям, определенным в [`"exports"`](packages.md#exports).

Подробнее об этих правилах разрешения пакетов, которые применяются к голым спецификаторам в разрешении модулей Node.js, смотрите документацию [packages](packages.md).

### Обязательные расширения файлов

Расширение файла должно быть указано при использовании ключевого слова `import` для разрешения относительных или абсолютных спецификаторов. Индексы каталогов (например, `'./startup/index.js'`) также должны быть полностью указаны.

Это поведение соответствует тому, как `import` ведет себя в среде браузера, предполагая типично настроенный сервер.

### URLs

Модули ES разрешаются и кэшируются как URL-адреса. Это означает, что специальные символы должны быть [percent-encoded](url.md#percent-encoding-in-urls), такие как `#` с `%23` и `?` с `%3F`.

Поддерживаются схемы URL `file:`, `node:` и `data:`. Спецификатор типа `'https://example.com/app.js'` не поддерживается в Node.js, если только не используется [пользовательский HTTPS-загрузчик](#https-loader).

#### `file:` URLs

Модули загружаются несколько раз, если спецификатор `import`, используемый для их разрешения, имеет другой запрос или фрагмент.

```js
import './foo.mjs?query=1'; // загружает ./foo.mjs с запросом "?query=1"
import './foo.mjs?query=2'; // загружает ./foo.mjs с запросом "?query=2"
```

На корень тома можно ссылаться через `/`, `//` или `file:///`. Учитывая различия между [URL](https://url.spec.whatwg.org/) и разрешением пути (например, детали кодировки процентов), рекомендуется использовать [url.pathToFileURL](url.md#urlpathtofileurlpath) при импорте пути.

#### `data:` imports

[`data:` URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) поддерживаются для импорта со следующими MIME-типами:

-   `text/javascript` для модулей ES
-   `application/json` для JSON
-   `application/wasm` для Wasm

<!-- конец списка -->

```js
import 'data:text/javascript,console.log("hello!");';
import _ from 'data:application/json, "world!"' assert { type: "json" };
```

`data:` URL разрешают только [голые спецификаторы](#терминология) для встроенных модулей и [абсолютные спецификаторы](#терминология). Разрешение [относительных спецификаторов](#терминология) не работает, потому что `data:` не является [специальной схемой](https://url.spec.whatwg.org/#special-scheme). Например, попытка загрузить `./foo` из `data:text/javascript,import "./foo";` не удается, потому что не существует понятия относительного разрешения для `data:` URL.

#### `node:` imports

URL-адреса `node:` поддерживаются как альтернативный способ загрузки встроенных модулей Node.js. Эта схема URL позволяет ссылаться на встроенные модули с помощью допустимых абсолютных строк URL.

```js
import fs from 'node:fs/promises';
```

## Утверждения импорта

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальный

Предложение [Import Assertions proposal](https://github.com/tc39/proposal-import-assertions) добавляет встроенный синтаксис для операторов импорта модулей, чтобы передавать дополнительную информацию наряду со спецификатором модуля.

```js
import fooData from "./foo.json" assert { type: "json" };


const { default: barData } = await import("./bar.json", { assert: { type: "json" } });
```

Node.js поддерживает следующие значения `type`, для которых утверждение является обязательным:

<table>
<thead>
<tr class="header">
<th>Assertion <code>type</code></th>
<th>Needed for</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>'json'</code></td>
<td><a href="#json-modules">JSON modules</a></td>
</tr>
</tbody>
</table>

## Встроенные модули

[Core modules](modules.md#core-modules) предоставляют именованные экспорты своих публичных API. Также предоставляется экспорт по умолчанию, который является значением экспорта CommonJS. Экспорт по умолчанию можно использовать, в частности, для модификации именованных экспортов. Именованные экспорты встроенных модулей обновляются только вызовом [`module.syncBuiltinESMExports()`](module.md#modulesyncbuiltinesmexports).

```js
import EventEmitter from 'node:events';
const e = new EventEmitter();
```

```js
import { readFile } from 'node:fs';
readFile('./foo.txt', (err, source) => {
    if (err) {
        console.error(err);
    } else {
        console.log(source);
    }
});
```

```js
import fs, { readFileSync } from "node:fs";
import { syncBuiltinESMExports } из "node:module";
import { Buffer } from "node:buffer";


fs.readFileSync = () => Buffer.from("Hello, ESM");
syncBuiltinESMExports();


fs.readFileSync === readFileSync;
```

## выражения `import()`

[Dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) поддерживается как в модулях CommonJS, так и в модулях ES. В модулях CommonJS его можно использовать для загрузки модулей ES.

## `import.meta`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Мета-свойство `import.meta` представляет собой `объект`, содержащий следующие свойства.

### `import.meta.url`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютный `файл:` URL модуля.

Определяется точно так же, как и в браузерах, предоставляя URL текущего файла модуля.

Это позволяет использовать такие полезные шаблоны, как относительная загрузка файлов:

```js
import { readFileSync } from 'node:fs';
const buffer = readFileSync(
    new URL('./data.proto', import.meta.url)
);
```

### `import.meta.resolve(specifier[, parent])`

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальная

Эта функция доступна только при включенном флаге команды `--experimental-import-meta-resolve`.

-   `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Спецификатор модуля для разрешения относительно `parent`.
-   `parent` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Абсолютный URL родительского модуля для преобразования. Если не указан, то по умолчанию используется значение `import.meta.url`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Предоставляет функцию разрешения относительно модуля, относящуюся к каждому модулю и возвращающую строку URL.

```js
const dependencyAsset = await import.meta.resolve(
    'component-lib/asset.css'
);
```

`import.meta.resolve` также принимает второй аргумент, который является родительским модулем, из которого нужно выполнить resolve:

```js
await import.meta.resolve('./dep', import.meta.url);
```

Эта функция является асинхронной, поскольку модульный резолвер ES в Node.js может быть асинхронным.

## Взаимодействие с CommonJS

### `импортные` утверждения

Оператор `импорта` может ссылаться на модуль ES или модуль CommonJS. Операторы `импорта` разрешены только в модулях ES, но в CommonJS для загрузки модулей ES поддерживаются динамические выражения [`import()`](#import-expressions).

При импорте [модулей CommonJS](#commonjs-namespaces) в качестве экспорта по умолчанию предоставляется объект `module.exports`. Могут быть доступны именованные экспорты, предоставляемые статическим анализом в качестве удобства для лучшей совместимости с экосистемой.

### `require`

Модуль CommonJS `require` всегда рассматривает файлы, на которые он ссылается, как CommonJS.

Использование `require` для загрузки модуля ES не поддерживается, поскольку модули ES имеют асинхронное выполнение. Вместо этого используйте [`import()`](#import-expressions) для загрузки модуля ES из модуля CommonJS.

### Пространства имен CommonJS

Модули CommonJS состоят из объекта `module.exports`, который может быть любого типа.

При импорте модуля CommonJS он может быть надежно импортирован с помощью стандартного импорта модуля ES или соответствующего сахарного синтаксиса:

```js
import { default as cjs } from 'cjs';

// Следующий оператор импорта является "синтаксическим сахаром" (эквивалентным, но более сладким)
// для `{ default as cjsSugar }` в вышеприведенном утверждении импорта:
import cjsSugar from 'cjs';

console.log(cjs);
console.log(cjs === cjsSugar);
// Опечатки:
// <module.exports>
// true
```

Представление ECMAScript Module Namespace модуля CommonJS всегда является пространством имен с ключом экспорта `default`, указывающим на значение CommonJS `module.exports`.

Этот экзотический объект пространства имен модуля можно непосредственно наблюдать либо при использовании `import * as m from 'cjs'`, либо при динамическом импорте:

```js
import * as m from 'cjs';
console.log(m);
console.log(m === (await import('cjs')));
// Prints:
// [Module] { default: <module.exports> }
// true
```

Для лучшей совместимости с существующим использованием в экосистеме JS, Node.js дополнительно пытается определить именованные экспорты CommonJS каждого импортированного модуля CommonJS, чтобы предоставить их как отдельные экспорты модуля ES, используя процесс статического анализа.

Например, рассмотрим модуль CommonJS, написанный:

```cjs
// cjs.cjs
exports.name = 'exported';
```

Предыдущий модуль поддерживает именованный импорт в модулях ES:

```js
import { name } from './cjs.cjs';
console.log(name);
// Печатает: 'exported'

import cjs from './cjs.cjs';
console.log(cjs);
// Prints: { name: 'exported' }

import * as m from './cjs.cjs';
console.log(m);
// Prints: [Module] { default: { name: 'exported' }, name: 'exported' }
```

Как видно из последнего примера регистрации экзотического объекта пространства имен модуля, экспорт `name` копируется из объекта `module.exports` и устанавливается непосредственно в пространство имен модуля ES при импорте модуля.

Обновления живой привязки или новые экспорты, добавленные в `module.exports`, не обнаруживаются для этих именованных экспортов.

Обнаружение именованных экспортов основано на общих синтаксических шаблонах, но не всегда правильно определяет именованные экспорты. В этих случаях использование формы импорта по умолчанию, описанной выше, может быть лучшим вариантом.

Обнаружение именованного экспорта охватывает многие общие шаблоны экспорта, шаблоны реэкспорта, а также выходы инструментов сборки и транспилятора. Точная семантика реализована в [cjs-module-lexer](https://github.com/nodejs/cjs-module-lexer/tree/1.2.2).

### Различия между модулями ES и CommonJS

#### Нет `require`, `exports` или `module.exports`

В большинстве случаев для загрузки модулей CommonJS можно использовать модуль ES `import`.

При необходимости функция `require` может быть создана в модуле ES с помощью [`module.createRequire()`](module.md#modulecreaterequirefilename).

#### Нет `__filename` или `__dirname`

Эти переменные CommonJS недоступны в модулях ES.

Варианты использования `__filename` и `__dirname` могут быть воспроизведены через [`import.meta.url`](#importmetaurl).

#### Нет загрузки аддонов

[Addons](addons.md) в настоящее время не поддерживаются импортом модулей ES.

Вместо этого они могут быть загружены с помощью [`module.createRequire()`](module.md#modulecreaterequirefilename) или [`process.dlopen`](process.md#processdlopenmodule-filename-flags).

#### Нет `require.resolve`

Относительное разрешение может быть обработано через `new URL('./local', import.meta.url)`.

Для полной замены `require.resolve` существует экспериментальный API [`import.meta.resolve`](#importmetaresolvespecifier-parent).

В качестве альтернативы можно использовать `module.createRequire()`.

#### Нет `NODE_PATH`

`NODE_PATH` не является частью разрешения спецификаторов `импорта`. Пожалуйста, используйте симлинки, если такое поведение желательно.

#### Нет `require.extensions`

`require.extensions` не используется `import`. Ожидается, что крючки загрузчика смогут обеспечить этот рабочий процесс в будущем.

#### Нет `require.cache`

`require.cache` не используется `import`, поскольку загрузчик модулей ES имеет свой собственный отдельный кэш.

## Модули JSON

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальный

Файлы JSON могут быть упомянуты в `import`:

```js
import packageConfig from "./package.json" assert { type: "json" };
```

Синтаксис `assert { type: 'json' }` является обязательным; смотрите [Import Assertions](#import-assertions).

Импортируемый JSON раскрывает только экспорт `default`. Поддержка именованных экспортов отсутствует. Во избежание дублирования создается запись в кэше CommonJS. Тот же объект возвращается в CommonJS, если модуль JSON уже был импортирован по тому же пути.

## Модули Wasm.

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальный

Импорт модулей WebAssembly поддерживается под флагом `--experimental-wasm-modules`, что позволяет импортировать любые файлы `.wasm` как обычные модули, поддерживая при этом импорт их модулей.

Эта интеграция соответствует [ES Module Integration Proposal for WebAssembly](https://github.com/webassembly/esm-integration).

Например, `index.mjs`, содержащий:

```js
import * as M from './module.wasm';
console.log(M);
```

выполненные под:

```bash
node --experimental-wasm-modules index.mjs
```

обеспечит интерфейс экспорта для инстанцирования `module.wasm`.

## Верхний уровень `await`

Ключевое слово `await` можно использовать в теле верхнего уровня модуля ECMAScript.

Предположим, что `a.mjs` с

```js
export const five = await Promise.resolve(5);
```

И `b.mjs` с

```js
import { five } from './a.mjs';

console.log(five); // Логирует `5`
```

```bash
node b.mjs # works
```

Если выражение верхнего уровня `await` никогда не разрешится, процесс `node` завершится с `13` [кодом состояния](process.md#exit-codes).

```js
import { spawn } from 'node:child_process';
import { execPath } from 'node:process';

spawn(execPath, [
    '--input-type=module',
    '--eval',
    // Never-resolving Promise:
    'await new Promise(() => {})',
]).once('exit', (code) => {
    console.log(code); // Запись в журнал `13`
});
```

## Импорт HTTPS и HTTP

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальный

Импорт сетевых модулей с использованием `https:` и `http:` поддерживается под флагом `--experimental-network-imports`. Это позволяет импортировать модули, подобные веб-браузеру, в Node.js с некоторыми отличиями, связанными со стабильностью приложения и проблемами безопасности, которые отличаются при работе в привилегированной среде, а не в песочнице браузера.

### Импорт ограничен HTTP/1

Автоматическое согласование протоколов для HTTP/2 и HTTP/3 пока не поддерживается.

### HTTP ограничен адресами loopback

`http:` уязвим для атак типа "человек посередине" и не может использоваться для адресов за пределами IPv4-адреса `127.0.0.0/8` (`127.0.0.1` - `127.255.255.255`) и IPv6-адреса `::1`. Поддержка `http:` предназначена для использования в локальных разработках.

### Аутентификация никогда не отправляется на сервер назначения.

Заголовки `Authorization`, `Cookie` и `Proxy-Authorization` не отправляются на сервер. Избегайте включения информации о пользователе в части импортируемых URL. В настоящее время разрабатывается модель безопасности для безопасного использования этих заголовков на сервере.

### CORS никогда не проверяется на сервере назначения

CORS разработан для того, чтобы позволить серверу ограничить потребителей API определенным набором хостов. Это не поддерживается, так как не имеет смысла для реализации на базе сервера.

### Невозможно загрузить несетевые зависимости.

Эти модули не могут получить доступ к другим модулям, которые не работают через `http:` или `https:`. Чтобы получить доступ к локальным модулям и избежать проблем с безопасностью, передавайте ссылки на локальные зависимости:

```mjs
// file.mjs
import worker_threads from 'node:worker_threads';
import {
    configure,
    resize,
} from 'https://example.com/imagelib.mjs';
configure({ worker_threads });
```

```mjs
// https://example.com/imagelib.mjs
let worker_threads;
export function configure(opts) {
    worker_threads = opts.worker_threads;
}
export function resize(img, size) {
    // Выполняем изменение размера в потоке worker_thread, чтобы избежать блокировки основного потока
}
```

### Загрузка по сети не включена по умолчанию.

Пока что флаг `--experimental-network-imports` необходим для включения загрузки ресурсов через `http:` или `https:`. В будущем для обеспечения этого будет использоваться другой механизм. Opt-in требуется для предотвращения случайного использования переходных зависимостей с потенциально изменяемым состоянием, что может повлиять на надежность приложений Node.js.

## Грузчики

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальный

> В настоящее время этот API находится в стадии разработки и будет меняться.

Чтобы настроить разрешение модулей по умолчанию, можно опционально предоставить крючки загрузчика через аргумент `--experimental-loader ./loader-name.mjs` в Node.js.

При использовании хуков они применяются к каждому последующему загрузчику, точке входа и всем вызовам `import`. Они не применяются к вызовам `require`; они по-прежнему следуют правилам [CommonJS](modules.md).

Загрузчики следуют шаблону `--require`:

```console
node \
  --experimental-loader unpkg \
  --experimental-loader http-to-https \
  --experimental-loader cache-buster
```

Они вызываются в следующей последовательности: `cache-buster` вызывает `http-to-https`, который вызывает `unpkg`.

### Крючки

Хуки являются частью цепочки, даже если эта цепочка состоит только из одного пользовательского (user-provided) хука и хука по умолчанию, который присутствует всегда. Функции хуков вложены друг в друга: каждая из них всегда должна возвращать простой объект, а цепочка происходит в результате вызова каждой функцией функции `next<hookName>()`, которая является ссылкой на последующий хук загрузчика.

Хук, возвращающий значение, в котором отсутствует необходимое свойство, вызывает исключение. Хук, который возвращается без вызова `next<hookName>()` _и_ без возврата `shortCircuit: true`, также вызывает исключение. Эти ошибки призваны помочь предотвратить непреднамеренный разрыв цепи.

#### `resolve(specifier, context, nextResolve)`

> В настоящее время API загрузчиков перерабатывается. Этот хук может исчезнуть или его сигнатура может измениться. Не полагайтесь на API, описанный ниже.

-   `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `контекст` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `условия` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Условия экспорта соответствующего `package.json`.
    -   `importAssertions` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект, пары ключ-значение которого представляют утверждения для импортируемого модуля
    -   `parentURL` {string|undefined} Модуль, импортирующий данный модуль, или undefined, если это точка входа Node.js
-   `nextResolve` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Следующий хук `resolve` в цепочке, или хук `resolve` по умолчанию Node.js после последнего пользовательского хука `resolve`.
    -   `спецификатор` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `формат` {string|null|undefined} Подсказка для крючка загрузки (может быть проигнорирована) `'builtin' | 'commonjs' | 'json' | 'module' | 'wasm'`.
    -   `importAssertions` {Object|undefined} Утверждения импорта для использования при кэшировании модуля (необязательно; если исключить, то будут использоваться входные данные)
    -   `shortCircuit` {undefined|boolean} Сигнал о том, что этот хук намерен прервать цепочку хуков `resolve`. **По умолчанию:** `false`.
    -   `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютный URL, к которому разрешается данный вход.

Цепочка хуков `resolve` отвечает за указание Node.js, где найти и как кэшировать заданный оператор `import` или выражение. По желанию она может возвращать его формат (например, `'module'`) в качестве подсказки для хука `load`. Если формат не указан, крючок `load` в конечном итоге отвечает за предоставление окончательного значения `формата` (и он может игнорировать подсказку, предоставленную `resolve`); если `resolve` предоставляет `формат`, требуется пользовательский крючок `load`, даже если только для передачи значения крючку Node.js по умолчанию `load`.

Утверждения типов импорта являются частью ключа кэша для сохранения загруженных модулей во внутреннем кэше модулей. Хук `resolve` отвечает за возврат объекта `importAssertions`, если модуль должен быть кэширован с утверждениями, отличными от тех, что присутствуют в исходном коде.

Свойство `conditions` в `context` - это массив условий [package exports conditions](packages.md#conditional-exports), которые применяются к данному запросу разрешения. Их можно использовать для поиска условных сопоставлений в других местах или для изменения списка при вызове логики разрешения по умолчанию.

Текущие условия [package exports conditions](packages.md#conditional-exports) всегда находятся в массиве `context.conditions`, передаваемом в хук. Чтобы гарантировать _дефолтное поведение разрешения спецификатора модуля Node.js_ при вызове `defaultResolve`, массив `context.conditions`, переданный ему, _должен_ включать _все_ элементы массива `context.conditions`, изначально переданного в хук `resolve`.

```js
export async function resolve(
    specifier,
    context,
    nextResolve
) {
    const { parentURL = null } = context;

    if (Math.random() > 0.5) {
        // Некоторое условие.
        // Для некоторых или всех спецификаторов сделайте некоторую пользовательскую логику для разрешения.
        // Всегда возвращайте объект вида {url: <строка>}.
        return {
            shortCircuit: true,
            url: parentURL
                ? new URL(specifier, parentURL).href
                : new URL(specifier).href,
        };
    }

    if (Math.random() < 0.5) {
        // Еще одно условие.
        // При вызове `defaultResolve` аргументы могут быть изменены. В данном
        // случае это добавление еще одного значения для соответствия условному экспорту.
        return nextResolve(specifier, {
            контекст,
            условия: [
                ...context.conditions,
                'another-condition',
            ],
        });
    }

    // Откладываем до следующего хука в цепочке, которым будет resolve по умолчанию в Node.
    // Node.js resolve по умолчанию, если это последний указанный пользователем загрузчик.
    return nextResolve(specifier);
}
```

#### `load(url, context, nextLoad)`

> API загрузчиков находится в стадии переработки. Этот хук может исчезнуть или его сигнатура может измениться. Не полагайтесь на API, описанный ниже.

> В предыдущей версии этого API эта функция была разделена на 3 отдельных, ныне устаревших хука (`getFormat`, `getSource` и `transformSource`).

-   `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) URL, возвращаемый цепочкой `resolve`.
-   `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `conditions` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Условия экспорта соответствующего `package.json`.
    -   `формат` {string|null|undefined} Формат, опционально предоставляемый цепочкой хуков `resolve`.
    -   `importAssertions` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `nextLoad` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Следующий `load` хук в цепочке, или `load` хук по умолчанию Node.js после последнего пользовательского `load` хука.
    -   `спецификатор` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `формат` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `shortCircuit` {undefined|boolean} Сигнал о том, что этот хук намерен прервать цепочку хуков `resolve`. **По умолчанию:** `false`.
    -   `source` {string|ArrayBuffer|TypedArray} Источник для оценки Node.js

Хук `load` предоставляет возможность определить пользовательский метод определения того, как URL должен быть интерпретирован, получен и разобран. Он также отвечает за проверку утверждения об импорте.

Конечное значение `format` должно быть одним из следующих:

<table>
<thead>
<tr class="header">
<th><code>format</code></th>
<th>Description</th>
<th>Acceptable types for <code>source</code> returned by <code>load</code></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>'builtin'</code></td>
<td>Load a Node.js builtin module</td>
<td>Not applicable</td>
</tr>
<tr class="even">
<td><code>'commonjs'</code></td>
<td>Load a Node.js CommonJS module</td>
<td>Not applicable</td>
</tr>
<tr class="odd">
<td><code>'json'</code></td>
<td>Load a JSON file</td>
<td>{ <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String"><code>string</code></a>, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer"><code>ArrayBuffer</code></a>, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray"><code>TypedArray</code></a> }</td>
</tr>
<tr class="even">
<td><code>'module'</code></td>
<td>Load an ES module</td>
<td>{ <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String"><code>string</code></a>, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer"><code>ArrayBuffer</code></a>, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray"><code>TypedArray</code></a> }</td>
</tr>
<tr class="odd">
<td><code>'wasm'</code></td>
<td>Load a WebAssembly module</td>
<td>{ <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer"><code>ArrayBuffer</code></a>, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray"><code>TypedArray</code></a> }</td>
</tr>
</tbody>
</table>

Значение `source` игнорируется для типа `'builtin'`, потому что в настоящее время невозможно заменить значение встроенного (core) модуля Node.js. Значение `source` игнорируется для типа `'commonjs'`, потому что загрузчик модуля CommonJS не предоставляет механизм для загрузчика модуля ES для переопределения возвращаемого значения [модуля CommonJS](#commonjs-namespaces). Это ограничение может быть преодолено в будущем.

> **Кавэат**: ESM `load` hook и namespaced exports из модулей CommonJS несовместимы. Попытка использовать их вместе приведет к получению пустого объекта при импорте. Эта проблема может быть решена в будущем.

> Все эти типы соответствуют классам, определенным в ECMAScript.

-   Конкретный объект [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) является объектом [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer).
-   Конкретным объектом [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) является [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array).

Если исходное значение текстового формата (например, `'json'`, `'module'`) не является строкой, оно преобразуется в строку с помощью [`util.TextDecoder`](util.md#class-utiltextdecoder).

Хук `load` предоставляет возможность определить пользовательский метод для получения исходного кода спецификатора модуля ES. Это позволит загрузчику потенциально избежать чтения файлов с диска. Его также можно использовать для сопоставления нераспознанного формата с поддерживаемым, например, `yaml` с `module`.

```js
export async function load(url, context, nextLoad) {
    const { format } = context;

    if (Math.random() > 0.5) {
        // Some condition
        /*
      For some or all URLs, do some custom logic for retrieving the source.
      Always return an object of the form {
        format: <string>,
        source: <string|buffer>,
      }.
    */
        return {
            format,
            shortCircuit: true,
            source: '...',
        };
    }

    // Defer to the next hook in the chain.
    return nextLoad(url);
}
```

В более продвинутом сценарии это также можно использовать для преобразования неподдерживаемого источника в поддерживаемый (см. [Примеры](#examples) ниже).

#### `globalPreload()`

> В настоящее время API загрузчиков перерабатывается. Этот хук может исчезнуть или его сигнатура может измениться. Не полагайтесь на API, описанный ниже.

> В предыдущей версии этого API этот хук назывался `getGlobalPreloadCode`.

-   `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Информация для помощи коду предварительной загрузки
    -   `port` {MessagePort}
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Код для запуска перед стартом приложения

Иногда может потребоваться запустить некоторый код внутри той же глобальной области видимости, в которой запускается приложение. Этот хук позволяет вернуть строку, которая будет запущена как скрипт в небрежном режиме при запуске приложения.

Подобно тому, как работают обертки CommonJS, код запускается в неявной области видимости функции. Единственным аргументом является `require`-подобная функция, которая может быть использована для загрузки встроенных модулей, таких как "fs": `getBuiltin(request: string)`.

Если коду нужны более продвинутые функции `require`, он должен создать свой собственный `require`, используя `module.createRequire()`.

```js
export function globalPreload(context) {
    return `\
globalThis.someInjectedProperty = 42;
console.log('Я только что установил некоторые глобальные свойства!');


const { createRequire } = getBuiltin('module');
const { cwd } = getBuiltin('process');


const require = createRequire(cwd() + '/<preload>');
// [...]
`;
}
```

Для того чтобы обеспечить связь между приложением и загрузчиком, коду предварительной загрузки предоставляется еще один аргумент: `port`. Он доступен в качестве параметра хука загрузчика и внутри исходного текста, возвращаемого хуком. Необходимо соблюдать некоторую осторожность, чтобы правильно вызвать [`port.ref()`](https://nodejs.org/dist/latest-v17.x/docs/api/worker_threads.html#portref) и [`port.unref()`](https://nodejs.org/dist/latest-v17.x/docs/api/worker_threads.html#portunref), чтобы предотвратить нахождение процесса в состоянии, в котором он не сможет нормально закрыться.

```js
/**
 * В этом примере контекст приложения посылает сообщение загрузчику.
 * и отправляет сообщение обратно в контекст приложения.
 */
export function globalPreload({ port }) {
    port.onmessage = (evt) => {
        port.postMessage(evt.data);
    };
    return `\
    port.postMessage('console.log("Я сходил в Loader и обратно");');
    port.onmessage = (evt) => {
      eval(evt.data);
    };
  `;
}
```

### Примеры

Различные крючки загрузчика могут быть использованы вместе для выполнения широкой настройки поведения загрузки и оценки кода Node.js.

#### HTTPS-загрузчик

В текущем Node.js спецификаторы, начинающиеся с `https://`, являются экспериментальными (см. [HTTPS и HTTP imports](#https-and-http-imports)).

Приведенный ниже загрузчик регистрирует хуки, чтобы обеспечить элементарную поддержку таких спецификаторов. Хотя это может показаться значительным улучшением основной функциональности Node.js, есть существенные недостатки фактического использования этого загрузчика: производительность намного ниже, чем при загрузке файлов с диска, нет кэширования, и нет безопасности.

```js
// https-loader.mjs
import { get } from 'node:https';

export function resolve(specifier, context, nextResolve) {
    const { parentURL = null } = context;

    // Обычно Node.js ошибается на спецификаторах, начинающихся с 'https://', поэтому
    // этот хук перехватывает их и преобразует в абсолютные URL-адреса, которые будут
    // передаются последующим хукам ниже.
    if (specifier.startsWith('https://')) {
        return {
            shortCircuit: true,
            url: specifier,
        };
    } else if (
        parentURL &&
        parentURL.startsWith('https://')
    ) {
        return {
            shortCircuit: true,
            url: new URL(specifier, parentURL).href,
        };
    }

    // Пусть Node.js обрабатывает все остальные спецификаторы.
    return nextResolve(specifier);
}

export function load(url, context, nextLoad) {
    // Чтобы JavaScript загружался по сети, нам нужно получить и
    // вернуть его.
    if (url.startsWith('https://')) {
        return new Promise((resolve, reject) => {
            get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () =>
                    resolve({
                        // В этом примере предполагается, что весь JavaScript, предоставляемый сетью, является модулем ES.
                        // код.
                        format: 'module',
                        shortCircuit: true,
                        source: data,
                    })
                );
            }).on('error', (err) => reject(err));
        });
    }

    // Пусть Node.js обрабатывает все остальные URL.
    return nextLoad(url);
}
```

```js
// main.mjs
import { VERSION } from 'https://coffeescript.org/browser-compiler-modern/coffeescript.js';

console.log(VERSION);
```

С предыдущим загрузчиком выполнение `node --experimental-loader ./https-loader.mjs ./main.mjs` выводит текущую версию CoffeeScript для модуля по URL в `main.mjs`.

#### Transpiler loader

Исходные тексты в форматах, которые Node.js не понимает, могут быть преобразованы в JavaScript с помощью хука [`load`](#loadurl-context-nextload). Однако прежде чем этот хук будет вызван, хук [`resolve`](#resolvespecifier-context-nextresolve) должен сказать Node.js, чтобы он не выдавал ошибку при неизвестных типах файлов.

Это менее эффективно, чем транспонирование исходных файлов перед запуском Node.js; загрузчик с транспонированием следует использовать только в целях разработки и тестирования.

```js
// coffeescript-loader.mjs
import { readFile } from 'node:fs/promises';
import {
    dirname,
    extname,
    resolve as resolvePath,
} from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import CoffeeScript from 'coffeescript';

const baseURL = pathToFileURL(`${cwd()}/`).href;

// CoffeeScript files end in .coffee, .litcoffee, or .coffee.md.
const extensionsRegex = /\.coffee$|\.litcoffee$|\.coffee\.md$/;

export async function resolve(
    specifier,
    context,
    nextResolve
) {
    if (extensionsRegex.test(specifier)) {
        const { parentURL = baseURL } = context;

        // Node.js normally errors on unknown file extensions, so return a URL for
        // specifiers ending in the CoffeeScript file extensions.
        return {
            shortCircuit: true,
            url: new URL(specifier, parentURL).href,
        };
    }

    // Let Node.js handle all other specifiers.
    return nextResolve(specifier);
}

export async function load(url, context, nextLoad) {
    if (extensionsRegex.test(url)) {
        // Now that we patched resolve to let CoffeeScript URLs through, we need to
        // tell Node.js what format such URLs should be interpreted as. Because
        // CoffeeScript transpiles into JavaScript, it should be one of the two
        // JavaScript formats: 'commonjs' or 'module'.

        // CoffeeScript files can be either CommonJS or ES modules, so we want any
        // CoffeeScript file to be treated by Node.js the same as a .js file at the
        // same location. To determine how Node.js would interpret an arbitrary .js
        // file, search up the file system for the nearest parent package.json file
        // and read its "type" field.
        const format = await getPackageType(url);
        // When a hook returns a format of 'commonjs', `source` is ignored.
        // To handle CommonJS files, a handler needs to be registered with
        // `require.extensions` in order to process the files with the CommonJS
        // loader. Avoiding the need for a separate CommonJS handler is a future
        // enhancement planned for ES module loaders.
        if (format === 'commonjs') {
            return {
                format,
                shortCircuit: true,
            };
        }

        const { source: rawSource } = await nextLoad(url, {
            ...context,
            format,
        });
        // This hook converts CoffeeScript source code into JavaScript source code
        // for all imported CoffeeScript files.
        const transformedSource = coffeeCompile(
            rawSource.toString(),
            url
        );

        return {
            format,
            shortCircuit: true,
            source: transformedSource,
        };
    }

    // Let Node.js handle all other URLs.
    return nextLoad(url);
}

async function getPackageType(url) {
    // `url` is only a file path during the first iteration when passed the
    // resolved url from the load() hook
    // an actual file path from load() will contain a file extension as it's
    // required by the spec
    // this simple truthy check for whether `url` contains a file extension will
    // work for most projects but does not cover some edge-cases (such as
    // extensionless files or a url ending in a trailing space)
    const isFilePath = !!extname(url);
    // If it is a file path, get the directory it's in
    const dir = isFilePath
        ? dirname(fileURLToPath(url))
        : url;
    // Compose a file path to a package.json in the same directory,
    // which may or may not exist
    const packagePath = resolvePath(dir, 'package.json');
    // Try to read the possibly nonexistent package.json
    const type = await readFile(packagePath, {
        encoding: 'utf8',
    })
        .then((filestring) => JSON.parse(filestring).type)
        .catch((err) => {
            if (err?.code !== 'ENOENT') console.error(err);
        });
    // Ff package.json existed and contained a `type` field with a value, voila
    if (type) return type;
    // Otherwise, (if not at the root) continue checking the next directory up
    // If at the root, stop and return false
    return (
        dir.length > 1 &&
        getPackageType(resolvePath(dir, '..'))
    );
}
```

```coffee
# main.coffee
import { scream } from './scream.coffee'
console.log scream 'hello, world'


import { version } from 'node:process'
console.log "Brought to you by Node.js version #{version}"
```

```coffee
# scream.coffee
export scream = (str) -> str.toUpperCase()
```

С предыдущим загрузчиком выполнение `node --experimental-loader ./coffeescript-loader.mjs main.coffee` приводит к тому, что `main.coffee` превращается в JavaScript после загрузки его исходного кода с диска, но до того, как Node.js выполнит его; и так далее для любых файлов `.coffee`, `.litcoffee` или `.coffee.md`, на которые ссылаются операторы `import` любого загруженного файла.

## Алгоритм разрешения

### Особенности

Резольвер обладает следующими свойствами:

-   Разрешение на основе FileURL, как это используется в модулях ES
-   Поддержка загрузки встроенных модулей
-   Относительное и абсолютное разрешение URL
-   Отсутствие расширений по умолчанию
-   Отсутствие папки mains
-   Поиск разрешения пакетов с голыми спецификаторами через node_modules

### Алгоритм разрешителя

Алгоритм загрузки спецификатора модуля ES задается с помощью метода **ESM_RESOLVE**, приведенного ниже. Он возвращает разрешенный URL для спецификатора модуля относительно родительскогоURL.

Алгоритм определения формата модуля для разрешенного URL предоставляется методом **ESM_FORMAT**, который возвращает уникальный формат модуля для любого файла. Формат _"module"_ возвращается для модуля ECMAScript, а формат _"commonjs"_ используется для указания загрузки через старый загрузчик CommonJS. Дополнительные форматы, такие как _"addon"_, могут быть расширены в будущих обновлениях.

В следующих алгоритмах все ошибки подпрограмм распространяются как ошибки этих подпрограмм верхнего уровня, если не указано иное.

_defaultConditions_ - это массив имен условного окружения, `["node", "import"]`.

Резольвер может выдать следующие ошибки:

-   _Invalid Module Specifier_: Спецификатор модуля является недопустимым URL, именем пакета или спецификатором подпути пакета.
-   _Invalid Package Configuration_: конфигурация package.json недопустима или содержит недопустимую конфигурацию.
-   _Неверная цель пакета_: Экспорт или импорт пакета определяет целевой модуль для пакета, который является недопустимым типом или строковым целевым модулем.
-   _Путь пакета не экспортирован_: Экспорт пакетов не определяет или не разрешает целевой подпуть в пакете для данного модуля.
-   _Импорт пакета не определен_: Импорт пакета не определяет спецификатор.
-   _Module Not Found_: Запрашиваемый пакет или модуль не существует.
-   _Unsupported Directory Import_: Разрешенный путь соответствует каталогу, который не является поддерживаемой целью для импорта модулей.

### Спецификация алгоритма резольвера

**ESM_RESOLVE**(_specifier_, _parentURL_)

> 1.  Let _resolved_ be **undefined**.
> 2.  If _specifier_ is a valid URL, then
>     1.  Set _resolved_ to the result of parsing and reserializing _specifier_ as a URL.
> 3.  Otherwise, if _specifier_ starts with _“/”_, _“./”_, or _“../”_, then
>     1.  Set _resolved_ to the URL resolution of _specifier_ relative to _parentURL_.
> 4.  Otherwise, if _specifier_ starts with _“\#”_, then
>     1.  Set _resolved_ to the result of **PACKAGE_IMPORTS_RESOLVE**(_specifier_, _parentURL_, _defaultConditions_).
> 5.  Otherwise,
>     1.  Note: _specifier_ is now a bare specifier.
>     2.  Set _resolved_ the result of **PACKAGE_RESOLVE**(_specifier_, _parentURL_).
> 6.  Let _format_ be **undefined**.
> 7.  If _resolved_ is a _“file:”_ URL, then
>     1.  If _resolved_ contains any percent encodings of _“/”_ or _“\\”_ (_“%2F”_ and _“%5C”_ respectively), then
>         1.  Throw an _Invalid Module Specifier_ error.
>     2.  If the file at _resolved_ is a directory, then
>         1.  Throw an _Unsupported Directory Import_ error.
>     3.  If the file at _resolved_ does not exist, then
>         1.  Throw a _Module Not Found_ error.
>     4.  Set _resolved_ to the real path of _resolved_, maintaining the same URL querystring and fragment components.
>     5.  Set _format_ to the result of **ESM_FILE_FORMAT**(_resolved_).
> 8.  Otherwise,
>     1.  Set _format_ the module format of the content type associated with the URL _resolved_.
> 9.  Load _resolved_ as module format, _format_.

**PACKAGE_RESOLVE**(_packageSpecifier_, _parentURL_)

> 1.  Let _packageName_ be **undefined**.
> 2.  If _packageSpecifier_ is an empty string, then
>     1.  Throw an _Invalid Module Specifier_ error.
> 3.  If _packageSpecifier_ is a Node.js builtin module name, then
>     1.  Return the string _“node:”_ concatenated with _packageSpecifier_.
> 4.  If _packageSpecifier_ does not start with _“@”_, then
>     1.  Set _packageName_ to the substring of _packageSpecifier_ until the first _“/”_ separator or the end of the string.
> 5.  Otherwise,
>     1.  If _packageSpecifier_ does not contain a _“/”_ separator, then
>         1.  Throw an _Invalid Module Specifier_ error.
>     2.  Set _packageName_ to the substring of _packageSpecifier_ until the second _“/”_ separator or the end of the string.
> 6.  If _packageName_ starts with _“.”_ or contains _“\\”_ or _“%”_, then
>     1.  Throw an _Invalid Module Specifier_ error.
> 7.  Let _packageSubpath_ be _“.”_ concatenated with the substring of _packageSpecifier_ from the position at the length of _packageName_.
> 8.  If _packageSubpath_ ends in _“/”_, then
>     1.  Throw an _Invalid Module Specifier_ error.
> 9.  Let _selfUrl_ be the result of **PACKAGE_SELF_RESOLVE**(_packageName_, _packageSubpath_, _parentURL_).
> 10. If _selfUrl_ is not **undefined**, return _selfUrl_.
> 11. While _parentURL_ is not the file system root,
>     1.  Let _packageURL_ be the URL resolution of _“node_modules/”_ concatenated with _packageSpecifier_, relative to _parentURL_.
>     2.  Set _parentURL_ to the parent folder URL of _parentURL_.
>     3.  If the folder at _packageURL_ does not exist, then
>         1.  Continue the next loop iteration.
>     4.  Let _pjson_ be the result of **READ_PACKAGE_JSON**(_packageURL_).
>     5.  If _pjson_ is not **null** and _pjson_.\_exports\_ is not **null** or **undefined**, then
>         1.  Return the result of **PACKAGE_EXPORTS_RESOLVE**(_packageURL_, _packageSubpath_, _pjson.exports_, _defaultConditions_).
>     6.  Otherwise, if _packageSubpath_ is equal to _“.”_, then
>         1.  If _pjson.main_ is a string, then
>             1.  Return the URL resolution of _main_ in _packageURL_.
>     7.  Otherwise,
>         1.  Return the URL resolution of _packageSubpath_ in _packageURL_.
> 12. Throw a _Module Not Found_ error.

**PACKAGE_SELF_RESOLVE**(_packageName_, _packageSubpath_, _parentURL_)

> 1.  Let _packageURL_ be the result of **LOOKUP_PACKAGE_SCOPE**(_parentURL_).
> 2.  If _packageURL_ is **null**, then
>     1.  Return **undefined**.
> 3.  Let _pjson_ be the result of **READ_PACKAGE_JSON**(_packageURL_).
> 4.  If _pjson_ is **null** or if _pjson_.\_exports\_ is **null** or **undefined**, then
>     1.  Return **undefined**.
> 5.  If _pjson.name_ is equal to _packageName_, then
>     1.  Return the result of **PACKAGE_EXPORTS_RESOLVE**(_packageURL_, _packageSubpath_, _pjson.exports_, _defaultConditions_).
> 6.  Otherwise, return **undefined**.

**PACKAGE_EXPORTS_RESOLVE**(_packageURL_, _subpath_, _exports_, _conditions_)

> 1.  If _exports_ is an Object with both a key starting with _“.”_ and a key not starting with _“.”_, throw an _Invalid Package Configuration_ error.
> 2.  If _subpath_ is equal to _“.”_, then
>     1.  Let _mainExport_ be **undefined**.
>     2.  If _exports_ is a String or Array, or an Object containing no keys starting with _“.”_, then
>         1.  Set _mainExport_ to _exports_.
>     3.  Otherwise if _exports_ is an Object containing a _“.”_ property, then
>         1.  Set _mainExport_ to _exports_\[_“.”_\].
>     4.  If _mainExport_ is not **undefined**, then
>         1.  Let _resolved_ be the result of **PACKAGE_TARGET_RESOLVE**( _packageURL_, _mainExport_, **null**, **false**, _conditions_).
>         2.  If _resolved_ is not **null** or **undefined**, return _resolved_.
> 3.  Otherwise, if _exports_ is an Object and all keys of _exports_ start with _“.”_, then
>     1.  Let _matchKey_ be the string _“./”_ concatenated with _subpath_.
>     2.  Let _resolved_ be the result of **PACKAGE_IMPORTS_EXPORTS_RESOLVE**( _matchKey_, _exports_, _packageURL_, **false**, _conditions_).
>     3.  If _resolved_ is not **null** or **undefined**, return _resolved_.
> 4.  Throw a _Package Path Not Exported_ error.

**PACKAGE_IMPORTS_RESOLVE**(_specifier_, _parentURL_, _conditions_)

> 1.  Assert: _specifier_ begins with _“\#”_.
> 2.  If _specifier_ is exactly equal to _“\#”_ or starts with _“\#/”_, then
>     1.  Throw an _Invalid Module Specifier_ error.
> 3.  Let _packageURL_ be the result of **LOOKUP_PACKAGE_SCOPE**(_parentURL_).
> 4.  If _packageURL_ is not **null**, then
>     1.  Let _pjson_ be the result of **READ_PACKAGE_JSON**(_packageURL_).
>     2.  If _pjson.imports_ is a non-null Object, then
>         1.  Let _resolved_ be the result of **PACKAGE_IMPORTS_EXPORTS_RESOLVE**( _specifier_, _pjson.imports_, _packageURL_, **true**, _conditions_).
>         2.  If _resolved_ is not **null** or **undefined**, return _resolved_.
> 5.  Throw a _Package Import Not Defined_ error.

**PACKAGE_IMPORTS_EXPORTS_RESOLVE**(_matchKey_, _matchObj_, _packageURL_, _isImports_, _conditions_)

> 1.  If _matchKey_ is a key of _matchObj_ and does not contain _“\*”_, then
>     1.  Let _target_ be the value of _matchObj_\[_matchKey_\].
>     2.  Return the result of **PACKAGE_TARGET_RESOLVE**(_packageURL_, _target_, **null**, _isImports_, _conditions_).
> 2.  Let _expansionKeys_ be the list of keys of _matchObj_ containing only a single _“\*”_, sorted by the sorting function **PATTERN_KEY_COMPARE** which orders in descending order of specificity.
> 3.  For each key _expansionKey_ in _expansionKeys_, do
>     1.  Let _patternBase_ be the substring of _expansionKey_ up to but excluding the first _“\*”_ character.
>     2.  If _matchKey_ starts with but is not equal to _patternBase_, then
>         1.  Let _patternTrailer_ be the substring of _expansionKey_ from the index after the first _“\*”_ character.
>         2.  If _patternTrailer_ has zero length, or if _matchKey_ ends with _patternTrailer_ and the length of _matchKey_ is greater than or equal to the length of _expansionKey_, then
>             1.  Let _target_ be the value of _matchObj_\[_expansionKey_\].
>             2.  Let _patternMatch_ be the substring of _matchKey_ starting at the index of the length of _patternBase_ up to the length of _matchKey_ minus the length of _patternTrailer_.
>             3.  Return the result of **PACKAGE_TARGET_RESOLVE**(_packageURL_, _target_, _patternMatch_, _isImports_, _conditions_).
> 4.  Return **null**.

**PATTERN_KEY_COMPARE**(_keyA_, _keyB_)

> 1.  Assert: _keyA_ ends with _“/”_ or contains only a single _“\*”_.
> 2.  Assert: _keyB_ ends with _“/”_ or contains only a single _“\*”_.
> 3.  Let _baseLengthA_ be the index of _“\*”_ in _keyA_ plus one, if _keyA_ contains _“\*”_, or the length of _keyA_ otherwise.
> 4.  Let _baseLengthB_ be the index of _“\*”_ in _keyB_ plus one, if _keyB_ contains _“\*”_, or the length of _keyB_ otherwise.
> 5.  If _baseLengthA_ is greater than _baseLengthB_, return -1.
> 6.  If _baseLengthB_ is greater than _baseLengthA_, return 1.
> 7.  If _keyA_ does not contain _“\*”_, return 1.
> 8.  If _keyB_ does not contain _“\*”_, return -1.
> 9.  If the length of _keyA_ is greater than the length of _keyB_, return -1.
> 10. If the length of _keyB_ is greater than the length of _keyA_, return 1.
> 11. Return 0.

**PACKAGE_TARGET_RESOLVE**(_packageURL_, _target_, _patternMatch_, _isImports_, _conditions_)

> 1.  If _target_ is a String, then
>     1.  If _target_ does not start with _“./”_, then
>         1.  If _isImports_ is **false**, or if _target_ starts with _“../”_ or _“/”_, or if _target_ is a valid URL, then
>             1.  Throw an _Invalid Package Target_ error.
>         2.  If _patternMatch_ is a String, then
>             1.  Return **PACKAGE_RESOLVE**(_target_ with every instance of _“\*”_ replaced by _patternMatch_, _packageURL_ + _“/”_).
>         3.  Return **PACKAGE_RESOLVE**(_target_, _packageURL_ + _“/”_).
>     2.  If _target_ split on _“/”_ or _“\\”_ contains any _"“_, _”.“_, _”..“_, or _”node_modules"_ segments after the first _“.”_ segment, case insensitive and including percent encoded variants, throw an _Invalid Package Target_ error.
>     3.  Let _resolvedTarget_ be the URL resolution of the concatenation of _packageURL_ and _target_.
>     4.  Assert: _resolvedTarget_ is contained in _packageURL_.
>     5.  If _patternMatch_ is **null**, then
>         1.  Return _resolvedTarget_.
>     6.  If _patternMatch_ split on _“/”_ or _“\\”_ contains any _"“_, _”.“_, _”..“_, or _”node_modules"_ segments, case insensitive and including percent encoded variants, throw an _Invalid Module Specifier_ error.
>     7.  Return the URL resolution of _resolvedTarget_ with every instance of _“\*”_ replaced with _patternMatch_.
> 2.  Otherwise, if _target_ is a non-null Object, then
>     1.  If _exports_ contains any index property keys, as defined in ECMA-262 [6.1.7 Array Index](https://tc39.es/ecma262/#integer-index), throw an _Invalid Package Configuration_ error.
>     2.  For each property _p_ of _target_, in object insertion order as,
>         1.  If _p_ equals _“default”_ or _conditions_ contains an entry for _p_, then
>             1.  Let _targetValue_ be the value of the _p_ property in _target_.
>             2.  Let _resolved_ be the result of **PACKAGE_TARGET_RESOLVE**( _packageURL_, _targetValue_, _patternMatch_, _isImports_, _conditions_).
>             3.  If _resolved_ is equal to **undefined**, continue the loop.
>             4.  Return _resolved_.
>     3.  Return **undefined**.
> 3.  Otherwise, if _target_ is an Array, then
>     1.  If \_target.length is zero, return **null**.
>     2.  For each item _targetValue_ in _target_, do
>         1.  Let _resolved_ be the result of **PACKAGE_TARGET_RESOLVE**( _packageURL_, _targetValue_, _patternMatch_, _isImports_, _conditions_), continuing the loop on any _Invalid Package Target_ error.
>         2.  If _resolved_ is **undefined**, continue the loop.
>         3.  Return _resolved_.
>     3.  Return or throw the last fallback resolution **null** return or error.
> 4.  Otherwise, if _target_ is _null_, return **null**.
> 5.  Otherwise throw an _Invalid Package Target_ error.

**ESM_FILE_FORMAT**(_url_)

> 1.  Assert: _url_ corresponds to an existing file.
> 2.  If _url_ ends in _“.mjs”_, then
>     1.  Return _“module”_.
> 3.  If _url_ ends in _“.cjs”_, then
>     1.  Return _“commonjs”_.
> 4.  If _url_ ends in _“.json”_, then
>     1.  Return _“json”_.
> 5.  Let _packageURL_ be the result of **LOOKUP_PACKAGE_SCOPE**(_url_).
> 6.  Let _pjson_ be the result of **READ_PACKAGE_JSON**(_packageURL_).
> 7.  If _pjson?.type_ exists and is _“module”_, then
>     1.  If _url_ ends in _“.js”_, then
>         1.  Return _“module”_.
>     2.  Throw an _Unsupported File Extension_ error.
> 8.  Otherwise,
>     1.  Throw an _Unsupported File Extension_ error.

**LOOKUP_PACKAGE_SCOPE**(_url_)

> 1.  Let _scopeURL_ be _url_.
> 2.  While _scopeURL_ is not the file system root,
>     1.  Set _scopeURL_ to the parent URL of _scopeURL_.
>     2.  If _scopeURL_ ends in a _“node_modules”_ path segment, return **null**.
>     3.  Let _pjsonURL_ be the resolution of _“package.json”_ within _scopeURL_.
>     4.  if the file at _pjsonURL_ exists, then
>         1.  Return _scopeURL_.
> 3.  Return **null**.

**READ_PACKAGE_JSON**(_packageURL_)

> 1.  Let _pjsonURL_ be the resolution of _“package.json”_ within _packageURL_.
> 2.  If the file at _pjsonURL_ does not exist, then
>     1.  Return **null**.
> 3.  If the file at _packageURL_ does not parse as valid JSON, then
>     1.  Throw an _Invalid Package Configuration_ error.
> 4.  Return the parsed JSON source of the file at _pjsonURL_.

### Настройка алгоритма разрешения спецификатора ESM

API [Loaders API](#loaders) предоставляет механизм для настройки алгоритма разрешения спецификаторов ESM. Примером загрузчика, обеспечивающего разрешение ESM-спецификаторов в стиле CommonJS, является [commonjs-extension-resolution-loader](https://github.com/nodejs/loaders-test/tree/main/commonjs-extension-resolution-loader).
