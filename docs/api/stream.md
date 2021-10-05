# Модуль stream

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/stream.js -->

Поток - это абстрактный интерфейс для работы с потоковыми данными в Node.js. В `stream` модуль предоставляет API для реализации потокового интерфейса.

Node.js. предоставляет множество потоковых объектов. Например, [запрос к HTTP серверу](http.md#class-httpincomingmessage) а также [`process.stdout`](process.md#processstdout) оба экземпляра потока.

Потоки могут быть доступны для чтения, записи или и того, и другого. Все потоки являются экземплярами [`EventEmitter`](events.md#class-eventemitter).

Чтобы получить доступ к `stream` модуль:

```js
const stream = require('stream');
```

В `stream` модуль полезен для создания новых типов экземпляров потока. Обычно нет необходимости использовать `stream` модуль для потребления потоков.

## Организация этого документа

Этот документ содержит два основных раздела и третий раздел для примечаний. В первом разделе объясняется, как использовать существующие потоки в приложении. Во втором разделе объясняется, как создавать новые типы потоков.

## Типы потоков

В Node.js есть четыре основных типа потоков:

- [`Writable`](#class-streamwritable): потоки, в которые можно записывать данные (например, [`fs.createWriteStream()`](fs.md#fscreatewritestreampath-options)).
- [`Readable`](#class-streamreadable): потоки, из которых можно читать данные (например, [`fs.createReadStream()`](fs.md#fscreatereadstreampath-options)).
- [`Duplex`](#class-streamduplex): потоки, которые являются `Readable` а также `Writable` (Например, [`net.Socket`](net.md#class-netsocket)).
- [`Transform`](#class-streamtransform): `Duplex` потоки, которые могут изменять или преобразовывать данные по мере их записи и чтения (например, [`zlib.createDeflate()`](zlib.md#zlibcreatedeflateoptions)).

Дополнительно этот модуль включает служебные функции [`stream.pipeline()`](#streampipelinesource-transforms-destination-callback), [`stream.finished()`](#streamfinishedstream-options-callback), [`stream.Readable.from()`](#streamreadablefromiterable-options) а также [`stream.addAbortSignal()`](#streamaddabortsignalsignal-stream).

### Streams Promises API

<!-- YAML
added: v15.0.0
-->

В `stream/promises` API предоставляет альтернативный набор асинхронных служебных функций для потоков, возвращающих `Promise` объекты вместо использования обратных вызовов. API доступен через `require('stream/promises')` или `require('stream').promises`.

### Объектный режим

Все потоки, созданные API-интерфейсами Node.js, работают исключительно со строками и `Buffer` (или `Uint8Array`) объекты. Однако реализации потоков могут работать с другими типами значений JavaScript (за исключением `null`, который служит специальной цели в потоках). Считается, что такие потоки работают в «объектном режиме».

Экземпляры потока переводятся в объектный режим с помощью `objectMode` вариант при создании потока. Попытка переключить существующий поток в объектный режим небезопасна.

### Буферизация

<!--type=misc-->

Оба [`Writable`](#class-streamwritable) а также [`Readable`](#class-streamreadable) потоки будут хранить данные во внутреннем буфере.

Объем потенциально буферизованных данных зависит от `highWaterMark` опция передана в конструктор потока. Для обычных потоков `highWaterMark` опция указывает [общее количество байтов](#highwatermark-discrepancy-after-calling-readablesetencoding). Для потоков, работающих в объектном режиме, `highWaterMark` указывает общее количество объектов.

Данные буферизируются в `Readable` потоки, когда реализация вызывает [`stream.push(chunk)`](#readablepushchunk-encoding). Если потребитель Stream не вызывает [`stream.read()`](#readablereadsize), данные будут находиться во внутренней очереди до тех пор, пока не будут использованы.

Как только общий размер внутреннего буфера чтения достигнет порога, указанного `highWaterMark`, поток временно прекратит чтение данных из базового ресурса до тех пор, пока буферизованные в данный момент данные не будут использованы (то есть поток перестанет вызывать внутренний [`readable._read()`](#readable_readsize) метод, который используется для заполнения буфера чтения).

Данные буферизируются в `Writable` потоки, когда [`writable.write(chunk)`](#writablewritechunk-encoding-callback) метод вызывается повторно. Хотя общий размер внутреннего буфера записи ниже порога, установленного `highWaterMark`, звонки `writable.write()` вернусь `true`. Как только размер внутреннего буфера достигает или превышает `highWaterMark`, `false` будет возвращен.

Ключевая цель `stream` API, особенно [`stream.pipe()`](#readablepipedestination-options) Метод заключается в том, чтобы ограничить буферизацию данных до приемлемых уровней, чтобы источники и места назначения с разными скоростями не перегружали доступную память.

В `highWaterMark` Параметр является порогом, а не пределом: он определяет объем данных, которые поток буферизует, прежде чем он перестанет запрашивать дополнительные данные. В целом это не налагает строгих ограничений на память. Конкретные реализации потока могут установить более строгие ограничения, но это необязательно.

Потому что [`Duplex`](#class-streamduplex) а также [`Transform`](#class-streamtransform) потоки оба `Readable` а также `Writable`, каждый поддерживает _два_ отдельные внутренние буферы, используемые для чтения и записи, что позволяет каждой стороне работать независимо от другой, поддерживая соответствующий и эффективный поток данных. Например, [`net.Socket`](net.md#class-netsocket) экземпляры [`Duplex`](#class-streamduplex) потоки, чьи `Readable` сторона позволяет потреблять полученные данные _из_ розетка и чья `Writable` сторона позволяет записывать данные _к_ розетка. Поскольку данные могут записываться в сокет с большей или меньшей скоростью, чем их получают, каждая сторона должна работать (и буферизовать) независимо от другой.

Механизм внутренней буферизации является деталью внутренней реализации и может быть изменен в любое время. Однако для некоторых расширенных реализаций внутренние буферы можно получить с помощью `writable.writableBuffer` или `readable.readableBuffer`. Использование этих недокументированных свойств не рекомендуется.

## API для потребителей потоков

<!--type=misc-->

Почти все приложения Node.js, какими бы простыми они ни были, так или иначе используют потоки. Ниже приведен пример использования потоков в приложении Node.js, реализующем HTTP-сервер:

```js
const http = require('http');

const server = http.createServer((req, res) => {
  // `req` is an http.IncomingMessage, which is a readable stream.
  // `res` is an http.ServerResponse, which is a writable stream.

  let body = '';
  // Get the data as utf8 strings.
  // If an encoding is not set, Buffer objects will be received.
  req.setEncoding('utf8');

  // Readable streams emit 'data' events once a listener is added.
  req.on('data', (chunk) => {
    body += chunk;
  });

  // The 'end' event indicates that the entire body has been received.
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      // Write back something interesting to the user:
      res.write(typeof data);
      res.end();
    } catch (er) {
      // uh oh! bad json!
      res.statusCode = 400;
      return res.end(`error: ${er.message}`);
    }
  });
});

server.listen(1337);

// $ curl localhost:1337 -d "{}"
// object
// $ curl localhost:1337 -d "\"foo\""
// string
// $ curl localhost:1337 -d "not json"
// error: Unexpected token o in JSON at position 1
```

[`Writable`](#class-streamwritable) потоки (например, `res` в примере) предоставляют такие методы, как `write()` а также `end()` которые используются для записи данных в поток.

[`Readable`](#class-streamreadable) потоки используют [`EventEmitter`](events.md#class-eventemitter) API для уведомления кода приложения, когда данные доступны для чтения из потока. Эти доступные данные можно прочитать из потока несколькими способами.

Оба [`Writable`](#class-streamwritable) а также [`Readable`](#class-streamreadable) потоки используют [`EventEmitter`](events.md#class-eventemitter) API различными способами для передачи текущего состояния потока.

[`Duplex`](#class-streamduplex) а также [`Transform`](#class-streamtransform) потоки оба [`Writable`](#class-streamwritable) а также [`Readable`](#class-streamreadable).

Приложения, которые либо записывают данные, либо потребляют данные из потока, не обязаны напрямую реализовывать потоковые интерфейсы и, как правило, не имеют причин для вызова `require('stream')`.

Разработчикам, желающим реализовать новые типы потоков, следует обратиться к разделу [API для исполнителей потоковой передачи](#api-for-stream-implementers).

### Записываемые потоки

Записываемые потоки - это абстракция для _место назначения_ в который записываются данные.

Примеры [`Writable`](#class-streamwritable) потоки включают:

- [HTTP-запросы на клиенте](http.md#class-httpclientrequest)
- [HTTP-ответы на сервере](http.md#class-httpserverresponse)
- [потоки записи fs](fs.md#class-fswritestream)
- [потоки zlib](zlib.md)
- [криптопотоки](crypto.md)
- [Сокеты TCP](net.md#class-netsocket)
- [дочерний процесс stdin](child_process.md#subprocessstdin)
- [`process.stdout`](process.md#processstdout), [`process.stderr`](process.md#processstderr)

Некоторые из этих примеров на самом деле [`Duplex`](#class-streamduplex) потоки, реализующие [`Writable`](#class-streamwritable) интерфейс.

Все [`Writable`](#class-streamwritable) потоки реализуют интерфейс, определенный `stream.Writable` класс.

Хотя конкретные экземпляры [`Writable`](#class-streamwritable) потоки могут отличаться по-разному, все `Writable` потоки следуют тому же основному шаблону использования, как показано в примере ниже:

```js
const myStream = getWritableStreamSomehow();
myStream.write('some data');
myStream.write('some more data');
myStream.end('done writing data');
```

#### Класс: `stream.Writable`

<!-- YAML
added: v0.9.4
-->

<!--type=class-->

##### Событие: `'close'`

<!-- YAML
added: v0.9.4
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18438
    description: Add `emitClose` option to specify if `'close'` is emitted on
                 destroy.
-->

В `'close'` Событие генерируется, когда поток и любые его базовые ресурсы (например, файловый дескриптор) закрыты. Событие указывает, что больше никаких событий не будет, и никаких дальнейших вычислений не будет.

А [`Writable`](#class-streamwritable) поток всегда будет излучать `'close'` событие, если оно создано с `emitClose` вариант.

##### Событие: `'drain'`

<!-- YAML
added: v0.9.4
-->

Если звонок на [`stream.write(chunk)`](#writablewritechunk-encoding-callback) возвращается `false`, то `'drain'` Событие будет сгенерировано, когда будет необходимо возобновить запись данных в поток.

```js
// Write the data to the supplied writable stream one million times.
// Be attentive to back-pressure.
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
        // Last time!
        writer.write(data, encoding, callback);
      } else {
        // See if we should continue, or wait.
        // Don't pass the callback, because we're not done yet.
        ok = writer.write(data, encoding);
      }
    } while (i > 0 && ok);
    if (i > 0) {
      // Had to stop early!
      // Write some more once it drains.
      writer.once('drain', write);
    }
  }
}
```

##### Событие: `'error'`

<!-- YAML
added: v0.9.4
-->

- {Ошибка}

В `'error'` Событие генерируется, если произошла ошибка при записи или передаче данных. Обратному вызову слушателя передается один `Error` аргумент при вызове.

Поток закрывается, когда `'error'` событие генерируется, если только [`autoDestroy`](#new-streamwritableoptions) опция была установлена на `false` при создании потока.

После `'error'`, никаких других событий кроме `'close'` _должен_ быть выпущенным (в том числе `'error'` События).

##### Событие: `'finish'`

<!-- YAML
added: v0.9.4
-->

В `'finish'` событие испускается после [`stream.end()`](#writableendchunk-encoding-callback) был вызван, и все данные были сброшены в базовую систему.

```js
const writer = getWritableStreamSomehow();
for (let i = 0; i < 100; i++) {
  writer.write(`hello, #${i}!\n`);
}
writer.on('finish', () => {
  console.log('All writes are now complete.');
});
writer.end('This is the end\n');
```

##### Событие: `'pipe'`

<!-- YAML
added: v0.9.4
-->

- `src` {stream.Readable} исходный поток, который пересылается в этот доступный для записи

В `'pipe'` событие генерируется, когда [`stream.pipe()`](#readablepipedestination-options) вызывается в доступном для чтения потоке, добавляя этот доступный для записи набору адресатов.

```js
const writer = getWritableStreamSomehow();
const reader = getReadableStreamSomehow();
writer.on('pipe', (src) => {
  console.log('Something is piping into the writer.');
  assert.equal(src, reader);
});
reader.pipe(writer);
```

##### Событие: `'unpipe'`

<!-- YAML
added: v0.9.4
-->

- `src` {stream.Readable} Исходный поток, который [без трубопровода](#readableunpipedestination) это записываемое

В `'unpipe'` событие генерируется, когда [`stream.unpipe()`](#readableunpipedestination) метод вызывается на [`Readable`](#class-streamreadable) поток, удалив это [`Writable`](#class-streamwritable) из своего набора направлений.

Это также излучается в случае, если это [`Writable`](#class-streamwritable) поток выдает ошибку, когда [`Readable`](#class-streamreadable) струйные трубы в него.

```js
const writer = getWritableStreamSomehow();
const reader = getReadableStreamSomehow();
writer.on('unpipe', (src) => {
  console.log(
    'Something has stopped piping into the writer.'
  );
  assert.equal(src, reader);
});
reader.pipe(writer);
reader.unpipe(writer);
```

##### `writable.cork()`

<!-- YAML
added: v0.11.2
-->

В `writable.cork()` метод заставляет все записанные данные буферизироваться в памяти. Буферизованные данные будут сброшены, когда либо [`stream.uncork()`](#writableuncork) или [`stream.end()`](#writableendchunk-encoding-callback) методы называются.

Основная цель `writable.cork()` предназначен для учета ситуации, в которой несколько небольших фрагментов записываются в поток в быстрой последовательности. Вместо того, чтобы сразу пересылать их в основной пункт назначения, `writable.cork()` буферизует все куски до тех пор, пока `writable.uncork()` вызывается, который передаст их всех `writable._writev()`, если представить. Это предотвращает ситуацию блокировки заголовка строки, когда данные буферизируются в ожидании обработки первого небольшого фрагмента. Однако использование `writable.cork()` без реализации `writable._writev()` может отрицательно сказаться на пропускной способности.

Смотрите также: [`writable.uncork()`](#writableuncork), [`writable._writev()`](#writable_writevchunks-callback).

##### `writable.destroy([error])`

<!-- YAML
added: v8.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/29197
    description: Work as a no-op on a stream that has already been destroyed.
-->

- `error` {Error} Необязательно, сообщение об ошибке `'error'` событие.
- Возвращает: {this}

Уничтожьте поток. При желании испустить `'error'` событие и испустить `'close'` событие (если `emitClose` установлен на `false`). После этого вызова доступный для записи поток закончился, и последующие вызовы `write()` или `end()` приведет к `ERR_STREAM_DESTROYED` ошибка. Это разрушительный и немедленный способ уничтожить ручей. Предыдущие звонки на `write()` может не стекать и может вызвать `ERR_STREAM_DESTROYED` ошибка. Использовать `end()` вместо уничтожения, если данные должны быть сброшены перед закрытием, или дождаться `'drain'` событие перед уничтожением потока.

```cjs
const { Writable } = require('stream');

const myStream = new Writable();

const fooErr = new Error('foo error');
myStream.destroy(fooErr);
myStream.on('error', (fooErr) =>
  console.error(fooErr.message)
); // foo error
```

```cjs
const { Writable } = require('stream');

const myStream = new Writable();

myStream.destroy();
myStream.on('error', function wontHappen() {});
```

```cjs
const { Writable } = require('stream');

const myStream = new Writable();
myStream.destroy();

myStream.write('foo', (error) => console.error(error.code));
// ERR_STREAM_DESTROYED
```

Один раз `destroy()` был вызван, любые дальнейшие вызовы не будут выполняться, и никаких других ошибок, кроме `_destroy()` может быть выпущен как `'error'`.

Разработчикам не следует переопределять этот метод, а вместо этого реализовывать [`writable._destroy()`](#writable_destroyerr-callback).

##### `writable.destroyed`

<!-- YAML
added: v8.0.0
-->

- {логический}

Является `true` после [`writable.destroy()`](#writabledestroyerror) был вызван.

```cjs
const { Writable } = require('stream');

const myStream = new Writable();

console.log(myStream.destroyed); // false
myStream.destroy();
console.log(myStream.destroyed); // true
```

##### `writable.end([chunk[, encoding]][, callback])`

<!-- YAML
added: v0.9.4
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/34101
    description: The `callback` is invoked before 'finish' or on error.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/29747
    description: The `callback` is invoked if 'finish' or 'error' is emitted.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18780
    description: This method now returns a reference to `writable`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11608
    description: The `chunk` argument can now be a `Uint8Array` instance.
-->

- `chunk` {string | Buffer | Uint8Array | any} Необязательные данные для записи. Для потоков, не работающих в объектном режиме, `chunk` должно быть строкой, `Buffer` или `Uint8Array`. Для потоков в объектном режиме `chunk` может быть любое значение JavaScript, кроме `null`.
- `encoding` {строка} Кодировка, если `chunk` это строка
- `callback` {Функция} Обратный вызов, когда поток завершен.
- Возвращает: {this}

Вызов `writable.end()` метод сигнализирует о том, что данные больше не будут записываться в [`Writable`](#class-streamwritable). Необязательный `chunk` а также `encoding` Аргументы позволяют записать последний дополнительный фрагмент данных непосредственно перед закрытием потока.

Вызов [`stream.write()`](#writablewritechunk-encoding-callback) метод после вызова [`stream.end()`](#writableendchunk-encoding-callback) вызовет ошибку.

```js
// Write 'hello, ' and then end with 'world!'.
const fs = require('fs');
const file = fs.createWriteStream('example.txt');
file.write('hello, ');
file.end('world!');
// Writing more now is not allowed!
```

##### `writable.setDefaultEncoding(encoding)`

<!-- YAML
added: v0.11.15
changes:
  - version: v6.1.0
    pr-url: https://github.com/nodejs/node/pull/5040
    description: This method now returns a reference to `writable`.
-->

- `encoding` {строка} Новая кодировка по умолчанию
- Возвращает: {this}

В `writable.setDefaultEncoding()` метод устанавливает значение по умолчанию `encoding` для [`Writable`](#class-streamwritable) транслировать.

##### `writable.uncork()`

<!-- YAML
added: v0.11.2
-->

В `writable.uncork()` метод очищает все данные, буферизованные, так как [`stream.cork()`](#writablecork) назывался.

Когда используешь [`writable.cork()`](#writablecork) а также `writable.uncork()` для управления буферизацией записи в поток рекомендуется, чтобы вызовы `writable.uncork()` быть отложенным с использованием `process.nextTick()`. Это позволяет группировать все `writable.write()` вызовы, которые происходят в рамках данной фазы цикла событий Node.js.

```js
stream.cork();
stream.write('some ');
stream.write('data ');
process.nextTick(() => stream.uncork());
```

Если [`writable.cork()`](#writablecork) метод вызывается несколько раз в потоке, такое же количество вызовов `writable.uncork()` должен быть вызван для очистки буферизованных данных.

```js
stream.cork();
stream.write('some ');
stream.cork();
stream.write('data ');
process.nextTick(() => {
  stream.uncork();
  // The data will not be flushed until uncork() is called a second time.
  stream.uncork();
});
```

Смотрите также: [`writable.cork()`](#writablecork).

##### `writable.writable`

<!-- YAML
added: v11.4.0
-->

- {логический}

Является `true` если можно позвонить [`writable.write()`](#writablewritechunk-encoding-callback), что означает, что поток не был уничтожен, не содержит ошибок и не завершен.

##### `writable.writableEnded`

<!-- YAML
added: v12.9.0
-->

- {логический}

Является `true` после [`writable.end()`](#writableendchunk-encoding-callback) был вызван. Это свойство не указывает, были ли данные сброшены, для этого использования. [`writable.writableFinished`](#writablewritablefinished) вместо.

##### `writable.writableCorked`

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

- {целое число}

Количество раз [`writable.uncork()`](#writableuncork) необходимо вызвать, чтобы полностью откупорить поток.

##### `writable.writableFinished`

<!-- YAML
added: v12.6.0
-->

- {логический}

Установлен на `true` непосредственно перед [`'finish'`](#event-finish) событие испускается.

##### `writable.writableHighWaterMark`

<!-- YAML
added: v9.3.0
-->

- {количество}

Вернуть значение `highWaterMark` прошло при создании этого `Writable`.

##### `writable.writableLength`

<!-- YAML
added: v9.4.0
-->

- {количество}

Это свойство содержит количество байтов (или объектов) в очереди, готовых к записи. Значение предоставляет данные самоанализа относительно статуса `highWaterMark`.

##### `writable.writableNeedDrain`

<!-- YAML
added:
  - v15.2.0
  - v14.17.0
-->

- {логический}

Является `true` если буфер потока был заполнен и поток выдаст `'drain'`.

##### `writable.writableObjectMode`

<!-- YAML
added: v12.3.0
-->

- {логический}

Получатель недвижимости `objectMode` данного `Writable` транслировать.

##### `writable.write(chunk[, encoding][, callback])`

<!-- YAML
added: v0.9.4
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11608
    description: The `chunk` argument can now be a `Uint8Array` instance.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/6170
    description: Passing `null` as the `chunk` parameter will always be
                 considered invalid now, even in object mode.
-->

- `chunk` {string | Buffer | Uint8Array | any} Необязательные данные для записи. Для потоков, не работающих в объектном режиме, `chunk` должно быть строкой, `Buffer` или `Uint8Array`. Для потоков в объектном режиме `chunk` может быть любое значение JavaScript, кроме `null`.
- `encoding` {string | null} Кодировка, если `chunk` это строка. **Дефолт:** `'utf8'`
- `callback` {Функция} Обратный вызов, когда этот фрагмент данных сбрасывается.
- Возвращает: {логическое} `false` если поток хочет, чтобы вызывающий код дождался `'drain'` событие, которое должно быть сгенерировано перед продолжением записи дополнительных данных; иначе `true`.

В `writable.write()` метод записывает некоторые данные в поток и вызывает предоставленный `callback` как только данные будут полностью обработаны. В случае ошибки `callback` будет вызываться с ошибкой в качестве первого аргумента. В `callback` вызывается асинхронно и до `'error'` испускается.

Возвращаемое значение - `true` если внутренний буфер меньше `highWaterMark` настроен, когда поток был создан после допуска `chunk`. Если `false` возвращается, дальнейшие попытки записи данных в поток должны прекратиться до тех пор, пока [`'drain'`](#event-drain) событие испускается.

Пока поток не сливается, звонки на `write()` буферизирует `chunk`, и верните false. После того, как все буферизованные в данный момент фрагменты опустошены (приняты для доставки операционной системой), `'drain'` событие будет выпущено. Рекомендуется один раз `write()` возвращает false, блоки больше не будут записаны до тех пор, пока `'drain'` событие испускается. Во время звонка `write()` в потоке, который не истощается, разрешено, Node.js будет буферизовать все записанные фрагменты до тех пор, пока не будет достигнуто максимальное использование памяти, после чего он будет безоговорочно прерван. Даже до того, как он прервется, большое использование памяти приведет к низкой производительности сборщика мусора и высокому RSS (который обычно не возвращается в систему, даже после того, как память больше не требуется). Поскольку сокеты TCP могут никогда не истощаться, если удаленный узел не читает данные, запись в сокет, который не истощает, может привести к уязвимости, которую можно использовать удаленно.

Запись данных, когда поток не истощается, особенно проблематичен для [`Transform`](#class-streamtransform), поскольку `Transform` потоки по умолчанию приостанавливаются до тех пор, пока они не будут переданы по конвейеру или `'data'` или `'readable'` добавлен обработчик событий.

Если данные для записи могут быть сгенерированы или получены по запросу, рекомендуется инкапсулировать логику в [`Readable`](#class-streamreadable) и использовать [`stream.pipe()`](#readablepipedestination-options). Однако если позвонить `write()` является предпочтительным, можно учитывать противодавление и избегать проблем с памятью, используя [`'drain'`](#event-drain) событие:

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

А `Writable` поток в объектном режиме всегда будет игнорировать `encoding` аргумент.

### Читаемые потоки

Читаемые потоки - это абстракция для _источник_ откуда потребляются данные.

Примеры `Readable` потоки включают:

- [HTTP-ответы на клиенте](http.md#class-httpincomingmessage)
- [HTTP-запросы на сервере](http.md#class-httpincomingmessage)
- [потоки чтения fs](fs.md#class-fsreadstream)
- [потоки zlib](zlib.md)
- [криптопотоки](crypto.md)
- [Сокеты TCP](net.md#class-netsocket)
- [дочерний процесс stdout и stderr](child_process.md#subprocessstdout)
- [`process.stdin`](process.md#processstdin)

Все [`Readable`](#class-streamreadable) потоки реализуют интерфейс, определенный `stream.Readable` класс.

#### Два режима чтения

`Readable` потоки эффективно работают в одном из двух режимов: текущем и приостановленном. Эти режимы отделены от [объектный режим](#object-mode). А [`Readable`](#class-streamreadable) stream может быть в объектном режиме или нет, независимо от того, находится ли он в потоковом режиме или в режиме паузы.

- В потоковом режиме данные автоматически считываются из базовой системы и предоставляются приложению как можно быстрее с использованием событий через [`EventEmitter`](events.md#class-eventemitter) интерфейс.

- В приостановленном режиме [`stream.read()`](#readablereadsize) Метод должен вызываться явно для чтения фрагментов данных из потока.

Все [`Readable`](#class-streamreadable) потоки начинаются в приостановленном режиме, но могут быть переключены в текущий режим одним из следующих способов:

- Добавление [`'data'`](#event-data) обработчик события.
- Вызов [`stream.resume()`](#readableresume) метод.
- Вызов [`stream.pipe()`](#readablepipedestination-options) метод отправки данных в [`Writable`](#class-streamwritable).

В `Readable` можно вернуться в режим паузы, используя одно из следующих действий:

- Если адресатов каналов нет, позвонив в [`stream.pause()`](#readablepause) метод.
- Если есть пункты назначения каналов, удалив все пункты назначения каналов. Несколько пунктов назначения каналов можно удалить, вызвав [`stream.unpipe()`](#readableunpipedestination) метод.

Важно помнить, что `Readable` не будет генерировать данные, пока не будет предоставлен механизм для использования или игнорирования этих данных. Если потребляющий механизм отключен или убран, `Readable` буду _пытаться_ чтобы прекратить генерировать данные.

По причинам обратной совместимости удаление [`'data'`](#event-data) обработчики событий будут **нет** автоматически приостанавливает трансляцию. Кроме того, если есть направления по трубопроводу, то вызов [`stream.pause()`](#readablepause) не гарантирует, что поток будет _оставаться_ приостанавливается, когда эти пункты назначения истощаются, и запрашивают дополнительные данные.

Если [`Readable`](#class-streamreadable) переключен в поточный режим, и нет доступных потребителей для обработки данных, эти данные будут потеряны. Это может произойти, например, когда `readable.resume()` метод вызывается без слушателя, прикрепленного к `'data'` событие, или когда `'data'` обработчик событий удаляется из потока.

Добавление [`'readable'`](#event-readable) обработчик событий автоматически останавливает поток, и данные должны потребляться через [`readable.read()`](#readablereadsize). Если [`'readable'`](#event-readable) обработчик событий удаляется, тогда поток снова начнет течь, если есть [`'data'`](#event-data) обработчик события.

#### Три состояния

«Два режима» работы для `Readable` stream - это упрощенная абстракция для более сложного управления внутренним состоянием, которое происходит внутри `Readable` реализация потока.

В частности, в любой момент времени каждый `Readable` находится в одном из трех возможных состояний:

- `readable.readableFlowing === null`
- `readable.readableFlowing === false`
- `readable.readableFlowing === true`

Когда `readable.readableFlowing` является `null`, механизма для использования данных потока не предусмотрено. Следовательно, поток не будет генерировать данные. В этом состоянии прикрепление слушателя для `'data'` событие, вызывая `readable.pipe()` метод или вызов `readable.resume()` метод переключится `readable.readableFlowing` к `true`, вызывая `Readable` чтобы начать активно излучать события по мере создания данных.

Вызов `readable.pause()`, `readable.unpipe()`, или получение противодавления вызовет `readable.readableFlowing` быть установленным как `false`, временно останавливая поток событий, но _нет_ остановка генерации данных. В этом состоянии прикрепление слушателя для `'data'` событие не переключится `readable.readableFlowing` к `true`.

```js
const { PassThrough, Writable } = require('stream');
const pass = new PassThrough();
const writable = new Writable();

pass.pipe(writable);
pass.unpipe(writable);
// readableFlowing is now false.

pass.on('data', (chunk) => {
  console.log(chunk.toString());
});
pass.write('ok'); // Will not emit 'data'.
pass.resume(); // Must be called to make stream emit 'data'.
```

В то время как `readable.readableFlowing` является `false`данные могут накапливаться во внутреннем буфере потока.

#### Выберите один стиль API

В `Readable` Stream API развивался в нескольких версиях Node.js и предоставляет несколько методов использования потоковых данных. В общем, разработчикам следует выбирать _один_ методов потребления данных и _Никогда не следует_ использовать несколько методов для получения данных из одного потока. В частности, используя комбинацию `on('data')`, `on('readable')`, `pipe()`, или асинхронные итераторы могут привести к неинтуитивному поведению.

Использование `readable.pipe()` Метод рекомендуется для большинства пользователей, так как он был реализован, чтобы обеспечить самый простой способ использования потоковых данных. Разработчики, которым требуется более детальный контроль над передачей и генерацией данных, могут использовать [`EventEmitter`](events.md#class-eventemitter) а также `readable.on('readable')`/`readable.read()` или `readable.pause()`/`readable.resume()` API.

#### Класс: `stream.Readable`

<!-- YAML
added: v0.9.4
-->

<!--type=class-->

##### Событие: `'close'`

<!-- YAML
added: v0.9.4
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18438
    description: Add `emitClose` option to specify if `'close'` is emitted on
                 destroy.
-->

В `'close'` Событие генерируется, когда поток и любые его базовые ресурсы (например, файловый дескриптор) закрыты. Событие указывает, что больше никаких событий не будет, и никаких дальнейших вычислений не будет.

А [`Readable`](#class-streamreadable) поток всегда будет излучать `'close'` событие, если оно создано с `emitClose` вариант.

##### Событие: `'data'`

<!-- YAML
added: v0.9.4
-->

- `chunk` {Buffer | string | any} Фрагмент данных. Для потоков, которые не работают в объектном режиме, фрагмент будет либо строкой, либо `Buffer`. Для потоков, находящихся в объектном режиме, фрагмент может быть любым значением JavaScript, кроме `null`.

В `'data'` Событие генерируется всякий раз, когда поток передает право собственности на блок данных потребителю. Это может происходить всякий раз, когда поток переключается в текущий режим путем вызова `readable.pipe()`, `readable.resume()`, или прикрепив обратный вызов слушателя к `'data'` событие. В `'data'` событие также будет сгенерировано всякий раз, когда `readable.read()` вызывается метод, и доступен для возврата фрагмент данных.

Прикрепление `'data'` прослушиватель событий для потока, который не был явно приостановлен, переключит поток в текущий режим. Затем данные будут переданы, как только они станут доступны.

Обратному вызову слушателя будет передан фрагмент данных в виде строки, если для потока была указана кодировка по умолчанию с использованием `readable.setEncoding()` метод; в противном случае данные будут переданы как `Buffer`.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
});
```

##### Событие: `'end'`

<!-- YAML
added: v0.9.4
-->

В `'end'` Событие генерируется, когда из потока больше нет данных для потребления.

В `'end'` событие **не будет испускаться** если данные не будут полностью израсходованы. Это можно сделать, переключив поток в текущий режим или вызвав [`stream.read()`](#readablereadsize) несколько раз, пока все данные не будут использованы.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
});
readable.on('end', () => {
  console.log('There will be no more data.');
});
```

##### Событие: `'error'`

<!-- YAML
added: v0.9.4
-->

- {Ошибка}

В `'error'` событие может быть отправлено `Readable` реализация в любое время. Как правило, это может произойти, если базовый поток не может генерировать данные из-за основного внутреннего сбоя или когда реализация потока пытается протолкнуть недопустимый фрагмент данных.

Обратный вызов слушателя будет передан одним `Error` объект.

##### Событие: `'pause'`

<!-- YAML
added: v0.9.4
-->

В `'pause'` событие генерируется, когда [`stream.pause()`](#readablepause) называется и `readableFlowing` не является `false`.

##### Событие: `'readable'`

<!-- YAML
added: v0.9.4
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/17979
    description: The `'readable'` is always emitted in the next tick after
                 `.push()` is called.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18994
    description: Using `'readable'` requires calling `.read()`.
-->

В `'readable'` Событие генерируется, когда есть данные, доступные для чтения из потока, или когда достигнут конец потока. Фактически, `'readable'` событие указывает, что в потоке есть новая информация. Если данные доступны, [`stream.read()`](#readablereadsize) вернет эти данные.

```js
const readable = getReadableStreamSomehow();
readable.on('readable', function () {
  // There is some data to read now.
  let data;

  while ((data = this.read())) {
    console.log(data);
  }
});
```

Если достигнут конец потока, вызывается [`stream.read()`](#readablereadsize) вернусь `null` и вызвать `'end'` событие. Это также верно, если никогда не было никаких данных для чтения. Например, в следующем примере `foo.txt` это пустой файл:

```js
const fs = require('fs');
const rr = fs.createReadStream('foo.txt');
rr.on('readable', () => {
  console.log(`readable: ${rr.read()}`);
});
rr.on('end', () => {
  console.log('end');
});
```

Результат выполнения этого сценария:

```console
$ node test.js
readable: null
end
```

В некоторых случаях добавление слушателя для `'readable'` событие вызовет чтение некоторого количества данных во внутренний буфер.

В целом `readable.pipe()` а также `'data'` механизмы событий легче понять, чем `'readable'` событие. Однако обработка `'readable'` может привести к увеличению пропускной способности.

Если оба `'readable'` а также [`'data'`](#event-data) используются одновременно, `'readable'` имеет приоритет при управлении потоком, т. е. `'data'` будет выпущен только тогда, когда [`stream.read()`](#readablereadsize) называется. В `readableFlowing` собственность станет `false`. Если есть `'data'` слушатели, когда `'readable'` удаляется, поток начнет течь, т.е. `'data'`события будут отправляться без вызова `.resume()`.

##### Событие: `'resume'`

<!-- YAML
added: v0.9.4
-->

В `'resume'` событие генерируется, когда [`stream.resume()`](#readableresume) называется и `readableFlowing` не является `true`.

##### `readable.destroy([error])`

<!-- YAML
added: v8.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/29197
    description: Work as a no-op on a stream that has already been destroyed.
-->

- `error` {Error} Ошибка, которая будет передана как полезная нагрузка в `'error'` событие
- Возвращает: {this}

Уничтожьте поток. При желании испустить `'error'` событие и испустить `'close'` событие (если `emitClose` установлен на `false`). После этого вызова читаемый поток освободит все внутренние ресурсы и последующие вызовы `push()` будут проигнорированы.

Один раз `destroy()` был вызван, любые дальнейшие вызовы не будут выполняться, и никаких других ошибок, кроме `_destroy()` может быть выпущен как `'error'`.

Разработчикам не следует переопределять этот метод, а вместо этого реализовывать [`readable._destroy()`](#readable_destroyerr-callback).

##### `readable.destroyed`

<!-- YAML
added: v8.0.0
-->

- {логический}

Является `true` после [`readable.destroy()`](#readabledestroyerror) был вызван.

##### `readable.isPaused()`

<!-- YAML
added: v0.11.14
-->

- Возвращает: {логическое}

В `readable.isPaused()` метод возвращает текущее рабочее состояние `Readable`. Это используется главным образом механизмом, лежащим в основе `readable.pipe()` метод. В большинстве типичных случаев нет причин использовать этот метод напрямую.

```js
const readable = new stream.Readable();

readable.isPaused(); // === false
readable.pause();
readable.isPaused(); // === true
readable.resume();
readable.isPaused(); // === false
```

##### `readable.pause()`

<!-- YAML
added: v0.9.4
-->

- Возвращает: {this}

В `readable.pause()` метод приведет к тому, что поток в текущем режиме перестанет излучать [`'data'`](#event-data) события, выход из проточного режима. Любые данные, которые становятся доступными, останутся во внутреннем буфере.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
  readable.pause();
  console.log(
    'There will be no additional data for 1 second.'
  );
  setTimeout(() => {
    console.log('Now data will start flowing again.');
    readable.resume();
  }, 1000);
});
```

В `readable.pause()` метод не действует, если есть `'readable'` слушатель событий.

##### `readable.pipe(destination[, options])`

<!-- YAML
added: v0.9.4
-->

- `destination` {stream.Writable} Место назначения для записи данных
- `options` {Object} Параметры трубы
  - `end` {boolean} Завершить писателя, когда закончится читатель. **Дефолт:** `true`.
- Возвращает: {stream.Writable} _место назначения_, учитывая цепочку труб, если это [`Duplex`](#class-streamduplex) или [`Transform`](#class-streamtransform) транслировать

В `readable.pipe()` метод прикрепляет [`Writable`](#class-streamwritable) поток к `readable`, заставляя его автоматически переключаться в режим потока и передавать все свои данные в подключенный [`Writable`](#class-streamwritable). Поток данных будет управляться автоматически, так что пункт назначения `Writable` поток не перегружен более быстрым `Readable` транслировать.

В следующем примере передаются все данные из `readable` в файл с именем `file.txt`:

```js
const fs = require('fs');
const readable = getReadableStreamSomehow();
const writable = fs.createWriteStream('file.txt');
// All the data from readable goes into 'file.txt'.
readable.pipe(writable);
```

Можно прикрепить несколько `Writable` потоки к синглу `Readable` транслировать.

В `readable.pipe()` метод возвращает ссылку на _место назначения_ stream, позволяющий создавать цепочки конвейерных потоков:

```js
const fs = require('fs');
const r = fs.createReadStream('file.txt');
const z = zlib.createGzip();
const w = fs.createWriteStream('file.txt.gz');
r.pipe(z).pipe(w);
```

По умолчанию, [`stream.end()`](#writableendchunk-encoding-callback) вызывается по месту назначения `Writable` поток, когда источник `Readable` поток излучает [`'end'`](#event-end), так что адрес назначения больше не доступен для записи. Чтобы отключить это поведение по умолчанию, `end` вариант можно передать как `false`, в результате чего целевой поток остается открытым:

```js
reader.pipe(writer, { end: false });
reader.on('end', () => {
  writer.end('Goodbye\n');
});
```

Одно важное предостережение: если `Readable` поток выдает ошибку во время обработки, `Writable` место назначения _не закрыто_ автоматически. В случае возникновения ошибки необходимо будет _вручную_ закройте каждый поток, чтобы предотвратить утечку памяти.

В [`process.stderr`](process.md#processstderr) а также [`process.stdout`](process.md#processstdout) `Writable` потоки никогда не закрываются, пока процесс Node.js не завершится, независимо от указанных параметров.

##### `readable.read([size])`

<!-- YAML
added: v0.9.4
-->

- `size` {number} Необязательный аргумент для указания количества данных для чтения.
- Возвращает: {string | Buffer | null | any}.

В `readable.read()` метод извлекает некоторые данные из внутреннего буфера и возвращает их. Если нет данных для чтения, `null` возвращается. По умолчанию данные будут возвращены в виде `Buffer` объект, если кодировка не была указана с помощью `readable.setEncoding()` или поток работает в объектном режиме.

Необязательный `size` Аргумент указывает определенное количество байтов для чтения. Если `size` байты недоступны для чтения, `null` будет возвращен _пока не_ поток закончился, и в этом случае будут возвращены все данные, оставшиеся во внутреннем буфере.

Если `size` аргумент не указан, будут возвращены все данные, содержащиеся во внутреннем буфере.

В `size` аргумент должен быть меньше или равен 1 ГиБ.

В `readable.read()` метод должен вызываться только на `Readable` потоки, работающие в приостановленном режиме. В проточном режиме, `readable.read()` вызывается автоматически до тех пор, пока внутренний буфер не будет полностью опустошен.

```js
const readable = getReadableStreamSomehow();

// 'readable' may be triggered multiple times as data is buffered in
readable.on('readable', () => {
  let chunk;
  console.log(
    'Stream is readable (new data received in buffer)'
  );
  // Use a loop to make sure we read all currently available data
  while (null !== (chunk = readable.read())) {
    console.log(`Read ${chunk.length} bytes of data...`);
  }
});

// 'end' will be triggered once when there is no more data available
readable.on('end', () => {
  console.log('Reached end of stream.');
});
```

Каждый звонок `readable.read()` возвращает фрагмент данных или `null`. Фрагменты не объединяются. А `while` цикл необходим для использования всех данных, находящихся в данный момент в буфере. При чтении большого файла `.read()` может вернуться `null`, до сих пор израсходовав весь буферизованный контент, но есть еще данные, которые еще не буферизованы. В этом случае новый `'readable'` Событие будет сгенерировано, когда в буфере будет больше данных. Наконец `'end'` событие будет сгенерировано, когда больше не будет данных.

Следовательно, чтобы прочитать все содержимое файла из `readable`необходимо собирать куски по нескольким `'readable'` События:

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

А `Readable` поток в объектном режиме всегда будет возвращать один элемент из вызова [`readable.read(size)`](#readablereadsize), независимо от стоимости `size` аргумент.

Если `readable.read()` метод возвращает фрагмент данных, `'data'` событие также будет выпущено.

Вызов [`stream.read([size])`](#readablereadsize) после [`'end'`](#event-end) событие было отправлено, вернется `null`. Ошибка выполнения не возникнет.

##### `readable.readable`

<!-- YAML
added: v11.4.0
-->

- {логический}

Является `true` если можно позвонить [`readable.read()`](#readablereadsize), что означает, что поток не был уничтожен или испущен `'error'` или `'end'`.

##### `readable.readableAborted`

<!-- YAML
added: v16.8.0
-->

> Стабильность: 1 - экспериментальная

- {логический}

Возвращает, был ли поток уничтожен или ошибался перед отправкой. `'end'`.

##### `readable.readableDidRead`

<!-- YAML
added:
  - v16.7.0
  - v14.18.0
-->

> Стабильность: 1 - экспериментальная

- {логический}

Возвращает ли `'data'` был выпущен.

##### `readable.readableEncoding`

<!-- YAML
added: v12.7.0
-->

- {null | строка}

Получатель недвижимости `encoding` данного `Readable` транслировать. В `encoding` свойство можно установить с помощью [`readable.setEncoding()`](#readablesetencodingencoding) метод.

##### `readable.readableEnded`

<!-- YAML
added: v12.9.0
-->

- {логический}

Становится `true` когда [`'end'`](#event-end) событие испускается.

##### `readable.readableFlowing`

<!-- YAML
added: v9.4.0
-->

- {логический}

Это свойство отражает текущее состояние `Readable` поток, как описано в [Три состояния](#three-states) раздел.

##### `readable.readableHighWaterMark`

<!-- YAML
added: v9.3.0
-->

- {количество}

Возвращает значение `highWaterMark` прошло при создании этого `Readable`.

##### `readable.readableLength`

<!-- YAML
added: v9.4.0
-->

- {количество}

Это свойство содержит количество байтов (или объектов) в очереди, готовых к чтению. Значение предоставляет данные самоанализа относительно статуса `highWaterMark`.

##### `readable.readableObjectMode`

<!-- YAML
added: v12.3.0
-->

- {логический}

Получатель недвижимости `objectMode` данного `Readable` транслировать.

##### `readable.resume()`

<!-- YAML
added: v0.9.4
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18994
    description: The `resume()` has no effect if there is a `'readable'` event
                 listening.
-->

- Возвращает: {this}

В `readable.resume()` метод вызывает явно приостановленную `Readable` поток, чтобы возобновить передачу [`'data'`](#event-data) события, переводящие поток в текущий режим.

В `readable.resume()` может использоваться для полного использования данных из потока без фактической обработки каких-либо из этих данных:

```js
getReadableStreamSomehow()
  .resume()
  .on('end', () => {
    console.log(
      'Reached the end, but did not read anything.'
    );
  });
```

В `readable.resume()` метод не действует, если есть `'readable'` слушатель событий.

##### `readable.setEncoding(encoding)`

<!-- YAML
added: v0.9.4
-->

- `encoding` {строка} Используемая кодировка.
- Возвращает: {this}

В `readable.setEncoding()` устанавливает кодировку символов для данных, считываемых из `Readable` транслировать.

По умолчанию кодировка не назначается, и данные потока будут возвращены как `Buffer` объекты. Установка кодировки приводит к тому, что данные потока возвращаются как строки указанной кодировки, а не как `Buffer` объекты. Например, позвонив `readable.setEncoding('utf8')` приведет к тому, что выходные данные будут интерпретироваться как данные UTF-8 и передаваться как строки. Вызов `readable.setEncoding('hex')` приведет к кодированию данных в шестнадцатеричном строковом формате.

В `Readable` stream будет правильно обрабатывать многобайтовые символы, доставленные через поток, которые в противном случае были бы неправильно декодированы, если бы их просто вытащили из потока как `Buffer` объекты.

```js
const readable = getReadableStreamSomehow();
readable.setEncoding('utf8');
readable.on('data', (chunk) => {
  assert.equal(typeof chunk, 'string');
  console.log(
    'Got %d characters of string data:',
    chunk.length
  );
});
```

##### `readable.unpipe([destination])`

<!-- YAML
added: v0.9.4
-->

- `destination` {stream.Writable} Необязательный конкретный поток для отключения
- Возвращает: {this}

В `readable.unpipe()` метод отсоединяет `Writable` поток, ранее прикрепленный с помощью [`stream.pipe()`](#readablepipedestination-options) метод.

Если `destination` не указано, то _все_ трубы отсоединены.

Если `destination` указан, но для него не настроен канал, тогда метод ничего не делает.

```js
const fs = require('fs');
const readable = getReadableStreamSomehow();
const writable = fs.createWriteStream('file.txt');
// All the data from readable goes into 'file.txt',
// but only for the first second.
readable.pipe(writable);
setTimeout(() => {
  console.log('Stop writing to file.txt.');
  readable.unpipe(writable);
  console.log('Manually close the file stream.');
  writable.end();
}, 1000);
```

##### `readable.unshift(chunk[, encoding])`

<!-- YAML
added: v0.9.11
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11608
    description: The `chunk` argument can now be a `Uint8Array` instance.
-->

- `chunk` {Buffer | Uint8Array | string | null | any} Фрагмент данных, который нужно перенести в очередь чтения. Для потоков, не работающих в объектном режиме, `chunk` должно быть строкой, `Buffer`, `Uint8Array` или `null`. Для потоков в объектном режиме `chunk` может быть любым значением JavaScript.
- `encoding` {строка} Кодировка фрагментов строки. Должен быть действительным `Buffer` кодирование, например `'utf8'` или `'ascii'`.

Проходящий `chunk` в качестве `null` сигнализирует об окончании потока (EOF) и ведет себя так же, как `readable.push(null)`, после чего запись данных невозможна. Сигнал EOF помещается в конец буфера, и все буферизованные данные все равно будут сброшены.

В `readable.unshift()` возвращает часть данных во внутренний буфер. Это полезно в определенных ситуациях, когда поток потребляется кодом, которому необходимо «не потреблять» некоторый объем данных, оптимистично извлеченных из источника, чтобы данные можно было передать какой-либо другой стороне.

В `stream.unshift(chunk)` метод не может быть вызван после [`'end'`](#event-end) было создано событие, или будет выдана ошибка времени выполнения.

Разработчики, использующие `stream.unshift()` часто следует подумать о переходе на использование [`Transform`](#class-streamtransform) поток вместо этого. Увидеть [API для исполнителей потоковой передачи](#api-for-stream-implementers) раздел для получения дополнительной информации.

```js
// Pull off a header delimited by \n\n.
// Use unshift() if we get too much.
// Call the callback with (error, header, stream).
const { StringDecoder } = require('string_decoder');
function parseHeader(stream, callback) {
  stream.on('error', callback);
  stream.on('readable', onReadable);
  const decoder = new StringDecoder('utf8');
  let header = '';
  function onReadable() {
    let chunk;
    while (null !== (chunk = stream.read())) {
      const str = decoder.write(chunk);
      if (str.match(/\n\n/)) {
        // Found the header boundary.
        const split = str.split(/\n\n/);
        header += split.shift();
        const remaining = split.join('\n\n');
        const buf = Buffer.from(remaining, 'utf8');
        stream.removeListener('error', callback);
        // Remove the 'readable' listener before unshifting.
        stream.removeListener('readable', onReadable);
        if (buf.length) stream.unshift(buf);
        // Now the body of the message can be read from the stream.
        callback(null, header, stream);
      } else {
        // Still reading the header.
        header += str;
      }
    }
  }
}
```

В отличие от [`stream.push(chunk)`](#readablepushchunk-encoding), `stream.unshift(chunk)` не завершит процесс чтения, сбросив внутреннее состояние чтения потока. Это может привести к неожиданным результатам, если `readable.unshift()` вызывается во время чтения (т.е. изнутри [`stream._read()`](#readable_readsize) реализация в настраиваемом потоке). После звонка `readable.unshift()` с немедленным [`stream.push('')`](#readablepushchunk-encoding) сбросит состояние чтения соответствующим образом, однако лучше просто избегать вызова `readable.unshift()` в процессе чтения.

##### `readable.wrap(stream)`

<!-- YAML
added: v0.9.4
-->

- `stream` {Stream} Читаемый поток в "старом стиле"
- Возвращает: {this}

До Node.js 0.10 потоки не реализовывали полностью `stream` модуль API в том виде, в каком он определен в настоящее время. (Видеть [Совместимость](#compatibility-with-older-nodejs-versions) для дополнительной информации.)

При использовании более старой библиотеки Node.js, которая выдает [`'data'`](#event-data) события и имеет [`stream.pause()`](#readablepause) метод, который носит рекомендательный характер, `readable.wrap()` может использоваться для создания [`Readable`](#class-streamreadable) поток, который использует старый поток в качестве источника данных.

Редко будет необходимо использовать `readable.wrap()` но этот метод был предоставлен для удобства взаимодействия со старыми приложениями и библиотеками Node.js.

```js
const { OldReader } = require('./old-api-module.js');
const { Readable } = require('stream');
const oreader = new OldReader();
const myReader = new Readable().wrap(oreader);

myReader.on('readable', () => {
  myReader.read(); // etc.
});
```

##### `readable[Symbol.asyncIterator]()`

<!-- YAML
added: v10.0.0
changes:
  - version: v11.14.0
    pr-url: https://github.com/nodejs/node/pull/26989
    description: Symbol.asyncIterator support is no longer experimental.
-->

- Возвращает: {AsyncIterator} для полного использования потока.

```js
const fs = require('fs');

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

Если цикл завершается `break`, `return`, или `throw`, поток будет уничтожен. Другими словами, итерация по потоку полностью потребляет поток. Поток будет прочитан кусками размером, равным `highWaterMark` вариант. В приведенном выше примере кода данные будут в одном фрагменте, если файл содержит менее 64 КБ данных, потому что нет `highWaterMark` опция предоставляется [`fs.createReadStream()`](fs.md#fscreatereadstreampath-options).

##### `readable.iterator([options])`

<!-- YAML
added: v16.3.0
-->

> Стабильность: 1 - экспериментальная

- `options` {Объект}
  - `destroyOnReturn` {boolean} Если задано значение `false`, звоню `return` на асинхронном итераторе или при выходе из `for await...of` итерация с использованием `break`, `return`, или `throw` не разрушит поток. **Дефолт:** `true`.
- Возвращает: {AsyncIterator} для использования потока.

Итератор, созданный этим методом, дает пользователям возможность отменить уничтожение потока, если `for await...of` цикл выходит из `return`, `break`, или `throw`, или если итератор должен уничтожить поток, если поток выдал ошибку во время итерации.

```js
const { Readable } = require('stream');

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
    console.log(chunk); // Will print 2 and then 3
  }

  console.log(readable.destroyed); // True, stream was totally consumed
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
  await printSymbolAsyncIterator(Readable.from([1, 2, 3]));
}

showBoth();
```

### Дуплексные и трансформируемые потоки

#### Класс: `stream.Duplex`

<!-- YAML
added: v0.9.4
changes:
  - version: v6.8.0
    pr-url: https://github.com/nodejs/node/pull/8834
    description: Instances of `Duplex` now return `true` when
                 checking `instanceof stream.Writable`.
-->

<!--type=class-->

Дуплексные потоки - это потоки, которые реализуют как [`Readable`](#class-streamreadable) а также [`Writable`](#class-streamwritable) интерфейсы.

Примеры `Duplex` потоки включают:

- [Сокеты TCP](net.md#class-netsocket)
- [потоки zlib](zlib.md)
- [криптопотоки](crypto.md)

##### `duplex.allowHalfOpen`

<!-- YAML
added: v0.9.4
-->

- {логический}

Если `false` тогда поток автоматически завершит доступную для записи сторону, когда закончится доступная для чтения сторона. Первоначально устанавливается `allowHalfOpen` параметр конструктора, по умолчанию `false`.

Это можно изменить вручную, чтобы изменить полуоткрытое поведение существующего `Duplex` экземпляр потока, но его необходимо изменить перед `'end'` событие испускается.

#### Класс: `stream.Transform`

<!-- YAML
added: v0.9.4
-->

<!--type=class-->

Потоки преобразования [`Duplex`](#class-streamduplex) потоки, где вывод каким-то образом связан с вводом. Как все [`Duplex`](#class-streamduplex) ручьи `Transform` потоки реализуют как [`Readable`](#class-streamreadable) а также [`Writable`](#class-streamwritable) интерфейсы.

Примеры `Transform` потоки включают:

- [потоки zlib](zlib.md)
- [криптопотоки](crypto.md)

##### `transform.destroy([error])`

<!-- YAML
added: v8.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/29197
    description: Work as a no-op on a stream that has already been destroyed.
-->

- `error` {Ошибка}
- Возвращает: {this}

Уничтожить поток и, при желании, испустить `'error'` событие. После этого вызова поток преобразования освободит все внутренние ресурсы. Разработчикам не следует переопределять этот метод, а вместо этого реализовывать [`readable._destroy()`](#readable_destroyerr-callback). Реализация по умолчанию `_destroy()` для `Transform` также испускать `'close'` пока не `emitClose` установлен в false.

Один раз `destroy()` был вызван, любые дальнейшие вызовы не будут выполняться и никаких ошибок, кроме `_destroy()` может быть выпущен как `'error'`.

### `stream.finished(stream[, options], callback)`

<!-- YAML
added: v10.0.0
changes:
  - version: v15.11.0
    pr-url: https://github.com/nodejs/node/pull/37354
    description: The `signal` option was added.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/32158
    description: The `finished(stream, cb)` will wait for the `'close'` event
                 before invoking the callback. The implementation tries to
                 detect legacy streams and only apply this behavior to streams
                 which are expected to emit `'close'`.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31545
    description: Emitting `'close'` before `'end'` on a `Readable` stream
                 will cause an `ERR_STREAM_PREMATURE_CLOSE` error.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31509
    description: Callback will be invoked on streams which have already
                 finished before the call to `finished(stream, cb)`.
-->

- `stream` {Stream} Доступный для чтения и / или записи поток.
- `options` {Объект}
  - `error` {boolean} Если установлено значение `false`, затем звонок `emit('error', err)` не считается законченным. **Дефолт:** `true`.
  - `readable` {boolean} Если задано значение `false`, обратный вызов будет вызван, когда поток закончится, даже если поток все еще доступен для чтения. **Дефолт:** `true`.
  - `writable` {boolean} Если задано значение `false`, обратный вызов будет вызван, когда поток закончится, даже если поток все еще доступен для записи. **Дефолт:** `true`.
  - `signal` {AbortSignal} позволяет прервать ожидание окончания потока. Базовый поток будет _нет_ быть прерванным, если сигнал прерван. Обратный вызов будет вызван с `AbortError`. Все зарегистрированные слушатели, добавленные этой функцией, также будут удалены.
- `callback` {Функция} Функция обратного вызова, которая принимает необязательный аргумент ошибки.
- Возвращает: {Функция} Функция очистки, которая удаляет всех зарегистрированных слушателей.

Функция для получения уведомлений, когда поток больше не доступен для чтения, записи или произошла ошибка или событие преждевременного закрытия.

```js
const { finished } = require('stream');

const rs = fs.createReadStream('archive.tar');

finished(rs, (err) => {
  if (err) {
    console.error('Stream failed.', err);
  } else {
    console.log('Stream is done reading.');
  }
});

rs.resume(); // Drain the stream.
```

Особенно полезно в сценариях обработки ошибок, когда поток преждевременно уничтожается (например, прерванный HTTP-запрос) и не генерирует `'end'` или `'finish'`.

В `finished` API предоставляет версию обещания:

```js
const { finished } = require('stream/promises');

const rs = fs.createReadStream('archive.tar');

async function run() {
  await finished(rs);
  console.log('Stream is done reading.');
}

run().catch(console.error);
rs.resume(); // Drain the stream.
```

`stream.finished()` оставляет висящие слушатели событий (в частности, `'error'`, `'end'`, `'finish'` а также `'close'`) после `callback` был вызван. Причина этого в том, что неожиданный `'error'` события (из-за неправильной реализации потока) не вызывают неожиданных сбоев. Если это нежелательное поведение, то возвращенная функция очистки должна быть вызвана в обратном вызове:

```js
const cleanup = finished(rs, (err) => {
  cleanup();
  // ...
});
```

### `stream.pipeline(source[, ...transforms], destination, callback)`

### `stream.pipeline(streams, callback)`

<!-- YAML
added: v10.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/32158
    description: The `pipeline(..., cb)` will wait for the `'close'` event
                 before invoking the callback. The implementation tries to
                 detect legacy streams and only apply this behavior to streams
                 which are expected to emit `'close'`.
  - version: v13.10.0
    pr-url: https://github.com/nodejs/node/pull/31223
    description: Add support for async generators.
-->

- `streams` {Stream \[] | Iterable \[] | AsyncIterable \[] | Функция \[]}
- `source` {Stream | Iterable | AsyncIterable | Функция}
  - Возвращает: {Iterable | AsyncIterable}.
- `...transforms` {Stream | Функция}
  - `source` {AsyncIterable}
  - Возвращает: {AsyncIterable}
- `destination` {Stream | Функция}
  - `source` {AsyncIterable}
  - Возвращает: {AsyncIterable | Promise}.
- `callback` {Функция} Вызывается, когда конвейер полностью готов.
  - `err` {Ошибка}
  - `val` Разрешенное значение `Promise` вернулся `destination`.
- Возвращает: {Stream}

Метод модуля для передачи между потоками и генераторами ошибок, правильной очистки и обеспечения обратного вызова после завершения конвейера.

```js
const { pipeline } = require('stream');
const fs = require('fs');
const zlib = require('zlib');

// Use the pipeline API to easily pipe a series of streams
// together and get notified when the pipeline is fully done.

// A pipeline to gzip a potentially huge tar file efficiently:

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

В `pipeline` API предоставляет версию обещания, которая также может получать аргумент опций в качестве последнего параметра с `signal` Свойство {AbortSignal}. Когда сигнал прерывается, `destroy` будет вызываться в нижележащем конвейере с `AbortError`.

```js
const { pipeline } = require('stream/promises');

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

Чтобы использовать `AbortSignal`, передайте его внутри объекта параметров в качестве последнего аргумента:

```js
const { pipeline } = require('stream/promises');

async function run() {
  const ac = new AbortController();
  const signal = ac.signal;

  setTimeout(() => ac.abort(), 1);
  await pipeline(
    fs.createReadStream('archive.tar'),
    zlib.createGzip(),
    fs.createWriteStream('archive.tar.gz'),
    { signal }
  );
}

run().catch(console.error); // AbortError
```

В `pipeline` API также поддерживает асинхронные генераторы:

```js
const { pipeline } = require('stream/promises');
const fs = require('fs');

async function run() {
  await pipeline(
    fs.createReadStream('lowercase.txt'),
    async function* (source, signal) {
      source.setEncoding('utf8'); // Work with strings rather than `Buffer`s.
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

Не забывайте обращаться с `signal` аргумент передан в асинхронный генератор. Особенно в случае, когда асинхронный генератор является источником конвейера (т.е. первым аргументом) или конвейер никогда не будет завершен.

```js
const { pipeline } = require('stream/promises');
const fs = require('fs');

async function run() {
  await pipeline(async function* (signal) {
    await someLongRunningfn({ signal });
    yield 'asd';
  }, fs.createWriteStream('uppercase.txt'));
  console.log('Pipeline succeeded.');
}

run().catch(console.error);
```

`stream.pipeline()` позвоню `stream.destroy(err)` на всех потоках, кроме:

- `Readable` потоки, которые испустили `'end'` или `'close'`.
- `Writable` потоки, которые испустили `'finish'` или `'close'`.

`stream.pipeline()` оставляет висящие прослушиватели событий в потоках после `callback` был вызван. В случае повторного использования потоков после сбоя это может привести к утечкам прослушивателя событий и ошибкам проглатывания.

### `stream.compose(...streams)`

<!-- YAML
added: v16.9.0
-->

> Стабильность: 1 - `stream.compose` экспериментальный.

- `streams` {Stream \[] | Iterable \[] | AsyncIterable \[] | Функция \[]}
- Возвращает: {stream.Duplex}

Объединяет два или более потока в один `Duplex` поток, который записывает в первый поток и читает из последнего. Каждый предоставленный поток передается по конвейеру в следующий, используя `stream.pipeline`. Если какой-либо из потоков ошибается, то все уничтожаются, включая внешний `Duplex` транслировать.

Потому что `stream.compose` возвращает новый поток, который, в свою очередь, может (и должен) быть передан по конвейеру в другие потоки, он включает композицию. Напротив, при передаче потоков в `stream.pipeline`, как правило, первый поток является читаемым потоком, а последний - записываемым потоком, образуя замкнутую схему.

Если прошел `Function` это должен быть заводской метод, `source` `Iterable`.

```mjs
import { compose, Transform } from 'stream';

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

`stream.compose` может использоваться для преобразования асинхронных итераций, генераторов и функций в потоки.

- `AsyncIterable` превращается в читаемый `Duplex`. Не может уступить `null`.
- `AsyncGeneratorFunction` преобразуется в читаемое / записываемое преобразование `Duplex`. Должен взять источник `AsyncIterable` как первый параметр. Не может уступить `null`.
- `AsyncFunction` превращается в записываемый `Duplex`. Должен вернуться либо `null` или `undefined`.

```mjs
import { compose } from 'stream';
import { finished } from 'stream/promises';

// Convert AsyncIterable into readable Duplex.
const s1 = compose(
  (async function* () {
    yield 'Hello';
    yield 'World';
  })()
);

// Convert AsyncGenerator into transform Duplex.
const s2 = compose(async function* (source) {
  for await (const chunk of source) {
    yield String(chunk).toUpperCase();
  }
});

let res = '';

// Convert AsyncFunction into writable Duplex.
const s3 = compose(async function (source) {
  for await (const chunk of source) {
    res += chunk;
  }
});

await finished(compose(s1, s2, s3));

console.log(res); // prints 'HELLOWORLD'
```

### `stream.Readable.from(iterable[, options])`

<!-- YAML
added:
  - v12.3.0
  - v10.17.0
-->

- `iterable` {Iterable} Объект, реализующий `Symbol.asyncIterator` или `Symbol.iterator` итеративный протокол. Выдает событие «ошибка», если передано нулевое значение.
- `options` {Object} Параметры, предоставленные `new stream.Readable([options])`. По умолчанию, `Readable.from()` установит `options.objectMode` к `true`, если это явно не отключено, установив `options.objectMode` к `false`.
- Возвращает: {stream.Readable}

Утилита для создания читаемых потоков из итераторов.

```js
const { Readable } = require('stream');

async function* generate() {
  yield 'hello';
  yield 'streams';
}

const readable = Readable.from(generate());

readable.on('data', (chunk) => {
  console.log(chunk);
});
```

Вызов `Readable.from(string)` или `Readable.from(buffer)` не будет повторять строки или буферы для соответствия семантике других потоков по соображениям производительности.

### `stream.Readable.fromWeb(readableStream[, options])`

<!-- YAML
added: REPLACEME
-->

> Стабильность: 1 - экспериментальная

- `readableStream` {ReadableStream}
- `options` {Объект}
  - `encoding` {нить}
  - `highWaterMark` {количество}
  - `objectModel` {логический}
  - `signal` {AbortSignal}
- Возвращает: {stream.Readable}

### `stream.Readable.isDisturbed(stream)`

<!-- YAML
added: v16.8.0
-->

> Стабильность: 1 - экспериментальная

- `stream` {stream.Readable | ReadableStream}
- Возврат: `boolean`

Возвращает информацию о том, был ли поток прочитан или отменен.

### `stream.Readable.toWeb(streamReadable)`

<!-- YAML
added: REPLACEME
-->

> Стабильность: 1 - экспериментальная

- `streamReadable` {stream.Readable}
- Возвращает: {ReadableStream}

### `stream.Writable.fromWeb(writableStream[, options])`

<!-- YAML
added: REPLACEME
-->

> Стабильность: 1 - экспериментальная

- `writableStream` {WritableStream}
- `options` {Объект}
  - `decodeStrings` {логический}
  - `highWaterMark` {количество}
  - `objectMode` {логический}
  - `signal` {AbortSignal}
- Возвращает: {stream.Writable}

### `stream.Writable.toWeb(streamWritable)`

<!-- YAML
added: REPLACEME
-->

> Стабильность: 1 - экспериментальная

- `streamWritable` {stream.Writable}
- Возвращает: {WritableStream}

### `stream.Duplex.from(src)`

<!-- YAML
added: v16.8.0
-->

- `src` {Stream | Blob | ArrayBuffer | string | Iterable | AsyncIterable | AsyncGeneratorFunction | AsyncFunction | Promise | Object}

Утилита для создания дуплексных потоков.

- `Stream` преобразует записываемый поток в записываемый `Duplex` и читаемый поток в `Duplex`.
- `Blob` превращается в читаемый `Duplex`.
- `string` превращается в читаемый `Duplex`.
- `ArrayBuffer` превращается в читаемый `Duplex`.
- `AsyncIterable` превращается в читаемый `Duplex`. Не может уступить `null`.
- `AsyncGeneratorFunction` преобразуется в читаемое / записываемое преобразование `Duplex`. Должен взять источник `AsyncIterable` как первый параметр. Не может уступить `null`.
- `AsyncFunction` превращается в записываемый `Duplex`. Должен вернуться либо `null` или `undefined`
- `Object ({ writable, readable })` обращает `readable` а также `writable` в `Stream` а затем объединяет их в `Duplex` где `Duplex` напишу в `writable` и читайте из `readable`.
- `Promise` превращается в читаемый `Duplex`. Ценить `null` игнорируется.
- Возвращает: {stream.Duplex}

### `stream.Duplex.fromWeb(pair[, options])`

<!-- YAML
added: REPLACEME
-->

> Стабильность: 1 - экспериментальная

- `pair` {Объект}
  - `readable` {ReadableStream}
  - `writable` {WritableStream}
- `options` {Объект}
  - `allowHalfOpen` {логический}
  - `decodeStrings` {логический}
  - `encoding` {нить}
  - `highWaterMark` {количество}
  - `objectMode` {логический}
  - `signal` {AbortSignal}
- Возвращает: {stream.Duplex}

### `stream.Duplex.toWeb(streamDuplex)`

<!-- YAML
added: REPLACEME
-->

> Стабильность: 1 - экспериментальная

- `streamDuplex` {stream.Duplex}
- Возвращает: {Object}
  - `readable` {ReadableStream}
  - `writable` {WritableStream}

### `stream.addAbortSignal(signal, stream)`

<!-- YAML
added: v15.4.0
-->

- `signal` {AbortSignal} Сигнал, указывающий на возможную отмену.
- `stream` {Stream} поток для присоединения сигнала к

Присоединяет AbortSignal к читаемому или записываемому потоку. Это позволяет коду управлять уничтожением потока с помощью `AbortController`.

Вызов `abort` на `AbortController` соответствующий пройденному `AbortSignal` будет вести себя так же, как вызов `.destroy(new AbortError())` на ручье.

```js
const fs = require('fs');

const controller = new AbortController();
const read = addAbortSignal(
  controller.signal,
  fs.createReadStream('object.json')
);
// Later, abort the operation closing the stream
controller.abort();
```

Или используя `AbortSignal` с читаемым потоком как асинхронным итерабельным:

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

## API для исполнителей потоковой передачи

<!--type=misc-->

В `stream` API модуля был разработан, чтобы упростить реализацию потоков с использованием прототипной модели наследования JavaScript.

Сначала разработчик потока объявит новый класс JavaScript, который расширяет один из четырех основных классов потока (`stream.Writable`, `stream.Readable`, `stream.Duplex`, или `stream.Transform`), убедившись, что они вызывают соответствующий конструктор родительского класса:

<!-- eslint-disable no-useless-constructor -->

```js
const { Writable } = require('stream');

class MyWritable extends Writable {
  constructor({ highWaterMark, ...options }) {
    super({ highWaterMark });
    // ...
  }
}
```

При расширении потоков помните, какие параметры пользователь может и должен предоставить, прежде чем пересылать их в базовый конструктор. Например, если реализация делает предположения относительно `autoDestroy` а также `emitClose` параметры, не позволяйте пользователю переопределять их. Четко указывайте, какие параметры пересылаются, вместо неявной пересылки всех параметров.

Затем новый класс потока должен реализовать один или несколько конкретных методов, в зависимости от типа создаваемого потока, как подробно описано в таблице ниже:

| Пример использования | Класс | Метод (ы) для реализации | | -------- | ----- | ---------------------- | | Только чтение | [`Readable`](#class-streamreadable) | [`_read()`](#readable_readsize) | | Только написание | [`Writable`](#class-streamwritable) | [`_write()`](#writable_writechunk-encoding-callback), [`_writev()`](#writable_writevchunks-callback), [`_final()`](#writable_finalcallback) | | Чтение и письмо | [`Duplex`](#class-streamduplex) | [`_read()`](#readable_readsize), [`_write()`](#writable_writechunk-encoding-callback), [`_writev()`](#writable_writevchunks-callback), [`_final()`](#writable_finalcallback) | | Оперируйте записанными данными, затем прочтите результат | [`Transform`](#class-streamtransform) | [`_transform()`](#transform_transformchunk-encoding-callback), [`_flush()`](#transform_flushcallback), [`_final()`](#writable_finalcallback) |

Код реализации для потока должен _никогда_ вызывать "общедоступные" методы потока, которые предназначены для использования потребителями (как описано в [API для потребителей потоков](#api-for-stream-consumers) раздел). Это может привести к нежелательным побочным эффектам в коде приложения, потребляющем поток.

Избегайте переопределения общедоступных методов, таких как `write()`, `end()`, `cork()`, `uncork()`, `read()` а также `destroy()`, или генерируя внутренние события, такие как `'error'`, `'data'`, `'end'`, `'finish'` а также `'close'` через `.emit()`. Это может нарушить текущие и будущие инварианты потоков, что приведет к проблемам с поведением и / или совместимостью с другими потоками, потоковыми утилитами и ожиданиями пользователей.

### Упрощенная конструкция

<!-- YAML
added: v1.2.0
-->

Во многих простых случаях можно создать поток, не полагаясь на наследование. Это может быть выполнено путем непосредственного создания экземпляров `stream.Writable`, `stream.Readable`, `stream.Duplex` или `stream.Transform` объекты и передача соответствующих методов в качестве параметров конструктора.

```js
const { Writable } = require('stream');

const myWritable = new Writable({
  construct(callback) {
    // Initialize state and load resources...
  },
  write(chunk, encoding, callback) {
    // ...
  },
  destroy() {
    // Free resources...
  },
});
```

### Реализация записываемого потока

В `stream.Writable` класс расширен для реализации [`Writable`](#class-streamwritable) транслировать.

Обычай `Writable` потоки _должен_ позвонить в `new stream.Writable([options])` конструктор и реализовать `writable._write()` и / или `writable._writev()` метод.

#### `new stream.Writable([options])`

<!-- YAML
changes:
  - version: v15.5.0
    pr-url: https://github.com/nodejs/node/pull/36431
    description: support passing in an AbortSignal.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30623
    description: Change `autoDestroy` option default to `true`.
  - version:
     - v11.2.0
     - v10.16.0
    pr-url: https://github.com/nodejs/node/pull/22795
    description: Add `autoDestroy` option to automatically `destroy()` the
                 stream when it emits `'finish'` or errors.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18438
    description: Add `emitClose` option to specify if `'close'` is emitted on
                 destroy.
-->

- `options` {Объект}
  - `highWaterMark` {number} Уровень буфера, когда [`stream.write()`](#writablewritechunk-encoding-callback) начинает возвращаться `false`. **Дефолт:** `16384` (16 КБ) или `16` для `objectMode` потоки.
  - `decodeStrings` {boolean} Кодировать ли `string`s передано [`stream.write()`](#writablewritechunk-encoding-callback) к `Buffer`s (с кодировкой, указанной в [`stream.write()`](#writablewritechunk-encoding-callback) call) перед тем, как передать их [`stream._write()`](#writable_writechunk-encoding-callback). Другие типы данных не преобразуются (т. Е. `Buffer`s не декодируются в `string`с). Установка значения false предотвратит `string`s от преобразования. **Дефолт:** `true`.
  - `defaultEncoding` {строка} Кодировка по умолчанию, которая используется, когда кодировка не указана в качестве аргумента для [`stream.write()`](#writablewritechunk-encoding-callback). **Дефолт:** `'utf8'`.
  - `objectMode` {boolean} Независимо от того, [`stream.write(anyObj)`](#writablewritechunk-encoding-callback) это допустимая операция. Когда установлено, становится возможным записывать значения JavaScript, отличные от строки, `Buffer` или `Uint8Array` если поддерживается реализацией потока. **Дефолт:** `false`.
  - `emitClose` {boolean} Должен ли поток выдавать `'close'` после того, как он был разрушен. **Дефолт:** `true`.
  - `write` {Function} Реализация для [`stream._write()`](#writable_writechunk-encoding-callback) метод.
  - `writev` {Function} Реализация для [`stream._writev()`](#writable_writevchunks-callback) метод.
  - `destroy` {Function} Реализация для [`stream._destroy()`](#writable_destroyerr-callback) метод.
  - `final` {Function} Реализация для [`stream._final()`](#writable_finalcallback) метод.
  - `construct` {Function} Реализация для [`stream._construct()`](#writable_constructcallback) метод.
  - `autoDestroy` {boolean} Должен ли этот поток вызывать автоматически `.destroy()` на себя после окончания. **Дефолт:** `true`.
  - `signal` {AbortSignal} Сигнал, представляющий возможную отмену.

<!-- eslint-disable no-useless-constructor -->

```js
const { Writable } = require('stream');

class MyWritable extends Writable {
  constructor(options) {
    // Calls the stream.Writable() constructor.
    super(options);
    // ...
  }
}
```

Или при использовании конструкторов в стиле до ES6:

```js
const { Writable } = require('stream');
const util = require('util');

function MyWritable(options) {
  if (!(this instanceof MyWritable))
    return new MyWritable(options);
  Writable.call(this, options);
}
util.inherits(MyWritable, Writable);
```

Или, используя упрощенный конструкторский подход:

```js
const { Writable } = require('stream');

const myWritable = new Writable({
  write(chunk, encoding, callback) {
    // ...
  },
  writev(chunks, callback) {
    // ...
  },
});
```

Вызов `abort` на `AbortController` соответствующий пройденному `AbortSignal` будет вести себя так же, как вызов `.destroy(new AbortError())` в записываемом потоке.

```js
const { Writable } = require('stream');

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

#### `writable._construct(callback)`

<!-- YAML
added: v15.0.0
-->

- `callback` {Функция} Вызовите эту функцию (необязательно с аргументом ошибки), когда поток завершит инициализацию.

В `_construct()` метод НЕ ДОЛЖЕН быть вызван напрямую. Он может быть реализован дочерними классами, и если да, то будет вызываться внутренним `Writable` только методы класса.

Эта необязательная функция будет вызываться через тик после возврата конструктора потока, задерживая любые `_write()`, `_final()` а также `_destroy()` звонит, пока `callback` называется. Это полезно для инициализации состояния или асинхронной инициализации ресурсов перед использованием потока.

```js
const { Writable } = require('stream');
const fs = require('fs');

class WriteStream extends Writable {
  constructor(filename) {
    super();
    this.filename = filename;
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

#### `writable._write(chunk, encoding, callback)`

<!-- YAML
changes:
  - version: v12.11.0
    pr-url: https://github.com/nodejs/node/pull/29639
    description: _write() is optional when providing _writev().
-->

- `chunk` {Buffer | string | any} `Buffer` быть записанным, преобразованным из `string` перешел к [`stream.write()`](#writablewritechunk-encoding-callback). Если поток `decodeStrings` вариант `false` или поток работает в объектном режиме, фрагмент не будет преобразован и будет соответствовать тому, что было передано в [`stream.write()`](#writablewritechunk-encoding-callback).
- `encoding` {строка} Если фрагмент является строкой, тогда `encoding` кодировка символов этой строки. Если чанк `Buffer`, или если поток работает в объектном режиме, `encoding` можно игнорировать.
- `callback` {Функция} Вызовите эту функцию (необязательно с аргументом ошибки) после завершения обработки предоставленного фрагмента.

Все `Writable` реализации потока должны предоставлять [`writable._write()`](#writable_writechunk-encoding-callback) и / или [`writable._writev()`](#writable_writevchunks-callback) для отправки данных в базовый ресурс.

[`Transform`](#class-streamtransform) потоки обеспечивают собственную реализацию [`writable._write()`](#writable_writechunk-encoding-callback).

Эта функция НЕ ДОЛЖНА вызываться кодом приложения напрямую. Он должен быть реализован дочерними классами и вызываться внутренним `Writable` только методы класса.

В `callback` функция должна вызываться синхронно внутри `writable._write()` или асинхронно (т. е. другой тик), чтобы сигнализировать, что запись завершилась успешно или завершилась ошибкой. Первый аргумент, переданный в `callback` должен быть `Error` объект, если вызов не удался или `null` если запись прошла успешно.

Все звонки на `writable.write()` что происходит между временем `writable._write()` называется и `callback` вызывает буферизацию записанных данных. Когда `callback` вызывается, поток может испустить [`'drain'`](#event-drain) событие. Если реализация потока способна обрабатывать несколько блоков данных одновременно, `writable._writev()` метод должен быть реализован.

Если `decodeStrings` свойство явно установлено на `false` в параметрах конструктора, затем `chunk` останется тем же объектом, который был передан в `.write()`, и может быть строкой, а не `Buffer`. Это сделано для поддержки реализаций, которые имеют оптимизированную обработку для определенных кодировок строковых данных. В этом случае `encoding` Аргумент будет указывать кодировку символов строки. В противном случае `encoding` аргумент можно проигнорировать.

В `writable._write()` Метод имеет префикс подчеркивания, потому что он является внутренним по отношению к классу, который его определяет, и никогда не должен вызываться непосредственно пользовательскими программами.

#### `writable._writev(chunks, callback)`

- `chunks` {Object \[]} Данные для записи. Значение представляет собой массив {Object}, каждый из которых представляет отдельный фрагмент данных для записи. Свойства этих объектов:
  - `chunk` {Buffer | string} Экземпляр или строка буфера, содержащая данные для записи. В `chunk` будет строкой, если `Writable` был создан с `decodeStrings` опция установлена на `false` и строка была передана в `write()`.
  - `encoding` {строка} Кодировка символов `chunk`. Если `chunk` это `Buffer`, то `encoding` будет `'buffer'`.
- `callback` {Функция} Функция обратного вызова (необязательно с аргументом ошибки), которая будет вызываться после завершения обработки предоставленных фрагментов.

Эта функция НЕ ДОЛЖНА вызываться кодом приложения напрямую. Он должен быть реализован дочерними классами и вызываться внутренним `Writable` только методы класса.

В `writable._writev()` метод может быть реализован в дополнение или как альтернатива `writable._write()` в потоковых реализациях, которые способны обрабатывать сразу несколько блоков данных. Если реализовано и есть буферизованные данные из предыдущих записей, `_writev()` будет называться вместо `_write()`.

В `writable._writev()` Метод имеет префикс подчеркивания, потому что он является внутренним по отношению к классу, который его определяет, и никогда не должен вызываться непосредственно пользовательскими программами.

#### `writable._destroy(err, callback)`

<!-- YAML
added: v8.0.0
-->

- `err` {Error} Возможная ошибка.
- `callback` {Функция} Функция обратного вызова, которая принимает необязательный аргумент ошибки.

В `_destroy()` метод вызывается [`writable.destroy()`](#writabledestroyerror). Его можно переопределить дочерними классами, но он **не должен** звонить напрямую.

#### `writable._final(callback)`

<!-- YAML
added: v8.0.0
-->

- `callback` {Функция} Вызовите эту функцию (необязательно с аргументом ошибки), когда закончите запись любых оставшихся данных.

В `_final()` метод **не должен** звонить напрямую. Он может быть реализован дочерними классами, и если да, то будет вызываться внутренним `Writable` только методы класса.

Эта дополнительная функция будет вызываться перед закрытием потока, задерживая `'finish'` событие до `callback` называется. Это полезно для закрытия ресурсов или записи буферизованных данных до завершения потока.

#### Ошибки при записи

Ошибки, возникающие при обработке [`writable._write()`](#writable_writechunk-encoding-callback), [`writable._writev()`](#writable_writevchunks-callback) а также [`writable._final()`](#writable_finalcallback) методы должны распространяться путем вызова обратного вызова и передачи ошибки в качестве первого аргумента. Бросив `Error` из этих методов или вручную `'error'` событие приводит к неопределенному поведению.

Если `Readable` поток трубы в `Writable` поток, когда `Writable` выдает ошибку, `Readable` поток будет отключен.

```js
const { Writable } = require('stream');

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

#### Пример записываемого потока

Следующее иллюстрирует довольно упрощенный (и несколько бессмысленный) обычай. `Writable` реализация потока. Хотя этот конкретный `Writable` экземпляр потока не представляет особой полезности, пример иллюстрирует каждый из требуемых элементов настраиваемого [`Writable`](#class-streamwritable) экземпляр потока:

```js
const { Writable } = require('stream');

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

#### Буферы декодирования в доступном для записи потоке

Буферы декодирования - обычная задача, например, при использовании преобразователей, вход которых является строкой. Это нетривиальный процесс при использовании кодировки многобайтовых символов, такой как UTF-8. В следующем примере показано, как декодировать многобайтовые строки с помощью `StringDecoder` а также [`Writable`](#class-streamwritable).

```js
const { Writable } = require('stream');
const { StringDecoder } = require('string_decoder');

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

console.log(w.data); // currency: €
```

### Реализация читаемого потока

В `stream.Readable` класс расширен для реализации [`Readable`](#class-streamreadable) транслировать.

Обычай `Readable` потоки _должен_ позвонить в `new stream.Readable([options])` конструктор и реализовать [`readable._read()`](#readable_readsize) метод.

#### `new stream.Readable([options])`

<!-- YAML
changes:
  - version: v15.5.0
    pr-url: https://github.com/nodejs/node/pull/36431
    description: support passing in an AbortSignal.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30623
    description: Change `autoDestroy` option default to `true`.
  - version:
     - v11.2.0
     - v10.16.0
    pr-url: https://github.com/nodejs/node/pull/22795
    description: Add `autoDestroy` option to automatically `destroy()` the
                 stream when it emits `'end'` or errors.
-->

- `options` {Объект}
  - `highWaterMark` {number} Максимальный [количество байтов](#highwatermark-discrepancy-after-calling-readablesetencoding) для сохранения во внутреннем буфере перед прекращением чтения из базового ресурса. **Дефолт:** `16384` (16 КБ) или `16` для `objectMode` потоки.
  - `encoding` {строка} Если указано, то буферы будут декодированы в строки с использованием указанной кодировки. **Дефолт:** `null`.
  - `objectMode` {boolean} Должен ли этот поток вести себя как поток объектов. Означающий, что [`stream.read(n)`](#readablereadsize) возвращает одно значение вместо `Buffer` размера `n`. **Дефолт:** `false`.
  - `emitClose` {boolean} Должен ли поток выдавать `'close'` после того, как он был разрушен. **Дефолт:** `true`.
  - `read` {Function} Реализация для [`stream._read()`](#readable_readsize) метод.
  - `destroy` {Function} Реализация для [`stream._destroy()`](#readable_destroyerr-callback) метод.
  - `construct` {Function} Реализация для [`stream._construct()`](#readable_constructcallback) метод.
  - `autoDestroy` {boolean} Должен ли этот поток вызывать автоматически `.destroy()` на себя после окончания. **Дефолт:** `true`.
  - `signal` {AbortSignal} Сигнал, представляющий возможную отмену.

<!-- eslint-disable no-useless-constructor -->

```js
const { Readable } = require('stream');

class MyReadable extends Readable {
  constructor(options) {
    // Calls the stream.Readable(options) constructor.
    super(options);
    // ...
  }
}
```

Или при использовании конструкторов в стиле до ES6:

```js
const { Readable } = require('stream');
const util = require('util');

function MyReadable(options) {
  if (!(this instanceof MyReadable))
    return new MyReadable(options);
  Readable.call(this, options);
}
util.inherits(MyReadable, Readable);
```

Или, используя упрощенный конструкторский подход:

```js
const { Readable } = require('stream');

const myReadable = new Readable({
  read(size) {
    // ...
  },
});
```

Вызов `abort` на `AbortController` соответствующий пройденному `AbortSignal` будет вести себя так же, как вызов `.destroy(new AbortError())` на читаемом создал.

```js
const { Readable } = require('stream');
const controller = new AbortController();
const read = new Readable({
  read(size) {
    // ...
  },
  signal: controller.signal,
});
// Later, abort the operation closing the stream
controller.abort();
```

#### `readable._construct(callback)`

<!-- YAML
added: v15.0.0
-->

- `callback` {Функция} Вызовите эту функцию (необязательно с аргументом ошибки), когда поток завершит инициализацию.

В `_construct()` метод НЕ ДОЛЖЕН быть вызван напрямую. Он может быть реализован дочерними классами, и если да, то будет вызываться внутренним `Readable` только методы класса.

Эта необязательная функция будет запланирована в следующем тике конструктором потока, задерживая любые `_read()` а также `_destroy()` звонит, пока `callback` называется. Это полезно для инициализации состояния или асинхронной инициализации ресурсов перед использованием потока.

```js
const { Readable } = require('stream');
const fs = require('fs');

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
    fs.read(this.fd, buf, 0, n, null, (err, bytesRead) => {
      if (err) {
        this.destroy(err);
      } else {
        this.push(
          bytesRead > 0 ? buf.slice(0, bytesRead) : null
        );
      }
    });
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

#### `readable._read(size)`

<!-- YAML
added: v0.9.4
-->

- `size` {number} Количество байтов для асинхронного чтения

Эта функция НЕ ДОЛЖНА вызываться кодом приложения напрямую. Он должен быть реализован дочерними классами и вызываться внутренним `Readable` только методы класса.

Все `Readable` реализации потока должны обеспечивать реализацию [`readable._read()`](#readable_readsize) для извлечения данных из базового ресурса.

Когда [`readable._read()`](#readable_readsize) вызывается, если данные доступны из ресурса, реализация должна начать помещать эти данные в очередь чтения с помощью [`this.push(dataChunk)`](#readablepushchunk-encoding) метод. `_read()` будет вызываться снова после каждого вызова [`this.push(dataChunk)`](#readablepushchunk-encoding) как только поток будет готов принять больше данных. `_read()` может продолжить чтение из ресурса и отправку данных до тех пор, пока `readable.push()` возвращается `false`. Только когда `_read()` вызывается снова после остановки, если он возобновляет отправку дополнительных данных в очередь.

Однажды [`readable._read()`](#readable_readsize) был вызван, он не будет вызываться снова, пока через [`readable.push()`](#readablepushchunk-encoding) метод. Пустые данные, такие как пустые буферы и строки, не вызовут [`readable._read()`](#readable_readsize) быть позванным.

В `size` аргумент носит рекомендательный характер. Для реализаций, где «чтение» - это отдельная операция, которая возвращает данные, можно использовать `size` аргумент, чтобы определить, сколько данных нужно получить. Другие реализации могут игнорировать этот аргумент и просто предоставлять данные, когда они становятся доступными. Нет необходимости «ждать», пока `size` байты доступны перед вызовом [`stream.push(chunk)`](#readablepushchunk-encoding).

В [`readable._read()`](#readable_readsize) Метод имеет префикс подчеркивания, потому что он является внутренним по отношению к классу, который его определяет, и никогда не должен вызываться непосредственно пользовательскими программами.

#### `readable._destroy(err, callback)`

<!-- YAML
added: v8.0.0
-->

- `err` {Error} Возможная ошибка.
- `callback` {Функция} Функция обратного вызова, которая принимает необязательный аргумент ошибки.

В `_destroy()` метод вызывается [`readable.destroy()`](#readabledestroyerror). Его можно переопределить дочерними классами, но он **не должен** звонить напрямую.

#### `readable.push(chunk[, encoding])`

<!-- YAML
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11608
    description: The `chunk` argument can now be a `Uint8Array` instance.
-->

- `chunk` {Buffer | Uint8Array | string | null | any} Фрагмент данных, помещаемых в очередь чтения. Для потоков, не работающих в объектном режиме, `chunk` должно быть строкой, `Buffer` или `Uint8Array`. Для потоков в объектном режиме `chunk` может быть любым значением JavaScript.
- `encoding` {строка} Кодировка фрагментов строки. Должен быть действительным `Buffer` кодирование, например `'utf8'` или `'ascii'`.
- Возвращает: {логическое} `true` если можно продолжить отправку дополнительных фрагментов данных; `false` иначе.

Когда `chunk` это `Buffer`, `Uint8Array` или `string`, то `chunk` данных будет добавлено во внутреннюю очередь для использования пользователями потока. Проходящий `chunk` в качестве `null` сигнализирует об окончании потока (EOF), после которого больше нельзя записывать данные.

Когда `Readable` работает в режиме паузы, данные добавлены `readable.push()` можно прочитать, позвонив в [`readable.read()`](#readablereadsize) метод, когда [`'readable'`](#event-readable) событие испускается.

Когда `Readable` работает в проточном режиме, данные добавлены `readable.push()` будет доставлен путем испускания `'data'` событие.

В `readable.push()` Метод разработан, чтобы быть максимально гибким. Например, при упаковке источника нижнего уровня, который предоставляет некоторую форму механизма паузы / возобновления и обратного вызова данных, источник низкого уровня может быть заключен в оболочку с помощью настраиваемого `Readable` пример:

```js
// `_source` is an object with readStop() and readStart() methods,
// and an `ondata` member that gets called when it has data, and
// an `onend` member that gets called when the data is over.

class SourceWrapper extends Readable {
  constructor(options) {
    super(options);

    this._source = getLowLevelSourceObject();

    // Every time there's data, push it into the internal buffer.
    this._source.ondata = (chunk) => {
      // If push() returns false, then stop reading from source.
      if (!this.push(chunk)) this._source.readStop();
    };

    // When the source ends, push the EOF-signaling `null` chunk.
    this._source.onend = () => {
      this.push(null);
    };
  }
  // _read() will be called when the stream wants to pull more data in.
  // The advisory size argument is ignored in this case.
  _read(size) {
    this._source.readStart();
  }
}
```

В `readable.push()` используется для проталкивания содержимого во внутренний буфер. Это может быть вызвано [`readable._read()`](#readable_readsize) метод.

Для потоков, не работающих в объектном режиме, если `chunk` параметр `readable.push()` является `undefined`, он будет рассматриваться как пустая строка или буфер. Видеть [`readable.push('')`](#readablepush) для дополнительной информации.

#### Ошибки при чтении

Ошибки, возникающие при обработке [`readable._read()`](#readable_readsize) должны распространяться через [`readable.destroy(err)`](#readable_destroyerr-callback) метод. Бросив `Error` изнутри [`readable._read()`](#readable_readsize) или вручную испустить `'error'` событие приводит к неопределенному поведению.

```js
const { Readable } = require('stream');

const myReadable = new Readable({
  read(size) {
    const err = checkSomeErrorCondition();
    if (err) {
      this.destroy(err);
    } else {
      // Do some work.
    }
  },
});
```

#### Пример счетного потока

<!--type=example-->

Ниже приведен базовый пример `Readable` поток, который выводит цифры от 1 до 1 000 000 в порядке возрастания, а затем завершается.

```js
const { Readable } = require('stream');

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

### Реализация дуплексного потока

А [`Duplex`](#class-streamduplex) поток - это тот, который реализует оба [`Readable`](#class-streamreadable) а также [`Writable`](#class-streamwritable), например, соединение через сокет TCP.

Поскольку JavaScript не поддерживает множественное наследование, `stream.Duplex` класс расширен для реализации [`Duplex`](#class-streamduplex) поток (в отличие от расширения `stream.Readable` _а также_ `stream.Writable` классы).

В `stream.Duplex` класс прототипически наследуется от `stream.Readable` и паразитически из `stream.Writable`, но `instanceof` будет работать правильно для обоих базовых классов из-за переопределения [`Symbol.hasInstance`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance) на `stream.Writable`.

Обычай `Duplex` потоки _должен_ позвонить в `new stream.Duplex([options])` конструктор и реализация _оба_ в [`readable._read()`](#readable_readsize) а также `writable._write()` методы.

#### `new stream.Duplex(options)`

<!-- YAML
changes:
  - version: v8.4.0
    pr-url: https://github.com/nodejs/node/pull/14636
    description: The `readableHighWaterMark` and `writableHighWaterMark` options
                 are supported now.
-->

- `options` {Object} Передано обоим `Writable` а также `Readable` конструкторы. Также есть следующие поля:
  - `allowHalfOpen` {boolean} Если установлено значение `false`, то поток автоматически закроет доступную для записи сторону, когда закончится доступная для чтения сторона. **Дефолт:** `true`.
  - `readable` {boolean} Устанавливает, будет ли `Duplex` должен быть читабельным. **Дефолт:** `true`.
  - `writable` {boolean} Устанавливает, будет ли `Duplex` должен быть доступен для записи. **Дефолт:** `true`.
  - `readableObjectMode` {boolean} Наборы `objectMode` для читаемой стороны потока. Не действует, если `objectMode` является `true`. **Дефолт:** `false`.
  - `writableObjectMode` {boolean} Наборы `objectMode` для записываемой стороны потока. Не действует, если `objectMode` является `true`. **Дефолт:** `false`.
  - `readableHighWaterMark` {number} наборы `highWaterMark` для читаемой стороны потока. Не действует, если `highWaterMark` предоставлен.
  - `writableHighWaterMark` {number} наборы `highWaterMark` для записываемой стороны потока. Не действует, если `highWaterMark` предоставлен.

<!-- eslint-disable no-useless-constructor -->

```js
const { Duplex } = require('stream');

class MyDuplex extends Duplex {
  constructor(options) {
    super(options);
    // ...
  }
}
```

Или при использовании конструкторов в стиле до ES6:

```js
const { Duplex } = require('stream');
const util = require('util');

function MyDuplex(options) {
  if (!(this instanceof MyDuplex))
    return new MyDuplex(options);
  Duplex.call(this, options);
}
util.inherits(MyDuplex, Duplex);
```

Или, используя упрощенный конструкторский подход:

```js
const { Duplex } = require('stream');

const myDuplex = new Duplex({
  read(size) {
    // ...
  },
  write(chunk, encoding, callback) {
    // ...
  },
});
```

При использовании трубопровода:

```js
const { Transform, pipeline } = require('stream');
const fs = require('fs');

pipeline(
  fs.createReadStream('object.json').setEncoding('utf8'),
  new Transform({
    decodeStrings: false, // Accept string input rather than Buffers
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
        // Make sure is valid json.
        JSON.parse(this.data);
        this.push(this.data);
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

#### Пример дуплексного потока

Ниже показан простой пример `Duplex` stream, который обертывает гипотетический исходный объект нижнего уровня, в который могут быть записаны данные и из которого данные могут быть прочитаны, хотя и с использованием API, несовместимого с потоками Node.js. Ниже показан простой пример `Duplex` поток, который буферизует входящие записанные данные через [`Writable`](#class-streamwritable) интерфейс, который считывается обратно через [`Readable`](#class-streamreadable) интерфейс.

```js
const { Duplex } = require('stream');
const kSource = Symbol('source');

class MyDuplex extends Duplex {
  constructor(source, options) {
    super(options);
    this[kSource] = source;
  }

  _write(chunk, encoding, callback) {
    // The underlying source only deals with strings.
    if (Buffer.isBuffer(chunk)) chunk = chunk.toString();
    this[kSource].writeSomeData(chunk);
    callback();
  }

  _read(size) {
    this[kSource].fetchSomeData(size, (data, encoding) => {
      this.push(Buffer.from(data, encoding));
    });
  }
}
```

Самый важный аспект `Duplex` поток в том, что `Readable` а также `Writable` стороны работают независимо друг от друга, несмотря на сосуществование в пределах одного экземпляра объекта.

#### Дуплексные потоки в объектном режиме

Для `Duplex` ручьи `objectMode` может быть установлен исключительно для `Readable` или `Writable` сторона, использующая `readableObjectMode` а также `writableObjectMode` варианты соответственно.

В следующем примере, например, новый `Transform` поток (который является типом [`Duplex`](#class-streamduplex) поток) создается с объектным режимом `Writable` сторона, которая принимает числа JavaScript, которые преобразуются в шестнадцатеричные строки на `Readable` боковая сторона.

```js
const { Transform } = require('stream');

// All Transform streams are also Duplex Streams.
const myTransform = new Transform({
  writableObjectMode: true,

  transform(chunk, encoding, callback) {
    // Coerce the chunk to a number if necessary.
    chunk |= 0;

    // Transform the chunk into something else.
    const data = chunk.toString(16);

    // Push the data onto the readable queue.
    callback(null, '0'.repeat(data.length % 2) + data);
  },
});

myTransform.setEncoding('ascii');
myTransform.on('data', (chunk) => console.log(chunk));

myTransform.write(1);
// Prints: 01
myTransform.write(10);
// Prints: 0a
myTransform.write(100);
// Prints: 64
```

### Реализация потока преобразования

А [`Transform`](#class-streamtransform) поток - это [`Duplex`](#class-streamduplex) поток, в котором вывод каким-то образом вычисляется на основе ввода. Примеры включают [zlib](zlib.md) потоки или [крипто](crypto.md) потоки, которые сжимают, шифруют или дешифруют данные.

Не требуется, чтобы выходные данные были того же размера, что и входные, или чтобы они приходили в одно и то же время. Например, `Hash` stream всегда будет иметь только один фрагмент вывода, который предоставляется по окончании ввода. А `zlib` stream произведет вывод, который либо намного меньше, либо намного больше, чем его ввод.

В `stream.Transform` класс расширен для реализации [`Transform`](#class-streamtransform) транслировать.

В `stream.Transform` класс прототипически наследуется от `stream.Duplex` и реализует собственные версии `writable._write()` а также [`readable._read()`](#readable_readsize) методы. Обычай `Transform` реализации _должен_ реализовать [`transform._transform()`](#transform_transformchunk-encoding-callback) метод и _мая_ также реализовать [`transform._flush()`](#transform_flushcallback) метод.

Следует соблюдать осторожность при использовании `Transform` потоки в этих данных, записанных в поток, могут вызвать `Writable` сторону потока, чтобы сделать паузу, если вывод на `Readable` сторона не расходуется.

#### `new stream.Transform([options])`

- `options` {Object} Передано обоим `Writable` а также `Readable` конструкторы. Также есть следующие поля:
  - `transform` {Function} Реализация для [`stream._transform()`](#transform_transformchunk-encoding-callback) метод.
  - `flush` {Function} Реализация для [`stream._flush()`](#transform_flushcallback) метод.

<!-- eslint-disable no-useless-constructor -->

```js
const { Transform } = require('stream');

class MyTransform extends Transform {
  constructor(options) {
    super(options);
    // ...
  }
}
```

Или при использовании конструкторов в стиле до ES6:

```js
const { Transform } = require('stream');
const util = require('util');

function MyTransform(options) {
  if (!(this instanceof MyTransform))
    return new MyTransform(options);
  Transform.call(this, options);
}
util.inherits(MyTransform, Transform);
```

Или, используя упрощенный конструкторский подход:

```js
const { Transform } = require('stream');

const myTransform = new Transform({
  transform(chunk, encoding, callback) {
    // ...
  },
});
```

#### Событие: `'end'`

В [`'end'`](#event-end) событие из `stream.Readable` класс. В `'end'` событие генерируется после вывода всех данных, что происходит после обратного вызова в [`transform._flush()`](#transform_flushcallback) был вызван. В случае ошибки `'end'` не должны испускаться.

#### Событие: `'finish'`

В [`'finish'`](#event-finish) событие из `stream.Writable` класс. В `'finish'` событие испускается после [`stream.end()`](#writableendchunk-encoding-callback) вызывается, и все фрагменты были обработаны [`stream._transform()`](#transform_transformchunk-encoding-callback). В случае ошибки `'finish'` не должны испускаться.

#### `transform._flush(callback)`

- `callback` {Функция} Функция обратного вызова (необязательно с аргументом ошибки и данными), которая будет вызываться, когда оставшиеся данные будут сброшены.

Эта функция НЕ ДОЛЖНА вызываться кодом приложения напрямую. Он должен быть реализован дочерними классами и вызываться внутренним `Readable` только методы класса.

В некоторых случаях операция преобразования может потребовать выдачи дополнительного бита данных в конце потока. Например, `zlib` В потоке сжатия будет храниться внутреннее состояние, используемое для оптимального сжатия вывода. Однако, когда поток заканчивается, эти дополнительные данные необходимо очистить, чтобы сжатые данные были полными.

Обычай [`Transform`](#class-streamtransform) реализации _мая_ реализовать `transform._flush()` метод. Это будет вызываться, когда больше нет записанных данных для использования, но до [`'end'`](#event-end) генерируется событие, сигнализирующее об окончании [`Readable`](#class-streamreadable) транслировать.

В рамках `transform._flush()` реализация, `transform.push()` в зависимости от обстоятельств метод может вызываться ноль или более раз. В `callback` функция должна быть вызвана после завершения операции промывки.

В `transform._flush()` Метод имеет префикс подчеркивания, потому что он является внутренним по отношению к классу, который его определяет, и никогда не должен вызываться непосредственно пользовательскими программами.

#### `transform._transform(chunk, encoding, callback)`

- `chunk` {Buffer | string | any} `Buffer` быть преобразованным, преобразованным из `string` перешел к [`stream.write()`](#writablewritechunk-encoding-callback). Если поток `decodeStrings` вариант `false` или поток работает в объектном режиме, фрагмент не будет преобразован и будет соответствовать тому, что было передано в [`stream.write()`](#writablewritechunk-encoding-callback).
- `encoding` {строка} Если фрагмент является строкой, то это тип кодировки. Если чанк является буфером, тогда это специальное значение `'buffer'`. В таком случае не обращайте на это внимания.
- `callback` {Функция} Функция обратного вызова (необязательно с аргументом ошибки и данными), вызываемая после предоставленного `chunk` обработан.

Эта функция НЕ ДОЛЖНА вызываться кодом приложения напрямую. Он должен быть реализован дочерними классами и вызываться внутренним `Readable` только методы класса.

Все `Transform` реализации потока должны предоставлять `_transform()` метод приема ввода и вывода вывода. В `transform._transform()` реализация обрабатывает записываемые байты, вычисляет вывод, затем передает этот вывод в читаемую часть, используя `transform.push()` метод.

В `transform.push()` Метод может вызываться ноль или более раз для генерации вывода из одного входного фрагмента, в зависимости от того, сколько должно быть выведено в результате этого фрагмента.

Возможно, что ни один из заданных фрагментов входных данных не генерирует никаких выходных данных.

В `callback` Функция должна вызываться только тогда, когда текущий кусок полностью израсходован. Первый аргумент, переданный в `callback` должен быть `Error` объект, если при обработке ввода произошла ошибка или `null` иначе. Если второй аргумент передается в `callback`, он будет отправлен на `transform.push()` метод. Другими словами, следующие эквиваленты:

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

В `transform._transform()` Метод имеет префикс подчеркивания, потому что он является внутренним по отношению к классу, который его определяет, и никогда не должен вызываться непосредственно пользовательскими программами.

`transform._transform()` никогда не вызывается параллельно; потоки реализуют механизм очереди, и для получения следующего фрагмента `callback` должен вызываться синхронно или асинхронно.

#### Класс: `stream.PassThrough`

В `stream.PassThrough` class - это тривиальная реализация [`Transform`](#class-streamtransform) поток, который просто передает входные байты на выход. Его цель - в первую очередь для примеров и тестирования, но есть некоторые варианты использования, когда `stream.PassThrough` полезен как строительный блок для новых видов потоков.

## Дополнительные замечания

<!--type=misc-->

### Совместимость потоков с асинхронными генераторами и асинхронными итераторами

Благодаря поддержке асинхронных генераторов и итераторов в JavaScript, асинхронные генераторы фактически представляют собой первоклассную конструкцию потока на уровне языка.

Ниже приведены некоторые распространенные случаи взаимодействия потоков Node.js с асинхронными генераторами и асинхронными итераторами.

#### Использование читаемых потоков с помощью асинхронных итераторов

```js
(async function () {
  for await (const chunk of readable) {
    console.log(chunk);
  }
})();
```

Асинхронные итераторы регистрируют постоянный обработчик ошибок в потоке, чтобы предотвратить любые необработанные ошибки после уничтожения.

#### Создание читаемых потоков с помощью асинхронных генераторов

Читаемый поток Node.js может быть создан из асинхронного генератора с помощью `Readable.from()` служебный метод:

```js
const { Readable } = require('stream');

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

#### Переход к доступным для записи потокам от асинхронных итераторов

При записи в доступный для записи поток из асинхронного итератора убедитесь, что корректная обработка обратного давления и ошибок. [`stream.pipeline()`](#streampipelinesource-transforms-destination-callback) абстрагируется от обработки ошибок, связанных с противодавлением и противодавлением:

```js
const fs = require('fs');
const { pipeline } = require('stream');
const {
  pipeline: pipelinePromise,
} = require('stream/promises');

const writable = fs.createWriteStream('./file');

const ac = new AbortController();
const signal = ac.signal;

const iterator = createIterator({ signal });

// Callback Pattern
pipeline(iterator, writable, (err, value) => {
  if (err) {
    console.error(err);
  } else {
    console.log(value, 'value returned');
  }
}).on('close', () => {
  ac.abort();
});

// Promise Pattern
pipelinePromise(iterator, writable)
  .then((value) => {
    console.log(value, 'value returned');
  })
  .catch((err) => {
    console.error(err);
    ac.abort();
  });
```

<!--type=misc-->

### Совместимость со старыми версиями Node.js

<!--type=misc-->

До версии Node.js 0.10 `Readable` потоковый интерфейс был проще, но также менее мощным и менее полезным.

- Вместо того, чтобы ждать звонков в [`stream.read()`](#readablereadsize) метод [`'data'`](#event-data) события начнут излучаться немедленно. Приложениям, которым необходимо было бы выполнить некоторый объем работы, чтобы решить, как обрабатывать данные, требовалось хранить считанные данные в буферах, чтобы данные не были потеряны.
- В [`stream.pause()`](#readablepause) метод был рекомендательным, а не гарантированным. Это означало, что по-прежнему необходимо было быть готовым к получению [`'data'`](#event-data) События _даже когда поток был в приостановленном состоянии_.

В Node.js 0.10 [`Readable`](#class-streamreadable) класс был добавлен. Для обратной совместимости со старыми программами Node.js `Readable` потоки переходят в «текущий режим», когда [`'data'`](#event-data) обработчик событий добавлен, или когда [`stream.resume()`](#readableresume) вызывается метод. Эффект таков, что даже если вы не используете новый [`stream.read()`](#readablereadsize) метод и [`'readable'`](#event-readable) событие, больше не нужно беспокоиться о потере [`'data'`](#event-data) куски.

Хотя большинство приложений продолжат нормально функционировать, это приводит к возникновению пограничного случая в следующих случаях:

- Нет [`'data'`](#event-data) добавлен слушатель событий.
- В [`stream.resume()`](#readableresume) метод никогда не вызывается.
- Поток не передается ни в какое место назначения с возможностью записи.

Например, рассмотрим следующий код:

```js
// WARNING!  BROKEN!
net
  .createServer((socket) => {
    // We add an 'end' listener, but never consume the data.
    socket.on('end', () => {
      // It will never get here.
      socket.end(
        'The message was received but was not processed.\n'
      );
    });
  })
  .listen(1337);
```

До версии Node.js 0.10 данные входящего сообщения просто отбрасывались. Однако в Node.js 0.10 и более поздних версиях сокет остается приостановленным навсегда.

Обходной путь в этой ситуации - вызвать [`stream.resume()`](#readableresume) метод для начала потока данных:

```js
// Workaround.
net
  .createServer((socket) => {
    socket.on('end', () => {
      socket.end(
        'The message was received but was not processed.\n'
      );
    });

    // Start the flow of data, discarding it.
    socket.resume();
  })
  .listen(1337);
```

Помимо новых `Readable` потоки переключаются в текущий режим, потоки в стиле до 0.10 могут быть обернуты в `Readable` класс с использованием [`readable.wrap()`](#readablewrapstream) метод.

### `readable.read(0)`

В некоторых случаях необходимо запустить обновление базовых механизмов читаемых потоков без фактического потребления каких-либо данных. В таких случаях можно позвонить `readable.read(0)`, который всегда будет возвращаться `null`.

Если внутренний буфер чтения ниже `highWaterMark`, и поток в настоящее время не читает, затем вызывает `stream.read(0)` вызовет низкий уровень [`stream._read()`](#readable_readsize) вызов.

Хотя большинству приложений это почти никогда не понадобится, в Node.js бывают ситуации, когда это делается, особенно в `Readable` внутренности потокового класса.

### `readable.push('')`

Использование `readable.push('')` не рекомендуется.

Нажимая строку с нулевым байтом, `Buffer` или `Uint8Array` к потоку, который не находится в объектном режиме, имеет интересный побочный эффект. Потому что _является_ звонок в [`readable.push()`](#readablepushchunk-encoding), вызов завершит процесс чтения. Однако, поскольку аргумент является пустой строкой, данные в читаемый буфер не добавляются, поэтому пользователю нечего использовать.

### `highWaterMark` расхождение после звонка `readable.setEncoding()`

Использование `readable.setEncoding()` изменит поведение того, как `highWaterMark` работает в необъектном режиме.

Обычно размер текущего буфера измеряется относительно `highWaterMark` в _байты_. Однако после `setEncoding()` вызывается, функция сравнения начнет измерять размер буфера в _символы_.

Это не проблема в обычных случаях с `latin1` или `ascii`. Но рекомендуется помнить об этом поведении при работе со строками, которые могут содержать многобайтовые символы.
