---
title: Zlib
description: Сжатие и распаковка через Gzip, Deflate/Inflate, Brotli и Zstd на базе потоков Node.js
---

# Zlib

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/zlib.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/zlib.js -->

Модуль `node:zlib` предоставляет сжатие на базе
Gzip, Deflate/Inflate, Brotli и Zstd.

Подключение:

=== "MJS"

    ```js
    import zlib from 'node:zlib';
    ```

=== "CJS"

    ```js
    const zlib = require('node:zlib');
    ```

Сжатие и распаковка опираются на [Streams API][] Node.js.

Сжать или распаковать поток (например, файл) можно, пропустив исходный поток через `Transform` модуля `zlib` в целевой поток:

=== "MJS"

    ```js
    import {
      createReadStream,
      createWriteStream,
    } from 'node:fs';
    import process from 'node:process';
    import { createGzip } from 'node:zlib';
    import { pipeline } from 'node:stream';
    
    const gzip = createGzip();
    const source = createReadStream('input.txt');
    const destination = createWriteStream('input.txt.gz');
    
    pipeline(source, gzip, destination, (err) => {
      if (err) {
        console.error('An error occurred:', err);
        process.exitCode = 1;
      }
    });
    ```

=== "CJS"

    ```js
    const {
      createReadStream,
      createWriteStream,
    } = require('node:fs');
    const process = require('node:process');
    const { createGzip } = require('node:zlib');
    const { pipeline } = require('node:stream');
    
    const gzip = createGzip();
    const source = createReadStream('input.txt');
    const destination = createWriteStream('input.txt.gz');
    
    pipeline(source, gzip, destination, (err) => {
      if (err) {
        console.error('An error occurred:', err);
        process.exitCode = 1;
      }
    });
    ```

Или через промисный API `pipeline`:

=== "MJS"

    ```js
    import {
      createReadStream,
      createWriteStream,
    } from 'node:fs';
    import { createGzip } from 'node:zlib';
    import { pipeline } from 'node:stream/promises';
    
    async function do_gzip(input, output) {
      const gzip = createGzip();
      const source = createReadStream(input);
      const destination = createWriteStream(output);
      await pipeline(source, gzip, destination);
    }
    
    await do_gzip('input.txt', 'input.txt.gz');
    ```

=== "CJS"

    ```js
    const {
      createReadStream,
      createWriteStream,
    } = require('node:fs');
    const process = require('node:process');
    const { createGzip } = require('node:zlib');
    const { pipeline } = require('node:stream/promises');
    
    async function do_gzip(input, output) {
      const gzip = createGzip();
      const source = createReadStream(input);
      const destination = createWriteStream(output);
      await pipeline(source, gzip, destination);
    }
    
    do_gzip('input.txt', 'input.txt.gz')
      .catch((err) => {
        console.error('An error occurred:', err);
        process.exitCode = 1;
      });
    ```

Данные можно сжать или распаковать и за один проход:

=== "MJS"

    ```js
    import process from 'node:process';
    import { Buffer } from 'node:buffer';
    import { deflate, unzip } from 'node:zlib';
    
    const input = '.................................';
    deflate(input, (err, buffer) => {
      if (err) {
        console.error('An error occurred:', err);
        process.exitCode = 1;
      }
      console.log(buffer.toString('base64'));
    });
    
    const buffer = Buffer.from('eJzT0yMAAGTvBe8=', 'base64');
    unzip(buffer, (err, buffer) => {
      if (err) {
        console.error('An error occurred:', err);
        process.exitCode = 1;
      }
      console.log(buffer.toString());
    });
    
    // Или через промисы
    
    import { promisify } from 'node:util';
    const do_unzip = promisify(unzip);
    
    const unzippedBuffer = await do_unzip(buffer);
    console.log(unzippedBuffer.toString());
    ```

=== "CJS"

    ```js
    const { deflate, unzip } = require('node:zlib');
    
    const input = '.................................';
    deflate(input, (err, buffer) => {
      if (err) {
        console.error('An error occurred:', err);
        process.exitCode = 1;
      }
      console.log(buffer.toString('base64'));
    });
    
    const buffer = Buffer.from('eJzT0yMAAGTvBe8=', 'base64');
    unzip(buffer, (err, buffer) => {
      if (err) {
        console.error('An error occurred:', err);
        process.exitCode = 1;
      }
      console.log(buffer.toString());
    });
    
    // Или через промисы
    
    const { promisify } = require('node:util');
    const do_unzip = promisify(unzip);
    
    do_unzip(buffer)
      .then((buf) => console.log(buf.toString()))
      .catch((err) => {
        console.error('An error occurred:', err);
        process.exitCode = 1;
      });
    ```

## Пул потоков и производительность

Все API `zlib`, кроме явно синхронных, используют внутренний пул потоков Node.js. Это может давать неожиданные эффекты и ограничивать производительность.

Одновременное создание и использование большого числа объектов zlib может вызывать сильную фрагментацию памяти.

=== "MJS"

    ```js
    import zlib from 'node:zlib';
    import { Buffer } from 'node:buffer';
    
    const payload = Buffer.from('This is some data');
    
    // WARNING: DO NOT DO THIS!
    for (let i = 0; i < 30000; ++i) {
      zlib.deflate(payload, (err, buffer) => {});
    }
    ```

=== "CJS"

    ```js
    const zlib = require('node:zlib');
    
    const payload = Buffer.from('This is some data');
    
    // WARNING: DO NOT DO THIS!
    for (let i = 0; i < 30000; ++i) {
      zlib.deflate(payload, (err, buffer) => {});
    }
    ```

В примере одновременно создаётся 30 000 экземпляров deflate.
Из‑за особенностей выделения и освобождения памяти в ОС это может привести к сильной фрагментации.

Рекомендуется кэшировать результаты сжатия, чтобы не повторять работу.

## Сжатие HTTP-запросов и ответов

Модуль `node:zlib` позволяет поддержать механизмы `gzip`, `deflate`,
`br` и `zstd` для `content-encoding` из
[HTTP](https://tools.ietf.org/html/rfc7230#section-4.2).

Заголовок [`Accept-Encoding`][] в запросе указывает, какие кодировки сжатия принимает клиент. Заголовок [`Content-Encoding`][]
— какие кодировки сжатия фактически применены к сообщению.

Примеры ниже сильно упрощены. Кодирование через `zlib` может быть дорогим, результаты стоит кэшировать.
См. [настройку использования памяти][Memory usage tuning] о компромиссе скорость/память/степень сжатия для `zlib`.

=== "MJS"

    ```js
    // Пример клиентского запроса
    import fs from 'node:fs';
    import zlib from 'node:zlib';
    import http from 'node:http';
    import process from 'node:process';
    import { pipeline } from 'node:stream';
    
    const request = http.get({ host: 'example.com',
                               path: '/',
                               port: 80,
                               headers: { 'Accept-Encoding': 'br,gzip,deflate,zstd' } });
    request.on('response', (response) => {
      const output = fs.createWriteStream('example.com_index.html');
    
      const onError = (err) => {
        if (err) {
          console.error('An error occurred:', err);
          process.exitCode = 1;
        }
      };
    
      switch (response.headers['content-encoding']) {
        case 'br':
          pipeline(response, zlib.createBrotliDecompress(), output, onError);
          break;
        // Можно также использовать zlib.createUnzip() для обоих случаев ниже:
        case 'gzip':
          pipeline(response, zlib.createGunzip(), output, onError);
          break;
        case 'deflate':
          pipeline(response, zlib.createInflate(), output, onError);
          break;
        case 'zstd':
          pipeline(response, zlib.createZstdDecompress(), output, onError);
          break;
        default:
          pipeline(response, output, onError);
          break;
      }
    });
    ```

=== "CJS"

    ```js
    // Пример клиентского запроса
    const zlib = require('node:zlib');
    const http = require('node:http');
    const fs = require('node:fs');
    const { pipeline } = require('node:stream');
    
    const request = http.get({ host: 'example.com',
                               path: '/',
                               port: 80,
                               headers: { 'Accept-Encoding': 'br,gzip,deflate,zstd' } });
    request.on('response', (response) => {
      const output = fs.createWriteStream('example.com_index.html');
    
      const onError = (err) => {
        if (err) {
          console.error('An error occurred:', err);
          process.exitCode = 1;
        }
      };
    
      switch (response.headers['content-encoding']) {
        case 'br':
          pipeline(response, zlib.createBrotliDecompress(), output, onError);
          break;
        // Можно также использовать zlib.createUnzip() для обоих случаев ниже:
        case 'gzip':
          pipeline(response, zlib.createGunzip(), output, onError);
          break;
        case 'deflate':
          pipeline(response, zlib.createInflate(), output, onError);
          break;
        case 'zstd':
          pipeline(response, zlib.createZstdDecompress(), output, onError);
          break;
        default:
          pipeline(response, output, onError);
          break;
      }
    });
    ```

=== "MJS"

    ```js
    // Пример сервера
    // Запускать gzip на каждый запрос дорого.
    // Эффективнее кэшировать сжатый буфер.
    import zlib from 'node:zlib';
    import http from 'node:http';
    import fs from 'node:fs';
    import { pipeline } from 'node:stream';
    
    http.createServer((request, response) => {
      const raw = fs.createReadStream('index.html');
      // Держать сжатую и несжатую версии ресурса.
      response.setHeader('Vary', 'Accept-Encoding');
      const acceptEncoding = request.headers['accept-encoding'] || '';
    
      const onError = (err) => {
        if (err) {
          // При ошибке мало что сделать: ответ 200 уже ушёл,
          // часть данных могла быть отправлена клиенту.
          // Завершаем ответ и пишем ошибку в журнал.
          response.end();
          console.error('An error occurred:', err);
        }
      };
    
      // Примечание: это не полноценный разбор Accept-Encoding.
      // См. https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
      if (/\bdeflate\b/.test(acceptEncoding)) {
        response.writeHead(200, { 'Content-Encoding': 'deflate' });
        pipeline(raw, zlib.createDeflate(), response, onError);
      } else if (/\bgzip\b/.test(acceptEncoding)) {
        response.writeHead(200, { 'Content-Encoding': 'gzip' });
        pipeline(raw, zlib.createGzip(), response, onError);
      } else if (/\bbr\b/.test(acceptEncoding)) {
        response.writeHead(200, { 'Content-Encoding': 'br' });
        pipeline(raw, zlib.createBrotliCompress(), response, onError);
      } else if (/\bzstd\b/.test(acceptEncoding)) {
        response.writeHead(200, { 'Content-Encoding': 'zstd' });
        pipeline(raw, zlib.createZstdCompress(), response, onError);
      } else {
        response.writeHead(200, {});
        pipeline(raw, response, onError);
      }
    }).listen(1337);
    ```

=== "CJS"

    ```js
    // Пример сервера
    // Запускать gzip на каждый запрос дорого.
    // Эффективнее кэшировать сжатый буфер.
    const zlib = require('node:zlib');
    const http = require('node:http');
    const fs = require('node:fs');
    const { pipeline } = require('node:stream');
    
    http.createServer((request, response) => {
      const raw = fs.createReadStream('index.html');
      // Держать сжатую и несжатую версии ресурса.
      response.setHeader('Vary', 'Accept-Encoding');
      const acceptEncoding = request.headers['accept-encoding'] || '';
    
      const onError = (err) => {
        if (err) {
          // При ошибке мало что сделать: ответ 200 уже ушёл,
          // часть данных могла быть отправлена клиенту.
          // Завершаем ответ и пишем ошибку в журнал.
          response.end();
          console.error('An error occurred:', err);
        }
      };
    
      // Примечание: это не полноценный разбор Accept-Encoding.
      // См. https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
      if (/\bdeflate\b/.test(acceptEncoding)) {
        response.writeHead(200, { 'Content-Encoding': 'deflate' });
        pipeline(raw, zlib.createDeflate(), response, onError);
      } else if (/\bgzip\b/.test(acceptEncoding)) {
        response.writeHead(200, { 'Content-Encoding': 'gzip' });
        pipeline(raw, zlib.createGzip(), response, onError);
      } else if (/\bbr\b/.test(acceptEncoding)) {
        response.writeHead(200, { 'Content-Encoding': 'br' });
        pipeline(raw, zlib.createBrotliCompress(), response, onError);
      } else if (/\bzstd\b/.test(acceptEncoding)) {
        response.writeHead(200, { 'Content-Encoding': 'zstd' });
        pipeline(raw, zlib.createZstdCompress(), response, onError);
      } else {
        response.writeHead(200, {});
        pipeline(raw, response, onError);
      }
    }).listen(1337);
    ```

По умолчанию методы `zlib` при распаковке усечённых данных выбрасывают ошибку. Если известно, что данные неполные, или нужно лишь просмотреть начало сжатого файла, поведение по умолчанию можно изменить, выбрав другой режим сброса для последнего фрагмента входных данных:

```js
// Усечённая версия буфера из примеров выше
const buffer = Buffer.from('eJzT0yMA', 'base64');

zlib.unzip(
  buffer,
  // Для Brotli эквивалент — zlib.constants.BROTLI_OPERATION_FLUSH.
  // Для Zstd эквивалент — zlib.constants.ZSTD_e_flush.
  { finishFlush: zlib.constants.Z_SYNC_FLUSH },
  (err, buffer) => {
    if (err) {
      console.error('An error occurred:', err);
      process.exitCode = 1;
    }
    console.log(buffer.toString());
  });
```

В других случаях ошибок (например, при неверном формате входных данных) поведение не меняется. Так нельзя отличить преждевременный конец входа от отсутствия проверок целостности — нужно вручную убедиться, что результат распаковки корректен.

## Настройка использования памяти

<!--type=misc-->

### Потоки на базе zlib

Из `zlib/zconf.h`, адаптировано для Node.js:

Требования к памяти для deflate (в байтах):

<!-- eslint-disable @stylistic/js/semi -->

```js
(1 << (windowBits + 2)) + (1 << (memLevel + 9))
```

То есть 128K при `windowBits` = 15 плюс 128K при `memLevel` = 8
(значения по умолчанию) плюс несколько килобайт на служебные объекты.

Чтобы снизить потребление памяти по умолчанию с 256K до 128K, задайте:

```js
const options = { windowBits: 14, memLevel: 7 };
```

Обычно при этом сжатие становится слабее.

Для inflate требования к памяти (в байтах): `1 << windowBits`.
То есть 32K при `windowBits` = 15 (по умолчанию) плюс несколько килобайт
на мелкие объекты.

Плюс один внутренний выходной буфер-слэб размера
`chunkSize` (по умолчанию 16K).

На скорость сжатия `zlib` больше всего влияет параметр
`level`. Выше уровень — лучше сжатие, но дольше время. Ниже уровень —
слабее сжатие, но быстрее.

В целом большие значения параметров памяти позволяют Node.js реже вызывать
`zlib`, обрабатывая больше данных за один
`write`. Это ещё один рычаг скорости в обмен на память.

### Потоки на базе Brotli

Для потоков Brotli есть аналоги опций zlib, но с другими допустимыми диапазонами:

* опция `level` у zlib соответствует `BROTLI_PARAM_QUALITY` у Brotli;
* опция `windowBits` у zlib соответствует `BROTLI_PARAM_LGWIN` у Brotli.

Подробнее о параметрах Brotli — [ниже][Brotli parameters].

### Потоки на базе Zstd

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

Для потоков Zstd есть аналоги опций zlib, но с другими диапазонами:

* опция `level` у zlib соответствует `ZSTD_c_compressionLevel` у Zstd;
* опция `windowBits` у zlib соответствует `ZSTD_c_windowLog` у Zstd.

Подробнее о параметрах Zstd — [ниже][Zstd parameters].

## Сброс (flush)

Вызов [`.flush()`][] на потоке сжатия заставляет `zlib` отдать максимум выходных данных на текущий момент. Качество сжатия может ухудшиться, зато данные быстрее становятся доступны.

В примере `flush()` используется для отправки клиенту частичного сжатого HTTP-ответа:

=== "MJS"

    ```js
    import zlib from 'node:zlib';
    import http from 'node:http';
    import { pipeline } from 'node:stream';
    
    http.createServer((request, response) => {
      // Для краткости проверки Accept-Encoding опущены.
      response.writeHead(200, { 'content-encoding': 'gzip' });
      const output = zlib.createGzip();
      let i;
    
      pipeline(output, response, (err) => {
        if (err) {
          // При ошибке мало что сделать: ответ 200 уже ушёл,
          // часть данных могла быть отправлена клиенту.
          // Завершаем ответ и пишем ошибку в журнал.
          clearInterval(i);
          response.end();
          console.error('An error occurred:', err);
        }
      });
    
      i = setInterval(() => {
        output.write(`The current time is ${Date()}\n`, () => {
          // Данные переданы в zlib, но алгоритм мог буферизовать их для лучшего сжатия.
          // Вызов .flush() отдаёт данные, как только клиент готов их принять.
          output.flush();
        });
      }, 1000);
    }).listen(1337);
    ```

=== "CJS"

    ```js
    const zlib = require('node:zlib');
    const http = require('node:http');
    const { pipeline } = require('node:stream');
    
    http.createServer((request, response) => {
      // Для краткости проверки Accept-Encoding опущены.
      response.writeHead(200, { 'content-encoding': 'gzip' });
      const output = zlib.createGzip();
      let i;
    
      pipeline(output, response, (err) => {
        if (err) {
          // При ошибке мало что сделать: ответ 200 уже ушёл,
          // часть данных могла быть отправлена клиенту.
          // Завершаем ответ и пишем ошибку в журнал.
          clearInterval(i);
          response.end();
          console.error('An error occurred:', err);
        }
      });
    
      i = setInterval(() => {
        output.write(`The current time is ${Date()}\n`, () => {
          // Данные переданы в zlib, но алгоритм мог буферизовать их для лучшего сжатия.
          // Вызов .flush() отдаёт данные, как только клиент готов их принять.
          output.flush();
        });
      }, 1000);
    }).listen(1337);
    ```

## Константы

<!-- YAML
added: v0.5.8
-->

<!--type=misc-->

### Константы zlib

Все константы из `zlib.h` также доступны в
`require('node:zlib').constants`. В обычной работе они часто не нужны; они описаны, чтобы наличие не удивляло. Раздел почти взят из [документации zlib][zlib documentation].

Раньше константы были доступны прямо из `require('node:zlib')`,
например `zlib.Z_NO_FLUSH`. Прямой доступ к константам по-прежнему возможен, но устарел.

Допустимые значения сброса:

* `zlib.constants.Z_NO_FLUSH`
* `zlib.constants.Z_PARTIAL_FLUSH`
* `zlib.constants.Z_SYNC_FLUSH`
* `zlib.constants.Z_FULL_FLUSH`
* `zlib.constants.Z_FINISH`
* `zlib.constants.Z_BLOCK`

Коды возврата функций сжатия/распаковки. Отрицательные —
ошибки, положительные — особые, но нормальные события.

* `zlib.constants.Z_OK`
* `zlib.constants.Z_STREAM_END`
* `zlib.constants.Z_NEED_DICT`
* `zlib.constants.Z_ERRNO`
* `zlib.constants.Z_STREAM_ERROR`
* `zlib.constants.Z_DATA_ERROR`
* `zlib.constants.Z_MEM_ERROR`
* `zlib.constants.Z_BUF_ERROR`
* `zlib.constants.Z_VERSION_ERROR`

Уровни сжатия:

* `zlib.constants.Z_NO_COMPRESSION`
* `zlib.constants.Z_BEST_SPEED`
* `zlib.constants.Z_BEST_COMPRESSION`
* `zlib.constants.Z_DEFAULT_COMPRESSION`

Стратегия сжатия:

* `zlib.constants.Z_FILTERED`
* `zlib.constants.Z_HUFFMAN_ONLY`
* `zlib.constants.Z_RLE`
* `zlib.constants.Z_FIXED`
* `zlib.constants.Z_DEFAULT_STRATEGY`

### Константы Brotli

<!-- YAML
added:
 - v11.7.0
 - v10.16.0
-->

Для потоков на базе Brotli доступны дополнительные опции и константы:

#### Операции сброса

Допустимые операции сброса для потоков Brotli:

* `zlib.constants.BROTLI_OPERATION_PROCESS` (по умолчанию для всех операций)
* `zlib.constants.BROTLI_OPERATION_FLUSH` (по умолчанию при вызове `.flush()`)
* `zlib.constants.BROTLI_OPERATION_FINISH` (по умолчанию для последнего фрагмента)
* `zlib.constants.BROTLI_OPERATION_EMIT_METADATA`
  * В контексте Node.js эту операцию использовать сложно: потоковый уровень не даёт ясно знать, какие данные попадут в кадр; через API Node.js эти данные сейчас не прочитать.

#### Параметры компрессора

У кодировщиков Brotli можно задать параметры, влияющие на эффективность и скорость. Ключи и значения доступны как свойства объекта `zlib.constants`.

Основные параметры:

* `BROTLI_PARAM_MODE`
  * `BROTLI_MODE_GENERIC` (по умолчанию)
  * `BROTLI_MODE_TEXT`, подстроен под UTF-8 текст
  * `BROTLI_MODE_FONT`, подстроен под шрифты WOFF 2.0
* `BROTLI_PARAM_QUALITY`
  * От `BROTLI_MIN_QUALITY` до `BROTLI_MAX_QUALITY`,
    по умолчанию `BROTLI_DEFAULT_QUALITY`.
* `BROTLI_PARAM_SIZE_HINT`
  * Ожидаемый размер входа (целое);
    `0`, если размер неизвестен.

Дополнительные флаги для тонкой настройки алгоритма и памяти:

* `BROTLI_PARAM_LGWIN`
  * От `BROTLI_MIN_WINDOW_BITS` до `BROTLI_MAX_WINDOW_BITS`,
    по умолчанию `BROTLI_DEFAULT_WINDOW`, или до
    `BROTLI_LARGE_MAX_WINDOW_BITS`, если установлен флаг `BROTLI_PARAM_LARGE_WINDOW`.
* `BROTLI_PARAM_LGBLOCK`
  * От `BROTLI_MIN_INPUT_BLOCK_BITS` до `BROTLI_MAX_INPUT_BLOCK_BITS`.
* `BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING`
  * Boolean: снижает степень сжатия в пользу скорости распаковки.
* `BROTLI_PARAM_LARGE_WINDOW`
  * Boolean: режим «Large Window Brotli» (несовместим с форматом Brotli в [RFC 7932][]).
* `BROTLI_PARAM_NPOSTFIX`
  * От `0` до `BROTLI_MAX_NPOSTFIX`.
* `BROTLI_PARAM_NDIRECT`
  * От `0` до `15 << NPOSTFIX` с шагом `1 << NPOSTFIX`.

#### Параметры декомпрессора

Дополнительные опции управления распаковкой:

* `BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION`
  * Boolean: влияет на схему внутренних выделений памяти.
* `BROTLI_DECODER_PARAM_LARGE_WINDOW`
  * Boolean: режим «Large Window Brotli» (несовместим с [RFC 7932][]).

### Константы Zstd

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

<!-- YAML
added:
  - v23.8.0
  - v22.15.0
-->

Для потоков на базе Zstd доступны дополнительные опции и константы:

#### Операции сброса

Допустимые операции сброса для потоков Zstd:

* `zlib.constants.ZSTD_e_continue` (по умолчанию для всех операций)
* `zlib.constants.ZSTD_e_flush` (по умолчанию при вызове `.flush()`)
* `zlib.constants.ZSTD_e_end` (по умолчанию для последнего фрагмента)

#### Параметры компрессора

У кодировщиков Zstd можно задать параметры, влияющие на эффективность и скорость. Ключи и значения доступны как свойства `zlib.constants`.

Основные параметры:

* `ZSTD_c_compressionLevel`
  * Параметры сжатия по таблице уровней; по умолчанию
    `ZSTD_CLEVEL_DEFAULT==3`.
* `ZSTD_c_strategy`
  * Стратегия сжатия;
  * возможные значения — в разделе стратегий ниже.

#### Стратегии

Константы для параметра `ZSTD_c_strategy`:

* `zlib.constants.ZSTD_fast`
* `zlib.constants.ZSTD_dfast`
* `zlib.constants.ZSTD_greedy`
* `zlib.constants.ZSTD_lazy`
* `zlib.constants.ZSTD_lazy2`
* `zlib.constants.ZSTD_btlazy2`
* `zlib.constants.ZSTD_btopt`
* `zlib.constants.ZSTD_btultra`
* `zlib.constants.ZSTD_btultra2`

Пример:

```js
const stream = zlib.createZstdCompress({
  params: {
    [zlib.constants.ZSTD_c_strategy]: zlib.constants.ZSTD_btultra,
  },
});
```

#### Pledged Source Size

Ожидаемый полный размер несжатого входа можно задать через `opts.pledgedSrcSize`. Если в конце входа размер не совпадает, сжатие завершится с кодом `ZSTD_error_srcSize_wrong`.

#### Параметры декомпрессора

Дополнительные опции распаковки:

* `ZSTD_d_windowLogMax`
  * Верхний предел (степень двойки), выше которого потоковый API откажется выделять буфер, чтобы защитить хост от чрезмерных требований к памяти.

## Класс: `Options`

<!-- YAML
added: v0.11.1
changes:
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33516
    description: The `maxOutputLength` option is supported now.
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `dictionary` option can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `dictionary` option can be an `Uint8Array` now.
  - version: v5.11.0
    pr-url: https://github.com/nodejs/node/pull/6069
    description: The `finishFlush` option is supported now.
-->

Добавлено в: v0.11.1

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v14.5.0, v12.19.0 | Опция `maxOutputLength` теперь поддерживается. |
    | v9.4.0 | Опцией словаря может быть ArrayBuffer. |
    | v8.0.0 | Опция словаря теперь может быть Uint8Array. |
    | v5.11.0 | Опция FinishFlush теперь поддерживается. |

<!--type=misc-->

У каждого класса на базе zlib есть объект `options`. Он необязателен.

Часть полей имеет смысл только при сжатии и игнорируется классами распаковки.

* `flush` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `zlib.constants.Z_NO_FLUSH`
* `finishFlush` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `zlib.constants.Z_FINISH`
* `chunkSize` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `16 * 1024`
* `windowBits` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `level` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) (только сжатие)
* `memLevel` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) (только сжатие)
* `strategy` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) (только сжатие)
* `dictionary` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) (только deflate/inflate,
  по умолчанию пустой словарь)
* `info` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) (при `true` возвращается объект с `buffer` и `engine`.)
* `maxOutputLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ограничивает размер выхода у
  [вспомогательных методов][convenience methods]. **По умолчанию:** [`buffer.kMaxLength`][]

Подробнее см. документацию [`deflateInit2` and `inflateInit2`][].

## Класс: `BrotliOptions`

<!-- YAML
added: v11.7.0
changes:
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33516
    description: The `maxOutputLength` option is supported now.
-->

Добавлено в: v11.7.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v14.5.0, v12.19.0 | Опция `maxOutputLength` теперь поддерживается. |

<!--type=misc-->

У каждого класса на базе Brotli есть объект `options`. Все поля необязательны.

* `flush` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `zlib.constants.BROTLI_OPERATION_PROCESS`
* `finishFlush` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `zlib.constants.BROTLI_OPERATION_FINISH`
* `chunkSize` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `16 * 1024`
* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект «ключ — значение» с индексированными [параметрами Brotli][Brotli parameters].
* `maxOutputLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ограничивает размер выхода у
  [вспомогательных методов][convenience methods]. **По умолчанию:** [`buffer.kMaxLength`][]
* `info` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` возвращается объект с `buffer` и `engine`. **По умолчанию:** `false`

Например:

```js
const stream = zlib.createBrotliCompress({
  chunkSize: 32 * 1024,
  params: {
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
    [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: fs.statSync(inputFile).size,
  },
});
```

## Класс: `zlib.BrotliCompress`

<!-- YAML
added:
 - v11.7.0
 - v10.16.0
-->

* Расширяет: [`ZlibBase`][]

Сжатие данных алгоритмом Brotli.

## Класс: `zlib.BrotliDecompress`

<!-- YAML
added:
 - v11.7.0
 - v10.16.0
-->

* Расширяет: [`ZlibBase`][]

Распаковка данных алгоритмом Brotli.

## Класс: `zlib.Deflate`

<!-- YAML
added: v0.5.8
-->

* Расширяет: [`ZlibBase`][]

Сжатие через deflate.

## Класс: `zlib.DeflateRaw`

<!-- YAML
added: v0.5.8
-->

* Расширяет: [`ZlibBase`][]

Сжатие через deflate без добавления заголовка `zlib`.

## Класс: `zlib.Gunzip`

<!-- YAML
added: v0.5.8
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5883
    description: Trailing garbage at the end of the input stream will now
                 result in an `'error'` event.
  - version: v5.9.0
    pr-url: https://github.com/nodejs/node/pull/5120
    description: Multiple concatenated gzip file members are supported now.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/2595
    description: A truncated input stream will now result in an `'error'` event.
-->

Добавлено в: v0.5.8

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v6.0.0 | Замыкание мусора в конце входного потока теперь приведет к событию ошибки. |
    | v5.9.0 | Теперь поддерживается несколько объединенных элементов файла gzip. |
    | v5.0.0 | Усеченный входной поток теперь приведет к событию «ошибка». |

* Расширяет: [`ZlibBase`][]

Распаковка потока gzip.

## Класс: `zlib.Gzip`

<!-- YAML
added: v0.5.8
-->

* Расширяет: [`ZlibBase`][]

Сжатие через gzip.

## Класс: `zlib.Inflate`

<!-- YAML
added: v0.5.8
changes:
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/2595
    description: A truncated input stream will now result in an `'error'` event.
-->

Добавлено в: v0.5.8

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v5.0.0 | Усеченный входной поток теперь приведет к событию «ошибка». |

* Расширяет: [`ZlibBase`][]

Распаковка потока deflate.

## Класс: `zlib.InflateRaw`

<!-- YAML
added: v0.5.8
changes:
  - version: v6.8.0
    pr-url: https://github.com/nodejs/node/pull/8512
    description: Custom dictionaries are now supported by `InflateRaw`.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/2595
    description: A truncated input stream will now result in an `'error'` event.
-->

Добавлено в: v0.5.8

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v6.8.0 | Пользовательские словари теперь поддерживаются InflateRaw. |
    | v5.0.0 | Усеченный входной поток теперь приведет к событию «ошибка». |

* Расширяет: [`ZlibBase`][]

Распаковка «сырого» deflate.

## Класс: `zlib.Unzip`

<!-- YAML
added: v0.5.8
-->

* Расширяет: [`ZlibBase`][]

Распаковка потока, сжатого Gzip или Deflate, с автоматическим определением заголовка.

## Класс: `zlib.ZlibBase`

<!-- YAML
added: v0.5.8
changes:
  - version:
     - v11.7.0
     - v10.16.0
    pr-url: https://github.com/nodejs/node/pull/24939
    description: This class was renamed from `Zlib` to `ZlibBase`.
-->

Добавлено в: v0.5.8

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v11.7.0, v10.16.0 | Этот класс был переименован с Zlib на ZlibBase. |

* Расширяет: [`stream.Transform`][]

Не экспортируется модулем `node:zlib`. Описан как базовый класс для компрессоров/декомпрессоров.

Наследует [`stream.Transform`][], поэтому объекты `node:zlib` можно использовать в цепочках `pipe` и подобных операциях с потоками.

### `zlib.bytesWritten`

<!-- YAML
added: v10.0.0
-->

* Тип: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `zlib.bytesWritten` задаёт число байт, записанных в движок до обработки (сжатия или распаковки — в зависимости от производного класса).

### `zlib.close([callback])`

<!-- YAML
added: v0.9.4
-->

* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Закрывает нижележащий дескриптор.

### `zlib.flush([kind, ]callback)`

<!-- YAML
added: v0.5.8
-->

* `kind` **По умолчанию:** `zlib.constants.Z_FULL_FLUSH` для потоков на zlib,
  `zlib.constants.BROTLI_OPERATION_FLUSH` для потоков на Brotli.
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Сбрасывает накопленные данные. Вызывать без нужды не стоит: преждевременный flush ухудшает сжатие.

Сбрасывается только внутреннее состояние `zlib`, не уровень потоков. Поведение как у обычного `.write()`: ставится в очередь после других записей и даёт выход, когда из потока читают данные.

### `zlib.params(level, strategy, callback)`

<!-- YAML
added: v0.11.4
-->

* `level` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `strategy` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Только для потоков на zlib, не для Brotli.

Динамически меняет уровень и стратегию сжатия.
Только для алгоритма deflate.

### `zlib.reset()`

<!-- YAML
added: v0.7.0
-->

Сбрасывает компрессор/декомпрессор к настройкам по умолчанию. Только для inflate и deflate.

## Класс: `ZstdOptions`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

<!-- YAML
added:
  - v23.8.0
  - v22.15.0
-->

<!--type=misc-->

У каждого класса на базе Zstd есть объект `options`. Все поля необязательны.

* `flush` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `zlib.constants.ZSTD_e_continue`
* `finishFlush` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `zlib.constants.ZSTD_e_end`
* `chunkSize` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `16 * 1024`
* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект «ключ — значение» с индексированными [параметрами Zstd][Zstd parameters].
* `maxOutputLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ограничивает размер выхода у
  [вспомогательных методов][convenience methods]. **По умолчанию:** [`buffer.kMaxLength`][]
* `info` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` возвращается объект с `buffer` и `engine`. **По умолчанию:** `false`
* `dictionary` [<Buffer>](buffer.md#buffer) Необязательный словарь для
  повышения эффективности сжатия/распаковки данных с общими с словарём шаблонами.

Например:

```js
const stream = zlib.createZstdCompress({
  chunkSize: 32 * 1024,
  params: {
    [zlib.constants.ZSTD_c_compressionLevel]: 10,
    [zlib.constants.ZSTD_c_checksumFlag]: 1,
  },
});
```

## Класс: `zlib.ZstdCompress`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

<!-- YAML
added:
  - v23.8.0
  - v22.15.0
-->

Сжатие данных алгоритмом Zstd.

## Класс: `zlib.ZstdDecompress`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

<!-- YAML
added:
  - v23.8.0
  - v22.15.0
-->

Распаковка данных алгоритмом Zstd.

## `zlib.constants`

<!-- YAML
added: v7.0.0
-->

Объект с перечислением констант, связанных с Zlib.

## `zlib.crc32(data[, value])`

<!-- YAML
added:
  - v22.2.0
  - v20.15.0
-->

* `data` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Если `data` — строка,
  перед вычислением она кодируется в UTF-8.
* `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательное начальное значение. Должно быть 32-битным беззнаковым целым. **По умолчанию:** `0`
* Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) 32-битное беззнаковое целое с контрольной суммой.

Вычисляет 32-битную контрольную сумму [CRC][Cyclic Redundancy Check] для `data`. Если задан
`value`, оно используется как начальное значение суммы,
иначе начинаем с 0.

CRC предназначен для контрольных сумм и обнаружения ошибок при передаче данных. Для криптографической аутентификации не подходит.

Для согласованности с другими API строка `data` перед вычислением кодируется в UTF-8. Если Node.js используется только для вычисления и сравнения сумм, это согласуется с API, где по умолчанию UTF-8.

Некоторые сторонние библиотеки считают сумму по строке через `str.charCodeAt()`, чтобы работать в браузере.
Чтобы совпасть с такой библиотекой в браузере, лучше использовать ту же библиотеку и в Node.js,
если она там есть. Если нужно именно `zlib.crc32()` для сопоставления с такой библиотекой:

1. Если библиотека принимает `Uint8Array`, в браузере закодируйте строку в `Uint8Array` через `TextEncoder` в UTF-8 и считайте сумму по этим байтам.
2. Если библиотека берёт только строку и опирается на `str.charCodeAt()`, на стороне Node.js преобразуйте строку в буфер через `Buffer.from(str, 'utf16le')`.

=== "MJS"

    ```js
    import zlib from 'node:zlib';
    import { Buffer } from 'node:buffer';
    
    let crc = zlib.crc32('hello');  // 907060870
    crc = zlib.crc32('world', crc);  // 4192936109
    
    crc = zlib.crc32(Buffer.from('hello', 'utf16le'));  // 1427272415
    crc = zlib.crc32(Buffer.from('world', 'utf16le'), crc);  // 4150509955
    ```

=== "CJS"

    ```js
    const zlib = require('node:zlib');
    const { Buffer } = require('node:buffer');
    
    let crc = zlib.crc32('hello');  // 907060870
    crc = zlib.crc32('world', crc);  // 4192936109
    
    crc = zlib.crc32(Buffer.from('hello', 'utf16le'));  // 1427272415
    crc = zlib.crc32(Buffer.from('world', 'utf16le'), crc);  // 4150509955
    ```

## `zlib.createBrotliCompress([options])`

<!-- YAML
added:
 - v11.7.0
 - v10.16.0
-->

* `options` {brotli options}

Создаёт и возвращает новый объект [`BrotliCompress`][].

## `zlib.createBrotliDecompress([options])`

<!-- YAML
added:
 - v11.7.0
 - v10.16.0
-->

* `options` {brotli options}

Создаёт и возвращает новый объект [`BrotliDecompress`][].

## `zlib.createDeflate([options])`

<!-- YAML
added: v0.5.8
-->

* `options` {zlib options}

Создаёт и возвращает новый объект [`Deflate`][].

## `zlib.createDeflateRaw([options])`

<!-- YAML
added: v0.5.8
-->

* `options` {zlib options}

Создаёт и возвращает новый объект [`DeflateRaw`][].

Обновление zlib с 1.2.8 до 1.2.11 изменило поведение при `windowBits` = 8 для потоков raw deflate: zlib автоматически поднимала `windowBits` до 9, если изначально было 8. В новых zlib при этом выбрасывается исключение; Node.js восстановил прежнее поведение (8 → 9), так как при `windowBits = 9` получается поток, фактически использующий только 8-битное окно.

## `zlib.createGunzip([options])`

<!-- YAML
added: v0.5.8
-->

* `options` {zlib options}

Создаёт и возвращает новый объект [`Gunzip`][].

## `zlib.createGzip([options])`

<!-- YAML
added: v0.5.8
-->

* `options` {zlib options}

Создаёт и возвращает новый объект [`Gzip`][].
См. [пример][zlib.createGzip example].

## `zlib.createInflate([options])`

<!-- YAML
added: v0.5.8
-->

* `options` {zlib options}

Создаёт и возвращает новый объект [`Inflate`][].

## `zlib.createInflateRaw([options])`

<!-- YAML
added: v0.5.8
-->

* `options` {zlib options}

Создаёт и возвращает новый объект [`InflateRaw`][].

## `zlib.createUnzip([options])`

<!-- YAML
added: v0.5.8
-->

* `options` {zlib options}

Создаёт и возвращает новый объект [`Unzip`][].

## `zlib.createZstdCompress([options])`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

<!-- YAML
added:
  - v23.8.0
  - v22.15.0
-->

* `options` {zstd options}

Создаёт и возвращает новый объект [`ZstdCompress`][].

## `zlib.createZstdDecompress([options])`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

<!-- YAML
added:
  - v23.8.0
  - v22.15.0
-->

* `options` {zstd options}

Создаёт и возвращает новый объект [`ZstdDecompress`][].

## Вспомогательные методы

<!--type=misc-->

Все эти методы принимают первым аргументом [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView), [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) или строку,
вторым (необязательно) — опции для классов `zlib`, и вызывают переданный callback
в виде `callback(error, result)`.

У каждого метода есть синхронный вариант `*Sync` с теми же аргументами, но без callback.

### `zlib.brotliCompress(buffer[, options], callback)`

<!-- YAML
added:
 - v11.7.0
 - v10.16.0
-->

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {brotli options}
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.brotliCompressSync(buffer[, options])`

<!-- YAML
added:
 - v11.7.0
 - v10.16.0
-->

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {brotli options}

Сжимает фрагмент данных через [`BrotliCompress`][].

### `zlib.brotliDecompress(buffer[, options], callback)`

<!-- YAML
added:
 - v11.7.0
 - v10.16.0
-->

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {brotli options}
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.brotliDecompressSync(buffer[, options])`

<!-- YAML
added:
 - v11.7.0
 - v10.16.0
-->

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {brotli options}

Распаковывает фрагмент данных через [`BrotliDecompress`][].

### `zlib.deflate(buffer[, options], callback)`

<!-- YAML
added: v0.6.0
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.6.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.deflateSync(buffer[, options])`

<!-- YAML
added: v0.11.12
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.11.12

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}

Сжимает фрагмент данных через [`Deflate`][].

### `zlib.deflateRaw(buffer[, options], callback)`

<!-- YAML
added: v0.6.0
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.6.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.deflateRawSync(buffer[, options])`

<!-- YAML
added: v0.11.12
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.11.12

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}

Сжимает фрагмент данных через [`DeflateRaw`][].

### `zlib.gunzip(buffer[, options], callback)`

<!-- YAML
added: v0.6.0
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.6.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.gunzipSync(buffer[, options])`

<!-- YAML
added: v0.11.12
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.11.12

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}

Распаковывает фрагмент данных через [`Gunzip`][].

### `zlib.gzip(buffer[, options], callback)`

<!-- YAML
added: v0.6.0
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.6.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.gzipSync(buffer[, options])`

<!-- YAML
added: v0.11.12
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.11.12

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}

Сжимает фрагмент данных через [`Gzip`][].

### `zlib.inflate(buffer[, options], callback)`

<!-- YAML
added: v0.6.0
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.6.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.inflateSync(buffer[, options])`

<!-- YAML
added: v0.11.12
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.11.12

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}

Распаковывает фрагмент данных через [`Inflate`][].

### `zlib.inflateRaw(buffer[, options], callback)`

<!-- YAML
added: v0.6.0
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.6.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.inflateRawSync(buffer[, options])`

<!-- YAML
added: v0.11.12
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.11.12

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}

Распаковывает фрагмент данных через [`InflateRaw`][].

### `zlib.unzip(buffer[, options], callback)`

<!-- YAML
added: v0.6.0
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.6.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.unzipSync(buffer[, options])`

<!-- YAML
added: v0.11.12
changes:
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/16042
    description: The `buffer` parameter can be an `ArrayBuffer`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `buffer` parameter can be any `TypedArray` or `DataView`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12001
    description: The `buffer` parameter can be an `Uint8Array` now.
-->

Добавлено в: v0.11.12

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v9.4.0 | Параметр `buffer` может быть ArrayBuffer`. |
    | v8.0.0 | Параметром `buffer` может быть любой `TypedArray` или `DataView`. |
    | v8.0.0 | Параметр `buffer` теперь может быть `Uint8Array`. |

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zlib options}

Распаковывает фрагмент данных через [`Unzip`][].

### `zlib.zstdCompress(buffer[, options], callback)`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

<!-- YAML
added:
  - v23.8.0
  - v22.15.0
-->

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zstd options}
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.zstdCompressSync(buffer[, options])`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

<!-- YAML
added:
  - v23.8.0
  - v22.15.0
-->

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zstd options}

Сжимает фрагмент данных через [`ZstdCompress`][].

### `zlib.zstdDecompress(buffer[, options], callback)`

<!-- YAML
added:
  - v23.8.0
  - v22.15.0
-->

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zstd options}
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

### `zlib.zstdDecompressSync(buffer[, options])`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

<!-- YAML
added:
  - v23.8.0
  - v22.15.0
-->

* `buffer` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` {zstd options}

Распаковывает фрагмент данных через [`ZstdDecompress`][].

[Brotli parameters]: #brotli-constants
[Cyclic redundancy check]: https://en.wikipedia.org/wiki/Cyclic_redundancy_check
[Memory usage tuning]: #memory-usage-tuning
[RFC 7932]: https://www.rfc-editor.org/rfc/rfc7932.txt
[Streams API]: stream.md
[Zstd parameters]: #zstd-constants
[`.flush()`]: #zlibflushkind-callback
[`Accept-Encoding`]: https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
[`BrotliCompress`]: #class-zlibbrotlicompress
[`BrotliDecompress`]: #class-zlibbrotlidecompress
[`Content-Encoding`]: https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
[`DeflateRaw`]: #class-zlibdeflateraw
[`Deflate`]: #class-zlibdeflate
[`Gunzip`]: #class-zlibgunzip
[`Gzip`]: #class-zlibgzip
[`InflateRaw`]: #class-zlibinflateraw
[`Inflate`]: #class-zlibinflate
[`Unzip`]: #class-zlibunzip
[`ZlibBase`]: #class-zlibzlibbase
[`ZstdCompress`]: #class-zlibzstdcompress
[`ZstdDecompress`]: #class-zlibzstddecompress
[`buffer.kMaxLength`]: buffer.md#bufferkmaxlength
[`deflateInit2` and `inflateInit2`]: https://zlib.net/manual.html#Advanced
[`stream.Transform`]: stream.md#class-streamtransform
[convenience methods]: #convenience-methods
[zlib documentation]: https://zlib.net/manual.html#Constants
[zlib.createGzip example]: #zlib
