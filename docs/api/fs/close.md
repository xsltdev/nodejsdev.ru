# close

## Callback

```js
fs.close(fd[, callback])
```

???quote "История"

    | Version           | Changes                                                                                                                   |
    | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0           | Passing an invalid callback to the callback argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`. |
    | v15.9.0, v14.17.0 | A default callback is now used if one is not provided.                                                                    |
    | v10.0.0           | The callback parameter is no longer optional. Not passing it will throw a `TypeError` at runtime.                         |
    | v7.0.0            | The callback parameter is no longer optional. Not passing it will emit a deprecation warning with id DEP0013.             |
    | v0.0.2            | Added in: v0.0.2                                                                                                          |

**Параметры:**

-   `fd` : `<integer>`
-   `callback` : `<Function>`
    -   `err` : `<Error>`

Закрывает дескриптор файла. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

Вызов `fs.close()` для любого дескриптора файла (`fd`), который в настоящее время используется через любую другую операцию `fs`, может привести к неопределенному поведению.

См. документацию POSIX [`close(2)`](http://man7.org/linux/man-pages/man2/close.2.html) для более подробной информации.

## Sync

```js
fs.closeSync(fd);
```

???quote "История"

    Добавлено в: v0.1.21

**Параметры:**

-   `fd` : `<integer>`

Закрывает дескриптор файла. Возвращает `undefined`.

Вызов `fs.closeSync()` для любого файлового дескриптора (`fd`), который в настоящее время используется через любую другую операцию `fs`, может привести к неопределенному поведению.

См. документацию POSIX [`close(2)`](http://man7.org/linux/man-pages/man2/close.2.html) для более подробной информации.

## FileHandle

```js
filehandle.close();
```

???quote "История"

    Добавлено в: v10.0.0

**Возвращает:**

-   `<Promise>` Выполняется с `undefined` в случае успеха.

Закрывает дескриптор файла после ожидания завершения любой ожидающей операции с дескриптором.

### Пример

```js
import { open } from 'node:fs/promises';

let filehandle;
try {
    filehandle = await open('thefile.txt', 'r');
} finally {
    await filehandle?.close();
}
```
