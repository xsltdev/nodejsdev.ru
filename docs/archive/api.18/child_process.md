---
title: Child process
description: Модуль child_process предоставляет возможность порождать подпроцессы способом, который похож, но не идентичен popen(3)
---

# Дочерний процесс

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/child_process.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:child_process` предоставляет возможность порождать подпроцессы способом, который похож, но не идентичен popen(3). Эта возможность в основном обеспечивается функцией [`child_process.spawn()`](#child_processspawncommand-args-options):

```js
const { spawn } = require('node:child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
    console.log(
        `детский процесс завершился с кодом ${code}`
    );
});
```

По умолчанию между родительским процессом Node.js и порожденным подпроцессом устанавливаются каналы для `stdin`, `stdout` и `stderr`. Эти каналы имеют ограниченную (и зависящую от платформы) пропускную способность. Если подпроцесс записывает в stdout больше этого лимита без перехвата вывода, подпроцесс блокируется, ожидая, пока буфер трубы примет больше данных. Это идентично поведению труб в оболочке. Используйте опцию `{ stdio: 'ignore' }`, если вывод не будет потребляться.

Поиск команды выполняется с использованием переменной окружения `options.env.PATH`, если `env` находится в объекте `options`. В противном случае используется `process.env.PATH`. Если `options.env` задана без `PATH`, поиск на Unix выполняется по пути поиска по умолчанию `/usr/bin:/bin` (см. руководство вашей операционной системы по execvpe/execvp), на Windows используется переменная окружения текущих процессов `PATH`.

В Windows переменные окружения не чувствительны к регистру. Node.js лексикографически сортирует ключи `env` и использует первый, который нечувствителен к регистру. Только первая (в лексикографическом порядке) запись будет передана подпроцессу. Это может привести к проблемам в Windows при передаче в опцию `env` объектов, имеющих несколько вариантов одного и того же ключа, например, `PATH` и `Path`.

Метод [`child_process.spawn()`](#child_processspawncommand-args-options) порождает дочерний процесс асинхронно, не блокируя цикл событий Node.js. Функция [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options) обеспечивает эквивалентную функциональность в синхронном режиме, блокируя цикл событий до тех пор, пока порожденный процесс не выйдет или не завершится.

Для удобства модуль `node:child_process` предоставляет несколько синхронных и асинхронных альтернатив [`child_process.spawn()`](#child_processspawncommand-args-options) и [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options). Каждая из этих альтернатив реализуется поверх [`child_process.spawn()`](#child_processspawncommand-args-options) или [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options).

-   [`child_process.exec()`](#child_processexeccommand-options-callback): порождает оболочку и выполняет команду внутри этой оболочки, передавая `stdout` и `stderr` в функцию обратного вызова после завершения.
-   [`child_process.execFile()`](#child_processexecfilefile-args-options-callback): аналогичен [`child_process.exec()`](#child_processexeccommand-options-callback), за исключением того, что он порождает команду напрямую, без предварительного порождения оболочки по умолчанию.
-   [`child_process.fork()`](#child_processforkmodulepath-args-options): порождает новый процесс Node.js и вызывает указанный модуль с установленным каналом связи IPC, который позволяет отправлять сообщения между родительским и дочерним процессами.
-   [`child_process.execSync()`](#child_processexecsynccommand-options): синхронная версия [`child_process.exec()`](#child_processexeccommand-options-callback), которая будет блокировать цикл событий Node.js.
-   [`child_process.execFileSync()`](#child_processexecfilesyncfile-args-options): синхронная версия [`child_process.execFile()`](#child_processexecfilefile-args-options-callback), которая блокирует цикл событий Node.js.

Для некоторых случаев использования, таких как автоматизация сценариев оболочки, синхронные аналоги могут быть более удобными. Однако во многих случаях синхронные методы могут существенно повлиять на производительность из-за остановки цикла событий во время завершения порожденных процессов.

<!-- 0000.part.md -->

## Асинхронное создание процессов

Методы [`child_process.spawn()`](#child_processspawncommand-args-options), [`child_process.fork()`](#child_processforkmodulepath-args-options), [`child_process.exec()`](#child_processexeccommand-options-callback) и [`child_process. execFile()`](#child_processexecfilefile-args-options-callback) методы следуют идиоматической схеме асинхронного программирования, характерной для других API Node.js.

Каждый из методов возвращает экземпляр `ChildProcess`. Эти объекты реализуют API Node.js [`EventEmitter`](events.md#class-eventemitter), позволяя родительскому процессу регистрировать функции слушателей, которые вызываются при наступлении определенных событий в течение жизненного цикла дочернего процесса.

Методы `child_process.exec()` и `child_process.execFile()` дополнительно позволяют указать необязательную функцию `callback`, которая вызывается при завершении дочернего процесса.

<!-- 0001.part.md -->

### Порождение файлов `.bat` и `.cmd` в Windows

Важность различия между `child_process.exec()` и `child_process.execFile()` может зависеть от платформы. В операционных системах типа Unix (Unix, Linux, macOS) [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) может быть более эффективным, поскольку по умолчанию не порождает оболочку. Однако в Windows файлы `.bat` и `.cmd` не исполняются самостоятельно без терминала и поэтому не могут быть запущены с помощью [`child_process.execFile()`](#child_processexecfilefile-args-options-callback). При работе под Windows файлы `.bat` и `.cmd` могут быть вызваны с помощью [`child_process.spawn()`](#child_processspawncommand-args-options) с установленной опцией `shell`, с [`child_process. exec()`](#child_processexeccommand-options-callback), или путем запуска `cmd.exe` и передачи файла `.bat` или `.cmd` в качестве аргумента (что и делают опция `shell` и [`child_process.exec()`](#child_processexeccommand-options-callback)). В любом случае, если имя файла скрипта содержит пробелы, его необходимо заключить в кавычки.

```js
// Только для Windows...
const { spawn } = require('node:child_process');
const bat = spawn('cmd.exe', ['/c', 'my.bat']);

bat.stdout.on('data', (data) => {
    console.log(data.toString());
});

bat.stderr.on('data', (data) => {
    console.error(data.toString());
});

bat.on('exit', (code) => {
    console.log(`Child exited with code ${code}`);
});
```

```js
// ИЛИ...
const { exec, spawn } = require('node:child_process');
exec('my.bat', (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
});

// Сценарий с пробелами в имени файла:
const bat = spawn('"my script.cmd"', ['a', 'b'], {
    shell: true,
});
// или:
exec('"my script.cmd" a b', (err, stdout, stderr) => {
    // ...
});
```

<!-- 0002.part.md -->

### `child_process.exec(command[, options][, callback])`

-   `команда` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Команда для выполнения, с аргументами, разделенными пробелами.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса. **По умолчанию:** `process.cwd()`.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары ключ-значение окружения. **По умолчанию:** `process.env`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`.
    -   `шелл` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Оболочка для выполнения команды. **По умолчанию:** `'/bin/sh'` на Unix, `process.env.ComSpec` на Windows.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать дочерний процесс с помощью сигнала AbortSignal.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **Default:** `0`
    -   `maxBuffer` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Наибольший объем данных в байтах, разрешенный для передачи на stdout или stderr. При превышении этого значения дочерний процесс завершается, а все выходные данные усекаются. См. предостережение в `maxBuffer` и Unicode. **По умолчанию:** `1024 * 1024`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `'SIGTERM``.
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задает идентификатор пользователя процесса (см. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает групповую принадлежность процесса (см. setgid(2)).
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть консольное окно подпроцесса, которое обычно создается в системах Windows. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызывается с выводом при завершении процесса.
    -   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stdout` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
    -   `stderr` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
-   Возвращает: `ChildProcess`

Создает оболочку, затем выполняет `команду` в этой оболочке, буферизируя любой сгенерированный вывод. Строка `команды`, переданная функции exec, обрабатывается непосредственно оболочкой, и специальные символы (зависят от [shell](https://en.wikipedia.org/wiki/List_of_command-line_interpreters)) должны быть обработаны соответствующим образом:

```js
const { exec } = require('node:child_process');

exec('"/path/to/test file/test.sh" arg1 arg2');
// Double quotes are used so that the space in the path is not interpreted as
// a delimiter of multiple arguments.

exec('echo "The \\$HOME variable is $HOME"');
// The $HOME variable is escaped in the first instance, but not in the second.
```

**Никогда не передавайте несанированный пользовательский ввод в эту функцию. Любой ввод, содержащий метасимволы оболочки, может быть использован для запуска выполнения произвольной команды.**.

Если предоставлена функция `callback`, она вызывается с аргументами `(error, stdout, stderr)`. В случае успеха, `error` будет `null`. При ошибке `error` будет экземпляром [`Error`](errors.md#class-error). Свойство `error.code` будет кодом завершения процесса. По соглашению, любой код выхода, отличный от `0`, означает ошибку. Свойство `error.signal` будет сигналом, который завершил процесс.

Аргументы `stdout` и `stderr`, передаваемые обратному вызову, будут содержать вывод stdout и stderr дочернего процесса. По умолчанию Node.js будет декодировать вывод как UTF-8 и передавать строки обратному вызову. Опция `encoding` может быть использована для указания кодировки символов, используемой для декодирования вывода stdout и stderr. Если `encoding` - это `'buffer'` или нераспознанная кодировка, то вместо нее обратному вызову будут переданы объекты `Buffer''.

```js
const { exec } = require('node:child_process');
exec(
    'cat *.js missing_file | wc -l',
    (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    }
);
```

Если `timeout` больше `0`, родитель пошлет сигнал, определенный свойством `killSignal` (по умолчанию `'SIGTERM'`), если дочерний процесс работает дольше, чем `timeout` миллисекунд.

В отличие от системного вызова exec(3) POSIX, `child_process.exec()` не заменяет существующий процесс и использует оболочку для выполнения команды.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed версия, он возвращает `Promise` для `Object` со свойствами `stdout` и `stderr`. Возвращаемый экземпляр `ChildProcess` прикрепляется к `Promise` как свойство `child`. В случае ошибки (включая любую ошибку, приводящую к коду выхода, отличному от 0), возвращается отвергнутое обещание с тем же объектом `error`, указанным в обратном вызове, но с двумя дополнительными свойствами `stdout` и `stderr`.

```js
const util = require('node:util');
const exec = util.promisify(
    require('node:child_process').exec
);

async function lsExample() {
    const { stdout, stderr } = await exec('ls');
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
}
lsExample();
```

Если включена опция `signal`, вызов `.abort()` на соответствующем `AbortController` аналогичен вызову `.kill()` на дочернем процессе, за исключением того, что ошибка, передаваемая в обратный вызов, будет `AbortError`:

```js
const { exec } = require('node:child_process');
const controller = new AbortController();
const { signal } = controller;
const child = exec('grep ssh', { signal }, (error) => {
    console.error(error); // an AbortError
});
controller.abort();
```

<!-- 0003.part.md -->

### `child_process.execFile(file[, args][, options][, callback])`

-   `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя или путь исполняемого файла для запуска.
-   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары ключ-значение окружения. **По умолчанию:** `process.env`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
    -   `maxBuffer` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Наибольший объем данных в байтах, разрешенный для вывода на stdout или stderr. При превышении этого значения дочерний процесс завершается, а все выходные данные усекаются. См. предостережение в `maxBuffer` и Unicode. **По умолчанию:** `1024 * 1024`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `SIGTERM`.
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задает идентификатор пользователя процесса (см. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает групповую принадлежность процесса (см. setgid(2)).
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть консольное окно подпроцесса, которое обычно создается в системах Windows. **По умолчанию:** `false`.
    -   `windowsVerbatimArguments` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Кавычки и экранирование аргументов не выполняются в Windows. Игнорируется на Unix. **По умолчанию:** `false`.
    -   `shell` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `true`, запускает `команду` внутри оболочки. Используется `'/bin/sh'` на Unix, и `process.env.ComSpec` на Windows. Другая оболочка может быть задана в виде строки. **По умолчанию:** `false` (нет оболочки).
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать дочерний процесс с помощью сигнала AbortSignal.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается с выводом при завершении процесса.
    -   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stdout` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
    -   `stderr` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
-   Возвращает: `ChildProcess`

Функция `child_process.execFile()` аналогична [`child_process.exec()`](#child_processexeccommand-options-callback) за исключением того, что она не порождает оболочку по умолчанию. Вместо этого, указанный исполняемый `файл` порождается непосредственно как новый процесс, что делает его немного более эффективным, чем [`child_process.exec()`](#child_processexeccommand-options-callback).

Поддерживаются те же опции, что и в [`child_process.exec()`](#child_processexeccommand-options-callback). Так как оболочка не порождается, такие поведения, как перенаправление ввода/вывода и глоббинг файлов, не поддерживаются.

```js
const { execFile } = require('node:child_process');
const child = execFile('node', ['--version'], (error, stdout, stderr) => {
  if (error) {
    бросить ошибку;
  }
  console.log(stdout);
});
```

Аргументы `stdout` и `stderr`, передаваемые обратному вызову, будут содержать вывод stdout и stderr дочернего процесса. По умолчанию Node.js декодирует вывод как UTF-8 и передает строки обратному вызову. Опция `encoding` может быть использована для указания кодировки символов, используемой для декодирования вывода stdout и stderr. Если `encoding` - это `'buffer'` или нераспознанная кодировка символов, то вместо нее обратному вызову будут переданы объекты `Buffer''.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed версия, он возвращает `Promise` для `Object` со свойствами `stdout` и `stderr`. Возвращаемый экземпляр `ChildProcess` прикрепляется к `Promise` в качестве свойства `child`. В случае ошибки (включая любую ошибку, приводящую к коду выхода, отличному от 0) возвращается отвергнутое обещание с тем же объектом `error`, указанным в обратном вызове, но с двумя дополнительными свойствами `stdout` и `stderr`.

```js
const util = require('node:util');
const execFile = util.promisify(
    require('node:child_process').execFile
);
async function getVersion() {
    const { stdout } = await execFile('node', [
        '--version',
    ]);
    console.log(stdout);
}
getVersion();
```

**Если включена опция `shell`, не передавайте в эту функцию несанированный пользовательский ввод. Любой ввод, содержащий метасимволы оболочки, может быть использован для запуска выполнения произвольной команды.**.

Если включена опция `signal`, вызов `.abort()` на соответствующем `AbortController` аналогичен вызову `.kill()` на дочернем процессе, за исключением того, что ошибка, передаваемая в обратный вызов, будет `AbortError`:

```js
const { execFile } = require('node:child_process');
const controller = new AbortController();
const { signal } = controller;
const child = execFile(
    'node',
    ['--version'],
    { signal },
    (error) => {
        console.error(error); // ошибка AbortError
    }
);
controller.abort();
```

<!-- 0004.part.md -->

### `child_process.fork(modulePath[, args][, options])`

-   `modulePath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Модуль для запуска в дочернем процессе.
-   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `detached` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Подготовить дочерний процесс к запуску независимо от родительского процесса. Конкретное поведение зависит от платформы, см. `options.detached`.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары ключей-значений окружения. **По умолчанию:** `process.env`.
    -   `execPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Исполняемый файл, используемый для создания дочернего процесса.
    -   `execArgv` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов, передаваемых исполняемому процессу. **По умолчанию:** `process.execArgv`.
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает групповую идентификацию процесса (см. setgid(2)).
    -   `serialization` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Укажите вид сериализации, используемой для отправки сообщений между процессами. Возможные значения: `'json'` и `'advanced'`. **По умолчанию:** `'json'`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет закрыть дочерний процесс с помощью сигнала AbortSignal.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение сигнала, который будет использоваться, когда порожденный процесс будет убит по таймауту или сигналу abort. **По умолчанию:** `'SIGTERM'`.
    -   `silent` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, stdin, stdout и stderr дочернего процесса будут передаваться по трубопроводу родительскому, иначе они будут наследоваться от родительского, подробнее см. опции `'pipe'` и `'inherit'` для [`child_process.spawn()`](#child_processspawncommand-args-options) в [`stdio`](#optionsstdio). **По умолчанию:** `false`.
    -   `stdio` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [`child_process.spawn()`](#child_processspawncommand-args-options) в [`stdio`](#optionsstdio). Если указана эта опция, она отменяет `silent`. Если используется вариант массива, то он должен содержать ровно один элемент со значением `'ipc'`, иначе будет выдана ошибка. Например, `[0, 1, 2, 'ipc']`.
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает идентификатор пользователя процесса (см. setuid(2)).
    -   `windowsVerbatimArguments` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) В Windows аргументы не кавыряются и не экранируются. Игнорируется на Unix. **По умолчанию:** `false`.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) В миллисекундах максимальное время, в течение которого процесс будет выполняться. **По умолчанию:** `undefined`.
-   Возвращает: `ChildProcess`

Метод `child_process.fork()` является частным случаем `child_process.spawn()`, используемым специально для порождения новых процессов Node.js. Подобно `child_process.spawn()`, возвращается объект `ChildProcess`. Возвращаемый `ChildProcess` будет иметь встроенный дополнительный канал связи, который позволяет передавать сообщения туда и обратно между родительским и дочерним процессами. Подробности смотрите в [`subprocess.send()`](#subprocesssendmessage-sendhandle-options-callback).

Помните, что порожденные дочерние процессы Node.js не зависят от родительского, за исключением следующих случаев

<!-- 0005.part.md -->

### `child_process.spawn(command[, args][, options])`

-   `команда` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Команда для запуска.
-   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары ключ-значение окружения. **По умолчанию:** `process.env`.
    -   `argv0` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Явно задает значение `argv[0]`, передаваемое дочернему процессу. Если значение не указано, оно будет установлено в `command`.
    -   `stdio` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Конфигурация stdio дочернего процесса (см. [`options.stdio`](#optionsstdio)).
    -   `detached` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Подготовить дочерний процесс к работе независимо от его родительского процесса. Конкретное поведение зависит от платформы, см. [`options.detached`](#optionsdetached).
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает идентификатор пользователя процесса (см. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает групповую принадлежность процесса (см. setgid(2)).
    -   `serialization` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Укажите вид сериализации, используемой для отправки сообщений между процессами. Возможные значения: `json` и `advanced`. **По умолчанию:** `'json'`.
    -   `shell` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `true`, запускает `команду` внутри оболочки. Используется `'/bin/sh'` на Unix, и `process.env.ComSpec` на Windows. Другая оболочка может быть задана в виде строки. **По умолчанию:** `false` (нет оболочки).
    -   `windowsVerbatimArguments` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) В Windows аргументы не кавыряются и не экранируются. Игнорируется на Unix. Это значение автоматически устанавливается в `true`, если указана `hell` и это CMD. **По умолчанию:** `false`.
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть консольное окно подпроцесса, которое обычно создается в системах Windows. **По умолчанию:** `false`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать дочерний процесс с помощью сигнала AbortSignal.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) В миллисекундах максимальное количество времени, которое разрешено процессу. **По умолчанию:** `undefined`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение сигнала, который будет использоваться, когда порожденный процесс будет убит по таймауту или сигналу прерывания. **По умолчанию:** `'SIGTERM'`.
-   Возвращает: `ChildProcess`

Метод `child_process.spawn()` порождает новый процесс, используя заданную `команду`, с аргументами командной строки в `args`. Если `args` опущен, то по умолчанию используется пустой массив.

**Если включена опция `hell`, не передавайте этой функции несанированный пользовательский ввод. Любой ввод, содержащий метасимволы оболочки, может быть использован для инициирования выполнения произвольной команды.**.

Третий аргумент может быть использован для указания дополнительных опций с этими значениями по умолчанию:

```js
const defaults = {
    cwd: undefined,
    env: process.env,
};
```

Используйте `cwd` для указания рабочего каталога, из которого будет порожден процесс. Если не указан, по умолчанию наследуется текущий рабочий каталог. Если указан, но путь не существует, дочерний процесс выдает ошибку `ENOENT` и немедленно завершается. Ошибка `ENOENT` также выдается, если команда не существует.

Используйте `env` для указания переменных окружения, которые будут видны новому процессу, по умолчанию это [`process.env`](process.md#processenv).

Неопределенные значения в `env` будут проигнорированы.

Пример запуска `ls -lh /usr`, перехват `stdout`, `stderr` и кода выхода:

```js
const { spawn } = require('node:child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});
```

Пример: Очень сложный способ выполнить команду `ps ax | grep ssh`.

```js
const { spawn } = require('node:child_process');
const ps = spawn('ps', ['ax']);
const grep = spawn('grep', ['ssh']);

ps.stdout.on('data', (data) => {
    grep.stdin.write(data);
});

ps.stderr.on('data', (data) => {
    console.error(`ps stderr: ${data}`);
});

ps.on('close', (code) => {
    if (code !== 0) {
        console.log(`ps process exited with code ${code}`);
    }
    grep.stdin.end();
});

grep.stdout.on('data', (data) => {
    console.log(data.toString());
});

grep.stderr.on('data', (data) => {
    console.error(`grep stderr: ${data}`);
});

grep.on('close', (code) => {
    if (code !== 0) {
        console.log(
            `grep process exited with code ${code}`
        );
    }
});
```

Пример проверки неудачного `spawn`:

```js
const { spawn } = require('node:child_process');
const subprocess = spawn('bad_command');

subprocess.on('error', (err) => {
    console.error('Failed to start subprocess.');
});
```

Некоторые платформы (macOS, Linux) будут использовать значение `argv[0]` для названия процесса, в то время как другие (Windows, SunOS) будут использовать `command`.

Node.js перезаписывает `argv[0]` с `process.execPath` при запуске, поэтому `process.argv[0]` в дочернем процессе Node.js не будет соответствовать параметру `argv0`, переданному в `spawn` от родителя. Вместо этого получите его с помощью свойства `process.argv0`.

Если включена опция `signal`, вызов `.abort()` на соответствующем `AbortController` аналогичен вызову `.kill()` на дочернем процессе, за исключением того, что ошибка, передаваемая в обратный вызов, будет `AbortError`:

```js
const { spawn } = require('node:child_process');
const controller = new AbortController();
const { signal } = controller;
const grep = spawn('grep', ['ssh'], { signal });
grep.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
});
controller.abort(); // Stops the child process
```

<!-- 0006.part.md -->

#### `options.detached`

В Windows установка `options.detached` в `true` позволяет дочернему процессу продолжить работу после завершения родительского. У дочернего процесса будет собственное консольное окно. После включения этого параметра для дочернего процесса его нельзя отключить.

На платформах, отличных от Windows, если `options.detached` имеет значение `true`, дочерний процесс становится лидером новой группы процессов и сессии. Дочерние процессы могут продолжать выполняться после завершения родительского, независимо от того, отсоединены они или нет. Дополнительную информацию см. в setsid(2).

По умолчанию родитель будет ждать выхода отсоединенного дочернего процесса. Чтобы запретить родителю ждать завершения данного `subprocess`а, используйте метод `subprocess.unref()`. Это приведет к тому, что цикл событий родительского процесса не будет включать дочерний процесс в свой счетчик ссылок, что позволит родительскому процессу завершить работу независимо от дочернего, если только между дочерним и родительским процессами не установлен IPC-канал.

При использовании опции `detached` для запуска длительно выполняющегося процесса, процесс не будет продолжать работать в фоновом режиме после выхода родителя, если ему не предоставлена конфигурация `stdio`, не подключенная к родителю. Если `stdio` родителя унаследована, дочерний процесс останется подключенным к управляющему терминалу.

Пример долго работающего процесса, отсоединяющего и также игнорирующего файловые дескрипторы своего родителя `stdio`, чтобы игнорировать завершение родителя:

```js
const { spawn } = require('node:child_process');

const subprocess = spawn(
    process.argv[0],
    ['child_program.js'],
    {
        detached: true,
        stdio: 'ignore',
    }
);

subprocess.unref();
```

В качестве альтернативы можно перенаправить вывод дочернего процесса в файлы:

```js
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./out.log', 'a');

const subprocess = spawn('prg', [], {
    detached: true,
    stdio: ['ignore', out, err],
});

subprocess.unref();
```

<!-- 0007.part.md -->

#### `options.stdio`

Опция `options.stdio` используется для настройки каналов, которые устанавливаются между родительским и дочерним процессом. По умолчанию дочерние потоки stdin, stdout и stderr перенаправляются в соответствующие потоки `subprocess.stdin`, `subprocess.stdout` и `subprocess.stderr` объекта `ChildProcess`. Это эквивалентно установке `options.stdio` равным `['pipe', 'pipe', 'pipe']`.

Для удобства, `options.stdio` может быть одной из следующих строк:

-   `'pipe'`: равно `['pipe', 'pipe', 'pipe']` (по умолчанию)
-   `'overlapped'`: эквивалентно `['overlapped', 'overlapped', 'overlapped']`
-   `'ignore'`: эквивалентно `['ignore', 'ignore', 'ignore']`
-   `'inherit'`: эквивалентно `['inherit', 'inherit', 'inherit']` или `[0, 1, 2]`.

В противном случае, значение `options.stdio` представляет собой массив, где каждый индекс соответствует fd в дочерней системе. Fds 0, 1 и 2 соответствуют stdin, stdout и stderr, соответственно. Дополнительные fd могут быть указаны для создания дополнительных каналов между родительским и дочерним сервером. Значение является одним из следующих:

1.  `труба`: Создать трубу между дочерним процессом и родительским процессом. Родительский конец трубы отображается для родителя как свойство объекта `child_process` в виде [`subprocess.stdio[fd]`](#subprocessstdio). Трубы, созданные для fds 0, 1 и 2, также доступны как [`subprocess.stdin`](#subprocessstdin), [`subprocess.stdout`](#subprocessstdout) и [`subprocess.stderr`](#subprocessstderr), соответственно. Это не настоящие трубы Unix, и поэтому дочерний процесс не может использовать их через свои дескрипторные файлы, например, `/dev/fd/2` или `/dev/stdout`.

2.  `перекрытые`: То же самое, что и `'pipe'`, за исключением того, что на дескрипторе устанавливается флаг `FILE_FLAG_OVERLAPPED`. Это необходимо для перекрывающегося ввода/вывода на stdio хэндлах дочерних процессов. Более подробную информацию смотрите в [docs](https://docs.microsoft.com/en-us/windows/win32/fileio/synchronous-and-asynchronous-i-o). Это точно так же, как `'pipe'` в системах, отличных от Windows.

3.  `IPC`: Создайте IPC-канал для передачи сообщений/файловых дескрипторов между родительским и дочерним процессами. `ChildProcess` может иметь не более одного файлового дескриптора IPC stdio. Установка этой опции включает метод [`subprocess.send()`](#subprocesssendmessage-sendhandle-options-callback). Если дочерний процесс является процессом Node.js, наличие IPC-канала включит [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) и [`process. disconnect()`](process.md#processdisconnect) методы, а также события [`'disconnect'`](process.md#event-disconnect) и [`'message'`](process.md#event-message) в дочерней системе.

    Доступ к IPC-каналу fd любым способом, кроме [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) или использование IPC-канала с дочерним процессом, который не является экземпляром Node.js, не поддерживается.

4.  `игнорировать`: Указывает Node.js игнорировать fd в дочернем процессе. Хотя Node.js всегда будет открывать fd 0, 1 и 2 для порождаемых им процессов, установка fd в `'ignore'` заставит Node.js открыть `/dev/null` и прикрепить его к fd дочернего процесса.

5.  `наследовать`: Передача соответствующего потока stdio в/из родительского процесса. В первых трех позициях это эквивалентно `process.stdin`, `process.stdout` и `process.stderr`, соответственно. В любой другой позиции эквивалентно `'ignore'`.

6.  Объект [`<Stream>`](stream.md#stream): Разделять с дочерним процессом поток, доступный для чтения или записи, который ссылается на tty, файл, сокет или трубу. Дескриптор файла, лежащего в основе потока, дублируется в дочернем процессе на fd, соответствующий индексу в массиве `stdio`. Поток должен иметь базовый дескриптор (файловые потоки не имеют его до тех пор, пока не произойдет событие `'open'').

7.  Положительное целое число: Целочисленное значение интерпретируется как дескриптор файла, который открыт в родительском процессе. Он передается дочернему процессу, аналогично тому, как могут передаваться объекты [`<Stream>`](stream.md#stream). Передача сокетов не поддерживается в Windows.

8.  `null`, `undefined`: Использовать значение по умолчанию. Для stdio fds 0, 1 и 2 (другими словами, stdin, stdout и stderr) создается труба. Для fd 3 и выше по умолчанию используется значение `игнорировать`.

```js
const { spawn } = require('node:child_process');

// Child will use parent's stdios.
spawn('prg', [], { stdio: 'inherit' });

// Spawn child sharing only stderr.
spawn('prg', [], {
    stdio: ['pipe', 'pipe', process.stderr],
});

// Open an extra fd=4, to interact with programs presenting a
// startd-style interface.
spawn('prg', [], {
    stdio: ['pipe', null, null, null, 'pipe'],
});
```

_Следует отметить, что когда между родительским и дочерним процессами установлен IPC-канал, и дочерний процесс является процессом Node.js, дочерний процесс запускается с IPC-каналом без ссылки (с помощью `unref()`), пока дочерний процесс не зарегистрирует обработчик событий для события [`'disconnect'`](process.md#event-disconnect) или [`'message'`](process.md#event-message). Это позволяет дочернему процессу нормально завершить работу, не удерживая процесс открытым IPC-каналом_.

В Unix-подобных операционных системах метод [`child_process.spawn()`](#child_processspawncommand-args-options) выполняет операции с памятью синхронно перед отсоединением цикла событий от дочернего процесса. Приложения с большим объемом памяти могут счесть частые вызовы [`child_process.spawn()`](#child_processspawncommand-args-options) узким местом. Для получения дополнительной информации смотрите [V8 issue 7381](https://bugs.chromium.org/p/v8/issues/detail?id=7381).

См. также: [`child_process.exec()`](#child_processexeccommand-options-callback) и [`child_process.fork()`](#child_processforkmodulepath-args-options).

<!-- 0008.part.md -->

## Синхронное создание процессов

Методы [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options), [`child_process.execSync()`](#child_processexecsynccommand-options) и [`child_process. execFileSync()`](#child_processexecfilesyncfile-args-options) являются синхронными и блокируют цикл событий Node.js, приостанавливая выполнение любого дополнительного кода до выхода порожденного процесса.

Блокирующие вызовы, подобные этим, в основном полезны для упрощения задач сценариев общего назначения и для упрощения загрузки/обработки конфигурации приложения при запуске.

<!-- 0009.part.md -->

### `child_process.execFileSync(file[, args][, options])`

-   `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя или путь исполняемого файла для запуска.
-   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Значение, которое будет передано в качестве stdin порожденному процессу. Передача этого значения переопределит `stdio[0]`.
    -   `stdio` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Конфигурация stdio дочернего процесса. По умолчанию `stderr` будет выводиться на stderr родительского процесса, если не указано `stdio`. **По умолчанию:** `'pipe'`.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары ключ-значение окружения. **По умолчанию:** `process.env`.
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает идентификатор пользователя процесса (см. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает групповую принадлежность процесса (см. setgid(2)).
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) В миллисекундах максимальное количество времени, которое разрешено процессу. **По умолчанию:** `undefined`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение сигнала, который будет использоваться, когда порожденный процесс будет убит. **По умолчанию:** `'SIGTERM``.
    -   `maxBuffer` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Наибольший объем данных в байтах, разрешенный для передачи на stdout или stderr. При превышении этого значения дочерний процесс завершается. **По умолчанию:** `1024 * 1024`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка, используемая для всех входов и выходов stdio. **По умолчанию:** `'buffer'`.
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть окно консоли подпроцесса, которое обычно создается в системах Windows. **По умолчанию:** `false`.
    -   `shell` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `true`, запускает `команду` внутри оболочки. Используется `'/bin/sh'` в Unix и `process.env.ComSpec` в Windows. Другая оболочка может быть задана в виде строки. **По умолчанию:** `false` (нет оболочки).
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) stdout из команды.

Метод `child_process.execFileSync()` в целом идентичен [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) за исключением того, что метод не вернется до тех пор, пока дочерний процесс не будет полностью закрыт. Если произошел таймаут и послан `killSignal`, метод не вернется, пока процесс полностью не завершится.

Если дочерний процесс перехватит и обработает сигнал `SIGTERM` и не выйдет, родительский процесс будет ждать, пока дочерний процесс не выйдет.

Если процесс завершается или имеет ненулевой код выхода, этот метод выбросит [`Error`](errors.md#class-error), который будет включать полный результат основного `child_process.spawnSync()`.

**Если включена опция `hell`, не передавайте этой функции несанированный пользовательский ввод. Любой ввод, содержащий метасимволы оболочки, может быть использован для запуска выполнения произвольной команды.**.

<!-- 0010.part.md -->

### `child_process.execSync(command[, options])`

-   `команда` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Команда для выполнения.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Значение, которое будет передано в качестве stdin порожденному процессу. Передача этого значения переопределит `stdio[0]`.
    -   `stdio` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Конфигурация stdio дочернего процесса. По умолчанию `stderr` будет выводиться на stderr родительского процесса, если не указано `stdio`. **По умолчанию:** `'pipe'`.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары ключ-значение окружения. **По умолчанию:** `process.env`.
    -   `hell` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Оболочка для выполнения команды. **По умолчанию:** `'/bin/sh'` на Unix, `process.env.ComSpec` на Windows.
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает идентификатор пользователя процесса. (См. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает групповую принадлежность процесса. (См. setgid(2)).
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) В миллисекундах максимальное количество времени, которое разрешено процессу. **По умолчанию:** `undefined`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение сигнала, который будет использоваться, когда порожденный процесс будет убит. **По умолчанию:** `SIGTERM`.
    -   `maxBuffer` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Наибольший объем данных в байтах, разрешенный для передачи на stdout или stderr. При превышении этого значения дочерний процесс завершается, а все выходные данные усекаются. См. предостережение в `maxBuffer` и Unicode. **По умолчанию:** `1024 * 1024`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка, используемая для всех входов и выходов stdio. **По умолчанию:** `'buffer'`.
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть окно консоли подпроцесса, которое обычно создается в системах Windows. **По умолчанию:** `false`.
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) stdout из команды.

Метод `child_process.execSync()` в целом идентичен [`child_process.exec()`](#child_processexeccommand-options-callback) за исключением того, что метод не вернется до тех пор, пока дочерний процесс не будет полностью закрыт. Если произошел таймаут и послан сигнал `killSignal`, метод не вернется, пока процесс полностью не завершится. Если дочерний процесс перехватывает и обрабатывает сигнал `SIGTERM` и не выходит, родительский процесс будет ждать, пока дочерний процесс не выйдет.

Если процесс завершается или имеет ненулевой код выхода, этот метод будет отброшен. Объект [`Error`](errors.md#class-error) будет содержать весь результат от [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options).

**Никогда не передавайте этой функции несанированный пользовательский ввод. Любой ввод, содержащий метасимволы оболочки, может быть использован для запуска выполнения произвольной команды.**.

<!-- 0011.part.md -->

### `child_process.spawnSync(command[, args][, options])`

-   `команда` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Команда для запуска.
-   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Значение, которое будет передано в качестве stdin порожденному процессу. Передача этого значения переопределит `stdio[0]`.
    -   `argv0` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Явно задает значение `argv[0]`, передаваемое дочернему процессу. Если значение не указано, оно будет установлено в `command`.
    -   `stdio` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Конфигурация stdio дочернего процесса.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары ключ-значение окружения. **По умолчанию:** `process.env`.
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает идентификатор пользователя процесса (см. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает групповую принадлежность процесса (см. setgid(2)).
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) В миллисекундах максимальное количество времени, которое разрешено процессу. **По умолчанию:** `undefined`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение сигнала, который будет использоваться, когда порожденный процесс будет убит. **По умолчанию:** `'SIGTERM``.
    -   `maxBuffer` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Наибольший объем данных в байтах, разрешенный для передачи на stdout или stderr. При превышении этого значения дочерний процесс завершается, а все выходные данные усекаются. См. предостережение в `maxBuffer` и Unicode. **По умолчанию:** `1024 * 1024`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка, используемая для всех входов и выходов stdio. **По умолчанию:** `'buffer'`.
    -   `shell` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `true`, запускает `команду` внутри оболочки. Используется `'/bin/sh'` на Unix, и `process.env.ComSpec` на Windows. Другая оболочка может быть задана в виде строки. **По умолчанию:** `false` (нет оболочки).
    -   `windowsVerbatimArguments` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) В Windows аргументы не кавыряются и не экранируются. Игнорируется на Unix. Устанавливается в `true` автоматически, если указана `hell` и это CMD. **По умолчанию:** `false`.
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть консольное окно подпроцесса, которое обычно создается в системах Windows. **По умолчанию:** `false`.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `pid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Pid дочернего процесса.
    -   `output` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив результатов вывода через stdio.
    -   `stdout` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Содержимое `output[1]`.
    -   `stderr` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Содержимое `output[2]`.
    -   `status` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type) Код завершения подпроцесса, или `null`, если подпроцесс завершился из-за сигнала.
    -   `signal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type) Сигнал, используемый для завершения подпроцесса, или `null`, если подпроцесс не завершился из-за сигнала.
    -   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект ошибки, если дочерний процесс завершился неудачно или по таймеру.

Метод `child_process.spawnSync()` в целом идентичен [`child_process.spawn()`](#child_processspawncommand-args-options) за исключением того, что функция не возвращается до тех пор, пока дочерний процесс не будет полностью закрыт. Когда таймаут был встречен

<!-- 0012.part.md -->

## Класс: `ChildProcess`

-   Расширяет: [`<EventEmitter>`](events.md#eventemitter)

Экземпляры `ChildProcess` представляют порожденные дочерние процессы.

Экземпляры `ChildProcess` не предназначены для прямого создания. Вместо этого используйте [`child_process.spawn()`](#child_processspawncommand-args-options), [`child_process.exec()`](#child_processexeccommand-options-callback), [`child_process. execFile()`](#child_processexecfilefile-args-options-callback), или [`child_process.fork()`](#child_processforkmodulepath-args-options) методы для создания экземпляров `ChildProcess`.

<!-- 0013.part.md -->

### Событие: `'close'`

-   `code` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код выхода, если дочернее приложение вышло самостоятельно.
-   `signal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Сигнал, по которому был завершен дочерний процесс.

Событие `'close'` испускается после завершения процесса _и_ закрытия потоков stdio дочернего процесса. Оно отличается от события `'exit'`, поскольку несколько процессов могут использовать одни и те же потоки stdio. Событие `'close'` всегда будет происходить после того, как уже произошло событие `'exit'`, или `'error'`, если дочерний процесс не смог породиться.

```js
const { spawn } = require('node:child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

ls.on('close', (code) => {
    console.log(
        `детский процесс закрывает все stdio с кодом ${code}`
    );
});

ls.on('exit', (code) => {
    console.log(
        `детский процесс завершился с кодом ${code}`
    );
});
```

<!-- 0014.part.md -->

### Событие: `disconnect`

Событие `disconnect` возникает после вызова метода [`subprocess.disconnect()`](#subprocessdisconnect) в родительском процессе или [`process.disconnect()`](process.md#processdisconnect) в дочернем процессе. После отключения невозможно отправлять или получать сообщения, а свойство [`subprocess.connected`](#subprocessconnected) равно `false`.

<!-- 0015.part.md -->

### Событие: `error`

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Ошибка.

Событие `'error'` генерируется всякий раз, когда:

-   Процесс не может быть порожден.
-   Процесс не может быть завершен.
-   Отправка сообщения дочернему процессу не удалась.
-   Дочерний процесс был прерван через опцию `signal`.

Событие `'exit'` может сработать или не сработать после возникновения ошибки. При прослушивании событий `'exit'` и `'error'` предохраняйтесь от случайного многократного вызова функций-обработчиков.

См. также [`subprocess.kill()`](#subprocesskillsignal) и [`subprocess.send()`](#subprocesssendmessage-sendhandle-options-callback).

<!-- 0016.part.md -->

### Событие: `exit`

-   `code` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код выхода, если ребенок вышел самостоятельно.
-   `signal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Сигнал, по которому был завершен дочерний процесс.

Событие `'exit'` выдается после завершения дочернего процесса. Если процесс завершился, то `code` - это код завершения процесса, иначе `null`. Если процесс завершился из-за получения сигнала, то `signal` - строковое имя сигнала, иначе `null`. Одно из этих двух значений всегда будет не `null`.

Когда срабатывает событие `'exit'', потоки stdio дочерних процессов могут быть все еще открыты.

Node.js устанавливает обработчики сигналов для `SIGINT` и `SIGTERM`, и процессы Node.js не будут немедленно завершаться при получении этих сигналов. Скорее, Node.js выполнит последовательность действий по очистке, а затем снова поднимет обработанный сигнал.

См. waitpid(2).

<!-- 0017.part.md -->

### Событие: `message`

-   `сообщение` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Разобранный объект JSON или примитивное значение.
-   `sendHandle` `Handle` Объект [`net.Socket`](net.md#class-netsocket) или [`net.Server`](net.md#class-netserver), или неопределено.

Событие `'message'` срабатывает, когда дочерний процесс использует [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) для отправки сообщений.

Сообщение проходит через сериализацию и разбор. Полученное сообщение может отличаться от первоначально отправленного.

Если опция `сериализации` была установлена в значение `'advanced'`, используемое при порождении дочернего процесса, аргумент `сообщения` может содержать данные, которые JSON не может представить. Более подробную информацию смотрите в разделе Расширенная сериализация.

<!-- 0018.part.md -->

### Событие: `spawn`

Событие `'spawn'` происходит после успешного порождения дочернего процесса. Если дочерний процесс не был успешно порожден, событие `'spawn'` не испускается, а вместо него испускается событие `'error'`.

Если событие `'spawn'` испускается, то оно наступает раньше всех других событий и раньше получения любых данных через `stdout` или `stderr`.

Событие `'spawn'` произойдет независимо от того, произошла ли ошибка **внутри** порожденного процесса. Например, если `bash some-command` порожден успешно, событие `'spawn'` сработает, хотя `bash` может не породить `some-command`. Это предостережение также применимо при использовании `{ shell: true }`.

<!-- 0019.part.md -->

### `subprocess.channel`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Труба, представляющая IPC-канал дочернего процесса.

Свойство `subprocess.channel` является ссылкой на IPC-канал дочернего процесса. Если IPC-канал не существует, это свойство `не определено`.

<!-- 0020.part.md -->

#### `subprocess.channel.ref()`

Этот метод заставляет IPC-канал поддерживать цикл событий родительского процесса, если до этого был вызван `.unref()`.

<!-- 0021.part.md -->

#### `subprocess.channel.unref()`

Этот метод заставляет IPC-канал не поддерживать цикл событий родительского процесса и позволяет ему завершиться, даже если канал открыт.

<!-- 0022.part.md -->

### `subprocess.connected`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Устанавливается в `false` после вызова `subprocess.disconnect()`.

Свойство `subprocess.connected` показывает, можно ли еще отправлять и получать сообщения от дочернего процесса. Когда `subprocess.connected` имеет значение `false`, отправка и получение сообщений больше невозможны.

<!-- 0023.part.md -->

### `subprocess.disconnect()`

Закрывает IPC-канал между родительским и дочерним процессами, позволяя дочернему процессу изящно завершить работу, когда не останется других соединений, поддерживающих его жизнь. После вызова этого метода свойства `subprocess.connected` и `process.connected` в родительском и дочернем процессах (соответственно) будут установлены в `false`, и передача сообщений между процессами будет невозможна.

Событие `'disconnect'` будет вызвано, когда в процессе получения сообщений не останется ни одного. Чаще всего оно срабатывает сразу после вызова `subprocess.disconnect()`.

Если дочерний процесс является экземпляром Node.js (например, порожден с помощью [`child_process.fork()`](#child_processforkmodulepath-args-options)), метод `process.disconnect()` может быть вызван внутри дочернего процесса, чтобы также закрыть IPC-канал.

<!-- 0024.part.md -->

### `subprocess.exitCode`

-   [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `subprocess.exitCode` указывает код завершения дочернего процесса. Если дочерний процесс все еще запущен, поле будет равно `null`.

<!-- 0025.part.md -->

### `subprocess.kill([signal])`

-   `signal` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Метод `subprocess.kill()` посылает сигнал дочернему процессу. Если аргумент не указан, процессу будет послан сигнал `'SIGTERM'`. Список доступных сигналов см. в signal(7). Эта функция возвращает `true`, если kill(2) завершился успешно, и `false` в противном случае.

```js
const { spawn } = require('node:child_process');
const grep = spawn('grep', ['ssh']);

grep.on('close', (code, signal) => {
    console.log(
        `детский процесс завершен из-за получения сигнала ${сигнал}`
    );
});

// Посылаем процессу сигнал SIGHUP.
grep.kill('SIGHUP');
```

Объект `ChildProcess` может выдать событие `'error'`, если сигнал не может быть доставлен. Отправка сигнала дочернему процессу, который уже завершился, не является ошибкой, но может иметь непредвиденные последствия. В частности, если идентификатор процесса (PID) был переназначен другому процессу, сигнал будет доставлен этому процессу, что может привести к неожиданным результатам.

Хотя функция называется `kill`, сигнал, переданный дочернему процессу, может не завершить процесс.

Для справки см. kill(2).

В Windows, где POSIX-сигналы не существуют, аргумент `signal` будет проигнорирован, и процесс будет убит принудительно и внезапно (аналогично `'SIGKILL'`). Более подробную информацию смотрите в [Signal Events](process.md#signal-events).

В Linux дочерние процессы дочерних процессов не будут завершены при попытке убить их родителя. Это может произойти при запуске нового процесса в оболочке или при использовании опции `shell` опции `ChildProcess`:

```js
'use strict';
const { spawn } = require('node:child_process');


const subprocess = spawn(
  'sh',
  [
    '-c',
    `node -e` setInterval(() => {
      console.log(process.pid, 'is alive')
    }, 500);"`,
  ], {
    stdio: ['inherit', 'inherit', 'inherit'],
  },
);


setTimeout(() => {
  subprocess.kill(); // Не завершает процесс Node.js в оболочке.
}, 2000);
```

<!-- 0026.part.md -->

### `subprocess.killed`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Устанавливается в `true` после того, как `subprocess.kill()` успешно отправил сигнал дочернему процессу.

Свойство `subprocess.killed` указывает, успешно ли дочерний процесс получил сигнал от `subprocess.kill()`. Свойство `killed` не указывает на то, что дочерний процесс был завершен.

<!-- 0027.part.md -->

### `subprocess.pid`

-   [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Undefined_type)

Возвращает идентификатор процесса (PID) дочернего процесса. Если дочерний процесс не может быть порожден из-за ошибок, то значение `undefined` и выдается `error`.

```js
const { spawn } = require('node:child_process');
const grep = spawn('grep', ['ssh']);

console.log(`Spawned child pid: ${grep.pid}`);
grep.stdin.end();
```

<!-- 0028.part.md -->

### `subprocess.ref()`

Вызов `subprocess.ref()` после вызова `subprocess.unref()` восстановит удаленный счетчик ссылок для дочернего процесса, заставляя родителя ждать завершения дочернего процесса перед тем, как выйти самому.

```js
const { spawn } = require('node:child_process');

const subprocess = spawn(
    process.argv[0],
    ['child_program.js'],
    {
        detached: true,
        stdio: 'ignore',
    }
);

subprocess.unref();
subprocess.ref();
```

<!-- 0029.part.md -->

### `subprocess.send(message[, sendHandle[, options]][, callback])`

-   `message` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `sendHandle` `Handle`
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Аргумент `options`, если он присутствует, представляет собой объект, используемый для параметризации отправки определенных типов дескрипторов. `options` поддерживает следующие свойства:
    -   `keepOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Значение, которое может использоваться при передаче экземпляров `net.Socket`. Когда `true`, сокет остается открытым в процессе отправки. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Когда между родительским и дочерним процессами установлен IPC-канал (т.е. при использовании [`child_process.fork()`](#child_processforkmodulepath-args-options)), метод `subprocess.send()` может быть использован для отправки сообщений дочернему процессу. Когда дочерний процесс является экземпляром Node.js, эти сообщения могут быть получены через событие [`'message'`](process.md#event-message).

Сообщение проходит сериализацию и синтаксический анализ. Полученное сообщение может не совпадать с первоначально отправленным.

Например, в родительском скрипте:

```js
const cp = require('node:child_process');
const n = cp.fork(`${__dirname}/sub.js`);

n.on('message', (m) => {
    console.log('PARENT получил сообщение:', m);
});

// Вызывает печать для ребенка: CHILD got message: { hello: 'world' }
n.send({ hello: 'world' });
```

И тогда дочерний скрипт, `'sub.js'`, может выглядеть следующим образом:

```js
process.on('message', (m) => {
    console.log('CHILD получил сообщение:', m);
});

// Вызывает печать родителя: PARENT got message: { foo: 'bar', baz: null }
process.send({ foo: 'bar', baz: NaN });
```

Дочерние процессы Node.js будут иметь собственный метод [`process.send()`](process.md#processsendmessage-sendhandle-options-callback), который позволяет дочернему процессу отправлять сообщения обратно родительскому.

Существует особый случай при отправке сообщения `{cmd: 'NODE_foo'}`. Сообщения, содержащие префикс `NODE_` в свойстве `cmd`, зарезервированы для использования в ядре Node.js и не будут передаваться в дочернем событии [`'message'`](process.md#event-message). Скорее, такие сообщения передаются с помощью события `'internalMessage'` и потребляются внутри Node.js. Приложениям следует избегать использования таких сообщений или прослушивания событий `'internalMessage'`, поскольку они могут быть изменены без предварительного уведомления.

Необязательный аргумент `sendHandle`, который может быть передан в `subprocess.send()`, предназначен для передачи дочернему процессу объекта TCP-сервера или сокета. Дочерний процесс получит этот объект в качестве второго аргумента, переданного в функцию обратного вызова, зарегистрированную на событие [`'message'`](process.md#event-message). Любые данные, полученные и буферизованные в сокете, не будут отправлены дочернему процессу.

Необязательный `callback` - это функция, которая вызывается после отправки сообщения, но до того, как дочерняя программа его получит. Функция вызывается с одним аргументом: `null` при успехе, или объект [`Error`](errors.md#class-error) при неудаче.

Если функция `callback` не предоставлена и сообщение не может быть отправлено, то объект `ChildProcess` выдаст событие `'error'`. Это может произойти, например, когда дочерний процесс уже завершился.

Метод `subprocess.send()` вернет `false`, если канал закрылся или если количество неотправленных сообщений превысило пороговое значение, что делает неразумной дальнейшую отправку. В противном случае метод возвращает `true`. Функция `callback` может быть использована для реализации управления потоком.

<!-- 0030.part.md -->

#### Пример: передача объекта сервера

Аргумент `sendHandle` можно использовать, например, для передачи дочернему процессу хэндла объекта TCP-сервера, как показано в примере ниже:

```js
const subprocess = require('node:child_process').fork(
    'subprocess.js'
);

// Открываем объект сервера и передаем хэндл.
const server = require('node:net').createServer();
server.on('connection', (socket) => {
    socket.end('handled by parent');
});
server.listen(1337, () => {
    subprocess.send('server', server);
});
```

Тогда дочерняя программа получит объект сервера в виде:

```js
process.on('message', (m, server) => {
    if (m === 'server') {
        server.on('connection', (socket) => {
            socket.end('handled by child');
        });
    }
});
```

После того, как сервер стал общим для родителя и ребенка, некоторые соединения могут обрабатываться родителем, а некоторые - ребенком.

Хотя в приведенном примере используется сервер, созданный с помощью модуля `node:net`, серверы модуля `node:dgram` используют точно такой же рабочий процесс, за исключением того, что вместо `соединения` используется событие `'message'` и вместо `server.bind()` используется `server.listen()`. Однако это поддерживается только на платформах Unix.

<!-- 0031.part.md -->

#### Пример: отправка объекта сокета

Аналогично, аргумент `sendHandler` можно использовать для передачи хэндла сокета дочернему процессу. Пример ниже порождает два дочерних процесса, каждый из которых обрабатывает соединения с "обычным" или "специальным" приоритетом:

```js
const { fork } = require('node:child_process');
const normal = fork('subprocess.js', ['normal']);
const special = fork('subprocess.js', ['special']);

// Открываем сервер и посылаем сокеты дочернему серверу. Используйте pauseOnConnect, чтобы предотвратить.
// чтения сокетов до того, как они будут отправлены дочернему процессу.
const server = require('node:net').createServer({
    pauseOnConnect: true,
});
server.on('connection', (socket) => {
    // Если это специальный приоритет...
    if (socket.remoteAddress === '74.125.127.100') {
        special.send('socket', socket);
        return;
    }
    // Это обычный приоритет.
    normal.send('socket', socket);
});
server.listen(1337);
```

`subprocess.js` будет получать хэндл сокета в качестве второго аргумента, передаваемого в функцию обратного вызова события:

```js
process.on('message', (m, socket) => {
    if (m === 'socket') {
        if (socket) {
            // Проверяем, существует ли клиентский сокет.
            // Возможно, что сокет будет закрыт между моментом отправки и моментом получения сообщения.
            // отправки и получения в дочернем процессе.
            socket.end(
                `Request handled with ${process.argv[2]} priority`
            );
        }
    }
});
```

Не используйте `.maxConnections` для сокета, который был передан подпроцессу. Родитель не сможет отследить, когда сокет будет уничтожен.

Любые обработчики `сообщений` в подпроцессе должны проверять существование `сокета`, так как соединение могло быть закрыто за время, необходимое для передачи соединения дочернему процессу.

<!-- 0032.part.md -->

### `subprocess.signalCode`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type)

Свойство `subprocess.signalCode` указывает на сигнал, полученный дочерним процессом, если таковой имеется, иначе `null`.

<!-- 0033.part.md -->

### `subprocess.spawnargs`

-   [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

Свойство `subprocess.spawnargs` представляет собой полный список аргументов командной строки, с которыми был запущен дочерний процесс.

<!-- 0034.part.md -->

### `subprocess.spawnfile`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `subprocess.spawnfile` указывает имя исполняемого файла запускаемого дочернего процесса.

Для [`child_process.fork()`](#child_processforkmodulepath-args-options) его значение будет равно [`process.execPath`](process.md#processexecpath). Для [`child_process.spawn()`](#child_processspawncommand-args-options) его значение будет равно имени исполняемого файла. Для [`child_process.exec()`](#child_processexeccommand-options-callback) его значением будет имя оболочки, в которой запускается дочерний процесс.

<!-- 0035.part.md -->

### `subprocess.stderr`

-   [`<stream.Readable>`](stream.md#streamreadable) | [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Undefined_type)

`Читаемый поток`, представляющий `stderr` дочернего процесса.

Если дочерний процесс был порожден с `stdio[2]`, установленным в любое другое значение, кроме `'pipe'`, то это будет `null`.

`subprocess.stderr` является псевдонимом для `subprocess.stdio[2]`. Оба свойства будут ссылаться на одно и то же значение.

Свойство `subprocess.stderr` может быть `null` или `undefined`, если дочерний процесс не может быть успешно порожден.

<!-- 0036.part.md -->

### `subprocess.stdin`

-   [`<stream.Writable>`](stream.md#streamwritable) | [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Undefined_type)

Поток `Writable Stream`, который представляет собой `stdin` дочернего процесса.

Если дочерний процесс ожидает считывания всех своих входных данных, он не будет продолжать работу, пока этот поток не будет закрыт с помощью `end()`.

Если дочерний процесс был порожден с `stdio[0]`, установленным в любое другое значение, кроме `'pipe'`, то это будет `null`.

`subprocess.stdin` является псевдонимом для `subprocess.stdio[0]`. Оба свойства будут ссылаться на одно и то же значение.

Свойство `subprocess.stdin` может быть `null` или `undefined`, если дочерний процесс не может быть успешно порожден.

<!-- 0037.part.md -->

### `subprocess.stdio`

-   [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

Разреженный массив труб для дочернего процесса, соответствующий позициям в опции [`stdio`](#optionsstdio), переданной в [`child_process.spawn()`](#child_processspawncommand-args-options), которые были установлены в значение `'pipe'`. `subprocess.stdio[0]`, `subprocess.stdio[1]` и `subprocess.stdio[2]` также доступны как `subprocess.stdin`, `subprocess.stdout` и `subprocess.stderr`, соответственно.

В следующем примере только дочерний fd `1` (stdout) настроен как pipe, поэтому только родительский `subprocess.stdio[1]` является потоком, все остальные значения в массиве являются `null`.

```js
const assert = require('node:assert');
const fs = require('node:fs');
const child_process = require('node:child_process');

const subprocess = child_process.spawn('ls', {
    stdio: [
        0, // Использовать родительский stdin для дочернего.
        'pipe', // Передавать stdout ребенка родителю.
        fs.openSync('err.out', 'w'), // Направлять stderr ребенка в файл.
    ],
});

assert.strictEqual(subprocess.stdio[0], null);
assert.strictEqual(subprocess.stdio[0], subprocess.stdin);

assert(subprocess.stdout);
assert.strictEqual(subprocess.stdio[1], subprocess.stdout);

assert.strictEqual(subprocess.stdio[2], null);
assert.strictEqual(subprocess.stdio[2], subprocess.stderr);
```

Свойство `subprocess.stdio` может быть "неопределенным", если дочерний процесс не может быть успешно порожден.

<!-- 0038.part.md -->

### `subprocess.stdout`

-   [`<stream.Readable>`](stream.md#streamreadable) | [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Undefined_type)

Поток `Readable`, представляющий `stdout` дочернего процесса.

Если дочерний процесс был порожден с `stdio[1]`, установленным в любое другое значение, кроме `'pipe'`, то это будет `null`.

`subprocess.stdout` является псевдонимом для `subprocess.stdio[1]`. Оба свойства будут ссылаться на одно и то же значение.

```js
const { spawn } = require('node:child_process');

const subprocess = spawn('ls');

subprocess.stdout.on('data', (data) => {
    console.log(`Received chunk ${data}`);
});
```

Свойство `subprocess.stdout` может быть `null` или `undefined`, если дочерний процесс не может быть успешно порожден.

<!-- 0039.part.md -->

### `subprocess.unref()`

По умолчанию родитель будет ждать выхода отделенного дочернего процесса. Чтобы запретить родителю ждать выхода данного `subprocess`а, используйте метод `subprocess.unref()`. Это приведет к тому, что цикл событий родительского процесса не будет включать дочерний процесс в свой счетчик ссылок, что позволит родительскому процессу завершить работу независимо от дочернего, если только между дочерним и родительским процессами не установлен IPC-канал.

```js
const { spawn } = require('node:child_process');

const subprocess = spawn(
    process.argv[0],
    ['child_program.js'],
    {
        detached: true,
        stdio: 'ignore',
    }
);

subprocess.unref();
```

<!-- 0040.part.md -->

## `maxBuffer` и Юникод

Опция `maxBuffer` определяет наибольшее количество байт, разрешенное для передачи на `stdout` или `stderr`. Если это значение превышено, то дочерний процесс завершается. Это влияет на вывод, который включает многобайтовые кодировки символов, такие как UTF-8 или UTF-16. Например, `console.log('中文测试')` отправит 13 байт в кодировке UTF-8 на `stdout`, хотя там всего 4 символа.

<!-- 0041.part.md -->

## Требования к оболочке

Оболочка должна понимать переключатель `-c`. Если оболочка - `cmd.exe`, она должна понимать переключатели `/d /s /c`, и разбор командной строки должен быть совместим.

<!-- 0042.part.md -->

## Оболочка Windows по умолчанию

Хотя Microsoft указывает, что `%COMSPEC%` должен содержать путь к `'cmd.exe'` в корневом окружении, дочерние процессы не всегда подчиняются этому требованию. Таким образом, в функциях `child_process`, где может быть порождена оболочка, `'cmd.exe'` используется как запасной вариант, если `process.env.ComSpec` недоступен.

<!-- 0043.part.md -->

## Расширенная сериализация

Дочерние процессы поддерживают механизм сериализации для IPC, который основан на [serialization API модуля `node:v8`](v8.md#serialization-api), основанном на [HTML structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). Он в целом более мощный и поддерживает больше встроенных типов объектов JavaScript, таких как `BigInt`, `Map` и `Set`, `ArrayBuffer` и `TypedArray`, `Buffer`, `Error`, `RegExp` и др.

Однако этот формат не является полным супермножеством JSON, и, например, свойства, установленные на объектах таких встроенных типов, не будут передаваться через шаг сериализации. Кроме того, производительность может быть не эквивалентна производительности JSON, в зависимости от структуры передаваемых данных. Поэтому эта возможность требует выбора, установив опцию `serialization` в `advanced` при вызове [`child_process.spawn()`](#child_processspawncommand-args-options) или [`child_process.fork()`](#child_processforkmodulepath-args-options).

<!-- 0044.part.md -->

