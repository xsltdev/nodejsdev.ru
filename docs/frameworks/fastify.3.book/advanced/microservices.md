# From a Monolith to Microservices

Our little application has started gaining traction, and the business has asked us to redesign our API while keeping the previous version running to ease the transition. So far, we have implemented a “monolith” – all of our application is deployed as a single item. Our team is very busy with evolutive maintenance, which we cannot defer. Then, our management has a “Eureka!” moment: let’s add more staff.

Most engineering management books recommend that the team size should never increase beyond eight people – or if you’re Amazon, no larger than the amount that can share two large pizzas (that’s Jeff Bezos’s two-pizza rule). The reason is that with over eight people, the number of interconnections between team members grows exponentially, making collaboration impossible. An often overlooked solution is to not grow the team, but rather slow down delivery.

A solution to our growing pains could be to split our team in two. This is a bad idea because having two teams working at the same time on the same code base would only cause them to step on each other toes. Unfortunately, this is unlikely to happen, as the demand for digital solutions grows yearly. What should we do?

The first step is to structure our monolith into multiple modules to minimize the chance of conflict between different teams. Then, we can split it into microservices so that teams could be in charge of their deployments. Microservices are powerful only if we can arrange the software architecture with the team boundaries in mind.

In this chapter, we will start by making our monolith more modular, and then we will investigate how to add new routes without increasing our project’s complexity. After that, we will split the monolith and use an API gateway to route the relevant calls.

Ultimately, we will cover all the operator questions: logging, monitoring, and error handling.

So, in this chapter, we will cover the following topics:

-   Implementing API versioning
-   Splitting the monolith
-   Exposing our microservice via an API gateway Implementing distributed logging

## Technical requirements

As mentioned in the previous chapters, you will need the following:

-   A working Node.js 18 installation
-   A text editor to try the example code
-   Docker
-   An HTTP client to test out code, such as CURL or Postman
-   A GitHub account

All the snippets in this chapter are on [GitHub](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%2012).

## Implementing API versioning

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

### Version constraints

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

### URL prefixes

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

### Filesystem-based routing prefixes

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

## Splitting the monolith

In the previous section, we discovered how to structure our application using Fastify plugins, separating our code into services and routes. Now, we are moving our application to the next step: we are going to split it into multiple microservices.

Our sample application has three core files: our routes for v1 and v2, plus one external service to load our posts. Given the similarity between v1 and v2 and our service, we will merge the service with v2, building the “old” v1 on top of it.

We are going to split the monolith across the boundaries of these three components: we will create a “v2” microservice, a “v1” microservice, and a “gateway” to coordinate them.

### Creating our v2 service

Usually, the simplest way to extract a microservice is to copy the code of the monolith and remove the parts that are not required. Therefore, we first structure our v2 service based on the monolith, reusing the `routes/` and `services/` folders. Then, we remove the `routes/v1/` folder and move the content of `v2` inside `routes/`. Lastly, we change the port it’s listening to `3002`.

We can now start the server and validate that our <http://127.0.0.1:3002/posts> URL works as expected:

```sh
$ curl http://127.0.0.1:3002/posts
{"posts":[{"id":1,"title":"Hello World"}]}
```

It’s now time to develop our v1 microservice.

### Building the v1 service on top of v2

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

## Exposing our microservice via an API gateway

We have split our monolith into two microservices. However, we would still need to expose them under a single origin (in web terminology, the origin of a page is the combination of the hostname/IP and the port). How can we do that? We will cover an Nginx-based strategy as well as a Fastify-based one.

### docker-compose to emulate a production environment

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

### Nginx as an API gateway

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

Let’s dissect the Nginx configuration:

-   The `events` blocks configure how many connections can be opened by a worker process.
-   The `http` block configures our plain HTTP server.
-   Inside the `http->server` block, we configure the port to listen to, and two locations `/v1` and `/v2`. As you can see, we rewrite the URL to remove `/v1/` and `/v2/`, respectively.
-   Then, we use the `proxy_pass` directive to forward the HTTP request to the target host.

!!!note "Nginx configuration"

    Configuring Nginx properly is hard. Quite a few of its settings could significantly alter the performance profile of an application. You can learn more about it from the [documentation](https://nginx.org/ru/docs/).

After preparing the Nginx configuration, we want to start it via Docker by creating a `Dockerfile` file:

```Dockerfile
FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
```

Then, we can start our network of microservices by creating a `docker-compose-nginx.yml` file:

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

In this configuration, we define three Docker services: `app-v1`, `app-v2`, and `gateway`. We can start with the following:

```sh
$ docker-compose -f docker-compose-nxing.yml up
```

We can now verify that our APIs are correctly exposed at <http://127.0.0.1:8080/v1/posts> and <http://127.0.0.1:8080/v2/posts>.

Using Nginx to expose multiple services is a great strategy that we often recommend. However, it does not allow us to customize the gateway: what if we want to apply custom authorization logic? How would we transform the responses from the service?

### `@fastify/http-proxy` as an API gateway

The Fastify ecosystem offers a way of implementing a reverse proxy with JavaScript. This is [`@fastify/http-proxy`](https://github.com/fastify/fastify-http-proxy).

Here is a quick implementation of the same logic we implemented in Nginx:

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

Building an API gateway on top of Node.js and Fastify allows us to customize the logic of our gateway in JavaScript completely – this is a highly effective technique for performing centralized operations, such as authentication or authorization checks before the request reaches the microservice. Moreover, we can compile the routing table dynamically, fetching it from a database (and caching it!). This provides a clear advantage over a reverse proxy approach.

The main objection we have to building a custom API gateway with Fastify is related to security, as some companies do not trust their developers to write API gateways. In our experience, we’ve deployed this solution multiple times, it performed well beyond expectations, and we’ve had no security breaches.

After writing our proxy in Node.js, we should create the relevant Dockerfile and `package.json`. As in the previous section, we will use `docker-compose` to verify that our microservice network works appropriately. We create a `docker-compose-fhp.yml` file for this solution with the following content:

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

In this configuration, we define three Docker services: `app-v1`, `app-v2`, and `app-gateway`. We can run it like so:

```sh
$ docker-compose -f docker-compose-fhp.yml up
```

In the next section, we will see how to customize our gateway to implement distributed logging.

## Implementing distributed logging

Once we have created a distributed system, everything gets more complicated. One of the things that becomes more complicated is logging and tracing a request across multiple microservices. In [Chapter 11](../real-project/logging.md), we covered distributed logging – this is a technique that allows us to trace all the log lines that are relevant to a specific request flow via the use of correlation IDs (`reqId`). In this section, we will put that into practice.

First, we modify our gateway’s `server.js` file to generate a new UUID for the request chain, like so:

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

Note that we generate a new UUID at every request and assign it back to the `headers` object. This way, `@fastify/http-proxy` will automatically propagate it to all downhill services for us.

The next step is to modify the `server.js` file in all microservices so that they recognize the `x-request-id` header:

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

The last step is making sure the invocation of the `v2` service from `v1` passes through the header (in `microservices/v1/services/posts.js`):

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

Here, we have updated the `getAll` decorator to forward the custom `x-request-id` header to the upstream microservice.

As we have seen in this section, an API gateway built on top of Fastify allows you to easily customize how the requests are handled. While in the distributed logging case, we only added one header, this technique also allows you to rewrite the responses or add central authentication and authorization logic.

## Summary

In this chapter, we discussed the problems with deploying a monolith and the different techniques to mitigate these issues: constraints and URL prefixing. The latter is the foundation for the ultimate solution: splitting the monolith into multiple microservices. Then, we showed how to apply distributed logging to a microservices world, ensuring that the requests are uniquely identifiable across different microservices.

You are ready to proceed to [Chapter 13](./performance.md), in which you will learn how to optimize your Fastify application.
