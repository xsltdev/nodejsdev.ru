---
description: За последние два года поддержка ESM в TypeScript, Node.js и браузерах сильно продвинулась. В этом посте я рассказываю о своей современной настройке, которая относительно проста - по сравнению с тем, что нам приходилось делать в прошлом
---

# Публикация пакетов npm на основе ESM с помощью TypeScript

За последние два года поддержка ESM в TypeScript, Node.js и браузерах сильно продвинулась. В этом посте я рассказываю о своей современной настройке, которая относительно проста - по сравнению с тем, что нам приходилось делать в прошлом:

-   Он предназначен для пакетов, которые могут позволить себе игнорировать обратную совместимость. Эта настройка хорошо работает у меня уже некоторое время - начиная с TypeScript 4.7 (2022-05-24).
    -   Помогает то, что Node.js теперь поддерживает [«require(esm)»](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require) - требование библиотек ESM из модулей CommonJS.
-   Я использую только `tsc`, но упоминаю, как поддерживать другие инструменты через `tsconfig.json` в разделе [«Компиляция TypeScript с инструментами, отличными от `tsc`»](https://2ality.com/2025/02/typescript-esm-packages.html#compiling-without-tsc).

Приветствуется обратная связь: Что вы делаете по-другому? Что можно улучшить?

Пример пакета: [`@rauschma/helpers`](https://github.com/rauschma/helpers) использует настройку, описанную в этой записи блога.

## Схема файловой системы

Наш пакет npm будет иметь следующее расположение файловой системы:

```
my-package/
  README.md
  LICENSE
  package.json
  tsconfig.json
  docs/
    api/
  src/
  test/
  dist/
    src/
    test/
```

Комментарии:

-   Обычно рекомендуется включать `README.md` и `LICENSE`.
-   `package.json` описывает пакет и описывается [позже](#packagejson).
-   `tsconfig.json` настраивает TypeScript и описывается [позже](#tsconfigjson).
-   `docs/api/` предназначен для документации по API, созданной с помощью TypeDoc. Как это сделать, описано [далее](#typedoc).
-   `src/` - для исходного кода TypeScript.
-   `test/` - для интеграционных тестов - тестов, которые охватывают несколько модулей. Подробнее о модульных тестах будет рассказано позже.
-   `dist/` - это место, куда TypeScript записывает свои выходные данные.

### `.gitignore`

Я использую Git для контроля версий. Вот мой `.gitignore` (находится внутри `my-package/`)

```
node_modules
dist
.DS_Store
```

Почему именно эти строки?

-   `node_modules`: В настоящее время наиболее распространенной практикой является отказ от проверки каталога `node_modules`.
-   `dist`: Результаты компиляции TypeScript не проверяются в Git, но загружаются в реестр npm. Подробнее об этом позже.
-   `.DS_Store`: Эта запись говорит о моей лени как пользователя macOS. Поскольку он нужен только в этой операционной системе, можно утверждать, что пользователи Mac должны добавлять его через глобальные настройки конфигурации и держать его вне gitignores конкретных проектов.

### Юнит-тесты

Я начал помещать юнит-тесты для конкретного модуля рядом с ним:

```
src/
  util.ts
  util_test.ts
```

Учитывая, что юнит-тесты помогают понять, как работает модуль, их должно быть легко найти.

#### Совет для тестов: самостоятельно ссылайтесь на пакет.

Если у пакета npm есть `«exports»`, он может _самостоятельно_ ссылаться на них через имя своего пакета:

```js
// util_test.js
import { helperFunc } from 'my-package/util.js';
```

В документации Node.js есть [«Дополнительная информация»](https://nodejs.org/api/packages.html#self-referencing-a-package-using-its-name) о самоссылках и примечание: «Самостоятельная ссылка доступна, только если `package.json` имеет `«exports»`, и позволит импортировать только то, что разрешает `«exports»` (в `package.json`).»

Преимущества самоссылки:

-   Это полезно для тестов (которые могут продемонстрировать, как импорт пакетов будет использовать код).
-   Проверяет, правильно ли настроен экспорт пакетов.

## `tsconfig.json` {#tsconfigjson}

В этом разделе мы рассмотрим основные моменты работы с `tsconfig.json`. Связанные материалы:

-   Я описал наиболее важные опции `tsconfig.json` в своем блоге [«A checklist for your tsconfig.json»](https://2ality.com/2025/01/tsconfig-json.html).
    -   В его конце есть [summary](https://2ality.com/2025/01/tsconfig-json.html#summary) с рекомендуемыми файлами `tsconfig.json` для нескольких случаев использования.
-   Вы также можете взглянуть на [`tsconfig.json`](https://github.com/rauschma/helpers/blob/main/tsconfig.json) из `@rauschma/helpers`.

### Куда отправляется результат?

```json
{
    "include": ["src/**/*", "test/**/*"],
    "compilerOptions": {
        // Specify explicitly (don’t derive from source file paths):
        "rootDir": ".",
        "outDir": "dist"
        // ···
    }
}
```

Последствия этих настроек:

-   Вход: `src/util.ts`.
    -   Результат: `dist/src/util.js`
-   Вход: `test/my-test_test.ts`
    -   Результат: `dist/test/my-test_test.js`.

### Результат

Получив TypeScript-файл `util.ts`, tsc записывает следующий результат в `dist/src/`:

```
src/
  util.ts
dist/src/
  util.js
  util.js.map
  util.d.ts
  util.d.ts.map
```

Назначение этих файлов:

-   `util.js`: JavaScript-код, содержащийся в файле `util.ts`
-   `util.js.map`: карта исходного кода JavaScript. Она обеспечивает следующую функциональность при запуске `util.js`:
    -   В отладчике мы видим код TypeScript.
    -   Трассировка стека содержит местоположение исходного кода TypeScript.
-   `util.d.ts`: типы, определенные в `util.ts`
-   `util.d.ts.map`: карта деклараций - карта исходного кода для `util.d.ts`. Она позволяет редакторам TypeScript, которые ее поддерживают, (например) переходить к исходному коду TypeScript определения типа. Я считаю это полезным для библиотек. Именно поэтому я включаю исходный код TypeScript в их пакеты.

| Файл         | `tsconfig.json`          |
| ------------ | ------------------------ |
| `*.js.map`   | `"sourceMap": true`      |
| `*.d.ts`     | `"declaration": true`    |
| `*.d.ts.map` | `"declarationMap": true` |

### Компиляция TypeScript с помощью инструментов, отличных от `tsc`

Компилятор TypeScript выполняет три задачи:

1.  Проверка типов
2.  Эмиссия файлов JavaScript
3.  Эмиссия файлов деклараций

Сейчас существует множество инструментов, которые могут сделать #2 и #3 быстрее, чем `tsc`. Следующие настройки помогают этим инструментам, потому что они заставляют нас использовать подмножества TypeScript, которые легче компилировать:

```json
"compilerOptions": {
  //----- Helps with emitting .js -----
  // Enforces keyword `type` for type imports etc.
  "verbatimModuleSyntax": true, // implies "isolatedModules"
  // Forbids non-JavaScript language constructs such as
  // JSX, enums, constructor parameter properties and namespaces.
  // Important for type stripping.
  "erasableSyntaxOnly": true, // TS 5.8+

  //----- Helps with emitting .d.ts -----
  // - Forbids inferred return types of exported functions etc.
  // - Only allowed if `declaration` or `composite` are true
  "isolatedDeclarations": true,

  //----- tsc doesn’t emit any files, only type-checks -----
  "noEmit": true,
}
```

Подробнее об этих настройках см. в блоге [«Контрольный список для вашего `tsconfig.json`»](https://2ality.com/2025/01/tsconfig-json.html#compiling-without-tsc).

## `package.json` {#packagejson}

Некоторые настройки в `package.json` также влияют на TypeScript. Мы рассмотрим их далее. Похожие материалы:

-   Глава [«Пакеты: единицы JavaScript для распространения программного обеспечения»](https://exploringjs.com/nodejs-shell-scripting/ch_packages.html) книги «Shell scripting with Node.js» содержит исчерпывающий обзор пакетов npm.
-   Вы также можете взглянуть на [`package.json`](https://github.com/rauschma/helpers/blob/main/package.json) из `@rauschma/helpers`.

### Использование `.js` для модулей ESM

По умолчанию файлы `.js` интерпретируются как модули CommonJS. Следующая настройка позволяет нам использовать это расширение имени файла для модулей ESM:

```json
"type": "module",
```

### Какие файлы должны быть загружены в реестр npm?

Мы должны указать, какие файлы должны быть загружены в реестр npm. Хотя существует также файл `.npmignore`, явное указание того, что _включено_, более безопасно. Это делается через свойство `package.json` `"files"`:

```json
"files": [
  "package.json",
  "README.md",
  "LICENSE",

  "src/**/*.ts",
  "dist/**/*.js",
  "dist/**/*.js.map",
  "dist/**/*.d.ts",
  "dist/**/*.d.ts.map",

  "!src/**/*_test.ts",
  "!dist/**/*_test.js",
  "!dist/**/*_test.js.map",
  "!dist/**/*_test.d.ts",
  "!dist/**/*_test.d.ts.map"
],
```

В `.gitignore` мы проигнорировали каталог `dist/`, потому что он содержит информацию, которая может быть сгенерирована автоматически. Однако здесь она явно включена, потому что большая часть ее содержимого должна быть в пакете npm.

Шаблоны, начинающиеся с восклицательных знаков (`!`), определяют, какие файлы следует исключить. В данном случае мы исключаем тесты:

-   Некоторые из них находятся рядом с модулями в `src/`.
-   Остальные тесты находятся в `test/`, который даже не был включен.

### Экспорт пакетов

Если мы хотим, чтобы пакет поддерживал старый код, необходимо учитывать несколько свойств `package.json`:

-   `"main"`: ранее использовалось Node.js
-   `"module"`: ранее использовалось бандлерами
-   `"types"`: ранее использовалось TypeScript
-   `"typesVersions"`: ранее использовался TypeScript

В отличие от этого, для современного кода нам нужно только:

```json
"exports": {
  // Package exports go here
},
```

Прежде чем мы перейдем к деталям, необходимо рассмотреть два вопроса:

-   Будет ли наш пакет импортироваться только через «пустой» импорт или он будет поддерживать импорт по подпути?

    ```js
    import { someFunc } from 'my-package'; // bare import
    import { someFunc } from 'my-package/sub/path'; // subpath import
    ```

-   Если мы экспортируем подпути: Будут ли у них расширения имен файлов или нет?

Советы по ответу на последний вопрос:

-   Стиль без расширений имеет давние традиции. Это не сильно изменилось с появлением ESM, хотя он и требует расширений имен файлов для локального импорта.
-   Недостатки стиля без расширений (цитата из [документации Node.js](https://nodejs.org/api/packages.html#extensions-in-subpaths)): «Поскольку карты импорта теперь являются стандартом для разрешения пакетов в браузерах и других средах выполнения JavaScript, использование стиля без расширений может привести к раздутым определениям карт импорта. Явные расширения файлов позволяют избежать этой проблемы, позволяя карте импорта использовать отображение папки пакетов для отображения нескольких подпутей, где это возможно, вместо отдельной записи карты для экспорта подпути пакета. Это также отражает требование использования полного пути спецификатора в относительных и абсолютных спецификаторах импорта.»

Именно так я сейчас и решаю:

-   Большинство моих пакетов вообще не имеют подпутей.
-   Если пакет представляет собой набор модулей, я экспортирую их с расширениями.
-   Если модули больше похожи на разные версии пакета (например, синхронный или асинхронный), то я экспортирую их без расширений.

Однако у меня нет твердых предпочтений, и в будущем я могу изменить свое мнение.

#### Указание экспорта пакетов

```json
// Bare export
".": "./dist/src/main.js",

// Subpaths with extensions
"./util/errors.js": "./dist/src/util/errors.js", // single file
"./util/*": "./dist/src/util/*", // subtree

// Extensionless subpaths
"./util/errors": "./dist/src/util/errors.js", // single file
"./util/*": "./dist/src/util/*.js", // subtree
```

Примечания:

-   Если модулей немного, то несколько однофайловых записей будут более понятны, чем одна запись в поддереве.
-   По умолчанию файлы `.d.ts` должны располагаться рядом с файлами `.js`. Но это можно изменить с помощью [условия импорта типов](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#packagejson-exports-imports-and-self-referencing).

Дополнительные сведения по этой теме см. в разделе [«Экспорт пакетов: управление тем, что видят другие пакеты» в «Изучении JavaScript»](https://exploringjs.com/nodejs-shell-scripting/ch_packages.html#package-exports-controlling-what-other-packages-see).

### Импорт пакетов

Импорт пакетов Node также поддерживается TypeScript. Они позволяют нам определять псевдонимы для путей. Преимущество этих псевдонимов в том, что они начинаются с верхнего уровня пакета. Вот пример:

```json
"imports": {
  "#root/*": "./*"
},
```

Мы можем использовать импорт этого пакета следующим образом:

```ts
import pkg from '#root/package.json' with { type: 'json' };
console.log(pkg.version);
```

Чтобы это работало, нам нужно включить разрешение для JSON-модулей:

```json
"compilerOptions": {
  "resolveJsonModule": true,
}
```

Импорт пакетов особенно полезен, когда выходные файлы JavaScript более глубоко вложены, чем входные файлы TypeScript (как в нашем примере и в примере `@rauschma/helpers`). В этом случае мы не можем использовать относительные пути для доступа к файлам верхнего уровня.

### Скрипты пакетов

[Package scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts) позволяет нам определять псевдонимы, такие как `build`, для команд оболочки и выполнять их через `npm run build`. Мы можем получить список этих псевдонимов через `npm run` (без имени скрипта).

Эти команды я считаю полезными для своих библиотечных проектов:

```json
"scripts": {
  "\n========== Building ==========": "",
  "build": "npm run clean && tsc",
  "watch": "tsc --watch",
  "clean": "shx rm -rf ./dist/*",
  "\n========== Testing ==========": "",
  "test": "mocha --enable-source-maps --ui qunit",
  "testall": "mocha --enable-source-maps --ui qunit \"./dist/**/*_test.js\"",
  "\n========== Publishing ==========": "",
  "publishd": "npm publish --dry-run",
  "prepublishOnly": "npm run build"
},
```

Пояснения:

-   `build`: Я очищаю каталог `dist/` перед каждой сборкой. Почему? При переименовании файлов TypeScript старые выходные файлы не удаляются. Это особенно проблематично с тестовыми файлами и регулярно подводит меня. Когда это происходит, я могу исправить ситуацию с помощью `npm run build`.
-   `test`, `testall`:
    -   `--enable-source-maps` включает поддержку карт исходников в Node.js и, следовательно, точные номера строк в трассировках стека.
    -   Прогонщик тестов [Mocha](https://mochajs.org/) поддерживает несколько стилей тестирования. Я предпочитаю `--ui qunit` ([example](https://github.com/rauschma/helpers/blob/main/src/string/string_test.ts)).
-   `publishd`: Мы публикуем пакет npm с помощью `npm publish`. `npm run publishd` вызывает «сухую» версию этой команды, которая не вносит никаких изменений, но предоставляет полезную обратную связь - например, показывает, какие файлы войдут в пакет.
-   `prepublishOnly`: Перед тем как `npm publish` загрузит файлы в реестр npm, он вызывает этот скрипт. Собирая пакет перед публикацией, мы гарантируем, что в него не будут загружены устаревшие файлы.

Зачем нужны именованные разделители? Они облегчают чтение вывода `npm run`.

Если пакет содержит скрипты `«bin»`, то полезен следующий скрипт пакета (вызывается из `build`, после `tsc`):

```json
"chmod": "shx chmod u+x ./dist/src/markcheck.js",
```

#### Генерация документации {#typedoc}

Я использую [TypeDoc](https://typedoc.org/) для преобразования комментариев JSDoc в документацию API:

```json
"scripts": {
  "\n========== TypeDoc ==========": "",
  "api": "shx rm -rf docs/api/ && typedoc --out docs/api/ --readme none --entryPoints src --entryPointStrategy expand --exclude '**/*_test.ts'",
},
```

В качестве дополнительной меры я обслуживаю [страницы GitHub](https://docs.github.com/en/pages) из `docs/`:

-   Файл в репозитории: `my-package/docs/api/index.html`.
-   Файл в сети (пользователь `robin`): `https://robin.github.io/my-package/api/index.html`.

Вы можете ознакомиться с [документацией по API для `@rauschma/helpers`](https://rauschma.github.io/helpers/api/) онлайн (предупреждение: все еще недостаточно документировано).

### Зависимости для разработки

Даже если у моего пакета нет обычных зависимостей, он, как правило, имеет следующие зависимости для разработки:

```json
"devDependencies": {
  "@types/mocha": "^10.0.6",
  "@types/node": "^20.12.12",
  "mocha": "^10.4.0",
  "shx": "^0.3.4",
  "typedoc": "^0.27.6"
},
```

Пояснения:

-   `@types/node`: В модульных тестах я использую `node:assert` для утверждений, таких как `assert.deepEqual()`. Эта зависимость предоставляет типы для этого и других модулей Node.

-   `shx`: предоставляет кроссплатформенные версии команд оболочки Unix. Я часто использую:

    ```
    shx rm -rf
    shx chmod u+x
    ```

    Я также устанавливаю следующие два инструмента командной строки локально внутри своих проектов, чтобы они гарантированно были там. Самое замечательное в `npm run` то, что он добавляет локально установленные команды в путь оболочки - это означает, что их можно использовать в сценариях пакетов, как если бы они были установлены глобально.

-   `mocha` и `@types/mocha`: Я по-прежнему предпочитаю API и CLI Mocha, но [встроенный в Node тестовый прогон](https://nodejs.org/api/test.html) стал интересной альтернативой.
-   `typedoc`: Я использую TypeDoc для создания документации по API.

## Инструменты

### Линтование пакетов npm

Общая линтинг пакетов:

-   [publint](https://publint.dev/): «Линтует пакеты npm для обеспечения максимальной совместимости в различных средах, таких как Vite, Webpack, Rollup, Node.js и т. д.».
-   [npm-package-json-lint](https://npmpackagejsonlint.org/): «Настраиваемый линтер для файлов `package.json`»
-   [installed-check](https://github.com/voxpelli/node-installed-check): «Проверяет соответствие установленных модулей требованиям [диапазон версий Node.js [`движков`](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#engines)], указанным в `package.json``.»
-   [Knip](https://knip.dev/): «Находит и исправляет неиспользуемые файлы, зависимости и экспорт».

Линтование модулей:

-   [Madge](https://www.npmjs.com/package/madge): создание визуального графа зависимостей модулей, поиск круговых зависимостей и многое другое.

Линтинг типов TypeScript:

-   [arethetypeswrong](https://github.com/arethetypeswrong/arethetypeswrong.github.io): «Этот проект пытается проанализировать содержимое пакетов npm на предмет проблем с их TypeScript-типами, в частности, проблем с разрешением модулей, связанных с ESM.»

### Инструменты, связанные с CommonJS

Эти инструменты постепенно теряют свою актуальность, поскольку все больше пакетов используют ESM, а требование ESM из CommonJS («require(esm)») теперь достаточно хорошо работает в Node.js:

-   [tshy - TypeScript HYbridizer](https://github.com/isaacs/tshy): Компилирует TypeScript в гибридные пакеты ESM/CommonJS.
-   [ESM-CJS Interop Test](https://andrewbranch.github.io/interop-test/): Немного устаревший, но полезный список вещей, которые могут пойти не так при импорте модуля CommonJS из ESM.

## Дальнейшее чтение

-   Модули JavaScript (ESM): Глава [«Модули»](https://exploringjs.com/js/book/ch_modules.html) в «Exploring JavaScript».
-   пакеты npm: Глава [«Пакеты: подразделения JavaScript для распространения программного обеспечения»](https://exploringjs.com/nodejs-shell-scripting/ch_packages.html) в «Shell scripting with Node.js»
-   `tsconfig.json`: Заметка в блоге [«Контрольный список для вашего `tsconfig.json`»](https://2ality.com/2025/01/tsconfig-json.html)

Также полезно:

-   Глава [«Модули: пакеты»](https://nodejs.org/api/packages.html) документации по Node.js.
-   Раздел [«`package.json „exports“`»](https://www.typescriptlang.org/docs/handbook/modules/reference.html#packagejson-exports) руководства по TypeScript

<small>:material-information-outline: Источник &mdash; <https://2ality.com/2025/02/typescript-esm-packages.html></small>
