# Модуль fs

!!!success "Стабильность: 2"

    Стабильный. Совместимость с экосистемой npm является приоритетной задачей.

**Исходный код:** [`lib/fs.js`](https://github.com/nodejs/node/blob/main/lib/fs.js)

Модуль `node:fs` позволяет взаимодействовать с файловой системой по образцу стандартных функций POSIX.

Чтобы использовать API на основе промисов:

=== "ESM"

    ```js
    import * as fs from 'node:fs/promises';
    ```

=== "CJS"

    ```js
    const fs = require('node:fs/promises');
    ```

Чтобы использовать API колбеков и синхронного вызова:

=== "ESM"

    ```js
    import * as fs from 'node:fs';
    ```

=== "CJS"

    ```js
    const fs = require('node:fs');
    ```

Все операции файловой системы имеют синхронные формы, формы с колбеками и промисы и доступны с использованием как синтаксиса CommonJS, так и модулей ES6 (ESM).

## API

**Функции:**

-   [`access`](access.md) &mdash; проверяет разрешения пользователя для файла или каталога;
-   [`appendFile`](appendfile.md) &mdash; добавляет данные в файл;
-   [`chmod`](chmod.md) &mdash; изменяет права доступа к файлу;
-   [`chown`](chown.md) &mdash; изменяет владельца файла;
-   [`close`](close.md) &mdash; закрывает дескриптор файла;
-   [`copyFile`](copyfile.md) &mdash; копирует файл;
-   [`cp`](cp.md) &mdash; копирует всю структуру каталогов, включая подкаталоги и файлы;
-   [`createReadStream`](createreadstream.md) &mdash;
-   [`createWriteStream`](createwritestream.md) &mdash;
-   [`datasync`](datasync.md) &mdash;
-   [`exists`](exists.md) &mdash;
-   [`fchmod`](fchmod.md) &mdash;
-   [`fchown`](fchown.md) &mdash;
-   [`fdatasync`](fdatasync.md) &mdash;
-   [`fstat`](fstat.md) &mdash;
-   [`fsync`](fsync.md) &mdash;
-   [`ftruncate`](ftruncate.md) &mdash;
-   [`futimes`](futimes.md) &mdash;
-   [`lchmod`](lchmod.md) &mdash;
-   [`lchown`](lchown.md) &mdash;
-   [`lutimes`](lutimes.md) &mdash;
-   [`link`](link.md) &mdash;
-   [`lstat`](lstat.md) &mdash;
-   [`mkdir`](mkdir.md) &mdash;
-   [`mkdtemp`](mkdtemp.md) &mdash;
-   [`open`](open.md) &mdash;
-   [`opendir`](opendir.md) &mdash;
-   [`read`](read.md) &mdash;
-   [`readableWebStream`](readablewebstream.md) &mdash;
-   [`readdir`](readdir.md) &mdash;
-   [`readFile`](readfile.md) &mdash;
-   [`readLines`](readlines.md) &mdash;
-   [`readlink`](readlink.md) &mdash;
-   [`readv`](readv.md) &mdash;
-   [`realpath`](realpath.md) &mdash;
-   [`rename`](rename.md) &mdash;
-   [`rmdir`](rmdir.md) &mdash;
-   [`rm`](rm.md) &mdash;
-   [`stat`](stat.md) &mdash;
-   [`statfs`](statfs.md) &mdash;
-   [`symlink`](symlink.md) &mdash;
-   [`sync`](sync.md) &mdash;
-   [`truncate`](truncate.md) &mdash;
-   [`unlink`](unlink.md) &mdash;
-   [`unwatchFile`](unwatchfile.md) &mdash;
-   [`utimes`](utimes.md) &mdash;
-   [`watch`](watch.md) &mdash;
-   [`watchFile`](watchfile.md) &mdash;
-   [`write`](write.md) &mdash;
-   [`writeFile`](writefile.md) &mdash;
-   [`writev`](writev.md) &mdash;

**Константы:**

-   [Константы](constants.md)

**Классы:**

-   [`FileHandle`](classes/filehandle.md)
-   [`Dir`](classes/dir.md)
-   [`Dirent`](classes/dirent.md)
-   [`FSWatcher`](classes/fswatcher.md)
-   [`StatWatcher`](classes/statwatcher.md)
-   [`ReadStream`](classes/readstream.md)
-   [`Stats`](classes/stats.md)
-   [`StatFs`](classes/statfs.md)
-   [`WriteStream`](classes/writestream.md)

**Примечания:**

-   [Порядок вызова колбеков и промисов](notes/order.md)
-   [Пути к файлам](notes/file-paths.md)
-   [Дескрипторы файлов](notes/file-descriptors.md)
-   [Флаги файловой системы](notes/flags.md)

## Пример с промисом

Операции на основе промисов возвращают промис, который выполняется после завершения асинхронной операции.

=== "ESM"

    ```js
    import { unlink } from 'node:fs/promises';

    try {
    	await unlink('/tmp/hello');
    	console.log('successfully deleted /tmp/hello');
    } catch (error) {
    	console.error('there was an error:', error.message);
    }
    ```

=== "CJS"

    ```js
    const { unlink } = require('node:fs/promises');

    (async function (path) {
    	try {
    		await unlink(path);
    		console.log(`successfully deleted ${path}`);
    	} catch (error) {
    		console.error('there was an error:', error.message);
    	}
    })('/tmp/hello');
    ```

## Пример с колбеком

Форма обратного вызова принимает функцию обратного вызова завершения в качестве последнего аргумента и вызывает операцию асинхронно. Аргументы, передаваемые обратному вызову завершения, зависят от метода, но первый аргумент всегда зарезервирован для исключения. Если операция завершена успешно, то первый аргумент имеет значение `null` или `undefined`.

=== "ESM"

    ```js
    import { unlink } from 'node:fs';

    unlink('/tmp/hello', (err) => {
    	if (err) throw err;
    	console.log('successfully deleted /tmp/hello');
    });
    ```

=== "CJS"

    ```js
    const { unlink } = require('node:fs');

    unlink('/tmp/hello', (err) => {
    	if (err) throw err;
    	console.log('successfully deleted /tmp/hello');
    });
    ```

## Пример с синхронной функцией

Синхронные API блокируют цикл событий Node.js и дальнейшее выполнение JavaScript до завершения операции. Исключения генерируются немедленно и могут быть обработаны с помощью `try…catch` или могут всплывать.

=== "ESM"

    ```js
    import { unlinkSync } from 'node:fs';

    try {
    	unlinkSync('/tmp/hello');
    	console.log('successfully deleted /tmp/hello');
    } catch (err) {
    	// handle the error
    }
    ```

=== "CJS"

    ```js
    const { unlinkSync } = require('node:fs');

    try {
    	unlinkSync('/tmp/hello');
    	console.log('successfully deleted /tmp/hello');
    } catch (err) {
    	// handle the error
    }
    ```
