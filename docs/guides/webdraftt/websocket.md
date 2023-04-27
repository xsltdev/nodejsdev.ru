# WebSocket

**WebSocket** - это протокол передачи данных, основанный на протоколе TCP обеспечивающий обмен сообщениями между клиентом и сервером в режиме реального времени.

## Протокол WebSocket

Для установления соединения по WebSocket клиентская сторона сперва отправляет используя протокол HTTP специальные заголовки `Upgrade` и `Connection`, тем самым говоря, что она хочет перейти на общение по `WebSocket`. А сервер уже сам решает, разрешать установку соединения или нет.

Обмен сообщениями между сервером и клиентом осуществляется с помощью специальных пакетов, называемых фреймами. Выделяют два типа фреймов:

-   Управляющие данными (посылают данные);
-   Управляющие соединением (проверяют установку соединения через PING или закрывают его).

## Node.js и socket.io

Для использования в Node.js WebSocket необходимо установить npm модуль [socket.io](https://socket.io/).

```
npm install socket.io --save
```

Рассмотрим пример.

_app.js_

```js
const express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    io = require('socket.io')(http);

const host = '127.0.0.1';
const port = 7000;

let clients = [];

io.on('connection', (socket) => {
    console.log(`Client with id ${socket.id} connected`);
    clients.push(socket.id);

    socket.emit('message', "I'm server");

    socket.on('message', (message) =>
        console.log('Message: ', message)
    );

    socket.on('disconnect', () => {
        clients.splice(clients.indexOf(socket.id), 1);
        console.log(
            `Client with id ${socket.id} disconnected`
        );
    });
});

app.use(express.static(__dirname));

app.get('/', (req, res) => res.render('index'));

//получение количества активных клиентов
app.get('/clients-count', (req, res) => {
    res.json({
        count: io.clients().server.engine.clientsCount,
    });
});

//отправка сообщения конкретному клиенту по его id
app.post('/client/:id', (req, res) => {
    if (clients.indexOf(req.params.id) !== -1) {
        io.sockets.connected[req.params.id].emit(
            'private message',
            `Message to client with id ${req.params.id}`
        );
        return res.status(200).json({
            message: `Message was sent to client with id ${req.params.id}`,
        });
    } else
        return res
            .status(404)
            .json({ message: 'Client not found' });
});

http.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
);
```

_index.html_

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Socket.io example</title>
        <script src="/node_modules/socket.io-client/dist/socket.io.js"></script>
        <script>
            let socket = io();

            socket.on('message', (message) =>
                console.log(
                    'Message from server: ',
                    message
                )
            );
            socket.on('private message', (message) =>
                console.log(
                    'Private message from server: ',
                    message
                )
            );

            function sendMessageToServer() {
                socket.emit('message', "I'm client");
            }
        </script>
    </head>
    <body>
        <button onclick="sendMessageToServer()">
            Send message to server
        </button>
    </body>
</html>
```

Для подключения WebSocket на клиентской стороне используется модуль `socket.io-client`, экземпляру которого передается адрес сервера, с которым необходимо установить соединение по WebSocket.

При установке соединения между клиентом и сервером Node.js по WebSocket генерируется событие `connection`, которое обрабатывается с помощью метода `on()` модуля `socket.io`. Передаваемая вторым параметром методу `on()` callback-функция единственным параметром принимает экземпляр соединения (далее просто сокет).

```js
io.on('connection', (socket) => {});
```

Каждое соединение имеет свой уникальный идентификатор, зная который можно отправить сообщение конкретному клиенту (см. в примере маршрут `/client/:id`).

При разрыве соединения генерируется событие `disconnect`. Соединение разрывается, когда пользователь закрывает вкладку или когда сервер вызывает у сокета метод `disconnect()`.

```js
socket.on('disconnect', () => {});
```

Для отправки данных от сервера Node.js к клиенту (и наоборот), используется метод `emit()`, которые принимает следующие параметры:

-   имя события;
-   данные, которые необходимо отправить (могут быть отправлены в виде REST-аргументов);
-   callback-функция (передается последним параметром), которая будет вызвана, когда вторая сторона получит сообщение.

Обработка отправляемых данных на стороне получателя происходит с использованием уже знакомого метода `on()`, первым параметром принимающего имя события, указанного в `emit()`, вторым - callback-функцию с переданными данными в качестве ее параметров.

```js
//получатель
let socket = io();

socket.on('message', (message) =>
    console.log('Message from server: ', message)
);

//отправитель
io.on('connection', (socket) => {
    socket.emit('message', "I'm server");
});
```

Для отправки данных всем клиентам, используйте метод `emit()` применительно к объекту `io.sockets`.

```js
io.sockets.emit('message', 'Message for all clients');
```

Чтобы узнать текущее количество соединений, используйте метод `clients()`, вызываемый применительно к свойству `sockets` экземпляра модуля `socket.io` (см. в примере маршрут `/clients-count`).

В качестве необязательного параметра методу `clients()` можно передать имя "комнаты", количество соединений для который вы хотите узнать.

## Пространства и "комнаты"

В протоколе WebSocket существуют такие понятия, как пространства и "комнаты". По умолчанию посылаемые данные отправляются всем сокетам, но принимают эти данные лишь некоторые из них. Получается, что в определенные моменты времени будет установлено избыточное количество соединений. Чтобы избежать этого, используйте пространства.

Пространства позволяют изолировать одни сокеты от других.

_app.js_

```js
const express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    io = require('socket.io')(http);

const host = '127.0.0.1';
const port = 7000;

const nmspc1 = io.of('/your-namespace1');
const nmspc2 = io.of('/your-namespace2');

nmspc1.on('connection', (socket) => {
    console.log(
        `Client ${socket.id} connected to /your-namespace1`
    );
});

nmspc2.on('connection', (socket) => {
    console.log(
        `Client ${socket.id} connected to /your-namespace2`
    );
});

app.use(express.static(__dirname));

app.get('/', (req, res) => res.render('index'));

http.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
);
```

```js
let socket = io('/your-namespace1');
```

В приведенном примере с помощью метода `of()` на сервере определяются два пространства: `/users` и `/orders`. На клиентской стороне подключение к тому или иному пространству происходит в зависимости от текущего маршрута. Таким образом, при отправке данных, например, из пространства `/users`, об этом будут оповещены только сокеты этого пространства. По умолчанию все сокеты находятся в пространстве `/`.

Также и в пределах пространства можно распределять сокеты по так называемым "комнатам".

```js
io.on('connection', (socket) => {
    socket.join('Room №1');
});
```

Чтобы отнести сокет к определенной "комнате" используется метод пространства `join()`, который принимает имя "комнаты" (задается пользователем модуля `socket.io`). Для вынесения сокета из комнаты используйте метод `leave()`.

Отправка данных в "комнату" осуществляется с помощью метода `to()`.

```js
io.to('Room №1').emit('message', 'Message form Room №1');
```

Обработка инициируемых в пределах "комнаты" событий осуществляется с использованием метода `in()`.

```js
io.in('Room №1').on('message', (message) =>
    console.log('Room №1. Message: ', message)
);
```
