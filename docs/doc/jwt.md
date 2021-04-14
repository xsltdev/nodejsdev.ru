# JWT

**JSON Web Token**, или просто **JWT**, представляет собой строку, полученную на основе формата JSON, и используется в качестве более безопасной и простой альтернативы сессиям и файлам cookie для авторизации.

JWT позволяет уйти от хранения данных авторизованного пользователя на сервере и возлагает на сервер только задачу по верификации подписи.

JWT формируют три части:

- заголовок (`header`);
- данные (`payload`);
- подпись (`signature`).

Заголовок представляет собой объект JSON и описывает сам токен с помощью следующих свойств:

- `alg` - алгоритм шифрования, используемый для подписи JWT, если токен не подписывается, то значением должно быть `none` (обязательный параметр);
- `typ` - тип токена, необходимо указывать со значением "JWT", если могут использоваться токены другого типа (необязательный параметр);
- `ctp` - тип данных, необходимо указывать со значением "JWT", если в payload присутствуют пользовательские ключи.

В данных, которые также передаются объектом JSON, указывается необходимая информация о пользователе. Также возможно задание значений предопределенных ключей (все они не обязательны) для описания конфигурации токена:

- `iss` - приложение, создавшее токен;
- `sub` - назначение JWT;
- `aud` - массив получателей токена;
- `exp` - дата и время, указанное в миллисекундах, прошедших с 01.01.1970, до наступления которого JWT будет валиден;
- `nbf` - дата и время, указанное в миллисекундах, прошедших с 01.01.1970, до наступления которого JWT будет не валиден;
- `iat` - дата и время создания JWT, указанное в миллисекундах, прошедших с 01.01.1970;
- `jti` - уникальный идентификатор токена.

Заголовок и данные используются для вычисления значения подписи по указанному в заголовке в свойстве `alg` алгоритму шифрования.

Далее формируется сам JWT.

```
`${base64url(header)}.${base64url(payload)}.${signature}`
```

Сгенерированный JWT отправляется клиенту, где он сохраняется в `localStorage` или `sessionStorage`, и будет отправляться клиентом серверу при каждом HTTP запросе в заголовке `Authorization`.

```
Authorization: Bearer {token}
```

Сервер в свою очередь при обращении к маршрутам, требующих авторизации, извлекает данные из токена и проверяет валидность токена и наличие указанного в JWT пользователя.

Рассмотрим пример использования в Node.js JWT.

_users.json_

```json
[
  {
    "id": 1,
    "login": "user1",
    "password": "password1"
  },
  {
    "id": 2,
    "login": "user2",
    "password": "password2"
  },
  {
    "id": 3,
    "login": "user3",
    "password": "password3"
  }
]
```

_app.js_

```js
const express = require('express'),
  app = express(),
  crypto = require('crypto'),
  users = require('./users')

const host = '127.0.0.1'
const port = 7000

const tokenKey = '1a2b-3c4d-5e6f-7g8h'

app.use(express.json())
app.use((req, res, next) => {
  if (req.headers.authorization) {
    let tokenParts = req.headers.authorization
      .split(' ')[1]
      .split('.')
    let signature = crypto
      .createHmac('SHA256', tokenKey)
      .update(`${tokenParts[0]}.${tokenParts[1]}`)
      .digest('base64')

    if (signature === tokenParts[2])
      req.user = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString(
          'utf8'
        )
      )

    next()
  }

  next()
})

app.post('/api/auth', (req, res) => {
  for (let user of users) {
    if (
      req.body.login === user.login &&
      req.body.password === user.password
    ) {
      let head = Buffer.from(
        JSON.stringify({ alg: 'HS256', typ: 'jwt' })
      ).toString('base64')
      let body = Buffer.from(JSON.stringify(user)).toString(
        'base64'
      )
      let signature = crypto
        .createHmac('SHA256', tokenKey)
        .update(`${head}.${body}`)
        .digest('base64')

      return res.status(200).json({
        id: user.id,
        login: user.login,
        token: `${head}.${body}.${signature}`,
      })
    }
  }

  return res.status(404).json({ message: 'User not found' })
})

app.get('/user', (req, res) => {
  if (req.user) return res.status(200).json(req.user)
  else
    return res
      .status(401)
      .json({ message: 'Not authorized' })
})

app.listen(port, host, () =>
  console.log(`Server listens http://${host}:${port}`)
)
```

В приведенном примере при вводе логина и пароля пользователя отправляется запрос на авторизацию. Если логин и пароль верны, создается JWT и отправляется клиентской стороне. При любом следующем запросе на маршруты, требующие авторизации, будет выполняться проверка в функции промежуточной обработки на валидность токена.

Для экономии времени и избежания реализации собственного алгоритма формирования в Node.js JWT можно использовать npm модуль `jsonwebtoken`.

_app.js_

```js
const express = require('express'),
  app = express(),
  jwt = require('jsonwebtoken'),
  users = require('./users')

const host = '127.0.0.1'
const port = 7000

const tokenKey = '1a2b-3c4d-5e6f-7g8h'

app.use(express.json())
app.use((req, res, next) => {
  if (req.headers.authorization) {
    jwt.verify(
      req.headers.authorization.split(' ')[1],
      tokenKey,
      (err, payload) => {
        if (err) next()
        else if (payload) {
          for (let user of users) {
            if (user.id === payload.id) {
              req.user = user
              next()
            }
          }

          if (!req.user) next()
        }
      }
    )
  }

  next()
})

app.post('/api/auth', (req, res) => {
  for (let user of users) {
    if (
      req.body.login === user.login &&
      req.body.password === user.password
    ) {
      return res.status(200).json({
        id: user.id,
        login: user.login,
        token: jwt.sign({ id: user.id }, tokenKey),
      })
    }
  }

  return res.status(404).json({ message: 'User not found' })
})

app.get('/user', (req, res) => {
  if (req.user) return res.status(200).json(req.user)
  else
    return res
      .status(401)
      .json({ message: 'Not authorized' })
})

app.listen(port, host, () =>
  console.log(`Server listens http://${host}:${port}`)
)
```
