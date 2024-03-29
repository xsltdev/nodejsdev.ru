# Стандартные и собственные модули

Node.js приложение имеет модульную архитектуру построения, причем каждый файл JavaScript рассматривается как отдельный модуль, который может зависеть от других модулей.

Node.js модули могут быть устанавливаемые (с использованием `npm`) и собственные, которые создаются в процессе разработки.

## Модули NPM

По умолчанию все npm модули устанавливаются в директорию `node_modules`, создаваемую в директории, из которой была вызвана команда установки. Рассмотрим на примере express.

```
npm install express --save
```

Теперь express должен находиться по пути `/node_modules/express`.

Все устанавливаемые Node.js модули доступны только на своем и дочерних уровнях иерархии, поэтому настоятельно рекомендуется осуществлять установку из корня проекта.

## Собственные модули

Собственным Node.js модулем является любой JavaScript файл приложения, который экспортирует с помощью объекта `exports` функции или переменные, которые могут быть использованы другими файлами.

_app.js_

```js
const myModule = require('./my-module');

myModule.incrementCounter();
myModule.incrementCounter(3);

myModule.displayCounter();

myModule.decrementCounter();

myModule.displayCounter();
```

_my-module.js_

```js
let counter = 0;

exports.displayCounter = () =>
    console.log(`Count value: ${counter}`);

exports.incrementCounter = (value = 1) =>
    (counter += value);

exports.decrementCounter = (value = 1) =>
    (counter -= value);
```

## require()

Для подключения модулей используется функция `require()`. Если подключается npm модуль, то функции необходимо передать только его название, независимо от того, на каком уровне иерархии проекта он запрашивается.

```js
const express = require('express');
```

!!! note ""

    Функция Node js require() сама знает, что такие модули следует искать в node_modules, причем поиск самой директории node_modules будет происходить начиная от места, в котором был запрошен модуль и далее вверх по иерархии, пока она не будет найдена.

Подключение собственных модулей также осуществляется с использованием `require()`, только вместо имени модуля ей передается путь к файлу, относительно места, из которого он запрашивается.

```js
const myModule = require('./my-module');
```

Все пути файлов собственных модулей начинаются с `./`, что означает текущая директория.
