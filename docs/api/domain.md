---
title: Domain
description: Домены предоставляют возможность обрабатывать несколько различных операций ввода-вывода как единую группу
---

# Домен

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/domain.html)

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

**Этот модуль находится в процессе депривации.** Как только будет завершена разработка API замены, этот модуль будет полностью деприватизирован. У большинства разработчиков не должно быть причин использовать этот модуль. Пользователи, которым абсолютно необходима функциональность, предоставляемая доменами, могут использовать его в настоящее время, но должны ожидать, что в будущем им придется перейти на другое решение.

Домены предоставляют возможность обрабатывать несколько различных операций ввода-вывода как единую группу. Если любой из эмиттеров событий или обратных вызовов, зарегистрированных в домене, выдает событие `'error'` или выбрасывает ошибку, то объект домена будет уведомлен, а не потеряет контекст ошибки в обработчике `process.on('uncaughtException')` или заставит программу немедленно завершиться с кодом ошибки.

## Предупреждение: Не игнорируйте ошибки\!

Обработчики ошибок домена не заменяют закрытие процесса при возникновении ошибки.

По самой природе того, как [`throw`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw) работает в JavaScript, почти никогда нет никакого способа безопасно "подхватить то, на чем остановились", без утечки ссылок или создания какого-то другого неопределенного хрупкого состояния.

Самый безопасный способ отреагировать на брошенную ошибку - это завершить процесс. Конечно, в обычном веб-сервере может быть много открытых соединений, и нецелесообразно внезапно закрывать их из-за того, что ошибка была спровоцирована кем-то другим.

Лучший подход - послать ответ об ошибке на запрос, который вызвал ошибку, а остальным позволить завершить работу в обычное время и прекратить прослушивание новых запросов в этом рабочем.

Таким образом, использование `domain` идет рука об руку с модулем кластера, поскольку основной процесс может форкнуть новый рабочий, когда рабочий столкнулся с ошибкой. Для программ Node.js, которые масштабируются на несколько машин, завершающий прокси-сервер или реестр сервисов может принять к сведению сбой и отреагировать соответствующим образом.

Например, это не очень хорошая идея:

```js title="ПРЕДУПРЕЖДЕНИЕ! ПЛОХАЯ ИДЕЯ!"
const d = require('node:domain').create();
d.on('error', (er) => {
    // Ошибка не приведет к краху процесса, но то, что она делает, еще хуже!
    // Хотя мы предотвратили резкий перезапуск процесса, мы теряем
    // много ресурсов, если это когда-нибудь произойдет.
    // Это не лучше, чем process.on('uncaughtException')!
    console.log(`ошибка, но хорошо ${er.message}`);
});
d.run(() => {
    require('node:http')
        .createServer((req, res) => {
            handleRequest(req, res);
        })
        .listen(PORT);
});
```

Используя контекст домена, и устойчивость разделения нашей программы на несколько рабочих процессов, мы можем реагировать более адекватно, и обрабатывать ошибки с гораздо большей безопасностью.

```js title="Намного лучше!"
const cluster = require('node:cluster');
const PORT = +process.env.PORT || 1337;

if (cluster.isPrimary) {
    // В более реалистичном сценарии будет более 2 рабочих,
    // и, возможно, не помещать основной и рабочий в один файл.
    //
    // Можно также немного усложнить ведение журнала и
    // реализовать любую пользовательскую логику, необходимую для предотвращения DoS
    // атак и другого плохого поведения.
    //
    // См. опции в документации по кластеру.
    //
    // Главное, что первичный делает очень мало,
    // повышая нашу устойчивость к неожиданным ошибкам.

    cluster.fork();
    cluster.fork();

    cluster.on('disconnect', (worker) => {
        console.error('disconnect!');
        cluster.fork();
    });
} else {
    // рабочий
    //
    // Здесь мы размещаем наши ошибки!

    const domain = require('node:domain');

    // См. документацию по кластеру для получения более подробной информации об использовании
    // рабочих процессов для обслуживания запросов. Как это работает, предостережения и т.д.

    const server = require('node:http').createServer(
        (req, res) => {
            const d = domain.create();
            d.on('error', (er) => {
                console.error(`error ${er.stack}`);

                // Мы на опасной территории!
                // По определению, произошло что-то неожиданное,
                // чего мы, вероятно, не хотели.
                // Теперь может произойти все, что угодно! Будьте очень осторожны!

                try {
                    // Убедитесь, что мы закрылись в течение 30 секунд
                    const killtimer = setTimeout(() => {
                        process.exit(1);
                    }, 30000);
                    // Но не держите процесс открытым только для этого!
                    killtimer.unref();

                    // Прекратите принимать новые запросы.
                    server.close();

                    // Сообщите первичному процессу, что мы мертвы. Это вызовет
                    // 'disconnect' в первичном кластере, после чего он запустит
                    // новый рабочий.
                    cluster.worker.disconnect();

                    // Попытаемся отправить ошибку на запрос, который вызвал проблему
                    res.statusCode = 500;
                    res.setHeader(
                        'content-type',
                        'text/plain'
                    );
                    res.end('Упс, возникла проблема!\n');
                } catch (er2) {
                    // Ну что ж, в данный момент мы мало что можем сделать.
                    console.error(
                        `Ошибка отправки 500! ${er2.stack}`
                    );
                }
            });

            // Поскольку req и res были созданы до существования этого домена,
            // нам нужно явно добавить их.
            // См. объяснение неявного и явного связывания ниже.
            d.add(req);
            d.add(res);

            // Теперь запустите функцию-обработчик в домене.
            d.run(() => {
                handleRequest(req, res);
            });
        }
    );
    server.listen(PORT);
}

// Эта часть не важна. Просто пример маршрутизации.
// Поместите сюда причудливую логику приложения.
function handleRequest(req, res) {
    switch (req.url) {
        case '/error':
            // Мы делаем некоторые асинхронные действия, а затем...
            setTimeout(() => {
                // Упс!
                flerb.bark();
            }, timeout);
            break;
        default:
            res.end('ok');
    }
}
```

## Дополнения к объектам `Error`

Каждый раз, когда объект `Error` направляется через домен, к нему добавляется несколько дополнительных полей.

-   `error.domain` Домен, который первым обработал ошибку.
-   `error.domainEmitter` Эмиттер события, который испустил событие `'error'` с объектом ошибки.
-   `error.domainBound` Функция обратного вызова, которая была привязана к домену и передала ошибку в качестве первого аргумента.
-   `error.domainThrown` Булево значение, указывающее, была ли ошибка брошена, испущена или передана связанной функции обратного вызова.

## Неявное связывание

Если домены используются, то все **новые** объекты `EventEmitter` (включая объекты Stream, запросы, ответы и т.д.) будут неявно привязаны к активному домену в момент их создания.

Кроме того, обратные вызовы, передаваемые низкоуровневым запросам цикла событий (например, `fs.open()` или другим методам, принимающим обратные вызовы), будут автоматически привязаны к активному домену. Если они отбрасываются, то домен перехватывает ошибку.

Во избежание чрезмерного использования памяти, сами объекты `Domain` не добавляются неявно в качестве дочерних объектов активного домена. Если бы это было так, то было бы слишком легко предотвратить правильную сборку мусора для объектов запроса и ответа.

Чтобы вложить объекты `Domain` в качестве дочерних объектов родительского `Domain`, они должны быть явно добавлены.

Неявное связывание направляет брошенные ошибки и события `'error'` в событие `'error'` домена, но не регистрирует `EventEmitter` на `Domain`. Неявное связывание заботится только о выброшенных ошибках и событиях `'error'`.

## Явное связывание

Иногда используемый домен не является тем, который должен использоваться для конкретного эмиттера события. Или, эмиттер события может быть создан в контексте одного домена, но вместо этого должен быть привязан к другому домену.

Например, для HTTP-сервера может использоваться один домен, но, возможно, мы хотели бы иметь отдельный домен для каждого запроса.

Это возможно с помощью явного связывания.

```js
// Создаем домен верхнего уровня для сервера
const domain = require('node:domain');
const http = require('node:http');
const serverDomain = domain.create();

serverDomain.run(() => {
    // Сервер создается в области видимости serverDomain
    http.createServer((req, res) => {
        // Req и res также создаются в области видимости serverDomain
        // однако, мы бы предпочли иметь отдельный домен для каждого запроса.
        // Создайте его первым делом и добавьте в него req и res.
        const reqd = domain.create();
        reqd.add(req);
        reqd.add(res);
        reqd.on('error', (er) => {
            console.error('Error', er, req.url);
            try {
                res.writeHead(500);
                res.end('Произошла ошибка, извините.');
            } catch (er2) {
                console.error(
                    'Ошибка отправки 500',
                    er2,
                    req.url
                );
            }
        });
    }).listen(1337);
});
```

## `domain.create()`.

-   Возвращает: {Домен}

## Класс: `Домен`

-   Расширяет: [`<EventEmitter>`](events.md#eventemitter)

Класс `Domain` инкапсулирует функциональность маршрутизации ошибок и не пойманных исключений в активный объект `Domain`.

Для обработки ошибок, которые он ловит, слушайте его событие `'error'`.

### `domain.members`

-   [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

Массив таймеров и эмиттеров событий, которые были явно добавлены в домен.

### `domain.add(emitter)`

-   `emitter` {EventEmitter|Timer} эмиттер или таймер для добавления в домен

Явно добавляет эмиттер в домен. Если обработчики событий, вызванные эмиттером, выдадут ошибку, или если эмиттер выдаст событие `'error'`, оно будет перенаправлено в событие `'error'` домена, как и при неявном связывании.

Это также работает с таймерами, которые возвращаются из [`setInterval()`](timers.md#setintervalcallback-delay-args) и [`setTimeout()`](timers.md#settimeoutcallback-delay-args). Если их функция обратного вызова бросает, она будет поймана обработчиком `'error'` домена.

Если таймер или `EventEmitter` уже был привязан к домену, он будет удален из него и привязан к этому домену.

### `domain.bind(callback)`.

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова
-   Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Связанная функция

Возвращаемая функция будет оберткой вокруг предоставленной функции обратного вызова. При вызове возвращаемой функции все возникающие ошибки будут перенаправлены в событие домена `'error'`.

```js
const d = domain.create();

function readSomeFile(filename, cb) {
    fs.readFile(
        filename,
        'utf8',
        d.bind((er, data) => {
            // Если это бросок, он также будет передан в домен.
            return cb(er, data ? JSON.parse(data) : null);
        })
    );
}

d.on('error', (er) => {
    // Где-то произошла ошибка. Если мы бросим ее сейчас, то программа завершится.
    // с обычным номером строки и сообщением на стеке.
});
```

### `domain.enter()`.

Метод `enter()` используется методами `run()`, `bind()` и `intercept()` для установки активного домена. Он устанавливает `domain.active` и `process.domain` в домен и неявно помещает домен в стек доменов, управляемый модулем domain (подробности о стеке доменов см. в [`domain.exit()`](#domainexit)). Вызов `enter()` отделяет начало цепочки асинхронных вызовов и операций ввода/вывода, связанных с доменом.

Вызов `enter()` изменяет только активный домен, но не изменяет сам домен. `enter()` и `exit()` могут быть вызваны произвольное количество раз на одном домене.

### `domain.exit()`

Метод `exit()` завершает работу текущего домена, вычеркивая его из стека доменов. Каждый раз, когда выполнение переходит в контекст другой цепочки асинхронных вызовов, важно убедиться, что текущий домен завершен. Вызов `exit()` отделяет либо конец, либо прерывание цепочки асинхронных вызовов и операций ввода-вывода, привязанных к домену.

Если к текущему контексту выполнения привязано несколько вложенных доменов, `exit()` завершит все домены, вложенные в этот домен.

Вызов `exit()` изменяет только активный домен и не изменяет сам домен. `enter()` и `exit()` могут быть вызваны произвольное количество раз на одном домене.

### `domain.intercept(callback)`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова
-   Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Перехваченная функция

Этот метод практически идентичен [`domain.bind(callback)`](#domainbindcallback). Однако, помимо перехвата брошенных ошибок, он также будет перехватывать объекты [`Error`](errors.md#class-error), переданные в качестве первого аргумента функции.

Таким образом, распространенный шаблон `if (err) return callback(err);` может быть заменен одним обработчиком ошибок в одном месте.

```js
const d = domain.create();

function readSomeFile(filename, cb) {
    fs.readFile(
        filename,
        'utf8',
        d.intercept((data) => {
            // Обратите внимание, что первый аргумент никогда не передается в
            // обратный вызов, так как считается, что это аргумент 'Error'
            // и, следовательно, перехватывается доменом.

            // Если произойдет бросок, он также будет передан домену.
            // так что логика обработки ошибки может быть перенесена в событие 'error'
            // событие на домене вместо того, чтобы повторяться по всей
            // в программе.
            return cb(null, JSON.parse(data));
        })
    );
}

d.on('error', (er) => {
    // Где-то произошла ошибка. Если мы бросим ее сейчас, то программа завершится.
    // с обычным номером строки и сообщением на стеке.
});
```

### `domain.remove(emitter)`

-   `emitter` {EventEmitter|Timer} эмиттер или таймер, который должен быть удален из домена.

Противоположность [`domain.add(emitter)`](#domainaddemitter). Удаляет обработку домена с указанного эмиттера.

### `domain.run(fn[, ...args])`

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `...args` {любая}

Запускает указанную функцию в контексте домена, неявно связывая все эмиттеры событий, таймеры и низкоуровневые запросы, созданные в этом контексте. По желанию функции могут быть переданы аргументы.

Это самый простой способ использования домена.

```js
const domain = require('node:domain');
const fs = require('node:fs');
const d = domain.create();
d.on('error', (er) => {
    console.error('Caught error!', er);
});
d.run(() => {
    process.nextTick(() => {
        setTimeout(() => {
            // Имитация различных асинхронных процессов
            fs.open(
                'несуществующий файл',
                'r',
                (er, fd) => {
                    if (er) throw er;
                    // продолжаем...
                }
            );
        }, 100);
    });
});
```

В этом примере сработает обработчик `d.on('error')`, а не аварийно завершит программу.

## Домены и обещания

Начиная с Node.js 8.0.0, обработчики обещаний запускаются внутри домена, в котором был сделан вызов `.then()` или `.catch()`:

``js const d1 = domain.create(); const d2 = domain.create();

let p; d1.run(() => { p = Promise.resolve(42); });

d2.run(() => { p.then((v) => { // выполняется в d2 }); });

````


Обратный вызов может быть привязан к определенному домену с помощью [`domain.bind(callback)`](#domainbindcallback):


``` js
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
````

Домены не будут вмешиваться в механизмы обработки ошибок для обещаний. Другими словами, для необработанных отказов `Promise` не будет выдаваться событие `'error'`.

