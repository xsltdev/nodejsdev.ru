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

In the first terminal, run the server:

```sh
$ npm start
{"level":30, "time":1679152261083, "pid":92481, "hostname": "dev.
local", "msg": "Server listening at http://127.0.0.1:3000"}
```

Now in the second, we can use curl to perform the request:

```sh
$ curl -X POST http://localhost:3000/todos -H "Content-Type:
application/json" -d '{"title": "my first task"}'
{"id": "64172b029eb96017ce60493f"}%
```

We can see that the application returned id of the newly created item. Congratulations! You implemented your first working route!

In the following subsection, we will read the tasks list from the database!

### listTodo

Now that our first item is saved to the database, let’s implement the list route. It will allow us to list all the tasks with their total count.

We can start directly with the excerpt from `routes/todos/routes.js`:

```js
fastify.route({
    method: 'GET',
    url: '/',
    handler: async function listTodo(request, reply) {
        const { skip, limit, title } = request.query; // [1]
        const filter = title
            ? { title: new RegExp(title, 'i') }
            : {}; // [2]
        const data = await todos
            .find(filter, {
                limit,
                skip,
            }) // [3]
            .toArray();
        const totalCount = await todos.countDocuments(
            filter
        );
        return { data, totalCount }; // [4]
    },
});
```

Inside the `listTodo` function, the request object is used to extract query parameters (`[1]`), such as `skip`, `limit`, and `title`. The `title` parameter is used to create a regular expression filter to search for to-do items whose titles partially match the `title` parameter (`[2]`). If `title` is not provided, `filter` is an empty object, effectively returning all items.

The data variable is then populated with to-do items that match `filter`, by calling `todos.find()` and passing it as the parameter. In addition, the `limit` and `skip` query parameters are also passed to implement proper **pagination** (`[3]`). Since the MongoDB driver returns a cursor, we convert the result to an array using the `toArray()` method.

!!!note "Pagination"

    Pagination is a technique used in database querying to limit the number of results returned by a query and retrieve only a specific subset of data at a time. When a query returns a large number of results, it can be difficult to display or process all of them at once. When working with lists of items, pagination allows users to access and process large amounts of data more manageably and efficiently. As a result, it improves the user experience and reduces the application and database load, leading to better performance and scalability.

The `totalCount` variable is calculated by calling `todos.countDocuments()` with the same `filter` object, so the API client can implement the pagination correctly. Finally, the handler function returns an object containing the data array and the `totalCount` number (`[4]`).

Again, we can now call the route using the two terminal instances and the `curl` binary, and we expect the response to have our first to-do item.

In the first terminal, run the server:

```sh
$ npm start
{"level":30, "time":1679152261083, "pid":92481, "hostname": "dev.
local", "msg": "Server listening at http://127.0.0.1:3000"}
```

Now in the second, we can use `curl` to perform the request:

```sh
$ curl http://127.0.0.1:3000/todos
{"data":[{"_id": "64172b029eb96017ce60493f", "title": "my
first task", "done":false, "id": "64172b029eb96017ce60493f",
"createdAt": "2023-03-19T15:32:18.314Z", "modifiedAt":
"2023-03-19T15:32:18.314Z"}], "totalCount":1}%
```

We can see that everything is working as expected, and `"my first task"` is the only item returned inside the `data` array. Also, `totalCount` is correctly number `1`.

The next route we will implement allows us to query for one specific item.

### readTodo

This RESTful route allows clients to retrieve a single to-do item from the database, based on its unique `id` identifier. The following excerpt illustrates the implementation of the handler function:

```js
fastify.route({
    method: 'GET',
    url: '/:id', // [1]
    handler: async function readTodo(request, reply) {
        const todo = await todos.findOne(
            {
                _id: new this.mongo.ObjectId(
                    request.params.id
                ),
                // [2]
            },
            { projection: { _id: 0 } }
        ); // [3]
        if (!todo) {
            reply.code(404);
            return { error: 'Todo not found' }; // [4]
        }
        return todo; // [5]
    },
});
```

The `/:id` syntax in the `url` property (`[1]`) indicates that this route parameter will be replaced with a specific value when the client calls this route. In fact, the handler function first retrieves this `id` from the `request.params` object and creates a new `ObjectId` from it, using `this.mongo.ObjectId()` (`[2]`). It then uses the `findOne` method of the `todos` collection to retrieve the task with the matching `_id`. We exclude the `_id` field from the result, using the `projection` option, to not leak the database server we use (`[3]`). In fact, MongoDB is the only one that uses the `_id` field as the primary reference.

If a matching to-do item is found, it is returned as the response (`[5]`). Otherwise, the handler sets the HTTP status code to `404` and returns an error object, with a message saying the task was not found (`[4]`).

To test the route, we can use the usual process. From now on, we will omit the terminal that runs the server and only show the one we use to make our calls:

```sh
$ curl http://127.0.0.1:3000/todos/64172b029eb96017ce60493f
{"title": "my first task", "done":false, "id":
"64172b029eb96017ce60493f", "createdAt": "2023-03-19T15:32:18.314Z",
"modifiedAt": "2023-03-19T15:32:18.314Z"}%
```

Again, everything works as expected. We managed to pass the ID of the task we added to the database as the route parameter and received, as the response, the task titled `"my first task"`.

So far, if a user makes a mistake in the title, there is no way to change it. This will be the next thing we will take care of.

### updateTodo

The following code snippet adds a route that handles `PUT` requests to update a task already saved in the database:

```js
fastify.route({
    method: 'PUT',
    url: '/:id', // [1]
    handler: async function updateTodo(request, reply) {
        const res = await todos.updateOne(
            {
                _id: new fastify.mongo.ObjectId(
                    request.params.id
                ),
            }, // [2]
            {
                $set: {
                    ...request.body, // [3]
                    modifiedAt: new Date(),
                },
            }
        );
        if (res.modifiedCount === 0) {
            // [4]
            reply.code(404);
            return { error: 'Todo not found' };
        }
        reply.code(204); // [5]
    },
});
```

We again use the `:id` parameter to identify which item the user wants to modify (`[1]`).

Inside the route handler, we use the MongoDB client `updateOne()` method to update the to-do item in the database. We are using the `request.params.id` property once more to create a filter object to match the task with the provided `_id` (`[2]`). Then, we use the `$set` operator to partially update the item with the new values from `request.body`. We also set the `modifiedAt` property to the current time (`[3]`).

After the update is completed, it checks the `modifiedCount` property of the result to see whether the update was successful (`[4]`). If no documents were modified, it returns a `404` error. If the update is successful, it produces a `204` status code to indicate it was completed successfully without returning a body (`[5]`).

After running the server in the usual way, we can test the route we just implemented using the terminal and `curl`:

```sh
$ curl -X PUT http://localhost:3000/todos/64172b029eb96017ce60493f
-H "Content-Type: application/json" -d '{"title": "my first task
updated"}'
```

This time, we pass the `-X` argument to `curl` to use the `PUT` HTTP method. Then, in the request body, we modify the title of our tasks and pass the task’s unique ID as the route parameter. One thing that might create confusion is that the server hasn’t returned a body, but looking at the return value of `updateTodo`, it shouldn’t come as a surprise.

We can check whether the to-do item was updated correctly by calling the `readTodo` route:

```sh
$ curl http://127.0.0.1:3000/todos/64172b029eb96017ce60493f
{"title": "my first task updated", "done":false, "id":
"64172b029eb96017ce60493f", "createdAt": "2023-03-19T15:32:18.314Z",
"modifiedAt": "2023-03-19T17:41:09.520Z"}%
```

In the response, we can immediately see the updated title and the `modifiedAt` date, which is now different from `createdAt`, signaling that the item was updated.

Our application still lacks a delete functionality, so it is time to fix it. The following subsection will overcome this limitation.

### deleteTodo

Following the RESTful conventions, the next code snippet defines a Fastify route that allows a user to delete a task, passing its unique `:id` as a request parameter:

```js
fastify.route({
    method: 'DELETE',
    url: '/:id', // [1]
    handler: async function deleteTodo(request, reply) {
        const res = await todos.deleteOne({
            _id: new fastify.mongo.ObjectId(
                request.params.id
            ),
        }); // [2]
        if (res.deletedCount === 0) {
            // [3]
            reply.code(404);
            return { error: 'Todo not found' };
        }
        reply.code(204); // [4]
    },
});
```

After declaring the `DELETE` HTTP method, we pass the `:id` parameter as the route path to allow us to identify which item to delete (`[1]`).

Inside the `deleteTodo` function, we create the filter from the `request.params.id` property (`[2]`), and we pass it to the `todos` collection `deleteOne` method to delete tasks with that unique ID. After that call returns, we check whether the item was actually deleted from the database. If no documents were removed, the handler returns a `404` error (`[3]`). On the other hand, if the deletion is successful, we return an empty body with a 204 status code to indicate that the operation has completed successfully (`[4]`).

Testing the newly added route is simple, as always – we use the same terminal and `curl` setup we used for the previous routes.

After starting the server in one terminal, we run the subsequent command in the other:

```sh
$ curl -X DELETE http://localhost:3000/todos/64172b029eb96017ce60493f
$ curl http://127.0.0.1:3000/todos/64172b029eb96017ce60493f
{"error": "Todo not found"}%
```

Here, we make two different calls. The first one deletes the entity in the database and returns an empty response. The second, on the other hand, is to check whether the previous call deleted the resource. Since it returns a not found error, we are sure we deleted it.

No to-do list application would be complete without a way to mark tasks as “done” or move them back to “progress,” and this is precisely the next thing we will add.

### changeStatus

This is our first route that doesn’t follow the CRUD principles. Instead, it is a custom logic that performs a specific operation on a single task. The following excerpt from `routes/todos/routes.js` shows a `POST` action that, upon invocation, marks a task as “done” or “not done,” depending on its state. It is the first route to use two distinct request parameters:

```js
fastify.route({
    method: 'POST',
    url: '/:id/:status', // [1]
    handler: async function changeStatus(request, reply) {
        const done = request.params.status === 'done'; // [2]
        const res = await todos.updateOne(
            {
                _id: new fastify.mongo.ObjectId(
                    request.params.id
                ),
            },
            {
                $set: {
                    done,
                    modifiedAt: new Date(),
                },
            }
        ); // [3]
        if (res.modifiedCount === 0) {
            // [4]
            reply.code(404);
            return { error: 'Todo not found' };
        }
        reply.code(204); // [5]
    },
});
```

Our route expects two parameters in the URL – `:id`, the unique identifier of the to-do item, and `:status`, which indicates whether the current task should be marked as “done” or “not done” (`[1]`).

The handler function first checks the value of the `status` parameter to determine the new value of the `done` property (`[2]`). It then uses the `updateOne()` method to update the `done` and `modifiedAt` properties of the item in the database (`[3]`). If the update is successful, the handler function returns a `204 No Content` response (`[5]`). On the other hand, if the item is not found, the handler function returns a `404 Not Found` response with an error message (`[4]`).

Before testing this route, we need at least one task in the database. If necessary, we can use the `createTodo` route to add it. Now, we can test the implementation using `curl`, as usual:

```sh
$ curl -X POST http://localhost:3000/todos/641826ecd5e0cccc313cda86/
done
$ curl http://localhost:3000/todos/641826ecd5e0cccc313cda86
{"id": "641826ecd5e0cccc313cda86", "title": "my first task",
"done":true, "createdAt": "2023-03-20T09:27:08.986Z", "modifiedAt":
"2023-03-20T09:27:32.902Z"}%
$ curl -X POST http://localhost:3000/todos/641826ecd5e0cccc313cda86/
undone
$ curl http://localhost:3000/todos/641826ecd5e0cccc313cda86
{"id": "641826ecd5e0cccc313cda86", "title": "my first task",
"done":false, "createdAt": "2023-03-20T09:27:08.986Z", "modifiedAt":
"2023-03-20T09:56:06.995Z"}
```

In the terminal output, we set the item’s `done` property to `true`, passing `done` as the `:status` parameter of the request. We then call the `GET` single-item route to check whether the operation effectively changes the status. Then, to revert the process and mark the task as not yet done, we call the `done` route again, passing `undone` as the status request parameter. Finally, we check that everything works as expected and call again the `readTodo` handler.

This last route completes our to-do list application’s basic functionalities. We are not done yet, though. In the next section, we will learn more about the security of our application and why our current implementation is insecure by design.

## Securing the endpoints

So far, every route we declared doesn’t perform any check on the input the user passes. This isn’t good, and we, as developers, should always validate and sanitize the input of the APIs we expose. In our case, all the `createTodo` and `updateTodo` handlers are affected by this security issue. In fact, we take the `request.body` and pass it straight to the database.

First, to better understand the underlying issue, let’s give an example of how a user can inject undesired information into our database with our current implementation:

```sh
$ curl -X POST http://localhost:3000/todos -H "Content-Type:
application/json" -d '{"title": "awesome task", "foo": "bar"}'
{"id": "6418214ad5e0cccc313cda85"}%
$ curl http://127.0.0.1:3000/todos/6418214ad5e0cccc313cda85
{"id": "6418214ad5e0cccc313cda85", "title": "awesome task", "foo":
"bar", "done":false, "createdAt": "2023-03-20T09:03:06.324Z",
"modifiedAt": "2023-03-20T09:03:06.324Z"}%
```

In the preceding terminal snippet, we issued two `curl` commands. In the first one, when creating an item, instead of passing only `title`, we also pass the `foo` property. Looking at the output returned, we can see that the command returned the ID of the created entity. Now, we can check what is saved in the database by calling the `readTodo` route. Unfortunately, we can see in the output that we also saved `"foo": "bar"` in the database. As previously mentioned, this is a security issue, and we should never allow users to write directly to the database.

There is another issue with the current implementation. We didn’t attach any response serialization schema to our routes. While less critical from a security perspective, they are crucial regarding the throughput of our application. Letting Fastify know in advance the shape of the values we return from our routes helps it to serialize the response body faster. Therefore, we should always add all schemas when declaring a route.

In the upcoming sections, we will implement only one schema per type to make the exposition concise. You can find all schemas in the dedicated folder of the accompanying [repository](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%207/routes/todos/schemas).

## Loading route schemas

Before implementing the schemas, let’s add a dedicated folder to organize our code base better. We can do it inside the `./routes/todos/` path. Moreover, we want to load them automatically from the `schemas` folder. To be able to do that, we need the following:

-   A dedicated plugin inside the `schemas` folder
-   A definition of the schemas we wish to use
-   An autohooks plugin that will load everything automatically when the `todos` module is registered on the Fastify instance

We will discuss these in detail in the following subsections.

### Schemas loader

Starting with the first item of the list we just discussed, we want to create a `./routes/todos/schemas/loader.js` file. We can check the content of the file in the following code snippet:

```js
'use strict';
const fp = require('fastify-plugin');
module.exports = fp(async function schemaLoaderPlugin(
    fastify,
    opts
) {
    // [1]
    fastify.addSchema(require('./list-query.json')); // [2]
    fastify.addSchema(require('./create-body.json'));
    fastify.addSchema(require('./create-response.json'));
    fastify.addSchema(require('./status-params.json'));
});
```

Let’s break down this simple plugin:

-   We defined a Fastify plugin named `schemaLoaderPlugin` that loads JSON schemas (`[1]`)
-   We called Fastify’s `addSchema` method several times, passing the path of each JSON file as an argument (`[2]`)

As we already know, every schema definition defines the structure and the validation rules of response bodies, parameters, and queries for different routes.

Now, we can start implementing the first body validation schema.

#### Validating the createTodo request body

The application will use this schema during task creation. We want to achieve two things with this schema:

1.  Prevent users from adding unknown properties to the entity
2.  Make the `title` property mandatory for every task

Let’s take a look at the code of `create-body.json`:

```json
{
    "type": "object",
    "$id": "schema:todo:create:body", // [1]
    "required": ["title"], // [2]
    "additionalProperties": false, // [3]
    "properties": {
        "title": {
            "type": "string" // [4]
        }
    }
}
```

The schema is of the `object` type and, even if short in length, adds many constraints to the allowed inputs:

-   `$id` is used to identify the schema uniquely across the whole application; it can be used to reference it in other parts of the code (`[1]`).
-   The `required` keyword specifies that the `title` property is required for this schema. Any object that does not contain it will not be considered valid against this schema (`[2]`).
-   The `additionalProperties` keyword is `false` (`[3]`), meaning that any properties not defined in the `"properties"` object will be considered invalid against this schema and discarded.
-   The only property allowed is `title` of the `string` type (`[4]`). The validator will try to convert `title` to a string during the body validation phase.

Inside [Using the schemas](#using-the-schemas) section, we will see how to attach this definition to the correct route. Now, we will move on and secure the request path parameters.

#### Validating the changeStatus request parameters

This time, we want to validate the request path parameters instead of a request body. This will allow us to be sure that the call contains the correct parameters with the correct type. The following `status-params.json` shows the implementation:

```json
{
    "type": "object",
    "$id": "schema:todo:status:params", // [1]
    "required": ["id", "status"], // [2]
    "additionalProperties": false,
    "properties": {
        "id": {
            "type": "string" // [3]
        },
        "status": {
            "type": "string",
            "enum": ["done", "undone"] // [4]
        }
    }
}
```

Let’s take a look at how this schema works:

-   The \$id field defines another unique identifier for this schema (`[1]`).
-   In this case, we have two required parameters – `id` and `status` (`[2]`).
-   The id property must be a string (`[3]`), while `status` is a string whose value can be `"done"` or `"undone"` (`[4]`). No other properties are allowed.

Next, we will explore how to validate the query parameters of a request using `listTodos` as an example.

#### Validating the listTodos request query

At this point, it should be clear that all schemas follow the same rules. A query schema is not an exception. However, in the `list-query.json` snippet, we will use schema reference for the first time:

```json
{
    "type": "object",
    "$id": "schema:todo:list:query", // [1]
    "additionalProperties": false,
    "properties": {
        "title": {
            "type": "string" // [2]
        },
        "limit": {
            "$ref": "schema:limit#/properties/limit" // [3]
        },
        "skip": {
            "$ref": "schema:skip#/properties/skip"
        }
    }
}
```

We can now break down the snippet:

-   As usual, the `$id` property gives the schema a unique identifier that can be referenced elsewhere in the code (`[1]`).
-   The `title` property is of the `string` type, and it is optional (`[2]`). It can be filtered by the partial `title` of the to-do item. If not passed, the filter will be created empty.
-   The `limit` property specifies the maximum number of items to return and is defined by referencing the `schema` `schema:limit` schema (`[3]`). The `skip` property is also defined by referencing `schema` `schema:skip` and is used for pagination purposes. These schemas are so general that they are shared throughout the project.

Now, it is time to take a look at the last schema type – the response schema.

#### Defining the createTodo response body

Defining a response body of a route adds two main benefits:

-   It prevents us from leaking undesired information to clients
-   It increases the throughput of the application, thanks to the faster serialization

`create-response.json` illustrates the implementation:

```json
{
    "type": "object",
    "$id": "schema:todo:create:response", // [1]
    "required": ["id"], // [2]
    "additionalProperties": false,
    "properties": {
        "id": {
            "type": "string" // [3]
        }
    }
}
```

Let’s examine the structure of this schema:

-   Once again, `$id` is a unique identifier for this schema (`[1]`)
-   The response object has one `required` (`[2]`) property, named `id`, of the `string` type (`[3]`)

This response schema ends the current section about schema definitions. Now, it is time to learn how to use and register those schemas.

### Adding the Autohooks plugin

Once again, we can leverage the extensibility and the plugin system Fastify gives to developers. We can start by recalling from [Chapter 6](./project-structure.md) that we already registered a `@fastify/autoload` instance on our application. The following excerpt from the `app.js` file shows the relevant parts:

```js
fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    indexPattern: /.*routes(\.js|\.cjs)$/i,
    ignorePattern: /.*\.js/,
    autoHooksPattern: /.*hooks(\.js|\.cjs)$/i, // [1]
    autoHooks: true, // [2]
    cascadeHooks: true, // [3]
    options: Object.assign({}, opts),
});
```

For the purpose of this section, there are three properties that we care about:

-   `autoHooksPattern` (`[1]`) is used to specify a regular expression pattern that matches the filenames of the hook files in the `routes` directory. These files will be automatically loaded and registered as hooks for the corresponding routes.
-   `autoHooks` (`[2]`) enables the automatic loading of those hook files.
-   `cascadeHooks` (`[3]`) ensures that the hooks are executed in the correct order.

After this brief reminder, we can move on to implementing our autohook plugin.

### Implementing the Autohook plugin

We learned from `autoHooksPattern` in the previous section that we can put our plugin inside a file named `autohooks.js` in the `./routes/todos` directory, and it will be automatically registered by `@fastify/autoload`. The following snippet contains the content of the plugin:

```js
'use strict';
const fp = require('fastify-plugin');
const schemas = require('./schemas/loader'); // [1]
module.exports = fp(async function todoAutoHooks(
    fastify,
    opts
) {
    fastify.register(schemas); // [2]
});
```

We start importing the schema loader plugin we defined in a previous section (`[1]`). Then, inside the plugin body, we register it (`[2]`). This one line is enough to make the loaded schemas available in the application. In fact, the plugin attaches them to the Fastify instances to make them easily accessible.

Finally, we can use these schemas inside our route definitions, which we will do in the next section.

### Using the schemas

Now, we have everything in place to secure our routes and make the application’s throughput ludicrously fast.

This section will only show you how to do it for one route handler. You will find the complete code in the book’s [repository](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%207), and you are encouraged to experiment with other routes too.

The following code snippet attaches the schemas to the route definition:

```js
fastify.route({
    method: 'POST',
    url: '/',
    schema: {
        body: fastify.getSchema('schema:todo:create:body'), // [1]
        response: {
            201: fastify.getSchema(
                'schema:todo:create:response'
            ), // [2]
        },
    },
    handler: async function createTodo(request, reply) {
        // ...omitted for brevity
    },
});
```

We are adding a `schema` property to the route definition. It contains an object with two fields:

-   The `body` property of the `schema` option specifies the JSON schema that the request body must validate against (`[1]`). Here, we use `fastify.getSchema('schema:todo:create:body')`, which retrieves the JSON schema for the request body from the schemas collection, using the ID we specified in the declaration.
-   The `response` property of the `schema` option specifies the JSON schema for the response to the client (`[2]`). It is set to an object with a single key, `201`, which specifies the JSON schema for a successful creation response, since it is the code we used inside the handler. Again, we use `fastify.getSchema('schema:todo:create:response')` to retrieve the JSON schema for the response from the schemas collection.

If we now try to pass an unknown property, the schema validator will strip away from the body. Let’s experiment with it using the terminal and `curl`:

```sh
$ curl -X POST http://localhost:3000/todos -H "Content-Type:
application/json" -d '{"title": "awesome task", "foo": "bar"}'
{"id":"6418671d625e3ba28a056013"}%
$ curl http://localhost:3000/todos/6418671d625e3ba28a056013
{"id":"6418671d625e3ba28a056013","title":"awesome task","done":fa
lse,"createdAt":"2023-03-20T14:01:01.658Z","modifiedAt":"2023-03-
20T14:01:01.658Z"}%
```

We pass the `foo` property inside our body, and the API returns a successful response, with the unique `id` of the task saved in the database. The second call checks that the validator works as expected. The `foo` field isn’t present in the resource, and therefore, it means that our API is now secure.

This almost completes our deep dive into RESTful API development with Fastify. However, there is one more important thing that can make our code base more maintainable, which we need to mention before moving on.

## Don’t repeat yourself

Defining the application logic inside routes is fine for simple applications such as the one in our example. In a real-world scenario, though, when we need to use our logic across an application in multiple routes, it would be nice to define that logic only once and reuse it in different places. So, once more, Fastify has us covered.

We can expand our `autohooks.cjs` plugin by adding what is commonly known as a data source. In the following snippet, we expand the previous plugin, adding the needed code, although, for the brevity of the exposition, we are showing only the function for the `createTodo` handler; you can find the whole implementation inside the book’s code repository:

```js
'use strict';
const fp = require('fastify-plugin');
const schemas = require('./schemas/loader');
module.exports = fp(async function todoAutoHooks(
    fastify,
    opts
) {
    // [1]
    const todos = fastify.mongo.db.collection('todos'); // [2]
    fastify.register(schemas);
    fastify.decorate('mongoDataSource', {
        // [3]
        // ...
        async createTodo({ title }) {
            // [4]
            const _id = new fastify.mongo.ObjectId();
            const now = new Date();
            const { insertedId } = await todos.insertOne({
                _id,
                title,
                done: false,
                id: _id,
                createdAt: now,
                modifiedAt: now,
            });
            return insertedId;
        },
        // ...
    });
});
```

Let’s break down the implementation:

-   We wrap our plugin with `fastify-plugin` to expose the data source to other plugin scopes (`[1]`).
-   Since we will not access the MongoDB collection from the routes anymore, we moved its reference here (`[2]`).
-   We decorate the Fastify instance with the `mongoDataSource` object (`[3]`) which has several methods, including `createTodo`.
-   We moved the item creation logic that was inside the route handler here (`[4]`). The function returns `insertedId`, which we can use to populate the body to return to the clients.

Now, we must update our `createTodo` route handler to take advantage of the newly added code. Let’s do it in the `routes/todos/routes.js` code excerpt:

```js
fastify.route({
    method: 'POST',
    url: '/',
    schema: {
        body: fastify.getSchema('schema:todo:create:body'),
        response: {
            201: fastify.getSchema(
                'schema:todo:create:response'
            ),
        },
    },
    handler: async function createTodo(request, reply) {
        const insertedId = await this.mongoDataSource.createTodo(
            request.body
        ); // [1]
        reply.code(201);
        return { id: insertedId }; // [2]
    },
});
```

Our handler body is a one-liner. Its new duty is to take `request.body` (`[1]`) and to pass it to the `createTodo` data source method. After that call returns, it takes the returned unique ID and forwards it to the client (`[2]`). Even in this simple example, it should be clear how powerful this feature is. We can use it to make our code reusable from every application part.

This final section covered everything we need to know to develop a simple yet complete application using Fastify.

## Summary

This chapter taught us step by step how to implement a RESTful API in Fastify. First, we used the powerful plugin system to encapsulate our route definitions. Then, we secured our routes and database accesses using schema definitions. Finally, we moved the application logic inside a dedicated plugin using decorators. This allowed us to follow the DRY pattern and make our application more maintainable.

The following chapter will look at user management, sessions, and file uploads to extend the application’s capabilities even more.
