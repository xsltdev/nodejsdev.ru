---
description: Найдите ответы на часто задаваемые вопросы по Express.js: структура приложения, модели, аутентификация, движки шаблонов, обработка ошибок и другое.
---

# FAQ

## Как структурировать приложение?

Однозначного ответа на этот вопрос нет. Все зависит от масштаба приложения и команды, которая над ним работает. Чтобы сохранить максимальную гибкость, Express не навязывает конкретную структуру.

Маршруты и прочая логика приложения могут находиться в любом количестве файлов и любой структуре каталогов. Для вдохновения посмотрите примеры:

-   [Route listings](https://github.com/expressjs/express/blob/4.13.1/examples/route-separation/index.js#L32-L47)
-   [Route map](https://github.com/expressjs/express/blob/4.13.1/examples/route-map/index.js#L52-L66)
-   [MVC style controllers](https://github.com/expressjs/express/tree/master/examples/mvc)

Также есть сторонние расширения для Express, которые упрощают часть этих шаблонов:

-   [Resourceful routing](https://github.com/expressjs/express-resource)

## Как определять модели?

В Express нет встроенного понятия базы данных. Это оставлено сторонним Node-модулям, поэтому вы можете работать почти с любой СУБД.

Посмотрите [LoopBack](http://loopback.io) — это фреймворк на базе Express, ориентированный на модели.

## Как аутентифицировать пользователей?

Аутентификация — еще одна область, где Express не навязывает подход. Вы можете использовать любую схему аутентификации. Для простого варианта с логином/паролем см. [этот пример](https://github.com/expressjs/express/tree/master/examples/auth).

## Какие движки шаблонов поддерживает Express?

Express поддерживает любой движок шаблонов, который соответствует сигнатуре `(path, locals, callback)`. Для унификации интерфейсов и кэширования посмотрите проект [consolidate.js](https://github.com/visionmedia/consolidate.js). Движки, которых нет в списке, тоже могут поддерживать сигнатуру Express.

Подробнее см. [Using template engines with Express](./using-template-engines.md).

## Как обрабатывать ответы 404?

В Express ответ 404 не считается ошибкой, поэтому middleware обработки ошибок его не перехватывает. Это поведение объясняется тем, что 404 просто означает отсутствие подходящего обработчика: Express выполнил все middleware и маршруты и не нашел ответа. Нужно лишь добавить middleware в самый низ стека (ниже остальных), чтобы вернуть 404:

```js
app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
});
```

Добавляйте маршруты динамически во время выполнения на экземпляр `express.Router()`, чтобы их не перекрывал middleware-обработчик.

## Как настроить обработчик ошибок?

Middleware обработки ошибок определяется так же, как и обычный middleware, но принимает четыре аргумента вместо трех — сигнатура `(err, req, res, next)`:

```js
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
```

Подробнее см. [Error handling](./error-handling.md).

## Как рендерить обычный HTML?

Никак — в этом обычно нет необходимости. Не нужно «рендерить» HTML через `res.render()`. Если у вас есть конкретный файл, используйте `res.sendFile()`. Если нужно раздавать много ресурсов из каталога, используйте `express.static()`.

## Какая версия Node.js требуется для Express?

-   [Express 4.x](../express.4/index.md) требует Node.js 0.10 или выше.
-   [Express 5.x](./index.md) требует Node.js 18 или выше.
