# appendFile

## Промис

```js
fsPromises.appendFile(path, data[, options])
```

???quote "История"

    Добавлено в: v10.0.0

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>` | `<FileHandle>` имя файла или `<FileHandle>`
-   `data` : `<string>` | `<Buffer>`
-   `options` : `<Object>` | `<string>`
    -   `encoding` = `'utf8'` : `<string>` | `<null>`
    -   `mode` = `0o666` : `<integer>`
    -   `flag` = `'a'` : `<string>`

**Возвращает:**

-   `<Promise>` - Выполняется с `undefined` в случае успеха.

Асинхронно добавляет данные в файл, создавая файл, если он еще не существует. `data` может быть строкой или `<Buffer>`.

Если `options` является строкой, то она определяет кодировку.

Параметр `mode` влияет только на вновь созданный файл. См. [`fs.open()`](open.md) для более подробной информации.

`path` может быть указан как `<FileHandle>`, который был открыт для добавления (используя [`fsPromises.open()`](open.md)).

## Колбек

```js
fs.appendFile(path, data[, options], callback)
```

???quote "История"

    | Version | Changes                                                                                                               |
    | ------- | --------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0 | Passing an invalid callback to the callback argument now throws ERR_INVALID_ARG_TYPE instead of ERR_INVALID_CALLBACK. |
    | v10.0.0 | The callback parameter is no longer optional. Not passing it will throw a TypeError at runtime.                       |
    | v7.0.0  | The callback parameter is no longer optional. Not passing it will emit a deprecation warning with id DEP0013.         |
    | v7.0.0  | The passed options object will never be modified.                                                                     |
    | v5.0.0  | The file parameter can be a file descriptor now.                                                                      |
    | v0.6.7  | Added in: v0.6.7                                                                                                      |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>` | `<number>` имя файла или дескриптор файла
-   `data` : `<string>` | `<Buffer>`
-   `options` : `<Object>` | `<string>`
    -   `encoding` = `'utf8'` : `<string>` | `<null>`
    -   `mode` = `0o666` : `<integer>`
    -   `flag` = `'a'` : `<string>`
-   `callback` : `<Function>`
    -   `err` : `<Error>`

Асинхронно добавляет данные в файл, создавая файл, если он еще не существует. `data` может быть строкой или `<Buffer>`.

Параметр `mode` влияет только на вновь созданный файл. См. [`fs.open()`](open.md) для более подробной информации.

```js
import { appendFile } from 'node:fs';

appendFile('message.txt', 'data to append', (err) => {
    if (err) throw err;
    console.log(
        'The "data to append" was appended to file!'
    );
});
```

Если `options` является строкой, то она указывает кодировку:

```js
import { appendFile } from 'node:fs';

appendFile(
    'message.txt',
    'data to append',
    'utf8',
    callback
);
```

`path` может быть указан как числовой дескриптор файла, который был открыт для добавления (используя [`fs.open()`](open.md) или `fs.openSync()`). Дескриптор файла не будет закрыт автоматически.

```js
import { open, close, appendFile } from 'node:fs';

function closeFd(fd) {
    close(fd, (err) => {
        if (err) throw err;
    });
}

open('message.txt', 'a', (err, fd) => {
    if (err) throw err;

    try {
        appendFile(fd, 'data to append', 'utf8', (err) => {
            closeFd(fd);
            if (err) throw err;
        });
    } catch (err) {
        closeFd(fd);
        throw err;
    }
});
```

## Синхронно

```js
fs.appendFileSync(path, data[, options])
```

???quote "История"

    | Version | Changes                                           |
    | ------- | ------------------------------------------------- |
    | v7.0.0  | The passed options object will never be modified. |
    | v5.0.0  | The file parameter can be a file descriptor now.  |
    | v0.6.7  | Added in: v0.6.7                                  |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>` | `<number>` имя файла или дескриптор файла
-   `data` : `<string>` | `<Buffer>`
-   `options` : `<Object>` | `<string>`
    -   `encoding` = `'utf8'` : `<string>` | `<null>`
    -   `mode` = `0o666` : `<integer>`
    -   `flag` = `'a'` : `<string>`

Синхронно добавляет данные в файл, создавая файл, если он еще не существует. `data` может быть строкой или `<Buffer>`.

Параметр `mode` влияет только на вновь созданный файл. См. [`fs.open()`](open.md) для более подробной информации.

```js
import { appendFileSync } from 'node:fs';

try {
    appendFileSync('message.txt', 'data to append');
    console.log(
        'The "data to append" was appended to file!'
    );
} catch (err) {
    /* Handle the error */
}
```

Если `options` является строкой, то она указывает кодировку:

```js
import { appendFileSync } from 'node:fs';

appendFileSync('message.txt', 'data to append', 'utf8');
```

Путь может быть указан как числовой дескриптор файла, который был открыт для добавления (используя `fs.open()` или `fs.openSync()`). Дескриптор файла не будет закрыт автоматически.

```js
import {
    openSync,
    closeSync,
    appendFileSync,
} from 'node:fs';

let fd;

try {
    fd = openSync('message.txt', 'a');
    appendFileSync(fd, 'data to append', 'utf8');
} catch (err) {
    /* Handle the error */
} finally {
    if (fd !== undefined) closeSync(fd);
}
```

## FileHandle

???quote "История"

    | Version            | Changes                                                               |
    | ------------------ | --------------------------------------------------------------------- |
    | v15.14.0, v14.18.0 | The data argument supports AsyncIterable, Iterable, and Stream.       |
    | v14.0.0            | The data parameter won't coerce unsupported input to strings anymore. |
    | v10.0.0            | Added in: v10.0.0                                                     |

**Параметры:**

-   `data` : `<string>` | `<Buffer>` | `<TypedArray>` | `<DataView>` | `<AsyncIterable>` | `<Iterable>` | `<Stream>`
-   `options` : `<Object>` | `<string>`
    -   `encoding` = `'utf8'` = `<string>` | `<null>`

**Возвращает:**

-   `<Promise>` : Выполняется с `undefined` в случае успеха.

Псевдоним [`filehandle.writeFile()`](writefile.md).

При работе с файловыми дескрипторами режим нельзя изменить по сравнению с тем, который был установлен с помощью [`fsPromises.open()`](open.md). Следовательно, это эквивалентно [`filehandle.writeFile()`](writefile.md).
