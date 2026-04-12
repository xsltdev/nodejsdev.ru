---
description: Модуль repl предоставляет реализацию Read-Eval-Print-Loop (REPL), которая доступна как отдельная программа или может быть включена в другие приложения
---

# REPL

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/repl.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:repl` предоставляет реализацию Read-Eval-Print-Loop (REPL), которая доступна как отдельная программа или может быть включена в другие приложения. Доступ к нему можно получить, используя:

<!-- 0001.part.md -->

```js
const repl = require('node:repl');
```

<!-- 0002.part.md -->

## Дизайн и особенности

Модуль `node:repl` экспортирует класс [`repl.REPLServer`](#class-replserver). Во время работы экземпляры [`repl.REPLServer`](#class-replserver) будут принимать отдельные строки пользовательского ввода, оценивать их в соответствии с заданной пользователем функцией оценки, а затем выводить результат. Вход и выход могут быть из `stdin` и `stdout`, соответственно, или могут быть подключены к любому Node.js [stream](stream.md).

Экземпляры [`repl.REPLServer`](#class-replserver) поддерживают автоматическое завершение ввода, предварительный просмотр завершения, упрощенное редактирование строк в стиле Emacs, многострочный ввод, [ZSH](https://en.wikipedia.org/wiki/Z_shell)-подобный reverse-i-search, [ZSH](https://en.wikipedia.org/wiki/Z_shell)-подобный substring-based history search, вывод в стиле ANSI, сохранение и восстановление текущего состояния сессии REPL, восстановление ошибок и настраиваемые функции оценки. Терминалы, не поддерживающие стили ANSI и редактирование строк в стиле Emacs, автоматически возвращаются к ограниченному набору функций.

### Команды и специальные клавиши

Следующие специальные команды поддерживаются всеми экземплярами REPL:

-   `.break`: В процессе ввода многострочного выражения введите команду `.break` (или нажмите Ctrl+C), чтобы прервать дальнейший ввод или обработку этого выражения.
-   `.clear`: Сбрасывает REPL `context` на пустой объект и очищает любое вводимое многострочное выражение.
-   `.exit`: Закрывает поток ввода/вывода, вызывая выход из REPL.
-   `.help`: Показать список специальных команд.
-   `.save`: Сохранить текущую сессию REPL в файл: `> .save ./file/to/save.js`.
-   `.load`: Загрузить файл в текущий сеанс REPL. `> .load ./file/to/load.js`.
-   `.editor`: Войти в режим редактора (Ctrl+D для завершения, Ctrl+C для отмены).

<!-- end list -->

<!-- 0003.part.md -->

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

<!-- 0004.part.md -->

Следующие комбинации клавиш в REPL имеют такие специальные эффекты:

-   Ctrl+C: При однократном нажатии имеет тот же эффект, что и команда `.break`. При двойном нажатии на пустой строке имеет тот же эффект, что и команда `.exit`.
-   Ctrl+D: имеет тот же эффект, что и команда `.exit`.
-   Tab: При нажатии на пустой строке отображает глобальные и локальные (область видимости) переменные. При нажатии во время ввода других данных отображает соответствующие опции автозавершения.

Связки клавиш, связанные с обратным поиском, см. в [`reverse-i-search`](#reverse-i-search). Обо всех остальных привязках клавиш см. в [TTY keybindings](readline.md#tty-keybindings).

### Оценка по умолчанию

По умолчанию все экземпляры [`repl.REPLServer`](#class-replserver) используют функцию оценки, которая оценивает выражения JavaScript и предоставляет доступ к встроенным модулям Node.js. Это поведение по умолчанию можно отменить, передав альтернативную функцию оценки при создании экземпляра [`repl.REPLServer`](#class-replserver).

#### Выражения JavaScript

Оценщик по умолчанию поддерживает прямую оценку выражений JavaScript:

<!-- 0005.part.md -->

```console
> 1 + 1
2
> const m = 2
undefined
> m + 1
3
```

<!-- 0006.part.md -->

Если в блоках или функциях нет другой области видимости, переменные, объявленные неявно или с помощью ключевых слов `const`, `let` или `var`, объявляются в глобальной области видимости.

#### Глобальная и локальная область видимости

Оценщик по умолчанию предоставляет доступ к любым переменным, существующим в глобальной области видимости. Можно явно объявить переменную в REPL, присвоив ее объекту `context`, связанному с каждым `REPLServer`:

<!-- 0007.part.md -->

```js
const repl = require('node:repl');
const msg = 'message';

repl.start('> ').context.m = msg;
```

<!-- 0008.part.md -->

Свойства в объекте `context` отображаются как локальные в REPL:

<!-- 0009.part.md -->

```console
$ node repl_test.js
> m
'message'
```

<!-- 0010.part.md -->

Контекстные свойства по умолчанию не предназначены только для чтения. Чтобы указать глобальные объекты, доступные только для чтения, свойства контекста должны быть определены с помощью `Object.defineProperty()`:

<!-- 0011.part.md -->

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

<!-- 0012.part.md -->

#### Доступ к основным модулям Node.js

Оценщик по умолчанию будет автоматически загружать основные модули Node.js в среду REPL при использовании. Например, если иное не объявлено как глобальная или скопированная переменная, входной `fs` будет оцениваться по требованию как `global.fs = require('node:fs')`.

<!-- 0013.part.md -->

```console
> fs.createReadStream('./some/file');
```

<!-- 0014.part.md -->

#### Глобальные не пойманные исключения

В REPL используется модуль [`domain`](domain.md) для перехвата всех неперехваченных исключений для этой сессии REPL.

Использование модуля [`domain`](domain.md) в REPL имеет следующие побочные эффекты:

-   Не пойманные исключения вызывают событие [`'uncaughtException'`](process.md#event-uncaughtexception) только в автономном REPL. Добавление слушателя этого события в REPL в другой программе Node.js приводит к [`ERR_INVALID_REPL_INPUT`](errors.md#err_invalid_repl_input).

    ```js
    const r = repl.start();

    r.write(
        'process.on("uncaughtException", () => console.log("Foobar"));\n'
    );
    // Выходной поток включает:
    // TypeError [ERR_INVALID_REPL_INPUT]: Слушатели для `uncaughtException`
    // не могут быть использованы в REPL

    r.close();
    ```

-   Попытка использовать [`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) бросает ошибку [`ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE`](errors.md#err_domain_cannot_set_uncaught_exception_capture).

#### Присвоение переменной `_` (подчеркивание).

Оценщик по умолчанию присваивает результат последнего вычисленного выражения специальной переменной `_` (подчеркивание). Явная установка `_` в значение отключает это поведение.

<!-- 0015.part.md -->

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

<!-- 0016.part.md -->

Аналогично, `_error` будет ссылаться на последнюю замеченную ошибку, если таковая имела место. Явная установка `_error` в значение отключит это поведение.

<!-- 0017.part.md -->

```console
> throw new Error('foo');
Uncaught Error: foo
> _error.message
'foo'
```

<!-- 0018.part.md -->

#### Ключевое слово `await`

Поддержка ключевого слова `await` включена на верхнем уровне.

<!-- 0019.part.md -->

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

<!-- 0020.part.md -->

Одно известное ограничение использования ключевого слова `await` в REPL заключается в том, что оно делает недействительным лексическое описание ключевых слов `const` и `let`.

Например:

<!-- 0021.part.md -->

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

<!-- 0022.part.md -->

[`--no-experimental-repl-await`](cli.md#--no-experimental-repl-await) должен отключить ожидание на верхнем уровне в REPL.

### Reverse-i-search

REPL поддерживает двунаправленный обратный поиск, подобный [ZSH](https://en.wikipedia.org/wiki/Z_shell). Он запускается с помощью Ctrl+R для поиска назад и Ctrl+S для поиска вперед.

Дублирующиеся записи истории будут пропущены.

Записи будут приняты, как только будет нажата любая клавиша, не соответствующая обратному поиску. Отмена возможна при нажатии Esc или Ctrl+C.

При изменении направления поиск следующей записи осуществляется в ожидаемом направлении, начиная с текущей позиции.

### Пользовательские функции оценки

Когда создается новый [`repl.REPLServer`](#class-replserver), может быть предоставлена пользовательская функция оценки. Это может быть использовано, например, для реализации полностью специализированных приложений REPL.

Ниже показан гипотетический пример REPL, выполняющего перевод текста с одного языка на другой:

<!-- 0023.part.md -->

```js
const repl = require('node:repl');
const { Translator } = require('translator');

const myTranslator = new Translator('en', 'fr');

function myEval(cmd, context, filename, callback) {
    callback(null, myTranslator.translate(cmd));
}

repl.start({ prompt: '> ', eval: myEval });
```

<!-- 0024.part.md -->

#### Восстанавливаемые ошибки

В подсказке REPL нажатие Enter отправляет текущую строку ввода в функцию `eval`. Для поддержки многострочного ввода функция `eval` может возвращать экземпляр `repl.Recoverable` в предоставленную функцию обратного вызова:

<!-- 0025.part.md -->

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

<!-- 0026.part.md -->

### Настройка вывода REPL

По умолчанию экземпляры [`repl.REPLServer`](#class-replserver) форматируют вывод с помощью метода [`util.inspect()`](util.md#utilinspectobject-options) перед записью вывода в предоставленный поток `Writable` (по умолчанию `process.stdout`). Опция проверки `showProxy` по умолчанию установлена в true, а опция `colors` устанавливается в true в зависимости от опции REPL `useColors`.

Булева опция `useColors` может быть указана при построении, чтобы указать писателю по умолчанию использовать коды стиля ANSI для окраски вывода метода `util.inspect()`.

Если REPL запускается как автономная программа, можно также изменить параметры REPL [inspection defaults](util.md#utilinspectobject-options) внутри REPL с помощью свойства `inspect.replDefaults`, которое отражает `defaultOptions` из [`util.inspect()`](util.md#utilinspectobject-options).

<!-- 0027.part.md -->

```console
> util.inspect.replDefaults.compact = false;
false
> [1]
[
  1
]
>
```

<!-- 0028.part.md -->

Для полной настройки вывода экземпляра [`repl.REPLServer`](#class-replserver) передайте новую функцию для опции `writer` при построении. Следующий пример, например, просто преобразует любой входной текст в верхний регистр:

<!-- 0029.part.md -->

```js
const repl = require('node:repl');

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

<!-- 0030.part.md -->

## Класс: `REPLServer`

-   `options` {Object|string} См. [`repl.start()`](#replstartoptions)
-   Расширяет: {readline.Interface}

Экземпляры `repl.REPLServer` создаются с помощью метода [`repl.start()`](#replstartoptions) или непосредственно с помощью ключевого слова JavaScript `new`.

<!-- 0031.part.md -->

```js
const repl = require('node:repl');

const options = { useColors: true };

const firstInstance = repl.start(options);
const secondInstance = new repl.REPLServer(options);
```

<!-- 0032.part.md -->

### Событие: `'exit'`

Событие `'exit'` генерируется, когда REPL завершается либо при получении команды `.exit` на вход, либо при нажатии пользователем Ctrl+C дважды для сигнала `SIGINT`, либо при нажатии Ctrl+D для сигнала `'end'` на входном потоке. Обратный вызов слушателя вызывается без аргументов.

<!-- 0033.part.md -->

```js
replServer.on('exit', () => {
    console.log('Received "exit" event from repl!');
    process.exit();
});
```

<!-- 0034.part.md -->

### Событие: `reset`

Событие `reset` возникает, когда контекст REPL сбрасывается. Это происходит всякий раз, когда команда `.clear`поступает на вход, _если_ REPL не использует оценщик по умолчанию и экземпляр`repl.REPLServer`был создан с опцией`useGlobal`, установленной в `true`. Обратный вызов слушателя будет вызван со ссылкой на объект `context` в качестве единственного аргумента.

Это можно использовать в основном для повторной инициализации контекста REPL в некоторое заранее определенное состояние:

<!-- 0035.part.md -->

```js
const repl = require('node:repl');

function initializeContext(context) {
    context.m = 'test';
}

const r = repl.start({ prompt: '> ' });
initializeContext(r.context);

r.on('reset', initializeContext);
```

<!-- 0036.part.md -->

Когда этот код выполняется, глобальная переменная `'m'` может быть изменена, но затем возвращена к исходному значению с помощью команды `.clear`:

<!-- 0037.part.md -->

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

<!-- 0038.part.md -->

### `replServer.defineCommand(keyword, cmd)`

-   `ключевое слово` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Ключевое слово команды (_без_ ведущего символа `.`).
-   `cmd` {Object|Function} Функция, вызываемая при обработке команды.

Метод `replServer.defineCommand()` используется для добавления новых команд с префиксом `.` в экземпляр REPL. Такие команды вызываются путем ввода символа `.`, за которым следует `ключевое слово`. Команда `cmd` является либо `функцией`, либо `объектом` со следующими свойствами:

-   `help` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текст справки, который будет отображаться при вводе `.help` (необязательно).
-   `action` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция для выполнения, по желанию принимающая один строковый аргумент.

В следующем примере показаны две новые команды, добавленные в экземпляр REPL:

<!-- 0039.part.md -->

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

<!-- 0040.part.md -->

Затем новые команды можно использовать из экземпляра REPL:

<!-- 0041.part.md -->

```console
> .sayhello Node.js User
Hello, Node.js User!
> .saybye
Goodbye!
```

<!-- 0042.part.md -->

### `replServer.displayPrompt([preserveCursor])`

-   `preserveCursor` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Метод `replServer.displayPrompt()` готовит экземпляр REPL к вводу данных пользователем, печатая настроенный `prompt` на новой строке в `output` и возобновляя `input` для приема нового ввода.

Если вводится многострочный ввод, вместо "подсказки" печатается многоточие.

Когда `preserveCursor` имеет значение `true`, размещение курсора не будет сброшено на `0`.

Метод `replServer.displayPrompt` предназначен в основном для вызова из функции действия для команд, зарегистрированных с помощью метода `replServer.defineCommand()`.

### `replServer.clearBufferedCommand()`.

Метод `replServer.clearBufferedCommand()` очищает любую команду, которая была забуферизирована, но еще не выполнена. Этот метод предназначен для вызова из функции действия для команд, зарегистрированных с помощью метода `replServer.defineCommand()`.

### `replServer.parseREPLKeyword(keyword[, rest])`.

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Утратил актуальность.

-   `ключевое слово` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) потенциальное ключевое слово для разбора и выполнения
-   `rest` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) любые параметры команды ключевого слова.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Внутренний метод, используемый для разбора и выполнения ключевых слов `REPLServer`. Возвращает `true`, если `keyword` является правильным ключевым словом, иначе `false`.

### `replServer.setupHistory(historyPath, callback)`.

-   `historyPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) путь к файлу истории
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызывается, когда запись истории готова или при ошибке
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `repl` {repl.REPLServer}

Инициализирует файл журнала истории для экземпляра REPL. При выполнении бинарного файла Node.js и использовании командной строки REPL файл истории инициализируется по умолчанию. Однако при создании REPL программным способом это не так. Используйте этот метод для инициализации файла журнала истории при программной работе с экземплярами REPL.

## `repl.builtinModules`

-   [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список имен всех модулей Node.js, например, `'http'`.

## `repl.start([options])`

-   `options` {Object|string}
    -   `prompt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Вводная подсказка для отображения. **По умолчанию:** `'>` (с пробелом).
    -   `input` [`<stream.Readable>`](stream.md#streamreadable) Поток `Readable`, из которого будет считываться ввод REPL. **По умолчанию:** `process.stdin`.
    -   `output` [`<stream.Writable>`](stream.md#streamwritable) Поток `Writable`, в который будет записываться вывод REPL. **По умолчанию:** `process.stdout`.
    -   `terminal` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, указывает, что `вывод` должен рассматриваться как TTY-терминал. **По умолчанию:** проверка значения свойства `isTTY` для потока `output` при инстанцировании.
    -   `eval` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, которая будет использоваться при оценке каждой заданной строки ввода. **По умолчанию:** асинхронная обертка для функции JavaScript `eval()`. Функция `eval` может ошибаться с `repl.Recoverable`, чтобы указать, что ввод был неполным, и запросить дополнительные строки.
    -   `useColors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, указывает, что функция по умолчанию `writer` должна включать в REPL стилизацию цветов ANSI.

<!-- 0043.part.md -->

      - `useGlobal` {boolean} Если `true`, указывает, что функция оценки по умолчанию будет использовать JavaScript `global` в качестве контекста, а не создавать новый отдельный контекст для экземпляра REPL. Узел CLI REPL устанавливает это значение в `true`. **По умолчанию:** `false`.
      - `ignoreUndefined` {boolean} Если `true`, указывает, что писатель по умолчанию не будет выводить возвращаемое значение команды, если оно имеет значение `undefined`. **По умолчанию:** `false`.
      - `writer` {Функция} Функция, вызываемая для форматирования вывода каждой команды перед записью в `output`. **По умолчанию:** [`util.inspect()`](util.md#utilinspectobject-options).
      - `completer` {Function} Необязательная функция, используемая для автозавершения пользовательских вкладок. Пример см. в [`readline.InterfaceCompleter`](readline.md#use-of-the-completer-function).
      - `replMode` {символ} Флаг, определяющий, выполняет ли оценщик по умолчанию все команды JavaScript в строгом режиме или в режиме по умолчанию (небрежном). Допустимыми значениями являются:
          - `repl.REPL_MODE_SLOPPY` для оценки выражений в небрежном режиме.
          - `repl.REPL_MODE_STRICT` для оценки выражений в строгом режиме. Это эквивалентно предварять каждое утверждение repl фразой `'use strict``.
      - `breakEvalOnSigint` {boolean} Остановить оценку текущего фрагмента кода при получении `SIGINT`, например, при нажатии Ctrl+C. Это нельзя использовать вместе с пользовательской функцией `eval`. **По умолчанию:** `false`.
      - `preview` {boolean} Определяет, печатает ли repl автозаполнение и предварительный просмотр вывода или нет. **По умолчанию:** `true` при использовании функции eval по умолчанию и `false` в случае использования пользовательской функции eval. Если `terminal` является falsy, то предварительные просмотры отсутствуют и значение `preview` не влияет.

-   Возвращает: {repl.REPLServer}

Метод `repl.start()` создает и запускает экземпляр [`repl.REPLServer`](#class-replserver).

Если `options` - строка, то она задает приглашение к вводу:

<!-- 0044.part.md -->

```js
const repl = require('node:repl');

// a Unix style prompt
repl.start('$ ');
```

<!-- 0045.part.md -->

## Node.js REPL

Сам Node.js использует модуль `node:repl` для предоставления своего собственного интерактивного интерфейса для выполнения JavaScript. Его можно использовать, выполнив двоичный файл Node.js без передачи каких-либо аргументов (или передав аргумент `-i`):

<!-- 0046.part.md -->

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

<!-- 0047.part.md -->

### Параметры переменных окружения

Различные поведения Node.js REPL могут быть настроены с помощью следующих переменных окружения:

-   `NODE_REPL_HISTORY`: Когда указан правильный путь, постоянная история REPL будет сохраняться в указанном файле, а не в `.node_repl_history` в домашнем каталоге пользователя. Установка этого значения в `''`'' (пустая строка) отключает постоянную историю REPL. Пробелы будут обрезаны из значения. На платформах Windows переменные окружения с пустыми значениями недействительны, поэтому установите в этой переменной один или несколько пробелов, чтобы отключить постоянную историю REPL.
-   `NODE_REPL_HISTORY_SIZE`: Определяет, сколько строк истории будет сохранено, если история доступна. Должно быть положительным числом. **По умолчанию:** `1000`.
-   `NODE_REPL_MODE`: Может быть либо `'sloppy'`, либо `'strict'`. **По умолчанию:** `'sloppy'`, что позволит выполнять код в нестрогом режиме.

### Постоянная история

По умолчанию Node.js REPL будет сохранять историю между сессиями `node` REPL, сохраняя вводимые данные в файл `.node_repl_history`, расположенный в домашнем каталоге пользователя. Это можно отключить, установив переменную окружения `NODE_REPL_HISTORY=''`.

### Использование Node.js REPL с продвинутыми линейными редакторами

Для продвинутых линейных редакторов запустите Node.js с переменной окружения `NODE_NO_READLINE=1`. Это запустит основной и отладочный REPL в канонических настройках терминала, что позволит использовать `rlwrap`.

Например, в файл `.bashrc` можно добавить следующее:

<!-- 0048.part.md -->

```text
alias node="env NODE_NO_READLINE=1 rlwrap node"
```

<!-- 0049.part.md -->

### Запуск нескольких экземпляров REPL на одном работающем экземпляре

Можно создать и запустить несколько экземпляров REPL на одном запущенном экземпляре Node.js, которые используют один объект `global`, но имеют отдельные интерфейсы ввода-вывода.

Например, следующий пример предоставляет отдельные REPL на `stdin`, сокете Unix и сокете TCP:

<!-- 0050.part.md -->

```js
const net = require('node:net');
const repl = require('node:repl');
let connections = 0;

repl.start({
    prompt: 'Node.js via stdin> ',
    input: process.stdin,
    output: process.stdout,
});

net.createServer((socket) => {
    connections += 1;
    repl.start({
        prompt: 'Node.js via Unix socket> ',
        input: socket,
        output: socket,
    }).on('exit', () => {
        socket.end();
    });
}).listen('/tmp/node-repl-sock');

net.createServer((socket) => {
    connections += 1;
    repl.start({
        prompt: 'Node.js via TCP socket> ',
        input: socket,
        output: socket,
    }).on('exit', () => {
        socket.end();
    });
}).listen(5001);
```

<!-- 0051.part.md -->

Запуск этого приложения из командной строки запустит REPL на stdin. Другие клиенты REPL могут подключаться через сокет Unix или сокет TCP. Например, `telnet` полезен для подключения к сокетам TCP, а `socat` можно использовать для подключения как к сокетам Unix, так и к сокетам TCP.

Запуская REPL с сервера на основе сокетов Unix вместо stdin, можно подключиться к давно запущенному процессу Node.js, не перезапуская его.

Пример запуска "полнофункционального" (`терминального`) REPL над экземпляром `net.Server` и `net.Socket`, см: <https://gist.github.com/TooTallNate/2209310>.

Пример запуска экземпляра REPL над [`curl(1)`](https://curl.haxx.se/docs/manpage.html), см: <https://gist.github.com/TooTallNate/2053342>.

<!-- 0052.part.md -->
