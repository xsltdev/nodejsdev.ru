# Представления и движок представлений Handlebars

Как правило, приложения Express для определения визуального интерфейса использует не стандартные файлы html, а специальные сущности - представления, из которых затем создаются html-файлы. Преимуществом представлений является то, что мы можем определять в них некоторые шаблоны, вместо которых затем вставляется какое-то динамическое содержимое с помощью кода javascript.

Управляет представлениями специальный компонент - движок представлений (view engine), который также называют движок шаблонов (templte engine). Вообще движков представлений в Express довольно много: Pug, Jade, Dust, Nunjucks, EJS, Handlebars и другие. Вопрос выбора движка представлений - в основном вопрос предпочтений, все они предоставляют схожую функциональность, различаясь лишь в каких-то деталях.

Для работы с движками представлений в Express определено ряд глобальных настроек, которые мы можем установить. Прежде всего это настройка view engine, которая устанавливает используемый движок предствлений, и views, которая устанавливает путь к папке с представлениями внутри проекта (если этот параметр не установлен, то по умолчанию используется папка с именем `views`).

Для начала рассмотрим работу с представлениями на основе движка [Handlebars](https://www.npmjs.com/package/hbs) или сокращенно hbs.

Для работы с представлениями установим пакет `hbs` в проект с помощью команды

```
npm install hbs --save
```

Для хранения представлений определим в проекте папку `views`. Затем в нее добавим новый файл `contact.hbs`. `hbs` - это расширение по умолчанию для представлений, которые обрабатываются движком Handlebars.

Определим в файле `contact.hbs` простейший html-код:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Контакты</title>
        <meta charset="utf-8" />
    </head>
    <body>
        <h1>Контакты</h1>
        <p>Электронный адрес: admin@mycorp.com</p>
    </body>
    <html></html>
</html>
```

Представление выглядит как обычная веб-страница, однако на самом деле это уже не html-страница, просто пока она не содержит никаких шаблонов.

Изменим файл приложения `app.js`:

```js
const express = require('express');

const app = express();

app.set('view engine', 'hbs');

app.use('/contact', function (request, response) {
    response.render('contact.hbs');
});
app.use('/', function (request, response) {
    response.send('Главная страница');
});
app.listen(3000);
```

Чтобы установить Handlebars в качестве движка представлений в Express, вызывается функция:

```js
app.set('view engine', 'hbs');
```

Для маршрута `/contact` используется функция обработчика, которая производит рендеринг представления `contact.hbs` с помощью функции `response.render()`. Эта функция на основе представления создает страницу html, которая отправляется клиенту.

Запустим приложение и обратимся в веб-браузере с запросом `http://localhost:3000/contact`:

![4.6.png](4.6.png)

## Модель представления

Одним из преимуществ шаблонов является то, что мы можем передавать в представления на место шаблонов модели представления - специальные объекты, данные которые использует движок представлений для рендеринга.

Так, изменим файл `app.js` следующим образом:

```js
const express = require('express');

const app = express();

app.set('view engine', 'hbs');

app.use('/contact', function (request, response) {
    response.render('contact.hbs', {
        title: 'Мои контакты',
        email: 'gavgav@mycorp.com',
        phone: '+1234567890',
    });
});
app.use('/', function (request, response) {
    response.send('Главная страница');
});
app.listen(3000);
```

Теперь в качестве второго параметра в функцию `response.render()` передается специальный объект с тремя свойствами.

Далее изменим код представления `contact.hbs`:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>{{title}}</title>
        <meta charset="utf-8" />
    </head>
    <body>
        <h1>{{title}}</h1>
        <p>Электронный адрес: {{email}}</p>
        <p>Телефон: {{phone}}</p>
    </body>
    <html></html>
</html>
```

Вместо конкретных данных в коде представления используются те данные, которые определены в модели. Чтобы обратиться к свойствам модели в двойных фигурных скобках указывается нужное свойство: `{{title}}`. При рендеринге представления вместо подобных выражений будут вставляться значения соответствующих свойств модели.

Перезапустим приложение и вновь обратимся по тому же адресу:

![4.7.png](4.7.png)

Рассмотрим более сложный случай, пусть в представление передается массив:

```js
const express = require('express');

const app = express();
app.set('view engine', 'hbs');

app.use('/contact', function (request, response) {
    response.render('contact.hbs', {
        title: 'Мои контакты',
        emailsVisible: true,
        emails: ['gavgav@mycorp.com', 'mioaw@mycorp.com'],
        phone: '+1234567890',
    });
});

app.use('/', function (request, response) {
    response.send('Главная страница');
});
app.listen(3000);
```

Для вывода данных изменим представление `contact.hbs`:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>{{title}}</title>
        <meta charset="utf-8" />
    </head>
    <body>
        <h1>{{title}}</h1>

        {{#if emailsVisible}}
        <h3>Электронные адреса</h3>
        <ul>
            {{#each emails}}
            <li>{{this}}</li>
            {{/each}}
        </ul>
        {{/if}}
        <p>Телефон: {{phone}}</p>
    </body>
    <html></html>
</html>
```

Выражение типа

```hbs
{{#if emailsVisible}}
// код
{{/if}}
```

позволяет определить видимость кода в зависимости от значения свойства `emailsVisible` - если это свойство равно `true`, то блок кода между `{{#if emailsVisible}}` и `{{/if}}` добавляется на веб-страницу.

Для перебора массивов можно воспользоваться конструкцией `each`

```hbs
{{#each emails}}
    <li>{{this}}</li>
{{/each}}
```

Эта конструкция перебирает все элементы из массива `emails` и создает для них элемент `<li>`. Текущий перебираемый элемент помещается в переменную `this`.

В итоге при обращении по пути `/contact` на веб-странице в виде списка будет отображаться массив:

![4.23.png](4.23.png)

## Изменение пути к предтавлениям

По умолчанию представления помещаются в папку `views`, но мы можем выбрать любую другую папку в проекте. Для этого необходимо установить параметр `views`:

```js
const express = require('express');

const app = express();

app.set('view engine', 'hbs');
app.set('views', 'templates'); // установка пути к представлениям

app.use('/contact', function (request, response) {
    response.render('contact');
});

app.listen(3000);
```

В данном случае в качестве папки представлений используется папка `templates`.
