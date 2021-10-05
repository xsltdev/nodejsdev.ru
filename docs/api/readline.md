# Модуль readline

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/readline.js -->

В `readline` модуль предоставляет интерфейс для чтения данных из [Удобочитаемый](stream.md#readable-streams) поток (например, [`process.stdin`](process.md#processstdin)) по одной строке за раз.

Чтобы использовать API на основе обещаний:

```mjs
import * as readline from 'node:readline/promises';
```

```cjs
const readline = require('readline/promises');
```

Чтобы использовать API обратного вызова и синхронизации:

```mjs
import * as readline from 'node:readline';
```

```cjs
const readline = require('readline');
```

Следующий простой пример иллюстрирует базовое использование `readline` модуль.

```mjs
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'process';

const rl = readline.createInterface({ input, output });

const answer = await rl.question(
  'What do you think of Node.js? '
);

console.log(
  `Thank you for your valuable feedback: ${answer}`
);

rl.close();
```

```cjs
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

const rl = readline.createInterface({ input, output });

rl.question('What do you think of Node.js? ', (answer) => {
  // TODO: Log the answer in a database
  console.log(
    `Thank you for your valuable feedback: ${answer}`
  );

  rl.close();
});
```

После вызова этого кода приложение Node.js не завершит работу до тех пор, пока `readline.Interface` закрыт, потому что интерфейс ожидает получения данных на `input` транслировать.

<a id='readline_class_interface'></a>

## Класс: `InterfaceConstructor`

<!-- YAML
added: v0.1.104
-->

- Расширяется: {EventEmitter}

Экземпляры `InterfaceConstructor` класс построены с использованием `readlinePromises.createInterface()` или `readline.createInterface()` метод. Каждый экземпляр связан с одним `input` [Удобочитаемый](stream.md#readable-streams) поток и одиночный `output` [Возможность записи](stream.md#writable-streams) транслировать. В `output` поток используется для печати подсказок для пользовательского ввода, которые поступают и считываются из `input` транслировать.

### Событие: `'close'`

<!-- YAML
added: v0.1.98
-->

В `'close'` Событие генерируется, когда происходит одно из следующих событий:

- В `rl.close()` вызывается метод и `InterfaceConstructor` экземпляр отказался от контроля над `input` а также `output` ручьи;
- В `input` поток получает свой `'end'` событие;
- В `input` поток получает <kbd>Ctrl</kbd>+<kbd>D</kbd> сигнализировать об окончании передачи (EOT);
- В `input` поток получает <kbd>Ctrl</kbd>+<kbd>C</kbd> сигнализировать `SIGINT` и нет `'SIGINT'` прослушиватель событий, зарегистрированный на `InterfaceConstructor` пример.

Функция слушателя вызывается без передачи каких-либо аргументов.

В `InterfaceConstructor` экземпляр завершен, как только `'close'` событие испускается.

### Событие: `'line'`

<!-- YAML
added: v0.1.98
-->

В `'line'` событие генерируется всякий раз, когда `input` поток получает ввод конца строки (`\n`, `\r`, или `\r\n`). Обычно это происходит, когда пользователь нажимает <kbd>Входить</kbd> или <kbd>Возвращение</kbd>.

Функция слушателя вызывается со строкой, содержащей единственную строку полученного ввода.

```js
rl.on('line', (input) => {
  console.log(`Received: ${input}`);
});
```

### Событие: `'history'`

<!-- YAML
added:
  - v15.8.0
  - v14.18.0
-->

В `'history'` событие генерируется всякий раз, когда изменяется массив истории.

Функция слушателя вызывается с массивом, содержащим массив истории. В нем будут отражены все изменения, добавленные и удаленные строки из-за `historySize` а также `removeHistoryDuplicates`.

Основная цель - позволить слушателю сохранить историю. Слушатель также может изменить объект истории. Это может быть полезно для предотвращения добавления определенных строк в историю, например пароля.

```js
rl.on('history', (history) => {
  console.log(`Received: ${history}`);
});
```

### Событие: `'pause'`

<!-- YAML
added: v0.7.5
-->

В `'pause'` Событие генерируется, когда происходит одно из следующих событий:

- В `input` поток приостановлен.
- В `input` поток не приостанавливается и получает `'SIGCONT'` событие. (Посмотреть события [`'SIGTSTP'`](#event-sigtstp) а также [`'SIGCONT'`](#event-sigcont).)

Функция слушателя вызывается без передачи каких-либо аргументов.

```js
rl.on('pause', () => {
  console.log('Readline paused.');
});
```

### Событие: `'resume'`

<!-- YAML
added: v0.7.5
-->

В `'resume'` событие генерируется всякий раз, когда `input` поток возобновлен.

Функция слушателя вызывается без передачи каких-либо аргументов.

```js
rl.on('resume', () => {
  console.log('Readline resumed.');
});
```

### Событие: `'SIGCONT'`

<!-- YAML
added: v0.7.5
-->

В `'SIGCONT'` событие генерируется, когда процесс Node.js ранее перемещался в фоновый режим с помощью <kbd>Ctrl</kbd>+<kbd>Z</kbd> (т.е. `SIGTSTP`) затем возвращается на передний план с помощью fg (1p).

Если `input` трансляция была приостановлена _до_ в `SIGTSTP` запрос, это событие не будет отправлено.

Функция слушателя вызывается без передачи каких-либо аргументов.

```js
rl.on('SIGCONT', () => {
  // `prompt` will automatically resume the stream
  rl.prompt();
});
```

В `'SIGCONT'` событие _нет_ поддерживается в Windows.

### Событие: `'SIGINT'`

<!-- YAML
added: v0.3.0
-->

В `'SIGINT'` событие генерируется всякий раз, когда `input` поток получает <kbd>Ctrl + C</kbd> ввод, обычно известный как `SIGINT`. Если нет `'SIGINT'` прослушиватели событий зарегистрировались, когда `input` поток получает `SIGINT`, то `'pause'` событие будет выпущено.

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

### Событие: `'SIGTSTP'`

<!-- YAML
added: v0.7.5
-->

В `'SIGTSTP'` событие генерируется, когда `input` поток получает <kbd>Ctrl</kbd>+<kbd>Z</kbd> ввод, обычно известный как `SIGTSTP`. Если нет `'SIGTSTP'` прослушиватели событий зарегистрировались, когда `input` поток получает `SIGTSTP`, процесс Node.js будет отправлен в фоновый режим.

Когда программа возобновляется с помощью fg (1p), `'pause'` а также `'SIGCONT'` события будут отправлены. Их можно использовать для возобновления `input` транслировать.

В `'pause'` а также `'SIGCONT'` события не будут генерироваться, если `input` был приостановлен перед отправкой процесса в фоновый режим.

Функция слушателя вызывается без передачи каких-либо аргументов.

```js
rl.on('SIGTSTP', () => {
  // This will override SIGTSTP and prevent the program from going to the
  // background.
  console.log('Caught SIGTSTP.');
});
```

В `'SIGTSTP'` событие _нет_ поддерживается в Windows.

### `rl.close()`

<!-- YAML
added: v0.1.98
-->

В `rl.close()` метод закрывает `InterfaceConstructor` инстанции и отказывается от контроля над `input` а также `output` потоки. При вызове `'close'` событие будет выпущено.

Вызов `rl.close()` не останавливает сразу другие события (в том числе `'line'`) от испускания `InterfaceConstructor` пример.

### `rl.pause()`

<!-- YAML
added: v0.3.4
-->

В `rl.pause()` метод приостанавливает `input` stream, позволяя при необходимости возобновить его позже.

Вызов `rl.pause()` не приостанавливает сразу другие события (в том числе `'line'`) от испускания `InterfaceConstructor` пример.

### `rl.prompt([preserveCursor])`

<!-- YAML
added: v0.1.98
-->

- `preserveCursor` {boolean} Если `true`, предотвращает сброс положения курсора на `0`.

В `rl.prompt()` метод пишет `InterfaceConstructor` экземпляры настроены `prompt` на новую строку в `output` чтобы предоставить пользователю новое место для ввода.

Когда позвонили, `rl.prompt()` возобновит `input` поток, если он был приостановлен.

Если `InterfaceConstructor` был создан с `output` установлен в `null` или `undefined` подсказка не написана.

### `rl.question(query[, options], callback)`

<!-- YAML
added: v0.3.3
-->

- `query` {строка} Оператор или запрос для записи `output`, добавляется к подсказке.
- `options` {Объект}
  - `signal` {AbortSignal} Опционально позволяет `question()` быть отмененным с использованием `AbortController`.
- `callback` {Функция} Функция обратного вызова, которая вызывается при вводе пользователем в ответ на `query`.

В `rl.question()` метод отображает `query` написав это в `output`, ожидает ввода данных пользователем на `input`, затем вызывает `callback` функция, передающая предоставленный ввод в качестве первого аргумента.

Когда позвонили, `rl.question()` возобновит `input` поток, если он был приостановлен.

Если `InterfaceConstructor` был создан с `output` установлен в `null` или `undefined` в `query` не написано.

В `callback` функция передана `rl.question()` не следует типичной схеме принятия `Error` объект или `null` как первый аргумент. В `callback` вызывается с предоставленным ответом в качестве единственного аргумента.

Пример использования:

```js
rl.question('What is your favorite food? ', (answer) => {
  console.log(`Oh, so your favorite food is ${answer}`);
});
```

Используя `AbortController` отменить вопрос.

```js
const ac = new AbortController();
const signal = ac.signal;

rl.question(
  'What is your favorite food? ',
  { signal },
  (answer) => {
    console.log(`Oh, so your favorite food is ${answer}`);
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

Если этот метод вызывается как его версия с использованием util.promisify (), он возвращает обещание, которое выполняется с ответом. Если вопрос отменен с помощью `AbortController` он отклонит `AbortError`.

```js
const util = require('util');
const question = util.promisify(rl.question).bind(rl);

async function questionExample() {
  try {
    const answer = await question(
      'What is you favorite food? '
    );
    console.log(`Oh, so your favorite food is ${answer}`);
  } catch (err) {
    console.error('Question rejected', err);
  }
}
questionExample();
```

### `rl.resume()`

<!-- YAML
added: v0.3.4
-->

В `rl.resume()` метод возобновляет `input` поток, если он был приостановлен.

### `rl.setPrompt(prompt)`

<!-- YAML
added: v0.1.98
-->

- `prompt` {нить}

В `rl.setPrompt()` метод устанавливает приглашение, которое будет записано в `output` в любое время `rl.prompt()` называется.

### `rl.getPrompt()`

<!-- YAML
added:
  - v15.3.0
  - v14.17.0
-->

- Возвращает: {строка} текущая строка приглашения.

В `rl.getPrompt()` метод возвращает текущую подсказку, используемую `rl.prompt()`.

### `rl.write(data[, key])`

<!-- YAML
added: v0.1.98
-->

- `data` {нить}
- `key` {Объект}
  - `ctrl` {логический} `true` указать <kbd>Ctrl</kbd> ключ.
  - `meta` {логический} `true` указать <kbd>Мета</kbd> ключ.
  - `shift` {логический} `true` указать <kbd>Сдвиг</kbd> ключ.
  - `name` {строка} Имя ключа.

В `rl.write()` метод напишет либо `data` или ключевая последовательность, обозначенная `key` к `output`. В `key` аргумент поддерживается, только если `output` это [Телетайп](tty.md) текстовый терминал. Видеть [Связки клавиш TTY](#tty-keybindings) для списка комбинаций клавиш.

Если `key` указано, `data` игнорируется.

Когда позвонили, `rl.write()` возобновит `input` поток, если он был приостановлен.

Если `InterfaceConstructor` был создан с `output` установлен в `null` или `undefined` в `data` а также `key` не написаны.

```js
rl.write('Delete this!');
// Simulate Ctrl+U to delete the line written previously
rl.write(null, { ctrl: true, name: 'u' });
```

В `rl.write()` метод запишет данные в `readline` `Interface`с `input` _как если бы он был предоставлен пользователем_.

### `rl[Symbol.asyncIterator]()`

<!-- YAML
added:
 - v11.4.0
 - v10.16.0
changes:
  - version:
     - v11.14.0
     - v10.17.0
    pr-url: https://github.com/nodejs/node/pull/26989
    description: Symbol.asyncIterator support is no longer experimental.
-->

- Возвращает: {AsyncIterator}

Создать `AsyncIterator` объект, который выполняет итерацию по каждой строке входного потока в виде строки. Этот метод позволяет выполнять асинхронную итерацию `InterfaceConstructor` объекты через `for await...of` петли.

Ошибки во входном потоке не пересылаются.

Если цикл завершается `break`, `throw`, или `return`, [`rl.close()`](#rlclose) будет называться. Другими словами, перебор `InterfaceConstructor` всегда будет полностью потреблять входной поток.

Производительность не на одном уровне с традиционными `'line'` API событий. Использовать `'line'` вместо этого для приложений, чувствительных к производительности.

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

`readline.createInterface()` после вызова начнет потреблять входной поток. Наличие асинхронных операций между созданием интерфейса и асинхронной итерацией может привести к пропущенным строкам.

### `rl.line`

<!-- YAML
added: v0.1.98
changes:
  - version:
      - v15.8.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/33676
    description: Value will always be a string, never undefined.
-->

- {нить}

Текущие входные данные обрабатываются узлом.

Это можно использовать при сборе входных данных из потока TTY для получения текущего значения, которое было обработано до сих пор, до `line` генерируемое событие. Однажды `line` было отправлено событие, это свойство будет пустой строкой.

Имейте в виду, что изменение значения во время выполнения экземпляра может иметь непредвиденные последствия, если `rl.cursor` тоже не контролируется.

**Если для ввода не используется поток TTY, используйте [`'line'`](#event-line) событие.**

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

<!-- YAML
added: v0.1.98
-->

- {number | undefined}

Положение курсора относительно `rl.line`.

Это будет отслеживать, где находится текущий курсор во входной строке при чтении ввода из потока TTY. Положение курсора определяет часть входной строки, которая будет изменена при обработке ввода, а также столбец, в котором будет отображаться курсор терминала.

### `rl.getCursorPos()`

<!-- YAML
added:
 - v13.5.0
 - v12.16.0
-->

- Возвращает: {Object}
  - `rows` {число} строка подсказки, на которой в данный момент находится курсор
  - `cols` {number} столбец экрана, на котором в данный момент находится курсор

Возвращает реальную позицию курсора относительно строки ввода + строки. В вычисления включены длинные строки ввода (обертывания), а также многострочные подсказки.

## Обещает API

<!-- YAML
added: REPLACEME
-->

> Стабильность: 1 - экспериментальная

### Класс: `readlinePromises.Interface`

<!-- YAML
added: REPLACEME
-->

- Расширяется: {readline.InterfaceConstructor}

Экземпляры `readlinePromises.Interface` класс построены с использованием `readlinePromises.createInterface()` метод. Каждый экземпляр связан с одним `input` [Удобочитаемый](stream.md#readable-streams) поток и одиночный `output` [Возможность записи](stream.md#writable-streams) транслировать. В `output` поток используется для печати подсказок для пользовательского ввода, которые поступают и считываются из `input` транслировать.

#### `rl.question(query[, options])`

<!-- YAML
added: REPLACEME
-->

- `query` {строка} Оператор или запрос для записи `output`, добавляется к подсказке.
- `options` {Объект}
  - `signal` {AbortSignal} Опционально позволяет `question()` быть отмененным с использованием `AbortController`.
- Возвращает: {Promise} обещание, которое выполняется при вводе пользователя в ответ на `query`.

В `rl.question()` метод отображает `query` написав это в `output`, ожидает ввода данных пользователем на `input`, затем вызывает `callback` функция, передающая предоставленный ввод в качестве первого аргумента.

Когда позвонили, `rl.question()` возобновит `input` поток, если он был приостановлен.

Если `readlinePromises.Interface` был создан с `output` установлен в `null` или `undefined` в `query` не написано.

Пример использования:

```mjs
const answer = await rl.question(
  'What is your favorite food? '
);
console.log(`Oh, so your favorite food is ${answer}`);
```

Используя `AbortController` отменить вопрос.

```mjs
const ac = new AbortController();
const signal = ac.signal;

const answer = await rl.question(
  'What is your favorite food? ',
  { signal }
);
console.log(`Oh, so your favorite food is ${answer}`);

signal.addEventListener(
  'abort',
  () => {
    console.log('The food question timed out');
  },
  { once: true }
);

setTimeout(() => ac.abort(), 10000);
```

### Класс: `readlinePromises.Readline`

<!-- YAML
added: REPLACEME
-->

#### `new readlinePromises.Readline(stream[, options])`

<!-- YAML
added: REPLACEME
-->

- `stream` {stream.Writable} А [Телетайп](tty.md) транслировать.
- `options` {Объект}
  - `autoCommit` {boolean} Если `true`, не нужно звонить `rl.commit()`.

#### `rl.clearLine(dir)`

<!-- YAML
added: REPLACEME
-->

- `dir` {целое число}
  - `-1`: слева от курсора
  - `1`: вправо от курсора
  - `0`: вся строка
- Возврат: это

В `rl.clearLine()` добавляет во внутренний список ожидающих действий действие, очищающее текущую строку от связанных `stream` в указанном направлении, обозначенном `dir`. Вызов `rl.commit()` чтобы увидеть эффект этого метода, если только `autoCommit: true` был передан конструктору.

#### `rl.clearScreenDown()`

<!-- YAML
added: REPLACEME
-->

- Возврат: это

В `rl.clearScreenDown()` добавляет во внутренний список ожидающих действий действие, которое очищает связанный поток с текущей позиции курсора вниз. Вызов `rl.commit()` чтобы увидеть эффект этого метода, если только `autoCommit: true` был передан конструктору.

#### `rl.commit()`

<!-- YAML
added: REPLACEME
-->

- Возврат: {Обещание}

В `rl.commit()` метод отправляет все ожидающие действия в связанный `stream` и очищает внутренний список ожидающих действий.

#### `rl.cursorTo(x[, y])`

<!-- YAML
added: REPLACEME
-->

- `x` {целое число}
- `y` {целое число}
- Возврат: это

В `rl.cursorTo()` добавляет во внутренний список ожидающих действий действие, которое перемещает курсор в указанную позицию в связанном `stream`. Вызов `rl.commit()` чтобы увидеть эффект этого метода, если только `autoCommit: true` был передан конструктору.

#### `rl.moveCursor(dx, dy)`

<!-- YAML
added: REPLACEME
-->

- `dx` {целое число}
- `dy` {целое число}
- Возврат: это

В `rl.moveCursor()` добавляет во внутренний список ожидающих действий действие, перемещающее курсор _родственник_ в его текущую позицию в ассоциированном `stream`. Вызов `rl.commit()` чтобы увидеть эффект этого метода, если только `autoCommit: true` был передан конструктору.

#### `rl.rollback()`

<!-- YAML
added: REPLACEME
-->

- Возврат: это

В `rl.rollback` методы очищают внутренний список ожидающих действий, не отправляя его в связанный `stream`.

### `readlinePromises.createInterface(options)`

<!-- YAML
added: REPLACEME
-->

- `options` {Объект}
  - `input` {stream.Readable} [Удобочитаемый](stream.md#readable-streams) поток для прослушивания. Этот вариант _требуется_.
  - `output` {stream.Writable} [Возможность записи](stream.md#writable-streams) поток, в который записываются данные строки чтения.
  - `completer` {Функция} Необязательная функция, используемая для автозаполнения табуляции.
  - `terminal` {логический} `true` если `input` а также `output` потоки следует рассматривать как TTY, и в них должны быть записаны управляющие коды ANSI / VT100. **Дефолт:** проверка `isTTY` на `output` поток при создании экземпляра.
  - `history` {string \[]} Начальный список строк истории. Этот вариант имеет смысл только в том случае, если `terminal` установлен на `true` пользователем или внутренним `output` check, иначе механизм кеширования истории вообще не инициализируется. **Дефолт:** `[]`.
  - `historySize` {число} Максимальное количество сохраняемых строк истории. Чтобы отключить историю, установите это значение на `0`. Этот вариант имеет смысл только в том случае, если `terminal` установлен на `true` пользователем или внутренним `output` check, иначе механизм кеширования истории вообще не инициализируется. **Дефолт:** `30`.
  - `removeHistoryDuplicates` {boolean} Если `true`, когда новая строка ввода, добавленная в список истории, дублирует старую, это удаляет старую строку из списка. **Дефолт:** `false`.
  - `prompt` {строка} Строка подсказки для использования. **Дефолт:** `'> '`.
  - `crlfDelay` {number} Если задержка между `\r` а также `\n` превышает `crlfDelay` миллисекунды, оба `\r` а также `\n` будет рассматриваться как отдельный ввод конца строки. `crlfDelay` будет приведено к числу не меньше, чем `100`. Его можно установить на `Infinity`, в таком случае `\r` с последующим `\n` всегда будет считаться одной новой строкой (что может быть разумным для [чтение файлов](#example-read-file-stream-line-by-line) с участием `\r\n` разделитель строк). **Дефолт:** `100`.
  - `escapeCodeTimeout` {number} Продолжительность `readlinePromises` будет ждать символа (при чтении неоднозначной последовательности клавиш в миллисекундах, которая может одновременно формировать полную последовательность клавиш с использованием уже прочитанного ввода и может принимать дополнительный ввод для завершения более длинной последовательности клавиш). **Дефолт:** `500`.
  - `tabSize` {integer} Количество пробелов, равное табуляции (минимум 1). **Дефолт:** `8`.
- Возвращает: {readlinePromises.Interface}

В `readlinePromises.createInterface()` метод создает новый `readlinePromises.Interface` пример.

```js
const readlinePromises = require('readline/promises');
const rl = readlinePromises.createInterface({
  input: process.stdin,
  output: process.stdout,
});
```

Однажды `readlinePromises.Interface` создается экземпляр, наиболее распространенным случаем является прослушивание `'line'` событие:

```js
rl.on('line', (line) => {
  console.log(`Received: ${line}`);
});
```

Если `terminal` является `true` для этого случая тогда `output` поток получит лучшую совместимость, если он определит `output.columns` собственности и излучает `'resize'` событие на `output` если или когда столбцы когда-либо изменятся ([`process.stdout`](process.md#processstdout) делает это автоматически, если это телетайп).

#### Использование `completer` функция

В `completer` функция принимает текущую строку, введенную пользователем в качестве аргумента, и возвращает `Array` с 2 записями:

- An `Array` с соответствующими записями для завершения.
- Подстрока, которая использовалась для сопоставления.

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

В `completer` функция также может возвращать {Promise} или быть асинхронной:

```js
async function completer(linePartial) {
  await someAsyncWork();
  return [['123'], linePartial];
}
```

## Обратный вызов API

<!-- YAML
added: v0.1.104
-->

### Класс: `readline.Interface`

<!-- YAML
added: v0.1.104
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/37947
    description: The class `readline.Interface` now inherits from `Interface`.
-->

- Расширяется: {readline.InterfaceConstructor}

Экземпляры `readline.Interface` класс построены с использованием `readline.createInterface()` метод. Каждый экземпляр связан с одним `input` [Удобочитаемый](stream.md#readable-streams) поток и одиночный `output` [Возможность записи](stream.md#writable-streams) транслировать. В `output` поток используется для печати подсказок для пользовательского ввода, которые поступают и считываются из `input` транслировать.

#### `rl.question(query[, options], callback)`

<!-- YAML
added: v0.3.3
-->

- `query` {строка} Оператор или запрос для записи `output`, добавляется к подсказке.
- `options` {Объект}
  - `signal` {AbortSignal} Опционально позволяет `question()` быть отмененным с использованием `AbortController`.
- `callback` {Функция} Функция обратного вызова, которая вызывается при вводе пользователем в ответ на `query`.

В `rl.question()` метод отображает `query` написав это в `output`, ожидает ввода данных пользователем на `input`, затем вызывает `callback` функция, передающая предоставленный ввод в качестве первого аргумента.

Когда позвонили, `rl.question()` возобновит `input` поток, если он был приостановлен.

Если `readline.Interface` был создан с `output` установлен в `null` или `undefined` в `query` не написано.

В `callback` функция передана `rl.question()` не следует типичной схеме принятия `Error` объект или `null` как первый аргумент. В `callback` вызывается с предоставленным ответом в качестве единственного аргумента.

Пример использования:

```js
rl.question('What is your favorite food? ', (answer) => {
  console.log(`Oh, so your favorite food is ${answer}`);
});
```

Используя `AbortController` отменить вопрос.

```js
const ac = new AbortController();
const signal = ac.signal;

rl.question(
  'What is your favorite food? ',
  { signal },
  (answer) => {
    console.log(`Oh, so your favorite food is ${answer}`);
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

Если этот метод вызывается как его версия с использованием util.promisify (), он возвращает обещание, которое выполняется с ответом. Если вопрос отменен с помощью `AbortController` он отклонит `AbortError`.

```js
const util = require('util');
const question = util.promisify(rl.question).bind(rl);

async function questionExample() {
  try {
    const answer = await question(
      'What is you favorite food? '
    );
    console.log(`Oh, so your favorite food is ${answer}`);
  } catch (err) {
    console.error('Question rejected', err);
  }
}
questionExample();
```

### `readline.clearLine(stream, dir[, callback])`

<!-- YAML
added: v0.7.7
changes:
  - version: v12.7.0
    pr-url: https://github.com/nodejs/node/pull/28674
    description: The stream's write() callback and return value are exposed.
-->

- `stream` {stream.Writable}
- `dir` {количество}
  - `-1`: слева от курсора
  - `1`: вправо от курсора
  - `0`: вся строка
- `callback` {Функция} Вызывается после завершения операции.
- Возвращает: {логическое} `false` если `stream` желает, чтобы код вызова дождался `'drain'` событие, которое должно быть сгенерировано перед продолжением записи дополнительных данных; иначе `true`.

В `readline.clearLine()` метод очищает текущую строку заданного [Телетайп](tty.md) поток в указанном направлении, обозначенном `dir`.

### `readline.clearScreenDown(stream[, callback])`

<!-- YAML
added: v0.7.7
changes:
  - version: v12.7.0
    pr-url: https://github.com/nodejs/node/pull/28641
    description: The stream's write() callback and return value are exposed.
-->

- `stream` {stream.Writable}
- `callback` {Функция} Вызывается после завершения операции.
- Возвращает: {логическое} `false` если `stream` желает, чтобы код вызова дождался `'drain'` событие, которое должно быть сгенерировано перед продолжением записи дополнительных данных; иначе `true`.

В `readline.clearScreenDown()` метод очищает данный [Телетайп](tty.md) поток от текущей позиции курсора вниз.

### `readline.createInterface(options)`

<!-- YAML
added: v0.1.98
changes:
  - version:
      - v15.14.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37932
    description: The `signal` option is supported now.
  - version:
      - v15.8.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/33662
    description: The `history` option is supported now.
  - version: v13.9.0
    pr-url: https://github.com/nodejs/node/pull/31318
    description: The `tabSize` option is supported now.
  - version:
    - v8.3.0
    - v6.11.4
    pr-url: https://github.com/nodejs/node/pull/13497
    description: Remove max limit of `crlfDelay` option.
  - version: v6.6.0
    pr-url: https://github.com/nodejs/node/pull/8109
    description: The `crlfDelay` option is supported now.
  - version: v6.3.0
    pr-url: https://github.com/nodejs/node/pull/7125
    description: The `prompt` option is supported now.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/6352
    description: The `historySize` option can be `0` now.
-->

- `options` {Объект}
  - `input` {stream.Readable} [Удобочитаемый](stream.md#readable-streams) поток для прослушивания. Этот вариант _требуется_.
  - `output` {stream.Writable} [Возможность записи](stream.md#writable-streams) поток, в который записываются данные строки чтения.
  - `completer` {Функция} Необязательная функция, используемая для автозаполнения табуляции.
  - `terminal` {логический} `true` если `input` а также `output` потоки следует рассматривать как TTY, и в них должны быть записаны управляющие коды ANSI / VT100. **Дефолт:** проверка `isTTY` на `output` поток при создании экземпляра.
  - `history` {string \[]} Начальный список строк истории. Этот вариант имеет смысл только в том случае, если `terminal` установлен на `true` пользователем или внутренним `output` check, иначе механизм кеширования истории вообще не инициализируется. **Дефолт:** `[]`.
  - `historySize` {число} Максимальное количество сохраняемых строк истории. Чтобы отключить историю, установите это значение на `0`. Этот вариант имеет смысл только в том случае, если `terminal` установлен на `true` пользователем или внутренним `output` check, иначе механизм кеширования истории вообще не инициализируется. **Дефолт:** `30`.
  - `removeHistoryDuplicates` {boolean} Если `true`, когда новая строка ввода, добавленная в список истории, дублирует старую, это удаляет старую строку из списка. **Дефолт:** `false`.
  - `prompt` {строка} Строка подсказки для использования. **Дефолт:** `'> '`.
  - `crlfDelay` {number} Если задержка между `\r` а также `\n` превышает `crlfDelay` миллисекунды, оба `\r` а также `\n` будет рассматриваться как отдельный ввод конца строки. `crlfDelay` будет приведено к числу не меньше, чем `100`. Его можно установить на `Infinity`, в таком случае `\r` с последующим `\n` всегда будет считаться одной новой строкой (что может быть разумным для [чтение файлов](#example-read-file-stream-line-by-line) с участием `\r\n` разделитель строк). **Дефолт:** `100`.
  - `escapeCodeTimeout` {number} Продолжительность `readline` будет ждать символа (при чтении неоднозначной последовательности клавиш в миллисекундах, которая может одновременно формировать полную последовательность клавиш с использованием уже прочитанного ввода и может принимать дополнительный ввод для завершения более длинной последовательности клавиш). **Дефолт:** `500`.
  - `tabSize` {integer} Количество пробелов, равное табуляции (минимум 1). **Дефолт:** `8`.
  - `signal` {AbortSignal} Позволяет закрыть интерфейс с помощью AbortSignal. Прерывание сигнала приведет к внутреннему вызову `close` на интерфейсе.
- Возвращает: {readline.Interface}

В `readline.createInterface()` метод создает новый `readline.Interface` пример.

```js
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
```

Однажды `readline.Interface` создается экземпляр, наиболее распространенным случаем является прослушивание `'line'` событие:

```js
rl.on('line', (line) => {
  console.log(`Received: ${line}`);
});
```

Если `terminal` является `true` для этого случая тогда `output` поток получит лучшую совместимость, если он определит `output.columns` собственности и излучает `'resize'` событие на `output` если или когда столбцы когда-либо изменятся ([`process.stdout`](process.md#processstdout) делает это автоматически, если это телетайп).

При создании `readline.Interface` с использованием `stdin` в качестве входных данных программа не завершится, пока не получит `EOF` (<kbd>Ctrl</kbd>+<kbd>D</kbd> в Linux / macOS, <kbd>Ctrl</kbd>+<kbd>Z</kbd> с последующим <kbd>Возвращение</kbd> в Windows). Если вы хотите, чтобы ваше приложение закрылось, не дожидаясь ввода данных пользователем, вы можете [`unref()`](net.md#socketunref) стандартный поток ввода:

```js
process.stdin.unref();
```

#### Использование `completer` функция

В `completer` функция принимает текущую строку, введенную пользователем в качестве аргумента, и возвращает `Array` с 2 записями:

- An `Array` с соответствующими записями для завершения.
- Подстрока, которая использовалась для сопоставления.

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

В `completer` функция может вызываться асинхронно, если она принимает два аргумента:

```js
function completer(linePartial, callback) {
  callback(null, [['123'], linePartial]);
}
```

### `readline.cursorTo(stream, x[, y][, callback])`

<!-- YAML
added: v0.7.7
changes:
  - version: v12.7.0
    pr-url: https://github.com/nodejs/node/pull/28674
    description: The stream's write() callback and return value are exposed.
-->

- `stream` {stream.Writable}
- `x` {количество}
- `y` {количество}
- `callback` {Функция} Вызывается после завершения операции.
- Возвращает: {логическое} `false` если `stream` желает, чтобы код вызова дождался `'drain'` событие, которое должно быть сгенерировано перед продолжением записи дополнительных данных; иначе `true`.

В `readline.cursorTo()` метод перемещает курсор в указанную позицию в заданном [Телетайп](tty.md) `stream`.

### `readline.moveCursor(stream, dx, dy[, callback])`

<!-- YAML
added: v0.7.7
changes:
  - version: v12.7.0
    pr-url: https://github.com/nodejs/node/pull/28674
    description: The stream's write() callback and return value are exposed.
-->

- `stream` {stream.Writable}
- `dx` {количество}
- `dy` {количество}
- `callback` {Функция} Вызывается после завершения операции.
- Возвращает: {логическое} `false` если `stream` желает, чтобы код вызова дождался `'drain'` событие, которое должно быть сгенерировано перед продолжением записи дополнительных данных; иначе `true`.

В `readline.moveCursor()` метод перемещает курсор _родственник_ в его текущее положение в данном [Телетайп](tty.md) `stream`.

## `readline.emitKeypressEvents(stream[, interface])`

<!-- YAML
added: v0.7.7
-->

- `stream` {stream.Readable}
- `interface` {readline.InterfaceConstructor}

В `readline.emitKeypressEvents()` метод вызывает данный [Удобочитаемый](stream.md#readable-streams) поток, чтобы начать излучать `'keypress'` события, соответствующие полученному вводу.

Необязательно, `interface` указывает `readline.Interface` экземпляр, для которого автозаполнение отключено при обнаружении скопированного ввода.

Если `stream` это [Телетайп](tty.md), то он должен быть в необработанном режиме.

Это автоматически вызывается любым экземпляром readline на своем `input` если `input` это терминал. Закрытие `readline` экземпляр не останавливает `input` от испускания `'keypress'` События.

```js
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);
```

## Пример: крошечный интерфейс командной строки

Следующий пример иллюстрирует использование `readline.Interface` класс для реализации небольшого интерфейса командной строки:

```js
const readline = require('readline');
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

## Пример: построчное чтение файлового потока

Типичный вариант использования `readline` состоит в том, чтобы использовать входной файл по одной строке за раз. Самый простой способ сделать это - использовать [`fs.ReadStream`](fs.md#class-fsreadstream) API, а также `for await...of` петля:

```js
const fs = require('fs');
const readline = require('readline');

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

В качестве альтернативы можно использовать [`'line'`](#event-line) событие:

```js
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('sample.txt'),
  crlfDelay: Infinity,
});

rl.on('line', (line) => {
  console.log(`Line from file: ${line}`);
});
```

В настоящее время, `for await...of` цикл может быть немного медленнее. Если `async` / `await` поток и скорость важны, можно применить смешанный подход:

```js
const { once } = require('events');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');

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

## Связки клавиш TTY

<table>
  <tr>
    <th>Keybindings</th>
    <th>Description</th>
    <th>Notes</th>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Backspace</kbd></td>
    <td>Delete line left</td>
    <td>Doesn't work on Linux, Mac and Windows</td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Delete</kbd></td>
    <td>Delete line right</td>
    <td>Doesn't work on Mac</td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>C</kbd></td>
    <td>Emit <code>SIGINT</code> or close the readline instance</td>
    <td></td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>H</kbd></td>
    <td>Delete left</td>
    <td></td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>D</kbd></td>
    <td>Delete right or close the readline instance in case the current line is empty / EOF</td>
    <td>Doesn't work on Windows</td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>U</kbd></td>
    <td>Delete from the current position to the line start</td>
    <td></td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>K</kbd></td>
    <td>Delete from the current position to the end of line</td>
    <td></td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>A</kbd></td>
    <td>Go to start of line</td>
    <td></td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>E</kbd></td>
    <td>Go to to end of line</td>
    <td></td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>B</kbd></td>
    <td>Back one character</td>
    <td></td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>F</kbd></td>
    <td>Forward one character</td>
    <td></td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>L</kbd></td>
    <td>Clear screen</td>
    <td></td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>N</kbd></td>
    <td>Next history item</td>
    <td></td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>P</kbd></td>
    <td>Previous history item</td>
    <td></td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>Z</kbd></td>
    <td>Moves running process into background. Type
    <code>fg</code> and press <kbd>Enter</kbd>
    to return.</td>
    <td>Doesn't work on Windows</td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>W</kbd> or <kbd>Ctrl</kbd>
   +<kbd>Backspace</kbd></td>
    <td>Delete backward to a word boundary</td>
    <td><kbd>Ctrl</kbd>+<kbd>Backspace</kbd> Doesn't
    work on Linux, Mac and Windows</td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>Delete</kbd></td>
    <td>Delete forward to a word boundary</td>
    <td>Doesn't work on Mac</td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>Left arrow</kbd> or
    <kbd>Meta</kbd>+<kbd>B</kbd></td>
    <td>Word left</td>
    <td><kbd>Ctrl</kbd>+<kbd>Left arrow</kbd> Doesn't work
    on Mac</td>
  </tr>
  <tr>
    <td><kbd>Ctrl</kbd>+<kbd>Right arrow</kbd> or
    <kbd>Meta</kbd>+<kbd>F</kbd></td>
    <td>Word right</td>
    <td><kbd>Ctrl</kbd>+<kbd>Right arrow</kbd> Doesn't work
    on Mac</td>
  </tr>
  <tr>
    <td><kbd>Meta</kbd>+<kbd>D</kbd> or <kbd>Meta</kbd>
   +<kbd>Delete</kbd></td>
    <td>Delete word right</td>
    <td><kbd>Meta</kbd>+<kbd>Delete</kbd> Doesn't work
    on windows</td>
  </tr>
  <tr>
    <td><kbd>Meta</kbd>+<kbd>Backspace</kbd></td>
    <td>Delete word left</td>
    <td>Doesn't work on Mac</td>
  </tr>
</table>
