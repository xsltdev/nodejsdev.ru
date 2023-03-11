# Объект запроса

**Объект запроса** передается в качестве первого аргумента функции обработчику маршрута и общепринято именуется req, но вы можете использовать любое название.

```js
app.get('/', (req, res) => {
  res.render('index')
})
```

Объект запроса является одним из базовых объектов Node.js и расширяет свой функционал за счёт фреймворка Express. Он содержит исчерпывающую информацию в самом запросе и его инициаторе.

Свойства объекта запроса Node.js:

`query` - объект, содержащий все GET-параметры;

```js
// Запрос: /api/books?page=3&limit=15
{
	query: {
		page: 3,
		limit: 15
	},
}
```

`params` - параметры маршрутизации в виде объекта;

```js
// Маршрут: /api/books/:page/:limit
// Запрос: /api/books/3/15
{
	params: {
		page: 3,
		limit: 15
	},
}
```

`body` - объект, который хранит данные, передаваемые POST или PUT запросом;

`cookies` - значения cookies-файлов;

`headers` - объект со всеми HTTP-заголовками запроса;

```js
{
	headers: {
		host: '127.0.0.1:7000',
		connection: 'keep-alive',
		'cache-control': 'max-age=0',
	},
}
```

`url` - содержит маршрута с GET-параметрами, по которому определяется конечный обработчик;

```js
const express = require("express"),
		router = express.Router(),

router.get('/books', (req, res) => {
	/*
	Запрос: /api/books?page=3&limit=15
	Результат: /books?page=3&limit=15
	*/
	console.log(req.url);
});

app.use('/api', router)
```

`route` - объект маршрута Node js, экземпляр класса Route, который обрабатывает запрос (обычно используется для отладки);

`path` - URL конечного маршрута, не содержит данные протокола, хоста, порта и GET-параметры;

```js
const express = require("express"),
		router = express.Router(),

router.get('/books', (req, res) => {
	/*
	Запрос: /api/books?page=3&limit=15
	Результат: /books
	*/
	console.log(req.path);
});

app.use('/api', router);
```

`ip` - IP-адрес инициатора запроса (обычно клиента);

`hostname` - хост инициатора запроса;

```js
{
	hostname: '127.0.0.1',
}
```

`protocol` - протокол, с использованием которого был отправлен запрос (`http` или `https`);

```js
{
	protocol: 'http',
}
```

`secure` - булевое значение, `true`, если запрос был отправлен по протоколу `https`;

```js
{
	secure: false,
}
```

`xhr` - булевое значение, `true`, если запрос был отправлен вызовом AJAX.
