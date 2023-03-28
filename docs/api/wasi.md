---
description: API WASI предоставляет реализацию спецификации WebAssembly System Interface
---

# WASI

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/wasi.html)

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

API WASI предоставляет реализацию спецификации [WebAssembly System Interface](https://wasi.dev/). WASI предоставляет изолированным приложениям WebAssembly доступ к базовой операционной системе через набор POSIX-подобных функций.

```mjs
import { readFile } from 'node:fs/promises';
import { WASI } from 'wasi';
import { argv, env } from 'node:process';

const wasi = new WASI({
  version: 'preview1',
  args: argv,
  env,
  preopens: {
    '/sandbox': '/some/real/path/that/wasm/can/access',
  },
});

const wasm = await WebAssembly.compile(
  await readFile(new URL('./demo.wasm', import.meta.url))
);
const instance = await WebAssembly.instantiate(
  wasm,
  wasi.getImportObject()
);

wasi.start(instance);
```

```cjs
'use strict';
const { readFile } = require('node:fs/promises');
const { WASI } = require('wasi');
const { argv, env } = require('node:process');
const { join } = require('node:path');

const wasi = new WASI({
  version: 'preview1',
  args: argv,
  env,
  preopens: {
    '/sandbox': '/some/real/path/that/wasm/can/access',
  },
});

(async () => {
  const wasm = await WebAssembly.compile(
    await readFile(join(__dirname, 'demo.wasm'))
  );
  const instance = await WebAssembly.instantiate(
    wasm,
    wasi.getImportObject()
  );

  wasi.start(instance);
})();
```

Чтобы выполнить описанный выше пример, создайте новый файл WebAssembly в текстовом формате с именем `demo.wat`:

```text
(module
    ;; Import the required fd_write WASI function which will write the given io vectors to stdout
    ;; The function signature for fd_write is:
    ;; (File Descriptor, *iovs, iovs_len, nwritten) -> Returns number of bytes written
    (import "wasi_snapshot_preview1" "fd_write" (func $fd_write (param i32 i32 i32 i32) (result i32)))

    (memory 1)
    (export "memory" (memory 0))

    ;; Write 'hello world\n' to memory at an offset of 8 bytes
    ;; Note the trailing newline which is required for the text to appear
    (data (i32.const 8) "hello world\n")

    (func $main (export "_start")
        ;; Creating a new io vector within linear memory
        (i32.store (i32.const 0) (i32.const 8))  ;; iov.iov_base - This is a pointer to the start of the 'hello world\n' string
        (i32.store (i32.const 4) (i32.const 12))  ;; iov.iov_len - The length of the 'hello world\n' string

        (call $fd_write
            (i32.const 1) ;; file_descriptor - 1 for stdout
            (i32.const 0) ;; *iovs - The pointer to the iov array, which is stored at memory location 0
            (i32.const 1) ;; iovs_len - We're printing 1 string stored in an iov - so one.
            (i32.const 20) ;; nwritten - A place in memory to store the number of bytes written
        )
        drop ;; Discard the number of bytes written from the top of the stack
    )
)
```

Используйте [wabt](https://github.com/WebAssembly/wabt) для компиляции `.wat` в `.wasm`.

```console
$ wat2wasm demo.wat
```

Для запуска этого примера необходим аргумент CLI `--experimental-wasi-unstable-preview1`.

## Класс: `WASI`

Класс `WASI` предоставляет API системных вызовов WASI и дополнительные удобные методы для работы с приложениями на базе WASI. Каждый экземпляр `WASI` представляет собой отдельную среду "песочницы". В целях безопасности каждый экземпляр `WASI` должен иметь свои аргументы командной строки, переменные среды и структуру каталога песочницы, настроенные явным образом.

### `новый WASI([опции])`

- `options` {Object}
  - `args` {Array} Массив строк, которые приложение WebAssembly будет воспринимать как аргументы командной строки. Первый аргумент - это виртуальный путь к самой команде WASI. **По умолчанию:** `[]`.
  - `env` {Object} Объект, подобный `process.env`, который приложение WebAssembly будет воспринимать как свое окружение. **По умолчанию:** `{}`.
  - `preopens` {Object} Этот объект представляет структуру каталогов "песочницы" приложения WebAssembly. Строковые ключи `preopens` рассматриваются как каталоги внутри песочницы. Соответствующие значения в `preopens` - это реальные пути к этим директориям на хост-машине.
  - `returnOnExit` {boolean} По умолчанию приложения WASI завершают процесс Node.js с помощью функции `__wasi_proc_exit()`. Установка этой опции в `true` заставляет `wasi.start()` возвращать код выхода, а не завершать процесс. **По умолчанию:** `false`.
  - `stdin` {целое} Дескриптор файла, используемый в качестве стандартного ввода в приложении WebAssembly. **По умолчанию:** `0`.
  - `stdout` {целое число} Дескриптор файла, используемый в качестве стандартного вывода в приложении WebAssembly. **По умолчанию:** `1`.
  - `stderr` {целое число} Дескриптор файла, используемый в качестве стандартной ошибки в приложении WebAssembly. **По умолчанию:** `2`.
  - `version` {string} Запрашиваемая версия WASI. В настоящее время поддерживаются только версии `unstable` и `preview1`. **По умолчанию:** `preview1`.

### `wasi.getImportObject()`

Возвращает объект импорта, который может быть передан в `WebAssembly.instantiate()`, если не требуется никаких других импортов WASM, кроме тех, которые предоставляются WASI.

Если в конструктор была передана версия `unstable`, он вернет:

```json
{ "wasi_unstable": wasi.wasiImport }
```

Если в конструктор была передана версия `preview1` или версия не была указана, он вернет:

```json
{ "wasi_snapshot_preview1": wasi.wasiImport }
```

### `wasi.start(instance)`

- `instance` {WebAssembly.Instance}

Попытка начать выполнение `instance` как команды WASI, вызвав ее экспорт `_start()`. Если `instance` не содержит экспорта `_start()`, или если `instance` содержит экспорт `_initialize()`, то возникает исключение.

`start()` требует, чтобы `instance` экспортировала [`WebAssembly.Memory`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Memory) с именем `memory`. Если `instance` не экспортирует `memory`, то возникает исключение.

Если `start()` вызывается более одного раза, возникает исключение.

### `wasi.initialize(instance)`

- `instance` {WebAssembly.Instance}

Попытка инициализировать `instance` как реактор WASI, вызывая его экспорт `_initialize()`, если он присутствует. Если `instance` содержит экспорт `_start()`, то будет выброшено исключение.

`initialize()` требует, чтобы `instance` экспортировал [`WebAssembly.Memory`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Memory) с именем `memory`. Если `instance` не экспортирует `memory`, то возникает исключение.

Если `initialize()` вызывается более одного раза, возникает исключение.

### `wasi.wasiImport`

- {Object}

`wasiImport` - это объект, реализующий API системных вызовов WASI. Этот объект должен быть передан как импорт `wasi_snapshot_preview1` во время инстанцирования [`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Instance).
