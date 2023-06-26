---
title: Stream
description: Поток - это абстрактный интерфейс для работы с потоковыми данными в Node.js
---

# Поток

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/stream.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

**Поток** - это абстрактный интерфейс для работы с потоковыми данными в Node.js. Модуль **`node:stream`** предоставляет API для реализации интерфейса потока.

В Node.js существует множество объектов потока. Например, [запрос к HTTP-серверу](http.md#class-httpincomingmessage) и [`process.stdout`](process.md#processstdout) являются экземплярами потока.

Потоки могут быть доступны для чтения, записи или и для того, и для другого. Все потоки являются экземплярами [`EventEmitter`](events.md#class-eventemitter).

Чтобы получить доступ к модулю `node:stream`:

```js
const stream = require('node:stream');
```

Модуль `node:stream` полезен для создания новых типов экземпляров потоков. Обычно нет необходимости использовать модуль `node:stream` для потребления потоков.

<!-- 0000.part.md -->

## Организация данного документа

Этот документ содержит два основных раздела и третий раздел для примечаний. В первом разделе объясняется, как использовать существующие потоки в приложении. Во втором разделе объясняется, как создавать новые типы потоков.

<!-- 0001.part.md -->

## Типы потоков

В Node.js существует четыре основных типа потоков:

-   [`Writable`](#streamwritable): потоки, в которые можно записывать данные (например, [`fs.createWriteStream()`](fs.md#fscreatewritestreampath-options)).
-   [`Readable`](#streamreadable): потоки, из которых можно читать данные (например, [`fs.createReadStream()`](fs.md#fscreatereadstreampath-options)).
-   [`Duplex`](#streamduplex): потоки, которые являются одновременно `Readable` и `Writable` (например, [`net.Socket`](net.md#class-netsocket)).
-   [`Transform`](#streamtransform): `дуплексные` потоки, которые могут изменять или преобразовывать данные по мере их записи и чтения (например, [`zlib.createDeflate()`](zlib.md#zlibcreatedeflateoptions)).

Кроме того, в этот модуль входят служебные функции [`stream.pipeline()`](#streampipeline), [`stream.finished()`](#streamfinished), [`stream.Readable.from()`](#streamreadable) и [`stream.addAbortSignal()`](#streamaddabortsignal).

<!-- 0002.part.md -->

### Promise API потоков

API `stream/promises` предоставляет альтернативный набор асинхронных служебных функций для потоков, которые возвращают объекты `Promise`, а не используют обратные вызовы. API доступен через `require('node:stream/promises')` или `require('node:stream').promises`.

<!-- 0003.part.md -->

### stream.pipeline

```js
stream.pipeline(source[, ...transforms], destination[, options])
```

```js
stream.pipeline(streams[, options])
```

-   `streams` {Stream\[\]} | {Iterable\[\]} | {AsyncIterable\[\]} | {Function\[\]}
-   `source` [`<Stream>`](stream.md#stream) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
-   `...transforms` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
    -   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
-   `destination` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
    -   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `сигнал` [`<AbortSignal>`](globals.md#abortsignal)
    -   `end` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется, когда конвейер завершен.

<!-- конец списка -->

=== "CJS"

    ```js
    const { pipeline } = require('node:stream/promises');
    const fs = require('node:fs');
    const zlib = require('node:zlib');

    async function run() {
    	await pipeline(
    		fs.createReadStream('archive.tar'),
    		zlib.createGzip(),
    		fs.createWriteStream('archive.tar.gz')
    	);
    	console.log('Pipeline succeeded.');
    }

    run().catch(console.error);
    ```

=== "MJS"

    ```js
    import { pipeline } from 'node:stream/promises';
    import {
    	createReadStream,
    	createWriteStream,
    } from 'node:fs';
    import { createGzip } from 'node:zlib';

    await pipeline(
    	createReadStream('archive.tar'),
    	createGzip(),
    	createWriteStream('archive.tar.gz')
    );
    console.log('Pipeline succeeded.');
    ```

Чтобы использовать `AbortSignal`, передайте его внутри объекта options в качестве последнего аргумента. Когда сигнал будет прерван, на базовом конвейере будет вызвана команда `destroy` с сообщением `AbortError`.

=== "CJS"

    ```js
    const { pipeline } = require('node:stream/promises');
    const fs = require('node:fs');
    const zlib = require('node:zlib');

    async function run() {
    	const ac = new AbortController();
    	const signal = ac.signal;

    	setImmediate(() => ac.abort());
    	await pipeline(
    		fs.createReadStream('archive.tar'),
    		zlib.createGzip(),
    		fs.createWriteStream('archive.tar.gz'),
    		{ signal }
    	);
    }

    run().catch(console.error); // AbortError
    ```

=== "MJS"

    ```mjs
    import { pipeline } from 'node:stream/promises';
    import {
    	createReadStream,
    	createWriteStream,
    } from 'node:fs';
    import { createGzip } from 'node:zlib';

    const ac = new AbortController();
    const { signal } = ac;
    setImmediate(() => ac.abort());
    try {
    	await pipeline(
    		createReadStream('archive.tar'),
    		createGzip(),
    		createWriteStream('archive.tar.gz'),
    		{ signal }
    	);
    } catch (err) {
    	console.error(err); // AbortError
    }
    ```

API `pipeline` также поддерживает асинхронные генераторы:

=== "CJS"

    ```cjs
    const { pipeline } = require('node:stream/promises');
    const fs = require('node:fs');

    async function run() {
    	await pipeline(
    		fs.createReadStream('lowercase.txt'),
    		async function* (source, { signal }) {
    			source.setEncoding('utf8'); // Работаем со строками, а не с `буфером`.
    			for await (const chunk of source) {
    				yield await processChunk(chunk, { signal });
    			}
    		},
    		fs.createWriteStream('uppercase.txt')
    	);
    	console.log('Pipeline succeeded.');
    }

    run().catch(console.error);
    ```

=== "MJS"

    ```mjs
    import { pipeline } from 'node:stream/promises';
    import fs from 'node:fs';
    await pipeline(async function* ({ signal }) {
    	await someLongRunningfn({ signal });
    	yield 'asd';
    }, fs.createWriteStream('uppercase.txt'));
    console.log('Pipeline succeeded.');
    ```

API `pipeline` предоставляет [версию обратного вызова](#streampipeline):

<!-- 0005.part.md -->

### stream.finished

```js
stream.finished(stream[, options])
```

-   `stream` [`<Stream>`](stream.md#stream)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `error` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Undefined_type)
    -   `readable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Undefined_type)
    -   `writable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Undefined_type)
    -   `сигнал`: [`<AbortSignal>`](globals.md#abortsignal) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Undefined_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется, когда поток больше не доступен для чтения или записи.

<!-- конец списка -->

=== "CJS"

    ```cjs
    const { finished } = require('node:stream/promises');
    const fs = require('node:fs');

    const rs = fs.createReadStream('archive.tar');

    async function run() {
    	await finished(rs);
    	console.log('Поток закончил чтение.');
    }

    run().catch(console.error);
    rs.resume(); // Слить поток.
    ```

=== "MJS"

    ```mjs
    import { finished } from 'node:stream/promises';
    import { createReadStream } from 'node:fs';

    const rs = createReadStream('archive.tar');

    async function run() {
    	await finished(rs);
    	console.log('Поток закончил чтение.');
    }

    run().catch(console.error);
    rs.resume(); // Слить поток.
    ```

API `finished` предоставляет [версию обратного вызова](#streamfinished):

<!-- 0006.part.md -->

### Объектный режим

Все потоки, создаваемые API Node.js, работают исключительно со строками и объектами `Buffer` (или `Uint8Array`). Однако, возможно, что реализация потоков может работать с другими типами значений JavaScript (за исключением `null`, который служит специальной цели в потоках). Такие потоки считаются работающими в "объектном режиме".

Экземпляры потоков переводятся в объектный режим с помощью опции `objectMode` при создании потока. Попытка переключить существующий поток в объектный режим небезопасна.

<!-- 0007.part.md -->

### Буферизация

Потоки [`Writable`](#streamwritable) и [`Readable`](#streamreadable) будут хранить данные во внутреннем буфере.

Объем потенциально буферизуемых данных зависит от параметра `highWaterMark`, передаваемого в конструктор потока. Для обычных потоков опция `highWaterMark` определяет общее количество байт. Для потоков, работающих в объектном режиме, параметр `highWaterMark` указывает общее количество объектов.

Данные буферизуются в потоках `Readable`, когда реализация вызывает [`stream.push(chunk)`](#readablepush). Если потребитель потока не вызывает [`stream.read()`](#readableread), данные будут находиться во внутренней очереди, пока не будут потреблены.

Когда общий размер внутреннего буфера чтения достигнет порога, заданного параметром `highWaterMark`, поток временно прекратит чтение данных из базового ресурса, пока данные, находящиеся в буфере, не будут потреблены (то есть поток перестанет вызывать внутренний метод [`readable._read()`](#readable_read), который используется для заполнения буфера чтения).

Буферизация данных в потоках `Writable` происходит при многократном вызове метода [`writable.write(chunk)`](#writablewrite). Пока общий размер внутреннего буфера записи ниже порога, установленного `highWaterMark`, вызовы `writable.write()` будут возвращать `true`. Как только размер внутреннего буфера достигнет или превысит `highWaterMark`, будет возвращена `false`.

Ключевой целью API `stream`, в частности метода [`stream.pipe()`](#readablepipe), является ограничение буферизации данных до приемлемого уровня, чтобы источники и пункты назначения с разной скоростью не перегружали доступную память.

Опция `highWaterMark` - это порог, а не предел: она определяет количество данных, которое поток буферизирует, прежде чем перестанет запрашивать больше данных. Она не обеспечивает жесткого ограничения памяти в целом. Конкретные реализации потоков могут выбрать более строгие ограничения, но это необязательно.

Поскольку потоки [`Duplex`](#streamduplex) и [`Transform`](#streamtransform) являются одновременно `Readable` и `Writable`, каждый из них поддерживает _два_ отдельных внутренних буфера, используемых для чтения и записи, что позволяет каждой стороне работать независимо от другой, поддерживая при этом соответствующий и эффективный поток данных. Например, экземпляры [`net.Socket`](net.md#class-netsocket) представляют собой [`Duplex`](#streamduplex) потоки, чья `Readable` сторона позволяет потреблять данные, полученные _из_ сокета, и чья `Writable` сторона позволяет записывать данные _в_ сокет. Поскольку данные могут записываться в сокет быстрее или медленнее, чем приниматься, каждая сторона должна работать (и буферизироваться) независимо от другой.

Механика внутренней буферизации является внутренней деталью реализации и может быть изменена в любое время. Однако для некоторых продвинутых реализаций внутренние буферы могут быть r

<!-- 0008.part.md -->

## API для потребителей потоков

Почти все приложения Node.js, независимо от того, насколько они просты, в той или иной мере используют потоки. Ниже приведен пример использования потоков в приложении Node.js, реализующем HTTP-сервер:

```js
const http = require('node:http');

const server = http.createServer((req, res) => {
    // `req` - это http.IncomingMessage, который является читаемым потоком.
    // `res` - это http.ServerResponse, который является записываемым потоком.

    let body = '';
    // Получаем данные в виде строк utf8.
    // Если кодировка не задана, будут получены объекты Buffer.
    req.setEncoding('utf8');

    // Читаемые потоки испускают события 'data' после добавления слушателя.
    req.on('data', (chunk) => {
        body += chunk;
    });

    // Событие 'end' означает, что все тело было получено.
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            // Записываем обратно что-нибудь интересное для пользователя:
            res.write(typeof data);
            res.end();
        } catch (er) {
            // ой! плохой json!
            res.statusCode = 400;
            return res.end(`error: ${er.message}`);
        }
    });
});

server.listen(1337);

// $ curl localhost:1337 -d "{}"
// объект
// $ curl localhost:1337 -d "\"foo\""
// строка
// $ curl localhost:1337 -d "not json"
// ошибка: Unexpected token 'o', "not json" is not valid JSON
```

[`Writable`](#streamwritable) потоки (такие как `res` в примере) раскрывают такие методы как `write()` и `end()`, которые используются для записи данных в поток.

Потоки [`Readable`](#streamreadable) используют API [`EventEmitter`](events.md#class-eventemitter) для уведомления кода приложения, когда данные доступны для чтения из потока. Эти доступные данные могут быть считаны из потока несколькими способами.

Потоки [`Writable`](#streamwritable) и [`Readable`](#streamreadable) используют API [`EventEmitter`](events.md#class-eventemitter) различными способами для передачи текущего состояния потока.

Потоки [`Duplex`](#streamduplex) и [`Transform`](#streamtransform) являются одновременно [`Writable`](#streamwritable) и [`Readable`](#streamreadable).

Приложениям, которые записывают данные в поток или потребляют данные из потока, не требуется реализовывать интерфейсы потоков напрямую, и у них, как правило, нет причин вызывать `require('node:stream')`.

Разработчики, желающие реализовать новые типы потоков, должны обратиться к разделу "API для реализаторов потоков".

<!-- 0009.part.md -->

### Записываемые потоки

Записываемые потоки - это абстракция для _назначения_, в которое записываются данные.

Примеры [`Writable`](#streamwritable) потоков включают:

-   [HTTP-запросы, на клиенте](http.md#class-httpclientrequest)
-   [HTTP ответы, на сервере](http.md#class-httpserverresponse)
-   [потоки записи fs](fs.md#class-fswritestream)
-   [потоки zlib](zlib.md)
-   [crypto streams](crypto.md)
-   [TCP сокеты](net.md#class-netsocket)
-   [stdin дочернего процесса](child_process.md#subprocessstdin)
-   [`process.stdout`](process.md#processstdout), [`process.stderr`](process.md#processstderr)

Некоторые из этих примеров на самом деле являются потоками [`Duplex`](#streamduplex), которые реализуют интерфейс [`Writable`](#streamwritable).

Все потоки [`Writable`](#streamwritable) реализуют интерфейс, определенный классом `stream.Writable`.

Хотя конкретные экземпляры потоков [`Writable`](#streamwritable) могут различаться различными способами, все потоки `Writable` следуют одной и той же основной схеме использования, как показано в примере ниже:

```js
const myStream = getWritableStreamSomehow();
myStream.write('некоторые данные');
myStream.write('еще немного данных');
myStream.end('закончил запись данных');
```

<!-- 0010.part.md -->

#### stream.Writable

<!-- 0011.part.md -->

##### Событие: close

Событие `'close'` генерируется, когда поток и любой из его базовых ресурсов (например, дескриптор файла) закрыты. Это событие указывает на то, что больше не будет испускаться никаких событий, и никаких дальнейших вычислений не будет.

Поток [`Writable`](#streamwritable) всегда будет испускать событие `close`, если он создан с опцией `emitClose`.

<!-- 0012.part.md -->

##### Событие: drain

Если вызов [`stream.write(chunk)`](#writablewrite) возвращает `false`, событие `'drain'` будет выдано, когда будет уместно возобновить запись данных в поток.

```js
// Записываем данные в предоставленный поток с возможностью записи миллион раз.
// Будьте внимательны к обратному давлению.
function writeOneMillionTimes(
    writer,
    data,
    encoding,
    callback
) {
    let i = 1000000;
    write();
    function write() {
        let ok = true;
        do {
            i--;
            if (i === 0) {
                // Последний раз!
                writer.write(data, encoding, callback);
            } else {
                // Узнайте, должны ли мы продолжить или подождать.
                // Не передавайте обратный вызов, потому что мы еще не закончили.
                ok = writer.write(data, encoding);
            }
        } while (i > 0 && ok);
        if (i > 0) {
            // Пришлось остановиться раньше времени!
            // Напишем еще немного, когда все стечет.
            writer.once('drain', write);
        }
    }
}
```

<!-- 0013.part.md -->

##### Событие: error

-   [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Событие `'error'` генерируется, если во время записи или передачи данных произошла ошибка. При вызове обратного вызова слушателя ему передается единственный аргумент `Error`.

Поток закрывается при возникновении события `'error'`, если только опция [`autoDestroy`](#new-streamwritable) не была установлена в `false` при создании потока.

После `error` больше не должно происходить никаких событий, кроме `close` (включая события `error`).

<!-- 0014.part.md -->

##### Событие: finish

Событие `finish` возникает после вызова метода [`stream.end()`](#writableend), и все данные были переданы в базовую систему.

```js
const writer = getWritableStreamSomehow();
for (let i = 0; i < 100; i++) {
    writer.write(`hello, #${i}!\n`);
}
writer.on('finish', () => {
    console.log('Все записи завершены');
});
writer.end('Это конец\n');
```

<!-- 0015.part.md -->

##### Событие: pipe

-   `src` [`<stream.Readable>`](stream.md#streamreadable) исходный поток, который передается по трубопроводу в этот объект записи

Событие `pipe` возникает, когда метод [`stream.pipe()`](#readablepipe) вызывается на потоке readable, добавляя этот writable к его набору пунктов назначения.

```js
const writer = getWritableStreamSomehow();
const reader = getReadableStreamSomehow();
writer.on('pipe', (src) => {
    console.log('Что-то передается в писатель');
    assert.equal(src, reader);
});
reader.pipe(writer);
```

<!-- 0016.part.md -->

##### Событие: unpipe

-   `src` [`<stream.Readable>`](stream.md#streamreadable) Исходный поток, который [unpipeed](#readableunpipe) этот writable

Событие `unpipe` испускается, когда метод [`stream.unpipe()`](#readableunpipe) вызывается на потоке [`Readable`](#streamreadable), удаляя этот [`Writable`](#streamwritable) из его набора пунктов назначения.

Это также происходит в случае, если этот поток [`Writable`](#streamwritable) выдает ошибку при передаче в него потока [`Readable`](#streamreadable).

```js
const writer = getWritableStreamSomehow();
const reader = getReadableStreamSomehow();
writer.on('unpipe', (src) => {
    console.log('Что-то перестало поступать в писатель');
    assert.equal(src, reader);
});
reader.pipe(writer);
reader.unpipe(writer);
```

<!-- 0017.part.md -->

##### writable.cork

```js
writable.cork();
```

Метод `writable.cork()` заставляет все записанные данные буферизироваться в памяти. Буферизованные данные будут удалены при вызове методов [`stream.uncork()`](#writableuncork) или [`stream.end()`](#writableend).

Основная цель метода `writable.cork()` - приспособиться к ситуации, когда в поток записывается несколько небольших фрагментов в быстрой последовательности. Вместо того, чтобы немедленно пересылать их по назначению, `writable.cork()` буферизирует все куски до вызова `writable.uncork()`, который передаст их все в `writable._writev()`, если таковой имеется. Это предотвращает ситуацию блокировки в голове строки, когда данные буферизируются в ожидании обработки первого небольшого фрагмента. Однако использование `writable.cork()` без реализации `writable._writev()` может негативно сказаться на пропускной способности.

См. также: [`writable.uncork()`](#writableuncork), [`writable._writev()`](#writable_writev).

<!-- 0018.part.md -->

##### writable.destroy

```js
writable.destroy([error]);
```

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Необязательно, ошибка, которую нужно выдать с событием `'error'`.
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожить поток. Опционально выдает событие `'error'` и выдает событие `'close'` (если `emitClose` не установлено в `false`). После этого вызова поток, доступный для записи, завершен, и последующие вызовы `write()` или `end()` приведут к ошибке `ERR_STREAM_DESTROYED`. Это деструктивный и немедленный способ уничтожения потока. Предыдущие вызовы `write()` могут не уничтожить поток и вызвать ошибку `ERR_STREAM_DESTROYED`. Используйте `end()` вместо destroy, если данные должны быть удалены до закрытия, или дождитесь события `'drain'` перед уничтожением потока.

```js
const { Writable } = require('node:stream');

const myStream = new Writable();

const fooErr = new Error('ошибка foo');
myStream.destroy(fooErr);
myStream.on('error', (fooErr) =>
    console.error(fooErr.message)
); // ошибка foo
```

---

```js
const { Writable } = require('node:stream');

const myStream = new Writable();

myStream.destroy();
myStream.on('error', function wontHappen() {});
```

---

```js
const { Writable } = require('node:stream');

const myStream = new Writable();
myStream.destroy();

myStream.write('foo', (error) => console.error(error.code));
// ERR_STREAM_DESTROYED
```

После вызова `destroy()` любые дальнейшие вызовы будут бесполезны, и никакие другие ошибки, кроме `_destroy()`, не могут быть выданы как `'error'`.

Реализаторы не должны переопределять этот метод, а вместо этого реализовать [`writable._destroy()`](#writable_destroy).

<!-- 0019.part.md -->

##### writable.closed

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true` после испускания `close`.

<!-- 0020.part.md -->

##### writable.destroyed

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true` после вызова [`writable.destroy()`](#writabledestroy).

```js
const { Writable } = require('node:stream');

const myStream = new Writable();

console.log(myStream.destroyed); // false
myStream.destroy();
console.log(myStream.destroyed); // true
```

<!-- 0021.part.md -->

##### writable.end

```js
writable.end([chunk[, encoding]][, callback])
```

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Необязательные данные для записи. Для потоков, не работающих в объектном режиме, `chunk` должен быть строкой, `Buffer` или `Uint8Array`. Для потоков, работающих в объектном режиме, `chunk` может быть любым значением JavaScript, кроме `null`.
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка, если `chunk` является строкой.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обратный вызов для завершения потока.
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Вызов метода `writable.end()` сигнализирует о том, что данные больше не будут записываться в [`Writable`](#streamwritable). Необязательные аргументы `chunk` и `encoding` позволяют записать последний дополнительный фрагмент данных непосредственно перед закрытием потока.

Вызов метода [`stream.write()`](#writablewrite) после вызова [`stream.end()`](#writableend) приведет к ошибке.

```js
// Напишите 'hello, ', а затем закончите 'world!'.
const fs = require('node:fs');
const file = fs.createWriteStream('example.txt');
file.write('hello, ');
file.end('world!');
// Писать больше сейчас запрещено!
```

<!-- 0022.part.md -->

##### writable.setDefaultEncoding

```js
writable.setDefaultEncoding(encoding);
```

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Новая кодировка по умолчанию
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Метод `writable.setDefaultEncoding()` устанавливает `кодировку по умолчанию` для потока [`Writable`](#streamwritable).

<!-- 0023.part.md -->

##### writable.uncork

```js
writable.uncork();
```

Метод `writable.uncork()` очищает все данные, буферизованные с момента вызова [`stream.cork()`](#writablecork).

При использовании [`writable.cork()`](#writablecork) и `writable.uncork()` для управления буферизацией записей в поток, отложите вызов `writable.uncork()` с помощью `process.nextTick()`. Это позволяет выполнять пакетную обработку всех вызовов `writable.write()`, которые происходят в данной фазе цикла событий Node.js.

```js
stream.cork();
stream.write('some ');
stream.write('data ');
process.nextTick(() => stream.uncork());
```

Если метод [`writable.cork()`](#writablecork) вызывается несколько раз на потоке, то такое же количество вызовов `writable.uncork()` должно быть вызвано для промывки буферизованных данных.

```js
stream.cork();
stream.write('some ');
stream.cork();
stream.write('data ');
process.nextTick(() => {
    stream.uncork();
    // Данные не будут удалены до тех пор, пока функция uncork() не будет вызвана во второй раз.
    stream.uncork();
});
```

См. также: [`writable.cork()`](#writablecork).

<!-- 0024.part.md -->

##### writable.writable

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true`, если безопасно вызывать [`writable.write()`](#writablewrite), что означает, что поток не был уничтожен, ошибочен или завершен.

<!-- 0025.part.md -->

##### writable.writableAborted

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает, был ли поток уничтожен или ошибочен перед выдачей `'finish'`.

<!-- 0026.part.md -->

##### writable.writableEnded

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true` после вызова [`writable.end()`](#writableend). Это свойство не указывает, были ли данные выгружены, для этого используйте [`writable.writableFinished`](#writablewritablefinished).

<!-- 0027.part.md -->

##### writable.writableCorked

-   [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Количество раз, которое необходимо вызвать [`writable.uncork()`](#writableuncork), чтобы полностью откупорить поток.

<!-- 0028.part.md -->

##### writable.errored

-   [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Возвращает ошибку, если поток был уничтожен с ошибкой.

<!-- 0029.part.md -->

##### writable.writableFinished

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Устанавливается в `true` непосредственно перед испусканием события `'finish'`.

<!-- 0030.part.md -->

##### writable.writableHighWaterMark

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает значение `highWaterMark`, переданное при создании этой `writable`.

<!-- 0031.part.md -->

##### writable.writableLength

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Это свойство содержит количество байтов (или объектов) в очереди, готовых к записи. Значение предоставляет данные интроспекции относительно состояния `highWaterMark`.

<!-- 0032.part.md -->

##### writable.writableNeedDrain

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true`, если буфер потока был заполнен и поток будет издавать сигнал `'drain'`.

<!-- 0033.part.md -->

##### writable.writableObjectMode

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Получатель для свойства `objectMode` данного потока `Writable`.

<!-- 0034.part.md -->

##### writable.write

```js
writable.write(chunk[, encoding][, callback])
```

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Необязательные данные для записи. Для потоков, не работающих в объектном режиме, `chunk` должен быть строкой, `Buffer` или `Uint8Array`. Для потоков, работающих в объектном режиме, `chunk` может быть любым значением JavaScript, кроме `null`.
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type) Кодировка, если `chunk` является строкой. **По умолчанию:** `'utf8'`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обратный вызов, когда этот фрагмент данных будет удален.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false`, если поток желает, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

Метод `writable.write()` записывает некоторые данные в поток и вызывает предоставленный `callback`, когда данные будут полностью обработаны. Если произошла ошибка, будет вызван `callback` с ошибкой в качестве первого аргумента. Вызов `callback` происходит асинхронно и до того, как будет выдана `'error'`.

Возвращаемое значение равно `true`, если внутренний буфер меньше, чем `highWaterMark`, настроенный при создании потока после приема `chunk`. Если возвращается `false`, дальнейшие попытки записи данных в поток должны быть прекращены до тех пор, пока не произойдет событие `'drain'`.

Пока поток не осушен, вызовы `write()` будут буферизировать `chunk` и возвращать `false`. Когда все текущие буферизованные фрагменты будут осушены (приняты операционной системой для доставки), произойдет событие `'drain'`. Если `write()` возвращает `false`, не записывайте больше чанков, пока не произойдет событие `'drain'`. Хотя вызов `write()` на потоке, который не осушается, разрешен, Node.js будет буферизировать все записанные фрагменты до тех пор, пока не произойдет максимальное использование памяти, после чего произойдет безусловное прерывание. Даже до прерывания, высокое использование памяти приведет к плохой работе сборщика мусора и высокой RSS (которая обычно не возвращается в систему, даже после того, как память больше не требуется). Поскольку TCP-сокеты могут никогда не разряжаться, если удаленный пир не читает данные, запись в сокет, который не разряжается, может привести к уязвимости, которую можно использовать удаленно.

Запись данных, пока поток не иссякает, особенно проблематична для [`Transform`](#streamtransform), поскольку потоки `Transform` по умолчанию приостанавливаются до тех пор, пока они не будут переданы по трубопроводу или не будет добавлен обработчик событий `data` или `readable`.

Если данные для записи могут быть сгенерированы или получены по требованию, рекомендуется инкапсулировать логику в [`Readable`](#streamreadable) и использовать [`stream.pipe()`](#readablepipe). Однако, если вызов `write()` предпочтительнее, можно соблюсти обратное давление и избежать проблем с памятью, используя событие `'drain'`:

```js
function write(data, cb) {
    if (!stream.write(data)) {
        stream.once('drain', cb);
    } else {
        process.nextTick(cb);
    }
}

// Wait for cb to be called before doing any other write.
write('hello', () => {
    console.log('Write completed, do more writes now.');
});
```

Поток `Writable` в объектном режиме всегда будет игнорировать аргумент `encoding`.

<!-- 0035.part.md -->

### Читаемые потоки

Читаемые потоки - это абстракция для _источника_, из которого потребляются данные.

Примеры `Readable` потоков включают:

-   [HTTP ответы, на клиенте](http.md#class-httpincomingmessage)
-   [HTTP-запросы, на сервере](http.md#class-httpincomingmessage)
-   [потоки чтения fs](fs.md#class-fsreadstream)
-   [потоки zlib](zlib.md)
-   [crypto streams](crypto.md)
-   [TCP сокеты](net.md#class-netsocket)
-   [stdout и stderr дочернего процесса](child_process.md#subprocessstdout)
-   [`process.stdin`](process.md#processstdin)

Все потоки [`Readable`](#streamreadable) реализуют интерфейс, определенный классом `stream.Readable`.

<!-- 0036.part.md -->

#### Два режима чтения

Потоки `Readable` эффективно работают в одном из двух режимов: текущем и приостановленном. Эти режимы отличаются от объектного режима. Поток [`Readable`](#streamreadable) может быть в объектном режиме или нет, независимо от того, находится ли он в потоковом режиме или в режиме паузы.

-   В режиме потока данные считываются из базовой системы автоматически и предоставляются приложению как можно быстрее с помощью событий через интерфейс [`EventEmitter`](events.md#class-eventemitter).
-   В режиме паузы для чтения фрагментов данных из потока необходимо явно вызывать метод [`stream.read()`](#readableread).

Все потоки [`Readable`](#streamreadable) начинаются в режиме паузы, но могут быть переключены в режим потока одним из следующих способов:

-   Добавление обработчика события `'data'`.
-   Вызов метода [`stream.resume()`](#readableresume).
-   Вызов метода [`stream.pipe()`](#readablepipe) для отправки данных на [`Writable`](#streamwritable).

`Readable` может переключиться обратно в режим паузы, используя одно из следующих действий:

-   Если нет мест назначения, вызвав метод [`stream.pause()`](#readablepause).
-   Если есть места назначения труб, то путем удаления всех мест назначения труб. Несколько мест назначения труб можно удалить, вызвав метод [`stream.unpipe()`](#readableunpipe).

Важно помнить, что `Readable` не будет генерировать данные, пока не будет предоставлен механизм для потребления или игнорирования этих данных. Если механизм потребления отключен или убран, `Readable` будет _пытаться_ прекратить генерировать данные.

По причинам обратной совместимости, удаление обработчиков событий `'data'` **не** будет автоматически приостанавливать поток. Кроме того, если есть конечные пункты назначения, то вызов [`stream.pause()`](#readablepause) не гарантирует, что поток _останется_ приостановленным, когда эти пункты назначения иссякнут и запросят больше данных.

Если [`Readable`](#streamreadable) переключается в режим потока и нет потребителей, доступных для обработки данных, эти данные будут потеряны. Это может произойти, например, когда метод `readable.resume()` вызывается без слушателя, присоединенного к событию `'data'`, или когда обработчик события `'data'` удаляется из потока.

Добавление обработчика события `'readable'` автоматически прекращает поток, и данные должны быть потреблены через [`readable.read()`](#readableread). Если обработчик события `'readable'` удален, то поток снова начнет течь, если есть обработчик события `'data'`.

<!-- 0037.part.md -->

#### Три состояния

Два режима работы потока `Readable` - это упрощенная абстракция для более сложного внутреннего управления состояниями, которое происходит в реализации потока `Readable`.

В частности, в любой момент времени каждый `Readable` находится в одном из трех возможных состояний:

-   `readable.readableFlowing === null`
-   `readable.readableFlowing === false`
-   `readable.readableFlowing === true`.

Когда `readable.readableFlowing` имеет значение `null`, механизм потребления данных потока не предусмотрен. Поэтому поток не будет генерировать данные. В этом состоянии прикрепление слушателя для события `'data'`, вызов метода `readable.pipe()` или вызов метода `readable.resume()` переключит `readable.readableFlowing` в `true`, заставляя `Readable` начать активно генерировать события по мере генерации данных.

Вызов `readable.pause()`, `readable.unpipe()` или получение обратного давления приведет к тому, что `readable.readableFlowing` будет установлен как `false`, временно останавливая поток событий, но _не_ останавливая генерацию данных. Находясь в этом состоянии, прикрепление слушателя для события `'data'` не переключит `readable.readableFlowing` в `true`.

```js
const { PassThrough, Writable } = require('node:stream');
const pass = new PassThrough();
const writable = new Writable();

pass.pipe(writable);
pass.unpipe(writable);
// readableFlowing теперь false.

pass.on('data', (chunk) => {
    console.log(chunk.toString());
});
// readableFlowing все еще ложно.
pass.write('ok'); // Не будет выдавать 'data'.
pass.resume(); // Должен быть вызван, чтобы поток выдал 'данные'.
// readableFlowing теперь истина.
```

Пока `readable.readableFlowing` имеет значение `false`, данные могут накапливаться во внутреннем буфере потока.

<!-- 0038.part.md -->

#### Выберите один стиль API

API потока `Readable` развивался на протяжении нескольких версий Node.js и предоставляет несколько методов потребления данных потока. В целом, разработчики должны выбрать _один_ из методов потребления данных и _никогда_ не должны использовать несколько методов для потребления данных из одного потока. В частности, использование комбинации `on('data')`, `on('readable')`, `pipe()` или асинхронных итераторов может привести к неинтуитивному поведению.

<!-- 0039.part.md -->

#### stream.Readable

<!-- 0040.part.md -->

##### Событие: close

Событие `close` генерируется, когда поток и любой из его базовых ресурсов (например, дескриптор файла) закрыты. Это событие указывает на то, что больше не будет испускаться никаких событий, и никаких дальнейших вычислений не будет.

Поток [`Readable`](#streamreadable) всегда будет испускать событие `close`, если он создан с опцией `emitClose`.

<!-- 0041.part.md -->

##### Событие: data

-   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Кусок данных. Для потоков, не работающих в объектном режиме, чанк будет либо строкой, либо `буфером`. Для потоков, работающих в объектном режиме, чанк может быть любым значением JavaScript, кроме `null`.

Событие `'data'` генерируется всякий раз, когда поток передает право собственности на кусок данных потребителю. Это может происходить всякий раз, когда поток переключается в режим потока, вызывая `readable.pipe()`, `readable.resume()` или присоединяя обратный вызов слушателя к событию `'data'`. Событие `'data'` также будет возникать всякий раз, когда вызывается метод `readable.read()` и фрагмент данных доступен для возврата.

Прикрепление слушателя события `'data'` к потоку, который не был явно приостановлен, переключит поток в режим потока. Данные будут передаваться, как только они станут доступны.

В обратный вызов слушателя будет передан фрагмент данных в виде строки, если для потока была задана кодировка по умолчанию с помощью метода `readable.setEncoding()`; в противном случае данные будут переданы в виде `Buffer`.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
    console.log(`Принято ${chunk.length} байт данных.`);
});
```

<!-- 0042.part.md -->

##### Событие: end

Событие `'end'` происходит, когда больше нет данных для потребления из потока.

Событие `'end'` **не будет вызвано**, пока данные не будут полностью израсходованы. Этого можно добиться, переключив поток в режим потока, или вызывая [`stream.read()`](#readableread) несколько раз, пока все данные не будут потреблены.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
    console.log(`Получено ${chunk.length} байт данных.`);
});
readable.on('end', () => {
    console.log('Больше данных не будет.');
});
```

<!-- 0043.part.md -->

##### Событие: error

-   [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Событие `'error'` может быть вызвано реализацией `Readable` в любое время. Как правило, это может произойти, если базовый поток не может генерировать данные из-за внутреннего сбоя или когда реализация потока пытается передать недопустимый фрагмент данных.

Обратному вызову слушателя будет передан единственный объект `Error`.

<!-- 0044.part.md -->

##### Событие: pause

Событие `pause` происходит, когда вызывается [`stream.pause()`](#readablepause) и `readableFlowing` не равно `false`.

<!-- 0045.part.md -->

##### Событие: readable

Событие `'readable'` генерируется, когда из потока доступны данные для чтения или когда достигнут конец потока. По сути, событие `'readable'` указывает на то, что в потоке есть новая информация. Если данные доступны, [`stream.read()`](#readableread) вернет эти данные.

```js
const readable = getReadableStreamSomehow();
readable.on('readable', function () {
    // Теперь есть некоторые данные для чтения.
    let data;

    while ((data = this.read()) !== null) {
        console.log(data);
    }
});
```

Если достигнут конец потока, вызов [`stream.read()`](#readableread) вернет `null` и вызовет событие `'end'`. Это также верно, если никогда не было данных для чтения. Например, в следующем примере `foo.txt` является пустым файлом:

```js
const fs = require('node:fs');
const rr = fs.createReadStream('foo.txt');
rr.on('readable', () => {
    console.log(`readable: ${rr.read()}`);
});
rr.on('end', () => {
    console.log('end');
});
```

Результатом выполнения этого скрипта будет:

```console
$ node test.js
readable: null
end
```

В некоторых случаях прикрепление слушателя для события `'readable'` приведет к считыванию некоторого количества данных во внутренний буфер.

В целом, механизмы событий `readable.pipe()` и `'data'` проще для понимания, чем событие `'readable'`. Однако обработка `'readable'` может привести к увеличению пропускной способности.

Если одновременно используются `readable` и `'data'`, `'readable'` имеет приоритет в управлении потоком, т. е. `'data'` будет выдаваться только при вызове [`stream.read()`](#readableread). Свойство `readableFlowing` станет `false`. Если есть слушатели `'data'`, когда `'readable'` будет удалено, поток начнет течь, т. е. события `'data'` будут испускаться без вызова `.resume()`.

<!-- 0046.part.md -->

##### Событие: resume

Событие `'resume'` происходит, когда вызывается [`stream.resume()`](#readableresume) и `readableFlowing` не является `true`.

<!-- 0047.part.md -->

##### readable.destroy

```js
readable.destroy([error]);
```

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Ошибка, которая будет передана в качестве полезной нагрузки в событии `'error'`.
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожить поток. Опционально испускает событие `'error'` и испускает событие `'close'` (если `emitClose` не установлено в `false`). После этого вызова читаемый поток освободит все внутренние ресурсы, и последующие вызовы `push()` будут игнорироваться.

После вызова `destroy()` все последующие вызовы будут бесполезны, и никакие другие ошибки, кроме `_destroy()`, не могут быть выданы как `'error'`.

Реализаторы не должны переопределять этот метод, а вместо этого реализовать [`readable._destroy()`](#readable_destroy).

<!-- 0048.part.md -->

##### readable.closed

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true` после испускания `close`.

<!-- 0049.part.md -->

##### readable.destroyed

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true` после вызова [`readable.destroy()`](#readabledestroy).

<!-- 0050.part.md -->

##### readable.isPaused

```js
readable.isPaused();
```

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Метод `readable.isPaused()` возвращает текущее рабочее состояние `Readable`. Он используется в основном механизмом, который лежит в основе метода `readable.pipe()`. В большинстве типичных случаев нет причин использовать этот метод напрямую.

```js
const readable = new stream.Readable();

readable.isPaused(); // === false
readable.pause();
readable.isPaused(); // === true
readable.resume();
readable.isPaused(); // === false
```

<!-- 0051.part.md -->

##### readable.pause

```js
readable.pause();
```

-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Метод `readable.pause()` заставит поток в режиме потока прекратить испускать события `'data'`, переходя из режима потока. Любые данные, которые становятся доступными, остаются во внутреннем буфере.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
    console.log(`Получено ${chunk.length} байт данных.`);
    readable.pause();
    console.log(
        'Дополнительных данных не будет в течение 1 секунды.'
    );
    setTimeout(() => {
        console.log(
            'Теперь данные начнут поступать снова.'
        );
        readable.resume();
    }, 1000);
});
```

Метод `readable.pause()` не имеет эффекта, если существует слушатель событий `'readable'`.

<!-- 0052.part.md -->

##### readable.pipe

```js
readable.pipe(destination[, options])
```

-   `destination` [`<stream.Writable>`](stream.md#streamwritable) Место назначения для записи данных
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Опции трубы
    -   `end` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Завершить запись при завершении чтения. **По умолчанию:** `true`.
-   Возвращает: [`<stream.Writable>`](stream.md#streamwritable) конечный пункт, позволяющий создавать цепочку труб, если это поток [`Duplex`](#streamduplex) или [`Transform`](#streamtransform).

Метод `readable.pipe()` присоединяет поток [`Writable`](#streamwritable) к `readable`, заставляя его автоматически переключаться в режим потока и передавать все свои данные в присоединенный [`Writable`](#streamwritable). Поток данных будет автоматически управляться таким образом, чтобы конечный поток `Writable` не был перегружен более быстрым потоком `Readable`.

В следующем примере все данные из `readable` передаются в файл с именем `file.txt`:

```js
const fs = require('node:fs');
const readable = getReadableStreamSomehow();
const writable = fs.createWriteStream('file.txt');
// Все данные из readable попадают в 'file.txt'.
readable.pipe(writable);
```

Можно присоединить несколько потоков `Writable` к одному потоку `Readable`.

Метод `readable.pipe()` возвращает ссылку на поток _назначения_, что позволяет создавать цепочки потоков, передаваемых по трубопроводу:

```js
const fs = require('node:fs');
const zlib = require('node:zlib');
const r = fs.createReadStream('file.txt');
const z = zlib.createGzip();
const w = fs.createWriteStream('file.txt.gz');
r.pipe(z).pipe(w);
```

По умолчанию, [`stream.end()`](#writableend) вызывается на конечном `Writable` потоке, когда исходный `Readable` поток испускает `'end'`, так что конечный поток больше не доступен для записи. Чтобы отключить это поведение по умолчанию, опцию `end` можно передать как `false`, в результате чего поток назначения останется открытым:

```js
reader.pipe(writer, { end: false });
reader.on('end', () => {
    writer.end('Goodbye\n');
});
```

Важной оговоркой является то, что если поток `Readable` выдает ошибку во время обработки, направление `Writable` _не закрывается_ автоматически. Если произойдет ошибка, необходимо будет _ручно_ закрыть каждый поток, чтобы предотвратить утечку памяти.

Потоки [`process.stderr`](process.md#processstderr) и [`process.stdout`](process.md#processstdout) `Writable` никогда не закрываются до выхода процесса Node.js, независимо от указанных опций.

<!-- 0053.part.md -->

##### readable.read

```js
readable.read([size]);
```

-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательный аргумент, указывающий, сколько данных нужно прочитать.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type) | [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Метод `readable.read()` считывает данные из внутреннего буфера и возвращает их. Если данные не доступны для чтения, возвращается `null`. По умолчанию данные возвращаются в виде объекта `Buffer`, если только кодировка не была указана с помощью метода `readable.setEncoding()` или поток работает в объектном режиме.

Необязательный аргумент `size` задает определенное количество байт для чтения. Если `size` байт недоступен для чтения, будет возвращен `null`, _если только_ поток не завершился, в этом случае будут возвращены все данные, оставшиеся во внутреннем буфере.

Если аргумент `size` не указан, будут возвращены все данные, содержащиеся во внутреннем буфере.

Аргумент `size` должен быть меньше или равен 1 GiB.

Метод `readable.read()` следует вызывать только на потоках `Readable`, работающих в приостановленном режиме. В потоковом режиме `readable.read()` вызывается автоматически, пока внутренний буфер не будет полностью опустошен.

```js
const readable = getReadableStreamSomehow();

// 'readable' может быть вызван несколько раз по мере буферизации данных
readable.on('readable', () => {
    let chunk;
    console.log(
        'Stream is readable (новые данные получены в буфер)'
    );
    // Используйте цикл, чтобы убедиться, что мы прочитали все доступные в данный момент данные
    while (null !== (chunk = readable.read())) {
        console.log(
            `Прочитано ${chunk.length} байт данных...`
        );
    }
});

// 'end' будет срабатывать один раз, когда больше не будет данных
readable.on('end', () => {
    console.log('Достигнут конец потока.');
});
```

Каждый вызов `readable.read()` возвращает фрагмент данных или `null`. Куски не конкатенируются. Цикл `while` необходим для потребления всех данных, находящихся в буфере. При чтении большого файла `.read()` может вернуть `null`, израсходовав все буферизованное содержимое, но есть еще больше данных, которые еще не буферизованы. В этом случае новое событие `'readable'` будет выдано, когда в буфере будет больше данных. Наконец, событие `'end'` будет вызвано, когда больше не будет данных.

Поэтому, чтобы прочитать все содержимое файла из `readable`, необходимо собирать фрагменты в несколько событий `'readable'`:

```js
const chunks = [];

readable.on('readable', () => {
    let chunk;
    while (null !== (chunk = readable.read())) {
        chunks.push(chunk);
    }
});

readable.on('end', () => {
    const content = chunks.join('');
});
```

Поток `Readable` в объектном режиме всегда будет возвращать один элемент из вызова [`readable.read(size)`](#readableread), независимо от значения аргумента `size`.

Если метод `readable.read()` возвращает фрагмент данных, также будет выдано событие `'data'`.

Вызов [`stream.read([size])`](#readableread) после того, как было выдано событие `'end'`, вернет `null`. Никакой ошибки во время выполнения не возникнет.

<!-- 0054.part.md -->

##### readable.readable

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true`, если безопасно вызывать [`readable.read()`](#readableread), что означает, что поток не был уничтожен или выдал `'error'` или `'end'`.

<!-- 0055.part.md -->

##### readable.readableAborted

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает, был ли поток уничтожен или ошибочен перед выдачей `'end'`.

<!-- 0056.part.md -->

##### readable.readableDidRead

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает, были ли испущены `данные`.

<!-- 0057.part.md -->

##### readable.readableEncoding

-   [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Получатель свойства `encoding` для данного потока `Readable`. Свойство `encoding` может быть установлено с помощью метода [`readable.setEncoding()`](#readablesetencoding).

<!-- 0058.part.md -->

##### readable.readableEnded

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Становится `true`, когда испускается событие `'end'`.

<!-- 0059.part.md -->

##### readable.errored

-   [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Возвращает ошибку, если поток был уничтожен с ошибкой.

<!-- 0060.part.md -->

##### readable.readableFlowing

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Это свойство отражает текущее состояние потока `Readable`, как описано в разделе [Три состояния](#three-states).

<!-- 0061.part.md -->

##### readable.readableHighWaterMark

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает значение `highWaterMark`, переданное при создании этого `Readable`.

<!-- 0062.part.md -->

##### readable.readableLength

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Это свойство содержит количество байтов (или объектов) в очереди, готовых к чтению. Значение предоставляет данные интроспекции относительно состояния `highWaterMark`.

<!-- 0063.part.md -->

##### readable.readableObjectMode

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Получатель для свойства `objectMode` данного потока `Readable`.

<!-- 0064.part.md -->

##### readable.resume

```js
readable.resume();
```

-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Метод `readable.resume()` заставляет явно приостановленный поток `Readable` возобновить испускание событий `'data'`, переводя поток в режим потока.

Метод `readable.resume()` можно использовать для полного потребления данных из потока без фактической обработки этих данных:

```js
getReadableStreamSomehow()
    .resume()
    .on('end', () => {
        console.log('Достиг конца, но ничего не прочитал.');
    });
```

Метод `readable.resume()` не имеет эффекта, если существует слушатель события `'readable'`.

<!-- 0065.part.md -->

##### readable.setEncoding

```js
readable.setEncoding(encoding);
```

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка, которую следует использовать.
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Метод `readable.setEncoding()` устанавливает кодировку символов для данных, считываемых из потока `Readable`.

По умолчанию кодировка не задается, и данные потока будут возвращаться в виде объектов `Buffer`. Установка кодировки приводит к тому, что данные потока будут возвращаться в виде строк указанной кодировки, а не в виде объектов `Buffer`. Например, вызов `readable.setEncoding('utf8')` приведет к тому, что выходные данные будут интерпретированы как данные UTF-8 и переданы как строки. Вызов `readable.setEncoding('hex')` приведет к тому, что данные будут закодированы в шестнадцатеричном формате строк.

Поток `Readable` будет правильно обрабатывать многобайтовые символы, передаваемые через поток, которые в противном случае были бы неправильно декодированы, если бы просто извлекались из потока как объекты `Buffer`.

```js
const readable = getReadableStreamSomehow();
readable.setEncoding('utf8');
readable.on('data', (chunk) => {
    assert.equal(typeof chunk, 'string');
    console.log(
        'Получено %d символов строковых данных:',
        chunk.length
    );
});
```

<!-- 0066.part.md -->

##### readable.unpipe

```js
readable.unpipe([destination]);
```

-   `destination` [`<stream.Writable>`](stream.md#streamwritable) Необязательный конкретный поток для распайки
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Метод `readable.unpipe()` отсоединяет поток `Writable`, ранее присоединенный с помощью метода [`stream.pipe()`](#readablepipe).

Если `destination` не указан, то отсоединяются _все_ трубы.

Если `назначение` указано, но для него не установлена труба, то метод ничего не делает.

```js
const fs = require('node:fs');
const readable = getReadableStreamSomehow();
const writable = fs.createWriteStream('file.txt');
// Все данные из readable попадают в 'file.txt',
// но только в течение первой секунды.
readable.pipe(writable);
setTimeout(() => {
    console.log('Остановить запись в файл.txt.');
    readable.unpipe(writable);
    console.log('Вручную закрыть поток файлов.');
    writable.end();
}, 1000);
```

<!-- 0067.part.md -->

##### readable.unshift

```js
readable.unshift(chunk[, encoding])
```

-   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type) | [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Кусок данных для выгрузки в очередь чтения. Для потоков, не работающих в объектном режиме, `chunk` должен быть строкой, `Buffer`, `Uint8Array` или `null`. Для потоков, работающих в объектном режиме, `chunk` может быть любым значением JavaScript.
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка кусков строки. Должна быть правильной кодировкой `Buffer`, такой как `'utf8` или `'ascii`.

Передача `chunk` как `null` сигнализирует о конце потока (EOF) и ведет себя так же, как `readable.push(null)`, после чего данные больше не могут быть записаны. Сигнал EOF ставится в конце буфера, и все буферизованные данные все равно будут смыты.

Метод `readable.unshift()` выталкивает фрагмент данных обратно во внутренний буфер. Это полезно в некоторых ситуациях, когда поток потребляется кодом, которому нужно "отменить потребление" некоторого количества данных, которые он оптимистично извлек из источника, чтобы эти данные могли быть переданы другой стороне.

Метод `stream.unshift(chunk)` не может быть вызван после того, как произошло событие `'end'`, иначе будет выдана ошибка времени выполнения.

Разработчикам, часто использующим `stream.unshift()`, следует рассмотреть возможность перехода на использование потока [`Transform`](#streamtransform) вместо этого. Дополнительную информацию смотрите в разделе "API для реализаторов потоков".

```js
// Вытаскиваем заголовок, разделенный \n\n.
// Используем unshift(), если получаем слишком много.
// Вызываем обратный вызов с (error, header, stream).
const { StringDecoder } = require('node:string_decoder');
function parseHeader(stream, callback) {
    stream.on('error', callback);
    stream.on('readable', onReadable);
    const decoder = new StringDecoder('utf8');
    let header = '';
    function onReadable() {
        let chunk;
        while (null !== (chunk = stream.read())) {
            const str = decoder.write(chunk);
            if (str.includes('\n\n')) {
                // Найдена граница заголовка.
                const split = str.split(/\n\n/);
                header += split.shift();
                const remaining = split.join('\n\n');
                const buf = Buffer.from(remaining, 'utf8');
                stream.removeListener('error', callback);
                // Удалите слушателя 'readable' перед разгруппировкой.
                stream.removeListener(
                    'readable',
                    onReadable
                );
                if (buf.length) stream.unshift(buf);
                // Теперь тело сообщения может быть прочитано из потока.
                callback(null, header, stream);
                return;
            }
            // Продолжаем читать заголовок.
            header += str;
        }
    }
}
```

В отличие от [`stream.push(chunk)`](#readablepush), `stream.unshift(chunk)` не завершает процесс чтения, сбрасывая внутреннее состояние потока. Это может привести к неожиданным результатам, если `readable.unshift()` вызывается во время чтения (например, из реализации [`stream._read()`](#readable_read) на пользовательском потоке). После вызова `readable.unshift()` с немедленным [`stream.push('')`](#readablepush) будет сброшен параметр

<!-- 0068.part.md -->

##### readable.wrap

```js
readable.wrap(stream);
```

-   `stream` [`<Stream>`](stream.md#stream) Читаемый поток "старого стиля"
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

До версии Node.js 0.10 потоки не реализовывали весь API модуля `node:stream`, как он определен в настоящее время. (Более подробную информацию смотрите в "Совместимость").

При использовании старой библиотеки Node.js, которая испускает события `'data'` и имеет метод [`stream.pause()`](#readablepause), который является только рекомендательным, метод `readable.wrap()` можно использовать для создания потока [`Readable`](#streamreadable), который использует старый поток в качестве источника данных.

Использование `readable.wrap()` потребуется редко, но метод был предоставлен в качестве удобства для взаимодействия со старыми приложениями и библиотеками Node.js.

```js
const { OldReader } = require('./old-api-module.js');
const { Readable } = require('node:stream');
const oreader = new OldReader();
const myReader = new Readable().wrap(oreader);

myReader.on('readable', () => {
    myReader.read(); // и т.д.
});
```

<!-- 0069.part.md -->

##### readable\[Symbol.asyncIterator\]

```js
readable[Symbol.asyncIterator]();
```

-   Возвращает: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface) для полного потребления потока.

<!-- конец списка -->

```js
const fs = require('node:fs');

async function print(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
        data += chunk;
    }
    console.log(data);
}

print(fs.createReadStream('file')).catch(console.error);
```

Если цикл завершится с `break`, `return` или `throw`, поток будет уничтожен. Другими словами, итерация над потоком будет полностью его потреблять. Поток будет считываться кусками размером, равным параметру `highWaterMark`. В приведенном выше примере данные будут в одном куске, если файл имеет размер менее 64 KiB, потому что опция `highWaterMark` не предоставляется в [`fs.createReadStream()`](fs.md#fscreatereadstreampath-options).

<!-- 0070.part.md -->

##### readable.compose

```js
readable.compose(stream[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `stream` [`<Stream>`](stream.md#stream) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: {Duplex} поток, составленный с потоком `stream`.

<!-- конец списка -->

```js
import { Readable } from 'node:stream';

async function* splitToWords(source) {
    for await (const chunk of source) {
        const words = String(chunk).split(' ');

        for (const word of words) {
            yield word;
        }
    }
}

const wordsStream = Readable.from([
    'this is',
    'compose as operator',
]).compose(splitToWords);
const words = await wordsStream.toArray();

console.log(words); // печатает ['this', 'is', 'compose', 'as', 'operator']
```

Дополнительную информацию смотрите в [`stream.compose`](#streamcompose).

<!-- 0071.part.md -->

##### readable.iterator

```js
readable.iterator([options]);
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `destroyOnReturn` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено значение `false`, вызов `return` на асинхронном итераторе или завершение итерации `for await...of` с помощью `break`, `return` или `throw` не будет уничтожать поток. **По умолчанию:** `true`.
-   Возвращает: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface) для потребления потока.

Итератор, созданный этим методом, дает пользователям возможность отменить уничтожение потока, если цикл `for await...of` будет завершен `return`, `break` или `throw`, или если итератор должен уничтожить поток, если поток выдал ошибку во время итерации.

```js
const { Readable } = require('node:stream');

async function printIterator(readable) {
    for await (const chunk of readable.iterator({
        destroyOnReturn: false,
    })) {
        console.log(chunk); // 1
        break;
    }

    console.log(readable.destroyed); // false

    for await (const chunk of readable.iterator({
        destroyOnReturn: false,
    })) {
        console.log(chunk); // Будет выведено 2, а затем 3
    }

    console.log(readable.destroyed); // True, поток был полностью уничтожен
}

async function printSymbolAsyncIterator(readable) {
    for await (const chunk of readable) {
        console.log(chunk); // 1
        break;
    }

    console.log(readable.destroyed); // true
}

async function showBoth() {
    await printIterator(Readable.from([1, 2, 3]));
    await printSymbolAsyncIterator(
        Readable.from([1, 2, 3])
    );
}

showBoth();
```

<!-- 0072.part.md -->

##### readable.map

```js
readable.map(fn[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | {AsyncFunction} функция для отображения каждого куска данных в потоке.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) прерывается, если поток уничтожается, позволяя прервать вызов `fn` раньше времени.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальное количество одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: {Readable} поток, отображенный с помощью функции `fn`.

Этот метод позволяет выполнять отображение над потоком. Функция `fn` будет вызываться для каждого чанка в потоке. Если функция `fn` возвращает обещание - это обещание будет `ожидаться` перед передачей в поток результатов.

```js
import { Readable } from 'node:stream';
import { Resolver } from 'node:dns/promises';

// С синхронным маппером.
for await (const chunk of Readable.from([1, 2, 3, 4]).map(
    (x) => x * 2
)) {
    console.log(chunk); // 2, 4, 6, 8
}
// С асинхронным маппером, делая не более 2 запросов за раз.
const resolver = new Resolver();
const dnsResults = Readable.from([
    'nodejs.org',
    'openjsf.org',
    'www.linuxfoundation.org',
]).map((domain) => resolver.resolve4(domain), {
    concurrency: 2,
});
for await (const result of dnsResults) {
    console.log(result); // Выводит в журнал DNS-результат resolver.resolve4.
}
```

<!-- 0073.part.md -->

##### readable.filter

```js
readable.filter(fn[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | {AsyncFunction} функция для фильтрации фрагментов из потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) кусок данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) прерывается, если поток уничтожается, позволяя прервать вызов `fn` раньше времени.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальное количество одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: {Readable} поток, отфильтрованный с помощью предиката `fn`.

Этот метод позволяет фильтровать поток. Для каждого куска в потоке будет вызвана функция `fn`, и если она вернет истинное значение, то кусок будет передан в поток результатов. Если функция `fn` возвращает обещание - это обещание будет `ожидаться`.

```js
import { Readable } from 'node:stream';
import { Resolver } from 'node:dns/promises';

// С синхронным предикатом.
for await (const chunk of Readable.from([
    1,
    2,
    3,
    4,
]).filter((x) => x > 2)) {
    console.log(chunk); // 3, 4
}
// С асинхронным предикатом, делая не более 2 запросов за раз.
const resolver = new Resolver();
const dnsResults = Readable.from([
    'nodejs.org',
    'openjsf.org',
    'www.linuxfoundation.org',
]).filter(
    async (domain) => {
        const { address } = await resolver.resolve4(
            domain,
            {
                ttl: true,
            }
        );
        return address.ttl > 60;
    },
    { concurrency: 2 }
);
for await (const result of dnsResults) {
    // Заносит в журнал домены с разрешенной dns-записью более 60 секунд.
    console.log(result);
}
```

<!-- 0074.part.md -->

##### readable.forEach

```js
readable.forEach(fn[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | {AsyncFunction} функция для вызова на каждом фрагменте потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) прерывается, если поток уничтожается, позволяя прервать вызов `fn` раньше времени.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальное количество одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) обещание о завершении потока.

Этот метод позволяет итерировать поток. Для каждого куска в потоке будет вызвана функция `fn`. Если функция `fn` возвращает обещание - это обещание будет `await`.

Этот метод отличается от циклов `for await...of` тем, что он может обрабатывать фрагменты одновременно. Кроме того, итерацию `forEach` можно остановить только передав опцию `signal` и прервав соответствующий `AbortController`, в то время как `for await...of` можно остановить с помощью`break`или`return`. В любом случае поток будет уничтожен.

Этот метод отличается от прослушивания события `'data'` тем, что он использует событие [`readable`](#streamreadable) в базовой машине и может ограничить количество одновременных вызовов `fn`.

```js
import { Readable } from 'node:stream';
import { Resolver } from 'node:dns/promises';

// С синхронным предикатом.
for await (const chunk of Readable.from([
    1,
    2,
    3,
    4,
]).filter((x) => x > 2)) {
    console.log(chunk); // 3, 4
}
// С асинхронным предикатом, делая не более 2 запросов за раз.
const resolver = new Resolver();
const dnsResults = Readable.from([
    'nodejs.org',
    'openjsf.org',
    'www.linuxfoundation.org',
]).map(
    async (domain) => {
        const { address } = await resolver.resolve4(
            domain,
            {
                ttl: true,
            }
        );
        return address;
    },
    { concurrency: 2 }
);
await dnsResults.forEach((result) => {
    // Выводит результат в журнал, аналогично `for await (const result of dnsResults)`.
    console.log(result);
});
console.log('done'); // Поток завершен
```

<!-- 0075.part.md -->

##### readable.toArray

```js
readable.toArray([options]);
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет отменить операцию toArray, если сигнал прерван.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) обещание, содержащее массив с содержимым потока.

Этот метод позволяет легко получить содержимое потока.

Поскольку этот метод считывает весь поток в память, он сводит на нет преимущества потоков. Он предназначен для совместимости и удобства, а не как основной способ потребления потоков.

```js
import { Readable } from 'node:stream';
import { Resolver } from 'node:dns/promises';

await Readable.from([1, 2, 3, 4]).toArray(); // [1, 2, 3, 4]

// Выполняем параллельные dns-запросы с помощью .map и собираем
// результаты в массив с помощью toArray
const dnsResults = await Readable.from([
    'nodejs.org',
    'openjsf.org',
    'www.linuxfoundation.org',
])
    .map(
        async (domain) => {
            const { address } = await resolver.resolve4(
                domain,
                {
                    ttl: true,
                }
            );
            return address;
        },
        { concurrency: 2 }
    )
    .toArray();
```

<!-- 0076.part.md -->

##### readable.some

```js
readable.some(fn[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | {AsyncFunction} функция для вызова на каждом фрагменте потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) прерывается, если поток уничтожается, позволяя прервать вызов `fn` раньше времени.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальное количество одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) обещание, оценивающее `true`, если `fn` вернул истинное значение хотя бы для одного из чанков.

Этот метод похож на `Array.prototype.some` и вызывает `fn` на каждом куске в потоке, пока ожидаемое возвращаемое значение не станет `true` (или любым истинным значением). Как только вызов `fn` на куске, ожидающем возврата значения, становится истинным, поток уничтожается и обещание выполняется с `true`. Если ни один из вызовов `fn` на чанках не возвращает истинное значение, обещание выполняется с `false`.

```js
import { Readable } from 'node:stream';
import { stat } from 'node:fs/promises';

// С синхронным предикатом.
await Readable.from([1, 2, 3, 4]).some((x) => x > 2); // true
await Readable.from([1, 2, 3, 4]).some((x) => x < 0); // false

// С асинхронным предикатом, выполняющим не более 2 проверок файлов за раз.
const anyBigFile = await Readable.from([
    'file1',
    'file2',
    'file3',
]).some(
    async (fileName) => {
        const stats = await stat(fileName);
        return stats.size > 1024 * 1024;
    },
    { concurrency: 2 }
);
console.log(anyBigFile); // `true`, если любой файл в списке больше 1MB
console.log('done'); // Поток завершен
```

<!-- 0077.part.md -->

##### readable.find

```js
readable.find(fn[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | {AsyncFunction} функция для вызова на каждом фрагменте потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) прерывается, если поток уничтожается, позволяя прервать вызов `fn` раньше времени.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальное количество одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) обещание, оценивающее первый чанк, для которого `fn` имеет истинностное значение, или `undefined`, если элемент не был найден.

Этот метод похож на `Array.prototype.find` и вызывает `fn` на каждом куске в потоке, чтобы найти кусок с истинностным значением для `fn`. Как только ожидаемое возвращаемое значение вызова `fn` становится истинным, поток уничтожается, а обещание выполняется значением, для которого `fn` вернул истинное значение. Если все вызовы `fn` в чанках возвращают ложное значение, обещание выполняется с `undefined`.

```js
import { Readable } from 'node:stream';
import { stat } from 'node:fs/promises';

// С синхронным предикатом.
await Readable.from([1, 2, 3, 4]).find((x) => x > 2); // 3
await Readable.from([1, 2, 3, 4]).find((x) => x > 0); // 1
await Readable.from([1, 2, 3, 4]).find((x) => x > 10); // неопределено

// С асинхронным предикатом, выполняющим не более 2 проверок файлов за раз.
const foundBigFile = await Readable.from([
    'file1',
    'file2',
    'file3',
]).find(
    async (fileName) => {
        const stats = await stat(fileName);
        return stats.size > 1024 * 1024;
    },
    { concurrency: 2 }
);
console.log(foundBigFile); // Имя файла большого файла, если какой-либо файл в списке больше 1MB
console.log('done'); // Поток завершен
```

<!-- 0078.part.md -->

##### readable.every

```js
readable.every(fn[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | {AsyncFunction} функция для вызова на каждом куске потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) прерывается, если поток уничтожается, позволяя прервать вызов `fn` раньше времени.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальное количество одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) обещание, оценивающее `true`, если `fn` вернул истинное значение для всех чанков.

Этот метод похож на `Array.prototype.every` и вызывает `fn` на каждом куске в потоке, чтобы проверить, являются ли все ожидаемые возвращаемые значения истинным значением для `fn`. Как только вызов `fn` на чанке, ожидающем возврата значения, оказывается ложным, поток уничтожается, а обещание выполняется с `false`. Если все вызовы `fn` на чанках возвращают истинное значение, обещание выполняется с `true`.

```js
import { Readable } from 'node:stream';
import { stat } from 'node:fs/promises';

// С синхронным предикатом.
await Readable.from([1, 2, 3, 4]).every((x) => x > 2); // false
await Readable.from([1, 2, 3, 4]).every((x) => x > 0); // true

// С асинхронным предикатом, выполняющим не более 2 проверок файлов за раз.
const allBigFiles = await Readable.from([
    'file1',
    'file2',
    'file3',
]).every(
    async (fileName) => {
        const stats = await stat(fileName);
        return stats.size > 1024 * 1024;
    },
    { concurrency: 2 }
);
// `true`, если все файлы в списке больше 1MiB
console.log(allBigFiles);
console.log('done'); // Поток завершен
```

<!-- 0079.part.md -->

##### readable.flatMap

```js
readable.flatMap(fn[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `fn` {Function|AsyncGeneratorFunction|AsyncFunction} функция для отображения каждого куска в потоке.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) прерывается, если поток уничтожается, позволяя прервать вызов `fn` раньше времени.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальное количество одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: {Readable} поток, отображенный с помощью функции `fn`.

Этот метод возвращает новый поток, применяя заданный обратный вызов к каждому фрагменту потока и затем сглаживая результат.

Можно вернуть поток или другую итерабельную или асинхронную итерабельную функцию из `fn`, и потоки результатов будут объединены (сплющены) в возвращаемый поток.

```js
import { Readable } from 'node:stream';
import { createReadStream } from 'node:fs';

// С синхронным маппером.
for await (const chunk of Readable.from([
    1,
    2,
    3,
    4,
]).flatMap((x) => [x, x])) {
    console.log(chunk); // 1, 1, 2, 2, 2, 3, 3, 4, 4
}
// С помощью асинхронного маппера объедините содержимое 4 файлов
const concatResult = Readable.from([
    './1.mjs',
    './2.mjs',
    './3.mjs',
    './4.mjs',
]).flatMap((fileName) => createReadStream(fileName));
for await (const result of concatResult) {
    // Это будет содержать содержимое (все чанки) всех 4 файлов
    console.log(result);
}
```

<!-- 0080.part.md -->

##### readable.drop

```js
readable.drop(limit[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) количество кусков, которые нужно отбросить из читаемого файла.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: {Readable} поток с `лимитом` отброшенных чанков.

Этот метод возвращает новый поток с первым `лимитом` отброшенных кусков.

```js
import { Readable } from 'node:stream';

await Readable.from([1, 2, 3, 4]).drop(2).toArray(); // [3, 4]
```

<!-- 0081.part.md -->

##### readable.take

```js
readable.take(limit[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) количество кусков, которые нужно взять из читаемого файла.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: {Readable} поток с `лимитом` занятых фрагментов.

Этот метод возвращает новый поток с первыми `лимитными` чанками.

```mjs
import { Readable } from 'node:stream';

await Readable.from([1, 2, 3, 4]).take(2).toArray(); // [1, 2]
```

<!-- 0082.part.md -->

##### readable.asIndexedPairs

```js
readable.asIndexedPairs([options]);
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: {Readable} поток индексированных пар.

Этот метод возвращает новый поток с фрагментами базового потока в паре со счетчиком в виде `[index, chunk]`. Первое значение индекса равно 0, и оно увеличивается на 1 для каждого полученного куска.

```js
import { Readable } from 'node:stream';

const pairs = await Readable.from(['a', 'b', 'c'])
    .asIndexedPairs()
    .toArray();
console.log(pairs); // [[0, 'a'], [1, 'b'], [2, 'c']]
```

<!-- 0083.part.md -->

##### readable.reduce

```js
readable.reduce(fn[, initial[, options]])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | {AsyncFunction} функция редуктора для вызова над каждым куском в потоке.
    -   `previous` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) значение, полученное от последнего вызова `fn` или `initial`, если указано, или первый чанк потока в противном случае.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) прерывается, если поток уничтожается, позволяя прервать вызов `fn` раньше времени.
-   `initial` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) начальное значение для использования в сокращении.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток, если сигнал прерван.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) обещание конечного значения редукции.

Этот метод вызывает `fn` на каждом куске потока по порядку, передавая ему результат вычисления на предыдущем элементе. Он возвращает обещание конечного значения редукции.

Функция reducer итерирует поток элемент за элементом, что означает отсутствие параметра `concurrency` или параллелизма. Чтобы выполнить `reduce` параллельно, его можно подключить к методу [`readable.map`](#readablemap).

Если значение `initial` не указано, то в качестве начального значения используется первый кусок потока. Если поток пуст, обещание отклоняется с `TypeError` со свойством кода `ERR_INVALID_ARGS`.

```js
import { Readable } from 'node:stream';

const ten = await Readable.from([1, 2, 3, 4]).reduce(
    (previous, data) => {
        return previous + data;
    }
);
console.log(ten); // 10
```

<!-- 0084.part.md -->

### Дуплекс и преобразование потоков

<!-- 0085.part.md -->

#### stream.Duplex

Двусторонние потоки - это потоки, которые реализуют оба интерфейса [`Readable`](#streamreadable) и [`Writable`](#streamwritable).

Примерами `дуплексных` потоков являются:

-   [TCP сокеты](net.md#class-netsocket)
-   [zlib streams](zlib.md)
-   [crypto streams](crypto.md)

<!-- 0086.part.md -->

##### duplex.allowHalfOpen

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `false`, то поток будет автоматически завершать записываемую сторону, когда заканчивается читаемая сторона. Изначально устанавливается опцией конструктора `allowHalfOpen`, которая по умолчанию имеет значение `true`.

Этот параметр можно изменить вручную, чтобы изменить поведение полуоткрытия существующего экземпляра потока `Duplex`, но он должен быть изменен до того, как будет вызвано событие `'end'`.

<!-- 0087.part.md -->

#### stream.Transform

Потоки `Transform` - это потоки [`Duplex`](#streamduplex), в которых выход каким-то образом связан с входом. Как и все потоки [`Duplex`](#streamduplex), потоки `Transform` реализуют интерфейсы [`Readable`](#streamreadable) и [`Writable`](#streamwritable).

Примеры потоков `Transform` включают:

-   [zlib streams](zlib.md)
-   [crypto streams](crypto.md)

<!-- 0088.part.md -->

##### transform.destroy

```js
transform.destroy([error]);
```

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожить поток и, по желанию, выдать событие `'error'`. После этого вызова поток преобразования освободит все внутренние ресурсы. Реализаторы не должны переопределять этот метод, а вместо этого реализовать [`readable._destroy()`](#readable_destroy). Реализация по умолчанию `_destroy()` для `Transform` также испускает `'close'`, если `emitClose` не установлен в false.

После вызова `destroy()` любые дальнейшие вызовы будут бесполезны, и никакие другие ошибки, кроме `_destroy()`, не могут быть выданы как `'error'`.

<!-- 0089.part.md -->

### stream.finished

```js
stream.finished(stream[, options], callback)
```

-   `stream` [`<Stream>`](stream.md#stream) | [`<ReadableStream>`](webstreams.md#readablestream) | {WritableStream}

Читаемый и/или записываемый поток/вебстрим.

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `error` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено значение `false`, то вызов `emit('error', err)` не рассматривается как завершенный. **По умолчанию:** `true`.
    -   `readable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено значение `false`, обратный вызов будет вызван, когда поток завершится, даже если поток все еще может быть доступен для чтения. **По умолчанию:** `true`.
    -   `writable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено значение `false`, обратный вызов будет вызван при завершении потока, даже если поток может быть доступен для записи. **По умолчанию:** `true`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать ожидание завершения потока. Основной поток не будет прерван, если сигнал прерван. Обратный вызов будет вызван с сообщением `AbortError`. Все зарегистрированные слушатели, добавленные этой функцией, также будут удалены.
    -   `cleanup` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) удалить все зарегистрированные слушатели потока. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова, принимающая необязательный аргумент ошибки.
-   Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция очистки, которая удаляет всех зарегистрированных слушателей.

Функция для получения уведомления, когда поток больше не доступен для чтения, записи или произошла ошибка или событие преждевременного закрытия.

```js
const { finished } = require('node:stream');
const fs = require('node:fs');

const rs = fs.createReadStream('archive.tar');

finished(rs, (err) => {
    if (err) {
        console.error('Stream failed.', err);
    } else {
        console.log('Поток закончил чтение.');
    }
});

rs.resume(); // Слить поток.
```

Особенно полезен в сценариях обработки ошибок, когда поток уничтожается преждевременно (например, прерванный HTTP-запрос), и не выдает `'end'` или `'finish'`.

API `finished` предоставляет промис версию.

Функция `stream.finished()` оставляет висящие слушатели событий (в частности, `'error'`, `'end'`, `'finish'` и `'close'`) после вызова `callback`. Это делается для того, чтобы неожиданные события `ошибки` (из-за неправильной реализации потока) не приводили к неожиданным сбоям. Если это нежелательное поведение, то возвращаемая функция очистки должна быть вызвана в обратном вызове:

```js
const cleanup = finished(rs, (err) => {
    cleanup();
    // ...
});
```

<!-- 0090.part.md -->

### stream.pipeline

```js
stream.pipeline(source[, ...transforms], destination, callback)

stream.pipeline(streams, callback)
```

-   `streams` {Stream\[\]} | {Iterable\[\]} | {AsyncIterable\[\]} | {Function\[\]} | {ReadableStream\[\]} | {WritableStream\[\]} | {TransformStream\[\]}
-   `source` [`<Stream>`](stream.md#stream) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<ReadableStream>`](webstreams.md#readablestream)
    -   Возвращает: [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
-   `...transforms` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | {TransformStream}
    -   `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
    -   Возвращает: [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
-   `destination` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | {WritableStream}
    -   `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
    -   Возвращает: [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается, когда конвейер полностью завершен.
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `val` Разрешенное значение `Promise`, возвращенное `destination`.
-   Возвращает: [`<Stream>`](stream.md#stream)

Метод модуля для передачи данных между потоками и генераторами, пересылающими ошибки и должным образом очищающими их, а также предоставляющими обратный вызов, когда конвейер завершен.

```js
const { pipeline } = require('node:stream');
const fs = require('node:fs');
const zlib = require('node:zlib');

// Используйте API трубопровода для простой передачи серии потоков
// вместе и получить уведомление, когда конвейер будет полностью завершен.

// Конвейер для эффективного gzip потенциально огромного tar-файла:

pipeline(
    fs.createReadStream('archive.tar'),
    zlib.createGzip(),
    fs.createWriteStream('archive.tar.gz'),
    (err) => {
        if (err) {
            console.error('Pipeline failed.', err);
        } else {
            console.log('Pipeline succeeded.');
        }
    }
);
```

API `pipeline` предоставляет промис версию.

`stream.pipeline()` будет вызывать `stream.destroy(err)` для всех потоков, кроме:

-   `Readable` потоков, которые выдали команду `'end'` или `'close'`.
-   `Writable` потоков, которые выдали `'finish'` или `'close'`.

`stream.pipeline()` оставляет висящие слушатели событий на потоках после вызова `callback`. В случае повторного использования потоков после сбоя это может привести к утечке слушателей событий и проглоченным ошибкам. Если последний поток доступен для чтения, висячие слушатели событий будут удалены, чтобы последний поток мог быть использован позже.

`stream.pipeline()` закрывает все потоки при возникновении ошибки. Использование `IncomingRequest` с `pipeline` может привести к неожиданному поведению, когда сокет будет уничтожен без отправки ожидаемого ответа. Смотрите пример ниже:

```js
const fs = require('node:fs');
const http = require('node:http');
const { pipeline } = require('node:stream');

const server = http.createServer((req, res) => {
    const fileStream = fs.createReadStream(
        './fileNotExist.txt'
    );
    pipeline(fileStream, res, (err) => {
        if (err) {
            console.log(err); // Нет такого файла
            // Это сообщение не может быть отправлено после того, как `pipeline` уже уничтожил сокет
            return res.end('error!!!');
        }
    });
});
```

<!-- 0092.part.md -->

### stream.compose

```js
stream.compose(...streams);
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

    `stream.compose` является экспериментальным.

-   `streams` {Stream\[\]} | {Iterable\[\]} | {AsyncIterable\[\]} | {Function\[\]} | {ReadableStream\[\]} | {WritableStream\[\]} | {TransformStream\[\]}
-   Возвращает: {stream.Duplex}

Объединяет два или более потоков в поток `Duplex`, который пишет в первый поток и читает из последнего. Каждый предоставленный поток передается в следующий, используя `stream.pipeline`. Если какой-либо из потоков ошибается, то все они уничтожаются, включая внешний поток `Duplex`.

Поскольку `stream.compose` возвращает новый поток, который, в свою очередь, может (и должен) передаваться в другие потоки, он обеспечивает композицию. Напротив, при передаче потоков в `stream.pipeline`, обычно первый поток является потоком для чтения, а последний - потоком для записи, образуя замкнутую цепь.

Если передается `Function`, то это должен быть фабричный метод, принимающий `Iterable` источника.

```js
import { compose, Transform } from 'node:stream';

const removeSpaces = new Transform({
    transform(chunk, encoding, callback) {
        callback(null, String(chunk).replace(' ', ''));
    },
});

async function* toUpper(source) {
    for await (const chunk of source) {
        yield String(chunk).toUpperCase();
    }
}

let res = '';
for await (const buf of compose(removeSpaces, toUpper).end(
    'hello world'
)) {
    res += buf;
}

console.log(res); // prints 'HELLOWORLD'
```

`stream.compose` можно использовать для преобразования асинхронных итерабельных, генераторов и функций в потоки.

-   `AsyncIterable` преобразуется в читаемый `Duplex`. Не может выдать `null`.
-   `AsyncGeneratorFunction` преобразует в читаемое/записываемое преобразование `Duplex`. В качестве первого параметра должна принимать исходный `AsyncIterable`. Не может выдавать `null`.
-   `AsyncFunction` преобразует в записываемое `Duplex`. Должна возвращать либо `null`, либо `undefined`.

<!-- конец списка -->

```js
import { compose } from 'node:stream';
import { finished } from 'node:stream/promises';

// Преобразуем AsyncIterable в читаемый Duplex.
const s1 = compose(
    (async function* () {
        yield 'Hello';
        yield 'World';
    })()
);

// Преобразуем AsyncGenerator в преобразуемый Duplex.
const s2 = compose(async function* (source) {
    for await (const chunk of source) {
        yield String(chunk).toUpperCase();
    }
});

let res = '';

// Преобразуем AsyncFunction в записываемый Duplex.
const s3 = compose(async function (source) {
    for await (const chunk of source) {
        res += chunk;
    }
});

await finished(compose(s1, s2, s3));

console.log(res); // печатает 'HELLOWORLD'
```

См. [`readable.compose(stream)`](#readablecompose) для `stream.compose` как оператора.

<!-- 0093.part.md -->

### stream.Readable.from

```js
stream.Readable.from(iterable[, options])
```

-   `iterable` [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) Объект, реализующий протокол итератора `Symbol.asyncIterator` или `Symbol.iterator`. Выдает событие 'error', если передано нулевое значение.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры, предоставляемые `new stream.Readable([options])`. По умолчанию, `Readable.from()` будет устанавливать `options.objectMode` в `true`, если это не будет явно отклонено установкой `options.objectMode` в `false`.
-   Возвращает: [`<stream.Readable>`](stream.md#streamreadable)

Метод утилиты для создания читаемых потоков из итераторов.

```js
const { Readable } = require('node:stream');

async function* generate() {
    yield 'hello';
    yield 'streams';
}

const readable = Readable.from(generate());

readable.on('data', (chunk) => {
    console.log(chunk);
});
```

При вызове `Readable.from(string)` или `Readable.from(buffer)` строки или буферы не будут итерироваться в соответствии с семантикой других потоков по причинам производительности.

Если в качестве аргумента передается объект `Iterable`, содержащий обещания, это может привести к необработанному отказу.

```js
const { Readable } = require('node:stream');

Readable.from([
    new Promise((resolve) =>
        setTimeout(resolve('1'), 1500)
    ),
    new Promise((_, reject) =>
        setTimeout(reject(new Error('2')), 1000)
    ), // Не обработанный отказ
]);
```

<!-- 0094.part.md -->

### stream.Readable.fromWeb

```js
stream.Readable.fromWeb(readableStream[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `readableStream` [`<ReadableStream>`](webstreams.md#readablestream)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `сигнал` [`<AbortSignal>`](globals.md#abortsignal)
-   Возвращает: [`<stream.Readable>`](stream.md#streamreadable)

<!-- 0095.part.md -->

### stream.Readable.isDisturbed

```js
stream.Readable.isDisturbed(stream);
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `stream` [`<stream.Readable>`](stream.md#streamreadable) | [`<ReadableStream>`](webstreams.md#readablestream)
-   Возвращает: `boolean`.

Возвращает, был ли поток прочитан или отменен.

<!-- 0096.part.md -->

### stream.isErrored

```js
stream.isErrored(stream);
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `stream` {Readable} | {Writable} | {Duplex} | {WritableStream} | [`<ReadableStream>`](webstreams.md#readablestream)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает, столкнулся ли поток с ошибкой.

<!-- 0097.part.md -->

### stream.isReadable

```js
stream.isReadable(stream);
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `stream` {Readable} | {Duplex} | [`<ReadableStream>`](webstreams.md#readablestream)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает, является ли поток читаемым.

<!-- 0098.part.md -->

### stream.Readable.toWeb

```js
stream.Readable.toWeb(streamReadable[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `streamReadable` [`<stream.Readable>`](stream.md#streamreadable)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `стратегия` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер внутренней очереди (созданного `ReadableStream`) перед применением обратного давления при чтении из данного `stream.Readable`. Если значение не указано, оно будет взято из данного `stream.Readable`.
        -   `size` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, определяющая размер заданного куска данных. Если значение не указано, размер будет равен `1` для всех чанков.
            -   `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
            -   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: [`<ReadableStream>`](webstreams.md#readablestream)

<!-- 0099.part.md -->

### stream.Writable.fromWeb

```js
stream.Writable.fromWeb(writableStream[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `writableStream` {WritableStream}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `decodeStrings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal)
-   Возвращает: [`<stream.Writable>`](stream.md#streamwritable)

<!-- 0100.part.md -->

### stream.Writable.toWeb

```js
stream.Writable.toWeb(streamWritable);
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `streamWritable` [`<stream.Writable>`](stream.md#streamwritable)
-   Возвращает: {WritableStream}

<!-- 0101.part.md -->

### stream.Duplex.from

```js
stream.Duplex.from(src);
```

-   `src` [`<Stream>`](stream.md#stream) | [`<Blob>`](buffer.md#blob) | [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | {AsyncGeneratorFunction} | {AsyncFunction} | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<ReadableStream>`](webstreams.md#readablestream) | {WritableStream}

Утилита для создания дуплексных потоков.

-   `Stream` преобразует записываемый поток в записываемый `Duplex` и читаемый поток в `Duplex`.
-   `Blob` преобразует читаемый поток в читаемый `Duplex`.
-   `string` преобразует в читаемый `Duplex`.
-   `ArrayBuffer` преобразуется в читаемый `Duplex`.
-   `AsyncIterable` преобразуется в читаемый `Duplex`. Не может выдать `null`.
-   `AsyncGeneratorFunction` преобразует в читаемое/записываемое преобразование `Duplex`. В качестве первого параметра должна принимать исходный `AsyncIterable`. Не может выдавать `null`.
-   `AsyncFunction` преобразует в записываемое `Duplex`. Должна возвращать либо `null`, либо `undefined`.
-   `Object ({ writable, readable })` преобразует `readable` и `writable` в `Stream` и затем объединяет их в `Duplex`, где `Duplex` будет писать в `writable` и читать из `readable`.
-   `Promise` преобразуется в читаемый `Duplex`. Значение `null` игнорируется.
-   `ReadableStream` преобразуется в читаемый `Duplex`.
-   `WritableStream` преобразуется в записываемый `Duplex`.
-   Возвращает: {stream.Duplex}

Если в качестве аргумента передан объект `Iterable`, содержащий обещания, это может привести к необработанному отказу.

```js
const { Duplex } = require('node:stream');

Duplex.from([
    new Promise((resolve) =>
        setTimeout(resolve('1'), 1500)
    ),
    new Promise((_, reject) =>
        setTimeout(reject(new Error('2')), 1000)
    ), // Не обработанный отказ
]);
```

<!-- 0102.part.md -->

### stream.Duplex.fromWeb

```js
stream.Duplex.fromWeb(pair[, options])
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `pair` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `readable` [`<ReadableStream>`](webstreams.md#readablestream)
    -   `writable` {WritableStream}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `allowHalfOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `decodeStrings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `сигнал` [`<AbortSignal>`](globals.md#abortsignal)
-   Возвращает: {stream.Duplex}

<!-- конец списка -->

=== "MJS"

    ```js
    import { Duplex } from 'node:stream';
    import {
    	ReadableStream,
    	WritableStream,
    } from 'node:stream/web';

    const readable = new ReadableStream({
    	start(controller) {
    		controller.enqueue('world');
    	},
    });

    const writable = new WritableStream({
    	write(chunk) {
    		console.log('writable', chunk);
    	},
    });

    const pair = {
    	readable,
    	writable,
    };
    const duplex = Duplex.fromWeb(pair, {
    	encoding: 'utf8',
    	objectMode: true,
    });

    duplex.write('hello');

    for await (const chunk of duplex) {
    	console.log('readable', chunk);
    }
    ```

=== "CJS"

    ```js
    const { Duplex } = require('node:stream');
    const {
    	ReadableStream,
    	WritableStream,
    } = require('node:stream/web');

    const readable = new ReadableStream({
    	start(controller) {
    		controller.enqueue('world');
    	},
    });

    const writable = new WritableStream({
    	write(chunk) {
    		console.log('writable', chunk);
    	},
    });

    const pair = {
    	readable,
    	writable,
    };
    const duplex = Duplex.fromWeb(pair, {
    	encoding: 'utf8',
    	objectMode: true,
    });

    duplex.write('hello');
    duplex.once('readable', () =>
    	console.log('readable', duplex.read())
    );
    ```

<!-- 0103.part.md -->

### stream.Duplex.toWeb

```js
stream.Duplex.toWeb(streamDuplex);
```

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `streamDuplex` {stream.Duplex}
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `читаемый` [`<ReadableStream>`](webstreams.md#readablestream)
    -   `записываемый` {WritableStream}

<!-- конец списка -->

=== "MJS"

    ```js
    import { Duplex } from 'node:stream';

    const duplex = Duplex({
    	objectMode: true,
    	read() {
    		this.push('world');
    		this.push(null);
    	},
    	write(chunk, encoding, callback) {
    		console.log('writable', chunk);
    		callback();
    	},
    });

    const { readable, writable } = Duplex.toWeb(duplex);
    writable.getWriter().write('hello');

    const { value } = await readable.getReader().read();
    console.log('readable', value);
    ```

=== "CJS"

    ```js
    const { Duplex } = require('node:stream');

    const duplex = Duplex({
    	objectMode: true,
    	read() {
    		this.push('world');
    		this.push(null);
    	},
    	write(chunk, encoding, callback) {
    		console.log('writable', chunk);
    		callback();
    	},
    });

    const { readable, writable } = Duplex.toWeb(duplex);
    writable.getWriter().write('hello');

    readable
    	.getReader()
    	.read()
    	.then((result) => {
    		console.log('readable', result.value);
    	});
    ```

<!-- 0104.part.md -->

### stream.addAbortSignal

```js
stream.addAbortSignal(signal, stream);
```

-   `signal` [`<AbortSignal>`](globals.md#abortsignal) Сигнал, представляющий возможную отмену
-   `stream` [`<Stream>`](stream.md#stream) | [`<ReadableStream>`](webstreams.md#readablestream) | {WritableStream}

Поток, к которому нужно прикрепить сигнал.

Прикрепляет сигнал AbortSignal к читаемому или записываемому потоку. Это позволяет коду управлять уничтожением потока с помощью `AbortController`.

Вызов `abort` на `AbortController`, соответствующем переданному `AbortSignal`, будет вести себя так же, как вызов `.destroy(new AbortError())` для потока, и `controller.error(new AbortError())` для веб-потоков.

```js
const fs = require('node:fs');

const controller = new AbortController();
const read = addAbortSignal(
    controller.signal,
    fs.createReadStream('object.json')
);
// Later, abort the operation closing the stream
controller.abort();
```

Или используя `AbortSignal` с читаемым потоком в качестве асинхронного итерабельного:

```js
const controller = new AbortController();
setTimeout(() => controller.abort(), 10_000); // set a timeout
const stream = addAbortSignal(
    controller.signal,
    fs.createReadStream('object.json')
);
(async () => {
    try {
        for await (const chunk of stream) {
            await process(chunk);
        }
    } catch (e) {
        if (e.name === 'AbortError') {
            // The operation was cancelled
        } else {
            throw e;
        }
    }
})();
```

Или используя `AbortSignal` с ReadableStream:

```js
const controller = new AbortController();
const rs = new ReadableStream({
    start(controller) {
        controller.enqueue('hello');
        controller.enqueue('world');
        controller.close();
    },
});

addAbortSignal(controller.signal, rs);

finished(rs, (err) => {
    if (err) {
        if (err.name === 'AbortError') {
            // The operation was cancelled
        }
    }
});

const reader = rs.getReader();

reader.read().then(({ value, done }) => {
    console.log(value); // hello
    console.log(done); // false
    controller.abort();
});
```

<!-- 0105.part.md -->

## API для реализаторов потоков

API модуля `node:stream` был разработан для того, чтобы сделать возможной простую реализацию потоков с использованием прототипной модели наследования JavaScript.

Сначала разработчик потоков объявляет новый класс JavaScript, который расширяет один из четырех базовых классов потоков (`stream.Writable`, `stream.Readable`, `stream.Duplex` или `stream.Transform`), убеждаясь, что он вызывает соответствующий конструктор родительского класса:

```js
const { Writable } = require('node:stream');

class MyWritable extends Writable {
    constructor({ highWaterMark, ...options }) {
        super({ highWaterMark });
        // ...
    }
}
```

При расширении потоков следует помнить о том, какие опции может и должен предоставлять пользователь, прежде чем передавать их базовому конструктору. Например, если реализация делает предположения относительно опций `autoDestroy` и `emitClose`, не позволяйте пользователю переопределять их. Явно указывайте, какие опции передаются, вместо того, чтобы неявно передавать все опции.

Затем новый класс потока должен реализовать один или несколько специфических методов, в зависимости от типа создаваемого потока, как показано на следующей схеме:

| Use-case | Class | Method(s) to implement |
| --- | --- | --- |
| Только чтение | [`Readable`](#streamreadable) | [`_read()`](#readable_read) |
| Только запись | [`Writable`](#streamwritable) | [`_write()`](#writable_write), [`_writev()`](#writable_writev), [`_final()`](#writable_final) |
| Чтение и запись | [`Duplex`](#streamduplex) | [`_read()`](#readable_read), [`_write()`](#writable_write), [`_writev()`](#writable_writev), [`_final()`](#writable_final) |
| Оперировать с записанными данными, затем читать результат | [`Transform`](#streamtransform) | [`_transform()`](#transform_transform), [`_flush()`](#transform_flush), [`_final()`](#writable_final) |

Код реализации потока _никогда_ не должен вызывать "публичные" методы потока, предназначенные для использования потребителями (как описано в разделе "API для потребителей потоков"). Это может привести к неблагоприятным побочным эффектам в приложении.

<!-- 0106.part.md -->

### Упрощенное построение

Для многих простых случаев можно создать поток, не полагаясь на наследование. Это можно сделать, непосредственно создавая экземпляры объектов `stream.Writable`, `stream.Readable`, `stream.Duplex` или `stream.Transform` и передавая соответствующие методы в качестве опций конструктора.

```js
const { Writable } = require('node:stream');

const myWritable = new Writable({
    construct(callback) {
        // Инициализация состояния и загрузка ресурсов...
    },
    write(chunk, encoding, callback) {
        // ...
    },
    destroy() {
        // Освободить ресурсы...
    },
});
```

<!-- 0107.part.md -->

### Реализация потока с возможностью записи

Класс `stream.Writable` расширен для реализации потока [`Writable`](#streamwritable).

Пользовательские потоки `Writable` _должны_ вызывать конструктор `new stream.Writable([options])` и реализовывать метод `writable._write()` и/или `writable._writev()`.

<!-- 0108.part.md -->

#### new stream.Writable

```js
new stream.Writable([options]);
```

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень буфера, когда [`stream.write()`](#writablewrite) начинает возвращать `false`. **По умолчанию:** `16384` (16 KiB), или `16` для потоков `objectMode`.
    -   `decodeStrings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Кодировать ли `строки`, переданные в [`stream.write()`](#writablewrite) в `буфер` (с кодировкой, указанной в вызове [`stream.write()`](#writablewrite)) перед передачей их в [`stream._write()`](#writable_write). Другие типы данных не преобразуются (т.е. `буфер` не декодируется в `строку`). Установка значения false предотвращает преобразование `строк`. **По умолчанию:** `true`.
    -   `defaultEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка по умолчанию, которая используется, если в качестве аргумента [`stream.write()`](#writablewrite) не указана кодировка. **По умолчанию:** `'utf8'`.
    -   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Является ли [`stream.write(anyObj)`](#writablewrite) допустимой операцией. Если установлено, становится возможной запись JavaScript-значений, отличных от string, `Buffer` или `Uint8Array`, если это поддерживается реализацией потока. **По умолчанию:** `false`.
    -   `emitClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Должен ли поток издавать сигнал `'close'` после его уничтожения. **По умолчанию:** `true`.
    -   `write` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Реализация метода [`stream._write()`](#writable_write).
    -   `writev` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Реализация для метода [`stream._writev()`](#writable_writev).
    -   `destroy` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Реализация для метода [`stream._destroy()`](#writable_destroy).
    -   `final` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Реализация метода [`stream._final()`](#writable_final).
    -   `construct` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Реализация для метода [`stream._construct()`](#writable_construct).
    -   `autoDestroy` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Должен ли этот поток автоматически вызывать `.destroy()` на себя после завершения. **По умолчанию:** `true`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Сигнал, представляющий возможную отмену.

<!-- конец списка -->

```js
const { Writable } = require('node:stream');

class MyWritable extends Writable {
    constructor(options) {
        // Вызывает конструктор stream.Writable().
        super(options);
        // ...
    }
}
```

Или, при использовании конструкторов в стиле доES6:

```js
const { Writable } = require('node:stream');
const util = require('node:util');

function MyWritable(options) {
    if (!(this instanceof MyWritable))
        return new MyWritable(options);
    Writable.call(this, options);
}
util.inherits(MyWritable, Writable);
```

Или, используя упрощенный подход с конструктором:

```js
const { Writable } = require('node:stream');


const myWritable = new Writable({
  write(chunk, encoding, callback) {
    // ...
  },
  writev(chunks, callback) { ...
    // ...
  },
});
```

Вызов `abort` на `AbortController`, соответствующем переданному `AbortSignal`, будет вести себя так же, как вызов `.destroy(new AbortError())` на записываемом потоке.

```js
const { Writable } = require('node:stream');

const controller = new AbortController();
const myWritable = new Writable({
    write(chunk, encoding, callback) {
        // ...
    },
    writev(chunks, callback) {
        // ...
    },
    signal: controller.signal,
});
// Later, abort the operation closing the stream
controller.abort();
```

<!-- 0109.part.md -->

#### writable.\_construct

```js
writable._construct(callback);
```

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызовите эту функцию (опционально с аргументом об ошибке), когда поток закончит инициализацию.

Метод `_construct()` НЕ ДОЛЖЕН вызываться напрямую. Он может быть реализован дочерними классами, и если это так, то будет вызываться только внутренними методами класса `Writable`.

Эта необязательная функция будет вызвана в тике после возврата конструктора потока, откладывая любые вызовы `_write()`, `_final()` и `_destroy()` до вызова `callback`. Это полезно для инициализации состояния или асинхронной инициализации ресурсов до того, как поток может быть использован.

```js
const { Writable } = require('node:stream');
const fs = require('node:fs');

class WriteStream extends Writable {
    constructor(filename) {
        super();
        this.filename = filename;
        this.fd = null;
    }
    _construct(callback) {
        fs.open(this.filename, (err, fd) => {
            if (err) {
                callback(err);
            } else {
                this.fd = fd;
                callback();
            }
        });
    }
    _write(chunk, encoding, callback) {
        fs.write(this.fd, chunk, callback);
    }
    _destroy(err, callback) {
        if (this.fd) {
            fs.close(this.fd, (er) => callback(er || err));
        } else {
            callback(err);
        }
    }
}
```

<!-- 0110.part.md -->

#### writable.\_write

```js
writable._write(chunk, encoding, callback);
```

-   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Записываемый `буфер`, преобразованный из `строки`, переданной в [`stream.write()`](#writablewrite). Если опция потока `decodeStrings` равна `false` или поток работает в объектном режиме, чанк не будет преобразован и будет тем, что было передано в [`stream.write()`](#writablewrite).
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если чанк является строкой, то `encoding` - это кодировка символов этой строки. Если чанк является `буфером`, или если поток работает в объектном режиме, `encoding` может быть проигнорирован.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызвать эту функцию (опционально с аргументом об ошибке), когда обработка будет завершена для предоставленного чанка.

Все реализации потока `Writable` должны предоставлять метод [`writable._write()`](#writable_write) и/или [`writable._writev()`](#writable_writev) для отправки данных на базовый ресурс.

Потоки [`Transform`](#streamtransform) предоставляют собственную реализацию метода [`writable._write()`](#writable_write).

Эта функция НЕ ДОЛЖНА вызываться кодом приложения напрямую. Она должна быть реализована дочерними классами и вызываться только внутренними методами класса `Writable`.

Функция `callback` должна вызываться синхронно внутри `writable._write()` или асинхронно (т.е. разными тиками), чтобы сигнализировать либо об успешном завершении записи, либо об ошибке. Первым аргументом, передаваемым в `callback`, должен быть объект `Error`, если вызов не удался, или `null`, если запись прошла успешно.

Все вызовы `writable.write()`, которые происходят между вызовом `writable._write()` и вызовом `callback`, приводят к буферизации записанных данных. Когда вызывается `callback`, поток может выдать событие `'drain'`. Если реализация потока способна обрабатывать несколько порций данных одновременно, следует реализовать метод `writable._writev()`.

Если свойство `decodeStrings` явно установлено в `false` в опциях конструктора, то `chunk` останется тем же объектом, который передается в `.write()`, и может быть строкой, а не `Buffer`. Это сделано для поддержки реализаций, оптимизированных для работы с определенными кодировками строковых данных. В этом случае аргумент `encoding` будет указывать на кодировку символов строки. В противном случае аргумент `encoding` можно смело игнорировать.

Метод `writable._write()` помечен знаком подчеркивания, поскольку он является внутренним для класса, который его определяет, и никогда не должен вызываться напрямую пользовательскими программами.

<!-- 0111.part.md -->

#### writable.\_writev

```js
writable._writev(chunks, callback);
```

-   `куски` {Object\[\]} Данные, которые должны быть записаны. Значение представляет собой массив [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), каждый из которых представляет собой отдельный фрагмент данных для записи. Свойствами этих объектов являются:
    -   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Экземпляр буфера или строка, содержащая данные для записи. Объект `chunk` будет строкой, если `Writable` был создан с опцией `decodeStrings`, установленной в `false`, и строка была передана в `write()`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка символов для `chunk`. Если `chunk` является `буфером`, то `encoding` будет `'buffer'`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова (опционально с аргументом ошибки), которая будет вызвана, когда обработка будет завершена для предоставленных чанков.

Эта функция НЕ ДОЛЖНА вызываться кодом приложения напрямую. Она должна быть реализована дочерними классами и вызываться только внутренними методами класса `Writable`.

Метод `writable._writev()` может быть реализован в дополнение или альтернативно к `writable._write()` в реализациях потоков, способных обрабатывать несколько кусков данных одновременно. В случае реализации и при наличии буферизованных данных от предыдущих записей, `_writev()` будет вызван вместо `_write()`.

Метод `writable._writev()` снабжен символом подчеркивания, поскольку он является внутренним для класса, который его определяет, и никогда не должен вызываться напрямую пользовательскими программами.

<!-- 0112.part.md -->

#### writable.\_destroy

```js
writable._destroy(err, callback);
```

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Возможная ошибка.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова, принимающая необязательный аргумент ошибки.

Метод `_destroy()` вызывается [`writable.destroy()`](#writabledestroy). Он может быть переопределен дочерними классами, но **не должен** вызываться напрямую. Кроме того, `callback` не следует смешивать с async/await, поскольку он выполняется при разрешении обещания.

<!-- 0113.part.md -->

#### writable.\_final

```js
writable._final(callback);
```

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызов этой функции (опционально с аргументом об ошибке) при завершении записи оставшихся данных.

Метод `_final()` **не должен** вызываться напрямую. Он может быть реализован дочерними классами, и если это так, то будет вызываться только внутренними методами класса `Writable`.

Эта необязательная функция будет вызвана до закрытия потока, откладывая событие `'finish'` до вызова `callback`. Это полезно для закрытия ресурсов или записи буферизованных данных перед завершением потока.

<!-- 0114.part.md -->

#### Ошибки при записи

Ошибки, возникающие во время обработки методов [`writable._write()`](#writable_write), [`writable._writev()`](#writable_writev) и [`writable._final()`](#writable_final), должны распространяться путем вызова обратного вызова и передачи ошибки в качестве первого аргумента. Выброс `Error` из этих методов или ручное создание события `'error'` приводит к неопределенному поведению.

Если поток `Readable` передается в поток `Writable`, когда `Writable` выдает ошибку, поток `Readable` будет распакован.

```js
const { Writable } = require('node:stream');

const myWritable = new Writable({
    write(chunk, encoding, callback) {
        if (chunk.toString().indexOf('a') >= 0) {
            callback(new Error('chunk is invalid'));
        } else {
            callback();
        }
    },
});
```

<!-- 0115.part.md -->

#### Пример потока с возможностью записи

Ниже показана довольно упрощенная (и в некоторой степени бессмысленная) реализация пользовательского потока `Writable`. Хотя этот конкретный экземпляр потока `Writable` не представляет особой пользы, пример иллюстрирует каждый из необходимых элементов пользовательского [`Writable`](#streamwritable) экземпляра потока:

```js
const { Writable } = require('node:stream');

class MyWritable extends Writable {
    _write(chunk, encoding, callback) {
        if (chunk.toString().indexOf('a') >= 0) {
            callback(new Error('chunk is invalid'));
        } else {
            callback();
        }
    }
}
```

<!-- 0116.part.md -->

#### Декодирование буферов в потоке с возможностью записи

Декодирование буферов является распространенной задачей, например, при использовании трансформаторов, входными данными которых является строка. Это нетривиальный процесс при использовании многобайтовой кодировки символов, такой как UTF-8. Следующий пример показывает, как декодировать многобайтовые строки с помощью `StringDecoder` и [`Writable`](#streamwritable).

```js
const { Writable } = require('node:stream');
const { StringDecoder } = require('node:string_decoder');

class StringWritable extends Writable {
    constructor(options) {
        super(options);
        this._decoder = new StringDecoder(
            options && options.defaultEncoding
        );
        this.data = '';
    }
    _write(chunk, encoding, callback) {
        if (encoding === 'buffer') {
            chunk = this._decoder.write(chunk);
        }
        this.data += chunk;
        callback();
    }
    _final(callback) {
        this.data += this._decoder.end();
        callback();
    }
}

const euro = [[0xe2, 0x82], [0xac]].map(Buffer.from);
const w = new StringWritable();

w.write('currency: ');
w.write(euro[0]);
w.end(euro[1]);

console.log(w.data); // валюта: €
```

<!-- 0117.part.md -->

### Реализация читаемого потока

Класс `stream.Readable` расширен для реализации потока [`Readable`](#streamreadable).

Пользовательские потоки `Readable` _должны_ вызывать конструктор `new stream.Readable([options])` и реализовывать метод [`readable._read()`](#readable_read).

<!-- 0118.part.md -->

#### new stream.Readable

```js
new stream.Readable([options]);
```

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное количество байт для хранения во внутреннем буфере перед прекращением чтения из базового ресурса. **По умолчанию:** `16384` (16 KiB), или `16` для потоков `objectMode`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если указано, то буферы будут декодированы в строки с использованием указанной кодировки. **По умолчанию:** `null`.
    -   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Должен ли этот поток вести себя как поток объектов. Это означает, что `stream.read(n)` возвращает одно значение вместо `Buffer` размером `n`. **По умолчанию:** `false`.
    -   `emitClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Должен ли поток издавать сигнал `'close'` после его уничтожения. **По умолчанию:** `true`.
    -   `read` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Реализация метода [`stream._read()`](#readable_read).
    -   `destroy` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Реализация для метода [`stream._destroy()`](#readable_destroy).
    -   `construct` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Реализация метода [`stream._construct()`](#readable_construct).
    -   `autoDestroy` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Должен ли этот поток автоматически вызывать `.destroy()` на себя после завершения. **По умолчанию:** `true`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Сигнал, представляющий возможную отмену.

<!-- конец списка -->

```js
const { Readable } = require('node:stream');

class MyReadable extends Readable {
    constructor(options) {
        // Вызывает конструктор stream.Readable(options).
        super(options);
        // ...
    }
}
```

Или, при использовании конструкторов в стиле до ES6:

```js
const { Readable } = require('node:stream');
const util = require('node:util');

function MyReadable(options) {
    if (!(this instanceof MyReadable))
        return new MyReadable(options);
    Readable.call(this, options);
}
util.inherits(MyReadable, Readable);
```

Или, используя упрощенный подход с конструктором:

```js
const { Readable } = require('node:stream');

const myReadable = new Readable({
    read(size) {
        // ...
    },
});
```

Вызов `abort` на `AbortController`, соответствующем переданному `AbortSignal`, будет вести себя так же, как вызов `.destroy(new AbortError())` на созданном readable.

```js
const { Readable } = require('node:stream');
const controller = new AbortController();
const read = new Readable({
    read(size) {
        // ...
    },
    signal: controller.signal,
});
// Позже прервите операцию, закрыв поток
controller.abort();
```

<!-- 0119.part.md -->

#### readable.\_construct

```js
readable._construct(callback);
```

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызовите эту функцию (опционально с аргументом об ошибке), когда поток закончит инициализацию.

Метод `_construct()` НЕ ДОЛЖЕН вызываться напрямую. Он может быть реализован дочерними классами, и если это так, то будет вызываться только внутренними методами класса `Readable`.

Эта необязательная функция будет запланирована на следующий такт конструктором потока, откладывая любые вызовы `_read()` и `_destroy()` до вызова `callback`. Это полезно для инициализации состояния или асинхронной инициализации ресурсов перед использованием потока.

```js
const { Readable } = require('node:stream');
const fs = require('node:fs');

class ReadStream extends Readable {
    constructor(filename) {
        super();
        this.filename = filename;
        this.fd = null;
    }
    _construct(callback) {
        fs.open(this.filename, (err, fd) => {
            if (err) {
                callback(err);
            } else {
                this.fd = fd;
                callback();
            }
        });
    }
    _read(n) {
        const buf = Buffer.alloc(n);
        fs.read(
            this.fd,
            buf,
            0,
            n,
            null,
            (err, bytesRead) => {
                if (err) {
                    this.destroy(err);
                } else {
                    this.push(
                        bytesRead > 0
                            ? buf.slice(0, bytesRead)
                            : null
                    );
                }
            }
        );
    }
    _destroy(err, callback) {
        if (this.fd) {
            fs.close(this.fd, (er) => callback(er || err));
        } else {
            callback(err);
        }
    }
}
```

<!-- 0120.part.md -->

#### readable.\_read

```js
readable._read(size);
```

-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байт для асинхронного чтения

Эта функция НЕ ДОЛЖНА вызываться непосредственно кодом приложения. Она должна быть реализована дочерними классами и вызываться только внутренними методами класса `Readable`.

Все реализации потока `Readable` должны предоставлять реализацию метода [`readable._read()`](#readable_read) для получения данных из базового ресурса.

Когда вызывается [`readable._read()`](#readable_read), если данные доступны из ресурса, реализация должна начать проталкивать эти данные в очередь чтения, используя метод [`this.push(dataChunk)`](#readablepush). `_read()` будет вызываться снова после каждого вызова [`this.push(dataChunk)`](#readablepush), когда поток будет готов принять больше данных. `_read()` может продолжать читать из ресурса и проталкивать данные, пока `readable.push()` не вернет `false`. Только когда `_read()` снова вызывается после остановки, он должен возобновить проталкивание дополнительных данных в очередь.

После вызова метода [`readable._read()`](#readable_read), он не будет вызван снова, пока больше данных не будет протолкнуто через метод [`readable.push()`](#readablepush). Пустые данные, такие как пустые буферы и строки, не вызовут метод [`readable._read()`](#readable_read).

Аргумент `size` является рекомендательным. В тех реализациях, где "чтение" - это одна операция, возвращающая данные, аргумент `size` может использоваться для определения того, сколько данных нужно получить. Другие реализации могут игнорировать этот аргумент и просто предоставлять данные всякий раз, когда они становятся доступными. Нет необходимости "ждать", пока `size` байт станет доступен перед вызовом [`stream.push(chunk)`](#readablepush).

Метод [`readable._read()`](#readable_read) помечен знаком подчеркивания, потому что он является внутренним для класса, который его определяет, и никогда не должен вызываться напрямую пользовательскими программами.

<!-- 0121.part.md -->

#### readable.\_destroy

```js
readable._destroy(err, callback);
```

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Возможная ошибка.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова, принимающая необязательный аргумент ошибки.

Метод `_destroy()` вызывается [`readable.destroy()`](#readabledestroy). Он может быть переопределен дочерними классами, но **не должен** вызываться напрямую.

<!-- 0122.part.md -->

#### readable.push

```js
readable.push(chunk[, encoding])
```

-   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type) | [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Кусок данных для передачи в очередь чтения. Для потоков, не работающих в объектном режиме, `chunk` должен быть строкой, `Buffer` или `Uint8Array`. Для потоков, работающих в объектном режиме, `chunk` может быть любым значением JavaScript.
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка кусков строки. Должна быть правильной кодировкой `Buffer`, такой как `'utf8` или `'ascii`.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если можно продолжать проталкивать дополнительные куски данных; `false` в противном случае.

Если `chunk` является `буфером`, `Uint8Array` или `строкой`, то `кусок` данных будет добавлен во внутреннюю очередь для потребления пользователями потока. Передача `chunk` как `null` сигнализирует о конце потока (EOF), после чего данные больше не могут быть записаны.

Когда `Readable` работает в режиме паузы, данные, добавленные с помощью `readable.push()`, могут быть считаны путем вызова метода [`readable.read()`](#readableread) при появлении события `'readable'`.

Когда `Readable` работает в потоковом режиме, данные, добавленные с помощью `readable.push()`, будут доставлены путем испускания события `'data'`.

Метод `readable.push()` разработан так, чтобы быть как можно более гибким. Например, при обертывании низкоуровневого источника, который обеспечивает некоторую форму механизма паузы/возобновления и обратного вызова данных, низкоуровневый источник может быть обернут пользовательским экземпляром `Readable`:

```js
// `_source` - это объект с методами readStop() и readStart(),
// и членом `ondata`, который вызывается, когда у него есть данные, и
// член `onend`, который вызывается, когда данные заканчиваются.

class SourceWrapper extends Readable {
    constructor(options) {
        super(options);

        this._source = getLowLevelSourceObject();

        // Каждый раз, когда есть данные, заталкиваем их во внутренний буфер.
        this._source.ondata = (chunk) => {
            // Если push() возвращает false, то прекратите чтение из источника.
            if (!this.push(chunk)) this._source.readStop();
        };

        // Когда источник закончится, вытолкните чанк `null` с сигналом EOF.
        this._source.onend = () => {
            this.push(null);
        };
    }
    // _read() будет вызвана, когда поток захочет получить больше данных.
    // Совещательный аргумент size в этом случае игнорируется.
    _read(size) {
        this._source.readStart();
    }
}
```

Метод `readable.push()` используется для проталкивания содержимого во внутренний буфер. Он может быть вызван методом [`readable._read()`](#readable_read).

Для потоков, не работающих в объектном режиме, если параметр `chunk` метода `readable.push()` имеет значение `undefined`, он будет рассматриваться как пустая строка или буфер. Дополнительную информацию смотрите в [`readable.push('')`](#readablepush).

<!-- 0123.part.md -->

#### Ошибки при чтении

Ошибки, возникающие при обработке [`readable._read()`](#readable_read), должны передаваться через метод [`readable.destroy(err)`](#readable_destroy). Бросок `Error` изнутри [`readable._read()`](#readable_read) или ручное создание события `'error'` приводит к неопределенному поведению.

```js
const { Readable } = require('node:stream');

const myReadable = new Readable({
    read(size) {
        const err = checkSomeErrorCondition();
        if (err) {
            this.destroy(err);
        } else {
            // Выполните какую-нибудь работу.
        }
    },
});
```

<!-- 0124.part.md -->

#### Пример счетного потока

Ниже приведен базовый пример потока `Readable`, который выдает цифры от `1` до `1 000 000` в порядке возрастания, а затем завершается.

```js
const { Readable } = require('node:stream');

class Counter extends Readable {
    constructor(opt) {
        super(opt);
        this._max = 1000000;
        this._index = 1;
    }

    _read() {
        const i = this._index++;
        if (i > this._max) this.push(null);
        else {
            const str = String(i);
            const buf = Buffer.from(str, 'ascii');
            this.push(buf);
        }
    }
}
```

<!-- 0125.part.md -->

### Реализация дуплексного потока

Поток [`Duplex`](#streamduplex) - это поток, который реализует как [`Readable`](#streamreadable), так и [`Writable`](#streamwritable), например, соединение TCP сокета.

Поскольку JavaScript не поддерживает множественное наследование, класс `stream.Duplex` расширяется для реализации потока [`Duplex`](#streamduplex) (в отличие от расширения классов `stream.Readable` _и_ `stream.Writable`).

Класс `stream.Duplex` прототипически наследуется от `stream.Readable` и паразитно от `stream.Writable`, но `instanceof` будет работать правильно для обоих базовых классов благодаря переопределению [`Symbol.hasInstance`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance) для `stream.Writable`.

Пользовательские потоки `Duplex` _должны_ вызывать конструктор `new stream.Duplex([options])` и реализовывать _обои_ методы [`readable._read()`](#readable_read) и `writable._write()`.

<!-- 0126.part.md -->

#### new stream.Duplex

```js
new stream.Duplex(options);
```

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Передается конструкторам `Writable` и `Readable`. Также имеет следующие поля:
    -   `allowHalfOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено значение `false`, то поток будет автоматически завершать записываемую сторону, когда завершается читаемая сторона. **По умолчанию:** `true`.
    -   `readable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Устанавливает, должен ли `Duplex` быть доступен для чтения. **По умолчанию:** `true`.
    -   `writable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Устанавливает, должен ли `Duplex` быть доступен для записи. **По умолчанию:** `true`.
    -   `readableObjectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Устанавливает `objectMode` для читаемой стороны потока. Не имеет эффекта, если `objectMode` равен `true`. **По умолчанию:** `false`.
    -   `writableObjectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Устанавливает `objectMode` для записываемой стороны потока. Не имеет эффекта, если `objectMode` равен `true`. **По умолчанию:** `false`.
    -   `readableHighWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает `highWaterMark` для читаемой стороны потока. Не имеет эффекта, если `highWaterMark` предоставлен.
    -   `writableHighWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает `highWaterMark` для записываемой стороны потока. Не имеет эффекта, если задана `highWaterMark`.

<!-- конец списка -->

```js
const { Duplex } = require('node:stream');

class MyDuplex extends Duplex {
    constructor(options) {
        super(options);
        // ...
    }
}
```

Или, при использовании конструкторов в стиле до ES6:

```js
const { Duplex } = require('node:stream');
const util = require('node:util');

function MyDuplex(options) {
    if (!(this instanceof MyDuplex))
        return new MyDuplex(options);
    Duplex.call(this, options);
}
util.inherits(MyDuplex, Duplex);
```

Или, используя упрощенный подход с конструктором:

```js
const { Duplex } = require('node:stream');

const myDuplex = new Duplex({
    read(size) {
        // ...
    },
    write(chunk, encoding, callback) {
        // ...
    },
});
```

При использовании конвейера:

```js
const { Transform, pipeline } = require('node:stream');
const fs = require('node:fs');

pipeline(
    fs.createReadStream('object.json').setEncoding('utf8'),
    new Transform({
        decodeStrings: false, // Принимать строковый ввод, а не буферы
        construct(callback) {
            this.data = '';
            callback();
        },
        transform(chunk, encoding, callback) {
            this.data += chunk;
            callback();
        },
        flush(callback) {
            try {
                // Убедитесь, что это корректный json.
                JSON.parse(this.data);
                this.push(this.data);
                callback();
            } catch (err) {
                callback(err);
            }
        },
    }),
    fs.createWriteStream('valid-object.json'),
    (err) => {
        if (err) {
            console.error('failed', err);
        } else {
            console.log('completed');
        }
    }
);
```

<!-- 0127.part.md -->

#### Пример дуплексного потока

Ниже показан простой пример потока `Duplex`, который оборачивает гипотетический объект-источник нижнего уровня, в который могут быть записаны данные и из которого могут быть прочитаны данные, хотя и с использованием API, не совместимого с потоками Node.js. Ниже показан простой пример потока `Duplex`, который буферизирует входящие записанные данные через интерфейс [`Writable`](#streamwritable), которые считываются обратно через интерфейс [`Readable`](#streamreadable).

```js
const { Duplex } = require('node:stream');
const kSource = Symbol('source');

class MyDuplex extends Duplex {
    constructor(source, options) {
        super(options);
        this[kSource] = source;
    }

    _write(chunk, encoding, callback) {
        // Базовый источник работает только со строками.
        if (Buffer.isBuffer(chunk))
            chunk = chunk.toString();
        this[kSource].writeSomeData(chunk);
        callback();
    }

    _read(size) {
        this[kSource].fetchSomeData(
            size,
            (data, encoding) => {
                this.push(Buffer.from(data, encoding));
            }
        );
    }
}
```

Наиболее важным аспектом дуплексного потока является то, что стороны `Readable` и `Writable` работают независимо друг от друга, несмотря на сосуществование в одном экземпляре объекта.

<!-- 0128.part.md -->

#### Дуплексные потоки с объектным режимом

Для потоков `Duplex` режим `objectMode` может быть установлен исключительно для стороны `Readable` или `Writable` с помощью опций `readableObjectMode` и `writableObjectMode` соответственно.

Например, в следующем примере создается новый поток `Transform` (который является типом потока [`Duplex`](#streamduplex)) с объектным режимом `Writable` на стороне, принимающей числа JavaScript, которые преобразуются в шестнадцатеричные строки на стороне `Readable`.

```js
const { Transform } = require('node:stream');

// Все потоки Transform также являются дуплексными потоками.
const myTransform = new Transform({
    writableObjectMode: true,

    transform(chunk, encoding, callback) {
        // При необходимости преобразуем чанк в число.
        chunk |= 0;

        // Преобразуем чанк во что-то другое.
        const data = chunk.toString(16);

        // Передаем данные в очередь на чтение.
        callback(null, '0'.repeat(data.length % 2) + data);
    },
});

myTransform.setEncoding('ascii');
myTransform.on('data', (chunk) => console.log(chunk));

myTransform.write(1);
// Печатает: 01
myTransform.write(10);
// Печатает: 0a
myTransform.write(100);
// Печатает: 64
```

<!-- 0129.part.md -->

### Реализация потока преобразования

Поток [`Transform`](#streamtransform) - это поток [`Duplex`](#streamduplex), в котором выходной поток каким-то образом вычисляется из входного. Примерами могут служить потоки [zlib](zlib.md) или [crypto](crypto.md), которые сжимают, шифруют или расшифровывают данные.

Нет требования, чтобы выходные данные были того же размера, что и входные, имели то же количество фрагментов или приходили в то же время. Например, поток `Hash` будет иметь только один выходной фрагмент, который будет предоставлен после завершения ввода. Поток `zlib` будет производить вывод, который либо намного меньше, либо намного больше, чем его вход.

Класс `stream.Transform` расширен для реализации потока [`Transform`](#streamtransform).

Класс `stream.Transform` прототипически наследуется от `stream.Duplex` и реализует свои собственные версии методов `writable._write()` и [`readable._read()`](#readable_read). Пользовательские реализации `Transform` _должны_ реализовывать метод [`transform._transform()`](#transform_transform) и _могут_ также реализовывать метод [`transform._flush()`](#transform_flush).

При использовании потоков `Transform` следует соблюдать осторожность, так как данные, записанные в поток, могут вызвать приостановку потока со стороны `Writable`, если вывод на стороне `Readable` не будет использован.

<!-- 0130.part.md -->

#### new stream.Transform

```js
new stream.Transform([options]);
```

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Передается конструкторам `Writable` и `Readable`. Также имеет следующие поля:
    -   `transform` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Реализация метода [`stream._transform()`](#transform_transform).
    -   `flush` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Реализация для метода [`stream._flush()`](#transform_flush).

<!-- конец списка -->

```js
const { Transform } = require('node:stream');

class MyTransform extends Transform {
    constructor(options) {
        super(options);
        // ...
    }
}
```

Или, при использовании конструкторов в стиле до ES6:

```js
const { Transform } = require('node:stream');
const util = require('node:util');

function MyTransform(options) {
    if (!(this instanceof MyTransform))
        return new MyTransform(options);
    Transform.call(this, options);
}
util.inherits(MyTransform, Transform);
```

Или, используя упрощенный подход конструктора:

```js
const { Transform } = require('node:stream');

const myTransform = new Transform({
    transform(chunk, encoding, callback) {
        // ...
    },
});
```

<!-- 0131.part.md -->

#### Событие: end

Событие `'end'` относится к классу `stream.Readable`. Событие `'end'` испускается после вывода всех данных, что происходит после вызова обратного вызова в [`transform._flush()`](#transform_flush). В случае ошибки событие `'end'` не должно выдаваться.

<!-- 0132.part.md -->

#### Событие: finish

Событие `'finish'` относится к классу `stream.Writable`. Событие `'finish'` происходит после вызова [`stream.end()`](#writableend) и обработки всех кусков [`stream._transform()`](#transform_transform). В случае ошибки, `'finish'` не должен выдаваться.

<!-- 0133.part.md -->

#### transform.\_flush

```js
transform._flush(callback);
```

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова (опционально с аргументом ошибки и данными), которая будет вызвана, когда оставшиеся данные будут удалены.

Эта функция НЕ ДОЛЖНА вызываться непосредственно кодом приложения. Она должна быть реализована дочерними классами и вызываться только внутренними методами класса `Readable`.

В некоторых случаях операция преобразования может потребовать выдать дополнительный бит данных в конце потока. Например, поток сжатия `zlib` будет хранить некоторое количество внутреннего состояния, используемого для оптимального сжатия выходных данных. Однако, когда поток заканчивается, эти дополнительные данные должны быть удалены, чтобы сжатые данные были полными.

Пользовательские реализации [`Transform`](#streamtransform) _могут_ реализовать метод `transform._flush()`. Он будет вызван, когда больше нет записанных данных для потребления, но до того, как произойдет событие `'end'`, сигнализирующее о завершении потока [`Readable`](#streamreadable).

В рамках реализации `transform._flush()` метод `transform.push()` может быть вызван ноль или более раз, в зависимости от ситуации. Функция `callback` должна быть вызвана после завершения операции flush.

Метод `transform._flush()` снабжен символом подчеркивания, поскольку он является внутренним для класса, который его определяет, и никогда не должен вызываться напрямую пользовательскими программами.

<!-- 0134.part.md -->

#### transform.\_transform

```js
transform._transform(chunk, encoding, callback);
```

-   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Преобразуемый `буфер`, преобразованный из `строки`, переданной в [`stream.write()`](#writablewrite). Если опция потока `decodeStrings` равна `false` или поток работает в объектном режиме, чанк не будет преобразован и будет тем, что было передано в [`stream.write()`](#writablewrite).
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если чанк является строкой, то это тип кодировки. Если чанк является буфером, то это специальное значение `'buffer''. В этом случае игнорируйте его.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова (опционально с аргументом ошибки и данными), которая будет вызвана после обработки предоставленного `чанка`.

Эта функция НЕ ДОЛЖНА вызываться непосредственно кодом приложения. Она должна быть реализована дочерними классами и вызываться только внутренними методами класса `Readable`.

Все реализации потока `Transform` должны предоставлять метод `_transform()` для приема входных данных и получения выходных. Реализация `transform._transform()` обрабатывает записываемые байты, вычисляет выход, затем передает этот выход в читаемую часть с помощью метода `transform.push()`.

Метод `transform.push()` может быть вызван ноль или более раз для генерации вывода из одного входного чанка, в зависимости от того, какой объем должен быть выведен в результате работы чанка.

Возможно, что из любого заданного куска входных данных не будет сгенерирован выход.

Функция `callback` должна быть вызвана только тогда, когда текущий чанк полностью потреблен. Первым аргументом, передаваемым в `callback`, должен быть объект `Error`, если при обработке входных данных произошла ошибка, или `null` в противном случае. Если в `callback` передан второй аргумент, он будет передан методу `transform.push()`. Другими словами, следующие команды эквивалентны:

```js
transform.prototype._transform = function (
    data,
    encoding,
    callback
) {
    this.push(data);
    callback();
};

transform.prototype._transform = function (
    data,
    encoding,
    callback
) {
    callback(null, data);
};
```

Метод `transform._transform()` снабжен символом подчеркивания, поскольку он является внутренним для класса, который его определяет, и никогда не должен вызываться напрямую пользовательскими программами.

Метод `transform._transform()` никогда не вызывается параллельно; потоки реализуют механизм очереди, и для получения следующего куска необходимо вызвать `callback`, либо синхронно, либо асинхронно.

<!-- 0135.part.md -->

#### stream.PassThrough

Класс `stream.PassThrough` - это тривиальная реализация потока [`Transform`](#streamtransform), который просто передает входные байты на выход. Он предназначен в основном для примеров и тестирования, но есть некоторые случаи использования, когда `stream.PassThrough` полезен как строительный блок для новых видов потоков.

<!-- 0136.part.md -->

## Дополнительные примечания

<!-- 0137.part.md -->

### Совместимость потоков с асинхронными генераторами и асинхронными итераторами

С поддержкой асинхронных генераторов и итераторов в JavaScript, асинхронные генераторы фактически являются первоклассной конструкцией потока на уровне языка на данный момент.

Ниже приведены некоторые распространенные случаи взаимодействия потоков Node.js с генераторами async и итераторами async.

<!-- 0138.part.md -->

#### Потребление читаемых потоков с помощью асинхронных итераторов

```js
(async function () {
    for await (const chunk of readable) {
        console.log(chunk);
    }
})();
```

Асинхронные итераторы регистрируют постоянный обработчик ошибок на потоке, чтобы предотвратить любые необработанные ошибки после уничтожения.

<!-- 0139.part.md -->

#### Создание читаемых потоков с помощью асинхронных генераторов

Читаемый поток Node.js может быть создан из асинхронного генератора с помощью метода `Readable.from()`:

```js
const { Readable } = require('node:stream');

const ac = new AbortController();
const signal = ac.signal;

async function* generate() {
    yield 'a';
    await someLongRunningFn({ signal });
    yield 'b';
    yield 'c';
}

const readable = Readable.from(generate());
readable.on('close', () => {
    ac.abort();
});

readable.on('data', (chunk) => {
    console.log(chunk);
});
```

<!-- 0140.part.md -->

#### Передача данных в записываемые потоки из асинхронных итераторов

При записи в записываемый поток из асинхронного итератора необходимо обеспечить правильную обработку обратного давления и ошибок. [`stream.pipeline()`](#streampipeline) абстрагирует обработку обратного давления и ошибок, связанных с обратным давлением:

```js
const fs = require('node:fs');
const { pipeline } = require('node:stream');
const {
    pipeline: pipelinePromise,
} = require('node:stream/promises');

const writable = fs.createWriteStream('./file');

const ac = new AbortController();
const signal = ac.signal;

const iterator = createIterator({ signal });

// Шаблон обратного вызова
pipeline(iterator, writable, (err, value) => {
    if (err) {
        console.error(err);
    } else {
        console.log(value, 'возвращаемое значение');
    }
}).on('close', () => {
    ac.abort();
});

// Шаблон обещания
pipelinePromise(iterator, writable)
    .then((value) => {
        console.log(value, 'значение возвращено');
    })
    .catch((err) => {
        console.error(err);
        ac.abort();
    });
```

<!-- 0141.part.md -->

### Совместимость со старыми версиями Node.js

До версии Node.js 0.10 интерфейс потока `Readable` был более простым, но также менее мощным и менее полезным.

-   Вместо того чтобы ждать вызова метода [`stream.read()`](#readableread), события `'data'` начинали испускаться немедленно. Приложения, которые должны были выполнить определенный объем работы, чтобы решить, как обрабатывать данные, должны были хранить прочитанные данные в буферах, чтобы данные не были потеряны.
-   Метод [`stream.pause()`](#readablepause) был рекомендательным, а не гарантированным. Это означало, что необходимо быть готовым к получению событий `data` _даже когда поток находится в состоянии паузы_.

В Node.js 0.10 был добавлен класс [`Readable`](#streamreadable). Для обратной совместимости со старыми программами Node.js, потоки `Readable` переходят в "текущий режим" при добавлении обработчика события `'data'` или при вызове метода [`stream.resume()`](#readableresume). В результате, даже если не использовать новый метод [`stream.read()`](#readableread) и событие `'readable'`, больше не нужно беспокоиться о потере кусков `'data'`.

Хотя большинство приложений будут продолжать нормально функционировать, это вводит крайний случай в следующих условиях:

-   Не добавлен слушатель событий `'data'`.
-   Метод [`stream.resume()`](#readableresume) никогда не вызывается.
-   Поток не передается ни в одно записываемое место назначения.

Например, рассмотрим следующий код:

```js
// ВНИМАНИЕ!  СЛОМАНО!
net.createServer((socket) => {
    // Мы добавляем слушателя 'end', но никогда не потребляем данные.
    socket.on('end', () => {
        // Оно никогда не дойдет до нас.
        socket.end(
            'Сообщение было получено, но не было обработано.\n'
        );
    });
}).listen(1337);
```

До Node.js 0.10 данные входящего сообщения просто отбрасывались. Однако в Node.js 0.10 и последующих версиях сокет остается приостановленным навсегда.

Обходным решением в этой ситуации является вызов метода [`stream.resume()`](#readableresume), чтобы начать поток данных:

```js
// Обходной путь.
net.createServer((socket) => {
    socket.on('end', () => {
        socket.end(
            'Сообщение было получено, но не было обработано.\n'
        );
    });

    // Начните поток данных, отбрасывая их.
    socket.resume();
}).listen(1337);
```

В дополнение к новым потокам `Readable`, переходящим в режим потока, потоки в стиле pre-0.10 могут быть обернуты в класс `Readable` с помощью метода [`readable.wrap()`](#readablewrap).

<!-- 0142.part.md -->

### readable.read(0)

Бывают случаи, когда необходимо вызвать обновление базовых механизмов потока readable, не потребляя при этом никаких данных. В таких случаях можно вызвать `readable.read(0)`, который всегда будет возвращать `null`.

Если внутренний буфер чтения находится ниже `highWaterMark`, а поток в данный момент не читает, то вызов `stream.read(0)` вызовет низкоуровневый вызов [`stream._read()`](#readable_read).

Хотя большинству приложений это почти никогда не понадобится, в Node.js есть ситуации, когда это делается, особенно во внутреннем интерфейсе класса потока `Readable`.

<!-- 0143.part.md -->

### readable.push('')

Использование `readable.push('')` не рекомендуется.

Передача строки с нулевым байтом, `Buffer` или `Uint8Array` в поток, который не находится в объектном режиме, имеет интересный побочный эффект. Поскольку это _является_ вызовом [`readable.push()`](#readablepush), вызов завершает процесс чтения. Однако, поскольку аргументом является пустая строка, никакие данные не добавляются в буфер readable, поэтому пользователю нечего потреблять.

<!-- 0144.part.md -->

### `highWaterMark` несоответствие после вызова `readable.setEncoding()`

Использование `readable.setEncoding()` изменит поведение того, как `highWaterMark` работает в безобъектном режиме.

Обычно размер текущего буфера измеряется относительно `highWaterMark` в _байтах_. Однако после вызова `setEncoding()` функция сравнения начнет измерять размер буфера в _символах_.

Это не является проблемой в обычных случаях с `latin1` или `ascii`. Но рекомендуется помнить о таком поведении при работе со строками, которые могут содержать многобайтовые символы.

<!-- 0145.part.md -->
