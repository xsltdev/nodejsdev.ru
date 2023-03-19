# exists

## Callback

!!!danger "Стабильность: 0 – Устарело: вместо этого используйте [`fs.stat()`](stat.md) или [`fs.access()`](access.md#callback)."

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

```js
fs.exists(path, callback);
```

???quote "История"

    | Version | Changes                                                                                                                   |
    | ------- | ------------------------------------------------------------------------------------------------------------------------- |
    | v18.0.0 | Passing an invalid callback to the callback argument now throws `ERR_INVALID_ARG_TYPE` instead of `ERR_INVALID_CALLBACK`. |
    | v7.6.0  | The path parameter can be a WHATWG URL object using file: protocol.                                                       |
    | v1.0.0  | Deprecated since: v1.0.0                                                                                                  |
    | v0.0.2  | Added in: v0.0.2                                                                                                          |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `callback` : `<Function>`
    -   `exists` : `<boolean>`

Проверьте, существует ли указанный путь, проверив файловую систему. Затем вызовите аргумент обратного вызова с истинным или ложным значением:

```js
import { exists } from 'node:fs';

exists('/etc/passwd', (e) => {
    console.log(e ? 'it exists' : 'no passwd!');
});
```

**Параметры этого обратного вызова не соответствуют другим обратным вызовам Node.js.** Обычно первым параметром обратного вызова Node.js является параметр `err`, за которым могут следовать другие параметры. Обратный вызов `fs.exists()` имеет только один логический параметр. Это одна из причин, по которой `fs.access()` рекомендуется вместо `fs.exists()`.

Использование `fs.exists()` для проверки существования файла перед вызовом `fs.open()`, `fs.readFile()` или `fs.writeFile()` не рекомендуется. При этом возникает состояние гонки, поскольку другие процессы могут изменить состояние файла между двумя вызовами. Вместо этого пользовательский код должен открывать/читать/записывать файл напрямую и обрабатывать возникшую ошибку, если файл не существует.

```js title="write (NOT RECOMMENDED)"
import { exists, open, close } from 'node:fs';

exists('myfile', (e) => {
    if (e) {
        console.error('myfile already exists');
    } else {
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
    }
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
import { open, close, exists } from 'node:fs';

exists('myfile', (e) => {
    if (e) {
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
    } else {
        console.error('myfile does not exist');
    }
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

"Нерекомендуемые" примеры выше проверяют существование и затем используют файл; «рекомендуемые» примеры лучше, потому что они используют файл напрямую и обрабатывают ошибку, если таковая имеется.

В общем, проверяйте наличие файла только в том случае, если файл не будет использоваться напрямую, например, когда его существование является сигналом от другого процесса.

## Sync

```js
fs.existsSync(path);
```

???quote "История"

    | Version | Changes                                                             |
    | ------- | ------------------------------------------------------------------- |
    | v7.6.0  | The path parameter can be a WHATWG URL object using file: protocol. |
    | v0.1.21 | Added in: v0.1.21                                                   |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`

**Возвращает:**

-   `<boolean>`

Возвращает `true`, если путь существует, иначе `false`.

Для получения подробной информации см. документацию по асинхронной версии этого API: [`fs.exists()`](#callback).

`fs.exists()` устарела, а `fs.existsSync()` — нет. Параметр обратного вызова для `fs.exists()` принимает параметры, несовместимые с другими обратными вызовами Node.js. `fs.existsSync()` не использует обратный вызов.

```js
import { existsSync } from 'node:fs';

if (existsSync('/etc/passwd'))
    console.log('The path exists.');
```
