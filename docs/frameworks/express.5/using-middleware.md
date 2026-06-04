---
description: Узнайте, как использовать middleware в Express.js: на уровне приложения и роутера, для обработки ошибок и интеграции сторонних модулей.
---

# Использование middleware

Express — это веб-фреймворк роутинга и middleware с минимальным собственным набором функций: приложение Express по сути представляет собой последовательность вызовов middleware.

Функции _middleware_ имеют доступ к объекту запроса (`req`), объекту ответа (`res`) и следующей middleware-функции в request-response цикле приложения. Следующую middleware-функцию обычно обозначают переменной `next`.

Middleware-функции могут:

-   Выполнять произвольный код.
-   Изменять объекты запроса и ответа.
-   Завершать request-response цикл.
-   Вызывать следующую middleware-функцию в стеке.

Если текущий middleware не завершает request-response цикл, он обязан вызвать `next()`, чтобы передать управление следующему middleware. Иначе запрос «повиснет».

В приложении Express можно использовать следующие типы middleware:

-   middleware уровня приложения
-   middleware уровня роутера
-   middleware обработки ошибок
-   встроенный middleware
-   сторонний middleware

Middleware уровня приложения и роутера можно подключать с необязательным mount path. Также можно подключать серию middleware-функций сразу, формируя подстек middleware на точке монтирования.

## Middleware уровня приложения

Привяжите middleware уровня приложения к экземпляру объекта `app` с помощью функций `app.use()` и `app.METHOD()`, где `METHOD` — HTTP-метод запроса, который обрабатывает middleware (например, GET, PUT или POST) в нижнем регистре.

Этот пример показывает middleware без mount path. Функция выполняется при каждом запросе к приложению.

```js
const express = require('express');
const app = express();

app.use((req, res, next) => {
    console.log('Time:', Date.now());
    next();
});
```

Этот пример показывает middleware, смонтированный на путь `/user/:id`. Функция выполняется для любого типа HTTP-запроса к этому пути.

```js
app.use('/user/:id', (req, res, next) => {
    console.log('Request Type:', req.method);
    next();
});
```

Этот пример показывает маршрут и его обработчик (часть middleware-системы). Функция обрабатывает GET-запросы на путь `/user/:id`.

```js
app.get('/user/:id', (req, res, next) => {
    res.send('USER');
});
```

Ниже пример подключения серии middleware-функций на mount point с mount path. Он демонстрирует подстек middleware, который выводит информацию о запросе для любого HTTP-запроса к `/user/:id`.

```js
app.use(
    '/user/:id',
    (req, res, next) => {
        console.log('Request URL:', req.originalUrl);
        next();
    },
    (req, res, next) => {
        console.log('Request Type:', req.method);
        next();
    }
);
```

Route handlers позволяют определять несколько маршрутов для одного пути. В примере ниже объявлены два маршрута для GET-запросов к `/user/:id`. Второй маршрут не вызовет проблем, но никогда не выполнится, потому что первый завершает request-response цикл.

Этот пример показывает подстек middleware, который обрабатывает GET-запросы к `/user/:id`.

```js
app.get(
    '/user/:id',
    (req, res, next) => {
        console.log('ID:', req.params.id);
        next();
    },
    (req, res, next) => {
        res.send('User Info');
    }
);

// handler for the /user/:id path, which prints the user ID
app.get('/user/:id', (req, res, next) => {
    res.send(req.params.id);
});
```

Чтобы пропустить оставшиеся middleware-функции текущего route stack, вызовите `next('route')` и передайте управление следующему маршруту.

!!!info ""

    `next('route')` работает только в middleware-функциях, подключенных через `app.METHOD()` или `router.METHOD()`.

Этот пример показывает подстек middleware для GET-запросов к `/user/:id`.

```js
app.get(
    '/user/:id',
    (req, res, next) => {
        // if the user ID is 0, skip to the next route
        if (req.params.id === '0') next('route');
        // otherwise pass the control to the next middleware function in this stack
        else next();
    },
    (req, res, next) => {
        // send a regular response
        res.send('regular');
    }
);

// handler for the /user/:id path, which sends a special response
app.get('/user/:id', (req, res, next) => {
    res.send('special');
});
```

Middleware также можно объявлять в массиве для повторного использования.

Этот пример показывает массив с подстеком middleware для обработки GET-запросов к `/user/:id`

```js
function logOriginalUrl(req, res, next) {
    console.log('Request URL:', req.originalUrl);
    next();
}

function logMethod(req, res, next) {
    console.log('Request Type:', req.method);
    next();
}

const logStuff = [logOriginalUrl, logMethod];
app.get('/user/:id', logStuff, (req, res, next) => {
    res.send('User Info');
});
```

## Middleware уровня роутера

Middleware уровня роутера работает так же, как middleware уровня приложения, но привязывается к экземпляру `express.Router()`.

```js
const router = express.Router();
```

Подключайте middleware уровня роутера через `router.use()` и `router.METHOD()`.

Следующий пример повторяет middleware-схему выше, но уже на уровне роутера:

```js
const express = require('express');
const app = express();
const router = express.Router();

// a middleware function with no mount path. This code is executed for every request to the router
router.use((req, res, next) => {
    console.log('Time:', Date.now());
    next();
});

// a middleware sub-stack shows request info for any type of HTTP request to the /user/:id path
router.use(
    '/user/:id',
    (req, res, next) => {
        console.log('Request URL:', req.originalUrl);
        next();
    },
    (req, res, next) => {
        console.log('Request Type:', req.method);
        next();
    }
);

// a middleware sub-stack that handles GET requests to the /user/:id path
router.get(
    '/user/:id',
    (req, res, next) => {
        // if the user ID is 0, skip to the next router
        if (req.params.id === '0') next('route');
        // otherwise pass control to the next middleware function in this stack
        else next();
    },
    (req, res, next) => {
        // render a regular page
        res.render('regular');
    }
);

// handler for the /user/:id path, which renders a special page
router.get('/user/:id', (req, res, next) => {
    console.log(req.params.id);
    res.render('special');
});

// mount the router on the app
app.use('/', router);
```

Чтобы пропустить оставшиеся middleware-функции роутера, вызовите `next('router')`, чтобы вернуть управление за пределы экземпляра роутера.

Этот пример показывает подстек middleware для GET-запросов к `/user/:id`.

```js
const express = require('express');
const app = express();
const router = express.Router();

// predicate the router with a check and bail out when needed
router.use((req, res, next) => {
    if (!req.headers['x-auth']) return next('router');
    next();
});

router.get('/user/:id', (req, res) => {
    res.send('hello, user!');
});

// use the router and 401 anything falling through
app.use('/admin', router, (req, res) => {
    res.sendStatus(401);
});
```

## Middleware обработки ошибок

!!!alert ""

    Middleware обработки ошибок всегда принимает _четыре_ аргумента. Чтобы функция была распознана как error-handling middleware, нужно указать все четыре аргумента. Даже если `next` не используется, его все равно нужно объявить для соблюдения сигнатуры. Иначе функция будет интерпретирована как обычный middleware и не сможет обрабатывать ошибки.

Middleware обработки ошибок определяется так же, как обычный middleware, но с четырьмя аргументами вместо трех, то есть с сигнатурой `(err, req, res, next)`:

```js
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
```

Подробнее о middleware обработки ошибок: [Error handling](./error-handling.md).

## Встроенный middleware

Начиная с версии 4.x, Express больше не зависит от [Connect](https://github.com/senchalabs/connect). Middleware-функции, которые раньше входили в Express, теперь вынесены в отдельные модули; см. [the list of middleware functions](https://github.com/senchalabs/connect#middleware).

В Express есть следующие встроенные middleware-функции:

-   `express.static` раздает статические ресурсы, такие как HTML-файлы, изображения и т. п.
-   [`express.json` разбирает входящие запросы с JSON payload. **NOTE: Available with Express 4.16.0+**
-   [`express.urlencoded` разбирает входящие запросы с URL-encoded payload. **NOTE: Available with Express 4.16.0+**

## Сторонний middleware

Используйте сторонние middleware для расширения функциональности приложений Express.

Установите Node.js-модуль с нужной функциональностью, затем подключите его в приложении на уровне `app` или роутера.

Следующий пример показывает установку и подключение middleware `cookie-parser` для разбора cookie.

```bash
$ npm install cookie-parser
```

```js
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

// load the cookie-parsing middleware
app.use(cookieParser());
```

Частичный список популярных сторонних middleware-функций для Express см. в разделе Third-party middleware.
