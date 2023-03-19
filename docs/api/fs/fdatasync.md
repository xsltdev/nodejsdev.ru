# fdatasync

## Callback

```js
fs.fdatasync(fd, callback);
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

Принудительно переводит все операции ввода-вывода в очереди, связанные с файлом, в состояние завершения синхронизированного ввода-вывода операционной системы. За подробностями обратитесь к документации POSIX [`fdatasync(2)`](http://man7.org/linux/man-pages/man2/fdatasync.2.html). Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

## Sync

```js
fs.fdatasyncSync(fd);
```

???quote "История"

    Добавлено в: v0.1.96

**Параметры:**

-   `fd` : `<integer>`

Принудительно переводит все операции ввода-вывода в очереди, связанные с файлом, в состояние завершения синхронизированного ввода-вывода операционной системы. За подробностями обратитесь к документации POSIX [`fdatasync(2)`](http://man7.org/linux/man-pages/man2/fdatasync.2.html). Возвращает `undefined`.
