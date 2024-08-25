# Working with Routes

Applications would not exist without routes. Routes are the doors to those clients that need to consume your API. In this chapter, we will present more examples, focusing on how to become more proficient at managing routes and keeping track of all our endpoints. We will cover all the possibilities that Fastify offers to define new endpoints and manage the application without giving you a headache.

It is worth mentioning that Fastify supports async/await handlers out of the box, and it is crucial to understand its implications. You will look at the difference between sync and async handlers, and you will learn how to avoid the major pitfalls. Furthermore, we will learn how to handle URL parameters, the HTTP request’s body input, and query strings too.

Finally, you will understand how the router works in Fastify, and you will be able to control the routing to your application’s endpoint as never before.

In this chapter, we will cover the following topics:

-   Declaring API endpoints and managing errors
-   Routing to the endpoint
-   Reading the client’s input
-   Managing the route’s scope
-   Adding new behaviors to routes

## Technical requirements

As mentioned in the previous chapters, you will need the following:

-   A working Node.js 18 installation
-   A text editor to try the example code
-   An HTTP client to test out code such as CURL or Postman

All the snippets in this chapter are available on GitHub at <https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%203>.

## Declaring API endpoints and managing the errors

An endpoint is an interface that your server exposes to the outside, and every client with the coordinates of the route can call it to execute the application’s business logic.

Fastify lets you use the software architecture you like most. In fact, this framework doesn’t limit you from adopting **Representation State Transfer (REST)**, **GraphQL**, or simple **Application Programming Interfaces (APIs)**. The first two architectures standardize the following:

-   The application endpoints: The standard shows you how to expose your business logic by defining a set of routes
-   The server communication: This provides insights into how you should define the input/output

In this chapter, we will create simple **API** endpoints with JSON input/output interfaces. This means that we have the freedom to define an internal standard for our application; this choice will let us focus on using the Fastify framework instead of following the standard architecture.

In any case, in [_Chapter 7_](../real-project/restful-api.md), we will learn how to build a **REST** application, and in [_Chapter 14_](../advanced/graphql.md), we will find out more about using **GraphQL** with Fastify.

!!!note "Too many standards"

    Note that the **JSON:API** standard exists too: <https://jsonapi.org/>. Additionally, Fastify lets you adopt this architecture, but that topic will not be discussed in this book. Check out <https://backend.cafe/> to find more content about Fastify and this book!

In the following sections, we assume you already understand the anatomy of an HTTP request and the differences between its parts, such as a query parameter versus body input. A great resource to rehearse these concepts is the Mozilla site: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages>.

### Declaration variants

In previous chapters, we learned how to create a Fastify server, so we will assume you can create a new project (or, if you have trouble doing so, you can read [_Chapter 1_](./what-is-fastify.md)).

In the same chapter, we pointed out the two syntaxes you can use to define routes:

-   The generic declaration, using `app.route(routeOptions)`
-   The shorthand syntax: `app.<HTTP method>(url[, routeOptions], handler)`

The second statement is more expressive and readable when you need to create a small set of endpoints, whereas the first one is extremely useful for adding automation and defining very similar routes. Both declarations expose the same parameters, but it is not only a matter of preference. Having to choose one over the other can negatively impact your code base at scale. In this chapter, we will learn how to avoid this pitfall and how to choose the best syntax based on your needs.

Before starting our coding, we will get a quick overview of the `routeOptions` object, which we will use in the next sections to develop our baseline knowledge, which you can refer to in your future projects.

### The route options

Before learning how to code the application’s routes further, we must preview the `routeOptions` properties (note that some of them will be discussed in the following chapters).

The options are listed as follows:

-   `method`: This is the HTTP method to expose.
-   `url`: This is the endpoint that listens for incoming requests.
-   `handler`: This is the route business logic. We met this property in previous chapters.
-   `logLevel`: This is a specific log level for a single route. We will find out how useful this property can be in [_Chapter 11_](../real-project/logging.md).
-   `logSerializer`: This lets you customize the logging output of a single route, in conjunction with the previous option.
-   `bodyLimit`: This limits the request payload to avoid possible misuse of your endpoints. It must be an integer that represents the maximum number of bytes accepted, overwriting the root instance settings.
-   `constraints`: This option improves the routing of the endpoint. We will learn more about how to use this option in the [Routing to the endpoint](#routing-to-the-endpoint) section.
-   `errorHandler`: This property accepts a special handler function to customize how to manage errors for a single route. The following section will show you this configuration.
-   `config`: This property lets you specialize the endpoint by adding new behaviors.
-   `prefixTrailingSlash`: This option manages some special usages during the route registration with plugins. We will talk about that in the [Routing to the endpoint](#routing-to-the-endpoint) section.
-   `exposeHeadRoute`: This Boolean adds or removes a `HEAD` route whenever you register a `GET` one. By default, it is `true`.

Then, there are many highly specialized options to manage the request validation: `schema`, `attachValidation`, `validatorCompiler`, `serializerCompiler`, and `schemaErrorFormatter`. All these settings will be covered in [_Chapter 5_](./validation-serialization.md).

Finally, you must be aware that every route can have additional hooks that will only run for the route itself. You can just use the hooks names info and the `routeOptions` object to attach them. We will see an example at the end of this chapter. The hooks are the same as we listed in [_Chapter 1_](./what-is-fastify.md): `onRequest`, `preParsing`, `preValidation`, `preHandler`, `preSerialization`, `onSend`, and `onResponse`, and they will take action during the **request life cycle**.

It is time to see these options in action, so let’s start defining some endpoints!

### Bulk routes loading

The generic declaration lets you take advantage of the route automation definition. This technique aims to divide the source code into small pieces, making them more manageable while the application grows.

Let’s start by understanding the power of this feature:

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

We have defined a routes array where each element is Fastify’s `routeOptions` object. By iterating the `routes` variable, we can add the routes programmatically. This will be useful if we split the array by context into `cat.cjs` and `dog.cjs`. Here, you can see the `cat.cjs` code example:

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

By doing the same for the `/dog` endpoint configuration, the server setup can be changed to the following:

```js
const catRoutes = require('./cat.cjs');
const dogRoutes = require('./dog.cjs');
catRoutes.forEach(loadRoute);
dogRoutes.forEach(loadRoute);
function loadRoute(routeOptions) {
    app.route(routeOptions);
}
```

As you can see, the route loading seems more precise and straightforward. Moreover, this code organization gives us the ability to easily split the code and let each context grow at its own pace, reducing the risk of creating huge files that could be hard to read and maintain.

We have seen how the generic `app.route()` method can set up an application with many routes, centralizing the loading within the server definition and moving the endpoint logic to a dedicated file to improve the project’s legibility.

Another way to improve the code base is by using `async`/`await` in the route handler, which Fastify supports out of the box. Let’s discuss this next.

### Synchronous and asynchronous handlers

In [_Chapter 1_](./what-is-fastify.md), we saw an overview of the essential role of the route handler and how it manages the `Reply` component.

To recap briefly, there are two main syntaxes we can adopt. The sync syntax uses callbacks to manage asynchronous code and it must call `reply.send()` to fulfill the HTTP request:

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

In this example, we are simulating two async calls to a readDb function. As you can imagine, adding more and more asynchronous I/O such as files read or database accesses could make the source quickly unreadable, with the danger of falling into callback hell (you can read more about this at http:// callbackhell.com/).

You can rewrite the previous example, using the second syntax to define a route handler, with an async function:

```js
async function asyncHandler(request, reply) {
    const data1 = await readDb();
    const data2 = await readDb();
    return `read from db ${data1} and ${data2}`;
}
```

As you can see, regardless of how many async tasks your endpoint needs to run, the function body can be read sequentially, making it much more readable. This is not the only syntax an async handler supports, and there are other edge cases you could encounter.

### Reply is a Promise

In an `async` function handler, it is highly discouraged to call `reply.send()` to send a response back to the client. Fastify knows that you could find yourself in this situation due to a legacy code update. If this happens, the solution is to return a `reply` object. Here is a quick real-(bad) world scenario:

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

In this example endpoint, the if statement of `[1]` runs the `oldEndpoint` business logic that manages the `reply` object in a different way compared to the `else` case. In fact, the `oldEndpoint` handler was implemented in the callback style. So, how do we tell Fastify that the HTTP response has been delegated to another function? You just need to return the `reply` object of `[2]`! The `Reply` component is a `thenable` interface. This means that it implements the `.then()` interface in the same way as the `Promise` object! Returning it is like producing a promise that will be fulfilled only when the `.send()` method has been executed.

The readability and flexibility of the async handlers are not the only advantages: what about errors? Errors can happen during the application runtime, and Fastify helps us deal with them with widely used defaults.

### How to reply with errors

Generally, in Fastify, an error can be **sent** when the handler function is sync or **thrown** when the handler is async. Let’s put this into practice:

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

As you can see, at first sight, the differences are minimal: in `[1]`, the `send` method accepts a Node.js `Error` object with a custom message. The `[2]` example is quite similar, but we are throwing the error. The `[3]` example shows how you can manage your errors with a `try`/`catch` block and choose to reply with a `200` HTTP `success` in any case!

Now, if we try to add the error management to the `syncHandler` example, as shown previously, the sync function becomes the following:

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

The `callback` style strives to be lengthy and hard to read. Instead, the `asyncHandler` function shown in the code block of the [Synchronous and asynchronous](#synchronous-and-asynchronous-handlers) section doesn’t need any updates. This is because the error thrown will be managed by Fastify, which will send the error response to the client.

So far, we have seen how to reply to an HTTP request with a Node.js `Error` object. This action sends back a JSON payload with a 500 status code response if you didn’t set it using the `reply.code()` method that we saw in [_Chapter 1_](./what-is-fastify.md).

The default JSON output is like the following:

```json
{
    "statusCode": 500,
    "error": "Internal Server Error",
    "message": "app error"
}
```

The `new Error('app error')` code creates the error object that produces the previous output message.

Fastify has many ways to customize the error response, and usually, it depends on how much of a hurry you are in. The options are listed as follows:

-   Adopt the default Fastify output format: This solution is ready to use and optimized to speed up the error payload serialization. It works great for rapid prototyping.
-   Customize the error handler: This feature gives you total control of the application errors.
-   Custom response management: This case includes a call to `reply.code(500).send(myJsonError)` providing a JSON output.

Now we can better explore these options.

Adopting the default Fastify error output is very simple because you need to **throw** or **send** an `Error` object. To tweak the body response, you can customize some `Error` object fields:

```js
const err = new Error('app error') // [1]
err.code = ‹ERR-001› // [2]
err.statusCode = 400 // [3]
```

This example configuration maps the following:

1.  The String message, which is provided in the `Error` constructor as the `message` field.
2.  The optional `code` field to the same JSON output key.
3.  The `statusCode` parameter, which will change the HTTP status code response and the `error` string. The output string is set by the default Node.js `http.STATUS_CODES` module.

The result of the previous example will produce the following output:

```json
{
    "statusCode": 400,
    "code": "ERR001",
    "error": "Bad Request",
    "message": "app error"
}
```

This payload might not be informative for the client because it contains a single error. So, if we want to change the output to an array of errors when more than one error happens, such as form validation, or if you need to change the output format to adapt it to your API ecosystem, you must know the `ErrorHandler` component:

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

The error handler is a function that is executed whenever an `Error` object or a JSON is **thrown** or _sent_; this means that the error handler is the same regardless of the implementation of the route. Earlier, we said that a JSON is **thrown**: trust me, and we will explain what that means later in this section.

The error handler interface has three parameters:

-   The first one is the object that has been thrown or the `Error` object that has been sent.
-   The second is the `Request` component that originated the issue
-   The third is the `Reply` object to fulfill the HTTP request as a standard route handler

The error handler function might be an async function or a simple one. As for the route handler, you should return the response payload in case of an async function, and call `reply.send()` for the sync implementation. In this context, you can’t throw or send an `Error` instance object. This would create an infinite loop that Fastify manages. In this case, it will skip your custom error handler, and it will call the parent scope’s error handler or the default one if it is not set. Here is a quick example:

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

In the preceding code snippet, we have a `plugin` function that has a `childPlugin` context. Both these encapsulated contexts have one custom error handler function. If you try to request `GET /deep` `[1]`, an error will be thrown. It will be managed by the `second` error handler function that will decide whether to handle it or re-throw it `[2]`. When the failure is re-thrown `[3]`, the parent scope will intercept the error and handle it `[4]`. As you can see, you can implement a series of functions that will handle a subset of the application’s errors.

It is crucial to keep in mind that you should take care of the response status code when you implement your error handler; otherwise, it will be **500 – Server Error** by default.

As we saw in the preceding example, the error handler can be assigned to the application instance and a plugin instance. This will set up the handler for all the routes in their context. This means that the error handler is fully encapsulated, as we learned in [_Chapter 2_](./plugin-system.md).

Let’s see a quick example:

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

We have defined a bad route handle, `errorTrigger`, that will always throw an `Error`. Then, we registered two routes:

-   The `GET /customError` `[1]` route is inside a plugin, so it is in a new Fastify context.
-   The root application instance registers the `GET /defaultError` `[2]` route instead.

We set `pluginInstance.setErrorHandler`, so all the routes registered inside that plugin and its children’s contexts will use your custom error handler function during the plugin creation. Meanwhile, the app’s routes will use the default error handler because we didn’t customize it.

At this stage, making an HTTP request to those endpoints will give us two different outputs, as expected:

-   The `GET /customError` route triggers the error, and it is managed by the custom error handler, so the output will be `{"ok":false}`.
-   The `GET /defaultError` endpoint replies with the Fastify default JSON format that was shown at the beginning of this section.

It is not over yet! Fastify implements an outstanding **granularity** for most of the features it supports. This means that you can set a custom error handler for every route!

Let’s add a new endpoint to the previous example:

```js
app.get('/routeError', {
    handler: errorTrigger,
    errorHandler: async function (error, request, reply) {
        request.log.error(error, 'a route error happened');
        return { routeFail: false };
    },
});
```

First of all, during the endpoint definition, we must provide the `routeOptions` object to set the custom `errorHandler` property. The function parameter is the same as the `setErrorHandler` method. In this case, we switched to an async function: as already mentioned, this format is supported too.

Finally, the last option you might implement to return an error is calling `reply.send()`, like you would do when sending data back to the client:

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

## Routing to the endpoint

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

### The 404 handler

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

### Router application tuning

Fastify is highly customizable in every component: the router is one of them. You are going to learn how to tweak the router settings, to make the router more flexible and deal with a client’s common trouble. It is important to understand these settings to anticipate common issues and to build a great set of APIs on the first try!

#### The trailing slash

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

#### Case-insensitive URLs

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

#### Rewrite URL

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

### Registering the same URLs

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
app.get('/host', func0)
app.get('/host', {
  handler: func2,
  constraints: {
    host: /^bar.*/
  }
})
app.get('/together, func0)
app.get('/together', {
  handler: func1,
  constraints: {
    version: '1.0.1',
    host: 'foo.fastify.dev'
  }
})
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

## Reading the client’s input

Every API must read the client’s input to behave. We already mentioned the four HTTP request input types, which are supported by Fastify:

-   The path parameters are positional data, based on the endpoint’s URL format
-   The query string is an additional part of the URL the client adds to provide variable data
-   The headers are additional `key:value` pairs that pair information passing between the client and the server
-   The body is the request payload that contains the client’s data submission

Let’s take a look at each in more detail.

### The path parameters

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

### The query string

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

### The headers

The headers are a key-value map that can be read as a JSON object within the `request.headers` property. Note that, by default, Node.js will apply a lowercase format to every header’s key. So, if your client sends to your Fastify server the `CustomHeader: AbC` header, you must access it with the `request.headers.customheader` statement.

This logic follows the HTTP standard that stands for case-insensitive field names.

If you need to get the original headers sent by the client, you must access the `request.raw.rawHeaders` property. Consider that `request.raw` gives you access to the Node.js `http.IncomingMessage` object, so you are free to read data added to the Node.js core implementation, such as the raw headers.

### The body

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

## Managing the route’s scope

In Fastify, an endpoint has two central aspects that you will set when defining a new route:

1.  The route configuration
2.  The server instance, where the route has been registered

This metadata controls how the route behaves when the client calls it. Earlier in this chapter, we saw the first point, but now we must deepen the second aspect: the server instance context. The **route’s scope** is built on top of the server’s instance context where the entry point has been registered. Every route has its own route scope that is built during the startup phase, and it is like a settings container that tracks the handler’s configuration. Let’s see how it works.

### The route server instance

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

### Printing the routes tree

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

## Adding new behaviors to routes

At the beginning of this chapter, we learned how to use the `routeOptions` object to configure a route, but we did not talk about the `config` option!

This simple field gives us the power to do the following:

-   Access the config in the handler and hook functions
-   Implement the **Aspect-Oriented Programming (AOP)** that we are going to see later

How does it work in practice? Let’s find out!

### Accessing the route’s configuration

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

### AOP

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

## Summary

This chapter has explained how routing works in Fastify, from route definition to request evaluation.

Now, you know how to add new endpoints and implement an effective handler function, both async or sync, with all the different aspects that might impact the request flow. You know how to access the client’s input to accomplish your business logic and reply effectively with a success or an error.

We saw how the server context could impact the route handler implementation, executing the hooks in that encapsulated context and accessing the decorators registered. Moreover, you learned how to tweak the route initialization by using the `onRoute` hook and the route’s `config`: using Fastify’s features together gives us new ways to build software even more quickly!

The routing has no more secrets for you, and you can define a complete set of flexible routes to evolve thanks to the constraints and manage a broad set of real-world use cases to get things done.

In the next chapter, we will discuss, in detail, one of Fastify’s core concepts, which we have already mentioned briefly and seen many times in our examples: hooks and decorators!
