# The Plugin System and the Boot Process

A Fastify plugin is an essential tool at the disposal of a developer. Every functionality except the root instance of the server should be wrapped in a plugin. Plugins are the key to reusability, code sharing, and achieving proper encapsulation between Fastify instances.

Fastify’s root instance will load all registered plugins asynchronously following the registration order during the boot sequence. Furthermore, a plugin can depend on others, and Fastify checks these dependencies and exits the boot sequence with an error if it finds missing ones.

This chapter starts with the declaration of a simple plugin and then, step by step, adds more layers to it. We will learn why the `options` parameter is crucial and how the Fastify register method uses it during the boot sequence. The final goal is to understand how plugins interact with each other thanks to encapsulation.

To understand this challenging topic, we will introduce and learn about some core concepts:

-   What is a plugin?
-   The `options` parameter
-   Encapsulation
-   The boot sequence
-   Handling boot and plugin errors

## Technical requirements

To follow this chapter, you will need the following:

-   A text editor, such as VS Code
-   A working Node.js v18 installation
-   Access to a shell, such as Bash or CMD

All the code examples in this chapter can be found on GitHub at <https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%202>.

## What is a plugin?

A Fastify **plugin** is a component that allows developers to extend and add functionalities to their server applications. Some of the most common use cases for developing a plugin are handling a database connection or extending default capabilities – for example, to request parsing or response serialization.

Thanks to their unique properties, plugins are the basic building blocks of our application. Some of the most prominent properties are the following:

-   A plugin can register other plugins inside it.
-   A plugin creates, by default, a new scope that inherits from the parent. This behavior also applies to its children and so on, although using the parent’s context is still possible.
-   A plugin can receive an `options` parameter that can be used to control its behavior, construction, and reusability.
-   A plugin can define scoped and prefixed routes, making it the perfect router.

At this point, it should be clear that where other frameworks have different entities, such as middleware, routers, and plugins, Fastify has only plugins. So, even if Fastify plugins are notoriously hard to master, we can reuse our knowledge for almost everything once we understand them!

We need to start our journey into the plugin world from the beginning. In the following two sections, we will learn how to declare and use our first plugin.

### Creating our first plugin

Let’s see how to develop our first dummy plugin. To be able to test it, we need to register it to a root instance. Since we focus on plugins here, we will keep our Fastify server as simple as possible, reusing the basic one we saw in [_Chapter 1_](./what-is-fastify.md) and making only one minor change. In `index.cjs`, we will declare our plugin inline, and then we will see how to use separate files for different plugins:

```js
const Fastify = require('fastify')
const app = Fastify({ logger: true }) // [1]
app.register(async function (fastify, opts) { // [2]
    app.log.info('Registering my first plugin.')
})
app.ready() // [3]
  .then(() => { app.log.info('All plugins are now
    registered!')
})
```

After creating a Fastify root instance (`[1]`), we add our first plugin. We achieve this by passing a plugin definition function as the first argument (`[2]`) to `register`. This function receives a new Fastify instance, inheriting everything the root instance has until this point and an `options` argument.

!!!note "The options argument"

    We are not using the `options` argument at the moment. However, in the next section, we will learn about its importance and how to use it.

Finally, we call the ready method (`[3]`). This function starts the boot sequence and returns `Promise`, which will be settled when all plugins have been loaded. For the moment, we don’t need a listening server in our examples, so it is acceptable to call `ready` instead. Moreover, `listen` internally awaits for the `.ready()` event to be dispatched anyway.

!!!note "The boot sequence"

    The Fastify boot sequence is a series of operations that the Fastify primary instance performs to load all of the plugins, hooks, and decorators. If no errors are encountered, the server will start and listen on the provided port. We will learn more about it in a separate section.

Let’s run the previous snippet in the terminal and look at the output:

```sh
$ node index.cjs
{"level":30,"time":1621855819132,"pid":5612,"hostname":"my.
local","msg":"Registering my first plugin."}
{"level":30,"time":1621855819133,"pid":5612,"hostname":"my.
local","msg":"All plugins are now registered!"}
```

Let’s break down the execution of our snippet:

1.  The Fastify instance is created with the logger enabled.
2.  The Fastify root instance registers our first plugin, and the code inside the plugin function is executed.
3.  The `Promise` instance returned by the ready method is resolved after the ready event is dispatched.

This Node.js process exits without any errors; this happens because we used `ready` instead of the `listen` method. The declaration method we just saw is only one of the two that are possible. In the next section, we will look at the other one, since many online examples use it.

### The alternative plugin function signature

As with almost every API it exposes, Fastify has two alternative ways to declare a plugin function. The only difference is the presence, or absence, of the third callback function argument, usually called `done`. Following the good old Node.js callback pattern, this function has to be invoked to notify that the loading of the current plugin is done with no errors.

On the other hand, if an error occurs during the loading, `done` can receive an optional `err` argument that can be used to interrupt the boot sequence. This same thing happens in the promise world – if the promise is resolved, the plugin is loaded; if the promise is rejected, the rejection will be passed up to the root instance, and the boot process will terminate.

Let’s see the `callbacks.cjs` snippet that uses the callback style plugin definition:

```js
//...
app.register(function noError(fastify, opts, done) {
app.log.info('Registering my first plugin.')
    // we need to call done explicitly to let fastify go to
       the next plugin
    done() // [1]
})
app.register(function (fastify, opts, done) {
app.log.info('Registering my second plugin.')
try {
    throw new Error('Something bad happened!')
    done() // [2]
} catch (err) {
    done(err) // [3]
}
})
```

The first plugin loads without any errors, thanks to the done call with no arguments passed (`[1]`). On the other hand, the second one throws before `done()` (`[2]`) is called. Here, we can see the importance of error catching and calling `done(err)` (`[3]`); without this call, Fastify would think no errors happened during the registering process, continuing the boot sequence!

No matter which style you use, plugins are always asynchronous functions, and every pattern has its error handling. It is essential not to mix the two styles and to be consistent when choosing one or another:

-   Calling `done` if the callback style is used
-   Resolving/rejecting the promise if promise-based is the flavor we chose

We will come back to this argument again in the [Boot errors](#boot-errors) section, where we will see what happens if we misuse promises and callbacks.

!!!note "Promise-based examples"

    This book uses promise-based signatures since they are easier to follow, thanks to the async/await keywords.

In this section, we learned the two different methods to declare our first plugin and register it with a Fastify instance. However, we have just scratched the surface of Fastify plugins. In the next section, we will look at the `options` parameter and how it comes in handy when dealing with sharing functionalities.

## Exploring the options parameter

This section is a deep look at the optional options parameter and how we can develop reusable plugins. A plugin declaration function isn’t anything more than a factory function that, instead of returning some new entity as factory functions usually do, adds behaviors to a Fastify instance. If we look at it like this, we can think about the `options` parameter as our constructor’s arguments.

Firstly, let’s recall the plugin declaration function signature:

```js
async function myPlugin(fastify, [options])
```

How can we pass our custom arguments to the `options` parameter? It turns out that the register method has a second parameter too. So, the object we use as the argument will be passed by Fastify as Plugin’s `options` parameter:

```js
app.register(myPlugin, { first: 'option' });
```

Now, inside the `myPlugin` function, we can access this value simply using `options.first`.

It is worth mentioning that Fastify reserves three specific options that have a special meaning:

-   `prefix`
-   `logLevel`
-   `logSerializers`

!!!note "Logger options"

    We will cover `logLevel` and `logSerializer` in a dedicated chapter. Here, we will focus only on `prefix` and custom options.

Bear in mind that, in the future, more reserved options might be added. Consequently, developers should always consider using a namespace to avoid future collisions, even if it is not mandatory. We can see an example in the `options-namespacing.cjs` snippet:

```js
app.register(
    async function myPlugin(fastify, options) {
        console.log(options.myplugin.first);
    },
    {
        prefix: 'v1',
        myPlugin: {
            first: 'custom option',
        },
    }
);
```

Instead of adding our custom properties at the top level of the `options` parameter, we will group them in a custom key, lowering the chances for future name collisions. Passing an object is fine in most cases, but sometimes, we need more flexibility.

In the next section, we will learn more about the `options` parameter type and leverage it to do more complex stuff.

### The options parameter type

So far, we have seen that the `options` parameter is an object with some reserved and custom properties. But `options` can also be a function that returns an object. If a function is passed, Fastify will invoke it and pass the returned object as the `options` parameter to the plugin. To better understand this, in the `options-function.cjs` snippet, we will rewrite the previous example using the function instead:

```js
app.register(
    async function myPlugin(fastify, options) {
        app.log.info(options.myplugin.first); // option
    },
    function options(parent) {
        // [1]
        return {
            prefix: '1',
            myPlugin: {
                first: 'option',
            },
        };
    }
);
```

At first glance, it shouldn’t be clear why we have this alternative type for options, but looking at the signature points us in the right direction – it receives Fastify’s parent instance as the only argument.

Looking at the `options-function-parent.cjs` example should clarify how we can access the parent options:

```js
const Fastify = require('fastify');
function options(parent) {
    return {
        prefix: 'v1',
        myPlugin: {
            first: parent.mySpecialProp, // [2]
        },
    };
}
const app = Fastify({ logger: true });
app.decorate('mySpecialProp', 'root prop'); // [1]
app.register(async function myPlugin(fastify, options) {
    app.log.info(options.myplugin.first); // 'root prop'
}, options);
app.ready();
```

First, we decorate the root instance with a custom property (`[1]`), and then we pass it as a value to our plugin (`[2]`). In a real-world scenario, `mySpecialProp` could be a database connection, any value that depends on the environment, or even something another plugin has added.

### The prefix option

At the beginning of this chapter, we learned that we can define routes inside a plugin. The `prefix` option comes in handy here because it allows us to add a namespace to our route declarations. There are several use cases for this, and we will see most of them in the more advanced chapters, but it is worth mentioning a couple of them here:

-   Maintaining different versions of our APIs
-   Reusing the same plugin and routes definition for various applications, giving another mount point each time

The `users-router.cjs` snippet will help us understand this parameter better. First of all, we define a plugin in a separate file and export it:

```js
module.exports = async function usersRouter(fastify, _) {
    fastify.register(
        async function routes(child, _options) {
            // [1]
            child.get('/', async (_request, reply) => {
                reply.send(child.users);
            });
            child.post('/', async (request, reply) => {
                // [2]
                const newUser = request.body;
                child.users.push(newUser);
                reply.send(newUser);
            });
        },
        { prefix: 'users' } // [3]
    );
};
```

!!!note "Route declaration"

    Since we are focusing on plugins here and trying to keep the examples as short as possible, this section uses the “shorthand declaration” style for routes. Moreover, schemas and some other crucial options are missing too. We will see through this book that there are much better, formally correct, and complete options for route declarations.

We define two routes; the first one returns all of the elements in our collection (`[1]`), and the second one enables us to add entries to the user’s array (`[2]`). Since we don’t want to add complexity to the discussion, we use an array as our data source; it is defined on the root Fastify instance, as we will learn in the following snippet. In a real-world scenario, this would be, of course, some kind of database access. Finally, at `[3]`, we prefix all of the routes we define with the user’s namespace in the old RESTful fashion.

Now that we have defined the namespace, we can import and add this **router** to the root instance in `index-with-router.cjs`. We can also use the **prefix** option to give a unique namespace to our routes and handle API versioning:

```js
const Fastify = require('fastify');
const usersRouter = require('./users-router.cjs');
const app = Fastify();
app.decorate('users', [
    // [1]
    {
        name: 'Sam',
        age: 23,
    },
    {
        name: 'Daphne',
        age: 21,
    },
]);
app.register(usersRouter, { prefix: 'v1' }); // [2]
app.register(
    async function usersRouterV2(fastify, options) {
        // [3]
        fastify.register(usersRouter); // [4]
        fastify.delete('/users/:name', (request, reply) => {
            // [5]
            const userIndex = fastify.users.findIndex(
                (user) => user.name === request.params.name
            );
            fastify.users.splice(userIndex, 1);
            reply.send();
        });
    },
    { prefix: 'v2' }
);
app.ready().then(() => {
    console.log(app.printRoutes());
}); // [6]
```

First of all, we decorate the Fastify root instance with the `users` property (`[1]`); as previously, this will act as our database for this example. On `[2]`, we register our user’s router with the `v1` prefix. Then, we register a new inline-declared plugin (`[3]`), using the `v2` namespace (every route added in this plugin will have the `v2` namespace). On `[4]`, we register the same user’s routes for a second time, and we also add a newly declared `delete` route (`[5]`).

!!!note "The printRoutes method"

    This method can be helpful during development. If we are not sure of the full path of our routes, it prints all of them for us!

Thanks to `[6]`, we can discover all the routes we mounted:

```
$ node users-router-index.cjs
└── /
    ├── v
    │   ├── 1
    │   │   └── /users (GET)
    │   │       /users (POST)
    │   │       └── / (GET) # [1]
    │   │           / (POST)
    │   └── 2
    │       └── /users (GET)
    │           /users (POST)
    │           └── / (GET) # [1]
    │               / (POST)
    └── v2/users/:name (DELETE)
```

Indeed, prefixing route definitions is a compelling feature. It allows us to reuse the same route declarations more than once. It is one of the crucial elements of the reusability of the Fastify plugins. In our example, we have just two levels of prefix nesting, but there are no limits in practice. We avoid code duplication, using the same `GET` and `POST` definitions twice and adding only one new `DELETE` route to the same user’s namespace when needed.

This section covered how to use the `options` parameter to achieve better plugin reusability and control its registration on the Fastify instance. This parameter has some reserved properties used to tell Fastify how to handle the registering plugin. Furthermore, we can add as many properties as needed by the plugin, knowing that Fastify will pass them during the registration phase.

Since we have already used **encapsulation** in this section without even knowing it, it will be the topic of the next section.

## Understanding encapsulation

So far, we’ve written a few plugins. We are pretty confident about how they are structured and what arguments a plugin receives. We still need to discuss one missing thing about them – the concept of encapsulation.

Let’s recall the plugin function definition signature:

```js
async function myPlugin(fastify, options)
```

As we know at this point, the first parameter is a Fastify instance. This instance is a newly created one that inherits from the outside scope. Let’s suppose something has been added to the root instance, for example, using a decorator. In that case, it will be attached to the plugin’s Fastify instance, and it will be usable as if it is defined inside the current plugin.

The opposite isn’t true, though. If we add functionalities inside a plugin, those things will be visible only in the current plugin’s context.

!!!note "Context versus scope"

Firstly, let’s take a look at the definitions of both terms. The _context_ indicates the current value of the implicit `‘this’` method variable. The _scope_ is a set of rules that manages the visibility of a variable from a function point of view. In the Fastify community, these two terms are used interchangeably and refer to the Fastify instance we are currently working with. For this reason, in this book, we will use both words, meaning the same thing.

Let’s take a look at the example in `encapsulation.cjs`:

```js
const Fastify = require('fastify');
const app = Fastify({ logger: true });
app.decorate('root', 'hello from the root instance.'); // [1]
app.register(async function myPlugin(fastify, _options) {
    console.log('myPlugin -- ', fastify.root);
    fastify.decorate('myPlugin', 'hello from myPlugin.'); // [2]
    console.log('myPlugin -- ', fastify.myPlugin);
});
app.ready().then(() => {
    console.log('root -- ', app.root); // [3]
    console.log('root -- ', app.myPlugin);
});
```

Running this snippet will produce this output:

```sh
$ node encapsulation.cjs
myPlugin --  hello from the root instance.
myPlugin --  hello from myPlugin.
root --  hello from the root instance.
root --  undefined
```

Firstly, we decorate the root instance (`[1]`), adding a string to it. Then, inside `myPlugin`, we print the root decorated value and add a new property to the Fastify instance. In the plugin definition body, we log both values in the console to ensure they are set (`[2]`). Finally, we can see that after the Fastify application is ready, at the root level, we can only access the value we added outside of our plugin (`[3]`). But what happened here? In both cases, we used the `.decorate` method to add our value to the instance. Why are both values visible in `myPlugin` but only the root one visible at the top level? This is the intended behavior, and it happens thanks to encapsulation – Fastify creates a new context every time it enters a new plugin. We call these new contexts **child contexts**. A child context inherits only from the parent contexts, and everything added inside a child context will not be visible to its parent or its siblings’ contexts. The parent-child annidation level is infinite, and we can have contexts that are children to their parents and parents to their children.

The entities that are affected by scoping are:

-   **Decorators**
-   **Hooks**
-   **Plugins**
-   **Routes**

As we can see, since **routes** are affected by context, we already used encapsulation in the previous section, even if we didn’t know it at the time. We registered the same route on the same root instance twice, but with different prefixes. In real-world applications, more complex scenarios with several child and grandchild contexts are widespread. We can use the following diagram to examine a more complex example:

![Figure 2.1: An example of a complex plugin hierarchy](plugin-system1.png)

<center>Figure 2.1: An example of a complex plugin hierarchy</center>

In _Figure 2.1_, we can see a rather complex scenario. We have a root Fastify instance that registers two root plugins. Every root plugin creates a new child context where we can again declare and register as many plugins as we want. That’s it – we can have infinite nesting for our plugins, and every level depth will create a new encapsulated context.

However, Fastify leaves complete control over encapsulation for the developer, and we will see how to control it in the next section.

### Handling the context

Until now, the context we relied upon was based on the default Fastify behavior. It works most of the time, but there are some cases where we need more flexibility. If we need to share context between siblings or alter a parent context, we can still do it. This comes in handy for more complex plugins, such as ones that handle database connections.

We have a couple of tools at our disposal:

-   The `skip-override` hidden property
-   The `fastify-plugin` package

We will start using `skip-override` and then move on to `fastify-plugin`; even though they can be used to achieve the same result, the latter has additional features.

Here, we will use the same example we used before but now add the `skip-override` hidden property to ensure we can access the decorated variable at the top-level scope. The `skip-override.cjs` snippet will help us understand its usage:

```js
const Fastify = require('fastify');
async function myPlugin(fastify, _options) {
    console.log('myPlugin -- ', fastify.root);
    fastify.decorate('myPlugin', 'hello from myPlugin.'); //[2]
    console.log('myPlugin -- ', fastify.myPlugin);
}
myPlugin[Symbol.for('skip-override')] = true; // [1]
const app = Fastify({ logger: true });
app.decorate('root', 'hello from the root instance.');
app.register(myPlugin);
app.ready().then(() => {
    console.log('root -- ', app.root);
    console.log('root -- ', app.myPlugin); //[3]
});
```

There is only one major change in this code snippet from the previous one, which is that we use `Symbol.for('skip-override')` to prevent Fastify from creating a new context (`[1]`). This alone is enough to have the root decorated with the `fastify.myPlugin` variable (`[2]`). We can see that the decorator is also accessible from the outer scope (`[3]`); here is the output:

```sh
$ node skip-override.cjs
myPlugin --  hello from the root instance.
myPlugin --  hello from myPlugin.
root --  hello from the root instance.
root --  hello from myPlugin.
```

!!!note "Symbol.for"

    Instead of using just the `skip-override` property as a string, Fastify uses `Symbol.for` to hide it and avoid name collisions. When a symbol is created, it is added to a runtime-wide symbol registry. Upon the invocation, the `.for` method checks whether the symbol we are trying to access is already present. If not, it first creates it and then returns it. More on symbols can be found at <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol>.

### fastify-plugin

Using `skip-override` is perfectly fine, but there is a better way to control encapsulation behavior. Like many things in the Fastify world, the `fastify-plugin` module is nothing more than a function that wraps a plugin, adds some metadata to it, and returns it.

The main features included with `fastify-plugin` are the following:

-   Adding the `skip-override` property for us
-   Providing the name for the plugin, if no explicit one is passed
-   Checking the minimum version of Fastify
-   Attaching the provided custom metadata to the returned plugin

We should use `fastify-plugin` every time we have a plugin that needs to add behavior to the parent context. To be able to use it, we first need to install it from the <npmjs.com> registry:

```sh
$ npm i fastify-plugin
```

Its signature resembles the `.register` method. It takes two parameters:

1.  The exact plugin function definition, as we have already seen
2.  An optional `options` object with four optional properties:

`name`

: We can use this string property to give a name to our plugin. Giving a name to our plugin is fundamental because it allows us to pass it into the dependencies array, as we will see soon. Moreover, if something unexpected happens during the boot, Fastify will use this property for better stack traces.

`fastify`

: We can use this string property to check the minimum Fastify version that our plugin needs to work correctly. This property accepts as a value any valid **SemVer** range.

`decorators`

: We can use this object to ensure the parent instance has been decorated with properties that we use inside our plugin.

`dependencies`

: If our plugin depends on other plugins’ functionalities, we can use this array of strings to check that all dependencies are met – the values are the plugin name. We will take a deeper look at this property in the next chapter, since it is related to the boot process.

!!!note "SemVer"

    **SemVer** stands for **Semantic Versioning**, and its purpose is to help developers manage their dependencies. It is composed of three numbers separated by two dots, following the `MAJOR.MINOR.PATCH` schema. If any breaking changes are added to the code, then the `MAJOR` number needs to be increased. On the other hand, if new features are added but no breaking changes are introduced, then the `MINOR` number should be increased. Finally, if all of the changes are done only to fix bugs, then the `PATCH` number is bumped.

!!!note "The fp naming convention"

    In the Fastify community, it is common to import the `fastify-plugin` package as `fp` because it is a short yet meaningful variable name. In this book, we will use this convention every time we deal with it.

Let’s take a look at the `fp-myplugin.cjs` example that uses the optional metadata properties:

```js
const fp = require('fastify-plugin');
async function myPlugin(fastify, _options) {
    console.log('myPlugin decorates the parent instance.');
    fastify.decorate('myPlugin', 'hello from myPlugin.');
}
module.exports = fp(myPlugin, {
    // [1]
    name: 'myPlugin', // [2]
    fastify: '4.x', // [3]
    decorators: { fastify: ['root'] }, // [4]
});
```

At `[1]`, we pass `myPlugin` as the first argument and export the wrapped plugin as the default export. The second argument is the options objects:

-   We give an explicit name to our plugin (`[2]`).
-   We set the minimum Fastify version to `4.x` (`[3]`).
-   The `decorators` property accepts the keys of the entities that can be decorated – `fastify`, `request`, and `reply`. Here, we check whether the Fastify parent instance has the `root` property set (`[4]`).

The `fastify-plugin` attaches the `options` object to our plugin in the unique hidden property called `Symbol.for('plugin-meta')`. Fastify will look for this property during the plugin registration, and if found, it will act accordingly to its content.

In the `fp-myplugin-index.cjs` snippet, we import and register our plugin, checking the different outcomes:

```js
const Fastify = require('fastify');
const myPlugin = require('./fp-myplugin.cjs');
const app = Fastify({ logger: true });
app.decorate('root', 'hello from the root instance.')[1]; //
app.register(myPlugin); // [2]
app.ready().then(() => {
    console.log('root -- ', app.root);
    console.log('root -- ', app.myPlugin); //[3]
});
```

First, we decorate the root fastify instance with a string property (`[1]`). Then, we register our plugin (`[2]`). Remember that we specified the root property as mandatory inside the metadata of `fastify-plugin`. Before registering `myPlugin`, Fastify checks whether the property is declared on the parent context, and since it is there, it goes on with the boot process. Finally, since `fastify-plugin` adds the `skip-override` property for us, we can access the `myPlugin` property in the root scope with no issues (`[3]`). Let’s take a look at the output of this snippet:

```sh
$ node fp-myplugin-index.cjs
myPlugin decorates the parent instance.
root --  hello from the root instance.
root --  hello from myPlugin.
```

Everything works as expected!

Now, looking at `fp-myplugin-index-missing-root.cjs`, we can check what happens if the `root` decorator is missing from the root instance, as it was declared in `fp-myplugin-index.cjs` at `[1]`, as shown previously:

```js
const Fastify = require('fastify');
const myPlugin = require('./fp-myplugin.cjs');
const app = Fastify({ logger: true });
app.register(myPlugin);
app.ready().then(() => {
    console.log('root -- ', app.root);
    console.log('root -- ', app.myPlugin);
});
```

Running this file will throw and abort the boot process:

```sh
$ node fp-myplugin-index-missing-root.cjs
/node_modules/fastify/lib/pluginUtils.js:98
      throw new FST_ERR_PLUGIN_NOT_PRESENT_IN_INSTANCE(decorator,
withPluginName, instance)
            ^
FastifyError [Error]: The decorator 'root' required by 'myPlugin' is
not present in Fastify
    at /node_modules/fastify/lib/pluginUtils.js:98:13
    at Array.forEach (<anonymous>)
    at _checkDecorators (/node_modules/fastify/lib/pluginUtils.
js:95:14)
    at Object.checkDecorators (/node_modules/fastify/lib/pluginUtils.
js:81:27)
    at Object.registerPlugin (/node_modules/fastify/lib/pluginUtils.
js:137:19)
    at Boot.override (/node_modules/fastify/lib/pluginOverride.
js:28:57)
    at Plugin.exec (/node_modules/avvio/plugin.js:79:33)
    at Boot.loadPlugin (/node_modules/avvio/plugin.js:272:10)
    at processTicksAndRejections (node:internal/process/task_
queues:83:21) {
  code: 'FST_ERR_PLUGIN_NOT_PRESENT_IN_INSTANCE',
  statusCode: 500
}
```

We can see that Fastify used the `myPlugin` name in the `FST_ERR_PLUGIN_NOT_PRESENT_IN_INSTANCE` error, helping us to understand the issue. This is very helpful when dealing with dozens of registered plugins.

!!!note "The name property"

    We saw that the `fastify-plugin` `options` parameter is optional, and so is its `name` property. But what happens if we don’t pass it? It turns out that a name will be generated and attached to the plugin. If our plugin is a named function (it contains the name property), it will be used as the plugin name. Otherwise, the filename is the next candidate. In both cases, a standard part will be appended – `auto-{N}`. The `N` is an auto-incremented number that starts from 0. The appended part is needed to avoid naming collisions since the developer does not provide these names, and Fastify doesn’t want to block the boot process for unintended collisions. It is important to remember that giving an explicit name to our plugins is considered a best practice.

This section covered one of the core yet most difficult concepts in Fastify – **encapsulation**. We learned how Fastify provides default behavior that suits the most common cases but gives full power to the developer whenever needed. In addition, tools such as `skip-override` and `fastify-plugin` are fundamental when dealing with more complex scenarios, where control over the context is crucial.

But how does Fastify know the correct order of plugin registration? Is it even a deterministic process? We will discover this and more about the boot sequence in the next section.

## Exploring the boot sequence

We learned in the previous section that a plugin is just an asynchronous function with well-defined parameters. We’ve also seen how Fastify plugins are the core entity we use to add features and functionalities to our applications. In this section, we will learn what the boot sequence is, how plugins interact with each other, and how Fastify ensures that all the developer’s constraints are met, before running the HTTP server.

Firstly, it is essential to say that the Fastify boot sequence is asynchronous too. Fastify loads every plugin added with the `register` method, one by one, respecting the order of the registration. Fastify starts this process only after `.listen()` or `.ready()` are called. After that, it waits for all promises to be settled (or for all completed callbacks to be called, if the callback style is used), and then it emits the ready event. If we have already got this far, we can be sure that our application is up and running and ready to receive incoming requests.

!!!note "Avvio"

    The boot process is baked by `Avvio`, a library that can also be used standalone. `Avvio` handles all the complexities concerning the asynchronous boot – error handling, loading order, and dispatching the ready event, enabling developers to ensure that the application is started after everything is loaded without any errors.

**48**
