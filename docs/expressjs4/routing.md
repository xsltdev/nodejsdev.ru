# Маршрутизация ExpressJS

_Маршрутизация_ определяет, как приложение отвечает на клиентский запрос к конкретному адресу (URI). Вводную информацию о маршрутизации можно найти в разделе [Основы маршрутизации](basic-routing.md).

Приведенный ниже код служит примером одного из самых простых маршрутов.

```js
var express = require('express');
var app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.send('hello world');
});
```

## Методы Route

Метод route является производным от одного из методов HTTP и присоединяется к экземпляру класса `express`.

Приведенный ниже код служит примером маршрутов, определенных для методов запросов GET и POST к корневому каталогу приложения.

```js
// GET method route
app.get('/', function (req, res) {
    res.send('GET request to the homepage');
});

// POST method route
app.post('/', function (req, res) {
    res.send('POST request to the homepage');
});
```

Express поддерживает перечисленные далее методы маршрутизации, соответствующие методам HTTP: `get`, `post`, `put`, `head`, `delete`, `options`, `trace`, `copy`, `lock`, `mkcol`, `move`, `purge`, `propfind`, `proppatch`, `unlock`, `report`, `mkactivity`, `checkout`, `merge`, `m-search`, `notify`, `subscribe`, `unsubscribe`, `patch`, `search` и `connect`.

Для методов route, преобразуемых в недействительные имена переменных JavaScript, используйте нотацию в квадратных скобках. Например, `app['m-search']('/', function ...`

Существует особый метод маршрутизации, `app.all()`, не являющийся производным от какого-либо метода HTTP. Этот метод используется для загрузки функций промежуточной обработки в пути для всех методов запросов.

В приведенном ниже примере обработчик будет запущен для запросов, адресованных "/secret", независимо от того, используется ли GET, POST, PUT, DELETE или какой-либо другой метод запроса HTTP, поддерживаемый в [модуле http](https://nodejs.org/api/http.html#http_http_methods).

```js
app.all('/secret', function (req, res, next) {
    console.log('Accessing the secret section ...');
    next(); // pass control to the next handler
});
```

## Пути маршрутов

Пути маршрутов, в сочетании с методом запроса, определяют конкретные адреса (конечные точки), в которых могут быть созданы запросы. Пути маршрутов могут представлять собой строки, шаблоны строк или регулярные выражения.

В Express для сопоставления путей маршрутов используется [path-to-regexp](https://www.npmjs.com/package/path-to-regexp); в документации к path-to-regexp описаны все возможные варианты определения путей маршрутов. [Express Route Tester](http://forbeslindesay.github.io/express-route-tester/) - удобный инструмент для тестирования простых маршрутов в Express, хотя и не поддерживает сопоставление шаблонов.

Строки запросов не являются частью пути маршрута.

Ниже приводятся примеры путей маршрутов на основе строк.

Данный путь маршрута сопоставляет запросы с корневым маршрутом, `/`.

```js
app.get('/', function (req, res) {
    res.send('root');
});
```

Данный путь маршрута сопоставляет запросы с `/about`.

```js
app.get('/about', function (req, res) {
    res.send('about');
});
```

Данный путь маршрута сопоставляет запросы с `/random.text`.

```js
app.get('/random.text', function (req, res) {
    res.send('random.text');
});
```

Ниже приводятся примеры путей маршрутов на основе шаблонов строк.

Приведенный ниже путь маршрута сопоставляет `acd` и `abcd`.

```js
app.get('/ab?cd', function (req, res) {
    res.send('ab?cd');
});
```

Этот путь маршрута сопоставляет `abcd`, `abbcd`, `abbbcd` и т. д.

```js
app.get('/ab+cd', function (req, res) {
    res.send('ab+cd');
});
```

Этот путь маршрута сопоставляет `abcd`, `abxcd`, `abRABDOMcd`, `ab123cd` и т. д.

```js
app.get('/ab*cd', function (req, res) {
    res.send('ab*cd');
});
```

Данный путь маршрута сопоставляет `/abe` и `/abcde`.

```js
app.get('/ab(cd)?e', function (req, res) {
    res.send('ab(cd)?e');
});
```

Символы `?`, `+`, `*` и `()` представляют собой подмножества соответствующих им регулярных выражений. Дефис (`-`) и точка (`.`) интерпретируются буквально в путях на основе строк.

Примеры путей маршрутов на основе регулярных выражений:

Данный путь маршрута сопоставляет любой элемент с "a" в имени маршрута.

```js
app.get(/a/, function (req, res) {
    res.send('/a/');
});
```

Данный маршрут сопоставляет `butterfly` и `dragonfly`, но не `butterflyman`, `dragonfly man` и т. д.

```js
app.get(/.*fly$/, function (req, res) {
    res.send('/.*fly$/');
});
```

## Обработчики маршрутов

Для обработки запроса можно указать несколько функций обратного вызова, подобных [middleware](using-middleware.md). Единственным исключением является то, что эти обратные вызовы могут инициировать `next('route')` для обхода остальных обратных вызовов маршрута. С помощью этого механизма можно включить в маршрут предварительные условия, а затем передать управление последующим маршрутам, если продолжать работу с текущим маршрутом не нужно.

Обработчики маршрутов могут принимать форму функции, массива функций или их сочетания, как показано в примерах ниже.

Одна функция обратного вызова может обрабатывать один маршрут. Например:

```js
app.get('/example/a', function (req, res) {
    res.send('Hello from A!');
});
```

Один маршрут может обрабатываться несколькими функциями обратного вызова (обязательно укажите объект `next`). Например:

```js
app.get(
    '/example/b',
    function (req, res, next) {
        console.log(
            'the response will be sent by the next function ...'
        );
        next();
    },
    function (req, res) {
        res.send('Hello from B!');
    }
);
```

Массив функций обратного вызова может обрабатывать один маршрут. Например:

```js
var cb0 = function (req, res, next) {
    console.log('CB0');
    next();
};

var cb1 = function (req, res, next) {
    console.log('CB1');
    next();
};

var cb2 = function (req, res) {
    res.send('Hello from C!');
};

app.get('/example/c', [cb0, cb1, cb2]);
```

Маршрут может обрабатываться сочетанием независимых функций и массивов функций. Например:

```js
var cb0 = function (req, res, next) {
    console.log('CB0');
    next();
};

var cb1 = function (req, res, next) {
    console.log('CB1');
    next();
};

app.get(
    '/example/d',
    [cb0, cb1],
    function (req, res, next) {
        console.log(
            'the response will be sent by the next function ...'
        );
        next();
    },
    function (req, res) {
        res.send('Hello from D!');
    }
);
```

## Методы ответа

Методы в объекте ответа (`res`), перечисленные в таблице ниже, могут передавать ответ клиенту и завершать цикл "запрос-ответ". Если ни один из этих методов не будет вызван из обработчика маршрута, клиентский запрос зависнет.

| Метод | Описание |
| --- | --- |
| res.download() | Приглашение загрузки файла. |
| res.end() | Завершение процесса ответа. |
| res.json() | Отправка ответа JSON. |
| res.jsonp() | Отправка ответа JSON с поддержкой JSONP. |
| res.redirect() | Перенаправление ответа. |
| res.render() | Вывод шаблона представления. |
| res.send() | Отправка ответа различных типов. |
| res.sendFile() | Отправка файла в виде потока октетов. |
| res.sendStatus() | Установка кода состояния ответа и отправка представления в виде строки в качестве тела ответа. |

## app.route()

Метод `app.route()` позволяет создавать обработчики маршрутов, образующие цепочки, для пути маршрута. Поскольку путь указан в одном расположении, удобно создавать модульные маршруты, чтобы минимизировать избыточность и количество опечаток. Дополнительная информация о маршрутах приводится в документации `Router()`.

Ниже приведен пример объединенных в цепочку обработчиков маршрутов, определенных с помощью функции `app.route()`.

```js
app.route('/book')
    .get(function (req, res) {
        res.send('Get a random book');
    })
    .post(function (req, res) {
        res.send('Add a book');
    })
    .put(function (req, res) {
        res.send('Update the book');
    });
```

## express.Router

С помощью класса `express.Router` можно создавать модульные, монтируемые обработчики маршрутов. Экземпляр `Router` представляет собой комплексную систему промежуточных обработчиков и маршрутизации; по этой причине его часто называют "мини-приложением".

В приведенном ниже примере создается маршрутизатор в виде модуля, в него загружается функция промежуточной обработки, определяется несколько маршрутов, и модуль маршрутизатора монтируется в путь в основном приложении.

Создайте файл маршрутизатора с именем `birds.js` в каталоге приложения со следующим содержанием:

```js
var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});
// define the home page route
router.get('/', function (req, res) {
    res.send('Birds home page');
});
// define the about route
router.get('/about', function (req, res) {
    res.send('About birds');
});

module.exports = router;
```

Потом загрузите модуль маршрутизации в приложение:

```js
var birds = require('./birds');

app.use('/birds', birds);
```

Данное приложение теперь сможет обрабатывать запросы, адресованные ресурсам `/birds` и `/birds/about`, а также вызывать специальную функцию промежуточной обработки `timeLog` данного маршрута.
