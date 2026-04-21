---
title: SQLite
description: Модуль node:sqlite — синхронный API для SQLite, DatabaseSync, подготовленные выражения и пользовательские функции
---

# SQLite

!!!warning "Стабильность: 1 – Экспериментальная"

    `1.2` — кандидат в релиз. Ожидается, что возможность почти готова стать стабильной. Дополнительные ломающие изменения не предполагаются, но всё ещё возможны в ответ на отзывы пользователей или развитие базовой спецификации.

Модуль `node:sqlite` упрощает работу с базами SQLite. Подключение:

=== "MJS"

    ```js
    import sqlite from 'node:sqlite';
    ```

=== "CJS"

    ```js
    const sqlite = require('node:sqlite');
    ```

Модуль доступен только в схеме `node:`.

Ниже — базовый пример: открыть базу в памяти, записать данные и прочитать их обратно.

=== "MJS"

    ```js
    import { DatabaseSync } from 'node:sqlite';
    const database = new DatabaseSync(':memory:');

    // Выполнить SQL из строк
    database.exec(`
      CREATE TABLE data(
        key INTEGER PRIMARY KEY,
        value TEXT
      ) STRICT
    `);
    // Подготовить выражение для вставки
    const insert = database.prepare('INSERT INTO data (key, value) VALUES (?, ?)');
    // Выполнить с привязанными значениями
    insert.run(1, 'hello');
    insert.run(2, 'world');
    // Подготовить выражение для чтения
    const query = database.prepare('SELECT * FROM data ORDER BY key');
    // Выполнить и вывести результат
    console.log(query.all());
    // Prints: [ { key: 1, value: 'hello' }, { key: 2, value: 'world' } ]
    ```

=== "CJS"

    ```js
    'use strict';
    const { DatabaseSync } = require('node:sqlite');
    const database = new DatabaseSync(':memory:');

    // Выполнить SQL из строк
    database.exec(`
      CREATE TABLE data(
        key INTEGER PRIMARY KEY,
        value TEXT
      ) STRICT
    `);
    // Подготовить выражение для вставки
    const insert = database.prepare('INSERT INTO data (key, value) VALUES (?, ?)');
    // Выполнить с привязанными значениями
    insert.run(1, 'hello');
    insert.run(2, 'world');
    // Подготовить выражение для чтения
    const query = database.prepare('SELECT * FROM data ORDER BY key');
    // Выполнить и вывести результат
    console.log(query.all());
    // Prints: [ { key: 1, value: 'hello' }, { key: 2, value: 'world' } ]
    ```

## Преобразование типов между JavaScript и SQLite {#type-conversion-between-javascript-and-sqlite}

При записи и чтении SQLite нужно преобразовывать типы JavaScript и [типы данных SQLite](https://www.sqlite.org/datatype3.html). В JavaScript типов больше, поэтому поддерживается лишь подмножество. Запись неподдерживаемого типа приведёт к исключению.

| Класс хранения | JavaScript → SQLite | SQLite → JavaScript |
| --- | --- | --- |
| `NULL` | {null} | {null} |
| `INTEGER` | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) или [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) или [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) _(настраивается)_ |
| `REAL` | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) |
| `TEXT` | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) |
| `BLOB` | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) или [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) |

API, читающие значения из SQLite, имеют опции, определяющие, преобразуются ли `INTEGER` в `number` или `bigint` в JavaScript — например `readBigInts` у выражений и `useBigIntArguments` у пользовательских функций. Если Node.js читает `INTEGER` вне диапазона [безопасного целого](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger) JavaScript и чтение BigInt не включено, выбрасывается `ERR_OUT_OF_RANGE`.

## Класс: `DatabaseSync`

Этот класс представляет одно [соединение](https://www.sqlite.org/c3ref/sqlite3.html) с базой SQLite. Все API этого класса выполняются синхронно.

### `new DatabaseSync(path[, options])`

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) Путь к базе. База SQLite может храниться в файле или полностью [в памяти](https://www.sqlite.org/inmemorydb.html). Для файловой базы укажите путь к файлу. Для in-memory используйте специальное имя `':memory:'`.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры подключения. Поддерживаются:
    -   `open` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` база открывается в конструкторе. Если `false`, открытие через метод `open()`. **По умолчанию:** `true`.
    -   `readOnly` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` база только для чтения. Если файла нет, открытие завершится ошибкой. **По умолчанию:** `false`.
    -   `enableForeignKeyConstraints` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` включены внешние ключи. Рекомендуется; можно отключить для совместимости со старыми схемами. Ограничения можно включать и выключать после открытия через [`PRAGMA foreign_keys`](https://www.sqlite.org/pragma.html#pragma_foreign_keys). **По умолчанию:** `true`.
    -   `enableDoubleQuotedStringLiterals` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` SQLite принимает [строковые литералы в двойных кавычках](https://www.sqlite.org/quirks.html#dblquote). Не рекомендуется; можно включить для совместимости со старыми схемами. **По умолчанию:** `false`.
    -   `allowExtension` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` доступны SQL-функция `loadExtension` и метод `loadExtension()`. Позже можно вызвать `enableLoadExtension(false)`. **По умолчанию:** `false`.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) [Тайм-аут занятости](https://sqlite.org/c3ref/busy_timeout.html) в миллисекундах — максимальное время ожидания снятия блокировки базы перед ошибкой. **По умолчанию:** `0`.
    -   `readBigInts` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` целые читаются как JavaScript `BigInt`. При `false` — как числа. **По умолчанию:** `false`.
    -   `returnArrays` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` результаты запросов — массивы, а не объекты. **По умолчанию:** `false`.
    -   `allowBareNamedParameters` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` разрешены именованные параметры без префикса (например `foo` вместо `:foo`). **По умолчанию:** `true`.
    -   `allowUnknownNamedParameters` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` неизвестные именованные параметры при привязке игнорируются. При `false` — исключение. **По умолчанию:** `false`.
    -   `defensive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` включается защитный режим (`defensive`): отключаются возможности SQL, позволяющие намеренно повредить файл базы. То же задаёт `enableDefensive()`. **По умолчанию:** `true`.
    -   `limits` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Лимиты SQLite для ограничения ресурсов при обработке потенциально вредоносного ввода. См. [лимиты времени выполнения](https://www.sqlite.org/c3ref/limit.html) и [константы лимитов](https://www.sqlite.org/c3ref/c_limit_attached.html) в документации SQLite. Значения по умолчанию зависят от сборки. Свойства:
        -   `length` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальная длина строки или BLOB.
        -   `sqlLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальная длина SQL-выражения.
        -   `column` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число столбцов.
        -   `exprDepth` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальная глубина дерева выражения.
        -   `compoundSelect` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число частей в compound SELECT.
        -   `vdbeOp` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число инструкций VDBE.
        -   `functionArg` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число аргументов функции.
        -   `attach` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число прикреплённых баз.
        -   `likePatternLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальная длина шаблона LIKE.
        -   `variableNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число SQL-переменных.
        -   `triggerDepth` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальная глубина рекурсии триггеров.

Создаёт экземпляр `DatabaseSync`.

### `database.aggregate(name, options)`

Регистрирует новую агрегатную функцию в базе SQLite. Метод является обёрткой над [`sqlite3_create_window_function()`](https://www.sqlite.org/c3ref/create_function.html).

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя создаваемой функции SQLite.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Настройки функции.
    -   `deterministic` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, для созданной функции устанавливается флаг [`SQLITE_DETERMINISTIC`](https://www.sqlite.org/c3ref/c_deterministic.html). **По умолчанию:** `false`.
    -   `directOnly` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, для созданной функции устанавливается флаг [`SQLITE_DIRECTONLY`](https://www.sqlite.org/c3ref/c_deterministic.html). **По умолчанию:** `false`.
    -   `useBigIntArguments` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, целочисленные аргументы для `options.step` и `options.inverse` преобразуются в `BigInt`. Если `false`, целые передаются как числа JavaScript. **По умолчанию:** `false`.
    -   `varargs` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, `options.step` и `options.inverse` могут вызываться с любым числом аргументов (от нуля до [`SQLITE_MAX_FUNCTION_ARG`](https://www.sqlite.org/limits.html#max_function_arg)). Если `false`, `inverse` и `step` должны вызываться ровно с `length` аргументами. **По умолчанию:** `false`.
    -   `start` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Начальное значение для агрегатной функции. Используется при инициализации агрегата. Если передана [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function), начальным значением будет её результат.
    -   `step` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, вызываемая для каждой строки агрегации. Получает текущее состояние и значение строки. Возвращаемое значение задаёт новое состояние.
    -   `result` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция для получения итога агрегации. Получает финальное состояние и должна вернуть результат агрегации.
    -   `inverse` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Если указана, метод `aggregate` работает как оконная функция. Получает текущее состояние и значение исключаемой строки. Возвращаемое значение — новое состояние.

При использовании в качестве оконной функции `result` может вызываться несколько раз.

=== "CJS"

    ```js
    const { DatabaseSync } = require('node:sqlite');

    const db = new DatabaseSync(':memory:');
    db.exec(`
      CREATE TABLE t3(x, y);
      INSERT INTO t3 VALUES ('a', 4),
                            ('b', 5),
                            ('c', 3),
                            ('d', 8),
                            ('e', 1);
    `);

    db.aggregate('sumint', {
      start: 0,
      step: (acc, value) => acc + value,
    });

    db.prepare('SELECT sumint(y) as total FROM t3').get(); // { total: 21 }
    ```

=== "MJS"

    ```js
    import { DatabaseSync } from 'node:sqlite';

    const db = new DatabaseSync(':memory:');
    db.exec(`
      CREATE TABLE t3(x, y);
      INSERT INTO t3 VALUES ('a', 4),
                            ('b', 5),
                            ('c', 3),
                            ('d', 8),
                            ('e', 1);
    `);

    db.aggregate('sumint', {
      start: 0,
      step: (acc, value) => acc + value,
    });

    db.prepare('SELECT sumint(y) as total FROM t3').get(); // { total: 21 }
    ```

### `database.close()`

Закрывает соединение с базой. Если база не открыта, выбрасывается исключение. Метод является обёрткой над [`sqlite3_close_v2()`](https://www.sqlite.org/c3ref/close.html).

### `database.loadExtension(path)`

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь к загружаемой динамической библиотеке.

Загружает разделяемую библиотеку в соединение с базой. Метод является обёрткой над [`sqlite3_load_extension()`](https://www.sqlite.org/c3ref/load_extension.html). Нужно включить опцию `allowExtension` при создании экземпляра `DatabaseSync`.

### `database.enableLoadExtension(allow)`

-   `allow` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Разрешать ли загрузку расширений.

Включает или отключает SQL-функцию `loadExtension` и метод `loadExtension()`. Если при создании `allowExtension` было `false`, включить загрузку расширений нельзя из соображений безопасности.

### `database.enableDefensive(active)`

-   `active` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Следует ли установить флаг `defensive`.

Включает или отключает защитный режим (`defensive`). При активном флаге отключаются возможности SQL, позволяющие намеренно повредить файл базы. Подробности — [`SQLITE_DBCONFIG_DEFENSIVE`](https://www.sqlite.org/c3ref/c_dbconfig_defensive.html#sqlitedbconfigdefensive) в документации SQLite.

### `database.location([dbName])`

-   `dbName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя базы. Может быть `'main'` (основная база по умолчанию) или любая другая, добавленная через [`ATTACH DATABASE`](https://www.sqlite.org/lang_attach.html). **По умолчанию:** `'main'`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Путь к файлу базы. Для базы в памяти возвращается `null`.

Метод является обёрткой над [`sqlite3_db_filename()`](https://sqlite.org/c3ref/db_filename.html).

### `database.exec(sql)`

-   `sql` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка SQL для выполнения.

Позволяет выполнить одну или несколько SQL-команд без возврата результатов. Удобно при выполнении SQL, прочитанного из файла. Метод является обёрткой над [`sqlite3_exec()`](https://www.sqlite.org/c3ref/exec.html).

### `database.function(name[, options], fn)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя создаваемой функции SQLite.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Дополнительные настройки функции. Поддерживаются свойства:
    -   `deterministic` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, для созданной функции устанавливается флаг [`SQLITE_DETERMINISTIC`](https://www.sqlite.org/c3ref/c_deterministic.html). **По умолчанию:** `false`.
    -   `directOnly` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, для созданной функции устанавливается флаг [`SQLITE_DIRECTONLY`](https://www.sqlite.org/c3ref/c_deterministic.html). **По умолчанию:** `false`.
    -   `useBigIntArguments` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, целочисленные аргументы `function` преобразуются в `BigInt`. Если `false`, целые передаются как числа JavaScript. **По умолчанию:** `false`.
    -   `varargs` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, `function` может вызываться с любым числом аргументов (от нуля до [`SQLITE_MAX_FUNCTION_ARG`](https://www.sqlite.org/limits.html#max_function_arg)). Если `false`, `function` должна вызываться ровно с `function.length` аргументами. **По умолчанию:** `false`.
-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция JavaScript, вызываемая при обращении к функции SQLite. Возвращаемое значение должно быть допустимым типом данных SQLite: см. [преобразование типов между JavaScript и SQLite](#type-conversion-between-javascript-and-sqlite). Если возвращается `undefined`, в SQLite уходит `NULL`.

Создаёт пользовательские функции SQLite. Метод является обёрткой над [`sqlite3_create_function_v2()`](https://www.sqlite.org/c3ref/create_function.html).

### `database.setAuthorizer(callback)`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | null Функция-авторизатор или `null` для сброса текущего авторизатора.

Задаёт функцию обратного вызова авторизации, которую SQLite вызывает при попытке обратиться к данным или изменить схему через подготовленные выражения. Можно использовать для политик безопасности, аудита или ограничения операций. Метод является обёрткой над [`sqlite3_set_authorizer()`](https://sqlite.org/c3ref/set_authorizer.html).

При вызове функция обратного вызова получает пять аргументов:

-   `actionCode` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Тип операции (например `SQLITE_INSERT`, `SQLITE_UPDATE`, `SQLITE_SELECT`).
-   `arg1` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Первый аргумент (зависит от контекста, часто имя таблицы).
-   `arg2` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Второй аргумент (зависит от контекста, часто имя столбца).
-   `dbName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Имя базы.
-   `triggerOrView` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Имя триггера или представления, из-за которого происходит обращение.

Callback должен вернуть одну из констант:

-   `SQLITE_OK` — разрешить операцию.
-   `SQLITE_DENY` — запретить (вызовет ошибку).
-   `SQLITE_IGNORE` — игнорировать (тихо пропустить).

=== "CJS"

    ```js
    const { DatabaseSync, constants } = require('node:sqlite');
    const db = new DatabaseSync(':memory:');

    // Авторизатор: запретить создание любых таблиц
    db.setAuthorizer((actionCode) => {
      if (actionCode === constants.SQLITE_CREATE_TABLE) {
        return constants.SQLITE_DENY;
      }
      return constants.SQLITE_OK;
    });

    // Это выполнится
    db.prepare('SELECT 1').get();

    // Ошибка из-за отказа авторизации
    try {
      db.exec('CREATE TABLE blocked (id INTEGER)');
    } catch (err) {
      console.log('Operation blocked:', err.message);
    }
    ```

=== "MJS"

    ```js
    import { DatabaseSync, constants } from 'node:sqlite';
    const db = new DatabaseSync(':memory:');

    // Авторизатор: запретить создание любых таблиц
    db.setAuthorizer((actionCode) => {
      if (actionCode === constants.SQLITE_CREATE_TABLE) {
        return constants.SQLITE_DENY;
      }
      return constants.SQLITE_OK;
    });

    // Это выполнится
    db.prepare('SELECT 1').get();

    // Ошибка из-за отказа авторизации
    try {
      db.exec('CREATE TABLE blocked (id INTEGER)');
    } catch (err) {
      console.log('Operation blocked:', err.message);
    }
    ```

### `database.isOpen`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Открыта ли база в данный момент.

### `database.isTransaction`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Находится ли соединение внутри транзакции. Метод является обёрткой над [`sqlite3_get_autocommit()`](https://sqlite.org/c3ref/get_autocommit.html).

### `database.limits`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект для чтения и установки лимитов базы SQLite во время выполнения. Каждое свойство соответствует лимиту SQLite и может читаться или задаваться.

```js
const db = new DatabaseSync(':memory:');

// Текущий лимит
console.log(db.limits.length);

// Новый лимит
db.limits.sqlLength = 100000;

// Сброс лимита к максимуму времени компиляции
db.limits.sqlLength = Infinity;
```

Доступные свойства: `length`, `sqlLength`, `column`, `exprDepth`, `compoundSelect`, `vdbeOp`, `functionArg`, `attach`, `likePatternLength`, `variableNumber`, `triggerDepth`.

Значение `Infinity` сбрасывает лимит к максимуму, заданному при сборке.

### `database.open()`

Открывает базу, указанную в аргументе `path` конструктора `DatabaseSync`. Используйте метод, только если база не открывается в конструкторе. Если база уже открыта, выбрасывается исключение.

### `database.serialize([dbName])`

-   `dbName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя сериализуемой базы. Может быть `'main'` (основная по умолчанию) или любая другая, добавленная через [`ATTACH DATABASE`](https://www.sqlite.org/lang_attach.html). **По умолчанию:** `'main'`.
-   Возвращает: [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) Двоичное представление базы.

Сериализует базу в двоичный вид (`Uint8Array`). Удобно для сохранения, клонирования или переноса in-memory базы. Метод является обёрткой над [`sqlite3_serialize()`](https://sqlite.org/c3ref/serialize.html).

=== "MJS"

    ```js
    import { DatabaseSync } from 'node:sqlite';

    const db = new DatabaseSync(':memory:');
    db.exec('CREATE TABLE t(key INTEGER PRIMARY KEY, value TEXT)');
    db.exec("INSERT INTO t VALUES (1, 'hello')");
    const buffer = db.serialize();
    console.log(buffer.length); // длина буфера базы в байтах
    ```

=== "CJS"

    ```js
    const { DatabaseSync } = require('node:sqlite');

    const db = new DatabaseSync(':memory:');
    db.exec('CREATE TABLE t(key INTEGER PRIMARY KEY, value TEXT)');
    db.exec("INSERT INTO t VALUES (1, 'hello')");
    const buffer = db.serialize();
    console.log(buffer.length); // длина буфера базы в байтах
    ```

### `database.deserialize(buffer[, options])`

-   `buffer` [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) Двоичное представление базы, например результат [`database.serialize()`](#databaseserializedbname).
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры десериализации.
    -   `dbName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя базы, в которую загружают данные. **По умолчанию:** `'main'`.

Загружает сериализованную базу в это соединение, заменяя текущую. Результат доступен для записи. Существующие подготовленные выражения финализируются до попытки десериализации, даже если операция затем завершится ошибкой. Метод является обёрткой над [`sqlite3_deserialize()`](https://sqlite.org/c3ref/deserialize.html).

=== "MJS"

    ```js
    import { DatabaseSync } from 'node:sqlite';

    const original = new DatabaseSync(':memory:');
    original.exec('CREATE TABLE t(key INTEGER PRIMARY KEY, value TEXT)');
    original.exec("INSERT INTO t VALUES (1, 'hello')");
    const buffer = original.serialize();
    original.close();

    const clone = new DatabaseSync(':memory:');
    clone.deserialize(buffer);
    console.log(clone.prepare('SELECT value FROM t').get());
    // Вывод: { value: 'hello' }
    ```

=== "CJS"

    ```js
    const { DatabaseSync } = require('node:sqlite');

    const original = new DatabaseSync(':memory:');
    original.exec('CREATE TABLE t(key INTEGER PRIMARY KEY, value TEXT)');
    original.exec("INSERT INTO t VALUES (1, 'hello')");
    const buffer = original.serialize();
    original.close();

    const clone = new DatabaseSync(':memory:');
    clone.deserialize(buffer);
    console.log(clone.prepare('SELECT value FROM t').get());
    // Вывод: { value: 'hello' }
    ```

### `database.prepare(sql[, options])`

-   `sql` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка SQL для компиляции в подготовленное выражение.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры подготовленного выражения.
    -   `readBigInts` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, целые поля читаются как `BigInt`. **По умолчанию:** наследуется из опций базы или `false`.
    -   `returnArrays` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, результаты возвращаются массивами. **По умолчанию:** наследуется из опций базы или `false`.
    -   `allowBareNamedParameters` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, допускается привязка именованных параметров без префикса. **По умолчанию:** наследуется из опций базы или `true`.
    -   `allowUnknownNamedParameters` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, неизвестные именованные параметры игнорируются. **По умолчанию:** наследуется из опций базы или `false`.
-   Возвращает: [`<StatementSync>`](sqlite.md) Подготовленное выражение.

Компилирует SQL в [подготовленное выражение](https://www.sqlite.org/c3ref/stmt.html). Метод является обёрткой над [`sqlite3_prepare_v2()`](https://www.sqlite.org/c3ref/prepare.html).

### `database.createTagStore([maxSize])`

-   `maxSize` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число подготовленных выражений в кэше. **По умолчанию:** `1000`.
-   Возвращает: [`<SQLTagStore>`](#class-sqltagstore) Новый тег-хранилище SQL для кэширования выражений.

Создаёт [`SQLTagStore`](#class-sqltagstore) — LRU-кэш подготовленных выражений. Позволяет повторно использовать выражения, помечая их уникальным идентификатором.

При выполнении помеченного SQL-литерала `SQLTagStore` проверяет, есть ли в кэше подготовленное выражение для той же строки запроса. Если есть — используется кэш. Если нет — создаётся новое выражение, оно выполняется и сохраняется в кэше. Так снижаются накладные расходы на повторный разбор и подготовку одного и того же SQL.

В помеченных выражениях значения плейсхолдеров из шаблонного литерала привязываются как параметры к нижележащему подготовленному выражению. Например:

```js
sqlTagStore.get`SELECT ${value}`;
```

эквивалентно:

```js
db.prepare('SELECT ?').get(value);
```

В первом примере тег-хранилище кэширует нижележащее подготовленное выражение для последующих вызовов.

> **Примечание:** синтаксис `${value}` в помеченных литералах _привязывает_ параметр к подготовленному выражению. Это не то же самое, что в _непомеченных_ шаблонных литералах, где выполняется подстановка строки.
>
> ```js
> // Безопасная привязка параметра к помеченному выражению.
> sqlTagStore.run`INSERT INTO t1 (id) VALUES (${id})`;
>
> // Небезопасный пример без тега: `id` попадает в текст запроса как строка.
> // Возможны SQL-инъекции и порча данных.
> db.run(`INSERT INTO t1 (id) VALUES (${id})`);
> ```

Кэш совпадёт, только если строки запроса (включая позиции всех привязанных плейсхолдеров) совпадают.

```js
// Эти два вызова совпадут в кэше:
sqlTagStore.get`SELECT * FROM t1 WHERE id = ${id} AND active = 1`;
sqlTagStore.get`SELECT * FROM t1 WHERE id = ${12345} AND active = 1`;

// Эти не совпадут — различаются строка запроса и плейсхолдеры:
sqlTagStore.get`SELECT * FROM t1 WHERE id = ${id} AND active = 1`;
sqlTagStore.get`SELECT * FROM t1 WHERE id = 12345 AND active = 1`;

// Регистр учитывается:
sqlTagStore.get`SELECT * FROM t1 WHERE id = ${id} AND active = 1`;
sqlTagStore.get`select * from t1 where id = ${id} and active = 1`;
```

Привязка параметров в помеченных выражениях — только через `${value}`. Не добавляйте в текст SQL плейсхолдеры вроде `?` и т.п.

=== "MJS"

    ```js
    import { DatabaseSync } from 'node:sqlite';

    const db = new DatabaseSync(':memory:');
    const sql = db.createTagStore();

    db.exec('CREATE TABLE users (id INT, name TEXT)');

    // Вставка через метод `run`.
    // Помеченный литерал идентифицирует подготовленное выражение.
    sql.run`INSERT INTO users VALUES (1, 'Alice')`;
    sql.run`INSERT INTO users VALUES (2, 'Bob')`;

    // Одна строка через `get`.
    const name = 'Alice';
    const user = sql.get`SELECT * FROM users WHERE name = ${name}`;
    console.log(user); // { id: 1, name: 'Alice' }

    // Все строки через `all`.
    const allUsers = sql.all`SELECT * FROM users ORDER BY id`;
    console.log(allUsers);
    // [
    //   { id: 1, name: 'Alice' },
    //   { id: 2, name: 'Bob' }
    // ]
    ```

=== "CJS"

    ```js
    const { DatabaseSync } = require('node:sqlite');

    const db = new DatabaseSync(':memory:');
    const sql = db.createTagStore();

    db.exec('CREATE TABLE users (id INT, name TEXT)');

    // Вставка через метод `run`.
    // Помеченный литерал идентифицирует подготовленное выражение.
    sql.run`INSERT INTO users VALUES (1, 'Alice')`;
    sql.run`INSERT INTO users VALUES (2, 'Bob')`;

    // Одна строка через `get`.
    const name = 'Alice';
    const user = sql.get`SELECT * FROM users WHERE name = ${name}`;
    console.log(user); // { id: 1, name: 'Alice' }

    // Все строки через `all`.
    const allUsers = sql.all`SELECT * FROM users ORDER BY id`;
    console.log(allUsers);
    // [
    //   { id: 1, name: 'Alice' },
    //   { id: 2, name: 'Bob' }
    // ]
    ```

### `database.createSession([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры сессии.
    -   `table` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Конкретная таблица для отслеживания изменений. По умолчанию отслеживаются все таблицы.
    -   `db` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя базы для отслеживания. Полезно при нескольких базах через [`ATTACH DATABASE`](https://www.sqlite.org/lang_attach.html). **По умолчанию:** `'main'`.
-   Возвращает: [`<Session>`](sqlite.md) Дескриптор сессии.

Создаёт и подключает сессию к базе. Метод является обёрткой над [`sqlite3session_create()`](https://www.sqlite.org/session/sqlite3session_create.html) и [`sqlite3session_attach()`](https://www.sqlite.org/session/sqlite3session_attach.html).

### `database.applyChangeset(changeset[, options])`

-   `changeset` [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) Двоичный changeset или patchset.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры применения изменений.

    -   `filter` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пропускать изменения, для которых при передаче имени целевой таблицы функция возвращает истинное значение. По умолчанию применяются все изменения.
    -   `onConflict` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обработчик конфликтов. Получает один аргумент — одно из значений:

        -   `SQLITE_CHANGESET_DATA`: для `DELETE` или `UPDATE` нет ожидаемых «старых» значений.
        -   `SQLITE_CHANGESET_NOTFOUND`: строка с первичным ключом из `DELETE`/`UPDATE` не найдена.
        -   `SQLITE_CHANGESET_CONFLICT`: `INSERT` даёт дубликат первичного ключа.
        -   `SQLITE_CHANGESET_FOREIGN_KEY`: применение нарушит внешний ключ.
        -   `SQLITE_CHANGESET_CONSTRAINT`: нарушение ограничений `UNIQUE`, `CHECK` или `NOT NULL`.

        Функция должна вернуть одно из:

        -   `SQLITE_CHANGESET_OMIT` — пропустить конфликтующие изменения.
        -   `SQLITE_CHANGESET_REPLACE` — заменить существующие значения (допустимо при `SQLITE_CHANGESET_DATA` или `SQLITE_CHANGESET_CONFLICT`).
        -   `SQLITE_CHANGESET_ABORT` — прервать и откатить базу.

        Если в обработчике выброшена ошибка или возвращено иное значение, применение changeset прерывается с откатом.

        **По умолчанию:** функция, возвращающая `SQLITE_CHANGESET_ABORT`.

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Успешно ли применён changeset без прерывания.

Если база не открыта, выбрасывается исключение. Метод является обёрткой над [`sqlite3changeset_apply()`](https://www.sqlite.org/session/sqlite3changeset_apply.html).

=== "MJS"

    ```js
    import { DatabaseSync } from 'node:sqlite';

    const sourceDb = new DatabaseSync(':memory:');
    const targetDb = new DatabaseSync(':memory:');

    sourceDb.exec('CREATE TABLE data(key INTEGER PRIMARY KEY, value TEXT)');
    targetDb.exec('CREATE TABLE data(key INTEGER PRIMARY KEY, value TEXT)');

    const session = sourceDb.createSession();

    const insert = sourceDb.prepare('INSERT INTO data (key, value) VALUES (?, ?)');
    insert.run(1, 'hello');
    insert.run(2, 'world');

    const changeset = session.changeset();
    targetDb.applyChangeset(changeset);
    // После применения changeset данные в targetDb совпадают с sourceDb.
    ```

=== "CJS"

    ```js
    const { DatabaseSync } = require('node:sqlite');

    const sourceDb = new DatabaseSync(':memory:');
    const targetDb = new DatabaseSync(':memory:');

    sourceDb.exec('CREATE TABLE data(key INTEGER PRIMARY KEY, value TEXT)');
    targetDb.exec('CREATE TABLE data(key INTEGER PRIMARY KEY, value TEXT)');

    const session = sourceDb.createSession();

    const insert = sourceDb.prepare('INSERT INTO data (key, value) VALUES (?, ?)');
    insert.run(1, 'hello');
    insert.run(2, 'world');

    const changeset = session.changeset();
    targetDb.applyChangeset(changeset);
    // После применения changeset данные в targetDb совпадают с sourceDb.
    ```

### `database[Symbol.dispose]()`

Закрывает соединение с базой. Если оно уже закрыто, вызов ничего не делает.

## Класс: `Session`

### `session.changeset()`

-   Возвращает: [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) Двоичный changeset для применения к другим базам.

Возвращает changeset со всеми изменениями с момента создания сессии. Можно вызывать несколько раз. Если база или сессия не открыты, выбрасывается исключение. Метод является обёрткой над [`sqlite3session_changeset()`](https://www.sqlite.org/session/sqlite3session_changeset.html).

### `session.patchset()`

-   Возвращает: [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) Двоичный patchset для применения к другим базам.

Аналогично предыдущему методу, но формирует более компактный patchset. См. [changeset и patchset](https://www.sqlite.org/sessionintro.html#changesets_and_patchsets) в документации SQLite. Если база или сессия не открыты, выбрасывается исключение. Метод является обёрткой над [`sqlite3session_patchset()`](https://www.sqlite.org/session/sqlite3session_patchset.html).

### `session.close()`

Закрывает сессию. Если база или сессия не открыты, выбрасывается исключение. Метод является обёрткой над [`sqlite3session_delete()`](https://www.sqlite.org/session/sqlite3session_delete.html).

### `session[Symbol.dispose]()`

Закрывает сессию. Если сессия уже закрыта, ничего не делает.

## Класс: `StatementSync`

Представляет одно [подготовленное выражение](https://www.sqlite.org/c3ref/stmt.html). Конструктором создавать экземпляры нельзя — только через `database.prepare()`. Все методы класса выполняются синхронно.

Подготовленное выражение — эффективное двоичное представление исходного SQL. Его можно параметризовать и многократно вызывать с разными значениями. Параметры снижают риск [SQL-инъекций](https://en.wikipedia.org/wiki/SQL_injection). Поэтому при работе с пользовательским вводом предпочтительны подготовленные выражения, а не сборка SQL строкой.

### `statement.all([namedParameters][, ...anonymousParameters])`

-   `namedParameters` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательный объект привязки именованных параметров. Ключи задают соответствие имён.
-   `...anonymousParameters` null | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Ноль или больше значений для анонимных параметров.
-   Возвращает: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив объектов. Каждый объект — строка результата выполнения выражения. Ключи и значения — имена столбцов и значения в строке.

Выполняет подготовленное выражение и возвращает все строки массивом объектов. Если строк нет, возвращается пустой массив. [Параметры](https://www.sqlite.org/c3ref/bind_blob.html) привязываются из `namedParameters` и `anonymousParameters`.

### `statement.columns()`

-   Возвращает: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив объектов. Каждый объект описывает столбец подготовленного выражения и содержит поля:

    -   `column` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Имя столбца в исходной таблице без псевдонима или `null`, если столбец получен из выражения или подзапроса. Соответствует [`sqlite3_column_origin_name()`](https://www.sqlite.org/c3ref/column_database_name.html).
    -   `database` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Имя исходной базы без псевдонима или `null` для выражения/подзапроса. Соответствует [`sqlite3_column_database_name()`](https://www.sqlite.org/c3ref/column_database_name.html).
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя столбца в наборе результатов `SELECT`. Соответствует [`sqlite3_column_name()`](https://www.sqlite.org/c3ref/column_name.html).
    -   `table` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Имя исходной таблицы без псевдонима или `null` для выражения/подзапроса. Соответствует [`sqlite3_column_table_name()`](https://www.sqlite.org/c3ref/column_database_name.html).
    -   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Объявленный тип столбца или `null` для выражения/подзапроса. Соответствует [`sqlite3_column_decltype()`](https://www.sqlite.org/c3ref/column_decltype.html).

Возвращает сведения о столбцах результата подготовленного выражения.

### `statement.expandedSQL`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Исходный SQL с подставленными значениями параметров.

Текст подготовленного выражения, в котором плейсхолдеры заменены значениями последнего выполнения. Свойство является обёрткой над [`sqlite3_expanded_sql()`](https://www.sqlite.org/c3ref/expanded_sql.html).

### `statement.get([namedParameters][, ...anonymousParameters])`

-   `namedParameters` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательный объект привязки именованных параметров. Ключи задают соответствие имён.
-   `...anonymousParameters` null | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Ноль или больше значений для анонимных параметров.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined Объект первой строки результата или `undefined`, если строк нет.

Выполняет выражение и возвращает первую строку как объект. Если строк нет, возвращается `undefined`. [Параметры](https://www.sqlite.org/c3ref/bind_blob.html) привязываются из `namedParameters` и `anonymousParameters`.

### `statement.iterate([namedParameters][, ...anonymousParameters])`

-   `namedParameters` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательный объект привязки именованных параметров. Ключи задают соответствие имён.
-   `...anonymousParameters` null | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Ноль или больше значений для анонимных параметров.
-   Возвращает: [`<Iterator>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol) Итератор объектов по строкам результата.

Выполняет выражение и возвращает итератор по строкам. Если строк нет, итератор пустой. [Параметры](https://www.sqlite.org/c3ref/bind_blob.html) привязываются из `namedParameters` и `anonymousParameters`.

### `statement.run([namedParameters][, ...anonymousParameters])`

-   `namedParameters` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательный объект привязки именованных параметров. Ключи задают соответствие имён.
-   `...anonymousParameters` null | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Ноль или больше значений для анонимных параметров.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `changes` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Число строк, изменённых, вставленных или удалённых последним завершённым `INSERT`, `UPDATE` или `DELETE`. Тип — число или `BigInt` в зависимости от настроек выражения. Соответствует [`sqlite3_changes64()`](https://www.sqlite.org/c3ref/changes.html).
    -   `lastInsertRowid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Идентификатор последней вставленной строки. Тип — число или `BigInt` в зависимости от настроек выражения. Соответствует [`sqlite3_last_insert_rowid()`](https://www.sqlite.org/c3ref/last_insert_rowid.html).

Выполняет выражение и возвращает сводку по изменениям. [Параметры](https://www.sqlite.org/c3ref/bind_blob.html) привязываются из `namedParameters` и `anonymousParameters`.

### `statement.setAllowBareNamedParameters(enabled)`

-   `enabled` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включить или отключить привязку именованных параметров без префиксного символа.

Имена параметров SQLite начинаются с префиксного символа. По умолчанию `node:sqlite` требует этот символ при привязке. Кроме знака доллара, такие префиксы в ключах объектов часто требуют экранирования.

Метод позволяет использовать «голые» имена без префикса в коде JavaScript. Ограничения:

-   В SQL префиксный символ по-прежнему обязателен.
-   В JavaScript префикс разрешён; с префиксом привязка чуть эффективнее.
-   Неоднозначные имена вроде `$k` и `@k` в одном выражении дают исключение: нельзя однозначно сопоставить голое имя.

### `statement.setAllowUnknownNamedParameters(enabled)`

-   `enabled` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включить или отключить игнорирование неизвестных имён.

По умолчанию неизвестное имя при привязке вызывает исключение. Этот метод позволяет такие имена игнорировать.

### `statement.setReturnArrays(enabled)`

-   `enabled` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Возвращать результаты запросов массивами.

Если включено, `all()`, `get()` и `iterate()` возвращают строки массивами, а не объектами.

### `statement.setReadBigInts(enabled)`

-   `enabled` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Читать поля `INTEGER` как `BigInt`.

По умолчанию `INTEGER` из SQLite отображаются в числа JavaScript, но SQLite может хранить значения вне диапазона `number`. В таких случаях метод включает чтение через `BigInt`. На запись в базу не влияет: числа и `BigInt` поддерживаются всегда.

### `statement.sourceSQL`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Исходный SQL, из которого создано выражение.

Текст подготовленного выражения. Свойство является обёрткой над [`sqlite3_sql()`](https://www.sqlite.org/c3ref/expanded_sql.html).

## Класс: `SQLTagStore` {#class-sqltagstore}

Класс представляет LRU-кэш (наименее недавно использованный) для подготовленных выражений.

Экземпляры создаются через [`database.createTagStore()`](#databasecreatetagstoremaxsize), не конструктором. Кэш ключуется строкой SQL. При повторном том же запросе берётся сохранённое выражение, новые значения подставляются через привязку параметров, что снижает риск SQL-инъекций.

По умолчанию `maxSize` — 1000 выражений; можно задать своё (например `database.createTagStore(100)`). Все методы выполняются синхронно.

### `sqlTagStore.all(stringElements[, ...boundParameters])`

-   `stringElements` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Части шаблонного литерала с SQL.
-   `...boundParameters` null | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Значения для плейсхолдеров.
-   Возвращает: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив объектов — все строки результата.

Выполняет запрос и возвращает все строки.

Предназначена для использования как тег шаблонного литерала, не для прямого вызова.

### `sqlTagStore.get(stringElements[, ...boundParameters])`

-   `stringElements` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Части шаблонного литерала с SQL.
-   `...boundParameters` null | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Значения для плейсхолдеров.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined Первая строка результата или `undefined`, если строк нет.

Выполняет запрос и возвращает первую строку.

Предназначена для использования как тег шаблонного литерала, не для прямого вызова.

### `sqlTagStore.iterate(stringElements[, ...boundParameters])`

-   `stringElements` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Части шаблонного литерала с SQL.
-   `...boundParameters` null | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Значения для плейсхолдеров.
-   Возвращает: [`<Iterator>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol) Итератор объектов по строкам результата.

Выполняет запрос и возвращает итератор по строкам.

Предназначена для использования как тег шаблонного литерала, не для прямого вызова.

### `sqlTagStore.run(stringElements[, ...boundParameters])`

-   `stringElements` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Части шаблонного литерала с SQL.
-   `...boundParameters` null | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Значения для плейсхолдеров.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Сведения о выполнении, включая `changes` и `lastInsertRowid`.

Выполняет запрос без набора строк (например INSERT, UPDATE, DELETE).

Предназначена для использования как тег шаблонного литерала, не для прямого вызова.

### `sqlTagStore.size`

-   Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Только для чтения: число подготовленных выражений в кэше.

### `sqlTagStore.capacity`

-   Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Только для чтения: максимальное число выражений в кэше.

### `sqlTagStore.db`

-   Тип: [`<DatabaseSync>`](sqlite.md)

Только для чтения: связанный с хранилищем объект `DatabaseSync`.

### `sqlTagStore.clear()`

Сбрасывает LRU-кэш, удаляя все сохранённые выражения.

## `sqlite.backup(sourceDb, path[, options])`

-   `sourceDb` [`<DatabaseSync>`](sqlite.md) База для резервного копирования. Должна быть открыта.
-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) Путь к создаваемой копии. Если файл уже есть, он перезаписывается.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры резервного копирования. Поддерживаются:
    -   `source` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя исходной базы: `'main'` или база, добавленная через [`ATTACH DATABASE`](https://www.sqlite.org/lang_attach.html). **По умолчанию:** `'main'`.
    -   `target` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя целевой базы: `'main'` или база из [`ATTACH DATABASE`](https://www.sqlite.org/lang_attach.html). **По умолчанию:** `'main'`.
    -   `rate` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число страниц за один шаг копирования. **По умолчанию:** `100`.
    -   `progress` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательная функция обратного вызова после каждого шага. Аргумент — [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) с полями `remainingPages` и `totalPages` (прогресс операции).
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Промис с общим числом скопированных страниц при успехе или отклонение при ошибке.

Создаёт резервную копию базы. Обёртка над [`sqlite3_backup_init()`](https://www.sqlite.org/c3ref/backup_finish.html#sqlite3backupinit), [`sqlite3_backup_step()`](https://www.sqlite.org/c3ref/backup_finish.html#sqlite3backupstep) и [`sqlite3_backup_finish()`](https://www.sqlite.org/c3ref/backup_finish.html#sqlite3backupfinish).

Во время копирования исходную базу можно использовать как обычно. Изменения из того же соединения ([DatabaseSync](sqlite.md)) сразу попадают в копию. Изменения из других соединений перезапускают процесс резервного копирования.

=== "CJS"

    ```js
    const { backup, DatabaseSync } = require('node:sqlite');

    (async () => {
      const sourceDb = new DatabaseSync('source.db');
      const totalPagesTransferred = await backup(sourceDb, 'backup.db', {
        rate: 1, // по одной странице за шаг
        progress: ({ totalPages, remainingPages }) => {
          console.log('Backup in progress', { totalPages, remainingPages });
        },
      });

      console.log('Backup completed', totalPagesTransferred);
    })();
    ```

=== "MJS"

    ```js
    import { backup, DatabaseSync } from 'node:sqlite';

    const sourceDb = new DatabaseSync('source.db');
    const totalPagesTransferred = await backup(sourceDb, 'backup.db', {
      rate: 1, // по одной странице за шаг
      progress: ({ totalPages, remainingPages }) => {
        console.log('Backup in progress', { totalPages, remainingPages });
      },
    });

    console.log('Backup completed', totalPagesTransferred);
    ```

## `sqlite.constants`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект с распространёнными константами для операций SQLite.

### Константы SQLite

Следующие константы экспортируются из объекта `sqlite.constants`.

#### Константы разрешения конфликтов

Одна из следующих констант может передаваться обработчику `onConflict` при вызове [`database.applyChangeset()`](#databaseapplychangesetchangeset-options). См. также [константы, передаваемые обработчику конфликтов](https://www.sqlite.org/session/c_changeset_conflict.html) в документации SQLite.

| Константа | Описание |
| --- | --- |
| `SQLITE_CHANGESET_DATA` | Обработчик конфликтов вызывается с этой константой при обработке DELETE или UPDATE, если строка с нужным PRIMARY KEY есть в базе, но одно или несколько не ключевых полей, затронутых обновлением, не содержат ожидаемых «старых» значений. |
| `SQLITE_CHANGESET_NOTFOUND` | Обработчик вызывается с этой константой при DELETE или UPDATE, если строки с нужным PRIMARY KEY в базе нет. |
| `SQLITE_CHANGESET_CONFLICT` | Константа передаётся при INSERT, если операция привела бы к дубликату первичного ключа. |
| `SQLITE_CHANGESET_CONSTRAINT` | Если включена обработка внешних ключей и после применения changeset в базе остаются нарушения внешних ключей, обработчик вызывается с этой константой ровно один раз до фиксации changeset. Если обработчик вернёт `SQLITE_CHANGESET_OMIT`, фиксируются все изменения, включая вызвавшие нарушение. Если `SQLITE_CHANGESET_ABORT` — changeset откатывается. |
| `SQLITE_CHANGESET_FOREIGN_KEY` | Если при применении изменения возникает иное нарушение ограничения (UNIQUE, CHECK или NOT NULL), обработчик вызывается с этой константой. |

Одна из следующих констант должна возвращаться из обработчика `onConflict` для [`database.applyChangeset()`](#databaseapplychangesetchangeset-options). См. также [константы, возвращаемые обработчиком конфликтов](https://www.sqlite.org/session/c_changeset_abort.html) в документации SQLite.

| Константа | Описание |
| --- | --- |
| `SQLITE_CHANGESET_OMIT` | Конфликтующие изменения пропускаются. |
| `SQLITE_CHANGESET_REPLACE` | Конфликтующие изменения заменяют существующие значения. Допустимо только при типе конфликта `SQLITE_CHANGESET_DATA` или `SQLITE_CHANGESET_CONFLICT`. |
| `SQLITE_CHANGESET_ABORT` | Прервать при конфликте и откатить базу. |

#### Константы авторизации

Следующие константы используются с методом [`database.setAuthorizer()`](#databasesetauthorizercallback).

##### Коды результата авторизации

Одна из следующих констант должна возвращаться из функции обратного вызова авторизатора для [`database.setAuthorizer()`](#databasesetauthorizercallback).

| Константа | Описание |
| --- | --- |
| `SQLITE_OK` | Разрешить операцию. |
| `SQLITE_DENY` | Запретить операцию и вернуть ошибку. |
| `SQLITE_IGNORE` | Игнорировать операцию, как будто её не было. |

##### Коды действий авторизации

Следующие константы передаются первым аргументом в функцию обратного вызова авторизации и обозначают тип операции.

| Константа | Описание |
| --- | --- |
| `SQLITE_CREATE_INDEX` | Создать индекс |
| `SQLITE_CREATE_TABLE` | Создать таблицу |
| `SQLITE_CREATE_TEMP_INDEX` | Создать временный индекс |
| `SQLITE_CREATE_TEMP_TABLE` | Создать временную таблицу |
| `SQLITE_CREATE_TEMP_TRIGGER` | Создать временный триггер |
| `SQLITE_CREATE_TEMP_VIEW` | Создать временное представление |
| `SQLITE_CREATE_TRIGGER` | Создать триггер |
| `SQLITE_CREATE_VIEW` | Создать представление |
| `SQLITE_DELETE` | Удаление из таблицы |
| `SQLITE_DROP_INDEX` | Удалить индекс |
| `SQLITE_DROP_TABLE` | Удалить таблицу |
| `SQLITE_DROP_TEMP_INDEX` | Удалить временный индекс |
| `SQLITE_DROP_TEMP_TABLE` | Удалить временную таблицу |
| `SQLITE_DROP_TEMP_TRIGGER` | Удалить временный триггер |
| `SQLITE_DROP_TEMP_VIEW` | Удалить временное представление |
| `SQLITE_DROP_TRIGGER` | Удалить триггер |
| `SQLITE_DROP_VIEW` | Удалить представление |
| `SQLITE_INSERT` | Вставка в таблицу |
| `SQLITE_PRAGMA` | Выполнить PRAGMA |
| `SQLITE_READ` | Чтение из таблицы |
| `SQLITE_SELECT` | Выполнить SELECT |
| `SQLITE_TRANSACTION` | Начать, зафиксировать или откатить транзакцию |
| `SQLITE_UPDATE` | Обновление таблицы |
| `SQLITE_ATTACH` | Прикрепить базу |
| `SQLITE_DETACH` | Открепить базу |
| `SQLITE_ALTER_TABLE` | Изменить таблицу |
| `SQLITE_REINDEX` | Переиндексация |
| `SQLITE_ANALYZE` | Анализ базы |
| `SQLITE_CREATE_VTABLE` | Создать виртуальную таблицу |
| `SQLITE_DROP_VTABLE` | Удалить виртуальную таблицу |
| `SQLITE_FUNCTION` | Вызов функции |
| `SQLITE_SAVEPOINT` | Создать, освободить или откатить точку сохранения |
| `SQLITE_COPY` | Копирование данных (устар.) |
| `SQLITE_RECURSIVE` | Рекурсивный запрос |
