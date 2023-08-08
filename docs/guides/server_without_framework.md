---
description: В этой статье представлен простой статический файловый сервер, построенный на чистом Node.js без использования фреймворка
---

# Сервер Node.js без фреймворка

В этой статье представлен простой статический файловый сервер, построенный на чистом Node.js без использования фреймворка.

Современное состояние Node.js таково, что практически все, что нам нужно, обеспечивается встроенными API и всего несколькими строчками кода.

## Пример

Простой статический файловый сервер, построенный с помощью Node.js:

```js
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';

const PORT = 8000;

const MIME_TYPES = {
    default: 'application/octet-stream',
    html: 'text/html; charset=UTF-8',
    js: 'application/javascript',
    css: 'text/css',
    png: 'image/png',
    jpg: 'image/jpg',
    gif: 'image/gif',
    ico: 'image/x-icon',
    svg: 'image/svg+xml',
};

const STATIC_PATH = path.join(process.cwd(), './static');

const toBool = [() => true, () => false];

const prepareFile = async (url) => {
    const paths = [STATIC_PATH, url];
    if (url.endsWith('/')) paths.push('index.html');
    const filePath = path.join(...paths);
    const pathTraversal = !filePath.startsWith(STATIC_PATH);
    const exists = await fs.promises
        .access(filePath)
        .then(...toBool);
    const found = !pathTraversal && exists;
    const streamPath = found
        ? filePath
        : STATIC_PATH + '/404.html';
    const ext = path
        .extname(streamPath)
        .substring(1)
        .toLowerCase();
    const stream = fs.createReadStream(streamPath);
    return { found, ext, stream };
};

http.createServer(async (req, res) => {
    const file = await prepareFile(req.url);
    const statusCode = file.found ? 200 : 404;
    const mimeType =
        MIME_TYPES[file.ext] || MIME_TYPES.default;
    res.writeHead(statusCode, { 'Content-Type': mimeType });
    file.stream.pipe(res);
    console.log(`${req.method} ${req.url} ${statusCode}`);
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
```

## Разбиение

Следующие строки импортируют внутренние модули Node.js.

```js
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
```

Далее у нас есть функция для создания сервера. `https.createServer` возвращает объект `Server`, который мы можем запустить, прослушивая по `PORT`.

```js
http.createServer((req, res) => {
    /* handle http requests */
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
```

Асинхронная функция `prepareFile` возвращает структуру: `{ found: boolean , ext: string, stream: ReadableStream }`. Если файл может быть передан (серверный процесс имеет доступ и уязвимость обхода пути не обнаружена), то в качестве `statusCode`, указывающего на успех, мы вернем HTTP-статус `200` (в противном случае мы вернем `HTTP 404`). Обратите внимание, что другие коды статуса можно найти в `http.STATUS_CODES`. При статусе `404` мы вернем содержимое файла `'/404.html`.

Расширение запрашиваемого файла будет разобрано и приведено к нижнему регистру. После этого мы выполним поиск в коллекции `MIME_TYPES` нужных [MIME-типов](https://hcdev.ru/html/list-mime-types/). Если совпадений не найдено, то в качестве типа по умолчанию используется `application/octet-stream`.

Наконец, если ошибок нет, мы отправляем запрошенный файл. В `file.stream` будет содержаться поток `Readable`, который будет передан в `res` (экземпляр потока `Writable`).

```js
res.writeHead(statusCode, { 'Content-Type': mimeType });
file.stream.pipe(res);
```

## Ссылки

-   [Node.js server without a framework](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework)
