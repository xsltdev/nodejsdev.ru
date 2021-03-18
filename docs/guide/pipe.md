# Pipe

**Pipe** - это канал, который связывает поток для чтения и поток для записи и позволяет сразу считать из потока чтения в поток записи. Для чего они нужны? Возьмем, к примеру проблему копирования данных из одного файла в другой.

Пусть в папке проекта определен некоторый файл `hello.txt`. Скопируем его содержимое в новый файл `some.txt`:

```js
const fs = require('fs')

let readableStream = fs.createReadStream(
  'hello.txt',
  'utf8'
)

let writeableStream = fs.createWriteStream('some.txt')

readableStream.on('data', function (chunk) {
  writeableStream.write(chunk)
})
```

Данный код вполне работоспособен, и после запуска файла в папке проекта появится новый файл `some.txt`.

Однако задача записи в поток данных, считанных из другого потока, является довольно распространенной, и в этом случае pipes или каналы позволяют нам сократить объем кода:

```js
const fs = require('fs')

let readableStream = fs.createReadStream(
  'hello.txt',
  'utf8'
)

let writeableStream = fs.createWriteStream('some2.txt')

readableStream.pipe(writeableStream)
```

У потока чтения вызывается метод `pipe()`, в который передается поток для записи.

Рассмотрим другую проблему - архивацию файла. Здесь нам надо сначала считать файл, затем сжать данные и в конце записать сжатые данные в файл-архив. Pipes особенно удобно применять для подобного набора операций:

```js
const fs = require('fs')
const zlib = require('zlib')

let readableStream = fs.createReadStream(
  'hello.txt',
  'utf8'
)

let writeableStream = fs.createWriteStream('hello.txt.gz')

let gzip = zlib.createGzip()

readableStream.pipe(gzip).pipe(writeableStream)
```

Для архивации подключается модуль `zlib`. Каждый метод `pipe()` в цепочке вызовов возвращает поток для чтения, к которому опять же можно применить метод `pipe()` для записи в другой поток.
