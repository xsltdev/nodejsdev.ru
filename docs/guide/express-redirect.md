# Переадресация

Для переадресации применяется метод `redirect()`:

```js
redirect([status,] path)
```

В качестве параметра `path` передается путь, на который будет перенаправляться пользователь. Дополнительный параметр `status` задает статусный код переадресации. Если этот параметр не задан, тогда по умолчанию отправляется статусный код `302`, который предполагает временную переадресацию.

С помощью данного метода можно выполнять переадресацию как по относительным путям, так и по абсолютным, в том числе на другие домены.

Переадресация по абсолютному пути:

```js
const express = require('express')
const app = express()

app.use('/index', function (request, response) {
  response.redirect('https://xsltdev.ru')
})

app.listen(3000)
```

В данном случае при обращении по пути `/index` будет идти переадресация на сайт `https://xsltdev.ru`.

Переадресация по оносительным путям также не очень сложна, но здесь важно учитывать, как именно определяется адрес для редиректа. Рассмотрим редирект относительно текущего пути, с которого производится редирект. Например:

```js
const express = require('express')
const app = express()

app.use('/home', function (request, response) {
  response.redirect('about')
})
app.use('/about', function (request, response) {
  response.send('<h1>About</h1>')
})

app.listen(3000)
```

В данном случае будет идти перенаправление с ресурса `/home` на ресурс `/about`, то есть, условно говоря, с `http://localhost:3000/home` на `http://localhost:3000/about`.

Теперь рассмотрим похожий пример:

```js
const express = require('express')
const app = express()

app.use('/home/bar', function (request, response) {
  response.redirect('about')
})
app.use('/home/about', function (request, response) {
  response.send('<h1>About</h1>')
})

app.listen(3000)
```

Здесь с ресурса `/home/bar` также идет переадресация на ресурс `about`, однако в реальности теперь это будет не `http://localhost:3000/about`, а `http://localhost:3000/home/about`. То есть мы как-бы поднимаемся на один уровень вверх - с `home/bar` на `home/` и затем к нему добавляется `about`.

Если нам необходимо выполнить переадресацию не относительно текущего ресурса, а относительно корневого каталога приложения, то в начале адреса ставится слеш:

```js
const express = require('express')
const app = express()

app.use('/home/bar', function (request, response) {
  response.redirect('/about')
})
app.use('/about', function (request, response) {
  response.send('<h1>About</h1>')
})

app.listen(3000)
```

Еще несколько примеров. Переадресация относительно текущего адреса на адрес на том же уровне:

```js
app.use('/home/foo/bar', function (request, response) {
  response.redirect('./about')
})
```

Здесь идет переадресация с `http://localhost:3000/home/foo/bar` на `http://localhost:3000/home/foo/about`

Переадресация на адрес, который располагается уровнем выше:

```js
app.use('/home/foo/bar', function (request, response) {
  response.redirect('../about')
})
```

Здесь идет переадресация с `http://localhost:3000/home/foo/bar` на `http://localhost:3000/home/about`

Переадресация на уровень выше:

```js
app.use('/home/foo/bar', function (request, response) {
  response.redirect('.')
})
```

Здесь идет переадресация с `http://localhost:3000/home/foo/bar` на `http://localhost:3000/home/foo`

Переадресация на два уровня выше:

```js
app.use('/home/foo/bar', function (request, response) {
  response.redirect('..')
})
```

Здесь идет переадресация с `http://localhost:3000/home/foo/bar` на `http://localhost:3000/home`

По умолчанию при редиректе передается статусный код `302`, который указывает, что ресурс временно доступен по новому адресу. Но мы можем указать статусный код `301`, чтобы сделать переадресацию постоянной:

```js
response.redirect(301, '/about')
```
