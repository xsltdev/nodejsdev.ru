# fsync

## Callback

```js
fs.fsync(fd, callback);
```

???quote "История"

    | Version | Changes                                                                                                                   |
    | ------- | ------------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0 | Passing an invalid callback to the callback argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`. |
    | v10.0.0 | The callback parameter is no longer optional. Not passing it will throw a TypeError at runtime.                           |
    | v7.0.0  | The callback parameter is no longer optional. Not passing it will emit a deprecation warning with id DEP0013.             |
    | v0.1.96 | Added in: v0.1.96                                                                                                         |

**Параметры:**

-   `fd` : `<integer>`
-   `callback` : `<Function>`
    -   `err` : `<Error>`

Запросите, чтобы все данные для дескриптора открытого файла были сброшены на устройство хранения. Конкретная реализация зависит от операционной системы и устройства. За более подробной информацией обратитесь к документации POSIX [`fsync(2)`](http://man7.org/linux/man-pages/man2/fsync.2.html). Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

## Sync

```js
fs.fsyncSync(fd);
```

???quote "История"

    Добавлено в: v0.1.96

**Параметры:**

-   `fd` : `<integer>`

Запросите, чтобы все данные для дескриптора открытого файла были сброшены на устройство хранения. Конкретная реализация зависит от операционной системы и устройства. За более подробной информацией обратитесь к документации POSIX [`fsync(2)`](http://man7.org/linux/man-pages/man2/fsync.2.html). Возвращает `undefined`.
