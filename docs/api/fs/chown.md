# chown

## Promise

```js
fsPromises.chown(path, uid, gid);
```

???quote "История"

    Добавлено в: v10.0.0

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `uid` : `<integer>`
-   `gid` : `<integer>`

**Возвращает:**

-   `<Promise>` &mdash; Выполняется с `undefined` в случае успеха.

Изменяет владельца файла.

## Callback

```js
fs.chown(path, uid, gid, callback);
```

???quote "История"

    | Version | Changes                                                                                                                   |
    | ------- | ------------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0 | Passing an invalid callback to the callback argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`. |
    | v10.0.0 | The callback parameter is no longer optional. Not passing it will throw a `TypeError` at runtime.                         |
    | v7.6.0  | The path parameter can be a WHATWG URL object using file: protocol.                                                       |
    | v7.0.0  | The callback parameter is no longer optional. Not passing it will emit a deprecation warning with id DEP0013.             |
    | v0.1.97 | Added in: v0.1.97                                                                                                         |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `uid` : `<integer>`
-   `gid` : `<integer>`
-   `callback` : `<Function>`
    -   `err` : `<Error>`

Асинхронно изменяет владельца и группу файла. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

См. документацию POSIX [`chown(2)`](http://man7.org/linux/man-pages/man2/chown.2.html) для более подробной информации.

## Sync

```js
fs.chownSync(path, uid, gid);
```

???quote "История"

| Version | Changes                                                             |
| ------- | ------------------------------------------------------------------- |
| v7.6.0  | The path parameter can be a WHATWG URL object using file: protocol. |
| v0.1.97 | Added in: v0.1.97                                                   |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `uid` : `<integer>`
-   `gid` : `<integer>`

Синхронно меняет владельца и группу файла. Возвращает неопределенное значение. Это синхронная версия `fs.chown()`.

См. документацию POSIX [`chown(2)`](http://man7.org/linux/man-pages/man2/chown.2.html) для более подробной информации.

## FileHandle

```js
filehandle.chown(uid, gid);
```

???quote "История"

    Добавлено в: v10.0.0

**Параметры:**

-   `uid` : `<integer>` &mdash; Идентификатор пользователя нового владельца файла.
-   `gid` : `<integer>` &mdash; Идентификатор группы новой группы файла.

**Возвращает:**

-   `<Promise>` &mdash; Выполняется с `undefined` в случае успеха.
