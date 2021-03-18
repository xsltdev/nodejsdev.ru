# Организация структуры приложения

Хранить код Node.js приложения в пределах одного скрипта и одновременно поддерживать в нем порядок весьма затруднительно. Рассмотрим, как можно грамотно организовать структуру проекта.

Предположим, что имеется приложение, предоставляющее API для оформления заказов на зарегистрированных пользователей, со следующей структурой файлов.

![Структура приложения](app-structure-1.svg)

Теперь рассмотрим пример с описанной выше структурой.

_app.js_

```js
const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  routes = require('./routes/index')

const host = '127.0.0.1'
const port = 7000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api', routes)

app.listen(port, host, () =>
  console.log(`Server listens http://${host}:${port}`)
)
```

_routes/index.js_

```js
const express = require('express'),
  router = express.Router(),
  usersRoutes = require('./users.routes')

router.use('/users', usersRoutes)

module.exports = router
```

_routes/users.routes.js_

```js
const express = require('express'),
  router = express.Router(),
  UserController = require('../controllers/users.controller'),
  UsersService = require('../services/users.service')

router.use(async (req, res, next) => {
  let data = await UsersService.getUsers()

  if (data) {
    req.users = data
    next()
  } else
    return res
      .status(500)
      .send({ message: 'Error while getting users' })
})

router
  .route('/')
  .get(UserController.getUsers)
  .post(UserController.createUser)
  .put(UserController.updateUser)
  .delete(UserController.deleteUser)

module.exports = router
```

_controllers/users.controller.js_

```js
const UsersService = require('../services/users.service')

class UsersController {
  getUsers(req, res) {
    if (req.query.id) {
      if (req.users.hasOwnProperty(req.query.id))
        return res
          .status(200)
          .send({ data: req.users[req.query.id] })
      else
        return res
          .status(404)
          .send({ message: 'User not found.' })
    } else if (!req.users)
      return res
        .status(404)
        .send({ message: 'Users not found.' })

    return res.status(200).send({ data: req.users })
  }

  async createUser(req, res) {
    if (req.body.user && req.body.user.id) {
      if (req.users.hasOwnProperty(req.body.user.id))
        return res
          .status(409)
          .send({ message: 'User already exists.' })

      req.users[req.body.user.id] = req.body.user

      let result = await UsersService.createUser(req.users)

      if (result) return res.status(200).send(result)
      else
        return res
          .status(500)
          .send({ message: 'Unable create user.' })
    } else
      return res
        .status(400)
        .send({ message: 'Bad request.' })
  }

  async updateUser(req, res) {
    if (req.body.user && req.body.user.id) {
      if (!req.users.hasOwnProperty(req.body.user.id))
        return res
          .status(404)
          .send({ message: 'User not found.' })

      req.users[req.body.user.id] = req.body.user

      let result = await UsersService.updateUser(req.users)

      if (result) return res.status(200).send(result)
      else
        return res
          .status(500)
          .send({ message: 'Unable update user.' })
    } else
      return res
        .status(400)
        .send({ message: 'Bad request.' })
  }

  async deleteUser(req, res) {
    if (req.query.id) {
      if (req.users.hasOwnProperty(req.query.id)) {
        delete req.users[req.query.id]

        let result = await UsersService.deleteUser(
          req.users
        )

        if (result) return res.status(200).send(result)
        else
          return res
            .status(500)
            .send({ message: 'Unable delete user.' })
      } else
        return res
          .status(404)
          .send({ message: 'User not found.' })
    } else
      return res
        .status(400)
        .send({ message: 'Bad request.' })
  }
}

module.exports = new UsersController()
```

_services/users.service.js_

```js
const fs = require('fs')

class UsersService {
  getUsers() {
    return new Promise((res, rej) => {
      fs.readFile('data.json', (err, data) => {
        if (err) {
          return res(false)
        }
        return res(JSON.parse(data))
      })
    })
  }

  createUser(data) {
    return new Promise((res, rej) => {
      fs.writeFile(
        'data.json',
        JSON.stringify(data),
        (err, response) => {
          if (err) return res(false)

          return res({ message: 'User created.' })
        }
      )
    })
  }

  updateUser(data) {
    return new Promise((res, rej) => {
      fs.writeFile(
        'data.json',
        JSON.stringify(data),
        (err, response) => {
          if (err) return res(false)

          return res({ message: 'User updated.' })
        }
      )
    })
  }

  deleteUser(data) {
    return new Promise((res, rej) => {
      fs.writeFile(
        'data.json',
        JSON.stringify(data),
        (err, response) => {
          if (err) return res(false)

          return res({ message: 'User deleted.' })
        }
      )
    })
  }
}

module.exports = new UsersService()
```

В файле `app.js` содержатся только основные функции промежуточной обработки и функция запуска вашего Node.js приложения.

В директории `config` находятся файлы для каждой возможной среды окружения, в которой может быть запущено приложение. В такие файлы выносится конфигурация приложения, которая меняется в зависимости от среды запуска.

Директория `controllers` хранит классы, методы которого выступают обработчиками маршрутов. При этом контроллер создается для каждой взаимосвязанной совокупности маршрутов, например, для всех маршрутов, отвечающих за выполнение действий над заказами.

В `services` также находятся классы, но их методы отвечают за поставку данных контроллерам, например, с их помощью происходит обращение к базе данных или стороннему API.

В директории `routes` находятся описания всех маршрутов, причем для любая взаимосвязанная совокупность маршрутов выносится в отдельный файл. Также в `routes` присутствует файл `index.js`, который служит для структурированного построения маршрутов. Так, например, с его помощью можно задать префикс маршрутам отдельной группы.

!!! note ""

    В идеальном варианте у вас всегда должны присутствовать файлы в каждой из директорий `controllers`, `services` и `routes`. Один файл должен описывать самостоятельную логическую часть Node.js приложения.
