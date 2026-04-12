---
title: Использование и пример
description: Базовый пример запуска Node.js и создания простого HTTP-сервера
---

# Использование и пример

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/synopsis.html)

<!--introduced_in=v0.10.0-->

<!--type=misc-->

## Использование

`node [options] [V8 options] [script.js | -e "script" | - ] [arguments]`

Дополнительные сведения см. в документе [Параметры командной строки][].

## Пример

Ниже приведён пример [веб-сервера][], написанного на Node.js, который отвечает строкой `'Hello, World!'`:

Команды в этом документе начинаются с `$` или `>`, чтобы показать, как они выглядят в терминале пользователя. Символы `$` и `>` вводить не нужно. Они лишь обозначают начало команды.

Строки, которые не начинаются с `$` или `>`, показывают вывод предыдущей команды.

Сначала убедитесь, что Node.js загружен и установлен. Дополнительную информацию по установке см. в разделе [Установка Node.js через пакетный менеджер][].

Теперь создайте пустую папку проекта с именем `projects`, а затем перейдите в неё.

Linux и macOS:

```bash
mkdir ~/projects
cd ~/projects
```

Windows CMD:

```powershell
mkdir %USERPROFILE%\projects
cd %USERPROFILE%\projects
```

Windows PowerShell:

```powershell
mkdir $env:USERPROFILE\projects
cd $env:USERPROFILE\projects
```

Затем создайте в папке `projects` новый исходный файл с именем `hello-world.js`.

Откройте `hello-world.js` в любом удобном текстовом редакторе и вставьте в него следующий код:

```js
const http = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

Сохраните файл. Затем в окне терминала выполните `hello-world.js` командой:

```bash
node hello-world.js
```

В терминале должен появиться вывод примерно такого вида:

```console
Server running at http://127.0.0.1:3000/
```

Теперь откройте любой удобный веб-браузер и перейдите по адресу `http://127.0.0.1:3000`.

Если браузер показывает строку `Hello, World!`, значит сервер работает.

[Параметры командной строки]: cli.md#options
[Установка Node.js через пакетный менеджер]: https://nodejs.org/en/download/package-manager/
[веб-сервера]: http.md
