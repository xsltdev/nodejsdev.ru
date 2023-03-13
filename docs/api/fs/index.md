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

## Функции

-   [`access`](access.md) &mdash; проверяет разрешения пользователя для файла или каталога;
-   [`appendFile`](appendfile.md) &mdash; добавляет данные в файл;
-   [`chmod`](chmod.md) &mdash; изменяет права доступа к файлу;
-   [`chown`](chown.md) &mdash; изменяет владельца файла;
-   [`copyFile`](copyfile.md) &mdash; копирует файл;
-   [`cp`](cp.md) &mdash; копирует всю структуру каталогов, включая подкаталоги и файлы;
-   [`lchmod`](lchmod.md)
-   [`lchown`](lchown.md)
-   [`lutimes`](lutimes.md)
-   [`link`](link.md)
-   [`lstat`](lstat.md)
-   [`mkdir`](mkdir.md)
-   [`mkdtemp`](mkdtemp.md)
-   [`open`](open.md)
-   [`opendir`](opendir.md)
-   [`readdir`](readdir.md)
