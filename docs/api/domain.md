---
title: Домен (domain)
description: Устаревший модуль доменов для группировки операций ввода-вывода и маршрутизации ошибок; большинству приложений не нужен
---

# Домен

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/domain.html)

<!-- YAML
deprecated: v1.4.2
changes:
  - version: v8.8.0
    pr-url: https://github.com/nodejs/node/pull/15695
    description: Any `Promise`s created in VM contexts no longer have a
                 `.domain` property. Their handlers are still executed in the
                 proper domain, however, and `Promise`s created in the main
                 context still possess a `.domain` property.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12489
    description: Handlers for `Promise`s are now invoked in the domain in which
                 the first promise of a chain was created.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.8.0 | Любые обещания, созданные в контексте виртуальной машины, больше не имеют свойства .domain. Однако их обработчики по-прежнему выполняются в соответствующем домене, а промисы, созданные в основном контексте, по-прежнему обладают свойством .domain. |
    | v8.0.0 | Обработчики промисов теперь вызываются в домене, в котором был создан первый промис цепочки. |

<!--introduced_in=v0.10.0-->

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и её планируют изменить. Не стоит полагаться на неё. Использование фичи может вызвать ошибки. Не стоит ожидать от неё обратной совместимости.

<!-- source_link=lib/domain.js -->

**Этот модуль готовится к удалению.** После того как будет готов API-заменитель,
модуль будет полностью объявлён устаревшим. Большинству разработчиков **не**
следует им пользоваться. Тем, кому без альтернативы нужна именно функциональность
доменов, можно временно на неё опираться, но следует планировать переход на
другое решение.

Домены позволяют обрабатывать несколько различных операций ввода-вывода как
одну группу. Если один из привязанных к домену эмиттеров событий или обратных
вызовов генерирует событие `'error'` или выбрасывает ошибку, уведомляется объект
домена, а не теряется контекст ошибки в обработчике `process.on('uncaughtException')`
и не происходит немедленный выход процесса с кодом ошибки.

## Предупреждение: не игнорируйте ошибки

<!-- type=misc -->

Обработчики ошибок домена **не заменяют** корректное завершение процесса при ошибке.

Из-за того, как в JavaScript работает [`throw`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw), почти нельзя безопасно
«продолжить с того же места», не допустив утечек ссылок или хрупкого неопределённого состояния.

Самый безопасный ответ на выброшенную ошибку — завершить процесс. В обычном веб-сервере
может быть много открытых соединений, и резко обрывать их из-за ошибки, вызванной
одним запросом, обычно нельзя.

Лучше отправить ответ об ошибке тому запросу, который её спровоцировал, дать остальным
завершиться в обычном режиме и перестать принимать новые запросы в этом воркере.

Так использование `domain` сочетается с модулем `cluster`: основной процесс может
создать нового воркера, когда в воркере произошла ошибка. В распределённых программах
завершающий прокси или реестр сервисов может зафиксировать сбой и отреагировать.

Например, так делать не стоит:

```js
// XXX ВНИМАНИЕ! ПЛОХАЯ ИДЕЯ!

const d = require('node:domain').create();
d.on('error', (er) => {
  // Ошибка не роняет процесс, но последствия хуже:
  // мы избегаем резкого перезапуска, но при этом утекают ресурсы.
  // Это не лучше, чем process.on('uncaughtException')!
  console.log(`error, but oh well ${er.message}`);
});
d.run(() => {
  require('node:http').createServer((req, res) => {
    handleRequest(req, res);
  }).listen(PORT);
});
```

Сочетая контекст домена и устойчивость к разделению программы на несколько воркеров,
можно реагировать адекватнее и безопаснее обрабатывать ошибки.

```js
// Намного лучше!

const cluster = require('node:cluster');
const PORT = +process.env.PORT || 1337;

if (cluster.isPrimary) {
  // В реальном сценарии воркеров больше двух,
  // и основной процесс с воркерами часто выносят в разные файлы.
  //
  // Логирование и защита от DoS и прочего — на усмотрение приложения.
  //
  // См. документацию по cluster.
  //
  // Важно: основной процесс делает минимум работы — так проще переживать сбои.

  cluster.fork();
  cluster.fork();

  cluster.on('disconnect', (worker) => {
    console.error('disconnect!');
    cluster.fork();
  });

} else {
  // воркер — здесь обрабатываются запросы (и возможные баги)

  const domain = require('node:domain');

  // Подробности про воркеры — в документации cluster.

  const server = require('node:http').createServer((req, res) => {
    const d = domain.create();
    d.on('error', (er) => {
      console.error(`error ${er.stack}`);

      // Опасная зона: произошло нечто неожиданное.

      try {
        // Завершиться в течение 30 с
        const killtimer = setTimeout(() => {
          process.exit(1);
        }, 30000);
        killtimer.unref();

        // Не принимать новые запросы
        server.close();

        // Сообщить основному процессу — он получит 'disconnect' и forkнет нового воркера
        cluster.worker.disconnect();

        // Попробовать ответить ошибкой инициатору запроса
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end('Oops, there was a problem!\n');
      } catch (er2) {
        console.error(`Error sending 500! ${er2.stack}`);
      }
    });

    // req и res созданы до домена — добавляем явно (см. неявное и явное связывание ниже)
    d.add(req);
    d.add(res);

    d.run(() => {
      handleRequest(req, res);
    });
  });
  server.listen(PORT);
}

// Упрощённый пример маршрутизации; здесь — ваша логика
function handleRequest(req, res) {
  switch (req.url) {
    case '/error':
      setTimeout(() => {
        flerb.bark();
      }, timeout);
      break;
    default:
      res.end('ok');
  }
}
```

## Дополнительные поля объектов `Error`

<!-- type=misc -->

Когда объект `Error` проходит через домен, к нему добавляются поля:

* `error.domain` — домен, который первым обработал ошибку.
* `error.domainEmitter` — эмиттер, сгенерировавший событие `'error'` с этим объектом.
* `error.domainBound` — функция обратного вызова, привязанная к домену и получившая ошибку первым аргументом.
* `error.domainThrown` — булево значение: ошибка была выброшена, испущена как событие или передана в привязанный колбэк.

## Неявное связывание

<!--type=misc-->

Если домены используются, все **новые** объекты `EventEmitter` (включая Stream, запросы, ответы и т.д.)
неявно привязываются к активному домену в момент создания.

Кроме того, колбэки для низкоуровневых запросов цикла событий (например `fs.open()` и других с колбэками)
автоматически привязываются к активному домену. Если они выбрасывают исключение, домен перехватывает ошибку.

Чтобы не раздувать память, сами объекты `Domain` не добавляются неявно дочерними к активному домену —
иначе легко помешать сборке мусора для объектов запроса и ответа.

Чтобы вкладывать объекты `Domain` в родительский `Domain`, их нужно добавлять явно.

Неявное связывание направляет выброшенные ошибки и события `'error'` в событие `'error'` домена,
но **не** регистрирует `EventEmitter` на домене. Неявное связывание обрабатывает только выброшенные
ошибки и события `'error`.

## Явное связывание

<!--type=misc-->

Иногда активный домен не тот, который нужен конкретному эмиттеру. Или эмиттер создан в одном домене,
а должен быть привязан к другому.

Например, для HTTP-сервера можно использовать один домен, а для каждого запроса — отдельный.

Это делается явным связыванием.

```js
// Верхнеуровневый домен для сервера
const domain = require('node:domain');
const http = require('node:http');
const serverDomain = domain.create();

serverDomain.run(() => {
  // Сервер создаётся в области serverDomain
  http.createServer((req, res) => {
    // req и res тоже в области serverDomain,
    // но для каждого запроса удобнее свой домен — создаём сразу и добавляем req/res
    const reqd = domain.create();
    reqd.add(req);
    reqd.add(res);
    reqd.on('error', (er) => {
      console.error('Error', er, req.url);
      try {
        res.writeHead(500);
        res.end('Error occurred, sorry.');
      } catch (er2) {
        console.error('Error sending 500', er2, req.url);
      }
    });
  }).listen(1337);
});
```

## `domain.create()`

* Возвращает: [`<Domain>`](domain.md)

## Класс: `Domain`

* Extends: [`<EventEmitter>`](events.md#class-eventemitter)

Класс `Domain` инкапсулирует маршрутизацию ошибок и необработанных исключений к активному объекту `Domain`.

Чтобы обрабатывать перехваченные ошибки, подпишитесь на событие `'error'`.

### `domain.members`

* Тип: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

Массив эмиттеров, явно добавленных в домен.

### `domain.add(emitter)`

<!-- YAML
changes:
  - version: v9.3.0
    pr-url: https://github.com/nodejs/node/pull/16222
    description: No longer accepts timer objects.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v9.3.0 | Больше не принимает объекты таймера. |

* `emitter` [`<EventEmitter>`](events.md#class-eventemitter) эмиттер, добавляемый в домен

Явно добавляет эмиттер в домен. Если обработчики эмиттера выбрасывают ошибку или эмиттер генерирует `'error'`,
это маршрутизируется в `'error'` домена, как при неявном связывании.

Если `EventEmitter` уже был привязан к домену, он отвязывается от того и привязывается к этому.

### `domain.bind(callback)`

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция обратного вызова
* Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) обёрнутая функция

Возвращаемая функция оборачивает переданный колбэк. При её вызове выброшенные ошибки направляются
в событие `'error'` домена.

```js
const d = domain.create();

function readSomeFile(filename, cb) {
  fs.readFile(filename, 'utf8', d.bind((er, data) => {
    // Если здесь выбросить исключение, его получит домен.
    return cb(er, data ? JSON.parse(data) : null);
  }));
}

d.on('error', (er) => {
  // Ошибка где-то возникла; если выбросить её сейчас — упадёт процесс со стеком.
});
```

### `domain.enter()`

Метод `enter()` — внутренняя часть реализации `run()`, `bind()` и `intercept()`: задаёт активный домен.
Устанавливает `domain.active` и `process.domain` на этот домен и помещает домен в стек доменов
(см. [`domain.exit()`](#domainexit)). Вызов `enter()` ограничивает начало цепочки асинхронных вызовов и операций ввода-вывода,
привязанных к домену.

`enter()` меняет только активный домен, не сам объект домена. `enter()` и `exit()` можно вызывать
произвольное число раз для одного домена.

### `domain.exit()`

Метод `exit()` выходит из текущего домена, снимая его со стека. При переключении на другую цепочку
асинхронных вызовов важно выйти из текущего домена. Вызов `exit()` ограничивает конец или прерывание
цепочки асинхронных вызовов и ввода-вывода, привязанной к домену.

Если к текущему контексту привязано несколько вложенных доменов, `exit()` выходит из всех вложенных
в этот домен.

`exit()` меняет только активный домен, не сам объект. `enter()` и `exit()` можно вызывать произвольное
число раз для одного домена.

### `domain.intercept(callback)`

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция обратного вызова
* Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) перехватывающая функция

Почти то же, что [`domain.bind(callback)`](#domainbindcallback), но помимо перехвата выброшенных ошибок перехватывает
объекты [`Error`](errors.md#class-error), переданные первым аргументом в функцию.

Типичный шаблон `if (err) return callback(err);` можно заменить одним обработчиком ошибок в одном месте.

```js
const d = domain.create();

function readSomeFile(filename, cb) {
  fs.readFile(filename, 'utf8', d.intercept((data) => {
    // Первый аргумент (ошибка) в колбэк не передаётся — он перехватывается доменом.

    // Если здесь выбросить исключение, его обработает домен,
    // и логику ошибок можно сосредоточить в одном обработчике 'error'.
    return cb(null, JSON.parse(data));
  }));
}

d.on('error', (er) => {
  // Ошибка где-то возникла; если выбросить её сейчас — упадёт процесс со стеком.
});
```

### `domain.remove(emitter)`

* `emitter` [`<EventEmitter>`](events.md#class-eventemitter) эмиттер, удаляемый из домена

Противоположность [`domain.add(emitter)`](#domainaddemitter). Снимает обработку домена с указанного эмиттера.

### `domain.run(fn[, ...args])`

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Выполняет переданную функцию в контексте домена, неявно связывая все эмиттеры событий, таймеры и низкоуровневые
запросы, созданные в этом контексте. Опционально в функцию передаются аргументы.

Это базовый способ использования домена.

```js
const domain = require('node:domain');
const fs = require('node:fs');
const d = domain.create();
d.on('error', (er) => {
  console.error('Caught error!', er);
});
d.run(() => {
  process.nextTick(() => {
    setTimeout(() => { // имитация асинхронных операций
      fs.open('non-existent file', 'r', (er, fd) => {
        if (er) throw er;
        // дальше...
      });
    }, 100);
  });
});
```

В этом примере сработает обработчик `d.on('error')`, а не аварийное завершение.

## Домены и промисы

Начиная с Node.js 8.0.0, обработчики промисов выполняются в том домене, в котором был вызван `.then()` или `.catch()`:

```js
const d1 = domain.create();
const d2 = domain.create();

let p;
d1.run(() => {
  p = Promise.resolve(42);
});

d2.run(() => {
  p.then((v) => {
    // выполняется в d2
  });
});
```

Колбэк можно привязать к конкретному домену через [`domain.bind(callback)`](#domainbindcallback):

```js
const d1 = domain.create();
const d2 = domain.create();

let p;
d1.run(() => {
  p = Promise.resolve(42);
});

d2.run(() => {
  p.then(p.domain.bind((v) => {
    // выполняется в d1
  }));
});
```

Домены **не** подменяют механизмы обработки ошибок промисов: для необработанных отклонений `Promise` событие `'error'` **не** генерируется.

[`Error`]: errors.md#class-error
[`domain.add(emitter)`]: #domainaddemitter
[`domain.bind(callback)`]: #domainbindcallback
[`domain.exit()`]: #domainexit
[`throw`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw
