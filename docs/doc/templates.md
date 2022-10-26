# Шаблонизаторы

В Node.js для генерации и отдачи HTML-страниц используются шаблонизаторы. Node.js **шаблонизатор** представляет собой специальный модуль, использующий более удобный синтаксис для формирования HTML на основе динамических данных и позволяющий разделять представление от контроллера.

Настройка Node.js шаблонизатора осуществляется заданием двух параметров:

- `views` - путь к директории, в которой находятся шаблоны;
- `view engine` - указание самого шаблонизатора.

Для задания этих параметров используется метод Express `set()`.

```js
app.set('views', './views')
app.set('view engine', 'handlebars')
```

Шаблонизаторов очень много, но наибольшее распространение получили Handlebars и Pug.

## Handlebars

Начнем с установки Node.js handlebars.

```
npm install --save express-handlebars
```

И сразу рассмотрим пример.

_app.js_

```js
const express = require('express')
const app = express()
const handlebars = require('express-handlebars')

const host = '127.0.0.1'
const port = 7000

app.engine(
  'handlebars',
  handlebars.engine({ defaultLayout: 'main' })
)
app.set('views', './views')
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
  res.render('home', { title: 'Greetings form Handlebars' })
})

app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`)
})
```

_views/home.handlebars_

```html
<h1>{{{title}}}</h1>
```

_views/layouts/main.handlebars_

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />

    <title>Node js Handlebars</title>
  </head>
  <body>
    {{{body}}}
  </body>
</html>
```

С помощью метода `engine()` задается настройка Node.js handlebars, конкретно в примере указывается шаблон по умолчанию, в который будут подгружаться шаблоны страниц.

Генерация и отдача представления осуществляется с помощью метода `render()`, который принимает два параметра:

- шаблон;
- данные для шаблона в виде объекта (если необходимо).

!!! note ""

    Если директория с шаблонами не задана явно, то поиск представлений по умолчанию будет осуществляться в директории `views`, а макеты - в `views/layouts`.

Шаблоны Node.js handlebars представляют собой обычные файлы HTML в формате handlebars, в которых с помощью специального синтаксиса выводятся передаваемые данные. Для отображения значения свойства переданного объекта используется запись `{{{(название свойства)}}}`.

В макете `/views/layouts/main.handlebars` запись `{{{body}}}` определяет место, куда при запросе определенной страницы будет вставлено соответствующее ей представление.

!!! note ""

    Чтобы сгенерировать представление без макета, в объекте, передаваемом функции `render()` укажите свойство `layout` со значением `false`. Если хотите использовать макет, отличный от макета по умолчанию, просто укажите его имя. Помните, что макеты должны находиться в директории `layouts` директории с представлениями.

```js
app.get('/', (req, res) => {
  res.render('home', {
    title: 'Greetings form Handlebars',
    layout: false,
  })
})
```

Node.js handlebars гибкий шаблонизатор с обширным функционалом.

### Кэширование

В handlebars предусмотрен механизм кэширования представлений в режиме `production`. Шаблонизатор самостоятельно следит за режимом запуска приложения и управляет кэшированием. Но для этого сперва необходимо активировать кэширование с помощью Express.

```js
app.enable('view cache')
```

### Условия

В представлениях Node.js handlebars предусмотрен механизм отображения той или иной части шаблона в зависимости от определенного условия.

```js
app.get('/', (req, res) => {
  res.render('home', {
    title: 'Greetings form Handlebars',
    content: 'Description how to use it handlebars',
  })
})
```

```html
<h1>{{title}}</h1>

{{#if content}}
<p>{{content}}</p>
{{/if}}
```

### Циклы

Для вывода данных переданного массива в Node.js шаблонизаторе handlebars предусмотрена конструкция, аналогичная работе обычного цикла.

```js
app.get('/', (req, res) => {
  res.render('home', {
    title: 'Greetings form Handlebars',
    advantages: ['simple', 'flexible', 'powerful'],
  })
})
```

```html
<h1>{{title}}</h1>

{{#if advantages}}
<p>Advantages</p>

<ul>
  {{#each advantages}}
  <li>{{this}}</li>
  {{/each}}
</ul>
{{/if}}
```

### Частичные представления

Для переиспользования повторяющейся части шаблона без ее дублирования при каждом использовании имеются частичные представления.

_partials/advantages.handlebars_

```html
<ul>
  {{#each advantages}}
  <li>{{this}}</li>
  {{/each}}
</ul>
```

_home.handlebars_

```html
<h1>{{title}}</h1>

{{#if advantages}}
<p>Advantages</p>
{{> advantages}} {{/if}}
```

### Вспомогательные функции

Под вспомогательными функциями в Node.js handlebars подразумеваются функции, которые могут быть вызваны прямо в представлении для обработки отображаемых данных. Такие функции могут быть определены глобально для всех шаблонов или только для одного конкретного и задаются в свойстве `helpers`.

```js
app.engine(
  'handlebars',
  handlebars.engine({
    defaultLayout: 'main',
    helpers: {
      getTitle: () => 'Greetings form Handlebars',
    },
  })
)
app.set('views', './views')
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
  res.render('home', {
    helpers: {
      getAdvantages: () => [
        'simple',
        'flexible',
        'powerful',
      ],
    },
  })
})
```

```html
<h1>{{getTitle}}</h1>

<p>Advantages: {{getAdvantages}}</p>
```

!!! note ""

    Вспомогательные функции, определенные локально в методе `render()` конкретного запроса, могут использоваться только в шаблоне, обрабатываемом этим запросом.

!!! note ""

    Если имя локально определенной вспомогательной функции совпадает с глобальной, то в представлении, где описана локальная, будет использоваться локальная.

## Pug

Еще один популярный Node.js шаблонизатор - Pug. Сразу установим его.

```
npm install pug --save
```

И сразу пример с Node.js Pug в качестве шаблонизатора.

_app.js_

```js
const express = require('express')
const app = express()

const host = '127.0.0.1'
const port = 7000

app.set('views', './views')
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('main', { title: 'Greetings from Pug' })
})

app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`)
})
```

_views/main.pug_

```pug
html(lang="en")
  head
    title Node js Pug
    meta(charset="utf-8")
  body
    h1 #{title}
```

В Node.js Pug представления имеют расширение `.pug` и подобно шаблонизатору Handlebars генерируются с помощью метода объекта ответа `render()`, принимающего первым параметром имя шаблона, а вторым - данные для этого шаблона в виде объекта.

Шаблонизатор использует крайне необычный подход к построению представления. Каждая строка в файле полностью описывает одни HTML-элемента. Сначала идет имя тега, затем через пробел - его значение. Для использования в значении тега (или его атрибута) внешних данных, применяется механизм интерполяции. Так, свойство переданного объекта, значение которого необходимо использовать, заключается в `#{` и `}`.

```pug
h1 #{title}
```

!!! note ""

    Если HTML-тег не указан, то по умолчанию будет использоваться `div`.

Атрибуты HTML-элементов задаются в следующем формате.

```
тег(имя*атрибута='значение*атрибута')
```

Вложенность тегов HTML в Node.js Pug шаблоне реализуется через отступ табуляции относительно родителя, причем эта вложенность соблюдается в файле и визуально. Для компиляции HTML-кода в одну строку без соблюдения визуальной иерархии используйте следующую запись.

```pug
p: span

//Результат: '<p><span></span></p>'
```

Гибкость работы с Node.js Pug обеспечивается рядом специальных инструментов и конструкций.

### Переменные

Внутри самого представления возможно определение переменных, которые могут использоваться только в пределах текущего шаблона.

```pug
-var title = 'New greetings from Pug'

html(lang="en")
  head
    title Node js Pug
    meta(charset="utf-8")
  body
    h1 #{title}
```

### Условия Pug

Node.js шаблонизатор Pug для реализации условий использует конструкции, аналогичные JavaScript операторам `if` и `switch`.

Пример с `if`.

```js
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Greetings from Pug',
    content: 'Node js Pug description',
  })
})
```

```pug
html(lang="en")
  head
    title Node js Pug
    meta(charset="utf-8")
  body
    h1 #{title}

    if content
      p #{content}
    else
      p No content
```

Пример со `switch`.

```js
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Greetings from Pug',
    type: 'h3',
  })
})
```

```pug
html(lang="en")
  head
    title Node js Pug
    meta(charset="utf-8")
  body
    case type
      when 'h1'
        h1 #{title}
      when 'h2'
        h2 #{title}
      when 'h3'
        h3 #{title}
```

### Циклы Pug

Отображение массива данных или вывод какой-либо части шаблона заданное количество раз осуществляется с помощью конструкций `each` и `while`.

```pug
html(lang="en")
  head
    title Node js Pug
    meta(charset="utf-8")
  body
    ol
      each vl, index in ['One', 'Two', 'Three']
        li #{vl} (#{index})
```

### Переиспользование шаблонов

Для переиспользования представления в Node.js Pug имеется оператор `include`, в указанное место вставляет содержимое файла заданного шаблона.

_views/index.pug_

```pug
html(lang="en")
  head
    title Node js Pug
    meta(charset="utf-8")
  body
    include includes/_list.pug
```

_`views/includes/_list.pug`_

```pug
ol
  each vl, index in ['One', 'Two', 'Three']
    li #{vl} (#{index})
```

!!! note ""

    Если указанного файла не существует, то в HTML-документ значение оператора `include` будет вставлено обычной строкой.

### Наследование

Node js Pug реализует принцип наследования для шаблонов, за которое отвечают операторы `block` и `extends`. С помощью `block` в представлении описывается какая-либо его часть, которая может быть заменена при наследовании (через `extends`) шаблона другим шаблоном. В родительском представлении блок может иметь значение по умолчанию, но если дочернее представление имеет собственную реализацию, то будет использоваться она.

_app.js_

```js
app.get('/', (req, res) => {
  res.render('home')
})
```

_views/index.pug_

```pug
html(lang="en")
  head
    title Node js Pug
    meta(charset="utf-8")
  body
    block nav
      ul
        li Home
        li About
        li Contacts
    block content
    block footer
```

_views/home.pug_

```pug
extends index.pug
block nav
  ul
    li Home
    li About
    li Contacts
  block content
    div Content text
  block footer
    footer Footer information
```

Также Node.js Pug позволяет “расширять” значение по умолчанию, а не заменять его. Для этого имеются операторы `append` и `prepend`, которые добавляют указанное содержимое после или до значения, заданного по умолчанию.

```pug
extends index.pug
block prepend nav
  a: img(src="/assets/images/logo.svg" alt="Logo")
block content
  div Content text
block footer
  footer Footer information
```

### Миксины

Миксины представляют собой подобие функций, которые могут быть использованы для создания переиспользуемых частей представления. Как и обычные функции, они могут принимать параметры.

_`views/mixins/_button.pug`_

```pug
mixin button(label, cssClass)
  button(class =cssClass) #{label}
```

_views/index.pug_

```pug
include mixins/_button.pug
html(lang="en")
  head
    title Node js Pug
    meta(charset="utf-8")
  body
    +button('Cancel', 'red')
    +button('Send')
```
