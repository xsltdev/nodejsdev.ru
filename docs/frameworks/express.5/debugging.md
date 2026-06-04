---
description: Узнайте, как включать и использовать отладочные логи в Express.js через переменную окружения `DEBUG`.
---

# Отладка Express

Чтобы увидеть все внутренние логи Express, при запуске приложения установите переменную окружения `DEBUG` в `express:*`.

```bash
$ DEBUG=express:* node index.js
```

В Windows используйте соответствующую команду.

```bash
> $env:DEBUG = "express:*"; node index.js
```

Запуск этой команды на приложении, созданном [express generator](./generator.md), выводит примерно такой результат:

```bash
$ DEBUG=express:* node ./bin/www
  express:router:route new / +0ms
  express:router:layer new / +1ms
  express:router:route get / +1ms
  express:router:layer new / +0ms
  express:router:route new / +1ms
  express:router:layer new / +0ms
  express:router:route get / +0ms
  express:router:layer new / +0ms
  express:application compile etag weak +1ms
  express:application compile query parser extended +0ms
  express:application compile trust proxy false +0ms
  express:application booting in development mode +1ms
  express:router use / query +0ms
  express:router:layer new / +0ms
  express:router use / expressInit +0ms
  express:router:layer new / +0ms
  express:router use / favicon +1ms
  express:router:layer new / +0ms
  express:router use / logger +0ms
  express:router:layer new / +0ms
  express:router use / jsonParser +0ms
  express:router:layer new / +1ms
  express:router use / urlencodedParser +0ms
  express:router:layer new / +0ms
  express:router use / cookieParser +0ms
  express:router:layer new / +0ms
  express:router use / stylus +90ms
  express:router:layer new / +0ms
  express:router use / serveStatic +0ms
  express:router:layer new / +0ms
  express:router use / router +0ms
  express:router:layer new / +1ms
  express:router use /users router +0ms
  express:router:layer new /users +0ms
  express:router use / &lt;anonymous&gt; +0ms
  express:router:layer new / +0ms
  express:router use / &lt;anonymous&gt; +0ms
  express:router:layer new / +0ms
  express:router use / &lt;anonymous&gt; +0ms
  express:router:layer new / +0ms
```

Когда в приложение приходит запрос, вы увидите логи, заданные в коде Express:

```bash
  express:router dispatching GET / +4h
  express:router query  : / +2ms
  express:router expressInit  : / +0ms
  express:router favicon  : / +0ms
  express:router logger  : / +1ms
  express:router jsonParser  : / +0ms
  express:router urlencodedParser  : / +1ms
  express:router cookieParser  : / +0ms
  express:router stylus  : / +0ms
  express:router serveStatic  : / +2ms
  express:router router  : / +2ms
  express:router dispatching GET / +1ms
  express:view lookup "index.pug" +338ms
  express:view stat "/projects/example/views/index.pug" +0ms
  express:view render "/projects/example/views/index.pug" +1ms
```

Чтобы видеть только логи роутера, установите `DEBUG=express:router`. Аналогично, чтобы видеть только логи приложения, задайте `DEBUG=express:application` и т. д.

## Приложения, созданные через `express`

Приложение, созданное командой `express`, использует модуль `debug`, а namespace отладки привязан к имени приложения.

Например, если приложение создано командой `$ express sample-app`, включить отладочные сообщения можно так:

```bash
$ DEBUG=sample-app:* node ./bin/www
```

Можно указать сразу несколько namespace, перечислив их через запятую:

```bash
$ DEBUG=http,mail,express:* node index.js
```

## Расширенные параметры

При запуске через Node.js можно задать несколько переменных окружения, которые изменяют поведение debug-логирования:

| Имя | Назначение |
| --- | --- |
| `DEBUG` | Включает/отключает конкретные namespace отладки. |
| `DEBUG_COLORS` | Использовать ли цвета в выводе debug. |
| `DEBUG_DEPTH` | Глубина инспекции объектов. |
| `DEBUG_FD` | Дескриптор файла для вывода debug-сообщений. |
| `DEBUG_SHOW_HIDDEN` | Показывать скрытые свойства у инспектируемых объектов. |

!!!info ""

    Переменные окружения, начинающиеся с `DEBUG_`, преобразуются в объект `Options`, который используется форматтерами `%o`/`%O`. Полный список — в документации Node.js по [`util.inspect()`](https://nodejs.org/api/util#util_util_inspect_object_options).
