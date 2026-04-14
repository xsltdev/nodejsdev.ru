---
title: Итерируемые потоки
description: Модуль node:stream/iter — потоковый API на основе итерируемых объектов, пакетная обработка и обратное давление
---

# Итерируемые потоки

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/stream_iter.html)

<!--introduced_in=v25.9.0-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Эта возможность не подпадает под правила [семантического версионирования](https://semver.org/lang/ru/). Несовместимые назад изменения или удаление могут произойти в любом будущем релизе. Использовать такую возможность в production-окружении не рекомендуется.

<!-- source_link=lib/stream/iter.js -->

Модуль `node:stream/iter` предоставляет потоковый API на основе итерируемых объектов
вместо событийной иерархии классов `Readable`/`Writable`/`Transform`
или интерфейсов Web Streams `ReadableStream`/`WritableStream`/`TransformStream`.

Модуль доступен только при включённом флаге CLI `--experimental-stream-iter`.

Потоки представлены как `AsyncIterable<Uint8Array[]>` (асинхронно) или
`Iterable<Uint8Array[]>` (синхронно). Базовых классов для наследования нет — любой
объект с протоколом итератора может участвовать. Преобразования — обычные
функции или объекты с методом `transform`.

Данные передаются **пакетами** (`Uint8Array[]` за одну итерацию), чтобы амортизировать стоимость
асинхронных операций.

=== "MJS"

    ```js
    import { from, pull, text } from 'node:stream/iter';
    import { compressGzip, decompressGzip } from 'node:zlib/iter';
    
    // Сжать и распаковать строку
    const compressed = pull(from('Hello, world!'), compressGzip());
    const result = await text(pull(compressed, decompressGzip()));
    console.log(result); // 'Hello, world!'
    ```

=== "CJS"

    ```js
    const { from, pull, text } = require('node:stream/iter');
    const { compressGzip, decompressGzip } = require('node:zlib/iter');
    
    async function run() {
      // Сжать и распаковать строку
      const compressed = pull(from('Hello, world!'), compressGzip());
      const result = await text(pull(compressed, decompressGzip()));
      console.log(result); // 'Hello, world!'
    }
    
    run().catch(console.error);
    ```

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';
    import { text, pipeTo } from 'node:stream/iter';
    import { compressGzip, decompressGzip } from 'node:zlib/iter';
    
    // Прочитать файл, сжать, записать в другой файл
    const src = await open('input.txt', 'r');
    const dst = await open('output.gz', 'w');
    await pipeTo(src.pull(), compressGzip(), dst.writer({ autoClose: true }));
    await src.close();
    
    // Прочитать обратно
    const gz = await open('output.gz', 'r');
    console.log(await text(gz.pull(decompressGzip(), { autoClose: true })));
    ```

=== "CJS"

    ```js
    const { open } = require('node:fs/promises');
    const { text, pipeTo } = require('node:stream/iter');
    const { compressGzip, decompressGzip } = require('node:zlib/iter');
    
    async function run() {
      // Прочитать файл, сжать, записать в другой файл
      const src = await open('input.txt', 'r');
      const dst = await open('output.gz', 'w');
      await pipeTo(src.pull(), compressGzip(), dst.writer({ autoClose: true }));
      await src.close();
    
      // Прочитать обратно
      const gz = await open('output.gz', 'r');
      console.log(await text(gz.pull(decompressGzip(), { autoClose: true })));
    }
    
    run().catch(console.error);
    ```

## Основные понятия

### Байтовые потоки

Все данные в этом API представлены как байты `Uint8Array`. Строки
при передаче в `from()`, `push()` или `pipeTo()` автоматически кодируются в UTF-8.
Это устраняет неоднозначность кодировок и позволяет передавать данные без копирования
между потоками и нативным кодом.

### Пакетирование

Каждая итерация выдаёт **пакет** — массив фрагментов `Uint8Array`
(`Uint8Array[]`). Пакетирование амортизирует стоимость `await` и создания Promise
на нескольких фрагментах. Потребитель, обрабатывающий по одному фрагменту, может
просто обойти внутренний массив:

=== "MJS"

    ```js
    for await (const batch of source) {
      for (const chunk of batch) {
        handle(chunk);
      }
    }
    ```

=== "CJS"

    ```js
    async function run() {
      for await (const batch of source) {
        for (const chunk of batch) {
          handle(chunk);
        }
      }
    }
    ```

### Преобразования

Преобразования бывают двух видов:

* **Без состояния** — функция `(chunks, options) => result`, вызываемая один раз на
  пакет. Принимает `Uint8Array[]` (или `null` как сигнал сброса) и объект
  `options`. Возвращает `Uint8Array[]`, `null` или итерируемое фрагментов.

* **С состоянием** — объект `{ transform(source, options) }`, где `transform`
  — генератор (синхронный или асинхронный), получающий весь восходящий итерируемый поток
  и объект `options`, и выдающий выход. Так делают сжатие, шифрование и любые преобразования,
  которым нужен буфер между пакетами.

В обоих случаях передаётся параметр `options` со свойством:

* `options.signal` [`<AbortSignal>`](globals.md#abortsignal) Сигнал прерывания при отмене конвейера,
  ошибке или остановке чтения потребителем. Преобразования могут проверять
  `signal.aborted` или слушать событие `'abort'` для досрочной очистки.

Сигнал сброса (`null`) посылается после окончания источника, чтобы преобразования
могли выдать хвостовые данные (например, подписи сжатия).

```js
// Без состояния: преобразование в верхний регистр
const upper = (chunks) => {
  if (chunks === null) return null; // flush
  return chunks.map((c) => new TextEncoder().encode(
    new TextDecoder().decode(c).toUpperCase(),
  ));
};

// С состоянием: разбиение на строки
const lines = {
  transform: async function*(source) {
    let partial = '';
    for await (const chunks of source) {
      if (chunks === null) {
        if (partial) yield [new TextEncoder().encode(partial)];
        continue;
      }
      for (const chunk of chunks) {
        const str = partial + new TextDecoder().decode(chunk);
        const parts = str.split('\n');
        partial = parts.pop();
        for (const line of parts) {
          yield [new TextEncoder().encode(`${line}\n`)];
        }
      }
    }
  },
};
```

### Pull и push

API поддерживает две модели:

* **Pull** — данные идут по требованию. `pull()` и `pullSync()` создают ленивые
  конвейеры: источник читается только когда потребитель итерирует.

* **Push** — данные записываются явно. `push()` создаёт пару writer/readable
  с обратным давлением. Writer записывает данные; readable потребляется
  как async iterable.

### Обратное давление

У pull-потоков обратное давление естественное — темп задаёт потребитель,
источник не читается быстрее, чем успевает обработка. Push-потокам
нужно явное обратное давление: производитель и потребитель работают
независимо. Параметры `highWaterMark` и `backpressure` у `push()`,
`broadcast()` и `share()` задают поведение.

#### Двухбуферная модель

Push-потоки используют двухчастную буферизацию. Представьте ведро
(slots), заполняемое через шланг (ожидающие записи), с поплавковым клапаном,
который закрывается, когда ведро полно:

```text
                          highWaterMark (напр., 3)
                                 |
    Производитель                v
       |                    +---------+
       v                    |         |
  [ write() ] ----+    +--->| слоты   |---> Потребитель читает
  [ write() ]     |    |    | (ведро) |     for await (...)
  [ write() ]     v    |    +---------+
              +--------+         ^
              | ожидающие|        |
              | записи   |   поплавковый клапан
              | (шланг)  |   (обратное давление)
              +--------+
                   ^
                   |
          режим 'strict' ограничивает и это!
```

* **Слоты (ведро)** — данные, готовые потребителю, не больше
  `highWaterMark`. Когда потребитель читает, он за раз опустошает все слоты
  в один пакет.

* **Ожидающие записи (шланг)** — записи, ждущие места в слотах. После
  того как потребитель опустошил буфер, ожидающие записи попадают в освободившиеся
  слоты и их промисы завершаются.

Как политики используют буферы:

| Политика        | Лимит слотов    | Лимит ожидающих записей |
| --------------- | --------------- | ----------------------- |
| `'strict'`      | `highWaterMark` | `highWaterMark`         |
| `'block'`       | `highWaterMark` | Без ограничения         |
| `'drop-oldest'` | `highWaterMark` | Н/д (никогда не ждёт)   |
| `'drop-newest'` | `highWaterMark` | Н/д (никогда не ждёт)   |

#### Строгий режим (по умолчанию)

Режим strict отсекает сценарии «записал и забыл», когда производитель вызывает
`write()` без `await`, что вело бы к неограниченному росту памяти.
Ограничиваются и буфер слотов, и очередь ожидающих записей значением
`highWaterMark`.

Если каждая запись ожидается через `await`, одновременно может быть не больше одной
ожидающей записи (вашей), лимит очереди не достигается.
Неожидаемые записи накапливаются в очереди и при переполнении вызывают исключение:

=== "MJS"

    ```js
    import { push, text } from 'node:stream/iter';
    
    const { writer, readable } = push({ highWaterMark: 16 });
    
    // Потребитель должен работать параллельно — иначе первая запись,
    // заполнившая буфер, навсегда заблокирует производителя.
    const consuming = text(readable);
    
    // ХОРОШО: await у записей. Производитель ждёт, пока потребитель
    // освободит место, когда буфер полон.
    for (const item of dataset) {
      await writer.write(item);
    }
    await writer.end();
    console.log(await consuming);
    ```

=== "CJS"

    ```js
    const { push, text } = require('node:stream/iter');
    
    async function run() {
      const { writer, readable } = push({ highWaterMark: 16 });
    
      // Потребитель должен работать параллельно — иначе первая запись,
      // заполнившая буфер, навсегда заблокирует производителя.
      const consuming = text(readable);
    
      // ХОРОШО: await у записей. Производитель ждёт, пока потребитель
      // освободит место, когда буфер полон.
      for (const item of dataset) {
        await writer.write(item);
      }
      await writer.end();
      console.log(await consuming);
    }
    
    run().catch(console.error);
    ```

Забытый `await` в итоге приведёт к исключению:

```js
// ПЛОХО: fire-and-forget. В strict оба буфера переполняются.
for (const item of dataset) {
  writer.write(item); // без await — очередь без границ
}
// --> выбрасывается "Backpressure violation: too many pending writes"
```

#### Блокировка

В режиме block слоты ограничены `highWaterMark`, а очередь ожидающих записей
не ограничена. Записи с `await` блокируются, пока потребитель не освободит место,
как в strict. Отличие: неожидаемые записи бессрочно ставятся в очередь без исключения —
возможна утечка памяти, если производитель забывает `await`.

Так по умолчанию ведут себя классические потоки Node.js и Web Streams.
Используйте, когда контролируете производителя и он корректно ожидает записи,
или при переносе кода с этих API.

=== "MJS"

    ```js
    import { push, text } from 'node:stream/iter';
    
    const { writer, readable } = push({
      highWaterMark: 16,
      backpressure: 'block',
    });
    
    const consuming = text(readable);
    
    // Безопасно — await блокирует до чтения потребителем.
    for (const item of dataset) {
      await writer.write(item);
    }
    await writer.end();
    console.log(await consuming);
    ```

=== "CJS"

    ```js
    const { push, text } = require('node:stream/iter');
    
    async function run() {
      const { writer, readable } = push({
        highWaterMark: 16,
        backpressure: 'block',
      });
    
      const consuming = text(readable);
    
      // Безопасно — await блокирует до чтения потребителем.
      for (const item of dataset) {
        await writer.write(item);
      }
      await writer.end();
      console.log(await consuming);
    }
    
    run().catch(console.error);
    ```

#### Вытеснение старейшего

Записи никогда не ждут. Когда буфер слотов полон, самый старый фрагмент
вытесняется, чтобы освободить место новой записи. Потребитель
всегда видит наиболее свежие данные. Удобно для live-лент, телеметрии и
сценариев, где устаревшие данные менее важны текущих.

=== "MJS"

    ```js
    import { push } from 'node:stream/iter';
    
    // Хранить только 5 последних измерений
    const { writer, readable } = push({
      highWaterMark: 5,
      backpressure: 'drop-oldest',
    });
    ```

=== "CJS"

    ```js
    const { push } = require('node:stream/iter');
    
    // Хранить только 5 последних измерений
    const { writer, readable } = push({
      highWaterMark: 5,
      backpressure: 'drop-oldest',
    });
    ```

#### Отбрасывание новых

Записи никогда не ждут. Когда буфер слотов полон, входящая запись
тихо отбрасывается. Потребитель обрабатывает уже буферизованное
без лавины новых данных. Удобно для ограничения скорости или
сброса нагрузки под давлением.

=== "MJS"

    ```js
    import { push } from 'node:stream/iter';
    
    // До 10 элементов в буфере; остальное отбрасывается
    const { writer, readable } = push({
      highWaterMark: 10,
      backpressure: 'drop-newest',
    });
    ```

=== "CJS"

    ```js
    const { push } = require('node:stream/iter');
    
    // До 10 элементов в буфере; остальное отбрасывается
    const { writer, readable } = push({
      highWaterMark: 10,
      backpressure: 'drop-newest',
    });
    ```

### Интерфейс Writer {: #writer-interface}

Writer — любой объект, соответствующий интерфейсу Writer. Обязателен только `write()`;
остальные методы необязательны.

У каждого асинхронного метода есть синхронный вариант `*Sync` для схемы
try-fallback: сначала быстрый синхронный путь, при необходимости —
асинхронная версия, если синхронный вызов не смог завершиться:

=== "MJS"

    ```js
    if (!writer.writeSync(chunk)) await writer.write(chunk);
    if (!writer.writevSync(chunks)) await writer.writev(chunks);
    if (writer.endSync() < 0) await writer.end();
    writer.fail(err);  // всегда синхронно, без запасного пути
    ```

### `writer.desiredSize`

* [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null

Число свободных слотов буфера до достижения high water mark.
Возвращает `null`, если writer закрыт или потребитель отключился.

Значение всегда неотрицательно.

### `writer.end([options])`

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Отменить только эту операцию. Сигнал отменяет только
    ожидающий вызов `end()`; сам writer в ошибку не переводит.
* Возвращает: [`<Promise<number>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Всего записано байт.

Сигнализирует, что данных больше не будет.

### `writer.endSync()`

* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Всего записано байт или `-1`, если writer не открыт.

Синхронный вариант `writer.end()`. Возвращает `-1`, если writer уже
закрыт или в ошибке. Подходит для try-fallback:

=== "CJS"

    ```js
    const result = writer.endSync();
    if (result < 0) {
      writer.end();
    }
    ```

### `writer.fail(reason)`

* `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Переводит writer в терминальное состояние ошибки. Если writer уже закрыт
или в ошибке, вызов ничего не делает. В отличие от `write()` и `end()`, `fail()`
всегда синхронен: ошибка writer — чистый переход состояния без асинхронной работы.

### `writer.write(chunk[, options])`

* `chunk` [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Отменить только эту запись. Сигнал отменяет только
    ожидающий вызов `write()`; сам writer в ошибку не переводит.
* Возвращает: [`<Promise<void>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Записывает фрагмент. Промис завершается, когда в буфере есть место.

### `writer.writeSync(chunk)`

* `chunk` [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если запись принята, `false`, если
  буфер полон.

Синхронная запись. Не блокирует; при активном обратном давлении возвращает `false`.

### `writer.writev(chunks[, options])`

* `chunks` [`<Uint8Array[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Отменить только эту запись. Сигнал отменяет только
    ожидающий вызов `writev()`; сам writer в ошибку не переводит.
* Возвращает: [`<Promise<void>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Записывает несколько фрагментов одним пакетом.

### `writer.writevSync(chunks)`

* `chunks` [`<Uint8Array[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если запись принята, `false`, если
  буфер полон.

Синхронная пакетная запись.

## Модуль `stream/iter`

Все функции доступны и как именованные экспорты, и как свойства
объекта пространства имён `Stream`:

=== "MJS"

    ```js
    // Именованные экспорты
    import { from, pull, bytes, Stream } from 'node:stream/iter';
    
    // Доступ через пространство имён
    Stream.from('hello');
    ```

=== "CJS"

    ```js
    // Именованные экспорты
    const { from, pull, bytes, Stream } = require('node:stream/iter');
    
    // Доступ через пространство имён
    Stream.from('hello');
    ```

Префикс `node:` в спецификаторе модуля указывать необязательно.

## Источники

### `from(input)`

<!-- YAML
added: v25.9.0
-->

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  Не должен быть `null` или `undefined`.
* Возвращает: [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)

Создаёт асинхронный байтовый поток из входных данных. Строки кодируются в UTF-8.
Значения `ArrayBuffer` и `ArrayBufferView` оборачиваются в `Uint8Array`. Массивы
и итерируемые объекты рекурсивно разворачиваются и нормализуются.

Объекты с `Symbol.for('Stream.toAsyncStreamable')` или
`Symbol.for('Stream.toStreamable')` преобразуются по этим протоколам. Протокол
`toAsyncStreamable` имеет приоритет над `toStreamable`, тот — над протоколами
итерации (`Symbol.asyncIterator`, `Symbol.iterator`).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    import { from, text } from 'node:stream/iter';
    
    console.log(await text(from('hello')));       // 'hello'
    console.log(await text(from(Buffer.from('hello')))); // 'hello'
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');
    const { from, text } = require('node:stream/iter');
    
    async function run() {
      console.log(await text(from('hello')));       // 'hello'
      console.log(await text(from(Buffer.from('hello')))); // 'hello'
    }
    
    run().catch(console.error);
    ```

### `fromSync(input)`

<!-- YAML
added: v25.9.0
-->

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  Не должен быть `null` или `undefined`.
* Возвращает: [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)

Синхронный вариант [`from()`](#frominput). Возвращает синхронный итерируемый объект. Не принимает
async iterable и промисы. Объекты с
`Symbol.for('Stream.toStreamable')` преобразуются по этому протоколу (приоритет
над `Symbol.iterator`). Протокол `toAsyncStreamable` полностью
игнорируется.

=== "MJS"

    ```js
    import { fromSync, textSync } from 'node:stream/iter';
    
    console.log(textSync(fromSync('hello'))); // 'hello'
    ```

=== "CJS"

    ```js
    const { fromSync, textSync } = require('node:stream/iter');
    
    console.log(textSync(fromSync('hello'))); // 'hello'
    ```

## Конвейеры

### `pipeTo(source[, ...transforms], writer[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) Источник данных.
* `...transforms` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Ноль или несколько преобразований.
* `writer` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Назначение с методом `write(chunk)`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Прервать конвейер.
  * `preventClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, не вызывать `writer.end()` при
    окончании источника. **По умолчанию:** `false`.
  * `preventFail` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, не вызывать `writer.fail()` при
    ошибке. **По умолчанию:** `false`.
* Возвращает: [`<Promise<number>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Всего записано байт.

Направляет источник через преобразования в writer. Если у writer есть
`writev(chunks)`, целые пакеты передаются одним вызовом (scatter/gather I/O).

Если writer реализует необязательные `*Sync` (`writeSync`, `writevSync`,
`endSync`), `pipeTo()` сначала пытается использовать синхронные методы
как быстрый путь и переходит к асинхронным только если синхронный вызов
не смог завершиться (например, обратное давление или ожидание следующего тика). `fail()` всегда вызывается синхронно.

=== "MJS"

    ```js
    import { from, pipeTo } from 'node:stream/iter';
    import { compressGzip } from 'node:zlib/iter';
    import { open } from 'node:fs/promises';
    
    const fh = await open('output.gz', 'w');
    const totalBytes = await pipeTo(
      from('Hello, world!'),
      compressGzip(),
      fh.writer({ autoClose: true }),
    );
    ```

=== "CJS"

    ```js
    const { from, pipeTo } = require('node:stream/iter');
    const { compressGzip } = require('node:zlib/iter');
    const { open } = require('node:fs/promises');
    
    async function run() {
      const fh = await open('output.gz', 'w');
      const totalBytes = await pipeTo(
        from('Hello, world!'),
        compressGzip(),
        fh.writer({ autoClose: true }),
      );
    }
    
    run().catch(console.error);
    ```

### `pipeToSync(source[, ...transforms], writer[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) Синхронный источник данных.
* `...transforms` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Ноль или несколько синхронных преобразований.
* `writer` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Назначение с методом `write(chunk)`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `preventClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
  * `preventFail` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Всего записано байт.

Синхронный вариант [`pipeTo()`](#pipetosource-transforms-writer-options). Источник, все преобразования и
`writer` должны быть синхронными. Async iterable и промисы не допускаются.

У `writer` должны быть `*Sync` (`writeSync`, `writevSync`,
`endSync`) и `fail()`.

### `pull(source[, ...transforms][, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) Источник данных.
* `...transforms` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Ноль или несколько преобразований.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Прервать конвейер.
* Возвращает: [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)

Создаёт ленивый асинхронный конвейер. Данные из `source` не читаются, пока
возвращаемый итерируемый объект не потребляют. Преобразования применяются по порядку.

=== "MJS"

    ```js
    import { from, pull, text } from 'node:stream/iter';
    
    const asciiUpper = (chunks) => {
      if (chunks === null) return null;
      return chunks.map((c) => {
        for (let i = 0; i < c.length; i++) {
          c[i] -= (c[i] >= 97 && c[i] <= 122) * 32;
        }
        return c;
      });
    };
    
    const result = pull(from('hello'), asciiUpper);
    console.log(await text(result)); // 'HELLO'
    ```

=== "CJS"

    ```js
    const { from, pull, text } = require('node:stream/iter');
    
    const asciiUpper = (chunks) => {
      if (chunks === null) return null;
      return chunks.map((c) => {
        for (let i = 0; i < c.length; i++) {
          c[i] -= (c[i] >= 97 && c[i] <= 122) * 32;
        }
        return c;
      });
    };
    
    async function run() {
      const result = pull(from('hello'), asciiUpper);
      console.log(await text(result)); // 'HELLO'
    }
    
    run().catch(console.error);
    ```

Использование `AbortSignal`:

=== "MJS"

    ```js
    import { pull } from 'node:stream/iter';
    
    const ac = new AbortController();
    const result = pull(source, transform, { signal: ac.signal });
    ac.abort(); // при следующей итерации конвейер выбросит AbortError
    ```

=== "CJS"

    ```js
    const { pull } = require('node:stream/iter');
    
    const ac = new AbortController();
    const result = pull(source, transform, { signal: ac.signal });
    ac.abort(); // при следующей итерации конвейер выбросит AbortError
    ```

### `pullSync(source[, ...transforms])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) Синхронный источник данных.
* `...transforms` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Ноль или несколько синхронных преобразований.
* Возвращает: [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)

Синхронный вариант [`pull()`](#pullsource-transforms-options). Все преобразования должны быть синхронными.

## Push-потоки

### `push([...transforms][, options])`

<!-- YAML
added: v25.9.0
-->

* `...transforms` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные преобразования на стороне
  readable.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум буферизованных слотов до включения
    обратного давления. Должно быть >= 1; меньшие значения приводятся к 1.
    **По умолчанию:** `4`.
  * `backpressure` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Политика обратного давления: `'strict'`, `'block'`,
    `'drop-oldest'` или `'drop-newest'`. **По умолчанию:** `'strict'`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Прервать поток.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `writer` [`<PushWriter>`](stream_iter.md) Сторона writer.
  * `readable` [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) Сторона readable.

Создаёт push-поток с обратным давлением. Writer записывает данные;
readable потребляется как async iterable.

=== "MJS"

    ```js
    import { push, text } from 'node:stream/iter';
    
    const { writer, readable } = push();
    
    // Производитель и потребитель должны работать параллельно. При strict
    // (по умолчанию) await у записей блокирует до чтения потребителем.
    const producing = (async () => {
      await writer.write('hello');
      await writer.write(' world');
      await writer.end();
    })();
    
    console.log(await text(readable)); // 'hello world'
    await producing;
    ```

=== "CJS"

    ```js
    const { push, text } = require('node:stream/iter');
    
    async function run() {
      const { writer, readable } = push();
    
      // Производитель и потребитель должны работать параллельно. При strict
      // (по умолчанию) await у записей блокирует до чтения потребителем.
      const producing = (async () => {
        await writer.write('hello');
        await writer.write(' world');
        await writer.end();
      })();
    
      console.log(await text(readable)); // 'hello world'
      await producing;
    }
    
    run().catch(console.error);
    ```

Writer, возвращаемый `push()`, соответствует [интерфейсу Writer](#writer-interface).

## Дуплексные каналы

### `duplex([options])`

<!-- YAML
added: v25.9.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер буфера в обе стороны.
    **По умолчанию:** `4`.
  * `backpressure` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Политика в обе стороны.
    **По умолчанию:** `'strict'`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Сигнал отмены для обоих каналов.
  * `a` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры направления A→B. Переопределяют
    общие опции.
    * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    * `backpressure` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `b` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры направления B→A. Переопределяют
    общие опции.
    * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    * `backpressure` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Пара `[channelA, channelB]` дуплексных каналов.

Создаёт пару связанных дуплексных каналов для двусторонней связи,
по аналогии с `socketpair()`. Данные, записанные в writer одного канала, появляются в
readable другого.

У каждого канала:

* `writer` — объект [интерфейса Writer](#writer-interface) для отправки данных пиру.
* `readable` — `AsyncIterable<Uint8Array[]>` для чтения данных от
  пира.
* `close()` — закрыть этот конец канала (идемпотентно).
* `[Symbol.asyncDispose]()` — поддержка async dispose для `await using`.

=== "MJS"

    ```js
    import { duplex, text } from 'node:stream/iter';
    
    const [client, server] = duplex();
    
    // Сервер отражает данные обратно
    const serving = (async () => {
      for await (const chunks of server.readable) {
        await server.writer.writev(chunks);
      }
    })();
    
    await client.writer.write('hello');
    await client.writer.end();
    
    console.log(await text(server.readable)); // обработано эхо
    await serving;
    ```

=== "CJS"

    ```js
    const { duplex, text } = require('node:stream/iter');
    
    async function run() {
      const [client, server] = duplex();
    
      // Сервер отражает данные обратно
      const serving = (async () => {
        for await (const chunks of server.readable) {
          await server.writer.writev(chunks);
        }
      })();
    
      await client.writer.write('hello');
      await client.writer.end();
    
      console.log(await text(server.readable)); // обработано эхо
      await serving;
    }
    
    run().catch(console.error);
    ```

## Потребители

### `array(source[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
  * `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум байт к потреблению. Если сумма байт
    превышает лимит, выбрасывается `ERR_OUT_OF_RANGE`
* Возвращает: [`<Promise<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Собирает все фрагменты в массив значений `Uint8Array` (без слияния в один буфер).

### `arrayBuffer(source[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
  * `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум байт к потреблению. Если сумма байт
    превышает лимит, выбрасывается `ERR_OUT_OF_RANGE`
* Возвращает: [`<Promise<ArrayBuffer>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Собирает все байты в `ArrayBuffer`.

### `arrayBufferSync(source[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум байт к потреблению. Если сумма байт
    превышает лимит, выбрасывается `ERR_OUT_OF_RANGE`
* Возвращает: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

Синхронный вариант [`arrayBuffer()`](#arraybuffersource-options).

### `arraySync(source[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум байт к потреблению. Если сумма байт
    превышает лимит, выбрасывается `ERR_OUT_OF_RANGE`
* Возвращает: [`<Uint8Array[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

Синхронный вариант [`array()`](#arraysource-options).

### `bytes(source[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
  * `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум байт к потреблению. Если сумма байт
    превышает лимит, выбрасывается `ERR_OUT_OF_RANGE`
* Возвращает: [`<Promise<Uint8Array>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Собирает все байты потока в один `Uint8Array`.

=== "MJS"

    ```js
    import { from, bytes } from 'node:stream/iter';
    
    const data = await bytes(from('hello'));
    console.log(data); // Uint8Array(5) [ 104, 101, 108, 108, 111 ]
    ```

=== "CJS"

    ```js
    const { from, bytes } = require('node:stream/iter');
    
    async function run() {
      const data = await bytes(from('hello'));
      console.log(data); // Uint8Array(5) [ 104, 101, 108, 108, 111 ]
    }
    
    run().catch(console.error);
    ```

### `bytesSync(source[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум байт к потреблению. Если сумма байт
    превышает лимит, выбрасывается `ERR_OUT_OF_RANGE`
* Возвращает: [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

Синхронный вариант [`bytes()`](#bytessource-options).

### `text(source[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка текста. **По умолчанию:** `'utf-8'`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
  * `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум байт к потреблению. Если сумма байт
    превышает лимит, выбрасывается `ERR_OUT_OF_RANGE`
* Возвращает: [`<Promise<string>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Собирает все байты и декодирует как текст.

=== "MJS"

    ```js
    import { from, text } from 'node:stream/iter';
    
    console.log(await text(from('hello'))); // 'hello'
    ```

=== "CJS"

    ```js
    const { from, text } = require('node:stream/iter');
    
    async function run() {
      console.log(await text(from('hello'))); // 'hello'
    }
    
    run().catch(console.error);
    ```

### `textSync(source[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf-8'`.
  * `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум байт к потреблению. Если сумма байт
    превышает лимит, выбрасывается `ERR_OUT_OF_RANGE`
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Синхронный вариант [`text()`](#textsource-options).

## Утилиты

### `ondrain(drainable)`

<!-- YAML
added: v25.9.0
-->

* `drainable` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект, реализующий протокол drainable.
* Возвращает: [`<Promise<boolean>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) | null

Ожидает снятия обратного давления у drainable writer. Возвращает промис,
который разрешается в `true`, когда writer снова может принять данные, или `null`, если объект
не реализует протокол drainable.

=== "MJS"

    ```js
    import { push, ondrain, text } from 'node:stream/iter';
    
    const { writer, readable } = push({ highWaterMark: 2 });
    writer.writeSync('a');
    writer.writeSync('b');
    
    // Запустить потребление, чтобы буфер мог освободиться
    const consuming = text(readable);
    
    // Буфер полон — ждём drain
    const canWrite = await ondrain(writer);
    if (canWrite) {
      await writer.write('c');
    }
    await writer.end();
    await consuming;
    ```

=== "CJS"

    ```js
    const { push, ondrain, text } = require('node:stream/iter');
    
    async function run() {
      const { writer, readable } = push({ highWaterMark: 2 });
      writer.writeSync('a');
      writer.writeSync('b');
    
      // Запустить потребление, чтобы буфер мог освободиться
      const consuming = text(readable);
    
      // Буфер полон — ждём drain
      const canWrite = await ondrain(writer);
      if (canWrite) {
        await writer.write('c');
      }
      await writer.end();
      await consuming;
    }
    
    run().catch(console.error);
    ```

### `merge(...sources[, options])`

<!-- YAML
added: v25.9.0
-->

* `...sources` [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) Два или более итерируемых источника.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
* Возвращает: [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)

Объединяет несколько async iterable, выдавая пакеты в порядке появления
(что первым дало данные). Все источники потребляются
параллельно.

=== "MJS"

    ```js
    import { from, merge, text } from 'node:stream/iter';
    
    const merged = merge(from('hello '), from('world'));
    console.log(await text(merged)); // порядок зависит от тайминга
    ```

=== "CJS"

    ```js
    const { from, merge, text } = require('node:stream/iter');
    
    async function run() {
      const merged = merge(from('hello '), from('world'));
      console.log(await text(merged)); // порядок зависит от тайминга
    }
    
    run().catch(console.error);
    ```

### `tap(callback)`

<!-- YAML
added: v25.9.0
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) `(chunks) => void` Вызывается для каждого пакета.
* Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Преобразование без состояния.

Создаёт сквозное преобразование, которое наблюдает за пакетами, не меняя их.
Удобно для логов, метрик и отладки.

=== "MJS"

    ```js
    import { from, pull, text, tap } from 'node:stream/iter';
    
    const result = pull(
      from('hello'),
      tap((chunks) => console.log('Batch size:', chunks.length)),
    );
    console.log(await text(result));
    ```

=== "CJS"

    ```js
    const { from, pull, text, tap } = require('node:stream/iter');
    
    async function run() {
      const result = pull(
        from('hello'),
        tap((chunks) => console.log('Batch size:', chunks.length)),
      );
      console.log(await text(result));
    }
    
    run().catch(console.error);
    ```

`tap()` намеренно не запрещает изменять фрагменты на месте
в callback; возвращаемые значения игнорируются.

### `tapSync(callback)`

<!-- YAML
added: v25.9.0
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Синхронный вариант [`tap()`](#tapcallback).

## Несколько потребителей

### `broadcast([options])`

<!-- YAML
added: v25.9.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер буфера в слотах. Должно быть >= 1; меньшие
    значения приводятся к 1. **По умолчанию:** `16`.
  * `backpressure` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'strict'`, `'block'`, `'drop-oldest'` или
    `'drop-newest'`. **По умолчанию:** `'strict'`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `writer` [`<BroadcastWriter>`](stream_iter.md)
  * `broadcast` [`<Broadcast>`](stream_iter.md)

Создаёт широковещательный канал в модели push для нескольких потребителей. Один writer записывает
данные нескольким потребителям. У каждого потребителя свой курсор в общем
буфере.

=== "MJS"

    ```js
    import { broadcast, text } from 'node:stream/iter';
    
    const { writer, broadcast: bc } = broadcast();
    
    // Создать потребителей до записи
    const c1 = bc.push();  // потребитель 1
    const c2 = bc.push();  // потребитель 2
    
    // Производитель и потребители должны работать параллельно. Await у записей
    // блокирует при заполнении буфера до чтения потребителями.
    const producing = (async () => {
      await writer.write('hello');
      await writer.end();
    })();
    
    const [r1, r2] = await Promise.all([text(c1), text(c2)]);
    console.log(r1); // 'hello'
    console.log(r2); // 'hello'
    await producing;
    ```

=== "CJS"

    ```js
    const { broadcast, text } = require('node:stream/iter');
    
    async function run() {
      const { writer, broadcast: bc } = broadcast();
    
      // Создать потребителей до записи
      const c1 = bc.push();  // потребитель 1
      const c2 = bc.push();  // потребитель 2
    
      // Производитель и потребители должны работать параллельно. Await у записей
      // блокирует при заполнении буфера до чтения потребителями.
      const producing = (async () => {
        await writer.write('hello');
        await writer.end();
      })();
    
      const [r1, r2] = await Promise.all([text(c1), text(c2)]);
      console.log(r1); // 'hello'
      console.log(r2); // 'hello'
      await producing;
    }
    
    run().catch(console.error);
    ```

#### `broadcast.bufferSize`

* [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число фрагментов в буфере.

#### `broadcast.cancel([reason])`

* `reason` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Отменяет широковещание. Все потребители получают ошибку.

#### `broadcast.consumerCount`

* [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число активных потребителей.

#### `broadcast.push([...transforms][, options])`

* `...transforms` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
* Возвращает: [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)

Создаёт нового потребителя. Каждый получает все данные, записанные в
broadcast с момента подписки. Необязательные преобразования применяются
к виду данных для этого потребителя.

#### `broadcast[Symbol.dispose]()`

Синоним `broadcast.cancel()`.

### `Broadcast.from(input[, options])`

<!-- YAML
added: v25.9.0
-->

* `input` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | Broadcastable
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Как у `broadcast()`.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) `{ writer, broadcast }`

Создаёт [Broadcast](stream_iter.md) из существующего источника. Источник потребляется
автоматически и транслируется всем подписчикам.

### `share(source[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) Источник для совместного использования.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер буфера. Должно быть >= 1; меньшие значения
    приводятся к 1. **По умолчанию:** `16`.
  * `backpressure` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'strict'`, `'block'`, `'drop-oldest'` или
    `'drop-newest'`. **По умолчанию:** `'strict'`.
* Возвращает: [`<Share>`](stream_iter.md)

Создаёт общий поток в модели pull для нескольких потребителей. В отличие от `broadcast()`,
источник читается только когда потребитель делает pull. Несколько потребителей делят один
буфер.

=== "MJS"

    ```js
    import { from, share, text } from 'node:stream/iter';
    
    const shared = share(from('hello'));
    
    const c1 = shared.pull();
    const c2 = shared.pull();
    
    // Потреблять параллельно, чтобы избежать взаимной блокировки при малых буферах.
    const [r1, r2] = await Promise.all([text(c1), text(c2)]);
    console.log(r1); // 'hello'
    console.log(r2); // 'hello'
    ```

=== "CJS"

    ```js
    const { from, share, text } = require('node:stream/iter');
    
    async function run() {
      const shared = share(from('hello'));
    
      const c1 = shared.pull();
      const c2 = shared.pull();
    
      // Потреблять параллельно, чтобы избежать взаимной блокировки при малых буферах.
      const [r1, r2] = await Promise.all([text(c1), text(c2)]);
      console.log(r1); // 'hello'
      console.log(r2); // 'hello'
    }
    
    run().catch(console.error);
    ```

#### `share.bufferSize`

* [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число фрагментов в буфере.

#### `share.cancel([reason])`

* `reason` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Отменяет общий поток. Все потребители получают ошибку.

#### `share.consumerCount`

* [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число активных потребителей.

#### `share.pull([...transforms][, options])`

* `...transforms` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
* Возвращает: [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)

Создаёт нового потребителя общего источника.

#### `share[Symbol.dispose]()`

Синоним `share.cancel()`.

### `Share.from(input[, options])`

<!-- YAML
added: v25.9.0
-->

* `input` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | Shareable
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Как у `share()`.
* Возвращает: [`<Share>`](stream_iter.md)

Создаёт [Share](stream_iter.md) из существующего источника.

### `shareSync(source[, options])`

<!-- YAML
added: v25.9.0
-->

* `source` [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) Синхронный источник для совместного использования.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Должно быть >= 1; меньшие значения приводятся
    к 1. **По умолчанию:** `16`.
  * `backpressure` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'strict'`.
* Возвращает: [`<SyncShare>`](stream_iter.md)

Синхронный вариант [`share()`](#sharesource-options).

### `SyncShare.fromSync(input[, options])`

<!-- YAML
added: v25.9.0
-->

* `input` [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | SyncShareable
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* Возвращает: [`<SyncShare>`](stream_iter.md)

## Преобразования сжатия и распаковки

Преобразования сжатия и распаковки для `pull()`, `pullSync()`,
`pipeTo()` и `pipeToSync()` доступны в модуле [`node:zlib/iter`](zlib_iter.md).
Подробнее см. в [документации `node:zlib/iter`](zlib_iter.md).

## Совместимость с классическими потоками

Эти функции связывают классические потоки
[`stream.Readable`](stream.md#class-streamreadable)/[`stream.Writable`](stream.md#class-streamwritable) с API `stream/iter`.

И `fromReadable()`, и `fromWritable()` принимают объекты по контракту «утиной типизации» —
не требуется наследование от `stream.Readable` или `stream.Writable`.
Минимальный контракт для каждой функции описан ниже.

### `fromReadable(readable)`

<!-- YAML
added: REPLACEME
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Эта возможность не подпадает под правила семантического версионирования. Несовместимые назад изменения или удаление могут произойти в любом будущем релизе.

* `readable` [`<stream.Readable>`](stream.md#streamreadable) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Классический Readable или любой объект
  с методами `read()` и `on()`.
* Возвращает: [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) Источник async iterable для stream/iter.

Преобразует классический Readable (или эквивалент по контракту) в
источник async iterable stream/iter, который можно передать в [`from()`](#frominput),
[`pull()`](#pullsource-transforms-options), [`text()`](#textsource-options) и т.д.

Если объект реализует протокол [`toAsyncStreamable`](#streamtoasyncstreamable) (как
`stream.Readable`), используется он. Иначе выполняется проверка по `read()` и `on()` (EventEmitter) и поток оборачивается в
пакетный async iterator.

Результат кэшируется на экземпляр — два вызова `fromReadable()` с тем же
потоком возвращают один и тот же iterable.

Для Readable в object mode или с кодировкой фрагменты автоматически
приводятся к `Uint8Array`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { fromReadable, text } from 'node:stream/iter';
    
    const readable = new Readable({
      read() { this.push('hello world'); this.push(null); },
    });
    
    const result = await text(fromReadable(readable));
    console.log(result); // 'hello world'
    ```

=== "CJS"

    ```js
    const { Readable } = require('node:stream');
    const { fromReadable, text } = require('node:stream/iter');
    
    const readable = new Readable({
      read() { this.push('hello world'); this.push(null); },
    });
    
    async function run() {
      const result = await text(fromReadable(readable));
      console.log(result); // 'hello world'
    }
    run();
    ```

### `fromWritable(writable[, options])`

<!-- YAML
added: REPLACEME
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Эта возможность не подпадает под правила семантического версионирования. Несовместимые назад изменения или удаление могут произойти в любом будущем релизе.

* `writable` [`<stream.Writable>`](stream.md#streamwritable) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Классический Writable или любой объект
  с методами `write()` и `on()`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `backpressure` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Политика обратного давления. **По умолчанию:** `'strict'`.
    * `'strict'` — записи отклоняются при полном буфере. Выявляет
      вызовы, игнорирующие обратное давление.
    * `'block'` — записи ждут drain при полном буфере. Рекомендуется
      с [`pipeTo()`](#pipetosource-transforms-writer-options).
    * `'drop-newest'` — при полном буфере новые записи тихо отбрасываются.
    * `'drop-oldest'` — **не поддерживается**. Выбрасывается `ERR_INVALID_ARG_VALUE`.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Адаптер Writer для stream/iter.

Создаёт адаптер Writer stream/iter из классического Writable (или эквивалента по контракту). Его можно передать в [`pipeTo()`](#pipetosource-transforms-writer-options) как
назначение.

Так как все записи в классический Writable по сути асинхронны,
синхронные методы Writer (`writeSync`, `writevSync`, `endSync`) всегда
возвращают `false` или `-1`, передавая работу асинхронному пути. Параметр
`options.signal` на запись из интерфейса Writer также игнорируется.

Результат кэшируется на экземпляр — два вызова `fromWritable()` с тем же
потоком возвращают один и тот же Writer.

Для потоков без `writableHighWaterMark`, `writableLength` и подобных свойств используются разумные значения по умолчанию.
Writable в object mode (если определяется) отклоняются: интерфейс Writer
только для байтов.

=== "MJS"

    ```js
    import { Writable } from 'node:stream';
    import { from, fromWritable, pipeTo } from 'node:stream/iter';
    
    const writable = new Writable({
      write(chunk, encoding, cb) { console.log(chunk.toString()); cb(); },
    });
    
    await pipeTo(from('hello world'),
                 fromWritable(writable, { backpressure: 'block' }));
    ```

=== "CJS"

    ```js
    const { Writable } = require('node:stream');
    const { from, fromWritable, pipeTo } = require('node:stream/iter');
    
    async function run() {
      const writable = new Writable({
        write(chunk, encoding, cb) { console.log(chunk.toString()); cb(); },
      });
    
      await pipeTo(from('hello world'),
                   fromWritable(writable, { backpressure: 'block' }));
    }
    run();
    ```

### `toReadable(source[, options])`

<!-- YAML
added: REPLACEME
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Эта возможность не подпадает под правила семантического версионирования. Несовместимые назад изменения или удаление могут произойти в любом будущем релизе.

* `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) Источник `AsyncIterable<Uint8Array[]>`, например
  результат [`pull()`](#pullsource-transforms-options) или [`from()`](#frominput).
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Внутренний размер буфера в байтах до включения
    обратного давления. **По умолчанию:** `65536` (64 КБ).
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Необязательный сигнал отмены readable.
* Возвращает: [`<stream.Readable>`](stream.md#streamreadable)

Создаёт [`stream.Readable`](stream.md#class-streamreadable) в байтовом режиме из `AsyncIterable<Uint8Array[]>`
(родной формат пакетов API stream/iter). Каждый `Uint8Array` в
выданном пакете передаётся в Readable отдельным фрагментом.

=== "MJS"

    ```js
    import { createWriteStream } from 'node:fs';
    import { from, pull, toReadable } from 'node:stream/iter';
    import { compressGzip } from 'node:zlib/iter';
    
    const source = pull(from('hello world'), compressGzip());
    const readable = toReadable(source);
    
    readable.pipe(createWriteStream('output.gz'));
    ```

=== "CJS"

    ```js
    const { createWriteStream } = require('node:fs');
    const { from, pull, toReadable } = require('node:stream/iter');
    const { compressGzip } = require('node:zlib/iter');
    
    const source = pull(from('hello world'), compressGzip());
    const readable = toReadable(source);
    
    readable.pipe(createWriteStream('output.gz'));
    ```

### `toReadableSync(source[, options])`

<!-- YAML
added: REPLACEME
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Эта возможность не подпадает под правила семантического версионирования. Несовместимые назад изменения или удаление могут произойти в любом будущем релизе.

* `source` [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) Источник `Iterable<Uint8Array[]>`, например
  результат [`pullSync()`](#pullsyncsource-transforms-options) или [`fromSync()`](#fromsyncinput).
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Внутренний размер буфера в байтах до включения
    обратного давления. **По умолчанию:** `65536` (64 КБ).
* Возвращает: [`<stream.Readable>`](stream.md#streamreadable)

Создаёт [`stream.Readable`](stream.md#class-streamreadable) в байтовом режиме из синхронного
`Iterable<Uint8Array[]>`. Метод `_read()` извлекает данные из итератора
синхронно, поэтому данные сразу доступны через `readable.read()`.

=== "MJS"

    ```js
    import { fromSync, toReadableSync } from 'node:stream/iter';
    
    const source = fromSync('hello world');
    const readable = toReadableSync(source);
    
    console.log(readable.read().toString()); // 'hello world'
    ```

=== "CJS"

    ```js
    const { fromSync, toReadableSync } = require('node:stream/iter');
    
    const source = fromSync('hello world');
    const readable = toReadableSync(source);
    
    console.log(readable.read().toString()); // 'hello world'
    ```

### `toWritable(writer)`

<!-- YAML
added: REPLACEME
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Эта возможность не подпадает под правила семантического версионирования. Несовместимые назад изменения или удаление могут произойти в любом будущем релизе.

* `writer` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Writer stream/iter. Обязателен только `write()`;
  `end()`, `fail()`, `writeSync()`, `writevSync()`, `endSync()`,
  и `writev()` необязательны.
* Возвращает: [`<stream.Writable>`](stream.md#streamwritable)

Создаёт классический [`stream.Writable`](stream.md#class-streamwritable), опирающийся на Writer stream/iter.

Каждый вызов `_write()` / `_writev()` сначала пытается синхронные методы Writer
(`writeSync` / `writevSync`), при необходимости переходит к асинхронным, если
синхронный путь вернул `false` или выбросил исключение. Аналогично `_final()` вызывает `endSync()`
перед `end()`. При успехе синхронного пути callback откладывается через
`queueMicrotask`, чтобы сохранить асинхронный контракт.

`highWaterMark` у Writable устанавливается в `Number.MAX_SAFE_INTEGER`, чтобы
по сути отключить внутреннюю буферизацию Writable и позволить нижележащему Writer
управлять обратным давлением.

=== "MJS"

    ```js
    import { push, toWritable } from 'node:stream/iter';
    
    const { writer, readable } = push();
    const writable = toWritable(writer);
    
    writable.write('hello');
    writable.end();
    ```

=== "CJS"

    ```js
    const { push, toWritable } = require('node:stream/iter');
    
    const { writer, readable } = push();
    const writable = toWritable(writer);
    
    writable.write('hello');
    writable.end();
    ```

## Символы протокола

Эти общеизвестные символы позволяют сторонним объектам участвовать в
протоколе потоков без прямого импорта из `node:stream/iter`.

### `Stream.broadcastProtocol`

* Значение: `Symbol.for('Stream.broadcastProtocol')`

Значением должна быть функция. При вызове из `Broadcast.from()` она получает
опции, переданные в `Broadcast.from()`, и должна вернуть объект, соответствующий
интерфейсу [Broadcast](stream_iter.md). Реализация полностью на усмотрение автора — можно
управлять потребителями, буферизацией и обратным давлением как угодно.

=== "MJS"

    ```js
    import { Broadcast, text } from 'node:stream/iter';
    
    // Пример делегирует встроенному Broadcast; своя реализация
    // может использовать любой механизм.
    class MessageBus {
      #broadcast;
      #writer;
    
      constructor() {
        const { writer, broadcast } = Broadcast();
        this.#writer = writer;
        this.#broadcast = broadcast;
      }
    
      [Symbol.for('Stream.broadcastProtocol')](options) {
        return this.#broadcast;
      }
    
      send(data) {
        this.#writer.write(new TextEncoder().encode(data));
      }
    
      close() {
        this.#writer.end();
      }
    }
    
    const bus = new MessageBus();
    const { broadcast } = Broadcast.from(bus);
    const consumer = broadcast.push();
    bus.send('hello');
    bus.close();
    console.log(await text(consumer)); // 'hello'
    ```

=== "CJS"

    ```js
    const { Broadcast, text } = require('node:stream/iter');
    
    // Пример делегирует встроенному Broadcast; своя реализация
    // может использовать любой механизм.
    class MessageBus {
      #broadcast;
      #writer;
    
      constructor() {
        const { writer, broadcast } = Broadcast();
        this.#writer = writer;
        this.#broadcast = broadcast;
      }
    
      [Symbol.for('Stream.broadcastProtocol')](options) {
        return this.#broadcast;
      }
    
      send(data) {
        this.#writer.write(new TextEncoder().encode(data));
      }
    
      close() {
        this.#writer.end();
      }
    }
    
    const bus = new MessageBus();
    const { broadcast } = Broadcast.from(bus);
    const consumer = broadcast.push();
    bus.send('hello');
    bus.close();
    text(consumer).then(console.log); // 'hello'
    ```

### `Stream.drainableProtocol`

* Значение: `Symbol.for('Stream.drainableProtocol')`

Реализуйте, чтобы writer был совместим с `ondrain()`. Метод должен
возвращать промис, который разрешается при снятии обратного давления, или `null`, если
обратного давления нет.

=== "MJS"

    ```js
    import { ondrain } from 'node:stream/iter';
    
    class CustomWriter {
      #queue = [];
      #drain = null;
      #closed = false;
      [Symbol.for('Stream.drainableProtocol')]() {
        if (this.#closed) return null;
        if (this.#queue.length < 3) return Promise.resolve(true);
        this.#drain ??= Promise.withResolvers();
        return this.#drain.promise;
      }
      write(chunk) {
        this.#queue.push(chunk);
      }
      flush() {
        this.#queue.length = 0;
        this.#drain?.resolve(true);
        this.#drain = null;
      }
      close() {
        this.#closed = true;
      }
    }
    const writer = new CustomWriter();
    const ready = ondrain(writer);
    console.log(ready); // Promise { true } — нет обратного давления
    ```

=== "CJS"

    ```js
    const { ondrain } = require('node:stream/iter');
    
    class CustomWriter {
      #queue = [];
      #drain = null;
      #closed = false;
    
      [Symbol.for('Stream.drainableProtocol')]() {
        if (this.#closed) return null;
        if (this.#queue.length < 3) return Promise.resolve(true);
        this.#drain ??= Promise.withResolvers();
        return this.#drain.promise;
      }
    
      write(chunk) {
        this.#queue.push(chunk);
      }
    
      flush() {
        this.#queue.length = 0;
        this.#drain?.resolve(true);
        this.#drain = null;
      }
    
      close() {
        this.#closed = true;
      }
    }
    
    const writer = new CustomWriter();
    const ready = ondrain(writer);
    console.log(ready); // Promise { true } — нет обратного давления
    ```

### `Stream.shareProtocol`

* Значение: `Symbol.for('Stream.shareProtocol')`

Значением должна быть функция. При вызове из `Share.from()` она получает
опции `Share.from()` и должна вернуть объект, соответствующий
интерфейсу [Share](stream_iter.md). Реализация полностью на усмотрение автора — общий
источник, потребители, буферизация и обратное давление задаются произвольно.

=== "MJS"

    ```js
    import { share, Share, text } from 'node:stream/iter';
    
    // Пример делегирует встроенному share(); своя реализация
    // может использовать любой механизм.
    class DataPool {
      #share;
    
      constructor(source) {
        this.#share = share(source);
      }
    
      [Symbol.for('Stream.shareProtocol')](options) {
        return this.#share;
      }
    }
    
    const pool = new DataPool(
      (async function* () {
        yield 'hello';
      })(),
    );
    
    const shared = Share.from(pool);
    const consumer = shared.pull();
    console.log(await text(consumer)); // 'hello'
    ```

=== "CJS"

    ```js
    const { share, Share, text } = require('node:stream/iter');
    
    // Пример делегирует встроенному share(); своя реализация
    // может использовать любой механизм.
    class DataPool {
      #share;
    
      constructor(source) {
        this.#share = share(source);
      }
    
      [Symbol.for('Stream.shareProtocol')](options) {
        return this.#share;
      }
    }
    
    const pool = new DataPool(
      (async function* () {
        yield 'hello';
      })(),
    );
    
    const shared = Share.from(pool);
    const consumer = shared.pull();
    text(consumer).then(console.log); // 'hello'
    ```

### `Stream.shareSyncProtocol`

* Значение: `Symbol.for('Stream.shareSyncProtocol')`

Значением должна быть функция. При вызове из `SyncShare.fromSync()` она получает
опции `SyncShare.fromSync()` и должна вернуть объект, соответствующий
интерфейсу [SyncShare](stream_iter.md). Реализация полностью на усмотрение автора — общий
источник, потребители и буферизация задаются произвольно.

=== "MJS"

    ```js
    import { shareSync, SyncShare, textSync } from 'node:stream/iter';
    
    // Пример делегирует встроенному shareSync(); своя реализация
    // может использовать любой механизм.
    class SyncDataPool {
      #share;
    
      constructor(source) {
        this.#share = shareSync(source);
      }
    
      [Symbol.for('Stream.shareSyncProtocol')](options) {
        return this.#share;
      }
    }
    
    const encoder = new TextEncoder();
    const pool = new SyncDataPool(
      function* () {
        yield [encoder.encode('hello')];
      }(),
    );
    
    const shared = SyncShare.fromSync(pool);
    const consumer = shared.pull();
    console.log(textSync(consumer)); // 'hello'
    ```

=== "CJS"

    ```js
    const { shareSync, SyncShare, textSync } = require('node:stream/iter');
    
    // Пример делегирует встроенному shareSync(); своя реализация
    // может использовать любой механизм.
    class SyncDataPool {
      #share;
    
      constructor(source) {
        this.#share = shareSync(source);
      }
    
      [Symbol.for('Stream.shareSyncProtocol')](options) {
        return this.#share;
      }
    }
    
    const encoder = new TextEncoder();
    const pool = new SyncDataPool(
      function* () {
        yield [encoder.encode('hello')];
      }(),
    );
    
    const shared = SyncShare.fromSync(pool);
    const consumer = shared.pull();
    console.log(textSync(consumer)); // 'hello'
    ```

### `Stream.toAsyncStreamable`

* Значение: `Symbol.for('Stream.toAsyncStreamable')`

Значением должна быть функция, преобразующая объект в потоковое значение.
Когда объект встречается в конвейере (как источник для `from()` или как значение,
возвращаемое преобразованием), вызывается этот метод для получения данных.
Можно вернуть (или дать через Promise) любое потоковое значение: строку,
`Uint8Array`, `AsyncIterable`, `Iterable` или другой потоковый объект.

=== "MJS"

    ```js
    import { from, text } from 'node:stream/iter';
    
    class Greeting {
      #name;
    
      constructor(name) {
        this.#name = name;
      }
    
      [Symbol.for('Stream.toAsyncStreamable')]() {
        return `hello ${this.#name}`;
      }
    }
    
    const stream = from(new Greeting('world'));
    console.log(await text(stream)); // 'hello world'
    ```

=== "CJS"

    ```js
    const { from, text } = require('node:stream/iter');
    
    class Greeting {
      #name;
    
      constructor(name) {
        this.#name = name;
      }
    
      [Symbol.for('Stream.toAsyncStreamable')]() {
        return `hello ${this.#name}`;
      }
    }
    
    const stream = from(new Greeting('world'));
    text(stream).then(console.log); // 'hello world'
    ```

### `Stream.toStreamable`

* Значение: `Symbol.for('Stream.toStreamable')`

Значением должна быть функция, синхронно преобразующая объект в потоковое значение.
Когда объект встречается в конвейере (как источник для `fromSync()` или как значение,
возвращаемое синхронным преобразованием), вызывается этот метод. Нужно
синхронно вернуть потоковое значение: строку, `Uint8Array` или `Iterable`.

=== "MJS"

    ```js
    import { fromSync, textSync } from 'node:stream/iter';
    
    class Greeting {
      #name;
    
      constructor(name) {
        this.#name = name;
      }
    
      [Symbol.for('Stream.toStreamable')]() {
        return `hello ${this.#name}`;
      }
    }
    
    const stream = fromSync(new Greeting('world'));
    console.log(textSync(stream)); // 'hello world'
    ```

=== "CJS"

    ```js
    const { fromSync, textSync } = require('node:stream/iter');
    
    class Greeting {
      #name;
    
      constructor(name) {
        this.#name = name;
      }
    
      [Symbol.for('Stream.toStreamable')]() {
        return `hello ${this.#name}`;
      }
    }
    
    const stream = fromSync(new Greeting('world'));
    console.log(textSync(stream)); // 'hello world'
    ```

[`array()`]: #arraysource-options
[`arrayBuffer()`]: #arraybuffersource-options
[`bytes()`]: #bytessource-options
[`from()`]: #frominput
[`fromSync()`]: #fromsyncinput
[`node:zlib/iter`]: zlib_iter.md
[`node:zlib/iter` documentation]: zlib_iter.md
[`pipeTo()`]: #pipetosource-transforms-writer-options
[`pull()`]: #pullsource-transforms-options
[`pullSync()`]: #pullsyncsource-transforms-options
[`share()`]: #sharesource-options
[`stream.Readable`]: stream.md#class-streamreadable
[`stream.Writable`]: stream.md#class-streamwritable
[`tap()`]: #tapcallback
[`text()`]: #textsource-options
[`toAsyncStreamable`]: #streamtoasyncstreamable
