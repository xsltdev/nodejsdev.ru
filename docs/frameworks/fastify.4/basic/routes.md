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

**75**
