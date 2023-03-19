# createWriteStream

## Callback

```js
fs.createWriteStream(path[, options])
```

???quote "История"

    | Version           | Changes                                                             |
    | ----------------- | ------------------------------------------------------------------- |
    | v16.10.0          | The fs option does not need open method if an fd was provided.      |
    | v16.10.0          | The fs option does not need close method if autoClose is false.     |
    | v15.4.0           | The fd option accepts FileHandle arguments.                         |
    | v14.0.0           | Change emitClose default to true.                                   |
    | v13.6.0, v12.17.0 | The fs options allow overriding the used fs implementation.         |
    | v12.10.0          | Enable emitClose option.                                            |
    | v7.6.0            | The path parameter can be a WHATWG URL object using file: protocol. |
    | v7.0.0            | The passed options object will never be modified.                   |
    | v5.5.0            | The autoClose option is supported now.                              |
    | v2.3.0            | The passed options object can be a string now.                      |
    | v0.1.31           | Added in: v0.1.31                                                   |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `options` : `<string>` | `<Object>`
    -   `flags` = `'w'` : `<string>`
    -   `encoding` = `'utf8'` : `<string>`
    -   `fd` = `null` : `<integer>` | `<FileHandle>`
    -   `mode` = `0o666` : `<integer>`
    -   `autoClose` = `true` : `<boolean>`
    -   `emitClose` = `true` : `<boolean>`
    -   `start` : `<integer>`
    -   `fs` = `null` : `<Object>` | `<null>`

**Возвращает:**

-   `<fs.WriteStream>`

`options` также может включать параметр `start`, позволяющий записывать данные в некоторой позиции после начала файла, допустимые значения находятся в диапазоне `[0, Number.MAX_SAFE_INTEGER]`. Для изменения файла вместо его замены может потребоваться установить для параметра `flags` значение `r+`, а не значение по умолчанию `w`. Кодировка может быть любой из принятых `<Buffer>`.

Если для `autoClose` установлено значение `true` (поведение по умолчанию) при `error` или `finish`, дескриптор файла будет закрыт автоматически. Если `autoClose` имеет значение `false`, то файловый дескриптор не будет закрыт, даже если произойдет ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки дескриптора файла.

По умолчанию поток будет генерировать событие `close` после того, как он будет уничтожен. Установите для параметра `emitClose` значение `false`, чтобы изменить это поведение.

Предоставляя опцию `fs`, можно переопределить соответствующие реализации `fs` для `open`, `write`, `writev` и `close`. Переопределение `write()` без `writev()` может снизить производительность, так как некоторые оптимизации (`_writev()`) будут отключены. При предоставлении опции `fs` требуются переопределения по крайней мере для одного из операций `write` и `writev`. Если опция `fd` не указана, также требуется переопределение для открытия. Если `autoClose` имеет значение `true`, также требуется переопределение для `close`.

Как и `<fs.ReadStream>`, если указан `fd`, `<fs.WriteStream>` будет игнорировать аргумент `path` и будет использовать указанный файловый дескриптор. Это означает, что никакое событие `open` не будет сгенерировано. `fd` должен блокировать; неблокирующие `fd` должны передаваться в `<net.Socket>`.

Если `options` является строкой, то она определяет кодировку.

## FileHandle

```js
filehandle.createWriteStream([options]);
```

???quote "История"

    Добавлено в: v16.11.0

**Параметры:**

-   `options` <Object>
    -   `encoding` = `'utf8'` : `<string>`
    -   `autoClose` = `true` : `<boolean>`
    -   `emitClose` = `true` : `<boolean>`
    -   `start` : `<integer>`

**Возвращает:**

-   `<fs.WriteStream>`

`options` также может включать параметр `start`, позволяющий записывать данные в некоторой позиции после начала файла, допустимые значения находятся в диапазоне `[0, Number.MAX_SAFE_INTEGER]`. Для изменения файла вместо его замены может потребоваться установить для параметра `flags` `open` значение `r+`, а не значение `r` по умолчанию. Кодировка может быть любой из принятых `<Buffer>`.

Если для `autoClose` установлено значение `true` (поведение по умолчанию) при `error` или `finish`, дескриптор файла будет закрыт автоматически. Если `autoClose` имеет значение `false`, то файловый дескриптор не будет закрыт, даже если произойдет ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки дескриптора файла.

По умолчанию поток будет генерировать событие `close` после того, как он будет уничтожен. Установите для параметра `emitClose` значение `false`, чтобы изменить это поведение.
