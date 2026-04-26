---
title: Построчный ввод (`readline`)
description: Модуль node:readline предоставляет интерфейс для чтения данных из потока Readable (например, process.stdin) по одной строке за раз
---

# Построчный ввод (`readline`)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:readline` предоставляет интерфейс для чтения данных из потока [Readable](stream.md#readable-streams) (например, [process.stdin](process.md#processstdin)) по одной строке за раз.

Чтобы использовать API на основе обещаний:

=== "MJS"

    ```js
    import * as readline from 'node:readline/promises';
    ```

=== "CJS"

    ```js
    const readline = require('node:readline/promises');
    ```

Чтобы использовать API обратного вызова и синхронизации:

=== "MJS"

    ```js
    import * as readline from 'node:readline';
    ```

=== "CJS"

    ```js
    const readline = require('node:readline');
    ```

Следующий простой пример иллюстрирует базовое использование модуля `node:readline`.

=== "MJS"

    ```js
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

=== "CJS"

    ```js
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

После вызова этого кода приложение Node.js не завершится, пока не будет закрыт `readline.Interface`, поскольку интерфейс ожидает получения данных в потоке `input`.

<a id='readline_class_interface'></a>

## Класс: `InterfaceConstructor`

-   Наследует: [`<EventEmitter>`](events.md#class-eventemitter)

Экземпляры класса `InterfaceConstructor` создаются методами `readlinePromises.createInterface()` или `readline.createInterface()`. Каждый экземпляр связан с одним потоком `input` [Readable](stream.md#readable-streams) и одним `output` [Writable](stream.md#writable-streams). Поток `output` используется для вывода приглашений к вводу; данные поступают и читаются из потока `input`.

### Событие: `'close'`

Событие `'close'` испускается в одном из случаев:

-   вызван `rl.close()` и экземпляр `InterfaceConstructor` отпустил потоки `input` и `output`;
-   поток `input` получил событие `'end'`;
-   на потоке `input` нажаты ++ctrl+d++ (EOT);
-   на потоке `input` нажаты ++ctrl+c++ (`SIGINT`), и на экземпляре `InterfaceConstructor` нет обработчика `'SIGINT'`.

Обработчик вызывается без аргументов.

После события `'close'` экземпляр `InterfaceConstructor` считается завершённым.

### Событие: `'error'`

Событие `'error'` испускается при ошибке на потоке `input`, связанном с интерфейсом `node:readline` `Interface`.

Обработчику передаётся один аргумент — объект `Error`.

### Событие: `'line'` {#event-line}

Событие `line` возникает всякий раз, когда поток `ввода` получает ввод конца строки (`\n`, `\r` или `\r\n`). Обычно это происходит, когда пользователь нажимает клавишу Enter или Return.

Событие `'line'` также испускается, если новые данные были прочитаны из потока, и этот поток заканчивается без маркера конца строки.

Функция слушателя вызывается со строкой, содержащей единственную строку полученного ввода.

```js
rl.on('line', (input) => {
    console.log(`Received: ${input}`);
});
```

### Событие: `history`

Событие `'history'` генерируется всякий раз, когда массив истории изменяется.

Функция-слушатель вызывается с массивом, содержащим массив истории. В нем будут отражены все изменения, добавленные и удаленные строки благодаря `historySize` и `removeHistoryDuplicates`.

Основная цель - позволить слушателю сохранять историю. Слушатель также может изменять объект истории. Это может быть полезно для предотвращения добавления в историю определенных строк, например, пароля.

```js
rl.on('history', (history) => {
    console.log(`Received: ${history}`);
});
```

### Событие: `pause`

Событие `pause` возникает, когда происходит одно из следующих событий:

-   Поток `input` приостановлен.
-   Входной поток не приостановлен и получает событие `'SIGCONT'`. (См. события [`'SIGTSTP'`](#event-sigtstp) и [`'SIGCONT'`](#event-sigcont)).

Функция слушателя вызывается без передачи каких-либо аргументов.

```js
rl.on('pause', () => {
    console.log('Readline paused.');
});
```

### Событие: `resume`

Событие `'resume'` генерируется всякий раз, когда возобновляется поток `ввода`.

Функция слушателя вызывается без передачи каких-либо аргументов.

```js
rl.on('resume', () => {
    console.log('Readline resumed.');
});
```

### Событие: `'SIGCONT'` {#event-sigcont}

Событие `SIGCONT` возникает, когда процесс Node.js, ранее переведенный в фоновый режим с помощью Ctrl+Z (т.е. `SIGTSTP`), затем возвращается на передний план с помощью fg(1p).

Если поток `input` был приостановлен _до_ запроса `SIGTSTP`, это событие не будет выдано.

Функция слушателя вызывается без передачи каких-либо аргументов.

```js
rl.on('SIGCONT', () => {
    // `prompt` will automatically resume the stream
    rl.prompt();
});
```

Событие `SIGCONT` _не_ поддерживается в Windows.

### Событие: `'SIGINT'`

Событие `'SIGINT'` генерируется всякий раз, когда поток `ввода` получает ввод Ctrl+C, известный обычно как `SIGINT`. Если нет зарегистрированных слушателей события `'SIGINT'`, когда поток `ввода` получает `SIGINT`, будет выдано событие `'pause'`.

Функция слушателя вызывается без передачи каких-либо аргументов.

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

### Событие: `SIGTSTP` {#event-sigtstp}

Событие `'SIGTSTP'` происходит, когда поток `ввода` получает входной сигнал Ctrl+Z, обычно известный как `SIGTSTP`. Если нет зарегистрированных слушателей события `'SIGTSTP'`, когда поток `ввода` получает `SIGTSTP`, процесс Node.js будет отправлен в фоновый режим.

Когда программа будет возобновлена с помощью fg(1p), будут испущены события `'pause'` и `'SIGCONT'`. Они могут быть использованы для возобновления потока `ввода`.

События `'pause'` и `'SIGCONT'` не будут выдаваться, если `входной поток` был приостановлен до того, как процесс был отправлен в фон.

Функция слушателя вызывается без передачи каких-либо аргументов.

```js
rl.on('SIGTSTP', () => {
    // This will override SIGTSTP and prevent the program from going to the
    // background.
    console.log('Caught SIGTSTP.');
});
```

Событие `'SIGTSTP'` _не_ поддерживается в Windows.

### `rl.close()`

Метод `rl.close()` закрывает экземпляр `InterfaceConstructor` и передает контроль над потоками `входа` и `выхода`. При вызове будет выдано событие `'close'`.

Вызов `rl.close()` не прекращает немедленно испускание других событий (включая `'line'`) экземпляром `InterfaceConstructor`.

### `rl.pause()`.

Метод `rl.pause()` приостанавливает поток `input`, позволяя возобновить его позже, если это необходимо.

Вызов `rl.pause()` не приостанавливает немедленно другие события (включая `'line'`), испускаемые экземпляром `InterfaceConstructor`.

### `rl.prompt([preserveCursor])`.

-   `preserveCursor` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, предотвращает сброс установки курсора на `0`.

Метод `rl.prompt()` записывает экземпляры `InterfaceConstructor`, настроенные на `prompt`, на новую строку в `output`, чтобы предоставить пользователю новое место для ввода.

При вызове `rl.prompt()` возобновит поток `ввода`, если он был приостановлен.

Если `InterfaceConstructor` был создан с `output`, установленным в `null` или `undefined`, подсказка не будет записана.

### `rl.resume()`.

Метод `rl.resume()` возобновляет поток `input`, если он был приостановлен.

### `rl.setPrompt(prompt)`

-   `prompt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `rl.setPrompt()` устанавливает подсказку, которая будет записываться в `output` при каждом вызове `rl.prompt()`.

### `rl.getPrompt()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) текущая строка подсказки

Метод `rl.getPrompt()` возвращает текущую подсказку, используемую `rl.prompt()`.

### `rl.write(data[, key])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `ctrl` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` — нажата клавиша ++ctrl++.
    -   `meta` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` — нажата клавиша ++meta++.
    -   `shift` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` — нажата клавиша ++shift++.
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя клавиши.

Метод `rl.write()` записывает на `выход` либо `данные`, либо последовательность ключей, идентифицированную `key`. Аргумент `key` поддерживается только если `output` является текстовым терминалом [TTY](tty.md). Список комбинаций клавиш см. в [привязках клавиш TTY](#tty-keybindings).

Если указана `key`, `data` игнорируется.

При вызове `rl.write()` возобновит поток `input`, если он был приостановлен.

Если `InterfaceConstructor` был создан с `output`, установленным в `null` или `undefined`, то `data` и `key` не записываются.

```js
rl.write('Delete this!');
// Simulate Ctrl+U to delete the line written previously
rl.write(null, { ctrl: true, name: 'u' });
```

Метод `rl.write()` запишет данные на `вход` интерфейса `readline` _как если бы они были предоставлены пользователем_.

### `rl[Symbol.asyncIterator]()`.

-   Возвращает: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface)

Создает объект `AsyncIterator`, который итерирует каждую строку во входном потоке как строку. Этот метод позволяет асинхронную итерацию объектов `InterfaceConstructor` через циклы `for await...of`.

Ошибки во входном потоке не пересылаются.

Если цикл завершается с помощью `break`, `throw` или `return`, будет вызван [`rl.close()`](#rlclose). Другими словами, итерация по `InterfaceConstructor` всегда будет полностью потреблять входной поток.

Производительность не соответствует традиционному API событий `'line'`. Используйте `'line'` вместо него для приложений, чувствительных к производительности.

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

После вызова `readline.createInterface()` начнет потреблять входной поток. Наличие асинхронных операций между созданием интерфейса и асинхронной итерацией может привести к пропуску строк.

### `rl.line`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Текущие входные данные, обрабатываемые узлом.

Это может быть использовано при сборе входных данных из потока TTY для получения текущего значения, которое было обработано до того, как будет выдано событие `line`. После того, как событие `line` было вызвано, это свойство будет пустой строкой.

Имейте в виду, что изменение значения во время выполнения экземпляра может иметь непредвиденные последствия, если `rl.cursor` также не контролируется.

**Если для ввода не используется поток TTY, используйте событие [`'line'`](#event-line).**.

Один из возможных вариантов использования может быть следующим:

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

### `rl.cursor`

-   [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined

Позиция курсора относительно `rl.line`.

Это позволяет отследить, где находится текущий курсор в строке ввода при чтении ввода из потока TTY. Позиция курсора определяет часть строки ввода, которая будет изменена при обработке ввода, а также столбец, в котором будет отображаться терминальный козырек.

### `rl.getCursorPos()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `rows` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) строка подсказки, на которой в данный момент находится курсор
    -   `cols` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) столбец экрана, на котором в данный момент находится курсор

Возвращает реальную позицию курсора по отношению к строке + подсказке ввода. Длинные строки ввода (обертка), а также многострочные подсказки включаются в вычисления.

## Обещания API

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальный

### Класс: `readlinePromises.Interface`

-   Расширяет: [readline.InterfaceConstructor](readline.md#interfaceconstructor)

Экземпляры класса `readlinePromises.Interface` создаются с помощью метода `readlinePromises.createInterface()`. Каждый экземпляр связан с одним потоком `input` [Readable](stream.md#readable-streams) и одним потоком `output` [Writable](stream.md#writable-streams). Поток `output` используется для печати подсказок для пользовательского ввода, который поступает на поток `input` и считывается с него.

#### `rl.question(query[, options])`

-   `query` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Оператор или запрос для записи на `вывод`, добавляемый к подсказке.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Опционально позволяет отменить `question()` с помощью сигнала `AbortSignal`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Обещание, которое будет выполнено с вводом пользователя в ответ на `query`.

Метод `rl.question()` отображает `запрос`, записывая его в `вывод`, ожидает ввода данных пользователем в `ввод`, затем вызывает функцию `обратный вызов`, передавая введенные данные в качестве первого аргумента.

При вызове `rl.question()` возобновит поток `input`, если он был приостановлен.

Если `readlinePromises.Interface` был создан с `output`, установленным на `null` или `undefined`, то `query` не записывается.

Если вопрос вызывается после `rl.close()`, он возвращает отклоненное обещание.

Пример использования:

=== "MJS"

    ```js
    const answer = await rl.question(
        'What is your favorite food? '
    );
    console.log(`Oh, so your favorite food is ${answer}`);
    ```

Использование сигнала `AbortSignal` для отмены вопроса.

=== "MJS"

    ```js
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

### Класс: `readlinePromises.Readline`.

#### `новый readlinePromises.Readline(stream[, options])`.

-   `stream` [`<stream.Writable>`](stream.md#class-streamwritable) [TTY](tty.md) поток.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `autoCommit` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, не нужно вызывать `rl.commit()`.

#### `rl.clearLine(dir)`.

-   `dir` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `-1`: влево от курсора
    -   `1`: вправо от курсора
    -   `0`: вся строка
-   Возвращает: this

Метод `rl.clearLine()` добавляет во внутренний список ожидающих выполнения действий действие, которое очищает текущую строку связанного с ней `потока` в указанном направлении, обозначенном `dir`. Вызовите `rl.commit()`, чтобы увидеть эффект этого метода, если только `autoCommit: true` не было передано в конструктор.

#### `rl.clearScreenDown()`.

-   Возвращает: this

Метод `rl.clearScreenDown()` добавляет во внутренний список ожидающих действий действие, которое очищает связанный поток от текущей позиции курсора вниз. Вызовите `rl.commit()`, чтобы увидеть эффект этого метода, если только `autoCommit: true` не было передано в конструктор.

#### `rl.commit()`.

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Метод `rl.commit()` отправляет все отложенные действия в связанный `поток` и очищает внутренний список отложенных действий.

#### `rl.cursorTo(x[, y])`.

-   `x` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `y` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: this

Метод `rl.cursorTo()` добавляет во внутренний список ожидающих действий действие, которое перемещает курсор в указанную позицию в связанном `потоке`. Вызовите `rl.commit()`, чтобы увидеть эффект этого метода, если только `autoCommit: true` не было передано в конструктор.

#### `rl.moveCursor(dx, dy)`.

-   `dx` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `dy` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: this

Метод `rl.moveCursor()` добавляет во внутренний список ожидающих выполнения действий действие, которое перемещает курсор _относительно_ его текущей позиции в связанном `потоке`. Вызовите `rl.commit()`, чтобы увидеть эффект этого метода, если только `autoCommit: true` не было передано в конструктор.

#### `rl.rollback()`.

-   Возвращает: this

Методы `rl.rollback` очищают внутренний список ожидающих действий без отправки его в связанный `поток`.

### `readlinePromises.createInterface(options)`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `вход` [`<stream.Readable>`](stream.md#class-streamreadable) Поток [Readable](stream.md#readable-streams), который нужно слушать. Этот параметр _обязателен_.
    -   `output` [`<stream.Writable>`](stream.md#class-streamwritable) Поток [Writable](stream.md#writable-streams) для записи данных readline.
    -   `completer` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательная функция, используемая для автодополнения табуляции.
    -   `терминал` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если потоки `ввода` и `вывода` должны рассматриваться как TTY, и в них должны записываться коды ANSI/VT100. **По умолчанию:** проверка `isTTY` на потоке `output` при инстанцировании.
    -   `history` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Начальный список строк истории. Эта опция имеет смысл только если `terminal` установлен в `true` пользователем или внутренней проверкой `output`, иначе механизм кэширования истории не инициализируется вообще. **По умолчанию:** `[]`.
    -   `historySize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное количество сохраняемых строк истории. Чтобы отключить историю, установите это значение в `0`. Эта опция имеет смысл, только если `terminal` установлен в `true` пользователем или внутренней проверкой `output`, иначе механизм кэширования истории вообще не инициализируется. **По умолчанию:** `30`.
    -   `removeHistoryDuplicates` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, когда новая строка ввода, добавленная в список истории, дублирует более старую строку, это удаляет более старую строку из списка. **По умолчанию:** `false`.
    -   `prompt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Используемая строка подсказки. **По умолчанию:** `'> '`.
    -   `crlfDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Если задержка между `\r` и `\n` превышает `crlfDelay` миллисекунд, то и `\r` и `\n` будут рассматриваться как отдельный ввод конца строки. `crlfDelay` будет приведен к числу не менее `100`. Оно может быть установлено в `бесконечность`, в этом случае `\r`, за которым следует `\n`, всегда будет считаться одной новой строкой (что может быть разумно для [чтения файлов](#example-read-file-stream-line-by-line) с `\r\n` разделителем строк). **По умолчанию:** `100`.
    -   `escapeCodeTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Продолжительность, в течение которой `readlinePromises` будет ожидать символа (при чтении неоднозначной последовательности клавиш в миллисекундах, которая может как сформировать полную последовательность клавиш, используя прочитанный на данный момент ввод, так и принять дополнительный ввод для завершения более длинной последовательности клавиш). **По умолчанию:** `500`.
    -   `tabSize` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество пробелов, которым равна табуляция (минимум 1). **По умолчанию:** `8`.
-   Возвращает: [`<readlinePromises.Interface>`](readline.md)

Метод `readlinePromises.createInterface()` создает новый экземпляр `readlinePromises.Interface`.

```js
const readlinePromises = require('node:readline/promises');
const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout,
});
```

После создания экземпляра `readlinePromises.Interface`, наиболее распространенным случаем является прослушивание события `'line'`:

```js
rl.on('line', (line) => {
    console.log(`Received: ${line}`);
});
```

Если `terminal` является `true` для данного экземпляра, то поток `output` получит наилучшую совместимость, если он определит свойство `output.columns` и испустит событие `'resize'` на `output`, если или когда колонки когда-либо изменятся ([`process.stdout`](process.md#processstdout) делает это автоматически, если это TTY).

#### Использование функции `completer`.

Функция `completer` принимает в качестве аргумента текущую строку, введенную пользователем, и возвращает `Array` с 2 записями:

-   Массив `Array` с соответствующими записями для завершения.
-   Подстрока, которая была использована для сопоставления.

Например: `[[substr1, substr2, ...], originalsubstring]`.

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

Функция `completer` может также возвращать [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) или быть асинхронной:

```js
async function completer(linePartial) {
    await someAsyncWork();
    return [['123'], linePartial];
}
```

## API обратного вызова

### Класс: `readline.Interface`

-   Расширяет: [readline.InterfaceConstructor](readline.md#interfaceconstructor)

Экземпляры класса `readline.Interface` создаются с помощью метода `readline.createInterface()`. Каждый экземпляр связан с одним потоком `input` [Readable](stream.md#readable-streams) и одним потоком `output` [Writable](stream.md#writable-streams). Поток `output` используется для печати подсказок для пользовательского ввода, который поступает на поток `input` и считывается с него.

#### `rl.question(query[, options], callback)`.

-   `query` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Утверждение или запрос для записи в `вывод`, добавляемый к подсказке.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Опционально позволяет отменить `question()` с помощью `AbortController`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова, которая вызывается с вводом пользователя в ответ на `вопрос`.

Метод `rl.question()` отображает `запрос`, записывая его на `вывод`, ждет ввода данных пользователем на `вводе`, затем вызывает функцию `обратного вызова`, передавая введенные данные в качестве первого аргумента.

После вызова `rl.question()` возобновит поток `input`, если он был приостановлен.

Если `readline.Interface` был создан с `output`, установленным в `null` или `undefined`, то `query` не записывается.

Функция `callback`, передаваемая в `rl.question()`, не следует типичной схеме принятия объекта `Error` или `null` в качестве первого аргумента. Функция `callback` вызывается с предоставленным ответом в качестве единственного аргумента.

При вызове `rl.question()` после `rl.close()` произойдет ошибка.

Пример использования:

```js
rl.question('What is your favorite food? ', (answer) => {
    console.log(`Oh, so your favorite food is ${answer}`);
});
```

Использование `AbortController` для отмены вопроса.

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

### `readline.clearLine(stream, dir[, callback])`

-   `stream` [`<stream.Writable>`](stream.md#class-streamwritable)
-   `dir` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `-1`: влево от курсора
    -   `1`: вправо от курсора
    -   `0`: вся строка
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после завершения операции.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false`, если `stream` хочет, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

Метод `readline.clearLine()` очищает текущую строку данного потока [TTY](tty.md) в указанном направлении, обозначенном `dir`.

### `readline.clearScreenDown(stream[, callback])`.

-   `stream` [`<stream.Writable>`](stream.md#class-streamwritable)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается по завершении операции.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false`, если `stream` хочет, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

Метод `readline.clearScreenDown()` очищает данный поток [TTY](tty.md) от текущей позиции курсора вниз.

### `readline.createInterface(options)`.

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `input` [`<stream.Readable>`](stream.md#class-streamreadable) Поток [Readable](stream.md#readable-streams), который нужно слушать. Этот параметр _обязателен_.
    -   `output` [`<stream.Writable>`](stream.md#class-streamwritable) Поток [Writable](stream.md#writable-streams) для записи данных readline.
    -   `completer` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательная функция, используемая для автодополнения табуляции.
    -   `терминал` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если потоки `ввода` и `вывода` должны рассматриваться как TTY, и в них должны записываться коды ANSI/VT100. **По умолчанию:** проверка `isTTY` на потоке `output` при инстанцировании.
    -   `history` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Начальный список строк истории. Эта опция имеет смысл только если `terminal` установлен в `true` пользователем или внутренней проверкой `output`, иначе механизм кэширования истории не инициализируется вообще. **По умолчанию:** `[]`.
    -   `historySize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное количество сохраняемых строк истории. Чтобы отключить историю, установите это значение в `0`. Эта опция имеет смысл только если `terminal` установлен в `true` пользователем или внутренней проверкой `output`, иначе механизм кэширования истории не инициализируется вообще. **По умолчанию:** `30`.
    -   `removeHistoryDuplicates` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, когда новая входная строка, добавленная в список истории, дублирует более старую, это удаляет более старую строку из списка. **По умолчанию:** `false`.
    -   `prompt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Используемая строка подсказки. **По умолчанию:** `'> '`.
    -   `crlfDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Если задержка между `\r` и `\n` превышает `crlfDelay` миллисекунд, то и `\r` и `\n` будут рассматриваться как отдельный ввод конца строки. `crlfDelay` будет приведен к числу не менее `100`. Оно может быть установлено в `бесконечность`, в этом случае `\r`, за которым следует `\n`, всегда будет считаться одной новой строкой (что может быть разумно для [чтения файлов](#example-read-file-stream-line-by-line) с `\r\n` разделителем строк). **По умолчанию:** `100`.
    -   `escapeCodeTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Продолжительность (в миллисекундах), в течение которой `readline` ждёт символ при чтении неоднозначной последовательности клавиш. **По умолчанию:** `500`.
    -   `tabSize` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество пробелов, которым равна табуляция (минимум 1). **По умолчанию:** `8`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет закрыть интерфейс с помощью сигнала AbortSignal. Прерывание сигнала приведет к внутреннему вызову `close` на интерфейсе.
-   Возвращает: [`<readline.Interface>`](readline.md)

Метод `readline.createInterface()` создает новый экземпляр `readline.Interface`.

```js
const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
```

После создания экземпляра `readline.Interface`, наиболее распространенным случаем является прослушивание события `'line'`:

```js
rl.on('line', (line) => {
    console.log(`Received: ${line}`);
});
```

Если `terminal` для данного экземпляра имеет значение `true`, то поток `output` получит наилучшую совместимость, если он определит свойство `output.columns` и выдаст событие `'resize'` на `output`, если или когда колонки когда-либо изменятся ([`process.stdout`](process.md#processstdout) делает это автоматически, если это TTY).

При создании `readline.Interface` с использованием `stdin` в качестве входных данных, программа не завершится, пока не получит символ [EOF](https://en.wikipedia.org/wiki/End-of-file#EOF_character). Чтобы выйти, не дожидаясь ввода данных пользователем, вызовите `process.stdin.unref()`.

#### Использование функции `completer` {#use-of-the-completer-function}

Функция `completer` принимает в качестве аргумента текущую строку, введенную пользователем, и возвращает `Array` с 2 записями:

-   Массив `Array` с соответствующими записями для завершения.
-   Подстрока, которая была использована для сопоставления.

Например: `[[substr1, substr2, ...], originalsubstring]`.

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

Функция `completer` может быть вызвана асинхронно, если она принимает два аргумента:

```js
function completer(linePartial, callback) {
    callback(null, [['123'], linePartial]);
}
```

### `readline.cursorTo(stream, x[, y][, callback])`.

-   `stream` [`<stream.Writable>`](stream.md#class-streamwritable)
-   `x` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `y` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после завершения операции.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false`, если `stream` хочет, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

Метод `readline.cursorTo()` перемещает курсор в указанную позицию в данном [TTY](tty.md) `потоке`.

### `readline.moveCursor(stream, dx, dy[, callback])`.

-   `stream` [`<stream.Writable>`](stream.md#class-streamwritable)
-   `dx` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `dy` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после завершения операции.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false`, если `stream` хочет, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

Метод `readline.moveCursor()` перемещает курсор _относительно_ его текущей позиции в данном [TTY](tty.md) `потоке`.

## `readline.emitKeypressEvents(stream[, interface])`.

-   `поток` [`<stream.Readable>`](stream.md#class-streamreadable)
-   `интерфейс` [`<readline.InterfaceConstructor>`](readline.md#interfaceconstructor)

Метод `readline.emitKeypressEvents()` заставляет данный поток [Readable](stream.md#readable-streams) начать испускать события `'keypress'`, соответствующие полученным входным данным.

Опционально, `interface` указывает экземпляр `readline.Interface`, для которого отключается автозавершение при обнаружении копируемого ввода.

Если `stream` является [TTY](tty.md), то он должен быть в режиме raw.

Это автоматически вызывается любым экземпляром readline на его `входе`, если `входом` является терминал. Закрытие экземпляра `readline` не прекращает испускание `input` событий `'keypress'`.

```js
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);
```

## Пример: Маленький интерфейс командной строки

Следующий пример иллюстрирует использование класса `readline.Interface` для реализации небольшого интерфейса командной строки:

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

## Пример: Чтение потока файлов построчно {#example-read-file-stream-line-by-line}

Обычный случай использования `readline` - это потребление входного файла по одной строке за раз. Самый простой способ сделать это - использовать API [`fs.ReadStream`](fs.md#class-fsreadstream), а также цикл `for await...of`:

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

В качестве альтернативы можно использовать событие [`'line'`](#event-line):

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

В настоящее время цикл `for await...of` может быть немного медленнее. Если поток `async` / `await` и скорость важны одновременно, можно применить смешанный подход:

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

## Привязки клавиш TTY {#tty-keybindings}

| Сочетание | Действие | Примечания |
| --- | --- | --- |
| ++ctrl+shift+backspace++ | Удалить строку слева | Не работает на Linux, macOS и Windows |
| ++ctrl+shift+delete++ | Удалить строку справа | Не работает на macOS |
| ++ctrl+c++ | Сгенерировать `SIGINT` или закрыть экземпляр readline |  |
| ++ctrl+h++ | Удалить символ слева |  |
| ++ctrl+d++ | Удалить справа или закрыть readline, если строка пуста / EOF | Не работает на Windows |
| ++ctrl+u++ | Удалить от курсора до начала строки |  |
| ++ctrl+k++ | Удалить от курсора до конца строки |  |
| ++ctrl+y++ | Вставить ранее удалённый текст (yank) | Работает только с текстом, удалённым через ++ctrl+u++ или ++ctrl+k++ |
| ++meta+y++ | Переключение между ранее удалёнными строками | Доступно, если последнее нажатие — ++ctrl+y++ |
| ++ctrl+a++ | В начало строки |  |
| ++ctrl+e++ | В конец строки |  |
| ++ctrl+b++ | На символ назад |  |
| ++ctrl+f++ | На символ вперёд |  |
| ++ctrl+l++ | Очистить экран |  |
| ++ctrl+n++ | Следующий элемент истории |  |
| ++ctrl+p++ | Предыдущий элемент истории |  |
| ++ctrl+minus++ | Отменить последнее изменение | Любое нажатие с кодом клавиши `0x1F` выполняет это действие. Во многих терминалах, например `xterm`, это привязано к ++ctrl+minus++. |
| ++ctrl+6++ | Повторить отменённое изменение | Во многих терминалах нет стандартной клавиши повтора. Для redo используется код `0x1E`. В `xterm` по умолчанию это ++ctrl+6++. |
| ++ctrl+z++ | Переводит процесс в фон. Введите `fg` и нажмите ++enter++, чтобы вернуть. | Не работает на Windows |
| ++ctrl+w++ or ++ctrl+backspace++ | Удалить назад до границы слова | ++ctrl+backspace++ не работает на Linux, macOS и Windows |
| ++ctrl+delete++ | Удалить вперёд до границы слова | Не работает на macOS |
| ++ctrl+left+arrow++ or ++meta+b++ | Слово влево | ++ctrl+left++ не работает на macOS |
| ++ctrl+right+arrow++ or ++meta+f++ | Слово вправо | ++ctrl+right++ не работает на macOS |
| ++meta+d++ or ++meta+delete++ | Удалить слово справа | ++meta+delete++ не работает на Windows |
| ++meta+backspace++ | Удалить слово слева | Не работает на macOS |
