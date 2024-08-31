# Meaningful Application Logging

A piece of software does not speak to us. Sometimes we would like our application to explain what is going on and why something is not working as expected. For this reason, it is essential to teach the application how to talk to us through logs.

In this chapter, we will see how to implement meaningful application logs to help us understand what is going on in our software. It is vital to monitor that everything is working as expected, as well as to keep track of what has gone wrong.

You will learn how to set up the perfect logging configuration without losing essential information. Moreover, you will discover how to avoid logging sensible data and print out only what you need.

The learning path we will cover in this chapter is as follows:

-   How to use Fastify’s logger
-   Enhancing the default logger
-   Collecting the logs
-   Managing distributed logs

Technical requirements

As in the previous chapters, you will need the following:

-   A working Node.js 18 installation
-   The [VS Code IDE](https://code.visualstudio.com/)
-   A public GitHub repository
-   A working command shell

All the snippets in this chapter are on [GitHub](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%2011).

## How to use Fastify’s logger

Application logging is one of the pillars of application observability. It provides useful information to understand what the system is doing and narrow down where the bug arises. A good logging setup has the following qualities:

-   **Consolidate**: This sends the logs to a designated output.
-   **Structure**: This provides a format to query and analyze over text messages.
-   **Context**: This adds metadata based on the execution environment.
-   **Security**: This applies filter and data reduction to hide sensitive information.
-   **Verbosity**: This sets the log severity based on the environment. Unfortunately, logging is not free, as it costs the system’s resources, so we can’t just log everything without impacting the application’s performance.

Generally, you can easily understand whether application logs are implemented correctly or not. But you should never underestimate the importance of logging.

In fact, when you are having trouble in production caused by an unknown and mysterious error, and the error log prints out a vague message such as `undefined is not a function`, at that moment, it is already too late to act, and you can’t reproduce the error event because it’s gone.

The logger is not just a life-saver when things are burning down. The log is an enabler in accomplishing the following:

-   **Auditing**: This tracks events to recreate the user’s navigation and API usage
-   **Metrics**: This traces the time spent per request or operation to identify possible bottlenecks
-   **Analysis**: This counts the endpoint metrics to plan code base refactoring and optimizations, such as choosing routes that slow down the system and need to be isolated
-   **Alerting**: This triggers a warning when specific events are recognized by monitoring the metrics

Fastify helps you manage all kinds of situations because it has all the tools you need to build a production-ready application. As introduced in [Chapter 1](../basic/what-is-fastify.md), the Fastify framework includes the [`pino` logger module](https://getpino.io), which provides all you need to let your application speak to you. We need to understand some basic concepts before digging into the code, or we could get lost in the configuration maze.

### How Pino logs the application’s messages

Before starting, we need a brief introduction to Pino, the fastest logger in the Node.js ecosystem. By default, it prints out to the **stdout** and **stderr** streams. These streams print out the string message to our shell’s console to let us read the output on the screen. You can go into further detail by reading [this article](https://en.wikipedia.org/wiki/Standard_streams).

To log something, we need to call one of the methods corresponding to a **log level**. Here is the list in ascending severity order:

-   `log.trace()`: This is used to print very low-severity messages
-   `log.debug()`: This is the level for low severity diagnostic messages
-   `log.info()`: This prints logs for informational text
-   `log.warn()`: This indicates problems or cases that should not have occurred
-   `log.error()`: This is used to trace failures
-   `log.fatal()`: This indicates a major error that could cause the server to crash

You can configure the log to turn the log’s output on or off based on the log level. For example, by setting `warn` as the threshold, all the lower severity logs will not be shown.

All the log functions share the same usage interface. To clarify, we can recap the interface into these forms:

```js
const pino = require('pino')
const log = pino({ level: 'debug' })
log.debug('Hello world') // [1]
// {"level":30,"time":1644055693539,"msg":"Hello world"}
log.info('Hello world from %s', 'Fastify') // [2]
// {"level":30,"time":1644055693539,"msg":"Hello world from
   Fastify"}
log.info({ hello: 'world' }, 'Cheers') // [3]
// {"level":30,"time":1644055693539,"hello":"world","msg":
   "Cheers"}
log.info({ hello: 'world' }, 'Cheers %s', 'me') // [4]
// {"level":30,"time":1644055693539,"hello":"world","msg":
   "Cheers me"}
```

The first syntax, `[1]`, logs a simple string message. It helps debug and trace. The second interface, `[2]`, shows us how Pino interpolates strings: when the first string argument is found, all the subsequent parameters will be used to fill its placeholder. In the `[2]` code example, we are using `%s` for the string placeholder: you can use `%d` for numbers and `%o` for JSON objects.

!!!note "String interpolation optimization"

    When you plan to hide the log level, you should prefer the `pino` string interpolation over template literals or string concatenation. To give you an example, writing ` log.debug(``Hello ${name}``) ` means that every time the statement is executed, the template’s literal is processed, even if the `DEBUG` log level is hidden. This is a waste of resources. Instead, the `log.debug('Hello $s', name)` statement does not execute the string interpolation if the corresponding log level does not need to be printed.

The third `[3]` log syntax shows that we can include a JSON object in the log output by setting a string message. This API can be used to log `Error` objects too. Finally, `[4]`, which we saw in the previous code snippet, sums up the JSON object log and the string interpolation.

As you have seen, the output is a [JSON logline string](https://jsonlines.org/) that adds additional information by default, such as the log time in milliseconds since the Unix timestamp, and the log level as an integer, and the system’s coordinates (which have been removed from the snippet output for compactness). You can customize every JSON field printed out by managing the options or implementing a **serializer**. The log serializer is a function that must return a JSONifiable object, such as a string or a JSON object. This feature lets us add or remove information from the logline, so let’s see an example:

```js
const pino = require('pino');
const log = pino({
    serializers: {
        user: function userSerializer(value) {
            return { id: value.userId };
        },
    },
});
const userObj = { userId: 42, imageBase64: 'FOOOO...' };
log.info({ user: userObj, action: 'login' });
// {"level":30,"time":1644136926862,"user":{"id":42}, "action":"login"}
```

In the previous code snippet, `userObj` contains the `imageBase64` property that must not be logged because it is not useful, and it is a huge `base64` string that can slow down the logging process. So, when we need to log an application’s account, we can define the convention so that the corresponding JSON must be assigned to a `user` property as shown. Since we have defined a `user` serializer when we declared the log instance, the `userSerializer` function will be executed, and its output will be used as output. We have centralized the logic to log a `user` object into a single operation by doing so. Now, we can log the user in the same way from the whole application.

The JSON format output can’t be changed out of the box by design. This is a requirement of being the fastest logger in the Node.js panorama. To be flexible for each developer, the ecosystem of `pino` is supplied with a lot of **transporters**. These are plugins that let you do the following:

-   **Transform**: This transforms the log output into another string format different from the JSON one, such as [`syslog`](https://datatracker.ietf.org/doc/html/rfc5424)
-   **Transmitting**: This transmits the logs to an external system, such as **log management software**

The JSON format is broadly supported and can be easily stored and processed by external analysis tools called log management software. This software allows you to collect the data, search and report, and store it for retention and analysis.

The transport’s configuration depends on what you are going to do within the logs. For example, if you already have the log management software in place, you may need to adapt to its logs string format.

!!!note "Using pino as a logger"

    Note that there are multiple ways to transmit the records to a third-party system that do not involve `pino`, such as a platform command, but this goes beyond the main topic of this book.

Now that you have an overview of `pino`, we need to go into the logging configuration details exposed by Fastify. So, let’s jump in to appreciate all the aspects of customizing logging configuration.

### Customizing logging configuration

In [Chapter 3](../basic/routes.md), we saw how to set the log level and the pretty print configuration but there is much more than that to customizing the logger.

The main log’s configuration must be provided to the Fastify instance during its initialization. There are three ways to do that, as depicted by the following code snippet:

```js
const app = fastify({ logger: true }); // [1]
const app = fastify({
    logger: pinoConfigObject, // [2]
});
const app = fastify({
    logger: new MyLogger(), // [3]
});
```

The first option, `[1]`, is good when we need to try some code snippets and need a quick and dirty way to see the default Fastify’s log configuration.

The second interface, `[2]`, is the one we have used so far in the book, last mentioned in [Chapter 6](./project-structure.md). The `logger` server’s property accepts a JSON object corresponding to the `pino` options. We set those options by configuring the `fastify-cli -l info --pretty-logs` arguments. You can get the full options list by reading the [Pino documentation](https://getpino.io/#/docs/api?id=options-object).

The last input, `[3]`, allows you to provide a new logger module and not use `pino` by default instead. It enables you to provide a custom `pino` instance too. This is useful if you want to use a major new release without waiting for a new Fastify release.

!!!note "Don’t change the logger library"

    In this chapter, you will not learn how to change Fastify’s logger module. We hope you understand why you should not do it, otherwise, you will lose all the fine configurations the framework gives you. If you need to do it, you can read our reasoning on [Stack Overflow](https://stackoverflow.com/questions/55264854/how-can-i-use-custom-logger-in-fastify/55266062).

These options let us customize the log’s baseline settings. The possibilities are not over yet. You can do a lot more using Fastify! You can customize the log level and the serializers at the following levels:

-   Server instance level
-   Plugin level
-   Route level

Let’s see an example. First, we need a simple handler that prints a `hello` array:

```js
async function helloHandler(request, reply) {
    const hello = ['hello', 'world'];
    request.log.debug({ hello });
    return 'done';
}
```

Now we can reuse this handler to see the different behaviors in the three cases listed previously:

```js
const app = fastify({
    logger: {
        level: 'error',
        serializers: {
            hello: function serializeHello(data) {
                return data.join(',');
            },
        },
    },
});
app.get('/root', helloHandler);
app.inject('/root');
```

The expected output is none because the `hello` log is at debug level, and we set an `error` threshold. The `serializeHello` function is not executed at all. This setting will be the default for every child context and route since it is assigned to Fastify’s server instance root.

As mentioned earlier in this section, we can overload the server’s default log configuration by using two additional plugin options managed by Fastify itself:

```js
app.register(
    async function plugin(instance, opts) {
        instance.get('/plugin', helloHandler);
    },
    {
        logLevel: 'trace',
        logSerializers: {
            hello: function serializeHello(data) {
                return data.join(':');
            },
        },
    }
);
app.inject('/plugin');
```

The `logLevel` and `logSerializers` properties are handled by Fastify, and they will overwrite the default log’s setting for the `plugin` instance. This means that even the plugin’s child contexts and routes will inherit the new log configuration. In this case, the expected output is a string concatenated by a double colon:

```
{"level":20,"time":1644139826692,"pid":80527,"hostname":"MyPC","reqId"
:"req-1","hello":"hello:world"}
```

The route option object supports the same special `logLevel` and `logSerializers` properties:

```js
app.get('/route', {
    handler: helloHandler,
    logLevel: 'debug',
    logSerializers: {
        hello: function toString(data) {
            return data.join('+');
        },
    },
});
app.inject('/route');
```

In the route code example, the output expected is now a string concatenated by the plus symbol:

```
{"level":20,"time":1644140376244,"pid":82198,"hostname":"MyPC
","reqId":"req-1","hello":"hello+world"}
```

This fine granular log-level setup is a great feature. For example, you can set an `error` level to stable routes and `info` thresholds for brand new routes that require beta usage before considering them durable. This optimization reduces the beta endpoints’ impact on the system, which may suffer a low log level for every application’s route, causing a considerable increment on the logline counter.

!!!note "Logs are not free"

    As we said previously, logs are not free: they cost the system’s resource utilization, but there is also an economic cost involved. Some log management systems apply pricing per logline or logline size. Fastify helps you control this project management aspect.

Well done, you have now seen how to tweak your application’s logger to your needs. So far, we have built the basis to start from in order to customize Pino. In the next section, we will use all the options we have learned about in this chapter so far.

## Enhancing the default logger configuration

You know the options available in the logger, but what is a valuable configuration, and how can we integrate it into our application? First of all, we need to define which logs we expect for every request:

![Figure 11.1 – Request logs logic](logging-1.png)

<center>Figure 11.1 – Request logs logic</center>

As shown in _Figure 11.1_, we expect these log lines for each request: one for the incoming request, optionally, how many handler’s log messages you implement, and finally, one for the response output. All these log lines will be connected to each other by the **reqId** (request-id) field. It is a unique identifier generated for each request whenever the server receives it. We already described the `reqId` property in Chapter 1 in the [The Request component](../basic/what-is-fastify.md#the-request-component) section.

We can start implementing this by doing the following:

-   Exploiting the default request and response log implemented by Fastify
-   Executing a custom log statement by using the `onRequest` and `onSend` hooks

The first option is more straightforward to implement, but it has less configurability since you can’t customize the message. Moreover, Fastify’s default request log runs before any other hooks, and you will not be able to read any additional information. The latter option is easy to set up and is open to advanced configurations.

We will follow the custom implementation for our _Fastify to-do list_ application implemented till the previous [Chapter 10](./deploy.md) and follow the logic in _Figure 11.1_ by doing the following:

1.  Turning off the Fastify default request log. To do that, edit the `configs/server-options.js` file, by adding the `disableRequestLogging: true` property we saw in [Chapter 1](../basic/what-is-fastify.md).
2.  Adding an `onRequest` and `onResponse` hook in the `plugins/error-handler.js` file.

The hook will look like the following:

```js
fastify.addHook('onRequest', async (req) => {
    req.log.info({ req }, 'incoming request');
});
fastify.addHook('onResponse', async (req, res) => {
    req.log.info({ req, res }, 'request completed');
});
```

Note that we have added the `req` object to the response log, as it is useful to add the request’s URL information. The rationale for adding these logging hooks in the error-handler file is the centralization of the HTTP request tracing. This file now contains all the minimal request-logging processes.

If we compare Fastify’s default output within our setup, we lose the `responseTime` property from the response’s log line. Now, we can fix this by adding the first custom log serializer. Let’s create a new `configs/logger-options.js` file. This document will contain Pino’s options as follows:

```js
module.exports = {
    level: process.env.LOG_LEVEL,
    serializers: {
        res: function (reply) {
            return {
                statusCode: reply.statusCode,
                responseTime: reply.getResponseTime(),
            };
        },
    },
};
```

It is possible to add the HTTP request duration in the log output in order to define the `res` serializer. Note that it is necessary to set the `level` property first. In fact, setting the logger configuration has priority over the `fastify-cli` arguments, so adding a new `LOG_LEVEL` environment variable will be mandatory. We must also remember to register this new variable into the `schemas/dotenv.json` file.

To load the new `logger-options.js` file into the `configs/server-options.js` file correctly, do the following:

```js
const loggerOptions = require('./logger-options');
module.exports = {
    disableRequestLogging: true,
    logger: loggerOptions,
    // ...
};
```

Now, calling an endpoint will produce the two log lines that we can format to improve the readability. The `onRequest` hook will print the following:

```json
{
    "level": 30,
    "time": 1644273077696,
    "pid": 20340,
    "hostname": "MyPC",
    "reqId": "req-1",
    "req": {
        "method": "GET",
        "url": "/",
        "hostname": "localhost:3001",
        "remoteAddress": "127.0.0.1",
        "remotePort": 51935
    },
    "msg": "incoming request"
}
```

The `onResponse` hook prints the response information:

```json
{
    "level": 30,
    "time": 1644273077703,
    "pid": 20340,
    "hostname": "MyPC",
    "reqId": "req-1",
    "req": {
        "method": "GET",
        "url": "/",
        "hostname": "localhost:3001",
        "remoteAddress": "127.0.0.1",
        "remotePort": 51935
    },
    "res": {
        "statusCode": 200,
        "responseTime": 8.60491693019867
    },
    "msg": "request completed"
}
```

You can customize the tracing message’s properties by adding the data you need. As mentioned in the [How to use Fastify’s logger](#how-to-use-fastifys-logger) section, a good logline must have a Context.

A request’s Context helps us answer the following common questions:

-   Which endpoint has produced the log?
-   Was the client logged in and who was the user?
-   What was the request’s data?
-   Where are all the log lines related to a specific request?

Now, we can implement the answers to all these questions by enhancing the log’s serializers. So let’s go back to the `configs/logger-options.js` file and create a new req serializer for the HTTP request object:

```
  serializers: {
    req: function (request) {
      const shouldLogBody = request.context.config.logBody
      === true
      return {
        method: request.method,
        url: request.url,
        routeUrl: request.routerPath,
        version: request.headers?.['accept-version'],
        user: request.user?.id,
        headers: request.headers,
        body: shouldLogBody ? request.body : undefined,
        hostname: request.hostname,
        remoteAddress: request.ip,
        remotePort: request.socket?.remotePort
      }
    },
    res: function (reply) { ...
```

**274**
