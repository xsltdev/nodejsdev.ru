---
title: Устаревшие API
description: Категории устаревания (documentation-only, runtime, End-of-Life) и полный список кодов DEP с описаниями
---

# Устаревшие API

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/deprecations.html)

API Node.js могут быть признаны устаревшими по следующим причинам:

-   использование API небезопасно;
-   есть улучшенная альтернатива;
-   ожидаются ломающие изменения в будущем мажорном релизе.

В Node.js используются четыре вида устаревания:

-   только документация (documentation-only)
-   приложение (только код вне `node_modules`)
-   время выполнения (весь код)
-   конец срока службы (End-of-Life)

Устаревание «только документация» отражено лишь в документации по API Node.js. При обычном запуске побочных эффектов нет. Некоторые такие устаревания вызывают предупреждение времени выполнения при запуске с флагом [`--pending-deprecation`](cli.md#--pending-deprecation) (или переменной окружения `NODE_PENDING_DEPRECATION=1`), аналогично устареваниям времени выполнения ниже. Устаревания «только документация», для которых это верно, помечены явно в [списке устаревших API](#list-of-deprecated-apis).

Устаревание уровня «приложение» (только код вне `node_modules`) по умолчанию выдаёт предупреждение процесса в `stderr` при первом использовании устаревшего API в коде не из `node_modules`. С флагом [`--throw-deprecation`](cli.md#--throw-deprecation) устаревание времени выполнения приводит к выбросу ошибки. С [`--pending-deprecation`](cli.md#--pending-deprecation) предупреждения также выдаются для кода из `node_modules`.

Устаревание времени выполнения для всего кода похоже на вариант для кода вне `node_modules`, но предупреждение выдаётся и для кода из `node_modules`.

Устаревание End-of-Life применяют, когда функциональность уже удалена или будет удалена из Node.js вскоре.

## Отмена устаревания

Иногда устаревание API отменяют. В таких случаях документ обновляют с учётом решения. Идентификатор устаревания при этом не меняют.

## Список устаревших API {#list-of-deprecated-apis}

### DEP0001: `http.OutgoingMessage.prototype.flush`

Тип: End-of-Life

`OutgoingMessage.prototype.flush()` удалён. Используйте `OutgoingMessage.prototype.flushHeaders()` вместо него.

### DEP0002: `require('_linklist')`

Тип: End-of-Life

Модуль `_linklist` устарел. Используйте альтернативу из пользовательской экосистемы.

### DEP0003: `_writableState.buffer`

Тип: End-of-Life

`_writableState.buffer` удалён. Используйте `_writableState.getBuffer()` вместо него.

### DEP0004: `CryptoStream.prototype.readyState`

Тип: End-of-Life

Свойство `CryptoStream.prototype.readyState` удалено.

### DEP0005: `Buffer()` constructor

Тип: приложение (только код вне `node_modules`)

Функция `Buffer()` и конструктор `new Buffer()` устарели из-за проблем с удобством API, которые могут случайно приводить к проблемам безопасности.

В качестве альтернативы используйте один из следующих способов создания объектов `Buffer`:

-   [`Buffer.alloc(size[, fill[, encoding]])`](buffer.md#static-method-bufferallocsize-fill-encoding): создаёт `Buffer` с _инициализированной_ памятью.
-   [`Buffer.allocUnsafe(size)`](buffer.md#static-method-bufferallocunsafesize): создаёт `Buffer` с _неинициализированной_ памятью.
-   [`Buffer.allocUnsafeSlow(size)`](buffer.md#static-method-bufferallocunsafeslowsize): создаёт `Buffer` с _неинициализированной_ памятью.
-   [`Buffer.from(array)`](buffer.md#static-method-bufferfromarray): создаёт `Buffer`, копируя `array`.
-   [`Buffer.from(arrayBuffer[, byteOffset[, length]])`](buffer.md#static-method-bufferfromarraybuffer-byteoffset-length) - создаёт `Buffer`, оборачивающий указанный `arrayBuffer`.
-   [`Buffer.from(buffer)`](buffer.md#static-method-bufferfrombuffer): создаёт `Buffer`, копируя `buffer`.
-   [`Buffer.from(string[, encoding])`](buffer.md#static-method-bufferfromstring-encoding): создаёт `Buffer`, копируя `string`.

Без `--pending-deprecation` предупреждения времени выполнения появляются только для кода вне `node_modules`. Это значит, что использование `Buffer()` внутри зависимостей не будет сопровождаться предупреждениями об устаревании. С `--pending-deprecation` предупреждение времени выполнения появляется независимо от того, где используется `Buffer()`.

### DEP0006: `child_process` `options.customFds`

Тип: End-of-Life

В методах `spawn()`, `fork()` и `exec()` модуля [`child_process`](child_process.md) параметр `options.customFds` устарел. Вместо него следует использовать параметр `options.stdio`.

### DEP0007: Replace `cluster` `worker.suicide` with `worker.exitedAfterDisconnect`

Тип: End-of-Life

В ранней версии модуля `cluster` к объекту `Worker` было добавлено логическое свойство `suicide`, чтобы отражать, как и почему завершился воркер. В Node.js 6.0.0 старое свойство объявлено устаревшим и заменено на [`worker.exitedAfterDisconnect`](cluster.md#workerexitedafterdisconnect): старое имя плохо отражало семантику и было эмоционально окрашенным.

### DEP0008: `require('node:constants')`

Тип: только документация (Documentation-only)

Модуль `node:constants` устарел. Если нужен доступ к константам, относящимся к конкретным встроенным модулям Node.js, следует использовать свойство `constants`, экспортируемое соответствующим модулем. Например, `require('node:fs').constants` и `require('node:os').constants`.

### DEP0009: `crypto.pbkdf2` without digest

Тип: End-of-Life

Использование API [`crypto.pbkdf2()`](crypto.md#cryptopbkdf2password-salt-iterations-keylen-digest-callback) без указания `digest` было объявлено устаревшим в Node.js 6.0, потому что метод по умолчанию использовал нерекомендуемый алгоритм `'SHA1'`. Ранее при этом выводилось предупреждение об устаревании. Начиная с Node.js 8.0.0 вызов `crypto.pbkdf2()` или `crypto.pbkdf2Sync()` с `digest`, равным `undefined`, приводит к `TypeError`.

Начиная с Node.js 11.0.0 вызов этих функций с `digest`, равным `null`, также выводил предупреждение об устаревании, чтобы поведение совпадало со случаем, когда `digest` равен `undefined`.

Теперь же передача как `undefined`, так и `null` приводит к `TypeError`.

### DEP0010: `crypto.createCredentials`

Тип: End-of-Life

API `crypto.createCredentials()` удалён. Используйте [`tls.createSecureContext()`](tls.md#tlscreatesecurecontextoptions) вместо него.

### DEP0011: `crypto.Credentials`

Тип: End-of-Life

Класс `crypto.Credentials` удалён. Используйте [`tls.SecureContext`](tls.md#tlscreatesecurecontextoptions) вместо него.

### DEP0012: `Domain.dispose`

Тип: End-of-Life

`Domain.dispose()` удалён. Вместо этого следует явно обрабатывать ошибки неудачных операций ввода-вывода через обработчики событий ошибок, установленные на domain.

### DEP0013: `fs` asynchronous function without callback

Тип: End-of-Life

Вызов асинхронной функции без callback приводит к `TypeError` начиная с Node.js 10.0.0. См. <https://github.com/nodejs/node/pull/12562>.

### DEP0014: `fs.read` legacy String interface

Тип: End-of-Life

Устаревший `String`-интерфейс [`fs.read()`](fs.md#fsreadfd-buffer-offset-length-position-callback) объявлен устаревшим. Вместо него используйте API `Buffer`, как указано в документации.

### DEP0015: `fs.readSync` legacy String interface

Тип: End-of-Life

Устаревший `String`-интерфейс [`fs.readSync()`](fs.md#fsreadsyncfd-buffer-offset-length-position) объявлен устаревшим. Вместо него используйте API `Buffer`, как указано в документации.

### DEP0016: `GLOBAL`/`root`

Тип: End-of-Life

Псевдонимы `GLOBAL` и `root` для свойства `global` были объявлены устаревшими в Node.js 6.0.0 и с тех пор удалены.

### DEP0017: `Intl.v8BreakIterator`

Тип: End-of-Life

`Intl.v8BreakIterator` был нестандартным расширением и был удалён. См. [`Intl.Segmenter`](https://github.com/tc39/proposal-intl-segmenter).

### DEP0018: Unhandled promise rejections

Тип: End-of-Life

Необработанные отклонения промисов объявлены устаревшими. По умолчанию отклонения промисов, которые не были обработаны, завершают процесс Node.js с ненулевым кодом выхода. Чтобы изменить поведение Node.js в отношении необработанных отклонений, используйте параметр командной строки [`--unhandled-rejections`](cli.md#--unhandled-rejectionsmode).

### DEP0019: `require('.')` resolved outside directory

Тип: End-of-Life

В некоторых случаях `require('.')` мог разрешаться за пределы каталога пакета. Это поведение было удалено.

### DEP0020: `Server.connections`

Тип: End-of-Life

Свойство `Server.connections` было объявлено устаревшим в Node.js 0.9.7 и затем удалено. Используйте метод [`Server.getConnections()`](net.md#servergetconnectionscallback) вместо него.

### DEP0021: `Server.listenFD`

Тип: End-of-Life

Метод `Server.listenFD()` объявлен устаревшим и удалён. Используйте [`Server.listen({fd: <number>})`](net.md#serverlistenhandle-backlog-callback) вместо него.

### DEP0022: `os.tmpDir()`

Тип: End-of-Life

API `os.tmpDir()` был объявлен устаревшим в Node.js 7.0.0 и с тех пор удалён. Используйте [`os.tmpdir()`](os.md#ostmpdir) вместо него.

Доступна автоматическая миграция ([source](https://github.com/nodejs/userland-migrations/tree/main/recipes/tmpdir-to-tmpdir)):

```bash
npx codemod@latest @nodejs/tmpDir-to-tmpdir
```

### DEP0023: `os.getNetworkInterfaces()`

Тип: End-of-Life

Метод `os.getNetworkInterfaces()` устарел. Используйте метод [`os.networkInterfaces()`](os.md#osnetworkinterfaces) вместо него.

### DEP0024: `REPLServer.prototype.convertToContext()`

Тип: End-of-Life

API `REPLServer.prototype.convertToContext()` удалён.

### DEP0025: `require('node:sys')`

Тип: время выполнения (весь код)

Модуль `node:sys` устарел. Используйте модуль [`util`](util.md) вместо него.

### DEP0026: `util.print()`

Тип: End-of-Life

`util.print()` удалён. Вместо него используйте [`console.log()`](console.md#consolelogdata-args).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-print-to-console-log)):

```bash
npx codemod@latest @nodejs/util-print-to-console-log
```

### DEP0027: `util.puts()`

Тип: End-of-Life

`util.puts()` удалён. Вместо него используйте [`console.log()`](console.md#consolelogdata-args).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-print-to-console-log)):

```bash
npx codemod@latest @nodejs/util-print-to-console-log
```

### DEP0028: `util.debug()`

Тип: End-of-Life

`util.debug()` удалён. Вместо него используйте [`console.error()`](console.md#consoleerrordata-args).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-print-to-console-log)):

```bash
npx codemod@latest @nodejs/util-print-to-console-log
```

### DEP0029: `util.error()`

Тип: End-of-Life

`util.error()` удалён. Вместо него используйте [`console.error()`](console.md#consoleerrordata-args).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-print-to-console-log)):

```bash
npx codemod@latest @nodejs/util-print-to-console-log
```

### DEP0030: `SlowBuffer`

Тип: End-of-Life

Класс `SlowBuffer` удалён. Используйте [`Buffer.allocUnsafeSlow(size)`](buffer.md#static-method-bufferallocunsafeslowsize).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/slow-buffer-to-buffer-alloc-unsafe-slow)).

```bash
npx codemod@latest @nodejs/slow-buffer-to-buffer-alloc-unsafe-slow
```

### DEP0031: `ecdh.setPublicKey()`

Тип: время выполнения (весь код)

Метод [`ecdh.setPublicKey()`](crypto.md#ecdhsetpublickeypublickey-encoding) объявлен устаревшим: в API он не несёт пользы.

### DEP0032: `node:domain` module

Тип: только документация (Documentation-only)

Модуль [`domain`](domain.md) устарел; использовать его не следует.

### DEP0033: `EventEmitter.listenerCount()`

Тип: отменено

API [`events.listenerCount(emitter, eventName)`](events.md#eventslistenercountemitterortarget-eventname) было устаревшим, так как дублировало [`emitter.listenerCount(eventName)`](events.md#emitterlistenercounteventname-listener). Устаревание отменено: функция переориентирована и теперь также принимает аргументы [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget).

### DEP0034: `fs.exists(path, callback)`

Тип: только документация (Documentation-only)

API [`fs.exists(path, callback)`](fs.md#fsexistspath-callback) устарело. Используйте [`fs.stat()`](fs.md#fsstatpath-options-callback) или [`fs.access()`](fs.md#fsaccesspath-mode-callback).

### DEP0035: `fs.lchmod(path, mode, callback)`

Тип: только документация (Documentation-only)

API [`fs.lchmod(path, mode, callback)`](fs.md#fslchmodpath-mode-callback) устарело.

### DEP0036: `fs.lchmodSync(path, mode)`

Тип: только документация (Documentation-only)

API [`fs.lchmodSync(path, mode)`](fs.md#fslchmodsyncpath-mode) устарело.

### DEP0037: `fs.lchown(path, uid, gid, callback)`

Тип: устаревание отменено

API [`fs.lchown(path, uid, gid, callback)`](fs.md#fslchownpath-uid-gid-callback) было устаревшим. Отмена: в libuv появились необходимые возможности.

### DEP0038: `fs.lchownSync(path, uid, gid)`

Тип: устаревание отменено

API [`fs.lchownSync(path, uid, gid)`](fs.md#fslchownsyncpath-uid-gid) было устаревшим. Отмена: в libuv появились необходимые возможности.

### DEP0039: `require.extensions`

Тип: только документация (Documentation-only)

Свойство [`require.extensions`](modules.md#requireextensions) устарело.

### DEP0040: `node:punycode` module

Тип: приложение (только код вне `node_modules`)

Модуль [`punycode`](punycode.md) устарел. Используйте альтернативу из пользовательской экосистемы.

### DEP0041: `NODE_REPL_HISTORY_FILE` environment variable

Тип: End-of-Life

Переменная окружения `NODE_REPL_HISTORY_FILE` удалена. Используйте `NODE_REPL_HISTORY`.

### DEP0042: `tls.CryptoStream`

Тип: End-of-Life

Класс `tls.CryptoStream` удалён. Используйте [`tls.TLSSocket`](tls.md#class-tlstlssocket).

### DEP0043: `tls.SecurePair`

Тип: End-of-Life

Класс `tls.SecurePair` устарел. Вместо него используйте [`tls.TLSSocket`](tls.md#class-tlstlssocket).

### DEP0044: `util.isArray()`

Тип: время выполнения (весь код)

API [`util.isArray()`](util.md#utilisarrayobject) объявлено устаревшим. Вместо него используйте `Array.isArray()`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0045: `util.isBoolean()`

Тип: End-of-Life

API `util.isBoolean()` удалён. Вместо него используйте `typeof arg === 'boolean'`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0046: `util.isBuffer()`

Тип: End-of-Life

API `util.isBuffer()` удалён. Вместо него используйте [`Buffer.isBuffer()`](buffer.md#static-method-bufferisbufferobj).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0047: `util.isDate()`

Тип: End-of-Life

API `util.isDate()` удалён. Вместо него используйте `arg instanceof Date`.

Для более строгой проверки можно использовать: `Date.prototype.toString.call(arg) === '[object Date]' && !isNaN(arg)`. То же подходит в блоке `try/catch` для обработки некорректных объектов `Date`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0048: `util.isError()`

Тип: End-of-Life

API `util.isError()` удалён. Используйте `Error.isError(arg)`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0049: `util.isFunction()`

Тип: End-of-Life

API `util.isFunction()` удалён. Вместо него используйте `typeof arg === 'function'`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0050: `util.isNull()`

Тип: End-of-Life

API `util.isNull()` удалён. Вместо него используйте `arg === null`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0051: `util.isNullOrUndefined()`

Тип: End-of-Life

API `util.isNullOrUndefined()` удалён. Вместо него используйте `arg === null || arg === undefined`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0052: `util.isNumber()`

Тип: End-of-Life

API `util.isNumber()` удалён. Вместо него используйте `typeof arg === 'number'`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0053: `util.isObject()`

Тип: End-of-Life

API `util.isObject()` удалён. Вместо него используйте `arg && typeof arg === 'object'`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0054: `util.isPrimitive()`

Тип: End-of-Life

API `util.isPrimitive()` удалён. Вместо него используйте `Object(arg) !== arg`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0055: `util.isRegExp()`

Тип: End-of-Life

API `util.isRegExp()` удалён. Вместо него используйте `arg instanceof RegExp`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0056: `util.isString()`

Тип: End-of-Life

API `util.isString()` удалён. Вместо него используйте `typeof arg === 'string'`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0057: `util.isSymbol()`

Тип: End-of-Life

API `util.isSymbol()` удалён. Вместо него используйте `typeof arg === 'symbol'`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0058: `util.isUndefined()`

Тип: End-of-Life

API `util.isUndefined()` удалён. Вместо него используйте `arg === undefined`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

### DEP0059: `util.log()`

Тип: End-of-Life

API `util.log()` удалён: это неподдерживаемое устаревшее API, случайно оказавшееся доступным в пользовательском коде. Вместо него рассмотрите такие варианты в зависимости от задач:

-   **Сторонние библиотеки логирования**

-   **Используйте `console.log(new Date().toLocaleString(), message)`**

Перейдя на один из этих вариантов, вы откажетесь от `util.log()` и сможете выбрать стратегию логирования, соответствующую требованиям и сложности приложения.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-log-to-console-log)):

```bash
npx codemod@latest @nodejs/util-log-to-console-log
```

### DEP0060: `util._extend()`

Тип: время выполнения (весь код)

API [`util._extend()`](util.md#util_extendtarget-source) объявлено устаревшим: это неподдерживаемое устаревшее API, случайно оказавшееся доступным в пользовательском коде. Вместо него используйте `target = Object.assign(target, source)`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-extend-to-object-assign)):

```bash
npx codemod@latest @nodejs/util-extend-to-object-assign
```

### DEP0061: `fs.SyncWriteStream`

Тип: End-of-Life

Класс `fs.SyncWriteStream` не был рассчитан на публичное использование и удалён. Встроенной замены нет. Используйте решение из пользовательской экосистемы.

### DEP0062: `node --debug`

Тип: End-of-Life

`--debug` включает устаревший интерфейс отладчика V8, удалённый начиная с V8 5.8. Его заменяет Inspector, который включается флагом `--inspect`.

### DEP0063: `ServerResponse.prototype.writeHeader()`

Тип: End-of-Life

API модуля `node:http` `ServerResponse.prototype.writeHeader()` объявлено устаревшим. Вместо него используйте `ServerResponse.prototype.writeHead()`.

Метод `ServerResponse.prototype.writeHeader()` никогда не был задокументирован как официально поддерживаемое API.

### DEP0064: `tls.createSecurePair()`

Тип: End-of-Life

API `tls.createSecurePair()` было отмечено в документации как устаревшее в Node.js 0.11.3. Следует использовать `tls.Socket`.

### DEP0065: `repl.REPL_MODE_MAGIC` and `NODE_REPL_MODE=magic`

Тип: End-of-Life

Константа `REPL_MODE_MAGIC` модуля `node:repl` (для опции `replMode`) удалена. С точки зрения поведения она совпадает с `REPL_MODE_SLOPPY` с Node.js 6.0.0 после перехода на V8 5.0. Используйте `REPL_MODE_SLOPPY`.

Переменная окружения `NODE_REPL_MODE` задаёт базовое значение `replMode` интерактивного сеанса `node`. Значение `magic` также удалено. Используйте `sloppy`.

### DEP0066: `OutgoingMessage.prototype._headers, OutgoingMessage.prototype._headerNames`

Тип: End-of-Life

В модуле `node:http` свойства `OutgoingMessage.prototype._headers` и `OutgoingMessage.prototype._headerNames` объявлены устаревшими. Для работы с исходящими заголовками используйте публичные методы (например `OutgoingMessage.prototype.getHeader()`, `OutgoingMessage.prototype.getHeaders()`, `OutgoingMessage.prototype.getHeaderNames()`, `OutgoingMessage.prototype.getRawHeaderNames()`, `OutgoingMessage.prototype.hasHeader()`, `OutgoingMessage.prototype.removeHeader()`, `OutgoingMessage.prototype.setHeader()`).

Свойства `OutgoingMessage.prototype._headers` и `OutgoingMessage.prototype._headerNames` никогда не были задокументированы как официально поддерживаемые.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/http-outgoingmessage-headers)):

```bash
npx codemod@latest @nodejs/http-outgoingmessage-headers
```

### DEP0067: `OutgoingMessage.prototype._renderHeaders`

Тип: только документация (Documentation-only)

API модуля `node:http` `OutgoingMessage.prototype._renderHeaders()` объявлено устаревшим.

Свойство `OutgoingMessage.prototype._renderHeaders` никогда не было задокументировано как официально поддерживаемое API.

### DEP0068: `node debug`

Тип: End-of-Life

`node debug` соответствует устаревшему отладчику в CLI; его заменил отладчик на базе V8 Inspector, доступный через `node inspect`.

### DEP0069: `vm.runInDebugContext(string)`

Тип: End-of-Life

`DebugContext` удалён в V8 и недоступен в Node.js 10+.

`DebugContext` был экспериментальным API.

### DEP0070: `async_hooks.currentId()`

Тип: End-of-Life

`async_hooks.currentId()` переименован в `async_hooks.executionAsyncId()` для ясности.

Изменение было внесено, пока `async_hooks` оставался экспериментальным API.

### DEP0071: `async_hooks.triggerId()`

Тип: End-of-Life

`async_hooks.triggerId()` переименован в `async_hooks.triggerAsyncId()` для ясности.

Изменение было внесено, пока `async_hooks` оставался экспериментальным API.

### DEP0072: `async_hooks.AsyncResource.triggerId()`

Тип: End-of-Life

`async_hooks.AsyncResource.triggerId()` переименован в `async_hooks.AsyncResource.triggerAsyncId()` для ясности.

Изменение было внесено, пока `async_hooks` оставался экспериментальным API.

### DEP0073: Several internal properties of `net.Server`

Тип: End-of-Life

Доступ к нескольким внутренним не задокументированным свойствам экземпляров `net.Server` с неудачными именами объявлен устаревшим.

Так как исходное API не было задокументировано и мало применимо вне внутреннего кода Node.js, замены не предусмотрено.

### DEP0074: `REPLServer.bufferedCommand`

Тип: End-of-Life

Свойство `REPLServer.bufferedCommand` объявлено устаревшим в пользу [`REPLServer.clearBufferedCommand()`](repl.md#replserverclearbufferedcommand).

### DEP0075: `REPLServer.parseREPLKeyword()`

Тип: End-of-Life

`REPLServer.parseREPLKeyword()` скрыт от пользовательского кода (больше не доступен из userland).

### DEP0076: `tls.parseCertString()`

Тип: End-of-Life

`tls.parseCertString()` — тривиальный вспомогательный разборщик, случайно оказавшийся публичным. Он должен был разбирать строки субъекта и издателя сертификата, но корректно не обрабатывал многозначные относительные отличительные имена (RDN).

В более ранних версиях этого документа в качестве замены предлагалось `querystring.parse()`. Однако `querystring.parse()` тоже не гарантирует корректную обработку всех субъектов сертификатов; его использовать не следует.

### DEP0077: `Module._debug()`

Тип: End-of-Life

`Module._debug()` удалён.

Функция `Module._debug()` никогда не была задокументирована как официально поддерживаемое API.

### DEP0078: `REPLServer.turnOffEditorMode()`

Тип: End-of-Life

`REPLServer.turnOffEditorMode()` скрыт от пользовательского кода (больше не доступен из userland).

### DEP0079: Custom inspection function on objects via `.inspect()`

Тип: End-of-Life

Использование свойства с именем `inspect` на объекте для задания пользовательской функции инспекции для [`util.inspect()`](util.md#utilinspectobject-options) объявлено устаревшим. Используйте [`util.inspect.custom`](util.md#utilinspectcustom). Для обратной совместимости с Node.js до версии 6.4.0 можно указать оба варианта.

### DEP0080: `path._makeLong()`

Тип: только документация (Documentation-only)

Внутренний `path._makeLong()` не предназначался для публичного использования, но модули в пользовательском коде нашли его полезным. Внутреннее API объявлено устаревшим и заменено эквивалентным публичным методом `path.toNamespacedPath()`.

### DEP0081: `fs.truncate()` using a file descriptor

Тип: End-of-Life

Использование `fs.truncate()` и `fs.truncateSync()` с дескриптором файла объявлено устаревшим. Для работы с дескрипторами файлов используйте `fs.ftruncate()` или `fs.ftruncateSync()`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/fs-truncate-fd-deprecation)):

```bash
npx codemod@latest @nodejs/fs-truncate-fd-deprecation
```

### DEP0082: `REPLServer.prototype.memory()`

Тип: End-of-Life

`REPLServer.prototype.memory()` нужен только для внутренней механики самого `REPLServer`. Не используйте эту функцию.

### DEP0083: Disabling ECDH by setting `ecdhCurve` to `false`

Тип: End-of-Life

Опцию `ecdhCurve` у `tls.createSecureContext()` и `tls.TLSSocket` можно было установить в `false`, чтобы полностью отключить ECDH только на сервере. Этот режим объявлен устаревшим в подготовке к переходу на OpenSSL 1.1.0 и унификации с клиентом и теперь не поддерживается. Используйте параметр `ciphers`.

### DEP0084: requiring bundled internal dependencies

Тип: End-of-Life

Начиная с Node.js 4.4.0 и 5.2.0 несколько модулей, предназначенных только для внутреннего использования, по ошибке стали доступны пользовательскому коду через `require()`. Это были модули:

-   `v8/tools/codemap`
-   `v8/tools/consarray`
-   `v8/tools/csvparser`
-   `v8/tools/logreader`
-   `v8/tools/profile_view`
-   `v8/tools/profile`
-   `v8/tools/SourceMap`
-   `v8/tools/splaytree`
-   `v8/tools/tickprocessor-driver`
-   `v8/tools/tickprocessor`
-   `node-inspect/lib/_inspect` (с 7.6.0)
-   `node-inspect/lib/internal/inspect_client` (с 7.6.0)
-   `node-inspect/lib/internal/inspect_repl` (с 7.6.0)

У модулей `v8/*` нет экспортов, и при импорте не в определённом порядке они могут выбрасывать ошибки. Практически нет обоснованных сценариев подключать их через `require()`.

`node-inspect` при этом можно установить локально через менеджер пакетов: он опубликован в npm под тем же именем. При таком подходе менять исходный код не требуется.

### DEP0085: AsyncHooks sensitive API

Тип: End-of-Life

API AsyncHooks «sensitive» никогда не было задокументировано и имело ряд мелких проблем. Используйте API `AsyncResource`. См. <https://github.com/nodejs/node/issues/15572>.

### DEP0086: Remove `runInAsyncIdScope`

Тип: End-of-Life

`runInAsyncIdScope` не генерирует события `'before'` и `'after'`, из‑за чего возможны серьёзные проблемы. См. <https://github.com/nodejs/node/issues/14328>.

### DEP0089: `require('node:assert')`

Тип: устаревание отменено

Прямой импорт `assert` не рекомендовали, так как экспортируемые функции используют нестрогие проверки равенства. Устаревание сняли: использование модуля `node:assert` не осуждается, а само устаревание вводило разработчиков в заблуждение.

### DEP0090: Invalid GCM authentication tag lengths {: #DEP0090}

Тип: End-of-Life

В Node.js раньше поддерживались все длины GCM-тегов аутентификации, которые принимает OpenSSL при вызове [`decipher.setAuthTag()`](crypto.md#deciphersetauthtagbuffer-encoding). Начиная с Node.js v11.0.0, допускаются только длины тегов 128, 120, 112, 104, 96, 64 и 32 бита. Теги иной длины недопустимы согласно [NIST SP 800-38D](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf).

### DEP0091: `crypto.DEFAULT_ENCODING`

Тип: End-of-Life

Свойство `crypto.DEFAULT_ENCODING` существовало только для совместимости с выпусками Node.js до версий 0.9.3 и было удалено.

### DEP0092: Top-level `this` bound to `module.exports`

Тип: только документация (Documentation-only)

Присвоение свойств верхнему уровню `this` вместо `module.exports` объявлено устаревшим. Следует использовать `exports` или `module.exports`.

### DEP0093: `crypto.fips` объявлен устаревшим и заменён

Тип: время выполнения (весь код)

Свойство [`crypto.fips`](crypto.md#cryptofips) объявлено устаревшим. Вместо него используйте `crypto.setFips()` и `crypto.getFips()`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/crypto-fips-to-getFips)).

```bash
npx codemod@latest @nodejs/crypto-fips-to-getFips
```

### DEP0094: Using `assert.fail()` with more than one argument

Тип: End-of-Life

Вызов `assert.fail()` с более чем одним аргументом объявлен устаревшим. Используйте `assert.fail()` только с одним аргументом или другой метод модуля `node:assert`.

### DEP0095: `timers.enroll()`

Тип: End-of-Life

`timers.enroll()` удалён. Вместо него используйте задокументированные [`setTimeout()`](timers.md#settimeoutcallback-delay-args) или [`setInterval()`](timers.md#setintervalcallback-delay-args).

### DEP0096: `timers.unenroll()`

Тип: End-of-Life

`timers.unenroll()` удалён. Вместо него используйте задокументированные [`clearTimeout()`](timers.md#cleartimeouttimeout) или [`clearInterval()`](timers.md#clearintervaltimeout).

### DEP0097: `MakeCallback` with `domain` property

Тип: время выполнения (весь код)

Пользователям `MakeCallback`, добавляющим свойство `domain` для передачи контекста, следует перейти на вариант `MakeCallback` с `async_context` или `CallbackScope`, либо на высокоуровневый класс `AsyncResource`.

### DEP0098: AsyncHooks embedder `AsyncResource.emitBefore` and `AsyncResource.emitAfter` APIs

Тип: End-of-Life

Встроенный API AsyncHooks предоставляет методы `.emitBefore()` и `.emitAfter()`, которые очень легко использовать неверно, что может привести к неустранимым ошибкам.

Вместо них используйте API [`asyncResource.runInAsyncScope()`](async_context.md#asyncresourceruninasyncscopefn-thisarg-args) — он безопаснее и удобнее. См. <https://github.com/nodejs/node/pull/18513>.

### DEP0099: Async context-unaware `node::MakeCallback` C++ APIs

Тип: на этапе компиляции

Некоторые варианты API `node::MakeCallback`, доступные нативным дополнениям, объявлены устаревшими. Используйте версии API, принимающие параметр `async_context`.

### DEP0100: `process.assert()`

Тип: End-of-Life

`process.assert()` объявлен устаревшим. Вместо него используйте модуль [`assert`](assert.md).

Это никогда не было задокументированной возможностью.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/process-assert-to-node-assert)).

```bash
npx codemod@latest @nodejs/process-assert-to-node-assert
```

### DEP0101: `--with-lttng`

Тип: End-of-Life

Опция времени компиляции `--with-lttng` удалена.

### DEP0102: Using `noAssert` in `Buffer#(read|write)` operations

Тип: End-of-Life

Аргумент `noAssert` больше ни на что не влияет: ввод проверяется всегда, независимо от значения `noAssert`. Пропуск проверки мог приводить к трудноуловимым ошибкам и сбоям.

### DEP0103: `process.binding('util').is[...]` typechecks

Тип: только документация (Documentation-only) (supports [`--pending-deprecation`](cli.md#--pending-deprecation))

В целом следует избегать `process.binding()`. Методы проверки типов в частности можно заменить использованием [`util.types`](util.md#utiltypes).

Это устаревание заменено устареванием API `process.binding()` ([DEP0111](#DEP0111)).

### DEP0104: `process.env` string coercion

Тип: только документация (Documentation-only) (supports [`--pending-deprecation`](cli.md#--pending-deprecation))

При присвоении свойству [`process.env`](process.md#processenv) значения не строкового типа оно неявно приводится к строке. Такое поведение объявлено устаревшим, если присваиваемое значение не является строкой, логическим значением или числом. В будущем такое присвоение может привести к выбросу ошибки. Перед присвоением в `process.env` преобразуйте значение в строку.

### DEP0105: `decipher.finaltol`

Тип: End-of-Life

`decipher.finaltol()` никогда не документировался и был псевдонимом для [`decipher.final()`](crypto.md#decipherfinaloutputencoding). Этот API удалён; рекомендуется использовать [`decipher.final()`](crypto.md#decipherfinaloutputencoding).

### DEP0106: `crypto.createCipher` and `crypto.createDecipher`

Тип: End-of-Life

`crypto.createCipher()` и `crypto.createDecipher()` удалены: они использовали слабую функцию вывода ключа (MD5 без соли) и статические векторы инициализации. Рекомендуется выводить ключ с помощью [`crypto.pbkdf2()`](crypto.md#cryptopbkdf2password-salt-iterations-keylen-digest-callback) или [`crypto.scrypt()`](crypto.md#cryptoscryptpassword-salt-keylen-options-callback) со случайными солями и получать объекты [`Cipheriv`](crypto.md#class-cipheriv) и [`Decipheriv`](crypto.md#class-decipheriv) через [`crypto.createCipheriv()`](crypto.md#cryptocreatecipherivalgorithm-key-iv-options) и [`crypto.createDecipheriv()`](crypto.md#cryptocreatedecipherivalgorithm-key-iv-options) соответственно.

### DEP0107: `tls.convertNPNProtocols()`

Тип: End-of-Life

Это была недокументированная вспомогательная функция, не предназначенная для использования вне ядра Node.js; она устарела после удаления поддержки NPN (согласования следующего протокола).

### DEP0108: `zlib.bytesRead`

Тип: End-of-Life

Устаревший псевдоним для [`zlib.bytesWritten`](zlib.md#zlibbyteswritten). Исходное имя выбрали потому, что значение можно было трактовать и как число байт, прочитанных движком, но оно не согласуется с другими потоками в Node.js, экспонирующими значения под этими именами.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/zlib-bytesread-to-byteswritten)):

```bash
npx codemod@latest @nodejs/zlib-bytesread-to-byteswritten
```

### DEP0109: `http`, `https`, and `tls` support for invalid URLs

Тип: End-of-Life

Некоторые ранее допускавшиеся (но формально неверные) URL принимались в API [`http.request()`](http.md#httprequestoptions-callback), [`http.get()`](http.md#httpgetoptions-callback), [`https.request()`](https.md#httpsrequestoptions-callback), [`https.get()`](https.md#httpsgetoptions-callback) и [`tls.checkServerIdentity()`](tls.md#tlscheckserveridentityhostname-cert), потому что их принимал устаревший API `url.parse()`. Перечисленные API теперь используют разборщик WHATWG URL и требуют строго корректных URL. Передача неверного URL объявлена устаревшей; поддержка будет удалена в будущем.

### DEP0110: `vm.Script` cached data

Тип: только документация (Documentation-only)

Опция `produceCachedData` объявлена устаревшей. Вместо неё используйте [`script.createCachedData()`](vm.md#scriptcreatecacheddata).

### DEP0111: `process.binding()` {: #DEP0111}

Тип: только документация (Documentation-only) (supports [`--pending-deprecation`](cli.md#--pending-deprecation))

`process.binding()` предназначен только для внутреннего кода Node.js.

Хотя `process.binding()` в целом не переведён в статус End-of-Life, он недоступен при включённой [модели разрешений](permissions.md#permission-model).

### DEP0112: `dgram` private APIs

Тип: End-of-Life

В модуле `node:dgram` раньше были API, не предназначенные для доступа извне ядра Node.js: `Socket.prototype._handle`, `Socket.prototype._receiving`, `Socket.prototype._bindState`, `Socket.prototype._queue`, `Socket.prototype._reuseAddr`, `Socket.prototype._healthCheck()`, `Socket.prototype._stopReceiving()` и `dgram._createSocketHandle()`. Они удалены.

### DEP0113: `Cipher.setAuthTag()`, `Decipher.getAuthTag()`

Тип: End-of-Life

`Cipher.setAuthTag()` и `Decipher.getAuthTag()` больше недоступны. Они не документировались и при вызове выбрасывали исключение.

### DEP0114: `crypto._toBuf()`

Тип: End-of-Life

Функция `crypto._toBuf()` не предназначалась для использования модулями вне ядра Node.js и была удалена.



### DEP0115: `crypto.prng()`, `crypto.pseudoRandomBytes()`, `crypto.rng()`

Тип: только документация (Documentation-only) (supports [`--pending-deprecation`](cli.md#--pending-deprecation))



В последних версиях Node.js [`crypto.randomBytes()`](crypto.md#cryptorandombytessize-callback) и `crypto.pseudoRandomBytes()` не различаются. Второй объявлен устаревшим вместе с недокументированными псевдонимами `crypto.prng()` и `crypto.rng()` в пользу [`crypto.randomBytes()`](crypto.md#cryptorandombytessize-callback) и может быть удалён в будущем выпуске.

### DEP0116: Legacy URL API

Тип: устаревание отменено

[Устаревший URL API](url.md#legacy-url-api) объявлен устаревшим. В него входят [`url.format()`](url.md#urlformaturlobject), [`url.parse()`](url.md#urlparseurlstring-parsequerystring-slashesdenotehost), [`url.resolve()`](url.md#urlresolvefrom-to) и [устаревший `urlObject`](url.md#legacy-urlobject). Вместо него используйте [WHATWG URL API](url.md#the-whatwg-url-api).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/node-url-to-whatwg-url)).

```bash
npx codemod@latest @nodejs/node-url-to-whatwg-url
```

### DEP0117: Native crypto handles

Тип: End-of-Life

В предыдущих версиях Node.js через свойство `_handle` классов `Cipher`, `Decipher`, `DiffieHellman`, `DiffieHellmanGroup`, `ECDH`, `Hash`, `Hmac`, `Sign` и `Verify` были доступны дескрипторы внутренних нативных объектов. Свойство `_handle` удалено: неправильное использование нативного объекта может привести к падению приложения.

### DEP0118: `dns.lookup()` support for a falsy host name

Тип: End-of-Life

В предыдущих версиях Node.js из соображений обратной совместимости поддерживался вызов `dns.lookup()` с ложным именем хоста, например `dns.lookup(false)`. Это поведение удалено.

### DEP0119: `process.binding('uv').errname()` private API

Тип: только документация (Documentation-only) (supports [`--pending-deprecation`](cli.md#--pending-deprecation))

`process.binding('uv').errname()` объявлен устаревшим. Вместо него используйте [`util.getSystemErrorName()`](util.md#utilgetsystemerrornameerr).

### DEP0120: Windows Performance Counter support

Тип: End-of-Life

Поддержка счётчиков производительности Windows удалена из Node.js. Недокументированные функции `COUNTER_NET_SERVER_CONNECTION()`, `COUNTER_NET_SERVER_CONNECTION_CLOSE()`, `COUNTER_HTTP_SERVER_REQUEST()`, `COUNTER_HTTP_SERVER_RESPONSE()`, `COUNTER_HTTP_CLIENT_REQUEST()` и `COUNTER_HTTP_CLIENT_RESPONSE()` объявлены устаревшими.

### DEP0121: `net._setSimultaneousAccepts()`

Тип: End-of-Life

Недокументированная функция `net._setSimultaneousAccepts()` изначально предназначалась для отладки и настройки производительности при использовании модулей `node:child_process` и `node:cluster` в Windows. Она мало полезна в общем случае и удаляется. Обсуждение: <https://github.com/nodejs/node/issues/18391>

### DEP0122: `tls` `Server.prototype.setOptions()`

Тип: End-of-Life

Вместо него используйте `Server.prototype.setSecureContext()`.

### DEP0123: setting the TLS ServerName to an IP address

Тип: End-of-Life

Установка TLS ServerName в IP-адрес не допускается согласно [RFC 6066](https://tools.ietf.org/html/rfc6066#section-3).

### DEP0124: using `REPLServer.rli`

Тип: End-of-Life

Это свойство — ссылка на сам экземпляр.

### DEP0125: `require('node:_stream_wrap')`

Тип: End-of-Life

Модуль `node:_stream_wrap` объявлен устаревшим.

### DEP0126: `timers.active()`

Тип: End-of-Life

Ранее недокументированный `timers.active()` удалён. Вместо него используйте задокументированный [`timeout.refresh()`](timers.md#timeoutrefresh). Если нужно снова учитывать таймер в event loop, с Node.js 10 без потери производительности можно использовать [`timeout.ref()`](timers.md#timeoutref).

### DEP0127: `timers._unrefActive()`

Тип: End-of-Life

Ранее недокументированный и «приватный» `timers._unrefActive()` удалён. Вместо него используйте задокументированный [`timeout.refresh()`](timers.md#timeoutrefresh). Если нужно исключить таймер из учёта, с Node.js 10 без потери производительности можно использовать [`timeout.unref()`](timers.md#timeoutunref).

### DEP0128: modules with an invalid `main` entry and an `index.js` file

Тип: время выполнения (весь код)

У модулей с неверной записью `main` (например `./does-not-exist.js`) и при наличии файла `index.js` в корне каталога разрешался файл `index.js`. Такое поведение объявлено устаревшим; в будущих версиях Node.js оно будет приводить к ошибке.

### DEP0129: `ChildProcess._channel`

Тип: End-of-Life

Свойство `_channel` объектов дочернего процесса, возвращаемых `spawn()` и аналогами, не предназначено для публичного использования. Используйте `ChildProcess.channel`.

### DEP0130: `Module.createRequireFromPath()`

Тип: End-of-Life

Вместо него используйте [`module.createRequire()`](module.md#modulecreaterequirefilename).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/create-require-from-path)):

```bash
npx codemod@latest @nodejs/create-require-from-path
```

### DEP0131: Legacy HTTP parser

Тип: End-of-Life

Устаревший HTTP-парсер, использовавшийся по умолчанию в версиях Node.js до 12.0.0, объявлен устаревшим и удалён в v13.0.0. До v13.0.0 можно было вернуться к старому парсеру флагом командной строки `--http-parser=legacy`.

### DEP0132: `worker.terminate()` with callback

Тип: End-of-Life

Передача callback в [`worker.terminate()`](worker_threads.md#workerterminate) объявлена устаревшей. Вместо этого используйте возвращаемый `Promise` или обработчик события `'exit'` у воркера.

### DEP0133: `http` `connection`

Тип: только документация (Documentation-only)

Предпочитайте [`response.socket`](http.md#responsesocket) вместо [`response.connection`](http.md#responseconnection) и [`request.socket`](http.md#requestsocket) вместо [`request.connection`](http.md#requestconnection).

### DEP0134: `process._tickCallback`

Тип: только документация (Documentation-only) (supports [`--pending-deprecation`](cli.md#--pending-deprecation))

Свойство `process._tickCallback` никогда не документировалось как официально поддерживаемое API.

### DEP0135: `WriteStream.open()` and `ReadStream.open()` are internal

Тип: End-of-Life

[`WriteStream.open()`](fs.md#class-fswritestream) и [`ReadStream.open()`](fs.md#class-fsreadstream) — недокументированные внутренние API, не предназначенные для пользовательского кода. Потоки файлов следует всегда открывать соответствующими фабричными методами [`fs.createWriteStream()`](fs.md#fscreatewritestreampath-options) и [`fs.createReadStream()`](fs.md#fscreatereadstreampath-options) либо передавая дескриптор файла в опциях.

### DEP0136: `http` `finished`

Тип: только документация (Documentation-only)

[`response.finished`](http.md#responsefinished) показывает, был ли вызван [`response.end()`](http.md#responseenddata-encoding-callback), а не то, что событие `'finish'` уже произошло и данные сброшены в нижележащий слой.

Чтобы избежать двусмысленности, вместо него в зависимости от смысла используйте [`response.writableFinished`](http.md#responsewritablefinished) или [`response.writableEnded`](http.md#responsewritableended).

Для сохранения прежнего поведения `response.finished` следует заменить на `response.writableEnded`.

### DEP0137: Closing fs.FileHandle on garbage collection

Тип: End-of-Life

Раньше допускалось закрытие объекта [`fs.FileHandle`](fs.md#class-filehandle) при сборке мусора; теперь это приводит к ошибке.

Убедитесь, что все объекты `fs.FileHandle` явно закрываются через `FileHandle.prototype.close()`, когда они больше не нужны:

```js
const fsPromises = require('node:fs').promises;
async function openAndClose() {
    let filehandle;
    try {
        filehandle = await fsPromises.open(
            'thefile.txt',
            'r'
        );
    } finally {
        if (filehandle !== undefined)
            await filehandle.close();
    }
}
```

### DEP0138: `process.mainModule`

Тип: только документация (Documentation-only)

[`process.mainModule`](process.md#processmainmodule) — возможность только для CommonJS, тогда как глобальный объект `process` общий с окружениями, не основанными на CommonJS. Использование в ECMAScript-модулях не поддерживается.

Оно объявлено устаревшим в пользу [`require.main`](modules.md#accessing-the-main-module): назначение то же, и доступно только в окружении CommonJS.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/process-main-module)):

```bash
npx codemod@latest @nodejs/process-main-module
```

### DEP0139: `process.umask()` with no arguments

Тип: только документация (Documentation-only)

Вызов `process.umask()` без аргумента приводит к двойной записи процессного umask. Это создаёт гонку между потоками и является потенциальной уязвимостью безопасности. Безопасной кроссплатформенной альтернативы API нет.

### DEP0140: Use `request.destroy()` instead of `request.abort()`

Тип: только документация (Documentation-only)

Используйте [`request.destroy()`](http.md#requestdestroyerror) вместо [`request.abort()`](http.md#requestabort).

### DEP0141: `repl.inputStream` and `repl.outputStream`

Тип: только документация (Documentation-only) (supports [`--pending-deprecation`](cli.md#--pending-deprecation))

Модуль `node:repl` экспортировал потоки ввода и вывода дважды. Используйте `.input` вместо `.inputStream` и `.output` вместо `.outputStream`.

### DEP0142: `repl._builtinLibs`

Тип: только документация (Documentation-only) (supports [`--pending-deprecation`](cli.md#--pending-deprecation))

Модуль `node:repl` экспортирует свойство `_builtinLibs` — массив встроенных модулей. Оно было неполным; надёжнее опираться на `require('node:module').builtinModules`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/repl-builtin-modules)):

```bash
npx codemod@latest @nodejs/repl-builtin-modules
```

### DEP0143: `Transform._transformState`

Тип: End-of-Life

`Transform._transformState` будет удалён в будущих версиях, когда из-за упрощения реализации он перестанет быть нужен.

### DEP0144: `module.parent`

Тип: только документация (Documentation-only) (supports [`--pending-deprecation`](cli.md#--pending-deprecation))

CommonJS-модуль мог получить первый модуль, который его подключил, через `module.parent`. Эта возможность объявлена устаревшей: при наличии ECMAScript-модулей она ведёт себя непоследовательно и даёт неточное представление о графе модулей CommonJS.

Некоторые модули использовали её, чтобы проверить, являются ли они точкой входа процесса. Вместо этого рекомендуется сравнивать `require.main` и `module`:

```js
if (require.main === module) {
    // Этот код выполнится только если текущий файл — точка входа.
}
```

Чтобы найти CommonJS-модули, которые подключили текущий, можно использовать `require.cache` и `module.children`:

```js
const moduleParents = Object.values(
    require.cache
).filter((m) => m.children.includes(module));
```

### DEP0145: `socket.bufferSize`

Тип: только документация (Documentation-only)

[`socket.bufferSize`](net.md#socketbuffersize) — лишь псевдоним для [`writable.writableLength`](stream.md#writablewritablelength).

### DEP0146: `new crypto.Certificate()`

Тип: только документация (Documentation-only)

[Конструктор `crypto.Certificate()`](crypto.md#legacy-api) объявлен устаревшим. Вместо него используйте [статические методы `crypto.Certificate()`](crypto.md#class-certificate).

### DEP0147: `fs.rmdir(path, { recursive: true })`

Тип: End-of-Life

Методы `fs.rmdir`, `fs.rmdirSync` и `fs.promises.rmdir` раньше поддерживали опцию `recursive`. Эта опция удалена.

Вместо них используйте `fs.rm(path, { recursive: true, force: true })`, `fs.rmSync(path, { recursive: true, force: true })` или `fs.promises.rm(path, { recursive: true, force: true })`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/rmdir)):

```bash
npx codemod@latest @nodejs/rmdir
```

### DEP0148: Folder mappings in `"exports"` (trailing `"/"`)

Тип: End-of-Life

Определение сопоставлений подкаталогов с завершающим `"/"` в полях [экспорты подпутей](packages.md#subpath-exports) или [импорты подпутей](packages.md#subpath-imports) больше не поддерживается. Используйте [шаблоны подпутей](packages.md#subpath-patterns).

### DEP0149: `http.IncomingMessage#connection`

Тип: только документация (Documentation-only)

Предпочитайте [`message.socket`](http.md#messagesocket) вместо [`message.connection`](http.md#messageconnection).

### DEP0150: Changing the value of `process.config`

Тип: End-of-Life

Свойство `process.config` даёт доступ к параметрам сборки Node.js. Однако оно изменяемо и подвержено подмене. Возможность менять его значение будет удалена в будущей версии Node.js.

### DEP0151: Main index lookup and extension searching

Тип: время выполнения (весь код)

Раньше при разрешении точки входа `import 'pkg'` для ES-модулей применялись поиск `index.js` и перебор расширений.

С этим устареванием для всех разрешений главной точки входа ES-модуля требуется явная запись [`"exports"` или `"main"`](packages.md#main-entry-point-export) с точным расширением файла.

### DEP0152: Extension PerformanceEntry properties

Тип: End-of-Life

У типов объектов [PerformanceEntry](perf_hooks.md#class-performanceentry) `'gc'`, `'http2'` и `'http'` раньше были дополнительные свойства с дополнительной информацией. Теперь эта информация находится в стандартном свойстве `detail` объекта `PerformanceEntry`. Устаревшие аксессоры удалены.

### DEP0153: `dns.lookup` and `dnsPromises.lookup` options type coercion

Тип: End-of-Life

Ненулевое нецелочисленное значение опции `family`, ненулевое нечисловое значение опции `hints`, ненулевое небулево значение опции `all` или ненулевое небулево значение опции `verbatim` в [`dns.lookup()`](dns.md#dnslookuphostname-options-callback) и [`dnsPromises.lookup()`](dns.md#dnspromiseslookuphostname-options) приводит к ошибке `ERR_INVALID_ARG_TYPE`.

### DEP0154: RSA-PSS generate key pair options

Тип: End-of-Life

Используйте `'hashAlgorithm'` вместо `'hash'` и `'mgf1HashAlgorithm'` вместо `'mgf1Hash'`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/crypto-rsa-pss-update)):

```bash
npx codemod@latest @nodejs/crypto-rsa-pss-update
```

### DEP0155: Trailing slashes in pattern specifier resolutions

Тип: время выполнения (весь код)

Переназначение спецификаторов с завершающим `"/"` (например `import 'pkg/x/'`) объявлено устаревшим для сопоставлений по шаблонам в `"exports"` и `"imports"` пакета.

### DEP0156: `.aborted` property and `'abort'`, `'aborted'` event in `http`

Тип: только документация (Documentation-only)

Перейдите на API [Stream](stream.md#stream): [`http.ClientRequest`](http.md#class-httpclientrequest), [`http.ServerResponse`](http.md#class-httpserverresponse) и [`http.IncomingMessage`](http.md#class-httpincomingmessage) основаны на потоках. Проверяйте `stream.destroyed` вместо свойства `.aborted` и слушайте `'close'` вместо событий `'abort'` и `'aborted'`.

Свойство `.aborted` и событие `'abort'` полезны в основном для обнаружения вызовов `.abort()`. Чтобы завершить запрос раньше, используйте у потока `.destroy([error])`, затем проверьте `.destroyed` и событие `'close'` — эффект будет тем же. Принимающая сторона также может смотреть [`readable.readableEnded`](stream.md#readablereadableended) у [`http.IncomingMessage`](http.md#class-httpincomingmessage), чтобы понять, было ли прерывание или штатное уничтожение.

### DEP0157: Thenable support in streams

Тип: End-of-Life

Недокументированная возможность потоков Node.js — поддержка thenable в методах реализации. Теперь она объявлена устаревшей: используйте колбэки и не объявляйте методы реализации потоков как `async function`.

Из-за неё пользователи сталкивались с неожиданными сбоями: функция написана в стиле колбэков, но внутри вызывается, например, асинхронный метод, что приводит к ошибке, так как смешивать семантику промисов и колбэков нельзя.

```js
const w = new Writable({
    async final(callback) {
        await someOp();
        callback();
    },
});
```

### DEP0158: `buffer.slice(start, end)`

Тип: только документация (Documentation-only)

Метод объявлен устаревшим из-за несовместимости с `Uint8Array.prototype.slice()`, тогда как `Buffer` наследует `Uint8Array`.

Вместо него используйте [`buffer.subarray`](buffer.md#bufsubarraystart-end) с тем же смыслом.

### DEP0159: `ERR_INVALID_CALLBACK`

Тип: End-of-Life

Этот код ошибки удалён, чтобы не путать с ошибками проверки типов значений.

### DEP0160: `process.on('multipleResolves', handler)`

Тип: End-of-Life

Событие объявлено устаревшим и удалено: оно не работало с комбинаторами промисов V8, из‑за чего было мало полезно.

### DEP0161: `process._getActiveRequests()` and `process._getActiveHandles()`

Тип: только документация (Documentation-only)

Функции `process._getActiveHandles()` и `process._getActiveRequests()` не предназначены для публичного использования и могут быть удалены в будущих выпусках.

Используйте [`process.getActiveResourcesInfo()`](process.md#processgetactiveresourcesinfo), чтобы получить список типов активных ресурсов, а не сами ссылки.

### DEP0162: `fs.write()`, `fs.writeFileSync()` coercion to string

Тип: End-of-Life

Неявное приведение объектов с собственным свойством `toString`, передаваемых вторым параметром в [`fs.write()`](fs.md#fswritefd-buffer-offset-length-position-callback), [`fs.writeFile()`](fs.md#fswritefilefile-data-options-callback), [`fs.appendFile()`](fs.md#fsappendfilepath-data-options-callback), [`fs.writeFileSync()`](fs.md#fswritefilesyncfile-data-options) и [`fs.appendFileSync()`](fs.md#fsappendfilesyncpath-data-options), объявлено устаревшим. Приводите их к примитивным строкам явно.

### DEP0163: `channel.subscribe(onMessage)`, `channel.unsubscribe(onMessage)`

Тип: устаревание отменено

Эти методы объявляли устаревшими из‑за риска, что объект канала будет собран сборщиком мусора, если на него нет сильной ссылки. Устаревание отменили: при активных подписчиках объекты каналов теперь устойчивы к сборке мусора.

### DEP0164: `process.exit(code)`, `process.exitCode` coercion to integer

Тип: End-of-Life

Значения, отличные от `undefined`, `null`, целых чисел и строк с целым числом (например `'1'`), объявлены устаревшими для параметра `code` в [`process.exit()`](process.md#processexitcode) и для присвоения [`process.exitCode`](process.md#processexitcode_1).

### DEP0165: `--trace-atomics-wait`

Тип: End-of-Life

Флаг `--trace-atomics-wait` удалён: он опирается на хук V8 `SetAtomicsWaitCallback`, который будет удалён в будущем выпуске V8.

### DEP0166: Double slashes in imports and exports targets

Тип: время выполнения (весь код)

Сопоставления целей `imports` и `exports` путям с двойным слэшем (_"/"_ или _"\\"_) объявлены устаревшими и в будущем приведут к ошибке проверки разрешения. То же относится к шаблонам, начинающимся или заканчивающимся слэшем.

### DEP0167: Weak `DiffieHellmanGroup` instances (`modp1`, `modp2`, `modp5`)

Тип: только документация (Documentation-only)

Широко известные MODP-группы `modp1`, `modp2` и `modp5` объявлены устаревшими: они не устойчивы к практически реализуемым атакам. Подробности — в [RFC 8247, раздел 2.4](https://www.rfc-editor.org/rfc/rfc8247#section-2.4).

Эти группы могут быть удалены в будущих версиях Node.js. Приложениям, которые на них опираются, стоит рассмотреть переход на более стойкие MODP-группы.

### DEP0168: Unhandled exception in Node-API callbacks

Тип: время выполнения (весь код)

Неявное подавление необработанных исключений в колбэках Node-API теперь объявлено устаревшим.

Установите флаг [`--force-node-api-uncaught-exceptions-policy`](cli.md#--force-node-api-uncaught-exceptions-policy), чтобы Node.js генерировал событие [`'uncaughtException'`](process.md#event-uncaughtexception), если исключение в колбэках Node-API не обработано.

### DEP0169: Insecure url.parse()

Тип: приложение (только код вне `node_modules`)

Поведение [`url.parse()`](url.md#urlparseurlstring-parsequerystring-slashesdenotehost) не стандартизовано и склонно к ошибкам с последствиями для безопасности. Вместо него используйте [WHATWG URL API](url.md#the-whatwg-url-api). Для уязвимостей `url.parse()` CVE не выпускаются.

Вызов [`url.format(urlString)`](url.md#urlformaturlstring) или [`url.resolve()`](url.md#urlresolvefrom-to) внутри вызывает `url.parse()`, поэтому также попадает под это устаревание.

### DEP0170: Invalid port when using `url.parse()`

Тип: End-of-Life

[`url.parse()`](url.md#urlparseurlstring-parsequerystring-slashesdenotehost) раньше принимал URL с портом не в виде числа. Такое поведение могло приводить к подмене имени хоста при неожиданном вводе. Такие URL теперь вызывают ошибку (как и [WHATWG URL API](url.md#the-whatwg-url-api)).

### DEP0171: Setters for `http.IncomingMessage` headers and trailers

Тип: только документация (Documentation-only)

В будущей версии Node.js свойства [`message.headers`](http.md#messageheaders), [`message.headersDistinct`](http.md#messageheadersdistinct), [`message.trailers`](http.md#messagetrailers) и [`message.trailersDistinct`](http.md#messagetrailersdistinct) станут только для чтения.

### DEP0172: The `asyncResource` property of `AsyncResource` bound functions

Тип: End-of-Life

В старых версиях Node.js при привязке функции к `AsyncResource` добавлялось свойство `asyncResource`. Сейчас этого больше не происходит.

### DEP0173: the `assert.CallTracker` class

Тип: End-of-Life

API `assert.CallTracker` удалён.

### DEP0174: calling `promisify` on a function that returns a `Promise`

Тип: время выполнения (весь код)

Вызов [`util.promisify`](util.md#utilpromisifyoriginal) для функции, возвращающей `Promise`, игнорирует результат этого промиса, что может привести к необработанным отклонениям промисов.

### DEP0175: `util.toUSVString`

Тип: только документация (Documentation-only)

API [`util.toUSVString()`](util.md#utiltousvstringstring) объявлено устаревшим. Вместо него используйте [`String.prototype.toWellFormed`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toWellFormed).

### DEP0176: `fs.F_OK`, `fs.R_OK`, `fs.W_OK`, `fs.X_OK`

Тип: End-of-Life

Геттеры `F_OK`, `R_OK`, `W_OK` и `X_OK`, ранее экспонируемые напрямую из `node:fs`, удалены. Берите их из `fs.constants` или `fs.promises.constants`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/fs-access-mode-constants)):

```bash
npx codemod@latest @nodejs/fs-access-mode-constants
```

### DEP0177: `util.types.isWebAssemblyCompiledModule`

Тип: End-of-Life

API `util.types.isWebAssemblyCompiledModule` удалён. Вместо него используйте `value instanceof WebAssembly.Module`.

### DEP0178: `dirent.path`

Тип: End-of-Life

Свойство `dirent.path` удалено из‑за несогласованного поведения между ветками релизов. Вместо него используйте [`dirent.parentPath`](fs.md#direntparentpath).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/dirent-path-to-parent-path)):

```bash
npx codemod@latest @nodejs/dirent-path-to-parent-path
```

### DEP0179: `Hash` constructor

Тип: время выполнения (весь код)

Прямой вызов класса `Hash` как `Hash()` или `new Hash()` объявлен устаревшим: это внутренности, не предназначенные для публичного использования. Создавайте экземпляры через [`crypto.createHash()`](crypto.md#cryptocreatehashalgorithm-options).

### DEP0180: `fs.Stats` constructor

Тип: время выполнения (весь код)

Прямой вызов класса `fs.Stats` как `Stats()` или `new Stats()` объявлен устаревшим: это внутренности, не предназначенные для публичного использования.

### DEP0181: `Hmac` constructor

Тип: время выполнения (весь код)

Прямой вызов класса `Hmac` как `Hmac()` или `new Hmac()` объявлен устаревшим: это внутренности, не предназначенные для публичного использования. Создавайте экземпляры через [`crypto.createHmac()`](crypto.md#cryptocreatehmacalgorithm-key-options).

### DEP0182: Short GCM authentication tags without explicit `authTagLength`

Тип: End-of-Life

Для шифров в режиме GCM функция [`decipher.setAuthTag()`](crypto.md#deciphersetauthtagbuffer-encoding) раньше принимала теги аутентификации любой допустимой длины (см. также [DEP0090](#DEP0090)). Это исключение убрано для согласования с рекомендациями [NIST SP 800-38D](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf); приложениям, которым нужны теги короче длины по умолчанию (для AES-GCM короче 16 байт), необходимо явно задать опцию `authTagLength` у [`crypto.createDecipheriv()`](crypto.md#cryptocreatedecipherivalgorithm-key-iv-options) в нужное значение.

### DEP0183: OpenSSL engine-based APIs

Тип: только документация (Documentation-only)

В OpenSSL 3 поддержка пользовательских engines объявлена устаревшей в пользу новой модели провайдеров. Опция `clientCertEngine` у `https.request()`, [`tls.createSecureContext()`](tls.md#tlscreatesecurecontextoptions) и [`tls.createServer()`](tls.md#tlscreateserveroptions-secureconnectionlistener); опции `privateKeyEngine` и `privateKeyIdentifier` у [`tls.createSecureContext()`](tls.md#tlscreatesecurecontextoptions); а также [`crypto.setEngine()`](crypto.md#cryptosetengineengine-flags) зависят от этой функциональности OpenSSL.

### DEP0184: Instantiating `node:zlib` classes without `new`

Тип: время выполнения (весь код)

Создание экземпляров без `new` для классов, экспортируемых модулем `node:zlib`, объявлено устаревшим. Рекомендуется всегда использовать `new`. Это относится ко всем классам Zlib: `Deflate`, `DeflateRaw`, `Gunzip`, `Inflate`, `InflateRaw`, `Unzip` и `Zlib`.

### DEP0185: Instantiating `node:repl` classes without `new`

Тип: End-of-Life

Создание экземпляров без `new` для классов, экспортируемых модулем `node:repl`, объявлено устаревшим. Вместо этого нужно использовать `new`. Это относится ко всем классам REPL, включая `REPLServer` и `Recoverable`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/repl-classes-with-new)):

```bash
npx codemod@latest @nodejs/repl-classes-with-new
```



### DEP0187: Passing invalid argument types to `fs.existsSync`

Тип: время выполнения (весь код)

Передача неподдерживаемых типов аргументов объявлена устаревшей: вместо возврата `false` в будущей версии будет выбрасываться ошибка.

### DEP0188: `process.features.ipv6` and `process.features.uv`

Тип: только документация (Documentation-only)

Эти свойства всегда равны `true`. Проверки на их основе избыточны.

### DEP0189: `process.features.tls_*`

Тип: только документация (Documentation-only)

Свойства `process.features.tls_alpn`, `process.features.tls_ocsp` и `process.features.tls_sni` объявлены устаревшими: их значения гарантированно совпадают с `process.features.tls`.

### DEP0190: Passing `args` to `node:child_process` `execFile`/`spawn` with `shell` option

Тип: время выполнения (весь код)

Если массив `args` передаётся в [`child_process.execFile`](child_process.md#child_processexecfilefile-args-options-callback) или [`child_process.spawn`](child_process.md#child_processspawncommand-args-options) вместе с опцией `{ shell: true }` или `{ shell: '/path/to/shell' }`, значения не экранируются, а только разделяются пробелами, что может привести к инъекции в оболочку.

### DEP0191: `repl.builtinModules`

Тип: только документация (Documentation-only) (supports [`--pending-deprecation`](cli.md#--pending-deprecation))

Модуль `node:repl` экспортирует свойство `builtinModules` — массив встроенных модулей. Оно было неполным и дублировало уже устаревший `repl._builtinLibs` ([DEP0142](#dep0142-repl_builtinlibs)); надёжнее опираться на `require('node:module').builtinModules`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/repl-builtin-modules)):

```bash
npx codemod@latest @nodejs/repl-builtin-modules
```

### DEP0192: `require('node:_tls_common')` and `require('node:_tls_wrap')`

Тип: время выполнения (весь код)

Модули `node:_tls_common` и `node:_tls_wrap` объявлены устаревшими: это внутренняя реализация Node.js, а не публичный API; используйте `node:tls`.

### DEP0193: `require('node:_stream_*')`

Тип: End-of-Life

Модули `node:_stream_duplex`, `node:_stream_passthrough`, `node:_stream_readable`, `node:_stream_transform`, `node:_stream_wrap` и `node:_stream_writable` объявлены устаревшими: это внутренняя реализация Node.js, а не публичный API; используйте `node:stream`.

### DEP0194: HTTP/2 priority signaling

Тип: End-of-Life

Поддержка сигнализации приоритетов удалена после её устаревания в [RFC 9113](https://datatracker.ietf.org/doc/html/rfc9113#section-5.3.1).

### DEP0195: Instantiating `node:http` classes without `new`

Тип: только документация (Documentation-only)

Создание экземпляров без `new` для классов, экспортируемых модулем `node:http`, объявлено устаревшим. Рекомендуется всегда использовать `new`. Это относится ко всем HTTP-классам, например `OutgoingMessage`, `IncomingMessage`, `ServerResponse` и `ClientRequest`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/http-classes-with-new)):

```bash
npx codemod@latest @nodejs/http-classes-with-new
```

### DEP0196: Calling `node:child_process` functions with `options.shell` as an empty string

Тип: только документация (Documentation-only)

Вызов функций запуска процессов с `{ shell: '' }` почти наверняка непреднамерен и может привести к аномальному поведению.

Чтобы [`child_process.execFile`](child_process.md#child_processexecfilefile-args-options-callback) или [`child_process.spawn`](child_process.md#child_processspawncommand-args-options) вызывали оболочку по умолчанию, используйте `{ shell: true }`. Если оболочка не нужна (поведение по умолчанию), опустите опцию `shell` либо задайте `false` или другое nullish-значение.

Чтобы [`child_process.exec`](child_process.md#child_processexeccommand-options-callback) вызывал оболочку по умолчанию, опустите опцию `shell` или задайте nullish-значение. Если оболочка не нужна, используйте [`child_process.execFile`](child_process.md#child_processexecfilefile-args-options-callback).

### DEP0197: `util.types.isNativeError()`

Тип: только документация (Documentation-only)

API [`util.types.isNativeError`](util.md#utiltypesisnativeerrorvalue) объявлено устаревшим. Вместо него используйте [`Error.isError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/types-is-native-error)):

```bash
npx codemod@latest @nodejs/types-is-native-error
```

### DEP0198: Creating SHAKE-128 and SHAKE-256 digests without an explicit `options.outputLength`

Тип: время выполнения (весь код)

Создание дайджестов SHAKE-128 и SHAKE-256 без явного `options.outputLength` объявлено устаревшим.

### DEP0199: `require('node:_http_*')`

Тип: только документация (Documentation-only)

Модули `node:_http_agent`, `node:_http_client`, `node:_http_common`, `node:_http_incoming`, `node:_http_outgoing` и `node:_http_server` объявлены устаревшими: это внутренняя реализация Node.js, а не публичный API; используйте `node:http`.

### DEP0200: Closing fs.Dir on garbage collection

Тип: только документация (Documentation-only)

Допускать закрытие объекта [`fs.Dir`](fs.md#class-fsdir) при сборке мусора объявлено устаревшим. В будущем это может привести к выбросу ошибки и завершению процесса.

Убедитесь, что все объекты `fs.Dir` явно закрываются через `Dir.prototype.close()` или ключевое слово `using`:

=== "MJS"

    ```js
    import { opendir } from 'node:fs/promises';

    {
      await using dir = await opendir('/async/disposable/directory');
    } // Закрыто через dir[Symbol.asyncDispose]()

    {
      using dir = await opendir('/sync/disposable/directory');
    } // Закрыто через dir[Symbol.dispose]()

    {
      const dir = await opendir('/unconditionally/iterated/directory');
      for await (const entry of dir) {
        // обработка записи
      } // Закрыто итератором
    }

    {
      let dir;
      try {
        dir = await opendir('/legacy/closeable/directory');
      } finally {
        await dir?.close();
      }
    }
    ```

### DEP0201: Passing `options.type` to `Duplex.toWeb()`

Тип: время выполнения (весь код)

Передача опции `type` в [`Duplex.toWeb()`](stream.md#streamduplextowebstreamduplex-options) объявлена устаревшей. Чтобы задать тип читаемой половины построенной пары readable/writable, используйте опцию `readableType`.

### DEP0202: `Http1IncomingMessage` and `Http1ServerResponse` options of HTTP/2 servers

Тип: только документация (Documentation-only)

Опции `Http1IncomingMessage` и `Http1ServerResponse` у [`http2.createServer()`](http2.md#http2createserveroptions-onrequesthandler) и [`http2.createSecureServer()`](http2.md#http2createsecureserveroptions-onrequesthandler) объявлены устаревшими. Вместо них используйте `http1Options.IncomingMessage` и `http1Options.ServerResponse`.

=== "CJS"

    ```js
    // Устарело
    const server = http2.createSecureServer({
      allowHTTP1: true,
      Http1IncomingMessage: MyIncomingMessage,
      Http1ServerResponse: MyServerResponse,
    });
    ```

=== "CJS"

    ```js
    // Вместо этого используйте
    const server = http2.createSecureServer({
      allowHTTP1: true,
      http1Options: {
        IncomingMessage: MyIncomingMessage,
        ServerResponse: MyServerResponse,
      },
    });
    ```

### DEP0203: Passing `CryptoKey` to `node:crypto` APIs

Тип: время выполнения (весь код)

Передача [`CryptoKey`](webcrypto.md#class-cryptokey) в функции `node:crypto` объявлена устаревшей и в будущей версии будет вызывать ошибку. Это касается [`crypto.createPublicKey()`](crypto.md#cryptocreatepublickeykey), [`crypto.createPrivateKey()`](crypto.md#cryptocreateprivatekeykey), [`crypto.sign()`](crypto.md#cryptosignalgorithm-data-key-callback), [`crypto.verify()`](crypto.md#cryptoverifyalgorithm-data-key-signature-callback), [`crypto.publicEncrypt()`](crypto.md#cryptopublicencryptkey-buffer), [`crypto.publicDecrypt()`](crypto.md#cryptopublicdecryptkey-buffer), [`crypto.privateEncrypt()`](crypto.md#cryptoprivateencryptprivatekey-buffer), [`crypto.privateDecrypt()`](crypto.md#cryptoprivatedecryptprivatekey-buffer), [`Sign.prototype.sign()`](crypto.md#signsignprivatekey-outputencoding), [`Verify.prototype.verify()`](crypto.md#verifyverifyobject-signature-signatureencoding), [`crypto.createHmac()`](crypto.md#cryptocreatehmacalgorithm-key-options), [`crypto.createCipheriv()`](crypto.md#cryptocreatecipherivalgorithm-key-iv-options), [`crypto.createDecipheriv()`](crypto.md#cryptocreatedecipherivalgorithm-key-iv-options), [`crypto.encapsulate()`](crypto.md#cryptoencapsulatekey-callback) и [`crypto.decapsulate()`](crypto.md#cryptodecapsulatekey-ciphertext-callback).

### DEP0204: `KeyObject.from()` with non-extractable `CryptoKey`

Тип: время выполнения (весь код)

Передача неизвлекаемого [`CryptoKey`](webcrypto.md#class-cryptokey) в [`KeyObject.from()`](crypto.md#static-method-keyobjectfromkey) объявлена устаревшей и в будущей версии будет вызывать ошибку.

### DEP0205: `module.register()`

Тип: время выполнения (весь код)

[`module.register()`](module.md#moduleregisterspecifier-parenturl-options) объявлен устаревшим. Вместо него используйте [`module.registerHooks()`](module.md#moduleregisterhooksoptions).

API `module.register()` предоставляет асинхронные хуки вне основного потока для настройки ES-модулей; `module.registerHooks()` даёт похожие хуки, но синхронные, в том же потоке и для всех видов модулей. Поддержка асинхронных хуков оказалась сложной (в том числе из‑за оркестрации worker threads) и сопряжена с нерешаемыми проблемами. См. [ограничения асинхронных хуков настройки](module.md#caveats-of-asynchronous-customization-hooks). Переходите на `module.registerHooks()` как можно скорее: `module.register()` будет удалён в будущей версии Node.js.
