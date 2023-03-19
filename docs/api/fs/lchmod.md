# lchmod

## Promise

```js
fsPromises.lchmod(path, mode);
```

_Устарело с: v10.0.0_

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `mode` : `<integer>`

**Возвращает:**

-   `<Promise>` &mdash; Выполняется с `undefined` в случае успеха.

Изменяет разрешения на символическую ссылку.

Этот метод реализован только в macOS.

## Callback

```js
fs.lchmod(path, mode, callback);
```

???quote "История"

    | Version | Changes                                                                                                                   |
    | ------- | ------------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0 | Passing an invalid callback to the callback argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`. |
    | v16.0.0 | The error returned may be an `AggregateError` if more than one error is returned.                                         |
    | v10.0.0 | The callback parameter is no longer optional. Not passing it will throw a TypeError at runtime.                           |
    | v7.0.0  | The callback parameter is no longer optional. Not passing it will emit a deprecation warning with id DEP0013.             |
    | v0.4.7  | Deprecated since: v0.4.7                                                                                                  |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `mode` : `<integer>`
-   `callback` : `<Function>`
    -   `err` : `<Error>` | `<AggregateError>`

Изменяет разрешения на символическую ссылку. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

Этот метод реализован только в macOS.

Подробности смотрите в документации POSIX [`lchmod(2)`](https://www.freebsd.org/cgi/man.cgi?query=lchmod&sektion=2).

## Sync

```js
fs.lchmodSync(path, mode);
```

_Устарело с: v0.4.7_

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `mode` : `<integer>`

Изменяет разрешения на символическую ссылку. Возвращает `undefined`.

Этот метод реализован только в macOS.

Подробности смотрите в документации POSIX [`lchmod(2)`](https://www.freebsd.org/cgi/man.cgi?query=lchmod&sektion=2).
