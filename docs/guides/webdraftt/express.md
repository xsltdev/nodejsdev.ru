# Express

**Express** - это фреймворк для Node.js, который реализовывает слой функций, необходимых для создания эффективных приложений и API. Его использование значительно сокращает написание кода, а, значит, уменьшается затрачиваемое на разработку время.

Node.js Express устанавливается через пакетный менеджер [npm](npm.md).

```
npm install express --save
```

Для наглядности и полноценной оценки всех преимуществ использования Node.js Express, реализуем с его помощью приведенный в статье ["Начало работы"](start.md) пример.

_app.js_

```js
const app = require('express')();

const host = '127.0.0.1';
const port = 7000;

app.get('/home', (req, res) => {
    res.status(200).type('text/plain');
    res.send('Home page');
});

app.get('/about', (req, res) => {
    res.status(200).type('text/plain');
    res.send('About page');
});

app.post('/api/admin', (req, res) => {
    res.status(200).type('text/plain');
    res.send('Create admin request');
});

app.post('/api/user', (req, res) => {
    res.status(200).type('text/plain');
    res.send('Create user request');
});

app.use((req, res, next) => {
    res.status(404).type('text/plain');
    res.send('Not found');
});

app.listen(port, host, function () {
    console.log(`Server listens http://${host}:${port}`);
});
```

Node.js Express имеет готовые функции обработки HTTP запросов, причем для каждого HTTP метода имеется своя функция, что особенно удобно при создании [REST API](rest-api.md). И это далеко не единственная причина использования Express.

Метод `use()` используется для создания промежуточных обработчиков - [Middleware](middleware.md).

Поскольку на практике разработка на традиционном Node.js практически не ведется, далее везде в руководстве изучение нового материала будет построено на примерах с Node.js Express.
