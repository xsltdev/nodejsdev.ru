# lchown

## Promise

```js
fsPromises.lchown(path, uid, gid);
```

???quote "История"

    | Version | Changes                           |
    | ------- | --------------------------------- |
    | v10.6.0 | This API is no longer deprecated. |
    | v10.0.0 | Added in: v10.0.0                 |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `uid` : `<integer>`
-   `gid` : `<integer>`

**Возвращает:**

-   `<Promise>` Выполняется с `undefined` в случае успеха.

Изменяет владельца символической ссылки.

## Callback

```js
fs.lchown(path, uid, gid, callback);
```

???quote "История"

    | Version | Changes                                                                                                               |
    | ------- | --------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0 | Passing an invalid callback to the callback argument now throws ERR_INVALID_ARG_TYPE instead of ERR_INVALID_CALLBACK. |
    | v10.6.0 | This API is no longer deprecated.                                                                                     |
    | v10.0.0 | The callback parameter is no longer optional. Not passing it will throw a TypeError at runtime.                       |
    | v7.0.0  | The callback parameter is no longer optional. Not passing it will emit a deprecation warning with id DEP0013.         |
    | v0.4.7  | Documentation-only deprecation.                                                                                       |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `uid` : `<integer>`
-   `gid` : `<integer>`
-   `callback` : `<Function>`
    -   `err` : `<Error>`

Устанавливает владельца символической ссылки. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

Подробности смотрите в документации POSIX [`lchown(2)`](http://man7.org/linux/man-pages/man2/lchown.2.html).

## Sync

```js
fs.lchownSync(path, uid, gid);
```

???quote "История"

    | Version | Changes                           |
    | ------- | --------------------------------- |
    | v10.6.0 | This API is no longer deprecated. |
    | v0.4.7  | Documentation-only deprecation.   |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `uid` : `<integer>` &mdash; Идентификатор пользователя нового владельца файла.
-   `gid` : `<integer>` &mdash; Идентификатор группы новой группы файла.

Устанавливает владельца символической ссылки. Возвращает `undefined`.

См. документацию POSIX [`lchown(2)`](http://man7.org/linux/man-pages/man2/lchown.2.html) для более подробной информации.
