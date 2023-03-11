# Middleware

Node.js middleware, или по-другому **функция промежуточной обработки**, используется для выполнения каких-либо действий на основе данных объекта запроса и ответа и передает обработку следующей функции.

Пример Node.js middleware.

_app.js_

```js
const express = require('express')
const app = express()

const host = '127.0.0.1'
const port = 7000

app.use((req, res, next) => {
  req.headers['From-Middleware'] = 1
  console.log('Node.js Middleware')
  next()
})

app.get('/', (req, res) => {
  console.log(req.headers['From-Middleware'])
  res.send('Home page')
})

app.listen(port, host, () =>
  console.log(`Server listens http://${host}:${port}`)
)
```

Здесь для всех поступающих запросов добавляется HTTP-заголовок `From-Middleware` со значением `1`.

Для создания Node.js middleware используется метод `use()` экземпляра фреймворка Express, который принимает два аргумента:

- определение маршрута, при обращении к которому должна вызываться функция промежуточной обработки (по умолчанию `/`);
- callback-функция, определяющая выполняемые действия.

Если методу `use()` передать только callback-функцию, то в качестве маршрута будет использовано значение по умолчанию. Самой функции передается четыре параметра:

- ошибка, если все успешно, то содержит `null`;
- объект запроса;
- объект ответа;
- следующая функция обработки.

!!! note ""

    Если не передать вызов следующему обработчику, запрос "застрянет" в текущем middleware, поэтому очень важно не забывать `next()`.

```js
app.use((req, res, next) => {
  req.headers['From-Middleware'] = 1
  console.log('Node js Middleware')
  next() //Если не вызвать - запрос дальше не пойдет
})
```

Наглядным примером встроенного Node.js middleware является обработка отдачи [статических файлов](static.md).

Все конечные обработчики, имеются в виду методы `get()`, `post()` и т. д., также являются функциями промежуточной обработки, которые не передают вызов дальше. Поэтому очень важно определить все Node.js middleware до определения конечных обработчиков.

```js
app.get('/', (req, res) => {
  console.log(req.headers['From-Middleware'])
  res.send('Home page')
})

//Запрос сюда никогда не попадет
app.use((req, res, next) => {
  req.headers['From-Middleware'] = 1
  console.log('Node js Middleware')
  next()
})
```
