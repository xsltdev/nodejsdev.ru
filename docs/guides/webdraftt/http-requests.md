# Отправка HTTP-запросов

Для осуществления HTTP-запросов к стороннему API в Node js приложении, работающим в связке с Express, используется устанавливаемый npm модуль `request`.

```
npm install request --save
```

Модуль `request` для разных типов HTTP методов реализовывает одноименные функции:

- `get`;
- `post`;
- `put`;
- `delete`.

Пример GET-запроса.

_app.js_

```js
const express = require('express'),
  app = express(),
  request = require('request')

const host = '127.0.0.1'
const port = 7000

app.get('/', (req, res) => {
  request(
    'http://example.com/api',
    (err, response, body) => {
      if (err) return res.status(500).send({ message: err })

      return res.send(body)
    }
  )
})

app.listen(port, host, () =>
  console.log(`Server listens http://${host}:${port}`)
)
```

Метод `get()` принимает аргументами URL, к которому необходимо выполнить запрос, и callback-функцию.

Callback-функция принимает три параметра:

- ошибку;
- объект ответа;
- отправленные в качестве ответа данные.

Пример POST-запроса.

_post.js_

```js
request.post(
  {
    url: 'http://example.com/api',
    form: {
      login: 'login1',
      password: 'password1',
    },
  },
  (err, response, body) => {
    if (err) return res.status(500).send({ message: err })

    return res.send(body)
  }
)
```

Для отправки методом `post()` данных в качестве первого аргумента передается объект со свойствами `url` и `form`, в которых задается URL, к которому необходимо выполнить запрос, и сами данные, которые задаются в качестве значения свойству `body`, соответственно. Вторым параметром передается callback-функция.

Если необходимо передать в запросе файлы, то данные необходимо преобразовать в объект `formData`, которые при отправке указываются в одноименном свойстве.

_post-form-data.js_

```js
request.post(
  {
    url: 'http://example.com/api',
    formData: {
      profile_image: fs.createReadStream(
        '/static/images/user.png'
      ),
      //детальная конфигурация
      profile_image2: {
        value: fs.createReadStream(
          '/static/images/user.png'
        ),
        options: {
          filename: 'my-photo.png',
          contentType: 'image/png',
        },
      },
      //передача множества файлов
      attachments: [
        fs.createReadStream('/static/images/user1.png'),
        fs.createReadStream('/static/images/user2.png'),
      ],
    },
  },
  (err, response, body) => {
    if (err) return res.status(500).send({ message: err })

    return res.send(body)
  }
)
```

Для задания в Node.js request HTTP-заголовков первым аргументом вместо строки, задающей URL, передайте объект в следующем формате.

_post-headers.js_

```js
request.post(
  {
    url: 'http://example.com/api',
    headers: { 'X-Custom-Header': 1 },
  },
  (err, response, body) => {
    if (err) return res.status(500).send({ message: err })

    return res.send(body)
  }
)
```

Пример выполнения DELETE-запроса.

_delete.js_

```js
request(
  {
    method: 'DELETE',
    url: 'http://example.com/api',
  },
  (err, response, body) => {
    if (err) return res.status(500).send({ message: err })

    return res.send(body)
  }
)
```

Если вам удобнее работать с объектами `Promise` или вы хотите использовать конструкцию `async/await`, тогда в таком случае лучше использовать модуль [request-promise](https://www.npmjs.com/package/request-promise).
