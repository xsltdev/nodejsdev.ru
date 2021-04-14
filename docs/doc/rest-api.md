# REST API

**REST** представляет собой один из самых популярных подходов к построению архитектуры API с передачей данных по протоколу HTTP и означает "передача состояния представления".

## Концепция REST API

Основная идеи REST API заключается в разделении разных операций (чаще всего CRUD) при обращении к одному и тому же URL с помощью HTTP методов, основные из которых:

- `GET` - используется для получения данных;
- `POST` - используется для создания новой записи(ей);
- `PUT` - используется для обновления уже существующей записи(ей);
- `PATCH` - используется для обновления, но только тогда, когда изменяется идентификатор записи(ей);
- `DELETE` - используется для удаления записи(ей).

## Пример REST API

Рассмотрим пример создания Node.js REST API. Для простоты данные будут храниться в файле.

_app.js_

```js
process.env.NODE_ENV = 'development'

const express = require('express'),
  app = express(),
  fs = require('fs')

const host = '127.0.0.1'
const port = 7000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let file = 'data.json'

if ((process.env.NODE_ENV = 'test')) file = 'data-test.json'

app.use((req, res, next) => {
  fs.readFile(file, (err, data) => {
    if (err)
      return res
        .status(500)
        .send({ message: 'Error while getting users' })

    req.users = JSON.parse(data)

    next()
  })
})

app
  .route('/api/users')
  .get((req, res) => {
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
  })
  .post((req, res) => {
    if (req.body.user && req.body.user.id) {
      if (req.users.hasOwnProperty(req.body.user.id))
        return res
          .status(409)
          .send({ message: 'User already exists.' })

      req.users[req.body.user.id] = req.body.user

      fs.writeFile(
        file,
        JSON.stringify(req.users),
        (err, response) => {
          if (err)
            return res
              .status(500)
              .send({ message: 'Unable create user.' })

          return res
            .status(200)
            .send({ message: 'User created.' })
        }
      )
    } else
      return res
        .status(400)
        .send({ message: 'Bad request.' })
  })
  .put((req, res) => {
    if (req.body.user && req.body.user.id) {
      if (!req.users.hasOwnProperty(req.body.user.id))
        return res
          .status(404)
          .send({ message: 'User not found.' })

      req.users[req.body.user.id] = req.body.user

      fs.writeFile(
        file,
        JSON.stringify(req.users),
        (err, response) => {
          if (err)
            return res
              .status(500)
              .send({ message: 'Unable update user.' })

          return res
            .status(200)
            .send({ message: 'User updated.' })
        }
      )
    } else
      return res
        .status(400)
        .send({ message: 'Bad request.' })
  })
  .delete((req, res) => {
    if (req.query.id) {
      if (req.users.hasOwnProperty(req.query.id)) {
        delete req.users[req.query.id]

        fs.writeFile(
          file,
          JSON.stringify(req.users),
          (err, response) => {
            if (err)
              return res
                .status(500)
                .send({ message: 'Unable delete user.' })

            return res
              .status(200)
              .send({ message: 'User deleted.' })
          }
        )
      } else
        return res
          .status(404)
          .send({ message: 'User not found.' })
    } else
      return res
        .status(400)
        .send({ message: 'Bad request.' })
  })

app.listen(port, host, () =>
  console.log(`Server listens http://${host}:${port}`)
)
```

!!! note ""
Использование глаголов в названии маршрута при создании REST API считается плохой практикой и будет концептуально неправильным.

Здесь сразу предусмотрено наличие файла для тестирования приложения. Использование того или иного файла зависит от заданного переменной `process.env.NODE_ENV` окружения. [Тестирование](testing.md) API рассмотрено отдельно.

В приведенном примере для одного маршрута `/api/users` определяются разные обработчики, каждый из которых вызывается в зависимости от используемого при запросе HTTP-метода.

!!! note ""

    Для приведенного примера подразумевается, что в файле `data.json` по умолчанию находится пустой объект.

## Версионность REST API

При внесении изменений в логику работы вашего REST API, если оно является публичным, рекомендуется оставлять работоспособной предыдущую версию, чтобы предотвратить возникновение критических ошибок у пользователей прошлой версии. Версионность можно указывать прямо в URL.

```js
app.route('/api/v1/users')
```

Если изначально дальнейшее развитие API не планировалось и версионность не предусматривалась, но потом все же пришлось вносить изменения, то номер версии можно добавить в уже новые маршруты. Главное - оставить стабильной предыдущий вариант.

```js
app.route('/api/users')
app.route('/api/v2/users')
```
