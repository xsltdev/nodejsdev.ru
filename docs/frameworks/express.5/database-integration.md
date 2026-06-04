---
description: Узнайте, как интегрировать различные базы данных с Express.js, включая примеры настройки для MongoDB, MySQL, PostgreSQL и других систем.
---

# Интеграция с базами данных

Подключение баз данных к Express-приложению обычно сводится к загрузке подходящего Node.js-драйвера нужной СУБД. В этом документе кратко показано, как добавить и использовать некоторые популярные Node.js-модули для работы с базами данных в Express.

!!!alert ""

    Это лишь часть доступных драйверов баз данных. Другие варианты ищите на [npm](https://www.npmjs.com/).

## Cassandra

**Модуль**: [cassandra-driver](https://github.com/datastax/nodejs-driver)

**Установка**

```bash
$ npm install cassandra-driver
```

**Пример**

```js
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({
    contactPoints: ['localhost'],
});

client.execute(
    'select key from system.local',
    (err, result) => {
        if (err) throw err;
        console.log(result.rows[0]);
    }
);
```

## Couchbase

**Модуль**: [couchnode](https://github.com/couchbase/couchnode)

**Установка**

```bash
$ npm install couchbase
```

**Пример**

```js
const couchbase = require('couchbase');
const bucket = new couchbase.Cluster(
    'http://localhost:8091'
).openBucket('bucketName');

// add a document to a bucket
bucket.insert(
    'document-key',
    { name: 'Matt', shoeSize: 13 },
    (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
    }
);

// get all documents with shoe size 13
const n1ql =
    'SELECT d.* FROM `bucketName` d WHERE shoeSize = $1';
const query = N1qlQuery.fromString(n1ql);
bucket.query(query, [13], (err, result) => {
    if (err) {
        console.log(err);
    } else {
        console.log(result);
    }
});
```

## CouchDB

**Модуль**: [nano](https://github.com/dscape/nano)

**Установка**

```bash
$ npm install nano
```

**Пример**

```js
const nano = require('nano')('http://localhost:5984');
nano.db.create('books');
const books = nano.db.use('books');

// Insert a book document in the books database
books.insert(
    { name: 'The Art of war' },
    null,
    (err, body) => {
        if (err) {
            console.log(err);
        } else {
            console.log(body);
        }
    }
);

// Get a list of all books
books.list((err, body) => {
    if (err) {
        console.log(err);
    } else {
        console.log(body.rows);
    }
});
```

## LevelDB

**Модуль**: [levelup](https://github.com/rvagg/node-levelup)

**Установка**

```bash
$ npm install level levelup leveldown
```

**Пример**

```js
const levelup = require('levelup');
const db = levelup('./mydb');

db.put('name', 'LevelUP', (err) => {
    if (err) return console.log('Ooops!', err);

    db.get('name', (err, value) => {
        if (err) return console.log('Ooops!', err);

        console.log(`name=${value}`);
    });
});
```

## MySQL

**Модуль**: [mysql](https://github.com/felixge/node-mysql/)

**Установка**

```bash
$ npm install mysql
```

**Пример**

```js
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'dbuser',
    password: 's3kreee7',
    database: 'my_db',
});

connection.connect();

connection.query(
    'SELECT 1 + 1 AS solution',
    (err, rows, fields) => {
        if (err) throw err;

        console.log('The solution is: ', rows[0].solution);
    }
);

connection.end();
```

## MongoDB

**Модуль**: [mongodb](https://github.com/mongodb/node-mongodb-native)

**Установка**

```bash
$ npm install mongodb
```

**Пример (v2)**

```js
const MongoClient = require('mongodb').MongoClient;

MongoClient.connect(
    'mongodb://localhost:27017/animals',
    (err, db) => {
        if (err) throw err;

        db.collection('mammals')
            .find()
            .toArray((err, result) => {
                if (err) throw err;

                console.log(result);
            });
    }
);
```

**Пример (v3)**

```js
const MongoClient = require('mongodb').MongoClient;

MongoClient.connect(
    'mongodb://localhost:27017/animals',
    (err, client) => {
        if (err) throw err;

        const db = client.db('animals');

        db.collection('mammals')
            .find()
            .toArray((err, result) => {
                if (err) throw err;

                console.log(result);
            });
    }
);
```

Если вам нужен объектный драйвер-модель для MongoDB, обратите внимание на [Mongoose](https://github.com/LearnBoost/mongoose).

## Neo4j

**Модуль**: [neo4j-driver](https://github.com/neo4j/neo4j-javascript-driver)

**Установка**

```bash
$ npm install neo4j-driver
```

**Пример**

```js
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(
    'neo4j://localhost:7687',
    neo4j.auth.basic('neo4j', 'letmein')
);

const session = driver.session();

session.readTransaction((tx) => {
    return tx
        .run('MATCH (n) RETURN count(n) AS count')
        .then((res) => {
            console.log(res.records[0].get('count'));
        })
        .catch((error) => {
            console.log(error);
        });
});
```

## Oracle

**Модуль**: [oracledb](https://github.com/oracle/node-oracledb)

**Установка**

ПРИМЕЧАНИЕ: [See installation prerequisites](https://github.com/oracle/node-oracledb#-installation).

```bash
$ npm install oracledb
```

**Пример**

```js
const oracledb = require('oracledb');
const config = {
    user: '<your db user>',
    password: '<your db password>',
    connectString: 'localhost:1521/orcl',
};

async function getEmployee(empId) {
    let conn;

    try {
        conn = await oracledb.getConnection(config);

        const result = await conn.execute(
            'select * from employees where employee_id = :id',
            [empId]
        );

        console.log(result.rows[0]);
    } catch (err) {
        console.log('Ouch!', err);
    } finally {
        if (conn) {
            // conn assignment worked, need to close
            await conn.close();
        }
    }
}

getEmployee(101);
```

## PostgreSQL

**Модуль**: [pg-promise](https://github.com/vitaly-t/pg-promise)

**Установка**

```bash
$ npm install pg-promise
```

**Пример**

```js
const pgp = require('pg-promise')(/* options */);
const db = pgp(
    'postgres://username:password@host:port/database'
);

db.one('SELECT $1 AS value', 123)
    .then((data) => {
        console.log('DATA:', data.value);
    })
    .catch((error) => {
        console.log('ERROR:', error);
    });
```

## Redis

**Модуль**: [redis](https://github.com/mranney/node_redis)

**Установка**

```bash
$ npm install redis
```

**Пример**

```js
const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => {
    console.log(`Error ${err}`);
});

client.set('string key', 'string val', redis.print);
client.hset(
    'hash key',
    'hashtest 1',
    'some value',
    redis.print
);
client.hset(
    ['hash key', 'hashtest 2', 'some other value'],
    redis.print
);

client.hkeys('hash key', (err, replies) => {
    console.log(`${replies.length} replies:`);

    replies.forEach((reply, i) => {
        console.log(`    ${i}: ${reply}`);
    });

    client.quit();
});
```

## SQL Server

**Модуль**: [tedious](https://github.com/tediousjs/tedious)

**Установка**

```bash
$ npm install tedious
```

**Пример**

```js
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;

const config = {
    server: 'localhost',
    authentication: {
        type: 'default',
        options: {
            userName: 'your_username', // update me
            password: 'your_password', // update me
        },
    },
};

const connection = new Connection(config);

connection.on('connect', (err) => {
    if (err) {
        console.log(err);
    } else {
        executeStatement();
    }
});

function executeStatement() {
    request = new Request(
        "select 123, 'hello world'",
        (err, rowCount) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`${rowCount} rows`);
            }
            connection.close();
        }
    );

    request.on('row', (columns) => {
        columns.forEach((column) => {
            if (column.value === null) {
                console.log('NULL');
            } else {
                console.log(column.value);
            }
        });
    });

    connection.execSql(request);
}
```

## SQLite

**Модуль**: [sqlite3](https://github.com/mapbox/node-sqlite3)

**Установка**

```bash
$ npm install sqlite3
```

**Пример**

```js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('CREATE TABLE lorem (info TEXT)');
    const stmt = db.prepare('INSERT INTO lorem VALUES (?)');

    for (let i = 0; i < 10; i++) {
        stmt.run(`Ipsum ${i}`);
    }

    stmt.finalize();

    db.each(
        'SELECT rowid AS id, info FROM lorem',
        (err, row) => {
            console.log(`${row.id}: ${row.info}`);
        }
    );
});

db.close();
```

## Elasticsearch

**Модуль**: [elasticsearch](https://github.com/elastic/elasticsearch-js)

**Установка**

```bash
$ npm install elasticsearch
```

**Пример**

```js
const elasticsearch = require('elasticsearch');
const client = elasticsearch.Client({
    host: 'localhost:9200',
});

client
    .search({
        index: 'books',
        type: 'book',
        body: {
            query: {
                multi_match: {
                    query: 'express js',
                    fields: ['title', 'description'],
                },
            },
        },
    })
    .then(
        (response) => {
            const hits = response.hits.hits;
        },
        (error) => {
            console.trace(error.message);
        }
    );
```
