# Безопасность

Защите разрабатываемых приложений стоит уделить особое внимание. Обеспечение должной безопасности гарантирует непрерывную стабильную работу сервера и сохранность личных данных пользователей.

Для защиты самого соединения и передаваемых по сети данных настоятельно рекомендуется использовать один из протоколов криптографии: SSL или TLS.

Одним из способов защиты Node.js приложений от самых популярных уязвимостей в интернете является использование модуля `helmet`, который можно установить из репозитория npm.

```
npm install helmet --save
```

Модуль `helmet` представляет собой набор функций промежуточной обработки (middleware), устанавливающие определенные HTTP-заголовки для обеспечения безопасности.

Для использования `helmet` с настройками по умолчанию просто добавьте следующий middleware.

```js
const helmet = require('helmet'),
  express = require('express'),
  app = express()

app.use(helmet())
```

Список функций промежуточной обработки, входящих в модуль `helmet`:

`csp` - предотвращение межсайтовых вмешательств через задание заголовка `Content-Security-Policy`, с полным списком задаваемых параметров можно ознакомиться [здесь](https://helmetjs.github.io/docs/csp/);

```js
app.use(
  helmet.csp({
    directives: {
      objectSrc: ['none'],
      workerSrc: false, //значение не задается
    },
  })
)
```

`dnsPrefetchedControl` - управляет загрузкой DNS через задание заголовка `X-DNS-Prefetch-Control`;

```js
app.use(helmet.dnsPrefetchControl({ allow: true })) //задание заголовка

app.use(helmet.dnsPrefetchControl({ allow: false })) //удаление заголовка
app.use(helmet.dnsPrefetchControl()) //удаление заголовка
```

`expectCt` - устанавливает заголовок `Expect-CT`;

```js
app.use(
  helmet.expectCt({
    enforce: true,
    maxAge: 90, //задается в днях
    reportUri: 'http://example.com/report',
  })
)
```

`featurePolicy` - позволяет ограничить использование некоторых функций браузера (например, использование камеры или геолокации) заданием заголовка `Feature-Policy`, с полным списком функций можно ознакомиться [здесь](https://helmetjs.github.io/docs/feature-policy/);

```js
app.use(
  helmet.featurePolicy({
    features: {
      camera: ['none'], //запрет использования web-камеры
      fullscreen: ['none'], //запрет использования Fullscreen API
      geolocation: ['none'], //запрет использования геолокации
    },
  })
)
```

`hidePoweredBy` - удаляет или заменяет значение заголовка `X-Powered-By`, устанавливается отдельно (в случае использования express не нужен);

```js
app.use(helmet.hidePoweredBy()) //отключение заголовка
app.use(helmet.hidePoweredBy({ setTo: 'PHP X.X.X' })) //установка для заголовка определенного значения

app.disable('x-powered-by') //отключение через express
```

`hsts` - управляет заголовком `Strict-Transport-Security`;

```js
app.use(
  helmet.hsts({
    maxAge: 31536000, //задается в секундах
    includeSubdomains: true,
    preload: true,
  })
)
```

`ieNoOpen` - устанавливает заголовок `X-Download-Options` для предотвращения открытия скачанных файлов в контексте вашего сайта;

```js
app.use(helmet.ieNoOpen())
```

`noCache` - отключает кэширование на стороне клиента через задание заголовков `Cache-Control`, `Pragma`, `Surrogate-Control` и `Expires`;

```js
app.use(helmet.noCache())
```

`noSniff` - задает заголовок `X-Content-Type-Options` и тем самым предотвращает прослушивание MIME ответов с не соответствующим заявленному в `Content-Type` типу данных;

```js
app.use(helmet.noSniff())
```

`frameguard` - предотвращает атаку `clickjacking` заданием заголовка `X-Frame-Options`;

```js
app.use(
  helmet.frameguard({
    action: 'deny',
    domain: 'http://example.com',
  })
)
```

`permittedCrossDomainPolicies` - задает заголовок `X-Permitted-Cross-Domain-Policies` для предотвращения загрузки на сайте контента Adobe Flash и Adobe Acrobat;

```js
app.use(helmet.permittedCrossDomainPolicies()) //по умолчанию none
app.use(
  helmet.permittedCrossDomainPolicies({
    permittedPolicies: 'all',
  })
)
```

`referrerPolicy` - управляет заголовком `Referrer` задавая заголовок `Referrer-Policy`;

```js
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }))
app.use(
  helmet.referrerPolicy({
    policy: ['no-referrer', 'unsafe-url'],
  })
)
```

`xssFilter` - устанавливает заголовок `X-XSS-Protection`, активируя тем самым фильтр межсайтового скриптинга.

```js
app.use(
  helmet.xssFilter({
    setOnOldIE: true,
    reportUri: 'http://example.com/report',
  })
)
```

Для отключения конкретных функций промежуточной обработки, входящих в `helmet` и активных по умолчанию, просто передайте экземпляру модуля соответствующий конфигурационный объект.

```js
app.use(
  helmet({
    ieNoOpen: false,
    hidePoweredBy: false,
  })
)
```

Подобным образом также можно сразу задать настройки для всех функций промежуточной обработки.

```js
app.use(
  helmet({
    xssFilter: {
      setOnOldIE: true,
    },
    hidePoweredBy: {
      setTo: 'PHP X.X.X',
    },
  })
)
```

!!! note ""

    Каждая из перечисленных функций промежуточной обработки может быть установлена отдельно. Например, это будет полезным, если вам не требуется функционал всего Node.js модуля `helmet`.

```
npm install frameguard --save
```

Пример использования.

```js
const frameguard = require('frameguard')

app.use(frameguard())
```
