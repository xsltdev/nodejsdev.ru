# Authentication, Authorization, and File Handling

In this chapter, we will continue evolving our application, mainly covering two distinct topics: user authentication and file handling. First, we will implement a reusable JWT authentication plugin that will allow us to manage users, authentication, and sessions. It will also act as an authorization layer, protecting our application’s endpoints from unauthorized access. We will also see how decorators can expose the authenticated user’s data inside the route handlers. Then, moving on to file handling, we will develop a dedicated plugin enabling users to import and export their to-do tasks in CSV format.

In this chapter, we will learn about the following:

-   Authentication and authorization flow
-   Building the authentication layer
-   Adding the authorization layer
-   Managing uploads and downloads

## Technical requirements

To follow along with this chapter, you will need these technical requirements mentioned in the previous chapters:

-   A working [Node.js 18 installation](https://nodejs.org/)
-   [VS Code IDE](https://code.visualstudio.com/)
-   An active [Docker installation](https://docs.docker.com/get-docker/)
-   A [Git](https://git-scm.com/) repository is recommended but not mandatory
-   A terminal application

Once more, the code of the project can be found on [GitHub](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%208).

Finally, it’s time to start our exploration. In the next section, we will take a deep dive into the authentication flow in Fastify, understanding all the pieces we need to implement a complete solution.

## Authentication and authorization flow

Authentication and authorization are usually challenging topics. Based on use cases, specific strategies may or may not be feasible. For this project, we will implement the authentication layer via **JSON Web Tokens**, commonly known as **JWTs**.

!!!note "JWT"

    This is a widely used standard for token-based authentication for web and mobile applications. It is an open standard that allows information to be transmitted securely between the client and the server. Every token has three parts. First, the header contains information about the type of token and the cryptographic algorithms used to sign and encrypt the token. Then, the payload includes any metadata about the user. Finally, the signature is used to verify the token’s authenticity and ensure it has not been tampered with.

Before looking at the implementation in Fastify, let’s briefly explore how this **authentication** works. First, the API needs to expose an endpoint for the registration. This route will enable users to create new accounts on the service. After the account is created correctly, the user can perform authenticated operations against the server. We can break them down into seven steps:

1.  To initiate the authentication process, the user provides their username and password to the server via a specific endpoint.
2.  The server verifies the credentials and, if valid, creates a JWT containing the user’s metadata using the shared secret.
3.  The server returns the token to the client.
4.  The client stores the JWT in a secure location. Inside the browser, it is usually local storage or a cookie.
5.  On subsequent requests to the server, the client sends the JWT in the `Authorization` header of each HTTP request.
6.  The server verifies the token by checking the signature, and if the signature is valid, it extracts the user’s metadata from the payload.
7.  The server uses the user ID to look up the user in the database.

From here on, the request is handled by the **authorization** layer. First, it must check whether the current user has the necessary permissions to perform the action or access the specified resource. Then, based on the result of the check operation, the server can answer with the resource or an HTTP `Unauthorized` error. They are many standardized ways of implementing authorization. In this book, we will implement our simple solution from scratch for exposition purposes.

!!!note "Authentication versus authorization"

    Even if these terms are often used together, they express two completely different concepts. Authentication describes _who_ is allowed to access the service. On the other hand, authorization defines _what_ actions can be performed by the user once authenticated.

The authorization and authentication layers are crucial to building secure web applications. Controlling access to resources helps to prevent unauthorized access and protect sensitive data from potential attacks or breaches.

In the next section, we will start from where we left the code in [Chapter 7](./restful-api.md), implementing a new application-level plugin for authentication.

## Building the authentication layer

Since we need to add new non-trivial functionality to our application, we need to implement mainly two pieces:

-   An authentication plugin to generate tokens, check the incoming requests, and revoke old or not used tokens
-   A bunch of new routes to handle the registration, authentication, and life cycle of the tokens

Before jumping directly into the code, we need to add one last note. In this chapter’s code snippets, we will use a new data source called `userDataSource` (`[1]`). Since it exposes only `createUser` (`[3]`) and `readUser` (`[2]`) methods and the implementation is trivial, we will not show it in this book. However, the complete code is in the `./routes/auth/autohooks.js` file inside the GitHub repository.

Since we must implement both, we can add the authentication plugin first.

### Authentication plugin

First, create the `./plugins/auth.js` file inside the project’s root folder. The `auth.js` code snippet shows the implementation of the plugin:

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

We create and export a Fastify plugin that provides authentication functionalities via decorators and the JWT library. But first, let’s take a look at the implementation details:

-   We require the official `@fastify/jwt` package (`[1]`). It handles low-level primitives around the tokens and lets us focus only on the logic we need inside our application.
-   Generally speaking, keeping a trace of the invalidated tokens is always a good idea. `revokedTokens` creates a Map instance (`[2]`) to keep track of them. Later, we will use it to ban invalid tokens.
-   We register the `@fastify/jwt` plugin on the Fastify instance (`[3]`), passing the `JWT_SECRET` environment variable and `isTrusted` function that checks whether a token is trusted. In a subsequent section, we will add `JWT_SECRET` to our server’s configuration to ensure its presence after the boot.
-   We decorate the Fastify instance with the `authenticate` function to verify that the client’s token is valid before allowing access to protected routes. The `request.jwtVerify()` (`[5]`) method comes from `@fastify/jwt`. If errors are thrown during the verification, the function replies to the client with the error. Otherwise, the `request.user` property will be populated with the current user.
-   The `revokeToken` function is added to the Fastify instance (`[6]`). It adds a token to the map of invalid tokens. We use the `jti` property as the invalidation key.
-   The `generateToken` function creates a new token from user data (`[7]`). Then, we decorate a request with this function to access its context through `this` reference. The `fastify.jwt.sign` method is once more provided by the `@fastify/jwt` library.

Thanks to the project setup from the previous chapters, this plugin will be automatically registered to the main Fastify instance inside `./apps.js` during the boot phase.

We can leave this file as is for now since we will start using the decorated methods inside our application in a dedicated section. Now, it is time to add the authentication layer routes, and we will do it in the following subsection.

### Authentication routes

The time has come to implement a way for the users to interact with our authentication layer. The `./ routes/auth` folder structure mimics the `todos` module we explored in [Chapter 7](./restful-api.md). It contains `schemas`, `autohooks.js`, and `routes.js`. We will look only at `routes.js` in the book for brevity’s sake. The rest of the code is straightforward and can be found in the GitHub [repository](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%208).

Since the code of `./routes/auth/routes.js` is pretty long, we will split it into single snippets, one per route definition. But first, to get a general idea of the plugin, the following snippet contains the whole code while omitting the implementations:

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

#### Register route

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

#### Authenticate route

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

#### Refresh route

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

### Logout route

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

## Adding the authorization layer

Now that we can have all authentication pieces in place, we can finally move on to implementing the authorization layer of our application. To adequately protect our endpoints, we need to do two main things to the `./routes/todos` module from [Chapter 7](./restful-api.md):

-   Add the authentication layer to `./routes/todos/routes.js`
-   Update the to-do data source inside `./routes/todos/autohook.js`

Fortunately, we need only a one-liner change to implement the first point. On the other hand, the second point is more complex. We will examine both in the following subsections.

### Adding the authentication layer

Let’s start with the simpler task. As we already said, this is a fast addition to the [Chapter 7](./restful-api.md) code that we can see in the following snippet:

```js
module.exports = async function todoRoutes(fastify, _opts) {
    fastify.addHook('onRequest', fastify.authenticate); // [1]
    // omitted route implementations from chapter 7
};
```

To protect our to-do routes, we add the `onRequest` `fastify.authenticate` hook (`[1]`), which we previously used for authentication routes. This hook will check whether the incoming request has the authentication HTTP header, and after validating it, it will add the `user` information object to the request.

### Updating the to-do data source

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

## Managing uploads and downloads

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

## Summary

In this chapter, we added an authentication layer to ensure that only registered users can perform actions on the to-do items. Moreover, thanks to the modest authorization layer, we ensured that users could only access tasks they created. Finally, we showed how simple upload and download capabilities are to implement using a real-world example of bulk imports and exports.

In the next chapter, we will learn how to make our application reliable in production. We will use the tools that Fastify integrates to test our endpoints thoroughly. We want to prevent introducing any disruptions for our users because of lousy code pushed to production.
