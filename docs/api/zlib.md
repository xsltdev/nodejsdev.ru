---
description: Модуль zlib предоставляет функциональность сжатия, реализованную с помощью Gzip, Deflate, Inflate и Brotli
---

# Zlib

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/zlib.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:zlib` предоставляет функциональность сжатия, реализованную с помощью Gzip, Deflate/Inflate и Brotli.

Чтобы получить к нему доступ:

```js
const zlib = require('node:zlib');
```

Сжатие и распаковка построены вокруг Node.js [Streams API](stream.md).

Сжатие или распаковка потока (например, файла) может быть выполнена путем передачи исходного потока через поток `zlib` `Transform` в конечный поток:

```js
const { createGzip } = require('node:zlib');
const { pipeline } = require('node:stream');
const {
    createReadStream,
    createWriteStream,
} = require('node:fs');

const gzip = createGzip();
const source = createReadStream('input.txt');
const destination = createWriteStream('input.txt.gz');

pipeline(source, gzip, destination, (err) => {
    if (err) {
        console.error('Произошла ошибка:', err);
        process.exitCode = 1;
    }
});

// Или, Promisified

const { promisify } = require('node:util');
const pipe = promisify(pipeline);

async function do_gzip(input, output) {
    const gzip = createGzip();
    const source = createReadStream(input);
    const destination = createWriteStream(output);
    await pipe(source, gzip, destination);
}

do_gzip('input.txt', 'input.txt.gz').catch((err) => {
    console.error('Произошла ошибка:', err);
    process.exitCode = 1;
});
```

Также можно сжать или распаковать данные за один шаг:

```js
const { deflate, unzip } = require('node:zlib');

const input = '.................................';
deflate(input, (err, buffer) => {
    if (err) {
        console.error('Произошла ошибка:', err);
        process.exitCode = 1;
    }
    console.log(buffer.toString('base64'));
});

const buffer = Buffer.from('eJzT0yMAAGTvBe8=', 'base64');
unzip(buffer, (err, buffer) => {
    if (err) {
        console.error('Произошла ошибка:', err);
        process.exitCode = 1;
    }
    console.log(buffer.toString());
});

// Или, Promisified

const { promisify } = require('node:util');
const do_unzip = promisify(unzip);

do_unzip(buffer)
    .then((buf) => console.log(buf.toString()))
    .catch((err) => {
        console.error('Произошла ошибка:', err);
        process.exitCode = 1;
    });
```

## Использование пула потоков и соображения по производительности

Все `zlib` API, за исключением тех, которые явно синхронны, используют внутренний пул потоков Node.js. Это может привести к неожиданным эффектам и ограничениям производительности в некоторых приложениях.

Создание и использование большого количества объектов zlib одновременно может привести к значительной фрагментации памяти.

```js
const zlib = require('node:zlib');

const payload = Buffer.from('This is some data');

// ПРЕДУПРЕЖДЕНИЕ: НЕ ДЕЛАЙТЕ ЭТОГО!
for (let i = 0; i < 30000; ++i) {
    zlib.deflate(payload, (err, buffer) => {});
}
```

В предыдущем примере одновременно создается 30 000 экземпляров deflate. Из-за того, как некоторые операционные системы обрабатывают выделение и деаллокацию памяти, это может привести к значительной фрагментации памяти.

Настоятельно рекомендуется кэшировать результаты операций сжатия, чтобы избежать дублирования усилий.

## Сжатие HTTP-запросов и ответов

Модуль `node:zlib` может быть использован для реализации поддержки механизмов кодирования содержимого `gzip`, `deflate` и `br`, определенных в [HTTP](https://tools.ietf.org/html/rfc7230#section-4.2).

Заголовок HTTP [`Accept-Encoding`](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3) используется в HTTP-запросе для определения кодировок сжатия, принимаемых клиентом. Заголовок [`Content-Encoding`](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11) используется для определения кодировок сжатия, фактически примененных к сообщению.

Приведенные ниже примеры сильно упрощены, чтобы показать основную концепцию. Использование кодировки `zlib` может быть дорогостоящим, и результаты должны кэшироваться.

```js
// Пример клиентского запроса
const zlib = require('node:zlib');
const http = require('node:http');
const fs = require('node:fs');
const { pipeline } = require('node:stream');

const request = http.get({
    host: 'example.com',
    path: '/',
    порт: 80,
    headers: { 'Accept-Encoding': 'br,gzip,deflate' },
});
request.on('response', (response) => {
    const output = fs.createWriteStream(
        'example.com_index.html'
    );

    const onError = (err) => {
        if (err) {
            console.error('Произошла ошибка:', err);
            process.exitCode = 1;
        }
    };

    switch (response.headers['content-encoding']) {
        case 'br':
            pipeline(
                response,
                zlib.createBrotliDecompress(),
                output,
                onError
            );
            break;
        // Или просто используйте zlib.createUnzip() для обработки обоих следующих случаев:
        case 'gzip':
            pipeline(
                response,
                zlib.createGunzip(),
                output,
                onError
            );
            break;
        case 'deflate':
            pipeline(
                response,
                zlib.createInflate(),
                output,
                onError
            );
            break;
        default:
            pipeline(response, output, onError);
            break;
    }
});
```

```js
// пример сервера
// Выполнять операцию gzip при каждом запросе довольно дорого.
// Было бы гораздо эффективнее кэшировать сжатый буфер.
const zlib = require('node:zlib');
const http = require('node:http');
const fs = require('node:fs');
const { pipeline } = require('node:stream');

http.createServer((request, response) => {
    const raw = fs.createReadStream('index.html');
    // Храним сжатую и несжатую версию ресурса.
    response.setHeader('Vary', 'Accept-Encoding');
    let acceptEncoding = request.headers['accept-encoding'];
    if (!acceptEncoding) {
        acceptEncoding = '';
    }

    const onError = (err) => {
        if (err) {
            // Если произошла ошибка, мы мало что можем сделать, потому что.
            // сервер уже отправил код ответа 200 и
            // некоторое количество данных уже было отправлено клиенту.
            // Лучшее, что мы можем сделать, это немедленно прервать ответ
            // и записать ошибку в журнал.
            response.end();
            console.error('Произошла ошибка:', err);
        }
    };

    // Примечание: Это не соответствующий синтаксический анализатор accept-encoding.
    // См. https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
    if (/\bdeflate\b/.test(acceptEncoding)) {
        response.writeHead(200, {
            'Content-Encoding': 'deflate',
        });
        pipeline(
            raw,
            zlib.createDeflate(),
            response,
            onError
        );
    } else if (/\bgzip\b/.test(acceptEncoding)) {
        response.writeHead(200, {
            'Content-Encoding': 'gzip',
        });
        pipeline(raw, zlib.createGzip(), response, onError);
    } else if (/\bbr\b/.test(acceptEncoding)) {
        response.writeHead(200, {
            'Content-Encoding': 'br',
        });
        pipeline(
            raw,
            zlib.createBrotliCompress(),
            response,
            onError
        );
    } else {
        response.writeHead(200, {});
        pipeline(raw, response, onError);
    }
}).listen(1337);
```

По умолчанию методы `zlib` выдают ошибку при распаковке усеченных данных. Однако, если известно, что данные неполные, или есть желание просмотреть только начало сжатого файла, можно подавить обработку ошибок по умолчанию, изменив метод промывки, который используется для распаковки последнего куска входных данных:

```js
// Это усеченная версия буфера из примеров выше
const buffer = Buffer.from('eJzT0yMA', 'base64');

zlib.unzip(
    buffer,
    // Для Brotli эквивалентом является zlib.constants.BROTLI_OPERATION_FLUSH.
    { finishFlush: zlib.constants.Z_SYNC_FLUSH },
    (err, buffer) => {
        if (err) {
            console.error('Произошла ошибка:', err);
            process.exitCode = 1;
        }
        console.log(buffer.toString());
    }
);
```

Это не изменит поведение в других ситуациях с выбросом ошибок, например, когда входные данные имеют недопустимый формат. Используя этот метод, невозможно определить, завершился ли входной файл преждевременно или в нем отсутствуют проверки целостности, что делает необходимым ручную проверку достоверности распакованного результата.

## Настройка использования памяти

### Для потоков на основе zlib

Из `zlib/zconf.h`, изменено для использования в Node.js:

Требования к памяти для deflate следующие (в байтах):

```js
(1 << (windowBits + 2)) + (1 << (memLevel + 9));
```

То есть: 128K для `windowBits` = 15 + 128K для `memLevel` = 8 (значения по умолчанию) плюс несколько килобайт для небольших объектов.

Например, чтобы уменьшить требования к памяти по умолчанию с 256K до 128K, нужно установить опции в следующие значения:

```js
const options = { windowBits: 14, memLevel: 7 };
```

Это, однако, в целом ухудшит сжатие.

Требования к памяти для inflate составляют (в байтах) `1 << windowBits`. То есть 32К для `windowBits` = 15 (значение по умолчанию) плюс несколько килобайт для небольших объектов.

Это в дополнение к одному внутреннему буферу выходного слэба размером `chunkSize`, который по умолчанию равен 16K.

На скорость сжатия `zlib` наиболее сильно влияет параметр `level`. Более высокий уровень приводит к лучшему сжатию, но требует больше времени для завершения. Более низкий уровень приведет к меньшему сжатию, но будет намного быстрее.

В целом, большие параметры использования памяти означают, что Node.js придется делать меньше обращений к `zlib`, поскольку он сможет обрабатывать больше данных при каждой операции `записи`. Таким образом, это еще один фактор, влияющий на скорость, ценой использования памяти.

### Для потоков на основе Brotli-.

Существуют эквиваленты опций zlib для потоков на базе Brotli, хотя эти опции имеют другие диапазоны, чем zlib:

-   Опция zlib `level` соответствует опции Brotli `BROTLI_PARAM_QUALITY`.
-   Опция zlib `windowBits` соответствует опции Brotli `BROTLI_PARAM_LGWIN`.

## Промывка

Вызов [`.flush()`](#zlibflushkind-callback) на потоке сжатия заставит `zlib` вернуть столько выходных данных, сколько возможно. Это может стоить ухудшения качества сжатия, но может быть полезно, когда данные должны быть доступны как можно скорее.

В следующем примере `flush()` используется для записи сжатого частичного HTTP-ответа клиенту:

```js
const zlib = require('node:zlib');
const http = require('node:http');
const { pipeline } = require('node:stream');

http.createServer((request, response) => {
    // Для простоты проверки Accept-Encoding опущены.
    response.writeHead(200, { 'content-encoding': 'gzip' });
    const output = zlib.createGzip();
    let i;

    pipeline(output, response, (err) => {
        if (err) {
            // Если произошла ошибка, мы мало что можем сделать, потому что
            // сервер уже отправил код ответа 200 и
            // некоторое количество данных уже было отправлено клиенту.
            // Лучшее, что мы можем сделать, это немедленно завершить ответ
            // и записать ошибку в журнал.
            clearInterval(i);
            response.end();
            console.error('Произошла ошибка:', err);
        }
    });

    i = setInterval(() => {
        output.write(`Текущее время ${Date()}\n`, () => {
            // Данные были переданы в zlib, но алгоритм сжатия, возможно.
            // было принято решение о буферизации данных для более эффективного сжатия.
            // Вызов .flush() сделает данные доступными, как только клиент
            // будет готов получить их.
            output.flush();
        });
    }, 1000);
}).listen(1337);
```

## Константы

### Константы zlib

Все константы, определенные в `zlib.h`, также определены в `require('node:zlib').constants`. В ходе обычной работы эти константы не понадобятся. Они документированы так, чтобы их наличие не вызывало удивления.

Ранее константы были доступны непосредственно из `require('node:zlib')`, например, `zlib.Z_NO_FLUSH`. В настоящее время доступ к константам непосредственно из модуля все еще возможен, но он устарел.

Допустимые значения сброса.

-   `zlib.constants.Z_NO_FLUSH`
-   `zlib.constants.Z_PARTIAL_FLUSH`
-   `zlib.constants.Z_SYNC_FLUSH`
-   `zlib.constants.Z_FULL_FLUSH`
-   `zlib.constants.Z_FINISH`
-   `zlib.constants.Z_BLOCK`
-   `zlib.constants.Z_TREES`

Коды возврата для функций сжатия/декомпрессии. Отрицательные значения означают ошибки, положительные значения используются для особых, но нормальных событий.

-   `zlib.constants.Z_OK`
-   `zlib.constants.Z_STREAM_END`
-   `zlib.constants.Z_NEED_DICT`
-   `zlib.constants.Z_ERRNO`
-   `zlib.constants.Z_STREAM_ERROR`
-   `zlib.constants.Z_DATA_ERROR`
-   `zlib.constants.Z_MEM_ERROR`
-   `zlib.constants.Z_BUF_ERROR`
-   `zlib.constants.Z_VERSION_ERROR`

Уровни сжатия.

-   `zlib.constants.Z_NO_COMPRESSION`
-   `zlib.constants.Z_BEST_SPEED`
-   `zlib.constants.Z_BEST_COMPRESSION`
-   `zlib.constants.Z_DEFAULT_COMPRESSION`

Стратегия сжатия.

-   `zlib.constants.Z_FILTERED`
-   `zlib.constants.Z_HUFFMAN_ONLY`
-   `zlib.constants.Z_RLE`
-   `zlib.constants.Z_FIXED`
-   `zlib.constants.Z_DEFAULT_STRATEGY`

### Константы Brotli

Существует несколько опций и других констант, доступных для потоков на основе Brotli:

#### Операции промывки

Следующие значения являются допустимыми операциями смыва для потоков на основе Brotli:

-   `zlib.constants.BROTLI_OPERATION_PROCESS` (по умолчанию для всех операций)
-   `zlib.constants.BROTLI_OPERATION_FLUSH` (по умолчанию при вызове `.flush()`)
-   `zlib.constants.BROTLI_OPERATION_FINISH` (по умолчанию для последнего чанка)
-   `zlib.constants.BROTLI_OPERATION_EMIT_METADATA`.
    -   Эту конкретную операцию может быть трудно использовать в контексте Node.js, так как из-за потокового слоя трудно определить, какие данные окажутся в этом кадре. Кроме того, в настоящее время не существует способа получить эти данные через API Node.js.

#### Параметры компрессора

Существует несколько опций, которые могут быть установлены в кодировщиках Brotli и влияют на эффективность и скорость сжатия. Доступ к ключам и значениям можно получить как к свойствам объекта `zlib.constants`.

Наиболее важными параметрами являются:

-   `BROTLI_PARAM_MODE`
    -   `BROTLI_MODE_GENERIC` (по умолчанию)
    -   `BROTLI_MODE_TEXT`, адаптированный для текста UTF-8
    -   `BROTLI_MODE_FONT`, адаптирован для шрифтов WOFF 2.0
-   `BROTLI_PARAM_QUALITY`.
    -   Варьируется от `BROTLI_MIN_QUALITY` до `BROTLI_MAX_QUALITY`, по умолчанию `BROTLI_DEFAULT_QUALITY`.
-   `BROTLI_PARAM_SIZE_HINT`
    -   Целочисленное значение, представляющее ожидаемый размер входа; по умолчанию `0` для неизвестного размера входа.

Следующие флаги могут быть установлены для расширенного контроля над алгоритмом сжатия и настройки использования памяти:

-   `BROTLI_PARAM_LGWIN`.
    -   Варьируется от `BROTLI_MIN_WINDOW_BITS` до `BROTLI_MAX_WINDOW_BITS`, по умолчанию `BROTLI_DEFAULT_WINDOW`, или до `BROTLI_LARGE_MAX_WINDOW_BITS`, если установлен флаг `BROTLI_PARAM_LARGE_WINDOW`.
-   `BROTLI_PARAM_LGBLOCK`.
    -   Варьируется от `BROTLI_MIN_INPUT_BLOCK_BITS` до `BROTLI_MAX_INPUT_BLOCK_BITS`.
-   `BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING`.
    -   Булев флаг, уменьшающий степень сжатия в пользу скорости распаковки.
-   `BROTLI_PARAM_LARGE_WINDOW`.
    -   Булев флаг, включающий режим "Large Window Brotli" (не совместим с форматом Brotli, стандартизированным в [RFC 7932](https://www.rfc-editor.org/rfc/rfc7932.txt)).
-   `BROTLI_PARAM_NPOSTFIX`.
    -   Варьируется от `0` до `BROTLI_MAX_NPOSTFIX`.
-   `BROTLI_PARAM_NDIRECT`.
    -   В диапазоне от `0` до `15 << NPOSTFIX` с шагом `1 << NPOSTFIX`.

#### Опции декомпрессора

Эти дополнительные параметры доступны для управления декомпрессией:

-   `BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION`.
    -   Булевский флаг, влияющий на шаблоны распределения внутренней памяти.
-   `BROTLI_DECODER_PARAM_LARGE_WINDOW`
    -   Булев флаг, включающий режим "Large Window Brotli" (не совместим с форматом Brotli, стандартизированным в [RFC 7932](https://www.rfc-editor.org/rfc/rfc7932.txt)).

## Класс: `Options`.

Каждый класс на основе zlib принимает объект `options`. Никакие параметры не являются обязательными.

Некоторые опции важны только при сжатии и игнорируются классами распаковки.

-   `flush` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `zlib.constants.Z_NO_FLUSH`.
-   `finishFlush` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `zlib.constants.Z_FINISH`
-   `chunkSize` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `16 * 1024`
-   `windowBits` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `level` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) (только для сжатия)
-   `memLevel` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) (только сжатие)
-   `стратегия` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) (только сжатие)
-   `dictionary` {Buffer|TypedArray|DataView|ArrayBuffer} (только дефлат/инфлат, по умолчанию пустой словарь)
-   `info` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) (Если `true`, возвращает объект с `буфером` и `двигателем`).
-   `maxOutputLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ограничивает размер вывода при использовании [удобных методов](#convenience-methods). **По умолчанию:** [`buffer.kMaxLength`](buffer.md#bufferkmaxlength)

Дополнительную информацию см. в документации по [`deflateInit2` и `inflateInit2`](https://zlib.net/manual.html#Advanced).

## Класс: `BrotliOptions`.

Каждый класс, основанный на Brotli, принимает объект `options`. Все опции являются необязательными.

-   `flush` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `zlib.constants.BROTLI_OPERATION_PROCESS`.
-   `finishFlush` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `zlib.constants.BROTLI_OPERATION_FINISH`
-   `chunkSize` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `16 * 1024`
-   `params` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект ключ-значение, содержащий индексированные [параметры Brotli](#brotli-constants).
-   `maxOutputLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ограничивает размер вывода при использовании [удобных методов](#convenience-methods). **По умолчанию:** [`buffer.kMaxLength`](buffer.md#bufferkmaxlength).

Например:

```js
const stream = zlib.createBrotliCompress({
    chunkSize: 32 * 1024,
    params: {
        [zlib.constants.BROTLI_PARAM_MODE]:
            zlib.constants.BROTLI_MODE_TEXT,
        [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
        [zlib.constants
            .BROTLI_PARAM_SIZE_HINT]: fs.statSync(inputFile)
            .size,
    },
});
```

## Класс: `zlib.BrotliCompress`.

Сжатие данных с помощью алгоритма Brotli.

## Класс: `zlib.BrotliDecompress`.

Декомпрессия данных с использованием алгоритма Brotli.

## Класс: `zlib.Deflate`.

Сжатие данных с помощью deflate.

## Класс: `zlib.DeflateRaw`.

Сжимает данные с помощью deflate и не добавляет заголовок `zlib`.

## Класс: `zlib.Gunzip`

Декомпрессия потока gzip.

## Класс: `zlib.Gzip`

Сжатие данных с помощью gzip.

## Класс: `zlib.Inflate`.

Декомпрессия потока deflate.

## Класс: `zlib.InflateRaw`.

Декомпрессия необработанного потока deflate.

## Класс: `zlib.Unzip`

Распаковывает поток, сжатый Gzip- или Deflate, автоматически определяя заголовок.

## Класс: `zlib.ZlibBase`.

Не экспортируется модулем `node:zlib`. Он документирован здесь, поскольку является базовым классом классов компрессора/декомпрессора.

Этот класс наследуется от [`stream.Transform`](stream.md#class-streamtransform), что позволяет использовать объекты `node:zlib` в трубах и подобных потоковых операциях.

### `zlib.bytesRead`.

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Утратил актуальность: Вместо этого используйте [`zlib.bytesWritten`](#zlibbyteswritten).

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Утративший силу псевдоним для [`zlib.bytesWritten`](#zlibbyteswritten). Это оригинальное название было выбрано потому, что оно также имело смысл для интерпретации значения как количества байт, прочитанных движком, но не согласуется с другими потоками в Node.js, которые предоставляют значения под этими именами.

### `zlib.bytesWritten`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `zlib.bytesWritten` определяет количество байтов, записанных в движок, до обработки байтов (сжатия или распаковки, в зависимости от производного класса).

### `zlib.close([callback])`.

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Закрыть базовый хэндл.

### `zlib.flush([kind, ]callback)`.

-   `kind` **По умолчанию:** `zlib.constants.Z_FULL_FLUSH` для потоков на основе zlib, `zlib.constants.BROTLI_OPERATION_FLUSH` для потоков на основе Brotli-.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Промыть ожидающие данные. Не вызывайте эту функцию легкомысленно, преждевременная очистка негативно влияет на эффективность алгоритма сжатия.

Вызов этой функции только очищает данные из внутреннего состояния `zlib` и не выполняет никакой очистки на уровне потоков. Скорее, он ведет себя как обычный вызов `.write()`, т.е. он будет поставлен в очередь за другими ожидающими записи и будет выдавать вывод только тогда, когда данные читаются из потока.

### `zlib.params(level, strategy, callback)`.

-   `уровень` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `стратегия` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Эта функция доступна только для потоков на основе zlib, т.е. не Brotli.

Динамически обновляет уровень сжатия и стратегию сжатия. Применимо только к алгоритму deflate.

### `zlib.reset()`

Сброс компрессора/декомпрессора к заводским настройкам по умолчанию. Применимо только к алгоритмам inflate и deflate.

## `zlib.constants`

Предоставляет объект, перечисляющий константы, связанные с Zlib.

## `zlib.createBrotliCompress([options])`

-   `options` {brotli options}

Создает и возвращает новый объект [`BrotliCompress`](#class-zlibbrotlicompress).

## `zlib.createBrotliDecompress([options])`

-   `options` {brotli options}

Создает и возвращает новый объект [`BrotliDecompress`](#class-zlibbrotlidecompress).

## `zlib.createDeflate([options])`

-   `options` {zlib options}

Создает и возвращает новый объект [`Deflate`](#class-zlibdeflate).

## `zlib.createDeflateRaw([options])`

-   `options` {zlib options}

Создает и возвращает новый объект [`DeflateRaw`](#class-zlibdeflateraw).

Обновление zlib с 1.2.8 до 1.2.11 изменило поведение, когда `windowBits` установлен на 8 для потоков raw deflate. zlib автоматически устанавливал `windowBits` на 9, если изначально был установлен на 8. Более новые версии zlib выбрасывают исключение, поэтому Node.js восстановил оригинальное поведение обновления значения от 8 до 9, поскольку передача `windowBits = 9` в zlib фактически приводит к сжатому потоку, который эффективно использует только 8-битное окно.

## `zlib.createGunzip([options])`

-   `options` {zlib options}

Создает и возвращает новый объект [`Gunzip`](#class-zlibgunzip).

## `zlib.createGzip([options])`

-   `options` {zlib options}

Создает и возвращает новый объект [`Gzip`](#class-zlibgzip).

## `zlib.createInflate([options])`

-   `options` {zlib options}

Создает и возвращает новый объект [`Inflate`](#class-zlibinflate).

## `zlib.createInflateRaw([options])`

-   `options` {zlib options}

Создает и возвращает новый объект [`InflateRaw`](#class-zlibinflateraw).

## `zlib.createUnzip([options])`

-   `options` {zlib options}

Создает и возвращает новый объект [`Unzip`](#class-zlibunzip).

## Удобные методы

Все эти методы принимают [`Buffer`](buffer.md#class-buffer), [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView), [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) или строку в качестве первого аргумента, необязательный второй аргумент для предоставления опций классам `zlib` и вызывают предоставленный обратный вызов с `callback(error, result)`.

Каждый метод имеет аналог `*Sync`, который принимает те же аргументы, но без обратного вызова.

### `zlib.brotliCompress(buffer[, options], callback)`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {brotli options}
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.brotliCompressSync(buffer[, options])`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {brotli options}

Сжатие фрагмента данных с помощью [`BrotliCompress`](#class-zlibbrotlicompress).

### `zlib.brotliDecompress(buffer[, options], callback)`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {brotli options}
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.brotliDecompressSync(buffer[, options])`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {brotli options}

Декомпрессия фрагмента данных с помощью [`BrotliDecompress`](#class-zlibbrotlidecompress).

### `zlib.deflate(buffer[, options], callback)`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.deflateSync(buffer[, options])`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}

Сжать фрагмент данных с помощью [`Deflate`](#class-zlibdeflate).

### `zlib.deflateRaw(buffer[, options], callback)`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.deflateRawSync(buffer[, options])`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}

Сжать фрагмент данных с помощью [`DeflateRaw`](#class-zlibdeflateraw).

### `zlib.gunzip(buffer[, options], callback)`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.gunzipSync(buffer[, options])`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}

Декомпрессия фрагмента данных с помощью [`Gunzip`](#class-zlibgunzip).

### `zlib.gzip(buffer[, options], callback)`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.gzipSync(buffer[, options])`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}

Сжать фрагмент данных с помощью [`Gzip`](#class-zlibgzip).

### `zlib.inflate(buffer[, options], callback)`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.inflateSync(buffer[, options])`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}

Декомпрессия фрагмента данных с помощью [`Inflate`](#class-zlibinflate).

### `zlib.inflateRaw(buffer[, options], callback)`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.inflateRawSync(buffer[, options])`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}

Декомпрессия фрагмента данных с помощью [`InflateRaw`](#class-zlibinflateraw).

### `zlib.unzip(buffer[, options], callback)`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.unzipSync(buffer[, options])`

-   `buffer` {Buffer|TypedArray|DataView|ArrayBuffer|string}
-   `options` {zlib options}

Декомпрессия фрагмента данных с помощью [`Unzip`](#class-zlibunzip).
