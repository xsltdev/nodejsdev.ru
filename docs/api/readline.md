# Модуль readline

!!!success "Стабильность: 2 – Стабильная версия"

Модуль **`readline`** предоставляет интерфейс для чтения данных из открытого для чтения стрима (как `process.stdin`) по одной строке за раз. К нему можно получить доступ так:

```js
const readline = require('readline');
```

Следующий простой пример показывает основы использования модуля `readline`.

```js
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('What do you think of Node.js? ', (answer) => {
  // TODO: Log the answer in a database
  console.log(
    `Thank you for your valuable feedback: ${answer}`
  );

  rl.close();
});
```

!!!note "Примечание"

    После вызова кода, приложение Node.js не может быть прекращено, пока закрыт `readline.Interface`, так как интерфейс ждет получения данных в стрим `input`.

## Класс Interface

Экземпляры класса `readline.Interface` создаются с помощью метода `readline.createInterface()`. Каждый экземпляр ассоциируется с единственным читаемым стримом `input` и единственным стримом `output`, открытым для записи. Стрим `output` используется для вывода на экран приглашения ввода данных пользователем, которые поступают и считываются со стрима `input`.

### Событие close

Событие `close` генерируется, когда происходит что-либо из нижеприведенного:

- Вызывается метод `rl.close()` и экземпляр `readline.Interface` имеет отказанный контроль над стримами `input` и `output`.
- Стрим `input` получает событие `end`
- Стрим `input` получает `<ctrl>-D` для передачи сигнала `end-of-transmission` (`EOT`)
- Стрим `input` получает `<ctrl>-C` для передачи сигнала `SIGINT` и у события `SIGINT` нет зарегестрированного слушателя в экземпляре `readline.Interface`.

Функция слушателя вызывается без передачи аргументов.

Экземпляр `readline.Interface` должен быть завершен после генерации события `close`.

### Событие line

Событие `line` генерируется, когда стрим `input` получает ввод конца строки (`\n`, `\r` или `\r\n`). Обычно это происходит, когда пользователь нажимает `<Enter>` или `<Return>`.

Функция слушателя вызывается с содержанием единственной строки с полученными входящими данными.

Пример:

```js
rl.on('line', (input) => {
  console.log(`Received: ${input}`);
});
```

### Событие pause

Событие `pause` вызывается, когда случается что-либо из нижеприведенного:

- стрим `input` приостановлен
- стрим `input` не был приостановлен и получает событие `SIGCONT` (см. события `SIGTSTP` и `SIGCONT`).

Функция слушателя вызывается без аргументов.

Пример:

```js
rl.on('pause', () => {
  console.log('Readline paused.');
});
```

### Событие resume

Событие `resume` генерируется, когда возобновляется стрим `input`.

Функция слушателя вызывается без аргументов.

```js
rl.on('resume', () => {
  console.log('Readline resumed.');
});
```

### Событие SIGCONT

Событие `SIGCONT` генерируется, если процесс Node.js был предварительно перемещен в фоновый режим через `<ctrl>-Z` (например, `SIGTSTP`) и потом возвращен в основной режим с использованием `fg(1)`.

Если стрим `input` был приостановлен перед запросом `SIGTSTP`, это событие не генерируется.

Функция слушателя вызывается без аргументов.

Пример:

```js
rl.on('SIGCONT', () => {
  // `prompt` will automatically resume the stream
  rl.prompt();
});
```

Примечание: событие `SIGCONT` не поддерживается на Windows.

### Событие SIGINT

Событие `SIGINT` генерируется, когда стрим `input` получает ввод `<ctrl>-C`, известный, как `SIGINT`. Если нет зарегистрированных слушателей события `SIGINT`, когда стрим `input` получает `SIGINT`, будет генерироваться событие `pause`.

Функция слушателя вызывается без аргументов.

Пример:

```js
rl.on('SIGINT', () => {
  rl.question(
    'Are you sure you want to exit?',
    (answer) => {
      if (answer.match(/^y(es)?$/i)) rl.pause();
    }
  );
});
```

### Событие SIGTSTP

Событие `SIGTSTP` генерируется, когда стрим `input` получает ввод `<ctrl>-Z`, известный, как `SIGTSTP`. Если нет зарегистрированных слушателей события `SIGTSTP` при получении стримом `input` `SIGTSTP`, процесс Node.js будет переключен в фоновый режим.

Когда программа восстанавливается посредством `fg(1)`, генерируются события `pause` и `SIGCONT`. Это можно использовать для восстановления стрима `input`.

События `pause` и `SIGCONT` не будут сгенерированы, если `input` приостанавливается перед отправкой процесса в фоновый режим.

Функция слушателя вызывается без аргументов.

Пример:

```js
rl.on('SIGTSTP', () => {
  // перезаписывает SIGTSTP и предотвращает
  //отправку программы в фоновый режим.
  console.log('Caught SIGTSTP.');
});
```

Примечание: событие `SIGTSTP` не поддерживается на Windows.

### rl.close()

Метод `rl.close()` закрывает экземпляр `readline.Interface` и отклоняет контроль над стримами `input` и `output`. При вызове этого метода генерируется событие `close`.

### rl.pause()

Метод `rl.pause()` приостанавливает стрим `input`, позволяя ему быть восстановленным позже при необходимости.

Вызов `rl.pause()` не приостанавливает немедленно другие события (включая `line`) перед генерацией посредством экземпляра `readline.Interface`.

### rl.prompt()

```
rl.prompt([preserveCursor])
```

- `preserveCursor` `<boolean>`. При значении `true` предотвращает сброс месторасположения курсора до `0`.

Метод `rl.prompt()` записывает экземпляры `readlineInterface`, настроенные `prompt` на новую строку в `output` для предоставления пользователя с новым местоположением, в который будет направлен `input`.

При вызове `rl.prompt()` восстанавливает стрим `input`, если он был приостановлен.

Если `readline.Interface` был создан с настройкой `output` на `null` или `undefined`, `prompt` не записывается.

### rl.question()

```
rl.question(query, callback)
```

- `query` `<Строка>` Утверждение либо запрос для записи в `output`, предваряющее `prompt`.
- `callback` `<Функция>` Функция обратного вызова, которая вызывается с пользовательскими данными в ответ на запрос `query`.

Метод `rl.question()` отображает `query` посредством записи его в `output`, ожидает пользовательского ввода данных для перенаправления в `input`, затем вызывает функцию `callback`, которая передает предоставленный ввод в качестве первого аргумента.

При вызове `rl.question()` восстаналивает стрим `input`, если он был приостановлен.

Если `readline.Interface` был создан с настройкой `output` на `null` или `undefined`, `query` не записывается.

Пример использования:

```js
rl.question('What is your favorite food?', (answer) => {
  console.log(`Oh, so your favorite food is ${answer}`);
});
```

!!!note "Примечание"

    Функция `callback`, передаваемая в `rl.question()` не соответствует типичному шаблону получения объекта `Error` или `null` в качестве первого аргумента. `Callback` вызывается с предоставленным ответом в качестве единственного аргумента.

### rl.resume()

Метод `rl.resume()` восстанавливает стрим `input`, если он был приостановлен.

### rl.setPrompt()

```
rl.setPrompt(prompt)
```

- `prompt` `<Строка>`

Метод `rl.setPrompt()` устанавливает `prompt`, который будет записан в `output` каждый раз, когда вызывается `rl.prompt()`.

### rl.write()

```
rl.write(data, [, key])
```

- `data` `<Строка>`
- `key` `<Объект>`
  : - `ctrl` `<boolean>` `true` для отображения ключа `<ctrl>`.
  : - `meta` `<boolean>` `true` для отображения ключа `<Meta>`.
  : - `shift` `<boolean>` `true` для отображения ключа `<Shift>`.
  : - `name` `<Строка>` Имя ключа.

Метод `rl.write()` записывает `data` либо последовательность ключей, определенных `key` или `output`. Аргумент `key` поддерживается только если `output` является текстовым терминалом TTY.

Если `key` задан, `data` игнорируется.

`rl.write()` восстанавливает стрим `input`, если он был приостановлен.

Если `readline.Interface` был создан с настройкой `output` на `null` или `undefined`, `data` и `key` не записываются.

Пример:

```js
rl.write('Delete this!');
//Симуляция Ctrl+u для удаления предварительно записанной строки
rl.write(null, { ctrl: true, name: 'u' });
```

!!!note "Примечание"

    Метод `rl.write()` записывает данные в `input` интерфейсов `readline` так, как задает пользователь.

## readline.clearLine()

```
readline.clearLine(stream, dir)
```

- `stream` `<открытый для записи>`
- `dir` `<число>`
  : - `-1` слева от курсора
  : - `1` справа от курсора
  : - `0` вся строка

Метод `readline.clearLine()` удаляет часть строки заданного TTY стрима в заданном направлении, определенном `dir`.

## readline.clearScreenDown()

```
readline.clearScreenDown(stream)
```

- `stream` `<открытый для записи>`

Метод `readline.clearScreenDown()` удаляет заданный TTY стрим вниз от текущей позиции курсора.

## readline.createInterface()

```
readline.createInterface(options)
```

- `options` `<Объект>`:
  : - `input` `<открытый для чтения>` Открытый для чтения стрим для прослушивания. Эта опция являтся обязательной.
  : - `output` `<открытый для записи>` Открытый для записи стрим, куда записывается данные читаемой строки.
  : - `completer` `<Функция>` Опциональная функция, используемая для автодобавления табуляций.
  : - `terminal` `<boolean>` `true`, если стримы `input` и `output` рассматриваются как TTY и имеют записанные в них ANSI/VT100 коды выходов. По умолчанию `isTTY` проверяет стрим `output` перед инсталляцией.
  : - `historySize` `<число>` Максимальное количество сохраненных в истории строк. Для отключения истории нужно установить значение `0`. По умолчанию: `30`. Эта опция имеет смысл только в том случае, когда терминал имеет значение `true`, установленное пользователем или путем внутренней проверки `output`, в ином случае механизм кэширования истории вообще не иницализируется.
  : - `prompt` – prompt-строка. По умолчанию: `> `
  : - `crlfDelay` `<число>` Если задержка между `\r` и `\n` превосходит заданное число миллисекунд `crlfDelay`, `\n` и `\r` будут рассматриваться как отдельные вводы для обозначения конца строки. По умолчанию: 100 миллисекунд. `crlfDelay` может находиться в отрезке `[100, 2000]`.

Метод `readline.createInterface()` создает новый экземпляр `readline.Interface`.

Пример:

```js
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
```

После создания экземпляра `readline.Interface` чаще всего прослушивается событие `line`:

```js
rl.on('line', (line) => {
  console.log(`Received: ${line}`);
});
```

Если `terminal` имеет значение `true` для этого экземпляра, тогда стрим `output` получит наилучшую совместимость, если он определяет свойство `output.columns` и генерирует событие `resize` на `output`, или если столбцы меняются (`process.stdout` делает это автоматически, если стрим TTY).

### Использование функции completer

При вызове эта функция предоставляет текущую строку, введенную пользователем, и ожидает возвращение массива с двумя элементами:

- Массив с совпадающими элементами для завершения
- Подстрока, используемая для совмещения.

Например: `[[substr1, substr2, ...], originalsubstring]`.

```js
function completer(line) {
  const completions = '.help .error .exit .quit .q'.split(
    ' '
  );
  const hits = completions.filter((c) => {
    return c.indexOf(line) === 0;
  });
  // показывает все завершения, если ничего не найдено
  return [hits.length ? hits : completions, line];
}
```

Функция `completer` может быть вызвана асинхронно, если она принимает два аргумента:

```js
function completer(linePartial, callback) {
  callback(null, [['123'], linePartial]);
}
```

## readline.cursorTo()

```
readline.cursorTo(stream, x, y)
```

- `stream` `<открытый для записи>`
- `x` `<число>`
- `y` `<число>`

Метод `readline.cursorTo()` перемещает курсор на заданную позицию в TTY стриме.

## readline.emitKeypressEvents()

```
readline.emitKeypressEvents(stream [, interface])
```

- `stream` `<открытый для записи>`
- `interface` `<readline.Interface>`

Метод `readline.emitKeypressEvents()` вызывает генерацию событий `keypress` в данном открытом для записи стриме, которые обращаются к полученному вводу.

Опционально, `interface` задает экземпляр `readline.Interface`, для которого отключается автозавершение, если обнаружен ввод copy-paste.

Если стрим является TTY, этот метод будет сырым.

```js
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);
```

## readline.moveCursor()

```
readline.moveCursor(stream, dx, dy)
```

- `stream` `<открытый для записи>`
- `dx` `<число>`
- `dy` `<число>`

Метод `readline.moveCursor()` перемещает курсор относительно текущей позиции в TTY стриме.

## Пример: Tiny CLI

Следующий пример показывает использование класса `readline.Interface` для реализации маленького интерфейса командной строки:

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

## Пример: чтение файлового стрима построчно

Общий случай для `readline` – получать ввод из файловой системы открытого для чтения стрима по одной строке, как показано в примере ниже:

```js
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: fs.createReadStream('sample.txt'),
});

rl.on('line', (line) => {
  console.log(`Line from file: ${line}`);
});
```
