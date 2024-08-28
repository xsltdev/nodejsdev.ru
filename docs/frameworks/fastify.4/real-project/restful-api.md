# Building a RESTful API

In this chapter, we will build upon the scaffolding structure we created in the previous chapter and dive into writing the essential parts of our application.

We will start by defining the routes of our application and then move on to connecting to data sources. We will also implement the necessary business logic and learn how to solve complex everyday tasks that we may encounter while developing a real-world Fastify application.

The chapter will be divided into several main headings, starting with defining the routes, then connecting to data sources, implementing the routes, securing the endpoints, and applying the **Don’t Repeat Yourself (DRY)** principle to make our code more efficient.

By the end of this chapter, we will have learned the following:

-   How to declare and implement routes using Fastify plugins
-   How to add JSON schemas to secure the endpoints
-   How to load route schemas
-   How to use decorators to implement the DRY pattern

Technical requirements

To follow along with this chapter, you will need these exact technical requirements, mentioned in the previous chapters:

-   A working [Node.js 18 installation](https://nodejs.org/)
-   A [VS Code IDE](https://code.visualstudio.com/)
-   An active [Docker installation](https://docs.docker.com/get-docker/)
-   A [Git](https://git-scm.com/) repository – recommended but not mandatory
-   A working command shell

All the code snippets for this chapter are available on [GitHub](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%207).

So, let’s get started and build a robust and efficient application that we can use as a reference for future projects!

## Application outline

In this section, we will start building a RESTful to-do application. The application will allow users to perform **Create**, **Read**, **Update**, and **Delete (CRUD)** operations on their to-do list, using HTTP methods such as `GET`, `POST`, `PUT`, and `DELETE`. Besides those operations, we will implement one **custom action** to mark tasks as “done.”

!!!note "What is RESTful?"

    **Representational State Transfer (RESTful)** is an architectural style to build web services that follow well-defined constraints and principles. It is an approach for creating scalable and flexible web APIs that different clients can consume. In RESTful architecture, resources are identified by **Uniform Resource Identifiers (URIs)**. The operations performed on those resources are based on predefined HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, etc.). Every call to the API is stateless and contains all the information needed to perform the operation.

Fastify is an excellent choice to develop RESTful APIs, due to its speed, flexibility, scalability, and developer-friendliness. In addition, as we saw in previous chapters, its modular plugin architecture makes it easy to add or remove functionality as needed, and its low-level optimizations make it a robust choice for high-traffic applications. Finally, we will take advantage of this architecture to organize our code base in a scoped way, making every piece of it independent from the others.

### Defining routes

Let’s start evolving the application from our basic project structure by adding a new plugin that defines our RESTful routes. However, we will not implement the logic of single routes right now, since we first need to look at the data source in the forthcoming [Data source and model](#data-source-and-model) section.

The following `routes/todos/routes.js` snippet defines the basic structure of our routes plugin:

```js
'use strict';
module.exports = async function todoRoutes(fastify, _opts) {
    // [1]
    fastify.route({
        method: 'GET',
        url: '/',
        handler: async function listTodo(request, reply) {
            return { data: [], totalCount: 0 }; // [2]
        },
    });
    fastify.route({
        method: 'POST',
        url: '/',
        handler: async function createTodo(request, reply) {
            return { id: '123' }; // [3]
        },
    });
    fastify.route({
        method: 'GET',
        url: '/:id',
        handler: async function readTodo(request, reply) {
            return {}; // [4]
        },
    });
    fastify.route({
        method: 'PUT',
        url: '/:id',
        handler: async function updateTodo(request, reply) {
            reply.code(204); // [5]
        },
    });
    fastify.route({
        method: 'DELETE',
        url: '/:id',
        handler: async function deleteTodo(request, reply) {
            reply.code(204); // [6]
        },
    });
    fastify.route({
        method: 'POST',
        url: '/:id/:status',
        handler: async function changeStatus(
            request,
            reply
        ) {
            reply.code(204); // [7]
        },
    });
};
```

Our module exports (`[1]`) is a Fastify plugin called `todoRoutes`. Inside it, we have defined six routes, five for basic CRUD operations and one additional action to flag tasks as done. Let’s take a brief look at every one of them:

-   `listTodo GET /`: Implements the **List** operation. It returns an array of to-do tasks and the total count of the elements (`[2]`).
-   `createTodo POST /`: Implements the **Create** operation. It creates the task from the body data of `request` and returns `id` of the created element (`[3]`).
-   `readTodo GET /:id`: Implements the **Read** operation. It returns the task that matches the `:id` parameter (`[4]`).
-   `updateTodo PUT /:id`: Implements the **Update** operation. It updates the to-do item that matches the `:id` parameter, using the body data of `request` (`[5]`).
-   `deleteTodo DELETE /:id`: Implements the `Delete` operation. It deletes the task matching the `:id` parameter (`[6]`).
-   `changeStatus POST /:id/:status`: Implements a **custom action**. It marks a task as “done” or “undone” (`[7]`).

Note that we added a name to every handler function for clarity and as a best practice, since it helps to have better stack traces.

Now, let’s look at how to use this plugin module inside our application.

### Register routes

Solely declaring the routes plugin doesn’t add any value to our application. Therefore, we need to register it before using it. Thankfully, we already have everything from the previous chapter to auto- register these routes. The following excerpt from `apps.js` shows the vital part:

```js
// ...
fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'), // [1]
    indexPattern: /.*routes(\.js|\.cjs)$/i, // [2]
    ignorePattern: /.*\.js/,
    autoHooksPattern: /.*hooks(\.js|\.cjs)$/i,
    autoHooks: true,
    cascadeHooks: true,
    options: Object.assign({}, opts),
});
// ...
```

This code snippet uses a plugin called `@fastify/autoload` to automatically load routes and hooks from a specified directory.

We specified the `routes` folder (`[1]`) as the path where our routes are located, and then we defined the regular expression pattern (`[2]`) to identify the route files. Therefore, to make Fastify pick our previous `routes.js` file, we must save it in the `./routes/todos/routes.js` file.

You may be wondering why we added that `todos` subfolder to our path. `AutoLoad` has another neat behavior – it will automatically load all the subfolders of the specified path, using the folder name as the prefix path for the routes we define. Our handlers will be prefixed with the `todos` path when registered by the Fastify application. This feature helps us organize our code in subfolders without forcing us to define the prefix manually. Let’s make a couple of calls to our application routes to make some concrete examples.

We need two terminals opened, the first to start the application and the second to make our calls using `curl`.

In the first terminal, go to the project root and type npm to start, as shown here:

```
$ npm start
{"level":30, "time":1679152261083, "pid":92481, "hostname": "dev.
local", "msg": "Server listening at http://127.0.0.1:3000"}
```

Now that the server is running, we can leave the first terminal open and go to the second one. We are ready to make the API calls:

```
$ curl http://127.0.0.1:3000/todos
{"data":[],"totalCount":0}%
$ curl http://127.0.0.1:3000/todos/1
{}%
```

In the preceding snippet, we can see we made two calls. In the first one, we successfully called the `listTodo` handler, while in the second call, we called `readTodo`.

### Data source and model

Before implementing the handlers’ logic, we need to look at data persistence. Since we registered the MongoDB plugin inside the application in Chapter 6, [Project Structure and Configuration Management](./project-structure.md#project-structure-and-configuration-management), we already have everything in place to save our to-do items to a real database.

Thanks to Fastify’s plugin system, we can use the database client inside our route plugin, since the instance we receive as the first argument is decorated with the mongo property. Furthermore, we can assign the `'todos'` collection to a local variable and use it inside the route handlers:

```js
'use strict';
module.exports = async function todoAutoHooks(
    fastify,
    _opts
) {
    const todos = fastify.mongo.db.collection('todos');
    // ... rest of the route plugin implementation ...
};
```

We can now move on to defining our data model. Even if MongoDB is a schemaless database and we don’t need to define anything upfront, we will outline a simple interface for a to-do task. It is important to remember that we don’t need to add this code snippet to our application or database. We are showing it here just for clarity:

```js
interface Todo
   _id: ObjectId, // [1]
   id: ObjectId, // [2]
   title: string, // [3]
   done: boolean, // [4]
   createdAt: Date, // [5]
   modifiedAt: Date, // [6]
}
```

Let’s take a look at the properties we just defined:

-   `_id` (`[1]`) and `id` (`[2]`) have the same value. We add the `id` property not to expose any information about our database. The `_id` property is defined and used mainly by MongoDB servers.
-   The `title` (`[3]`) property is user-editable and contains the to-do task.
-   The `done` (`[4]`) property saves the task status. A task is completed when the value is `true`. Otherwise, a task is still in progress.
-   `createdAt` (`[5]`) and `modifiedAt` (`[6]`) are automatically added by the application to track when the item was created and last modified.

Now that we have defined everything we need from the data source perspective, we can finally move on to implement the logic of the route handlers in the next section.

## Implementing the routes

Until now, we implemented our handlers as dummy functions that don’t do anything at all. This section will teach us how to save, retrieve, modify, and delete actual to-do tasks using MongoDB as the data source. For every subsection, we will examine only one handler, knowing that it will replace the same handler we already defined in `./routes/todos/routes.js`.

!!!note "Unique identifiers"

    This section contains several code snippets and commands to issue in the terminal. It is important to remember that the unique IDs we show here are different from the ones you will have when testing the routes. In fact, the IDs are generated when a task is created. Change the command snippets accordingly.

We will start with `createTodo` since having items saved on the database will help us implement and test the other handlers.

### createTodo

As the name implies, this function allows users to create new tasks and save them to the database. The following code snippet defines a route that handles a `POST` request when a user hits the `/todos/` path:

```js
fastify.route({
    method: 'POST',
    url: '/',
    handler: async function createTodo(request, reply) {
        // [1]
        const _id = new this.mongo.ObjectId(); // [2]
        const now = new Date(); // [3]
        const createdAt = now;
        const modifiedAt = now;
        const newTodo = {
            _id,
            id: _id,
            ...request.body, // [4]
            done: false,
            createdAt,
            modifiedAt,
        };
        await todos.insertOne(newTodo); // [5]
        reply.code(201); // [6]
        return { id: _id };
    },
});
```

When the route is invoked, the handler function (`[1]`) generates a new unique identifier (`[2]`) for the to-do item and sets the creation and modification dates (`[3]`) to the current time. The handler then constructs a new to-do object from the request body (`[4]`). The object is then inserted into the database using the `todos` collection we created at the beginning of the routes plugin (`[5]`). Finally, the function sends a response with a status code of `201` (`[6]`), indicating that the resource has been created and a body containing the ID of the newly created item.

At last, we can test our new route. As usual, we can use two terminal windows and `curl` to make calls, passing the body.

**180**
