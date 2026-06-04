---
description: Узнайте, как использовать генератор приложений Express для быстрого создания каркаса проекта и ускорения начальной настройки.
---

# Генератор приложений Express

Используйте инструмент генерации `express-generator`, чтобы быстро создать каркас приложения.

Генератор можно запускать через команду `npx` (доступна начиная с Node.js 8.2.0).

```bash
$ npx express-generator
```

Для более ранних версий Node установите генератор как глобальный npm-пакет и затем запустите его:

```bash
$ npm install -g express-generator
$ express
```

Показать параметры команды можно с помощью опции `-h`:

```bash
$ express -h

  Usage: express [options] [dir]

  Options:

    -h, --help          output usage information
        --version       output the version number
    -e, --ejs           add ejs engine support
        --hbs           add handlebars engine support
        --pug           add pug engine support
    -H, --hogan         add hogan.js engine support
        --no-view       generate without view engine
    -v, --view <engine> add view <engine> support (ejs|hbs|hjs|jade|pug|twig|vash) (defaults to jade)
    -c, --css <engine>  add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)
        --git           add .gitignore
    -f, --force         force on non-empty directory
```

Например, следующая команда создает приложение Express с именем _myapp_. Приложение будет создано в папке _myapp_ в текущем рабочем каталоге, а движком шаблонов станет [Pug](https://pugjs.org/):

```bash
$ express --view=pug myapp

   create : myapp
   create : myapp/package.json
   create : myapp/app.js
   create : myapp/public
   create : myapp/public/javascripts
   create : myapp/public/images
   create : myapp/routes
   create : myapp/routes/index.js
   create : myapp/routes/users.js
   create : myapp/public/stylesheets
   create : myapp/public/stylesheets/style.css
   create : myapp/views
   create : myapp/views/index.pug
   create : myapp/views/layout.pug
   create : myapp/views/error.pug
   create : myapp/bin
   create : myapp/bin/www
```

Затем установите зависимости:

```bash
$ cd myapp
$ npm install
```

На MacOS или Linux запустите приложение так:

```bash
$ DEBUG=myapp:* npm start
```

В Windows Command Prompt используйте:

```bash
> set DEBUG=myapp:* & npm start
```

В Windows PowerShell используйте:

```bash
PS> $env:DEBUG='myapp:*'; npm start
```

После этого откройте в браузере `http://localhost:3000/`.

Сгенерированное приложение имеет следующую структуру каталогов:

```bash
.
├── app.js
├── bin
│   └── www
├── package.json
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes
│   ├── index.js
│   └── users.js
└── views
    ├── error.pug
    ├── index.pug
    └── layout.pug

7 directories, 9 files
```

!!!info ""

    Структура, созданная генератором, — лишь один из возможных вариантов организации Express-приложения. Используйте ее как есть или адаптируйте под свои задачи.
