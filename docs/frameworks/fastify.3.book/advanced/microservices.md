---
description: В этой главе мы начнем с того, что сделаем наш монолит более модульным, а затем изучим, как добавить новые маршруты без увеличения сложности проекта. После этого мы разделим монолит и будем использовать API-шлюз для маршрутизации соответствующих вызовов
---

# От монолита к микросервисам

Наше небольшое приложение начало набирать обороты, и бизнес попросил нас переделать API, сохранив при этом предыдущую версию, чтобы облегчить переход. Пока что мы реализовали «монолит» - все наше приложение развернуто как единый элемент. Наша команда очень занята эволюционным обслуживанием, которое мы не можем отложить. И тут у нашего руководства случается момент «Эврика!»: давайте добавим еще сотрудников.

В большинстве книг по инженерному менеджменту рекомендуется, чтобы размер команды никогда не превышал восьми человек - или, если вы Amazon, не превышал количества, которое может разделить две большие пиццы (это правило двух пицц Джеффа Безоса). Причина в том, что при количестве сотрудников более восьми человек число взаимосвязей между членами команды растет в геометрической прогрессии, что делает совместную работу невозможной. Часто упускаемое из виду решение заключается в том, чтобы не увеличивать команду, а замедлить процесс доставки.

Решением проблемы роста может стать разделение команды на две части. Это плохая идея, потому что если две команды будут одновременно работать над одной и той же кодовой базой, они будут наступать друг другу на пятки. К сожалению, это вряд ли произойдет, поскольку спрос на цифровые решения растет с каждым годом. Что же делать?

В первую очередь необходимо разделить монолит на несколько модулей, чтобы свести к минимуму вероятность конфликта между разными командами. Затем мы можем разделить его на микросервисы, чтобы команды могли сами отвечать за их развертывание. Микросервисы будут эффективны только в том случае, если мы сможем организовать архитектуру программного обеспечения с учетом границ команд.

В этой главе мы начнем с того, что сделаем наш монолит более модульным, а затем изучим, как добавить новые маршруты без увеличения сложности проекта. После этого мы разделим монолит и будем использовать API-шлюз для маршрутизации соответствующих вызовов.

В конце концов, мы затронем все вопросы, связанные с операторами: ведение логов, мониторинг и обработка ошибок.

Итак, в этой главе мы рассмотрим следующие темы:

-   Реализация версионности API
-   Разделение монолита
-   Выставление нашего микросервиса через API-шлюз Реализация распределенного лога

## Technical requirements {#technical-requirements}

As mentioned in the previous chapters, you will need the following:

-   A working Node.js 18 installation
-   A text editor to try the example code
-   Docker
-   An HTTP client to test out code, such as CURL or Postman
-   A GitHub account

All the snippets in this chapter are on [GitHub](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%2012).

## Implementing API versioning {#implementing-api-versioning}

Fastify provides two mechanisms for supporting multiple versions of the same APIs:

-   [Version constraints](https://www.fastify.io/docs/latest/Reference/Routes/#constraints) are based on the Accept-Version HTTP header
-   [URL prefixes](https://www.fastify.io/docs/latest/Reference/Routes/#route-prefixing) are simpler and my go-to choice

In this section, we will cover how to apply both techniques, starting with the following base server:

```js
// server.js
const fastify = require('fastify')();
fastify.get('/posts', async (request, reply) => {
    return [{ id: 1, title: 'Hello World' }];
});
fastify.listen({ port: 3000 });
```

### Version constraints {#version-constraints}

The Fastify constraint system allows us to expose multiple routes on the same URL by discriminating by HTTP header. It’s an advanced methodology that changes how the user must call our API: we must specify an `Accept-Version` header containing a semantic versioning pattern.

For our routes to be version-aware, we must add a `constraints: { version: '2.0.0' }` option to our route definitions, like so:

```js
const fastify = require('fastify')();
async function getAllPosts() {
    // Call a database or something
    return [{ id: 1, title: 'Hello World' }];
}
fastify.get(
    '/posts',
    {
        constraints: { version: '1.0.0' },
    },
    getAllPosts
);
fastify.get(
    '/posts',
    {
        constraints: { version: '2.0.0' },
    },
    async () => {
        posts: await getAllPosts();
    }
);
app.listen({ port: 3000 });
```

We can invoke our v1.0.0 API with the following:

```sh
$ curl -H 'Accept-Version: 1.x' http://127.0.0.1:3000/posts
[{"id":1,"title":"Hello World"}]
```

We can invoke our v2.0.0 API with the following:

```sh
$ curl -H 'Accept-Version: 2.x' http://127.0.0.1:3000/posts
{"posts":[{"id":1,"title":"Hello World"}]}
```

Invoking the API without the `Accept-Version` header will result in a 404 error, which you can verify like so:

```sh
$ curl http://127.0.0.1:3000/posts
{"message":"Route GET:/posts not found","error":"Not
Found","statusCode":404}
```

As you can see, if the request does not have the `Accept-Version` header, a 404 error will be returned. Given that most users are not familiar with `Accept-Version`, we recommend using prefixes instead.

### URL prefixes {#url-prefixes}

URL prefixes are simple to implement via encapsulation (see [Chapter 2](../basic/plugin-system.md)). As you might recall, we can add a `prefix` option when registering a plugin, and Fastify encapsulation logic will guarantee that all routes defined within the plugins will have the given prefix. We can leverage prefixes to structure our code logically so that different parts of our applications are encapsulated.

Let’s consider the following example in which each file is separated by a code comment:

```js
// server.js
const fastify = require('fastify')();
fastify.register(require('./services/posts'));
fastify.register(require('./routes/v1/posts'), {
    prefix: '/v1',
});
fastify.register(require('./routes/v2/posts'), {
    prefix: '/v2',
});
fastify.listen({ port: 3000 });
// services/posts.js
const fp = require('fastify-plugin');
module.exports = fp(async function (app) {
    app.decorate('posts', {
        async getAll() {
            // Call a database or something
            return [{ id: 1, title: 'Hello World' }];
        },
    });
});

// routes/v1/posts.js
module.exports = async function (app, opts) {
    app.get('/posts', (request, reply) => {
        return app.posts.getAll();
    });
};

// routes/v2/posts.js
module.exports = async function (app, opts) {
    app.get('/posts', async (request, reply) => {
        return {
            posts: await app.posts.getAll(),
        };
    });
};
```

In the previous code, we have created an application composed of four files:

1.  `server.js` starts our application.
2.  `services/posts.js` creates a decorator read to all the `posts` objects from our database; note the use of the `fastify-plugin` utility to break the encapsulation.
3.  `routes/v1/posts.js` implements the v1 API.
4.  `routes/v2/posts.js` implements the v2 API.

There is nothing special about the prefixed routes; we can call them normally using CURL or Postman:

```
$ curl http://127.0.0.1:3000/v1/posts
[{"id":1,"title":"Hello World"}]
$ curl http://127.0.0.1:3000/v2/posts
{"posts":[{"id":1,"title":"Hello World"}]}
```

!!!note "Shared business logic or code"

    Some routes will depend upon certain code, usually the business logic implementation or the database access. While a naïve implementation would have included this logic next to the route definitions, we moved them to a `services` folder. These will still be Fastify plugins and will use inversion-of-control mechanisms via decorators.

This approach needs to scale better as we add more complexity to our application, as we need to modify `server.js` for every single new file we add. Moreover, we duplicate the information about the prefix in two places: the `server.js` file and within the filesystem structure. The solution is to implement filesystem-based routing.

### Filesystem-based routing prefixes {#filesystem-based-routing-prefixes}

In order to avoid registering and requiring all the files manually, we have developed [`@fastify/autoload`](https://github.com/fastify/fastify-autoload). This plugin will automatically load the plugins from the filesystem and apply a prefix based on the current folder name.

In the following example, we will load two directories, `services` and `routes`:

```js
const fastify = require('fastify')();
fastify.register(require('@fastify/autoload'), {
    dir: `${__dirname}/services`,
});
fastify.register(require('@fastify/autoload'), {
    dir: `${__dirname}/routes`,
});
fastify.listen({ port: 3000 });
```

This new `server.js` will load all Fastify plugins in the `services` and `routes` folders, mapping our routes like so:

-   `routes/v1/posts.js` will automatically have the `v1/` prefix
-   `routes/v2/posts.js` will automatically have the `v2/` prefix

Structuring our code using the filesystem and services allows us to create logical blocks that can be easily refactored. In the next section, will see how we can extract a microservice from our monolith.

## Splitting the monolith {#splitting-the-monolith}

In the previous section, we discovered how to structure our application using Fastify plugins, separating our code into services and routes. Now, we are moving our application to the next step: we are going to split it into multiple microservices.

Our sample application has three core files: our routes for v1 and v2, plus one external service to load our posts. Given the similarity between v1 and v2 and our service, we will merge the service with v2, building the “old” v1 on top of it.

We are going to split the monolith across the boundaries of these three components: we will create a “v2” microservice, a “v1” microservice, and a “gateway” to coordinate them.

### Creating our v2 service {#creating-our-v2-service}

Usually, the simplest way to extract a microservice is to copy the code of the monolith and remove the parts that are not required. Therefore, we first structure our v2 service based on the monolith, reusing the `routes/` and `services/` folders. Then, we remove the `routes/v1/` folder and move the content of `v2` inside `routes/`. Lastly, we change the port it’s listening to `3002`.

We can now start the server and validate that our <http://127.0.0.1:3002/posts> URL works as expected:

```sh
$ curl http://127.0.0.1:3002/posts
{"posts":[{"id":1,"title":"Hello World"}]}
```

It’s now time to develop our v1 microservice.

### Building the v1 service on top of v2 {#building-the-v1-service-on-top-of-v2}

We can build the v1 service using the APIs exposed from v2. Similarly to our v2 service, we can structure our v1 service based on the monolith, using the `routes/` and `services/` folders. Then, we remove the `routes/v1/` folder and move the content of `v1` inside `routes/`. Now, it’s time to change our `services/posts.js` implementation to invoke our v2 service.

Our plugin uses [undici](https://undici.nodejs.org), a new HTTP client from Node.js.

!!!note "The story behind undici (from Matteo)"

    undici was born in 2016. At the time, I was consulting with a few organizations that were suffering from severe bottlenecks in performing HTTP calls in Node.js. They were considering switching the runtime to improve their throughput. I took up the challenge and created a proof- of-concept for a new HTTP client for Node.js. I was stunned by the results.

    How is undici fast? First, it carries out deliberate connection pooling via the use of Keep-Alive. Second, it minimizes the amount of event loop microticks needed to send a request. Finally, it does not have to conform to the same interfaces as a server.

    And why is it called “undici”? You could read HTTP/1.1 as 11 and undici means 11 in Italian (but more importantly, I was watching Stranger Things at the time).

We create a new `undici.Pool` object to manage the connection pool to our service. Then, we decorate our application with a new object that matches the interface needed by the other routes in our service:

```js
const fp = require('fastify-plugin');
const undici = require('undici');
module.exports = fp(async function (app, opts) {
    const { v2URL } = opts;
    const pool = new undici.Pool(v2URL);
    app.decorate('posts', {
        async getAll() {
            const { body } = await pool.request({
                path: '/posts',
                method: 'GET',
            });
            const data = await body.json();
            return data.posts;
        },
    });
    app.addHook('onClose', async () => {
        await pool.close();
    });
});
```

The `onClose` hook is used to shut down the connection pool: this allows us to make sure we have shut down all our connections before closing our server, allowing a graceful shutdown.

After creating our v2 and v1 microservices, we will now expose them via an API gateway.

## Exposing our microservice via an API gateway {#exposing-our-microservice-via-an-api-gateway}

We have split our monolith into two microservices. However, we would still need to expose them under a single origin (in web terminology, the origin of a page is the combination of the hostname/IP and the port). How can we do that? We will cover an Nginx-based strategy as well as a Fastify-based one.

### docker-compose to emulate a production environment {#docker-compose-to-emulate-a-production-environment}

To demonstrate our deployment scenario, we will be using a `docker-compose` setup. Following the same setup as in [Chapter 10](../real-project/deploy.md), let’s create a Dockerfile for each service (v1 and v2). The only relevant change is replacing the `CMD` statement at the end of the file, like so:

```
CMD ["node", "server.js"]
```

We’ll also need to create the relevant `package.json` file for each microservice.

Once everything is set up, we should be able to build and run both v1 and v2 that we just created. To run them, we set up a `docker-compose-two-services.yml` file like the following:

```yml
version: '3.7'
services:
    app-v1:
        build: ./microservices/v1
        environment:
            - 'V2_URL=http://app-v2:3002'
        ports:
            - '3001:3001'
    app-v2:
        build: ./microservices/v2
        ports:
            - '3002:3002'
```

After that, we can build and bring our microservices network up with a single command:

```sh
$ docker-compose -f docker-compose-two-services.yml up
...
```

This `docker-compose` file exposes `app-v1` on port `3001` and `app-v2` on port `3002`. Note that we must set `V2_URL` as the environment variable of `app-v1` to tell our application where `app-v2` is located.

Then, in another terminal, we can verify that everything is working as expected:

```sh
$ curl localhost:3001/posts
[{"id":1,"title":"Hello World"}]
$ curl localhost:3002/posts
{"posts":[{"id":1,"title":"Hello World"}]}
```

After dockerizing the two services, we can create our gateway.

### Nginx as an API gateway {#nginx-as-an-api-gateway}

Nginx is the most popular web server in the world. It’s incredibly fast and reliable and leveraged by all organizations, independent of size.

We can configure Nginx as a reverse proxy for the `/v1` and `/v2` prefixes to our microservices, like so:

```nginx
events {
  worker_connections 1024;
}
http {
  server {
    listen       8080;
    location /v1 {
      rewrite /v1/(.*)  /$1  break;
      proxy_pass        http://app-v1:3001;
    }
    location /v2 {
      rewrite /v2/(.*)  /$1  break;
      proxy_pass        http://app-v2:3002;
    }
  }
}
```

Давайте разберем конфигурацию Nginx:

-   Блоки `events` определяют, сколько соединений может быть открыто рабочим процессом.
-   Блок `http` настраивает наш простой HTTP-сервер.
-   Внутри блока `http->server` мы настраиваем порт для прослушивания, а также два расположения `/v1` и `/v2`. Как вы можете видеть, мы переписали URL, чтобы удалить `/v1/` и `/v2/`, соответственно.
-   Затем мы используем директиву `proxy_pass` для перенаправления HTTP-запроса на целевой хост.

!!!note "Конфигурация Nginx"

    Правильно настроить Nginx непросто. Множество его настроек могут существенно изменить профиль производительности приложения. Подробнее об этом можно узнать из [документации](https://nginx.org/ru/docs/).

После подготовки конфигурации Nginx мы хотим запустить его через Docker, создав файл `Dockerfile`:

```Dockerfile
FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
```

Затем мы можем запустить нашу сеть микросервисов, создав файл `docker-compose-nginx.yml`:

```yml
version: '3.7'
services:
    app-v1:
        build: ./microservices/v1
        environment:
            - 'V2_URL=http://app-v2:3002'
    app-v2:
        build: ./microservices/v2
    gateway:
        build: ./nginx
        ports:
            - '8080:8080'
```

В этой конфигурации мы определяем три сервиса Docker: `app-v1`, `app-v2` и `gateway`. Мы можем начать со следующего:

```sh
$> docker-compose -f docker-compose-nxing.yml up
```

Теперь мы можем убедиться, что наши API правильно отображаются на `http://127.0.0.1:8080/v1/posts` и `http://127.0.0.1:8080/v2/posts`.

Использование Nginx для предоставления нескольких сервисов - отличная стратегия, которую мы часто рекомендуем. Однако она не позволяет нам настраивать шлюз: что, если мы захотим применить пользовательскую логику авторизации? Как мы будем преобразовывать ответы от сервиса?

### `@fastify/http-proxy` в качестве API-шлюза

Экосистема Fastify предлагает способ реализации обратного прокси с помощью JavaScript. Это [`@fastify/http-proxy`](https://github.com/fastify/fastify-http-proxy).

Здесь представлена быстрая реализация той же логики, которую мы реализовали в Nginx:

```js
const fastify = require('fastify')({ logger: true });
fastify.register(require('@fastify/http-proxy'), {
    prefix: '/v1',
    upstream: process.env.V1_URL || 'http://127.0.0.1:3001',
});
fastify.register(require('@fastify/http-proxy'), {
    prefix: '/v2',
    upstream: process.env.V2_URL || 'http://127.0.0.1:3002',
});
fastify.listen({ port: 3000, host: '0.0.0.0' });
```

Построение API-шлюза на базе Node.js и Fastify позволяет нам полностью настроить логику работы шлюза на JavaScript - это очень эффективная техника для выполнения централизованных операций, таких как проверка аутентификации или авторизации до того, как запрос достигнет микросервиса. Более того, мы можем составлять таблицу маршрутизации динамически, получая ее из базы данных (и кэшируя ее!). Это дает явное преимущество по сравнению с подходом обратного прокси.

Основное возражение, которое мы имеем против создания пользовательского API-шлюза с помощью Fastify, связано с безопасностью, поскольку некоторые компании не доверяют своим разработчикам писать API-шлюзы. По нашему опыту, мы много раз развертывали это решение, оно показало себя лучше, чем ожидалось, и у нас не было никаких нарушений безопасности.

После написания прокси на Node.js нам следует создать соответствующий Dockerfile и `package.json`. Как и в предыдущем разделе, мы будем использовать `docker-compose`, чтобы проверить, что наша сеть микросервисов работает должным образом. Мы создадим файл `docker-compose-fhp.yml` для этого решения со следующим содержанием:

```yml
version: '3.7'
services:
    app-v1:
        build: ./microservices/v1
        environment:
            - 'V2_URL=http://app-v2:3002'
    app-v2:
        build: ./microservices/v2
    app-gateway:
        build: ./fastify-http-proxy
        ports:
            - '3000:3000'
        environment:
            - 'V1_URL=http://app-v1:3001'
            - 'V2_URL=http://app-v2:3002'
```

В этой конфигурации мы определяем три сервиса Docker: `app-v1`, `app-v2` и `app-gateway`. Мы можем запустить их следующим образом:

```sh
$> docker-compose -f docker-compose-fhp.yml up
```

В следующем разделе мы рассмотрим, как настроить наш шлюз для реализации распределенного лога.

## Реализация распределенного лога

Как только мы создали распределенную систему, все становится сложнее. Одним из таких усложняющихся моментов является ведение лога и отслеживание запроса в нескольких микросервисах. В [Главе 11](../real-project/logging.md) мы рассмотрели распределенное протоколирование - это техника, которая позволяет нам отслеживать все строки лога, относящиеся к определенному потоку запросов, с помощью идентификаторов корреляции (`reqId`). В этом разделе мы применим эту технику на практике.

Сначала мы изменим файл `server.js нашего шлюза, чтобы сгенерировать новый UUID для цепочки запросов, как показано ниже:

```js
const crypto = require('crypto');
const fastify = require('fastify')({
    logger: true,
    genReqId(req) {
        const uuid = crypto.randomUUID();
        req.headers['x-request-id'] = uuid;
        return uuid;
    },
});
```

Обратите внимание, что мы генерируем новый UUID при каждом запросе и присваиваем его обратно объекту `headers`. Таким образом, `@fastify/http-proxy` автоматически распространит его для всех нисходящих сервисов.

Следующим шагом будет модификация файла `server.js` во всех микросервисах, чтобы они распознавали заголовок `x-request-id`:

```js
const crypto = require('crypto');
const fastify = require('fastify')({
    logger: true,
    genReqId(req) {
        return (
            req.headers['x-request-id'] ||
            crypto.randomUUID()
        );
    },
});
```

Последний шаг - убедиться, что вызов сервиса `v2` из `v1` проходит через заголовок (в `microservices/v1/services/posts.js`):

```js
app.decorate('posts', {
    async getAll({ reqId }) {
        const { body } = await pool.request({
            path: '/posts',
            method: 'GET',
            headers: {
                'x-request-id': reqId,
            },
        });
        const data = await body.json();
        return data.posts;
    },
});
```

Здесь мы обновили декоратор `getAll`, чтобы перенаправить пользовательский заголовок `x-request-id` в вышестоящий микросервис.

Как мы видели в этом разделе, API-шлюз, построенный поверх Fastify, позволяет легко настраивать обработку запросов. Если в случае с распределенным логом мы добавили только один заголовок, то эта техника также позволяет переписать ответы или добавить централизованную логику аутентификации и авторизации.

## Резюме

В этой главе мы обсудили проблемы, связанные с развертыванием монолита, и различные техники для их решения: ограничения и префиксация URL. Последнее является основой для окончательного решения: разделения монолита на несколько микросервисов. Затем мы показали, как применять распределенный лог в мире микросервисов, обеспечивая уникальную идентификацию запросов в разных микросервисах.

Вы готовы перейти к [главе 13](./performance.md), в которой вы узнаете, как оптимизировать ваше приложение Fastify.
