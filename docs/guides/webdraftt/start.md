# Начало работы

Создадим первое приложение на Node.js. Создайте корневую директорию проекта `app` с единственным файлом `app.js`.

_app.js_

```js
const http = require('http')

const host = '127.0.0.1'
const port = 7000

function notFound(res) {
  res.statusCode = 404
  res.setHeader('Content-Type', 'text/plain')
  res.end('Not found\n')
}

const server = http.createServer((req, res) => {
  switch (req.method) {
    case 'GET': {
      switch (req.url) {
        case '/home': {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/plain')
          res.end('Home page\n')
          break
        }
        case '/about': {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/plain')
          res.end('About page\n')
          break
        }
        default: {
          notFound(res)
          break
        }
      }

      break
    }
    case 'POST': {
      switch (req.url) {
        case '/api/admin': {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/plain')
          res.end('Create admin request\n')
          break
        }
        case '/api/user': {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/plain')
          res.end('Create user request\n')
          break
        }
        default: {
          notFound(res)
          break
        }
      }

      break
    }
    default: {
      notFound(res)
      break
    }
  }
})

server.listen(port, host, () => {
  console.log(`Server listens http://${host}:${port}`)
})
```

Чтобы запустить написанный Node.js сервер выполните команду.

```
node app.js
```

Если нигде не было допущено ошибки, то в консоли вы увидите строку `Server listens http://127.0.0.1:7000`, в противном случае Node.js сервер выведет подробное сообщение об ошибке.

Перейдите по описанным URL (`/home` и `/about`) или сделайте POST-запросы (`/api/admin` и `/api/user`), чтобы убедиться в работоспособности созданного сервера.

Разберем написанный код подробнее.

В самом начале подключается имеющийся по умолчанию в Node.js модуль `http`, который используется для создания HTTP-сервера. Любой модуль, установленный из репозитория подключается с помощью функции `require()`, в качестве аргумента которой передается название пакета. Node.js `require()` сама знает, где искать запрашиваемые пакеты.

Далее с использованием метода `createServer()` модуля `http` создается Node.js сервер. Метод `createServer()` принимает два аргумента:

- объект запроса (ссылка) - содержит данные запроса;
- объект ответа (ссылка) - нужен для управления ответом на запрос.

С помощью условного оператор `switch` организуется структура сервера и описываются ответы на указанные запросы. Если запрашиваемый URL не существует - возвращается `404` код ответа и текст `Not found`.

Код ответа задается свойству `statusCode` объекта ответа, заголовки задаются с помощью метода `setHeader()`, а ответ на запрос осуществляется вызовом метода `end()`.

!!! note ""

    Названия маршрутов не чувствительны к регистру.

Далее метод `listen()` запускает Node.js сервер. Передаваемые методу параметры:

- хост;
- порт;
- callback-функция, которая будет вызвана сразу после запуска сервера.

Созданный в примере сервер трудно масштабируется и содержит много кода, к тому же весь процесс приходится контролировать самостоятельно. На практике разработка Node.js приложений ведется с использованием фреймворков, самый популярный из которых - [Express](http://expressjs.com/).
