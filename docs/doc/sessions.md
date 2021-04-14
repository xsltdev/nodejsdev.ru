# Сессии

В web-разработке под **сессией** понимается промежуток времени, в течении которого пользователь находится на сайте. Сессия начинается в момент захода на сайт и заканчивается при закрытии вкладки браузера или при переходе в пределах текущей вкладки на другой ресурс, и позволяет сохранять, например, данные в действиях пользователя, которые не теряются при переходе на другую страницу.

!!! note ""

    Данные хранятся на сервере, а идентификатор сессии на стороне клиента в файле cookie. Причем `express-session` по умолчанию использует `cookie-parser` для разбора файлов cookie.

Для использования в Node.js сессии необходимо установить npm модуль `express-session`.

```
npm install express-session --save
```

Инициализация Node.js сессии осуществляется с помощью функции промежуточной обработки.

_app.js_

```js
const express = require('express'),
  app = express(),
  session = require('express-session')

const host = '127.0.0.1'
const port = 7000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    secret: 'you secret key',
    saveUninitialized: true,
  })
)

app.post('/ad', (req, res) => {
  req.session.showAd = req.body.showAd
  res.sendStatus(200)
})

app.get('/', (req, res) => {
  console.log(req.session.showAd)
  res.sendStatus(200)
})

app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`)
})
```

!!! note ""

    Модуль `body-parser` необходим для корректной обработки передаваемых в теле данных.

Пример опирается на то, что пользователь может указать, показывать ему на сайте рекламу или нет. При выборе отправляется POST-запрос, который записывает в сессию результат, который потом доступен во всех маршрутах приложения.

Во время инициализации Node.js сессии с помощью объекта можно задать следующие опции:

- `cookie` - настройка cookie хранения идентификатора сессии, передается объект с опциями (подробно [здесь](cookie.md));
- `genid` - функция, которая возвращает новый идентификатор сессии в виде строки (по умолчанию используется функция, генерирующая идентификаторы на основе библиотеки `uid-safe`);
- `resave` - булевое значение, указывает, нужно ли пересохранять сессию в хранилище, если она не изменилась (по умолчанию `false`);
- `rolling` - булевое значение, указывающее, нужно ли устанавливать идентификатор сессии cookie на каждый запрос (по умолчанию `false`);
- `saveUninitialized` - булевое значение, если `true`, то в хранилище будут попадать пустые сессии;
- `secret` - строка, которой подписывается сохраняемый в cookie идентификатор сессии;
- `store` - экземпляр хранилища, которое будет использоваться для хранения сессии (рассмотрено ниже в этой статье).

!!! note ""

    Node.js сессия считается пустой, если в конце обработки запроса в нее не было записано никаких данных.

В работе с сессией в таком формате, как приведено в примере, есть один важный нюанс - конструкция будет работать только для одного пользователя. Объект Node.js сессии глобальный и будет перезаписываться данными последнего пользователя. Чтобы избежать этого используются хранилища оперативной памяти.

Самыми распространенными хранилищами являются MemCached и Redis. Здесь рассмотрим пример хранения Node.js сессии с использованием Redis. Но сначала нужно установить два npm модуля.

```
npm install redis connect-redis --save
```

Теперь пример.

_app.js_

```js
const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  redisStorage = require('connect-redis')(session),
  redis = require('redis'),
  client = redis.createClient()

const host = '127.0.0.1'
const port = 7000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  session({
    store: new redisStorage({
      host: host,
      port: 6379,
      client: client,
    }),
    secret: 'you secret key',
    saveUninitialized: true,
  })
)

app.post('/ad', (req, res) => {
  if (!req.session.key) req.session.key = req.sessionID

  req.session.key[req.sessionID].showAd = req.body.showAd
  res.sendStatus(200)
})

app.get('/', (req, res) => {
  console.log(req.session.key[req.sessionID].showAd)
  res.sendStatus(200)
})

app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`)
})
```

Для записи данных пользователя в Redis свойству `key` сессии присваивается объект с ее уникальным идентификатором в виде ключа и объектом данных в качестве значения.

По умолчанию время жизни Node.js сессии в Redis равно времени жизни ее идентификатора в cookie (задается параметром `maxAge`).

Для переопределения времени жизни в хранилище используйте параметр `ttl`, указываемый в миллисекундах у экземпляра хранилища.

```js
app.use(
  session({
    store: new redisStorage({
      ttl: 3600000,
    }),
  })
)
```
