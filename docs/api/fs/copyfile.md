# copyFile

## Promise

```js
fsPromises.copyFile(src, dest[, mode])
```

???quote "История"

    | Version | Changes                                                              |
    | ------- | -------------------------------------------------------------------- |
    | v14.0.0 | Changed flags argument to mode and imposed stricter type validation. |
    | v10.0.0 | Added in: v10.0.0                                                    |

**Параметры:**

-   `src` : `<string>` | `<Buffer>` | `<URL>` &mdash; исходное имя файла для копирования
-   `dest` : `<string>` | `<Buffer>` | `<URL>` &mdash; имя файла назначения операции копирования
-   `mode = 0` : `<integer>` &mdash; Необязательные модификаторы, определяющие поведение операции копирования. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`).
    -   `fs.constants.COPYFILE_EXCL`: Операция копирования завершится ошибкой, если адрес назначения уже существует.
    -   `fs.constants.COPYFILE_FICLONE`: Операция копирования попытается создать ссылку копирования при записи. Если платформа не поддерживает копирование при записи, используется механизм резервного копирования.
    -   `fs.constants.COPYFILE_FICLONE_FORCE`: Операция копирования попытается создать ссылку копирования при записи. Если платформа не поддерживает копирование при записи, операция завершится ошибкой.

**Возвращает:**

-   `<Promise>` &mdash; Выполняется с `undefined` в случае успеха.

Асинхронно копирует `src` в `dest`. По умолчанию `dest` перезаписывается, если он уже существует.

Не дается никаких гарантий относительно атомарности операции копирования. Если ошибка возникает после того, как файл назначения был открыт для записи, будет предпринята попытка удалить место назначения.

### Пример 1

```js
import { copyFile, constants } from 'node:fs/promises';

try {
    await copyFile('source.txt', 'destination.txt');
    console.log('source.txt was copied to destination.txt');
} catch {
    console.error('The file could not be copied');
}

// By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
try {
    await copyFile(
        'source.txt',
        'destination.txt',
        constants.COPYFILE_EXCL
    );
    console.log('source.txt was copied to destination.txt');
} catch {
    console.error('The file could not be copied');
}
```

## Callback

```js
fs.copyFile(src, dest[, mode], callback)
```

???quote "История"

    | Version | Changes                                                                                                                   |
    | ------- | ------------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0 | Passing an invalid callback to the callback argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`. |
    | v14.0.0 | Changed flags argument to mode and imposed stricter type validation.                                                      |
    | v8.5.0  | Added in: v8.5.0                                                                                                          |

**Параметры:**

-   `src` : `<string>` | `<Buffer>` | `<URL>` &mdash; исходное имя файла для копирования
-   `dest` : `<string>` | `<Buffer>` | `<URL>` &mdash; имя файла назначения операции копирования
-   `mode` = `0` : `<integer>` модификаторы для операции копирования
-   `callback` : `<Function>`

Асинхронно копирует `src` в `dest`. По умолчанию `dest` перезаписывается, если он уже существует. Никакие аргументы, кроме возможного исключения, не передаются функции обратного вызова. Node.js не дает никаких гарантий относительно атомарности операции копирования. Если ошибка возникает после того, как файл назначения был открыт для записи, Node.js попытается удалить место назначения.

`mode` — это необязательное целое число, определяющее поведение операции копирования. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`).

-   `fs.constants.COPYFILE_EXCL`: Операция копирования завершится ошибкой, если адрес назначения уже существует.
-   `fs.constants.COPYFILE_FICLONE`: Операция копирования попытается создать ссылку копирования при записи. Если платформа не поддерживает копирование при записи, используется механизм резервного копирования.
-   `fs.constants.COPYFILE_FICLONE_FORCE`: Операция копирования попытается создать ссылку копирования при записи. Если платформа не поддерживает копирование при записи, операция завершится ошибкой.

### Пример 2

```js
import { copyFile, constants } from 'node:fs';

function callback(err) {
    if (err) throw err;
    console.log('source.txt was copied to destination.txt');
}

// destination.txt will be created or overwritten by default.
copyFile('source.txt', 'destination.txt', callback);

// By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
copyFile(
    'source.txt',
    'destination.txt',
    constants.COPYFILE_EXCL,
    callback
);
```

## Sync

```js
fs.copyFileSync(src, dest[, mode])
```

???quote "История"

    | Version | Changes                                                              |
    | ------- | -------------------------------------------------------------------- |
    | v14.0.0 | Changed flags argument to mode and imposed stricter type validation. |
    | v8.5.0  | Added in: v8.5.0                                                     |

**Параметры:**

-   `src` : `<string>` | `<Buffer>` | `<URL>` &mdash; исходное имя файла для копирования
-   `dest` : `<string>` | `<Buffer>` | `<URL>` &mdash; имя файла назначения операции копирования
-   `mode` = `0` : `<integer>` &mdash; модификаторы для операции копирования

Синхронно копирует src в dest. По умолчанию dest перезаписывается, если он уже существует. Возвращает неопределенное значение. Node.js не дает никаких гарантий относительно атомарности операции копирования. Если ошибка возникает после того, как файл назначения был открыт для записи, Node.js попытается удалить место назначения.

`mode` — это необязательное целое число, определяющее поведение операции копирования. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`).

-   `fs.constants.COPYFILE_EXCL`: Операция копирования завершится ошибкой, если адрес назначения уже существует.
-   `fs.constants.COPYFILE_FICLONE`: Операция копирования попытается создать ссылку копирования при записи. Если платформа не поддерживает копирование при записи, используется механизм резервного копирования.
-   `fs.constants.COPYFILE_FICLONE_FORCE`: Операция копирования попытается создать ссылку копирования при записи. Если платформа не поддерживает копирование при записи, операция завершится ошибкой.

### Пример 3

```js
import { copyFileSync, constants } from 'node:fs';

// destination.txt will be created or overwritten by default.
copyFileSync('source.txt', 'destination.txt');
console.log('source.txt was copied to destination.txt');

// By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
copyFileSync(
    'source.txt',
    'destination.txt',
    constants.COPYFILE_EXCL
);
```
