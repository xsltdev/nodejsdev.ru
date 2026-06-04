---
description: Изучите основы роутинга в Express.js: объявление маршрутов, обработку HTTP-методов и создание handler-ов для веб-сервера.
---

# Базовый роутинг

_Роутинг_ определяет, как приложение отвечает на клиентский запрос к конкретному endpoint: URI (или пути) и определенному HTTP-методу (GET, POST и т. д.).

У каждого маршрута может быть один или несколько handler-ов (обработчиков), которые выполняются при совпадении маршрута.

Определение маршрута имеет следующую структуру:

```js
app.METHOD(PATH, HANDLER);
```

Где:

-   `app` — экземпляр `express`.
-   `METHOD` — [HTTP request method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods) в нижнем регистре.
-   `PATH` — путь на сервере.
-   `HANDLER` — handler-функция, выполняемая при совпадении маршрута.

!!!alert ""

    Этот материал предполагает, что экземпляр `express` с именем `app` уже создан и сервер запущен. Если вы еще не знакомы с запуском приложения, см. [пример Hello world](./hello-world.md).

Следующие примеры показывают определение простых маршрутов.

Ответ `Hello World!` на главной странице:

```js
app.get('/', (req, res) => {
    res.send('Hello World!');
});
```

Ответ на POST-запрос к корневому маршруту (`/`), то есть главной странице приложения:

```js
app.post('/', (req, res) => {
    res.send('Got a POST request');
});
```

Ответ на PUT-запрос к маршруту `/user`:

```js
app.put('/user', (req, res) => {
    res.send('Got a PUT request at /user');
});
```

Ответ на DELETE-запрос к маршруту `/user`:

```js
app.delete('/user', (req, res) => {
    res.send('Got a DELETE request at /user');
});
```

Подробнее о роутинге читайте в [руководстве по routing](./routing.md).
