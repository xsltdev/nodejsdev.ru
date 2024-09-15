---
description: В этой главе мы продолжим развивать наше приложение, в основном затрагивая две отдельные темы - аутентификацию пользователей и работу с файлами
---

# Аутентификация, авторизация и работа с файлами

В этой главе мы продолжим развивать наше приложение, в основном затрагивая две отдельные темы: аутентификацию пользователей и работу с файлами.

Во-первых, мы реализуем многократно используемый плагин аутентификации JWT, который позволит нам управлять пользователями, аутентификацией и сессиями. Он также будет выступать в качестве уровня авторизации, защищая конечные точки нашего приложения от несанкционированного доступа. Мы также увидим, как декораторы могут раскрывать данные аутентифицированного пользователя внутри обработчиков маршрутов. Затем, перейдя к работе с файлами, мы разработаем специальный плагин, позволяющий пользователям импортировать и экспортировать свои задачи в формате CSV.

В этой главе мы узнаем о следующем:

-   Поток аутентификации и авторизации
-   Создание уровня аутентификации
-   Добавление уровня авторизации
-   Управление загрузками и скачиваниями

## Технические требования {#technical-requirements}

Для изучения этой главы вам понадобятся технические требования, упомянутые в предыдущих главах:

-   Рабочая [установка Node.js 18](https://nodejs.org/)
-   [VS Code IDE](https://code.visualstudio.com/)
-   активная [установка Docker](https://docs.docker.com/get-docker/)
-   Репозиторий [Git](https://git-scm.com/) рекомендуется, но не является обязательным.
-   Терминальное приложение

Еще раз напомним, что код проекта можно найти на [GitHub](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%208).

Наконец, пришло время приступить к исследованию. В следующем разделе мы глубоко погрузимся в поток аутентификации в Fastify, понимая все части, необходимые для реализации полного решения.

## Поток аутентификации и авторизации {#authentication-and-authorization-flow}

Аутентификация и авторизация обычно являются сложными темами. В зависимости от случая использования конкретные стратегии могут быть или не быть осуществимыми. В этом проекте мы будем реализовывать уровень аутентификации с помощью **JSON Web Tokens**, широко известных как **JWTs**.

!!!note "JWT"

    Это широко используемый стандарт аутентификации на основе токенов для веб- и мобильных приложений. Это открытый стандарт, который позволяет безопасно передавать информацию между клиентом и сервером. Каждый токен состоит из трех частей. Во-первых, заголовок содержит информацию о типе токена и криптографических алгоритмах, используемых для его подписи и шифрования. Затем в полезной нагрузке содержатся метаданные о пользователе. Наконец, подпись используется для проверки подлинности токена и гарантии того, что он не был подделан.

Прежде чем рассматривать реализацию в Fastify, давайте вкратце рассмотрим, как работает эта **аутентификация**. Во-первых, API должен предоставлять конечную точку для регистрации. Этот маршрут позволит пользователям создавать новые аккаунты на сервисе. После корректного создания учетной записи пользователь сможет выполнять аутентифицированные операции с сервером. Мы можем разбить их на семь шагов:

1.  Чтобы инициировать процесс аутентификации, пользователь предоставляет серверу свое имя пользователя и пароль через определенную конечную точку.
2.  Сервер проверяет учетные данные и, если они действительны, создает JWT, содержащий метаданные пользователя, используя общий секрет.
3.  Сервер возвращает токен клиенту.
4.  Клиент хранит JWT в безопасном месте. В браузере это обычно локальное хранилище или cookie.
5.  При последующих запросах к серверу клиент отправляет JWT в заголовке `Authorization` каждого HTTP-запроса.
6.  Сервер проверяет токен, проверяя подпись, и если подпись действительна, он извлекает метаданные пользователя из полезной нагрузки.
7.  Сервер использует идентификатор пользователя для поиска пользователя в базе данных.

Далее запрос обрабатывается уровнем **авторизации**. Сначала он должен проверить, есть ли у текущего пользователя необходимые разрешения на выполнение действия или доступ к указанному ресурсу. Затем, основываясь на результате операции проверки, сервер может ответить ресурсом или ошибкой HTTP `Unauthorized`. Существует множество стандартизированных способов реализации авторизации. В этой книге мы реализуем наше простое решение с нуля для наглядности.

!!!note "Аутентификация и авторизация"

    Несмотря на то, что эти термины часто используются вместе, они выражают две совершенно разные концепции. Аутентификация описывает, _кому_ разрешен доступ к сервису. С другой стороны, авторизация определяет, _какие_ действия может выполнять пользователь после аутентификации.

Уровни авторизации и аутентификации имеют решающее значение для создания безопасных веб-приложений. Контроль доступа к ресурсам помогает предотвратить несанкционированный доступ и защитить конфиденциальные данные от возможных атак или утечек.

В следующем разделе мы начнем с того места, на котором остановились в [Главе 7](./restful-api.md), реализуя новый плагин для аутентификации на уровне приложения.

## Построение слоя аутентификации {#building-the-authentication-layer}

Поскольку нам нужно добавить новую нетривиальную функциональность в наше приложение, нам нужно реализовать в основном две части:

-   Плагин аутентификации для генерации токенов, проверки входящих запросов и отзыва старых или неиспользуемых токенов.
-   Куча новых маршрутов для обработки регистрации, аутентификации и жизненного цикла токенов.

Прежде чем перейти непосредственно к коду, необходимо сделать последнее замечание. В фрагментах кода этой главы мы будем использовать новый источник данных под названием `userDataSource` (`[1]`). Поскольку он раскрывает только методы `createUser` (`[3]`) и `readUser` (`[2]`), а его реализация тривиальна, мы не будем показывать его в этой книге. Однако полный код находится в файле `./routes/auth/autohooks.js` в репозитории GitHub.

Поскольку нам нужно реализовать оба варианта, мы можем сначала добавить плагин аутентификации.

### Плагин аутентификации {#authentication-plugin}

Сначала создайте файл `./plugins/auth.js` в корневой папке проекта. Сниппет кода `auth.js` показывает реализацию плагина:

```js
const fp = require('fastify-plugin');
const fastifyJwt = require('@fastify/jwt'); // [1]
module.exports = fp(
    async function authenticationPlugin(fastify, opts) {
        const revokedTokens = new Map(); // [2]
        fastify.register(fastifyJwt, {
            // [3]
            secret: fastify.secrets.JWT_SECRET,
            trusted: function isTrusted(
                request,
                decodedToken
            ) {
                return !revokedTokens.has(decodedToken.jti);
            },
        });
        fastify.decorate(
            'authenticate',
            async function authenticate(request, reply) {
                // [4]
                try {
                    await request.jwtVerify(); // [5]
                } catch (err) {
                    reply.send(err);
                }
            }
        );
        fastify.decorateRequest('revokeToken', function () {
            //
            [6];
            revokedTokens.set(this.user.jti, true);
        });
        fastify.decorateRequest(
            'generateToken',
            async function () {
                // [7]
                const token = await fastify.jwt.sign(
                    {
                        id: String(this.user._id),
                        username: this.user.username,
                    },
                    {
                        jti: String(Date.now()),
                        expiresIn:
                            fastify.secrets.JWT_EXPIRE_IN,
                    }
                );
                return token;
            }
        );
    },
    {
        name: 'authentication-plugin',
        dependencies: ['application-config'],
    }
);
```

Мы создаем и экспортируем плагин Fastify, который предоставляет функции аутентификации с помощью декораторов и библиотеки JWT. Но сначала давайте рассмотрим детали реализации:

-   Нам требуется официальный пакет `@fastify/jwt` (`[1]`). Он обрабатывает низкоуровневые примитивы вокруг токенов и позволяет нам сосредоточиться только на логике, необходимой в нашем приложении.
-   Вообще говоря, всегда полезно отслеживать недействительные токены. `revokedTokens` создает экземпляр Map (`[2]`), чтобы отслеживать их. Позже мы будем использовать его для запрета недействительных токенов.
-   Мы регистрируем плагин `@fastify/jwt` на экземпляре Fastify (`[3]`), передавая переменную окружения `JWT_SECRET` и функцию `isTrusted`, которая проверяет, является ли токен доверенным. В следующем разделе мы добавим `JWT_SECRET` в конфигурацию нашего сервера, чтобы обеспечить ее наличие после загрузки.
-   Мы декорируем экземпляр Fastify функцией `authenticate`, чтобы убедиться в том, что токен клиента действителен, прежде чем разрешить доступ к защищенным маршрутам. Метод `request.jwtVerify()` (`[5]`) берется из `@fastify/jwt`. Если при проверке возникают ошибки, функция отвечает клиенту с указанием ошибки. В противном случае свойство `request.user` будет заполнено текущим пользователем.
-   Функция `revokeToken` добавляется к экземпляру Fastify (`[6]`). Она добавляет токен в карту недействительных токенов. В качестве ключа недействительности мы используем свойство `jti`.
-   Функция `generateToken` создает новый токен из данных пользователя (`[7]`). Затем мы декорируем запрос этой функцией, чтобы получить доступ к его контексту через ссылку `this`. Метод `fastify.jwt.sign` снова предоставляется библиотекой `@fastify/jwt`.

Благодаря настройке проекта из предыдущих глав, этот плагин будет автоматически зарегистрирован в главном экземпляре Fastify внутри `./apps.js` на этапе загрузки.

Пока мы можем оставить этот файл без изменений, поскольку мы начнем использовать декорируем методы внутри нашего приложения в специальном разделе. Теперь пришло время добавить маршруты уровня аутентификации, и мы сделаем это в следующем подразделе.

### Маршруты аутентификации {#authentication-routes}

Пришло время реализовать способ взаимодействия пользователей с нашим уровнем аутентификации. Структура папки `./ routes/auth` имитирует модуль `todos`, который мы изучали в [Главе 7](./restful-api.md). Она содержит `chemas`, `autohooks.js` и `routes.js`. Для краткости мы рассмотрим в книге только `routes.js`. Остальной код прост и его можно найти в [репозитории](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%208) GitHub .

Поскольку код `./routes/auth/routes.js` довольно длинный, мы разобьем его на отдельные фрагменты, по одному на определение маршрута. Но сначала, чтобы получить общее представление о плагине, следующий фрагмент содержит весь код, опуская реализации:

```js
const fp = require('fastify-plugin');
const generateHash = require('./generate-hash'); // [1]
module.exports.prefixOverride = ''; // [2]
module.exports = fp(
    async function applicationAuth(fastify, opts) {
        fastify.post('/register', {
            // ... implementation omitted
        });
        fastify.post('/authenticate', {
            // ... implementation omitted
        });
        fastify.get('/me', {
            // ... implementation omitted
        });
        fastify.post('/refresh', {
            // ... implementation omitted
        });
        fastify.post('/logout', {
            // ... implementation omitted
        });
        async function refreshHandler(request, reply) {
            // ... implementation omitted
        }
    },
    {
        name: 'auth-routes',
        dependencies: ['authentication-plugin'], // [3]
        encapsulate: true,
    }
);
```

We start by requiring the `generate-hash.js` local module (`[1]`). We don’t want to save users’ passwords in plain text, so we use this module to generate a hash and a salt to store in the database. Again, you can find the implementation in the GitHub repository. Next, since we want to expose the five routes declared in the body of the plugin directly on the root path, we set the `prefixOverride` property to an empty string and exported it (`[2]`). Since we are inside the `./routes/auth` subfolder, `@fastify/autoload` would instead mount the routes to the `/auth/` path. Furthermore, since inside our route declarations, we rely on methods decorated in `authentication-plugin`, we add it to the `dependencies` array (`[3]`). Finally, we want to override the default behavior of `fastify-plugin` to isolate this plugin’s code, and therefore, we pass `true` to the `encapsulate` options.

This wraps up the general overview. Next, we can examine the `register` route.

#### Register route {#register-route}

This route allows new users to register on our platform. Let’s explore the implementation by looking at the following snippet:

```js
fastify.post('/register', {
    // [1.1]
    schema: {
        body: fastify.getSchema('schema:auth:register'), // [1.2]
    },
    handler: async function registerHandler(
        request,
        reply
    ) {
        const existingUser = await this.usersDataSource.readUser(
            request.body.username
        ); // [1.3]
        if (existingUser) {
            // [1.4]
            const err = new Error(
                'User already registered'
            );
            err.statusCode = 409;
            throw err;
        }
        const { hash, salt } = await generateHash(
            request.body.password
        ); // [1.5]
        try {
            const newUserId = await this.usersDataSource.createUser(
                {
                    // [1.6]
                    username: request.body.username,
                    salt,
                    hash,
                }
            );
            request.log.info(
                { userId: newUserId },
                'User registered'
            );
            reply.code(201);
            return { registered: true }; // [1.7]
        } catch (error) {
            request.log.error(
                error,
                'Failed to register user'
            );
            reply.code(500);
            return { registered: false }; // [1.8]
        }
    },
});
```

Let’s break down the execution of the preceding code snippet:

-   First, `fastify.post` is used to declare a new route for the HTTP POST method with the `/register` path (`[1.1]`).
-   We specify the request body schema using `fastify.getSchema` (`[1.2]`). We will not see this schema implementation in the book, but it can be found in the GitHub repository as usual.
-   Moving to the handler function details, we use `request.body.username` to check whether the user is already registered to the application (`[1.3]`). If so, we throw a `409` HTTP error (`[1.4]`). Otherwise, `request.body.password` is passed to the `generateHash` function to create a hash and a salt from it (`[1.5]`).
-   Then, we use these variables and `request.body.username` to insert the new user in the DB (`[1.6]`).
-   If no errors are thrown during this creation process, the handler replies with a `201` HTTP code and a `{ registered: true }` body (`[1.7]`). On the other hand, if there are errors, the reply contains a `500` HTTP code and a `{ registered: false }` body (`[1.8]`).

The following section will examine how the users authenticate with our platform.

#### Authenticate route {#authenticate-route}

The next route on the list is the POST `/authenticate` route. It allows registered users to generate a new JWT token using their password. The following snippet shows the implementation:

```js
fastify.post('/authenticate', {
    schema: {
        // [2.1]
        body: fastify.getSchema('schema:auth:register'),
        response: {
            200: fastify.getSchema('schema:auth:token'),
        },
    },
    handler: async function authenticateHandler(
        request,
        reply
    ) {
        const user = await this.usersDataSource.readUser(
            request.body.username
        );
        // [2.2]
        if (!user) {
            // [2.3]
            // if we return 404, an attacker can use this to find
            // out which users are registered
            const err = new Error(
                'Wrong credentials provided'
            );
            err.statusCode = 401;
            throw err;
        }
        const { hash } = await generateHash(
            request.body.password,
            user.salt
        ); // [2.4]
        if (hash !== user.hash) {
            // [2.5]
            const err = new Error(
                'Wrong credentials provided'
            );
            err.statusCode = 401;
            throw err;
        }
        request.user = user; // [2.6]
        return refreshHandler(request, reply); // [2.7]
    },
});
```

Let’s break down the code execution:

-   Once more, we use the auth schemas we declared in the dedicated folder (`[2.1]`) to secure and speed the route’s body and response payloads.
-   Then, inside the handler function, we read the user’s data from the database using the `request.body.username` property (`[2.2]`).
-   If no user is found in the system, we return `401` instead of `404`, with the **Wrong credentials provided** message, to prevent attackers from discovering which users are registered (`[2.3]`).
-   We are now able to use the `user.salt` property we got from the database to generate a new hash (`[2.4]`). The generated `hash` is then compared with the hash stored in the data source during the user registration.
-   If they do not match, the function throws the same `401` error using the `throw` statement (`[2.5]`).
-   On the other hand, if the check is successful, the now authenticated user is attached to the request object for further processing (`[2.6]`).
-   Finally, the handler invokes the `refreshHandler` function, passing `request` and `reply` as arguments (`[2.7]`).

We will see the `refreshHandler` implementation in the following section, where we look at the `/refresh` route.

#### Refresh route {#refresh-route}

Once authenticated, the `refresh` route allows our users to generate more tokens without providing their usernames and passwords. Since we already saw that we are using the same logic inside the `authenticate` route, we moved this route handler to a separate function. The following code block shows these details:

```js
fastify.post('/refresh', {
    onRequest: fastify.authenticate, // [3.1]
    schema: {
        headers: fastify.getSchema(
            'schema:auth:token-header'
        ),
        response: {
            200: fastify.getSchema('schema:auth:token'),
        },
    },
    handler: refreshHandler, // [3.2]
});
async function refreshHandler(request, reply) {
    const token = await request.generateToken(); // [3.3]
    return { token };
}
```

This route is the first one protected by the authentication layer. To enforce it, we use `fastify. authenticate` `onRequest` hook, which we created in the _Authentication plugin_ section (`[3.1]`). The route handler function is `refreshHandler` (`[3.2]`), which generates a new JWT token and returns it as the response. Finally, the handler calls the `generateToken` method decorated onto the request object by the authentication plugin (`[3.3]`) and then returns its value to the client. The route is authenticated because we generate the new token from the request called by already authorized users.

The time has come to look at how we invalidate user tokens, and we will do precisely that in the next section.

### Logout route {#logout-route}

Until now, we didn’t use the `revokedTokens` map and `revokeToken` request method we created in the _Authentication plugin_ section. However, the logout implementation relies on them. Let’s jump into the code:

```js
fastify.post('/logout', {
    onRequest: fastify.authenticate, // [4.1]
    handler: async function logoutHandler(request, reply) {
        request.revokeToken(); // [4.2]
        reply.code(204); // [4.3]
    },
});
```

Since we want only authenticated users to invalidate their tokens, the `/logout` route is once more protected by the authentication hook (`[4.1]`). Assuming the request authentication succeeds, the handler function revokes the current token calling the `request.revokenToken` method (`[4.2]`), which is attached to the request object by the authentication plugin we developed previously. This call adds the token to the `revokedTokens` map used internally by the `@fastify/jwt` plugin to determine invalid entries. The token revocation process ensures that the token cannot be used again for authentication, even if an attacker manages to obtain it. Finally, the handler sends an empty `204` response to the client, indicating a successful logout (`[4.3]`).

This completes this section about the authentication routes. In the following one, we will implement our authorization layer.

## Adding the authorization layer {#adding-the-authorization-layer}

Now that we can have all authentication pieces in place, we can finally move on to implementing the authorization layer of our application. To adequately protect our endpoints, we need to do two main things to the `./routes/todos` module from [Chapter 7](./restful-api.md):

-   Add the authentication layer to `./routes/todos/routes.js`
-   Update the to-do data source inside `./routes/todos/autohook.js`

Fortunately, we need only a one-liner change to implement the first point. On the other hand, the second point is more complex. We will examine both in the following subsections.

### Adding the authentication layer {#adding-the-authentication-layer}

Let’s start with the simpler task. As we already said, this is a fast addition to the [Chapter 7](./restful-api.md) code that we can see in the following snippet:

```js
module.exports = async function todoRoutes(fastify, _opts) {
    fastify.addHook('onRequest', fastify.authenticate); // [1]
    // omitted route implementations from chapter 7
};
```

To protect our to-do routes, we add the `onRequest` `fastify.authenticate` hook (`[1]`), which we previously used for authentication routes. This hook will check whether the incoming request has the authentication HTTP header, and after validating it, it will add the `user` information object to the request.

### Updating the to-do data source {#updating-the-to-do-data-source}

Since our application deals only with one type of entity, our authorization layer is straightforward to implement. The idea is to prevent users from accessing and modifying tasks that belong to other users. Until this point, we could see our application as a single-user application:

-   Every task we created doesn’t have any reference to the user that created it
-   Every `Read`, `Update`, and `Delete` operation can be executed on every item by every user

As we already said, the correct place to fix these issues is the `mongoDataSource` decorator we implemented in [Chapter 7](./restful-api.md). Since we now have two data sources, one for the users and the other for the to-do items, we will rename `mongoDataSource` to `todosDataSource` to reflect its duties better. Because we need to change all methods to add a proper authorization layer, the code snippet would get too long. Instead of showing its entirety here, the following snippet shows changes only for `listTodos` and `createTodos`. All changes can be found in the `./routes/todos/autohooks.js` file inside the GitHub repository of this chapter:

```js
// ... omitted for brevity
module.exports = fp(async function todoAutoHooks(
    fastify,
    opts
) {
    // ... omitted for brevity
    fastify.decorateRequest('todosDataSource', null); // [1]
    fastify.addHook('onRequest', async (request, reply) => {
        // [2]
        request.todosDataSource = {
            // [3]
            // ... omitted for brevity
            async listTodos({
                filter = {},
                projection = {},
                skip = 0,
                limit = 50,
            } = {}) {
                if (filter.title) {
                    filter.title = new RegExp(
                        filter.title,
                        'i'
                    );
                } else {
                    delete filter.title;
                }
                filter.userId = request.user.id; // [4]
                const data = todos
                    .find(filter, {
                        projection: {
                            ...projection,
                            _id: 0,
                        },
                        limit,
                        skip,
                    })
                    .toArray();
                return data;
            },
            async createTodo({ title }) {
                const _id = new fastify.mongo.ObjectId();
                const now = new Date();
                const userId = request.user.id; // [5]
                const {
                    insertedId,
                } = await todos.insertOne({
                    _id,
                    userId,
                    title,
                    done: false,
                    id: _id,
                    createdAt: now,
                    modifiedAt: now,
                });
                return insertedId;
            },
            // ... omitted for brevity
        };
    });
});
```

Instead of decorating the Fastify instance as we did initially in [Chapter 7](./restful-api.md), we are now moving the logic inside the `request` object. This change allows easy access to the `user` object that our authentication layer attaches to the request. Later, we will use this data across all `todosDataSource` methods.

Let’s take a closer look at the code:

-   First, we decorate the request with `todosDataSource`, setting its value to null (`[1]`). We do this to trigger a speed optimization: making the application aware of the existence of the `todosDataSource` property at the beginning of the request life cycle will make its creation faster.
-   Then, we add the `onRequest` hook (`[2]`), which will be called after `fastify.authentication` has already added the user data.
-   Inside the hook, a new object containing the data source implementations is assigned to the `todosDataSource` property on the request (`[3]`).
-   Next, `listTodos` now uses `request.user.id` as a filter field (`[4]`) to return only the data that belongs to the current user.
-   To make this filter work, we must add the `userId` property to the newly created tasks (`[5]`).

As we said, we omit the other methods for brevity, but they follow the same pattern using `userId` as a filter. Again, the complete code is present in the GitHub repository.

We just completed our authentication and authorization layers. The next section will show how to handle file uploads and downloads inside authentication-protected endpoints.

## Managing uploads and downloads {#managing-uploads-and-downloads}

We need to add two more functionalities to our application, and we will do it by developing a dedicated Fastify plugin. The first will allow our users to upload CSV files to create to-do tasks in bulk. We will rely on two external dependencies to do it:

-   `@fastify/multipart` for file uploads
-   `csv-parse` for CSV parsing

The second plugin will expose an endpoint to download items as a CSV file. Again, we need the external `csv-stringify` library to serialize objects and create the document.

While we will split the code into two snippets in the book, the complete code can be found in `./routes/todos/files/routes.js`. Let’s explore the following snippet, which contains the file upload and items bulk creation logic:

```js
const fastifyMultipart = require('@fastify/multipart');
const { parse: csvParse } = require('csv-parse');
// ... omitted for brevity
await fastify.register(fastifyMultipart, {
    // [1]
    attachFieldsToBody: 'keyValues',
    sharedSchemaId: 'schema:todo:import:file', // [2]
    async onFile(part) {
        // [3]
        const lines = [];
        const stream = part.file.pipe(
            csvParse({
                // [4]
                bom: true,
                skip_empty_lines: true,
                trim: true,
                columns: true,
            })
        );
        for await (const line of stream) {
            // [5]
            lines.push({
                title: line.title,
                done: line.done === 'true',
            });
        }
        part.value = lines; // [6]
    },
    limits: {
        fieldNameSize: 50,
        fieldSize: 100,
        fields: 10,
        fileSize: 1_000_000,
        files: 1,
    },
});

fastify.route({
    method: 'POST',
    url: '/import',
    handler: async function listTodo(request, reply) {
        const inserted = await request.todosDataSource.createTodos(
            request.body.todoListFile
        ); // [7]
        reply.code(201);
        return inserted;
    },
});
// ... omitted for brevity
```

Let’s go through the code execution:

-   First, we register the `@fastify/multipart` plugin to the Fastify instance (`[1]`).
-   To be able to access the content of the uploaded file directly from `request.body`, we pass the `attachFieldsToBody` and `sharedSchemaId` options (`[2]`).
-   Next, we specify the `onFile` option property (`[3]`) to handle incoming streams. This function will be called for every file in the incoming request.
-   Then, we use the `csvParse` library to transform the file into a stream of lines (`[4]`).
-   A `for await` loop iterates over each parsed line (`[5]`) and transforms the data from each line, adding it to the `lines` array, and we assign the array to `part.value` (`[6]`).
-   Finally, thanks to the options we passed to `@fastify/multipart`, we can access the `lines` array directly from `request.body.todoListFile` and use it as the argument for the `createTodos` method (`[7]`).

Once more, we are omitting the `createTodos` implementation, which can be found in the GitHub repository.

We can now move on to the endpoint for tasks exporting. The following snippet shows the implementation:

```js
fastify.route({
    method: 'GET',
    url: '/export',
    schema: {
        querystring: fastify.getSchema(
            'schema:todo:list:export'
        ),
    },
    handler: async function listTodo(request, reply) {
        const { title } = request.query;
        const cursor = await request.todosDataSource.listTodos(
            {
                // [1]
                filter: { title },
                skip: 0,
                limit: undefined,
                asStream: true, // [2]
            }
        );
        reply.header(
            'Content-Disposition',
            'attachment;filename="todo-list.csv"'
        );
        reply.type('text/csv'); //[3]
        return cursor.pipe(
            csvStringify({
                // [4]
                quoted_string: true,
                header: true,
                columns: [
                    'title',
                    'done',
                    'createdAt',
                    'updatedAt',
                    'id',
                ],
                cast: {
                    boolean: (value) =>
                        value ? 'true' : 'false',
                    date: (value) => value.toISOString(),
                },
            })
        );
    },
});
```

We call the `listTodos` method of the `request.todosDataSource` (`[1]`) object to retrieve the list of to-do tasks that match the optional `title` parameter. If no title is passed, then the method will return all items. Moreover, thanks to our authentication layer, we know they will be automatically filtered based on the current user. The `asStream` option is set to `true` to handle cases where the data could be massive (`[2]`). The `Content-Disposition` header is set to specify that the response is an attachment with a filename of `todo-list.csv` (`[3]`). Finally, the cursor stream is piped to the `csvStringify` function to convert the data to a CSV file, which is then returned as the response body (`[4]`).

With this last section, we significantly increased the capabilities of our application, allowing users to import and export their tasks efficiently.

## Summary {#summary}

In this chapter, we added an authentication layer to ensure that only registered users can perform actions on the to-do items. Moreover, thanks to the modest authorization layer, we ensured that users could only access tasks they created. Finally, we showed how simple upload and download capabilities are to implement using a real-world example of bulk imports and exports.

In the next chapter, we will learn how to make our application reliable in production. We will use the tools that Fastify integrates to test our endpoints thoroughly. We want to prevent introducing any disruptions for our users because of lousy code pushed to production.
