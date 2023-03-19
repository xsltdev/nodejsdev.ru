# ftruncate

## Callback

```js
fs.ftruncate(fd[, len], callback)
```

???quote "История"

    | Version | Changes                                                                                                                   |
    | ------- | ------------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0 | Passing an invalid callback to the callback argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`. |
    | v10.0.0 | The callback parameter is no longer optional. Not passing it will throw a TypeError at runtime.                           |
    | v7.0.0  | The callback parameter is no longer optional. Not passing it will emit a deprecation warning with id DEP0013.             |
    | v0.8.6  | Added in: v0.8.6                                                                                                          |

**Параметры:**

-   `fd` : `<integer>`
-   `len` = `0` : `<integer>`
-   `callback` : `<Function>`
    -   `err` : `<Error>`

Усекает дескриптор файла. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

См. документацию POSIX [`ftruncate(2)`](http://man7.org/linux/man-pages/man2/ftruncate.2.html) для более подробной информации.

Если файл, на который ссылается файловый дескриптор, был больше, чем `len` байт, в файле будут сохранены только первые `len` байт.

### Пример

Например, следующая программа сохраняет только первые четыре байта файла:

```js
import { open, close, ftruncate } from 'node:fs';

function closeFd(fd) {
    close(fd, (err) => {
        if (err) throw err;
    });
}

open('temp.txt', 'r+', (err, fd) => {
    if (err) throw err;

    try {
        ftruncate(fd, 4, (err) => {
            closeFd(fd);
            if (err) throw err;
        });
    } catch (err) {
        closeFd(fd);
        if (err) throw err;
    }
});
```

Если файл ранее был короче `len` байт, он расширяется, а расширенная часть заполняется нулевыми байтами (`'\0'`).

Если `len` отрицательное, то будет использоваться `0`.

## Sync

???quote "История"

    Добавлено в: v0.8.6

**Параметры:**

-   `fd` : `<integer>`
-   `len` = `0` : `<integer>`

Усекает дескриптор файла. Возвращает `undefined`.
