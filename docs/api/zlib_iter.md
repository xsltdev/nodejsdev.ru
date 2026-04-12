---
title: Итерируемое сжатие
description: Модуль node:zlib/iter — преобразования сжатия и распаковки для итерируемых потоков node:stream/iter
---

<!-- markdownlint-disable MD030 MD007 MD051 -->

# Итерируемое сжатие

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/zlib_iter.html)

<!--introduced_in=v25.9.0-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Эта возможность не подпадает под правила [семантического версионирования](https://semver.org/lang/ru/). Несовместимые назад изменения или удаление могут произойти в любом будущем релизе. Использовать такую возможность в production-окружении не рекомендуется.

<!-- source_link=lib/zlib/iter.js -->

Модуль `node:zlib/iter` предоставляет преобразования сжатия и распаковки
для API итерируемых потоков [`node:stream/iter`][].

Модуль доступен только при включённом флаге CLI `--experimental-stream-iter`.

У каждого алгоритма есть асинхронный вариант (сохраняющий состояние async generator — для
[`pull()`][] и [`pipeTo()`][]) и синхронный вариант (сохраняющий состояние sync generator — для `pullSync()` и `pipeToSync()`).

Асинхронные преобразования выполняют сжатие в пуле потоков libuv, перекрывая
ввод-вывод с выполнением JavaScript. Синхронные выполняют сжатие прямо
в основном потоке.

> Примечание: значения по умолчанию для этих преобразований настроены на пропускную способность потоковой передачи
> и отличаются от значений по умолчанию в `node:zlib`. В частности, для gzip/deflate
> по умолчанию уровень 4 (не 6) и memLevel 9 (не 8), для Brotli — качество 6 (не 11). Это соответствует типичным настройкам HTTP-серверов
> и даёт заметно более быстрое сжатие при небольшом снижении
> степени сжатия. Все значения по умолчанию можно переопределить через опции.

=== "MJS"

    ```js
    import { from, pull, bytes, text } from 'node:stream/iter';
    import { compressGzip, decompressGzip } from 'node:zlib/iter';
    
    // Async round-trip
    const compressed = await bytes(pull(from('hello'), compressGzip()));
    const original = await text(pull(from(compressed), decompressGzip()));
    console.log(original); // 'hello'
    ```

=== "CJS"

    ```js
    const { from, pull, bytes, text } = require('node:stream/iter');
    const { compressGzip, decompressGzip } = require('node:zlib/iter');
    
    async function run() {
      const compressed = await bytes(pull(from('hello'), compressGzip()));
      const original = await text(pull(from(compressed), decompressGzip()));
      console.log(original); // 'hello'
    }
    
    run().catch(console.error);
    ```

=== "MJS"

    ```js
    import { fromSync, pullSync, textSync } from 'node:stream/iter';
    import { compressGzipSync, decompressGzipSync } from 'node:zlib/iter';
    
    // Sync round-trip
    const compressed = pullSync(fromSync('hello'), compressGzipSync());
    const original = textSync(pullSync(compressed, decompressGzipSync()));
    console.log(original); // 'hello'
    ```

=== "CJS"

    ```js
    const { fromSync, pullSync, textSync } = require('node:stream/iter');
    const { compressGzipSync, decompressGzipSync } = require('node:zlib/iter');
    
    const compressed = pullSync(fromSync('hello'), compressGzipSync());
    const original = textSync(pullSync(compressed, decompressGzipSync()));
    console.log(original); // 'hello'
    ```

## `compressBrotli([options])`

## `compressBrotliSync([options])`

<!-- YAML
added: v25.9.0
-->

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `chunkSize` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер выходного буфера. **По умолчанию:** `65536` (64 КБ).
  * `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект «ключ — значение», где ключи и значения — записи
    `zlib.constants`. Основные параметры компрессора:
    * `BROTLI_PARAM_MODE` — `BROTLI_MODE_GENERIC` (по умолчанию),
      `BROTLI_MODE_TEXT` или `BROTLI_MODE_FONT`.
    * `BROTLI_PARAM_QUALITY` — от `BROTLI_MIN_QUALITY` до
      `BROTLI_MAX_QUALITY`. **По умолчанию:** `6` (не `BROTLI_DEFAULT_QUALITY`,
      который равен 11). Качество 6 подходит для потоковой передачи; качество 11 —
      для офлайн/сборочного сжатия.
    * `BROTLI_PARAM_SIZE_HINT` — ожидаемый размер входа. **По умолчанию:** `0`
      (неизвестно).
    * `BROTLI_PARAM_LGWIN` — размер окна (log2). **По умолчанию:** `20` (1 МБ).
      В библиотеке Brotli по умолчанию 22 (4 МБ); уменьшенное значение экономит
      память без существенной потери сжатия для потоковых сценариев.
    * `BROTLI_PARAM_LGBLOCK` — размер блока входа (log2).
      Полный список см. в разделе [параметры компрессора Brotli][] в документации по zlib.
  * `dictionary` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Преобразование с состоянием.

Создаёт преобразование сжатия Brotli. Выход совместим с
`zlib.brotliDecompress()` и `decompressBrotli()`/`decompressBrotliSync()`.

## `compressDeflate([options])`

## `compressDeflateSync([options])`

<!-- YAML
added: v25.9.0
-->

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `chunkSize` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер выходного буфера. **По умолчанию:** `65536` (64 КБ).
  * `level` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень сжатия (`0`–`9`). **По умолчанию:** `4`.
  * `windowBits` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `Z_DEFAULT_WINDOWBITS` (15).
  * `memLevel` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `9`.
  * `strategy` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `Z_DEFAULT_STRATEGY`.
  * `dictionary` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Преобразование с состоянием.

Создаёт преобразование сжатия deflate. Выход совместим с
`zlib.inflate()` и `decompressDeflate()`/`decompressDeflateSync()`.

## `compressGzip([options])`

## `compressGzipSync([options])`

<!-- YAML
added: v25.9.0
-->

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `chunkSize` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер выходного буфера. **По умолчанию:** `65536` (64 КБ).
  * `level` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень сжатия (`0`–`9`). **По умолчанию:** `4`.
  * `windowBits` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `Z_DEFAULT_WINDOWBITS` (15).
  * `memLevel` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `9`.
  * `strategy` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `Z_DEFAULT_STRATEGY`.
  * `dictionary` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Преобразование с состоянием.

Создаёт преобразование сжатия gzip. Выход совместим с `zlib.gunzip()`
и `decompressGzip()`/`decompressGzipSync()`.

## `compressZstd([options])`

## `compressZstdSync([options])`

<!-- YAML
added: v25.9.0
-->

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `chunkSize` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер выходного буфера. **По умолчанию:** `65536` (64 КБ).
  * `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект «ключ — значение», где ключи и значения — записи
    `zlib.constants`. Основные параметры компрессора:
    * `ZSTD_c_compressionLevel` — **по умолчанию:** `ZSTD_CLEVEL_DEFAULT` (3).
    * `ZSTD_c_checksumFlag` — формировать контрольную сумму. **По умолчанию:** `0`.
    * `ZSTD_c_strategy` — стратегия сжатия. Значения включают
      `ZSTD_fast`, `ZSTD_dfast`, `ZSTD_greedy`, `ZSTD_lazy`,
      `ZSTD_lazy2`, `ZSTD_btlazy2`, `ZSTD_btopt`, `ZSTD_btultra`,
      `ZSTD_btultra2`.
      Полный список см. в разделе [параметры компрессора Zstd][] в документации по zlib.
  * `pledgedSrcSize` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ожидаемый несжатый размер (необязательная подсказка).
  * `dictionary` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Преобразование с состоянием.

Создаёт преобразование сжатия Zstandard. Выход совместим с
`zlib.zstdDecompress()` и `decompressZstd()`/`decompressZstdSync()`.

## `decompressBrotli([options])`

## `decompressBrotliSync([options])`

<!-- YAML
added: v25.9.0
-->

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `chunkSize` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер выходного буфера. **По умолчанию:** `65536` (64 КБ).
  * `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект «ключ — значение», где ключи и значения — записи
    `zlib.constants`. Доступные параметры декомпрессора:
    * `BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION` — логический
      флаг, влияющий на внутреннее выделение памяти.
    * `BROTLI_DECODER_PARAM_LARGE_WINDOW` — логический флаг, включающий режим «Large
      Window Brotli» (несовместим с [RFC 7932][]).
      Подробнее см. в разделе [параметры декомпрессора Brotli][] в документации по zlib.
  * `dictionary` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Преобразование с состоянием.

Создаёт преобразование распаковки Brotli.

## `decompressDeflate([options])`

## `decompressDeflateSync([options])`

<!-- YAML
added: v25.9.0
-->

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `chunkSize` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер выходного буфера. **По умолчанию:** `65536` (64 КБ).
  * `windowBits` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `Z_DEFAULT_WINDOWBITS` (15).
  * `dictionary` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Преобразование с состоянием.

Создаёт преобразование распаковки deflate.

## `decompressGzip([options])`

## `decompressGzipSync([options])`

<!-- YAML
added: v25.9.0
-->

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `chunkSize` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер выходного буфера. **По умолчанию:** `65536` (64 КБ).
  * `windowBits` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `Z_DEFAULT_WINDOWBITS` (15).
  * `dictionary` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Преобразование с состоянием.

Создаёт преобразование распаковки gzip.

## `decompressZstd([options])`

## `decompressZstdSync([options])`

<!-- YAML
added: v25.9.0
-->

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `chunkSize` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер выходного буфера. **По умолчанию:** `65536` (64 КБ).
  * `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект «ключ — значение», где ключи и значения — записи
    `zlib.constants`. Доступные параметры декомпрессора:
    * `ZSTD_d_windowLogMax` — максимальный размер окна (log2), который декомпрессор
      может выделить. Ограничивает использование памяти при вредоносном входе.
      Подробнее см. в разделе [параметры декомпрессора Zstd][] в документации по zlib.
  * `dictionary` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Преобразование с состоянием.

Создаёт преобразование распаковки Zstandard.

[RFC 7932]: https://www.rfc-editor.org/rfc/rfc7932
[`node:stream/iter`]: stream_iter.md
[`pipeTo()`]: stream_iter.md#pipetosource-transforms-writer-options
[`pull()`]: stream_iter.md#pullsource-transforms-options
[параметры компрессора Brotli]: zlib.md#compressor-options
[параметры декомпрессора Brotli]: zlib.md#decompressor-options
[параметры компрессора Zstd]: zlib.md#compressor-options-1
[параметры декомпрессора Zstd]: zlib.md#decompressor-options-1

<!-- markdownlint-enable MD030 MD007 MD051 -->
