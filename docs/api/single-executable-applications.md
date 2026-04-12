---
title: Одноисполняемые приложения
description: Сборка исполняемого файла с встроенным скриптом Node.js и флагом --build-sea, API node:sea и подготовительный блоб SEA
---

# Одноисполняемые приложения

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/single-executable-applications.html)

<!--introduced_in=v19.7.0-->

<!-- YAML
added:
  - v19.7.0
  - v18.16.0
changes:
  - version: v25.5.0
    pr-url: https://github.com/nodejs/node/pull/61167
    description: Added built-in single executable application generation via the CLI flag `--build-sea`.
  - version: v20.6.0
    pr-url: https://github.com/nodejs/node/pull/46824
    description: Added support for "useSnapshot".
  - version: v20.6.0
    pr-url: https://github.com/nodejs/node/pull/48191
    description: Added support for "useCodeCache".
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v25.5.0 | Добавлена ​​встроенная генерация одного исполняемого приложения с помощью флага CLI `--build-sea`. |
    | v20.6.0 | Добавлена ​​поддержка useSnapshot. |
    | v20.6.0 | Добавлена ​​поддержка useCodeCache. |

!!!warning "Стабильность: 1 – Экспериментальная"

    Функция находится в стадии активной разработки и может меняться.

<!-- source_link=src/node_sea.cc -->

Эта возможность позволяет удобно распространять приложение Node.js на систему, где Node.js не установлен.

Node.js поддерживает создание [одноисполняемых приложений][single executable applications], внедряя подготовленный Node.js блоб (в нём может быть упакованный скрипт) в двоичный файл `node`. При запуске проверяется, было ли что-то внедрено. Если блоб найден, выполняется скрипт из блоба. Иначе Node.js ведёт себя как обычно.

Одноисполняемое приложение может запускать один встроенный скрипт в системе модулей [CommonJS][] или [ECMAScript Modules][].

Создать одноисполняемое приложение из упакованного скрипта можно с помощью самого бинарника `node` и любого инструмента, умеющего внедрять ресурсы в исполняемый файл.

1. Создайте файл JavaScript:
   ```bash
   echo 'console.log(`Hello, ${process.argv[2]}!`);' > hello.js
   ```

2. Создайте конфигурационный файл, задающий блоб для внедрения в одноисполняемое приложение
   (подробности — в разделе [Генерация подготовительных блобов SEA][Generating single executable preparation blobs]):

   * На системах, кроме Windows:

   ```bash
   echo '{ "main": "hello.js", "output": "sea" }' > sea-config.json
   ```

   * На Windows:

   ```bash
   echo '{ "main": "hello.js", "output": "sea.exe" }' > sea-config.json
   ```

   Расширение `.exe` обязательно.

3. Соберите целевой исполняемый файл:
   ```bash
   node --build-sea sea-config.json
   ```

4. Подпишите бинарник (только macOS и Windows):

   * На macOS:

   ```bash
   codesign --sign - hello
   ```

   * На Windows (по желанию):

   Для подписи нужен сертификат; без подписи бинарник всё равно обычно запускается.

   ```powershell
   signtool sign /fd SHA256 hello.exe
   ```

5. Запустите бинарник:

   * На системах, кроме Windows:

   ```console
   $ ./hello world
   Hello, world!
   ```

   * На Windows:

   ```console
   $ .\hello.exe world
   Hello, world!
   ```

## Генерация одноисполняемых приложений с `--build-sea`

Чтобы сразу собрать одноисполняемое приложение, используйте флаг `--build-sea`. Он принимает путь к JSON-конфигурации. Если путь не абсолютный, Node.js берёт его относительно текущего рабочего каталога.

Сейчас на верхнем уровне конфигурации читаются такие поля:

```json
{
  "main": "/path/to/bundled/script.js",
  "mainFormat": "commonjs", // Default: "commonjs", options: "commonjs", "module"
  "executable": "/path/to/node/binary", // Optional, if not specified, uses the current Node.js binary
  "output": "/path/to/write/the/generated/executable",
  "disableExperimentalSEAWarning": true, // Default: false
  "useSnapshot": false,  // Default: false
  "useCodeCache": true, // Default: false
  "execArgv": ["--no-warnings", "--max-old-space-size=4096"], // Optional
  "execArgvExtension": "env", // Default: "env", options: "none", "env", "cli"
  "assets": {  // Optional
    "a.dat": "/path/to/a.dat",
    "b.txt": "/path/to/b.txt"
  }
}
```

Если пути не абсолютные, Node.js интерпретирует их относительно текущего рабочего каталога. Версия бинарника Node.js, которым собирается блоб, должна совпадать с той, в который блоб будет внедрён.

Примечание: при кросс-платформенной сборке SEA (например, `linux-x64` на `darwin-arm64`) поля `useCodeCache` и `useSnapshot` нужно установить в `false`, чтобы не получить несовместимые исполняемые файлы. Кэш кода и снимки можно загрузить только на той же платформе, где они собраны; иначе при старте возможен сбой при загрузке кэша или снимка с другой платформы.

### Ресурсы (assets)

Ресурсы задаются словарём «ключ — путь» в поле `assets`. На этапе сборки Node.js читает файлы по указанным путям и включает их в подготовительный блоб. В собранном исполняемом файле ресурсы доступны через API [`sea.getAsset()`][] и [`sea.getAssetAsBlob()`][].

```json
{
  "main": "/path/to/bundled/script.js",
  "output": "/path/to/write/the/generated/executable",
  "assets": {
    "a.jpg": "/path/to/a.jpg",
    "b.txt": "/path/to/b.txt"
  }
}
```

Доступ к ресурсам из одноисполняемого приложения:

=== "CJS"

    ```js
    const { getAsset, getAssetAsBlob, getRawAsset, getAssetKeys } = require('node:sea');
    // Get all asset keys.
    const keys = getAssetKeys();
    console.log(keys); // ['a.jpg', 'b.txt']
    // Returns a copy of the data in an ArrayBuffer.
    const image = getAsset('a.jpg');
    // Returns a string decoded from the asset as UTF8.
    const text = getAsset('b.txt', 'utf8');
    // Returns a Blob containing the asset.
    const blob = getAssetAsBlob('a.jpg');
    // Returns an ArrayBuffer containing the raw asset without copying.
    const raw = getRawAsset('a.jpg');
    ```

Подробнее см. [`sea.getAsset()`][], [`sea.getAssetAsBlob()`][], [`sea.getRawAsset()`][] и [`sea.getAssetKeys()`][].

### Поддержка снимка запуска (startup snapshot)

Поле `useSnapshot` включает поддержку снимка при запуске. Тогда скрипт `main` **не** выполняется при запуске итогового исполняемого файла. Он выполняется при **генерации** подготовительного блоба на машине сборки. В блоб попадает снимок состояния, инициализированного скриптом `main`. Итоговый исполняемый файл с внедрённым блобом десериализует снимок во время работы.

Если `useSnapshot` равен `true`, основной скрипт должен вызвать [`v8.startupSnapshot.setDeserializeMainFunction()`][], чтобы задать код, который выполнится при запуске итогового исполняемого файла пользователем.

Типичная схема:

1. На этапе сборки скрипт `main` выполняется, чтобы подготовить кучу к приёму ввода пользователя, и настраивает главную функцию через [`v8.startupSnapshot.setDeserializeMainFunction()`][]. Эта функция компилируется и сериализуется в снимок, но на этапе сборки не вызывается.
2. Во время работы главная функция выполняется поверх десериализованной кучи на машине пользователя.

На основной скрипт при сборке снимка распространяются общие ограничения сценариев startup snapshot; можно использовать [`v8.startupSnapshot` API][]. См. [документацию по startup snapshot в Node.js][documentation about startup snapshot support in Node.js].

### Поддержка кэша кода V8

Если в конфигурации `useCodeCache` равен `true`, при генерации подготовительного блоба Node.js компилирует скрипт `main` и формирует кэш кода V8. Кэш входит в блоб и внедряется в итоговый исполняемый файл. При запуске вместо полной компиляции `main` с нуля используется кэш, что ускоряет запуск.

**Примечание:** при `useCodeCache: true` не работает `import()`.

### Аргументы выполнения

Поле `execArgv` задаёт специфичные для Node.js аргументы, которые автоматически применяются при старте одноисполняемого приложения. Так разработчики могут задать параметры среды выполнения без необходимости передавать флаги конечным пользователям.

Пример конфигурации:

```json
{
  "main": "/path/to/bundled/script.js",
  "output": "/path/to/write/the/generated/executable",
  "execArgv": ["--no-warnings", "--max-old-space-size=2048"]
}
```

SEA будет запущен с флагами `--no-warnings` и `--max-old-space-size=2048`. Во встроенном скрипте они доступны через `process.execArgv`:

```js
// If the executable is launched with `sea user-arg1 user-arg2`
console.log(process.execArgv);
// Prints: ['--no-warnings', '--max-old-space-size=2048']
console.log(process.argv);
// Prints: ['/path/to/sea', 'path/to/sea', 'user-arg1', 'user-arg2']
```

Пользовательские аргументы — в `process.argv`, начиная с индекса 2, как при запуске:

```console
node --no-warnings --max-old-space-size=2048 /path/to/bundled/script.js user-arg1 user-arg2
```

### Расширение аргументов выполнения

Поле `execArgvExtension` задаёт, как можно дополнять аргументы сверх указанных в `execArgv`. Допустимы три строковых значения:

* `"none"`: расширение запрещено. Используются только аргументы из `execArgv`, переменная окружения `NODE_OPTIONS` игнорируется.
* `"env"`: _(по умолчанию)_ переменная `NODE_OPTIONS` может дополнять аргументы выполнения. Так сохраняется обратная совместимость.
* `"cli"`: исполняемый файл можно запускать с `--node-options="--flag1 --flag2"`; эти флаги разбираются как аргументы Node.js, а не передаются пользовательскому скрипту. Так можно использовать флаги, не поддерживаемые через `NODE_OPTIONS`.

Пример с `"execArgvExtension": "cli"`:

```json
{
  "main": "/path/to/bundled/script.js",
  "output": "/path/to/write/the/generated/executable",
  "execArgv": ["--no-warnings"],
  "execArgvExtension": "cli"
}
```

Запуск:

```console
./my-sea --node-options="--trace-exit" user-arg1 user-arg2
```

Эквивалентно:

```console
node --no-warnings --trace-exit /path/to/bundled/script.js user-arg1 user-arg2
```

## API одноисполняемого приложения

Встроенный модуль `node:sea` позволяет работать с одноисполняемым приложением из основного JavaScript-скрипта, встроенного в исполняемый файл.

### `sea.isSea()`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

* Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Выполняется ли этот скрипт внутри одноисполняемого приложения.

### `sea.getAsset(key[, encoding])`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

Метод возвращает ресурсы, заданные для включения в одноисполняемое приложение на этапе сборки.
Если ресурс не найден, выбрасывается ошибка.

* `key`  [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) ключ в словаре поля `assets` конфигурации одноисполняемого приложения.
* `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если указано, ресурс декодируется в строку. Допустима любая кодировка, поддерживаемая `TextDecoder`.
  Если не указано, возвращается `ArrayBuffer` с копией данных.
* Возвращает: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

### `sea.getAssetAsBlob(key[, options])`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

Аналогично [`sea.getAsset()`][], но результат — [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
Если ресурс не найден, выбрасывается ошибка.

* `key`  [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) ключ в словаре поля `assets` конфигурации одноисполняемого приложения.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) необязательный MIME-тип для blob.
* Возвращает: [<Blob>](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

### `sea.getRawAsset(key)`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

Возвращает ресурсы, заданные для включения на этапе сборки.
Если ресурс не найден, выбрасывается ошибка.

В отличие от `sea.getAsset()` и `sea.getAssetAsBlob()`, метод не возвращает копию: возвращается «сырой» ресурс, встроенный в исполняемый файл.

Пока не следует записывать в возвращённый `ArrayBuffer`. Если внедрённая секция не помечена как доступная для записи или выравнивание неверное, запись может привести к падению.

* `key`  [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) ключ в словаре поля `assets` конфигурации одноисполняемого приложения.
* Возвращает: [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

### `sea.getAssetKeys()`

<!-- YAML
added:
  - v24.8.0
  - v22.20.0
-->

* Возвращает: [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив ключей всех встроенных ресурсов. Если ресурсов нет — пустой массив.

Возвращает список ключей ресурсов, встроенных в исполняемый файл.
Вне одноисполняемого приложения вызов приводит к ошибке.

## Во встроенном основном скрипте

### Формат модуля встроенного основного скрипта

Интерпретацию встроенного основного скрипта задаёт поле `mainFormat` в конфигурации одноисполняемого приложения.
Допустимые значения:

* `"commonjs"`: скрипт трактуется как модуль CommonJS.
* `"module"`: скрипт трактуется как ECMAScript-модуль.

Если `mainFormat` не указан, по умолчанию `"commonjs"`.

Сейчас `"mainFormat": "module"` нельзя сочетать с `"useSnapshot"`.

### Загрузка модулей во встроенном основном скрипте

Во встроенном основном скрипте загрузка модулей не читает файловую систему.
По умолчанию и `require()`, и `import` могут подгружать только встроенные модули. Попытка загрузить модуль только из файловой системы приведёт к ошибке.

Приложение можно собрать в один автономный JavaScript-файл для внедрения — так проще получить предсказуемый граф зависимостей.

Чтобы загружать модули с диска, создайте функцию `require` через `module.createRequire()`. Пример для точки входа CommonJS:

<!-- eslint-disable no-global-assign -->

```js
const { createRequire } = require('node:module');
require = createRequire(__filename);
```

### `require()` во встроенном основном скрипте

`require()` здесь не совпадает с [`require()`][] у обычных не встроенных модулей.
Сейчас у него нет свойств не встроенного [`require()`][], кроме [`require.main`][].

### `__filename` и `module.filename` во встроенном основном скрипте

Значения `__filename` и `module.filename` равны [`process.execPath`][].

### `__dirname` во встроенном основном скрипте

`__dirname` равен каталогу [`process.execPath`][].

### `import.meta` во встроенном основном скрипте

При `"mainFormat": "module"` во встроенном скрипте доступен `import.meta` со свойствами:

* `import.meta.url`: `file:` URL, соответствующий [`process.execPath`][].
* `import.meta.filename`: равен [`process.execPath`][].
* `import.meta.dirname`: каталог [`process.execPath`][].
* `import.meta.main`: `true`.

`import.meta.resolve` пока не поддерживается.

### `import()` во встроенном основном скрипте

<!-- TODO(joyeecheung): support and document module.registerHooks -->

При `"mainFormat": "module"` `import()` может динамически загружать встроенные модули. Загрузка модулей с файловой системы через `import()` приведёт к ошибке.

### Нативные аддоны во встроенном основном скрипте

Нативные аддоны можно включить как ресурсы в поле `assets` конфигурации, из которой собирается подготовительный блоб одноисполняемого приложения.
Аддон затем можно записать во временный файл и загрузить через `process.dlopen()`.

```json
{
  "main": "/path/to/bundled/script.js",
  "output": "/path/to/write/the/generated/executable",
  "assets": {
    "myaddon.node": "/path/to/myaddon/build/Release/myaddon.node"
  }
}
```

```js
// script.js
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { getRawAsset } = require('node:sea');
const addonPath = path.join(os.tmpdir(), 'myaddon.node');
fs.writeFileSync(addonPath, new Uint8Array(getRawAsset('myaddon.node')));
const myaddon = { exports: {} };
process.dlopen(myaddon, addonPath);
console.log(myaddon.exports);
fs.rmSync(addonPath);
```

Известное ограничение: если одноисполняемое приложение собрано через postject в контейнере Linux arm64,
[ELF-файл может иметь некорректную хэш-таблицу для загрузки аддонов][postject-linux-arm64-issue], и `process.dlopen()` упадёт.
Собирайте на других платформах или хотя бы вне контейнера Linux arm64.

## Примечания

### Процесс создания одноисполняемого приложения

Описанный здесь процесс может измениться.

#### 1. Генерация подготовительных блобов SEA

Чтобы собрать одноисполняемое приложение, Node.js сначала генерирует блоб со всей информацией для запуска упакованного скрипта.
При использовании `--build-sea` этот шаг выполняется вместе с внедрением.

##### Сохранение подготовительного блоба на диск

До появления `--build-sea` использовался сценарий записи подготовительного блоба на диск для внешних инструментов внедрения. Его ещё можно использовать для проверки.

Чтобы выгрузить блоб на диск, используйте `--experimental-sea-config`.
Записывается файл, который можно внедрить в бинарник Node.js инструментами вроде [postject][].

Конфигурация похожа на `--build-sea`, но поле `output` задаёт путь к **файлу блоба**, а не к итоговому исполняемому файлу.

```json
{
  "main": "/path/to/bundled/script.js",
  // Instead of the final executable, this is the path to write the blob.
  "output": "/path/to/write/the/generated/blob.blob"
}
```

#### 2. Внедрение подготовительного блоба в бинарник `node`

Чтобы завершить сборку одноисполняемого приложения, сгенерированный блоб нужно внедрить в копию бинарника `node`, как описано ниже.

При `--build-sea` этот шаг выполняется вместе с генерацией блоба.

* Если бинарник `node` — [PE][], блоб внедряется как ресурс с именем `NODE_SEA_BLOB`.
* Если это [Mach-O][], блоб внедряется как секция `NODE_SEA_BLOB` в сегменте `NODE_SEA`.
* Если это [ELF][], блоб внедряется как нота `NODE_SEA_BLOB`.

Затем процесс сборки SEA ищет в бинарнике строку [fuse][] `NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2:0` и переводит последний символ в `1`, чтобы отметить внедрение ресурса.

##### Ручное внедрение подготовительного блоба

До `--build-sea` использовался сценарий с внешними инструментами.

Например, с [postject][]:

1. Скопируйте исполняемый файл `node` под нужным именем:

   * На системах, кроме Windows:

   ```bash
   cp $(command -v node) hello
   ```

   * На Windows:

   ```text
   node -e "require('fs').copyFileSync(process.execPath, 'hello.exe')"
   ```

   Нужно расширение `.exe`.

2. Снимите подпись бинарника (только macOS и Windows):

   * На macOS:

   ```bash
   codesign --remove-signature hello
   ```

   * На Windows (по желанию):

   [signtool][] из [Windows SDK][]. Если шаг пропущен, игнорируйте предупреждения postject о подписи.

   ```powershell
   signtool remove /s hello.exe
   ```

3. Внедрите блоб в скопированный бинарник через `postject` с опциями:

   * `hello` / `hello.exe` — имя копии `node` с шага 1.
   * `NODE_SEA_BLOB` — имя ресурса / ноты / секции, где хранится блоб.
   * `sea-prep.blob` — файл блоба с шага 1.
   * `--sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2` — [fuse][], которым Node.js определяет внедрение.
   * `--macho-segment-name NODE_SEA` (только macOS) — сегмент, где хранится блоб.

   Команды по платформам:

   * Linux:
     ```bash
     npx postject hello NODE_SEA_BLOB sea-prep.blob \
         --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
     ```

   * Windows — PowerShell:
     ```powershell
     npx postject hello.exe NODE_SEA_BLOB sea-prep.blob `
         --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
     ```

   * Windows — Command Prompt:
     ```text
     npx postject hello.exe NODE_SEA_BLOB sea-prep.blob ^
         --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
     ```

   * macOS:
     ```bash
     npx postject hello NODE_SEA_BLOB sea-prep.blob \
         --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
         --macho-segment-name NODE_SEA
     ```

### Поддержка платформ

Одноисполняемые приложения регулярно тестируются в CI только на:

* Windows
* macOS
* Linux (все дистрибутивы [supported by Node.js][], кроме Alpine, и все архитектуры [supported by Node.js][], кроме s390x)

Из-за нехватки инструментов генерации одноисполняемых файлов для других платформ.

Предложения по другим инструментам и сценариям внедрения приветствуются: обсуждения — на <https://github.com/nodejs/single-executable/discussions>.

[CommonJS]: modules.md#modules-commonjs-modules
[ECMAScript Modules]: esm.md#modules-ecmascript-modules
[ELF]: https://en.wikipedia.org/wiki/Executable_and_Linkable_Format
[Generating single executable preparation blobs]: #1-generating-single-executable-preparation-blobs
[Mach-O]: https://en.wikipedia.org/wiki/Mach-O
[PE]: https://en.wikipedia.org/wiki/Portable_Executable
[Windows SDK]: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/
[`process.execPath`]: process.md#processexecpath
[`require()`]: modules.md#requireid
[`require.main`]: modules.md#accessing-the-main-module
[`sea.getAsset()`]: #seagetassetkey-encoding
[`sea.getAssetAsBlob()`]: #seagetassetasblobkey-options
[`sea.getAssetKeys()`]: #seagetassetkeys
[`sea.getRawAsset()`]: #seagetrawassetkey
[`v8.startupSnapshot.setDeserializeMainFunction()`]: v8.md#v8startupsnapshotsetdeserializemainfunctioncallback-data
[`v8.startupSnapshot` API]: v8.md#startup-snapshot-api
[documentation about startup snapshot support in Node.js]: cli.md#--build-snapshot
[fuse]: https://www.electronjs.org/docs/latest/tutorial/fuses
[postject]: https://github.com/nodejs/postject
[postject-linux-arm64-issue]: https://github.com/nodejs/postject/issues/105
[signtool]: https://learn.microsoft.com/en-us/windows/win32/seccrypto/signtool
[single executable applications]: https://github.com/nodejs/single-executable
[supported by Node.js]: https://github.com/nodejs/node/blob/main/BUILDING.md#platform-list
