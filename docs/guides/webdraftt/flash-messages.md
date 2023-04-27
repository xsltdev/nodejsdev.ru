# Flash-сообщения

**Flash-сообщения** - это сообщения, которые сохраняются в сессии и доступны в обработчике маршрута, на который выполняется следующий переход. Flash-сообщение удаляется из сессии после того, как оно было отображено в представлении.

Для использования в Node.js flash-сообщений необходимо установить npm модули `connect-flash`, `cookie-parser` и `express-session`.

```
npm install connect-flash cookie-parser express-session --save
```

Модуль `connect-flash` представляет собой [функцию промежуточной обработки](middleware.md) и работает только совместно с модулем `express-session`.

Пример использования Node.js flash-сообщений.

_app.js_

```js
const express = require('express'),
    app = express(),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    flash = require('connect-flash');

const host = '127.0.0.1';
const port = 7000;

app.use(cookieParser('secret key'));
app.use(session({ cookie: { maxAge: 3600 * 24 } }));
app.use(flash());

app.get('/get-flash', (req, res) => {
    console.log('Flash: ', req.flash('message'));
    res.send('Get Flash');
});

app.get('/set-flash', (req, res) => {
    req.flash('message', { from: 'Me', to: 'You' });
    req.flash('warning', 'Important!');
    res.send('Set Flash');
});

app.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
);
```

Управление сообщениями осуществляется с помощью метода `flash()` объекта запроса. Для создания сообщения методу необходимо передать два параметра:

-   ключ, по которому в дальнейшем будет получаться сообщение;
-   текст сообщения.

```js
req.flash('message', { from: 'Me', to: 'You' });
```

Получение заданного на предыдущем маршруте flash-сообщения также осуществляется через метод `req.flash()`, которому передается ключ, по которому задавалось сообщение.

```js
console.log('Flash: ', req.flash('message'));
```

Node.js flash-сообщение удаляется только после того, как оно было использовано в шаблоне. В противном случае оно будет доступно на всех последующих маршрутах, пока не будет отображено.
