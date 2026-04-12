---
title: Модули: TypeScript
description: Встроенная поддержка TypeScript в Node.js — снятие типов, ограничения и полная поддержка через сторонние пакеты
---

# Модули: TypeScript

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/typescript.html)

<!-- YAML
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/61803
    description: Removed `--experimental-transform-types` flag.
  - version:
      - v25.2.0
      - v24.12.0
    pr-url: https://github.com/nodejs/node/pull/60600
    description: Type stripping is now stable.
  - version:
     - v24.3.0
     - v22.18.0
    pr-url: https://github.com/nodejs/node/pull/58643
    description: Type stripping no longer emits an experimental warning.
  - version:
     - v23.6.0
     - v22.18.0
    pr-url: https://github.com/nodejs/node/pull/56350
    description: Type stripping is enabled by default.
  - version: v22.7.0
    pr-url: https://github.com/nodejs/node/pull/54283
    description: Added `--experimental-transform-types` flag.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Удален флаг `--experimental-transform-types`. |
    | v25.2.0, v24.12.0 | Удаление типов теперь стабильно. |
    | v24.3.0, v22.18.0 | Удаление типов больше не выдает экспериментальное предупреждение. |
    | v23.6.0, v22.18.0 | Удаление типов включено по умолчанию. |
    | v22.7.0 | Добавлен флаг --experimental-transform-types. |

<!--introduced_in=v22.6.0-->

!!!success "Стабильность: 2 – Стабильная"

    API является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

## Включение

Поддержку TypeScript во время выполнения в Node.js можно включить двумя способами:

1.  Для [полной поддержки][full support] всего синтаксиса и возможностей TypeScript, включая
    любую версию TypeScript, используйте сторонний пакет.

2.  Для облегчённого режима можно пользоваться встроенной поддержкой
    [снятия типов][type stripping].

## Полная поддержка TypeScript {: #full-typescript-support}

Чтобы использовать TypeScript со всеми возможностями, включая
`tsconfig.json`, можно подключить сторонний пакет. Ниже в качестве примера используется
[`tsx`][], но доступны и другие похожие библиотеки.

1.  Установите пакет как dev-зависимость тем менеджером пакетов, которым пользуетесь. Например, с `npm`:

    ```bash
    npm install --save-dev tsx
    ```

2.  Запуск TypeScript-кода:

    ```bash
    npx tsx your-file.ts
    ```

    Либо через `node`:

    ```bash
    node --import=tsx your-file.ts
    ```

## Снятие типов {: #type-stripping}

<!-- YAML
added: v22.6.0
changes:
  - version:
      - v25.2.0
      - v24.12.0
    pr-url: https://github.com/nodejs/node/pull/60600
    description: Type stripping is now stable.
-->

Добавлено в: v22.6.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v25.2.0, v24.12.0 | Удаление типов теперь стабильно. |

По умолчанию Node.js выполняет файлы TypeScript, содержащие только
стираемый синтаксис TypeScript.
Синтаксис TypeScript заменяется пробельными символами,
проверка типов не выполняется.
Чтобы отключить это поведение, используйте флаг [`--no-strip-types`][].

Node.js не читает `tsconfig.json`, поэтому
возможности, зависящие от настроек в `tsconfig.json`
(например paths или транспиляция нового JS в старый стандарт),
намеренно не поддерживаются. Для полной поддержки TypeScript см. раздел [Полная поддержка TypeScript][Full TypeScript support].

Снятие типов рассчитано на минимальные накладные расходы:
не поддерживаются конструкции, требующие генерации JavaScript-кода,
а встроенные типы заменяются пробелами, поэтому Node.js может выполнять
код TypeScript без карт исходников.

Снятие типов совместимо с большинством версий TypeScript;
рекомендуется версия 5.8 или новее со следующими настройками `tsconfig.json`:

```json
{
  "compilerOptions": {
     "noEmit": true, // Optional - see note below
     "target": "esnext",
     "module": "nodenext",
     "rewriteRelativeImportExtensions": true,
     "erasableSyntaxOnly": true,
     "verbatimModuleSyntax": true
  }
}
```

Опцию `noEmit` имеет смысл включать, если вы только выполняете файлы `*.ts`, например
скрипты сборки. Если вы планируете распространять файлы `*.js`,
эта опция не нужна.

### Выбор системы модулей {: #determining-module-system}

Node.js поддерживает в файлах TypeScript и [CommonJS][], и [ES-модули][ES Modules].
Node.js не преобразует одну систему модулей в другую: для ES-модуля нужны `import` и `export`,
для CommonJS — `require` и `module.exports`.

*   Для файлов `.ts` система модулей определяется [так же, как для `.js`][the same way as `.js` files.].
    Чтобы использовать `import` и `export`, добавьте `"type": "module"` в
    ближайший родительский `package.json`.
*   Файлы `.mts` всегда выполняются как ES-модули, аналогично `.mjs`.
*   Файлы `.cts` всегда выполняются как CommonJS, аналогично `.cjs`.
*   Файлы `.tsx` не поддерживаются.

Как и в JavaScript, в операторах `import` и выражениях `import()`
[расширения файлов обязательны][file extensions are mandatory]: `import './file.ts'`, а не `import './file'`.
Из соображений обратной совместимости расширения обязательны и в вызовах
`require()`: `require('./file.ts')`, а не `require('./file')`, по аналогии с обязательным
`.cjs` в CommonJS.

Опция `tsconfig.json` `allowImportingTsExtensions` позволяет компилятору `tsc`
проверять типы при импорте с указанием расширения `.ts`.

### Возможности TypeScript {: #typescript-features}

Node.js только удаляет встроенные типы; любые конструкции TypeScript, для которых нужно
_заменить_ синтаксис TypeScript на новый синтаксис JavaScript, приведут к ошибке.

Наиболее заметные случаи, требующие трансформации:

*   объявления `enum`
*   `namespace` с исполняемым кодом во время выполнения
*   свойства параметров конструктора (parameter properties)
*   псевдонимы импорта

`namespace` без исполняемого кода поддерживаются.
Следующий пример будет работать:

```ts
// This namespace is exporting a type
namespace TypeOnly {
   export type A = string;
}
```

Ниже будет ошибка [`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`][]:

```ts
// This namespace is exporting a value
namespace A {
   export let x = 1
}
```

Декораторы сейчас на стадии [TC39 Stage 3](https://github.com/tc39/proposal-decorators),
они не трансформируются и вызывают ошибку разбора.
Node.js не подставляет полифиллы и не будет поддерживать декораторы до их
нативной поддержки в JavaScript.

Кроме того, Node.js не читает `tsconfig.json` и не поддерживает
возможности, зависящие от его настроек (paths, транспиляция нового синтаксиса в старый и т.д.).

### Импорт типов без ключевого слова `type` {: #importing-types-without-type-keyword}

При снятии типов ключевое слово `type` нужно, чтобы корректно отделить импорты типов.
Без `type` Node.js считает импорт значимым на этапе выполнения, что приведёт к ошибке.
Поведение можно согласовать с опцией [`verbatimModuleSyntax`][].

Корректный пример:

```ts
import type { Type1, Type2 } from './module.ts';
import { fn, type FnParams } from './fn.ts';
```

Ниже будет ошибка времени выполнения:

```ts
import { Type1, Type2 } from './module.ts';
import { fn, FnParams } from './fn.ts';
```

### Не файловый ввод {: #non-file-forms-of-input}

Снятие типов можно включить для `--eval` и STDIN. Система модулей
определяется параметром `--input-type`, как для JavaScript.

Синтаксис TypeScript в REPL, `--check` и `inspect` не поддерживается.

### Карты исходников {: #source-maps}

Встроенные типы заменяются пробелами, поэтому для корректных номеров строк в трассах стека
карты исходников не нужны; Node.js их не генерирует.

### Снятие типов в зависимостях {: #type-stripping-in-dependencies}

Чтобы авторы пакетов не публиковали код на TypeScript,
Node.js не обрабатывает файлы `.ts` внутри каталогов по пути `node_modules`.

### Псевдонимы путей {: #paths-aliases}

Настройка [`tsconfig` "paths"][] не трансформируется и приводит к ошибке. Ближайший аналог —
[подпути импорта][subpath imports], с ограничением: они должны начинаться с `#`.

<!-- markdownlint-disable MD051 --><!-- внутренние якоря через pymdown `{: #id}` -->
[CommonJS]: modules.md
[ES Modules]: esm.md
[Full TypeScript support]: #full-typescript-support
[`--no-strip-types`]: cli.md#--no-strip-types
[`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`]: errors.md#err_unsupported_typescript_syntax
[`tsconfig` "paths"]: https://www.typescriptlang.org/tsconfig/#paths
[`tsx`]: https://tsx.is/
[`verbatimModuleSyntax`]: https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax
[file extensions are mandatory]: esm.md#mandatory-file-extensions
[full support]: #full-typescript-support
[subpath imports]: packages.md#subpath-imports
[the same way as `.js` files.]: packages.md#determining-module-system
[type stripping]: #type-stripping
<!-- markdownlint-enable MD051 -->
