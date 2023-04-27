# Дочерние процессы

В Node.js дочерние процессы создаются для выполнения ресурсоемких операций, которые во время выполнения блокируют цикл событий основного процесса. Создаваемые дочерние процессы полностью независимы от родительского процесса и имеют свои собственные экземпляры V8 и выделенные мощности процессора и объем памяти.

Для создания дочернего процесса в Node.js используется встроенный модуль [`child_process`](../../api/child_process.md) и его методы `spawn()` и `fork()`, каждый из которых возвращает экземпляр класса `ChildProcess`.

## child_process.spawn()

Метод `child_process.spawn()` создает новый дочерний процесс (не обязательно Node.js) командой, переданной ему в качестве параметра. Вторым параметром можно передать массив аргументов команды.

_app.js_

```js
const child_process = require('child_process');

//Переход в директорию /srv/app
const cd = child_process.spawn('cd'['/srv/app']);

cd.on('error', (error) =>
    console.log('Cannot change dir: \n', error)
);

//Получение списка файлов и директорий для Linux
const ls = child_process.spawn('ls');

ls.stdout.on('data', (data) =>
    console.log('Files list: \n', data)
);
ls.stderr.on('error', (error) =>
    console.log('Error: \n', error)
);
```

!!! note ""

    Практически всегда в качестве дополнительного процесса вам придется запускать модуль Node.js. Для этого вместо метода `child_process.spawn()` используйте `child_process.fork()`.

## child_process.fork()

Метод `child_process.fork()` является частным случаем метода `child_process.spawn()`, только вместо команды он принимает путь к модулю, который должен быть запущен как новый процесс. Вторым параметром передается массив аргументом для запуска модуля.

_app.js_

```js
const child_process = require('child_process');

const child_3 = child_process.fork('child.js', [3]);
const child_9 = child_process.fork('child.js', [9]);

child_3.on('close', (code) =>
    console.log(`Child process 3 exited. Code: ${code}`)
);
child_9.on('close', (code) =>
    console.log(`Child process 9 exited. Code: ${code}`)
);
```

_child.js_

```js
console.log(`Child process ${process.argv[2]} is running`);
```

Для запуска примера выполните команду.

```
node app.js
```

В результате в консоли вы должны увидеть следующее.

```
Child process 3 is running
Child process 9 is running
Child process 3 exited. Code: 0
Child process 9 exited. Code: 0
```

Для взаимодействия основного и дочернего процессов используется метод `send()`, который устанавливает между процессами IPC канал для обмена сообщениями и параметром принимает данные для отправки другому процессу. Переданные данные являются аргументами для callback-функции, определяемой для обработки сообщения.

_app.js_

```js
const child_process = require('child_process');

const child = child_process.fork('child.js');

child.send('Ping child');

child.on('message', (code) =>
    console.log(`Message to parent: ${code}`)
);

child.on('close', (code) =>
    console.log(`Child process exited. Code: ${code}`)
);
```

_child.js_

```js
console.log(`Child process is running`);

process.on('message', (message) =>
    console.log('Message to child: ', message)
);

process.send('Ping parent');
```

Результат должен быть таким.

```
Child process is running
Message to child:  Ping child
Message to parent: Ping parent
```

Завершение дочернего процесса можно инициировать вызовом метода `disconnect()` или `exit()`. Вызов `disconnect()` закроет IPC канал для обмена сообщениями, сгенерирует событие `disconnect` и завершит процесс после выполнения всех его операций.

Внесем изменения в предыдущий пример в файл `child.js`.

```js
console.log(`Child process is running`);

process.on('message', (message) =>
    console.log('Message to child: ', message)
);

process.send('Ping parent');
process.exit();
```

Теперь в консоли должна быть выведена дополнительная строка.

```
Child process exited. Code: 0
```
