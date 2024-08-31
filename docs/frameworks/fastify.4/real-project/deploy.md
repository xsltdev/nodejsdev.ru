# Deployment and Process Monitoring for a Healthy Application

We are building a new and shiny Fastify API and want to expose it on the internet to gather feedback before our official launch. When we look online, there are plenty of options... but what should we use? After that, we will then need to figure out how to monitor the health of our server (because we always monitor our applications, right?).

In this chapter, we will unpack the basics of a monolith deployment, using Docker, MongoDB, and Fly.io. We will also review the key Node.js metrics, how to extract them from our application with Prometheus, and then how to easily consult them on Grafana.

This is the learning path we will cover in this chapter:

-   Testing our Docker image for deployment
-   Hosting our DB on MongoDB Atlas
-   Choosing a cloud provider
-   Deploying to Fly.io
-   Setting up continuous deployment
-   Collecting application process data

## Technical requirements

As mentioned in the previous chapters, you will need the following:

-   A working Node.js 18 installation
-   A text editor to try the example code
-   Docker
-   An HTTP client to test out code, such as cURL or Postman
-   A GitHub account

All the snippets in this chapter are on [GitHub](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%2010).

## Testing our Docker image with a local deployment

In [Chapter 6](./project-structure.md), we set up our application for usage with Docker. This is a critical step for our TODO List application. Now, it’s time to test the image with Docker Compose to verify that everything is working as expected.

Let’s recap our `DockerFile`, with a minor modification:

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
CMD ["./node_modules/.bin/fastify", "start", "-a", "0.0.0.0", "-l",
"info", "--options", "app.js"]
```

As you can see, we have modified `CMD` to directly call the `fastify` command with the following options:

-   `-a 0.0.0.0` is fundamental to allowing the container to listen to all addresses
-   `--options` makes sure we load the options from `app.js`
-   `-l info` configures the logging level

Now, we can test this deployment using a local `docker-compose`, which is useful to verify that everything works well locally, as it is easier to debug than in the cloud. Specifically, we are going to connect our application to a MongoDB instance running within Docker as well.

Let’s save the following as `docker-compose-test.yml`:

```yml
version: '3.7'
services:
    mongo:
        image: mongo:5
        volumes:
            - data:/data/db
    app:
        build:
            context: ./
            dockerfile: Dockerfile
        ports:
            - '3042:3000'
        environment:
            JWT_SECRET: changethis
            MONGO_URL: mongodb://mongo:27017/todo
volumes:
    data:
```

Let’s go line by line through the content of this file. First, we identify the version of the `docker-compose` file as different versions have different syntaxes. Second, we define two services: one is `mongo`, our database, and the other is `app`, which we build from the current folder. Note that in the `app` definition, we specify the environment variables our application needs:

-   `JWT_SECRET`, which should be changed to secure your application.
-   `MONGO_URL`, which identifies how we connect to our database. Note that we use `mongo` as a domain name – Docker will automatically resolve it to the host running our MongoDB!

Lastly, it’s important to cover the concept of ports in Docker. In the `docker-compose-test.yml` file, we specify `"3042:3000"`: we map the TCP port `3042` of the host to port `3000` of the container. Therefore, we can now head to <http://localhost:3042/> to see our application running.

In this setup, persist the database in a data volume to avoid losing our data when the container is removed (such as when we update it).

Thanks to `docker-compose`, we can verify and test that our DockerFile works as expected. So, run the following:

```sh
docker-compose -f docker-compose-test.yml up
```

Docker will download the base images, build our image, and then execute our application (if you do not have `package-lock.json` in your folder, run npm i to generate it, otherwise, `docker build` will give an error). We can now `curl http://localhost:3042/` to verify that everything is working as expected.

!!!note "MongoDB cluster"

    The MongoDB [documentation](https://www.mongodb.com/basics/clusters/mongodb-cluster-setup) recommends using at least three MongoDB nodes because, in production, we want to have at least two replicas of the data to tolerate the failure of one node. In our “local” deployment, we are just using one – it’s unsafe, but it’s okay for our purpose.

Now, we want to move our setup to the cloud. To do that, first, we are going to use MongoDB Atlas to create a three-node MongoDB cluster.

## Hosting our DB on MongoDB Atlas

As we write this, the simplest way to provision a MongoDB cluster is to use MongoDB Atlas, which will allow 512 MB of storage for free. To employ this, please follow the MongoDB Atlas setup tutorial – while we include the screenshot for this process here, the process might vary.

The first step is to sign up to [MongoDB Atlas](http://mongodb.com). After you have completed the signup and email verification process, you can select the tier in which you want your new database to be created. We will select the **Shared** option, which is the free tier. After we have selected our tier, we now choose where we want our MongoDB instance to be located. Choose a location that’s near to you!

Now, it’s time to add the security mechanism for our database. Make sure you are in the **Quickstart** tab below **SECURITY**, as shown in _Figure 10.1_. For this book, select the **Username and Password** authentication method.

![Figure 10.1: How our database in MongoDB Atlas is configured](deploy-1.png)

<center>Figure 10.1: How our database in MongoDB Atlas is configured</center>

The most important configuration for this book is to enable connections from all IP addresses. This can be done in the **IP Address** field in the previous figure; enter `0.0.0.0/0`, which will identify all IP addresses. While this is highly insecure, a strong password is more than enough for simple applications.

!!!note "Other connection methods"

    Please refer to the MongoDB Atlas documentation for configuring more [secure connection methods](https://www.mongodb.com/docs/atlas/security/config-db-auth/).

You’ll now need to copy a connection string to your MongoDB database. This must be under an option similar to **Connect to your database** (we say “similar to” as we cannot say the exact option because it would probably become out of date at the time of reading).

Now, we can run the connection string in our terminal:

```sh
$ mongosh
"mongodb+srv://fastifytodolist.ypq0399.mongodb.net/myFirst
Database" --apiVersion 1 --username fastify
Enter password: ****************
Current Mongosh Log ID: XXXXXXXXXXX
Connecting
to:          mongodb+srv://<credentials>@fastifytodolist
.ypq0399.mongodb.net/myFirstDatabase?appName=mongosh+1.5.1
Using MongoDB:          5.0.9 (API Version 1)
Using Mongosh:          1.5.1
For mongosh info see: https://docs.mongodb.com/mongodb-shell/
To help improve our products, anonymous usage data is collected and
sent to MongoDB periodically (https://www.mongodb.com/legal/privacy-
policy).
You can opt-out by running the disableTelemetry() command.
Atlas atlas-lk17c9-shard-0 [primary] myFirstDatabase>
```

Everything worked as expected! We can now try to connect our application from our development machine to our new database in the cloud with the following:

```
MONGO_URL="mongodb+srv://USERNAME:PASSWORD@YOURDBDOMAIN/
myFirstDatabase" JWT_SECRET=supsersecret npm start
```

Alternatively, you can add the following and replace the value for `MONGO_URL` in `.env` file:

```
MONGO_URL="mongodb+srv://USERNAME:PASSWORD@YOURDBDOMAIN/
myFirstDatabase"
JWT_SECRET=supsersecret
```

Then in terminal, run `npm start`.

As we now have a cloud database, we can look to deploy our application to the cloud!

## Choosing a cloud provider

Most people who start using a new technology wonder what cloud provider would provide the best experience to deploy their applications. In this book, we are not considering any solution that would be too much effort given the little space available.

Here is a list of providers that are worthwhile checking out:

-   Heroku – it started supporting Node.js in 2011 and it’s by far one of the most mature and stable products.
-   Google Cloud Run – it’s based on [Knative](https://knative.dev/) and the Kubernetes stack.
-   AWS Lambda – it’s the original “serverless” runtime, enabling the executions of “functions” that can scale elastically. Every function only processes one request at a time: while this makes it easy to scale and operate, I/O heavy applications are at a disadvantage. AWS Lambda is based on [Firecracker](https://firecracker-microvm.github.io/).
-   Vercel – it’s the deployment platform for frontend teams, based upon AWS Lambda.
-   Fly.io – it’s based on Firecracker, and as such, it allows for an extremely fast restart of processes and the ability to “scale to zero.”

You can find a list of other [serverless deployments](https://www.fastify.io/docs/latest/Guides/Serverless/).

Node.js and Fastify shine when used to serve multiple, parallel requests. This maximizes the idle moment in the event loop to process other requests. Therefore, the best choice is to use “full” servers that can be dynamically scaled based on the load.

!!!note "Deploying on AWS Lambda"

    If you would like to deploy to AWS Lambda, it’s [possible to use](https://github.com/fastify/aws-lambda-fastify). The advantage to native Lambda development is that you could develop your application as you normally would if it was deployed in a standard Node.js process.

For this book, we are going to cover Fly.io because it looks like the most innovative solution and provides easy automation for continuous deployment.

## Deploying to Fly.io

Fly.io’s main interface is a command-line tool called `flyctl`, which we can install with the following:

-   `iwr https://fly.io/install.ps1 -useb | iex` on Windows PowerShell
-   `curl -L https://fly.io/install.sh | sh` on Linux and macOS
-   You can also use `brew install flyctl` on macOS too

Signing up with Fly.io is easy: issue the `flyctl auth signup` command. We recommend connecting your GitHub account, as you will need it later.

We can now deploy to Fly.io by executing `flyctl launch` in our current working directory (make sure there are no `fly.toml` files) and answering the following questions:

```sh
$ flyctl launch
Creating app in /path/to/Chapter 10
Scanning source code
Detected a Dockerfile app
? App Name (leave blank to use an auto-generated name):
? Select organization: Matteo Collina (personal)
? Select region: fra (Frankfurt, Germany)
Created app shy-fog-346 in organization personal
Wrote config file fly.toml
? Would you like to setup a Postgresql database now? No
? Would you like to deploy now? Yes
Deploying shy-fog-346
...
```

The first questions that `flyctl` asks are about our application: what account to use, where to start it, and whether we want a PostgreSQL database. Then, it builds our container and deploys our application to Fly.io.

Then, the script goes ahead and tries to deploy our application until it fails:

```sh
...
Preparing to run: `dumb-init ./node_modules/.bin/fastify start -l info
--options app.js` as node
2022/07/28 12:54:40 listening on [fdaa:0:582d:a7b:c07e:2d5f:9db0:2]:22
(DNS: [fdaa::3]:53)
Error: env must have required property 'MONGO_URL', env must have
required property 'JWT_SECRET'
    at loadAndValidateEnvironment (/home/app/node/node_modules/@
fastify/env/node_modules/env-schema/index.js:93:19)
    at loadAndValidateEnvironment (/home/app/node/node_modules/@
fastify/env/index.js:8:20)
    at Plugin.exec (/home/app/node/node_modules/avvio/plugin.
js:131:19)
    at Boot.loadPlugin (/home/app/node/node_modules/avvio/plugin.
js:273:10)
    at process.processTicksAndRejections (node:internal/process/task_
queues:82:21) {
  errors: [
    {
      instancePath: '',
      schemaPath: '#/required',
      keyword: 'required',
      params: [Object],
      message: "must have required property 'MONGO_URL'"
    },
    {
      instancePath: '',
      schemaPath: '#/required',
      keyword: 'required',
      params: [Object],
      message: "must have required property 'JWT_SECRET'"
    }
  ]
}2022-07-28T12:54:42.000 [info] Main child exited normally with code:
1
2022-07-28T12:54:42.000 [info] Starting clean up.
***v2 failed - Failed due to unhealthy allocations - no
   stable job version to auto revert to and deploying as v3
Troubleshooting guide at https://fly.io/docs/getting-started/
troubleshooting/
Error abort
```

As you can see in the error message, the server cannot find the `JWT_SECRET` and `MONGO_URL` environment variables. Let’s add them as Fly.io secrets:

```sh
$ flyctl secrets set MONGO_URL="mongodb+srv://
YOURUSERNAME:YOURPASSWORD@YOURDATABASE.mongodb.net/myFirstDatabase"
...
$ fly secrets set JWT_SECRET="ALONGRANDOMSTRING"
Release v4 created
==> Monitoring deployment
...
./node_modules/.bin/fastify start -l info --options app.js` as node
[info]2022/07/28 13:19:02 listening on [fdaa:0:582d:a7b:66:b7
3e:6147:2]:22 (DNS: [fdaa::3]:53)
[info]
{"level":30,"time":1659014344254,"pid":517,"hostname":"b73e6147",
"msg":"Server listening at http://[::1]:3000"}
[info]
{"level":30,"time":1659014344262,"pid":517,"hostname":"b73e6147",
"msg":"Server listening at http://127.0.0.1:3000"}
--> v4 failed - Failed due to unhealthy allocations - no stable job
version to auto revert to and deploying as v5
--> Troubleshooting guide at https://fly.io/docs/getting-started/
troubleshooting/
```

Oh no! It’s still failing. What happened? Let’s open the `fly.toml` file (the Fly.io configuration file): there is an `internal_port = 8080` line that instructs Fly.io to route any incoming requests to port `8080` of our container. However, our application is being launched at port `3000`! Let’s change the line to `internal_port = 3000` and issue `flyctl launch`.

Hurray! Our application is now deployed at <https://shy-fog-346.fly.dev/> (replace with your own URL).

In this section, we configured Fly.io and set two application secrets on Fly.io.

## Setting up continuous deployment

We are setting up a continuous deployment system so that every commit pushed to the main branch of your GitHub repository is automatically deployed to Fly.io.

!!!note "Automating your project with GitHub Actions"

    We recommend automating your development process with the use of [GitHub Actions](https://docs.github.com/ru/actions). They can be used to automatically run your automated tests, deploy your project, and even synchronize your issues with your other management software.

First, let’s create a repository on GitHub, clone it locally, and push our code there! To upload our code to GitHub, we run `git clone`, `git add`, `git commit`, and `git push` in our terminal.

!!!note "Using Git and GitHub"

    If you are not familiar with Git and GitHub, we recommend you to follow the [GitImmersion tutorial](https://gitimmersion.com/), as well as <https://docs.github.com/en/get-started/quickstart/create-a-repo>, to create the repository on GitHub, clone it, and push our application.

To deploy to Fly.io automatically, we must install and configure the `flyctl` client. We will need to authenticate our GitHub Action to Fly.io and to do this, we need a Fly.io authorization token. This can be generated by running `fly auth token` in our terminal.

After that, copy that value and open our GitHub repository. Inside **Settings | Secrets | Actions**, open **New Repository Secret**. Then, set `FLY_API_TOKEN` as the name and our token as the value, and click on **Add secret**.

![Figure 10.2: Adding the FLY_API_TOKEN as a GitHub Action secret](deploy-2.png)

<center>Figure 10.2: Adding the FLY_API_TOKEN as a GitHub Action secret</center>

After configuring our secret, it’s time to use GitHub Actions to automatically deploy our application. To do so, inside our working directory, create a `.github/workflows/fly.yml` file with the following content:

```yml
name: Fly Deploy
on:
    push:
        branches:
            - main
env:
    FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
jobs:
    deploy:
        name: Deploy app
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: superfly/flyctl-actions/setup-flyctl@master
            - run: flyctl deploy –remote-only
```

This GitHub Action uses the `setup-flyctl` action to configure the Fly.io client and then uses `flyctl` to deploy our code. To perform the deployment, it needs `FLY_API_TOKEN` as an environment variable, which we set in the `env` section of the action definition (taking the value from the secret we have previously configured in the repository settings).

We then add this file to the Git repository, commit it, and push it. As a result, the action should run and deploy our application:

![Figure 10.3: A successful deployment to Fly.io using a GitHub Action](deploy-3.png)

<center>Figure 10.3: A successful deployment to Fly.io using a GitHub Action</center>

Next, we want to configure the monitoring of our deployed application to keep it in check!

## Collecting application process data

!!!note "Excerpt from the talk “My Node.js process is on fire”"

    _“At 10am on Black Friday, your phone rings: the new JS application you deployed came under too much load, and the site has gone down! Your employer is losing sales opportunities... your employer is losing money! But you don’t lose your cool. You log in to your cloud provider and tweak your autoscaling settings. Now the deployment can handle the load spike but with four times the number of servers, which is four times the cost. The next day, you try to analyze what happened and begin to optimize your application to prepare for future load spikes.”_

    The [full talk](https://www.youtube.com/watch?v=G9Vkpe55Gu8) was delivered by Matteo Collina at JSConf Asia 2018.

The main reason we want to collect metrics of our running Node.js process is to be able to diagnose and debug problems hours, days, or even weeks after they happened. The flow of diagnosing a production issue is described in the following figure:

![Figure 10.4: The path to solving a production issue](deploy-4.png)

<center>Figure 10.4: The path to solving a production issue</center>

We need to collect data to know what happened, so we can reproduce the problem in a non-live environment – otherwise, we will not be able to understand whether we fixed the problem! After that, we use more fine-grained tools to reproduce locally and develop a fix. What tools are we going to use? We will cover them in [Chapter 13](../advanced/performance.md).

### Collecting the application process data with Prometheus

Prometheus is the go-to open source solution for collecting and storing time series data, and it’s usually used to implement monitoring systems in applications. It’s great to have statistics on how your system is performing, even under failure conditions. Prometheus also has an alert manager component that we can use to receive updates in case of outages.

Prometheus architecture is divided into different components: at its core, there is the Prometheus server, which pulls metrics from each target at precise intervals (multiple times per minute). For short- lived jobs, there is the Pushgateway, which allows Prometheus to retrieve those metrics. Visualization clients – such as Grafana – query Prometheus using PromQL.

![Figure 10.5: Prometheus architecture](deploy-5.png)

<center>Figure 10.5: Prometheus architecture</center>

This book is not about Prometheus and all its features; however, we will cover how to configure our Fastify application to provide data to be scraped by Prometheus. We will also cover Fly.io native support for Prometheus and native data collection capabilities.

!!!note "Prometheus"

    Please refer to the Prometheus documentation for more information about [Prometheus](https://prometheus.io/docs/introduction/overview/).

The main Node.js library that produces the metrics in the right format to be pulled by Prometheus is [`prom-client`](https://www.npmjs.com/package/prom-client). [`fastify- metrics`](https://www.npmjs.com/package/fastify-metrics) uses it and integrates it with Fastify.

Prometheus and Fly.io recommend that we expose the metrics on a different TCP port than our main service port, which is usually `9001`. Therefore, we want to collect the metrics for our main process and spin up a separate Fastify server to serve those metrics to the scraper. Therefore, we create a `plugins/metrics.js` file with the following content:

```js
'use strict';
const fp = require('fastify-plugin');
const Fastify = require('fastify');
module.exports = fp(
    async function (app) {
        app.register(require('fastify-metrics'), {
            defaultMetrics: { enabled: true },
            endpoint: null,
            name: 'metrics',
            routeMetrics: { enabled: true },
        });
        const promServer = Fastify({ logger: app.log });
        promServer.route({
            url: '/metrics',
            method: 'GET',
            logLevel: 'info',
            handler: (_, reply) => {
                reply.type('text/plain');
                return app.metrics.client.register.metrics();
            },
        });
        app.addHook('onClose', async (instance) => {
            await promServer.close();
        });
        await promServer.listen({
            port: 9001,
            host: '0.0.0.0',
        });
    },
    { name: 'prom' }
);
```

Then, we need to configure Fly.io to pull our custom metrics into its monitoring solution. Thus, we add the following to `fly.toml`:

```toml
[metrics]
  port = 9001
  path = "/metrics"
```

Next, we run our usual trio of commands in our terminal: `git add .`, `git commit`, and `git push`. After the GitHub Action deploys our code, we can then test this by using the following:

```sh
$ curl https://api.fly.io/prometheus/personal/api/v1/query_
range\?step\=30 \
    --data-urlencode 'query=sum(rate(nodejs_active_handles{app="shy-
fog-346"}[5m])) by (status)' \
    -H "Authorization: Bearer YOURFLYTOKEN"
{"status":"success","isPartial":false,"data":{"resultType":
"matrix","result":[{"metric":{},"values":[[1659088433,"0"],
[1659088463,"0"],[1659088493,"0"],[1659088523,"0"],[1659088553,"0"],
[1659088583,"0"],[1659088613,"0"],[1659088643,"0"],[1659088673,"0"],
[1659088703,"0"],[1659088733,"0"]]}]}}
```

The `curl` command verifies that Fly.io is now monitoring our application – specifically, it checks the number of active handles (sockets, etc.) in Node.js. The command uses a bearer token authorization scheme (i.e., the `Authorization` header), so we will need to use the Fly.io authorization token we generated before. In case you did not copy the authorization token, you can retrieve it with `fly auth token`. When running this code, you should remember to also update the app name with yours.

Grafana will use this endpoint to fetch the data for its visualizations.

### Exploring the metrics with Grafana

In this book, we will use Grafana Cloud, the hosted version of the Grafana open source project. To get started, head to <https://grafana.com/> and sign up for a new, free account. You will eventually land on the following screen:

![Figure 10.6: Grafana Cloud first screen](deploy-6.png)

<center>Figure 10.6: Grafana Cloud first screen</center>

Click on **Connect data** (or in the menu, click on **Connections**), and then search for `Prometheus`:

![Figure 10.7: Grafana Cloud integrations and connections](deploy-7.png)

<center>Figure 10.7: Grafana Cloud integrations and connections</center>

Next, click on **Prometheus data source**, then **Create a Prometheus data source**:

![Figure 10.8: Creating a Prometheus integration in Grafana Cloud](deploy-8.png)

<center>Figure 10.8: Creating a Prometheus integration in Grafana Cloud</center>

Now, we can configure our Prometheus data source. We follow a similar approach to the `curl` command in the previous section: we must authorize Grafana to fetch data from Fly.io. To do so, we set the `Authorization` header with the `Bearer TOKEN` value, where `TOKEN` is the output of `fly auth token`. The next figure shows the final configuration.

![Figure 10.9: The settings of the Prometheus integration in Grafana Cloud](deploy-9.png)

<center>Figure 10.9: The settings of the Prometheus integration in Grafana Cloud</center>

!!!note "Grafana and Fly.io"

    You can find more information about [how Fly.io can integrate with Grafana](https://fly.io/docs/reference/metrics/#grafana).

Now, click **Save & test**, then **Explore**. In the next screen, select `fly_instance_memory_mem_total` as a metric, apply `app = shy-fog-346` as a label (use your own app name), and click on **Run query**. The final setup will look like this:

![Figure 10.10: Exploring the metrics provided by Fly.io in Grafana Cloud](deploy-10.png)

<center>Figure 10.10: Exploring the metrics provided by Fly.io in Grafana Cloud</center>

Here, we can see Fly.io monitoring the memory of our application.

The `fastify-metrics` module provides a few interesting metrics regarding Fastify:

-   `http_request_duration_seconds_count` – the total number of HTTP requests in the interval
-   `http_request_summary_seconds` – the request duration divided by percentiles

`Prom-client` provides metrics regarding the Node.js instance. You can refer to <https://github.com/siimon/prom-client/tree/721829cc593bb7da28ae009985caeeacb4b59e05/lib/metrics> for the full list of available metrics, but I recommend you to plot the following:

-   `nodejs_event_loop_lag_p99_seconds` – to monitor whether we are saturating our event loop and need to further optimize our application
-   `nodejs_heap_space_used_bytes` – to monitor how much memory our application uses and spot memory issues early

As a different example, we can plot the maximum latency across all routes for each instance of our application:

![Figure 10.11: Plotting the latency of our server at various quantiles in Grafana Cloud](deploy-11.png)

<center>Figure 10.11: Plotting the latency of our server at various quantiles in Grafana Cloud</center>

The preceding diagram shows the latency of all routes of our server at different quantiles. We are interested in the 0.95 or 0.99 quantiles because they consider most requests while excluding the outliers. This is useful to understand how our application is performing for most users.

!!!note "Quantiles or percentiles"

    _“In statistics and probability, quantiles are cut points dividing the range of a probability distribution into continuous intervals with equal probabilities, or dividing the observations in a sample in the same way. There is one fewer quantile than the number of groups created. Common quantiles have special names, such as quartiles (four groups), deciles (ten groups), and percentiles (100 groups). The groups created are termed halves, thirds, quarters, etc., though sometimes the terms for the quantile are used for the groups created, rather than for the cut points.”_ – <https:// en.wikipedia.org/wiki/Quantile>

We have learned how to integrate Fly.io with Grafana Cloud, and now we have a powerful monitoring site that we can configure to our liking. As an exercise, we recommend exploring all the metrics available in Grafana and creating a full dashboard!

!!!note "Grafana"

    To learn more about Grafana, check out Learn Grafana 7.0, by Eric Salituro.

## Summary

In this chapter, we have deployed our Fastify application to Fly.io with the database hosted in MongoDB Atlas. Then, we added monitoring with the Prometheus instance hosted by Fly.io. Finally, we connected Prometheus with Grafana Cloud.

In the next chapter, we will cover how to set up logging in our Fastify application to produce readable, inspectable, and useful logs.
