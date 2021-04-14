# Аутентификация

В Node.js **аутентификация** чаще всего реализуется с использованием функций промежуточной обработки, предоставляемых библиотекой `passport.js`, которая устанавливается с помощью npm.

```
npm install passport --save
```

Для инициализации `passport.js` обязательно используется функция промежуточной обработки `initialize()`.

```js
app.use(passport.initialize())
```

Если аутентификация не требуется для каждого обращения пользователя к URL, а будет проходить один раз, то для установки сессии необходимо использовать функцию промежуточной обработки `session()`.

```js
app.use(passport.session())
```

## Логин и пароль

Для Node.js аутентификации по логину и паролю необходимо дополнительно установить модуль `passport-local`.

```
npm install passport-local --save
```

Теперь рассмотрим пример.

_app.js_

```js
const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  passport = require('passport'),
  localStrategy = require('passport-local').Strategy,
  flash = require('connect-flash')

const host = '127.0.0.1'
const port = 7000

function checkAuth() {
  return app.use((req, res, next) => {
    if (req.user) next()
    else res.redirect('/login')
  })
}

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'you secret key' }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

passport.use(
  new localStrategy((user, password, done) => {
    if (user !== 'test_user')
      return done(null, false, {
        message: 'User not found',
      })
    else if (password !== 'test_password')
      return done(null, false, {
        message: 'Wrong password',
      })

    return done(null, { id: 1, name: 'Test', age: 21 })
  })
)

app.get('/login', (req, res) => {
  res.send('Login page. Please, authorize.')
})

app.use((req, res, next) => {
  if (req.user) next()
  else res.redirect('/login')
})

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true,
  })
)

app.get('/home', checkAuth(), (req, res) => {
  res.send("Home page. You're authorized.")
})

app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`)
})
```

!!! note ""

    Здесь установлен модуль `connect-flash`, который позволяет использовать [flash-сообщения](flash-messages.md), используемые библиотекой `passport.js`.

Начнем рассмотрение примера с маршрута `/login`, определенного для метода `POST`. Здесь в качестве обработчика указан метод `passport.authenticate()`, которому передается два параметра:

- Тип стратегии аутентификации, в данном случае `local` означает, что это будет авторизация в пределах разрабатываемого приложения, обычно по логину и паролю;
- Объект конфигурации со следующими свойствами:
  - `successRedirect` - URL для перехода в случае успешной аутентификации;
  - `failureRedirect` - URL для перехода в случае ошибки;
  - `failureFlash` - булевое значение, если `true`, то добавит flash-сообщение, переданное методу `done()` в случае ошибки.

```js
passport.authenticate('local', {
	successRedirect: '/home',
	failureRedirect: '/login',
	failureFlash: true
}));
```

Далее идем к функции промежуточной обработки `passport.use()`, в которой определена логика Node.js аутентификации с помощью выбранной стратегии. В приведенном примере при создании экземпляра стратегии `LocalStrategy` ее конструктору передается функция, которой передается три параметра:

- имя пользователя;
- пароль пользователя;
- callback-функция, с помощью которой задается результат процесса аутентификации.

По умолчанию ожидается, что имя пользователя и пароль находятся в теле запроса в полях `username` и `password` соответственно. Чтобы изменить стандартное поведение - передайте при создании стратегии первым параметром следующий объект.

```js
passport.use(
  new localStrategy(
    {
      usernameField: 'login',
      passwordField: 'pwd',
    },
    (user, password, done) => {
      if (user !== 'test_user')
        return done(null, false, {
          message: 'User not found',
        })
      else if (password !== 'test_password')
        return done(null, false, {
          message: 'Wrong password',
        })

      return done(null, { id: 1, name: 'Test', age: 21 })
    }
  )
)
```

Callback-функции обязательно передается два аргумента: ошибка исключения, если таковое произошло, и данные пользователя. Если аутентификация прошла неудачно по ошибке самого пользователя (неправильный логин или пароль), то первым параметром передается `null`, вторым - `false`. Также при неудачном входе третьим параметром можно передать объект с описанием ошибки, которая будет установлена в качестве flash-сообщения, если в методе `passport.authenticate()` задан в `true` параметр `failureFlash`.

!!! note ""

    Данные пользователя обязательно должны содержать его идентификатор, иначе будет ошибка.

В случае успешной аутентификации в объекте запроса в свойстве `user` сохраняются переданные данные пользователя. Именно по наличию данных в `req.user` и определяется, аутентифицирован пользователь или нет. В примере за эту проверку отвечает функция `checkAuth()`.

```js
function checkAuth() {
  return app.use((req, res, next) => {
    if (req.user) next()
    else res.redirect('/login')
  })
}
```

Для записи/получения данных пользователя в сессию обязательно необходимо использовать функции промежуточной обработки `passport.serializeUser()` и `passport.deserializeUser()`.

```js
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))
```

!!! note ""

    Функции промежуточной обработки для записи/чтения пользователя необходимы только в том случае, если используется `app.use(passport.session())`.

## Google и Facebook

Использование в Node.js библиотеки `passport.js` также позволяет осуществлять аутентификацию через социальные сети. Рассмотрим аутентификацию через аккаунты Google и Facebook.

Для аутентификации через Google требуется установка модуля `passport-google-oauth`.

```
npm install passport-google-oauth --save
```

Модуль поддерживает протоколы OAuth 1.0 и OAuth 2.0, но здесь рассмотрим именно OAuth 2.0 в виду того, что он является более новой версии.

_app.js_

```js
const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  passport = require('passport'),
  GoogleStrategy = require('passport-google-oauth')
    .OAuth2Strategy,
  flash = require('connect-flash')

const host = '127.0.0.1'
const port = 7000

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

function checkAuth() {
  return app.use((req, res, next) => {
    if (req.user) next()
    else res.redirect('/login')
  })
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'you secret key' }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

passport.use(
  new GoogleStrategy(
    {
      clientID: 90876745, //YOUR GOOGLE_CLIENT_ID
      clientSecret: '35revr-sdv6-3tswa-vzd', //YOUR GOOGLE_CLIENT_SECRET
      callbackURL:
        'http://www.yourdomain.com/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile)
    }
  )
)

app.get('/login', (req, res) => {
  res.send('Login page. Please, authorize.')
})

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
)

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/home',
  })
)

app.get('/home', checkAuth(), (req, res) => {
  res.send("Home page. You're authorized.")
})

app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`)
})
```

Стратегии аутентификации `GoogleStrategy` передаются два параметра:

- объект с параметрами вашего аккаунта Google (`GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`) и указанием маршрута, к которому нужно обратиться после процесса аутентификации;
- функция, описывающая логику аутентификации и устанавливающая конечный результат; принимает следующие параметры:
  - `accessToken`;
  - `refreshToken`;
  - `profile` - данные профиля пользователя из аккаунта Google;
  - `done` - функция, с помощью которой задается результат аутентификации (после ее вызова происходит переход на указанный в callbackURL маршрут).

Сама аутентификация начинается с обращения к маршруту `/auth/google`, в котором с помощью метода `passport.authenticate()` указывается тип используемой стратегии (`google`) и параметры так называемого [scope](https://developers.google.com/identity/protocols/googlescopes).

В маршруте `/auth/google/callback` указывается, на какие маршруты необходимо перейти в случае успешной или неудачной аутентификации.

Проверка авторизованности пользователя осуществляется по наличию объекта `user` в объект запроса.

Аутентификация через Facebook практически идентична аутентификации через Google. Сначала необходимо установить модуль `passport-facebook`.

```
npm install passport-facebook --save
```

Теперь необходимо заменить описание стратегии и маршрутов-обработчиков из примера аутентификации через Google на следующее.

```js
passport.use(new FacebookStrategy({
	clientID: 90876745, //YOUR FACEBOOK_APP_ID
	clientSecret: '35revr-sdv6-3tswa-vzd', //YOUR FACEBOOK_APP_SECRET
	callbackURL: "http://www.yourdomain.com/auth/facebook/callback"
	},
	(accessToken, refreshToken, profile, done) => {
		return done(null, profile);
	})
);

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate(facebook, {
	failureRedirect: '/login',
	successRedirect: '/home'
}));
```
