# chmod

## Promise

```js
fsPromises.chmod(path, mode);
```

???quote "История"

    Добавлено в: v10.0.0

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `mode` : `<string>` | `<integer>`

Возвращает:

-   `<Promise>` &mdash; Выполняется с `undefined` в случае успеха.

Изменяет права доступа к файлу.

## Callback

```js
fs.chmod(path, mode, callback);
```

???quote "История"

    | Version | Changes                                                                                                               |
    | ------- | --------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0 | Passing an invalid callback to the callback argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`. |
    | v10.0.0 | The callback parameter is no longer optional. Not passing it will throw a `TypeError` at runtime.                       |
    | v7.6.0  | The path parameter can be a WHATWG URL object using file: protocol.                                                   |
    | v7.0.0  | The callback parameter is no longer optional. Not passing it will emit a deprecation warning with id DEP0013.         |
    | v0.1.30 | Added in: v0.1.30                                                                                                     |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `mode` : `<string>` | `<integer>`
-   `callback` : `<Function>`
    -   `err` : `<Error>`

Асинхронно изменяет права доступа к файлу. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

См. документацию POSIX [`chmod(2)`](http://man7.org/linux/man-pages/man2/chmod.2.html) для более подробной информации.

### Пример

```js
import { chmod } from 'node:fs';

chmod('my_file.txt', 0o775, (err) => {
    if (err) throw err;
    console.log(
        'The permissions for file "my_file.txt" have been changed!'
    );
});
```

## Sync

???quote "История"

    | Version | Changes                                                             |
    | ------- | ------------------------------------------------------------------- |
    | v7.6.0  | The path parameter can be a WHATWG URL object using file: protocol. |
    | v0.6.7  | Added in: v0.6.7                                                    |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `mode` : `<string>` | `<integer>`

См. документацию POSIX [`chmod(2)`](http://man7.org/linux/man-pages/man2/chmod.2.html) для более подробной информации.

## FileHandle

```js
filehandle.chmod(mode);
```

???quote "История"

    Добавлено в: v10.0.0

**Параметры:**

-   `mode` : `<integer>` &mdash; битовая маска файлового режима.

**Возвращает:**

-   `<Promise>` &mdash; Выполняется с undefined в случае успеха.

Изменяет права доступа к файлу. См. [`chmod(2)`](http://man7.org/linux/man-pages/man2/chmod.2.html).
