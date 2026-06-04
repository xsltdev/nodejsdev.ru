---
description: Узнайте, как раздавать статические файлы (изображения, CSS и JavaScript) в Express.js с помощью встроенного middleware `static`.
---

# Раздача статических файлов в Express

Чтобы раздавать статические файлы, такие как изображения, CSS и JavaScript, используйте встроенный middleware `express.static`.

Сигнатура функции:

```js
express.static(root, [options]);
```

Аргумент `root` задает корневой каталог, из которого раздаются статические ресурсы. Подробнее об аргументе `options` см. в `express.static`.

Например, следующий код раздает изображения, CSS и JavaScript из каталога `public`:

```js
app.use(express.static('public'));
```

Теперь можно обращаться к файлам из каталога `public`:

```text
http://localhost:3000/images/kitten.jpg
http://localhost:3000/css/style.css
http://localhost:3000/js/app.js
http://localhost:3000/images/bg.png
http://localhost:3000/hello.html
```

!!!info ""

    Express ищет файлы относительно статического каталога, поэтому имя статического каталога не входит в URL.

Чтобы использовать несколько каталогов со статикой, вызовите middleware `express.static` несколько раз:

```js
app.use(express.static('public'));
app.use(express.static('files'));
```

Express ищет файлы в том порядке, в котором вы подключили статические каталоги через `express.static`.

!!!info ""

    Для лучшей производительности раздачи статики используйте кеширование на [reverse proxy](./best-practice-performance.md#use-a-reverse-proxy).

Чтобы создать виртуальный префикс пути (которого физически нет в файловой системе) для файлов, раздаваемых через `express.static`, задайте mount path для статического каталога:

```js
app.use('/static', express.static('public'));
```

Теперь файлы из каталога `public` доступны через префикс пути `/static`.

```text
http://localhost:3000/static/images/kitten.jpg
http://localhost:3000/static/css/style.css
http://localhost:3000/static/js/app.js
http://localhost:3000/static/images/bg.png
http://localhost:3000/static/hello.html
```

Однако путь, который передается в `express.static`, вычисляется относительно каталога, из которого вы запускаете процесс `node`. Если приложение Express запускается из другого каталога, безопаснее использовать абсолютный путь:

```js
const path = require('path');
app.use(
    '/static',
    express.static(path.join(__dirname, 'public'))
);
```

Подробнее о функции `serve-static` и ее параметрах см. в документации serve-static.
