---
description: Изучите, как определять и использовать маршруты в Express.js: route methods, route paths, параметры и `Router` для модульного роутинга.
---

# Роутинг

_Роутинг_ описывает, как endpoint-ы (URI) приложения отвечают на клиентские запросы. Вводный материал см. в [Basic routing](./basic-routing.md).

Роутинг задается методами объекта Express `app`, соответствующими HTTP-методам: например, `app.get()` для GET и `app.post` для POST. Полный список см. в `app.METHOD`. Также можно использовать `app.all()` для всех HTTP-методов и `app.use()` для подключения middleware как callback-функции (подробнее в [Using middleware](./using-middleware.md)).

Эти методы роутинга задают callback-функцию (иногда ее называют "handler function (обработчик)"), которая вызывается, когда приложение получает запрос к указанному маршруту (endpoint) и HTTP-методу. Иными словами, приложение «слушает» запросы, соответствующие заданным маршрутам и методам, и при совпадении вызывает нужный callback.

На практике методы роутинга могут принимать несколько callback-функций. В этом случае важно передавать `next` в аргументах callback и вызывать `next()` внутри функции, чтобы передать управление следующему callback.

Следующий код — пример самого базового маршрута.

```js
const express = require('express');
const app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
    res.send('hello world');
});
```

## Методы маршрутов

Route method соответствует одному из HTTP-методов и вызывается на экземпляре класса `express`.

Следующий код показывает маршруты для методов `GET` и `POST` в корне приложения.

```js
// GET method route
app.get('/', (req, res) => {
    res.send('GET request to the homepage');
});

// POST method route
app.post('/', (req, res) => {
    res.send('POST request to the homepage');
});
```

Express поддерживает методы для всех HTTP request methods: `get`, `post` и т. д. Полный список см. в `app.METHOD`.

Есть специальный метод роутинга `app.all()`, который подключает middleware на пути для _всех_ HTTP request methods. Например, следующий handler выполняется для запросов к маршруту `"/secret"` с `GET`, `POST`, `PUT`, `DELETE` и любым другим HTTP-методом, поддерживаемым [http module](https://nodejs.org/api/http.html#http_http_methods).

```js
app.all('/secret', (req, res, next) => {
    console.log('Accessing the secret section ...');
    next(); // pass control to the next handler
});
```

## Пути маршрутов

Route paths в сочетании с request method определяют endpoint-ы, к которым можно делать запросы. Route paths могут быть строками или регулярными выражениями.

!!!info ""

    Для сопоставления route paths Express использует [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) v8; все возможности определения route paths смотрите в документации path-to-regexp. [Express Playground Router](https://bjohansebas.github.io/playground-router/) — удобный инструмент для проверки базовых маршрутов Express, хотя сопоставление шаблонов он не поддерживает.

### Строковые пути

String paths сопоставляются с запросами строго. Символы точки (`.`) и дефиса (`-`) интерпретируются буквально.

!!!warning ""

    Query string не является частью route path.

```js
app.get('/', (req, res) => {
    res.send('root');
});

app.get('/about', (req, res) => {
    res.send('about');
});

app.get('/random.text', (req, res) => {
    res.send('random.text');
});
```

### Подстановки (wildcards)

Wildcards соответствуют любому пути после префикса. Они должны иметь имя, как и route parameters, и сохраняются как массив сегментов пути.

```js
app.get('/files/*filepath', (req, res) => {
    // GET /files/images/logo.png
    console.dir(req.params.filepath);
    // => [ 'images', 'logo.png' ]
    res.send(`File: ${req.params.filepath.join('/')}`);
});
```

Чтобы wildcard также совпадал с корневым путем, оберните его в фигурные скобки:

```js
// Matches / , /foo , /foo/bar , etc.
app.get('/{*splat}', (req, res) => {
    // GET / => req.params.splat = []
    // GET /foo/bar => req.params.splat = [ 'foo', 'bar' ]
    res.send('ok');
});
```

### Необязательные сегменты

Используйте фигурные скобки для задания необязательных сегментов в route path. Если сегмент отсутствует, параметр не попадет в `req.params`.

```js
app.get('/:file{.:ext}', (req, res) => {
    // GET /image.png => req.params = { file: 'image', ext: 'png' }
    // GET /image => req.params = { file: 'image' }
    res.send('ok');
});
```

!!!alert ""

    Символы `?`, `+`, `*`, `[]` и `()` зарезервированы и не могут использоваться как буквальные символы в route path. При необходимости экранируйте их через `\`.

### Регулярные выражения

В качестве route path можно использовать и регулярные выражения. Это полезно, когда нужна более сложная логика сопоставления.

```js
// Matches any path containing "a"
app.get(/a/, (req, res) => {
    res.send('/a/');
});

// Matches paths ending with "fly" (butterfly, dragonfly, etc.)
app.get(/.*fly$/, (req, res) => {
    res.send('/.*fly$/');
});
```

## Параметры маршрутов

Route parameters — это именованные сегменты URL, которые позволяют извлекать значения из соответствующих позиций в URL. Полученные значения заполняются в объект `req.params`, где ключом выступает имя параметра из пути.

```
Путь маршрута: /users/:userId/books/:bookId
URL запроса: http://localhost:3000/users/34/books/8989
req.params: { "userId": "34", "bookId": "8989" }
```

Чтобы определить маршрут с route parameters, просто укажите параметры в пути маршрута, как показано ниже.

```js
app.get('/users/:userId/books/:bookId', (req, res) => {
    res.send(req.params);
});
```

!!!alert ""

    Имя route parameter должно состоять из «символов слова» (`[A-Za-z0-9_]`).

Поскольку дефис (`-`) и точка (`.`) трактуются буквально, их можно полезно сочетать с route parameters.

```
Путь маршрута: /flights/:from-:to
URL запроса: http://localhost:3000/flights/LAX-SFO
req.params: { "from": "LAX", "to": "SFO" }
```

```
Путь маршрута: /plantae/:genus.:species
URL запроса: http://localhost:3000/plantae/Prunus.persica
req.params: { "genus": "Prunus", "species": "persica" }
```

!!!alert ""

    Символы regexp не поддерживаются в route paths. Вместо этого используйте массив путей или регулярные выражения. Подробнее см. в синтаксисе сопоставления route path.

## Обработчики маршрутов

Вы можете передавать несколько callback-функций, работающих как [middleware](./using-middleware.md), для обработки запроса. Единственное отличие: эти callback могут вызвать `next('route')`, чтобы пропустить оставшиеся callback текущего маршрута. Это позволяет задать предусловия для маршрута и передать управление следующим маршрутам, если текущий не подходит.

```js
app.get('/user/:id', (req, res, next) => {
    if (req.params.id === '0') {
        return next('route');
    }
    res.send(`User ${req.params.id}`);
});

app.get('/user/:id', (req, res) => {
    res.send('Special handler for user ID 0');
});
```

В этом примере:

-   `GET /user/5` → обрабатывается первым маршрутом → отправляется "User 5"
-   `GET /user/0` → первый маршрут вызывает `next('route')`, переходя к следующему совпадающему маршруту `/user/:id`

Route handlers могут быть представлены одной функцией, массивом функций или их комбинацией, как в примерах ниже.

Один callback может обрабатывать маршрут. Например:

```js
app.get('/example/a', (req, res) => {
    res.send('Hello from A!');
});
```

Маршрут может обрабатывать несколько callback-функций (не забудьте указать `next`). Например:

```js
app.get(
    '/example/b',
    (req, res, next) => {
        console.log(
            'the response will be sent by the next function ...'
        );
        next();
    },
    (req, res) => {
        res.send('Hello from B!');
    }
);
```

Маршрут может обрабатываться массивом callback-функций. Например:

```js
const cb0 = function (req, res, next) {
    console.log('CB0');
    next();
};

const cb1 = function (req, res, next) {
    console.log('CB1');
    next();
};

const cb2 = function (req, res) {
    res.send('Hello from C!');
};

app.get('/example/c', [cb0, cb1, cb2]);
```

Маршрут может обрабатываться комбинацией отдельных функций и массивов функций. Например:

```js
const cb0 = function (req, res, next) {
    console.log('CB0');
    next();
};

const cb1 = function (req, res, next) {
    console.log('CB1');
    next();
};

app.get(
    '/example/d',
    [cb0, cb1],
    (req, res, next) => {
        console.log(
            'the response will be sent by the next function ...'
        );
        next();
    },
    (req, res) => {
        res.send('Hello from D!');
    }
);
```

## Методы ответа

Методы объекта response (`res`) из таблицы ниже могут отправить ответ клиенту и завершить request-response цикл. Если ни один из этих методов не вызван в route handler, клиентский запрос «повиснет».

| Метод | Описание |
| --- | --- |
| `res.download()` | Инициирует скачивание файла. |
| `res.end()` | Завершает процесс отправки ответа. |
| `res.json()` | Отправляет JSON-ответ. |
| `res.jsonp()` | Отправляет JSON-ответ с поддержкой JSONP. |
| `res.redirect()` | Перенаправляет запрос. |
| `res.render()` | Рендерит шаблон представления. |
| `res.send()` | Отправляет ответ различных типов. |
| `res.sendFile()` | Отправляет файл как octet stream. |
| `res.sendStatus()` | Устанавливает статус ответа и отправляет его строковое представление в теле ответа. |

## app.route()

С помощью `app.route()` можно создавать цепочки route handler-ов для одного route path. Путь задается в одном месте, что упрощает модульность и снижает дублирование и вероятность опечаток. Подробнее см. в документации Router().

Ниже пример цепочки route handler-ов, объявленной через `app.route()`.

```js
app.route('/book')
    .get((req, res) => {
        res.send('Get a random book');
    })
    .post((req, res) => {
        res.send('Add a book');
    })
    .put((req, res) => {
        res.send('Update the book');
    });
```

## express.Router

Используйте класс `express.Router` для создания модульных route handler-ов, которые можно монтировать. Экземпляр `Router` — полноценная система middleware и роутинга, поэтому его часто называют «мини-приложением».

Следующий пример создает роутер как модуль, подключает в нем middleware, определяет несколько маршрутов и монтирует модуль роутера на путь в основном приложении.

Создайте в каталоге приложения файл роутера `birds.js` со следующим содержимым:

```js
const express = require('express');
const router = express.Router();

// middleware that is specific to this router
const timeLog = (req, res, next) => {
    console.log('Time: ', Date.now());
    next();
};
router.use(timeLog);

// define the home page route
router.get('/', (req, res) => {
    res.send('Birds home page');
});
// define the about route
router.get('/about', (req, res) => {
    res.send('About birds');
});

module.exports = router;
```

Затем подключите модуль роутера в приложении:

```js
const birds = require('./birds');

// ...

app.use('/birds', birds);
```

Теперь приложение сможет обрабатывать запросы к `/birds` и `/birds/about`, а также вызывать middleware `timeLog`, относящийся к этому маршруту.

Но если родительский маршрут `/birds` содержит path parameters, они по умолчанию недоступны в подмаршрутах. Чтобы сделать их доступными, передайте опцию `mergeParams` в конструктор Router.

```js
const router = express.Router({ mergeParams: true });
```
