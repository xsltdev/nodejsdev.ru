# fstat

## Callback

```js
fs.fstat(fd[, options], callback)
```

???quote "История"

    | Version | Changes                                                                                                               |
    | ------- | --------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0 | Passing an invalid callback to the callback argument now throws ERR_INVALID_ARG_TYPE instead of ERR_INVALID_CALLBACK. |
    | v10.5.0 | Accepts an additional options object to specify whether the numeric values returned should be bigint.                 |
    | v10.0.0 | The callback parameter is no longer optional. Not passing it will throw a TypeError at runtime.                       |
    | v7.0.0  | The callback parameter is no longer optional. Not passing it will emit a deprecation warning with id DEP0013.         |
    | v0.1.95 | Added in: v0.1.95                                                                                                     |

**Параметры:**

-   `fd` : `<integer>`
-   `options` : `<Object>`
    -   `bigint` = `false` : `<boolean>` &mdash; должны ли числовые значения в возвращаемом объекте `<fs.Stats>` быть `bigint`.
-   `callback` : `<Function>`
    -   `err` : `<Error>`
    -   `stats` : `<fs.Stats>`

Вызывает обратный вызов с `<fs.Stats>` для файлового дескриптора.

Подробности смотрите в документации POSIX [`fstat(2)`](http://man7.org/linux/man-pages/man2/fstat.2.html).

## Sync

```js
fs.fstatSync(fd[, options])
```

???quote "История"

    | Version | Changes                                                                                               |
    | ------- | ----------------------------------------------------------------------------------------------------- |
    | v10.5.0 | Accepts an additional options object to specify whether the numeric values returned should be bigint. |
    | v0.1.95 | Added in: v0.1.95                                                                                     |

**Параметры:**

-   `fd` : `<integer>`
-   `options` : `<Object>`
    -   `bigint` = `false` : `<boolean>` &mdash; должны ли числовые значения в возвращаемом объекте `<fs.Stats>` быть `bigint`.

**Возвращает:**

-   `<fs.Stats>`

Извлекает `<fs.Stats>` для файлового дескриптора.

Подробности смотрите в документации POSIX [`fstat(2)`](http://man7.org/linux/man-pages/man2/fstat.2.html).
