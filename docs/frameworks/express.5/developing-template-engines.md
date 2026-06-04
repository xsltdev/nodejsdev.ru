---
description: Узнайте, как разрабатывать собственные движки шаблонов для Express.js через `app.engine()` и интегрировать свой рендеринг.
---

# Разработка движков шаблонов для Express

Используйте метод `app.engine(ext, callback)`, чтобы создать собственный движок шаблонов. `ext` — расширение файла, а `callback` — функция движка, принимающая путь к файлу, объект `options` и callback-функцию.

Ниже пример реализации очень простого движка шаблонов для рендеринга файлов `.ntl`.

```js
const fs = require('fs'); // this engine requires the fs module
app.engine('ntl', (filePath, options, callback) => {
    // define the template engine
    fs.readFile(filePath, (err, content) => {
        if (err) return callback(err);
        // this is an extremely simple template engine
        const rendered = content
            .toString()
            .replace(
                '#title#',
                `<title>${options.title}</title>`
            )
            .replace(
                '#message#',
                `<h1>${options.message}</h1>`
            );
        return callback(null, rendered);
    });
});
app.set('views', './views'); // specify the views directory
app.set('view engine', 'ntl'); // register the template engine
```

Теперь ваше приложение сможет рендерить `.ntl`-файлы. Создайте в каталоге `views` файл `index.ntl` со следующим содержимым.

```pug
#title#
#message#
```

Затем добавьте в приложение следующий маршрут.

```js
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Hey',
        message: 'Hello there!',
    });
});
```

При запросе главной страницы `index.ntl` будет отрендерен как HTML.
