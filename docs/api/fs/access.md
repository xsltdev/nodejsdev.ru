# access

## Promise

```js
fsPromises.access(path[, mode])
```

???quote "История"

    Добавлено в: v10.0.0

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `mode = fs.constants.F_OK` : `<integer>`

**Возвращает:**

-   `<Promise>` &mdash; Выполняется с `undefined` в случае успеха.

## Callback

```js
fs.access(path[, mode], callback)
```

???quote "История"

    | Version  | Changes                                                                                                                                                                                                              |
    | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0  | Passing an invalid callback to the callback argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`.                                                                                                |
    | v7.6.0   | The path parameter can be a WHATWG URL object using file: protocol.                                                                                                                                                  |
    | v6.3.0   | The constants like `fs.R_OK`, etc which were present directly on fs were moved into fs.constants as a soft deprecation. Thus for Node.js < v6.3.0 use fs to access those constants, or do something like `(fs.constants || fs).R_OK` to work with all versions. |
    | v0.11.15 | Added in: v0.11.15                                                                                                                                                                                                   |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `mode` = `fs.constants.F_OK` : `<integer>`
-   `callback` : `<Function>`
    -   `err` : `<Error>`

Проверяет разрешения пользователя для файла или каталога, указанного в `path`. Аргумент `mode` — это необязательное целое число, указывающее выполняемые проверки доступности.

`mode` должен быть либо значением `fs.constants.F_OK`, либо маской, состоящей из побитового ИЛИ любого из `fs.constants.R_OK`, `fs.constants.W_OK` и `fs.constants.X_OK` (например, `fs.constants.W_OK | fs.constants.R_OK`).

Последний аргумент, `callback`, представляет собой функцию обратного вызова, которая вызывается с возможным аргументом ошибки. Если какая-либо из проверок доступности не пройдена, аргументом ошибки будет объект `Error`.

### Примеры

В следующих примерах проверяется, существует ли `package.json` и доступен ли он для чтения или записи.

```js
import { access, constants } from 'node:fs';

const file = 'package.json';

// Check if the file exists in the current directory.
access(file, constants.F_OK, (err) => {
    console.log(
        `${file} ${err ? 'does not exist' : 'exists'}`
    );
});

// Check if the file is readable.
access(file, constants.R_OK, (err) => {
    console.log(
        `${file} ${err ? 'is not readable' : 'is readable'}`
    );
});

// Check if the file is writable.
access(file, constants.W_OK, (err) => {
    console.log(
        `${file} ${err ? 'is not writable' : 'is writable'}`
    );
});

// Check if the file is readable and writable.
access(file, constants.R_OK | constants.W_OK, (err) => {
    console.log(
        `${file} ${
            err ? 'is not' : 'is'
        } readable and writable`
    );
});
```

Не используйте `fs.access()` для проверки доступности файла перед вызовом `fs.open()`, `fs.readFile()` или `fs.writeFile()`. При этом возникает состояние гонки, поскольку другие процессы могут изменить состояние файла между двумя вызовами. Вместо этого пользовательский код должен открывать/читать/записывать файл напрямую и обрабатывать возникшую ошибку, если файл недоступен.

```js title="write (NOT RECOMMENDED)"
import { access, open, close } from 'node:fs';

access('myfile', (err) => {
    if (!err) {
        console.error('myfile already exists');
        return;
    }

    open('myfile', 'wx', (err, fd) => {
        if (err) throw err;

        try {
            writeMyData(fd);
        } finally {
            close(fd, (err) => {
                if (err) throw err;
            });
        }
    });
});
```

```js title="write (RECOMMENDED)"
import { open, close } from 'node:fs';

open('myfile', 'wx', (err, fd) => {
    if (err) {
        if (err.code === 'EEXIST') {
            console.error('myfile already exists');
            return;
        }

        throw err;
    }

    try {
        writeMyData(fd);
    } finally {
        close(fd, (err) => {
            if (err) throw err;
        });
    }
});
```

```js title="read (NOT RECOMMENDED)"
import { access, open, close } from 'node:fs';
access('myfile', (err) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.error('myfile does not exist');
            return;
        }

        throw err;
    }

    open('myfile', 'r', (err, fd) => {
        if (err) throw err;

        try {
            readMyData(fd);
        } finally {
            close(fd, (err) => {
                if (err) throw err;
            });
        }
    });
});
```

```js title="read (RECOMMENDED)"
import { open, close } from 'node:fs';

open('myfile', 'r', (err, fd) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.error('myfile does not exist');
            return;
        }

        throw err;
    }

    try {
        readMyData(fd);
    } finally {
        close(fd, (err) => {
            if (err) throw err;
        });
    }
});
```

«Не рекомендуемые» примеры выше проверяют доступность, а затем используют файл; «рекомендуемые» примеры лучше, потому что они используют файл напрямую и обрабатывают ошибку, если таковая имеется.

В общем, проверяйте доступность файла только в том случае, если файл не будет использоваться напрямую, например, когда его доступность является сигналом от другого процесса.

В Windows политики управления доступом (ACL) к каталогу могут ограничивать доступ к файлу или каталогу. Однако функция `fs.access()` не проверяет ACL и поэтому может сообщить, что путь доступен, даже если ACL запрещает пользователю чтение или запись в него.

## Sync

```js
fs.accessSync(path[, mode])
```

???quote "История"

    | Version  | Changes                                                             |
    | -------- | ------------------------------------------------------------------- |
    | v7.6.0   | The path parameter can be a WHATWG URL object using file: protocol. |
    | v0.11.15 | Added in: v0.11.15                                                  |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `mode` = `fs.constants.F_OK` : `<integer>`

Синхронно проверяет разрешения пользователя для файла или каталога, указанного в `path`.

Аргумент `mode` — это необязательное целое число, указывающее выполняемые проверки доступности. `mode` должен быть либо значением `fs.constants.F_OK`, либо маской, состоящей из побитового ИЛИ любого из `fs.constants.R_OK`, `fs.constants.W_OK` и `fs.constants.X_OK` (например, `fs.constants.W_OK | fs.constants.R_OK`).

Если какая-либо из проверок доступности не пройдена, будет выдано сообщение об ошибке `Error`. В противном случае метод вернет `undefined`.

```js
import { accessSync, constants } from 'node:fs';

try {
    accessSync(
        'etc/passwd',
        constants.R_OK | constants.W_OK
    );
    console.log('can read/write');
} catch (err) {
    console.error('no access!');
}
```
