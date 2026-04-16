---
title: REPL
description: Модуль node:repl реализует Read-Eval-Print-Loop (REPL) — как отдельную программу, так и для встраивания в приложения
---

# REPL

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/repl.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/repl.js -->

Модуль `node:repl` реализует цикл Read-Eval-Print-Loop (REPL): его можно запускать
отдельно или встраивать в другие приложения. Подключение:

=== "MJS"

    ```js
    import repl from 'node:repl';
    ```

=== "CJS"

    ```js
    const repl = require('node:repl');
    ```

## Дизайн и возможности

Модуль `node:repl` экспортирует класс [`repl.REPLServer`](#class-replserver). Во время работы
экземпляры [`repl.REPLServer`](#class-replserver) принимают построчный ввод пользователя,
вычисляют его заданной функцией оценки и выводят результат. Ввод и вывод могут
идти из `stdin` и в `stdout` или подключаться к любому [stream][stream] Node.js.

Экземпляры [`repl.REPLServer`](#class-replserver) поддерживают автодополнение, предпросмотр дополнений,
простое редактирование строк в стиле Emacs, многострочный ввод,
reverse-i-search в духе [ZSH][ZSH], поиск по подстроке в истории в духе [ZSH][ZSH],
вывод с ANSI-оформлением, сохранение и восстановление состояния сессии REPL,
восстановление после ошибок и настраиваемые функции оценки. Терминалы без ANSI
и без редактирования в стиле Emacs переходят на ограниченный набор функций.

### Команды и специальные клавиши

Поддерживаются такие специальные команды:

* `.break`: при вводе многострочного выражения команда `.break` (или <kbd>Ctrl</kbd>+<kbd>C</kbd>) прерывает
  дальнейший ввод или обработку выражения.
* `.clear`: сбрасывает `context` REPL в пустой объект и очищает текущий многострочный ввод.
* `.exit`: закрывает поток ввода-вывода и завершает REPL.
* `.help`: показать список специальных команд.
* `.save`: сохранить текущую сессию REPL в файл:
  `> .save ./file/to/save.js`
* `.load`: загрузить файл в текущую сессию REPL.
  `> .load ./file/to/load.js`
* `.editor`: режим редактора (<kbd>Ctrl</kbd>+<kbd>D</kbd> —
  завершить, <kbd>Ctrl</kbd>+<kbd>C</kbd> — отмена).

```console
> .editor
// Entering editor mode (^D to finish, ^C to cancel)
function welcome(name) {
  return `Hello ${name}!`;
}

welcome('Node.js User');

// ^D
'Hello Node.js User!'
>
```

Сочетания клавиш в REPL:

* <kbd>Ctrl</kbd>+<kbd>C</kbd>: одно нажатие — как команда `.break`;
  дважды на пустой строке — как `.exit`.
* <kbd>Ctrl</kbd>+<kbd>D</kbd>: как `.exit`.
* <kbd>Tab</kbd> на пустой строке — глобальные и локальные (область видимости) переменные;
  при вводе текста — варианты автодополнения.

Привязки клавиш для reverse-i-search см. в [`reverse-i-search`](#reverse-i-search).
Остальные — в [привязках клавиш TTY][привязках клавиш TTY].

### Оценка по умолчанию

По умолчанию все экземпляры [`repl.REPLServer`](#class-replserver) используют функцию оценки,
которая вычисляет выражения JavaScript и даёт доступ к встроенным модулям Node.js.
Поведение можно переопределить, передав другую функцию оценки при создании [`repl.REPLServer`](#class-replserver).

#### Выражения JavaScript

Встроенный оценщик поддерживает прямое вычисление выражений JavaScript:

```console
> 1 + 1
2
> const m = 2
undefined
> m + 1
3
```

Если иное не ограничено блоками или функциями, переменные, объявленные
явно или через `const`, `let`, `var`,
оказываются в глобальной области видимости.

#### Глобальная и локальная область

Встроенный оценщик даёт доступ к переменным глобальной области.
Переменную можно явно вывести в REPL, присвоив её объекту `context` у `REPLServer`:

=== "MJS"

    ```js
    import repl from 'node:repl';
    const msg = 'message';
    
    repl.start('> ').context.m = msg;
    ```

=== "CJS"

    ```js
    const repl = require('node:repl');
    const msg = 'message';
    
    repl.start('> ').context.m = msg;
    ```

Свойства `context` в REPL выглядят как локальные:

```console
$ node repl_test.js
> m
'message'
```

По умолчанию свойства `context` не только для чтения. Чтобы задать глобальные только для чтения,
используйте `Object.defineProperty()`:

=== "MJS"

    ```js
    import repl from 'node:repl';
    const msg = 'message';
    
    const r = repl.start('> ');
    Object.defineProperty(r.context, 'm', {
      configurable: false,
      enumerable: true,
      value: msg,
    });
    ```

=== "CJS"

    ```js
    const repl = require('node:repl');
    const msg = 'message';
    
    const r = repl.start('> ');
    Object.defineProperty(r.context, 'm', {
      configurable: false,
      enumerable: true,
      value: msg,
    });
    ```

#### Доступ к встроенным модулям Node.js

Встроенный оценщик подгружает встроенные модули Node.js в окружение REPL по мере использования.
Например, если `fs` не объявлен иначе, ввод `fs` вычисляется по требованию как
`global.fs = require('node:fs')`.

```console
> fs.createReadStream('./some/file');
```

#### Глобальные необработанные исключения

<!-- YAML
changes:
  - version: v12.3.0
    pr-url: https://github.com/nodejs/node/pull/27151
    description: The `'uncaughtException'` event is from now on triggered if the
                 repl is used as standalone program.
-->

REPL использует модуль [`domain`](domain.md), чтобы перехватывать все необработанные исключения сессии.

Такое использование [`domain`](domain.md) в REPL даёт такие эффекты:

* Событие [`'uncaughtException'`](process.md#event-uncaughtexception) для необработанных исключений испускается только в
  автономном REPL. Подписка на это событие внутри REPL, встроенного в другую программу Node.js,
  даёт [`ERR_INVALID_REPL_INPUT`](errors.md#err_invalid_repl_input).

  ```js
  const r = repl.start();

  r.write('process.on("uncaughtException", () => console.log("Foobar"));\n');
  // Output stream includes:
  //   TypeError [ERR_INVALID_REPL_INPUT]: Listeners for `uncaughtException`
  //   cannot be used in the REPL

  r.close();
  ```

* Вызов [`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) выбрасывает
  [`ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE`](errors.md#err_domain_cannot_set_uncaught_exception_capture).

#### Переменная `_` (подчёркивание)

<!-- YAML
changes:
  - version: v9.8.0
    pr-url: https://github.com/nodejs/node/pull/18919
    description: Added `_error` support.
-->

По умолчанию оценщик присваивает результат последнего вычисленного выражения
специальной переменной `_`.
Явное присваивание `_` отключает это поведение.

```console
> [ 'a', 'b', 'c' ]
[ 'a', 'b', 'c' ]
> _.length
3
> _ += 1
Expression assignment to _ now disabled.
4
> 1 + 1
2
> _
4
```

Аналогично `_error` ссылается на последнюю ошибку, если она была.
Явное присваивание `_error` отключает это поведение.

```console
> throw new Error('foo');
Uncaught Error: foo
> _error.message
'foo'
```

#### Ключевое слово `await`

На верхнем уровне включена поддержка `await`.

```console
> await Promise.resolve(123)
123
> await Promise.reject(new Error('REPL await'))
Uncaught Error: REPL await
    at REPL2:1:54
> const timeout = util.promisify(setTimeout);
undefined
> const old = Date.now(); await timeout(1000); console.log(Date.now() - old);
1002
undefined
```

Известное ограничение: использование `await` в REPL нарушает
лексическую область видимости для `const`.

Пример:

```console
> const m = await Promise.resolve(123)
undefined
> m
123
> m = await Promise.resolve(234)
234
// redeclaring the constant does error
> const m = await Promise.resolve(345)
Uncaught SyntaxError: Identifier 'm' has already been declared
```

Флаг [`--no-experimental-repl-await`](cli.md#--no-experimental-repl-await) отключает `await` верхнего уровня в REPL.

### Обратный инкрементальный поиск

<!-- YAML
added:
 - v13.6.0
 - v12.17.0
-->

REPL поддерживает двунаправленный reverse-i-search в духе [ZSH][ZSH]. Запуск:
<kbd>Ctrl</kbd>+<kbd>R</kbd> — назад, <kbd>Ctrl</kbd>+<kbd>S</kbd> — вперёд.

Повторяющиеся записи истории пропускаются.

Запись принимается при нажатии любой клавиши, не относящейся к поиску. Отмена — <kbd>Esc</kbd>
или <kbd>Ctrl</kbd>+<kbd>C</kbd>.

Смена направления сразу ищет следующую запись в новом направлении от текущей позиции.

### Пользовательские функции оценки

При создании [`repl.REPLServer`](#class-replserver) можно передать свою функцию оценки —
например для полностью кастомного REPL.

Функция оценки принимает четыре аргумента:

* `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Код для выполнения (например `1 + 1`).
* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Контекст выполнения — глобальный JavaScript или контекст экземпляра REPL в зависимости от `useGlobal`.
* `replResourceName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Идентификатор ресурса REPL для текущей оценки (удобно для отладки).
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается по завершении оценки с двумя параметрами:
  * объект ошибки при ошибке оценки, иначе `null`/`undefined`;
  * результат оценки (не используется, если передана ошибка).

Ниже REPL возводит число в квадрат; при нечисловом вводе выводится ошибка:

=== "MJS"

    ```js
    import repl from 'node:repl';
    
    function byThePowerOfTwo(number) {
      return number * number;
    }
    
    function myEval(code, context, replResourceName, callback) {
      if (isNaN(code)) {
        callback(new Error(`${code.trim()} is not a number`));
      } else {
        callback(null, byThePowerOfTwo(code));
      }
    }
    
    repl.start({ prompt: 'Enter a number: ', eval: myEval });
    ```

=== "CJS"

    ```js
    const repl = require('node:repl');
    
    function byThePowerOfTwo(number) {
      return number * number;
    }
    
    function myEval(code, context, replResourceName, callback) {
      if (isNaN(code)) {
        callback(new Error(`${code.trim()} is not a number`));
      } else {
        callback(null, byThePowerOfTwo(code));
      }
    }
    
    repl.start({ prompt: 'Enter a number: ', eval: myEval });
    ```

#### Восстанавливаемые ошибки

При нажатии <kbd>Enter</kbd> текущая строка передаётся в `eval`.
Для многострочного ввода `eval` может возвращать экземпляр `repl.Recoverable` в callback:

```js
function myEval(cmd, context, filename, callback) {
  let result;
  try {
    result = vm.runInThisContext(cmd);
  } catch (e) {
    if (isRecoverableError(e)) {
      return callback(new repl.Recoverable(e));
    }
  }
  callback(null, result);
}

function isRecoverableError(error) {
  if (error.name === 'SyntaxError') {
    return /^(Unexpected end of input|Unexpected token)/.test(error.message);
  }
  return false;
}
```

### Настройка вывода REPL

По умолчанию [`repl.REPLServer`](#class-replserver) форматирует вывод через [`util.inspect()`](util.md#utilinspectobject-options)
перед записью в переданный поток `Writable` (по умолчанию `process.stdout`).
Опция `showProxy` в инспекции по умолчанию `true`, `colors` зависит от `useColors` у REPL.

Булево `useColors` при создании задаёт использование ANSI для цветного вывода `util.inspect()`.

В автономном REPL можно менять [параметры инспекции](util.md#utilinspectobject-options) изнутри через
`inspect.replDefaults` — зеркало `defaultOptions` из [`util.inspect()`](util.md#utilinspectobject-options).

```console
> util.inspect.replDefaults.compact = false;
false
> [1]
[
  1
]
>
```

Чтобы полностью задать вывод [`repl.REPLServer`](#class-replserver), передайте свою функцию в опции `writer`.
В примере весь текст переводится в верхний регистр:

=== "MJS"

    ```js
    import repl from 'node:repl';
    
    const r = repl.start({ prompt: '> ', eval: myEval, writer: myWriter });
    
    function myEval(cmd, context, filename, callback) {
      callback(null, cmd);
    }
    
    function myWriter(output) {
      return output.toUpperCase();
    }
    ```

=== "CJS"

    ```js
    const repl = require('node:repl');
    
    const r = repl.start({ prompt: '> ', eval: myEval, writer: myWriter });
    
    function myEval(cmd, context, filename, callback) {
      callback(null, cmd);
    }
    
    function myWriter(output) {
      return output.toUpperCase();
    }
    ```

## Класс: `REPLServer`

<!-- YAML
added: v0.1.91
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [`repl.start()`](#replstartoptions)
* Наследует: [`<readline.Interface>`](readline.md)

Экземпляры `repl.REPLServer` создаются через [`repl.start()`](#replstartoptions)
или напрямую оператором `new`.

=== "MJS"

    ```js
    import repl from 'node:repl';
    
    const options = { useColors: true };
    
    const firstInstance = repl.start(options);
    const secondInstance = new repl.REPLServer(options);
    ```

=== "CJS"

    ```js
    const repl = require('node:repl');
    
    const options = { useColors: true };
    
    const firstInstance = repl.start(options);
    const secondInstance = new repl.REPLServer(options);
    ```

### Событие: `'exit'`

<!-- YAML
added: v0.7.7
-->

Событие `'exit'` испускается при выходе из REPL: команда `.exit`, двойное
<kbd>Ctrl</kbd>+<kbd>C</kbd> (`SIGINT`)
или <kbd>Ctrl</kbd>+<kbd>D</kbd> (`'end'` на потоке ввода). Обработчик
вызывается без аргументов.

```js
replServer.on('exit', () => {
  console.log('Received "exit" event from repl!');
  process.exit();
});
```

### Событие: `'reset'`

<!-- YAML
added: v0.11.0
-->

Событие `'reset'` испускается при сбросе контекста REPL — при вводе `.clear`,
_кроме_ случая встроенного оценщика и `repl.REPLServer` с `useGlobal: true`.
Обработчику передаётся только ссылка на `context`.

Обычно используют для повторной инициализации контекста:

=== "MJS"

    ```js
    import repl from 'node:repl';
    
    function initializeContext(context) {
      context.m = 'test';
    }
    
    const r = repl.start({ prompt: '> ' });
    initializeContext(r.context);
    
    r.on('reset', initializeContext);
    ```

=== "CJS"

    ```js
    const repl = require('node:repl');
    
    function initializeContext(context) {
      context.m = 'test';
    }
    
    const r = repl.start({ prompt: '> ' });
    initializeContext(r.context);
    
    r.on('reset', initializeContext);
    ```

После запуска глобальную `'m'` можно менять, а `.clear` вернёт начальное значение:

```console
$ ./node example.js
> m
'test'
> m = 1
1
> m
1
> .clear
Clearing context...
> m
'test'
>
```

### `replServer.defineCommand(keyword, cmd)`

<!-- YAML
added: v0.3.0
-->

* `keyword` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Ключевое слово команды (_без_ ведущей `.`).
* `cmd` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, вызываемая при обработке команды.

`replServer.defineCommand()` добавляет новые команды с префиксом `.` в экземпляр REPL.
Ввод: `.` и `keyword`. `cmd` — либо `Function`, либо `Object` со свойствами:

* `help` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текст для `.help` (необязательно).
* `action` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Выполняемая функция, опционально с одним строковым аргументом.

Пример двух новых команд:

=== "MJS"

    ```js
    import repl from 'node:repl';
    
    const replServer = repl.start({ prompt: '> ' });
    replServer.defineCommand('sayhello', {
      help: 'Say hello',
      action(name) {
        this.clearBufferedCommand();
        console.log(`Hello, ${name}!`);
        this.displayPrompt();
      },
    });
    replServer.defineCommand('saybye', function saybye() {
      console.log('Goodbye!');
      this.close();
    });
    ```

=== "CJS"

    ```js
    const repl = require('node:repl');
    
    const replServer = repl.start({ prompt: '> ' });
    replServer.defineCommand('sayhello', {
      help: 'Say hello',
      action(name) {
        this.clearBufferedCommand();
        console.log(`Hello, ${name}!`);
        this.displayPrompt();
      },
    });
    replServer.defineCommand('saybye', function saybye() {
      console.log('Goodbye!');
      this.close();
    });
    ```

Команды можно вызывать в REPL:

```console
> .sayhello Node.js User
Hello, Node.js User!
> .saybye
Goodbye!
```

### `replServer.displayPrompt([preserveCursor])`

<!-- YAML
added: v0.1.91
-->

* `preserveCursor` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`replServer.displayPrompt()` готовит REPL к вводу: выводит настроенный `prompt` на новой строке в `output`
и возобновляет приём в `input`.

При многострочном вводе вместо `prompt` выводится `'|'`.

При `preserveCursor: true` позиция курсора не сбрасывается в `0`.

Обычно вызывается из `action` команд, зарегистрированных через `replServer.defineCommand()`.

### `replServer.clearBufferedCommand()`

<!-- YAML
added: v9.0.0
-->

`replServer.clearBufferedCommand()` очищает буферизованную, но ещё не выполненную команду.
Обычно вызывается из `action` команд `replServer.defineCommand()`.

### `replServer.setupHistory(historyConfig, callback)`

<!-- YAML
added: v11.10.0
changes:
  - version: v24.2.0
    pr-url: https://github.com/nodejs/node/pull/58225
    description: Updated the `historyConfig` parameter to accept an object
                 with `filePath`, `size`, `removeHistoryDuplicates` and
                 `onHistoryFileLoaded` properties.
-->

Добавлено в: v11.10.0

* `historyConfig` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь к файлу истории.
  Если строка — это путь к файлу.
  Если объект, возможны свойства:
  * `filePath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) путь к файлу истории
  * `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум строк истории. Чтобы отключить историю, укажите `0`. Имеет смысл только если
    `terminal` равен `true` (пользователем или проверкой `output`),
    иначе кэш истории не инициализируется.
    **По умолчанию:** `30`.
  * `removeHistoryDuplicates` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` при добавлении строки, дублирующей более старую, старая удаляется.
    **По умолчанию:** `false`.
  * `onHistoryFileLoaded` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызывается при готовности записи истории или при ошибке
    * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    * `repl` [`<repl.REPLServer>`](#class-replserver)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) то же (необязателен, если задан `onHistoryFileLoaded` в `historyConfig`)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `repl` [`<repl.REPLServer>`](#class-replserver)

Инициализирует файл истории для экземпляра REPL. При запуске `node` с интерактивным REPL файл истории
создаётся по умолчанию; при программном создании REPL — нет. Используйте этот метод для файла истории
при программной работе с REPL.

## `repl.builtinModules`

<!-- YAML
added: v14.5.0
deprecated:
  - v24.0.0
  - v22.16.0
-->

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Используйте [module.builtinModules][module.builtinModules] вместо этого API.

* Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список имён части модулей Node.js, например `'http'`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/repl-builtin-modules)):

```bash
npx codemod@latest @nodejs/repl-builtin-modules
```

## `repl.start([options])`

<!-- YAML
added: v0.1.91
changes:
  - version: v25.9.0
    pr-url: https://github.com/nodejs/node/pull/62188
    description: The `handleError` parameter has been added.
  - version: v24.1.0
    pr-url: https://github.com/nodejs/node/pull/58003
    description: Added the possibility to add/edit/remove multilines
                 while adding a multiline command.
  - version: v24.0.0
    pr-url: https://github.com/nodejs/node/pull/57400
    description: The multi-line indicator is now "|" instead of "...".
                 Added support for multi-line history.
                 It is now possible to "fix" multi-line commands with syntax errors
                 by visiting the history and editing the command.
                 When visiting the multiline history from an old node version,
                 the multiline structure is not preserved.
  - version:
     - v13.4.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/30811
    description: The `preview` option is now available.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26518
    description: The `terminal` option now follows the default description in
                 all cases and `useColors` checks `hasColors()` if available.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19187
    description: The `REPL_MAGIC_MODE` `replMode` was removed.
  - version: v6.3.0
    pr-url: https://github.com/nodejs/node/pull/6635
    description: The `breakEvalOnSigint` option is supported now.
  - version: v5.8.0
    pr-url: https://github.com/nodejs/node/pull/5388
    description: The `options` parameter is optional now.
-->

Добавлено в: v0.1.91

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `prompt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Приглашение ввода. **По умолчанию:** `'> '`
    (с пробелом в конце).
  * `input` [`<stream.Readable>`](stream.md#streamreadable) Поток `Readable` для ввода REPL.
    **По умолчанию:** `process.stdin`.
  * `output` [`<stream.Writable>`](stream.md#streamwritable) Поток `Writable` для вывода REPL.
    **По умолчанию:** `process.stdout`.
  * `terminal` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` вывод `output` считается TTY.
    **По умолчанию:** проверка `isTTY` у `output` при создании.
  * `eval` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция оценки каждой строки ввода. **По умолчанию:** асинхронная обёртка над `eval()`.
    Ошибка с `repl.Recoverable` означает неполный ввод и запрос дополнительных строк. См. раздел
    [пользовательские функции вычисления][пользовательские функции вычисления].
  * `useColors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` встроенный `writer` добавляет ANSI-цвета к выводу. При своём `writer` не действует.
    **По умолчанию:** проверка цветов на `output`, если у репла `terminal` равен `true`.
  * `useGlobal` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` встроенный оценщик использует JavaScript `global`, а не отдельный контекст REPL.
    CLI `node` задаёт `true`. **По умолчанию:** `false`.
  * `ignoreUndefined` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` встроенный writer не выводит результат команды, если он `undefined`. **По умолчанию:** `false`.
  * `writer` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Форматирование вывода каждой команды перед записью в `output`. **По умолчанию:** [`util.inspect()`](util.md#utilinspectobject-options).
  * `completer` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательно: своё автодополнение по Tab. Пример — [`readline.InterfaceCompleter`](readline.md#use-of-the-completer-function).
  * `replMode` [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Режим оценщика: strict или sloppy.
    Значения:
    * `repl.REPL_MODE_SLOPPY` — нестрогий режим.
    * `repl.REPL_MODE_STRICT` — строгий режим (как `'use strict'` перед каждой строкой).
  * `breakEvalOnSigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Остановить оценку текущего кода при `SIGINT` (<kbd>Ctrl</kbd>+<kbd>C</kbd>).
    Несовместимо с пользовательским `eval`. **По умолчанию:** `false`.
  * `preview` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Печатать ли предпросмотр автодополнения и вывода. **По умолчанию:** `true` со встроенным `eval` и
    `false` с пользовательским `eval`. Если `terminal` ложен, предпросмотра нет, `preview` не влияет.
  * `handleError` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Настройка обработки ошибок в REPL.
    Первый аргумент — исключение; синхронно вернуть одно из:
    * `'print'` — вывести ошибку в поток вывода (по умолчанию).
    * `'ignore'` — пропустить остальную обработку ошибки.
    * `'unhandled'` — считать исключение полностью необработанным; оно уйдёт в глобальные обработчики, например
      [`'uncaughtException'`](process.md#event-uncaughtexception).
      `'unhandled'` при уже закрытом `REPLServer` может быть нежелателен — зависит от задачи.
* Возвращает: [`<repl.REPLServer>`](#class-replserver)

`repl.start()` создаёт и запускает экземпляр [`repl.REPLServer`](#class-replserver).

Если `options` — строка, она задаёт приглашение:

=== "MJS"

    ```js
    import repl from 'node:repl';
    
    // приглашение в стиле Unix
    repl.start('$ ');
    ```

=== "CJS"

    ```js
    const repl = require('node:repl');
    
    // приглашение в стиле Unix
    repl.start('$ ');
    ```

## REPL Node.js

Сам Node.js использует `node:repl` для интерактивного выполнения JavaScript.
Запуск: бинарник `node` без аргументов (или с `-i`):

```console
$ node
> const a = [1, 2, 3];
undefined
> a
[ 1, 2, 3 ]
> a.forEach((v) => {
...   console.log(v);
...   });
1
2
3
```

### Переменные окружения

Поведение REPL Node.js можно настроить переменными окружения:

* `NODE_REPL_HISTORY`: при корректном пути история REPL сохраняется в этот файл,
  а не в `.node_repl_history` в домашнем каталоге. Пустая строка `''` отключает сохранение.
  Пробелы по краям обрезаются. В Windows пустые значения переменных недопустимы — отключите историю одним или несколькими пробелами.
* `NODE_REPL_HISTORY_SIZE`: сколько строк истории сохранять. Должно быть положительным числом.
  **По умолчанию:** `1000`.
* `NODE_REPL_MODE`: `'sloppy'` или `'strict'`. **По умолчанию:** `'sloppy'` — код работает не в строгом режиме.

### Постоянная история

По умолчанию REPL сохраняет историю между сессиями в файле `.node_repl_history` в домашнем каталоге.
Отключение: `NODE_REPL_HISTORY=''`.

### Продвинутые редакторы строк

Для внешних построчных редакторов запустите Node.js с `NODE_NO_READLINE=1`. Основной и отладочный REPL
войдут в «канонический» режим терминала, можно использовать `rlwrap`.

Например, в `.bashrc`:

```bash
alias node="env NODE_NO_READLINE=1 rlwrap node"
```

### Несколько REPL в одном процессе

Можно запустить несколько экземпляров REPL в одном процессе Node.js с общим `global` (`useGlobal: true`)
и разными интерфейсами ввода-вывода.

Ниже — отдельные REPL на `stdin`, Unix-сокете и TCP-сокете с общим `global`:

=== "MJS"

    ```js
    import net from 'node:net';
    import repl from 'node:repl';
    import process from 'node:process';
    import fs from 'node:fs';
    
    let connections = 0;
    
    repl.start({
      prompt: 'Node.js via stdin> ',
      useGlobal: true,
      input: process.stdin,
      output: process.stdout,
    });
    
    const unixSocketPath = '/tmp/node-repl-sock';
    
    // Если файл сокета уже есть — удаляем
    fs.rmSync(unixSocketPath, { force: true });
    
    net.createServer((socket) => {
      connections += 1;
      repl.start({
        prompt: 'Node.js via Unix socket> ',
        useGlobal: true,
        input: socket,
        output: socket,
      }).on('exit', () => {
        socket.end();
      });
    }).listen(unixSocketPath);
    
    net.createServer((socket) => {
      connections += 1;
      repl.start({
        prompt: 'Node.js via TCP socket> ',
        useGlobal: true,
        input: socket,
        output: socket,
      }).on('exit', () => {
        socket.end();
      });
    }).listen(5001);
    ```

=== "CJS"

    ```js
    const net = require('node:net');
    const repl = require('node:repl');
    const fs = require('node:fs');
    
    let connections = 0;
    
    repl.start({
      prompt: 'Node.js via stdin> ',
      useGlobal: true,
      input: process.stdin,
      output: process.stdout,
    });
    
    const unixSocketPath = '/tmp/node-repl-sock';
    
    // Если файл сокета уже есть — удаляем
    fs.rmSync(unixSocketPath, { force: true });
    
    net.createServer((socket) => {
      connections += 1;
      repl.start({
        prompt: 'Node.js via Unix socket> ',
        useGlobal: true,
        input: socket,
        output: socket,
      }).on('exit', () => {
        socket.end();
      });
    }).listen(unixSocketPath);
    
    net.createServer((socket) => {
      connections += 1;
      repl.start({
        prompt: 'Node.js via TCP socket> ',
        useGlobal: true,
        input: socket,
        output: socket,
      }).on('exit', () => {
        socket.end();
      });
    }).listen(5001);
    ```

Запуск из командной строки поднимает REPL на stdin.
Другие клиенты могут подключаться через Unix- или TCP-сокет: для TCP удобен `telnet`,
для Unix и TCP — `socat`.

REPL на Unix-сокете позволяет подключаться к долгоживущему процессу Node.js без перезапуска.

### Примеры

#### Полноценный «терминальный» REPL поверх `net.Server` и `net.Socket`

Пример «полноценного» терминального REPL на [`net.Server`](net.md#class-netserver) и [`net.Socket`](net.md#class-netsocket).

Скрипт поднимает сервер на порту `1337`, клиенты подключаются сокетом к экземпляру REPL.

=== "MJS"

    ```js
    // repl-server.js
    import repl from 'node:repl';
    import net from 'node:net';
    
    net
      .createServer((socket) => {
        const r = repl.start({
          prompt: `socket ${socket.remoteAddress}:${socket.remotePort}> `,
          input: socket,
          output: socket,
          terminal: true,
          useGlobal: false,
        });
        r.on('exit', () => {
          socket.end();
        });
        r.context.socket = socket;
      })
      .listen(1337);
    ```

=== "CJS"

    ```js
    // repl-server.js
    const repl = require('node:repl');
    const net = require('node:net');
    
    net
      .createServer((socket) => {
        const r = repl.start({
          prompt: `socket ${socket.remoteAddress}:${socket.remotePort}> `,
          input: socket,
          output: socket,
          terminal: true,
          useGlobal: false,
        });
        r.on('exit', () => {
          socket.end();
        });
        r.context.socket = socket;
      })
      .listen(1337);
    ```

Клиент ниже подключается к этому серверу на порту `1337`.

=== "MJS"

    ```js
    // repl-client.js
    import net from 'node:net';
    import process from 'node:process';
    
    const sock = net.connect(1337);
    
    process.stdin.pipe(sock);
    sock.pipe(process.stdout);
    
    sock.on('connect', () => {
      process.stdin.resume();
      process.stdin.setRawMode(true);
    });
    
    sock.on('close', () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      sock.removeListener('close', done);
    });
    
    process.stdin.on('end', () => {
      sock.destroy();
      console.log();
    });
    
    process.stdin.on('data', (b) => {
      if (b.length === 1 && b[0] === 4) {
        process.stdin.emit('end');
      }
    });
    ```

=== "CJS"

    ```js
    // repl-client.js
    const net = require('node:net');
    
    const sock = net.connect(1337);
    
    process.stdin.pipe(sock);
    sock.pipe(process.stdout);
    
    sock.on('connect', () => {
      process.stdin.resume();
      process.stdin.setRawMode(true);
    });
    
    sock.on('close', () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      sock.removeListener('close', done);
    });
    
    process.stdin.on('end', () => {
      sock.destroy();
      console.log();
    });
    
    process.stdin.on('data', (b) => {
      if (b.length === 1 && b[0] === 4) {
        process.stdin.emit('end');
      }
    });
    ```

Для проверки откройте два терминала: в одном `node repl-server.js`, в другом `node repl-client.js`.

Исходный код: <https://gist.github.com/TooTallNate/2209310>.

#### REPL поверх `curl`

Пример запуска экземпляра REPL через [`curl()`](https://curl.haxx.se/docs/manpage.html).

Скрипт поднимает HTTP-сервер на порту `8000`, соединение можно установить через [`curl()`](https://curl.haxx.se/docs/manpage.html).

=== "MJS"

    ```js
    import http from 'node:http';
    import repl from 'node:repl';
    
    const server = http.createServer((req, res) => {
      res.setHeader('content-type', 'multipart/octet-stream');
    
      repl.start({
        prompt: 'curl repl> ',
        input: req,
        output: res,
        terminal: false,
        useColors: true,
        useGlobal: false,
      });
    });
    
    server.listen(8000);
    ```

=== "CJS"

    ```js
    const http = require('node:http');
    const repl = require('node:repl');
    
    const server = http.createServer((req, res) => {
      res.setHeader('content-type', 'multipart/octet-stream');
    
      repl.start({
        prompt: 'curl repl> ',
        input: req,
        output: res,
        terminal: false,
        useColors: true,
        useGlobal: false,
      });
    });
    
    server.listen(8000);
    ```

При работающем скрипте подключитесь командой `curl --no-progress-meter -sSNT. localhost:8000`.

**Предупреждение:** пример только для демонстрации запуска REPL с разными потоками ввода-вывода.
**Не** используйте в продакшене и там, где важна безопасность, без дополнительных мер.
В реальных приложениях учитывайте риски: защищённый ввод, закрытые сетевые интерфейсы и т.д.

Исходный код: <https://gist.github.com/TooTallNate/2053342>.

[привязках клавиш TTY]: readline.md#tty-keybindings
[ZSH]: https://en.wikipedia.org/wiki/Z_shell
[`'uncaughtException'`]: process.md#event-uncaughtexception
[`--no-experimental-repl-await`]: cli.md#--no-experimental-repl-await
[`ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE`]: errors.md#err_domain_cannot_set_uncaught_exception_capture
[`ERR_INVALID_REPL_INPUT`]: errors.md#err_invalid_repl_input
[`curl()`]: https://curl.haxx.se/docs/manpage.html
[`domain`]: domain.md
[module.builtinModules]: module.md#modulebuiltinmodules
[`net.Server`]: net.md#class-netserver
[`net.Socket`]: net.md#class-netsocket
[`process.setUncaughtExceptionCaptureCallback()`]: process.md#processsetuncaughtexceptioncapturecallbackfn
[`readline.InterfaceCompleter`]: readline.md#use-of-the-completer-function
[`repl.ReplServer`]: #class-replserver
[`repl.start()`]: #replstartoptions
[`reverse-i-search`]: #reverse-i-search
[`util.inspect()`]: util.md#utilinspectobject-options
[пользовательские функции вычисления]: #custom-evaluation-functions
[stream]: stream.md
