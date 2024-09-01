# Type-Safe Fastify

Welcome to the final chapter of this book! This chapter will explore how Fastify’s built-in TypeScript support can help us write more robust and maintainable applications.

Type safety is a crucial aspect of modern software development. It allows developers to catch errors and bugs early in the development process, reducing the time and cost of debugging and testing. By using TypeScript with Fastify, you can benefit from compile-time type safety and avoid unexpected runtime errors, leading to more stable and reliable applications.

Using TypeScript with Fastify can also improve the developer experience by providing better code completion, type inference, and documentation. In addition, Fastify has first-class support for TypeScript, providing everything needed to build robust and scalable applications, including interfaces and generics.

Moreover, using TypeScript can make deployments safer by catching potential errors and bugs before they go live. It provides an extra layer of protection to our code, giving us more confidence when deploying.

By the end of the chapter, we will have learned how to do the following:

-   Create a simple Fastify project in TypeScript
-   Add support for automatic type inference with so-called type-providers
-   Auto-generate a documentation site for our APIs

## Technical requirements

To follow along with this chapter, you will need the following:

-   A working [Node.js 18 installation](https://nodejs.org/)
-   The [VS Code IDE](https://code.visualstudio.com/)
-   A [Git repository](https://git-scm.com/) is recommended but not mandatory
-   A terminal application

The code for the project can be found on [GitHub](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%2015).

In the next section, we’ll dive into the details of setting up the Fastify project in TypeScript, adding all of the dependencies we need to make it work.

## Creating the project

Creating a new Fastify project with TypeScript support is straightforward but requires adding some extra dependencies. In this section, we’ll look at the process of manually setting up a new Fastify project with TypeScript and installing the necessary dependencies.

Let’s start with the `package.json` file, a configuration file for a Node.js project. It includes information about the dependencies, the entry point, and scripts. The following is just a partial snippet since we will evolve it through the sections of this chapter:

```json
{
    "version": "1.0.0",
    "main": "dist/server.js", // [1]
    "dependencies": {
        "@fastify/autoload": "^5.7.1",
        "fastify": "^4.15.0"
    },
    "devDependencies": {
        "@types/node": "^18.15.11", // [2]
        "eslint-config-standard-with-typescript": "^34.0.1",
        "fastify-tsconfig": "^1.0.1", // [3]
        "rimraf": "^5.0.0",
        "tsx": "^3.12.6", // [4]
        "typescript": "^5.0.4" // [5]
    },
    "scripts": {
        "build": "rimraf dist && tsc", // [6]
        "dev": "tsx watch src/server.ts" // [7]
    }
}
```

The `package.json` file listed in the preceding code block includes the base dependencies required for the project and two scripts that will improve the development experience. As we already mentioned, to add TypeScript support, we need to add some additional development dependencies to the project besides Fastify.

Here is a breakdown of the development dependencies:

-   The `main` field (`[1]`) specifies the application’s entry point when it is run with the `node .` command from the project’s root.
-   `@types/node` (`[2]`) is a development dependency that provides TypeScript type definitions for the Node.js API. We need it to use the global variables shipped in the Node.js runtime.
-   `fastify-tsconfig` (`[3]`) provides a preconfigured TypeScript configuration for use with the Fastify framework. We can extend our configuration from it and have handy defaults already configured out of the box.
-   `tsx` (`[4]`) adds a TypeScript runtime tool to watch and rerun the server on file changes. It is built upon Node.js and has a zero-configuration policy.
-   Finally, the `typescript` (`[5]`) development dependency adds the TypeScript compiler to check type definitions and compile the project to JavaScript. We will add a `tsconfig.json` file to the project’s root to make it work properly.

Moving to the `scripts` section of `package.json`, we have the following:

-   `build` (`[6]`) is a script that deletes the existing `dist` folder and invokes the TypeScript compiler (`tsc`).
-   The `dev` (`[7]`) script starts the `tsx` command-line tool to rerun the application as changes are made to the project files. Running the TypeScript files directly is handy during development because it enables faster development cycles.

We are ready to create the `tsconfig.json` file in the project’s root folder. This configuration file will make our Node.js project a TypeScript project.

### Adding the tsconfig.json file

The `tsconfig.json` file is the configuration file for the TypeScript compiler, and it provides a way to specify options and settings that control how the code is compiled into JavaScript. For this reason, as we saw in the previous section, the Fastify team maintains the `fastify-tsconfig` npm package with the recommended configuration for Fastify plugins and applications written in TypeScript.

In the `tsconfig.json` code snippet, we can see how to use it:

```json
{
    "extends": "fastify-tsconfig", // [1]
    "compilerOptions": {
        "outDir": "dist", // [2]
        "declaration": false, // [3]
        "sourceMap": true // [4]
    },
    "include": [
        // [5]
        "src/**/*.ts"
    ]
}
```

Let’s analyze the configuration:

-   First, we use the `extends` property (`[1]`) to extend from `fastify-tsconfig`. This package provides a recommended configuration for Fastify web applications built with TypeScript.
-   `compilerOptions` (`[2]`) configures the TypeScript compiler to put the compiled JavaScript files in the `dist` directory. For this reason, previously, we configured the application’s entry point to `dist/server.js` using the main field of `package.json`.
-   Since we are developing an application, our code will be run and not consumed as a library. Therefore, we set the `declaration` option to `false` (`[3]`) since we don’t need the compiler to generate type definition files (`*.d.ts`).
-   On the other hand, we want the compiler to generate source map files (`*.map`) that map the compiled JavaScript code back to the original TypeScript source code (`[4]`). This is useful for understanding runtime errors and debugging since it allows us to set breakpoints and step through the original TypeScript code.
-   Finally, when compiling the source code, we want to include all files with the `.ts` extension inside the `src` folder and its subfolders (`[5]`).

Using a `tsconfig.json` file, developers can ensure that all team members use the same configuration options, providing a standardized way to configure the TypeScript compiler across different machines.

!!!note "TypeScript compiler options"

    TypeScript offers a wide range of compiler options that can be specified in the `tsconfig.json` file to control the behavior of the TypeScript compiler. These options include things such as target output version, module resolution strategy, source map generation, and code generation. The Fastify team provides an opinionated configuration that is good for most projects. You can find more information about all options in the official [TypeScript documentation](https://www.typescriptlang.org/tsconfig).

### Adding the application’s entry point

First, we need to write the entry point for our application. The usual Fastify server with the autoload plugin will load our routes and do the job. The code is straightforward, and we can look at it in the following snippet:

```js
import { join } from 'node:path';
import Fastify from 'fastify';
import AutoLoad from '@fastify/autoload';
const fastify = Fastify({ logger: true }); // [1]
void fastify.register(AutoLoad, {
    // [2]
    dir: join(__dirname, 'routes'),
});
fastify
    .listen({ host: '0.0.0.0', port: 3000 })
    .catch((err) => {
        fastify.log.error(err);
        process.exit(1); // [3]
    });
```

Before jumping into the code, remember to run `npm i` inside the project root.

Now, let’s analyze the preceding snippet:

-   This code creates a Fastify server with logging enabled (`[1]`). Since we are inside a TypeScript file, the type system is enabled. For example, if we hover over the `fastify` variable in the VS Code editor, we can see that it has the `FastifyInstance` type. Moreover, thanks to the first-class support for the TypeScript language by Fastify, everything is fully typed out of the box.
-   Next, it registers a plugin using `AutoLoad` to load routes dynamically from the `routes` directory. The `register` method returns a `Promise` object, but we’re not interested in its return value. By using `void`, we are explicitly indicating that we don’t want to capture or use the return value of the `Promise` object, and we’re just running the method for its side effects (`[2]`).
-   Then, it starts the server on port `3000` and listens for incoming requests. If an error occurs while booting the server, it logs the error and exits the process with an error code (`[3]`).

Now that we’ve defined our entry point, we can take care of the `root` plugin.

## Using Fastify type-providers

A Fastify type-provider is a TypeScript-only package that simplifies the definition of JSON schemas by providing type annotations and generics. Using it will allow Fastify to infer type information directly from schema definitions. Type-providers enable developers to define API endpoints’ expected input and output data easily, automatically check the type correctness at compile time, and validate the data at runtime.

Fastify supports several type-providers, such as `json-schema-to-ts` and `TypeBox`. In TypeScript projects, using a type-provider can help reduce the boilerplate code required for input validation and reduce the likelihood of bugs due to invalid data types. This can ultimately make your code more robust, maintainable, and scalable.

For the sake of brevity, in the following example, we will focus only on the `TypeBox` type-provider. However, since which type-provider you use is based on personal preference, we encourage you to try other type-providers to find the best fit:

```js
import {
    type FastifyPluginAsyncTypebox,
    Type,
} from '@fastify/type-provider-typebox'; // [1]
const plugin: FastifyPluginAsyncTypebox = async function (
    fastify,
    _opts
) {
    // [2]
    fastify.get(
        '/',
        {
            schema: {
                querystring: Type.Object({
                    name: Type.String({ default: 'world' }), // [3]
                }),
                response: {
                    200: Type.Object({
                        hello: Type.String(), // [4]
                    }),
                },
            },
        },
        (req) => {
            const { name } = req.query; // [5]
            return { hello: name }; // [6]
        }
    );
    fastify.post(
        '/',
        {
            schema: {
                body: Type.Object({
                    name: Type.Optional(Type.String()), // [7]
                }),
                response: {
                    200: Type.Object({
                        hello: Type.String(),
                    }),
                },
            },
        },
        async (request) => {
            const { name } = request.body; // [8]
            const hello =
                typeof name !== 'undefined' && name !== ''
                    ? name
                    : 'world';
            return { hello }; // [9]
        }
    );
};
export default plugin;
```

The code snippet shows a Fastify plugin that uses `@fastify/type-provider-typebox` to define and validate the shape of the request and response objects of the routes.

Here is a breakdown of what the code does:

-   First, we import `FastifyPluginAsyncTypebox` and `Type` from the `@fastify/type-provider-typebox` module (`[1]`). `FastifyPluginAsyncTypebox` is a type alias for `FastifyPluginAsync` that injects the support for `@sinclair/typebox` schema definitions.
-   The plugin is defined as an `async` function that takes two arguments: `fastify` and `_opts`. Thanks to the explicit `FastifyPluginAsyncTypebox` type annotation (`[2]`), this `fastify` instance will automatically infer the types of the route schemas.
-   The `fastify.get()` method defines a `GET` route at the root URL (`/`). We use the previously imported `Type` object to create a `querystring` object that defines a name property of the `string` type containing `"world"` as its default value (`[3]`). Moreover, we use it again to set the response as an object with a single `hello` property of the `string` type (`[4]`). Both types will automatically have the TypeScript types inferred inside the route handler.
-   Hovering over the `name` variable (`[5]`) in VS Code will show a `string` type. This behavior happens thanks to the type-provider.
-   The route handler returns an object with a single `hello` property set to the value of the `name` property extracted from the `querystring` object (`[6]`). The return type of the function is also inferred thanks to `TypeBox`. As an exercise, we can try changing the returning object to `{ hello: 2 }`, and the TypeScript compiler will complain since we’ve assigned a number instead of a string.
-   The `fastify.post()` method is called to define a POST route at the root URL (`/`). The route schema includes a body object that defines an optional name property of the `string` type (`[7]`). Thanks to this declaration, the `request.body` object in the route handler is again fully typed (`[8]`). This time, we declared the `request.body.name` property as optional. We need to check whether it is `undefined` before using it in the return object and, otherwise, set it to the `world` string (`[9]`). As we saw for the other route handler, returning a value incompatible with the schema declaration will throw a compilation error.

Here, we wrap up this section. Thanks to type-providers, we can quickly achieve type safety across the code base by following these pointers without needing explicit type declarations:

-   At runtime, the JSON schema will sanitize the inputs and serialize the outputs, making our APIs more reliable, secure, and faster.
-   At compile time, our code base is fully type-checked. In addition, every variable from the schema declarations has inferred types, enabling us to find more errors before deploying the application.

In the upcoming section, we will see how we can automatically generate a documentation website compliant with the Swagger/OpenAPI specification.

## Generating the API documentation

The OpenAPI specification is a widely adopted and open standard for documenting RESTful APIs. It provides a format for describing the structure and operations of an API in a machine-readable format, allowing developers to understand and interact with the API quickly.

The specification defines a set of JSON or YAML files that describe an API’s endpoints, parameters, responses, and other details. This information can be used to generate API documentation, client libraries, and other tools that make it easier to work with the API.

!!!note "Swagger and OpenAPI specifications"

    Swagger and OpenAPI are two related specifications, with OpenAPI being the newer version of Swagger. Swagger was originally an open source project, but later, the specification was acquired by SmartBear and renamed to OpenAPI. Today, the OpenAPI initiative, a consortium of industry leaders, maintains the specification. Swagger is also known as OpenAPI v2, while only OpenAPI generally refers to v3.

Fastify encourages developers to define JSON schemas for every route they register. It would be great if there were an automatic way to convert those definitions to the Swagger specification. And, of course, there is. But first, we must add two new dependencies to our project and use them inside the application’s entry point. Now, let’s install the `@fastify/swagger` and `@fastify/swagger-ui` Fastify plugins via the terminal application. To do it, in the project root, type the following command:

```sh
$  npm install @fastify/swagger @fastify/swagger-ui
```

Now, we can register the two newly added packages with the Fastify instance inside the `src/server.ts` file. Both packages support the Swagger and OpenAPI v3 specifications. We can choose which one to generate, passing the specific option. The following snippet configures the plugin to generate the Swagger (OpenAPI v2) specification and documentation site:

```js
import { join } from 'node:path';
import Fastify from 'fastify';
import AutoLoad from '@fastify/autoload';
import Swagger from '@fastify/swagger';
import SwaggerUI from '@fastify/swagger-ui';
const fastify = Fastify({ logger: true });
void fastify.register(Swagger, {
    swagger: {
        // [1]
        info: {
            // [2]
            title: 'Hello World App Documentation',
            description: 'Testing the Fastify swagger API',
            version: '1.0.0',
        },
        consumes: ['application/json'],
        produces: ['application/json'], // [3]
        tags: [
            {
                name: 'Hello World', // [4]
                description:
                    'You can use these routes to salute whomever you want.',
            },
        ],
    },
});
void fastify.register(SwaggerUI, {
    routePrefix: '/documentation', // [5]
});
// ... omitted for brevity
```

This snippet configures the `swagger` and `swagger-ui` plugins to generate the specification definitions and the documentation site. Here is a breakdown of the code:

-   The `@fastify/swagger` plugin is registered. We are passing the `swagger` property to generate the specifications for OpenAPI v2 (`[1]`).
-   We define general information about our API inside the `swagger` object, such as its title, description, and version, passing them to the `info` property (`[2]`). `swagger-ui` will use this to generate a website with more details.
-   We define the `consumes` and `produces` arrays (`[3]`) to indicate the expected request and response content types. This information is crucial for the API users, and it helps when it comes to testing the endpoints.
-   We define the `tags` array to group API endpoints by topic or functionality. In this case, only one tag named `Hello World` exists (`[4]`). In the following `src/routes/root.ts` snippet, we will see how to group the routes we have already defined.
-   Finally, we register the `@fastify/swagger-ui` plugin by calling `fastify.register(SwaggerUI, {...})`. The generated documentation can then be accessed using a web browser by navigating to the URL path specified in `routePrefix` (`[5]`) (in this case, `/documentation`).

Next, we will modify the original route definitions to improve the auto-generated documentation. We want to do it to have better route grouping in the interface and more precise descriptions.

In the following snippet, we will omit the parts that are not relevant, but you can find the complete code in the `src/routes/root.ts` file inside the GitHub repository:

```js
import {
    type FastifyPluginAsyncTypebox,
    Type,
} from '@fastify/type-provider-typebox';
const plugin: FastifyPluginAsyncTypebox = async function (
    fastify,
    _opts
) {
    fastify.get('/', {
        schema: {
            tags: ['Hello World'], // [1]
            description: 'Salute someone via a GET call.', // [2]
            summary: 'GET Hello Route', // [3]
            querystring: Type.Object({
                name: Type.String({
                    default: 'world',
                    description:
                        'Pass the name of the person you want to salute.', // [4]
                }),
            }),
        },
        // ... omitted
    });
    fastify.post('/', {
        schema: {
            tags: ['Hello World'],
            description: 'Salute someone via a POST call.',
            summary: 'POST Hello Route',
            body: Type.Object(
                {
                    name: Type.Optional(Type.String()),
                },
                {
                    description:
                        'Use the name property to pass the name of the person you want to salute.',
                }
            ),
            // ... omitted
        },
    });
};
```

Even though we have shown the code additions for both routes, we will break down only the first one because the second one is structured the same:

-   The `tags` property (`[1]`) specifies that the route belongs to the `Hello World` tag we defined while registering the `@fastify/swagger` plugin. This property provides a way to group related routes together in the Swagger/OpenAPI documentation.
-   The `description` field briefly describes what the route does (`[2]`). It will be displayed at the top of the Swagger documentation.
-   `summary` summarizes what the route does (`[3]`). It will be displayed near the route definition in the documentation.
-   To provide a better understanding of the parameters accepted by an endpoint, we can add a dedicated description (`[4]`). It will be displayed in the Swagger documentation in the parameter details.

To test everything we added in this section, we can run our server in development mode (`npm run dev`) and use the browser to go to <http://localhost:3000/documentation>. We will be presented with a nice-looking website that we can navigate to learn more about the application we developed. Moreover, the page also integrates a client we can use to make actual calls to our API.

## Summary

In this chapter, we learned why type safety is crucial in modern software development and how using TypeScript with Fastify can help catch errors and bugs early in development. The chapter also covered how using TypeScript with Fastify can improve the developer experience by providing better code completion, type inference, and the ability to auto-generate the documentation site for our APIs.

Congratulations on reaching the final chapter of this book! Throughout this journey, we have learned about the Fastify web framework and how it can help us build high-performance web applications.
