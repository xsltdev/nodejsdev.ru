# futimes

## Callback

```js
fs.futimes(fd, atime, mtime, callback);
```

???quote "История"

    | Version | Changes                                                                                                                   |
    | ------- | ------------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0 | Passing an invalid callback to the callback argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`. |
    | v10.0.0 | The callback parameter is no longer optional. Not passing it will throw a TypeError at runtime.                           |
    | v7.0.0  | The callback parameter is no longer optional. Not passing it will emit a deprecation warning with id DEP0013.             |
    | v4.1.0  | Numeric strings, `NaN`, and `Infinity` are now allowed time specifiers.                                                   |
    | v0.4.2  | Added in: v0.4.2                                                                                                          |

**Параметры:**

-   `fd` : `<integer>`
-   `atime` : `<number>` | `<string>` | `<Date>`
-   `mtime` : `<number>` | `<string>` | `<Date>`
-   `callback` : `<Function>`
    -   `err` : `<Error>`

Изменяет временные метки файловой системы объекта, на который ссылается предоставленный файловый дескриптор. См. [`fs.utimes()`](utimes.md#callback).

## Sync

```js
fs.futimesSync(fd, atime, mtime);
```

???quote "История"

    | Version | Changes                                                             |
    | ------- | ------------------------------------------------------------------- |
    | v4.1.0  | Numeric strings, NaN, and Infinity are now allowed time specifiers. |
    | v0.4.2  | Added in: v0.4.2                                                    |

**Параметры:**

-   `fd` : `<integer>`
-   `atime` : `<number>` | `<string>` | `<Date>`
-   `mtime` : `<number>` | `<string>` | `<Date>`

Синхронная версия [`fs.futimes()`](#callback). Возвращает `undefined`.
