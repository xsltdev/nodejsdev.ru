# Прокси

Node.js сервер, как и любой другой веб-сервер, может выступать в качестве **прокси** для всех или только части запросов. Для проксирования запросов через сервер Node.js, работающий в связке с фреймворком Express, используется npm модуль `express-http-proxy`.

```
npm install express-http-proxy --save
```

В самом простом использовании модуля `express-http-proxy` прокси выглядит следующим образом.

```js
let proxy = require('express-http-proxy')

app.use('/api', proxy('http://example.com'))
```

Здесь все запросы к маршрутам, начинающимся с `/api` будут перенаправлены на `http://example.com`.

Вторым параметром функции промежуточной обработки `express-http-proxy` можно передать объект конфигурации со следующими свойствами:

`filter` - определяет, какие запросы должны быть проксированы, и принимает функцию, возвращающую булевое значение (если `true` - запрос проксируется);

```js
app.use(
  '/api',
  proxy('http://example.com', {
    filter: (req, res) =>
      req.headers.hasOwnProperty('Authorization'),
  })
)
```

`userResDecorator` - используется для модификации объекта ответа перед его отдачей клиенту;

```js
app.use(
  '/api',
  proxy('http://example.com', {
    userResDecorator: (proxyRes, proxyResData) => {
      let _data = JSON.parse(proxyResData)
      _data.proxy = true
      return JSON.stringify(_data)
    },
  })
)
```

`userResHeaderDecorator` - используется для модификации заголовков ответа;

```js
app.use(
  '/api',
  proxy('http://example.com', {
    userResHeaderDecorator: (hdrs) => {
      hdrs.Proxy = true
      return hdrs
    },
  })
)
```

`proxyReqPathResolver` - используется для модификации пути запроса (путем считается все, что следует после хоста);

```js
app.use(
  '/api',
  proxy('http://example.com', {
    proxyReqPathResolver: (req) => {
      console.log(req.url)
      return req.url
    },
  })
)
```

`proxyReqOptDecorator` - предназначен для модификации параметров объекта запроса (заголовков, HTTP метода, параметров адресной строки и т. д.);

```js
app.use(
  '/api',
  proxy('http://example.com', {
    proxyReqOptDecorator: (reqOpts) => {
      reqOpts.method = 'POST'
      return reqOpts
    },
  })
)
```

`proxyReqBodyDecorator` - используется для модификации тела запроса;

```js
app.use(
  '/api',
  proxy('http://example.com', {
    proxyReqBodyDecorator: (body) => {
      console.log(body)
      return body
    },
  })
)
```

`proxyErrorHandler` - предназначен для задания пользовательского поведения при возникновении ошибки (по умолчанию транслирует ошибку клиенту);

```js
app.use(
  '/api',
  proxy('http://example.com', {
    proxyErrorHandler: (err, res, next) => {
      next(err)
    },
  })
)
```

`parseReqBody` - булевое значение, если `true` - парсит тело запроса, если `false` - у объекта запроса не будет свойства `body`, рекомендуется отключать из соображений эффективности при передаче бинарных данных (по умолчанию `true`);

`limit` - устанавливает ограничение на размеры тела запроса (по умолчанию 1Мб), если размеры будут превышены - ответ вернется с `413` статусом;

```js
app.use(
  '/api',
  proxy('http://example.com', {
    limit: '10mb',
  })
)
```

`memozieHost` - булевое значение, если `true` - то первый параметр (адрес, куда проксируются запросы), будет разбираться при каждом запросе, если `false` - то только при первом и полученное значение будет использоваться в дальнейшем для всех поступающих запросов (по умолчанию `true`);

`https` - булевое значение, если `true` - запрос будет принудительно проксирован с использованием протокола `https` (по умолчанию протокол прокси совпадает с протоколом, указанным в заголовке `Host`);

`preserveHostHdr` - булевое значение, если `true` - сохраняет в качестве HTTP заголовка Host значение клиента;

`timeout` - устанавливает в миллисекундах время ожидания от сервера, на который перенаправляется запрос, по истечении заданного времени ответ вернется с `504` статусом.

```js
app.use(
  '/api',
  proxy('http://example.com', {
    timeout: 2000,
  })
)
```
