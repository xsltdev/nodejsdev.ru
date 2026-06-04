---
description: Разберитесь, как Express.js обрабатывает ошибки в синхронном и асинхронном коде, и как реализовать собственный middleware обработки ошибок.
---

# Обработка ошибок

_Обработка ошибок_ — это то, как Express перехватывает и обрабатывает ошибки, возникающие как в синхронном, так и в асинхронном коде. В Express есть встроенный обработчик ошибок, поэтому для старта не обязательно писать свой.

## Перехват ошибок

Важно обеспечить, чтобы Express перехватывал все ошибки, возникающие при выполнении route handler и middleware.

Ошибки в синхронном коде внутри route handler и middleware не требуют дополнительных действий. Если синхронный код выбрасывает ошибку, Express сам ее перехватит и обработает. Например:

```js
app.get('/', (req, res) => {
    throw new Error('BROKEN'); // Express will catch this on its own.
});
```

Ошибки из асинхронных функций, вызываемых route handler и middleware, нужно передавать в `next()`, тогда Express их перехватит и обработает. Например:

```js
app.get('/', (req, res, next) => {
    fs.readFile('/file-does-not-exist', (err, data) => {
        if (err) {
            next(err); // Pass errors to Express.
        } else {
            res.send(data);
        }
    });
});
```

Начиная с Express 5, route handler и middleware, возвращающие Promise, автоматически вызывают `next(value)` при отклонении Promise или выбрасывании ошибки. Например:

```js
app.get('/user/:id', async (req, res, next) => {
    const user = await getUserById(req.params.id);
    res.send(user);
});
```

Если `getUserById` выбросит ошибку или вернет отклоненный Promise, `next` будет вызван с этой ошибкой или значением отклонения. Если значение отклонения отсутствует, `next` будет вызван со стандартным объектом Error от роутера Express.

Если передать в `next()` любое значение (кроме строки `'route'`), Express считает текущий запрос ошибочным и пропускает оставшиеся route handler и middleware, не предназначенные для обработки ошибок.

Если callback в цепочке возвращает только ошибки (без данных), код можно упростить так:

```js
app.get('/', [
    function (req, res, next) {
        fs.writeFile('/inaccessible-path', 'data', next);
    },
    function (req, res) {
        res.send('OK');
    },
]);
```

В примере выше `next` передается как callback в `fs.writeFile`, который вызывается и при ошибке, и без нее. Если ошибки нет, выполняется второй handler; иначе Express перехватывает и обрабатывает ошибку.

Ошибки, возникающие в асинхронном коде, вызванном из route handler или middleware, нужно перехватывать и передавать в Express на обработку. Например:

```js
app.get('/', (req, res, next) => {
    setTimeout(() => {
        try {
            throw new Error('BROKEN');
        } catch (err) {
            next(err);
        }
    }, 100);
});
```

В примере выше используется блок `try...catch`, чтобы перехватить ошибку в асинхронном коде и передать ее в Express. Без `try...catch` Express не поймает ошибку, потому что она возникает вне синхронного кода обработчика.

Используйте promises, чтобы избежать избыточного `try...catch`, либо при работе с функциями, возвращающими promises. Например:

```js
app.get('/', (req, res, next) => {
    Promise.resolve()
        .then(() => {
            throw new Error('BROKEN');
        })
        .catch(next); // Errors will be passed to Express.
});
```

Так как promises автоматически перехватывают и синхронные ошибки, и отклоненные promises, можно просто передать `next` в финальный `catch`, и Express обработает ошибку, потому что `catch` получает ее первым аргументом.

Также можно использовать цепочку handler-ов и полагаться на синхронный перехват ошибок, сведя асинхронный код к минимуму. Например:

```js
app.get('/', [
    function (req, res, next) {
        fs.readFile(
            '/maybe-valid-file',
            'utf-8',
            (err, data) => {
                res.locals.data = data;
                next(err);
            }
        );
    },
    function (req, res) {
        res.locals.data = res.locals.data.split(',')[1];
        res.send(res.locals.data);
    },
]);
```

В примере выше после `readFile` выполняется несколько простых операций. Если `readFile` возвращает ошибку, она передается в Express; иначе управление быстро возвращается в синхронную часть следующего handler-а. Далее выполняется обработка данных. Если она падает, ошибку перехватит синхронный механизм. Если бы обработка выполнялась внутри callback `readFile`, приложение могло бы завершиться, и обработчики ошибок Express не сработали бы.

Какой бы метод вы ни выбрали, чтобы обработчики ошибок Express сработали, а приложение продолжило работу, нужно гарантировать, что ошибка попадает в Express.

## Обработчик ошибок по умолчанию

В Express есть встроенный обработчик ошибок, который обрабатывает любые ошибки в приложении. Этот middleware добавляется в конец стека middleware-функций.

Если вы передали ошибку в `next()`, но не обработали ее в своем error handler, сработает встроенный обработчик: клиент получит ответ с текстом ошибки и stack trace. В production stack trace не включается.

!!!info ""

    Установите переменную окружения `NODE_ENV` в `production`, чтобы запустить приложение в production-режиме.

Когда формируется ответ об ошибке, в него добавляются:

-   `res.statusCode` устанавливается из `err.status` (или `err.statusCode`). Если значение вне диапазона 4xx/5xx, будет установлено 500.
-   `res.statusMessage` устанавливается согласно коду статуса.
-   В production тело ответа — HTML-сообщение статуса, иначе — `err.stack`.
-   Любые заголовки, указанные в объекте `err.headers`.

Если вызвать `next()` с ошибкой после начала отправки ответа (например, при ошибке во время стриминга ответа клиенту), обработчик Express по умолчанию закроет соединение и завершит запрос с ошибкой.

Поэтому при добавлении собственного обработчика ошибок нужно делегировать в стандартный обработчик Express, если заголовки уже отправлены клиенту:

```js
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500);
    res.render('error', { error: err });
}
```

Учтите, что стандартный обработчик может сработать, если в коде вы вызываете `next()` с ошибкой больше одного раза, даже при наличии собственного middleware обработки ошибок.

Другие middleware для обработки ошибок можно найти в каталоге Express middleware.

## Написание обработчиков ошибок

Middleware обработки ошибок определяется так же, как и обычный middleware, но принимает четыре аргумента вместо трех: `(err, req, res, next)`. Например:

```js
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
```

Middleware обработки ошибок объявляется в конце — после остальных вызовов `app.use()` и маршрутов. Например:

```js
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());
app.use(methodOverride());
app.use((err, req, res, next) => {
    // logic
});
```

Ответы из middleware могут быть в любом формате: HTML-страница ошибки, простое сообщение или JSON.

Для лучшей организации (и в более высокоуровневых фреймворках) можно определить несколько middleware обработки ошибок, как и обычных middleware. Например, отдельно для запросов через `XHR` и остальных:

```js
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());
app.use(methodOverride());
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);
```

В этом примере общий `logErrors` может писать информацию о запросе и ошибке в `stderr`, например:

```js
function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}
```

Также в примере `clientErrorHandler` определен следующим образом; здесь ошибка явно передается дальше.

Обратите внимание: если в функции обработки ошибок вы _не_ вызываете `next`, то обязаны сами сформировать и завершить ответ. Иначе такие запросы «повиснут» и не смогут быть корректно освобождены сборщиком мусора.

```js
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({
            error: 'Something failed!',
        });
    } else {
        next(err);
    }
}
```

Реализовать универсальный "catch-all" `errorHandler` можно так (пример):

```js
function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
}
```

Если у route handler несколько callback-функций, можно использовать параметр `route`, чтобы перейти к следующему route handler. Например:

```js
app.get(
    '/a_route_behind_paywall',
    (req, res, next) => {
        if (!req.user.hasPaid) {
            // continue handling this request
            next('route');
        } else {
            next();
        }
    },
    (req, res, next) => {
        PaidContent.find((err, doc) => {
            if (err) return next(err);
            res.json(doc);
        });
    }
);
```

В этом примере handler `getPaidContent` будет пропущен, но оставшиеся handler-ы в `app` для `/a_route_behind_paywall` продолжат выполняться.

!!!info ""

    Вызовы `next()` и `next(err)` показывают, что текущий handler завершен и в каком состоянии. `next(err)` пропустит все оставшиеся handler-ы в цепочке, кроме тех, которые настроены на обработку ошибок, как описано выше.
