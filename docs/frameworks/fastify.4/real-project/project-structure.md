# Project Structure and Configuration Management

Starting from this chapter, we are going to create a real-world RESTful cloud-native application from the initial project structure. No more foo/bar examples and Fastify theory. We will put into action what we have learned in the previous chapters. This will lead us to understand how to build an application.

This chapter will build a solid scaffolding structure that you may reuse for your future projects. You will be introduced to and use community packages and create your own plugins when needed.

This is the learning path we will cover in this chapter:

-   Designing the application structure
-   Improving the application structure
-   Debugging your application
-   Sharing the application configuration across plugins
-   Using Fastify plugins

## Technical requirements

As mentioned in the earlier chapters, you will need the following:

-   A working Node.js 18 installation.
-   The [VS Code IDE](https://code.visualstudio.com/).
-   A working [Docker installation](https://docs.docker.com/get-docker/).
-   A [Git](https://git-scm.com/) repository is highly recommended but not mandatory.
-   A working command shell.

All the snippets in this chapter are on [GitHub](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%206).

## Designing the application structure

In this chapter, we will design a backend application that will expose some RESTful APIs.

The application structure enables you to write applications that are easy to implement, evolve, and maintain. A good system must be flexible to your needs and the application’s changes. Additionally, it should impose some implementation design to let you and your team avoid some major pitfalls, which could lead to an unstable and untestable application.

This chapter will discuss the application’s features only marginally. In fact, a scaffolding project should not care about them, but it should apply them to any project. For this reason, we will create an application with some health check routes and a MongoDB connection ready to be used.

We will introduce a set of Fastify plugins that will help us structure our application and reduce the burden of writing some utilities from scratch, which have already been developed and tested on production by multiple projects.

The critical takeaway here is to understand _why_ we will build the following structure in this manner. The structure we are going to see is not mandatory, and you might be critical of the proposed design. We think it is important to personalize the application to adapt it to your own needs and preferences.

We are done with the talking. Let’s start to build our application!

### Setting up the repository

Before we start writing the code, we should define a baseline from where to start. Thankfully, building an empty Fastify application is quite easy due to an official utility built by the Fastify team. To use it, we need to open the command shell and type the following commands:

```sh
mkdir fastify-app
cd ./fastify-app
npm init fastify
```

Running these commands creates a new `fastify-app` folder and executes the `npm init` command from within it.

!!!note "The init command"

    When you run the `init` command, npm executes the `create-fastify` module, which you can find at this [GitHub repository](https://github.com/fastify/create-fastify). You can create the `create-my-app` authority to build an application scaffolding to speed up the project initialization.

As a result, you will see the following files and directories:

-   `package.json`: This is the project entry point.
-   `app.js`: This is the main application file. It is the first file to be loaded.
-   `plugins/`: This folder stores custom plugins. It contains some sample files.
-   `routes/`: This folder stores the application’s endpoints. It includes a few example endpoints.
-   `test/`: This is the folder where we write our application’s test.

The starter application is ready to be installed by running `npm install`. After the installation, you may find these scripts that are already configured useful:

-   `npm test`: This script runs the test of the scaffolding application.
-   `npm start`: This script will start your application.
-   `npm run dev`: This script will start your application in _development mode_. The server automatically reloads your application at every file change.

We have just built a basic Fastify application setup that we will customize to create our application. Reading the generated source code using the `init` command, you will find comments that help you orientate yourself, giving you some insight that we will see throughout this chapter.

!!!note "Application versioning"

    To start building a real-world application, it is essential to set up a **version control system (VCS)**. This software lets us version our source code and manage changes. You should use **Git** software for this task as it is the standard de facto software in the tech industry. However, learning about Git is not the aim of this book. To find out how to install and use Git, check out the _Technical requirements_ section.

At this stage, all the commands we mentioned in this section should work on your PC. Take some time to try the development mode by editing the `routes/root.js` file, and adding a new `GET /hello` route while the server is up and running!

### Understanding the application structure

The application structure we have built so far has excellent out-of-the-box features. It is founded on some of the following pillars:

-   It relies on the `fastify-cli` plugin to start the application and provide the developer mode
-   It takes advantage of the `@fastify/autoload` plugin to automatically load all the files contained in the `plugins/` and `routes/` folders

It is not mandatory to use these two plugins, but they offer many great features that we will need at some point during our application evolution. Using them now will help you gain confidence in those features and speed you up later.

#### The `fastify-cli` plugin

The `fastify-cli` **command line interface (CLI)** helps us start our application. It is used on the `package.json` file. The `scripts` property uses the `fastify start` command with some options to create the `app.js` file. As you will notice, the `app.js` file exports a typical Fastify `async function (fastify, opts)` plugin interface. The file is loaded by the CLI as a usual `app.register()` call, as we saw in the [Adding a basic plugin instance](../basic/what-is-fastify.md#adding-a-basic-plugin-instance) section of Chapter 1. In this case, we are not instantiating the Fastify root server instance or calling the `listen` method. All these tasks are accomplished by `fastify-cli`, saving us from the code boilerplate.

Moreover, the CLI improves the development process by implementing proper settings and options:

-   It adds _a graceful shutdown_, as we read about in the [Shutting down the application](../basic/what-is-fastify.md#shutting-down-the-application) section in Chapter 1.
-   It reads a root `.env` file by default. It is a `key=value` file that only contains string. It is used to describe the settings that will be read from the operating system environment setup. All these variables are mapped into the Node.js `process.env` object.
-   It starts listening on the `PORT` environment variable for all the hosts.
-   It accepts the `--debug` option to start the application in _debug mode_ to debug your code.
-   It exposes the `--options` flag to customize the Fastify server option since we are not instantiating it directly.
-   The `--watch` argument turns on server auto-reloading when a file in the project changes.
-   The `--pretty-logs` argument makes the output logs readable on the shell.

You can find the detailed documentation on the CLI in the [repository](https://github.com/fastify/fastify-cli#options).

We are going to customize our `fastify-cli` installation in the next section: [Improving the application structure](#improving-the-application-structure).

#### The `@fastify/autoload` plugin

The autoload plugin automatically loads the plugins found in a directory and configures the routes to match the folders’ structure. In other words, if you create a new `routes/test/foo.js` file with the following content, a new `GET /test/` route will be declared:

```js
module.exports = async function (fastify, opts) {
    fastify.get('/', async function (request, reply) {
        return 'this is an example';
    });
};
```

This behavior follows a **convention over configuration** design paradigm. Its focus is reducing the implementation to provide the desired behavior by default.

By using the `@fastify/autoload` plugin, you can see every file as an encapsulated context, where every folder composes the plugin’s `prefix`, as we saw in [Chapter 2](../basic/plugin-system.md).

Given that we don’t need the entire code to be autoloaded, it is fine to require our plugins and routes to register the required parts as children, but we need to find a clear pattern for doing this.

The autoload plugin has some default behaviors and is based on a naming convention that could be confusing if you don’t study the documentation. We will not explore all the different options and combinations: there are a lot, and it would take a book to explain them! For this reason, we will customize the default application to make it more transparent and easy to maintain, using the most consolidated setup.

## Improving the application structure

We are becoming confident with our basic application setup, but it is not yet ready. We can improve it to define our own rules and give a better developer experience. We will create a solid project scaffolding focusing on the big picture first. After that, we will complete the Fastify setup details.

### Starting an optimal project

A good project is not only fancy technology in action but it must also provide a good developer experience, reducing any burden. According to Fastify’s philosophy, we should set up our new code base keeping this aspect in mind. Therefore, we will provide a brief introduction to those aspects, as they are priceless and time-saving but often underrated.

#### The README file

The first addition to our project is a `README.md` file. A typical readme file introduces newcomers to an existing project, answering a set of basic information questions as follows:

-   What are the project’s requirements? Do you need a database or some other external resources?
-   How do you install the application? What package manager and Node.js version does it use?
-   How do you start the application? Where can missing data (such as environment variables) be found?
-   How do you develop the application? Are there some conventions that developers must follow?
-   How do you test the application? Does it require unit tests or end-to-end tests?
-   How do you deploy the application? What are the processes and the environment’s URLs?
-   What should a developer do if there is missing information?

This set of questions may not have answers at the beginning of the project, but it is good to note the unanswered ones and to find answers to them in the future.

!!!note "Positive vibes"

    The README file has many other positive effects on the team’s morale. A developer will feel productive after reading it. We suggest you read the following article if you want to know more about the importance of the README file. The [article](https://tom.preston-werner.com/2010/08/23/readme-driven-development.html) is written by Tom Preston-Werner, co-founder of GitHub and many other open source projects.

The most important thing is to keep the README file up to date. Every reader should improve it by adding missing parts or removing old ones. If this descriptive file becomes too large, it will become practically unreadable. So consider creating a `docs/` folder to split it into more readable pieces.

#### The code linter

Another essential step you should consider is adopting a **linter**. A linter is a piece of software that analyzes the source code statically and warns you about possible issues or typos to save you hours of debugging and adding `console.log` statements.

If you don’t want to choose a linter and configure it, we suggest opting for `standard`. It is a zero- configuration linter, which can be installed by running `npm install standard --save-dev`, and is ready to be integrated into custom `package.json` scripts, as follows:

```
  "scripts": {
    "lint": "standard",
    "lint:fix": "standard --fix",
  // file continues
```

In this way, we will be able to run `npm run lint` to check our source code and get feedback. If there is no output, it means that all is good! Running `npm run lint:fix` will fix the errors automatically when possible – it is helpful for formatting issues.

Note that we can integrate the lint validation with a requirement for the project. We need to modify the `package.json` scripts like so:

```
    "pretest": "npm run lint",
    "test": "tap \"test/**/*.test.js\"",
```

The `npm test` command will automatically execute the `pretest` and `posttest` scripts if present. You may find it helpful to read the npm `pre` and `post` documentation to run extra commands before and after a script execution: <https://docs.npmjs.com/cli/v7/using-npm/scripts#pre--post-scripts>.

#### The container build

The Fastify application we will build during this book can work on a **production server** or a **container engine**. The former can run our application using the canonical `npm start` command. The latter requires a **container** to run our application.

We are not going to go into much depth about the container topic since it is out of the scope of this book. It is useful to enter this topic using a secure example, which you will see next. This configuration is ready to build Node.js production containers.

To build a Docker container that contains our software, we must create a `Dockerfile` document on the root directory. This file contains the instruction to build our container image in the most secure way possible:

```dockerfile
FROM node:18-alpine as builder
WORKDIR /build
COPY package.json ./
COPY package-lock.json ./
ARG NPM_TOKEN
ENV NPM_TOKEN $NPM_TOKEN
RUN npm ci --only=production --ignore-scripts
FROM node:18-alpine
RUN apk update && apk add --no-cache dumb-init
ENV HOME=/home/app
ENV APP_HOME=$HOME/node/
ENV NODE_ENV=production
WORKDIR $APP_HOME
COPY --chown=node:node . $APP_HOME
COPY --chown=node:node --from=builder /build $APP_HOME
USER node
EXPOSE 3000
ENTRYPOINT ["dumb-init"]
CMD ["npm", "start"]
```

The previous script snippet defines how Docker should create the container. These steps are described as follows:

1.  `FROM`: This starts the multistage build of our application from a base image within Node.js and with npm installed.
2.  `ENV`: This defines some useful environment variables that will always be set up in the container.
3.  `COPY`: This copies the `package.json` files into a container’s folder.
4.  `WORKDIR`: This sets the current working directory and where to run the subsequent commands from.
5.  `RUN npm ci`: This installs the project dependencies using the `package-lock` file.
6.  `COPY`: This copies the application source code into the container.
7.  `RUN apk`: This installs the _dumb-init_ software into the container.
8.  `USER`: This sets the container’s default user at runtime. This user is a least-privilege user to secure our production environment.
9.  `EXPOSE`, `ENTRYPOINT`, and `CMD`: These define the container’s external interface and set the application start as the default command on container initialization.

This file is a secure and complete descriptor to build the application container, and it is the perfect baseline for our project. It will change over time as the logic to start up the application changes.

We adopted a multistage build because you may need to provide some secrets to your application to install it successfully. A typical example is to rely on a private npm registry. These secrets must not be persisted into the application’s Docker image, else anyone who gets access to the Docker image will be able to leak the npm token and get access to your private npm registry. The multistage build, instead, consists of a two step build process:

1.  Create a `builder` image that has access to the private npm registry, and download the application’s dependencies.
2.  Copy the dependencies from the `builder` image to the application one, and then throw away the `builder` image and its secrets.

Finally, to use this file you must run the `docker build -t my-app` command. and the build process will start. We will discuss this topic further in [Chapter 10](./deploy.md).

#### The test folder

We must not forget about testing our application. As a reminder, we should create a `test/` folder containing all the application’s tests, which we will implement in [Chapter 9](./testing.md). However, we need to be comfortable with our application structure first. This is because the test implementation depends on the project implementation. Only after we have reached a stable solution will we be able to write our basic assertions, such as the following:

-   The application starts correctly
-   The configurations are loaded in the right order

The tests’ assertions must reply to these questions positively to prove that our configuration scaffolding works as expected.

We have completed the basic project setup. It was not strictly about Fastify, but it concerned how to start a good project even before writing some code lines. We must not forget that every line of the code or documentation will become the future legacy code. For this reason, we should do our best to make it easy and secure to use.

Now let’s see how to continue the code base structure to prepare us to write our first real-world application.

### Managing project directories

The application scaffolding currently has two main directories loaded in the same manner by the `@fastify/autoload` plugin. But these folders are not equal at all.

We need more buckets to order the source code and to make it clear and readable. For example, we saw that the JSON schemas structures can become verbose, so we should move them from our routes implementation to keep us focused on the business logic.

We are going to create new project folders to define the final project structure and declare what they should contain. Every directory will have its own `@fastify/autoload` configuration.

The folders are presented in order of loading, and you must not forget that while writing:

```js
fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
});
fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
});
```

The code will load the plugins first and then the routes. If the process was reversed, it would lead to errors. For this reason, the following project folders are presented in order of loading.

#### Loading the plugins

The `plugins/` folder should contain plugins that are based on the `fastify-plugin` module. We encountered this module in [Chapter 2](../basic/plugin-system.md).

You should store all the application’s components in this directory, which need to be registered as the following:

-   As a root server instance’s plugin, such as a database connection.
-   As reusable plugin components. These files are not intended to be autoloaded, but they must be registered when required by routes. An example could be an authentication plugin.

For this reason, a good approach is to edit the plugins folder’s autoload setup as follows:

```js
fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    ignorePattern: /.*.no-load\.js/,
    indexPattern: /^no$/i,
    options: Object.assign({}, opts),
});
```

With this new setup, the `ignorePattern` property lets us ignore all those files that end with the `.no-load.js` filename. This option tells us at first sight what is being loaded and what is not, improving the project’s clarity. Note that the pattern does not consider the directory name.

!!!note "Customize as per your preferences"

    If you don’t like the “no-load” pattern, you can invert the logic by setting the `ignorePattern: /^((?!load\.js).)*$/` property value, and load only those files with the `.load.js` suffix.

The `indexPattern` property instead disables a `@fastify/autoload` plugin. By default, if a directory contains an `index.js` file, it will be _the only one loaded_, skipping all other files. This could be an undesired behavior that the `indexPattern` option prevents.

Finally, the options property lets us provide a configuration object as input for the plugins that are being loaded. Let’s take the `plugins/support.js` file as an example. It exports the `module.exports = fp(async function (fastify, opts)` interface. The autoload’s `options` parameter matches with the opts argument. In this way, it is possible to provide a configuration for all the plugins. We will go deeper into this aspect in the [Loading the configuration](#loading-the-configuration) section.

#### Loading the schemas

The JSON schemas are a crucial part of a secure project and need a proper stage on the application’s structure. Creating a `schemas/` folder to store all the JSON schemas is convenient while the application develops: you will find out soon that we will work with numerous schemas.

In the folder, we will add a `loader.js` file that has one task. It must add all the JSON schemas we will need for our application:

```js
const fp = require('fastify-plugin');
module.exports = fp(function (fastify, opts, next) {
    fastify.addSchema(require('./user-input-headers.json'));
    next();
});
```

The code snippet is actually a plugin, but it may become bigger and bigger. Isolating it from the `plugins/` folder lets us avoid the chaotic, infinite scrolling when navigating the code base.

There will be many schemas to work with because it is _highly recommended to define a schema for each HTTP part_ you need to validate or serialize. All the HTTP verbs require different validation types; for example, an id field should not be submitted as input on a POST route, but it is mandatory in a PUT route to update the associated resource. Trying to fit a general JSON schema object into multiple HTTP parts may lead to unexpected validation errors.

There is automation to load the schemas into a directory. So we will need to list all the files in the current directory and run the `addSchema` method. We will see how to implement it in [Chapter 7](./restful-api.md).

To load the `loader.js` file into our project, the `@fastify/autoload` plugin may seem like killing a fly with a sledgehammer, but it is a good method to use to split our schemas even more. Register the plugin in the `app.js` file, as follows:

```js
fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'schemas'),
    indexPattern: /^loader.js$/i,
});
```

In this way, the autoload plugin will exclusively load the `loader.js` files created in the directory tree. So we will be able to make the subfolders, such as the following:

-   `schemas/headers/loaders.js`
-   `schemas/params/loader.js`
-   `schemas/body/loader.js`

Similarly, we can make more subfolders for every HTTP method, and you will find the best tree structure that fits your application. We found that splitting the schemas by HTTP parts is the best way of ordering. This division speeds up our source navigation even more. We will be able to create some utilities dedicated to each HTTP part, such as some regular expressions for the headers and complex reusable objects for the body input.

#### Loading the routes

The `routes/` folder contains the application’s endpoints. Still, all the files are loaded automatically, making it hard to split the code base into smaller pieces. At this point, a `utility.js` file will be loaded by `@fastify/autoload`. Moreover, defining an `index.js` file will prevent the loading of other files, as we saw previously in the [Loading the plugins](#loading-the-plugins) section.

The best rules we suggest applying when it comes to the `routes/` folder are the following:

-   Autoload only those files that end with `*routes.js`. Discard all the other files in the folder. The ignored files can be registered manually or used as utility code.
-   We must not use the `fastify-plugin` module in this folder. If we need it, we should stop and think about whether that code could be moved to the `plugins/` folder.
-   Turn on the **autohook** feature in `@fastify/autoload`.

To apply these rules, we need to set up the autoload plugin, as shown in the next code example:

```js
fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    indexPattern: /.*routes(\.js|\.cjs)$/i,
    ignorePattern: /.*\.js/,
    autoHooksPattern: /.*hooks(\.js|\.cjs)$/i,
    autoHooks: true,
    cascadeHooks: true,
    options: Object.assign({}, opts),
});
```

The code snippet introduces two new parameters. The `autoHooks` flag lets you register some hooks for every `routes.js` file. The `cascadeHooks` option also turns this feature on for the subdirectories.

Let’s make an example within this structure, which we will further discuss in [Chapter 8](./auth.md). Given this folder tree, the `authHooks.js` file exports the standard Fastify plugin interface, but it must only configure life cycle hooks:

```
routes/
└─┬ users/
  ├── readRoutes.js
  ├── writeRoutes.js
  ├── authHooks.js
  └─┬ games/
    └── routes.js
```

This example configures some `onRequest` hooks to check the client’s authorization. Now, would you expect `routes/games/routes.js` to be authenticated?

If your answer is yes, `cascadeHooks: true` is right for you. We think most of you naturally find that the hooks registered as `autoHooks` in the parent’s folder are added to the children.

If the answer is no, you can change the `cascadeHooks` option to `false` to avoid adding the hooks to the children folders. In this case, the hooks are only loaded for the `readRoutes.js` and `writeRoutes.js` files. You may need to duplicate the `authHooks.js` file for every folder you need the authentication for or register it as `plugins/` in the root context.

All these rules should be listed in the `README.md` file to shout out how to develop a new set of routes. This will help your team to join the project without studying all of Fastify’s plugins in detail.

Now, we have a clear structure ready to welcome your business logic endpoints. Still, before moving forward, we need to face the last aspect of the repository structure: how to manage the configuration.

### Loading the configuration

The configuration is the first step that our application must execute to start correctly. In the [Understanding configuration types](../basic/what-is-fastify.md#understanding-configuration-types) section of Chapter 1, we discussed three types of configuration that our application needs:

-   **Server options**: This is the Fastify root instance setup
-   **Application configuration**: This is the extra setting that sets how your application works
-   **Plugin configuration**: This provides all the parameters to configure the plugins

These configurations have different sources: a server option is an object, the plugins’ configurations are complex objects, and the application configuration relies on the environment. For this reason, they need to be treated differently.

#### Loading the server configuration

The server instantiation is not under our control. The `fastify-cli` plugin does it for us, so we need to customize it to set the **server options**.

We must edit the `start` and dev scripts into our `package.json`:

```
    "start": "fastify start -l info --options app.js",
    "dev": "npm run start -- --watch --pretty-logs"
```

We have modified the `dev` script to execute the `start` one in order to reduce code duplication and avoid copy-and-paste errors. The double dash (`--`) lets us forward extra arguments to the previous command. So, it is like appending parameters to the `start` script.

Adding the `--option` flag in the `start` script equals adding it to both commands without replicating it.

The `--option` flag uses the `app.js` options property. Let’s not forget to add the server options we would like to provide during the Fastify initialization and place them at the bottom of the file:

```js
module.exports.options = {
    ajv: {
        customOptions: {
            removeAdditional: 'all',
        },
    },
};
```

In doing so, we are exporting the same JSON object we were providing to the Fastify factory. Restarting the server will load these settings. A sharp developer may notice that we did not configure the `logger` options, but we can see logs in our console. This happens because our customization is merged within the `fastify-cli` arguments, and the `-l info` option sets the log level to `info`.

Centralizing all the configurations into one place is best practice, so remove the `-l` argument from the `package.json` script and add the usual `logger` configuration into the exported JSON.

For the sake of centralization, we can move `app.js` `module.exports.options` into a new dedicated `configs/server-options.js` folder. The server option does not need any async loading, and it can read the `process.env` object to access all the `.env` file values loaded at startup by `fastify-cli`.

#### Loading the application configuration

The application configuration is mandatory for every project. It tracks secrets, such as API keys, passwords, and connection URLs. In most cases, it is mixed across sources, such as filesystems, environment variables, or external **Secret Managers**, which store that information securely, providing additional control over the variables’ visibility.

We will focus on one basic loading type: the environment variable. This is the most common type, and it enables us to use Secret Managers. To go deeper into understanding external Secret Managers, we suggest you read this [exhaustive article](https://www.nearform.com/blog/uncovering-secrets-in-fastify/). It explains how to load configuration from the most famous providers, such as AWS, Google Cloud Platform, and Hashicorp Vault.

The environment configuration is tied to the system where the software is running. In our case, it could be our PC, a remote server, or a colleague’s PC. As previously mentioned, Node.js loads all the **operating system (OS)** environment variables by default into the `process.env` object. So, working on multiple projects could be inconvenient as it would change the OS configuration every time. Creating Replace with an `.env` text file in the project’s root folder is the solution to this annoying issue:

```
NODE_ENV=development
PORT=3000
MONGO_URL=mongodb://localhost:27017/test
```

This file will be read at the startup, and it will be ready to access. Note that this file will overwrite the `process.env` property if it already exists. So you have to make sure that what is in your `.env` file is the application configuration’s source of truth. You can verify the correct loading of the `app.js` file by adding a simple log:

```js
module.exports = async function (fastify, opts) {
  fastify.log.info('The .env file has been read %s',
  process.env.MONGO_URL)
```

Since the `.env` file may contain sensitive data, you should never commit it to your repository. In its place, you should commit and share a `.env.sample` file. It lists all the keys that must be set as environment variables without any secret values.

Saving sensitive data in the repository is dangerous because whoever has access to it may access upper environments such as production. In this way, the security is moved from access to an environment, such as a server, to the Git repository setting. Moreover, if an environment variable needs to be updated, you should commit it and publish a new software version to deploy the change in other environments. This is not correct: the software must not be tied to the environment variable values. Remember to track all files that must be secrets to the `.gitignore` and `.dockerignore` files.

We can improve the `.env.sample` file to make it as straightforward as possible. For this, we need the `@fastify/env` plugin, which throws an error whenever it doesn’t find an expected variable.

First of all, we need a JSON schema that describes our `.env` file. So, we can create the `schemas/dotenv.json` file:

```json
{
    "type": "object",
    "$id": "schema:dotenv",
    "required": ["MONGO_URL"],
    "properties": {
        "NODE_ENV": {
            "type": "string",
            "default": "development"
        },
        "PORT": {
            "type": "integer",
            "default": 3000
        },
        "MONGO_URL": {
            "type": "string"
        }
    }
}
```

The JSON schema environment is quite linear. It defines a property for each variable we expect. We can set a default value and coerce the type as we did for the `PORT` property in the JSON schema. Another nice takeaway is the `$id` format. It has a **Uniform Resource Name (URN)** syntax. The specification discussed in [Chapter 5](../basic/validation-serialization.md) explains how it can be a **Uniform Resource Identifier (URI)**. A URI may be a URL that identifies a location or a URN when it identifies a resource name without specifying where to get it.

Now, we must not forget to update the `schemas/loader.js` file by writing `fastify.addSchema(require('./dotenv.json'))` to load the schema.

To integrate the `@fastify/env` plugin, we are going to create our application’s first plugin, `plugins/config.js`:

```js
const fp = require('fastify-plugin');
const fastifyEnv = require('@fastify/env');
module.exports = fp(
    function (fastify, opts, next) {
        fastify.register(fastifyEnv, {
            confKey: 'secrets',
            schema: fastify.getSchema('schema:dotenv'),
        });
        next();
    },
    { name: 'application-config' }
);
```

The plugin will be loaded by the autoload feature, so we need to run the server and try it out. Starting the server without the `MONGO_URL` property will stop the startup and inform you that the key is missing. Moreover, it will add a decorator to the Fastify instance, named the `confKey` value. So the `.env` keys will be available to read the `fastify.secrets` property, decoupling the code from the global `process.env` object.

Before going further into the plugins’ configuration loading, we should pay attention to the name option we just set as input to the fp function. It will be the key to understanding the [Loading the plugins’ configurations](#loading-the-plugins-configurations) section.

#### Loading the plugins’ configurations

The plugin’s settings are dependent on the application’s configuration. It requires the application’s secrets to configure itself to work as expected, but how can we configure it?

Before proceeding, you will need a MongoDB instance up and running in your development environment. We will use this database in future chapters. You can [download the community edition](https://www.mongodb.com/try/download/community) for free or use a temporary Docker container starting it with the following command:

```sh
docker run -d -p 27017:27017 –rm –name fastify-mongo mongo:5
docker container stop fastify-mongo
```

These Docker commands start and stop a container for development purposes. The data you store will be lost after the shutdown, making it suitable for our learning process.

!!!note "Track all commands"

    It is best to store all the useful commands in the `package.json` scripts property to run the project correctly. In this way, whether you choose a Docker container or a local MongoDB installation, you will be able to run `npm run mongo:start` to get a running instance ready to use.

After the MongoDB setup, let’s integrate the `@fastify/mongodb` plugin. It provides access to a MongoDB database to use on the application’s endpoints. You need to install it by running the `npm install @fastify/mongodb` command, then create a new `plugins/mongo-data-source.js` file:

```js
const fp = require('fastify-plugin');
const fastifyMongo = require('@fastify/mongodb');
module.exports = fp(
    async function (fastify, opts) {
        fastify.register(fastifyMongo, {
            forceClose: true,
            url: fastify.secrets.MONGO_URL,
        });
    },
    {
        dependencies: ['application-config'],
    }
);
```

In the code snippet, the MongoDB configuration is contained in the plugin’s file itself, but it requires the application’s configuration to load correctly. This is enforced by the `dependencies` option. It is an `fp` function argument that lists all the plugins that have previously been loaded. As you can see, the `name` parameter we set in the previous [Loading the application configuration](#loading-the-application-configuration) section, gives us control over the plugins’ loading order.

We are creating a solid and clear project structure that will help us in our daily job:

-   It suggests to us where the code should be written
-   It enforces the use of the plugin system, improving our source code to rely on encapsulation instead of global variables and side effects
-   It enforces declaring the dependencies between plugins to avoid mistakes and control the load order

Can we take advantage of the Fastify architecture within this structure? If things go wrong, how can we handle mistakes? Let’s have a look at this next.

## Debugging your application

In a real-world application, errors may happen! So, how can we handle them within our structure? Yes, you guessed right, with a plugin!

In production, the logs files are our debugger. So, first of all, it is important to write good and secure logs. Let’s create a new `plugins/error-handler.js` plugin file:

```js
const fp = require('fastify-plugin');
module.exports = fp(function (fastify, opts, next) {
    fastify.setErrorHandler((err, req, reply) => {
        if (reply.statusCode >= 500) {
            req.log.error(
                { req, res: reply, err: err },
                err?.message
            );
            reply.send(`Fatal error. Contact the support team. Id
      ${req.id}`);
            return;
        }
        req.log.info(
            { req, res: reply, err: err },
            err?.message
        );
        reply.send(err);
    });
    next();
});
```

The code snippet is a customization of the error handler we learned about in [Chapter 3](../basic/routes.md). Its priorities are to do the following:

-   Log the error through the application’s logger
-   Hide sensible information when an unexpected error happens and provide helpful information to the caller and contact the support team effectively

These few lines of code accomplish a great deal, and they can be customized even more to adapt to your needs, such as adding message error internationalization.

After the error handling baseline we just set, we can use an IDE debugger to spot and solve issues. To do so, we need to edit the application’s `package.json` script:

```
"dev": "npm run start -- --watch –pretty-logs –debug"
```

This will start the Node.js process in debug mode. At the startup, we will read a message in the console that informs us how to attach a debugger:

```
Debugger listening on ws://127.0.0.1:9320/da49367c-fee9-42ba-b5a2-
5ce55f0b6cd8
For help, see: https://nodejs.org/en/docs/inspector
```

Using VS Code as an IDE, we can create a `.vscode/launch.json` file, as follows:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Attach to Fastify",
            "type": "node",
            "request": "attach",
            "port": 9320
        }
    ]
}
```

Pressing ++f5++ will connect our debugger to the Node.js process, and we will be ready to set breakpoints and check what is happening in our application to fix it.

Now, you have seen how fast and smooth configuring Fastify is to accomplish demanding tasks!

You have improved your control over the code base, and we will now see a new technique to manage the application’s configuration. You will master the project scaffolding setup as these skills build up.

## Sharing the application configuration across plugins

The [Loading the plugins’ configurations](#loading-the-plugins-configurations) section discussed how a plugin could access the application configuration. In this case, the plugin accesses the `fastify.secret` plain object to access the environment variables.

The configuration may evolve and become more complex. But, if you just intended to centralize the whole plugin’s settings into a dedicated plugin, how could you do that?

We can modify the `config.js` plugin and move it to the `configs/` directory. By doing this, we are not loading it automatically anymore. Then, we can integrate the `@fastify/mongodb` configuration:

```js
module.exports = fp(async function configLoader(
    fastify,
    opts
) {
    await fastify.register(fastifyEnv, {
        confKey: 'secrets',
        schema: fastify.getSchema('schema:dotenv'),
    });
    fastify.decorate('config', {
        mongo: {
            forceClose: true,
            url: fastify.secrets.MONGO_URL,
        },
    });
});
```

In the code snippet, you can see the following main changes:

-   The plugin exposes the `async` interface.
-   The `@fastify/env` plugin’s register is awaited to execute the plugin. In this way, `fastify.secrets` will be immediately accessible.
-   A new decorator has been added to the Fastify instance.
-   The plugin no longer has the name parameter. Since we are going to load it manually, a name is not necessary. In any case, it is a good practice to leave it: we want to show you that we are breaking the bridges between the `mongo-data-source.js` and `config.js` files.

These changes are breaking our setup due to the following reasons:

-   The `config.js` file is not loaded
-   The `mongo-data-source.js` file relies on `fastify.secrets`

To fix them, we need to edit `app.js`, as follows:

```js
await fastify.register(require('./configs/config'));
fastify.log.info('Config loaded %o', fastify.config);
```

These lines must be added after the autoload schemas configuration because we validate the environment variable through the `schema:dotenv` schema.

After that, we can update the plugins’ autoload options as follows:

```js
fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    dirNameRoutePrefix: false,
    ignorePattern: /.*.no-load\.js/,
    indexPattern: /^no$/I,
    options: fastify.config,
});
```

Finally, we can fix the `mongo-data-source.js` file by removing a lot of code:

```js
module.exports = fp(async function (fastify, opts) {
    fastify.register(fastifyMongo, opts.mongo);
});
```

As you can see, it has become much lighter. We have removed the dependencies parameter as well because we don’t want to access the `fastify.secret` decorator.

This change has a significant impact on the code logic. With this code restyle, the `mongo-data-source.js` file is decoupled from the rest of the application because all the settings are provided by the input `opts` argument. This object is provided by the `@fastify/autoload` plugin, mapping the `options` parameter.

You now have a comprehensive and solid knowledge of the configuration and how to best manage it. You can use the previous code example to become confident in tweaking the plugins and playing within the autoload plugin. You will find that the source code in the book’s repository adopts the first solution we saw in the [Loading the plugins’ configurations](#loading-the-plugins-configurations) section.

To complete the project scaffolding, we need to add a few more features that are key pieces to consider this basic structure solid and ready to use for our development process. We will learn about some new plugins that add these missing capabilities to our application.

## Using Fastify’s plugins

The project structure is almost complete. Fastify’s ecosystem helps us improve our scaffolding code base with a set of plugins you will want to know about. Let’s learn about them and add them to the `plugins/` folder.

### How to get a project overview

Documenting a complete list of all the application’s endpoints is a tedious task, but someone in the team still has to do it. Luckily, Fastify has a solution for this: the `@fastify/swagger` plugin.

You can integrate it by creating a new `plugins/swagger.js` file:

```js
module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@fastify/swagger'), {
    routePrefix: '/docs',
    exposeRoute: fastify.secrets.NODE_ENV !== ‹production›,
    swagger: {
      info: {
        title: 'Fastify app',
        description: 'Fastify Book examples',
        version: require('../package.json').version
      }
    }
  })
}, { dependencies: ['application-config'] })
```

The previous code will register the plugin. It will automatically create the <http://localhost:3000/docs> web pages that will list all the application’s endpoints. Note that the documentation will be published only if the environment is not in production, for security reasons. The API interfaces should be shared only with those people that consume them.

Note that **Swagger (OAS 2.0)** and the former **OpenAPI Specification (OAS 3.0)** define a standard to generate API documentation. You may find it interesting to learn more about it by visiting <https://swagger.io/specification/>.

### How to be reachable

One of the most common issues in implementing backend APIs is the **cross-origin resource sharing (CORS)** settings. You will hit this problem when a frontend tries to call your endpoints from a browser, and the request is rejected.

To solve this issue, you can install the `@fastify/cors` plugin:

```js
const fp = require('fastify-plugin');
module.exports = fp(async function (fastify, opts) {
    fastify.register(require('fastify-cors'), {
        origin: true,
    });
});
```

Note that the example code is configured to let your APIs be reachable by any client. Explore this aspect further to set this plugin correctly for your future applications.

## Summary

In this chapter, you have created a complete Fastify project scaffolding that will be the base structure for your following projects. You can now start a new Fastify application from scratch. You can also control all the configurations your code base needs, regardless of where they are stored.

We have looked at some of the most used and useful Fastify plugins to enhance the project structure and ergonomics. You now know how to use and customize them and that there are infinite combinations.

The solid and clean structure we have built so far will evolve throughout the course of the book. Before investing more time in the structure, we need to understand the application business logic. So, get ready for the next chapter, where we will discuss how to build a RESTful API.
