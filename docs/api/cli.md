---
title: Интерфейс командной строки
description: Флаги запуска node, точка входа, переменные окружения NODE_OPTIONS и полезные опции V8
---

# Интерфейс командной строки

<!--introduced_in=v5.9.1-->

<!--type=misc-->

В Node.js есть набор опций командной строки: встроенная отладка, разные способы запуска скриптов и другие параметры среды выполнения.

Чтобы открыть эту документацию как страницу man в терминале, выполните `man node`.

## Краткий синтаксис

`node [options] [V8 options] [<program-entry-point> | -e "script" | -] [--] [arguments]`

`node inspect [<program-entry-point> | -e "script" | <host>:<port>] …`

`node --v8-options`

Запуск без аргументов открывает [REPL](repl.md).

Подробнее о `node inspect` — в документации [отладчика](debugger.md).

## Точка входа программы

Точка входа — строка в стиле спецификатора модуля. Если это не абсолютный путь, он разрешается относительно текущего рабочего каталога. Затем строка разрешается так, как если бы к ней обратились через `require()` из текущего каталога. Если файл не найден, выбрасывается ошибка.

По умолчанию найденный путь загружается как при `require()`, если не выполнено одно из условий ниже — тогда загрузка идёт как при `import()`:

-   процесс запущен с флагом, принудительно загружающим точку входа через загрузчик ECMAScript-модулей, например `--import`;
-   у файла расширение `.mjs`, `.mts` или `.wasm`;
-   у файла нет расширения `.cjs`, и у ближайшего родительского `package.json` в корне указано поле [`"type"`](packages.md#type) со значением `"module"`.

См. [разрешение и загрузку модулей](packages.md#module-resolution-and-loading).

## Опции

<!-- YAML
changes:
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/23020
    description: Underscores instead of dashes are now allowed for
                 Node.js options as well, in addition to V8 options.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.12.0 | Подчеркивания вместо тире теперь разрешены и для параметров Node.js, в дополнение к параметрам V8. |

> Стабильность: 2 — Стабильная

Во всех опциях, включая опции V8, слова в имени можно разделять и дефисом (`-`), и подчёркиванием (`_`). Например, `--pending-deprecation` эквивалентно `--pending_deprecation`.

Если опция с одним значением (например `--max-http-header-size`) передана несколько раз, используется последнее значение. Опции из командной строки имеют приоритет над опциями из переменной окружения [`NODE_OPTIONS`](#node_optionsoptions).

### `-`

<!-- YAML
added: v8.0.0
-->

Псевдоним stdin: как в других утилитах, скрипт читается из stdin, остальные аргументы передаются этому скрипту.

### `--`

<!-- YAML
added: v6.11.0
-->

Конец опций Node.js; всё после `--` передаётся скрипту. Если перед `--` не было имени файла скрипта и не было `-e`/печати, следующий аргумент считается именем файла скрипта.

### `--abort-on-uncaught-exception`

<!-- YAML
added: v0.10.8
-->

Аварийное завершение вместо обычного выхода позволяет получить core dump для постмортем-анализа в отладчике (`lldb`, `gdb`, `mdb` и т. п.).

Даже с этим флагом поведение можно изменить через [`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) (и через модуль `node:domain`, который её использует).

### `--allow-addons`

<!-- YAML
added:
  - v21.6.0
  - v20.12.0
-->

> Стабильность: 1.1 — Активная разработка

При [модели разрешений](permissions.md#permission-model) нативные аддоны по умолчанию недоступны. Попытка загрузки приведёт к `ERR_DLOPEN_DISABLED`, если при запуске Node.js явно не передан `--allow-addons`.

Пример:

=== "CJS"

    ```js
    // Попытка подключить нативный аддон
    require('nodejs-addon-example');
    ```

```console
$ node --permission --allow-fs-read=* index.js
node:internal/modules/cjs/loader:1319
  return process.dlopen(module, path.toNamespacedPath(filename));
                 ^

Error: Cannot load native addon because loading addons is disabled.
    at Module._extensions..node (node:internal/modules/cjs/loader:1319:18)
    at Module.load (node:internal/modules/cjs/loader:1091:32)
    at Module._load (node:internal/modules/cjs/loader:938:12)
    at Module.require (node:internal/modules/cjs/loader:1115:19)
    at require (node:internal/modules/helpers:130:18)
    at Object.<anonymous> (/home/index.js:1:15)
    at Module._compile (node:internal/modules/cjs/loader:1233:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1287:10)
    at Module.load (node:internal/modules/cjs/loader:1091:32)
    at Module._load (node:internal/modules/cjs/loader:938:12) {
  code: 'ERR_DLOPEN_DISABLED'
}
```

### `--allow-child-process`

<!-- YAML
added: v20.0.0
changes:
  - version:
      - v24.4.0
      - v22.18.0
    pr-url: https://github.com/nodejs/node/pull/58853
    description: When spawning process with the permission model enabled.
                 The flags are inherit to the child Node.js process through
                 NODE_OPTIONS environment variable.
-->

Добавлено в: v20.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.4.0, v22.18.0 | При создании процесса с включенной моделью разрешений. Флаги наследуются дочерним процессом Node.js через переменную среды NODE_OPTIONS. |

> Стабильность: 1.1 — активная разработка

При [модели разрешений](permissions.md#permission-model) процесс по умолчанию не может порождать дочерние процессы. Попытка вызовет `ERR_ACCESS_DENIED`, если при запуске Node.js явно не указан флаг `--allow-child-process`.

Пример:

```js
const childProcess = require('node:child_process');
// Attempt to bypass the permission
childProcess.spawn('node', [
    '-e',
    'require("fs").writeFileSync("/new-file", "example")',
]);
```

```console
$ node --permission --allow-fs-read=* index.js
node:internal/child_process:388
  const err = this._handle.spawn(options);
                           ^
Error: Access to this API has been restricted
    at ChildProcess.spawn (node:internal/child_process:388:28)
    at node:internal/main/run_main_module:17:47 {
  code: 'ERR_ACCESS_DENIED',
  permission: 'ChildProcess'
}
```

API `child_process.fork()` наследует аргументы выполнения родителя. Если Node.js запущен с моделью разрешений и флагом `--allow-child-process`, дочерние процессы через `child_process.fork()` получают соответствующие флаги автоматически.

Для `child_process.spawn()` то же правило, но флаги передаются через переменную окружения `NODE_OPTIONS`, а не напрямую в аргументах процесса.

### `--allow-fs-read`

<!-- YAML
added: v20.0.0
changes:
  - version:
      - v24.2.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/58579
    description: Entrypoints of your application are allowed to be read implicitly.
  - version:
    - v23.5.0
    - v22.13.0
    pr-url: https://github.com/nodejs/node/pull/56201
    description: Permission Model and --allow-fs flags are stable.
  - version: v20.7.0
    pr-url: https://github.com/nodejs/node/pull/49047
    description: Paths delimited by comma (`,`) are no longer allowed.
-->

Добавлено в: v20.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.2.0, v22.17.0 | Точки входа вашего приложения разрешено читать неявно. |
    | v23.5.0, v22.13.0 | Флаги модели разрешений и --allow-fs стабильны. |
    | v20.7.0 | Пути, разделенные запятой (`,`), больше не допускаются. |

Флаг задаёт права чтения ФС в [модели разрешений](permissions.md#permission-model).

Допустимые аргументы `--allow-fs-read`:

-   `*` — разрешить все операции `FileSystemRead`.
-   Несколько путей — несколькими флагами `--allow-fs-read`. Пример: `--allow-fs-read=/folder1/ --allow-fs-read=/folder2/`

Примеры см. в [разрешениях файловой системы](permissions.md#file-system-permissions).

У модуля инициализации и пользовательских модулей `-r` есть неявное право на чтение.

```console
$ node --permission -r custom-require.js -r custom-require-2.js index.js
```

-   `custom-require.js`, `custom-require-2.js` и `index.js` по умолчанию входят в список разрешённых для чтения.

```js
process.has('fs.read', 'index.js'); // true
process.has('fs.read', 'custom-require.js'); // true
process.has('fs.read', 'custom-require-2.js'); // true
```

### `--allow-fs-write`

<!-- YAML
added: v20.0.0
changes:
  - version:
    - v23.5.0
    - v22.13.0
    pr-url: https://github.com/nodejs/node/pull/56201
    description: Permission Model and --allow-fs flags are stable.
  - version: v20.7.0
    pr-url: https://github.com/nodejs/node/pull/49047
    description: Paths delimited by comma (`,`) are no longer allowed.
-->

Добавлено в: v20.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.5.0, v22.13.0 | Флаги модели разрешений и --allow-fs стабильны. |
    | v20.7.0 | Пути, разделенные запятой (`,`), больше не допускаются. |

Флаг задаёт права записи ФС в [модели разрешений](permissions.md#permission-model).

Допустимые аргументы `--allow-fs-write`:

-   `*` — разрешить все операции `FileSystemWrite`.
-   Несколько путей — несколькими флагами `--allow-fs-write`.

Разделитель запятой в одном флаге больше не допускается; при передаче одного флага с запятой будет предупреждение.

Примеры см. в [разрешениях файловой системы](permissions.md#file-system-permissions).

### `--allow-inspector`

<!-- YAML
added:
  - v25.0.0
  - v24.12.0
-->

> Стабильность: 1.0 — ранняя разработка

При [модели разрешений](permissions.md#permission-model) процесс не может подключаться по протоколу инспектора.

Иначе будет `ERR_ACCESS_DENIED`, пока при запуске не указан `--allow-inspector`.

Пример:

```js
const { Session } = require('node:inspector/promises');

const session = new Session();
session.connect();
```

```console
$ node --permission index.js
Error: connect ERR_ACCESS_DENIED Access to this API has been restricted. Use --allow-inspector to manage permissions.
  code: 'ERR_ACCESS_DENIED',
}
```

### `--allow-net`

<!-- YAML
added: v25.0.0
-->

> Стабильность: 1.1 — активная разработка

При [модели разрешений](permissions.md#permission-model) сеть по умолчанию недоступна.

Попытка вызовет `ERR_ACCESS_DENIED`, пока при запуске не указан `--allow-net`.

Пример:

```js
const http = require('node:http');
// Attempt to bypass the permission
const req = http.get('http://example.com', () => {});

req.on('error', (err) => {
    console.log('err', err);
});
```

```console
$ node --permission index.js
Error: connect ERR_ACCESS_DENIED Access to this API has been restricted. Use --allow-net to manage permissions.
  code: 'ERR_ACCESS_DENIED',
}
```

### `--allow-wasi`

<!-- YAML
added:
- v22.3.0
- v20.16.0
-->

> Стабильность: 1.1 — активная разработка

При [модели разрешений](permissions.md#permission-model) экземпляры WASI по умолчанию создать нельзя. Вызов вызовет `ERR_ACCESS_DENIED`, пока в главном процессе Node.js явно не указан `--allow-wasi`.

Пример:

```js
const { WASI } = require('node:wasi');
// Attempt to bypass the permission
new WASI({
    version: 'preview1',
    // Attempt to mount the whole filesystem
    preopens: {
        '/': '/',
    },
});
```

```console
$ node --permission --allow-fs-read=* index.js

Error: Access to this API has been restricted
    at node:internal/main/run_main_module:30:49 {
  code: 'ERR_ACCESS_DENIED',
  permission: 'WASI',
}
```

### `--allow-worker`

<!-- YAML
added: v20.0.0
-->

> Стабильность: 1.1 — активная разработка

При [модели разрешений](permissions.md#permission-model) потоки Worker по умолчанию создать нельзя. Вызов вызовет `ERR_ACCESS_DENIED`, пока в главном процессе явно не указан `--allow-worker`.

Пример:

```js
const { Worker } = require('node:worker_threads');
// Attempt to bypass the permission
new Worker(__filename);
```

```console
$ node --permission --allow-fs-read=* index.js

Error: Access to this API has been restricted
    at node:internal/main/run_main_module:17:47 {
  code: 'ERR_ACCESS_DENIED',
  permission: 'WorkerThreads'
}
```

### `--build-sea=config`

<!-- YAML
added:
  - v25.5.0
-->

> Стабильность: 1.1 — активная разработка

Собирает [один исполняемый файл](single-executable-applications.md) из JSON-конфигурации. Аргумент — путь к файлу; если не абсолютный, разрешается относительно текущего каталога.

Поля конфигурации, кроссплатформенные замечания и API ресурсов см. в [документации по single executable](single-executable-applications.md).

### `--build-snapshot`

<!-- YAML
added: v18.8.0
changes:
  - version:
    - v25.4.0
    - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/60954
    description: The snapshot building process is no longer experimental.
-->

Добавлено в: v18.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0, v24.13.1 | Процесс создания снимков больше не является экспериментальным. |

При завершении процесса создаётся снимок (snapshot blob) и записывается на диск; позже его можно загрузить через `--snapshot-blob`.

При сборке снимка, если `--snapshot-blob` не указан, файл по умолчанию пишется как `snapshot.blob` в текущий рабочий каталог. Иначе — по пути из `--snapshot-blob`.

```console
$ echo "globalThis.foo = 'I am from the snapshot'" > snapshot.js

# Run snapshot.js to initialize the application and snapshot the
# state of it into snapshot.blob.
$ node --snapshot-blob snapshot.blob --build-snapshot snapshot.js

$ echo "console.log(globalThis.foo)" > index.js

# Load the generated snapshot and start the application from index.js.
$ node --snapshot-blob snapshot.blob index.js
I am from the snapshot
```

API [`v8.startupSnapshot` API][`v8.startupsnapshot` api] позволяет задать точку входа на этапе сборки снимка, без дополнительного скрипта при десериализации:

```console
$ echo "require('v8').startupSnapshot.setDeserializeMainFunction(() => console.log('I am from the snapshot'))" > snapshot.js
$ node --snapshot-blob snapshot.blob --build-snapshot snapshot.js
$ node --snapshot-blob snapshot.blob
I am from the snapshot
```

Подробнее — в документации [`v8.startupSnapshot` API][`v8.startupsnapshot` api].

Сейчас при сборке снимка поддерживается только одна точка входа; можно подключать встроенные модули, но не дополнительные пользовательские — приложение обычно собирают в один скрипт бандлером до сборки снимка.

Гарантировать сериализуемость всех встроенных модулей сложно, и их число растёт; лишь часть встроенных модулей надёжно проверена на сериализуемость при сборке снимка. Тесты Node.js проверяют несколько относительно сложных приложений. Список встроенных модулей, [captured by the built-in snapshot of Node.js](https://github.com/nodejs/node/blob/b19525a33cc84033af4addd0f80acd4dc33ce0cf/test/parallel/test-bootstrap-modules.js#L24), считается поддерживаемым. Если при сборке встречается встроенный модуль, который нельзя сериализовать, процесс сборки снимка может аварийно завершиться; типичный обход — отложить загрузку такого модуля до выполнения, через [`v8.startupSnapshot.setDeserializeMainFunction()`][`v8.startupsnapshot.setdeserializemainfunction()`] или [`v8.startupSnapshot.addDeserializeCallback()`][`v8.startupsnapshot.adddeserializecallback()`]. Если нужна сериализация дополнительного модуля при сборке снимка, создайте запрос в [Node.js issue tracker](https://github.com/nodejs/node/issues) и сошлитесь на [tracking issue for user-land snapshots](https://github.com/nodejs/node/issues/44014).

### `--build-snapshot-config`

<!-- YAML
added:
  - v21.6.0
  - v20.12.0
changes:
  - version:
    - v25.4.0
    - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/60954
    description: The snapshot building process is no longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0, v24.13.1 | Процесс создания снимков больше не является экспериментальным. |

Указывает путь к JSON-файлу конфигурации, который задаёт параметры создания снимка.

Поддерживаются такие поля:

-   `builder` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Обязательное. Имя скрипта, который выполняется перед сборкой снимка, как если бы был передан [`--build-snapshot`](#--build-snapshot) с `builder` в качестве основного скрипта.
-   `withoutCodeCache` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Необязательно. Включение кэша кода ускоряет компиляцию функций из снимка, но увеличивает размер и может ухудшить переносимость снимка.

С этим флагом дополнительные файлы скриптов в командной строке не выполняются — они интерпретируются как обычные аргументы.

### `-c`, `--check`

<!-- YAML
added:
  - v5.0.0
  - v4.2.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19600
    description: The `--require` option is now supported when checking a file.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Опция `--require` теперь поддерживается при проверке файла. |

Проверить синтаксис скрипта без выполнения.

### `--completion-bash`

<!-- YAML
added: v10.12.0
-->

Выводит bash-скрипт автодополнения для Node.js, который можно подключить через `source`.

```bash
node --completion-bash > node_bash_completion
source node_bash_completion
```

### `-C condition`, `--conditions=condition`

<!-- YAML
added:
  - v14.9.0
  - v12.19.0
changes:
  - version:
    - v22.9.0
    - v20.18.0
    pr-url: https://github.com/nodejs/node/pull/54209
    description: The flag is no longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.9.0, v20.18.0 | Флаг больше не является экспериментальным. |

Предоставить пользовательские условия разрешения [условных экспортов](packages.md#conditional-exports).

Допускается любое количество пользовательских строковых имён условий.

Условия Node.js по умолчанию — `"node"`, `"default"`, `"import"` и `"require"` — всегда применяются, как задано.

Например, запуск с разрешениями для режима «development»:

```bash
node -C development app.js
```

### `--cpu-prof`

<!-- YAML
added: v12.0.0
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53343
    description: The `--cpu-prof` flags are now stable.
-->

Добавлено в: v12.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | Флаги `--cpu-prof` теперь стабильны. |

Запускает профилировщик CPU V8 при запуске и записывает профиль CPU на диск перед выходом.

Если `--cpu-prof-dir` не указан, созданный профиль помещается в текущий рабочий каталог.

Если `--cpu-prof-name` не указан, созданный профиль называется `CPU.${yyyymmdd}.${hhmmss}.${pid}.${tid}.${seq}.cpuprofile`.

```console
$ node --cpu-prof index.js
$ ls *.cpuprofile
CPU.20190409.202950.15293.0.0.cpuprofile
```

Если `--cpu-prof-name` указан, предоставленное значение используется как шаблон для имени файла. Поддерживается следующий плейсхолдер и он будет заменён во время выполнения:

-   `${pid}` — текущий ID процесса

```console
$ node --cpu-prof --cpu-prof-name 'CPU.${pid}.cpuprofile' index.js
$ ls *.cpuprofile
CPU.15293.cpuprofile
```

### `--cpu-prof-dir`

<!-- YAML
added: v12.0.0
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53343
    description: The `--cpu-prof` flags are now stable.
-->

Добавлено в: v12.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | Флаги `--cpu-prof` теперь стабильны. |

Указывает каталог, в который будут помещаться профили CPU, созданные с помощью `--cpu-prof`.

Значение по умолчанию задаётся параметром командной строки [`--diagnostic-dir`](#--diagnostic-dirdirectory).

### `--cpu-prof-interval`

<!-- YAML
added: v12.2.0
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53343
    description: The `--cpu-prof` flags are now stable.
-->

Добавлено в: v12.2.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | Флаги `--cpu-prof` теперь стабильны. |

Укажите интервал выборки в микросекундах для профилей CPU, генерируемых `--cpu-prof`. По умолчанию — 1000 микросекунд.

### `--cpu-prof-name`

<!-- YAML
added: v12.0.0
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53343
    description: The `--cpu-prof` flags are now stable.
-->

Добавлено в: v12.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | Флаги `--cpu-prof` теперь стабильны. |

Указывает имя файла профиля CPU, созданного с помощью `--cpu-prof`.

### `--diagnostic-dir=directory`

Задаёт каталог, в который записываются все файлы диагностического вывода. По умолчанию используется текущий рабочий каталог.

Влияет на каталог вывода по умолчанию для:

-   [`--cpu-prof-dir`](#--cpu-prof-dir)
-   [`--heap-prof-dir`](#--heap-prof-dir)
-   [`--redirect-warnings`](#--redirect-warningsfile)

### `--disable-proto=mode`

<!-- YAML
added:
 - v13.12.0
 - v12.17.0
-->

Отключает свойство `Object.prototype.__proto__`. Если `mode` равно `delete`, свойство удаляется полностью. Если `mode` равно `throw`, обращения к свойству вызывают исключение с кодом `ERR_PROTO_ACCESS`.

### `--disable-sigusr1`

<!-- YAML
added:
  - v23.7.0
  - v22.14.0
changes:
  - version:
    - v24.8.0
    - v22.20.0
    pr-url: https://github.com/nodejs/node/pull/59707
    description: The option is no longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.8.0, v22.20.0 | Опция больше не является экспериментальной. |

Отключает возможность запуска отладочного сеанса путём отправки сигнала `SIGUSR1` процессу.

### `--disable-warning=code-or-type`

<!-- YAML
added:
  - v21.3.0
  - v20.11.0
-->

> Stability: 1.1 - Active development

Отключает конкретные предупреждения процесса по `code` или `type`.

Предупреждения, выдаваемые через [`process.emitWarning()`](process.md#processemitwarningwarning-options), могут содержать `code` и `type`. Этот параметр подавляет предупреждения с совпадающим `code` или `type`.

Список [предупреждений об устаревании](deprecations.md#list-of-deprecated-apis).

Основные типы предупреждений в Node.js: `DeprecationWarning` и `ExperimentalWarning`

For example, the following script will not emit [DEP0025 `require('node:sys')`](deprecations.md#dep0025-requirenodesys) when executed with `node --disable-warning=DEP0025`:

=== "MJS"

    ```js
    import sys from 'node:sys';
    ```

=== "CJS"

    ```js
    const sys = require('node:sys');
    ```

For example, the following script will emit the [DEP0025 `require('node:sys')`](deprecations.md#dep0025-requirenodesys), but not any Experimental Warnings (such as [ExperimentalWarning: `vm.measureMemory` is an experimental feature](vm.md#vmmeasurememoryoptions) in <=v21) when executed with `node --disable-warning=ExperimentalWarning`:

=== "MJS"

    ```js
    import sys from 'node:sys';
    import vm from 'node:vm';

    vm.measureMemory();
    ```

=== "CJS"

    ```js
    const sys = require('node:sys');
    const vm = require('node:vm');

    vm.measureMemory();
    ```

### `--disable-wasm-trap-handler`

<!-- YAML
added:
- v22.2.0
- v20.15.0
changes:
  - version:
    - REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62132
    description: Node.js now automatically disables the trap handler when there is not
                 enough virtual memory available at startup to allocate one cage.
-->

Добавлено в: v22.2.0, v20.15.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Node.js теперь автоматически отключает trap handler, если при запуске недостаточно виртуальной памяти для выделения одного cage. |

Node.js enables V8's trap-handler-based WebAssembly bound checks on 64-bit platforms, which significantly improves WebAssembly performance by eliminating the need for inline bound checks. This optimization requires allocating a large virtual memory cage per WebAssembly memory instance (currently typically 8GB for 32-bit WebAssembly memory, 16GB for 64-bit WebAssembly memory) to trap out-of-bound accesses. On most 64-bit platforms, the virtual memory address space is usually large enough (around 128TB) to accommodate typical WebAssembly usages, but if the machine has manual limits on virtual memory (e.g. through `ulimit -v`), WebAssembly memory allocation is more likely to fail with `WebAssembly.Memory(): could not allocate memory`.

При запуске Node.js автоматически проверяет, достаточно ли доступной виртуальной памяти для выделения хотя бы одной области, и если нет, то оптимизация trap-handler автоматически отключается, чтобы WebAssembly всё ещё мог выполняться с inline-проверками границ (с менее оптимальной производительностью). Но если приложению нужно создать много экземпляров памяти WebAssembly, а на машине при этом всё ещё установлен относительно высокий лимит виртуальной памяти, выделение памяти для WebAssembly может по-прежнему завершаться ошибкой быстрее, чем ожидается, из-за увеличенного потребления виртуальной памяти.

`--disable-wasm-trap-handler` полностью отключает эту оптимизацию, поэтому экземпляры памяти WebAssembly всегда используют inline-проверки границ вместо резервирования больших областей виртуальной памяти. Это позволяет создавать больше экземпляров, когда доступное процессу Node.js адресное пространство виртуальной памяти ограничено.

### `--disallow-code-generation-from-strings`

<!-- YAML
added: v9.8.0
-->

Заставляет встроенные языковые конструкции, такие как `eval` и `new Function`, которые генерируют код из строк, выбрасывать исключение вместо этого. Это не влияет на модуль Node.js `node:vm`.

### `--dns-result-order=order`

<!-- YAML
added:
  - v16.4.0
  - v14.18.0
changes:
  - version:
    - v22.1.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52492
    description: The `ipv6first` is supported now.
  - version: v17.0.0
    pr-url: https://github.com/nodejs/node/pull/39987
    description: Changed default value to `verbatim`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.1.0, v20.13.0 | `ipv6first` теперь поддерживается. |
    | v17.0.0 | Изменено значение по умолчанию на `verbatim`. |

Задаёт значение по умолчанию для `order` в [`dns.lookup()`][`dns.lookup()`] и [`dnsPromises.lookup()`][`dnspromises.lookup()`]. Возможные значения:

-   `ipv4first`: устанавливает `order` по умолчанию в `ipv4first`.
-   `ipv6first`: устанавливает `order` по умолчанию в `ipv6first`.
-   `verbatim`: устанавливает `order` по умолчанию в `verbatim`.

По умолчанию используется `verbatim`, а [`dns.setDefaultResultOrder()`][`dns.setdefaultresultorder()`] имеет более высокий приоритет, чем `--dns-result-order`.

### `--enable-fips`

<!-- YAML
added: v6.0.0
-->

Включает совместимую с FIPS криптографию при запуске. (Требует сборки Node.js с поддержкой FIPS-совместимого OpenSSL.)

### `--enable-source-maps`

<!-- YAML
added: v12.12.0
changes:
  - version:
      - v15.11.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37362
    description: This API is no longer experimental.
-->

Добавлено в: v12.12.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.11.0, v14.18.0 | Этот API больше не является экспериментальным. |

Включает поддержку [Source Map](https://tc39.es/ecma426/) для трассировок стека.

При использовании транспилятора, такого как TypeScript, трассировки стека, выбрасываемые приложением, ссылаются на транспилированный код, а не на исходную позицию. `--enable-source-maps` включает кэширование Source Maps и делает всё возможное, чтобы сообщать трассировки стека относительно исходного файла.

Переопределение `Error.prepareStackTrace` может предотвратить модификацию трассировки стека `--enable-source-maps`. Вызывайте и возвращайте результаты оригинального `Error.prepareStackTrace` в переопределяющей функции, чтобы модифицировать трассировку стека с помощью source maps.

```js
const originalPrepareStackTrace = Error.prepareStackTrace;
Error.prepareStackTrace = (error, trace) => {
    // Modify error and trace and format stack trace with
    // original Error.prepareStackTrace.
    return originalPrepareStackTrace(error, trace);
};
```

Примечание: Включение source maps может ввести задержку в ваше приложение при доступе к `Error.stack`. Если вы часто обращаетесь к `Error.stack` в вашем приложении, учитывайте влияние на производительность `--enable-source-maps`.

### `--entry-url`

<!-- YAML
added:
  - v23.0.0
  - v22.10.0
-->

> Стабильность: 1 - Экспериментальная

Когда присутствует, Node.js будет интерпретировать точку входа как URL, а не как путь.

Следует правилам разрешения [ECMAScript модулей](esm.md#modules-ecmascript-modules).

Любой параметр запроса или хэш в URL будут доступны через [`import.meta.url`](esm.md#importmetaurl).

```bash
node --entry-url 'file:///path/to/file.js?queryparams=work#and-hashes-too'
node --entry-url 'file.ts?query#hash'
node --entry-url 'data:text/javascript,console.log("Hello")'
```

### `--env-file-if-exists=file`

<!-- YAML
added: v22.9.0
changes:
  - version:
     - v24.10.0
     - v22.21.0
    pr-url: https://github.com/nodejs/node/pull/59925
    description: The `--env-file-if-exists` flag is no longer experimental.
-->

Добавлено в: v22.9.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.10.0, v22.21.0 | Флаг --env-file-if-exists больше не является экспериментальным. |

Поведение такое же, как у [`--env-file`](#--env-filefile), но ошибка не выбрасывается, если файл не существует.

### `--env-file=file`

<!-- YAML
added: v20.6.0
changes:
  - version:
     - v24.10.0
     - v22.21.0
    pr-url: https://github.com/nodejs/node/pull/59925
    description: The `--env-file` flag is no longer experimental.
  - version:
    - v21.7.0
    - v20.12.0
    pr-url: https://github.com/nodejs/node/pull/51289
    description: Add support to multi-line values.
-->

Добавлено в: v20.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.10.0, v22.21.0 | Флаг `--env-file` больше не является экспериментальным. |
    | v21.7.0, v20.12.0 | Добавьте поддержку многострочных значений. |

Загружает переменные окружения из файла относительно текущего каталога, делая их доступными для приложений в `process.env`. [Переменные окружения, которые настраивают Node.js][environment_variables], такие как `NODE_OPTIONS`, анализируются и применяются. Если одна и та же переменная определена в окружении и в файле, приоритет имеет значение из окружения.

Можно передать несколько аргументов `--env-file`. Последующие файлы переопределяют существующие переменные, определённые в предыдущих файлах.

Ошибка выбрасывается, если файл не существует.

```bash
node --env-file=.env --env-file=.development.env index.js
```

Формат файла должен быть таким: одна строка на каждую пару ключ-значение переменной окружения, разделённых символом `=`:

```text
PORT=3000
```

Любой текст после `#` считается комментарием:

```text
# This is a comment
PORT=3000 # This is also a comment
```

Значения могут начинаться и заканчиваться следующими кавычками: `` ` ``, `"` или `'`. В итоговое значение они не входят.

```text
USERNAME="nodejs" # will result in `nodejs` as the value.
```

Multi-line values are supported:

```text
MULTI_LINE="THIS IS
A MULTILINE"
# will result in `THIS IS\nA MULTILINE` as the value.
```

Export keyword before a key is ignored:

```text
export USERNAME="nodejs" # will result in `nodejs` as the value.
```

If you want to load environment variables from a file that may not exist, you can use the [`--env-file-if-exists`](#--env-file-if-existsfile) flag instead.

### `-e`, `--eval "script"`

<!-- YAML
added: v0.5.2
changes:
  - version: v22.6.0
    pr-url: https://github.com/nodejs/node/pull/53725
    description: Eval now supports experimental type-stripping.
  - version: v5.11.0
    pr-url: https://github.com/nodejs/node/pull/5348
    description: Built-in libraries are now available as predefined variables.
-->

Добавлено в: v0.5.2

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.6.0 | Eval теперь поддерживает экспериментальное удаление типов. |
    | v5.11.0 | Встроенные библиотеки теперь доступны как предопределенные переменные. |

Оценивает следующий аргумент как JavaScript. Модули, которые предопределены в REPL, также могут использоваться в `script`.

Если `script` начинается с `-`, передайте его с помощью `=` (например, `node --print --eval=-42`), чтобы он был проанализирован как значение `--eval`.

В Windows, используя `cmd.exe`, одинарная кавычка не будет работать правильно, потому что она распознаёт только двойные `"` для цитирования. В Powershell или Git bash, оба `'` и `"` пригодны для использования.

Возможно запускать код, содержащий встроенные типы, если не предоставлен флаг [`--no-strip-types`](#--no-strip-types).

### `--experimental-addon-modules`

<!-- YAML
added:
  - v23.6.0
  - v22.20.0
-->

> Stability: 1.0 - Early development

Включает экспериментальную поддержку импорта для аддонов `.node`.

### `--experimental-config-file=config`

<!-- YAML
added:
 - v23.10.0
 - v22.16.0
-->

> Stability: 1.0 - Early development

Если присутствует, Node.js будет искать файл конфигурации по указанному пути. Node.js прочитает файл конфигурации и применит настройки. Файл конфигурации должен быть JSON-файлом со следующей структурой. `vX.Y.Z` в `$schema` должен быть заменён на версию Node.js, которую вы используете.

```json
{
    "$schema": "https://nodejs.org/dist/vX.Y.Z/docs/node-config-schema.json",
    "nodeOptions": {
        "import": ["amaro/strip"],
        "watch-path": "src",
        "watch-preserve-output": true
    },
    "test": {
        "test-isolation": "process"
    },
    "watch": {
        "watch-preserve-output": true
    }
}
```

Файл конфигурации поддерживает параметры, специфичные для пространств имён:

-   Поле `nodeOptions` содержит CLI-флаги, разрешённые в [`NODE_OPTIONS`](#node_optionsoptions).

-   Поля пространств имён, такие как `test`, `watch` и `permission`, содержат конфигурацию, специфичную для соответствующей подсистемы.

Когда пространство имён присутствует в файле конфигурации, Node.js автоматически включает соответствующий флаг (например, `--test`, `--watch`, `--permission`). Это позволяет настраивать параметры конкретной подсистемы без явной передачи флага в командной строке.

Например:

```json
{
    "test": {
        "test-isolation": "process"
    }
}
```

эквивалентно:

```bash
node --test --test-isolation=process
```

Чтобы отключить автоматический флаг, продолжая использовать параметры пространства имён, вы можете явно установить флаг в `false` в пространстве имён:

```json
{
    "test": {
        "test": false,
        "test-isolation": "process"
    }
}
```

No-op флаги не поддерживаются. Не все флаги V8 в настоящее время поддерживаются.

Возможно использовать [официальную JSON-схему](../node-config-schema.json) для валидации файла конфигурации, которая может варьироваться в зависимости от версии Node.js. Каждый ключ в файле конфигурации соответствует флагу, который можно передать как аргумент командной строки. Значение ключа — это значение, которое будет передано флагу.

Например, приведённый выше файл конфигурации эквивалентен следующим аргументам командной строки:

```bash
node --import amaro/strip --watch-path=src --watch-preserve-output --test-isolation=process
```

Приоритет конфигурации таков:

1. `NODE_OPTIONS` и параметры командной строки
2. Файл конфигурации
3. `NODE_OPTIONS` из dotenv-файла

Значения из файла конфигурации не переопределяют значения из переменных окружения и параметров командной строки, но переопределяют значения из файла `NODE_OPTIONS`, разобранного флагом `--env-file`.

Ключи не могут дублироваться в том же или разных пространствах имён.

Парсер конфигурации выдаст ошибку, если файл конфигурации содержит неизвестные ключи или ключи, которые нельзя использовать в пространстве имён.

Node.js не очищает и не валидирует пользовательскую конфигурацию, поэтому **НИКОГДА** не используйте недоверенные файлы конфигурации.

### `--experimental-default-config-file`

<!-- YAML
added:
 - v23.10.0
 - v22.16.0
-->

> Stability: 1.0 - Early development

Если флаг `--experimental-default-config-file` присутствует, Node.js будет искать файл `node.config.json` в текущем рабочем каталоге и загрузит его как файл конфигурации.

### `--experimental-eventsource`

<!-- YAML
added:
  - v22.3.0
  - v20.18.0
-->

Включает экспозицию [EventSource Web API](https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events) в глобальную область видимости.

### `--experimental-import-meta-resolve`

<!-- YAML
added:
  - v13.9.0
  - v12.16.2
changes:
  - version:
    - v20.6.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/49028
    description: synchronous import.meta.resolve made available by default, with
                 the flag retained for enabling the experimental second argument
                 as previously supported.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.6.0, v18.19.0 | синхронный import.meta.resolve доступен по умолчанию, с сохраненным флагом для включения экспериментального второго аргумента, как это поддерживалось ранее. |

Включает экспериментальную поддержку `import.meta.resolve()` для родительского URL, которая позволяет передавать второй аргумент `parentURL` для контекстного разрешения.

Ранее блокировала всю функцию `import.meta.resolve`.

### `--experimental-inspector-network-resource`

<!-- YAML
added:
  - v24.5.0
  - v22.19.0
-->

> Stability: 1.1 - Active Development

Включает экспериментальную поддержку сетевых ресурсов инспектора.

### `--experimental-loader=module`

<!-- YAML
added: v8.8.0
changes:
  - version:
    - v23.6.1
    - v22.13.1
    - v20.18.2
    pr-url: https://github.com/nodejs-private/node-private/pull/629
    description: Using this feature with the permission model enabled requires
                 passing `--allow-worker`.
  - version: v12.11.1
    pr-url: https://github.com/nodejs/node/pull/29752
    description: This flag was renamed from `--loader` to
                 `--experimental-loader`.
-->

Добавлено в: v8.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.6.1, v22.13.1, v20.18.2 | Для использования этой функции с включенной моделью разрешений требуется передать --allow-worker. |
    | v12.11.1 | Этот флаг был переименован с `--loader` на `--experimental-loader`. |

> Этот флаг не рекомендуется и может быть удалён в будущей версии Node.js. Вместо этого используйте [`--import` с `register()`](module.md#registration-of-asynchronous-customization-hooks).

Указывает `module`, содержащий экспортируемые [асинхронные хуки настройки модулей](module.md#asynchronous-customization-hooks). `module` может быть любой строкой, допустимой в качестве [`import`-спецификатора](esm.md#import-specifiers).

Для использования этой возможности с [моделью разрешений](permissions.md#permission-model) требуется `--allow-worker`.

### `--experimental-network-inspection`

<!-- YAML
added:
  - v22.6.0
  - v20.18.0
-->

> Стабильность: 1 - Экспериментальная

Включает экспериментальную поддержку сетевой инспекции с Chrome DevTools.

### `--experimental-print-required-tla`

<!-- YAML
added:
  - v22.0.0
  - v20.17.0
-->

Если ES-модуль, который `require()`'d, содержит `await` верхнего уровня, этот флаг позволяет Node.js оценить модуль, попытаться найти верхние await, и вывести их местоположение, чтобы помочь пользователям найти их.

### `--experimental-quic`

<!-- YAML
added: v25.0.0
-->

> Stability: 1.1 - Active development

Включает экспериментальную поддержку протокола QUIC.

### `--experimental-sea-config`

<!-- YAML
added: v20.0.0
-->

> Stability: 1 - Experimental

Используйте этот флаг для генерации blob, который можно внедрить в бинарный файл Node.js для создания [одного исполняемого приложения](single-executable-applications.md). См. документацию о [этой конфигурации](single-executable-applications.md#1-generating-single-executable-preparation-blobs) для деталей.

### `--experimental-shadow-realm`

<!-- YAML
added:
  - v19.0.0
  - v18.13.0
-->

Используйте этот флаг для включения поддержки [ShadowRealm](https://github.com/tc39/proposal-shadowrealm).

### `--experimental-storage-inspection`

<!-- YAML
added:
  - v25.5.0
-->

> Stability: 1.1 - Active Development

Включает экспериментальную поддержку инспекции хранилища

### `--experimental-stream-iter`

<!-- YAML
added: v25.9.0
-->

> Stability: 1 - Experimental

Включает экспериментальный модуль [`node:stream/iter`](stream_iter.md).

### `--experimental-test-coverage`

<!-- YAML
added:
  - v19.7.0
  - v18.15.0
changes:
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47686
    description: This option can be used with `--test`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.1.0, v18.17.0 | Эту опцию можно использовать с --test. |

When used in conjunction with the `node:test` module, a code coverage report is generated as part of the test runner output. If no tests are run, a coverage report is not generated. See the documentation on [collecting code coverage from tests](test.md#collecting-code-coverage) for more details.

### `--experimental-test-module-mocks`

<!-- YAML
added:
  - v22.3.0
  - v20.18.0
changes:
  - version:
    - v23.6.1
    - v22.13.1
    - v20.18.2
    pr-url: https://github.com/nodejs-private/node-private/pull/629
    description: Using this feature with the permission model enabled requires
                 passing `--allow-worker`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.6.1, v22.13.1, v20.18.2 | Для использования этой функции с включенной моделью разрешений требуется передать --allow-worker. |

> Стабильность: 1.0 - Ранняя разработка

Включает подмену модулей в средстве запуска тестов.

Для использования этой возможности с [моделью разрешений](permissions.md#permission-model) требуется `--allow-worker`.

### `--experimental-vm-modules`

<!-- YAML
added: v9.6.0
-->

Включает экспериментальную поддержку ES-модулей в модуле `node:vm`.

### `--experimental-wasi-unstable-preview1`

<!-- YAML
added:
  - v13.3.0
  - v12.16.0
changes:
  - version:
    - v20.0.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47286
    description: This option is no longer required as WASI is
                 enabled by default, but can still be passed.
  - version: v13.6.0
    pr-url: https://github.com/nodejs/node/pull/30980
    description: changed from `--experimental-wasi-unstable-preview0` to
                 `--experimental-wasi-unstable-preview1`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0, v18.17.0 | Этот параметр больше не требуется, поскольку WASI включен по умолчанию, но его все равно можно передать. |
    | v13.6.0 | изменен с `--experimental-wasi-unstable-preview0` на `--experimental-wasi-unstable-preview1`. |

Включает экспериментальную поддержку WebAssembly System Interface (WASI).

### `--experimental-worker-inspection`

<!-- YAML
added:
  - v24.1.0
  - v22.17.0
-->

> Stability: 1.1 - Active Development

Включает экспериментальную поддержку инспекции worker с Chrome DevTools.

### `--expose-gc`

<!-- YAML
added:
  - v22.3.0
  - v20.18.0
-->

> Стабильность: 1 - Экспериментальная. Этот флаг унаследован от V8 и может измениться в upstream.

Этот флаг делает доступным расширение `gc` из V8.

```js
if (globalThis.gc) {
    globalThis.gc();
}
```

### `--force-context-aware`

<!-- YAML
added: v12.12.0
-->

Отключает загрузку нативных аддонов, которые не являются [context-aware](addons.md#context-aware-addons).

### `--force-fips`

<!-- YAML
added: v6.0.0
-->

Force FIPS-compliant crypto on startup. (Cannot be disabled from script code.) (Same requirements as `--enable-fips`.)

### `--force-node-api-uncaught-exceptions-policy`

<!-- YAML
added:
  - v18.3.0
  - v16.17.0
-->

Принуждает событие `uncaughtException` для асинхронных обратных вызовов Node-API.

Чтобы предотвратить сбой процесса из-за существующего аддона, этот флаг по умолчанию не включён. В будущем этот флаг будет включён по умолчанию для принуждения правильного поведения.

### `--frozen-intrinsics`

<!-- YAML
added: v11.12.0
-->

> Stability: 1 - Experimental

Включает экспериментальные замороженные intrinsics, такие как `Array` и `Object`.

Поддерживается только корневой контекст. Нет гарантии, что `globalThis.Array` действительно является ссылкой на intrinsic по умолчанию. Код может сломаться под этим флагом.

Чтобы позволить добавлять полифиллы, [`--require`](#-r---require-module) и [`--import`](#--importmodule) оба запускаются до заморозки intrinsics.

### `--heap-prof`

<!-- YAML
added: v12.4.0
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53343
    description: The `--heap-prof` flags are now stable.
-->

Добавлено в: v12.4.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | Флаги `--heap-prof` теперь стабильны. |

Starts the V8 heap profiler on start up, and writes the heap profile to disk before exit.

If `--heap-prof-dir` is not specified, the generated profile is placed in the current working directory.

If `--heap-prof-name` is not specified, the generated profile is named `Heap.${yyyymmdd}.${hhmmss}.${pid}.${tid}.${seq}.heapprofile`.

```console
$ node --heap-prof index.js
$ ls *.heapprofile
Heap.20190409.202950.15293.0.001.heapprofile
```

### `--heap-prof-dir`

<!-- YAML
added: v12.4.0
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53343
    description: The `--heap-prof` flags are now stable.
-->

Добавлено в: v12.4.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | Флаги `--heap-prof` теперь стабильны. |

Указывает каталог, в который будут помещаться профили кучи, созданные с помощью `--heap-prof`.

Значение по умолчанию задаётся параметром командной строки [`--diagnostic-dir`](#--diagnostic-dirdirectory).

### `--heap-prof-interval`

<!-- YAML
added: v12.4.0
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53343
    description: The `--heap-prof` flags are now stable.
-->

Добавлено в: v12.4.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | Флаги `--heap-prof` теперь стабильны. |

Specify the average sampling interval in bytes for the heap profiles generated by `--heap-prof`. The default is 512 \* 1024 bytes.

### `--heap-prof-name`

<!-- YAML
added: v12.4.0
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53343
    description: The `--heap-prof` flags are now stable.
-->

Добавлено в: v12.4.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | Флаги `--heap-prof` теперь стабильны. |

Specify the file name of the heap profile generated by `--heap-prof`.

### `--heapsnapshot-near-heap-limit=max_count`

<!-- YAML
added:
  - v15.1.0
  - v14.18.0
changes:
  - version:
    - v25.4.0
    - v24.13.1
    - v22.22.1
    pr-url: https://github.com/nodejs/node/pull/60956
    description: The flag is no longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0, v24.13.1, v22.22.1 | Флаг больше не является экспериментальным. |

Writes a V8 heap snapshot to disk when the V8 heap usage is approaching the heap limit. `count` should be a non-negative integer (in which case Node.js will write no more than `max_count` snapshots to disk).

When generating snapshots, garbage collection may be triggered and bring the heap usage down. Therefore multiple snapshots may be written to disk before the Node.js instance finally runs out of memory. These heap snapshots can be compared to determine what objects are being allocated during the time consecutive snapshots are taken. It's not guaranteed that Node.js will write exactly `max_count` snapshots to disk, but it will try its best to generate at least one and up to `max_count` snapshots before the Node.js instance runs out of memory when `max_count` is greater than `0`.

Generating V8 snapshots takes time and memory (both memory managed by the V8 heap and native memory outside the V8 heap). The bigger the heap is, the more resources it needs. Node.js will adjust the V8 heap to accommodate the additional V8 heap memory overhead, and try its best to avoid using up all the memory available to the process. When the process uses more memory than the system deems appropriate, the process may be terminated abruptly by the system, depending on the system configuration.

```console
$ node --max-old-space-size=100 --heapsnapshot-near-heap-limit=3 index.js
Wrote snapshot to Heap.20200430.100036.49580.0.001.heapsnapshot
Wrote snapshot to Heap.20200430.100037.49580.0.002.heapsnapshot
Wrote snapshot to Heap.20200430.100038.49580.0.003.heapsnapshot

<--- Last few GCs --->

[49580:0x110000000]     4826 ms: Mark-sweep 130.6 (147.8) -> 130.5 (147.8) MB, 27.4 / 0.0 ms  (average mu = 0.126, current mu = 0.034) allocation failure scavenge might not succeed
[49580:0x110000000]     4845 ms: Mark-sweep 130.6 (147.8) -> 130.6 (147.8) MB, 18.8 / 0.0 ms  (average mu = 0.088, current mu = 0.031) allocation failure scavenge might not succeed


<--- JS stacktrace --->

FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
....
```

### `--heapsnapshot-signal=signal`

<!-- YAML
added: v12.0.0
-->

Enables a signal handler that causes the Node.js process to write a heap dump when the specified signal is received. `signal` must be a valid signal name. Disabled by default.

```console
$ node --heapsnapshot-signal=SIGUSR2 index.js &
$ ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
node         1  5.5  6.1 787252 247004 ?       Ssl  16:43   0:02 node --heapsnapshot-signal=SIGUSR2 index.js
$ kill -USR2 1
$ ls
Heap.20190718.133405.15554.0.001.heapsnapshot
```

### `-h`, `--help`

<!-- YAML
added: v0.1.3
-->

Выводит параметры командной строки `node`. Вывод этой опции менее подробен, чем этот документ.

### `--icu-data-dir=file`

<!-- YAML
added: v0.11.15
-->

Указывает путь загрузки данных ICU. (Переопределяет `NODE_ICU_DATA`.)

### `--import=module`

<!-- YAML
added:
 - v19.0.0
 - v18.18.0
-->

> Stability: 1 - Experimental

Preload the specified module at startup. If the flag is provided several times, each module will be executed sequentially in the order they appear, starting with the ones provided in [`NODE_OPTIONS`](#node_optionsoptions).

Follows [ECMAScript module](esm.md#modules-ecmascript-modules) resolution rules. Use [`--require`](#-r---require-module) to load a [CommonJS module](modules.md). Modules preloaded with `--require` will run before modules preloaded with `--import`.

Modules are preloaded into the main thread as well as any worker threads, forked processes, or clustered processes.

### `--input-type=type`

<!-- YAML
added: v12.0.0
changes:
  - version:
      - v23.6.0
      - v22.18.0
    pr-url: https://github.com/nodejs/node/pull/56350
    description: Add support for `-typescript` values.
  - version:
    - v22.7.0
    - v20.19.0
    pr-url: https://github.com/nodejs/node/pull/53619
    description: ESM syntax detection is enabled by default.
-->

Добавлено в: v12.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.6.0, v22.18.0 | Добавить поддержку значений `-typescript`. |
    | v22.7.0, v20.19.0 | Обнаружение синтаксиса ESM включено по умолчанию. |

Этот параметр указывает Node.js интерпретировать ввод из `--eval` или `STDIN` как CommonJS либо как ES-модуль. Допустимые значения: `"commonjs"`, `"module"`, `"module-typescript"` и `"commonjs-typescript"`. Значения с `"-typescript"` недоступны при использовании флага `--no-strip-types`. По умолчанию значение не задано, либо используется `"commonjs"`, если передан `--no-experimental-detect-module`.

Если `--input-type` не указан, Node.js попытается определить синтаксис следующим образом:

1. Запустить ввод как CommonJS.
2. Если шаг 1 завершился неудачей, запустить ввод как ES-модуль.
3. Если шаг 2 завершился с `SyntaxError`, удалить типы.
4. Если шаг 3 завершился с кодом ошибки [`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`](errors.md#err_unsupported_typescript_syntax) или [`ERR_INVALID_TYPESCRIPT_SYNTAX`](errors.md#err_invalid_typescript_syntax), выбросить ошибку из шага 2, включив в сообщение ошибку TypeScript, иначе выполнить как CommonJS.
5. Если шаг 4 завершился неудачей, выполнить ввод как ES-модуль.

Чтобы избежать задержки из-за нескольких проходов определения синтаксиса, можно использовать флаг `--input-type=type`, чтобы явно указать, как следует интерпретировать ввод `--eval`.

REPL не поддерживает этот параметр. Использование `--input-type=module` совместно с [`--print`](#-p---print-script) приведёт к ошибке, так как `--print` не поддерживает синтаксис ES-модулей.

### `--insecure-http-parser`

<!-- YAML
added:
 - v13.4.0
 - v12.15.0
 - v10.19.0
-->

Включает флаги более мягкой обработки в HTTP-парсере. Это может обеспечить совместимость с не полностью корректными HTTP-реализациями.

При включении парсер будет принимать следующее:

-   недопустимые значения HTTP-заголовков;
-   недопустимые версии HTTP;
-   сообщения, содержащие одновременно заголовки `Transfer-Encoding` и `Content-Length`;
-   дополнительные данные после сообщения при наличии `Connection: close`;
-   дополнительные transfer-encoding после уже указанного `chunked`;
-   использование `\n` в качестве разделителя токенов вместо `\r\n`;
-   отсутствие `\r\n` после чанка;
-   наличие пробелов после размера чанка и перед `\r\n`.

Всё перечисленное выше делает приложение уязвимым к атакам request smuggling или poisoning. Избегайте использования этого параметра.

### `--inspect-brk[=[host:]port]`

<!-- YAML
added: v7.6.0
-->

Activate inspector on `host:port` and break at start of user script. Default `host:port` is `127.0.0.1:9229`. If port `0` is specified, a random available port will be used.

See [V8 Inspector integration for Node.js](debugger.md#v8-inspector-integration-for-nodejs) for further explanation on Node.js debugger.

See the [security warning](#warning-binding-inspector-to-a-public-ipport-combination-is-insecure) below regarding the `host` parameter usage.

### `--inspect-port=[host:]port`

<!-- YAML
added: v7.6.0
-->

Задаёт `host:port`, которые будут использоваться при активации инспектора. Полезно при активации инспектора отправкой сигнала `SIGUSR1`, кроме случаев, когда передан [`--disable-sigusr1`](#--disable-sigusr1).

Хост по умолчанию: `127.0.0.1`. Если указан порт `0`, будет использован случайный доступный порт.

Ознакомьтесь с приведённым ниже [предупреждением о безопасности](#warning-binding-inspector-to-a-public-ipport-combination-is-insecure) относительно использования параметра `host`.

### `--inspect-publish-uid=stderr,http`

Specify ways of the inspector web socket url exposure.

By default inspector websocket url is available in stderr and under `/json/list` endpoint on `http://host:port/json/list`.

### `--inspect-wait[=[host:]port]`

<!-- YAML
added:
  - v22.2.0
  - v20.15.0
-->

Activate inspector on `host:port` and wait for debugger to be attached. Default `host:port` is `127.0.0.1:9229`. If port `0` is specified, a random available port will be used.

See [V8 Inspector integration for Node.js](debugger.md#v8-inspector-integration-for-nodejs) for further explanation on Node.js debugger.

See the [security warning](#warning-binding-inspector-to-a-public-ipport-combination-is-insecure) below regarding the `host` parameter usage.

### `--inspect[=[host:]port]`

<!-- YAML
added: v6.3.0
-->

Activate inspector on `host:port`. Default is `127.0.0.1:9229`. If port `0` is specified, a random available port will be used.

V8 inspector integration allows tools such as Chrome DevTools and IDEs to debug and profile Node.js instances. The tools attach to Node.js instances via a tcp port and communicate using the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/). See [V8 Inspector integration for Node.js](debugger.md#v8-inspector-integration-for-nodejs) for further explanation on Node.js debugger.

<!-- Anchor to make sure old links find a target -->

#### Warning: binding inspector to a public IP:port combination is insecure {#inspector_security}

Binding the inspector to a public IP (including `0.0.0.0`) with an open port is insecure, as it allows external hosts to connect to the inspector and perform a [remote code execution](https://www.owasp.org/index.php/Code_Injection) attack.

If specifying a host, make sure that either:

-   The host is not accessible from public networks.
-   A firewall disallows unwanted connections on the port.

**More specifically, `--inspect=0.0.0.0` is insecure if the port (`9229` by default) is not firewall-protected.**

See the [debugging security implications](https://nodejs.org/en/docs/guides/debugging-getting-started/#security-implications) section for more information.

### `-i`, `--interactive`

<!-- YAML
added: v0.7.7
-->

Opens the REPL even if stdin does not appear to be a terminal.

### `--jitless`

<!-- YAML
added: v12.0.0
-->

> Stability: 1 - Experimental. This flag is inherited from V8 and is subject to change upstream.

Disable [runtime allocation of executable memory](https://v8.dev/blog/jitless). This may be required on some platforms for security reasons. It can also reduce attack surface on other platforms, but the performance impact may be severe.

### `--localstorage-file=file`

<!-- YAML
added: v22.4.0
-->

> Стабильность: 1.2 - Кандидат на выпуск.

Файл, используемый для хранения данных `localStorage`. Если файл не существует, он создаётся при первом обращении к `localStorage`. Один и тот же файл может одновременно использоваться несколькими процессами Node.js.

### `--max-http-header-size=size`

<!-- YAML
added:
 - v11.6.0
 - v10.15.0
changes:
  - version: v13.13.0
    pr-url: https://github.com/nodejs/node/pull/32520
    description: Change maximum default size of HTTP headers from 8 KiB to 16 KiB.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.13.0 | Измените максимальный размер HTTP-заголовков по умолчанию с 8 КБ до 16 КБ. |

Указывает максимальный размер HTTP-заголовков в байтах. По умолчанию: 16 KiB.

### `--max-old-space-size-percentage=percentage`

Устанавливает максимальный размер старой области памяти V8 как процент от доступной системной памяти. Этот флаг имеет приоритет над `--max-old-space-size`, если указаны оба.

Параметр `percentage` должен быть числом больше 0 и не больше 100 и задаёт процент доступной системной памяти, выделяемой под кучу V8.

**Примечание:** Этот флаг использует `--max-old-space-size`, который может быть ненадёжен на 32-битных платформах из-за переполнения целых чисел.

```bash
# Using 50% of available system memory
node --max-old-space-size-percentage=50 index.js

# Using 75% of available system memory
node --max-old-space-size-percentage=75 index.js
```

### `--napi-modules`

<!-- YAML
added: v7.10.0
-->

Этот параметр ничего не делает. Он сохранён для совместимости.

### `--network-family-autoselection-attempt-timeout`

<!-- YAML
added:
  - v22.1.0
  - v20.13.0
-->

Задаёт значение по умолчанию для тайм-аута попытки автоподбора сетевого семейства. Подробнее см. в [`net.getDefaultAutoSelectFamilyAttemptTimeout()`][`net.getdefaultautoselectfamilyattempttimeout()`].

### `--no-addons`

<!-- YAML
added:
  - v16.10.0
  - v14.19.0
-->

Disable the `node-addons` exports condition as well as disable loading native addons. When `--no-addons` is specified, calling `process.dlopen` or requiring a native C++ addon will fail and throw an exception.

### `--no-async-context-frame`

<!-- YAML
added: v24.0.0
-->

Disables the use of [`AsyncLocalStorage`](async_context.md#class-asynclocalstorage) backed by `AsyncContextFrame` and uses the prior implementation which relied on async_hooks. The previous model is retained for compatibility with Electron and for cases where the context flow may differ. However, if a difference in flow is found please report it.

### `--no-deprecation`

<!-- YAML
added: v0.8.0
-->

Silence deprecation warnings.

### `--no-experimental-detect-module`

<!-- YAML
added:
  - v21.1.0
  - v20.10.0
changes:
  - version:
    - v22.7.0
    - v20.19.0
    pr-url: https://github.com/nodejs/node/pull/53619
    description: Syntax detection is enabled by default.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.7.0, v20.19.0 | Обнаружение синтаксиса включено по умолчанию. |

Disable using [syntax detection](packages.md#syntax-detection) to determine module type.

### `--no-experimental-global-navigator`

<!-- YAML
added: v21.2.0
-->

> Stability: 1 - Experimental

Disable exposition of [Navigator API](globals.md#navigator) on the global scope.

### `--no-experimental-repl-await`

<!-- YAML
added: v16.6.0
-->

Use this flag to disable top-level await in REPL.

### `--no-experimental-require-module`

<!-- YAML
added:
  - v22.0.0
  - v20.17.0
changes:
  - version:
    - v25.4.0
    pr-url: https://github.com/nodejs/node/pull/60959
    description: The flag was renamed from `--no-experimental-require-module` to
                 `--no-require-module`, with the former marked as legacy.
  - version:
    - v23.0.0
    - v22.12.0
    - v20.19.0
    pr-url: https://github.com/nodejs/node/pull/55085
    description: This is now false by default.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0 | Флаг был переименован с `--no-experimental-require-module` на `--no-require-module`, причем первый флаг помечен как устаревший. |
    | v23.0.0, v22.12.0, v20.19.0 | Теперь это ложь по умолчанию. |

> Stability: 3 - Legacy: Use [`--no-require-module`](#--no-require-module) instead.

Legacy alias for [`--no-require-module`](#--no-require-module).

### `--no-experimental-sqlite`

<!-- YAML
added: v22.5.0
changes:
  - version:
    - v23.4.0
    - v22.13.0
    pr-url: https://github.com/nodejs/node/pull/55890
    description: SQLite is unflagged but still experimental.
-->

Добавлено в: v22.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.4.0, v22.13.0 | SQLite не помечен, но все еще является экспериментальным. |

Disable the experimental [`node:sqlite`](sqlite.md) module.

### `--no-experimental-websocket`

<!-- YAML
added: v22.0.0
-->

Disable exposition of [WebSocket](globals.md) on the global scope.

### `--no-experimental-webstorage`

<!-- YAML
added: v22.4.0
changes:
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/57666
    description: The feature is now enabled by default.
-->

Добавлено в: v22.4.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.0.0 | Теперь эта функция включена по умолчанию. |

> Stability: 1.2 - Release candidate.

Disable [`Web Storage`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) support.

### `--no-extra-info-on-fatal-exception`

<!-- YAML
added: v17.0.0
-->

Hide extra information on fatal exception that causes exit.

### `--no-force-async-hooks-checks`

<!-- YAML
added: v9.0.0
-->

Disables runtime checks for `async_hooks`. These will still be enabled dynamically when `async_hooks` is enabled.

### `--no-global-search-paths`

<!-- YAML
added: v16.10.0
-->

Do not search modules from global paths like `$HOME/.node_modules` and `$NODE_PATH`.

### `--no-network-family-autoselection`

<!-- YAML
added: v19.4.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/46790
    description: The flag was renamed from `--no-enable-network-family-autoselection`
                 to `--no-network-family-autoselection`. The old name can still work as
                 an alias.
-->

Добавлено в: v19.4.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Флаг был переименован с --no-enable-network-family-autoselection` на `--no-network-family-autoselection`. Старое имя по-прежнему может работать как псевдоним. |

Disables the family autoselection algorithm unless connection options explicitly enables it.

### `--no-require-module` {#--experimental-require-module}

<!-- YAML
added:
  - v22.0.0
  - v20.17.0
changes:
  - version:
    - v25.4.0
    pr-url: https://github.com/nodejs/node/pull/60959
    description: This flag is no longer experimental.
  - version:
    - v25.4.0
    pr-url: https://github.com/nodejs/node/pull/60959
    description: This flag was renamed from `--no-experimental-require-module`
                 to `--no-require-module`.
  - version:
    - v23.0.0
    - v22.12.0
    - v20.19.0
    pr-url: https://github.com/nodejs/node/pull/55085
    description: This is now false by default.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0 | Этот флаг больше не является экспериментальным. |
    | v25.4.0 | Этот флаг был переименован с `--no-experimental-require-module` на `--no-require-module`. |
    | v23.0.0, v22.12.0, v20.19.0 | Теперь это ложь по умолчанию. |

Disable support for loading a synchronous ES module graph in `require()`.

See [Loading ECMAScript modules using `require()`](modules.md#loading-ecmascript-modules-using-require).

### `--no-strip-types`

<!-- YAML
added: v22.6.0
changes:
  - version:
      - v25.2.0
      - v24.12.0
    pr-url: https://github.com/nodejs/node/pull/60600
    description: Type stripping is now stable, the flag was renamed from
                 `--no-experimental-strip-types` to `--no-strip-types`.
  - version:
      - v23.6.0
      - v22.18.0
    pr-url: https://github.com/nodejs/node/pull/56350
    description: Type stripping is enabled by default.
-->

Добавлено в: v22.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.2.0, v24.12.0 | Удаление типов теперь стабильно, флаг был переименован с `--no-experimental-strip-types` на `--no-strip-types`. |
    | v23.6.0, v22.18.0 | Удаление типов включено по умолчанию. |

Disable type-stripping for TypeScript files. For more information, see the [TypeScript type-stripping](typescript.md#type-stripping) documentation.

### `--no-warnings`

<!-- YAML
added: v6.0.0
-->

Silence all process warnings (including deprecations).

### `--node-memory-debug`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

Enable extra debug checks for memory leaks in Node.js internals. This is usually only useful for developers debugging Node.js itself.

### `--openssl-config=file`

<!-- YAML
added: v6.9.0
-->

Load an OpenSSL configuration file on startup. Among other uses, this can be used to enable FIPS-compliant crypto if Node.js is built against FIPS-enabled OpenSSL.

### `--openssl-legacy-provider`

<!-- YAML
added:
  - v17.0.0
  - v16.17.0
-->

Enable OpenSSL 3.0 legacy provider. For more information please see [OSSL_PROVIDER-legacy](https://www.openssl.org/docs/man3.0/man7/OSSL_PROVIDER-legacy.html).

### `--openssl-shared-config`

<!-- YAML
added:
  - v18.5.0
  - v16.17.0
  - v14.21.0
-->

Включает чтение раздела конфигурации OpenSSL по умолчанию `openssl_conf` из конфигурационного файла OpenSSL. Файл конфигурации по умолчанию называется `openssl.cnf`, но это можно изменить с помощью переменной окружения `OPENSSL_CONF` или параметра командной строки `--openssl-config`. Расположение конфигурационного файла OpenSSL по умолчанию зависит от того, каким образом OpenSSL подключён к Node.js. Совместное использование конфигурации OpenSSL может иметь нежелательные последствия, поэтому рекомендуется использовать специфичный для Node.js раздел `nodejs_conf`, который и применяется по умолчанию, если этот параметр не используется.

### `--pending-deprecation`

<!-- YAML
added: v8.0.0
-->

Выводит ожидающие предупреждения об устаревании.

Ожидающие предупреждения об устаревании в целом идентичны предупреждениям времени выполнения, за исключением того, что по умолчанию они _выключены_ и не выводятся, если не установлен либо флаг командной строки `--pending-deprecation`, либо переменная окружения `NODE_PENDING_DEPRECATION=1`. Они служат своего рода выборочным механизмом "раннего предупреждения", который разработчики могут использовать для обнаружения применения устаревших API.

### `--permission`

<!-- YAML
added: v20.0.0
changes:
  - version:
    - v23.5.0
    - v22.13.0
    pr-url: https://github.com/nodejs/node/pull/56201
    description: Permission Model is now stable.
-->

Добавлено в: v20.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.5.0, v22.13.0 | Модель разрешений теперь стабильна. |

Enable the Permission Model for current process. When enabled, the following permissions are restricted:

-   File System - manageable through [`--allow-fs-read`](#--allow-fs-read), [`--allow-fs-write`](#--allow-fs-write) flags
-   Network - manageable through [`--allow-net`](#--allow-net) flag
-   Child Process - manageable through [`--allow-child-process`](#--allow-child-process) flag
-   Worker Threads - manageable through [`--allow-worker`](#--allow-worker) flag
-   WASI - manageable through [`--allow-wasi`](#--allow-wasi) flag
-   Addons - manageable through [`--allow-addons`](#--allow-addons) flag

### `--permission-audit`

<!-- YAML
added: v25.8.0
-->

Enable audit only for the permission model. When enabled, permission checks are performed but access is not denied. Instead, a warning is emitted for each permission violation via diagnostics channel.

### `--preserve-symlinks`

<!-- YAML
added: v6.3.0
-->

Instructs the module loader to preserve symbolic links when resolving and caching modules.

By default, when Node.js loads a module from a path that is symbolically linked to a different on-disk location, Node.js will dereference the link and use the actual on-disk "real path" of the module as both an identifier and as a root path to locate other dependency modules. In most cases, this default behavior is acceptable. However, when using symbolically linked peer dependencies, as illustrated in the example below, the default behavior causes an exception to be thrown if `moduleA` attempts to require `moduleB` as a peer dependency:

```text
{appDir}
 ├── app
 │   ├── index.js
 │   └── node_modules
 │       ├── moduleA -> {appDir}/moduleA
 │       └── moduleB
 │           ├── index.js
 │           └── package.json
 └── moduleA
     ├── index.js
     └── package.json
```

Флаг командной строки `--preserve-symlinks` заставляет Node.js использовать для модулей путь символьной ссылки вместо реального пути, что позволяет находить peer-зависимости, подключённые через символьные ссылки.

Однако использование `--preserve-symlinks` может иметь и другие побочные эффекты. В частности, подключённые через символьные ссылки _нативные_ модули могут не загрузиться, если на них есть ссылки более чем из одного места в дереве зависимостей (Node.js увидит их как два отдельных модуля и попытается загрузить модуль несколько раз, что приведёт к исключению).

Флаг `--preserve-symlinks` не применяется к главному модулю, благодаря чему команда `node --preserve-symlinks node_module/.bin/<foo>` работает. Чтобы применить такое же поведение к главному модулю, используйте также `--preserve-symlinks-main`.

### `--preserve-symlinks-main`

<!-- YAML
added: v10.2.0
-->

Указывает загрузчику модулей сохранять символьные ссылки при разрешении и кэшировании главного модуля (`require.main`).

Этот флаг существует для того, чтобы главный модуль можно было перевести в тот же режим поведения, который `--preserve-symlinks` даёт всем остальным импортам; однако это отдельные флаги для обратной совместимости со старыми версиями Node.js.

`--preserve-symlinks-main` does not imply `--preserve-symlinks`; use `--preserve-symlinks-main` in addition to `--preserve-symlinks` when it is not desirable to follow symlinks before resolving relative paths.

See [`--preserve-symlinks`](#--preserve-symlinks) for more information.

### `-p`, `--print "script"`

<!-- YAML
added: v0.6.4
changes:
  - version: v5.11.0
    pr-url: https://github.com/nodejs/node/pull/5348
    description: Built-in libraries are now available as predefined variables.
-->

Добавлено в: v0.6.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v5.11.0 | Встроенные библиотеки теперь доступны как предопределенные переменные. |

Identical to `-e` but prints the result.

### `--prof`

<!-- YAML
added: v2.0.0
-->

Generate V8 profiler output.

### `--prof-process`

<!-- YAML
added: v5.2.0
-->

Process V8 profiler output generated using the V8 option `--prof`.

### `--redirect-warnings=file`

<!-- YAML
added: v8.0.0
-->

Write process warnings to the given file instead of printing to stderr. The file will be created if it does not exist, and will be appended to if it does. Если при попытке записать предупреждение в файл произойдёт ошибка, предупреждение будет записано в `stderr`.

Имя `file` может быть абсолютным путём. Если это не так, каталог по умолчанию, в который будет выполнена запись, задаётся параметром командной строки [`--diagnostic-dir`](#--diagnostic-dirdirectory).

### `--report-compact`

<!-- YAML
added:
 - v13.12.0
 - v12.17.0
-->

Записывает отчёты в компактном формате, как однострочный JSON, который проще обрабатывать системам обработки логов, чем формат по умолчанию из нескольких строк, рассчитанный на чтение человеком.

### `--report-dir=directory`, `--report-directory=directory`

<!-- YAML
added: v11.8.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This option is no longer experimental.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/27312
    description: Changed from `--diagnostic-report-directory` to
                 `--report-directory`.
-->

Добавлено в: v11.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.12.0, v12.17.0 | Этот вариант больше не является экспериментальным. |
    | v12.0.0 | Изменено с `--diagnostic-report-directory` на `--report-directory`. |

Каталог, в котором будет создан отчёт.

### `--report-exclude-env`

<!-- YAML
added:
  - v23.3.0
  - v22.13.0
-->

Если передан `--report-exclude-env`, сгенерированный диагностический отчёт не будет содержать данные `environmentVariables`.

### `--report-exclude-network`

<!-- YAML
added:
  - v22.0.0
  - v20.13.0
-->

Исключает `header.networkInterfaces` из диагностического отчёта. По умолчанию этот параметр не задан, и сетевые интерфейсы включаются.

### `--report-filename=filename`

<!-- YAML
added: v11.8.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This option is no longer experimental.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/27312
    description: changed from `--diagnostic-report-filename` to
                 `--report-filename`.
-->

Добавлено в: v11.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.12.0, v12.17.0 | Этот вариант больше не является экспериментальным. |
    | v12.0.0 | изменен с `--diagnostic-report-filename` на `--report-filename`. |

Имя файла, в который будет записан отчёт.

Если имя файла задано как `'stdout'` или `'stderr'`, отчёт записывается соответственно в `stdout` или `stderr` процесса.

### `--report-on-fatalerror`

<!-- YAML
added: v11.8.0
changes:
  - version:
    - v14.0.0
    - v13.14.0
    - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32496
    description: This option is no longer experimental.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/27312
    description: changed from `--diagnostic-report-on-fatalerror` to
                 `--report-on-fatalerror`.
-->

Добавлено в: v11.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0, v13.14.0, v12.17.0 | Этот вариант больше не является экспериментальным. |
    | v12.0.0 | изменен с `--diagnostic-report-on-fatalerror` на `--report-on-fatalerror`. |

Включает генерацию отчёта при фатальных ошибках (внутренних ошибках среды выполнения Node.js, например нехватке памяти), приводящих к завершению приложения. Полезно для просмотра различных диагностических данных: кучи, стека, состояния цикла событий, потребления ресурсов и т. д., чтобы понять причину фатальной ошибки.

### `--report-on-signal`

<!-- YAML
added: v11.8.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This option is no longer experimental.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/27312
    description: changed from `--diagnostic-report-on-signal` to
                 `--report-on-signal`.
-->

Добавлено в: v11.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.12.0, v12.17.0 | Этот вариант больше не является экспериментальным. |
    | v12.0.0 | изменен с `--diagnostic-report-on-signal` на `--report-on-signal`. |

Включает генерацию отчёта при получении указанного (или предопределённого) сигнала запущенным процессом Node.js. Сигнал для запуска отчёта задаётся через `--report-signal`.

### `--report-signal=signal`

<!-- YAML
added: v11.8.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This option is no longer experimental.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/27312
    description: changed from `--diagnostic-report-signal` to
                 `--report-signal`.
-->

Добавлено в: v11.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.12.0, v12.17.0 | Этот вариант больше не является экспериментальным. |
    | v12.0.0 | изменен с `--diagnostic-report-signal` на `--report-signal`. |

Устанавливает или сбрасывает сигнал для генерации отчёта (не поддерживается в Windows). Сигнал по умолчанию: `SIGUSR2`.

### `--report-uncaught-exception`

<!-- YAML
added: v11.8.0
changes:
  - version:
      - v18.8.0
      - v16.18.0
    pr-url: https://github.com/nodejs/node/pull/44208
    description: Report is not generated if the uncaught exception is handled.
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This option is no longer experimental.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/27312
    description: changed from `--diagnostic-report-uncaught-exception` to
                 `--report-uncaught-exception`.
-->

Добавлено в: v11.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.8.0, v16.18.0 | Отчет не создается, если неперехваченное исключение обработано. |
    | v13.12.0, v12.17.0 | Этот вариант больше не является экспериментальным. |
    | v12.0.0 | изменено с `--diagnostic-report-uncaught-Exception` на `--report-uncaught-Exception`. |

Включает генерацию отчёта при завершении процесса из-за неперехваченного исключения. Полезно при анализе стека JavaScript вместе с нативным стеком и другими данными среды выполнения.

### `-r`, `--require module`

<!-- YAML
added: v1.6.0
changes:
  - version:
      - v23.0.0
      - v22.12.0
      - v20.19.0
    pr-url: https://github.com/nodejs/node/pull/51977
    description: This option also supports ECMAScript module.
-->

Добавлено в: v1.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.0.0, v22.12.0, v20.19.0 | Эта опция также поддерживает модуль ECMAScript. |

Предзагружает указанный модуль при запуске.

Следует правилам разрешения модулей `require()`. `module` может быть либо путём к файлу, либо именем модуля Node.js.

Модули, предзагруженные с помощью `--require`, выполняются раньше модулей, предзагруженных с помощью `--import`.

Модули предзагружаются в основной поток, а также в любые потоки worker, порождённые процессы или процессы кластера.

### `--run`

<!-- YAML
added: v22.0.0
changes:
  - version: v22.3.0
    pr-url: https://github.com/nodejs/node/pull/53032
    description: NODE_RUN_SCRIPT_NAME environment variable is added.
  - version: v22.3.0
    pr-url: https://github.com/nodejs/node/pull/53058
    description: NODE_RUN_PACKAGE_JSON_PATH environment variable is added.
  - version: v22.3.0
    pr-url: https://github.com/nodejs/node/pull/53154
    description: Traverses up to the root directory and finds
                 a `package.json` file to run the command from, and updates
                 `PATH` environment variable accordingly.
-->

Добавлено в: v22.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.3.0 | Добавлена ​​переменная среды NODE_RUN_SCRIPT_NAME. |
    | v22.3.0 | Добавлена ​​переменная среды NODE_RUN_PACKAGE_JSON_PATH. |
    | v22.3.0 | Перемещается в корневой каталог, находит файл package.json для запуска команды и соответствующим образом обновляет переменную среды PATH. |

Запускает указанную команду из объекта `"scripts"` в `package.json`. Если передана отсутствующая `"command"`, будет показан список доступных скриптов.

`--run` поднимается вверх до корневого каталога и находит файл `package.json`, из которого нужно запустить команду.

`--run` добавляет `./node_modules/.bin` для каждого родительского каталога текущего каталога в `PATH`, чтобы можно было выполнять бинарные файлы из разных папок, когда присутствует несколько каталогов `node_modules`, если `ancestor-folder/node_modules/.bin` является каталогом.

`--run` выполняет команду в каталоге, содержащем соответствующий `package.json`.

Например, следующая команда запустит скрипт `test` из `package.json` в текущей папке:

```console
$ node --run test
```

Команде также можно передавать аргументы. Любой аргумент после `--` будет добавлен к скрипту:

```console
$ node --run test -- --verbose
```

#### Намеренные ограничения

`node --run` не предназначен для полного повторения поведения `npm run` или команд `run` других менеджеров пакетов. Реализация в Node.js намеренно более ограничена, чтобы сосредоточиться на максимальной производительности для самых частых сценариев использования. Некоторые возможности других реализаций `run`, которые намеренно исключены:

-   Запуск `pre`- или `post`-скриптов помимо указанного скрипта.
-   Определение переменных окружения, специфичных для менеджера пакетов.

#### Переменные окружения

При запуске скрипта с `--run` устанавливаются следующие переменные окружения:

-   `NODE_RUN_SCRIPT_NAME`: имя запускаемого скрипта. Например, если `--run` используется для запуска `test`, значением этой переменной будет `test`.
-   `NODE_RUN_PACKAGE_JSON_PATH`: путь к обрабатываемому `package.json`.

### `--secure-heap-min=n`

<!-- YAML
added: v15.6.0
-->

При использовании `--secure-heap` флаг `--secure-heap-min` задаёт минимальный размер выделения из защищённой кучи. Минимальное значение: `2`. Максимальное значение равно меньшему из `--secure-heap` и `2147483647`. Указанное значение должно быть степенью двойки.

### `--secure-heap=n`

<!-- YAML
added: v15.6.0
-->

Инициализирует защищённую кучу OpenSSL размером `n` байт. После инициализации она используется для некоторых типов выделения памяти внутри OpenSSL во время генерации ключей и других операций. Это, например, полезно для предотвращения утечки чувствительной информации из-за выхода указателей за границы буфера.

Защищённая куча имеет фиксированный размер и не может быть изменена во время выполнения, поэтому при её использовании важно выбрать достаточно большой размер, чтобы покрыть все потребности приложения.

Указанный размер кучи должен быть степенью двойки. Любое значение меньше 2 отключит защищённую кучу.

По умолчанию защищённая куча отключена.

Защищённая куча недоступна в Windows.

Подробнее см. [`CRYPTO_secure_malloc_init`](https://www.openssl.org/docs/man3.0/man3/CRYPTO_secure_malloc_init.html).

### `--snapshot-blob=path`

<!-- YAML
added: v18.8.0
-->

> Стабильность: 1 - Экспериментальная

Вместе с `--build-snapshot` параметр `--snapshot-blob` задаёт путь, по которому записывается сгенерированный blob снимка. Если не указан, сгенерированный blob записывается в `snapshot.blob` в текущем рабочем каталоге.

Без `--build-snapshot` параметр `--snapshot-blob` задаёт путь к blob, используемому для восстановления состояния приложения.

При загрузке снимка Node.js проверяет, что:

1. Версия, архитектура и платформа запущенного бинарника Node.js в точности совпадают с теми, что у бинарника, сгенерировавшего снимок.
2. Флаги V8 и возможности CPU совместимы с бинарником, сгенерировавшим снимок.

Если условия не выполняются, Node.js отказывается загружать снимок и завершается с кодом состояния 1.

### `--test`

<!-- YAML
added:
  - v18.1.0
  - v16.17.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/46983
    description: The test runner is now stable.
  - version:
      - v19.2.0
      - v18.13.0
    pr-url: https://github.com/nodejs/node/pull/45214
    description: Test runner now supports running in watch mode.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Тестовый запуск теперь стабилен. |
    | v19.2.0, v18.13.0 | Тест-раннер теперь поддерживает работу в режиме просмотра. |

Запускает средство запуска тестов из командной строки Node.js. Этот флаг нельзя сочетать с `--watch-path`, `--check`, `--eval`, `--interactive` или инспектором. Подробнее см. документацию по [запуску тестов из командной строки](test.md#running-tests-from-the-command-line).

### `--test-concurrency`

<!-- YAML
added:
  - v21.0.0
  - v20.10.0
  - v18.19.0
-->

Максимальное количество файлов тестов, которое CLI средства запуска тестов будет выполнять одновременно. Если `--test-isolation` установлен в `'none'`, этот флаг игнорируется, и параллелизм равен единице. В противном случае по умолчанию используется `os.availableParallelism() - 1`.

### `--test-coverage-branches=threshold`

<!-- YAML
added: v22.8.0
-->

> Stability: 1 - Experimental

Требует минимальный процент покрытия ветвей. Если покрытие кода не достигает указанного порога, процесс завершится с кодом `1`.

### `--test-coverage-exclude`

<!-- YAML
added:
  - v22.5.0
-->

> Stability: 1 - Experimental

Исключает определённые файлы из покрытия кода с помощью glob-шаблона, который может соответствовать как абсолютным, так и относительным путям файлов.

Этот параметр можно указывать несколько раз, чтобы исключить несколько glob-шаблонов.

Если указаны и `--test-coverage-exclude`, и `--test-coverage-include`, файлы должны соответствовать **обоим** критериям, чтобы попасть в отчёт о покрытии.

По умолчанию все подходящие файлы тестов исключаются из отчёта о покрытии. Указание этого параметра переопределяет поведение по умолчанию.

### `--test-coverage-functions=threshold`

<!-- YAML
added: v22.8.0
-->

> Стабильность: 1 - Экспериментальная

Требует минимальный процент покрытия функций. Если покрытие кода не достигает указанного порога, процесс завершится с кодом `1`.

### `--test-coverage-include`

<!-- YAML
added:
  - v22.5.0
-->

> Стабильность: 1 - Экспериментальная

Включает определённые файлы в покрытие кода с помощью glob-шаблона, который может соответствовать как абсолютным, так и относительным путям файлов.

Этот параметр можно указывать несколько раз, чтобы включить несколько glob-шаблонов.

Если указаны и `--test-coverage-exclude`, и `--test-coverage-include`, файлы должны соответствовать **обоим** критериям, чтобы попасть в отчёт о покрытии.

### `--test-coverage-lines=threshold`

<!-- YAML
added: v22.8.0
-->

> Стабильность: 1 - Экспериментальная

Требует минимальный процент покрытия строк. Если покрытие кода не достигает указанного порога, процесс завершится с кодом `1`.

### `--test-force-exit`

<!-- YAML
added:
  - v22.0.0
  - v20.14.0
-->

Настраивает средство запуска тестов так, чтобы процесс завершался после выполнения всех известных тестов, даже если цикл обработки событий в противном случае оставался бы активным.

### `--test-global-setup=module`

<!-- YAML
added: v24.0.0
-->

> Стабильность: 1.0 - Ранняя разработка

Указывает модуль, который будет вычислен до выполнения всех тестов и может использоваться для настройки глобального состояния или фикстур для тестов.

Подробнее см. документацию по [глобальной настройке и завершению](test.md#global-setup-and-teardown).

### `--test-isolation=mode`

<!-- YAML
added: v22.8.0
changes:
  - version: v23.6.0
    pr-url: https://github.com/nodejs/node/pull/56298
    description: This flag was renamed from `--experimental-test-isolation` to
                 `--test-isolation`.
-->

Добавлено в: v22.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.6.0 | Этот флаг был переименован с `--experimental-test-isolation` на `--test-isolation`. |

Настраивает тип изоляции тестов, используемый средством запуска тестов. Когда `mode` имеет значение `'process'`, каждый файл теста запускается в отдельном дочернем процессе. Когда `mode` имеет значение `'none'`, все файлы тестов запускаются в том же процессе, что и средство запуска тестов. Режим изоляции по умолчанию - `'process'`. Этот флаг игнорируется, если флаг `--test` отсутствует. Подробнее см. раздел [модель выполнения средства запуска тестов](test.md#test-runner-execution-model).

### `--test-name-pattern`

<!-- YAML
added: v18.11.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/46983
    description: The test runner is now stable.
-->

Добавлено в: v18.11.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Тестовый запуск теперь стабилен. |

Регулярное выражение, настраивающее средство запуска тестов так, чтобы выполнялись только тесты, имя которых соответствует указанному шаблону. Подробнее см. в документации по [фильтрации тестов по имени](test.md#filtering-tests-by-name).

Если указаны оба параметра `--test-name-pattern` и `--test-skip-pattern`, тесты должны удовлетворять **обоим** условиям, чтобы быть выполненными.

### `--test-only`

<!-- YAML
added:
  - v18.0.0
  - v16.17.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/46983
    description: The test runner is now stable.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Тестовый запуск теперь стабилен. |

Настраивает средство запуска тестов так, чтобы выполнялись только тесты верхнего уровня, у которых установлен параметр `only`. Этот флаг не нужен, когда изоляция тестов отключена.

### `--test-random-seed`

<!-- YAML
added: REPLACEME
-->

Задаёт зерно, используемое для случайного порядка выполнения тестов. Это применяется как к порядку выполнения файлов тестов, так и к очередям тестов внутри каждого файла. Передача этого флага неявно включает рандомизацию даже без `--test-randomize`.

Значение должно быть целым числом от `0` до `4294967295`.

Этот флаг нельзя использовать вместе с `--watch` или `--test-rerun-failures`.

### `--test-randomize`

<!-- YAML
added: REPLACEME
-->

Случайным образом меняет порядок выполнения тестов. Это применяется как к порядку выполнения файлов тестов, так и к очередям тестов внутри каждого файла. Это может помочь обнаружить тесты, зависящие от общего состояния или порядка выполнения.

Зерно, использованное для рандомизации, выводится в сводке тестов и может быть повторно использовано с `--test-random-seed`.

Подробное описание поведения и примеры см. в разделе [randomizing tests execution order](test.md#randomizing-tests-execution-order).

Этот флаг нельзя использовать вместе с `--watch` или `--test-rerun-failures`.

### `--test-reporter`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/46983
    description: The test runner is now stable.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Тестовый запуск теперь стабилен. |

Репортёр тестов, используемый при запуске тестов. Подробнее см. в документации по [репортёрам тестов](test.md#test-reporters).

### `--test-reporter-destination`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/46983
    description: The test runner is now stable.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Тестовый запуск теперь стабилен. |

Назначение для соответствующего репортера тестов. Подробнее см. в документации по [репортерам тестов](test.md#test-reporters).

### `--test-rerun-failures`

<!-- YAML
added:
  - v24.7.0
-->

Путь к файлу, позволяющему средству запуска тестов сохранять состояние набора тестов между запусками. Средство запуска будет использовать этот файл, чтобы определить, какие тесты уже завершились успешно или неудачно, что позволяет повторно запускать только провалившиеся тесты без повторного запуска всего набора тестов. Если файла не существует, средство запуска тестов создаст его. Подробнее см. в документации по [повторным запускам тестов](test.md#rerunning-failed-tests).

### `--test-shard`

<!-- YAML
added:
  - v20.5.0
  - v18.19.0
-->

Часть набора тестов для выполнения в формате `<index>/<total>`, где

-   `index` - положительное целое число, индекс части.
-   `total` - положительное целое число, общее количество частей.

Эта команда разделит все файлы тестов на `total` равных частей и запустит только те, которые попали в часть `index`.

Например, чтобы разделить набор тестов на три части, используйте:

```bash
node --test --test-shard=1/3
node --test --test-shard=2/3
node --test --test-shard=3/3
```

### `--test-skip-pattern`

<!-- YAML
added:
  - v22.1.0
-->

Регулярное выражение, настраивающее средство запуска тестов так, чтобы пропускать тесты, имя которых соответствует указанному шаблону. Подробнее см. в документации по [фильтрации тестов по имени](test.md#filtering-tests-by-name).

Если указаны оба параметра `--test-name-pattern` и `--test-skip-pattern`, тесты должны удовлетворять **обоим** условиям, чтобы быть выполненными.

### `--test-timeout`

<!-- YAML
added:
  - v21.2.0
  - v20.11.0
-->

Количество миллисекунд, по истечении которого выполнение теста завершается ошибкой. Если значение не указано, подтесты наследуют его от родительского теста. Значение по умолчанию: `Infinity`.

### `--test-update-snapshots`

<!-- YAML
added: v22.3.0
changes:
  - version:
    - v23.4.0
    - v22.13.0
    pr-url: https://github.com/nodejs/node/pull/55897
    description: Snapshot testing is no longer experimental.
-->

Добавлено в: v22.3.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.4.0, v22.13.0 | Тестирование моментальных снимков больше не является экспериментальным. |

Повторно создаёт файлы снимков, используемые средством запуска тестов для [snapshot testing](test.md#snapshot-testing).

### `--throw-deprecation`

<!-- YAML
added: v0.11.14
-->

Вызывает ошибки для устаревших возможностей.

### `--title=title`

<!-- YAML
added: v10.7.0
-->

Устанавливает `process.title` при запуске.

### `--tls-cipher-list=list`

<!-- YAML
added: v4.0.0
-->

Указывает альтернативный список шифров TLS по умолчанию. Требует, чтобы Node.js был собран с поддержкой crypto (по умолчанию так и есть).

### `--tls-keylog=file`

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

Записывает ключевой материал TLS в файл. Ключевой материал имеет формат NSS `SSLKEYLOGFILE` и может использоваться программами (например, Wireshark) для расшифровки TLS-трафика.

### `--tls-max-v1.2`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
-->

Устанавливает [`tls.DEFAULT_MAX_VERSION`](tls.md#tlsdefault_max_version) в `'TLSv1.2'`. Используется для отключения поддержки TLSv1.3.

### `--tls-max-v1.3`

<!-- YAML
added: v12.0.0
-->

Устанавливает значение [`tls.DEFAULT_MAX_VERSION`](tls.md#tlsdefault_max_version) по умолчанию в `'TLSv1.3'`. Используется для включения поддержки TLSv1.3.

### `--tls-min-v1.0`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
-->

Устанавливает значение [`tls.DEFAULT_MIN_VERSION`](tls.md#tlsdefault_min_version) по умолчанию в `'TLSv1'`. Используется для совместимости со старыми TLS-клиентами или серверами.

### `--tls-min-v1.1`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
-->

Устанавливает значение [`tls.DEFAULT_MIN_VERSION`](tls.md#tlsdefault_min_version) по умолчанию в `'TLSv1.1'`. Используется для совместимости со старыми TLS-клиентами или серверами.

### `--tls-min-v1.2`

<!-- YAML
added:
 - v12.2.0
 - v10.20.0
-->

Устанавливает значение [`tls.DEFAULT_MIN_VERSION`](tls.md#tlsdefault_min_version) по умолчанию в `'TLSv1.2'`. Это значение используется по умолчанию в 12.x и новее, но сам параметр поддерживается для совместимости со старыми версиями Node.js.

### `--tls-min-v1.3`

<!-- YAML
added: v12.0.0
-->

Устанавливает значение [`tls.DEFAULT_MIN_VERSION`](tls.md#tlsdefault_min_version) по умолчанию в `'TLSv1.3'`. Используется для отключения поддержки TLSv1.2, которая менее безопасна, чем TLSv1.3.

### `--trace-deprecation`

<!-- YAML
added: v0.8.0
-->

Выводит трассировки стека для предупреждений об устаревании.

### `--trace-env`

<!-- YAML
added:
  - v23.4.0
  - v22.13.0
-->

Выводит в `stderr` сведения о любом доступе к переменным окружения, выполненном в текущем экземпляре Node.js, включая:

-   чтения переменных окружения, которые Node.js выполняет внутри себя;
-   записи вида `process.env.KEY = "SOME VALUE"`;
-   чтения вида `process.env.KEY`;
-   определения вида `Object.defineProperty(process.env, 'KEY', {...})`;
-   проверки вида `Object.hasOwn(process.env, 'KEY')`, `process.env.hasOwnProperty('KEY')` или `'KEY' in process.env`.
-   Удаления вида `delete process.env.KEY`.
-   Переборы вида `...process.env` или `Object.keys(process.env)`.

Выводятся только имена переменных окружения, к которым производится доступ. Их значения не выводятся.

Чтобы вывести трассировку стека для такого доступа, используйте `--trace-env-js-stack` и/или `--trace-env-native-stack`.

### `--trace-env-js-stack`

<!-- YAML
added:
  - v23.4.0
  - v22.13.0
-->

Помимо того, что делает `--trace-env`, этот параметр выводит JavaScript- трассировку стека для такого доступа.

### `--trace-env-native-stack`

<!-- YAML
added:
  - v23.4.0
  - v22.13.0
-->

Помимо того, что делает `--trace-env`, этот параметр выводит нативную трассировку стека для такого доступа.

### `--trace-event-categories`

<!-- YAML
added: v7.7.0
-->

Список категорий, разделённых запятыми, которые следует трассировать, когда трассировка событий включена с помощью `--trace-events-enabled`.

### `--trace-event-file-pattern`

<!-- YAML
added: v9.8.0
-->

Строка шаблона, задающая путь к файлу для данных trace event; поддерживает `${rotation}` и `${pid}`.

### `--trace-events-enabled`

<!-- YAML
added: v7.7.0
-->

Включает сбор информации трассировки trace event.

### `--trace-exit`

<!-- YAML
added:
 - v13.5.0
 - v12.16.0
-->

Выводит трассировку стека каждый раз, когда выполнение окружения завершается принудительно, то есть при вызове `process.exit()`.

### `--trace-require-module=mode`

<!-- YAML
added:
 - v23.5.0
 - v22.13.0
 - v20.19.0
-->

Выводит информацию об использовании [загрузки модулей ECMAScript с помощью `require()`](modules.md#loading-ecmascript-modules-using-require).

Когда `mode` имеет значение `all`, выводятся все случаи использования. Когда `mode` имеет значение `no-node-modules`, случаи использования из папки `node_modules` исключаются.

### `--trace-sigint`

<!-- YAML
added:
 - v13.9.0
 - v12.17.0
-->

Выводит трассировку стека при `SIGINT`.

### `--trace-sync-io`

<!-- YAML
added: v2.1.0
-->

Выводит трассировку стека всякий раз, когда синхронный ввод-вывод обнаруживается после первого цикла обработки событий.

### `--trace-tls`

<!-- YAML
added: v12.2.0
-->

Выводит информацию трассировки TLS-пакетов в `stderr`. Это можно использовать для отладки проблем TLS-соединений.

### `--trace-uncaught`

<!-- YAML
added: v13.1.0
-->

Выводит трассировки стека для неперехваченных исключений; обычно выводится трассировка, связанная с созданием `Error`, а этот параметр заставляет Node.js также выводить трассировку, связанную с выбрасыванием значения (которое не обязано быть экземпляром `Error`).

Включение этого параметра может негативно повлиять на поведение сборщика мусора.

### `--trace-warnings`

<!-- YAML
added: v6.0.0
-->

Выводит трассировки стека для предупреждений процесса (включая предупреждения об устаревании).

### `--track-heap-objects`

<!-- YAML
added: v2.4.0
-->

Отслеживает выделение объектов кучи для снимков кучи.

### `--unhandled-rejections=mode`

<!-- YAML
added:
  - v12.0.0
  - v10.17.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/33021
    description: Changed default mode to `throw`. Previously, a warning was
                 emitted.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Изменен режим по умолчанию на `throw`. Ранее было вынесено предупреждение. |

Использование этого флага позволяет изменить поведение при возникновении необработанного отклонения промиса. Можно выбрать один из следующих режимов:

-   `throw`: генерирует [`unhandledRejection`](process.md#event-unhandledrejection). Если этот хук не установлен, необработанное отклонение выбрасывается как неперехваченное исключение. Это значение по умолчанию.
-   `strict`: выбрасывает необработанное отклонение как неперехваченное исключение. Если исключение обработано, генерируется [`unhandledRejection`](process.md#event-unhandledrejection).
-   `warn`: всегда выдаёт предупреждение независимо от того, установлен ли хук [`unhandledRejection`](process.md#event-unhandledrejection), но не выводит предупреждение об устаревании.
-   `warn-with-error-code`: генерирует [`unhandledRejection`](process.md#event-unhandledrejection). Если этот хук не установлен, выдаёт предупреждение и устанавливает код завершения процесса в 1.
-   `none`: подавляет все предупреждения.

Если отклонение происходит на этапе статической загрузки ES-модуля в точке входа командной строки, оно всегда выбрасывается как неперехваченное исключение.

### `--use-bundled-ca`, `--use-openssl-ca`

<!-- YAML
added: v6.11.0
-->

Использует встроенное хранилище CA Mozilla, поставляемое текущей версией Node.js, либо хранилище CA OpenSSL по умолчанию. Хранилище по умолчанию выбирается на этапе сборки.

Встроенное хранилище CA, поставляемое с Node.js, представляет собой снимок хранилища CA Mozilla, зафиксированный на момент выпуска. Оно одинаково на всех поддерживаемых платформах.

Использование хранилища OpenSSL допускает внешние изменения этого хранилища. В большинстве дистрибутивов Linux и BSD это хранилище поддерживается сопровождающими дистрибутива и системными администраторами. Расположение хранилища CA OpenSSL зависит от конфигурации библиотеки OpenSSL, но его можно изменить во время выполнения с помощью переменных окружения.

See `SSL_CERT_DIR` and `SSL_CERT_FILE`.

### `--use-env-proxy`

<!-- YAML
added:
 - v24.5.0
 - v22.21.0
-->

> Stability: 1.1 - Active Development

При включении Node.js во время запуска разбирает переменные окружения `HTTP_PROXY`, `HTTPS_PROXY` и `NO_PROXY` и направляет запросы через указанный прокси.

Это эквивалентно установке переменной окружения [`NODE_USE_ENV_PROXY=1`](#node_use_env_proxy1). Если заданы оба варианта, приоритет имеет `--use-env-proxy`.

### `--use-largepages=mode`

<!-- YAML
added:
 - v13.6.0
 - v12.17.0
-->

Переназначает статический код Node.js на большие страницы памяти при запуске. Если целевая система это поддерживает, статический код Node.js будет перенесён на страницы размером 2 MiB вместо 4 KiB.

Для `mode` допустимы следующие значения:

-   `off`: попытка отображения не выполняется. Это значение по умолчанию.
-   `on`: если ОС поддерживает, будет выполнена попытка отображения. Неудача будет проигнорирована, а сообщение выведено в стандартный поток ошибок.
-   `silent`: если ОС поддерживает, будет выполнена попытка отображения. Неудача будет проигнорирована и не будет сообщена.

### `--use-system-ca`

<!-- YAML
added: v23.8.0
changes:
  - version: v23.9.0
    pr-url: https://github.com/nodejs/node/pull/57009
    description: Added support on non-Windows and non-macOS.
-->

Добавлено в: v23.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.9.0 | Добавлена ​​поддержка не-Windows и не-macOS. |

Node.js использует доверенные сертификаты CA, присутствующие в системном хранилище, вместе с параметром `--use-bundled-ca` и переменной окружения `NODE_EXTRA_CA_CERTS`. На платформах, отличных от Windows и macOS, это загружает сертификаты из каталога и файла, которым доверяет OpenSSL, аналогично `--use-openssl-ca`, но с тем отличием, что сертификаты кэшируются после первой загрузки.

В Windows и macOS политика доверия к сертификатам похожа на [политику Chromium для локально доверенных сертификатов](https://chromium.googlesource.com/chromium/src/+/main/net/data/ssl/chrome_root_store/faq.md#does-the-chrome-certificate-verifier-consider-local-trust-decisions), но с некоторыми отличиями:

В macOS учитываются следующие настройки:

-   Связки ключей `Default` и `System`
    -   Доверие:
        -   Любой сертификат, у которого флаг "When using this certificate" установлен в "Always Trust", или
        -   Любой сертификат, у которого флаг "Secure Sockets Layer (SSL)" установлен в "Always Trust".
    -   Сертификат также должен быть действительным, а "X.509 Basic Policy" должно быть установлено в "Always Trust".

В Windows учитываются следующие настройки:

-   `Local Machine` (доступ через `certlm.msc`)
    -   Доверие:
        -   `Trusted Root Certification Authorities`
        -   `Trusted People`
        -   `Enterprise Trust -> Enterprise -> Trusted Root Certification Authorities`
        -   `Enterprise Trust -> Enterprise -> Trusted People`
        -   `Enterprise Trust -> Group Policy -> Trusted Root Certification Authorities`
        -   `Enterprise Trust -> Group Policy -> Trusted People`
-   `Current User` (доступ через `certmgr.msc`)
    -   Доверие:
        -   `Trusted Root Certification Authorities`
        -   `Enterprise Trust -> Group Policy -> Trusted Root Certification Authorities`

В Windows и macOS перед использованием доверенных сертификатов для аутентификации TLS-сервера Node.js проверяет, не запрещают ли это пользовательские настройки для этих сертификатов.

В настоящее время Node.js не поддерживает недоверие/отзыв сертификатов из другого источника на основе системных настроек.

На других системах Node.js загружает сертификаты из файла сертификатов по умолчанию (обычно `/etc/ssl/cert.pem`) и каталога сертификатов по умолчанию (обычно `/etc/ssl/certs`), которые использует версия OpenSSL, с которой связан Node.js. Обычно это соответствует принятому соглашению в основных дистрибутивах Linux и других Unix-подобных системах. Если заданы переопределяющие переменные окружения OpenSSL (обычно `SSL_CERT_FILE` и `SSL_CERT_DIR`, в зависимости от конфигурации OpenSSL, с которой связан Node.js), для загрузки сертификатов будут использованы указанные пути. Эти переменные окружения можно использовать как обходной путь, если обычные пути, используемые версией OpenSSL, с которой связан Node.js, по какой-либо причине не совпадают с системной конфигурацией пользователей.

### `--v8-options`

<!-- YAML
added: v0.1.3
-->

Выводит параметры командной строки V8.

### `--v8-pool-size=num`

<!-- YAML
added: v5.10.0
-->

Задаёт размер пула потоков V8, который будет использоваться для распределения фоновых задач.

Если указать `0`, Node.js сам выберет подходящий размер пула потоков на основе оценки степени параллелизма.

Степень параллелизма означает количество вычислений, которые можно выполнять одновременно на данной машине. Обычно это соответствует числу CPU, но может отличаться в средах вроде виртуальных машин или контейнеров.

### `-v`, `--version`

<!-- YAML
added: v0.1.3
-->

Выводит версию Node.js.

### `--watch`

<!-- YAML
added:
  - v18.11.0
  - v16.19.0
changes:
  - version:
    - v22.0.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52074
    description: Watch mode is now stable.
  - version:
      - v19.2.0
      - v18.13.0
    pr-url: https://github.com/nodejs/node/pull/45214
    description: Test runner now supports running in watch mode.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.0.0, v20.13.0 | Режим просмотра теперь стабилен. |
    | v19.2.0, v18.13.0 | Тест-раннер теперь поддерживает работу в режиме просмотра. |

Запускает Node.js в режиме наблюдения. В этом режиме изменения в отслеживаемых файлах приводят к перезапуску процесса Node.js. По умолчанию режим наблюдения отслеживает точку входа и любые требуемые или импортированные модули. Используйте `--watch-path`, чтобы указать, какие пути нужно отслеживать.

Этот флаг нельзя сочетать с `--check`, `--eval`, `--interactive` или REPL.

Примечание: флаг `--watch` требует путь к файлу в качестве аргумента и несовместим с `--run` или встроенным вводом скрипта, так как `--run` имеет приоритет и игнорирует режим наблюдения. Если файл не указан, Node.js завершится с кодом состояния `9`.

```bash
node --watch index.js
```

### `--watch-kill-signal`

<!-- YAML
added:
  - v24.4.0
  - v22.18.0
-->

> Стабильность: 1.1 - Активная разработка

Настраивает сигнал, отправляемый процессу при перезапусках в режиме наблюдения.

```bash
node --watch --watch-kill-signal SIGINT test.js
```

### `--watch-path`

<!-- YAML
added:
  - v18.11.0
  - v16.19.0
changes:
  - version:
    - v22.0.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52074
    description: Watch mode is now stable.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.0.0, v20.13.0 | Режим просмотра теперь стабилен. |

Запускает Node.js в режиме наблюдения и задаёт пути, которые нужно отслеживать. В режиме наблюдения изменения в этих путях приводят к перезапуску процесса Node.js. Это отключает отслеживание требуемых или импортированных модулей, даже если параметр используется совместно с `--watch`.

Этот флаг нельзя сочетать с `--check`, `--eval`, `--interactive`, `--test` или REPL.

Примечание: использование `--watch-path` неявно включает `--watch`, который требует путь к файлу и несовместим с `--run`, так как `--run` имеет приоритет и игнорирует режим наблюдения.

```bash
node --watch-path=./src --watch-path=./tests index.js
```

Этот параметр поддерживается только в macOS и Windows. Если использовать его на платформе, которая его не поддерживает, будет выброшено исключение `ERR_FEATURE_UNAVAILABLE_ON_PLATFORM`.

### `--watch-preserve-output`

<!-- YAML
added:
  - v19.3.0
  - v18.13.0
-->

Отключает очистку консоли при перезапуске процесса в режиме наблюдения.

```bash
node --watch --watch-preserve-output test.js
```

### `--zero-fill-buffers`

<!-- YAML
added: v6.0.0
-->

Автоматически заполняет нулями все вновь выделенные экземпляры [`Buffer`](buffer.md#class-buffer).

## Environment variables

> Stability: 2 - Stable

### `FORCE_COLOR=[1, 2, 3]`

Переменная окружения `FORCE_COLOR` используется для включения ANSI-цветного вывода. Возможные значения:

-   `1`, `true` или пустая строка `''` означают поддержку 16 цветов,
-   `2` означает поддержку 256 цветов,
-   `3` означает поддержку 16 миллионов цветов.

Если `FORCE_COLOR` используется и имеет поддерживаемое значение, переменные окружения `NO_COLOR` и `NODE_DISABLE_COLORS` игнорируются.

Любое другое значение приведёт к отключению цветного вывода.

### `NODE_COMPILE_CACHE=dir`

<!-- YAML
added: v22.1.0
changes:
  - version: v25.4.0
    pr-url: https://github.com/nodejs/node/pull/60971
    description: This feature is no longer experimental.
-->

Добавлено в: v22.1.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0 | Эта функция больше не является экспериментальной. |

Включает [кэш компиляции модулей](module.md#module-compile-cache) для экземпляра Node.js. Подробнее см. документацию по [кэшу компиляции модулей](module.md#module-compile-cache).

### `NODE_COMPILE_CACHE_PORTABLE=1`

Если установлено значение `1`, [кэш компиляции модулей](module.md#module-compile-cache) можно повторно использовать в разных расположениях каталогов, пока структура модулей относительно каталога кэша остаётся одинаковой.

### `NODE_DEBUG=module[,…]`

<!-- YAML
added: v0.1.32
-->

Список основных модулей, разделённых `','`, для которых следует выводить отладочную информацию.

### `NODE_DEBUG_NATIVE=module[,…]`

Список основных C++-модулей, разделённых `','`, для которых следует выводить отладочную информацию.

### `NODE_DISABLE_COLORS=1`

<!-- YAML
added: v0.3.0
-->

Если установлено, в REPL не будут использоваться цвета.

### `NODE_DISABLE_COMPILE_CACHE=1`

<!-- YAML
added: v22.8.0
-->

> Стабильность: 1.1 - Активная разработка

Отключает [кэш компиляции модулей](module.md#module-compile-cache) для экземпляра Node.js. Подробнее см. документацию по [кэшу компиляции модулей](module.md#module-compile-cache).

### `NODE_EXTRA_CA_CERTS=file`

<!-- YAML
added: v7.3.0
-->

Если установлено, общеизвестные "корневые" CA (например, VeriSign) будут дополнены сертификатами из `file`. Файл должен содержать один или несколько доверенных сертификатов в формате PEM. Если файл отсутствует или имеет неверный формат, будет один раз выведено сообщение через [`process.emitWarning()`](process.md#processemitwarningwarning-options), но в остальном любые ошибки игнорируются.

Ни общеизвестные, ни дополнительные сертификаты не используются, если свойство `ca` явно указано в параметрах TLS- или HTTPS-клиента либо сервера.

Эта переменная окружения игнорируется, когда `node` запускается как setuid-root или имеет установленные файловые возможности Linux.

Переменная окружения `NODE_EXTRA_CA_CERTS` читается только при первом запуске процесса Node.js. Изменение её значения во время выполнения через `process.env.NODE_EXTRA_CA_CERTS` не влияет на текущий процесс.

### `NODE_ICU_DATA=file`

<!-- YAML
added: v0.11.15
-->

Путь к данным ICU (объект `Intl`). При сборке с поддержкой `small-icu` расширяет встроенные данные.

### `NODE_NO_WARNINGS=1`

<!-- YAML
added: v6.11.0
-->

Если установлено значение `1`, предупреждения процесса подавляются.

### `NODE_OPTIONS=options...`

<!-- YAML
added: v8.0.0
-->

Разделённый пробелами список параметров командной строки. `options...` обрабатываются до параметров командной строки, поэтому параметры командной строки переопределяют или дополняют всё, что указано в `options...`. Node.js завершится с ошибкой, если будет использован параметр, не разрешённый в переменной окружения, например `-p` или файл скрипта.

Если значение параметра содержит пробел, его можно экранировать двойными кавычками:

```bash
NODE_OPTIONS='--require "./my path/file.js"'
```

Одиночный флаг, переданный в командной строке, переопределяет тот же флаг, переданный через `NODE_OPTIONS`:

```bash
# Инспектор будет доступен на порту 5555
NODE_OPTIONS='--inspect=localhost:4444' node --inspect=localhost:5555
```

Флаг, который можно передавать несколько раз, обрабатывается так, как если бы сначала были переданы его экземпляры из `NODE_OPTIONS`, а затем экземпляры из командной строки:

```bash
NODE_OPTIONS='--require "./a.js"' node --require "./b.js"
# эквивалентно:
node --require "./a.js" --require "./b.js"
```

Разрешённые параметры Node.js приведены в следующем списке. Если параметр поддерживает варианты и `--XX`, и `--no-XX`, поддерживаются оба, но в список ниже включён только один из них.

<!-- node-options-node start -->

-   `--allow-addons`
-   `--allow-child-process`
-   `--allow-fs-read`
-   `--allow-fs-write`
-   `--allow-inspector`
-   `--allow-net`
-   `--allow-wasi`
-   `--allow-worker`
-   `--conditions`, `-C`
-   `--cpu-prof-dir`
-   `--cpu-prof-interval`
-   `--cpu-prof-name`
-   `--cpu-prof`
-   `--diagnostic-dir`
-   `--disable-proto`
-   `--disable-sigusr1`
-   `--disable-warning`
-   `--disable-wasm-trap-handler`
-   `--dns-result-order`
-   `--enable-fips`
-   `--enable-network-family-autoselection`
-   `--enable-source-maps`
-   `--entry-url`
-   `--experimental-abortcontroller`
-   `--experimental-addon-modules`
-   `--experimental-detect-module`
-   `--experimental-eventsource`
-   `--experimental-import-meta-resolve`
-   `--experimental-json-modules`
-   `--experimental-loader`
-   `--experimental-modules`
-   `--experimental-print-required-tla`
-   `--experimental-quic`
-   `--experimental-require-module`
-   `--experimental-shadow-realm`
-   `--experimental-specifier-resolution`
-   `--experimental-stream-iter`
-   `--experimental-test-isolation`
-   `--experimental-top-level-await`
-   `--experimental-vm-modules`
-   `--experimental-wasi-unstable-preview1`
-   `--force-context-aware`
-   `--force-fips`
-   `--force-node-api-uncaught-exceptions-policy`
-   `--frozen-intrinsics`
-   `--heap-prof-dir`
-   `--heap-prof-interval`
-   `--heap-prof-name`
-   `--heap-prof`
-   `--heapsnapshot-near-heap-limit`
-   `--heapsnapshot-signal`
-   `--http-parser`
-   `--icu-data-dir`
-   `--import`
-   `--input-type`
-   `--insecure-http-parser`
-   `--inspect-brk`
-   `--inspect-port`, `--debug-port`
-   `--inspect-publish-uid`
-   `--inspect-wait`
-   `--inspect`
-   `--localstorage-file`
-   `--max-http-header-size`
-   `--max-old-space-size-percentage`
-   `--napi-modules`
-   `--network-family-autoselection-attempt-timeout`
-   `--no-addons`
-   `--no-async-context-frame`
-   `--no-deprecation`
-   `--no-experimental-global-navigator`
-   `--no-experimental-repl-await`
-   `--no-experimental-sqlite`
-   `--no-experimental-strip-types`
-   `--no-experimental-websocket`
-   `--no-experimental-webstorage`
-   `--no-extra-info-on-fatal-exception`
-   `--no-force-async-hooks-checks`
-   `--no-global-search-paths`
-   `--no-network-family-autoselection`
-   `--no-strip-types`
-   `--no-warnings`
-   `--no-webstorage`
-   `--node-memory-debug`
-   `--openssl-config`
-   `--openssl-legacy-provider`
-   `--openssl-shared-config`
-   `--pending-deprecation`
-   `--permission-audit`
-   `--permission`
-   `--preserve-symlinks-main`
-   `--preserve-symlinks`
-   `--prof-process`
-   `--redirect-warnings`
-   `--report-compact`
-   `--report-dir`, `--report-directory`
-   `--report-exclude-env`
-   `--report-exclude-network`
-   `--report-filename`
-   `--report-on-fatalerror`
-   `--report-on-signal`
-   `--report-signal`
-   `--report-uncaught-exception`
-   `--require-module`
-   `--require`, `-r`
-   `--secure-heap-min`
-   `--secure-heap`
-   `--snapshot-blob`
-   `--test-coverage-branches`
-   `--test-coverage-exclude`
-   `--test-coverage-functions`
-   `--test-coverage-include`
-   `--test-coverage-lines`
-   `--test-global-setup`
-   `--test-isolation`
-   `--test-name-pattern`
-   `--test-only`
-   `--test-random-seed`
-   `--test-randomize`
-   `--test-reporter-destination`
-   `--test-reporter`
-   `--test-rerun-failures`
-   `--test-shard`
-   `--test-skip-pattern`
-   `--throw-deprecation`
-   `--title`
-   `--tls-cipher-list`
-   `--tls-keylog`
-   `--tls-max-v1.2`
-   `--tls-max-v1.3`
-   `--tls-min-v1.0`
-   `--tls-min-v1.1`
-   `--tls-min-v1.2`
-   `--tls-min-v1.3`
-   `--trace-deprecation`
-   `--trace-env-js-stack`
-   `--trace-env-native-stack`
-   `--trace-env`
-   `--trace-event-categories`
-   `--trace-event-file-pattern`
-   `--trace-events-enabled`
-   `--trace-exit`
-   `--trace-require-module`
-   `--trace-sigint`
-   `--trace-sync-io`
-   `--trace-tls`
-   `--trace-uncaught`
-   `--trace-warnings`
-   `--track-heap-objects`
-   `--unhandled-rejections`
-   `--use-bundled-ca`
-   `--use-env-proxy`
-   `--use-largepages`
-   `--use-openssl-ca`
-   `--use-system-ca`
-   `--v8-pool-size`
-   `--watch-kill-signal`
-   `--watch-path`
-   `--watch-preserve-output`
-   `--watch`
-   `--zero-fill-buffers`

<!-- node-options-node end -->

Допустимы следующие параметры V8:

<!-- node-options-v8 start -->

-   `--abort-on-uncaught-exception`
-   `--disallow-code-generation-from-strings`
-   `--enable-etw-stack-walking`
-   `--expose-gc`
-   `--interpreted-frames-native-stack`
-   `--jitless`
-   `--max-heap-size`
-   `--max-old-space-size`
-   `--max-semi-space-size`
-   `--perf-basic-prof-only-functions`
-   `--perf-basic-prof`
-   `--perf-prof-unwinding-info`
-   `--perf-prof`
-   `--stack-trace-limit`

<!-- node-options-v8 end -->

<!-- node-options-others start -->

`--perf-basic-prof-only-functions`, `--perf-basic-prof`, `--perf-prof-unwinding-info` и `--perf-prof` доступны только в Linux.

`--enable-etw-stack-walking` доступен только в Windows.

<!-- node-options-others end -->

### `NODE_PATH=path[:…]`

<!-- YAML
added: v0.1.32
-->

Список каталогов, разделённых `':'`, который добавляется в начало пути поиска модулей.

В Windows вместо этого используется список, разделённый `';'`.

### `NODE_PENDING_DEPRECATION=1`

<!-- YAML
added: v8.0.0
-->

Если установлено значение `1`, выводит ожидающие предупреждения об устаревании.

Ожидающие предупреждения об устаревании в целом идентичны предупреждениям времени выполнения, за исключением того, что по умолчанию они _выключены_ и не выводятся, если не установлен либо флаг командной строки `--pending-deprecation`, либо переменная окружения `NODE_PENDING_DEPRECATION=1`. Они служат своего рода выборочным механизмом "раннего предупреждения", который разработчики могут использовать для обнаружения применения устаревших API.

### `NODE_PENDING_PIPE_INSTANCES=instances`

Задаёт количество ожидающих дескрипторов экземпляров канала, когда сервер каналов ожидает подключения. Этот параметр применяется только в Windows.

### `NODE_PRESERVE_SYMLINKS=1`

<!-- YAML
added: v7.1.0
-->

Если установлено значение `1`, загрузчику модулей предписывается сохранять символьные ссылки при разрешении и кэшировании модулей.

### `NODE_REDIRECT_WARNINGS=file`

<!-- YAML
added: v8.0.0
-->

Если задано, предупреждения процесса будут выводиться в указанный файл вместо печати в `stderr`. Если файл не существует, он будет создан; если существует, запись будет выполняться в конец файла. Если при попытке записать предупреждение в файл произойдёт ошибка, предупреждение будет выведено в `stderr`. Это эквивалентно использованию параметра командной строки `--redirect-warnings=file`.

### `NODE_REPL_EXTERNAL_MODULE=file`

<!-- YAML
added:
 - v13.0.0
 - v12.16.0
changes:
  - version:
     - v22.3.0
     - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/52905
    description:
      Remove the possibility to use this env var with
      kDisableNodeOptionsEnv for embedders.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.3.0, v20.16.0 | Удалите возможность использовать эту переменную env с kDisableNodeOptionsEnv для разработчиков. |

Путь к модулю Node.js, который будет загружен вместо встроенного REPL. Если задать для этого значения пустую строку (`''`), будет использоваться встроенный REPL.

### `NODE_REPL_HISTORY=file`

<!-- YAML
added: v3.0.0
-->

Путь к файлу, используемому для хранения постоянной истории REPL. Путь по умолчанию - `~/.node_repl_history`; эта переменная его переопределяет. Установка пустого значения (`''` или `' '`) отключает постоянную историю REPL.

### `NODE_SKIP_PLATFORM_CHECK=value`

<!-- YAML
added: v14.5.0
-->

Если `value` равно `'1'`, во время запуска Node.js пропускается проверка поддерживаемой платформы. Node.js может работать некорректно. Любые проблемы, возникающие на неподдерживаемых платформах, исправляться не будут.

### `NODE_TEST_CONTEXT=value`

Если `value` равно `'child'`, параметры репортера тестов будут переопределены, а вывод тестов будет отправлен в `stdout` в формате TAP. Если задано любое другое значение, Node.js не даёт гарантий относительно используемого формата репортера и его стабильности.

### `NODE_TLS_REJECT_UNAUTHORIZED=value`

Если `value` равно `'0'`, проверка сертификатов для TLS-соединений отключается. Это делает TLS, а следовательно и HTTPS, небезопасными. Использование этой переменной окружения настоятельно не рекомендуется.

### `NODE_USE_ENV_PROXY=1`

<!-- YAML
added:
 - v24.0.0
 - v22.21.0
-->

> Стабильность: 1.1 - Активная разработка

При включении Node.js во время запуска разбирает переменные окружения `HTTP_PROXY`, `HTTPS_PROXY` и `NO_PROXY` и направляет запросы через указанный прокси.

Это также можно включить с помощью параметра командной строки [`--use-env-proxy`](#--use-env-proxy). Если заданы оба варианта, приоритет имеет `--use-env-proxy`.

### `NODE_USE_SYSTEM_CA=1`

<!-- YAML
added:
 - v24.6.0
 - v22.19.0
-->

Node.js использует доверенные сертификаты CA, присутствующие в системном хранилище, вместе с параметром `--use-bundled-ca` и переменной окружения `NODE_EXTRA_CA_CERTS`.

Это также можно включить с помощью параметра командной строки [`--use-system-ca`](#--use-system-ca). Если заданы оба варианта, приоритет имеет `--use-system-ca`.

### `NODE_V8_COVERAGE=dir`

Если задано это значение, Node.js начнёт выводить данные [покрытия JavaScript-кода V8](https://v8project.blogspot.com/2017/12/javascript-code-coverage.html) и [Source Map](https://tc39.es/ecma426/) в каталог, переданный в качестве аргумента (информация о покрытии записывается в JSON-файлы с префиксом `coverage`).

`NODE_V8_COVERAGE` автоматически распространяется на подпроцессы, что упрощает инструментирование приложений, вызывающих семейство функций `child_process.spawn()`. Чтобы предотвратить распространение, `NODE_V8_COVERAGE` можно установить в пустую строку.

#### Вывод покрытия

Покрытие выводится как массив объектов [ScriptCoverage](https://chromedevtools.github.io/devtools-protocol/tot/Profiler#type-ScriptCoverage) в ключе верхнего уровня `result`:

```json
{
    "result": [
        {
            "scriptId": "67",
            "url": "internal/tty.js",
            "functions": []
        }
    ]
}
```

#### Кэш source map

> Стабильность: 1 - Экспериментальная

Если данные source map найдены, они добавляются в ключ верхнего уровня `source-map-cache` объекта JSON покрытия.

`source-map-cache` - это объект, где ключи представляют файлы, из которых были извлечены source map, а значения включают необработанный URL source map (в ключе `url`), разобранную информацию Source Map v3 (в ключе `data`) и длины строк исходного файла (в ключе `lineLengths`).

```json
{
    "result": [
        {
            "scriptId": "68",
            "url": "file:///absolute/path/to/source.js",
            "functions": []
        }
    ],
    "source-map-cache": {
        "file:///absolute/path/to/source.js": {
            "url": "./path-to-map.json",
            "data": {
                "version": 3,
                "sources": [
                    "file:///absolute/path/to/original.js"
                ],
                "names": ["Foo", "console", "info"],
                "mappings": "MAAMA,IACJC,YAAaC",
                "sourceRoot": "./"
            },
            "lineLengths": [13, 62, 38, 27]
        }
    }
}
```

### `NO_COLOR=<any>`

[`NO_COLOR`](https://no-color.org) - это псевдоним для `NODE_DISABLE_COLORS`. Значение переменной окружения может быть любым.

### `OPENSSL_CONF=file`

<!-- YAML
added: v6.11.0
-->

Загружает конфигурационный файл OpenSSL при запуске. Помимо прочего, это можно использовать для включения FIPS-совместимой криптографии, если Node.js собран с `./configure --openssl-fips`.

Если используется параметр командной строки [`--openssl-config`](#--openssl-configfile), переменная окружения игнорируется.

### `SSL_CERT_DIR=dir`

<!-- YAML
added: v7.7.0
-->

Если включено `--use-openssl-ca`, либо если `--use-system-ca` включено на платформах, отличных от macOS и Windows, эта переменная переопределяет и задаёт каталог OpenSSL, содержащий доверенные сертификаты.

Имейте в виду, что если дочернее окружение не задано явно, эта переменная окружения будет унаследована всеми дочерними процессами, и если они используют OpenSSL, это может привести к тому, что они будут доверять тем же CA, что и Node.js.

### `SSL_CERT_FILE=file`

<!-- YAML
added: v7.7.0
-->

Если включено `--use-openssl-ca`, либо если `--use-system-ca` включено на платформах, отличных от macOS и Windows, эта переменная переопределяет и задаёт файл OpenSSL, содержащий доверенные сертификаты.

Имейте в виду, что если дочернее окружение не задано явно, эта переменная окружения будет унаследована всеми дочерними процессами, и если они используют OpenSSL, это может привести к тому, что они будут доверять тем же CA, что и Node.js.

### `TZ`

<!-- YAML
added: v0.0.1
changes:
  - version:
     - v16.2.0
    pr-url: https://github.com/nodejs/node/pull/38642
    description:
      Changing the TZ variable using process.env.TZ = changes the timezone
      on Windows as well.
  - version:
     - v13.0.0
    pr-url: https://github.com/nodejs/node/pull/20026
    description:
      Changing the TZ variable using process.env.TZ = changes the timezone
      on POSIX systems.
-->

Добавлено в: v0.0.1

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.2.0 | Изменение переменной TZ с помощью процесса.env.TZ = также меняет часовой пояс в Windows. |
    | v13.0.0 | Изменение переменной TZ с помощью процесса.env.TZ = меняет часовой пояс в системах POSIX. |

Переменная окружения `TZ` используется для указания конфигурации часового пояса.

Хотя Node.js не поддерживает все различные [способы обработки `TZ` в других окружениях][], он поддерживает базовые [идентификаторы часовых поясов][timezone ids] (такие как `'Etc/UTC'`, `'Europe/Paris'` или `'America/New_York'`). Он может поддерживать и некоторые другие сокращения или псевдонимы, но их использование настоятельно не рекомендуется и не гарантируется.

```console
$ TZ=Europe/Dublin node -pe "new Date().toString()"
Wed May 12 2021 20:30:48 GMT+0100 (Irish Standard Time)
```

### `UV_THREADPOOL_SIZE=size`

Задаёт количество потоков, используемых в пуле потоков libuv, равным `size`.

Node.js по возможности использует асинхронные системные API, но там, где их нет, пул потоков libuv применяется для создания асинхронных API Node.js на основе синхронных системных API. Пул потоков используют следующие API Node.js:

-   все API `fs`, кроме API наблюдения за файлами и тех, которые явно являются синхронными
-   асинхронные криптографические API, такие как `crypto.pbkdf2()`, `crypto.scrypt()`, `crypto.randomBytes()`, `crypto.randomFill()`, `crypto.generateKeyPair()`
-   `dns.lookup()`
-   все API `zlib`, кроме тех, которые явно являются синхронными

Поскольку пул потоков libuv имеет фиксированный размер, если по какой-либо причине один из этих API работает долго, производительность других (на первый взгляд не связанных) API, выполняющихся в пуле потоков libuv, будет снижаться. Чтобы смягчить эту проблему, можно, например, увеличить размер пула потоков libuv, установив переменную окружения `'UV_THREADPOOL_SIZE'` в значение больше `4` (это текущее значение по умолчанию). Однако установка этого значения изнутри процесса через `process.env.UV_THREADPOOL_SIZE=size` не гарантирует результат, так как пул потоков создаётся ещё во время инициализации среды выполнения, задолго до запуска пользовательского кода. Подробнее см. в [документации по пулу потоков libuv](https://docs.libuv.org/en/latest/threadpool.html).

## Полезные параметры V8

У V8 есть собственный набор CLI-параметров. Любой CLI-параметр V8, переданный `node`, будет передан V8 для обработки. Для параметров V8 _не даётся гарантии стабильности_. Команда V8 сама не считает их частью формального API и оставляет за собой право изменить их в любой момент. Аналогично, на них не распространяются гарантии стабильности Node.js. Многие параметры V8 интересны только разработчикам V8. Тем не менее существует небольшой набор параметров V8, которые широко применимы в Node.js, и они документированы здесь:

<!-- v8-options start -->

### `--abort-on-uncaught-exception`

### `--disallow-code-generation-from-strings`

### `--enable-etw-stack-walking`

### `--expose-gc`

### `--harmony-shadow-realm`

### `--heap-snapshot-on-oom`

### `--interpreted-frames-native-stack`

### `--jitless`

### `--max-heap-size`

Указывает максимальный размер кучи процесса (в мегабайтах).

Обычно этот параметр используется для ограничения объёма памяти, который процесс может использовать для своей JavaScript-кучи.

<!-- Anchor to make sure old links find a target -->

### `--max-old-space-size=SIZE` (in MiB) {#--max-old-space-sizesize-in-megabytes}

Устанавливает максимальный размер старой области памяти V8. По мере приближения потребления памяти к пределу V8 будет тратить больше времени на сборку мусора, пытаясь освободить неиспользуемую память.

На машине с 2 GiB памяти можно установить значение 1536 (1.5 GiB), чтобы оставить часть памяти для других задач и избежать подкачки.

```bash
node --max-old-space-size=1536 index.js
```

<!-- Anchor to make sure old links find a target -->

### `--max-semi-space-size=SIZE` (in MiB) {#--max-semi-space-sizesize-in-megabytes}

Устанавливает максимальный размер [полупространства](https://www.memorymanagement.org/glossary/s.html#semi.space) для [сборщика мусора scavenge](https://v8.dev/blog/orinoco-parallel-scavenger) в V8 в MiB (мебибайтах). Увеличение максимального размера полупространства может повысить пропускную способность Node.js ценой большего потребления памяти.

Поскольку размер молодого поколения кучи V8 в три раза больше размера полупространства (см. [`YoungGenerationSizeFromSemiSpaceSize`](https://chromium.googlesource.com/v8/v8.git/+/refs/tags/10.3.129/src/heap/heap.cc#328) в V8), увеличение полупространства на 1 MiB применяется к каждому из трёх отдельных полупространств и увеличивает размер кучи на 3 MiB. Улучшение пропускной способности зависит от вашей нагрузки (см. [#42511](https://github.com/nodejs/node/issues/42511)).

Значение по умолчанию зависит от лимита памяти. Например, в 64-битных системах с лимитом памяти 512 MiB максимальный размер полупространства по умолчанию равен 1 MiB. При лимите памяти до 2 GiB включительно максимальный размер полупространства по умолчанию в 64-битных системах будет меньше 16 MiB.

Чтобы подобрать наилучшую конфигурацию для вашего приложения, попробуйте разные значения `max-semi-space-size` при запуске его бенчмарков.

Например, бенчмарк в 64-битной системе:

```bash
for MiB in 16 32 64 128; do
    node --max-semi-space-size=$MiB index.js
done
```

### `--perf-basic-prof`

### `--perf-basic-prof-only-functions`

### `--perf-prof`

### `--perf-prof-unwinding-info`

### `--prof`

### `--security-revert`

### `--stack-trace-limit=limit`

Максимальное количество кадров стека, собираемых в трассировке стека ошибки. Установка значения 0 отключает сбор трассировки стека. Значение по умолчанию: 10.

```bash
node --stack-trace-limit=12 -p -e "Error.stackTraceLimit" # prints 12
```

<!-- v8-options end -->
