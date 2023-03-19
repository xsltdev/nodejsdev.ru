# fchown

**`fchown`** устанавливает владельца файла.

## Callback

```js
fs.fchown(fd, uid, gid, callback);
```

???quote "История"

    | Version                                                                                                                   | Changes |
    | ------------------------------------------------------------------------------------------------------------------------- | ------- |
    | v18.0.0                                                                                                                   |
    | Passing an invalid callback to the callback argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`. |
    | v10.0.0                                                                                                                   |
    | The callback parameter is no longer optional. Not passing it will throw a TypeError at runtime.                           |
    | v7.0.0                                                                                                                    |
    | The callback parameter is no longer optional. Not passing it will emit a deprecation warning with id DEP0013.             |
    | v0.4.7                                                                                                                    |
    | Added in: v0.4.7                                                                                                          |

**Параметры:**

-   `fd` : `<integer>`
-   `uid` : `<integer>`
-   `gid` : `<integer>`
-   `callback` : `<Function>`
    -   `err` : `<Error>`

Устанавливает владельца файла. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

Подробности смотрите в документации POSIX [`fchown(2)`](http://man7.org/linux/man-pages/man2/fchown.2.html).

## Sync

```js
fs.fchownSync(fd, uid, gid);
```

???quote "История"

    Добавлено в: v0.4.7

**Параметры:**

-   `fd` : `<integer>`
-   `uid` : `<integer>` &mdash; Идентификатор пользователя нового владельца файла.
-   `gid` : `<integer>` &mdash; Идентификатор группы новой группы файла.

Устанавливает владельца файла. Возвращает `undefined`.

Подробности смотрите в документации POSIX [`fchown(2)`](http://man7.org/linux/man-pages/man2/fchown.2.html).
