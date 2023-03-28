# REPL

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/repl.js -->

В `repl` Модуль предоставляет реализацию Read-Eval-Print-Loop (REPL), которая доступна как отдельная программа или может быть включена в другие приложения. Доступ к нему можно получить, используя:

```js
const repl = require('repl');
```

## Дизайн и особенности

В `repl` модуль экспортирует [`repl.REPLServer`]() класс. Во время работы экземпляры [`repl.REPLServer`]() будет принимать отдельные строки пользовательского ввода, оценивать их в соответствии с определяемой пользователем функцией оценки, а затем выводить результат. Вход и выход могут быть из `stdin` а также `stdout`, соответственно, или может быть подключен к любому Node.js [транслировать](stream.md).

Экземпляры [`repl.REPLServer`]() поддержка автоматического завершения ввода, предварительного просмотра завершения, упрощенного редактирования строк в стиле Emacs, многострочного ввода, [ZSH](https://en.wikipedia.org/wiki/Z_shell)-подобный обратный i-поиск, [ZSH](https://en.wikipedia.org/wiki/Z_shell)-подобный поиск в истории на основе подстроки, вывод в стиле ANSI, сохранение и восстановление текущего состояния сеанса REPL, восстановление после ошибок и настраиваемые функции оценки. Терминалы, которые не поддерживают стили ANSI и редактирование строк в стиле Emacs, автоматически возвращаются к ограниченному набору функций.

### Команды и специальные клавиши

Все экземпляры REPL поддерживают следующие специальные команды:

- `.break`: В процессе ввода многострочного выражения введите `.break` команда (или нажмите <kbd>Ctrl</kbd>+<kbd>C</kbd>), чтобы прервать дальнейший ввод или обработку этого выражения.
- `.clear`: Сбрасывает REPL `context` к пустому объекту и очищает все вводимые многострочные выражения.
- `.exit`: Закрыть поток ввода-вывода, вызывая выход из REPL.
- `.help`: Показать этот список специальных команд.
- `.save`: Сохранить текущую сессию REPL в файл: `> .save ./file/to/save.js`
- `.load`: Загрузить файл в текущий сеанс REPL. `> .load ./file/to/load.js`
- `.editor`: Войти в режим редактора (<kbd>Ctrl</kbd>+<kbd>D</kbd> заканчивать, <kbd>Ctrl</kbd>+<kbd>C</kbd> отменить).

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

Следующие комбинации клавиш в REPL имеют эти специальные эффекты:

- <kbd>Ctrl</kbd>+<kbd>C</kbd>: При однократном нажатии имеет тот же эффект, что и `.break` команда. При двойном нажатии на пустой строке имеет тот же эффект, что и `.exit` команда.
- <kbd>Ctrl</kbd>+<kbd>D</kbd>: Имеет тот же эффект, что и `.exit` команда.
- <kbd>Вкладка</kbd>: При нажатии на пустую строку отображает глобальные и локальные (область видимости) переменные. При нажатии при вводе другого ввода отображает соответствующие параметры автозаполнения.

Для привязки клавиш, связанных с обратным i-поиском, см. [`reverse-i-search`](#reverse-i-search). Для всех других привязок клавиш см. [Связки клавиш TTY](readline.md#tty-keybindings).

### Оценка по умолчанию

По умолчанию все экземпляры [`repl.REPLServer`]() используйте функцию оценки, которая оценивает выражения JavaScript и предоставляет доступ к встроенным модулям Node.js. Это поведение по умолчанию можно изменить, передав альтернативную функцию оценки, когда [`repl.REPLServer`]() экземпляр создан.

#### Выражения JavaScript

Оценщик по умолчанию поддерживает прямую оценку выражений JavaScript:

```console
> 1 + 1
2
> const m = 2
undefined
> m + 1
3
```

Если иное не ограничено блоками или функциями, переменные объявлены неявно или с использованием `const`, `let`, или `var` Ключевые слова объявляются в глобальной области.

#### Глобальный и локальный охват

Оценщик по умолчанию обеспечивает доступ ко всем переменным, существующим в глобальной области видимости. Можно явно предоставить переменную REPL, присвоив ее `context` объект, связанный с каждым `REPLServer`:

```js
const repl = require('repl');
const msg = 'message';

repl.start('> ').context.m = msg;
```

Недвижимость в `context` объект отображается как локальный в REPL:

```console
$ node repl_test.js
> m
'message'
```

Свойства контекста по умолчанию не доступны только для чтения. Чтобы указать глобальные объекты только для чтения, свойства контекста должны быть определены с помощью `Object.defineProperty()`:

```js
const repl = require('repl');
const msg = 'message';

const r = repl.start('> ');
Object.defineProperty(r.context, 'm', {
  configurable: false,
  enumerable: true,
  value: msg,
});
```

#### Доступ к основным модулям Node.js

Оценщик по умолчанию автоматически загружает основные модули Node.js в среду REPL при использовании. Например, если иное не объявлено как глобальная или ограниченная переменная, вход `fs` будут оцениваться по запросу как `global.fs = require('fs')`.

```console
> fs.createReadStream('./some/file');
```

#### Глобальные неперехваченные исключения

<!-- YAML
changes:
  - version: v12.3.0
    pr-url: https://github.com/nodejs/node/pull/27151
    description: The `'uncaughtException'` event is from now on triggered if the
                 repl is used as standalone program.
-->

REPL использует [`domain`](domain.md) модуль для перехвата всех неперехваченных исключений для этого сеанса REPL.

Это использование [`domain`](domain.md) модуль в REPL имеет следующие побочные эффекты:

- Неперехваченные исключения выдают только [`'uncaughtException'`](process.md#event-uncaughtexception) в автономном REPL. Добавление слушателя для этого события в REPL в другой программе Node.js приводит к [`ERR_INVALID_REPL_INPUT`](errors.md#err_invalid_repl_input).

  ```js
  const r = repl.start();

  r.write(
    'process.on("uncaughtException", () => console.log("Foobar"));\n'
  );
  // Output stream includes:
  //   TypeError [ERR_INVALID_REPL_INPUT]: Listeners for `uncaughtException`
  //   cannot be used in the REPL

  r.close();
  ```

- Пытаюсь использовать [`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) бросает [`ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE`](errors.md#err_domain_cannot_set_uncaught_exception_capture) ошибка.

#### Присвоение `_` (подчеркивание) переменная

<!-- YAML
changes:
  - version: v9.8.0
    pr-url: https://github.com/nodejs/node/pull/18919
    description: Added `_error` support.
-->

Оценщик по умолчанию по умолчанию присваивает результат последнего оцененного выражения специальной переменной. `_` (подчеркивать). Явная установка `_` значение отключит это поведение.

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

Сходным образом, `_error` будет относиться к последней обнаруженной ошибке, если таковая была. Явная установка `_error` значение отключит это поведение.

```console
> throw new Error('foo');
Error: foo
> _error.message
'foo'
```

#### `await` ключевое слово

Поддержка `await` ключевое слово включено на верхнем уровне.

```console
> await Promise.resolve(123)
123
> await Promise.reject(new Error('REPL await'))
Error: REPL await
    at repl:1:45
> const timeout = util.promisify(setTimeout);
undefined
> const old = Date.now(); await timeout(1000); console.log(Date.now() - old);
1002
undefined
```

Одно известное ограничение использования `await` ключевое слово в REPL состоит в том, что оно сделает недействительной лексическую область видимости `const` а также `let` ключевые слова.

Например:

```console
> const m = await Promise.resolve(123)
undefined
> m
123
> const m = await Promise.resolve(234)
undefined
> m
234
```

[`--no-experimental-repl-await`](cli.md#--no-experimental-repl-await) отключает ожидание верхнего уровня в REPL.

### Обратный поиск

<!-- YAML
added:
 - v13.6.0
 - v12.17.0
-->

REPL поддерживает двунаправленный обратный i-поиск, аналогичный [ZSH](https://en.wikipedia.org/wiki/Z_shell). Он запускается с помощью <kbd>Ctrl</kbd>+<kbd>р</kbd> искать назад и <kbd>Ctrl</kbd>+<kbd>S</kbd> искать вперед.

Повторяющиеся записи в истории будут пропущены.

Записи принимаются, как только будет нажата любая клавиша, не соответствующая обратному поиску. Отмена возможна нажатием <kbd>Esc</kbd> или <kbd>Ctrl</kbd>+<kbd>C</kbd>.

При изменении направления немедленно выполняется поиск следующей записи в ожидаемом направлении, начиная с текущей позиции.

### Пользовательские оценочные функции

Когда новый [`repl.REPLServer`]() создается пользовательская функция оценки. Это можно использовать, например, для реализации полностью настраиваемых приложений REPL.

Ниже показан гипотетический пример REPL, который выполняет перевод текста с одного языка на другой:

```js
const repl = require('repl');
const { Translator } = require('translator');

const myTranslator = new Translator('en', 'fr');

function myEval(cmd, context, filename, callback) {
  callback(null, myTranslator.translate(cmd));
}

repl.start({ prompt: '> ', eval: myEval });
```

#### Исправимые ошибки

В приглашении REPL нажатие <kbd>Входить</kbd> отправляет текущую строку ввода в `eval` функция. Для поддержки многострочного ввода `eval` функция может возвращать экземпляр `repl.Recoverable` к предоставленной функции обратного вызова:

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
    return /^(Unexpected end of input|Unexpected token)/.test(
      error.message
    );
  }
  return false;
}
```

### Настройка вывода REPL

По умолчанию, [`repl.REPLServer`]() Экземпляры форматируют вывод с помощью [`util.inspect()`](util.md#utilinspectobject-options) перед записью вывода в предоставленный `Writable` транслировать (`process.stdout` по умолчанию). В `showProxy` для параметра проверки по умолчанию установлено значение true, а параметр `colors` для параметра установлено значение true в зависимости от REPL `useColors` вариант.

В `useColors` логическая опция может быть указана при построении, чтобы указать модулю записи по умолчанию использовать коды стиля ANSI для раскрашивания вывода из `util.inspect()` метод.

Если REPL запускается как отдельная программа, также можно изменить REPL [настройки по умолчанию](util.md#utilinspectobject-options) изнутри REPL с помощью `inspect.replDefaults` собственность, которая отражает `defaultOptions` из [`util.inspect()`](util.md#utilinspectobject-options).

```console
> util.inspect.replDefaults.compact = false;
false
> [1]
[
  1
]
>
```

Чтобы полностью настроить вывод [`repl.REPLServer`]() экземпляр передать новую функцию для `writer` вариант на строительство. В следующем примере, например, просто преобразуется любой вводимый текст в верхний регистр:

```js
const repl = require('repl');

const r = repl.start({
  prompt: '> ',
  eval: myEval,
  writer: myWriter,
});

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

- `options` {Object | string} См. [`repl.start()`](#replstartoptions)
- Расширяется: {readline.Interface}

Экземпляры `repl.REPLServer` создаются с использованием [`repl.start()`](#replstartoptions) метод или напрямую с помощью JavaScript `new` ключевое слово.

```js
const repl = require('repl');

const options = { useColors: true };

const firstInstance = repl.start(options);
const secondInstance = new repl.REPLServer(options);
```

### Событие: `'exit'`

<!-- YAML
added: v0.7.7
-->

В `'exit'` событие генерируется при выходе из REPL либо при получении `.exit` команда в качестве ввода, пользователь нажимает <kbd>Ctrl</kbd>+<kbd>C</kbd> дважды сигнализировать `SIGINT`, или нажав <kbd>Ctrl</kbd>+<kbd>D</kbd> сигнализировать `'end'` во входном потоке. Обратный вызов слушателя вызывается без аргументов.

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

В `'reset'` Событие генерируется при сбросе контекста REPL. Это происходит всякий раз, когда `.clear` команда получена как ввод _пока не_ REPL использует оценщик по умолчанию, а `repl.REPLServer` экземпляр был создан с `useGlobal` опция установлена на `true`. Обратный вызов слушателя будет вызываться со ссылкой на `context` объект как единственный аргумент.

Это можно использовать в первую очередь для повторной инициализации контекста REPL до некоторого предопределенного состояния:

```js
const repl = require('repl');

function initializeContext(context) {
  context.m = 'test';
}

const r = repl.start({ prompt: '> ' });
initializeContext(r.context);

r.on('reset', initializeContext);
```

Когда этот код выполняется, глобальный `'m'` переменную можно изменить, но затем сбросить до исходного значения с помощью `.clear` команда:

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

- `keyword` {строка} Ключевое слово команды (_без_ ведущий `.` персонаж).
- `cmd` {Object | Function} Функция, вызываемая при обработке команды.

В `replServer.defineCommand()` метод используется для добавления новых `.`-префиксы команд для экземпляра REPL. Такие команды вызываются путем ввода `.` за которым следует `keyword`. В `cmd` либо `Function` или `Object` со следующими свойствами:

- `help` {строка} Текст справки, который будет отображаться, когда `.help` введен (необязательно).
- `action` {Функция} Функция для выполнения, при необходимости принимающая единственный строковый аргумент.

В следующем примере показаны две новые команды, добавленные в экземпляр REPL:

```js
const repl = require('repl');

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

Затем новые команды можно использовать из экземпляра REPL:

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

- `preserveCursor` {логический}

В `replServer.displayPrompt()` подготавливает экземпляр REPL для ввода от пользователя, распечатывая настроенный `prompt` на новую строку в `output` и возобновив `input` принять новый ввод.

При вводе многострочного ввода печатается многоточие, а не «подсказка».

Когда `preserveCursor` является `true`, расположение курсора не будет сброшено на `0`.

В `replServer.displayPrompt` в первую очередь предназначен для вызова из функции действия для команд, зарегистрированных с помощью `replServer.defineCommand()` метод.

### `replServer.clearBufferedCommand()`

<!-- YAML
added: v9.0.0
-->

В `replServer.clearBufferedCommand()` удаляет все команды, которые были помещены в буфер, но еще не выполнены. Этот метод в первую очередь предназначен для вызова из функции действия для команд, зарегистрированных с помощью `replServer.defineCommand()` метод.

### `replServer.parseREPLKeyword(keyword[, rest])`

<!-- YAML
added: v0.8.9
deprecated: v9.0.0
-->

> Стабильность: 0 - Не рекомендуется.

- `keyword` {string} потенциальное ключевое слово для анализа и выполнения
- `rest` {any} любые параметры ключевого слова command
- Возвращает: {логическое}

Внутренний метод, используемый для анализа и выполнения `REPLServer` ключевые слова. Возврат `true` если `keyword` является допустимым ключевым словом, в противном случае `false`.

### `replServer.setupHistory(historyPath, callback)`

<!-- YAML
added: v11.10.0
-->

- `historyPath` {строка} путь к файлу истории
- `callback` {Функция} вызывается, когда запись истории готова или в случае ошибки
  - `err` {Ошибка}
  - `repl` {repl.REPLServer}

Инициализирует файл журнала истории для экземпляра REPL. При выполнении двоичного файла Node.js и использовании REPL в командной строке файл истории инициализируется по умолчанию. Однако при программном создании REPL это не так. Используйте этот метод для инициализации файла журнала истории при программной работе с экземплярами REPL.

## `repl.builtinModules`

<!-- YAML
added: v14.5.0
-->

- {нить\[]}

Список имен всех модулей Node.js, например, `'http'`.

## `repl.start([options])`

<!-- YAML
added: v0.1.91
changes:
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

- `options` {Объект | строка}
  - `prompt` {строка} Отображаемая подсказка ввода. **Дефолт:** `'> '` (с конечным пробелом).
  - `input` {stream.Readable} `Readable` поток, из которого будет считываться ввод REPL. **Дефолт:** `process.stdin`.
  - `output` {stream.Writable} `Writable` поток, в который будет записан вывод REPL. **Дефолт:** `process.stdout`.
  - `terminal` {boolean} Если `true`, указывает, что `output` следует рассматривать как терминал TTY. **Дефолт:** проверка значения `isTTY` собственность на `output` поток при создании экземпляра.
  - `eval` {Функция} Функция, которая будет использоваться при оценке каждой заданной строки ввода. **Дефолт:** асинхронная оболочка для JavaScript `eval()` функция. An `eval` функция может ошибаться с `repl.Recoverable` чтобы указать, что ввод был неполным, и запросить дополнительные строки.
  - `useColors` {boolean} Если `true`, указывает, что по умолчанию `writer` функция должна включать цветовое оформление ANSI для вывода REPL. Если обычай `writer` предоставляется функция, то это не имеет никакого эффекта. **Дефолт:** проверка поддержки цвета на `output` поток, если экземпляр REPL `terminal` ценность `true`.
  - `useGlobal` {boolean} Если `true`, указывает, что функция оценки по умолчанию будет использовать JavaScript `global` в качестве контекста, а не для создания нового отдельного контекста для экземпляра REPL. Узел CLI REPL устанавливает это значение в `true`. **Дефолт:** `false`.
  - `ignoreUndefined` {boolean} Если `true`, указывает, что средство записи по умолчанию не будет выводить возвращаемое значение команды, если оно оценивается как `undefined`. **Дефолт:** `false`.
  - `writer` {Функция} Функция, вызываемая для форматирования вывода каждой команды перед записью в `output`. **Дефолт:** [`util.inspect()`](util.md#utilinspectobject-options).
  - `completer` {Функция} Необязательная функция, используемая для автоматического завершения пользовательской вкладки. Видеть [`readline.InterfaceCompleter`](readline.md#use-of-the-completer-function) для примера.
  - `replMode` {symbol} Флаг, указывающий, выполняет ли оценщик по умолчанию все команды JavaScript в строгом или стандартном (небрежном) режиме. Допустимые значения:
    - `repl.REPL_MODE_SLOPPY` для оценки выражений в небрежном режиме.
    - `repl.REPL_MODE_STRICT` для оценки выражений в строгом режиме. Это эквивалентно предварению каждого оператора replace с помощью `'use strict'`.
  - `breakEvalOnSigint` {boolean} Остановить оценку текущего фрагмента кода, когда `SIGINT` получен, например, когда <kbd>Ctrl</kbd>+<kbd>C</kbd> нажата. Его нельзя использовать вместе с пользовательским `eval` функция. **Дефолт:** `false`.
  - `preview` {boolean} Определяет, печатает ли REP автозаполнение и выводит предварительный просмотр или нет. **Дефолт:** `true` с функцией eval по умолчанию и `false` в случае использования пользовательской функции eval. Если `terminal` ложно, то превью нет и значение `preview` не имеет никакого эффекта.
- Возвращает: {repl.REPLServer}

В `repl.start()` метод создает и запускает [`repl.REPLServer`]() пример.

Если `options` является строкой, тогда она указывает вводную подсказку:

```js
const repl = require('repl');

// a Unix style prompt
repl.start('$ ');
```

## REPL для Node.js

Сам Node.js использует `repl` модуль для предоставления собственного интерактивного интерфейса для выполнения JavaScript. Это можно использовать, выполнив двоичный файл Node.js без передачи каких-либо аргументов (или передав `-i` аргумент):

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

### Параметры переменных среды

Различное поведение реплики Node.js можно настроить с помощью следующих переменных среды:

- `NODE_REPL_HISTORY`: Если указан допустимый путь, постоянная история REPL будет сохранена в указанный файл, а не в `.node_repl_history` в домашнем каталоге пользователя. Установка этого значения на `''` (пустая строка) отключит постоянную историю REPL. Пробелы будут удалены из значения. На платформах Windows переменные среды с пустыми значениями недопустимы, поэтому установите для этой переменной один или несколько пробелов, чтобы отключить постоянную историю REPL.
- `NODE_REPL_HISTORY_SIZE`: Контролирует, сколько строк истории будет сохраняться, если история доступна. Должно быть положительное число. **Дефолт:** `1000`.
- `NODE_REPL_MODE`: Может быть либо `'sloppy'` или `'strict'`. **Дефолт:** `'sloppy'`, что позволит запускать код в нестрогом режиме.

### Постоянная история

По умолчанию REPL на Node.js сохраняет историю между `node` REPL сессий путем сохранения входных данных в `.node_repl_history` файл, расположенный в домашнем каталоге пользователя. Это можно отключить, установив переменную среды `NODE_REPL_HISTORY=''`.

### Использование Node.js REPL с продвинутыми линейными редакторами

Для продвинутых линейных редакторов запустите Node.js с переменной окружения. `NODE_NO_READLINE=1`. Это запустит основной REPL и REPL отладчика в канонических настройках терминала, что позволит использовать его с `rlwrap`.

Например, следующее можно добавить к `.bashrc` файл:

```text
alias node="env NODE_NO_READLINE=1 rlwrap node"
```

### Запуск нескольких экземпляров REPL против одного запущенного экземпляра

Можно создать и запустить несколько экземпляров REPL для одного запущенного экземпляра Node.js, который использует один `global` объект, но имеют отдельные интерфейсы ввода-вывода.

В следующем примере, например, представлены отдельные REPL на `stdin`, сокет Unix и сокет TCP:

```js
const net = require('net');
const repl = require('repl');
let connections = 0;

repl.start({
  prompt: 'Node.js via stdin> ',
  input: process.stdin,
  output: process.stdout,
});

net
  .createServer((socket) => {
    connections += 1;
    repl
      .start({
        prompt: 'Node.js via Unix socket> ',
        input: socket,
        output: socket,
      })
      .on('exit', () => {
        socket.end();
      });
  })
  .listen('/tmp/node-repl-sock');

net
  .createServer((socket) => {
    connections += 1;
    repl
      .start({
        prompt: 'Node.js via TCP socket> ',
        input: socket,
        output: socket,
      })
      .on('exit', () => {
        socket.end();
      });
  })
  .listen(5001);
```

Запуск этого приложения из командной строки запустит REPL на стандартном вводе. Другие клиенты REPL могут подключаться через сокет Unix или TCP. `telnet`, например, полезен для подключения к сокетам TCP, а `socat` может использоваться для подключения как к сокетам Unix, так и к TCP.

Запустив REPL с сервера на основе сокетов Unix вместо stdin, можно подключиться к долго выполняющемуся процессу Node.js без его перезапуска.

Для примера запуска «полнофункционального» (`terminal`) REPL через `net.Server` а также `net.Socket` например, см .: <https://gist.github.com/TooTallNate/2209310>.

Для примера запуска экземпляра REPL поверх [`curl(1)`](https://curl.haxx.se/docs/manpage.html), видеть: <https://gist.github.com/TooTallNate/2053342>.
