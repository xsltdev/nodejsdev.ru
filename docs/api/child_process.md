---
title: Дочерний процесс
description: Модуль node:child_process позволяет порождать подпроцессы способом, похожим на popen(3), но не идентичным ему
---

# Дочерний процесс

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/child_process.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/child_process.js -->

Модуль `node:child_process` предоставляет возможность порождать подпроцессы способом, который похож, но не идентичен popen(3). В основном эта возможность реализуется функцией [`child_process.spawn()`](#child_processspawncommand-args-options):

=== "CJS"

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

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
    import { once } from 'node:events';
    const ls = spawn('ls', ['-lh', '/usr']);

    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    const [code] = await once(ls, 'close');
    console.log(`child process exited with code ${code}`);
    ```

По умолчанию между родительским процессом Node.js и порождённым подпроцессом устанавливаются каналы для `stdin`, `stdout` и `stderr`. У этих каналов ограниченная (и зависящая от платформы) пропускная способность. Если подпроцесс пишет в stdout больше этого лимита без перехвата вывода, подпроцесс блокируется, ожидая, пока буфер канала примет больше данных. Это совпадает с поведением каналов в оболочке. Используйте опцию `{ stdio: 'ignore' }`, если вывод не будет потребляться.

Поиск команды выполняется с использованием переменной окружения `options.env.PATH`, если в объекте `options` есть `env`. В противном случае используется `process.env.PATH`. Если `options.env` задан без `PATH`, на Unix поиск выполняется по пути по умолчанию `/usr/bin:/bin` (см. руководство вашей ОС по execvpe/execvp), на Windows используется переменная окружения `PATH` текущих процессов.

В Windows переменные окружения не чувствительны к регистру. Node.js лексикографически сортирует ключи `env` и использует первый, который совпадает без учёта регистра. В подпроцесс передаётся только первая (в лексикографическом порядке) запись. Это может вызывать проблемы в Windows при передаче в опцию `env` объектов с несколькими вариантами одного и того же ключа, например `PATH` и `Path`.

Метод [`child_process.spawn()`](#child_processspawncommand-args-options) порождает дочерний процесс асинхронно, не блокируя цикл событий Node.js. Функция [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options) предоставляет эквивалентную функциональность синхронно, блокируя цикл событий, пока порождённый процесс не завершится или не будет принудительно остановлен.

Для удобства модуль `node:child_process` предоставляет несколько синхронных и асинхронных альтернатив [`child_process.spawn()`](#child_processspawncommand-args-options) и [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options). Каждая из этих альтернатив реализована поверх [`child_process.spawn()`](#child_processspawncommand-args-options) или [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options).

-   [`child_process.exec()`](#child_processexeccommand-options-callback): порождает оболочку и выполняет команду внутри неё, передавая `stdout` и `stderr` в функцию обратного вызова по завершении.
-   [`child_process.execFile()`](#child_processexecfilefile-args-options-callback): похож на [`child_process.exec()`](#child_processexeccommand-options-callback), но по умолчанию запускает команду напрямую, без предварительного порождения оболочки.
-   [`child_process.fork()`](#child_processforkmodulepath-args-options): порождает новый процесс Node.js и вызывает указанный модуль с установленным каналом IPC, позволяющим обмениваться сообщениями между родителем и дочерним процессом.
-   [`child_process.execSync()`](#child_processexecsynccommand-options): синхронная версия [`child_process.exec()`](#child_processexeccommand-options-callback), блокирующая цикл событий Node.js.
-   [`child_process.execFileSync()`](#child_processexecfilesyncfile-args-options): синхронная версия [`child_process.execFile()`](#child_processexecfilefile-args-options-callback), блокирующая цикл событий Node.js.

В некоторых сценариях, например при автоматизации сценариев оболочки, [синхронные аналоги](#synchronous-process-creation) могут быть удобнее. Однако во многих случаях синхронные методы существенно снижают производительность из‑за остановки цикла событий на время завершения порождённых процессов.

## Асинхронное создание процессов {#asynchronous-process-creation}

Методы [`child_process.spawn()`](#child_processspawncommand-args-options), [`child_process.fork()`](#child_processforkmodulepath-args-options), [`child_process.exec()`](#child_processexeccommand-options-callback) и [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) следуют идиоматической схеме асинхронного программирования, характерной для других API Node.js.

Каждый из методов возвращает экземпляр [`ChildProcess`](#class-childprocess). Эти объекты реализуют API [`EventEmitter`](events.md#class-eventemitter) в Node.js и позволяют родительскому процессу регистрировать обработчики, вызываемые при определённых событиях в жизненном цикле дочернего процесса.

Методы [`child_process.exec()`](#child_processexeccommand-options-callback) и [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) дополнительно позволяют указать необязательную функцию `callback`, вызываемую при завершении дочернего процесса.

### Запуск файлов `.bat` и `.cmd` в Windows

Важность различия между [`child_process.exec()`](#child_processexeccommand-options-callback) и [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) может зависеть от платформы. В Unix-совместимых ОС (Unix, Linux, macOS) [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) может быть эффективнее, так как по умолчанию не порождает оболочку. В Windows файлы `.bat` и `.cmd` не исполняются сами по себе без терминала и поэтому не могут быть запущены через [`child_process.execFile()`](#child_processexecfilefile-args-options-callback). В Windows файлы `.bat` и `.cmd` можно вызвать так:

-   используя [`child_process.spawn()`](#child_processspawncommand-args-options) с установленной опцией `shell` (не рекомендуется, см. [DEP0190](deprecations.md#DEP0190)), или
-   используя [`child_process.exec()`](#child_processexeccommand-options-callback), или
-   запустив `cmd.exe` и передав файл `.bat` или `.cmd` аргументом (как внутренне делает [`child_process.exec()`](#child_processexeccommand-options-callback)).

В любом случае, если имя файла скрипта содержит пробелы, его нужно заключить в кавычки.

=== "CJS"

    ```js
    const { exec, spawn } = require('node:child_process');

    exec('my.bat', (err, stdout, stderr) => { /* ... */ });

    // Или прямой запуск cmd.exe:
    const bat = spawn('cmd.exe', ['/c', 'my.bat']);

    // Если имя файла скрипта содержит пробелы, его нужно заключить в кавычки
    exec('"my script.cmd" a b', (err, stdout, stderr) => { /* ... */ });
    ```

=== "MJS"

    ```js
    import { exec, spawn } from 'node:child_process';

    exec('my.bat', (err, stdout, stderr) => { /* ... */ });

    // Или прямой запуск cmd.exe:
    const bat = spawn('cmd.exe', ['/c', 'my.bat']);

    // Если имя файла скрипта содержит пробелы, его нужно заключить в кавычки
    exec('"my script.cmd" a b', (err, stdout, stderr) => { /* ... */ });
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

Добавлено в: v0.1.90

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.4.0, v14.18.0 | Опция `cwd` может быть объектом `URL` WHATWG, использующим протокол `file:`. |
    | v15.4.0 | Добавлена ​​поддержка AbortSignal. |
    | v8.8.0 | Опция «windowsHide» теперь поддерживается. |

-   `command` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Команда для выполнения с аргументами, разделёнными пробелами.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса. **По умолчанию:** `process.cwd()`.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары «ключ–значение» окружения. **По умолчанию:** `process.env`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
    -   `shell` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Оболочка для выполнения команды. См. [требования к оболочке](#shell-requirements) и [оболочку Windows по умолчанию](#default-windows-shell). **По умолчанию:** `'/bin/sh'` на Unix, `process.env.ComSpec` в Windows.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать дочерний процесс с помощью `AbortSignal`.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
    -   `maxBuffer` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный объём данных в байтах, допустимый в stdout или stderr. При превышении дочерний процесс завершается, вывод обрезается. См. оговорку в [разделе о `maxBuffer` и Unicode](#maxbuffer-and-unicode). **По умолчанию:** `1024 * 1024`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `'SIGTERM'`
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор пользователя процесса (см. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор группы процесса (см. setgid(2)).
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть консольное окно подпроцесса, которое обычно создаётся в Windows. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызывается с выводом при завершении процесса.
    -   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stdout` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
    -   `stderr` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
-   Возвращает: [`<ChildProcess>`](child_process.md#class-childprocess)

Порождает оболочку и выполняет в ней `command`, буферизуя сгенерированный вывод. Строка `command`, передаваемая в `exec`, обрабатывается оболочкой напрямую; специальные символы (зависят от [оболочки](https://en.wikipedia.org/wiki/List_of_command-line_interpreters)) нужно учитывать соответствующим образом:

=== "CJS"

    ```js
    const { exec } = require('node:child_process');

    exec('"/path/to/test file/test.sh" arg1 arg2');
    // Двойные кавычки, чтобы пробел в пути не воспринимался как
    // разделитель нескольких аргументов.

    exec('echo "The \\$HOME variable is $HOME"');
    // Переменная $HOME экранирована в первом случае, но не во втором.
    ```

=== "MJS"

    ```js
    import { exec } from 'node:child_process';

    exec('"/path/to/test file/test.sh" arg1 arg2');
    // Двойные кавычки, чтобы пробел в пути не воспринимался как
    // разделитель нескольких аргументов.

    exec('echo "The \\$HOME variable is $HOME"');
    // Переменная $HOME экранирована в первом случае, но не во втором.
    ```

**Никогда не передавайте в эту функцию несанированный пользовательский ввод. Любой ввод с метасимволами оболочки может привести к выполнению произвольной команды.**

Если указана функция `callback`, она вызывается с аргументами `(error, stdout, stderr)`. При успехе `error` будет `null`. При ошибке `error` будет экземпляром [`Error`](errors.md#class-error). Свойство `error.code` — код выхода процесса. По соглашению любой код выхода, отличный от `0`, означает ошибку. `error.signal` — сигнал, которым завершили процесс.

Аргументы `stdout` и `stderr`, передаваемые в callback, содержат вывод stdout и stderr дочернего процесса. По умолчанию Node.js декодирует вывод как UTF-8 и передаёт строки в callback. Опция `encoding` задаёт кодировку для декодирования stdout и stderr. Если `encoding` равен `'buffer'` или нераспознанной кодировке, в callback передаются объекты `Buffer`.

=== "CJS"

    ```js
    const { exec } = require('node:child_process');
    exec('cat *.js missing_file | wc -l', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
    ```

=== "MJS"

    ```js
    import { exec } from 'node:child_process';
    exec('cat *.js missing_file | wc -l', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
    ```

Если `timeout` больше `0`, родительский процесс отправит сигнал, заданный свойством `killSignal` (по умолчанию `'SIGTERM'`), если дочерний процесс работает дольше `timeout` миллисекунд.

В отличие от системного вызова exec(3) POSIX, `child_process.exec()` не заменяет текущий процесс и выполняет команду через оболочку.

Если метод вызывается в варианте с [`util.promisify()`](util.md#utilpromisifyoriginal), он возвращает `Promise` на объект с полями `stdout` и `stderr`. Экземпляр `ChildProcess` прикреплён к `Promise` как свойство `child`. При ошибке (включая ненулевой код выхода) промис отклоняется с тем же объектом `error`, что и в callback, плюс дополнительные свойства `stdout` и `stderr`.

=== "CJS"

    ```js
    const util = require('node:util');
    const exec = util.promisify(require('node:child_process').exec);

    async function lsExample() {
      const { stdout, stderr } = await exec('ls');
      console.log('stdout:', stdout);
      console.error('stderr:', stderr);
    }
    lsExample();
    ```

=== "MJS"

    ```js
    import { promisify } from 'node:util';
    import child_process from 'node:child_process';
    const exec = promisify(child_process.exec);

    async function lsExample() {
      const { stdout, stderr } = await exec('ls');
      console.log('stdout:', stdout);
      console.error('stderr:', stderr);
    }
    lsExample();
    ```

Если включена опция `signal`, вызов `.abort()` на соответствующем `AbortController` аналогичен вызову `.kill()` у дочернего процесса, но в callback передаётся `AbortError`:

=== "CJS"

    ```js
    const { exec } = require('node:child_process');
    const controller = new AbortController();
    const { signal } = controller;
    const child = exec('grep ssh', { signal }, (error) => {
      console.error(error); // AbortError
    });
    controller.abort();
    ```

=== "MJS"

    ```js
    import { exec } from 'node:child_process';
    const controller = new AbortController();
    const { signal } = controller;
    const child = exec('grep ssh', { signal }, (error) => {
      console.error(error); // AbortError
    });
    controller.abort();
    ```

### `child_process.execFile(file[, args][, options][, callback])`

<!-- YAML
added: v0.1.91
changes:
  - version:
      - v23.11.0
      - v22.15.0
    pr-url: https://github.com/nodejs/node/pull/57389
    description: Passing `args` when `shell` is set to `true` is deprecated.
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

Добавлено в: v0.1.91

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Передача аргументов, когда для параметра Shell установлено значение true, устарела. |
    | v16.4.0, v14.18.0 | Опция `cwd` может быть объектом `URL` WHATWG, использующим протокол `file:`. |
    | v15.4.0, v14.17.0 | Добавлена ​​поддержка AbortSignal. |
    | v8.8.0 | Опция «windowsHide» теперь поддерживается. |

-   `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя или путь исполняемого файла.
-   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары «ключ–значение» окружения. **По умолчанию:** `process.env`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
    -   `maxBuffer` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный объём данных в байтах для stdout или stderr. При превышении дочерний процесс завершается, вывод обрезается. См. оговорку в [разделе о `maxBuffer` и Unicode](#maxbuffer-and-unicode). **По умолчанию:** `1024 * 1024`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `'SIGTERM'`
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор пользователя процесса (см. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор группы процесса (см. setgid(2)).
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть консольное окно подпроцесса в Windows. **По умолчанию:** `false`.
    -   `windowsVerbatimArguments` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) В Windows аргументы не экранируются и не заключаются в кавычки. На Unix игнорируется. **По умолчанию:** `false`.
    -   `shell` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `true`, запускает `command` в оболочке. На Unix — `'/bin/sh'`, в Windows — `process.env.ComSpec`. Можно указать другую оболочку строкой. См. [требования к оболочке](#shell-requirements) и [оболочку Windows по умолчанию](#default-windows-shell). **По умолчанию:** `false` (без оболочки).
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать дочерний процесс через `AbortSignal`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызывается с выводом при завершении процесса.
    -   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stdout` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
    -   `stderr` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
-   Возвращает: [`<ChildProcess>`](child_process.md#class-childprocess)

Функция `child_process.execFile()` похожа на [`child_process.exec()`](#child_processexeccommand-options-callback), но по умолчанию не порождает оболочку: указанный исполняемый `file` запускается напрямую как новый процесс, что немного эффективнее, чем [`child_process.exec()`](#child_processexeccommand-options-callback).

Поддерживаются те же опции, что и у [`child_process.exec()`](#child_processexeccommand-options-callback). Поскольку оболочка не запускается, перенаправление ввода-вывода и подстановка имён файлов (globbing) недоступны.

=== "CJS"

    ```js
    const { execFile } = require('node:child_process');
    const child = execFile('node', ['--version'], (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      console.log(stdout);
    });
    ```

=== "MJS"

    ```js
    import { execFile } from 'node:child_process';
    const child = execFile('node', ['--version'], (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      console.log(stdout);
    });
    ```

Аргументы `stdout` и `stderr` в callback содержат вывод дочернего процесса. По умолчанию Node.js декодирует вывод как UTF-8 и передаёт строки. Опция `encoding` задаёт кодировку для декодирования stdout и stderr. Если `encoding` равен `'buffer'` или нераспознанной кодировке, в callback передаются объекты `Buffer`.

В варианте с [`util.promisify()`](util.md#utilpromisifyoriginal) метод возвращает `Promise` на объект с полями `stdout` и `stderr`; экземпляр `ChildProcess` доступен как `child` у промиса. При ошибке (включая ненулевой код выхода) промис отклоняется с тем же `error`, что в callback, плюс свойства `stdout` и `stderr`.

=== "CJS"

    ```js
    const util = require('node:util');
    const execFile = util.promisify(require('node:child_process').execFile);
    async function getVersion() {
      const { stdout } = await execFile('node', ['--version']);
      console.log(stdout);
    }
    getVersion();
    ```

=== "MJS"

    ```js
    import { promisify } from 'node:util';
    import child_process from 'node:child_process';
    const execFile = promisify(child_process.execFile);
    async function getVersion() {
      const { stdout } = await execFile('node', ['--version']);
      console.log(stdout);
    }
    getVersion();
    ```

**Если включена опция `shell`, не передавайте в эту функцию несанированный пользовательский ввод. Метасимволы оболочки могут привести к выполнению произвольной команды.**

Если включена опция `signal`, вызов `.abort()` на соответствующем `AbortController` аналогичен `.kill()` у дочернего процесса, но в callback передаётся `AbortError`:

=== "CJS"

    ```js
    const { execFile } = require('node:child_process');
    const controller = new AbortController();
    const { signal } = controller;
    const child = execFile('node', ['--version'], { signal }, (error) => {
      console.error(error); // AbortError
    });
    controller.abort();
    ```

=== "MJS"

    ```js
    import { execFile } from 'node:child_process';
    const controller = new AbortController();
    const { signal } = controller;
    const child = execFile('node', ['--version'], { signal }, (error) => {
      console.error(error); // AbortError
    });
    controller.abort();
    ```

### `child_process.fork(modulePath[, args][, options])`

<!-- YAML
added: v0.5.0
changes:
  - version:
      - v17.4.0
      - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/41225
    description: The `modulePath` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
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

Добавлено в: v0.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.4.0, v16.14.0 | Параметр modulePath может быть объектом URL WHATWG, использующим протокол file:. |
    | v16.4.0, v14.18.0 | Опция `cwd` может быть объектом `URL` WHATWG, использующим протокол `file:`. |
    | v15.13.0, v14.18.0 | был добавлен таймаут. |
    | v15.11.0, v14.18.0 | Был добавлен killSignal для AbortSignal. |
    | v15.6.0, v14.17.0 | Добавлена ​​поддержка AbortSignal. |
    | v13.2.0, v12.16.0 | Опция сериализации теперь поддерживается. |
    | v8.0.0 | Опция `stdio` теперь может быть строкой. |
    | v6.4.0 | Опция `stdio` теперь поддерживается. |

-   `modulePath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Модуль для запуска в дочернем процессе.
-   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `detached` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Подготовить дочерний процесс к работе независимо от родителя. Поведение зависит от платформы (см. [`options.detached`](#optionsdetached)).
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары «ключ–значение» окружения. **По умолчанию:** `process.env`.
    -   `execPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Исполняемый файл для создания дочернего процесса.
    -   `execArgv` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Аргументы, передаваемые исполняемому файлу. **По умолчанию:** `process.execArgv`.
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор группы процесса (см. setgid(2)).
    -   `serialization` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Вид сериализации сообщений между процессами: `'json'` или `'advanced'`. Подробнее — [расширенная сериализация](#advanced-serialization). **По умолчанию:** `'json'`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет закрыть дочерний процесс через `AbortSignal`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сигнал при завершении по таймауту или abort. **По умолчанию:** `'SIGTERM'`.
    -   `silent` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, stdin, stdout и stderr дочернего процесса направляются в родитель; иначе наследуются от родителя — см. варианты `'pipe'` и `'inherit'` у [`stdio`](#optionsstdio) в [`child_process.spawn()`](#child_processspawncommand-args-options). **По умолчанию:** `false`.
    -   `stdio` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [`stdio`](#optionsstdio) у [`child_process.spawn()`](#child_processspawncommand-args-options). При указании этой опции она перекрывает `silent`. В массиве должен быть ровно один элемент `'ipc'`, иначе будет ошибка. Например `[0, 1, 2, 'ipc']`.
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор пользователя процесса (см. setuid(2)).
    -   `windowsVerbatimArguments` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) В Windows аргументы не экранируются. На Unix игнорируется. **По умолчанию:** `false`.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное время работы процесса в миллисекундах. **По умолчанию:** `undefined`.
-   Возвращает: [`<ChildProcess>`](child_process.md#class-childprocess)

Метод `child_process.fork()` — частный случай [`child_process.spawn()`](#child_processspawncommand-args-options) для запуска новых процессов Node.js. Как и [`child_process.spawn()`](#child_processspawncommand-args-options), возвращает [`ChildProcess`](#class-childprocess) с дополнительным встроенным каналом обмена сообщениями между родителем и потомком. Подробнее — [`subprocess.send()`](#subprocesssendmessage-sendhandle-options-callback).

Порождённые процессы Node.js независимы от родителя, кроме установленного канала IPC. У каждого процесса своя память и свой экземпляр V8. Из‑за накладных расходов не рекомендуется порождать очень много дочерних процессов Node.js.

По умолчанию `child_process.fork()` запускает Node.js с [`process.execPath`](process.md#processexecpath) родителя. Свойство `execPath` в `options` задаёт другой путь к исполняемому файлу.

Процессы Node.js с пользовательским `execPath` обмениваются с родителем через дескриптор файла (fd), указанный в дочернем процессе переменной окружения `NODE_CHANNEL_FD`.

В отличие от системного вызова fork(2) POSIX, `child_process.fork()` не клонирует текущий процесс.

Опция `shell` из [`child_process.spawn()`](#child_processspawncommand-args-options) для `child_process.fork()` не поддерживается и игнорируется, если задана.

Если включена опция `signal`, вызов `.abort()` на соответствующем `AbortController` аналогичен `.kill()` у дочернего процесса, но в callback передаётся `AbortError`:

=== "CJS"

    ```js
    const { fork } = require('node:child_process');
    const process = require('node:process');

    if (process.argv[2] === 'child') {
      setTimeout(() => {
        console.log(`Hello from ${process.argv[2]}!`);
      }, 1_000);
    } else {
      const controller = new AbortController();
      const { signal } = controller;
      const child = fork(__filename, ['child'], { signal });
      child.on('error', (err) => {
        // Будет вызвано с err типа AbortError при abort контроллера
      });
      controller.abort(); // Останавливает дочерний процесс
    }
    ```

=== "MJS"

    ```js
    import { fork } from 'node:child_process';
    import process from 'node:process';

    if (process.argv[2] === 'child') {
      setTimeout(() => {
        console.log(`Hello from ${process.argv[2]}!`);
      }, 1_000);
    } else {
      const controller = new AbortController();
      const { signal } = controller;
      const child = fork(import.meta.url, ['child'], { signal });
      child.on('error', (err) => {
        // Будет вызвано с err типа AbortError при abort контроллера
      });
      controller.abort(); // Останавливает дочерний процесс
    }
    ```

### `child_process.spawn(command[, args][, options])`

<!-- YAML
added: v0.1.90
changes:
  - version:
      - v23.11.0
      - v22.15.0
    pr-url: https://github.com/nodejs/node/pull/57389
    description: Passing `args` when `shell` is set to `true` is deprecated.
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

Добавлено в: v0.1.90

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Передача аргументов, когда для параметра Shell установлено значение true, устарела. |
    | v16.4.0, v14.18.0 | Опция `cwd` может быть объектом `URL` WHATWG, использующим протокол `file:`. |
    | v15.13.0, v14.18.0 | был добавлен таймаут. |
    | v15.11.0, v14.18.0 | Был добавлен killSignal для AbortSignal. |
    | v15.5.0, v14.17.0 | Добавлена ​​поддержка AbortSignal. |
    | v13.2.0, v12.16.0 | Опция сериализации теперь поддерживается. |
    | v8.8.0 | Опция «windowsHide» теперь поддерживается. |
    | v6.4.0 | Опция `argv0` теперь поддерживается. |
    | v5.7.0 | Опция `shell` теперь поддерживается. |

-   `command` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Команда для запуска.
-   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары «ключ–значение» окружения. **По умолчанию:** `process.env`.
    -   `argv0` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Явно задаёт `argv[0]` для дочернего процесса; если не указано — используется `command`.
    -   `stdio` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Конфигурация stdio дочернего процесса (см. [`options.stdio`](#optionsstdio)).
    -   `detached` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Подготовить дочерний процесс к работе независимо от родителя. Поведение зависит от платформы (см. [`options.detached`](#optionsdetached)).
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор пользователя процесса (см. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор группы процесса (см. setgid(2)).
    -   `serialization` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Вид сериализации сообщений: `'json'` или `'advanced'`. Подробнее — [расширенная сериализация](#advanced-serialization). **По умолчанию:** `'json'`.
    -   `shell` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `true`, запускает `command` в оболочке. На Unix — `'/bin/sh'`, в Windows — `process.env.ComSpec`. Можно указать другую оболочку. См. [требования к оболочке](#shell-requirements) и [оболочку Windows по умолчанию](#default-windows-shell). **По умолчанию:** `false` (без оболочки).
    -   `windowsVerbatimArguments` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) В Windows аргументы не экранируются. На Unix игнорируется. Автоматически `true`, если задан `shell` и это CMD. **По умолчанию:** `false`.
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть консольное окно подпроцесса в Windows. **По умолчанию:** `false`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать дочерний процесс через `AbortSignal`.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное время работы процесса в миллисекундах. **По умолчанию:** `undefined`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сигнал при завершении по таймауту или abort. **По умолчанию:** `'SIGTERM'`.
-   Возвращает: [`<ChildProcess>`](child_process.md#class-childprocess)

Метод `child_process.spawn()` запускает новый процесс с командой `command` и аргументами командной строки в `args`. Если `args` опущен, по умолчанию используется пустой массив.

**Если включена опция `shell`, не передавайте несанированный пользовательский ввод. Метасимволы оболочки могут привести к выполнению произвольной команды.**

Третий аргумент задаёт дополнительные опции; значения по умолчанию:

```js
const defaults = {
    cwd: undefined,
    env: process.env,
};
```

`cwd` задаёт рабочий каталог, из которого запускается процесс. Если не указан, наследуется текущий рабочий каталог. Если путь не существует, дочерний процесс генерирует ошибку `ENOENT` и сразу завершается. `ENOENT` также возникает, если команда не найдена.

`env` задаёт переменные окружения, видимые новому процессу; по умолчанию — [`process.env`](process.md#processenv).

Значения `undefined` в `env` игнорируются.

Пример запуска `ls -lh /usr` с перехватом `stdout`, `stderr` и кода выхода:

=== "CJS"

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

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
    import { once } from 'node:events';
    const ls = spawn('ls', ['-lh', '/usr']);

    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    const [code] = await once(ls, 'close');
    console.log(`child process exited with code ${code}`);
    ```

Пример: обходной способ выполнить `ps ax | grep ssh`

=== "CJS"

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
        console.log(`grep process exited with code ${code}`);
      }
    });
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
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

Пример проверки неудачного `spawn`:

=== "CJS"

    ```js
    const { spawn } = require('node:child_process');
    const subprocess = spawn('bad_command');

    subprocess.on('error', (err) => {
      console.error('Не удалось запустить подпроцесс.');
    });
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
    const subprocess = spawn('bad_command');

    subprocess.on('error', (err) => {
      console.error('Не удалось запустить подпроцесс.');
    });
    ```

На некоторых платформах (macOS, Linux) заголовок процесса берётся из `argv[0]`, на других (Windows, SunOS) — из `command`.

При старте Node.js перезаписывает `argv[0]` значением `process.execPath`, поэтому `process.argv[0]` в дочернем процессе Node.js не совпадает с параметром `argv0`, переданным в `spawn` из родителя. Используйте свойство `process.argv0`.

Если включена опция `signal`, вызов `.abort()` на соответствующем `AbortController` аналогичен `.kill()` у дочернего процесса, но в обработчике будет `AbortError`:

=== "CJS"

    ```js
    const { spawn } = require('node:child_process');
    const controller = new AbortController();
    const { signal } = controller;
    const grep = spawn('grep', ['ssh'], { signal });
    grep.on('error', (err) => {
      // AbortError, если контроллер вызвал abort
    });
    controller.abort(); // Останавливает дочерний процесс
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
    const controller = new AbortController();
    const { signal } = controller;
    const grep = spawn('grep', ['ssh'], { signal });
    grep.on('error', (err) => {
      // AbortError, если контроллер вызвал abort
    });
    controller.abort(); // Останавливает дочерний процесс
    ```

#### `options.detached`

<!-- YAML
added: v0.7.10
-->

В Windows установка `options.detached` в `true` позволяет дочернему процессу продолжать работу после выхода родителя. У дочернего процесса будет своё консольное окно. Для данного дочернего процесса это нельзя отключить.

На не-Windows платформах при `options.detached: true` дочерний процесс становится лидером новой группы и сессии. Дочерние процессы могут продолжать работу после выхода родителя независимо от detached. Подробнее см. setsid(2).

По умолчанию родитель ждёт завершения отсоединённого дочернего процесса. Чтобы родитель не ждал завершения `subprocess`, вызовите `subprocess.unref()`: цикл событий родителя перестанет учитывать дочерний процесс в счётчике ссылок, и родитель может завершиться независимо от потомка, если нет установленного IPC между родителем и дочерним процессом.

При запуске долгоживущего процесса с `detached` он не останется в фоне после выхода родителя, кроме случая, когда задана конфигурация `stdio`, не связанная с родителем. Если stdio родителя наследуется, дочерний процесс остаётся привязанным к управляющему терминалу.

Пример долгоживущего процесса: detached и игнорирование stdio родителя, чтобы завершение родителя не удерживало потомка:

=== "CJS"

    ```js
    const { spawn } = require('node:child_process');
    const process = require('node:process');

    const subprocess = spawn(process.argv[0], ['child_program.js'], {
      detached: true,
      stdio: 'ignore',
    });

    subprocess.unref();
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
    import process from 'node:process';

    const subprocess = spawn(process.argv[0], ['child_program.js'], {
      detached: true,
      stdio: 'ignore',
    });

    subprocess.unref();
    ```

Также можно перенаправить вывод дочернего процесса в файлы:

=== "CJS"

    ```js
    const { openSync } = require('node:fs');
    const { spawn } = require('node:child_process');
    const out = openSync('./out.log', 'a');
    const err = openSync('./out.log', 'a');

    const subprocess = spawn('prg', [], {
      detached: true,
      stdio: [ 'ignore', out, err ],
    });

    subprocess.unref();
    ```

=== "MJS"

    ```js
    import { openSync } from 'node:fs';
    import { spawn } from 'node:child_process';
    const out = openSync('./out.log', 'a');
    const err = openSync('./out.log', 'a');

    const subprocess = spawn('prg', [], {
      detached: true,
      stdio: [ 'ignore', out, err ],
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

Добавлено в: v0.7.10

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.6.0, v14.18.0 | Добавлен флаг stdio `overlapped`. |
    | v3.3.1 | Значение `0` теперь принимается как дескриптор файла. |

Опция `options.stdio` задаёт каналы между родителем и дочерним процессом. По умолчанию stdin, stdout и stderr дочернего процесса связаны с потоками [`subprocess.stdin`](#subprocessstdin), [`subprocess.stdout`](#subprocessstdout) и [`subprocess.stderr`](#subprocessstderr) на объекте [`ChildProcess`](#class-childprocess). Это эквивалентно `options.stdio` равному `['pipe', 'pipe', 'pipe']`.

Для удобства `options.stdio` может быть одной из строк:

-   `'pipe'`: эквивалент `['pipe', 'pipe', 'pipe']` (по умолчанию)
-   `'overlapped'`: эквивалент `['overlapped', 'overlapped', 'overlapped']`
-   `'ignore'`: эквивалент `['ignore', 'ignore', 'ignore']`
-   `'inherit'`: эквивалент `['inherit', 'inherit', 'inherit']` или `[0, 1, 2]`

Иначе `options.stdio` — массив: индекс соответствует fd в дочернем процессе. Fd 0, 1 и 2 — stdin, stdout и stderr; дополнительные fd создают ещё каналы. Значение в ячейке — одно из следующих:

1.  `'pipe'`: канал между дочерним и родительским процессом. Со стороны родителя доступен как [`subprocess.stdio[fd]`](#subprocessstdio). Для fd 0, 1 и 2 также доступны [`subprocess.stdin`](#subprocessstdin), [`subprocess.stdout`](#subprocessstdout) и [`subprocess.stderr`](#subprocessstderr). Это не настоящие каналы Unix, дочерний процесс не может обращаться к ним через дескрипторы вроде `/dev/fd/2` или `/dev/stdout`.
2.  `'overlapped'`: как `'pipe'`, но на дескрипторе установлен флаг `FILE_FLAG_OVERLAPPED` (нужно для асинхронного ввода-вывода у stdio в Windows). Подробнее — в [документации Microsoft](https://docs.microsoft.com/en-us/windows/win32/fileio/synchronous-and-asynchronous-i-o). На не-Windows совпадает с `'pipe'`.
3.  `'ipc'`: канал IPC для сообщений и передачи дескрипторов файлов. У [`ChildProcess`](#class-childprocess) не больше одного stdio с `'ipc'`. Включает [`subprocess.send()`](#subprocesssendmessage-sendhandle-options-callback). Если потомок — Node.js, доступны [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) и [`process.disconnect()`](process.md#processdisconnect), события [`'disconnect'`](process.md#event-disconnect) и [`'message'`](process.md#event-message) в дочернем процессе.

    Обращение к fd IPC иначе как через [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) или IPC с не-Node.js процессом не поддерживается.

4.  `'ignore'`: Node.js игнорирует этот fd у потомка. Fd 0–2 всё равно открываются; при `'ignore'` для fd подставляется `/dev/null`.
5.  `'inherit'`: проброс соответствующего stdio родителя. В первых трёх позициях — `process.stdin`, `process.stdout`, `process.stderr`; в остальных — как `'ignore'`.
6.  Объект [Stream](stream.md#stream): общий readable или writable поток (tty, файл, сокет, pipe). Нижележащий дескриптор дублируется в дочернем процессе на соответствующий индекс в `stdio`. У потока должен быть дескриптор (у файловых — после события `'open'`). **Замечание:** технически можно передать `stdin` как writable или stdout/stderr как readable, но это не рекомендуется: неверный тип потока даёт непредсказуемые ошибки и пропуск колбэков. `stdin` должен быть читаемым с точки зрения ожидаемого направления данных, stdout/stderr — записываемым.
7.  Положительное целое: дескриптор файла, открытый в родителе; разделяется с потомком как у [Stream](stream.md#stream). Сокеты в Windows передавать нельзя.
8.  `null`, `undefined`: значение по умолчанию. Для fd 0–2 создаётся pipe; для fd ≥ 3 по умолчанию `'ignore'`.

=== "CJS"

    ```js
    const { spawn } = require('node:child_process');
    const process = require('node:process');

    // Потомок использует stdio родителя.
    spawn('prg', [], { stdio: 'inherit' });

    // Только stderr общий с родителем.
    spawn('prg', [], { stdio: ['pipe', 'pipe', process.stderr] });

    // Дополнительный fd=4 для интерфейса в стиле startd.
    spawn('prg', [], { stdio: ['pipe', null, null, null, 'pipe'] });
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
    import process from 'node:process';

    // Потомок использует stdio родителя.
    spawn('prg', [], { stdio: 'inherit' });

    // Только stderr общий с родителем.
    spawn('prg', [], { stdio: ['pipe', 'pipe', process.stderr] });

    // Дополнительный fd=4 для интерфейса в стиле startd.
    spawn('prg', [], { stdio: ['pipe', null, null, null, 'pipe'] });
    ```

_Если между процессами установлен канал IPC и потомок — экземпляр Node.js, канал IPC запускается с `unref()`, пока в потомке не зарегистрирован обработчик [`'disconnect'`](process.md#event-disconnect) или [`'message'`](process.md#event-message). Тогда процесс может завершиться, не удерживаясь открытым IPC._ См. также [`child_process.exec()`](#child_processexeccommand-options-callback) и [`child_process.fork()`](#child_processforkmodulepath-args-options).

## Синхронное создание процессов {#synchronous-process-creation}

Методы [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options), [`child_process.execSync()`](#child_processexecsynccommand-options) и [`child_process.execFileSync()`](#child_processexecfilesyncfile-args-options) выполняются синхронно и блокируют цикл событий Node.js до завершения порождённого процесса.

Такие блокирующие вызовы удобны для сценариев общего назначения и для загрузки или обработки конфигурации при старте приложения.

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

Добавлено в: v0.11.12

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.4.0, v14.18.0 | Опция `cwd` может быть объектом `URL` WHATWG, использующим протокол `file:`. |
    | v10.10.0 | Опцией input теперь может быть любой TypedArray или DataView. |
    | v8.8.0 | Опция «windowsHide» теперь поддерживается. |
    | v8.0.0 | Опцией input теперь может быть Uint8Array. |
    | v6.2.1, v4.5.0 | Опция `encoding` теперь может быть явно установлена ​​на `buffer`. |

-   `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя или путь исполняемого файла.
-   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Данные для stdin порождённого процесса. Если `stdio[0]` равен `'pipe'`, это значение перекрывает `stdio[0]`.
    -   `stdio` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Конфигурация stdio дочернего процесса. См. [`stdio`](#optionsstdio) у [`child_process.spawn()`](#child_processspawncommand-args-options). По умолчанию `stderr` идёт в stderr родителя, пока не задано иное `stdio`. **По умолчанию:** `'pipe'`.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары «ключ–значение» окружения. **По умолчанию:** `process.env`.
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор пользователя процесса (см. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор группы процесса (см. setgid(2)).
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное время работы процесса в миллисекундах. **По умолчанию:** `undefined`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сигнал при принудительном завершении. **По умолчанию:** `'SIGTERM'`.
    -   `maxBuffer` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный объём данных в байтах для stdout или stderr. При превышении дочерний процесс завершается. См. [раздел о `maxBuffer` и Unicode](#maxbuffer-and-unicode). **По умолчанию:** `1024 * 1024`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка для всех stdio. **По умолчанию:** `'buffer'`.
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть консольное окно подпроцесса в Windows. **По умолчанию:** `false`.
    -   `shell` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `true`, запускает `command` в оболочке. На Unix — `'/bin/sh'`, в Windows — `process.env.ComSpec`. См. [требования к оболочке](#shell-requirements) и [оболочку Windows по умолчанию](#default-windows-shell). **По умолчанию:** `false` (без оболочки).
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) stdout команды.

Метод `child_process.execFileSync()` в целом совпадает с [`child_process.execFile()`](#child_processexecfilefile-args-options-callback), но не возвращает управление, пока дочерний процесс полностью не закроется. При таймауте и отправке `killSignal` метод ждёт полного завершения процесса.

Если потомок перехватывает `SIGTERM` и не завершается, родитель всё равно ждёт его завершения.

При таймауте или ненулевом коде выхода метод выбрасывает [`Error`](errors.md#class-error) с полным результатом нижележащего [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options).

**При включённой опции `shell` не передавайте несанированный ввод; метасимволы оболочки могут привести к выполнению произвольной команды.**

=== "CJS"

    ```js
    const { execFileSync } = require('node:child_process');

    try {
      const stdout = execFileSync('my-script.sh', ['my-arg'], {
        // Перехват stdout и stderr; иначе stderr потока шёл бы в stderr родителя
        stdio: 'pipe',

        // Кодировка utf8 для stdio
        encoding: 'utf8',
      });

      console.log(stdout);
    } catch (err) {
      if (err.code) {
        // Не удалось породить дочерний процесс
        console.error(err.code);
      } else {
        // Процесс запущен, но завершился с ненулевым кодом;
        // в ошибке есть stdout и stderr потомка
        const { stdout, stderr } = err;

        console.error({ stdout, stderr });
      }
    }
    ```

=== "MJS"

    ```js
    import { execFileSync } from 'node:child_process';

    try {
      const stdout = execFileSync('my-script.sh', ['my-arg'], {
        // Перехват stdout и stderr; иначе stderr потока шёл бы в stderr родителя
        stdio: 'pipe',

        // Кодировка utf8 для stdio
        encoding: 'utf8',
      });

      console.log(stdout);
    } catch (err) {
      if (err.code) {
        // Не удалось породить дочерний процесс
        console.error(err.code);
      } else {
        // Процесс запущен, но завершился с ненулевым кодом;
        // в ошибке есть stdout и stderr потомка
        const { stdout, stderr } = err;

        console.error({ stdout, stderr });
      }
    }
    ```

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

Добавлено в: v0.11.12

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.4.0, v14.18.0 | Опция `cwd` может быть объектом `URL` WHATWG, использующим протокол `file:`. |
    | v10.10.0 | Опцией input теперь может быть любой TypedArray или DataView. |
    | v8.8.0 | Опция «windowsHide» теперь поддерживается. |
    | v8.0.0 | Опцией input теперь может быть Uint8Array. |

-   `command` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Команда для выполнения.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Данные для stdin порождённого процесса. Если `stdio[0]` равен `'pipe'`, это значение перекрывает `stdio[0]`.
    -   `stdio` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Конфигурация stdio дочернего процесса. См. [`stdio`](#optionsstdio) у [`child_process.spawn()`](#child_processspawncommand-args-options). По умолчанию `stderr` идёт в stderr родителя, пока не задано иное `stdio`. **По умолчанию:** `'pipe'`.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары «ключ–значение» окружения. **По умолчанию:** `process.env`.
    -   `shell` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Оболочка для выполнения команды. См. [требования к оболочке](#shell-requirements) и [оболочку Windows по умолчанию](#default-windows-shell). **По умолчанию:** `'/bin/sh'` на Unix, `process.env.ComSpec` в Windows.
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор пользователя процесса (см. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор группы процесса (см. setgid(2)).
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное время работы процесса в миллисекундах. **По умолчанию:** `undefined`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сигнал при принудительном завершении. **По умолчанию:** `'SIGTERM'`.
    -   `maxBuffer` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный объём в байтах для stdout или stderr; при превышении процесс завершается, вывод обрезается. См. [раздел о `maxBuffer` и Unicode](#maxbuffer-and-unicode). **По умолчанию:** `1024 * 1024`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка для всех stdio. **По умолчанию:** `'buffer'`.
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть консольное окно подпроцесса в Windows. **По умолчанию:** `false`.
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) stdout команды.

Метод `child_process.execSync()` в целом совпадает с [`child_process.exec()`](#child_processexeccommand-options-callback), но не возвращает управление, пока дочерний процесс полностью не закроется. При таймауте и `killSignal` метод ждёт полного завершения. Если потомок перехватывает `SIGTERM` и не выходит, родитель ждёт его завершения.

При таймауте или ненулевом коде выхода метод выбрасывает исключение. Объект [`Error`](errors.md#class-error) содержит полный результат [`child_process.spawnSync()`](#child_processspawnsynccommand-args-options).

**Никогда не передавайте несанированный пользовательский ввод. Метасимволы оболочки могут привести к выполнению произвольной команды.**

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

Добавлено в: v0.11.12

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.4.0, v14.18.0 | Опция `cwd` может быть объектом `URL` WHATWG, использующим протокол `file:`. |
    | v10.10.0 | Опцией input теперь может быть любой TypedArray или DataView. |
    | v8.8.0 | Опция «windowsHide» теперь поддерживается. |
    | v8.0.0 | Опцией input теперь может быть Uint8Array. |
    | v6.2.1, v4.5.0 | Опция `encoding` теперь может быть явно установлена ​​на `buffer`. |
    | v5.7.0 | Опция `shell` теперь поддерживается. |

-   `command` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Команда для запуска.
-   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Текущий рабочий каталог дочернего процесса.
    -   `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Данные для stdin порождённого процесса. Если `stdio[0]` равен `'pipe'`, это значение перекрывает `stdio[0]`.
    -   `argv0` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Явно задаёт `argv[0]` для дочернего процесса; если не указано — `command`.
    -   `stdio` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Конфигурация stdio дочернего процесса. См. [`stdio`](#optionsstdio) у [`child_process.spawn()`](#child_processspawncommand-args-options). **По умолчанию:** `'pipe'`.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары «ключ–значение» окружения. **По умолчанию:** `process.env`.
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор пользователя процесса (см. setuid(2)).
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт идентификатор группы процесса (см. setgid(2)).
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное время работы процесса в миллисекундах. **По умолчанию:** `undefined`.
    -   `killSignal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сигнал при принудительном завершении. **По умолчанию:** `'SIGTERM'`.
    -   `maxBuffer` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный объём в байтах для stdout или stderr; при превышении процесс завершается, вывод обрезается. См. [раздел о `maxBuffer` и Unicode](#maxbuffer-and-unicode). **По умолчанию:** `1024 * 1024`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка для всех stdio. **По умолчанию:** `'buffer'`.
    -   `shell` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `true`, запускает `command` в оболочке. На Unix — `'/bin/sh'`, в Windows — `process.env.ComSpec`. См. [требования к оболочке](#shell-requirements) и [оболочку Windows по умолчанию](#default-windows-shell). **По умолчанию:** `false` (без оболочки).
    -   `windowsVerbatimArguments` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) В Windows аргументы не экранируются. На Unix игнорируется. Автоматически `true`, если задан `shell` и это CMD. **По умолчанию:** `false`.
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть консольное окно подпроцесса в Windows. **По умолчанию:** `false`.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `pid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) PID дочернего процесса.
    -   `output` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Результаты вывода stdio.
    -   `stdout` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Содержимое `output[1]`.
    -   `stderr` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Содержимое `output[2]`.
    -   `status` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null Код выхода подпроцесса или `null`, если завершение по сигналу.
    -   `signal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Сигнал завершения или `null`, если не по сигналу.
    -   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект ошибки при сбое или таймауте.

Метод `child_process.spawnSync()` в целом совпадает с [`child_process.spawn()`](#child_processspawncommand-args-options), но не возвращает управление, пока дочерний процесс полностью не закроется. При таймауте и `killSignal` метод ждёт полного завершения. Если процесс перехватывает `SIGTERM` и не выходит, родитель ждёт его завершения.

**При включённой опции `shell` не передавайте несанированный ввод; метасимволы оболочки могут привести к выполнению произвольной команды.**

## Класс: `ChildProcess` {#class-childprocess}

<!-- YAML
added: v2.2.0
-->

-   Наследует: [`<EventEmitter>`](events.md#class-eventemitter)

Экземпляры `ChildProcess` представляют порождённые дочерние процессы.

Экземпляры `ChildProcess` не предназначены для прямого создания. Используйте [`child_process.spawn()`](#child_processspawncommand-args-options), [`child_process.exec()`](#child_processexeccommand-options-callback), [`child_process.execFile()`](#child_processexecfilefile-args-options-callback) или [`child_process.fork()`](#child_processforkmodulepath-args-options).

### Событие: `'close'` {#event-close}

<!-- YAML
added: v0.7.7
-->

-   `code` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код выхода, если процесс завершился сам, или `null`, если по сигналу.
-   `signal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Сигнал завершения или `null`, если завершение не по сигналу.

Событие `'close'` генерируется после завершения процесса _и_ закрытия всех stdio потоков дочернего процесса. Оно отличается от [`'exit'`](#event-exit), так как несколько процессов могут разделять одни и те же stdio. `'close'` всегда следует после [`'exit'`](#event-exit), либо после [`'error'`](#event-error), если породить процесс не удалось.

Если процесс завершился штатно, `code` — итоговый код выхода, иначе `null`. Если завершение по сигналу, `signal` — имя сигнала, иначе `null`. Ровно одно из двух полей всегда не `null`.

=== "CJS"

    ```js
    const { spawn } = require('node:child_process');
    const ls = spawn('ls', ['-lh', '/usr']);

    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ls.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`);
    });

    ls.on('exit', (code) => {
      console.log(`child process exited with code ${code}`);
    });
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
    import { once } from 'node:events';
    const ls = spawn('ls', ['-lh', '/usr']);

    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ls.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`);
    });

    ls.on('exit', (code) => {
      console.log(`child process exited with code ${code}`);
    });

    const [code] = await once(ls, 'close');
    console.log(`child process close all stdio with code ${code}`);
    ```

### Событие: `'disconnect'` {#event-disconnect}

<!-- YAML
added: v0.7.2
-->

Событие `'disconnect'` генерируется после вызова [`subprocess.disconnect()`](#subprocessdisconnect) в родителе или [`process.disconnect()`](process.md#processdisconnect) в дочернем процессе. После отключения отправка и приём сообщений невозможны, свойство [`subprocess.connected`](#subprocessconnected) равно `false`.

### Событие: `'error'` {#event-error}

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Ошибка.

Событие `'error'` генерируется, если:

-   процесс не удалось породить;
-   процесс не удалось завершить сигналом;
-   не удалось отправить сообщение дочернему процессу;
-   дочерний процесс прерван через опцию `signal`.

Событие `'exit'` после ошибки может возникнуть, а может и нет. При подписке и на `'exit'`, и на `'error'` избегайте повторных вызовов обработчиков.

См. также [`subprocess.kill()`](#subprocesskillsignal) и [`subprocess.send()`](#subprocesssendmessage-sendhandle-options-callback).

### Событие: `'exit'` {#event-exit}

<!-- YAML
added: v0.1.90
-->

-   `code` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код выхода, если процесс завершился сам, или `null`, если по сигналу.
-   `signal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Сигнал завершения или `null`, если завершение не по сигналу.

Событие `'exit'` генерируется после завершения дочернего процесса. Если процесс завершился штатно, `code` — итоговый код выхода, иначе `null`. Если завершение по сигналу, `signal` — имя сигнала, иначе `null`. Ровно одно из двух полей всегда не `null`.

При событии `'exit'` потоки stdio дочернего процесса могут быть ещё открыты.

Node.js устанавливает обработчики `SIGINT` и `SIGTERM` и не завершается сразу при их получении: выполняется очистка и затем сигнал пробрасывается снова.

См. waitpid(2).

Если `code` равен `null` из‑за сигнала, для перевода в POSIX-код выхода используйте [`util.convertProcessSignalToExitCode()`](util.md#utilconvertprocesssignaltoexitcodesignalcode).

### Событие: `'message'` {#event-message}

<!-- YAML
added: v0.5.9
-->

-   `message` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Разобранный JSON-объект или примитив.
-   `sendHandle` [`<Handle | undefined>`](child_process.md) `undefined` либо объект [`net.Socket`](net.md#class-netsocket), [`net.Server`](net.md#class-netserver) или [`dgram.Socket`](dgram.md#class-dgramsocket).

Событие `'message'` возникает, когда дочерний процесс вызывает [`process.send()`](process.md#processsendmessage-sendhandle-options-callback).

Сообщение сериализуется и разбирается; итог может отличаться от исходного.

Если при порождении был задан `serialization: 'advanced'`, аргумент `message` может содержать данные, которые JSON не представляет. Подробнее — [расширенная сериализация](#advanced-serialization).

### Событие: `'spawn'` {#event-spawn}

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
-->

Событие `'spawn'` генерируется один раз после успешного порождения дочернего процесса. Если породить процесс не удалось, `'spawn'` не приходит, вместо него — `'error'`.

Если событие есть, оно предшествует остальным и любым данным из `stdout` или `stderr`.

`'spawn'` приходит, даже если ошибка возникает **внутри** уже запущенного процесса. Например, `bash some-command` успешно стартует — будет `'spawn'`, хотя `bash` может не запустить `some-command`. То же при `{ shell: true }`.

### `subprocess.channel`

<!-- YAML
added: v7.1.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30165
    description: The object no longer accidentally exposes native C++ bindings.
-->

Добавлено в: v7.1.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Объект больше не случайно предоставляет собственные привязки C++. |

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Канал (pipe), представляющий IPC к дочернему процессу.

Свойство `subprocess.channel` ссылается на IPC-канал дочернего процесса. Если IPC нет, значение `undefined`.

#### `subprocess.channel.ref()`

<!-- YAML
added: v7.1.0
-->

Делает так, чтобы IPC-канал удерживал цикл событий родителя, если ранее вызывался `.unref()`.

#### `subprocess.channel.unref()`

<!-- YAML
added: v7.1.0
-->

IPC-канал перестаёт удерживать цикл событий родителя; цикл может завершиться, пока канал ещё открыт.

### `subprocess.connected`

<!-- YAML
added: v0.7.2
-->

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Становится `false` после вызова `subprocess.disconnect()`.

Свойство `subprocess.connected` показывает, можно ли ещё обмениваться сообщениями с дочерним процессом. При `false` отправка и приём невозможны.

### `subprocess.disconnect()`

<!-- YAML
added: v0.7.2
-->

Закрывает IPC между родителем и потомком, позволяя дочернему процессу корректно завершиться, когда больше нет других удерживающих соединений. После вызова `subprocess.connected` и `process.connected` в родителе и потомке (соответственно) становятся `false`, сообщения передавать нельзя.

Событие `'disconnect'` приходит, когда не осталось сообщений в процессе приёма; чаще всего сразу после `subprocess.disconnect()`.

Если потомок — экземпляр Node.js (например, через [`child_process.fork()`](#child_processforkmodulepath-args-options)), в нём можно вызвать `process.disconnect()` для закрытия IPC.

### `subprocess.exitCode`

-   Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `subprocess.exitCode` — код выхода дочернего процесса. Пока процесс ещё работает, значение `null`.

При завершении по сигналу `subprocess.exitCode` равен `null`, а [`subprocess.signalCode`](#subprocesssignalcode) заполнен. Для соответствующего POSIX-кода выхода используйте [`util.convertProcessSignalToExitCode(subprocess.signalCode)`](util.md#utilconvertprocesssignaltoexitcodesignalcode).

### `subprocess.kill([signal])`

<!-- YAML
added: v0.1.90
-->

-   `signal` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Метод `subprocess.kill()` отправляет сигнал дочернему процессу. Без аргумента отправляется `'SIGTERM'`. Список сигналов см. в signal(7). Возвращает `true`, если kill(2) успешен, иначе `false`.

=== "CJS"

    ```js
    const { spawn } = require('node:child_process');
    const grep = spawn('grep', ['ssh']);

    grep.on('close', (code, signal) => {
      console.log(
        `child process terminated due to receipt of signal ${signal}`);
    });

    // Отправить процессу SIGHUP
    grep.kill('SIGHUP');
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
    const grep = spawn('grep', ['ssh']);

    grep.on('close', (code, signal) => {
      console.log(
        `child process terminated due to receipt of signal ${signal}`);
    });

    // Отправить процессу SIGHUP
    grep.kill('SIGHUP');
    ```

Объект [`ChildProcess`](#class-childprocess) может сгенерировать [`'error'`](#event-error), если сигнал не доставлен. Отправка сигнала уже завершившемуся процессу не считается ошибкой, но может иметь непредвиденные последствия: если PID уже переназначен другому процессу, сигнал получит он.

Несмотря на имя `kill`, переданный сигнал может не завершить процесс.

См. kill(2).

В Windows, где нет POSIX-сигналов, аргумент `signal` игнорируется, кроме `'SIGKILL'`, `'SIGTERM'`, `'SIGINT'` и `'SIGQUIT'`; процесс всегда завершается принудительно (как при `'SIGKILL'`). Подробнее — [события сигналов](process.md#signal-events).

В Linux при завершении родителя не завершаются «внуки» — это часто при запуске через оболочку или с опцией `shell` у `ChildProcess`:

=== "CJS"

    ```js
    const { spawn } = require('node:child_process');

    const subprocess = spawn(
      'sh',
      [
        '-c',
        `node -e "setInterval(() => {
          console.log(process.pid, 'is alive')
        }, 500);"`,
      ], {
        stdio: ['inherit', 'inherit', 'inherit'],
      },
    );

    setTimeout(() => {
      subprocess.kill(); // Не завершает процесс Node.js внутри оболочки
    }, 2000);
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';

    const subprocess = spawn(
      'sh',
      [
        '-c',
        `node -e "setInterval(() => {
          console.log(process.pid, 'is alive')
        }, 500);"`,
      ], {
        stdio: ['inherit', 'inherit', 'inherit'],
      },
    );

    setTimeout(() => {
      subprocess.kill(); // Не завершает процесс Node.js внутри оболочки
    }, 2000);
    ```

### `subprocess[Symbol.dispose]()`

<!-- YAML
added:
 - v20.5.0
 - v18.18.0
changes:
 - version: v24.2.0
   pr-url: https://github.com/nodejs/node/pull/58467
   description: No longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.2.0 | Больше не экспериментально. |

Вызывает [`subprocess.kill()`](#subprocesskillsignal) с `'SIGTERM'`.

### `subprocess.killed`

<!-- YAML
added: v0.5.10
-->

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Становится `true`, после того как `subprocess.kill()` успешно отправил сигнал дочернему процессу.

Свойство `subprocess.killed` показывает, получил ли дочерний процесс сигнал от `subprocess.kill()`. Оно не означает, что процесс уже завершён.

### `subprocess.pid`

<!-- YAML
added: v0.1.90
-->

-   Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined

Возвращает PID дочернего процесса. Если породить процесс не удалось, значение `undefined` и генерируется `error`.

=== "CJS"

    ```js
    const { spawn } = require('node:child_process');
    const grep = spawn('grep', ['ssh']);

    console.log(`Spawned child pid: ${grep.pid}`);
    grep.stdin.end();
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
    const grep = spawn('grep', ['ssh']);

    console.log(`Spawned child pid: ${grep.pid}`);
    grep.stdin.end();
    ```

### `subprocess.ref()`

<!-- YAML
added: v0.7.10
-->

Вызов `subprocess.ref()` после `subprocess.unref()` восстанавливает учёт дочернего процесса в счётчике ссылок: родитель снова ждёт завершения потомка перед своим выходом.

=== "CJS"

    ```js
    const { spawn } = require('node:child_process');
    const process = require('node:process');

    const subprocess = spawn(process.argv[0], ['child_program.js'], {
      detached: true,
      stdio: 'ignore',
    });

    subprocess.unref();
    subprocess.ref();
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
    import process from 'node:process';

    const subprocess = spawn(process.argv[0], ['child_program.js'], {
      detached: true,
      stdio: 'ignore',
    });

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

Добавлено в: v0.5.9

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v5.8.0 | Параметр `options` и, в частности, `keepOpen` теперь поддерживаются. |
    | v5.0.0 | Этот метод теперь возвращает логическое значение для управления потоком. |
    | v4.0.0 | Параметр `callback` теперь поддерживается. |

-   `message` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `sendHandle` [`<Handle | undefined>`](child_process.md) `undefined`, or a [`net.Socket`](net.md#class-netsocket), [`net.Server`](net.md#class-netserver), or [`dgram.Socket`](dgram.md#class-dgramsocket) object.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если задан, дополняет отправку некоторых типов дескрипторов. Поддерживаемые свойства:
    -   `keepOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При передаче `net.Socket`: если `true`, сокет остаётся открытым в отправляющем процессе. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

При установленном IPC между родителем и потомком (например, через [`child_process.fork()`](#child_processforkmodulepath-args-options)) метод `subprocess.send()` отправляет сообщения дочернему процессу. Если потомок — Node.js, сообщения принимаются событием [`'message'`](process.md#event-message).

Сообщение сериализуется и разбирается; результат может отличаться от исходного.

Например, в родительском скрипте:

=== "CJS"

    ```js
    const { fork } = require('node:child_process');
    const forkedProcess = fork(`${__dirname}/sub.js`);

    forkedProcess.on('message', (message) => {
      console.log('PARENT got message:', message);
    });

    // В потомке выведется: CHILD got message: { hello: 'world' }
    forkedProcess.send({ hello: 'world' });
    ```

=== "MJS"

    ```js
    import { fork } from 'node:child_process';
    const forkedProcess = fork(`${import.meta.dirname}/sub.js`);

    forkedProcess.on('message', (message) => {
      console.log('PARENT got message:', message);
    });

    // В потомке выведется: CHILD got message: { hello: 'world' }
    forkedProcess.send({ hello: 'world' });
    ```

Дочерний файл `'sub.js'` может выглядеть так:

```js
process.on('message', (message) => {
    console.log('CHILD got message:', message);
});

// В родителе выведется: PARENT got message: { foo: 'bar', baz: null }
process.send({ foo: 'bar', baz: NaN });
```

У дочернего процесса Node.js есть свой [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) для отправки сообщений родителю.

Особый случай — сообщения `{ cmd: 'NODE_foo' }`. Префикс `NODE_` в `cmd` зарезервирован в ядре Node.js и не попадает в событие [`'message'`](process.md#event-message) потомка: такие сообщения идут через `'internalMessage'` и обрабатываются внутри Node.js. Приложениям не следует на это опираться — поведение может измениться без предупреждения.

Необязательный аргумент `sendHandle` в `subprocess.send()` передаёт сервер или сокет TCP дочернему процессу. Потомок получит его вторым аргументом обработчика [`'message'`](process.md#event-message). Данные, уже принятые и буферизованные в сокете, до потомка не переданы. Передача IPC-сокетов в Windows не поддерживается.

Необязательный `callback` вызывается после отправки сообщения, но до того, как потомок его мог получить; аргумент — `null` при успехе или [`Error`](errors.md#class-error) при ошибке.

Если `callback` не задан и отправить сообщение нельзя, [`ChildProcess`](#class-childprocess) генерирует `'error'` (например, когда потомок уже завершился).

`subprocess.send()` возвращает `false`, если канал закрыт или очередь неотправленных сообщений слишком велика; иначе `true`. `callback` можно использовать для контроля потока.

#### Пример: передача объекта сервера

Аргумент `sendHandle` позволяет передать дескриптор TCP-сервера потомку, как в примере:

=== "CJS"

    ```js
    const { fork } = require('node:child_process');
    const { createServer } = require('node:net');

    const subprocess = fork('subprocess.js');

    // Поднять сервер и передать дескриптор
    const server = createServer();
    server.on('connection', (socket) => {
      socket.end('handled by parent');
    });
    server.listen(1337, () => {
      subprocess.send('server', server);
    });
    ```

=== "MJS"

    ```js
    import { fork } from 'node:child_process';
    import { createServer } from 'node:net';

    const subprocess = fork('subprocess.js');

    // Поднять сервер и передать дескриптор
    const server = createServer();
    server.on('connection', (socket) => {
      socket.end('handled by parent');
    });
    server.listen(1337, () => {
      subprocess.send('server', server);
    });
    ```

Дочерний процесс получает сервер так:

```js
process.on('message', (m, server) => {
    if (m === 'server') {
        server.on('connection', (socket) => {
            socket.end('handled by child');
        });
    }
});
```

Когда сервер разделён между родителем и потомком, часть соединений может обрабатывать родитель, часть — дочерний процесс.

В примере выше сервер из `node:net`; для `node:dgram` шаги те же, но вместо `'connection'` слушают `'message'`, а вместо `server.listen()` вызывают `server.bind()`. Это поддерживается только на Unix.

#### Пример: передача сокета

Аналогично можно передать дескриптор сокета через `sendHandle`. Ниже два потомка обрабатывают соединения с «обычным» или «особым» приоритетом:

=== "CJS"

    ```js
    const { fork } = require('node:child_process');
    const { createServer } = require('node:net');

    const normal = fork('subprocess.js', ['normal']);
    const special = fork('subprocess.js', ['special']);

    // Сервер и передача сокетов потомкам; pauseOnConnect — не читать сокет до передачи
    const server = createServer({ pauseOnConnect: true });
    server.on('connection', (socket) => {

      // Особый приоритет...
      if (socket.remoteAddress === '74.125.127.100') {
        special.send('socket', socket);
        return;
      }
      // Обычный приоритет
      normal.send('socket', socket);
    });
    server.listen(1337);
    ```

=== "MJS"

    ```js
    import { fork } from 'node:child_process';
    import { createServer } from 'node:net';

    const normal = fork('subprocess.js', ['normal']);
    const special = fork('subprocess.js', ['special']);

    // Сервер и передача сокетов потомкам; pauseOnConnect — не читать сокет до передачи
    const server = createServer({ pauseOnConnect: true });
    server.on('connection', (socket) => {

      // Особый приоритет...
      if (socket.remoteAddress === '74.125.127.100') {
        special.send('socket', socket);
        return;
      }
      // Обычный приоритет
      normal.send('socket', socket);
    });
    server.listen(1337);
    ```

В `subprocess.js` дескриптор сокета приходит вторым аргументом обработчика:

```js
process.on('message', (m, socket) => {
    if (m === 'socket') {
        if (socket) {
            // Убедиться, что клиентский сокет существует: между отправкой и приёмом
            // в потомке сокет мог закрыться
            socket.end(
                `Request handled with ${process.argv[2]} priority`
            );
        }
    }
});
```

Не используйте `.maxConnections` у сокета, переданного подпроцессу: родитель не отслеживает момент уничтожения сокета.

Обработчики `'message'` в потомке должны проверять наличие `socket`: соединение могло закрыться за время передачи.

### `subprocess.signalCode`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null

Свойство `subprocess.signalCode` — сигнал, полученный дочерним процессом, либо `null`.

При завершении по сигналу [`subprocess.exitCode`](#subprocessexitcode) будет `null`. Для POSIX-кода выхода используйте [`util.convertProcessSignalToExitCode(subprocess.signalCode)`](util.md#utilconvertprocesssignaltoexitcodesignalcode).

### `subprocess.spawnargs`

-   Тип: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

Свойство `subprocess.spawnargs` — полный список аргументов командной строки, с которыми запущен дочерний процесс.

### `subprocess.spawnfile`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `subprocess.spawnfile` — имя исполняемого файла дочернего процесса.

Для [`child_process.fork()`](#child_processforkmodulepath-args-options) совпадает с [`process.execPath`](process.md#processexecpath). Для [`child_process.spawn()`](#child_processspawncommand-args-options) — имя исполняемого файла. Для [`child_process.exec()`](#child_processexeccommand-options-callback) — имя оболочки, в которой запущен потомок.

### `subprocess.stderr`

<!-- YAML
added: v0.1.90
-->

-   Тип: [`<stream.Readable>`](stream.md#streamreadable) | null | undefined

Поток `Readable` для `stderr` дочернего процесса.

Если при порождении `stdio[2]` не равен `'pipe'`, значение `null`.

`subprocess.stderr` — псевдоним `subprocess.stdio[2]`; оба свойства указывают на одно и то же.

Свойство может быть `null` или `undefined`, если процесс не удалось породить.

### `subprocess.stdin`

<!-- YAML
added: v0.1.90
-->

-   Тип: [`<stream.Writable>`](stream.md#streamwritable) | null | undefined

Поток `Writable` для `stdin` дочернего процесса.

Если потомок ждёт весь ввод, он не продолжит работу, пока поток не закрыт через `end()`.

Если при порождении `stdio[0]` не равен `'pipe'`, значение `null`.

`subprocess.stdin` — псевдоним `subprocess.stdio[0]`.

Свойство может быть `null` или `undefined`, если процесс не удалось породить.

### `subprocess.stdio`

<!-- YAML
added: v0.7.10
-->

-   Тип: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

Разреженный массив каналов к дочернему процессу для позиций опции [`stdio`](#optionsstdio) в [`child_process.spawn()`](#child_processspawncommand-args-options), где задано `'pipe'`. `subprocess.stdio[0]`, `[1]` и `[2]` доступны также как `subprocess.stdin`, `subprocess.stdout` и `subprocess.stderr`.

В примере ниже только fd `1` (stdout) потомка — `'pipe'`, поэтому только `subprocess.stdio[1]` у родителя — поток, остальные элементы `null`.

=== "CJS"

    ```js
    const assert = require('node:assert');
    const fs = require('node:fs');
    const child_process = require('node:child_process');

    const subprocess = child_process.spawn('ls', {
      stdio: [
        0, // stdin родителя для потомка
        'pipe', // stdout потомка в родителя
        fs.openSync('err.out', 'w'), // stderr потомка в файл
      ],
    });

    assert.strictEqual(subprocess.stdio[0], null);
    assert.strictEqual(subprocess.stdio[0], subprocess.stdin);

    assert(subprocess.stdout);
    assert.strictEqual(subprocess.stdio[1], subprocess.stdout);

    assert.strictEqual(subprocess.stdio[2], null);
    assert.strictEqual(subprocess.stdio[2], subprocess.stderr);
    ```

=== "MJS"

    ```js
    import assert from 'node:assert';
    import fs from 'node:fs';
    import child_process from 'node:child_process';

    const subprocess = child_process.spawn('ls', {
      stdio: [
        0, // stdin родителя для потомка
        'pipe', // stdout потомка в родителя
        fs.openSync('err.out', 'w'), // stderr потомка в файл
      ],
    });

    assert.strictEqual(subprocess.stdio[0], null);
    assert.strictEqual(subprocess.stdio[0], subprocess.stdin);

    assert(subprocess.stdout);
    assert.strictEqual(subprocess.stdio[1], subprocess.stdout);

    assert.strictEqual(subprocess.stdio[2], null);
    assert.strictEqual(subprocess.stdio[2], subprocess.stderr);
    ```

`subprocess.stdio` может быть `undefined`, если процесс не удалось породить.

### `subprocess.stdout`

<!-- YAML
added: v0.1.90
-->

-   Тип: [`<stream.Readable>`](stream.md#streamreadable) | null | undefined

Поток `Readable` для `stdout` дочернего процесса.

Если при порождении `stdio[1]` не равен `'pipe'`, значение `null`.

`subprocess.stdout` — псевдоним `subprocess.stdio[1]`.

=== "CJS"

    ```js
    const { spawn } = require('node:child_process');

    const subprocess = spawn('ls');

    subprocess.stdout.on('data', (data) => {
      console.log(`Received chunk ${data}`);
    });
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';

    const subprocess = spawn('ls');

    subprocess.stdout.on('data', (data) => {
      console.log(`Received chunk ${data}`);
    });
    ```

Свойство может быть `null` или `undefined`, если процесс не удалось породить.

### `subprocess.unref()`

<!-- YAML
added: v0.7.10
-->

По умолчанию родитель ждёт завершения отсоединённого дочернего процесса. Чтобы не ждать `subprocess`, вызовите `subprocess.unref()`: цикл событий родителя перестанет учитывать потомка в счётчике ссылок, и родитель может завершиться независимо, если нет IPC между родителем и потомком.

=== "CJS"

    ```js
    const { spawn } = require('node:child_process');
    const process = require('node:process');

    const subprocess = spawn(process.argv[0], ['child_program.js'], {
      detached: true,
      stdio: 'ignore',
    });

    subprocess.unref();
    ```

=== "MJS"

    ```js
    import { spawn } from 'node:child_process';
    import process from 'node:process';

    const subprocess = spawn(process.argv[0], ['child_program.js'], {
      detached: true,
      stdio: 'ignore',
    });

    subprocess.unref();
    ```

## `maxBuffer` и Unicode {#maxbuffer-and-unicode}

Опция `maxBuffer` задаёт максимальное число байт в `stdout` или `stderr`. При превышении дочерний процесс завершается. Это важно для многобайтовых кодировок (UTF-8, UTF-16). Например, `console.log('中文测试')` отправляет в `stdout` 13 байт в UTF-8 при четырёх символах.

## Требования к оболочке {#shell-requirements}

Оболочка должна понимать ключ `-c`. Для `'cmd.exe'` нужны ключи `/d /s /c` и совместимый разбор командной строки.

## Оболочка Windows по умолчанию {#default-windows-shell}

Microsoft требует, чтобы `%COMSPEC%` указывал на `'cmd.exe'`, но дочерние процессы не всегда подчиняются тому же правилу. В функциях `child_process`, где можно породить оболочку, при отсутствии `process.env.ComSpec` используется запасной вариант `'cmd.exe'`.

## Расширенная сериализация {#advanced-serialization}

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

Для IPC дочерние процессы поддерживают сериализацию на основе [API сериализации модуля `node:v8`](v8.md#serialization-api) и [алгоритма структурированного клонирования HTML](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). Это мощнее JSON и покрывает больше встроенных типов: `BigInt`, `Map`, `Set`, `ArrayBuffer`, `TypedArray`, `Buffer`, `Error`, `RegExp` и т.д.

Формат не является полным надмножеством JSON: например, собственные свойства на объектах встроенных типов через сериализацию не проходят. Производительность может отличаться от JSON в зависимости от данных. Включение — явно, через опцию `serialization: 'advanced'` при вызове [`child_process.spawn()`](#child_processspawncommand-args-options) или [`child_process.fork()`](#child_processforkmodulepath-args-options).
