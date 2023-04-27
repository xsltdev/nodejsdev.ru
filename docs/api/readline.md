---
description: Модуль readline предоставляет интерфейс для чтения данных из потока Readable (например, process.stdin) по одной строке за раз
---

# Readline

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/readline.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль **`node:readline`** предоставляет интерфейс для чтения данных из потока [Readable](stream.md#readable-streams) (например, [`process.stdin`](process.md#processstdin)) по одной строке за раз.

Чтобы использовать API на основе обещаний:

<!-- 0001.part.md -->

```mjs
import * as readline from 'node:readline/promises';
```

<!-- 0002.part.md -->

<!-- 0003.part.md -->

```cjs
const readline = require('node:readline/promises');
```

<!-- 0004.part.md -->

Чтобы использовать API обратного вызова и синхронизации:

<!-- 0005.part.md -->

```mjs
import * as readline from 'node:readline';
```

<!-- 0006.part.md -->

<!-- 0007.part.md -->

```cjs
const readline = require('node:readline');
```

<!-- 0008.part.md -->

Следующий простой пример иллюстрирует базовое использование модуля `node:readline`.

<!-- 0009.part.md -->

```mjs
import * as readline from 'node:readline/promises';
import {
    stdin as input,
    stdout as output,
} from 'node:process';

const rl = readline.createInterface({ input, output });

const answer = await rl.question(
    'What do you think of Node.js? '
);

console.log(
    `Thank you for your valuable feedback: ${answer}`
);

rl.close();
```

<!-- 0010.part.md -->

<!-- 0011.part.md -->

```cjs
const readline = require('node:readline');
const {
    stdin: input,
    stdout: output,
} = require('node:process');

const rl = readline.createInterface({ input, output });

rl.question('What do you think of Node.js? ', (answer) => {
    // TODO: Log the answer in a database
    console.log(
        `Thank you for your valuable feedback: ${answer}`
    );

    rl.close();
});
```

<!-- 0012.part.md -->

После вызова этого кода приложение Node.js не завершится, пока не будет закрыт `readline.Interface`, поскольку интерфейс ожидает получения данных в потоке `input`.

## Class: `InterfaceConstructor`

-   Extends: {EventEmitter}

Экземпляры класса `InterfaceConstructor` создаются с помощью метода `readlinePromises.createInterface()` или `readline.createInterface()`. Каждый экземпляр связан с одним потоком `input` [Readable](stream.md#readable-streams) и одним потоком `output` [Writable](stream.md#writable-streams). Поток `output` используется для печати подсказок для пользовательского ввода, который поступает на поток `input` и считывается с него.

### Событие: `close`

Событие `close` возникает, когда происходит одно из следующих событий:

-   Вызывается метод `rl.close()` и экземпляр `InterfaceConstructor` теряет контроль над потоками `input` и `output`;
-   Поток `input` получает событие `'end'`;
-   Поток `вход` получает Ctrl+D для сигнализации окончания передачи (EOT);
-   Поток `input` получает Ctrl+C для сигнала `SIGINT` и на экземпляре `InterfaceConstructor` не зарегистрирован слушатель события `'SIGINT'`.

Функция слушателя вызывается без передачи каких-либо аргументов.

Экземпляр `InterfaceConstructor` завершается, как только произойдет событие `'close'`.

### Событие: `'line'`

Событие `line` возникает всякий раз, когда поток `ввода` получает ввод конца строки (`\n`, `\r` или `\r\n`). Обычно это происходит, когда пользователь нажимает Enter или Return.

Событие `'line'` также испускается, если новые данные были прочитаны из потока, и этот поток заканчивается без маркера конца строки.

Функция слушателя вызывается со строкой, содержащей единственную строку полученного ввода.

<!-- 0013.part.md -->

```js
rl.on('line', (input) => {
    console.log(`Received: ${input}`);
});
```

<!-- 0014.part.md -->

### Событие: `history`

Событие `'history'` генерируется всякий раз, когда массив истории изменяется.

Функция-слушатель вызывается с массивом, содержащим массив истории. В нем будут отражены все изменения, добавленные и удаленные строки благодаря `historySize` и `removeHistoryDuplicates`.

Основная цель - позволить слушателю сохранять историю. Слушатель также может изменять объект истории. Это может быть полезно для предотвращения добавления в историю определенных строк, например, пароля.

<!-- 0015.part.md -->

```js
rl.on('history', (history) => {
    console.log(`Received: ${history}`);
});
```

<!-- 0016.part.md -->

### Событие: `pause`

Событие `pause` возникает, когда происходит одно из следующих событий:

-   Поток `input` приостановлен.
-   Входной поток не приостановлен и получает событие `'SIGCONT'`. (См. события [`'SIGTSTP'`](#event-sigtstp) и [`'SIGCONT'`](#event-sigcont)).

Функция слушателя вызывается без передачи каких-либо аргументов.

<!-- 0017.part.md -->

```js
rl.on('pause', () => {
    console.log('Readline paused.');
});
```

<!-- 0018.part.md -->

### Событие: `resume`

Событие `'resume'` генерируется всякий раз, когда возобновляется поток `ввода`.

Функция слушателя вызывается без передачи каких-либо аргументов.

<!-- 0019.part.md -->

```js
rl.on('resume', () => {
    console.log('Readline resumed.');
});
```

<!-- 0020.part.md -->

### Событие: `'SIGCONT'`

Событие `SIGCONT` возникает, когда процесс Node.js, ранее переведенный в фоновый режим с помощью Ctrl+Z (т.е. `SIGTSTP`), затем возвращается на передний план с помощью fg(1p).

Если поток `input` был приостановлен _до_ запроса `SIGTSTP`, это событие не будет выдано.

Функция слушателя вызывается без передачи каких-либо аргументов.

<!-- 0021.part.md -->

```js
rl.on('SIGCONT', () => {
    // `prompt` will automatically resume the stream
    rl.prompt();
});
```

<!-- 0022.part.md -->

Событие `SIGCONT` _не_ поддерживается в Windows.

### Событие: `'SIGINT'`

Событие `'SIGINT'` генерируется всякий раз, когда поток `ввода` получает ввод Ctrl+C, известный обычно как `SIGINT`. Если нет зарегистрированных слушателей события `'SIGINT'`, когда поток `ввода` получает `SIGINT`, будет выдано событие `'pause'`.

Функция слушателя вызывается без передачи каких-либо аргументов.

<!-- 0023.part.md -->

```js
rl.on('SIGINT', () => {
    rl.question(
        'Are you sure you want to exit? ',
        (answer) => {
            if (answer.match(/^y(es)?$/i)) rl.pause();
        }
    );
});
```

<!-- 0024.part.md -->

### Событие: `SIGTSTP`

Событие `'SIGTSTP'` происходит, когда поток `ввода` получает входной сигнал Ctrl+Z, обычно известный как `SIGTSTP`. Если нет зарегистрированных слушателей события `'SIGTSTP'`, когда поток `ввода` получает `SIGTSTP`, процесс Node.js будет отправлен в фоновый режим.

Когда программа будет возобновлена с помощью fg(1p), будут испущены события `'pause'` и `'SIGCONT'`. Они могут быть использованы для возобновления потока `ввода`.

События `'pause'` и `'SIGCONT'` не будут выдаваться, если `входной поток` был приостановлен до того, как процесс был отправлен в фон.

Функция слушателя вызывается без передачи каких-либо аргументов.

<!-- 0025.part.md -->

```js
rl.on('SIGTSTP', () => {
    // This will override SIGTSTP and prevent the program from going to the
    // background.
    console.log('Caught SIGTSTP.');
});
```

<!-- 0026.part.md -->

Событие `'SIGTSTP'` _не_ поддерживается в Windows.

### `rl.close()`

Метод `rl.close()` закрывает экземпляр `InterfaceConstructor` и передает контроль над потоками `входа` и `выхода`. При вызове будет выдано событие `'close'`.

Вызов `rl.close()` не прекращает немедленно испускание других событий (включая `'line'`) экземпляром `InterfaceConstructor`.

### `rl.pause()`.

Метод `rl.pause()` приостанавливает поток `input`, позволяя возобновить его позже, если это необходимо.

Вызов `rl.pause()` не приостанавливает немедленно другие события (включая `'line'`), испускаемые экземпляром `InterfaceConstructor`.

### `rl.prompt([preserveCursor])`.

-   `preserveCursor` {boolean} Если `true`, предотвращает сброс установки курсора на `0`.

Метод `rl.prompt()` записывает экземпляры `InterfaceConstructor`, настроенные на `prompt`, на новую строку в `output`, чтобы предоставить пользователю новое место для ввода.

При вызове `rl.prompt()` возобновит поток `ввода`, если он был приостановлен.

Если `InterfaceConstructor` был создан с `output`, установленным в `null` или `undefined`, подсказка не будет записана.

### `rl.resume()`.

Метод `rl.resume()` возобновляет поток `input`, если он был приостановлен.

### `rl.setPrompt(prompt)`

-   `prompt` {string}

Метод `rl.setPrompt()` устанавливает подсказку, которая будет записываться в `output` при каждом вызове `rl.prompt()`.

### `rl.getPrompt()`

-   Возвращает: {строка} текущая строка подсказки

Метод `rl.getPrompt()` возвращает текущую подсказку, используемую `rl.prompt()`.

### `rl.write(data[, key])`

-   `data` {string}
-   `key` {Object}
    -   `ctrl` {boolean} `true` to indicate the <kbd>Ctrl</kbd> key.
    -   `meta` {boolean} `true` to indicate the <kbd>Meta</kbd> key.
    -   `shift` {boolean} `true` to indicate the <kbd>Shift</kbd> key.
    -   `name` {string} The name of the a key.

Метод `rl.write()` записывает на `выход` либо `данные`, либо последовательность ключей, идентифицированную `key`. Аргумент `key` поддерживается только если `output` является текстовым терминалом [TTY](tty.md). Список комбинаций клавиш см. в [TTY keybindings](#tty-keybindings).

Если указана `key`, `data` игнорируется.

При вызове `rl.write()` возобновит поток `input`, если он был приостановлен.

Если `InterfaceConstructor` был создан с `output`, установленным в `null` или `undefined`, то `data` и `key` не записываются.

<!-- 0027.part.md -->

```js
rl.write('Delete this!');
// Simulate Ctrl+U to delete the line written previously
rl.write(null, { ctrl: true, name: 'u' });
```

<!-- 0028.part.md -->

Метод `rl.write()` запишет данные на `вход` интерфейса `readline` _как если бы они были предоставлены пользователем_.

### `rl[Symbol.asyncIterator]()`.

-   Возвращает: {AsyncIterator}

Создает объект `AsyncIterator`, который итерирует каждую строку во входном потоке как строку. Этот метод позволяет асинхронную итерацию объектов `InterfaceConstructor` через циклы `for await...of`.

Ошибки во входном потоке не пересылаются.

Если цикл завершается с помощью `break`, `throw` или `return`, будет вызван [`rl.close()`](#rlclose). Другими словами, итерация по `InterfaceConstructor` всегда будет полностью потреблять входной поток.

Производительность не соответствует традиционному API событий `'line'`. Используйте `'line'` вместо него для приложений, чувствительных к производительности.

<!-- 0029.part.md -->

```js
async function processLineByLine() {
    const rl = readline.createInterface({
        // ...
    });

    for await (const line of rl) {
        // Each line in the readline input will be successively available here as
        // `line`.
    }
}
```

<!-- 0030.part.md -->

После вызова `readline.createInterface()` начнет потреблять входной поток. Наличие асинхронных операций между созданием интерфейса и асинхронной итерацией может привести к пропуску строк.

### `rl.line`

-   {строка}

Текущие входные данные, обрабатываемые узлом.

Это может быть использовано при сборе входных данных из потока TTY для получения текущего значения, которое было обработано до того, как будет выдано событие `line`. После того, как событие `line` было вызвано, это свойство будет пустой строкой.

Имейте в виду, что изменение значения во время выполнения экземпляра может иметь непредвиденные последствия, если `rl.cursor` также не контролируется.

**Если для ввода не используется поток TTY, используйте событие [`'line'`](#event-line).**.

Один из возможных вариантов использования может быть следующим:

<!-- 0031.part.md -->

```js
const values = ['lorem ipsum', 'dolor sit amet'];
const rl = readline.createInterface(process.stdin);
const showResults = debounce(() => {
    console.log(
        '\n',
        values
            .filter((val) => val.startsWith(rl.line))
            .join(' ')
    );
}, 300);
process.stdin.on('keypress', (c, k) => {
    showResults();
});
```

<!-- 0032.part.md -->

### `rl.cursor`

-   {number|undefined}

Позиция курсора относительно `rl.line`.

Это позволяет отследить, где находится текущий курсор в строке ввода при чтении ввода из потока TTY. Позиция курсора определяет часть строки ввода, которая будет изменена при обработке ввода, а также столбец, в котором будет отображаться терминальный козырек.

### `rl.getCursorPos()`.

-   Возвращает: {Object}
    -   `rows` {число} строка подсказки, на которой в данный момент находится курсор
    -   `cols` {число} столбец экрана, на котором в данный момент находится курсор

Возвращает реальную позицию курсора по отношению к строке + подсказке ввода. Длинные строки ввода (обертка), а также многострочные подсказки включаются в вычисления.

## Обещания API

> Стабильность: 1 - Экспериментальный

### Класс: `readlinePromises.Interface`.

-   Расширяет: {readline.InterfaceConstructor}

Экземпляры класса `readlinePromises.Interface` создаются с помощью метода `readlinePromises.createInterface()`. Каждый экземпляр связан с одним потоком `input` [Readable](stream.md#readable-streams) и одним потоком `output` [Writable](stream.md#writable-streams). Поток `output` используется для печати подсказок для пользовательского ввода, который поступает на поток `input` и считывается с него.

#### `rl.question(query[, options])`.

-   `query` {string} Оператор или запрос для записи на `вывод`, добавляемый к подсказке.
-   `options` {Object}
    -   `signal` {AbortSignal} Опционально позволяет отменить `question()` с помощью сигнала `AbortSignal`.
-   Возвращает: {Promise} Обещание, которое будет выполнено с вводом пользователя в ответ на `query`.

Метод `rl.question()` отображает `запрос`, записывая его в `вывод`, ожидает ввода данных пользователем в `ввод`, затем вызывает функцию `обратный вызов`, передавая введенные данные в качестве первого аргумента.

При вызове `rl.question()` возобновит поток `input`, если он был приостановлен.

Если `readlinePromises.Interface` был создан с `output`, установленным на `null` или `undefined`, то `query` не записывается.

Если вопрос вызывается после `rl.close()`, он возвращает отклоненное обещание.

Пример использования:

<!-- 0033.part.md -->

```mjs
const answer = await rl.question(
    'What is your favorite food? '
);
console.log(`Oh, so your favorite food is ${answer}`);
```

<!-- 0034.part.md -->

Использование сигнала `AbortSignal` для отмены вопроса.

<!-- 0035.part.md -->

```mjs
const signal = AbortSignal.timeout(10_000);

signal.addEventListener(
    'abort',
    () => {
        console.log('The food question timed out');
    },
    { once: true }
);

const answer = await rl.question(
    'What is your favorite food? ',
    { signal }
);
console.log(`Oh, so your favorite food is ${answer}`);
```

<!-- 0036.part.md -->

### Класс: `readlinePromises.Readline`.

#### `новый readlinePromises.Readline(stream[, options])`.

-   `stream` {stream.Writable} [TTY](tty.md) поток.
-   `options` {Object}
    -   `autoCommit` {boolean} Если `true`, не нужно вызывать `rl.commit()`.

#### `rl.clearLine(dir)`.

-   `dir` {integer}
    -   `-1`: влево от курсора
    -   `1`: вправо от курсора
    -   `0`: вся строка
-   Возвращает: this

Метод `rl.clearLine()` добавляет во внутренний список ожидающих выполнения действий действие, которое очищает текущую строку связанного с ней `потока` в указанном направлении, обозначенном `dir`. Вызовите `rl.commit()`, чтобы увидеть эффект этого метода, если только `autoCommit: true` не было передано в конструктор.

#### `rl.clearScreenDown()`.

-   Возвращает: this

Метод `rl.clearScreenDown()` добавляет во внутренний список ожидающих действий действие, которое очищает связанный поток от текущей позиции курсора вниз. Вызовите `rl.commit()`, чтобы увидеть эффект этого метода, если только `autoCommit: true` не было передано в конструктор.

#### `rl.commit()`.

-   Возвращает: {Promise}

Метод `rl.commit()` отправляет все отложенные действия в связанный `поток` и очищает внутренний список отложенных действий.

#### `rl.cursorTo(x[, y])`.

-   `x` {целое число}
-   `y` {целое число}
-   Возвращает: this

Метод `rl.cursorTo()` добавляет во внутренний список ожидающих действий действие, которое перемещает курсор в указанную позицию в связанном `потоке`. Вызовите `rl.commit()`, чтобы увидеть эффект этого метода, если только `autoCommit: true` не было передано в конструктор.

#### `rl.moveCursor(dx, dy)`.

-   `dx` {целое число}
-   `dy` {целое число}
-   Возвращает: this

Метод `rl.moveCursor()` добавляет во внутренний список ожидающих выполнения действий действие, которое перемещает курсор _относительно_ его текущей позиции в связанном `потоке`. Вызовите `rl.commit()`, чтобы увидеть эффект этого метода, если только `autoCommit: true` не было передано в конструктор.

#### `rl.rollback()`.

-   Возвращает: this

Методы `rl.rollback` очищают внутренний список ожидающих действий без отправки его в связанный `поток`.

### `readlinePromises.createInterface(options)`

-   `options` {Object}
    -   `вход` {stream.Readable} Поток [Readable](stream.md#readable-streams), который нужно слушать. Этот параметр _обязателен_.
    -   `output` {stream.Writable} Поток [Writable](stream.md#writable-streams) для записи данных readline.
    -   `completer` {Function} Необязательная функция, используемая для автодополнения табуляции.
    -   `терминал` {boolean} `true`, если потоки `ввода` и `вывода` должны рассматриваться как TTY, и в них должны записываться коды ANSI/VT100. **По умолчанию:** проверка `isTTY` на потоке `output` при инстанцировании.
    -   `history` {string\[\]} Начальный список строк истории. Эта опция имеет смысл только если `terminal` установлен в `true` пользователем или внутренней проверкой `output`, иначе механизм кэширования истории не инициализируется вообще. **По умолчанию:** `[]`.
    -   `historySize` {number} Максимальное количество сохраняемых строк истории. Чтобы отключить историю, установите это значение в `0`. Эта опция имеет смысл, только если `terminal` установлен в `true` пользователем или внутренней проверкой `output`, иначе механизм кэширования истории вообще не инициализируется. **По умолчанию:** `30`.
    -   `removeHistoryDuplicates` {boolean} Если `true`, когда новая строка ввода, добавленная в список истории, дублирует более старую строку, это удаляет более старую строку из списка. **По умолчанию:** `false`.
    -   `prompt` {string} Используемая строка подсказки. **По умолчанию:** `'>``.
    -   `crlfDelay` {число} Если задержка между `\r` и `\n` превышает `crlfDelay` миллисекунд, то и `\r` и `\n` будут рассматриваться как отдельный ввод конца строки. `crlfDelay` будет приведен к числу не менее `100`. Оно может быть установлено в `бесконечность`, в этом случае `\r`, за которым следует `\n`, всегда будет считаться одной новой строкой (что может быть разумно для [чтения файлов](#example-read-file-stream-line-by-line) с `\r\n` разделителем строк). **По умолчанию:** `100`.
    -   `escapeCodeTimeout` {число} Продолжительность, в течение которой `readlinePromises` будет ожидать символа (при чтении неоднозначной последовательности клавиш в миллисекундах, которая может как сформировать полную последовательность клавиш, используя прочитанный на данный момент ввод, так и принять дополнительный ввод для завершения более длинной последовательности клавиш). **По умолчанию:** `500`.
    -   `tabSize` {целое число} Количество пробелов, которым равна табуляция (минимум 1). **По умолчанию:** `8`.
-   Возвращает: {readlinePromises.Interface}

Метод `readlinePromises.createInterface()` создает новый экземпляр `readlinePromises.Interface`.

<!-- 0038.part.md -->

```js
const readlinePromises = require('node:readline/promises');
const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout,
});
```

<!-- 0039.part.md -->

После создания экземпляра `readlinePromises.Interface`, наиболее распространенным случаем является прослушивание события `'line'`:

<!-- 0040.part.md -->

```js
rl.on('line', (line) => {
    console.log(`Received: ${line}`);
});
```

<!-- 0041.part.md -->

Если `terminal` является `true` для данного экземпляра, то поток `output` получит наилучшую совместимость, если он определит свойство `output.columns` и испустит событие `'resize'` на `output`, если или когда колонки когда-либо изменятся ([`process.stdout`](process.md#processstdout) делает это автоматически, если это TTY).

#### Использование функции `completer`.

Функция `completer` принимает в качестве аргумента текущую строку, введенную пользователем, и возвращает `Array` с 2 записями:

-   Массив `Array` с соответствующими записями для завершения.
-   Подстрока, которая была использована для сопоставления.

Например: `[[substr1, substr2, ...], originalsubstring]`.

<!-- 0042.part.md -->

```js
function completer(line) {
    const completions = '.help .error .exit .quit .q'.split(
        ' '
    );
    const hits = completions.filter((c) =>
        c.startsWith(line)
    );
    // Show all completions if none found
    return [hits.length ? hits : completions, line];
}
```

<!-- 0043.part.md -->

Функция `completer` может также возвращать {Promise} или быть асинхронной:

<!-- 0044.part.md -->

```js
async function completer(linePartial) {
    await someAsyncWork();
    return [['123'], linePartial];
}
```

<!-- 0045.part.md -->

## API обратного вызова

### Класс: `readline.Interface`

-   Расширяет: {readline.InterfaceConstructor}

Экземпляры класса `readline.Interface` создаются с помощью метода `readline.createInterface()`. Каждый экземпляр связан с одним потоком `input` [Readable](stream.md#readable-streams) и одним потоком `output` [Writable](stream.md#writable-streams). Поток `output` используется для печати подсказок для пользовательского ввода, который поступает на поток `input` и считывается с него.

#### `rl.question(query[, options], callback)`.

-   `query` {string} Утверждение или запрос для записи в `вывод`, добавляемый к подсказке.
-   `options` {Object}
    -   `signal` {AbortSignal} Опционально позволяет отменить `question()` с помощью `AbortController`.
-   `callback` {Function} Функция обратного вызова, которая вызывается с вводом пользователя в ответ на `вопрос`.

Метод `rl.question()` отображает `запрос`, записывая его на `вывод`, ждет ввода данных пользователем на `вводе`, затем вызывает функцию `обратного вызова`, передавая введенные данные в качестве первого аргумента.

После вызова `rl.question()` возобновит поток `input`, если он был приостановлен.

Если `readline.Interface` был создан с `output`, установленным в `null` или `undefined`, то `query` не записывается.

Функция `callback`, передаваемая в `rl.question()`, не следует типичной схеме принятия объекта `Error` или `null` в качестве первого аргумента. Функция `callback` вызывается с предоставленным ответом в качестве единственного аргумента.

При вызове `rl.question()` после `rl.close()` произойдет ошибка.

Пример использования:

<!-- 0046.part.md -->

```js
rl.question('What is your favorite food? ', (answer) => {
    console.log(`Oh, so your favorite food is ${answer}`);
});
```

<!-- 0047.part.md -->

Использование `AbortController` для отмены вопроса.

<!-- 0048.part.md -->

```js
const ac = new AbortController();
const signal = ac.signal;

rl.question(
    'What is your favorite food? ',
    { signal },
    (answer) => {
        console.log(
            `Oh, so your favorite food is ${answer}`
        );
    }
);

signal.addEventListener(
    'abort',
    () => {
        console.log('The food question timed out');
    },
    { once: true }
);

setTimeout(() => ac.abort(), 10000);
```

<!-- 0049.part.md -->

### `readline.clearLine(stream, dir[, callback])`

-   `stream` {stream.Writable}
-   `dir` {число}
    -   `-1`: влево от курсора
    -   `1`: вправо от курсора
    -   `0`: вся строка
-   `callback` {Функция} Вызывается после завершения операции.
-   Возвращает: {булево} `false`, если `stream` хочет, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

Метод `readline.clearLine()` очищает текущую строку данного потока [TTY](tty.md) в указанном направлении, обозначенном `dir`.

### `readline.clearScreenDown(stream[, callback])`.

-   `stream` {stream.Writable}
-   `callback` {Function} Вызывается по завершении операции.
-   Возвращает: {boolean} `false`, если `stream` хочет, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

Метод `readline.clearScreenDown()` очищает данный поток [TTY](tty.md) от текущей позиции курсора вниз.

### `readline.createInterface(options)`.

-   `options` {Object}
    -   `input` {stream.Readable} Поток [Readable](stream.md#readable-streams), который нужно слушать. Этот параметр _обязателен_.
    -   `output` {stream.Writable} Поток [Writable](stream.md#writable-streams) для записи данных readline.
    -   `completer` {Function} Необязательная функция, используемая для автодополнения табуляции.
    -   `терминал` {boolean} `true`, если потоки `ввода` и `вывода` должны рассматриваться как TTY, и в них должны записываться коды ANSI/VT100. **По умолчанию:** проверка `isTTY` на потоке `output` при инстанцировании.
    -   `history` {string\[\]} Начальный список строк истории. Эта опция имеет смысл только если `terminal` установлен в `true` пользователем или внутренней проверкой `output`, иначе механизм кэширования истории не инициализируется вообще. **По умолчанию:** `[]`.
    -   `historySize` {number} Максимальное количество сохраняемых строк истории. Чтобы отключить историю, установите это значение в `0`. Эта опция имеет смысл только если `terminal` установлен в `true` пользователем или внутренней проверкой `output`, иначе механизм кэширования истории не инициализируется вообще. **По умолчанию:** `30`.
    -   `removeHistoryDuplicates` {boolean} Если `true`, когда новая входная строка, добавленная в список истории, дублирует более старую, это удаляет более старую строку из списка. **По умолчанию:** `false`.
    -   `prompt` {string} Используемая строка подсказки. **По умолчанию:** `'>``.
    -   `crlfDelay` {число} Если задержка между `\r` и `\n` превышает `crlfDelay` миллисекунд, то и `\r` и `\n` будут рассматриваться как отдельный ввод конца строки. `crlfDelay` будет приведен к числу не менее `100`. Оно может быть установлено в `бесконечность`, в этом случае `\r`, за которым следует `\n`, всегда будет считаться одной новой строкой (что может быть разумно для [чтения файлов](#example-read-file-stream-line-by-line) с `\r\n` разделителем строк). **По умолчанию:** `100`.
    -   `escapeCodeTimeout` {число} Продолжительность `readline` будет
    -   `tabSize` {целое число} Количество пробелов, которым равна табуляция (минимум 1). **По умолчанию:** `8`.
    -   `signal` {AbortSignal} Позволяет закрыть интерфейс с помощью сигнала AbortSignal. Прерывание сигнала приведет к внутреннему вызову `close` на интерфейсе.
-   Возвращает: {readline.Interface}

Метод `readline.createInterface()` создает новый экземпляр `readline.Interface`.

<!-- 0051.part.md -->

```js
const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
```

<!-- 0052.part.md -->

После создания экземпляра `readline.Interface`, наиболее распространенным случаем является прослушивание события `'line'`:

<!-- 0053.part.md -->

```js
rl.on('line', (line) => {
    console.log(`Received: ${line}`);
});
```

<!-- 0054.part.md -->

Если `terminal` для данного экземпляра имеет значение `true`, то поток `output` получит наилучшую совместимость, если он определит свойство `output.columns` и выдаст событие `'resize'` на `output`, если или когда колонки когда-либо изменятся ([`process.stdout`](process.md#processstdout) делает это автоматически, если это TTY).

При создании `readline.Interface` с использованием `stdin` в качестве входных данных, программа не завершится, пока не получит символ [EOF](https://en.wikipedia.org/wiki/End-of-file#EOF_character). Чтобы выйти, не дожидаясь ввода данных пользователем, вызовите `process.stdin.unref()`.

#### Использование функции `completer`

Функция `completer` принимает в качестве аргумента текущую строку, введенную пользователем, и возвращает `Array` с 2 записями:

-   Массив `Array` с соответствующими записями для завершения.
-   Подстрока, которая была использована для сопоставления.

Например: `[[substr1, substr2, ...], originalsubstring]`.

<!-- 0055.part.md -->

```js
function completer(line) {
    const completions = '.help .error .exit .quit .q'.split(
        ' '
    );
    const hits = completions.filter((c) =>
        c.startsWith(line)
    );
    // Show all completions if none found
    return [hits.length ? hits : completions, line];
}
```

<!-- 0056.part.md -->

Функция `completer` может быть вызвана асинхронно, если она принимает два аргумента:

<!-- 0057.part.md -->

```js
function completer(linePartial, callback) {
    callback(null, [['123'], linePartial]);
}
```

<!-- 0058.part.md -->

### `readline.cursorTo(stream, x[, y][, callback])`.

-   `stream` {stream.Writable}
-   `x` {число}
-   `y` {число}
-   `callback` {функция} Вызывается после завершения операции.
-   Возвращает: {boolean} `false`, если `stream` хочет, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

Метод `readline.cursorTo()` перемещает курсор в указанную позицию в данном [TTY](tty.md) `потоке`.

### `readline.moveCursor(stream, dx, dy[, callback])`.

-   `stream` {stream.Writable}
-   `dx` {число}
-   `dy` {число}
-   `callback` {функция} Вызывается после завершения операции.
-   Возвращает: {boolean} `false`, если `stream` хочет, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

Метод `readline.moveCursor()` перемещает курсор _относительно_ его текущей позиции в данном [TTY](tty.md) `потоке`.

## `readline.emitKeypressEvents(stream[, interface])`.

-   `поток` {stream.Readable}
-   `интерфейс` {readline.InterfaceConstructor}

Метод `readline.emitKeypressEvents()` заставляет данный поток [Readable](stream.md#readable-streams) начать испускать события `'keypress'`, соответствующие полученным входным данным.

Опционально, `interface` указывает экземпляр `readline.Interface`, для которого отключается автозавершение при обнаружении копируемого ввода.

Если `stream` является [TTY](tty.md), то он должен быть в режиме raw.

Это автоматически вызывается любым экземпляром readline на его `входе`, если `входом` является терминал. Закрытие экземпляра `readline` не прекращает испускание `input` событий `'keypress'`.

<!-- 0059.part.md -->

```js
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);
```

<!-- 0060.part.md -->

## Пример: Маленький интерфейс командной строки

Следующий пример иллюстрирует использование класса `readline.Interface` для реализации небольшого интерфейса командной строки:

<!-- 0061.part.md -->

```js
const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'OHAI> ',
});

rl.prompt();

rl.on('line', (line) => {
    switch (line.trim()) {
        case 'hello':
            console.log('world!');
            break;
        default:
            console.log(
                `Say what? I might have heard '${line.trim()}'`
            );
            break;
    }
    rl.prompt();
}).on('close', () => {
    console.log('Have a great day!');
    process.exit(0);
});
```

<!-- 0062.part.md -->

## Пример: Чтение потока файлов построчно

Обычный случай использования `readline` - это потребление входного файла по одной строке за раз. Самый простой способ сделать это - использовать API [`fs.ReadStream`](fs.md#class-fsreadstream), а также цикл `for await...of`:

<!-- 0063.part.md -->

```js
const fs = require('node:fs');
const readline = require('node:readline');

async function processLineByLine() {
    const fileStream = fs.createReadStream('input.txt');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        console.log(`Line from file: ${line}`);
    }
}

processLineByLine();
```

<!-- 0064.part.md -->

В качестве альтернативы можно использовать событие [`'line'`](#event-line):

<!-- 0065.part.md -->

```js
const fs = require('node:fs');
const readline = require('node:readline');

const rl = readline.createInterface({
    input: fs.createReadStream('sample.txt'),
    crlfDelay: Infinity,
});

rl.on('line', (line) => {
    console.log(`Line from file: ${line}`);
});
```

<!-- 0066.part.md -->

В настоящее время цикл `for await...of` может быть немного медленнее. Если поток `async` / `await` и скорость важны одновременно, можно применить смешанный подход:

<!-- 0067.part.md -->

```js
const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

(async function processLineByLine() {
    try {
        const rl = createInterface({
            input: createReadStream('big-file.txt'),
            crlfDelay: Infinity,
        });

        rl.on('line', (line) => {
            // Process the line.
        });

        await once(rl, 'close');

        console.log('File processed.');
    } catch (err) {
        console.error(err);
    }
})();
```

<!-- 0068.part.md -->

## TTY keybindings

<table>

<tr>

<th>

Keybindings

</th>

<th>

Description

</th>

<th>

Notes

</th>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Backspace</kbd>

</td>

<td>

Delete line left

</td>

<td>

Doesn’t work on Linux, Mac and Windows

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Delete</kbd>

</td>

<td>

Delete line right

</td>

<td>

Doesn’t work on Mac

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>C</kbd>

</td>

<td>

Emit <code>SIGINT</code> or close the readline instance

</td>

<td>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>H</kbd>

</td>

<td>

Delete left

</td>

<td>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>D</kbd>

</td>

<td>

Delete right or close the readline instance in case the current line is empty / EOF

</td>

<td>

Doesn’t work on Windows

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>U</kbd>

</td>

<td>

Delete from the current position to the line start

</td>

<td>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>K</kbd>

</td>

<td>

Delete from the current position to the end of line

</td>

<td>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>Y</kbd>

</td>

<td>

Yank (Recall) the previously deleted text

</td>

<td>

Only works with text deleted by <kbd>Ctrl</kbd>+<kbd>U</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd>

</td>

</tr>

<tr>

<td>

<kbd>Meta</kbd>+<kbd>Y</kbd>

</td>

<td>

Cycle among previously deleted lines

</td>

<td>

Only available when the last keystroke is <kbd>Ctrl</kbd>+<kbd>Y</kbd>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>A</kbd>

</td>

<td>

Go to start of line

</td>

<td>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>E</kbd>

</td>

<td>

Go to end of line

</td>

<td>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>B</kbd>

</td>

<td>

Back one character

</td>

<td>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>F</kbd>

</td>

<td>

Forward one character

</td>

<td>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>L</kbd>

</td>

<td>

Clear screen

</td>

<td>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>N</kbd>

</td>

<td>

Next history item

</td>

<td>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>P</kbd>

</td>

<td>

Previous history item

</td>

<td>

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>-</kbd>

</td>

<td>

Undo previous change

</td>

<td>

Any keystroke that emits key code <code>0x1F</code> will do this action. In many terminals, for example <code>xterm</code>, this is bound to <kbd>Ctrl</kbd>+<kbd>-</kbd>.

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>6</kbd>

</td>

<td>

Redo previous change

</td>

<td>

Many terminals don’t have a default redo keystroke. We choose key code <code>0x1E</code> to perform redo. In <code>xterm</code>, it is bound to <kbd>Ctrl</kbd>+<kbd>6</kbd> by default.

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>Z</kbd>

</td>

<td>

Moves running process into background. Type <code>fg</code> and press <kbd>Enter</kbd> to return.

</td>

<td>

Doesn’t work on Windows

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>W</kbd> or <kbd>Ctrl</kbd> +<kbd>Backspace</kbd>

</td>

<td>

Delete backward to a word boundary

</td>

<td>

<kbd>Ctrl</kbd>+<kbd>Backspace</kbd> Doesn’t work on Linux, Mac and Windows

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>Delete</kbd>

</td>

<td>

Delete forward to a word boundary

</td>

<td>

Doesn’t work on Mac

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>Left arrow</kbd> or <kbd>Meta</kbd>+<kbd>B</kbd>

</td>

<td>

Word left

</td>

<td>

<kbd>Ctrl</kbd>+<kbd>Left arrow</kbd> Doesn’t work on Mac

</td>

</tr>

<tr>

<td>

<kbd>Ctrl</kbd>+<kbd>Right arrow</kbd> or <kbd>Meta</kbd>+<kbd>F</kbd>

</td>

<td>

Word right

</td>

<td>

<kbd>Ctrl</kbd>+<kbd>Right arrow</kbd> Doesn’t work on Mac

</td>

</tr>

<tr>

<td>

<kbd>Meta</kbd>+<kbd>D</kbd> or <kbd>Meta</kbd> +<kbd>Delete</kbd>

</td>

<td>

Delete word right

</td>

<td>

<kbd>Meta</kbd>+<kbd>Delete</kbd> Doesn’t work on windows

</td>

</tr>

<tr>

<td>

<kbd>Meta</kbd>+<kbd>Backspace</kbd>

</td>

<td>

Delete word left

</td>

<td>

Doesn’t work on Mac

</td>

</tr>

</table>

<!-- 0070.part.md -->
