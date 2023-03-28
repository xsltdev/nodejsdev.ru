---
description: В child_process Модуль предоставляет возможность создавать подпроцессы аналогично, но не идентично popen
---

# Дочерний процесс

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/child_process.js -->

В `child_process` Модуль предоставляет возможность создавать подпроцессы аналогично, но не идентично popen (3). Эта возможность в первую очередь обеспечивается [`child_process.spawn()`](#child_processspawncommand-args-options) функция:

```js
const { spawn } = require('child_process');
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

По умолчанию трубы для `stdin`, `stdout`, а также `stderr` устанавливаются между родительским процессом Node.js и порожденным подпроцессом. Эти трубы имеют ограниченную (и зависящую от платформы) пропускную способность. Если подпроцесс записывает в stdout сверх этого предела без захвата вывода, подпроцесс блокируется, ожидая, пока буфер канала примет больше данных. Это идентично поведению труб в оболочке. Использовать `{ stdio: 'ignore' }` вариант, если выход не будет израсходован.

Поиск команд выполняется с помощью `options.env.PATH` переменная окружения, если она находится в `options` объект. Иначе, `process.env.PATH` используется.

В Windows переменные среды нечувствительны к регистру. Node.js лексикографически сортирует `env` ключи и использует первый, совпадающий без учета регистра. Подпроцессу будет передана только первая (в лексикографическом порядке) запись. Это может привести к проблемам в Windows при передаче объектов в `env` вариант, который имеет несколько вариантов одного и того же ключа, например `PATH` а также `Path`.

В [`child_process.spawn()`](#child_processspawncommand-args-options) метод асинхронно порождает дочерний процесс, не блокируя цикл событий Node.js. В [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options) Функция обеспечивает эквивалентную функциональность в синхронном режиме, которая блокирует цикл событий до тех пор, пока порожденный процесс не завершится или не завершится.

Для удобства `child_process` модуль предоставляет несколько синхронных и асинхронных альтернатив [`child_process.spawn()`](#child_processspawncommand-args-options) а также [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options). Каждая из этих альтернатив реализована поверх [`child_process.spawn()`](#child_processspawncommand-args-options) или [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options).

- [`child_process.exec()`](#child_processexeccommand-options-callback): порождает оболочку и запускает команду в этой оболочке, передавая `stdout` а также `stderr` в функцию обратного вызова по завершении.
- [`child_process.execFile()`](#child_processexecfilefile-args-options-callback): похожий на [`child_process.exec()`](#child_processexeccommand-options-callback) за исключением того, что он порождает команду напрямую, без предварительного создания оболочки по умолчанию.
- [`child_process.fork()`](#child_processforkmodulepath-args-options): порождает новый процесс Node.js и вызывает указанный модуль с установленным каналом связи IPC, который позволяет отправлять сообщения между родителем и потомком.
- [`child_process.execSync()`](#child_processexecsynccommand-options): синхронная версия [`child_process.exec()`](#child_processexeccommand-options-callback) который заблокирует цикл событий Node.js.
- [`child_process.execFileSync()`](#child_processexecfilesyncfile-args-options): синхронная версия [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) который заблокирует цикл событий Node.js.

Для определенных случаев использования, таких как автоматизация сценариев оболочки, [синхронные аналоги](#synchronous-process-creation) может быть удобнее. Однако во многих случаях синхронные методы могут существенно повлиять на производительность из-за остановки цикла событий во время завершения порожденных процессов.

## Создание асинхронного процесса

В [`child_process.spawn()`](#child_processspawncommand-args-options), [`child_process.fork()`](#child_processforkmodulepath-args-options), [`child_process.exec()`](#child_processexeccommand-options-callback), а также [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) все методы следуют идиоматическому шаблону асинхронного программирования, типичному для других API-интерфейсов Node.js.

Каждый из методов возвращает [`ChildProcess`](#class-childprocess) пример. Эти объекты реализуют Node.js [`EventEmitter`](events.md#class-eventemitter) API, позволяющий родительскому процессу регистрировать функции прослушивателя, которые вызываются при возникновении определенных событий в течение жизненного цикла дочернего процесса.

В [`child_process.exec()`](#child_processexeccommand-options-callback) а также [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) методы дополнительно допускают необязательный `callback` должна быть указана функция, которая вызывается при завершении дочернего процесса.

### Нерест `.bat` а также `.cmd` файлы в Windows

Важность различия между [`child_process.exec()`](#child_processexeccommand-options-callback) а также [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) может отличаться в зависимости от платформы. В операционных системах типа Unix (Unix, Linux, macOS) [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) может быть более эффективным, потому что по умолчанию он не порождает оболочку. Однако в Windows `.bat` а также `.cmd` файлы не могут быть выполнены сами по себе без терминала, и поэтому не могут быть запущены с помощью [`child_process.execFile()`](#child_processexecfilefile-args-options-callback). При работе в Windows `.bat` а также `.cmd` файлы могут быть вызваны с помощью [`child_process.spawn()`](#child_processspawncommand-args-options) с `shell` набор опций, с [`child_process.exec()`](#child_processexeccommand-options-callback), или путем нереста `cmd.exe` и прохождение `.bat` или `.cmd` файл в качестве аргумента (это то, что `shell` вариант и [`child_process.exec()`](#child_processexeccommand-options-callback) делать). В любом случае, если имя файла сценария содержит пробелы, его необходимо заключить в кавычки.

```js
// On Windows Only...
const { spawn } = require('child_process');
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
// OR...
const { exec, spawn } = require('child_process');
exec('my.bat', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

// Script with spaces in the filename:
const bat = spawn('"my script.cmd"', ['a', 'b'], {
  shell: true,
});
// or:
exec('"my script.cmd" a b', (err, stdout, stderr) => {
  // ...
});
```

### `child_process.exec(command[, options][, callback])`

<!-- YAML
added: v0.1.90
changes:
  - version:
      - v16.4.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38862
    description: The `cwd` option can be a WHATWG `URL` object using
                 `file:` protocol.
  - version: v15.4.0
    pr-url: https://github.com/nodejs/node/pull/36308
    description: AbortSignal support was added.
  - version: v8.8.0
    pr-url: https://github.com/nodejs/node/pull/15380
    description: The `windowsHide` option is supported now.
-->

- `command` {строка} Команда для запуска с аргументами, разделенными пробелами.
- `options` {Объект}
  - `cwd` {string | URL} Текущий рабочий каталог дочернего процесса. **Дефолт:** `process.cwd()`.
  - `env` {Object} Пары "ключ-значение" среды. **Дефолт:** `process.env`.
  - `encoding` {нить} **Дефолт:** `'utf8'`
  - `shell` {строка} Оболочка для выполнения команды. Видеть [Требования к оболочке](#shell-requirements) а также [Оболочка Windows по умолчанию](#default-windows-shell). **Дефолт:** `'/bin/sh'` в Unix, `process.env.ComSpec` в Windows.
  - `signal` {AbortSignal} позволяет прервать дочерний процесс с помощью AbortSignal.
  - `timeout` {количество} **Дефолт:** `0`
  - `maxBuffer` {number} Наибольший объем данных в байтах, разрешенный для stdout или stderr. При превышении дочерний процесс завершается, а любой вывод обрезается. См. Предостережение на [`maxBuffer` и Юникод](#maxbuffer-and-unicode). **Дефолт:** `1024 * 1024`.
  - `killSignal` {строка | целое число} **Дефолт:** `'SIGTERM'`
  - `uid` {number} Устанавливает идентификатор пользователя процесса (см. setuid (2)).
  - `gid` {number} Устанавливает групповой идентификатор процесса (см. setgid (2)).
  - `windowsHide` {boolean} Скрыть окно консоли подпроцесса, которое обычно создается в системах Windows. **Дефолт:** `false`.
- `callback` {Функция} вызывается с выходом, когда процесс завершается.
  - `error` {Ошибка}
  - `stdout` {строка | буфер}
  - `stderr` {строка | буфер}
- Возвращает: {ChildProcess}

Создает оболочку, затем выполняет `command` внутри этой оболочки, буферизуя любой сгенерированный вывод. В `command` строка, переданная в функцию exec, обрабатывается непосредственно оболочкой и специальными символами (различаются в зависимости от [оболочка](https://en.wikipedia.org/wiki/List_of_command-line_interpreters)) необходимо поступить соответствующим образом:

```js
const { exec } = require('child_process');

exec('"/path/to/test file/test.sh" arg1 arg2');
// Double quotes are used so that the space in the path is not interpreted as
// a delimiter of multiple arguments.

exec('echo "The \\$HOME variable is $HOME"');
// The $HOME variable is escaped in the first instance, but not in the second.
```

**Никогда не передавайте в эту функцию вводимые пользователем данные без предварительной очистки. Любой ввод, содержащий метасимволы оболочки, может использоваться для запуска произвольного выполнения команды.**

Если `callback` предоставляется функция, она вызывается с аргументами `(error, stdout, stderr)`. При успехе `error` будет `null`. При ошибке `error` будет примером [`Error`](errors.md#class-error). В `error.code` Свойство будет кодом выхода из процесса. По соглашению любой код выхода, кроме `0` указывает на ошибку. `error.signal` будет сигналом о завершении процесса.

В `stdout` а также `stderr` аргументы, переданные в обратный вызов, будут содержать выходные данные stdout и stderr дочернего процесса. По умолчанию Node.js декодирует вывод как UTF-8 и передает строки в обратный вызов. В `encoding` Параметр может использоваться для указания кодировки символов, используемой для декодирования вывода stdout и stderr. Если `encoding` является `'buffer'`, или нераспознанная кодировка символов, `Buffer` вместо этого объекты будут переданы в обратный вызов.

```js
const { exec } = require('child_process');
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

Если `timeout` больше, чем `0`, родитель отправит сигнал, идентифицированный `killSignal` свойство (по умолчанию `'SIGTERM'`) если ребенок бежит дольше, чем `timeout` миллисекунды.

В отличие от системного вызова POSIX exec (3), `child_process.exec()` не заменяет существующий процесс и использует оболочку для выполнения команды.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed версия, он возвращает `Promise` для `Object` с участием `stdout` а также `stderr` характеристики. Вернувшийся `ChildProcess` экземпляр прикреплен к `Promise` как `child` имущество. В случае ошибки (включая любую ошибку, приводящую к коду выхода, отличному от 0), возвращается отклоненное обещание с тем же `error` объект, указанный в обратном вызове, но с двумя дополнительными свойствами `stdout` а также `stderr`.

```js
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function lsExample() {
  const { stdout, stderr } = await exec('ls');
  console.log('stdout:', stdout);
  console.error('stderr:', stderr);
}
lsExample();
```

Если `signal` опция включена, звонок `.abort()` на соответствующем `AbortController` похоже на вызов `.kill()` в дочернем процессе, за исключением того, что ошибка, переданная в обратный вызов, будет `AbortError`:

```js
const { exec } = require('child_process');
const controller = new AbortController();
const { signal } = controller;
const child = exec('grep ssh', { signal }, (error) => {
  console.log(error); // an AbortError
});
controller.abort();
```

### `child_process.execFile(file[, args][, options][, callback])`

<!-- YAML
added: v0.1.91
changes:
  - version:
      - v16.4.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38862
    description: The `cwd` option can be a WHATWG `URL` object using
                 `file:` protocol.
  - version:
      - v15.4.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/36308
    description: AbortSignal support was added.
  - version: v8.8.0
    pr-url: https://github.com/nodejs/node/pull/15380
    description: The `windowsHide` option is supported now.
-->

- `file` {строка} Имя или путь исполняемого файла для запуска.
- `args` {string \[]} Список строковых аргументов.
- `options` {Объект}
  - `cwd` {string | URL} Текущий рабочий каталог дочернего процесса.
  - `env` {Object} Пары "ключ-значение" среды. **Дефолт:** `process.env`.
  - `encoding` {нить} **Дефолт:** `'utf8'`
  - `timeout` {количество} **Дефолт:** `0`
  - `maxBuffer` {number} Наибольший объем данных в байтах, разрешенный для stdout или stderr. При превышении дочерний процесс завершается, а любой вывод обрезается. См. Предостережение на [`maxBuffer` и Юникод](#maxbuffer-and-unicode). **Дефолт:** `1024 * 1024`.
  - `killSignal` {строка | целое число} **Дефолт:** `'SIGTERM'`
  - `uid` {number} Устанавливает идентификатор пользователя процесса (см. setuid (2)).
  - `gid` {number} Устанавливает групповой идентификатор процесса (см. setgid (2)).
  - `windowsHide` {boolean} Скрыть окно консоли подпроцесса, которое обычно создается в системах Windows. **Дефолт:** `false`.
  - `windowsVerbatimArguments` {boolean} В Windows не используются кавычки или экранирование аргументов. Игнорируется в Unix. **Дефолт:** `false`.
  - `shell` {логическое | строка} Если `true`, работает `command` внутри оболочки. Использует `'/bin/sh'` в Unix и `process.env.ComSpec` в Windows. Другая оболочка может быть указана в виде строки. Видеть [Требования к оболочке](#shell-requirements) а также [Оболочка Windows по умолчанию](#default-windows-shell). **Дефолт:** `false` (без оболочки).
  - `signal` {AbortSignal} позволяет прервать дочерний процесс с помощью AbortSignal.
- `callback` {Функция} Вызывается с выходом, когда процесс завершается.
  - `error` {Ошибка}
  - `stdout` {строка | буфер}
  - `stderr` {строка | буфер}
- Возвращает: {ChildProcess}

В `child_process.execFile()` функция похожа на [`child_process.exec()`](#child_processexeccommand-options-callback) за исключением того, что по умолчанию он не порождает оболочку. Скорее, указанный исполняемый файл `file` создается непосредственно как новый процесс, что делает его немного более эффективным, чем [`child_process.exec()`](#child_processexeccommand-options-callback).

Те же варианты, что и [`child_process.exec()`](#child_processexeccommand-options-callback) поддерживаются. Поскольку оболочка не создается, такие действия, как перенаправление ввода-вывода и подстановка файлов, не поддерживаются.

```js
const { execFile } = require('child_process');
const child = execFile(
  'node',
  ['--version'],
  (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  }
);
```

В `stdout` а также `stderr` аргументы, переданные в обратный вызов, будут содержать выходные данные stdout и stderr дочернего процесса. По умолчанию Node.js декодирует вывод как UTF-8 и передает строки в обратный вызов. В `encoding` Параметр может использоваться для указания кодировки символов, используемой для декодирования вывода stdout и stderr. Если `encoding` является `'buffer'`, или нераспознанная кодировка символов, `Buffer` вместо этого объекты будут переданы в обратный вызов.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed версия, он возвращает `Promise` для `Object` с участием `stdout` а также `stderr` характеристики. Вернувшийся `ChildProcess` экземпляр прикреплен к `Promise` как `child` имущество. В случае ошибки (включая любую ошибку, приводящую к коду выхода, отличному от 0), возвращается отклоненное обещание с тем же `error` объект, указанный в обратном вызове, но с двумя дополнительными свойствами `stdout` а также `stderr`.

```js
const util = require('util');
const execFile = util.promisify(
  require('child_process').execFile
);
async function getVersion() {
  const { stdout } = await execFile('node', ['--version']);
  console.log(stdout);
}
getVersion();
```

**Если `shell` опция включена, не передавайте в эту функцию несанкционированные данные, введенные пользователем. Любой ввод, содержащий метасимволы оболочки, может использоваться для запуска произвольного выполнения команды.**

Если `signal` опция включена, звонок `.abort()` на соответствующем `AbortController` похоже на вызов `.kill()` в дочернем процессе, за исключением того, что ошибка, переданная в обратный вызов, будет `AbortError`:

```js
const { execFile } = require('child_process');
const controller = new AbortController();
const { signal } = controller;
const child = execFile(
  'node',
  ['--version'],
  { signal },
  (error) => {
    console.log(error); // an AbortError
  }
);
controller.abort();
```

### `child_process.fork(modulePath[, args][, options])`

<!-- YAML
added: v0.5.0
changes:
  - version:
      - v16.4.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38862
    description: The `cwd` option can be a WHATWG `URL` object using
                 `file:` protocol.
  - version:
      - v15.13.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37256
    description: timeout was added.
  - version:
      - v15.11.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37325
    description: killSignal for AbortSignal was added.
  - version:
      - v15.6.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/36603
    description: AbortSignal support was added.
  - version:
      - v13.2.0
      - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30162
    description: The `serialization` option is supported now.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10866
    description: The `stdio` option can now be a string.
  - version: v6.4.0
    pr-url: https://github.com/nodejs/node/pull/7811
    description: The `stdio` option is supported now.
-->

- `modulePath` {строка} Модуль для запуска в дочернем элементе.
- `args` {string \[]} Список строковых аргументов.
- `options` {Объект}
  - `cwd` {string | URL} Текущий рабочий каталог дочернего процесса.
  - `detached` {boolean} Подготовить дочерний процесс к запуску независимо от его родительского процесса. Конкретное поведение зависит от платформы, см. [`options.detached`](#optionsdetached)).
  - `env` {Object} Пары "ключ-значение" среды. **Дефолт:** `process.env`.
  - `execPath` {строка} Исполняемый файл, используемый для создания дочернего процесса.
  - `execArgv` {string \[]} Список строковых аргументов, переданных исполняемому файлу. **Дефолт:** `process.execArgv`.
  - `gid` {number} Устанавливает групповой идентификатор процесса (см. setgid (2)).
  - `serialization` {строка} Укажите тип сериализации, используемый для отправки сообщений между процессами. Возможные значения: `'json'` а также `'advanced'`. Видеть [Расширенная сериализация](#advanced-serialization) Больше подробностей. **Дефолт:** `'json'`.
  - `signal` {AbortSignal} Позволяет закрыть дочерний процесс с помощью AbortSignal.
  - `killSignal` {строка | целое число} Значение сигнала, которое будет использоваться, когда порожденный процесс будет остановлен по таймауту или сигналу прерывания. **Дефолт:** `'SIGTERM'`.
  - `silent` {boolean} Если `true`, stdin, stdout и stderr дочернего элемента будут переданы по конвейеру родителю, в противном случае они будут унаследованы от родителя, см. `'pipe'` а также `'inherit'` варианты для [`child_process.spawn()`](#child_processspawncommand-args-options)с [`stdio`](#optionsstdio) Больше подробностей. **Дефолт:** `false`.
  - `stdio` {Array | string} См. [`child_process.spawn()`](#child_processspawncommand-args-options)с [`stdio`](#optionsstdio). Когда предоставляется этот параметр, он имеет приоритет над `silent`. Если используется вариант массива, он должен содержать ровно один элемент со значением `'ipc'` или будет выдана ошибка. Например `[0, 1, 2, 'ipc']`.
  - `uid` {number} Устанавливает идентификатор пользователя процесса (см. setuid (2)).
  - `windowsVerbatimArguments` {boolean} В Windows не используются кавычки или экранирование аргументов. Игнорируется в Unix. **Дефолт:** `false`.
  - `timeout` {number} Максимальное время, в течение которого процесс может выполняться, в миллисекундах. **Дефолт:** `undefined`.
- Возвращает: {ChildProcess}

В `child_process.fork()` метод является частным случаем [`child_process.spawn()`](#child_processspawncommand-args-options) используется специально для создания новых процессов Node.js. Нравиться [`child_process.spawn()`](#child_processspawncommand-args-options), а [`ChildProcess`](#class-childprocess) объект возвращается. Вернувшийся [`ChildProcess`](#class-childprocess) будет иметь встроенный дополнительный канал связи, который позволяет передавать сообщения между родителем и потомком. Видеть [`subprocess.send()`](#subprocesssendmessage-sendhandle-options-callback) для подробностей.

Имейте в виду, что порожденные дочерние процессы Node.js не зависят от родителя, за исключением канала связи IPC, установленного между ними. Каждый процесс имеет свою собственную память со своими собственными экземплярами V8. Из-за необходимости выделения дополнительных ресурсов создание большого количества дочерних процессов Node.js не рекомендуется.

По умолчанию, `child_process.fork()` создаст новые экземпляры Node.js, используя [`process.execPath`](process.md#processexecpath) родительского процесса. В `execPath` собственность в `options` объект позволяет использовать альтернативный путь выполнения.

Процессы Node.js, запущенные с настраиваемым `execPath` будет взаимодействовать с родительским процессом, используя дескриптор файла (fd), идентифицированный с помощью переменной среды `NODE_CHANNEL_FD` о дочернем процессе.

В отличие от системного вызова POSIX fork (2), `child_process.fork()` не клонирует текущий процесс.

В `shell` опция доступна в [`child_process.spawn()`](#child_processspawncommand-args-options) не поддерживается `child_process.fork()` и будет проигнорирован, если установлен.

Если `signal` опция включена, звонок `.abort()` на соответствующем `AbortController` похоже на вызов `.kill()` в дочернем процессе, за исключением того, что ошибка, переданная в обратный вызов, будет `AbortError`:

```js
if (process.argv[2] === 'child') {
  setTimeout(() => {
    console.log(`Hello from ${process.argv[2]}!`);
  }, 1_000);
} else {
  const { fork } = require('child_process');
  const controller = new AbortController();
  const { signal } = controller;
  const child = fork(__filename, ['child'], { signal });
  child.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
  });
  controller.abort(); // Stops the child process
}
```

### `child_process.spawn(command[, args][, options])`

<!-- YAML
added: v0.1.90
changes:
  - version:
      - v16.4.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38862
    description: The `cwd` option can be a WHATWG `URL` object using
                 `file:` protocol.
  - version:
      - v15.13.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37256
    description: timeout was added.
  - version:
      - v15.11.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37325
    description: killSignal for AbortSignal was added.
  - version:
      - v15.5.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/36432
    description: AbortSignal support was added.
  - version:
      - v13.2.0
      - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30162
    description: The `serialization` option is supported now.
  - version: v8.8.0
    pr-url: https://github.com/nodejs/node/pull/15380
    description: The `windowsHide` option is supported now.
  - version: v6.4.0
    pr-url: https://github.com/nodejs/node/pull/7696
    description: The `argv0` option is supported now.
  - version: v5.7.0
    pr-url: https://github.com/nodejs/node/pull/4598
    description: The `shell` option is supported now.
-->

- `command` {строка} Команда для выполнения.

- `args` {string \[]} Список строковых аргументов.

- `options` {Объект}

  - `cwd` {string | URL} Текущий рабочий каталог дочернего процесса.
  - `env` {Object} Пары "ключ-значение" среды. **Дефолт:** `process.env`.
  - `argv0` {строка} Явно задайте значение `argv[0]` отправлено дочернему процессу. Это будет установлено на `command` если не указано.
  - `stdio` {Array | string} Конфигурация дочернего stdio (см. [`options.stdio`](#optionsstdio)).
  - `detached` {boolean} Подготовить дочерний процесс к запуску независимо от его родительского процесса. Конкретное поведение зависит от платформы, см. [`options.detached`](#optionsdetached)).
  - `uid` {number} Устанавливает идентификатор пользователя процесса (см. setuid (2)).
  - `gid` {number} Устанавливает групповой идентификатор процесса (см. setgid (2)).
  - `serialization` {строка} Укажите тип сериализации, используемый для отправки сообщений между процессами. Возможные значения: `'json'` а также `'advanced'`. Видеть [Расширенная сериализация](#advanced-serialization) Больше подробностей. **Дефолт:** `'json'`.
  - `shell` {логическое | строка} Если `true`, работает `command` внутри оболочки. Использует `'/bin/sh'` в Unix и `process.env.ComSpec` в Windows. Другая оболочка может быть указана в виде строки. Видеть [Требования к оболочке](#shell-requirements) а также [Оболочка Windows по умолчанию](#default-windows-shell). **Дефолт:** `false` (без оболочки).
  - `windowsVerbatimArguments` {boolean} В Windows не используются кавычки или экранирование аргументов. Игнорируется в Unix. Это установлено на `true` автоматически, когда `shell` указан и является CMD. **Дефолт:** `false`.
  - `windowsHide` {boolean} Скрыть окно консоли подпроцесса, которое обычно создается в системах Windows. **Дефолт:** `false`.
  - `signal` {AbortSignal} позволяет прервать дочерний процесс с помощью AbortSignal.
  - `timeout` {number} Максимальное время, в течение которого процесс может выполняться, в миллисекундах. **Дефолт:** `undefined`.
  - `killSignal` {строка | целое число} Значение сигнала, которое будет использоваться, когда порожденный процесс будет остановлен по таймауту или сигналу прерывания. **Дефолт:** `'SIGTERM'`.

- Возвращает: {ChildProcess}

В `child_process.spawn()` метод порождает новый процесс, используя данный `command`, с аргументами командной строки в `args`. Если опущено, `args` по умолчанию пустой массив.

**Если `shell` опция включена, не передавайте в эту функцию несанкционированные данные, введенные пользователем. Любой ввод, содержащий метасимволы оболочки, может использоваться для запуска произвольного выполнения команды.**

Третий аргумент может использоваться для указания дополнительных параметров со следующими значениями по умолчанию:

```js
const defaults = {
  cwd: undefined,
  env: process.env,
};
```

Использовать `cwd` чтобы указать рабочий каталог, из которого запускается процесс. Если не указан, по умолчанию наследуется текущий рабочий каталог. Если задан, но путь не существует, дочерний процесс выдает сообщение `ENOENT` ошибка и немедленно закрывается. `ENOENT` также выдается, когда команда не существует.

Использовать `env` для указания переменных среды, которые будут видны новому процессу, по умолчанию используется [`process.env`](process.md#processenv).

`undefined` ценности в `env` будут проигнорированы.

Пример запуска `ls -lh /usr`, захват `stdout`, `stderr`, и код выхода:

```js
const { spawn } = require('child_process');
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

Пример: очень сложный способ запуска `ps ax | grep ssh`

```js
const { spawn } = require('child_process');
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
    console.log(`grep process exited with code ${code}`);
  }
});
```

Пример проверки на сбой `spawn`:

```js
const { spawn } = require('child_process');
const subprocess = spawn('bad_command');

subprocess.on('error', (err) => {
  console.error('Failed to start subprocess.');
});
```

Некоторые платформы (macOS, Linux) будут использовать значение `argv[0]` для названия процесса, в то время как другие (Windows, SunOS) будут использовать `command`.

Node.js в настоящее время перезаписывает `argv[0]` с участием `process.execPath` при запуске, так что `process.argv[0]` в дочернем процессе Node.js не будет соответствовать `argv0` параметр передан в `spawn` от родителя, извлеките его с помощью `process.argv0` свойство вместо этого.

Если `signal` опция включена, звонок `.abort()` на соответствующем `AbortController` похоже на вызов `.kill()` в дочернем процессе, за исключением того, что ошибка, переданная в обратный вызов, будет `AbortError`:

```js
const { spawn } = require('child_process');
const controller = new AbortController();
const { signal } = controller;
const grep = spawn('grep', ['ssh'], { signal });
grep.on('error', (err) => {
  // This will be called with err being an AbortError if the controller aborts
});
controller.abort(); // Stops the child process
```

#### `options.detached`

<!-- YAML
added: v0.7.10
-->

В Windows установка `options.detached` к `true` позволяет дочернему процессу продолжить работу после выхода из родительского. У ребенка будет собственное окно консоли. После включения для дочернего процесса его нельзя отключить.

На платформах, отличных от Windows, если `options.detached` установлен на `true`, дочерний процесс станет лидером новой группы процессов и сеанса. Дочерние процессы могут продолжать работу после выхода из родительского, независимо от того, отсоединены они или нет. См. Setsid (2) для получения дополнительной информации.

По умолчанию родитель будет ждать выхода отсоединенного дочернего элемента. Чтобы родители не ждали заданного `subprocess` для выхода используйте `subprocess.unref()` метод. Это приведет к тому, что родительский цикл событий не включит дочерний элемент в свой счетчик ссылок, что позволит родителю выйти независимо от дочернего элемента, если между дочерним и родительским элементом не будет установлен канал IPC.

При использовании `detached` возможность запустить длительный процесс, процесс не будет продолжать работать в фоновом режиме после выхода родительского объекта, если ему не будет предоставлен `stdio` конфигурация, которая не связана с родительским. Если родитель `stdio` наследуется, потомок останется присоединенным к управляющему терминалу.

Пример длительного процесса с отключением и игнорированием его родителя `stdio` файловые дескрипторы, чтобы игнорировать завершение родителя:

```js
const { spawn } = require('child_process');

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
const fs = require('fs');
const { spawn } = require('child_process');
const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./out.log', 'a');

const subprocess = spawn('prg', [], {
  detached: true,
  stdio: ['ignore', out, err],
});

subprocess.unref();
```

#### `options.stdio`

<!-- YAML
added: v0.7.10
changes:
  - version:
      - v15.6.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/29412
    description: Added the `overlapped` stdio flag.
  - version: v3.3.1
    pr-url: https://github.com/nodejs/node/pull/2727
    description: The value `0` is now accepted as a file descriptor.
-->

В `options.stdio` опция используется для настройки каналов, которые устанавливаются между родительским и дочерним процессом. По умолчанию дочерние stdin, stdout и stderr перенаправляются на соответствующие [`subprocess.stdin`](#subprocessstdin), [`subprocess.stdout`](#subprocessstdout), а также [`subprocess.stderr`](#subprocessstderr) потоки на [`ChildProcess`](#class-childprocess) объект. Это эквивалентно установке `options.stdio` равно `['pipe', 'pipe', 'pipe']`.

Для удобства, `options.stdio` может быть одной из следующих строк:

- `'pipe'`: эквивалентно `['pipe', 'pipe', 'pipe']` (по умолчанию)
- `'overlapped'`: эквивалентно `['overlapped', 'overlapped', 'overlapped']`
- `'ignore'`: эквивалентно `['ignore', 'ignore', 'ignore']`
- `'inherit'`: эквивалентно `['inherit', 'inherit', 'inherit']` или `[0, 1, 2]`

В противном случае значение `options.stdio` - это массив, в котором каждый индекс соответствует fd в дочернем элементе. Fds 0, 1 и 2 соответствуют стандартному вводу, стандартному выводу и стандартному потоку данных соответственно. Дополнительные fds могут быть указаны для создания дополнительных каналов между родителем и потомком. Значение может быть одним из следующих:

1.  `'pipe'`: Создать канал между дочерним и родительским процессами. Родительский конец канала предоставляется родительскому элементу как свойство в `child_process` объект как [`subprocess.stdio[fd]`](#subprocessstdio). Каналы, созданные для fds 0, 1 и 2, также доступны как [`subprocess.stdin`](#subprocessstdin), [`subprocess.stdout`](#subprocessstdout) а также [`subprocess.stderr`](#subprocessstderr), соответственно.
2.  `'overlapped'`: Такой же как `'pipe'` за исключением того, что `FILE_FLAG_OVERLAPPED` на ручке установлен флажок. Это необходимо для перекрывающегося ввода-вывода дескрипторов stdio дочернего процесса. Увидеть [документы](https://docs.microsoft.com/en-us/windows/win32/fileio/synchronous-and-asynchronous-i-o) Больше подробностей. Это точно так же, как `'pipe'` в системах, отличных от Windows.
3.  `'ipc'`: Создайте канал IPC для передачи сообщений / файловых дескрипторов между родительским и дочерним. А [`ChildProcess`](#class-childprocess) может иметь не более одного дескриптора файла IPC stdio. Установка этого параметра включает [`subprocess.send()`](#subprocesssendmessage-sendhandle-options-callback) метод. Если дочерний процесс является процессом Node.js, наличие канала IPC позволит [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) а также [`process.disconnect()`](process.md#processdisconnect) методы, а также [`'disconnect'`](process.md#event-disconnect) а также [`'message'`](process.md#event-message) события внутри ребенка.

    Доступ к IP-каналу fd любым способом, кроме [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) или использование канала IPC с дочерним процессом, не являющимся экземпляром Node.js, не поддерживается.

4.  `'ignore'`: Указывает Node.js игнорировать fd в дочернем элементе. Хотя Node.js всегда будет открывать fds 0, 1 и 2 для процессов, которые он порождает, установив для fd значение `'ignore'` вызовет открытие Node.js `/dev/null` и прикрепите его к детскому fd.
5.  `'inherit'`: Передать соответствующий поток stdio в / из родительского процесса. В первых трех позициях это эквивалентно `process.stdin`, `process.stdout`, а также `process.stderr`, соответственно. В любой другой позиции, эквивалентной `'ignore'`.
6.  Объект {Stream}: совместно использовать доступный для чтения или записи поток, который ссылается на tty, файл, сокет или канал, с дочерним процессом. Базовый дескриптор файла потока дублируется в дочернем процессе на fd, который соответствует индексу в `stdio` множество. У потока должен быть базовый дескриптор (файловые потоки не имеют `'open'` событие произошло).
7.  Положительное целое число: целочисленное значение интерпретируется как дескриптор файла, который в настоящее время открыт в родительском процессе. Он используется совместно с дочерним процессом аналогично тому, как могут использоваться объекты {Stream}. Передача сокетов не поддерживается в Windows.
8.  `null`, `undefined`: Использовать значение по умолчанию. Для stdio fds 0, 1 и 2 (другими словами, stdin, stdout и stderr) создается канал. Для fd 3 и выше по умолчанию `'ignore'`.

```js
const { spawn } = require('child_process');

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

_Стоит отметить, что когда между родительским и дочерним процессами устанавливается канал IPC, а дочерний процесс является процессом Node.js, дочерний процесс запускается с каналом IPC без ссылки (с использованием `unref()`) до тех пор, пока дочерний элемент не зарегистрирует обработчик событий для [`'disconnect'`](process.md#event-disconnect) событие или [`'message'`](process.md#event-message) событие. Это позволяет дочернему элементу нормально выйти без того, чтобы процесс был открыт открытым каналом IPC._

В Unix-подобных операционных системах [`child_process.spawn()`](#child_processspawncommand-args-options) выполняет операции с памятью синхронно перед тем, как отделить цикл событий от дочернего. Приложения с большим объемом памяти могут часто [`child_process.spawn()`](#child_processspawncommand-args-options) призывает быть узким местом. Для получения дополнительной информации см. [V8, выпуск 7381](https://bugs.chromium.org/p/v8/issues/detail?id=7381).

Смотрите также: [`child_process.exec()`](#child_processexeccommand-options-callback) а также [`child_process.fork()`](#child_processforkmodulepath-args-options).

## Создание синхронного процесса

В [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options), [`child_process.execSync()`](#child_processexecsynccommand-options), а также [`child_process.execFileSync()`](#child_processexecfilesyncfile-args-options) методы являются синхронными и будут блокировать цикл событий Node.js, приостанавливая выполнение любого дополнительного кода до завершения порожденного процесса.

Блокирующие вызовы, подобные этим, в основном полезны для упрощения задач сценариев общего назначения и для упрощения загрузки / обработки конфигурации приложения при запуске.

### `child_process.execFileSync(file[, args][, options])`

<!-- YAML
added: v0.11.12
changes:
  - version:
      - v16.4.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38862
    description: The `cwd` option can be a WHATWG `URL` object using
                 `file:` protocol.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22409
    description: The `input` option can now be any `TypedArray` or a
                 `DataView`.
  - version: v8.8.0
    pr-url: https://github.com/nodejs/node/pull/15380
    description: The `windowsHide` option is supported now.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10653
    description: The `input` option can now be a `Uint8Array`.
  - version:
    - v6.2.1
    - v4.5.0
    pr-url: https://github.com/nodejs/node/pull/6939
    description: The `encoding` option can now explicitly be set to `buffer`.
-->

- `file` {строка} Имя или путь исполняемого файла для запуска.
- `args` {string \[]} Список строковых аргументов.
- `options` {Объект}
  - `cwd` {string | URL} Текущий рабочий каталог дочернего процесса.
  - `input` {string | Buffer | TypedArray | DataView} Значение, которое будет передано как стандартный ввод в порожденный процесс. Предоставление этого значения переопределит `stdio[0]`.
  - `stdio` {string | Array} Конфигурация дочернего stdio. `stderr` по умолчанию будет выводиться на stderr родительского процесса, если `stdio` указан. **Дефолт:** `'pipe'`.
  - `env` {Object} Пары "ключ-значение" среды. **Дефолт:** `process.env`.
  - `uid` {number} Устанавливает идентификатор пользователя процесса (см. setuid (2)).
  - `gid` {number} Устанавливает групповой идентификатор процесса (см. setgid (2)).
  - `timeout` {number} Максимальное время, в течение которого процесс может выполняться, в миллисекундах. **Дефолт:** `undefined`.
  - `killSignal` {строка | целое число} Значение сигнала, которое будет использоваться, когда порожденный процесс будет убит. **Дефолт:** `'SIGTERM'`.
  - `maxBuffer` {number} Наибольший объем данных в байтах, разрешенный для stdout или stderr. При превышении дочерний процесс завершается. См. Предостережение на [`maxBuffer` и Юникод](#maxbuffer-and-unicode). **Дефолт:** `1024 * 1024`.
  - `encoding` {строка} Кодировка, используемая для всех входов и выходов stdio. **Дефолт:** `'buffer'`.
  - `windowsHide` {boolean} Скрыть окно консоли подпроцесса, которое обычно создается в системах Windows. **Дефолт:** `false`.
  - `shell` {логическое | строка} Если `true`, работает `command` внутри оболочки. Использует `'/bin/sh'` в Unix и `process.env.ComSpec` в Windows. Другая оболочка может быть указана в виде строки. Видеть [Требования к оболочке](#shell-requirements) а также [Оболочка Windows по умолчанию](#default-windows-shell). **Дефолт:** `false` (без оболочки).
- Возвращает: {Buffer | string} Стандартный вывод команды.

В `child_process.execFileSync()` метод в целом идентичен [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) за исключением того, что метод не вернется, пока дочерний процесс не закроется полностью. Когда истекло время ожидания и `killSignal` отправлено, метод не вернется, пока процесс не завершится полностью.

Если дочерний процесс перехватывает и обрабатывает `SIGTERM` сигнал и не завершается, родительский процесс все равно будет ждать, пока дочерний процесс не завершится.

Если время ожидания процесса истекло или код выхода отличен от нуля, этот метод выдаст сообщение [`Error`](errors.md#class-error) который будет включать в себя полный результат базового [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options).

**Если `shell` опция включена, не передавайте в эту функцию несанкционированные данные, введенные пользователем. Любой ввод, содержащий метасимволы оболочки, может использоваться для запуска произвольного выполнения команды.**

### `child_process.execSync(command[, options])`

<!-- YAML
added: v0.11.12
changes:
  - version:
      - v16.4.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38862
    description: The `cwd` option can be a WHATWG `URL` object using
                 `file:` protocol.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22409
    description: The `input` option can now be any `TypedArray` or a
                 `DataView`.
  - version: v8.8.0
    pr-url: https://github.com/nodejs/node/pull/15380
    description: The `windowsHide` option is supported now.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10653
    description: The `input` option can now be a `Uint8Array`.
-->

- `command` {строка} Команда для выполнения.
- `options` {Объект}
  - `cwd` {string | URL} Текущий рабочий каталог дочернего процесса.
  - `input` {string | Buffer | TypedArray | DataView} Значение, которое будет передано как стандартный ввод в порожденный процесс. Предоставление этого значения переопределит `stdio[0]`.
  - `stdio` {string | Array} Конфигурация дочернего stdio. `stderr` по умолчанию будет выводиться на stderr родительского процесса, если `stdio` указан. **Дефолт:** `'pipe'`.
  - `env` {Object} Пары "ключ-значение" среды. **Дефолт:** `process.env`.
  - `shell` {строка} Оболочка для выполнения команды. Видеть [Требования к оболочке](#shell-requirements) а также [Оболочка Windows по умолчанию](#default-windows-shell). **Дефолт:** `'/bin/sh'` в Unix, `process.env.ComSpec` в Windows.
  - `uid` {number} Устанавливает идентификатор пользователя процесса. (См. Setuid (2)).
  - `gid` {number} Устанавливает групповой идентификатор процесса. (См. Setgid (2)).
  - `timeout` {number} Максимальное время, в течение которого процесс может выполняться, в миллисекундах. **Дефолт:** `undefined`.
  - `killSignal` {строка | целое число} Значение сигнала, которое будет использоваться, когда порожденный процесс будет убит. **Дефолт:** `'SIGTERM'`.
  - `maxBuffer` {number} Наибольший объем данных в байтах, разрешенный для stdout или stderr. При превышении дочерний процесс завершается, а любой вывод обрезается. См. Предостережение на [`maxBuffer` и Юникод](#maxbuffer-and-unicode). **Дефолт:** `1024 * 1024`.
  - `encoding` {строка} Кодировка, используемая для всех входов и выходов stdio. **Дефолт:** `'buffer'`.
  - `windowsHide` {boolean} Скрыть окно консоли подпроцесса, которое обычно создается в системах Windows. **Дефолт:** `false`.
- Возвращает: {Buffer | string} Стандартный вывод команды.

В `child_process.execSync()` метод в целом идентичен [`child_process.exec()`](#child_processexeccommand-options-callback) за исключением того, что метод не вернется, пока дочерний процесс не закроется полностью. Когда истекло время ожидания и `killSignal` отправлено, метод не вернется, пока процесс не завершится полностью. Если дочерний процесс перехватывает и обрабатывает `SIGTERM` сигнал и не завершается, родительский процесс будет ждать, пока дочерний процесс не завершится.

Если время ожидания процесса истекло или код выхода отличен от нуля, этот метод вызовет ошибку. В [`Error`](errors.md#class-error) объект будет содержать весь результат из [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options).

**Никогда не передавайте в эту функцию вводимые пользователем данные без предварительной очистки. Любой ввод, содержащий метасимволы оболочки, может использоваться для запуска произвольного выполнения команды.**

### `child_process.spawnSync(command[, args][, options])`

<!-- YAML
added: v0.11.12
changes:
  - version:
      - v16.4.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38862
    description: The `cwd` option can be a WHATWG `URL` object using
                 `file:` protocol.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22409
    description: The `input` option can now be any `TypedArray` or a
                 `DataView`.
  - version: v8.8.0
    pr-url: https://github.com/nodejs/node/pull/15380
    description: The `windowsHide` option is supported now.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10653
    description: The `input` option can now be a `Uint8Array`.
  - version:
    - v6.2.1
    - v4.5.0
    pr-url: https://github.com/nodejs/node/pull/6939
    description: The `encoding` option can now explicitly be set to `buffer`.
  - version: v5.7.0
    pr-url: https://github.com/nodejs/node/pull/4598
    description: The `shell` option is supported now.
-->

- `command` {строка} Команда для выполнения.
- `args` {string \[]} Список строковых аргументов.
- `options` {Объект}
  - `cwd` {string | URL} Текущий рабочий каталог дочернего процесса.
  - `input` {string | Buffer | TypedArray | DataView} Значение, которое будет передано как стандартный ввод в порожденный процесс. Предоставление этого значения переопределит `stdio[0]`.
  - `argv0` {строка} Явно задайте значение `argv[0]` отправлено дочернему процессу. Это будет установлено на `command` если не указано.
  - `stdio` {string | Array} Конфигурация дочернего stdio.
  - `env` {Object} Пары "ключ-значение" среды. **Дефолт:** `process.env`.
  - `uid` {number} Устанавливает идентификатор пользователя процесса (см. setuid (2)).
  - `gid` {number} Устанавливает групповой идентификатор процесса (см. setgid (2)).
  - `timeout` {number} Максимальное время, в течение которого процесс может выполняться, в миллисекундах. **Дефолт:** `undefined`.
  - `killSignal` {строка | целое число} Значение сигнала, которое будет использоваться, когда порожденный процесс будет убит. **Дефолт:** `'SIGTERM'`.
  - `maxBuffer` {number} Наибольший объем данных в байтах, разрешенный для stdout или stderr. При превышении дочерний процесс завершается, а любой вывод обрезается. См. Предостережение на [`maxBuffer` и Юникод](#maxbuffer-and-unicode). **Дефолт:** `1024 * 1024`.
  - `encoding` {строка} Кодировка, используемая для всех входов и выходов stdio. **Дефолт:** `'buffer'`.
  - `shell` {логическое | строка} Если `true`, работает `command` внутри оболочки. Использует `'/bin/sh'` в Unix и `process.env.ComSpec` в Windows. Другая оболочка может быть указана в виде строки. Видеть [Требования к оболочке](#shell-requirements) а также [Оболочка Windows по умолчанию](#default-windows-shell). **Дефолт:** `false` (без оболочки).
  - `windowsVerbatimArguments` {boolean} В Windows не используются кавычки или экранирование аргументов. Игнорируется в Unix. Это установлено на `true` автоматически, когда `shell` указан и является CMD. **Дефолт:** `false`.
  - `windowsHide` {boolean} Скрыть окно консоли подпроцесса, которое обычно создается в системах Windows. **Дефолт:** `false`.
- Возвращает: {Object}
  - `pid` {number} Pid дочернего процесса.
  - `output` {Array} Массив результатов вывода stdio.
  - `stdout` {Buffer | string} Содержимое `output[1]`.
  - `stderr` {Buffer | string} Содержимое `output[2]`.
  - `status` {number | null} Код выхода подпроцесса, или `null` если подпроцесс завершился из-за сигнала.
  - `signal` {string | null} Сигнал, используемый для завершения подпроцесса, или `null` если подпроцесс не завершился из-за сигнала.
  - `error` {Error} Объект ошибки, если дочерний процесс завершился ошибкой или истекло время ожидания.

В `child_process.spawnSync()` метод в целом идентичен [`child_process.spawn()`](#child_processspawncommand-args-options) за исключением того, что функция не вернется, пока дочерний процесс не закроется полностью. Когда истекло время ожидания и `killSignal` отправлено, метод не вернется, пока процесс не завершится полностью. Если процесс перехватывает и обрабатывает `SIGTERM` сигнал и не завершается, родительский процесс будет ждать, пока дочерний процесс не завершится.

**Если `shell` опция включена, не передавайте в эту функцию несанкционированные данные, введенные пользователем. Любой ввод, содержащий метасимволы оболочки, может использоваться для запуска произвольного выполнения команды.**

## Класс: `ChildProcess`

<!-- YAML
added: v2.2.0
-->

- Расширяется: {EventEmitter}

Экземпляры `ChildProcess` представляют порожденные дочерние процессы.

Экземпляры `ChildProcess` не предназначены для непосредственного создания. Скорее используйте [`child_process.spawn()`](#child_processspawncommand-args-options), [`child_process.exec()`](#child_processexeccommand-options-callback), [`child_process.execFile()`](#child_processexecfilefile-args-options-callback), или [`child_process.fork()`](#child_processforkmodulepath-args-options) методы для создания экземпляров `ChildProcess`.

### Событие: `'close'`

<!-- YAML
added: v0.7.7
-->

- `code` {number} Код выхода, если дочерний элемент вышел сам.
- `signal` {строка} Сигнал, по которому был завершен дочерний процесс.

В `'close'` событие генерируется после завершения процесса _а также_ потоки stdio дочернего процесса были закрыты. Это отличается от [`'exit'`](#event-exit) событие, поскольку несколько процессов могут использовать одни и те же потоки stdio. В `'close'` событие всегда будет генерироваться после [`'exit'`](#event-exit) уже был отправлен, или [`'error'`](#event-error) если ребенок не появился.

```js
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.on('close', (code) => {
  console.log(
    `child process close all stdio with code ${code}`
  );
});

ls.on('exit', (code) => {
  console.log(`child process exited with code ${code}`);
});
```

### Событие: `'disconnect'`

<!-- YAML
added: v0.7.2
-->

В `'disconnect'` событие испускается после вызова [`subprocess.disconnect()`](#subprocessdisconnect) метод в родительском процессе или [`process.disconnect()`](process.md#processdisconnect) в дочернем процессе. После отключения больше нельзя отправлять или получать сообщения, и [`subprocess.connected`](#subprocessconnected) собственность `false`.

### Событие: `'error'`

- `err` {Error} Ошибка.

В `'error'` событие генерируется всякий раз, когда:

1.  Процесс не может быть запущен, или
2.  Процесс не может быть остановлен, или
3.  Не удалось отправить сообщение дочернему процессу.

В `'exit'` событие может или не может сработать после того, как произошла ошибка. При прослушивании как `'exit'` а также `'error'` событий, защитите от случайного многократного вызова функций-обработчиков.

Смотрите также [`subprocess.kill()`](#subprocesskillsignal) а также [`subprocess.send()`](#subprocesssendmessage-sendhandle-options-callback).

### Событие: `'exit'`

<!-- YAML
added: v0.1.90
-->

- `code` {number} Код выхода, если дочерний элемент вышел сам.
- `signal` {строка} Сигнал, по которому был завершен дочерний процесс.

В `'exit'` событие генерируется после завершения дочернего процесса. Если процесс завершился, `code` это последний код выхода из процесса, в противном случае `null`. Если процесс завершился из-за получения сигнала, `signal` это строковое имя сигнала, иначе `null`. Один из двух всегда будет не`null`.

Когда `'exit'` событие запускается, потоки stdio дочернего процесса все еще могут быть открыты.

Node.js устанавливает обработчики сигналов для `SIGINT` а также `SIGTERM` и процессы Node.js не будут немедленно завершены из-за получения этих сигналов. Скорее, Node.js выполнит последовательность действий по очистке, а затем повторно вызовет обработанный сигнал.

См. Waitpid (2).

### Событие: `'message'`

<!-- YAML
added: v0.5.9
-->

- `message` {Object} Анализируемый объект JSON или примитивное значение.
- `sendHandle` {Handle} A [`net.Socket`](net.md#class-netsocket) или [`net.Server`](net.md#class-netserver) объект или неопределенный.

В `'message'` событие запускается, когда дочерний процесс использует [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) для отправки сообщений.

Сообщение проходит сериализацию и синтаксический анализ. Полученное сообщение может отличаться от исходного.

Если `serialization` опция была установлена на `'advanced'` используется при порождении дочернего процесса, `message` Аргумент может содержать данные, которые JSON не может представить. Видеть [Расширенная сериализация](#advanced-serialization) Больше подробностей.

### Событие: `'spawn'`

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
-->

В `'spawn'` Событие генерируется после успешного создания дочернего процесса. Если дочерний процесс не запускается успешно, `'spawn'` событие не генерируется и `'error'` вместо этого генерируется событие.

Если испускается, `'spawn'` событие происходит перед всеми другими событиями и до получения каких-либо данных через `stdout` или `stderr`.

В `'spawn'` событие будет срабатывать независимо от того, произошла ли ошибка **в** порожденный процесс. Например, если `bash some-command` успешно нерестится, `'spawn'` событие сработает, хотя `bash` может не появиться `some-command`. Это предостережение также применяется при использовании `{ shell: true }`.

### `subprocess.channel`

<!-- YAML
added: v7.1.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30165
    description: The object no longer accidentally exposes native C++ bindings.
-->

- {Object} Канал, представляющий канал IPC для дочернего процесса.

В `subprocess.channel` Свойство - это ссылка на дочерний канал IPC. Если в настоящее время канал IPC не существует, это свойство `undefined`.

#### `subprocess.channel.ref()`

<!-- YAML
added: v7.1.0
-->

Этот метод заставляет канал IPC поддерживать цикл событий родительского процесса, если `.unref()` был вызван раньше.

#### `subprocess.channel.unref()`

<!-- YAML
added: v7.1.0
-->

Этот метод заставляет канал IPC не поддерживать цикл обработки событий родительского процесса и позволяет ему завершиться, даже когда канал открыт.

### `subprocess.connected`

<!-- YAML
added: v0.7.2
-->

- {boolean} Установить на `false` после `subprocess.disconnect()` называется.

В `subprocess.connected` указывает, можно ли по-прежнему отправлять и получать сообщения от дочернего процесса. Когда `subprocess.connected` является `false`, больше нельзя отправлять или получать сообщения.

### `subprocess.disconnect()`

<!-- YAML
added: v0.7.2
-->

Закрывает канал IPC между родительским и дочерним объектами, позволяя дочернему элементу корректно выйти, если нет других соединений, поддерживающих его работу. После вызова этого метода `subprocess.connected` а также `process.connected` свойства как в родительском, так и в дочернем (соответственно) будут установлены на `false`, и больше нельзя будет передавать сообщения между процессами.

В `'disconnect'` событие будет сгенерировано, если в процессе приема нет сообщений. Чаще всего это срабатывает сразу после звонка `subprocess.disconnect()`.

Когда дочерний процесс является экземпляром Node.js (например, порожден с использованием [`child_process.fork()`](#child_processforkmodulepath-args-options)), `process.disconnect()` Метод может быть вызван в дочернем процессе, чтобы закрыть канал IPC.

### `subprocess.exitCode`

- {целое число}

В `subprocess.exitCode` указывает код выхода дочернего процесса. Если дочерний процесс все еще запущен, поле будет `null`.

### `subprocess.kill([signal])`

<!-- YAML
added: v0.1.90
-->

- `signal` {число | строка}
- Возвращает: {логическое}

В `subprocess.kill()` метод отправляет сигнал дочернему процессу. Если аргумент не указан, процессу будет отправлено сообщение `'SIGTERM'` сигнал. См. Signal (7) для получения списка доступных сигналов. Эта функция возвращает `true` если kill (2) успешно, и `false` иначе.

```js
const { spawn } = require('child_process');
const grep = spawn('grep', ['ssh']);

grep.on('close', (code, signal) => {
  console.log(
    `child process terminated due to receipt of signal ${signal}`
  );
});

// Send SIGHUP to process.
grep.kill('SIGHUP');
```

В [`ChildProcess`](#class-childprocess) объект может излучать [`'error'`](#event-error) событие, если сигнал не может быть доставлен. Отправка сигнала дочернему процессу, который уже завершился, не является ошибкой, но может иметь непредвиденные последствия. В частности, если идентификатор процесса (PID) был переназначен другому процессу, вместо этого сигнал будет доставлен этому процессу, что может привести к неожиданным результатам.

Пока функция вызывается `kill`, сигнал, доставленный дочернему процессу, может фактически не завершить процесс.

Смотрите kill (2) для справки.

В Windows, где сигналы POSIX не существуют, `signal` аргумент будет проигнорирован, и процесс будет прекращен принудительно и внезапно (аналогично `'SIGKILL'`). Видеть [Сигнальные события](process.md#signal-events) Больше подробностей.

В Linux дочерние процессы дочерних процессов не будут завершены при попытке убить их родительский процесс. Это может произойти при запуске нового процесса в оболочке или с использованием `shell` вариант `ChildProcess`:

```js
'use strict';
const { spawn } = require('child_process');

const subprocess = spawn(
  'sh',
  [
    '-c',
    `node -e "setInterval(() => {
      console.log(process.pid, 'is alive')
    }, 500);"`,
  ],
  {
    stdio: ['inherit', 'inherit', 'inherit'],
  }
);

setTimeout(() => {
  subprocess.kill(); // Does not terminate the Node.js process in the shell.
}, 2000);
```

### `subprocess.killed`

<!-- YAML
added: v0.5.10
-->

- {boolean} Установить на `true` после `subprocess.kill()` используется для успешной отправки сигнала дочернему процессу.

В `subprocess.killed` указывает, успешно ли дочерний процесс получил сигнал от `subprocess.kill()`. В `killed` не указывает на то, что дочерний процесс был завершен.

### `subprocess.pid`

<!-- YAML
added: v0.1.90
-->

- {целое | неопределенное}

Возвращает идентификатор процесса (PID) дочернего процесса. Если дочерний процесс не запускается из-за ошибок, то значение равно `undefined` а также `error` испускается.

```js
const { spawn } = require('child_process');
const grep = spawn('grep', ['ssh']);

console.log(`Spawned child pid: ${grep.pid}`);
grep.stdin.end();
```

### `subprocess.ref()`

<!-- YAML
added: v0.7.10
-->

Вызов `subprocess.ref()` после звонка в `subprocess.unref()` восстановит удаленный счетчик ссылок для дочернего процесса, заставляя родительский процесс ждать завершения дочернего процесса, прежде чем выйти из себя.

```js
const { spawn } = require('child_process');

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

### `subprocess.send(message[, sendHandle[, options]][, callback])`

<!-- YAML
added: v0.5.9
changes:
  - version: v5.8.0
    pr-url: https://github.com/nodejs/node/pull/5283
    description: The `options` parameter, and the `keepOpen` option
                 in particular, is supported now.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/3516
    description: This method returns a boolean for flow control now.
  - version: v4.0.0
    pr-url: https://github.com/nodejs/node/pull/2620
    description: The `callback` parameter is supported now.
-->

- `message` {Объект}
- `sendHandle` {Ручка}
- `options` {Object} `options` Аргумент, если он присутствует, представляет собой объект, используемый для параметризации отправки определенных типов дескрипторов. `options` поддерживает следующие свойства:
  - `keepOpen` {boolean} Значение, которое можно использовать при передаче экземпляров `net.Socket`. Когда `true`, сокет остается открытым в процессе отправки. **Дефолт:** `false`.
- `callback` {Функция}
- Возвращает: {логическое}

Когда канал IPC был установлен между родительским и дочерним (т. Е. При использовании [`child_process.fork()`](#child_processforkmodulepath-args-options)), `subprocess.send()` может использоваться для отправки сообщений дочернему процессу. Когда дочерний процесс является экземпляром Node.js, эти сообщения могут быть получены через [`'message'`](process.md#event-message) событие.

Сообщение проходит сериализацию и синтаксический анализ. Полученное сообщение может отличаться от исходного.

Например, в родительском скрипте:

```js
const cp = require('child_process');
const n = cp.fork(`${__dirname}/sub.js`);

n.on('message', (m) => {
  console.log('PARENT got message:', m);
});

// Causes the child to print: CHILD got message: { hello: 'world' }
n.send({ hello: 'world' });
```

А потом дочерний сценарий, `'sub.js'` может выглядеть так:

```js
process.on('message', (m) => {
  console.log('CHILD got message:', m);
});

// Causes the parent to print: PARENT got message: { foo: 'bar', baz: null }
process.send({ foo: 'bar', baz: NaN });
```

Дочерние процессы Node.js будут иметь [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) собственный метод, который позволяет ребенку отправлять сообщения обратно родителю.

Особый случай при отправке `{cmd: 'NODE_foo'}` сообщение. Сообщения, содержащие `NODE_` префикс в `cmd` зарезервированы для использования в ядре Node.js и не будут передаваться в дочернем [`'message'`](process.md#event-message) событие. Скорее, такие сообщения отправляются с использованием `'internalMessage'` событие и потребляются внутри Node.js. Приложениям следует избегать использования таких сообщений или прослушивания `'internalMessage'` события, поскольку это может быть изменено без предварительного уведомления.

Необязательный `sendHandle` аргумент, который может быть передан `subprocess.send()` предназначен для передачи объекта TCP-сервера или сокета дочернему процессу. Потомок получит объект в качестве второго аргумента, переданного функции обратного вызова, зарегистрированной на [`'message'`](process.md#event-message) событие. Любые данные, полученные и буферизованные в сокете, не будут отправлены потомку.

Необязательный `callback` - это функция, которая вызывается после отправки сообщения, но до того, как дочерний элемент может его получить. Функция вызывается с одним аргументом: `null` при успехе или [`Error`](errors.md#class-error) объект при отказе.

Если нет `callback` предусмотрена функция, и сообщение не может быть отправлено, `'error'` событие будет отправлено [`ChildProcess`](#class-childprocess) объект. Это может произойти, например, когда дочерний процесс уже завершился.

`subprocess.send()` вернусь `false` если канал закрыт или когда количество неотправленных сообщений превышает пороговое значение, что делает неразумным отправлять больше. В противном случае метод возвращает `true`. В `callback` функция может использоваться для реализации управления потоком.

#### Пример: отправка серверного объекта

В `sendHandle` аргумент может использоваться, например, для передачи дескриптора объекта TCP-сервера дочернему процессу, как показано в примере ниже:

```js
const subprocess = require('child_process').fork(
  'subprocess.js'
);

// Open up the server object and send the handle.
const server = require('net').createServer();
server.on('connection', (socket) => {
  socket.end('handled by parent');
});
server.listen(1337, () => {
  subprocess.send('server', server);
});
```

Затем ребенок получит объект сервера как:

```js
process.on('message', (m, server) => {
  if (m === 'server') {
    server.on('connection', (socket) => {
      socket.end('handled by child');
    });
  }
});
```

Как только сервер теперь используется совместно родителем и потомком, некоторые соединения могут обрабатываться родителем, а другие - дочерним.

Хотя в приведенном выше примере используется сервер, созданный с использованием `net` модуль `dgram` серверы модулей используют точно такой же рабочий процесс, за исключением прослушивания `'message'` событие вместо `'connection'` и используя `server.bind()` вместо того `server.listen()`. Однако в настоящее время это поддерживается только на платформах Unix.

#### Пример: отправка объекта сокета

Аналогичным образом `sendHandler` аргумент может использоваться для передачи дескриптора сокета дочернему процессу. В приведенном ниже примере создаются два дочерних элемента, каждый из которых обрабатывает соединения с «обычным» или «специальным» приоритетом:

```js
const { fork } = require('child_process');
const normal = fork('subprocess.js', ['normal']);
const special = fork('subprocess.js', ['special']);

// Open up the server and send sockets to child. Use pauseOnConnect to prevent
// the sockets from being read before they are sent to the child process.
const server = require('net').createServer({
  pauseOnConnect: true,
});
server.on('connection', (socket) => {
  // If this is special priority...
  if (socket.remoteAddress === '74.125.127.100') {
    special.send('socket', socket);
    return;
  }
  // This is normal priority.
  normal.send('socket', socket);
});
server.listen(1337);
```

В `subprocess.js` получит дескриптор сокета в качестве второго аргумента, переданного функции обратного вызова события:

```js
process.on('message', (m, socket) => {
  if (m === 'socket') {
    if (socket) {
      // Check that the client socket exists.
      // It is possible for the socket to be closed between the time it is
      // sent and the time it is received in the child process.
      socket.end(
        `Request handled with ${process.argv[2]} priority`
      );
    }
  }
});
```

Не используйте `.maxConnections` на сокете, который был передан подпроцессу. Родитель не может отслеживать, когда сокет уничтожен.

Любой `'message'` обработчики в подпроцессе должны убедиться, что `socket` существует, поскольку соединение могло быть закрыто в течение времени, необходимого для отправки соединения дочернему элементу.

### `subprocess.signalCode`

- {строка | ноль}

В `subprocess.signalCode` указывает на сигнал, полученный дочерним процессом, если таковой имеется, иначе `null`.

### `subprocess.spawnargs`

- {Множество}

В `subprocess.spawnargs` Свойство представляет полный список аргументов командной строки, с которыми был запущен дочерний процесс.

### `subprocess.spawnfile`

- {нить}

В `subprocess.spawnfile` указывает имя исполняемого файла запущенного дочернего процесса.

Для [`child_process.fork()`](#child_processforkmodulepath-args-options), его значение будет равно [`process.execPath`](process.md#processexecpath). Для [`child_process.spawn()`](#child_processspawncommand-args-options), его значением будет имя исполняемого файла. Для [`child_process.exec()`](#child_processexeccommand-options-callback), его значением будет имя оболочки, в которой запущен дочерний процесс.

### `subprocess.stderr`

<!-- YAML
added: v0.1.90
-->

- {stream.Readable}

А `Readable Stream` который представляет дочерний процесс `stderr`.

Если ребенок был порожден с `stdio[2]` установить на что угодно, кроме `'pipe'`, то это будет `null`.

`subprocess.stderr` это псевдоним для `subprocess.stdio[2]`. Оба свойства будут относиться к одному и тому же значению.

В `subprocess.stderr` собственность может быть `null` если не удалось создать дочерний процесс.

### `subprocess.stdin`

<!-- YAML
added: v0.1.90
-->

- {stream.Writable}

А `Writable Stream` который представляет дочерний процесс `stdin`.

Если дочерний процесс ожидает чтения всего своего ввода, дочерний процесс не продолжит работу, пока этот поток не будет закрыт через `end()`.

Если ребенок был порожден с `stdio[0]` установить на что угодно, кроме `'pipe'`, то это будет `null`.

`subprocess.stdin` это псевдоним для `subprocess.stdio[0]`. Оба свойства будут относиться к одному и тому же значению.

В `subprocess.stdin` собственность может быть `undefined` если не удалось создать дочерний процесс.

### `subprocess.stdio`

<!-- YAML
added: v0.7.10
-->

- {Множество}

Редкий массив каналов дочернего процесса, соответствующих позициям в [`stdio`](#optionsstdio) опция передана [`child_process.spawn()`](#child_processspawncommand-args-options) которые были установлены на значение `'pipe'`. `subprocess.stdio[0]`, `subprocess.stdio[1]`, а также `subprocess.stdio[2]` также доступны как `subprocess.stdin`, `subprocess.stdout`, а также `subprocess.stderr`, соответственно.

В следующем примере только дочерний fd `1` (stdout) настроен как канал, поэтому только родительский `subprocess.stdio[1]` является потоком, все остальные значения в массиве равны `null`.

```js
const assert = require('assert');
const fs = require('fs');
const child_process = require('child_process');

const subprocess = child_process.spawn('ls', {
  stdio: [
    0, // Use parent's stdin for child.
    'pipe', // Pipe child's stdout to parent.
    fs.openSync('err.out', 'w'), // Direct child's stderr to a file.
  ],
});

assert.strictEqual(subprocess.stdio[0], null);
assert.strictEqual(subprocess.stdio[0], subprocess.stdin);

assert(subprocess.stdout);
assert.strictEqual(subprocess.stdio[1], subprocess.stdout);

assert.strictEqual(subprocess.stdio[2], null);
assert.strictEqual(subprocess.stdio[2], subprocess.stderr);
```

В `subprocess.stdio` собственность может быть `undefined` если не удалось создать дочерний процесс.

### `subprocess.stdout`

<!-- YAML
added: v0.1.90
-->

- {stream.Readable}

А `Readable Stream` который представляет дочерний процесс `stdout`.

Если ребенок был порожден с `stdio[1]` установить на что угодно, кроме `'pipe'`, то это будет `null`.

`subprocess.stdout` это псевдоним для `subprocess.stdio[1]`. Оба свойства будут относиться к одному и тому же значению.

```js
const { spawn } = require('child_process');

const subprocess = spawn('ls');

subprocess.stdout.on('data', (data) => {
  console.log(`Received chunk ${data}`);
});
```

В `subprocess.stdout` собственность может быть `null` если не удалось создать дочерний процесс.

### `subprocess.unref()`

<!-- YAML
added: v0.7.10
-->

По умолчанию родитель будет ждать выхода отсоединенного дочернего элемента. Чтобы родители не ждали заданного `subprocess` для выхода используйте `subprocess.unref()` метод. Это приведет к тому, что родительский цикл событий не включит дочерний элемент в свой счетчик ссылок, что позволит родителю выйти независимо от дочернего элемента, если между дочерним и родительским элементом не будет установлен канал IPC.

```js
const { spawn } = require('child_process');

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

## `maxBuffer` и Юникод

В `maxBuffer` опция определяет максимальное количество байтов, разрешенное на `stdout` или `stderr`. Если это значение превышено, дочерний процесс завершается. Это влияет на вывод, который включает многобайтовые кодировки символов, такие как UTF-8 или UTF-16. Например, `console.log('中文测试')` отправит 13 байтов в кодировке UTF-8 в `stdout` хотя там всего 4 символа.

## Требования к оболочке

Оболочка должна понимать `-c` выключатель. Если оболочка `'cmd.exe'`, он должен понимать `/d /s /c` переключатели и синтаксический анализ командной строки должны быть совместимы.

## Оболочка Windows по умолчанию

Хотя Microsoft указывает `%COMSPEC%` должен содержать путь к `'cmd.exe'` в корневой среде дочерние процессы не всегда подчиняются одному и тому же требованию. Таким образом, в `child_process` функции, в которых можно создать оболочку, `'cmd.exe'` используется как запасной вариант, если `process.env.ComSpec` недоступен.

## Расширенная сериализация

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

Дочерние процессы поддерживают механизм сериализации для IPC, основанный на [API сериализации `v8` модуль](v8.md#serialization-api), на основе [Структурированный алгоритм клонирования HTML](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). Это, как правило, более мощный и поддерживает больше встроенных типов объектов JavaScript, таких как `BigInt`, `Map` а также `Set`, `ArrayBuffer` а также `TypedArray`, `Buffer`, `Error`, `RegExp` и т.п.

Однако этот формат не является полным набором JSON, и, например, свойства, установленные для объектов таких встроенных типов, не будут передаваться на этапе сериализации. Кроме того, производительность может не быть эквивалентной производительности JSON, в зависимости от структуры передаваемых данных. Поэтому для использования этой функции необходимо выбрать `serialization` возможность `'advanced'` при звонке [`child_process.spawn()`](#child_processspawncommand-args-options) или [`child_process.fork()`](#child_processforkmodulepath-args-options).
