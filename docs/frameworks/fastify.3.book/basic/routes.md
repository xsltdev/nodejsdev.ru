---
description: рассмотрим все возможности, которые предлагает Fastify для определения новых конечных точек и управления приложением
---

# Работа с маршрутами

Приложения не могли бы существовать без маршрутов. Маршруты - это двери к тем клиентам, которые должны использовать ваш API. В этой главе мы приведем больше примеров, сосредоточившись на том, как стать более опытным в управлении маршрутами и отслеживании всех наших конечных точек. Мы рассмотрим все возможности, которые предлагает Fastify для определения новых конечных точек и управления приложением, не доставляя вам головной боли.

Стоит отметить, что Fastify поддерживает обработчики async/await из коробки, и очень важно понимать их последствия. Вы рассмотрите разницу между обработчиками sync и async и узнаете, как избежать основных подводных камней. Кроме того, мы узнаем, как обрабатывать параметры URL, тело HTTP-запроса и строки запроса.

Наконец, вы поймете, как работает маршрутизатор в Fastify, и сможете контролировать маршрутизацию к конечной точке вашего приложения как никогда раньше.

В этой главе мы рассмотрим следующие темы:

-   Объявление конечных точек API и управление ошибками
-   Маршрутизация к конечной точке
-   Чтение входных данных клиента
-   Управление областью действия маршрута
-   Добавление новых поведений в маршруты

## Технические требования {#technical-requirements}

Как уже упоминалось в предыдущих главах, вам понадобится следующее:

-   Работающая установка Node.js 18
-   Текстовый редактор для отработки кода примера
-   HTTP-клиент для тестирования кода, например CURL или Postman.

Все фрагменты в этой главе доступны на [GitHub](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%203).

## Объявление конечных точек API и управление ошибками {#declaring-api-endpoints-and-managing-the-errors}

Конечная точка - это интерфейс, который ваш сервер открывает для внешнего доступа, и каждый клиент с координатами маршрута может вызвать его для выполнения бизнес-логики приложения.

Fastify позволяет использовать ту архитектуру программного обеспечения, которая вам больше всего нравится. Фактически, этот фреймворк не ограничивает вас в использовании **Representation State Transfer (REST)**, **GraphQL** или простых **Application Programming Interfaces (API)**. Первые две архитектуры стандартизируют следующее:

-   Конечные точки приложения: Стандарт показывает, как раскрыть вашу бизнес-логику, определив набор маршрутов.
-   Серверное взаимодействие: Это дает представление о том, как следует определять вход/выход.

В этой главе мы создадим простые **API** конечные точки с интерфейсами ввода/вывода JSON. Это означает, что у нас есть свобода в определении внутреннего стандарта для нашего приложения; такой выбор позволит нам сосредоточиться на использовании фреймворка Fastify, а не следовать стандартной архитектуре.

В любом случае, в [Главе 7](../real-project/restful-api.md) мы узнаем, как построить **REST** приложение, а в [Главе 14](../advanced/graphql.md) мы узнаем больше об использовании **GraphQL** с Fastify.

!!!note "Слишком много стандартов"

    Обратите внимание, что существует также стандарт **JSON:API**: <https://jsonapi.org/>. Кроме того, Fastify позволяет использовать эту архитектуру, но эта тема не будет обсуждаться в данной книге. Загляните на <https://backend.cafe/>, чтобы найти больше информации о Fastify и этой книге!

В следующих разделах мы предполагаем, что вы уже понимаете анатомию HTTP-запроса и различия между его частями, такими как параметры запроса и тело запроса. Отличным ресурсом для повторения этих понятий является [сайт Mozilla](https://developer.mozilla.org/docs/Web/HTTP/Messages).

### Варианты деклараций {#declaration-variants}

В предыдущих главах мы узнали, как создать сервер Fastify, поэтому мы будем считать, что вы можете создать новый проект (или, если у вас возникли трудности, вы можете прочитать [Глава 1](./what-is-fastify.md)).

В той же главе мы указали на два синтаксиса, которые можно использовать для определения маршрутов:

-   Общее объявление, используя `app.route(routeOptions)`.
-   Сокращенный синтаксис: `app.<HTTP method>(url[, routeOptions], handler)`.

Второй вариант более выразителен и удобен для чтения, когда нужно создать небольшой набор конечных точек, тогда как первый крайне полезен для добавления автоматизации и определения очень похожих маршрутов. Оба объявления открывают одни и те же параметры, но это не только вопрос предпочтения. Необходимость выбора одного из них может негативно сказаться на масштабировании вашей кодовой базы. В этой главе мы узнаем, как избежать этого подводного камня и как выбрать лучший синтаксис в зависимости от ваших потребностей.

Прежде чем приступить к программированию, мы получим краткий обзор объекта `routeOptions`, который мы будем использовать в следующих разделах для развития наших базовых знаний, к которым вы сможете обращаться в своих будущих проектах.

### Опции маршрута {#the-route-options}

Прежде чем приступить к дальнейшему изучению маршрутов приложения, мы должны ознакомиться со свойствами `routeOptions` (обратите внимание, что некоторые из них будут рассмотрены в следующих главах).

Опции перечислены следующим образом:

-   `method`: Это HTTP-метод, который нужно отобразить.
-   `url`: Это конечная точка, которая будет принимать входящие запросы.
-   `handler`: Это бизнес-логика маршрута. Мы уже встречались с этим свойством в предыдущих главах.
-   `logLevel`: Это определенный уровень журнала для одного маршрута. Насколько полезным может быть это свойство, мы узнаем в [главе 11](../real-project/logging.md).
-   `logSerializer`: Позволяет настроить вывод логов для одного маршрута, в сочетании с предыдущей опцией.
-   `bodyLimit`: Ограничивает полезную нагрузку запроса, чтобы избежать возможного злоупотребления вашими конечными точками. Это должно быть целое число, представляющее собой максимальное количество принимаемых байт, которое перезаписывает настройки корневого экземпляра.
-   `constraints`: Эта опция улучшает маршрутизацию конечной точки. Подробнее о том, как использовать эту опцию, мы узнаем в разделе [Маршрутизация к конечной точке](#routing-to-the-endpoint).
-   `errorHandler`: Это свойство принимает специальную функцию-обработчик для настройки обработки ошибок для одного маршрута. В следующем разделе будет показана эта конфигурация.
-   `config`: Это свойство позволяет специализировать конечную точку, добавляя новые поведения.
-   `prefixTrailingSlash`: Эта опция управляет некоторыми специальными функциями при регистрации маршрута плагинами. Мы поговорим об этом в разделе [Маршрутизация к конечной точке](#routing-to-the-endpoint).
-   `exposeHeadRoute`: Это булево значение добавляет или удаляет маршрут `HEAD` при регистрации маршрута `GET`. По умолчанию он имеет значение `true`.

Далее, существует множество узкоспециализированных опций для управления проверкой запросов: `schema`, `attachValidation`, `validatorCompiler`, `serializerCompiler`, и `schemaErrorFormatter`. Все эти настройки будут рассмотрены в [главе 5](./validation-serialization.md).

Наконец, вы должны знать, что каждый маршрут может иметь дополнительные хуки, которые будут выполняться только для самого маршрута. Вы можете просто использовать имена хуков `info` и объект `routeOptions` для их подключения. Пример мы рассмотрим в конце этой главы. Хуки те же, что мы перечислили в [Глава 1](./what-is-fastify.md): `onRequest`, `preParsing`, `preValidation`, `preHandler`, `preSerialization`, `onSend` и `onResponse`, и они будут действовать во время **жизненного цикла запроса**.

Пришло время увидеть эти опции в действии, так что давайте начнем определять конечные точки!

### Массовая загрузка маршрутов {#bulk-routes-loading}

Общее объявление позволяет воспользоваться преимуществами определения автоматизации маршрутов. Эта техника направлена на разделение исходного кода на небольшие фрагменты, что делает их более управляемыми при росте приложения.

Давайте начнем с понимания возможностей этой функции:

```js
const routes = [
    {
        method: 'POST',
        url: '/cat',
        handler: function cat(request, reply) {
            reply.send('cat');
        },
    },
    {
        method: 'GET',
        url: '/dog',
        handler: function dog(request, reply) {
            reply.send('dog');
        },
    },
];
routes.forEach((routeOptions) => {
    app.route(routeOptions);
});
```

Мы определили массив `routes`, каждый элемент которого является объектом Fastify `routeOptions`. Итерируя переменную `routes`, мы можем добавлять маршруты программно. Это будет полезно, если мы разделим массив по контексту на `cat.cjs` и `dog.cjs`. Здесь вы можете увидеть пример кода `cat.cjs`:

```js
module.exports = [
    {
        method: 'POST',
        url: '/cat',
        handler: function cat(request, reply) {
            reply.send('cat');
        },
    },
];
```

Проделав то же самое с конфигурацией конечной точки `/dog`, можно изменить настройку сервера следующим образом:

```js
const catRoutes = require('./cat.cjs');
const dogRoutes = require('./dog.cjs');
catRoutes.forEach(loadRoute);
dogRoutes.forEach(loadRoute);
function loadRoute(routeOptions) {
    app.route(routeOptions);
}
```

Как видите, загрузка маршрутов выглядит более точной и понятной. Более того, такая организация кода дает нам возможность легко разделить код и позволить каждому контексту расти в своем темпе, снижая риск создания огромных файлов, которые будет трудно читать и поддерживать.

Мы видели, как с помощью общего метода `app.route()` можно настроить приложение с множеством маршрутов, централизовав загрузку в определении сервера и переместив логику конечных точек в специальный файл, чтобы улучшить читаемость проекта.

Еще один способ улучшить кодовую базу - использовать `async`/`await` в обработчике маршрута, который Fastify поддерживает из коробки. Давайте обсудим это далее.

### Синхронные и асинхронные обработчики {#synchronous-and-asynchronous-handlers}

В [главе 1](./what-is-fastify.md) мы рассмотрели основную роль обработчика маршрутов и то, как он управляет компонентом `Reply`.

Кратко напомним, что существует два основных синтаксиса, которые мы можем использовать. Синтаксис sync использует обратные вызовы для управления асинхронным кодом, и он должен вызывать `reply.send()` для выполнения HTTP-запроса:

```js
function syncHandler(request, reply) {
    readDb(function callbackOne(err, data1) {
        readDb(function callbackTwo(err, data2) {
            reply.send(
                `read from db ${data1} and ${data2}`
            );
        });
    });
}
```

В этом примере мы имитируем два асинхронных вызова функции readDb. Как вы можете себе представить, добавление все большего количества асинхронных операций ввода-вывода, таких как чтение файлов или обращение к базе данных, может сделать исходный текст быстро нечитаемым, с опасностью попасть в ад обратных вызовов (вы можете [прочитать подробнее](http://callbackhell.com/) об этом).

Вы можете переписать предыдущий пример, используя второй синтаксис для определения обработчика маршрута, с помощью асинхронной функции:

```js
async function asyncHandler(request, reply) {
    const data1 = await readDb();
    const data2 = await readDb();
    return `read from db ${data1} and ${data2}`;
}
```

Как видите, независимо от того, сколько задач async нужно запустить в вашей конечной точке, тело функции можно читать последовательно, что делает его гораздо более удобным для чтения. Это не единственный синтаксис, поддерживаемый async-обработчиком, есть и другие крайние случаи, с которыми вы можете столкнуться.

### Ответ - это промис {#reply-is-a-promise}

В обработчике функции `async` крайне не рекомендуется вызывать `reply.send()` для отправки ответа обратно клиенту. Fastify знает, что вы можете оказаться в такой ситуации из-за обновления устаревшего кода. В этом случае решением будет возврат объекта `reply`. Вот быстрый сценарий из реального (плохого) мира:

```js
async function newEndpoint(request, reply) {
    if (request.body.type === 'old') {
        // [1]
        oldEndpoint(request, reply);
        return reply; // [2]
    } else {
        const newData = await something(request.body);
        return { done: newData };
    }
}
```

В этом примере конечной точки оператор `if` в `[1]` запускает бизнес-логику `oldEndpoint`, которая управляет объектом `reply` по-другому, чем в случае `else`. Фактически, обработчик `oldEndpoint` был реализован в стиле обратного вызова. Итак, как же сообщить Fastify, что HTTP-ответ был передан другой функции? Нужно просто вернуть объект `reply` из `[2]`! Компонент `Reply` представляет собой интерфейс `thenable`. Это означает, что он реализует интерфейс `.then()` точно так же, как и объект `Promise`! Его возврат подобен созданию промиса, который будет выполнен только после выполнения метода `.send()`.

Удобство чтения и гибкость асинхронных обработчиков - не единственные преимущества: как насчет ошибок? Ошибки могут возникать во время выполнения приложения, и Fastify помогает нам справиться с ними с помощью широко используемых умолчаний.

### Как отвечать на ошибки {#how-to-reply-with-errors}

Как правило, в Fastify ошибка может быть **отправлена**, если функция обработчика синхронна, или **отброшена**, если обработчик асинхронен. Давайте проверим это на практике:

```js
function syncHandler(request, reply) {
    const myErr = new Error('this is a 500 error');
    reply.send(myErr); // [1]
}
async function ayncHandler(request, reply) {
    const myErr = new Error('this is a 500 error');
    throw myErr; // [2]
}
async function ayncHandlerCatched(request, reply) {
    try {
        await ayncHandler(request, reply);
    } catch (err) {
        // [3]
        this.log.error(err);
        reply.status(200);
        return { success: false };
    }
}
```

Как видите, на первый взгляд, различия минимальны: в `[1]` метод `send` принимает объект Node.js `Error` с пользовательским сообщением. Пример `[2]` очень похож, но мы бросаем ошибку. Пример `[3]` показывает, как можно управлять ошибками с помощью блоков `try`/`catch` и выбирать ответ с HTTP `200` `success` в любом случае!

Теперь, если мы попробуем добавить управление ошибками в пример `syncHandler`, как было показано ранее, функция синхронизации станет выглядеть следующим образом:

```js
function syncHandler(request, reply) {
    readDb(function callbackOne(err, data1) {
        if (err) {
            reply.send(err);
            return;
        }
        readDb(function callbackTwo(err, data2) {
            if (err) {
                reply.send(err);
                return;
            }
            reply.send(
                `read from db ${data1} and ${data2}`
            );
        });
    });
}
```

Стиль `callback` стремится быть длинным и трудночитаемым. Вместо этого функция `asyncHandler`, показанная в блоке кода раздела [«Синхронные и асинхронные»](#synchronous-and-asynchronous-handlers), не нуждается в каких-либо обновлениях. Это связано с тем, что выброшенной ошибкой будет управлять Fastify, который отправит ответ на ошибку клиенту.

До сих пор мы видели, как отвечать на HTTP-запрос с помощью объекта Node.js `Error`. Это действие отправляет обратно полезную нагрузку JSON с ответом с кодом состояния 500, если вы не установили его с помощью метода `reply.code()`, который мы рассматривали в [Глава 1](./what-is-fastify.md).

Вывод JSON по умолчанию выглядит следующим образом:

```json
{
    "statusCode": 500,
    "error": "Internal Server Error",
    "message": "app error"
}
```

Код `new Error('app error')` создает объект ошибки, который выдает предыдущее сообщение.

В Fastify есть множество способов настроить ответ на ошибку, и обычно это зависит от того, насколько вы торопитесь. Варианты перечислены ниже:

-   Принять формат вывода Fastify по умолчанию: Это решение готово к использованию и оптимизировано для ускорения сериализации полезной нагрузки ошибки. Оно отлично подходит для быстрого прототипирования.
-   Настроить обработчик ошибок: Эта функция дает вам полный контроль над ошибками приложения.
-   Пользовательское управление ответами: Этот случай включает вызов `reply.code(500).send(myJsonError)`, обеспечивающий вывод JSON.

Теперь мы можем лучше изучить эти возможности.

Принять стандартный вывод ошибок Fastify очень просто, поскольку вам нужно **выбросить** или **отправить** объект `Error`. Чтобы настроить ответ тела, вы можете изменить некоторые поля объекта `Error`:

```js
const err = new Error('app error') // [1]
err.code = ‹ERR-001› // [2]
err.statusCode = 400 // [3]
```

В этом примере конфигурации показано следующее:

1.  Строковое сообщение, которое предоставляется в конструкторе `Error` в качестве поля `message`.
2.  Необязательное поле `code` к тому же ключу вывода JSON.
3.  Параметр `statusCode`, который изменит код статуса HTTP-ответа и строку `error`. Строка вывода задается модулем Node.js `http.STATUS_CODES` по умолчанию.

В результате выполнения предыдущего примера будет получен следующий результат:

```json
{
    "statusCode": 400,
    "code": "ERR001",
    "error": "Bad Request",
    "message": "app error"
}
```

Такая полезная нагрузка может быть неинформативной для клиента, поскольку содержит единственную ошибку. Поэтому, если мы хотим изменить вывод на массив ошибок, когда происходит более одной ошибки, например, при валидации формы, или если вам нужно изменить формат вывода, чтобы адаптировать его к вашей экосистеме API, вы должны знать компонент `ErrorHandler`:

```js
app.setErrorHandler(function customErrorHandler(
    error,
    request,
    reply
) {
    request.log.error(error);
    reply.send({ ops: error.message });
});
```

Обработчик ошибок - это функция, которая выполняется всякий раз, когда объект `Error` или JSON **выбрасывается** или _отправляется_; это означает, что обработчик ошибок один и тот же, независимо от реализации маршрута. Ранее мы сказали, что JSON является **выброшенным**: поверьте мне, и мы объясним, что это значит, позже в этом разделе.

Интерфейс обработчика ошибок имеет три параметра:

-   Первый - это объект, который был выброшен, или объект `Error`, который был отправлен.
-   Второй - компонент `Request`, в котором возникла проблема.
-   Третий - объект `Reply` для выполнения HTTP-запроса в качестве стандартного обработчика маршрута.

Функция обработчика ошибок может быть асинхронной или простой. Что касается обработчика маршрута, то в случае асинхронной функции вы должны вернуть полезную нагрузку ответа, а в случае синхронной реализации - вызвать `reply.send()`. В этом контексте нельзя бросать или отправлять объект экземпляра `Error`. Это создаст бесконечный цикл, которым управляет Fastify. В этом случае он пропустит ваш собственный обработчик ошибок и вызовет обработчик ошибок родительского диапазона или обработчик по умолчанию, если он не установлен. Вот быстрый пример:

```js
app.register(async function plugin(pluginInstance) {
    pluginInstance.setErrorHandler(function first(
        error,
        request,
        reply
    ) {
        request.log.error(error, 'an error happened');
        reply.status(503).send({ ok: false }); // [4]
    });
    pluginInstance.register(async function childPlugin(
        deep,
        opts
    ) {
        deep.setErrorHandler(async function second(
            error,
            request,
            reply
        ) {
            const canIManageThisError =
                error.code === 'yes, you can'; // [2]
            if (canIManageThisError) {
                reply.code(503);
                return { deal: true };
            }
            throw error; // [3]
        });
        // This route run the deep's error handler
        deep.get('/deepError', () => {
            throw new Error('ops');
        }); // [1]
    });
});
```

В предыдущем фрагменте кода у нас есть функция `plugin`, которая имеет контекст `childPlugin`. Оба этих инкапсулированных контекста имеют по одной пользовательской функции-обработчику ошибок. Если вы попытаетесь запросить `GET /deep` `[1]`, будет выброшена ошибка. Она будет обработана `второй` функцией-обработчиком ошибок, которая решит, обработать ли ее или выбросить повторно `[2]`. Когда ошибка будет повторно выброшена `[3]`, родительская область видимости перехватит ошибку и обработает ее `[4]`. Как видите, вы можете реализовать ряд функций, которые будут обрабатывать подмножество ошибок приложения.

Важно помнить, что при реализации обработчика ошибок необходимо позаботиться о коде статуса ответа, иначе по умолчанию он будет **500 - Server Error**.

Как мы видели в предыдущем примере, обработчик ошибок может быть назначен экземпляру приложения и экземпляру плагина. Это установит обработчик для всех маршрутов в их контексте. Это означает, что обработчик ошибок полностью инкапсулирован, как мы узнали в [главе 2](./plugin-system.md).

Давайте посмотрим на быстрый пример:

```js
async function errorTrigger(request, reply) {
    throw new Error('ops');
}
app.register(async function plugin(pluginInstance) {
    pluginInstance.setErrorHandler(function (
        error,
        request,
        reply
    ) {
        request.log.error(error, 'an error happened');
        reply.status(503).send({ ok: false });
    });
    pluginInstance.get('/customError', errorTrigger); // [1]
});
app.get('/defaultError', errorTrigger); // [2]
```

Мы определили хэндл плохого маршрута, `errorTrigger`, который всегда будет выбрасывать `Error`. Затем мы зарегистрировали два маршрута:

-   Маршрут `GET /customError` `[1]` находится внутри плагина, поэтому он находится в новом контексте Fastify.
-   Корневой экземпляр приложения регистрирует вместо него маршрут `GET /defaultError` `[2]`.

Мы задаем `pluginInstance.setErrorHandler`, поэтому все маршруты, зарегистрированные в этом плагине и его дочерних контекстах, будут использовать вашу пользовательскую функцию обработчика ошибок во время создания плагина. При этом маршруты приложения будут использовать обработчик ошибок по умолчанию, поскольку мы его не настраивали.

На этом этапе, сделав HTTP-запрос к этим конечным точкам, мы получим два разных результата, как и ожидалось:

-   Маршрут `GET /customError` вызывает ошибку, и она управляется пользовательским обработчиком ошибок, поэтому на выходе будет `{"ok":false}`.
-   Конечная точка `GET /defaultError` отвечает в формате JSON по умолчанию Fastify, который был показан в начале этого раздела.

Это еще не конец! В Fastify реализована выдающаяся **гранулярность** для большинства поддерживаемых функций. Это означает, что вы можете установить собственный обработчик ошибок для каждого маршрута!

Давайте добавим новую конечную точку к предыдущему примеру:

```js
app.get('/routeError', {
    handler: errorTrigger,
    errorHandler: async function (error, request, reply) {
        request.log.error(error, 'a route error happened');
        return { routeFail: false };
    },
});
```

Прежде всего, при определении конечной точки мы должны предоставить объект `routeOptions` для установки пользовательского свойства `errorHandler`. Параметр функции такой же, как и у метода `setErrorHandler`. В данном случае мы перешли на асинхронную функцию: как уже говорилось, такой формат тоже поддерживается.

Наконец, последний вариант возврата ошибки - вызов `reply.send()`, как при отправке данных обратно клиенту:

```js
app.get('/manualError', (request, reply) => {
    try {
        const foo = request.param.id.split('-'); // this line
        throws;
        reply.send('I split the id!');
    } catch (error) {
        reply
            .code(500)
            .send({ error: 'I did not split the id!' });
    }
});
```

This is a trivial solution, but you must keep in mind the possibilities Fastify offers you. It is essential to understand that this solution is a managed error, so Fastify is unaware that an error has been caught in your handler. In this case, you must set the HTTP response status code; otherwise, it will be **200 – Success** by default. This is because the route has been executed successfully from the framework’s point of view. In this case, the `errorHandler` property is not performed either. This could impact your application logging and system monitoring, or limit the code you will be able to reuse in your code base, so use it consciously.

In the previous code, we called the `split` function in an `undefined` variable in a synchronous function. This will trigger a `TypeError`. If we omit the `try`/`catch` block, Fastify will handle the error, preventing the server crashing.

Instead, if we moved this implementation error to a callback, the following will be the result:

```js
app.get('/fatalError', (request, reply) => {
    setTimeout(() => {
        const foo = request.param.id.split('-');
        reply.send('I split the id!');
    });
});
```

This will break our server because there is an uncaught exception that no framework can handle. This issue that you might face is typically related to sync handlers.

In this section, we covered many topics; we learned more about route declaration and the differences between sync and async handlers, and how they reply to the clients with an error.

The takeaways can be outlined as follows:

|  | Async handler | Sync handler |
| --- | --- | --- |
| Interface | `async function handler(request, reply) {}` | `Function handler(request,reply) {}` |
| How to reply | Return the payload | Call `reply.send()` |
| Special usage for reply | If you call `reply.send()`, you must return the `reply` object | You can return the reply object safely |
| How to reply with an Error | Throw an error | Call `reply.send(errorInstance)` |
| Special usage for errors | None | You can throw only in the main scope’s handler function |

<center>Figure 3.1 – The differences between the async and sync handlers</center>

Now you have a solid understanding of how to define your endpoints and how to implement the handler functions. You should understand the common pitfalls you might face when writing your business logic, and you have built up the critical sense to choose the best route definition syntax based on your needs.

We are ready to take a break from route handling and move on to an advanced topic: **routing**.

## Routing to the endpoint {#routing-to-the-endpoint}

Routing is the phase where Fastify receives an HTTP request, and it must decide which handler function should fulfill that request. That’s it! It seems simple, but even this phase is optimized to be performant and to speed up your server.

Fastify uses an external module to implement the router logic called [**find-my-way**](https://github.com/delvedor/find-my-way). All its features are exposed through the Fastify interface so that Fastify will benefit from every upgrade to this module. The strength of this router is the algorithm implemented to find the correct handler to execute.

!!!note "The router under the hood"

    You might find it interesting that find-my-way implements the **Radix-tree** data structure, starting from the route’s URLs. The router traverses the tree to find the matched string URL whenever the server receives an HTTP request. Every route, tracked into the tree, carries all the information about the Fastify instance it belongs to.

During the startup of the **application instance**, every route is added to the router. For this reason, Fastify doesn't throw errors if you write the following:

```js
app.get('/', async () => {});
app.get('/', async () => {}); // [1]
```

When you write the same route for the second time, `[1]`, you might expect an error. This will only happen when you execute one of the `ready`, `listen`, or `inject` methods:

```js
app.listen(8080, (err) => {
    app.log.error(err);
});
```

The double route registration will block the server from starting:

```sh
$ node server.mjs
AssertionError [ERR_ASSERTION]: Method 'GET' already declared for
route '/' with constraints '{}'
```

The preceding example shows you the asynchronous nature of Fastify and, in this specific case, how the routes are loaded.

The router has built the Radix-tree carrying the route handler and Fastify’s context. Then, Fastify relies on the context’s immutability. This is why it is not possible to add new routes when the server has started. This might seem like a limitation, but by the end of this chapter, you will see that it is not.

We have seen how the router loads the URL and lookups for the handler to execute, but what happens if it doesn’t find the HTTP request URL?

### The 404 handler {#the-404-handler}

Fastify provides a way to configure a 404 handler. It is like a typical route handler, and it exposes the same interfaces and async or sync logic:

```js
app.setNotFoundHandler(function custom404(request, reply) {
    const payload = {
        message: 'URL not found',
    };
    reply.send(payload);
});
```

Here, we have registered a new handler that always returns the same payload.

By default, the 404 handler replies to the client with the same format as the default error handler:

```json
{
    "message": "Route GET:/ops not found",
    "error": "Not Found",
    "statusCode": 404
}
```

This JSON output keeps the consistency between the two events: the error and the route not found, replying to the client with the same response fields.

As usual, this feature is also encapsulated, so you could set one Not Found handler for each context:

```js
app.register(
    async function plugin(instance, opts) {
        instance.setNotFoundHandler(function html404(
            request,
            reply
        ) {
            reply
                .type('application/html')
                .send(niceHtmlPage);
        });
    },
    { prefix: '/site' }
); // [1]
app.setNotFoundHandler(function custom404(request, reply) {
    reply.send({ not: 'found' });
});
```

In this example, we have set the `custom404` root 404 handler and the plugin instance `html404`. This can be useful when your server manages multiple contents, such as a static website that shows a cute and funny HTML page when an non-existent page is requested, or shows a JSON when a missing API is queried.

The previous code example tells Fastify to search for the handler to execute into the plugin instance when the requested URL starts with the `/site` string. If Fastify doesn’t find a match in this context, it will use the Not Found handler of that context. So, for example, let’s consider the following URLs:

• The <http://localhost:8080/site/foo> URL will be served by the `html404` handler • The <http://localhost:8080/foo> URL will be served by the `custom404` instead

The `prefix` parameter (marked as `[1]` in the previous code block) is mandatory to set multiple 404 handlers; otherwise, Fastify will not start the server, because it doesn’t know when to execute which one, and it will trigger a startup error:

```
Error: Not found handler already set for Fastify instance with prefix:
'/'
```

Another important aspect of the Not Found handling is that it triggers the **request life cycle hooks** registered in the context it belongs to. We got a quick introduction to hooks in [_Chapter 1_](./what-is-fastify.md), and we will further explain this Fastify feature in [_Chapter 4_](./hooks.md).

Here, the takeaway is how do you know if the hook has been triggered by an HTTP request with or without a route handler? The answer is the `is404` flag, which you can check as follows:

```js
app.addHook('onRequest', function hook(
    request,
    reply,
    done
) {
    request.log.info(
        'Is a 404 HTTP request? %s',
        request.is404
    );
    done();
});
```

The `Request` component knows whether the HTTP request is fulfilled by a route handler or by a Not Found one, so you can skip some unnecessary request process into your hook functions, filtering those requests that will not be handled.

So far, you have learned how to manage the response when an URL doesn’t match any of your application endpoints. But what happens if a client hits a 404 handler, due to a wrong trailing slash?

### Router application tuning {#router-application-tuning}

Fastify is highly customizable in every component: the router is one of them. You are going to learn how to tweak the router settings, to make the router more flexible and deal with a client’s common trouble. It is important to understand these settings to anticipate common issues and to build a great set of APIs on the first try!

#### The trailing slash {#the-trailing-slash}

The trailing slash is the `/` character when it is the last character of the URL, query parameter excluded.

Fastify thinks that the `/foo` and `/foo/` URLs are different, and you can register them and let them reply to two completely different outputs:

```js
app.get('/foo', function (request, reply) {
    reply.send('plain foo');
});
app.get('/foo/', function (request, reply) {
    reply.send('foo with trailin slash');
});
```

Often, this interface can be misunderstood by clients. So, you can configure Fastify to treat those URLs as the same entity:

```js
const app = fastify({
    ignoreTrailingSlash: true,
});
```

The `ignoreTrailingSlash` setting forces the Fastify router to ignore the trailing slash for **all the application’s routes**. Because of this, you won’t be able to register the `/foo` and `/foo/` URLs, and you will receive a startup error. Doing so will consume your API, but you will not have to struggle with the 404 errors if the URL has been misprinted with an ending `/` character.

#### Case-insensitive URLs {#case-insensitive-urls}

Another common issue you could face is having to support both the `/fooBar` and `/foobar` URLs as a single endpoint (note the case of the `B` character). As per the trailing slash example, Fastify will manage these routes as two distinct items; in fact, you can register both routes with two different handler functions, unless you set the code in the following way:

```js
const app = fastify({
    caseSensitive: false,
});
```

The `caseSensitive` option will instruct the router to match all your endpoints in lowercase:

```js
app.get('/FOOBAR', function (request, reply) {
    reply.send({
        url: request.url, // [1]
        routeUrl: request.routerPath, // [2]
    });
});
```

The `/FOOBAR` endpoint will reply to all possible combinations, such as `/FooBar`, `/foobar`, `/fooBar`, and more. The handler output will contain both the HTTP request URL, `[1]`, and the route one, `[2]`. These two fields will match the setup without changing them to lowercase.

So, for example, making an HTTP request to the `GET /FoObAr` endpoint will produce the following output:

```json
{
    "url": "/FoObAr",
    "routeUrl": "/FOOBAR"
}
```

Using the case-insensitive URL, matching the setup could look odd. In fact, it is highly discouraged to do so, but we all know that legacy code exists, and every developer must deal with it. Now, if you have to migrate many old endpoints implemented using a case-insensitive router, you know how to do it.

!!!note "The URL’s pathname"

    If you are struggling while choosing whether your endpoint should be named `/fast-car` or `/fast_car`, you should know that a hyphen is broadly used for web page URLs, whereas the underscore is used for API endpoints.

Another situation you might face during a migration is having to support old routes that will be discarded in the future.

#### Rewrite URL {#rewrite-url}

This feature adds the possibility of changing the HTTP’s requested URL before the routing takes place:

```js
const app = fastify({
    rewriteUrl: function rewriteUrl(rawRequest) {
        if (rawRequest.url.startsWith('/api')) {
            return rawRequest.url;
        }
        return `/public/${rawRequest.url}`;
    },
});
```

The `rewriteUrl` parameter accepts an input sync function that must return a string. The returned line will be set as the request URL, and it will be used during the routing process. Note that the function argument is the standard `http.IncomingMessage` class and not the Fastify `Request` component.

This technique could be useful as a URL expander or to avoid redirecting the client with the 302 HTTP response status code.

!!!note "Logging the URL rewrite"

    Unfortunately, the `rewriteUrl` function will not be bound to the Fastify root instance. This means you will not be able to use the `this` keyword in that context. Fastify will log the debug information if the function returns a different URL than the original. In any case, you will be able to use the `app.log` object at your convenience.

We have explored how to make Fastify’s router more flexible in order to support a broad set of use cases that you may encounter in your daily job.

Now, we will learn how to configure the router to be even more granular.

### Registering the same URLs {#registering-the-same-urls}

As we have seen previously, Fastify doesn’t register the same HTTP route path more than once. This is a limit, due to the Fastify router. The router searches the correct handler to execute by matching with the following rules:

-   The request HTTP method
-   The request string URL

The search function must only return one handler; otherwise, Fastify can’t choose which one to execute. To overcome the limit, with Fastify, you can extend these two parameters to all the request’s parts, such as headers and request metadata!

This feature is the **route constraint**. A constraint is a check performed when the HTTP request has been received by the server and must be routed to an endpoint. This step reads the raw `http.IncomingMessage` to pull out the value to apply the constraint check. Essentially, you can see two main logic steps:

1.  The constraint configuration in the route option means that the endpoint can only be reached if the HTTP request meets the condition.
2.  The constraint evaluation happens when the HTTP request is routed to a handler.

A constraint can be mandatory if derived from the request, but we will look at an example later.

Now, let’s assume we have an endpoint that must change the response payload. This action would be a breaking change for our customers. A breaking change means that all the clients connected to our application must update their code to read the data correctly.

In this case, we can use **route versioning**. This feature lets us define the same HTTP route path with a different implementation, based on the version requested by the client. Consider the following working snippet:

```js
app.get('/user', function (request, reply) {
    reply.send({ user: 'John Doe' });
});
app.get(
    '/user',
    {
        constraints: {
            version: '2.0.0',
        },
    },
    function handler(request, reply) {
        reply.send({ username: 'John Doe' });
    }
);
```

We have registered the same URL with the same HTTP method. The two routes reply with a different response object that is not backward compatible.

!!!note "Backward compatibility"

    An endpoint is backward compatible when changes to its business logic do not require client updates.

The other difference is that the second endpoint has a new `constraints` option key, pointing to a JSON object input. This means that the router must match the URL path, the HTTP method, and all the constraints to apply that handler.

By default, Fastify supports two constraints:

-   The `host` constraint checks the `host` request header. This check is not mandatory, so if the request has the `host` header, but it doesn’t match with any constrained route, a generic endpoint without a constraint can be selected during the routing.
-   The `version` constraint analyzes the `accept-version` request header. When a request contains this header, the check is mandatory, and a generic endpoint without a constraint can’t be considered during the routing.

To explain these options better, let’s see them in action:

```js
app.get('/host', func0);
app.get('/host', {
    handler: func2,
    constraints: {
        host: /^bar.*/,
    },
});
app.get('/together', func0);
app.get('/together', {
    handler: func1,
    constraints: {
        version: '1.0.1',
        host: 'foo.fastify.dev',
    },
});
```

The `/host` handler only executes when a request has the `host` header that starts with `bar`, so the following command will reply with the `func2` response:

```sh
$ curl --location --request GET "http://localhost:8080/host" --header
"host: bar.fastify.dev"
```

Instead, setting the `host` header as `foo.fastify.dev` will execute the `func0` handler; this happens because the `host` constraint is not mandatory, and an HTTP request with a value can match a route that has no constraint configured.

The `/together` endpoint configures two constraints. The handler will only be executed if the HTTP request’s header has both the corresponding HTTP headers:

```sh
$ curl --location --request GET "http://localhost:8080/together"
--header "accept-version: 1.x" --header "host: foo.fastify.dev"
```

The `host` match is a simple string match; instead, the `accept-version` header is a **Semantic Versioning (SemVer)** range string matching.

The SemVer is a specification to name a release of software in the Node.js ecosystem. Thanks to its clarity, it is broadly used in many contexts. This naming method defines three numbers referred to as **major.minor.patch**, such as `1.0.1`. Each number indicates the type of software changes that have been published:

-   Major version: The change is not backward compatible, and the client must update how it processes the HTTP request.
-   Minor bump version: A new feature is added to the software, keeping the endpoint I/O backward compatible.
-   Patch version: Bug fixes that improve the endpoint without changing the exposed API.

The specification defines how to query a SemVer string version, too. Our use case focuses on the `1.x` range, which means _the most recent major version 1_; the `1.0.x` translates to _the most recent major version 1, and minor equals 0_. For a complete overview of the SemVer query syntax, you can refer to <https://semver.org/>.

So, the `version` constraint supports the SemVer query syntax as an HTTP header value to match the target endpoint.

Note that, in this case, when a request has the `accept-version` header, the check is mandatory. This means that routes without a constraint can’t be used. Here, the rationale is that if the client wants a well-defined route version, it cannot reply from an unversioned route.

!!!note "Multiple constraint match"

    Note that the constraints can face conflicts during the evaluation. If you define two routes with the same host regular expression, an HTTP request might match both of them. In this case, the last registered route will be executed by the router. It would be best if you avoided these cases by configuring your constraints carefully.

As mentioned already, you can have many more constraints to route the HTTP request to your handlers. In fact, you can add as many constraints as you need to your routes, but it will have a performance cost. The routing selects the routes that match the HTTP method and path and will then process the constraints for every incoming request. Fastify gives you the option to implement custom constraints based on your needs. Creating a new constraint is not the goal of this book, but you can refer to this module at <https://github.com/Eomm/header-constraint-strategy>, which is maintained by the co-author of this book. Your journey with Fastify is not restricted to this practical book!

At this stage, we have understood how to add a route and how to drive the HTTP requests to it. Now we are ready to jump into input management.

## Reading the client’s input {#reading-the-clients-input}

Every API must read the client’s input to behave. We already mentioned the four HTTP request input types, which are supported by Fastify:

-   The path parameters are positional data, based on the endpoint’s URL format
-   The query string is an additional part of the URL the client adds to provide variable data
-   The headers are additional `key:value` pairs that pair information passing between the client and the server
-   The body is the request payload that contains the client’s data submission

Let’s take a look at each in more detail.

### The path parameters {#the-path-parameters}

The path parameters are variable pieces of a URL that could identify a resource in our application server. We already covered this aspect in [_Chapter 1_](./what-is-fastify.md), so we will not repeat ourselves. Instead, it will be interesting to show you a new useful example that we haven’t yet covered; this example sets two (or more) path parameters:

```js
app.get('/:userId/pets/:petId', function getPet(
    request,
    reply
) {
    reply.send(request.params);
});
```

The `request.params` JSON object contains both parameters, `userId` and `petId`, which are declared in the URL string definition.

The last thing to know about the path parameters is the maximum length they might have. By default, an URL parameter can’t be more than 100 characters. This is a security check that Fastify sets by default, and that you can customize in the root server instance initialization:

```js
const app = fastify({
    maxParamLength: 40,
});
```

Since all your application’s path parameters should not exceed a known length limit, it is good to reduce it. Consider that it is a global setting, and you can change it for a single route.

If a client hits the parameter length limit, it will get a 404 Not Found response.

### The query string {#the-query-string}

The query string is an additional part of the URL string that the client can append after a question mark:

```
http://localhost:8080/foo/bar?param1=one&param2=two
```

These params let your clients submit information to those endpoints that don’t support the request payload, such as `GET` or `HEAD` `HTTP`. Note that it is possible to retrieve only input strings and not complex data such as a file.

To read this information, you can access the `request.query` field wherever you have the `Request` component: hooks, decorators, or handlers.

Fastify supports basic 1:1 relation mapping, so a `foo.bar=42` query parameter produces a `{"foo.bar":"42"}` query object. Meanwhile, we should expect a nested object like this:

```json
{
    "foo": {
        "bar": "42"
    }
}
```

To do so, we must change the default query string parser with `qs`, a new external module, (<https://www.npmjs.com/package/qs>):

```js
const qs = require('qs');
const app = fastify({
    querystringParser: function newParser(
        queryParamString
    ) {
        return qs.parse(queryParamString, {
            allowDots: true,
        });
    },
});
```

This setup unlocks a comprehensive set of new syntaxes that you can use in query strings such as arrays, nested objects, and custom char separators.

### The headers {#the-headers}

The headers are a key-value map that can be read as a JSON object within the `request.headers` property. Note that, by default, Node.js will apply a lowercase format to every header’s key. So, if your client sends to your Fastify server the `CustomHeader: AbC` header, you must access it with the `request.headers.customheader` statement.

This logic follows the HTTP standard that stands for case-insensitive field names.

If you need to get the original headers sent by the client, you must access the `request.raw.rawHeaders` property. Consider that `request.raw` gives you access to the Node.js `http.IncomingMessage` object, so you are free to read data added to the Node.js core implementation, such as the raw headers.

### The body {#the-body}

The request’s body can be read through the `request.body` property. Fastify handles two input content types:

1.  The `application/json` produces a JSON object as a `body` value
2.  The `text/plain` produces a string that will be set as a `request.body` value

Note that the request payload will be read for the `POST`, `PUT`, `PATCH`, `OPTIONS`, and `DELETE` HTTP methods. The `GET` and `HEAD` ones don’t parse the body, as per the HTTP/1.1 specification.

Fastify sets a length limit to the payload to protect the application from **Denial-of-Service (DOS)** attacks, sending a huge payload to block your server in the parsing phase. When a client hits the default 1-megabyte limit, it receives a **413 - Request body is too large** error response. For example, this could be an unwanted behavior during an image upload. So, you should customize the default body size limit by setting the options as follows:

```js
const app = fastify({
    // [1]
    bodyLimit: 1024, // 1 KB
});
app.post(
    '/',
    {
        // [2]
        bodyLimit: 2097152, // 2 MB
    },
    handler
);
```

The `[1]` configuration defines the maximum length for every route without a custom limit, such as route `[2]`.

!!!note "Security first"

    It is a good practice to limit the default body size to the minimum value you expect, and to set a specific limit for routes that need more input data. Usually, 256 KB is enough for simple user input.

The user input is not JSON and text only. We will discuss how to avoid body parsing or manage more content types such as `multipart/form-data` in [_Chapter 4_](./hooks.md).

We have covered the route configuration and learned how to read the HTTP request input sources. Now we are ready to take a deeper look at the routes’ organization into plugins!

## Managing the route’s scope {#managing-the-routes-scope}

In Fastify, an endpoint has two central aspects that you will set when defining a new route:

1.  The route configuration
2.  The server instance, where the route has been registered

This metadata controls how the route behaves when the client calls it. Earlier in this chapter, we saw the first point, but now we must deepen the second aspect: the server instance context. The **route’s scope** is built on top of the server’s instance context where the entry point has been registered. Every route has its own route scope that is built during the startup phase, and it is like a settings container that tracks the handler’s configuration. Let’s see how it works.

### The route server instance {#the-route-server-instance}

When we talk about the **route’s scope**, we must consider the server instance where the route has been added. This information is important because it will define the following:

-   The handler execution context
-   The request life cycle events
-   The default route configuration

The product of these three aspects is the route’s scope. The route’s scope cannot be modified after application startup, since it is an optimized object of all the components that must serve the HTTP requests.

To see what this means in practice, we can play with the following code:

```js
app.get('/private', function handle(request, reply) {
    reply.send({ secret: 'data' });
});
app.register(function privatePlugin(instance, opts, next) {
    instance.addHook('onRequest', function isAdmin(
        request,
        reply,
        done
    ) {
        if (request.headers['x-api-key'] === 'ADM1N') {
            done();
        } else {
            done(new Error('you are not an admin'));
        }
    });
    next();
});
```

By calling the <http://localhost:8080/private> endpoint, the `isAdmin` hook **will never be executed because the route is defined in the app scope**. The `isAdmin` hook is declared in the `privatePlugin`’s context only.

Moving the `/private` endpoint declaration into the `privatePlugin` context, and taking care of changing the `app.get` code to `instance.get`, will change the route’s server instance context. Restarting the application and making a new HTTP request will execute the `isAdmin` function because the route’s scope has changed.

We have explored this aspect of the framework in [_Chapter 2_](./plugin-system.md), where we learned how the encapsulation scope affects the Fastify instances registered. In detail, I’m referring to **decorators and hooks**: a route that inherits all the **request life cycle hooks** registered in the server instance it belongs to, and the decorators too.

Consequently, the server’s instance context impacts all the routes added in that scope and its children, as shown in the previous example.

To consolidate this aspect, we can take a look at another example with more plugins:

```js
app.addHook('onRequest', function parseUserHook(
    request,
    reply,
    done
) {
    const level = parseInt(request.headers.level) || 0;
    request.user = {
        level,
        isAdmin: level === 42,
    };
    done();
});
app.get('/public', handler);
app.register(rootChildPlugin);
async function rootChildPlugin(plugin) {
    plugin.addHook('onRequest', function level99Hook(
        request,
        reply,
        done
    ) {
        if (request.user.level < 99) {
            done(new Error('You need an higher level'));
            return;
        }
        done();
    });
    plugin.get('/onlyLevel99', handler);
    plugin.register(childPlugin);
}
async function childPlugin(plugin) {
    plugin.addHook('onRequest', function adminHook(
        request,
        reply,
        done
    ) {
        if (!request.isAdmin) {
            done(new Error('You are not an admin'));
            return;
        }
        done();
    });
    plugin.get('/onlyAdmin', handler);
}
```

Take some time to read the previous code carefully; we have added one route and one `onRequest` hook into each context:

-   The `/public` route in the root app application instance
-   The `/onlyLevel99` URL in the `rootChildPlugin` function, which is the app context’s child
-   The `/onlyAdmin` endpoint in the `childPlugin` context is registered in the `rootChildPlugin` function

Now, if we try to call the `/onlyAdmin` endpoint, the following will happen:

1.  The server receives the HTTP request and does the routing process, finding the right handler.
2.  The handler is registered in the `childPlugin` context, which is a child server instance.
3.  Fastify traverses the context’s tree till the root application instance and starts the **request life cycle** execution.
4.  Every hook in the traversed contexts is executed sequentially. So, the executive order will be as follows:
    1.  The `parseUserHook` hook function adds a user object to the HTTP request.
    2.  The `level99Hook` will check whether the user object has the appropriate level to access the routes defined in that context and its children’s context.
    3.  The `adminHook` finally checks whether the user object is an admin.

It is worth repeating that if the `/onlyAdmin` route was registered in the app context, the fourth point would only execute the hooks added to that context.

In our examples, we used hooks, but the concept would be the same for decorators: a decorator added in the `rootChildPlugin` context is not available to be used in the app’s context because it is a parent. Instead, the decorator will be ready to use in the `childPlugin` context because it is a child of `rootChildPlugin`.

The route’s context is valuable because a route can access a database connection or trigger an authentication hook only if it has been added to the right server instance. For this reason, knowing in which context a route is registered is very important. There is a set of debugging techniques you can use to understand where a route is registered, which we will examine later.

### Printing the routes tree {#printing-the-routes-tree}

During the development process, especially when developing the first Fastify application, you might feel overwhelmed by having to understand the functions executed when a request reaches an endpoint. Don’t panic! This is expected at the beginning, and the feeling is temporary.

To reduce the stress, Fastify has a couple of debugging outputs and techniques that are helpful to unravel a complex code base.

The utilities we are talking about can be used like so:

```js
app.ready().then(function started() {
    console.log(app.printPlugins()); // [1]
    console.log(app.printRoutes({ commonPrefix: false }));
    // [2]
});
```

The `printPlugins()` method of `[1]` returns a string with a tree representation containing all the encapsulated contexts and loading times. The output gives you a complete overview of all the plugins created and the nesting level. Instead, the `printRoutes()` method of `[2]` shows us the application’s routes list that we are going to see later.

To view an example of the `printPlugins` function, consider the following code:

```js
app.register(async function pluginA(instance) {
    instance.register(async function pluginB(instance) {
        instance.register(function pluginC(
            instance,
            opts,
            next
        ) {
            setTimeout(next, 1000);
        });
    });
});
app.register(async function pluginX() {});
```

We have created four plugins: three nested into each other and one at the root context. The `printPlugins` executions produce the following output string:

```
bound root 1026 ms
├── bound _after 3 ms
├─┬ pluginA 1017 ms
│ └─┬ pluginB 1017 ms
│   └── pluginC 1016 ms
└── pluginX 0 ms
```

Here, we can see two interesting things:

1.  The names in the output are the plugins’ function names: This reaffirms the importance of preferring named functions instead of anonymous ones. Otherwise, the debugging phase will be more complicated.
2.  The loading times are cumulative: The root time loading is the sum of all its children’s contexts. For this reason, the `pluginC` loading time impacts the parent ones.

This output helps us to do the following:

-   Get a complete overview of the application tree. In fact, adding a new route to the `pluginB` context inherits the configuration of that scope and the parent ones.
-   Identify the slower plugins to load.

Fastify internals The output shows the `bound` `_after` string. You can simply ignore this string output because it is an internal Fastify behavior, and it does not give us information about our application.

Looking at the `printRoutes()` method of `[2]` at the beginning of this section, we can get a complete list of all the routes that have been loaded by Fastify. This helps you to get an easy-to-read output tree:

```
└── / (GET)
    ├── dogs (GET, POST, PUT)
    │   └── /:id (GET)
    ├── feline (GET)
    │   ├── / (GET)
    │   └── /cats (GET, POST, PUT)
    │       /cats (GET) {"host":"cats.land"}
    │       └── /:id (GET)
    └── who-is-the-best (GET)
```

As you can see, the print lists all the routes within their HTTP methods and constraints.

As you may remember, in the `printRoutes()` `[2]` statement, we used the `commonPrefix` option. This is necessary to overcome the internal Radix-tree we saw in the previous [Routing to the endpoint](#routing-to-the-endpoint) section. Without this parameter, Fastify will show you the internal representation of the routes. This means that the routes are grouped by the most common URL string. The following set of routes has three routes with the `hel` prefix in common:

```js
app.get('/hello', handler);
app.get('/help', handler);
app.get('/:help', handler);
app.get('/helicopter', handler);
app.get('/foo', handler);
app.ready(() => {
    console.log(app.printRoutes());
});
```

Printing those routes by calling the `printRoutes()` function produces the following:

```
└── /
    ├── hel
    │   ├── lo (GET)
    │   ├── p (GET)
    │   └── icopter (GET)
    ├── :help (GET)
    └── foo (GET)
```

As the preceding output confirms, the `hel` string is the most shared URL string that groups three routes. Note that the `:help` route is not grouped: this happens because it is a path parameter and not a static string. As mentioned already, this output shows the router’s internal logic, and it may be hard to read and understand. Going deeper into the route’s internal details is beyond the scope of this book because it concerns the internal Radix-tree we mentioned in the [Routing to the endpoint](#routing-to-the-endpoint) section.

The `printRoutes()` method supports another useful option flag: `includeHooks`. Let’s add the following Boolean:

```js
app.printRoutes({
    commonPrefix: false,
    includeHooks: true,
});
```

This will print to the output tree all the hooks that the route will execute during the **request life cycle**! The print is extremely useful to spot hooks that run when you would not expect them!

To set an example, let’s see the following sample code:

```js
app.addHook('preHandler', async function isAnimal() {});
app.get('/dogs', handler);
app.register(async function pluginA(instance) {
    instance.addHook(
        'onRequest',
        async function isCute() {}
    );
    instance.addHook(
        'preHandler',
        async function isFeline() {}
    );
    instance.get(
        '/cats',
        {
            onRequest: async function hasClaw() {}, // [1]
        },
        handler
    );
});
await app.ready();
console.log(
    app.printRoutes({
        commonPrefix: false,
        includeHooks: true,
    })
);
```

Print out the string:

```
└── / (-)
    ├── cats (GET)
    │   • (onRequest) ["isCute()","hasClaw()"]
    │   • (preHandler) ["isAnimal()","isFeline()"]
    └── dogs (GET)
        • (preHandler) ["isAnimal()"]
```

The output tree is immediately readable, and it is telling us which function runs for each hook registered! Moreover, the functions are ordered by execution, so we are sure that `isFeline` runs after the `isAnimal` function. In this snippet, we used the route hook registration `[1]` to highlight how the hooks append each other in sequence.

!!!note "Named functions"

    As mentioned in the [_Adding basic routes_](./what-is-fastify.md#adding-basic-routes) section of Chapter 1, using arrow functions to define the application’s hooks will return the `"anonymous()"` output string. This could hinder you from debugging the route

Now you can literally see your application’s routes! You can use these simple functions to get an overview of the plugin’s structure and gain a more detailed output of each endpoint, to understand the flow that an HTTP request will follow.

!!!note "Drawing a schema image of your application"

    By using the `fastify-overview` plugin from <https://github.com/Eomm/fastify-overview>, you will be able to create a graphical layout of your application with all the hooks, decorators, and Fastify-encapsulated contexts highlighted! You should give it a try.

Get ready for the next section, which will introduce more advanced topics, including how to start working with hooks and route configurations together.

## Adding new behaviors to routes {#adding-new-behaviors-to-routes}

At the beginning of this chapter, we learned how to use the `routeOptions` object to configure a route, but we did not talk about the `config` option!

This simple field gives us the power to do the following:

-   Access the config in the handler and hook functions
-   Implement the **Aspect-Oriented Programming (AOP)** that we are going to see later

How does it work in practice? Let’s find out!

### Accessing the route’s configuration {#accessing-the-routes-configuration}

With the `routerOption.config` parameter, you can specify a JSON that contains whatever you need. Then, it is possible to access it later within the `Request` component in the handlers or hooks’ function through the `context.config` field:

```js
async function operation(request, reply) {
    return request.context.config;
}
app.get('/', {
    handler: operation,
    config: {
        hello: 'world',
    },
});
```

In this way, you can create a business logic that depends on modifying the components’ behavior.

For example, we can have a `preHandler` hook that runs before the `schedule` handler function in each route:

```js
app.addHook('preHandler', async function calculatePriority
(request) {
  request.priority = request.context.config.priority   10
})
app.get('/private', {
  handler: schedule,
  config: { priority: 5 }
})
app.get('/public', {
  handler: schedule,
  config: { priority: 1 }
})
```

The `calculatePriority` hook adds a level of priority to the request object, based on the route configuration: the `/public` URL has less importance than the `/private` one.

By doing so, you could have generic components: handlers or hooks that act differently based on the route’s options.

### AOP {#aop}

The AOP paradigm focuses on isolating cross-cutting concerns from the business logic and improving the system’s modularity.

To be less theoretical and more practical, AOP in Fastify means that you can isolate boring stuff into hooks and add it to the routes that need it!

Here is a complete example:

```js
app.addHook('onRoute', function hook(routeOptions) {
    if (routeOptions.config.private === true) {
        routeOptions.onRequest = async function auth(
            request
        ) {
            if (request.headers.token !== 'admin') {
                const authError = new Error('Private zone');
                authError.statusCode = 401;
                throw authError;
            }
        };
    }
});
app.get('/private', {
    config: { private: true },
    handler,
});
app.get('/public', {
    config: { private: false },
    handler,
});
```

Since the first chapter, we have marginally discussed hooks. In the code, we introduced another hook example: the `onRoute` application hook, which listens for every route registered in the app context (and its children contexts). It can mutate the `routeOptions` object before Fastify instantiates the route endpoint.

The routes have `config.private` fields that tell the `hook` function to add an `onRequest` hook to the endpoint, which is only created if the value is `true`.

Let’s list all the advantages here:

-   You can isolate a behavior into a plugin that adds hooks to the routes only if needed.
-   Adding a generic hook function that runs when it is not necessary consumes resources and reduces the overall performance.
-   A centralized registration of the application’s crucial aspects, which reduces the route’s configuration verbosity. In a real-world application, you will have more and more APIs that you will need to configure.
-   You can keep building plugins with company-wide behavior and reuse them across your organization.

This example shows you the power of the `onRoute` hook in conjunction with the `routeOptions.config` object. In future chapters, you will see other use cases that are going to leverage this creational middleware pattern to give you more tools and ideas to build applications faster than ever.

We have just seen how powerful the route’s config property is and how to use it across the application.

## Summary {#summary}

This chapter has explained how routing works in Fastify, from route definition to request evaluation.

Now, you know how to add new endpoints and implement an effective handler function, both async or sync, with all the different aspects that might impact the request flow. You know how to access the client’s input to accomplish your business logic and reply effectively with a success or an error.

We saw how the server context could impact the route handler implementation, executing the hooks in that encapsulated context and accessing the decorators registered. Moreover, you learned how to tweak the route initialization by using the `onRoute` hook and the route’s `config`: using Fastify’s features together gives us new ways to build software even more quickly!

The routing has no more secrets for you, and you can define a complete set of flexible routes to evolve thanks to the constraints and manage a broad set of real-world use cases to get things done.

In the next chapter, we will discuss, in detail, one of Fastify’s core concepts, which we have already mentioned briefly and seen many times in our examples: hooks and decorators!
