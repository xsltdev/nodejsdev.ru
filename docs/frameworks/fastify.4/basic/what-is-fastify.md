# What Is Fastify?

Nowadays, building a solid application is just not enough, and the time it takes to get an application to market has become one of the major constraints a development team must deal with. For this reason, Node.js is the most used runtime environment currently adopted by companies. Node.js has proved how easy and flexible it is to build web applications. To compete in this tech scene that moves at the speed of light, you need to be supported by the right tools and frameworks to help you implement solid, secure, and fast applications. The pace is not only about the software performance, but it is also important to take the time to add new features and to keep the software reliable and extensible. Fastify gives you a handy development experience without sacrificing performance, security, and source readability. With this book, you will get all the knowledge to use this framework in the most profitable way.

This chapter will explain what Fastify is, why it was created, and how it can speed up the development process. You will become confident with the basic syntax to start your application, add your first endpoints, and learn how to configure your server to overview all the essential options.

You will start to explore all the features this framework offers, and you will get your hands dirty as soon as possible. There is a first basic example that we will implement to explain the peculiarities of the framework. We will analyze the environment configuration and how to shut down the application properly.

In this chapter, we will cover the following topics:

-   What is Fastify?
-   Starting your server
-   Adding basic routes
-   Adding a basic plugin instance
-   Understanding configuration types
-   Shutting down the application

## Technical requirements

Before proceeding, you will need a development environment to write and execute your first Fastify code. You should configure:

-   A text editor or an IDE such as VS Code
-   Node.js v18 or above (you can find this here: <https://nodejs.org/it/download/>)
-   An HTTP client to test out code; you may use a browser, CURL, or Postman

All the code examples in this chapter may be found on GitHub at <https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%201>.

## What is Fastify?

**Fastify** is a Node.js web framework used to build server applications. It helps you develop an HTTP server and create your API in an easy, fast, scalable, and secure way!

It was born in late 2016, and since its first release in 2018, it has grown at the speed of light. It joined the _OpenJS Foundation_ as an At-Large project in 2020 when it reached version 3, which is the version we are going to work with!

This framework focuses on unique aspects that are uncommon in most other web frameworks:

-   Improvement of the developer experience: This streamlines their work and promotes a **plugin design system**. This architecture helps you structure your application in smaller pieces of code and apply good programming patterns such as **DRY (Don’t Repeat Yourself)**, **Immutability**, and **Divide & Conquer**.
-   Comprehensive performance: This framework is built to be the fastest.
-   Up to date with the evolution of the Node.js runtime: This includes quick bugfixes and feature delivery.
-   Ready to use: Fastify helps you set up the most common issues you may face during the implementation, such as application logging, security concerns, automatic test implementation, and user input parsing.
-   Community-driven: Supports and listens to the framework users.

The result is a flexible and highly extensible framework that will lead you to create reusable components. These concepts give you the boost to develop a **proof of concept (PoC)** or large applications faster and faster. Creating your plugin system takes less time to meet the business need without losing the possibility to create an excellent code base and a performant application.

Moreover, Fastify has a clear Long Term Support (LTS) policy that supports you while planning the updates of your platform and that stays up to date with the Node.js versions and features.

Fastify provides all these aspects to you through a small set of components that we are going to look at in the next section.

### Fastify’s components

Fastify makes it easier to create and manage an HTTP server and the HTTP request lifecycle, hiding the complexity of the Node.js standard modules. It has two types of components: the **main components** and **utility elements**. The former comprise the framework, and it is mandatory to deal with them to create an application. The latter includes all the features you may use at your convenience to improve the code reusability.

The main components that are going to be the main focus of this book and that we are going to discuss in this chapter are:

-   The **root application instance** represents the Fastify API at your disposal. It manages and controls the standard Node.js `http.Server` class and sets all the endpoints and the default behavior for every request and response.
-   A **plugin instance** is a child object of the application instance, which shares the same interface. It isolates itself from other sibling plugins to let you build independent components that can’t modify other contexts. [_Chapter 2_](./plugin-system.md) explores this component in depth, but we will see some examples here too.
-   The `Request` object is a wrapper of the standard Node.js `http.IncomingMessage` that is created for every client’s call. It eases access to the user input and adds functional capabilities, such as logging and client metadata.
-   The `Reply` object is a wrapper of the standard Node.js `http.ServerResponse` and facilitates sending a response back to the user.

The utility components, which will be further discussed in [_Chapter 4_](./hooks.md) are:

-   The **hook** functions that act, when needed, during the lifecycle of the application or a single request and response
-   The **decorators**, which let you augment the features installed by default on the main components, avoiding code duplication
-   The **parsers**, which are responsible for the request’s payload conversion to a primitive type

That’s all! All these parts work together to provide you with a toolkit that supports you during every step of your application lifetime, from prototyping to testing, without forgetting the evolution of your code base to a manageable one.

!!!note "Many names for one component"

    It is essential to learn the component’s name, especially the plugin instance one. It has many synonyms, and the most common are plugin, instance, or child instance. The Fastify official documentation uses these terms broadly and interchangeably, so it is beneficial to keep them all in mind.

We have read about all the actors that build Fastify’s framework and implement its focus aspects. Thanks to this quick introduction, you know their names, and we will use them in the following sections. The following chapters will further discuss every component and unveil their secrets.

## Starting your server

Before we start with Fastify, it is necessary to set up a developing environment. To create an empty project with `npm`, open your system’s `shell` and run the following commands:

```sh
mkdir fastify-playground
cd fastify-playground/
npm init –-yes
npm install fastify
```

These commands create an empty folder and initialize a Node.js project in the new directory; you should see a successful message on each npm `<command>` execution.

Now, we are ready to start an HTTP server with Fastify, so create a new `starts.cjs` file and check out these few lines:

```js
const fastify = require('fastify'); // [1]
const serverOptions = {
    // [2]
    logger: true,
};
const app = fastify(serverOptions); // [3]
app.listen({
    port: 8080,
    host: '0.0.0.0',
}).then((address) => {
    // [4]
    // Server is now listening on ${address}
});
```

Let’s break up each of the elements of this code. The imported framework is a factory function `[1]` that builds the Fastify server **root application instance**.

!!!note "Book code style"

    All the book’s code snippets are written in **CommonJS (CJS)**. The CJS syntax has been preferred over **ECMAScript Modules (ESM)** because it is not yet fully supported by tools such as **application performance monitoring (APM)** or test frameworks. Using the `require` function to import the modules lets us focus on code, avoiding issues that can’t be covered in this book.

The factory accepts an optional JSON object input `[2]` to customize the server and its behavior — for instance, supporting HTTPS and the HTTP2 protocol. You will get a complete overview of this matter later on in this chapter. The application instance, returned by the factory, lets us build the application by adding routes to it, configuring and managing the HTTP server’s start and stop phases.

After the server has built our instance `[3]`, we can execute the `listen` method, which will return a `Promise`. Awaiting it will start the server `[4]`. This method exposes a broad set of interfaces to configure where to listen for incoming requests, and the most common is to configure the `PORT` and `HOST`.

!!!note "listen"

    Calling `listen` with the `0.0.0.0` host will make your server accept any unspecified IPv4 addresses. This configuration is necessary for a Docker container application or in any application that is directly exposed on the internet; otherwise, external clients won’t be able to call your HTTP server.

To execute the previous code, you need to run this command:

```sh
node starts.cjs
```

This will start the Fastify server, and calling the <http://localhost:8080/> URL with an HTTP client or just a browser must show a 404 response because we didn’t add any route yet.

Congratulations—you have started your first Fastify server! You can kill it by pressing the ++ctrl+c++ or ++cmd+c++ buttons.

We have seen the root instance component in action. In a few lines of code, we were able to start an HTTP server with no burden! Before continuing to dig into the code, in the next section, we will start understanding what Fastify does under the hood when we start it.

### Lifecycle and hooks overview

Fastify implements two systems that regulate its internal workflow: the **application lifecycle** and the **request lifecycle**. These two lifecycles trigger a large set of events during the application’s lifetime. Listening to those events will let us customize the data flow around the endpoints or simply add monitoring tools.

The application lifecycle tracks the status of the application instance and triggers this set of events:

-   The `onRoute` event acts when you add an endpoint to the server instance
-   The `onRegister` event is unique as it performs when a new **encapsulated context** is created
-   The `onReady` event runs when the application is ready to start listening for incoming HTTP requests
-   The `onClose` event executes when the server is stopping

All these events are Fastify’s hooks. More specifically, a function that runs whenever a specific event happens in the system is a **hook**. The hooks that listen for application lifecycle events are called **application hooks**. They can intercept and control the application server boot phases, which involve:

-   The routes’ and plugins’ initialization
-   The application’s start and close

Here is a quick usage example of what happens after adding this code before the `listen` call in the previous code block:

```js
app.addHook('onRoute', function inspector(routeOptions) {
    console.log(routeOptions);
});
app.addHook('onRegister', function inspector(
    plugin,
    pluginOptions
) {
    console.log(
        'Chapter 2, Plugin System and Boot Process'
    );
});
app.addHook('onReady', function preLoading(done) {
    console.log('onReady');
    done();
});
app.addHook('onClose', function manageClose(done) {
    console.log('onClose');
    done();
});
```

We see that there are two primary API interfaces for these hooks:

-   The `onRoute` and the `onRegister` hooks have some object arguments. These types can only manipulate the input object adding side effects. A side effect changes the object’s properties value, causing new behavior of the object itself.
-   The `onReady` and `onClose` hooks have a callback style function input instead. The `done` input function can impact the application’s startup because the server will wait for its completion until you call it. In this timeframe, it is possible to load some external data and store it in a local cache. If you call the callback with an error object as the first parameter, `done(new Error())`, the application will listen, and the error will bubble up, crashing the server startup. So, it’s crucial to load relevant data and manage errors to prevent them from blocking the server.

As presented in the preceding example, running our source code will print out only the `onReady` string in the console. Why are our hooks not running? This happens because the events we are listening to are not yet triggered. They will start working by the end of this chapter!

Note that whenever a Fastify interface exposes a `done` or `next` argument, you can omit it and provide an async function instead. So, you can write:

```js
app.addHook('onReady', async function preLoading() {
    console.log('async onReady');
    // the done argument is gone!
});
```

If you don’t need to run async code execution such as I/O to the filesystem or to an external resource such as a database, you may prefer the callback style. It provides a simple function within the `done` argument, and is slightly more performant than an async function!

You can call the `addHook()` method multiple times to queue the hooks’ functions. Fastify guarantees to execute them all in the order of addition.

All these phases can be schematized into this execution flow:

![Figure 1.1 – Application lifecycle](./what-is-fastify1.png)

<center>Figure 1.1 – Application lifecycle</center>

At the start of the application, the `onRoute` and `onRegister` hooks are executed whenever a new route or a new encapsulated context is created (we will discuss the encapsulated context by the end of this chapter, in the [_Adding a basic plugin instance_](#adding-a-basic-plugin-instance) section). The dashed lines in _Figure 1.1_ mean that these hooks’ functions are run synchronously and are not awaited before the server starts up. When the application is loaded, the `onReady` hooks queue is performed, and the server will start listening if there are no errors during this startup phase. Only after the application is up and running will it be able to receive stop events. These events will start the closing stage, during which the `onClose` hooks’ queue will be executed before stopping the server. The closing phase will be discussed in the [_Shutting down the application_](#shutting-down-the-application) section.

The request lifecycle, instead, has a lot more events. But keep calm — [_Chapter 4_](./hooks.md) talks about them extensively, and you will learn how to use them, why they exist, and when you should use them. The hooks listening to the request’s lifecycle events are **request and reply hooks**. This lifecycle defines the flow of every HTTP request that your server will receive. The server will process the request in two phases:

• The routing: This step must find the function that must evaluate the request • The handling of the request performs a set of events that compose the request lifecycle

The request triggers these events in order during its handling:

1.  `onRequest`: The server receives an HTTP request and routes it to a valid endpoint. Now, the request is ready to be processed.
2.  `preParsing` happens before the evaluation of the request’s body payload.
3.  The `preValidation` hook runs before applying **JSON Schema validation** to the request’s parts. Schema validation is an essential step of every route because it protects you from a malicious request payload that aims to leak your system data or attack your server. [_Chapter 5_](./validation-serialization.md) discusses this core aspect further and will show some harmful attacks.
4.  `preHandler` executes before the endpoint handler.
5.  `preSerialization` takes action before the response payload transformation to a String, a Buffer, or a Stream, in order to be sent to the client.
6.  `onError` is executed only if an error happens during the request lifecycle.
7.  `onSend` is the last chance to manipulate the response payload before sending it to the client.
8.  `onResponse` runs after the HTTP request has been served.

We will see some examples later on. I hope you have enjoyed the spoilers! But first, we must deep dive into the Fastify server to understand how to use it and how it interacts with the lifecycle.

### The root application instance

The root application instance is the main API you need to create your API. All the functions controlling the incoming client’s request must be registered to it, and this provides a set of helpers that let you best organize the application. We have already seen how to build it using the `const app = fastify(serverOptions)` statement. Now, we will present a general overview of the possible options to configure and use this object.

#### Server options

When you create a Fastify server, you have to choose some key aspects before starting the HTTP server. You may configure them, providing the option input object, which has many parameters listed in the [Fastify documentation](https://www.fastify.io/docs/latest/Reference/Server/).

Now, we will explore all the aspects you can set with this configuration:

-   The `logger` parameter gives you the control to adapt the default logger to your convenience and system infrastructure to archive distributed logging and meaningful logs; [_Chapter 11_](../real-project/logging.md) will discuss broadly how to best set up these parameters.
-   `https: object` sets up the server to listen for **Transport Layer Security (TLS)** sockets. We will see some examples later on in [_Chapter 7_](../real-project/restful-api.md).
-   `keepAliveTimeout`, `connectionTimeout`, and `http2SessionTimeout` are several timeout parameters after which the HTTP request socket will be destroyed, releasing the server resources. These parameters are forwarded to the standard Node.js `http.Server`.
-   Routing customization to provide stricter or laxer constraints — for instance, a case-insensitive URL and more granular control to route a request to a handler based on additional information, such as a request header instead of an HTTP method and HTTP URL. We will cover this in [_Chapter 3_](./routes.md).
-   `maxParamLength: number<length>` limits the path parameter string length.
-   `bodyLimit: number<byte>` caps the request body payload size.
-   `http2: boolean` starts an HTTP2 server, which is useful to create a long-lived connection that optimizes the exchange of data between client and server.
-   The `ajv` parameter tweaks the validation defaults to improve the fit of your setup. [_Chapter 5_](./validation-serialization.md) will show you how to use it.
-   The `serverFactory: function` manages the low-level HTTP server that is created. This feature is a blessing when working in a serverless environment.
-   The `onProtoPoisoning` and `onConstructorPoisoning` default security settings are the most conservative and provide you with an application that's secure by default. Changing them is risky and you should consider all the security issues because it impacts the default request body parser and can lead to code injection. [_Chapter 4_](./hooks.md) will show you an example of these parameters in action.

Are you overwhelmed by all these options? Don’t worry. We are going to explore some of them with the following examples. The options provided not only allow you to adapt Fastify to a wide range of general use cases but extend this possibility to edge cases as well; usually, you may not need to configure all these parameters at all. Just remember that default settings are ready for production and provide the most secure defaults and the most useful utilities, such as `404 Not Found` and `500 Error` handlers.

#### Application instance properties

The Fastify server exposes a set of valuable properties to access:

-   An `app.server` getter that returns the Node.js standard `http.Server` or `https.Server`.
-   `app.log` returns the application logger that you can use to print out meaningful information.
-   `app.initialConfig` to access the input configuration in read-only mode. It will be convenient for plugins that need to read the server configuration.

We can see them all in action at the server startup:

```js
await app.listen({
    port: 0,
    host: '0.0.0.0',
});
app.log.debug(
    app.initialConfig,
    'Fastify listening with the config'
);
const { port } = app.server.address();
app.log.info('HTTP Server port is %i', port);
```

Setting the port parameter to 0 will ask the operating system to assign an unused host’s port to your HTTP server that you can access through the standard Node.js `address()` method. Running the code will show you the output log in the console, which shows the server properties.

Unfortunately, we won’t be able to see the output of the `debug` log. The log doesn’t appear because Fastify is protecting us from misconfiguration, so, by default, the log level is at `info`. The log-level values accepted by default are `fatal`, `error`, `warn`, `info`, `debug`, `trace`, and `silent`. We will see a complete log setup in [_Chapter 11_](../real-project/logging.md).

So, to fix this issue, we just need to update our `serverConfig` parameter to the following:

```js
const serverOptions = {
    logger: {
        level: 'debug',
    },
};
```

By doing so, we will see our log printed out on the next server restart! We have seen the instance properties so far; in the next section, we will introduce the server instance methods.

#### Application instance methods

The application instance lets us build the application, adding routes and empowering Fastify’s default components. We have already seen the `app.addHook(eventName, hookHandler)` method, which appends a new function that runs whenever the **request lifecycle** or the **application lifecycle** triggers the registered event.

The methods at your disposal to create your application are:

-   `app.route(options[, handler])` adds a new endpoint to the server.
-   `app.register(plugin)` adds plugins to the server instance, creating a new server context if needed. This method provides Fastify with **encapsulation**, which will be covered in [_Chapter 2_](./plugin-system.md).
-   `app.ready([callback])` loads all the applications without listening for the HTTP request.
-   `app.listen(port|options [,host, callback])` starts the server and loads the application.
-   `app.close([callback])` turns off the server and starts the closing flow. This generates the possibility to close all the pending connections to a database or to complete running tasks.
-   `app.inject(options[, callback])` loads the server until it reaches the ready status and submits a mock HTTP request. You will learn about this method in [_Chapter 9_](../real-project/testing.md).

This API family will return a native `Promise` if you don’t provide a callback parameter. This code pattern works for every feature that Fastify provides: whenever there is a callback argument, you can omit it and get back a promise instead!

Now, you have a complete overview of the Fastify server instance component and the lifecycle logic that it implements. We are ready to use what we have read till now and add our first endpoints to the application.

## Adding basic routes

The routes are the entry to our business logic. The HTTP server exists only to manage and expose routes to clients. A route is commonly identified by the HTTP method and the URL. This tuple matches your function handler implementation. When a client hits the route with an HTTP request, the function handler is executed.

We are ready to add the first routes to our playground application. Before the listen call, we can write the following:

```js
app.route({
    url: '/hello',
    method: 'GET',
    handler: function myHandler(request, reply) {
        reply.send('world');
    },
});
```

The route method accepts a JSON object as a parameter to set the HTTP request handler and the endpoint coordinates. This code will add a `GET /hello` endpoint that will run the `myHandler` function whenever an HTTP request matches the HTTP method and the URL that was just set. The handler should implement the business logic of your endpoint, reading from the `request` component and returning a response to the client via the `reply` object.

Note that running the previous code in your source code must trigger the `onRoute` hook that was sleeping before; now, the <http://localhost:8080/hello> URL should reply, and we finally have our first endpoint!

!!!note "Does the onRoute hook not work?"

If the `onRoute` hook doesn’t show anything on the terminal console, remember that the `addRoute` method must be called after the `addHook` function! You have spotted the nature a hook may have: the application’s hooks are synchronous and are triggered as an event happens, so the order of the code matters for these kinds of hooks. This topic will be broadly discussed in [_Chapter 4_](./hooks.md).

When a request comes into the Fastify server, the framework takes care of the routing. It acts by default, processing the HTTP method and the URL from the client, and it searches for the correct handler to execute. When the router finds a matching endpoint, the request lifecycle will start running. Should there be no match, the default 404 handler will process the request.

You have seen how smooth adding new routes is, but can it be even smoother? Yes, it can!

### Shorthand declaration

The HTTP method, the URL, and the handler are mandatory parameters to define new endpoints. To give you a less verbose routes declaration, Fastify supports three different shorthand syntaxes:

```js
app.get(url, handlerFunction); // [1]
app.get(url, {
    // [2]
    handler: handlerFunction,
    // other options
});
app.get(url, [options], handlerFunction); // [3]
```

The first shorthand `[1]` is the most minimal because it accepts an input string as a URL and handler. The second shorthand syntax `[2]` with options will expect a string URL and a JSON object as input with a handler key with a function value. The last one `[3]` mixes the previous two syntaxes and lets you provide the string URL, route options, and function handler separately: this will be useful for those routes that share the same options but not the same handler!

All the HTTP methods, including `GET`, `POST`, `PUT`, `HEAD`, `DELETE`, `OPTIONS`, and `PATCH`, support this declaration. You need to call the correlated function accordingly: `app.post()`, `app.put()`, `app.head()`, and so on.

### The handler

The route handler is the function that must implement the endpoint business logic. Fastify will provide your handlers with all its main components, in order to serve the client’s request. The `request` and `reply` object components will be provided as arguments, and provide the server instance through the function binding:

```js
function business(request, reply) {
    // `this` is the Fastify application instance
    reply.send({ helloFrom: this.server.address() });
}
app.get('/server', business);
```

Using an arrow function will prevent you from getting the function context. Without the context, you don’t have the possibility to use the `this` keyword to access the application instance. The arrow function syntax may not be a good choice because it can cause you to lose a great non-functional feature: the source code organization! The following handler will throw a `Cannot read property 'server' of undefined` error:

```js
app.get('/fail', (request, reply) => {
    // `this` is undefined
    reply.send({ helloFrom: this.server.address() });
});
```

!!!note "Context tip"

    It would be best to choose named functions. In fact, avoiding arrow function handlers will help you debug your application and split the code into smaller files without carrying boring stuff, such as the application instance and logging objects. This will let you write shorter code and make it faster to implement new endpoints. The context binding doesn’t work exclusively on handlers but also works on every Fastify input function and hook, for example!

The business logic can be synchronous or asynchronous: Fastify supports both interfaces, but you must be aware of how to manage the `reply` object in your source code. In both situations, the handler should never call `reply.send(payload)` more than once. If this happens, it will work just for the first call, while the subsequent call will be ignored without blocking the code execution:

```js
app.get('/multi', function multi(request, reply) {
    reply.send('one');
    reply.send('two');
    reply.send('three');
    this.log.info('this line is executed');
});
```

The preceding handler will reply with the one string, and the next `reply.send` calls will log an `FST_ERR_REP_ALREADY_SENT` error in the console.

To ease this task, Fastify supports the return even in the synchronous function handler. So, we will be able to rewrite our first section example as the following:

```js
function business(request, reply) {
    return { helloFrom: this.server.address() };
}
```

Thanks to this supported interface, you will not mess up multiple `reply.send` calls!

The async handler function may completely avoid calling the `reply.send` method instead. It can return the payload directly. We can update the `GET /hello` endpoint to this:

```js
app.get('/hello', async function myHandler(request, reply) {
    return 'hello'; // simple returns of a payload
});
```

This change will not modify the output of the original endpoint: we have updated a synchronous interface to an async interface, updating how we manage the response payload accordingly. The async functions that do not execute the `send` method can be beneficial to reuse handlers in other handler functions, as in the following example:

```js
async function foo(request, reply) {
    return { one: 1 };
}
async function bar(request, reply) {
    const oneResponse = await foo(request, reply);
    return {
        one: oneResponse,
        two: 2,
    };
}
app.get('/foo', foo);
app.get('/bar', bar);
```

As you can see, we have defined two named functions: `foo` and `bar`. The `bar` handler executes the `foo` function and it uses the returned object to create a new response payload.

Avoiding the `reply` object and returning the response payload unlocks new possibilities to reuse your handler functions, because calling the `reply.send()` method would explicitly prevent manipulating the results as the `bar` handler does.

Note that a sync function may return a `Promise` chain. In this case, Fastify will manage it like an async function! Look at this handler, which will return file content:

```js
const fs = require('fs/promises');
app.get('/file', function promiseHandler(request, reply) {
    const fileName = './package.json';
    const readPromise = fs.readFile(fileName, {
        encoding: 'utf8',
    });
    return readPromise;
});
```

In this example, the handler is a sync function that returns `readPromise:Promise`. Fastify will wait for its execution and reply to the HTTP request with the payload returned by the promise chain. Choosing the async function syntax or the `sync` and `Promise` one depends on the output. If the content returned by the `Promise` is what you need, you can avoid adding an extra async function wrapper, because that will slow down your handler execution.

### The Reply component

We have already met the `Reply` object component. It forwards the response to the client, and it exposes all you need in order to provide a complete answer to the request. It provides a full set of functions to control all response aspects:

-   `reply.send(payload)` will send the response payload to the client. The payload can be a String, a JSON object, a Buffer, a Stream, or an Error object. It can be replaced by returning the response’s body in the handler’s function.
-   `reply.code(number)` will set the response status code.
-   `reply.header(key, value)` will add a response header.
-   `reply.type(string)` is a shorthand to define the Content-Type header.

The `Reply` component’s methods can be chained to a single statement to reduce the code noise as follows: `reply.code(201).send('done')`.

Another utility of the `Reply` component is the headers’ auto-sense. `Content-Length` is equal to the length of the output payload unless you set it manually. `Content-Type` resolves strings to `text/ plain`, a JSON object to `application/json`, and a stream or a buffer to the `application/ octet-stream` value. Furthermore, the HTTP return status is 200 Successful when the request is completed, whereas when an error is thrown, 500 Internal Server Error will be set.

If you send a `Class` object, Fastify will try to call `payload.toJSON()` to create an output payload:

```js
class Car {
    constructor(model) {
        this.model = model;
    }
    toJSON() {
        return {
            type: 'car',
            model: this.model,
        };
    }
}
app.get('/car', function (request, reply) {
    return new Car('Ferrari');
});
```

Sending a response back with a new `Car` instance to the client would result in the JSON output returned by the `toJSON` function implemented by the class itself. This is useful to know if you use patterns such as **Model View Controller (MVC)** or **Object Relational Mapping (ORM)** extensively.

### The first POST route

So far, we have seen only HTTP `GET` examples to retrieve data from the backend. To submit data from the client to the server, we must switch to the `POST` HTTP method. Fastify helps us read the client’s input because the JSON input and output is a first-class citizen, and to process it, we only need to access the `Request` component received as the handler’s argument:

```js
const cats = [];
app.post('/cat', function saveCat(request, reply) {
    cats.push(request.body);
    reply.code(201).send({ allCats: cats });
});
```

This code will store the request body payload in an in-memory array and send it back as a result.

Calling the `POST /cat` endpoint with your HTTP client will be enough to parse the request’s payload and reply with a valid JSON response! Here is a simple request example made with `curl`:

```sh
$ curl --request POST "http://127.0.0.1:8080/cat" --header "Content-
Type: application/json" --data-raw "{\"name\":\"Fluffy\"}"
```

The command will submit the `Fluffy` cat to our endpoint, which will parse the payload and store it in the `cats` array.

To accomplish this task, you just have to access the `Request` component without dealing with any complex configuration or external module installation! Now, let’s explore in depth the `Request` object and what it offers out of the box.

### The Request component

During the implementation of the POST route, we read the `request.body` property. The body is one of the most used keys to access the HTTP request data. You have access to the other piece of the request through the API:

-   `request.query` returns a key-value JSON object with all the query-string input parameters.
-   `request.params` maps the URL path parameters to a JSON object.
-   `request.headers` maps the request’s headers to a JSON object as well.
-   `request.body` returns the request’s body payload. It will be a JSON object if the request’s Content-Type header is `application/json`. If its value is `text/plain`, the body value will be a string. In other cases, you will need to create a parser to read the request payload accordingly.

The `Request` component is capable of reading information about the client and the routing process too:

```js
app.get('/xray', function xRay(request, reply) {
    // send back all the request properties
    return {
        id: request.id, // id assigned to the request in req-<progress>
        ip: request.ip, // the client ip address
        ips: request.ips, // proxy ip addressed
        hostname: request.hostname, // the client hostname
        protocol: request.protocol, // the request protocol
        method: request.method, // the request HTTP method
        url: request.url, // the request URL
        routerPath: request.routerPath, // the generic handler URL
        is404: request.is404, // the request has been routed or not
    };
});
```

`request.id` is a string identifier with the `"req-<progression number>"` format that Fastify assigns to each request. The progression number restarts from 1 at every server restart. The ID’s purpose is to connect all the logs that belong to a request:

```js
app.get('/log', function log(request, reply) {
    request.log.info('hello'); // [1]
    request.log.info('world');
    reply.log.info('late to the party'); // same as request.log
    app.log.info('unrelated'); // [2]
    reply.send();
});
```

Making a request to the `GET /log` endpoint will print out to the console six logs:

-   Two logs from Fastify’s default configuration that will trace the incoming request and define the response time
-   Four logs previously written in the handler

The output should be as follows:

```txt
{"level":30,"time":1621781167970,"pid":7148,"hostname":"
EOMM-XPS","reqId":"req-1","req":{"method":"GET","url":"/
log","hostname":"localhost:8080","remoteAddress":"127.
0.0.1","remotePort":63761},"msg":"incoming request"}
{"level":30,"time":1621781167976,"pid":7148,"hostname":"EOMM-
XPS","reqId":"req-1","msg":"hello"}
{"level":30,"time":1621781167977,"pid":7148,"hostname":"EOMM-
XPS","reqId":"req-1","msg":"world"}
{"level":30,"time":1621781167978,"pid":7148,"hostname":"EOMM-
XPS","reqId":"req-1","msg":"late to the party"}
{"level":30,"time":1621781167979,"pid":7148,"hostname":"EOMM-
XPS","msg":"unrelated"}
{"level":30,"time":1621781167991,"pid":7148,"hostname":"EOMM-
XPS","reqId":"req-1","res":{"statusCode":200},"responseTime":17.831200
003623962,"msg":"request completed"}
```

Please note that only the `request.log` and `reply.log` commands `[1]` have the `reqId` field, while the application logger doesn’t `[2]`.

The request ID feature can be customized via these server options if it doesn’t fit your system environment:

```js
const app = fastify({
    logger: true,
    disableRequestLogging: true, // [1]
    requestIdLogLabel: 'reqId', // [2]
    requestIdHeader: 'request-id', // [3]
    genReqId: function (httpIncomingMessage) {
        // [4]
        return `foo-${Math.random()}`;
    },
});
```

By turning off the request and response logging `[1]`, you will take ownership of tracing the clients’ calls. The `[2]` parameter customizes the field name printed out in the logs, and `[3]` informs Fastify to obtain the ID to be assigned to the incoming request from a specific HTTP header. When the header doesn’t provide an ID, the `genReqId` function `[4]` must generate a new ID.

The default log output format is a JSON string designed to be consumed by external software to let you analyze the data. This is not true in a development environment, so to see a human-readable output, you need to install a new module in the project:

```sh
npm install pino-pretty –-save-dev
```

Then, update your logger settings, like so:

```js
const serverOptions = {
    logger: {
        level: 'debug',
        transport: {
            target: 'pino-pretty',
        },
    },
};
```

Restarting the server with this new configuration will instantly show a nicer output to read. The logger configuration is provided by pino. Pino is an external module that provides the default logging feature to Fastify. We will explore this module too in [_Chapter 11_](../real-project/logging.md).

### Parametric routes

To set a path parameter, we must write a special URL syntax, using the colon before our parameter’s name. Let’s add a `GET` endpoint beside our previous `POST /cat` route:

```js
app.get('/cat/:catName', function readCat(request, reply) {
    const lookingFor = request.params.catName;
    const result = cats.find(
        (cat) => cat.name == lookingFor
    );
    if (result) {
        return { cat: result };
    } else {
        reply.code(404);
        throw new Error(`cat ${lookingFor} not found`);
    }
});
```

This syntax supports regular expressions too. For example, if you want to modify the route previously created to exclusively accept a numeric parameter, you have to write the RegExp string at the end of the parameter’s name between brackets:

```js
app.get('/cat/:catIndex(\\d+)', function readCat(
    request,
    reply
) {
    const lookingFor = request.params.catIndex;
    const result = cats[lookingFor];
    // ...
});
```

Adding the regular expression to the parameter name will force the router to evaluate it to find the right route match. In this case, only when `catIndex` is a number will the handler be executed; otherwise, the 404 fallback will take care of the request.

!!!note "Regular expression pitfall"

    Don’t abuse the regular expression syntax in the path parameters because it comes with a performance cost. Moreover, a mismatch of regular expressions will lead to a 404 response. You may find it useful to validate the parameter with the Fastify validator, which we present in [_Chapter 5_](./validation-serialization.md) to reply with a `400 Bad Request` status code.

The Fastify router supports the wildcard syntax too. It can be useful to redirect a root path or to reply to a set of routes with the same handler:

```js
app.get('/cat/*', function sendCats(request, reply) {
    reply.send({ allCats: cats });
});
```

Note that this endpoint will not conflict with the previous because they are not overlapping, thanks to the match order:

1.  Perfect match: `/cats`
2.  Path parameter match: `/cats/:catIndex`
3.  Wildcards: `/cats/*`
4.  Path parameter with a regular expression: `/cats/:catIndex(\\d+)`

Under the hood, Fastify uses the `find-my-way` package to route the HTTP request, and you can benefit from its features.

This section explored how to add new routes to our application and how many utilities Fastify gives us, from application logging to user input parsing. Moreover, we covered the high flexibility of the `reply` object and how it supports us when returning complex JSON to the client. We are now ready to go further and start understanding Fastify plugin system basics.

## Adding a basic plugin instance

Previously, we talked about a plugin instance as a child component of an application instance.

To create one, you simply need to write the following:

```js
app.register(function myPlugin(pluginInstance, opts, next) {
  pluginInstance.log.info('I am a plugin instance,
    children of app')
  next()
}, { hello: 'the opts object' })
```

These simple lines have just created an **encapsulated context**: this means that every event, hook, plugin, and decorator registered in the `myPlugin` scope function will remain inside that context and all its children. Optionally, you can provide an input object as a second parameter to the `register` function. This will propagate the input to the plugin’s `opts` parameter. If you move the plugin to another file, this will become extremely useful when sharing a configuration through files.

To see how the encapsulated context acts, we can investigate the output of the following example:

```js
app.addHook('onRoute', buildHook('root')); // [1]
app.register(async function pluginOne(
    pluginInstance,
    opts
) {
    pluginInstance.addHook(
        'onRoute',
        buildHook('pluginOne')
    );
    // [2]
    pluginInstance.get('/one', async () => 'one');
});
app.register(async function pluginTwo(
    pluginInstance,
    opts
) {
    pluginInstance.addHook(
        'onRoute',
        buildHook('pluginTwo')
    );
    // [3]
    pluginInstance.get('/two', async () => 'two');
    pluginInstance.register(async function pluginThree(
        subPlugin,
        opts
    ) {
        subPlugin.addHook(
            'onRoute',
            buildHook('pluginThree')
        );
        // [4]
        subPlugin.get('/three', async () => 'three');
    });
});
function buildHook(id) {
    return function hook(routeOptions) {
        console.log(
            `onRoute ${id} called from ${routeOptions.path}`
        );
    };
}
```

Running the preceding code will execute `[2]` and `[4]` just one time, because inside `pluginOne` and `pluginThree`, only one route has been registered, and each plugin has registered only one hook. The `onRoute` hook `[1]` is executed three times, instead. This happens because it has been added to the `app` instance, which is the parent scope of all the plugins. For this reason, the `root` hook will listen to the events of its context and to the children’s ones.

This feature comes with an endless list of benefits that you will “get to know” through this book. To better explain the bigger advantage of this feature, imagine every plugin as an isolated box that may contain other boxes, and so on, where the Root application instance is the primary container of all the plugins. The previous code can be schematized in this diagram:

![Figure 1.2 – Encapsulated contexts](what-is-fastify2.png)

<center>Figure 1.2 – Encapsulated contexts</center>

The request is routed to the right endpoint (the square in the diagram), and it will trigger all the hooks registered on each plugin instance that include the destination handler.

Every box is self-contained, and it won’t affect the behavior of its other siblings, thus giving you the certainty that no issue affects parts of the application other than the one where it occurred. Furthermore, the system only executes the hook functions your routes need! This allows you and your team to work on different parts of the application without affecting each other or causing side effects. Furthermore, the isolation will give you a lot more control over what is happening at your endpoints. Just to give you an example: you can add a dedicated database connection for hot-paths in your code base without extra effort!

This plugin example has shown more clearly the Fastify plugin system in action. It should help you understand the difference between a _root application instance_ and _plugin instances_. You now have an idea of how powerful the plugin system is and of the benefits it implements by design:

-   **Encapsulation**: All the hooks, plugins, and decorators added to the plugin are binded to the plugin context
-   **Isolation**: Every plugin instance is self-contained and doesn’t modify sibling plugins
-   **Inheritance**: A plugin inherits the configuration of the parent plugin

The plugin system will be discussed in depth in [_Chapter 2_](./plugin-system.md).

Now, we are ready to explore how to manage the different configuration types a Fastify application needs to work correctly.

## Understanding configuration types

In Fastify, we must consider splitting the configuration into three types to better organize our application:

-   **Server options**: Provide the settings for the Fastify framework to start and support your application. We have presented them before when describing how to instantiate the server instance in the _The root application instance_ section.
-   **Plugin configuration**: Provides all the parameters to configure your plugins or the community plugins.
-   **Application configuration**: Defines your endpoint settings.

This can be implemented with a configuration loader function:

```js
const environment = process.env.NODE_ENV; // [1]
async function start() {
    const config = await staticConfigLoader(environment); // 2
    const app = fastify(config.serverOptions.factory);
    app.register(plugin, config.pluginOptions.fooBar);
    app.register(plugin, {
        // [3]
        bar: function () {
            return config.pluginOptions ? 42 : -42;
        },
    });
    await app.listen(config.serverOptions.listen);
    async function staticConfigLoader(env) {
        return {
            // [4]
            env,
            serverOptions: getServerConfig(),
            pluginOptions: {},
            applicationOptions: {},
        };
    }
}
start();
```

This example shows the key points of a configuration loader:

1.  It must accept the environment as input. This will be fundamental during the test writing.
2.  It should be an async function: you will load settings from a different source that needs I/O.
3.  It must manage primitive types exclusively.
4.  It can be split into three main objects for clarity.

A plugin’s configuration often needs an input parameter that is not a primitive type-like function. This would be part of the code flow since a function acts based on input strings such as passwords, URLs, and so on.

This quick introduction shows you the logic we need to take into consideration when we build more complex code. This separation helps us to think about how to better split our configuration files. We will read a complete example in [_Chapter 6_](../real-project/project-structure.md).

Now, we can configure and start our Fastify server; it is time to turn it off.

## Shutting down the application

Up until now, we have killed our server by pressing the ++ctrl+c++ or ++cmd+c++ keys. This shortcut sends a `SIGINT` interrupt to the Node.js process, which will cause an unconditional termination. If we don’t manage this behavior, a running HTTP request may be interrupted, causing possible data loss or introducing inconsistencies in our application.

To ensure you close the server gracefully, you must call the root instance’s `close` method:

```js
process.once('SIGINT', function closeApplication() {
    app.close(function closeComplete(err) {
        if (err) {
            app.log.error(err, 'error turning off');
        } else {
            app.log.info('bye bye');
        }
    });
});
```

Adding this signaling handle will prevent the kill of the server, thus allowing the complete execution of the requests and preventing new HTTP requests from being accepted. New requests will receive the `HTTP Status 503 - Service Unavailable` error while the application is in the closing phase.

Calling the `close` method will trigger the `onClose` hook too. All the plugins that are listening for this event will receive it at the beginning of the shutdown process, as a database plugin will close the connection.

Fastify guarantees that the `onClose` hooks will be executed once, even when the server’s `close` method is called multiple times. Note that the `close` callback function will be run at every call instead.

Our implementation, unfortunately, is not enough to cover all the use cases one application may face. If the plugins don’t resolve the `onClose` hook, due to a bug or a starving connection, our server will become a zombie that will wait forever to close gracefully. For this reason, we need to develop a maximum time span, after which the application must stop. So, let’s analyze an example of force close using the Fastify async interface:

```js
process.once('SIGINT', async function closeApplication() {
    const tenSeconds = 6000;
    const timeout = setTimeout(function forceClose() {
        app.log.error('force closing server');
        process.exit(1);
    }, tenSeconds);
    timeout.unref();
    try {
        await app.close();
        app.log.info('bye bye');
    } catch (err) {
        app.log.error(
            err,
            'the app had trouble turning off'
        );
    }
});
```

We have set a timeout timer in the previous code that doesn’t keep the Node.js event loop active, thanks to the `unref` call. If the close callback doesn’t execute in 10 seconds, the process will exit with a nonzero result. This pattern is implemented in many plugins built by Fastify’s community that you can check out on the _Ecosystem_ page at <https://www.fastify.io/ecosystem/>.

Turning off a server could be challenging, but Fastify provides a set of features that help us to avoid losing data and complete all the application’s pending tasks. We have seen how to deal with it through a pattern that guarantees to stop the server in a reasonable time. Looking at the community plugins is a good way to learn how to search for an external plugin that implements the pattern and provides us with this feature, without having to re-implement it ourselves.

## Summary

This first chapter offered a complete overview of Fastify’s framework. It touched on all the essential features it offers, thus allowing you to start “playing” with the applications.

So far, you have learned how to instantiate a server, add routes, and turn it on and off gracefully. You have seen the basic logger configuration and have learned how to use it. However, more importantly, you have understood the basic concepts behind Fastify and its components. You had a quick insight into request hooks and more comprehensive examples regarding application hooks. Lastly, you were presented with a simple outline of the lifecycle that controls the execution of the code.

Now that you are confident with the syntax, get ready to explore the details of this great framework! In the next chapter, we will expand the Fastify booting process and discover new possibilities that are going to make our daily job much easier. Moreover, we will explore the plugin system in depth in order to become proficient and start building our first plugins.
