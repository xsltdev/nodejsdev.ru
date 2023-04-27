---
description: Предоставляет общие полезные методы при взаимодействии с экземплярами Module, переменной module, часто встречающейся в модулях CommonJS
---

# API node:module

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/module.html)

## Объект `Модуль`

-   {Object}

Предоставляет общие полезные методы при взаимодействии с экземплярами `Module`, переменной [`module`](modules.md#the-module-object), часто встречающейся в модулях [CommonJS](modules.md). Доступ к ней осуществляется через `import 'node:module'` или `require('node:module')`.

### `module.builtinModules`

-   {string\[\]}

Список имен всех модулей, предоставляемых Node.js. Может использоваться для проверки того, поддерживается ли модуль третьей стороной или нет.

`модуль` в данном контексте - это не тот же объект, который предоставляется [оберткой модуля] (modules.md#the-module-wrapper). Для доступа к нему требуется модуль `Module`:

```mjs
// module.mjs
// В модуле ECMAScript
import { builtinModules as builtin } from 'node:module';
```

```cjs
// module.cjs
// В модуле CommonJS
const builtin = require('node:module').builtinModules;
```

### `module.createRequire(filename)`

-   `filename` {string|URL} Имя файла, которое будет использоваться для создания функции require. Должно быть объектом URL файла, строкой URL файла или строкой абсолютного пути.
-   Возвращает: {require} Функция require

<!-- конец списка -->

```mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// sibling-module.js является модулем CommonJS.
const siblingModule = require('./sibling-module');
```

### `module.isBuiltin(moduleName)`

-   `moduleName` {строка} имя модуля
-   Возвращает: {boolean} возвращает true, если модуль является встроенным, иначе возвращает false

<!-- конец списка -->

```mjs
import { isBuiltin } from 'node:module';
isBuiltin('node:fs'); // true
isBuiltin('fs'); // true
isBuiltin('wss'); // false
```

### `module.syncBuiltinESMExports()`

Метод `module.syncBuiltinESMExports()` обновляет все живые привязки для встроенных [ES Modules](esm.md), чтобы они соответствовали свойствам экспортируемых [CommonJS](modules.md). Он не добавляет и не удаляет экспортируемые имена из [ES Modules](esm.md).

```js
const fs = require('node:fs');
const assert = require('node:assert');
const { syncBuiltinESMExports } = require('node:module');


fs.readFile = newAPI;


удалить fs.readFileSync;


function newAPI() {
  // ...
}


fs.newAPI = newAPI;


syncBuiltinESMExports();


import('node:fs').then((esmFS) => {
  // Он синхронизирует существующее свойство readFile с новым значением
  assert.strictEqual(esmFS.readFile, newAPI);
  // readFileSync был удален из требуемой fs
  assert.strictEqual('readFileSync' in fs, false);
  // syncBuiltinESMExports() не удаляет readFileSync из esmFS
  assert.strictEqual('readFileSync' in esmFS, true);
  // syncBuiltinESMExports() не добавляет имена
  assert.strictEqual(esmFS.newAPI, undefined);
});
```

## Source map v3 support

> Стабильность: 1 - Экспериментальная

Помощники для взаимодействия с кэшем карты источников. Этот кэш заполняется, когда включен разбор карты источников и [директивы включения карты источников](https://sourcemaps.info/spec.html#h.lmz475t4mvbx) найдены в нижнем колонтитуле модулей.

Чтобы включить разбор карты исходников, Node.js должен быть запущен с флагом [`--enable-source-maps`](cli.md#--enable-source-maps), или с включенным покрытием кода путем установки [`NODE_V8_COVERAGE=dir`](cli.md#node_v8_coveragedir).

```mjs
// module.mjs
// In an ECMAScript module
import { findSourceMap, SourceMap } from 'node:module';
```

```cjs
// module.cjs
// In a CommonJS module
const { findSourceMap, SourceMap } = require('node:module');
```

### `module.findSourceMap(path)`

-   `path` {строка}
-   Возвращает: {module.SourceMap|undefined} Возвращает `module.SourceMap`, если карта источника найдена, `undefined` в противном случае.

`path` - это разрешенный путь к файлу, для которого должна быть найдена соответствующая карта источников.

### Класс: `module.SourceMap`

#### `новый SourceMap(payload)`

-   `payload` {Объект}

Создает новый экземпляр `sourceMap.

`payload` - это объект с ключами, соответствующими [Source map v3 format](https://sourcemaps.info/spec.html#h.mofvlxcwqzej):

-   `file`: {строка}
-   `version`: {число}
-   `источники`: {string\[\]}
-   `sourcesContent`: {string\[\]}
-   `имена`: {string\[\]}
-   `mappings`: {строка}
-   `sourceRoot`: {string}

#### `sourceMap.payload`.

-   Возвращает: {Object}

Получатель полезной нагрузки, используемой для построения экземпляра [`SourceMap`](#class-modulesourcemap).

#### `sourceMap.findEntry(lineNumber, columnNumber)`.

-   `lineNumber` {number}
-   `columnNumber` {number}
-   Возвращает: {Object}

Учитывая номер строки и номер столбца в сгенерированном исходном файле, возвращает объект, представляющий позицию в исходном файле. Возвращаемый объект состоит из следующих ключей:

-   generatedLine: {number}
-   generatedColumn: {число}
-   originalSource: {строка}
-   originalLine: {number}
-   originalColumn: {число}
-   имя: {строка}
