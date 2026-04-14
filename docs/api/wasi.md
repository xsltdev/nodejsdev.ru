---
title: WebAssembly System Interface (WASI)
description: Модуль node:wasi реализует WASI для запуска WebAssembly с доступом к ОС; статус экспериментальный, без гарантий песочницы файловой системы
---

# WebAssembly System Interface (WASI)

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/wasi.html)

<!--introduced_in=v12.16.0-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Эта возможность изменяется и может быть изменена или удалена в последующих версиях.

<strong class="critical">Модуль `node:wasi` в настоящее время не обеспечивает те же свойства безопасности файловой системы, что некоторые среды выполнения WASI. Полноценная безопасная изоляция файловой системы может быть или не быть реализована в будущем. Пока не полагайтесь на неё для запуска недоверенного кода.</strong>

<!-- source_link=lib/wasi.js -->

API WASI реализует спецификацию [WebAssembly System Interface][WebAssembly System Interface]. WASI даёт приложениям WebAssembly доступ к базовой операционной системе через набор функций в духе POSIX.

=== "MJS"

    ```js
    import { readFile } from 'node:fs/promises';
    import { WASI } from 'node:wasi';
    import { argv, env } from 'node:process';
    
    const wasi = new WASI({
      version: 'preview1',
      args: argv,
      env,
      preopens: {
        '/local': '/some/real/path/that/wasm/can/access',
      },
    });
    
    const wasm = await WebAssembly.compile(
      await readFile(new URL('./demo.wasm', import.meta.url)),
    );
    const instance = await WebAssembly.instantiate(wasm, wasi.getImportObject());
    
    wasi.start(instance);
    ```

=== "CJS"

    ```js
    'use strict';
    const { readFile } = require('node:fs/promises');
    const { WASI } = require('node:wasi');
    const { argv, env } = require('node:process');
    const { join } = require('node:path');
    
    const wasi = new WASI({
      version: 'preview1',
      args: argv,
      env,
      preopens: {
        '/local': '/some/real/path/that/wasm/can/access',
      },
    });
    
    (async () => {
      const wasm = await WebAssembly.compile(
        await readFile(join(__dirname, 'demo.wasm')),
      );
      const instance = await WebAssembly.instantiate(wasm, wasi.getImportObject());
    
      wasi.start(instance);
    })();
    ```

Чтобы запустить пример выше, создайте текстовый файл WebAssembly с именем `demo.wat`:

```text
(module
    ;; Импорт обязательной функции WASI fd_write, которая записывает
    ;; заданные векторы ввода-вывода в stdout
    ;; Сигнатура функции fd_write:
    ;; (File Descriptor, *iovs, iovs_len, nwritten) -> возвращает число записанных байтов
    (import "wasi_snapshot_preview1" "fd_write" (func $fd_write (param i32 i32 i32 i32) (result i32)))

    (memory 1)
    (export "memory" (memory 0))

    ;; Записать 'hello world\n' в память по смещению 8 байт
    ;; В конце обязателен перевод строки, иначе текст не появится
    (data (i32.const 8) "hello world\n")

    (func $main (export "_start")
        ;; Создать новый вектор ввода-вывода в линейной памяти
        (i32.store (i32.const 0) (i32.const 8))  ;; iov.iov_base - указатель на начало строки 'hello world\n'
        (i32.store (i32.const 4) (i32.const 12))  ;; iov.iov_len - длина строки 'hello world\n'

        (call $fd_write
            (i32.const 1) ;; file_descriptor - 1 для stdout
            (i32.const 0) ;; *iovs - указатель на массив iov, хранящийся по адресу 0 в памяти
            (i32.const 1) ;; iovs_len - печатается 1 строка, сохранённая в iov
            (i32.const 20) ;; nwritten - область памяти для числа записанных байтов
        )
        drop ;; Удалить число записанных байтов с вершины стека
    )
)
```

Скомпилируйте `.wat` в `.wasm` с помощью [wabt](https://github.com/WebAssembly/wabt):

```bash
wat2wasm demo.wat
```

## Безопасность

<!-- YAML
added:
  - v21.2.0
  - v20.11.0
changes:
  - version:
    - v21.2.0
    - v20.11.0
    pr-url: https://github.com/nodejs/node/pull/50396
    description: Clarify WASI security properties.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.2.0, v20.11.0 | Уточнены свойства безопасности WASI. |

WASI использует модель на основе возможностей (capabilities): приложениям предоставляются собственные настраиваемые возможности `env`, `preopens`, `stdin`, `stdout`, `stderr` и `exit`.

**Текущая модель угроз Node.js не обеспечивает безопасную изоляцию в том виде, как это делают некоторые среды WASI.**

Хотя механизмы возможностей поддерживаются, в Node.js они не составляют полноценную модель безопасности. Например, изоляцию файловой системы можно обойти различными приёмами. Проект изучает, можно ли добавить такие гарантии в будущем.

## Класс: `WASI`

<!-- YAML
added:
 - v13.3.0
 - v12.16.0
-->

Класс `WASI` предоставляет API системных вызовов WASI и вспомогательные методы для работы с приложениями на базе WASI. Каждый экземпляр `WASI` представляет отдельное окружение.

### `new WASI([options])`

<!-- YAML
added:
 - v13.3.0
 - v12.16.0
changes:
 - version: v20.1.0
   pr-url: https://github.com/nodejs/node/pull/47390
   description: default value of returnOnExit changed to true.
 - version: v20.0.0
   pr-url: https://github.com/nodejs/node/pull/47391
   description: The version option is now required and has no default value.
 - version: v19.8.0
   pr-url: https://github.com/nodejs/node/pull/46469
   description: version field added to options.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.1.0 | Значение по умолчанию `returnOnExit` изменено на `true`. |
    | v20.0.0 | Параметр версии теперь является обязательным и не имеет значения по умолчанию. |
    | v19.8.0 | Поле версии добавлено в опции. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `args` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив строк, которые приложение WebAssembly будет видеть как аргументы командной строки. Первый аргумент — виртуальный путь к самой команде WASI. **По умолчанию:** `[]`.
  * `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект, аналогичный `process.env`, который приложение WebAssembly будет видеть как своё окружение. **По умолчанию:** `{}`.
  * `preopens` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Локальная структура каталогов приложения WebAssembly. Строковые ключи `preopens` трактуются как каталоги в виртуальной файловой системе. Соответствующие значения — реальные пути к этим каталогам на хосте.
  * `returnOnExit` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) По умолчанию, когда приложения WASI вызывают `__wasi_proc_exit()`, метод `wasi.start()` возвращает управление с указанным кодом выхода вместо завершения процесса. Значение `false` приводит к завершению процесса Node.js с указанным кодом выхода. **По умолчанию:** `true`.
  * `stdin` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Дескриптор файла, используемый как стандартный ввод в приложении WebAssembly. **По умолчанию:** `0`.
  * `stdout` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Дескриптор файла, используемый как стандартный вывод в приложении WebAssembly. **По умолчанию:** `1`.
  * `stderr` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Дескриптор файла, используемый как стандартный поток ошибок в приложении WebAssembly. **По умолчанию:** `2`.
  * `version` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Запрашиваемая версия WASI. Сейчас поддерживаются только `unstable` и `preview1`. Параметр **обязателен**.

### `wasi.getImportObject()`

<!-- YAML
added: v19.8.0
-->

Возвращает объект импорта, который можно передать в `WebAssembly.instantiate()`, если кроме WASI другие импорты WASM не нужны.

Если в конструктор передана версия `unstable`, будет возвращено:

```json
{ wasi_unstable: wasi.wasiImport }
```

Если передана версия `preview1` или версия не указана (в актуальном API версия обязательна — см. выше), будет возвращено:

```json
{ wasi_snapshot_preview1: wasi.wasiImport }
```

### `wasi.start(instance)`

<!-- YAML
added:
 - v13.3.0
 - v12.16.0
-->

* `instance` [`<WebAssembly.Instance>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Instance)

Пытается начать выполнение `instance` как команды WASI, вызывая экспорт `_start()`. Если в `instance` нет экспорта `_start()` или есть экспорт `_initialize()`, выбрасывается исключение.

`start()` требует, чтобы `instance` экспортировал [`WebAssembly.Memory`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Memory) с именем `memory`. При отсутствии экспорта `memory` выбрасывается исключение.

Повторный вызов `start()` приводит к исключению.

### `wasi.initialize(instance)`

<!-- YAML
added:
 - v14.6.0
 - v12.19.0
-->

* `instance` [`<WebAssembly.Instance>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Instance)

Пытается инициализировать `instance` как реактор WASI, вызывая экспорт `_initialize()`, если он есть. Если в `instance` есть экспорт `_start()`, выбрасывается исключение.

`initialize()` требует экспорта [`WebAssembly.Memory`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Memory) с именем `memory`. При отсутствии экспорта `memory` выбрасывается исключение.

Повторный вызов `initialize()` приводит к исключению.

### `wasi.finalizeBindings(instance[, options])`

<!-- YAML
added: v24.4.0
-->

* `instance` [`<WebAssembly.Instance>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Instance)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `memory` [`<WebAssembly.Memory>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Memory) **По умолчанию:** `instance.exports.memory`.

Настраивает привязки хоста WASI к `instance` без вызова `initialize()` или `start()`. Полезно, когда модуль WASI создаётся в дочерних потоках с разделяемой памятью.

`finalizeBindings()` требует либо экспорта [`WebAssembly.Memory`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Memory) с именем `memory`, либо явного указания объекта [`WebAssembly.Memory`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Memory) в `options.memory`. При невалидной памяти выбрасывается исключение.

`start()` и `initialize()` внутри вызывают `finalizeBindings()`. Повторный вызов `finalizeBindings()` приводит к исключению.

### `wasi.wasiImport`

<!-- YAML
added:
 - v13.3.0
 - v12.16.0
-->

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

`wasiImport` — объект, реализующий API системных вызовов WASI. Его следует передавать как импорт `wasi_snapshot_preview1` при создании [`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Instance).

[WebAssembly System Interface]: https://wasi.dev/
[`WebAssembly.Instance`]: https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Instance
[`WebAssembly.Memory`]: https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Memory
