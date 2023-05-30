# SQL

Для работы Node.js с базами данных SQL используется модуль [sequelize](http://docs.sequelizejs.com/).

```
npm install sequelize --save
```

Node.js sequelize поддерживает следующие СУБД: MySQL, PostgreSQL, MSSQL и MariaDB.

!!! note ""

    Модуль имеет единое API для всех перечисленных СУБД, поскольку все перечисленные СУБД используют единый язык описания запросов - SQL.

## Подключение

Рассмотрим подключение к базе данных PostgreSQL.

_connection.js_

```js
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'db_name',
    'user',
    'password',
    {
        dialect: 'postgres',
    }
);

sequelize
    .authenticate()
    .then(() => console.log('Connected.'))
    .catch((err) =>
        console.error('Connection error: ', err)
    );
```

!!! note ""

Во всех последующих примерах будет подразумеваться, что переменная `sequelize` хранит соединение с БД.

За подключение отвечает класс `Sequelize`, при создании экземпляра которого задаются следующие параметры:

-   имя базы данных, к которой необходимо подключиться;
-   имя пользователя;
-   пароль;
-   объект конфигурации.

Через объект конфигурации можно задать множество параметров, вот лишь некоторые из них:

-   `host` - хост сервера БД (по умолчанию `localhost`);
-   `port` - порт сервера БД (по умолчанию порт по умолчанию выбранной СУБД);
-   `dialect` - тип используемой СУБД (`mariadb`, `mysql`, `mssql`, `postgres`);
-   `pool` - настройка пула соединений;
-   `scheme` - используемая схема (по умолчанию `null`).

Пример настройки пула соединений.

```js
const sequelize = new Sequelize(
    'db_name',
    'user',
    'password',
    {
        dialect: 'postgres',
        pool: {
            max: 10, //максимальное кол-во соединений в пуле (Default: 5)
            min: 0, //минимальное кол-во соединений в пуле (Default: 0)
            acquire: 30000, //время в миллисекундах, в течение которого будет осуществляться попытка установить соединение, прежде чем будет сгенерировано исключение (Default: 60000)
            idle: 10000, //время простоя в миллисекундах, по истечении которого соединение покинет пул (Default: 1000)
        },
    }
);
```

С полным перечнем задаваемых опций можно ознакомиться в [документации](http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor) Node.js sequelize.

Для проверки установки соединения в примере вызывается метод `authenticate()`, который возвращает объект `Promise`.

```js
sequelize
    .close()
    .then(() => console.log('Closed.'))
    .catch((err) =>
        console.error('Close connection error: ', err)
    );
```

!!! note ""

    Не открывайте новое соединение пока не закроете текущее.

## Модели

Модели используются для описания структуры таблицы. Одна модель описывает одну таблицу.

```js
const Sequelize = require('sequelize');

class Book extends Sequelize.Model {}

Book.init(
    {
        id: {
            type: Sequelize.NUMBER,
            primaryKey: true,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "Book 's title",
        },
        author: {
            type: Sequelize.STRING,
            field: '_author',
        },
        description: {
            type: Sequelize.TEXT,
        },
        publishDate: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    { sequelize, modelName: 'book' }
);
```

Модель создается с помощью метода `init()` класса, который является дочерним по отношению к `Sequelize.Model`. Метод `init()` принимает два объекта:

-   объект с описанием полей таблицы;
-   конфигурация создаваемой модели и соответствующей ей таблицы.

Описание поля задается объектом со следующими свойствами:

-   `type` - тип поля;
-   `defaultValue` - значение поля по умолчанию;
-   `primaryKey` - булевое значение, если `true`, то поле является первичным ключом (по умолчанию `false`);
-   `autoIncrement` - булевое значение, если `true`, то при добавлении новой записи значение поля будет значение предыдущей записи этого поля плюс единица (по умолчанию `false`);
-   `allowNull` - булевое значение, если `false`, запрещает создавать новую запись с этим пустым полем;
-   `unique` - булевое значение, если `true`, то значение указанное для этого поля в записи должно быть уникальным в пределах таблицы (по умолчанию `false`);
-   `comment` - комментарий к полю;
-   `field` - если указано, то в качестве названия поле будет использоваться именно это значение, а не ключ;
-   `validate` - объект с заданием для поля валидаторов, с полным списком можно ознакомиться в [документации](http://docs.sequelizejs.com/manual/models-definition.html#validations);
-   `get()` - функция, которая модифицирует значение поля при чтении записи;
-   `set()` - функция, преобразующая передаваемое значение при сохранении записи.

_get.js_

```js
title: {
	type: Sequelize.STRING,
	allowNull: false,
	get(){
		return `${this.getDataValue('title')}, ${this.getDataValue('author')}`
	}
}
```

Реализация аналогичного функционала с использованием `set()`.

_set.js_

```js
title: {
	type: Sequelize.STRING,
	allowNull: false,
	set(value){
		this.setDataValue('title', `${this.getDataValue('author')}, ${this.getDataValue('author')}`);
	}
}
```

Конфигурация модели (второй параметр, передаваемый `init()`) описывается следующим объектом:

-   `modelName` - имя модели;
-   `timestamps` - булевое значение, если `true`, то к таблице автоматически будут добавлены поля `createdAt` (дата и время создания записи) и `updatedAt` (дата и время обновления записи);
-   `paranoid` - булевое значение, если `true`, то вместо фактического удаления записи добавит поле `deletedAt` с датой и временем выполнения запроса на удаление (работает совместно с `{timestamps: true}`);
-   `underscored` - булевое значение, если `true`, то названия полей будут переименованы с использованием символа нижнего подчеркивания, например, если поле названо `authorName`, то в таблице оно фактически будет называться `author_name` (параметр не распространяется на значение поля `field`, указанное при описании поля таблицы);
-   `freezeTableName` - булевое значение, если `true`, то название таблицы будет таким, как указано в `tableName` (по умолчанию названия всех таблиц преобразуются в множественное число);
-   `tableName` - название таблицы;
-   `hooks` - определение триггеров (рассмотрены отдельно далее);
-   `indexes` - определение индексов (рассмотрены отдельно далее);
-   `sequelize` - экземпляр объекта активного соединения с БД.

!!! note ""

    Если описанной с помощью модели таблицы физически еще не существует, она будет создана автоматически в момент запуска приложения или вызова метода `sync()` в уже работающем приложении.

```js
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'db_name',
    'user',
    'password',
    {
        dialect: 'postgres',
    }
);

sequelize.sync();
```

## Создание связей

Создание связей между таблицами осуществляется с использованием моделей. Рассмотрим установление следующих типов связей:

-   один к одному;
-   один ко многим;
-   многие ко многим.

Пример установки связи один к одному.

_one-to-one.js_

```js
class Car extends Sequelize.Model {}
class Driver extends Sequelize.Model {}

Car.init(
    {
        id: {
            type: Sequelize.NUMBER,
            primaryKey: true,
        },
        model: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        year: {
            type: Sequelize.NUMBER,
            allowNull: false,
            validate: {
                isNumeric: true,
            },
        },
    },
    { sequelize, modelName: 'car' }
);

Driver.init(
    {
        id: {
            type: Sequelize.NUMBER,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    { sequelize, modelName: 'driver' }
);

//Создание связи "один к одному"
Car.belongsTo(Driver);
//или так
Car.hasOne(Driver);
```

Определение связи один к одному подразумевает, что у одного водителя имеется одна машина.

!!! note ""

    Разница между использованием `belongsTo()` и `hasOne()` в том, что в первом случае `foreignKey` будет добавлен в модель `Car`, а во втором - в модель `Driver`.

По умолчанию формат добавляемого `foreignKey` следующий: `modelName + "Id"`. Так, `belongsTo()` добавит в `Car` поле `driverId`, а `hasOne()` - в `Driver` поле `carId`.

Если вы хотите задать собственное наименование `foreignKey` или связать таблицы не по полю `id`, используйте следующий формат определения связи.

```js
Car.belongsTo(Driver, {
    foreignKey: 'driver_fk',
    sourceKey: 'uuid',
});
```

!!! note ""

Значение поля sourceKey должно быть уникальным.

Теперь рассмотрим пример установки связи один ко многим. В качестве исходных моделей используем модели из примера связи один к одному.

```js
//у модели Car добавится поле driverId
Driver.hasMany(Car);
```

Здесь в примере определение связи один ко многим указывает, что у одного водителя может быть несколько машин.

Если необходимо указать пользовательские поля связывания, то придется указать полную связь.

```js
Driver.hasMany(Car, {
    foreignKey: 'driver_fk',
    sourceKey: 'uuid',
});
Car.belongsTo(Driver, {
    foreignKey: 'driver_fk',
    sourceKey: 'uuid',
});
```

Теперь посмотрим, как определить связь многие ко многим на примере все тех же моделей `Car` и `Driver`.

```js
Car.belongstoMany(Driver, { through: 'CarDriver' });
Driver.belongstoMany(Car, { through: 'CarDriver' });
```

Для хранения соответствия ключей водителей и автомобилей будет создана отдельная таблица, название которой указывается в поле `through` объекта, передаваемого методу `belongsToMany()` вторым параметром.

Задание полей в создаваемой таблице можно указать через свойство `foreignKey`.

```js
Car.belongstoMany(Driver, {
    through: 'CarDriver',
    foreignKey: 'car_id',
});
Driver.belongstoMany(Car, {
    through: 'CarDriver',
    foreignKey: 'driver_id',
});
```

Пример извлечения данных из таблицы вместе с данными связанной таблице приведен далее в разделе "Получение/создание/обновление/удаление записи".

Если необходимо, чтобы модель `CarDriver` содержала дополнительные поля, просто заранее определите модель с этими самыми полями. Поля `car_id` и `driver_id` будут добавлены автоматически в момент создания связи.

```js
class CarDriver extends Sequelize.Model {}

CarDriver.init(
    {
        expired: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
    },
    { sequelize, modelName: 'CarDriver' }
);
```

## Получение/создание/обновление/удаление записи

Для получения данных таблицы, применительно к соответствующей модели используйте методы `findAll()` и `findOne()`.

```js
//вернет все записи со всеми полями из таблицы cars
sequelize.car.findAll();

//вернет первую запись из таблицы cars
sequelize.car.findOne();

//вернет поле model для каждой записи таблицы cars
sequelize.car.findAll({
    attributes: ['model'],
});

//вернет поле model для первой записи таблицы cars
sequelize.car.findOne({
    attributes: ['model'],
});

//вернет все записи таблицы cars со всеми полями, кроме поля model
sequelize.car.findAll({
    attributes: { exclude: ['model'] },
});

//вернет все машины с маркой BMW таблицы cars
sequelize.car.findAll({
    where: { model: 'BMW' },
});

//пример использования с оператором and
const Operators = Sequelize.Op;

sequelize.car.findAll({
    where: {
        model: 'BMW',
        year: {
            [Operators.and]: 2019,
        },
    },
});

//пример с сортировкой и ограничением выборки
sequelize.car.findAll({
    order: ['year', 'DESC'],
    offset: 0,
    limit: 10,
});

//подсчет количества всех записей в таблице
sequelize.car.count().then((count) => console.log(count));

//определение самой новой машины
sequelize.car.max('year').then((max) => console.log(max));

//получение данных связанной таблицы
sequelize.driver.findAll(
    (include: [
        {
            model: Car, //здесь передается модель
            through: {
                attributes: ['model', 'year'],
            },
        }
    ])
);
```

!!! note ""

    С полным списком поддерживаемых Node.js sequelize операторов можно ознакомиться на [официальном сайте](http://docs.sequelizejs.com/manual/querying.html#operators).

Создание новых записей осуществляется с помощью методов `create()` и `bulkCreate()`.

```js
//создание новой записи, если передать неполную модель, то недостающие поля будут null
sequelize.car
    .create({
        model: 'Audi',
        year: 2019,
    })
    .then((record) => console.log(record));

//создание сразу множества записей
sequelize.car
    .bulkCreate(
        [
            {
                model: 'Audi A5',
                year: 2019,
            },
            {
                model: 'Audi A7',
                year: 2018,
            },
        ],
        { returning: true }
    )
    .then((records) => console.log(records));
```

За обновление записей отвечает метод `update()`, который первым параметром принимает новые значения для записей, попадающих под задаваемую вторым параметром выборку.

```js
sequelize.car
    .update(
        {
            model: 'Audi',
        },
        {
            where: { model: 'BMW' },
        }
    )
    .then((record) => console.log(record));
```

Для удаления записей имеется метод `destroy()`.

```js
sequelize.car
    .destroy({
        where: { model: 'BMW' },
    })
    .then((result) => console.log(result));
```

Для выполнения самописных запросов без использования модели таблицы имеется метод `sequelize.query()`, который первым параметром принимает сам запрос в строковом виде, а вторым параметром - конфигурационный объект.

```js
sequelize
    .query(`SELECT * FROM car`, {
        raw: true, //если для таблицы, к которой происходит обращение, не определена модель
        type: Sequelize.QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
    })
    .then((result) => console.log(result));
```

## Триггеры

Триггеры представляют собой функции, которые выполняются (если они определены) до/после/во время действий с данными. Список самых популярных триггеров в порядке их выполнения:

-   `beforeValidate(данные, опции)` - выполняется перед валидацией;
-   `afterValidate(данные, опции)` или `validationFailed(данные, опции, ошибка)` - выполняется после успешной или неуспешной проверки валидации соответственно;
-   `beforeCreate(данные, опции)` - вызывается перед созданием записи;
-   `beforeDestroy(данные, опции)` - выполняется перед удалением записи;
-   `beforeUpdate(данные, опции)` - вызывается перед обновлением записи;
-   `beforeSave(данные, опции)` - вызывается перед сохранением записи;
-   `afterCreate(данные, опции)` - вызывается после создания записи;
-   `afterDestroy(данные, опции)` - выполняется после удаления записи;
-   `afterUpdate(данные, опции)` - вызывается после обновления записи;
-   `afterSave(данные, опции)` - вызывается после сохранения записи.

Определение триггеров осуществляется в модели таблицы в объекте конфигурации в свойстве `hooks`.

```js
Driver.init({
	id: {
		type: Sequelize.NUMBER,
		primaryKey: true
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false
	}
},
{
	sequelize,
	modelName: 'driver',
	hooks: {
		beforeCreate(record, opts) => {
			console.log(record);
			console.log(opts);
		}
	}
});
```

Также имеется пара триггеров `beforeConnect()` и `afterConnect()` для подключения к БД.

```js
sequelize.beforeConnect((config) =>
    console.log('Config: ', config)
);

sequelize.afterConnect((conn, config) => {
    console.log('Connection: ', conn);
    console.log('Config: ', config);
});
```

С полным перечнем триггеров можно ознакомиться в официальной документации.

## Индексы

Создание индексов осуществляется при создании модели таблицы.

```js
Driver.init(
    {},
    {
        sequelize,
        modelName: 'driver',
        indexes: [
            { unique: true, fields: ['name'] }, //уникальный индекс
            //составной индекс
            {
                name: 'index_name',
                fields: ['name', 'active'],
                where: {
                    active: true,
                },
            },
        ],
    }
);
```

!!! note ""

    Если не указать у составного индекса поле name, то по умолчанию его именем будет `${table}_${fields}`.
