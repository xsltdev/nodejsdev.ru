---
description: Transform streams в Node.js — _transform, _flush, backpressure и пользовательские Duplex
---

# Transform streams в Node.js: \_transform и backpressure

Источник: [theNodeBook — Node.js Transform Streams](https://www.thenodebook.com/streams/transform-streams)

Transform stream в Node.js — это Duplex stream, у которого записанный вход порождает читаемый выход. Паттерн встречается при сжатии, шифровании, разборе CSV, разбиении по строкам и фрейминге протоколов. Каждый входной chunk может дать ноль, один или много выходных chunk. Node вызывает `_transform(chunk, encoding, callback)` для каждого входного chunk, а transform отдаёт результат через `push()`.

## Transform streams в Node.js

`_flush()` выполняется в конце для сброса буферизованного частичного состояния. Backpressure действует с обеих сторон, потому что stream одновременно writable и readable. Transform может принимать вход, пока readable-сторона ждёт потребителя — неограниченная буферизация выхода становится проблемой памяти.

`Readable` streams производят данные. `Writable` — потребляют. Но иногда нужны оба направления, или stream, где две стороны не связаны, или преобразование между входом и выходом.

`Duplex` streams одновременно readable и writable, при этом **две независимые стороны** работают параллельно. `Transform` streams — специализированный вариант `Duplex`, где writable-вход подаётся на readable-выход через функцию преобразования. Различие влияет на то, как вы строите pipeline обработки данных.

Оба типа работают по-разному. У `Duplex` независимые стороны. У `Transform`, которые чаще встречаются в прикладном коде, writable-вход связан с readable-выходом через функцию преобразования. Ниже — несколько пользовательских `Transform` streams с типовыми паттернами, затем — когда выбирать `Duplex`, а когда `Transform`.

## Duplex streams

Сначала `Duplex` streams — они дают контекст для `Transform`. `Duplex` stream одновременно readable и writable: можно вызывать и `read()`, и `write()`, вешать `'data'` и передавать chunk в `write()`. У объекта есть свойства и события и `Readable`, и `Writable`.

Readable- и writable-стороны **независимы**. Запись в `Duplex` затрагивает writable-сторону. Чтение берёт данные с readable-стороны. Две стороны имеют отдельное состояние и отдельный flow control на одном объекте.

Независимость нужна, потому что `Duplex` моделирует двунаправленные каналы связи. Канонический пример — TCP-сокет: отправка на удалённый endpoint через запись в сокет, приём — через чтение. Отправленные и принятые данные идут через разные состояния stream по одному соединению.

На уровне класса `stream.Duplex` наследует `Readable`, но реализует интерфейс `Writable`. Внутри — отдельное состояние readable (`_readableState`) и writable (`_writableState`). В пользовательском `Duplex` вы реализуете и `_read()`, и `_write()`.

Минимальная реализация Duplex stream:

```
import { Duplex } from "stream";

class MinimalDuplex extends Duplex {
  _read(size) {
    // produce data for readable side
    this.push("readable data");
    this.push(null);
  }

  _write(chunk, encoding, callback) {
    // consume data on writable side
    console.log("Received:", chunk.toString());
    callback();
  }
}
```

`_read()` вызывается, когда readable-стороне нужны данные. `_write()` — когда что-то пишет на writable-сторону. Эти методы не взаимодействуют — они полностью независимы.

Использование:

```
const duplex = new MinimalDuplex();

duplex.on("data", (chunk) => {
  console.log("Read:", chunk.toString());
});

duplex.write("written data");
duplex.end();
```

При запуске увидите «Received: written data» со стороны `_write()` и «Read: readable data» со стороны `_read()`. Они не связаны: «written data» не превращается в «readable data» — это два отдельных потока.

Опция `allowHalfOpen` специфична для `Duplex` и меняет поведение при завершении. При создании `Duplex` можно задать `allowHalfOpen: false`.

По умолчанию `allowHalfOpen` равен `true`: readable может завершиться, пока writable ещё открыт, и наоборот. Можно закончить запись и вызвать `end()` на writable, а readable продолжит отдавать данные. Или readable сделает `push(null)` для EOF, а писать на writable ещё можно.

Сетевые сокеты так и работают. При **half-close** TCP одна сторона закончила отправку, но ещё может принимать. Соединение закрыто полностью, когда обе стороны завершили работу.

При `allowHalfOpen: false` завершение одной стороны завершает и другую. Если readable сделал `push(null)`, writable автоматически завершается. Если вызвать `end()` на writable, readable автоматически делает `push(null)`.

```
const duplex = new Duplex({
  allowHalfOpen: false,
  read() {
    // readable implementation
  },
  write(chunk, encoding, callback) {
    // writable implementation
    callback();
  },
});
```

С `allowHalfOpen: false` вызов `duplex.end()` сразу завершает readable-сторону. Используйте это, когда модель не поддерживает half-open — например, протоколы запрос–ответ, где stream должен закрыться полностью, когда закончилось любое направление.

Реальные случаи для «сырых» `Duplex` — в основном I/O-примитивы. Класс `net.Socket` — `Duplex` stream. Writable отправляет данные в сеть, readable принимает. Стороны независимы: то, что вы отправили, — не то, что получили.

Другой пример — `stdin` и `stdout` дочернего процесса: `stdin` writable (данные в процесс), `stdout` readable (данные из процесса). Это `Duplex`, где стороны общаются с внешним процессом, а не друг с другом.

Прикладной код редко пишет `Duplex` с нуля. Для преобразования данных чаще берут `Transform`. Но сначала чуть более реалистичный пример `Duplex`:

Этот `Duplex` держит in-memory буфер. Запись складывает chunk во внутренний массив, чтение забирает из него:

```
class BufferedDuplex extends Duplex {
  constructor(options) {
    super(options);
    this.buffer = [];
  }

  _write(chunk, encoding, callback) {
    this.buffer.push(chunk);
    callback();
  }

  _read(size) {
    if (this.buffer.length > 0) {
      this.push(this.buffer.shift());
    }
  }
}
```

Стороны взаимодействуют через общее состояние (`this.buffer`). При записи chunk попадают в буфер, при чтении — извлекаются. Это простая очередь на `Duplex`.

Даже при общем состоянии `_read()` и `_write()` не вызывают друг друга — только общую структуру данных. Внутренняя логика stream вызывает `_read()`, когда readable нужны данные, и `_write()`, когда пишут на writable.

`Duplex` как очередь или буфер возможен, но основной сценарий — двунаправленный I/O. Большинство процессоров в pipeline должны быть `Transform` streams.

Ещё нюанс: обработка ошибок. У `Duplex` две независимые стороны — ошибка на одной не распространяется на другую автоматически. Ошибка в `_write()` даёт событие `'error'`, но readable продолжит работу, пока вы явно не уничтожите stream. И наоборот: ошибка в `_read()` не останавливает writable.

Вызов `destroy()` на `Duplex` уничтожает обе стороны — корректно: ресурс закрывается целиком, а не одно направление.

```
duplex.destroy(new Error("Fatal error"));
// Both readable and writable sides are now destroyed
```

Это важно при cleanup и отмене. Если `Duplex` моделирует сетевое соединение и оно оборвалось, вы уничтожаете stream — и отправка, и приём останавливаются.

## Transform streams

`Transform` streams — то, к чему чаще приходят при построении обработчиков данных. `Transform` — специализированный `Duplex`, где writable-вход связан с readable-выходом функцией преобразования. Данные входят с одной стороны, обрабатываются и выходят с другой.

В отличие от «сырого» `Duplex` с независимыми сторонами, у `Transform` есть **причинная связь**: то, что вы пишете на writable, напрямую влияет на readable. Вы реализуете не два канала, а функцию «входной chunk → выходные chunk».

Типичные примеры из стандартной библиотеки Node.js — сжатие и шифрование. `zlib.createGzip()` возвращает `Transform`: пишете несжатые данные, читаете сжатые. `crypto.createCipheriv()` — `Transform`: plaintext на входе, ciphertext на выходе. Преобразование внутри stream.

Класс `Transform` отличается от `Duplex` несколькими способами. `Transform` наследует `Duplex`, но вместо `_read()` и `_write()` реализуется другой метод — `_transform()`.

Сигнатура `_transform()`:

```
_transform(chunk, encoding, callback)
```

Метод получает **chunk** с writable-стороны, обрабатывает его и через `push()` отдаёт ноль или больше выходных chunk. По завершении вызывает **callback**, сигнализируя готовность к следующему chunk.

Простой `Transform`, переводящий текст в верхний регистр:

```
import { Transform } from "stream";

class UppercaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    const upper = chunk.toString().toUpperCase();
    this.push(upper);
    callback();
  }
}
```

`_transform()` получает chunk (по умолчанию `Buffer`), преобразует в строку, делает uppercase, `push()` на readable и `callback()` — преобразование chunk завершено.

Использование:

```
const upper = new UppercaseTransform();

upper.on("data", (chunk) => {
  console.log(chunk.toString());
});

upper.write("hello");
upper.write("world");
upper.end();
```

Вывод: «HELLO» и «WORLD». Каждый записанный chunk преобразуется и появляется на readable-стороне.

В отличие от `Duplex`, `_read()` у `Transform` уже реализован — переопределять не нужно. Базовый класс тянет данные из внутреннего буфера, который наполняет ваш `_transform()`. `_write()` вызывает `_transform()`. Вы пишете только **логику преобразования** — «обвязку» stream даёт базовый класс.

Поэтому `Transform` проще, чем «сырой» `Duplex`: фокус на «что сделать с этим chunk», а не на управлении двумя независимыми сторонами.

Параметр `callback` в `_transform()` делает две вещи: сигнализирует, что текущий chunk обработан, и позволяет передать ошибку.

При ошибке во время преобразования передайте её в callback:

```
_transform(chunk, encoding, callback) {
  try {
    const result = JSON.parse(chunk.toString());
    this.push(JSON.stringify(result));
    callback();
  } catch (err) {
    callback(err);
  }
}
```

Ошибка в callback → событие `'error'`, обработка останавливается. Буферизованные данные отбрасываются, stream переходит в **состояние ошибки**.

Можно вызвать `this.push()` несколько раз в одном `_transform()` — **преобразование один-ко-многим**: один входной chunk даёт несколько выходных.

`Transform`, разбивающий вход на строки:

```
class LineSplitter extends Transform {
  _transform(chunk, encoding, callback) {
    const lines = chunk.toString().split("\n");
    for (const line of lines) {
      if (line.length > 0) {
        this.push(line + "\n");
      }
    }
    callback();
  }
}
```

Запись `"hello\nworld\n"` даёт два chunk: `"hello\n"` и `"world\n"`.

Можно ничего не пушить: если chunk нужно отфильтровать, вызовите callback без `push`:

```
_transform(chunk, encoding, callback) {
  const text = chunk.toString();
  if (!text.startsWith("#")) {
    this.push(chunk);
  }
  callback();
}
```

Этот transform отбрасывает chunk, начинающиеся с `"#"`.

Для **преобразования многие-в-один**, когда нужно накопить несколько входных chunk перед выходом (структурированные данные на границе chunk), используйте состояние экземпляра:

`Transform`, накапливающий chunk до разделителя, затем отдающий накопленное:

```
class DelimiterParser extends Transform {
  constructor(delimiter, options) {
    super(options);
    this.delimiter = delimiter;
    this.buffer = "";
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const parts = this.buffer.split(this.delimiter);
    this.buffer = parts.pop(); // last part is incomplete

    for (const part of parts) {
      this.push(part);
    }
    callback();
  }
}
```

Transform держит `this.buffer`, дописывает каждый chunk, режет по разделителю и пушит полные части. Последняя часть (возможно неполная) остаётся в буфере до следующего вызова.

Базовый паттерн `Transform`: **состояние между вызовами** `_transform()` для структур, пересекающих границы chunk — **stateful transformation**.

У реализации выше есть проблема: при завершении stream остаток в буфере теряется. Здесь помогает `_flush()`.

## Метод \_flush()

У `Transform` streams есть второй метод — `_flush()`. Он вызывается после обработки всех входных chunk (после `end()` на writable), но до `push(null)` на readable для EOF. Это шанс отдать оставшиеся данные.

Сигнатура `_flush()`:

```
_flush(callback)
```

Только callback, без chunk. Можно `this.push()` для финальных данных, затем callback — сброс завершён.

Парсер с разделителем и `_flush()`:

```
class DelimiterParser extends Transform {
  constructor(delimiter, options) {
    super(options);
    this.delimiter = delimiter;
    this.buffer = "";
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const parts = this.buffer.split(this.delimiter);
    this.buffer = parts.pop();

    for (const part of parts) {
      this.push(part);
    }
    callback();
  }

  _flush(callback) {
    if (this.buffer.length > 0) {
      this.push(this.buffer);
    }
    callback();
  }
}
```

При завершении stream вызывается `_flush()`. Остаток в буфере уходит последним chunk, затем callback, затем `push(null)` на readable.

Без `_flush()` данные без завершающего разделителя теряются. С `_flush()` они становятся финальным chunk. Парсерам, декодерам и любому `Transform` с накоплением состояния это нужно.

Callback `_flush()` работает как в `_transform()`. При ошибке передайте её в callback:

```
_flush(callback) {
  if (this.buffer.length > 0) {
    try {
      const parsed = this.parseBuffer(this.buffer);
      this.push(parsed);
      callback();
    } catch (err) {
      callback(err);
    }
  } else {
    callback();
  }
}
```

Ошибка в callback → событие `'error'` вместо чистого завершения.

`_flush()` **необязателен**. Без него stream просто завершается без финального шага. Transform без накопления (как uppercase) не нуждаются в flush: каждый chunk независим.

Для transform с буфером между chunk — парсеры, декодеры, агрегаторы — **`_flush()` обязателен**, иначе данные потеряются.

Более полный пример: разбор **NDJSON** (JSON по строкам), каждая строка — отдельный документ.

```
class NDJSONParser extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });
    this.buffer = "";
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop();

    for (const line of lines) {
      if (line.trim().length > 0) {
        try {
          const obj = JSON.parse(line);
          this.push(obj);
        } catch (err) {
          return callback(err);
        }
      }
    }
    callback();
  }

  _flush(callback) {
    if (this.buffer.trim().length > 0) {
      try {
        const obj = JSON.parse(this.buffer);
        this.push(obj);
        callback();
      } catch (err) {
        callback(err);
      }
    } else {
      callback();
    }
  }
}
```

Transform в `objectMode` пушит объекты JavaScript, а не буферы. Каждая строка парсится в JSON; неполная строка в конце chunk буферизуется; при завершении `_flush()` разбирает остаток.

Если `JSON.parse()` бросает исключение, передаём ошибку в callback — stream останавливается. `return callback(err)` — не продолжаем после ошибки.

Паттерн «буфер между chunk → split по разделителю → разбор полных единиц → flush остатка» встречается почти везде в `Transform` для структурированных данных.

!!!note ""

    Любой stateful `Transform`, который накапливает байты или символы между chunk, должен реализовать `_flush()`. Иначе последняя неполная единица данных исчезнет при `end()` на writable-стороне.

## Пользовательские Transform streams

Разобрав механику, реализуем несколько `Transform` streams: **фильтрация**, **map**, **split**, **join** и **stateful parsing**.

**Filter transforms** пропускают chunk, удовлетворяющие условию, остальные отбрасывают. Фильтр пустых строк:

```
class NonEmptyLines extends Transform {
  _transform(chunk, encoding, callback) {
    const text = chunk.toString();
    if (text.trim().length > 0) {
      this.push(chunk);
    }
    callback();
  }
}
```

Если после trim есть содержимое — push. Иначе пропуск. Callback вызывается всегда, даже без push.

**Map transforms** превращают каждый входной chunk в другой, часто в `objectMode`. Извлечение полей из JSON-объектов:

```
class FieldExtractor extends Transform {
  constructor(fields, options) {
    super({ ...options, objectMode: true });
    this.fields = fields;
  }

  _transform(obj, encoding, callback) {
    const extracted = {};
    for (const field of this.fields) {
      if (obj[field] !== undefined) {
        extracted[field] = obj[field];
      }
    }
    this.push(extracted);
    callback();
  }
}
```

Каждый объект → новый объект с указанными полями. Один объект на входе, один на выходе — **one-to-one transform**.

**Split transforms** дробят вход на меньшие части. Был line splitter; ниже — разбиение на chunk фиксированного размера в байтах:

```
class ChunkSplitter extends Transform {
  constructor(chunkSize, options) {
    super(options);
    this.chunkSize = chunkSize;
    this.buffer = Buffer.alloc(0);
  }

  _transform(chunk, encoding, callback) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.buffer.length >= this.chunkSize) {
      const piece = this.buffer.slice(0, this.chunkSize);
      this.buffer = this.buffer.slice(this.chunkSize);
      this.push(piece);
    }
    callback();
  }

  _flush(callback) {
    if (this.buffer.length > 0) {
      this.push(this.buffer);
    }
    callback();
  }
}
```

Данные копятся в буфере; при достижении `chunkSize` отрезается piece и пушится. Цикл, пока в буфере меньше `chunkSize`. В `_flush()` — остаток как финальный неполный chunk.

**Join transforms** объединяют несколько входных chunk в один. Накопление объектов в массив с выдачей при достижении размера:

```
class BatchAccumulator extends Transform {
  constructor(batchSize, options) {
    super({ ...options, objectMode: true });
    this.batchSize = batchSize;
    this.batch = [];
  }

  _transform(obj, encoding, callback) {
    this.batch.push(obj);
    if (this.batch.length >= this.batchSize) {
      this.push(this.batch);
      this.batch = [];
    }
    callback();
  }

  _flush(callback) {
    if (this.batch.length > 0) {
      this.push(this.batch);
    }
    callback();
  }
}
```

**Many-to-one transform**: накапливает `batchSize` объектов, пушит массив. Неполный batch в конце — в `_flush()`.

**Stateful parsing transforms** держат состояние между chunk для структурированных данных. Пример: парсер **бинарных сообщений с префиксом длины**.

В протоколе с length-prefix каждое сообщение начинается с 4 байт (`uint32`) — длина следующих байт. Нужно прочитать длину, затем столько байт, повторить.

```
class LengthPrefixedParser extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });
    this.buffer = Buffer.alloc(0);
    this.expectedLength = null;
  }

  _transform(chunk, encoding, callback) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.buffer.length >= 4) {
      if (this.expectedLength === null) {
        this.expectedLength = this.buffer.readUInt32BE(0);
        this.buffer = this.buffer.slice(4);
      }

      if (this.buffer.length >= this.expectedLength) {
        const message = this.buffer.slice(0, this.expectedLength);
        this.buffer = this.buffer.slice(this.expectedLength);
        this.expectedLength = null;
        this.push(message);
      } else {
        break;
      }
    }
    callback();
  }
}
```

**Конечный автомат**: `expectedLength` — ждём заголовок длины или тело сообщения. Цикл читает полные сообщения из буфера и пушит их, затем callback.

`_flush()` нет: при EOF неполные данные (частичный заголовок или тело) теряются. Для одних протоколов это ошибка, для других — финальное неполное сообщение или ошибка в `_flush()`.

Большинство ваших transform — вариации этих паттернов.

## Проблема границ chunk

Структуры данных на границах chunk ломают почти любую реализацию `Transform` — источник тонких багов в streaming-коде.

Chunk в потоке байт или текста **произвольны**. Stream не знает структуру ваших данных. При разборе JSON по строкам перевод строка может оказаться в середине chunk, ровно на границе или объект может быть разрезан между двумя chunk.

Нельзя считать каждый chunk целой единицей. Нужна работа с **частичными данными**.

Мы видели это в delimiter parser и length-prefixed parser. **Буферизация**: внутренний буфер (строка или `Buffer`) копит вход, обрабатывает полные единицы, неполное оставляет на следующий вызов.

Паттерн в абстракции:

```
class Parser extends Transform {
  constructor(options) {
    super(options);
    this.buffer = "";
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();

    let unit;
    while ((unit = this.extractCompleteUnit(this.buffer))) {
      this.buffer = unit.remainder;
      this.push(unit.data);
    }

    callback();
  }

  _flush(callback) {
    if (this.buffer.length > 0) {
      // handle remaining data
    }
    callback();
  }

  extractCompleteUnit(buffer) {
    // return { data, remainder } or null
  }
}
```

`extractCompleteUnit()` пытается разобрать одну полную единицу. Успех → `{ data, remainder }`, иначе `null`. Цикл, пока буфер не пуст и не неполон.

Так произвольные границы chunk обрабатываются корректно.

Пример: CSV из stream. Строки по `\n`, поля по запятой. Строка может быть разрезана между chunk; поле может содержать `\n` в кавычках.

Упрощённый CSV-парсер (без кавычек):

```
class SimpleCSVParser extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });
    this.buffer = "";
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop();

    for (const line of lines) {
      const fields = line.split(",");
      this.push(fields);
    }
    callback();
  }

  _flush(callback) {
    if (this.buffer.length > 0) {
      const fields = this.buffer.split(",");
      this.push(fields);
    }
    callback();
  }
}
```

Границы строк обрабатываются. Неполная строка буферизуется до `\n` в следующем chunk.

Кавычки не учтены: поле `"hello\nworld"` не должно резать строку по внутреннему `\n` — нужен более сложный автомат с учётом «внутри кавычек».

Правильный `Transform` учитывает, что структуры пересекают chunk. Инструменты — буферизация и конечные автоматы.

## Push и backpressure в Transform

`this.push()` в `Transform` тоньше, чем кажется: `push` — интерфейс readable-стороны и учитывает **backpressure**.

`this.push(chunk)` кладёт chunk во внутренний буфер readable. Ниже `highWaterMark` — `push` возвращает `true`. На уровне или выше — `false`, сигнал backpressure.

Проверка в `_transform()`:

```
_transform(chunk, encoding, callback) {
  const transformed = this.transformData(chunk);
  const canContinue = this.push(transformed);

  if (!canContinue) {
    // readable side is full, but we have to process this chunk
  }

  callback();
}
```

Обычно возврат `push` в `_transform()` не меняет логику: callback всё равно нужен. Базовый `Transform` сам не вызовет `_transform()` снова, пока readable не опустошится. Pause/resume вручную не нужны.

Это отличается от `Readable`, где при `false` от `push` останавливают `_read()`. В `Transform` базовый класс координирует стороны.

При one-to-many (несколько `push` в одном `_transform()`) иногда проверяют `push` и останавливаются при backpressure:

```
_transform(chunk, encoding, callback) {
  const parts = this.splitIntoParts(chunk);

  for (const part of parts) {
    const canContinue = this.push(part);
    if (!canContinue) {
      // readable side is full, buffer the rest
      this.bufferedParts = parts.slice(parts.indexOf(part) + 1);
      break;
    }
  }

  callback();
}
```

Чаще пушат все части и полагаются на буфер readable до `highWaterMark`, после чего `_transform()` не вызывается, пока буфер не дренируется.

Автоматический backpressure делает `Transform` проще «сырого» `Duplex`: базовый класс согласует обе стороны.

## PassThrough

Встроенный `Transform`, который ничего не меняет: `stream.PassThrough`. В `_transform()` входной chunk пушится без изменений.

```
import { PassThrough } from "stream";

const passthrough = new PassThrough();
```

Сценарии: наблюдение или перехват данных без модификации.

Вставка `PassThrough` в pipeline и `'data'` для логирования без влияния на поток:

```
import { pipeline } from "stream/promises";

const passthrough = new PassThrough();

passthrough.on("data", (chunk) => {
  console.log("Passing through:", chunk.length, "bytes");
});

await pipeline(source, passthrough, destination);
```

Другой сценарий — **tee** / **broadcast**: разветвление stream на несколько назначений через несколько `PassThrough`.

`PassThrough` удобен в тестах: пишете данные, читаете, проверяете логику.

Своя реализация:

```
class MyPassThrough extends Transform {
  _transform(chunk, encoding, callback) {
    callback(null, chunk);
  }
}
```

`callback(null, chunk)` — сокращение для push + callback:

```
this.push(chunk);
callback();
```

Частый паттерн при ровно одном выходном chunk на входной.

## Transform и Duplex — что выбрать

Мы разобрали оба типа. Выбор влияет на дизайн API.

`Transform` — pipeline, где входные chunk становятся выходными. Выход зависит от входа: сжатие, шифрование, парсинг, форматирование, фильтрация, map.

`Duplex` — двунаправленные каналы с независимыми readable и writable: сокеты, IPC, прокси, двунаправленный обмен сообщениями.

Влияет ли запись на чтение? Да → `Transform`. Нет → `Duplex`.

В прикладном коде чаще `Transform`. `Duplex` — на системном уровне (сеть, IPC): каналы, а не преобразования.

Примеры:

**Transform** для сжатия:

```
import { createGzip } from "zlib";

const gzip = createGzip();
input.pipe(gzip).pipe(output);
```

Запись в `gzip` (несжатое) определяет чтение (сжатое) — преобразование.

**Duplex** как TCP-сокет:

```
import { connect } from "net";

const socket = connect(3000, "localhost");
socket.write("request");
socket.on("data", (chunk) => {
  console.log("response:", chunk);
});
```

Запрос на writable не «порождает» ответ на readable — независимые стороны, канал.

Тонкий случай для `Duplex`: независимый ввод/вывод с общим состоянием — шифрование исходящего и расшифровка входящего одним ключом. Технически `Duplex`, но чаще два `Transform` (encrypt/decrypt) — чище и композируемее.

Правило: то, что естественно встаёт в pipeline с другими transform — делайте `Transform`. То, что на границе системы и общается с внешним миром — `Duplex`.

## Примеры Transform из практики

Несколько `Transform` streams для production:

**1) JSON Line Stringifier**

Объекты JavaScript → NDJSON:

```
class JSONLineStringifier extends Transform {
  constructor(options) {
    super({ ...options, writableObjectMode: true });
  }

  _transform(obj, encoding, callback) {
    try {
      const json = JSON.stringify(obj);
      this.push(json + "\n");
      callback();
    } catch (err) {
      callback(err);
    }
  }
}
```

`writableObjectMode: true`: writable принимает объекты, readable отдаёт строки (или буферы). Режимы можно смешивать.

**2) Line Counter**

Считает строки, в конце отдаёт сводный объект:

```
class LineCounter extends Transform {
  constructor(options) {
    super({ ...options, readableObjectMode: true });
    this.lineCount = 0;
    this.byteCount = 0;
  }

  _transform(chunk, encoding, callback) {
    this.byteCount += chunk.length;
    const lines = chunk.toString().split("\n").length - 1;
    this.lineCount += lines;
    callback();
  }

  _flush(callback) {
    this.push({
      lines: this.lineCount,
      bytes: this.byteCount,
    });
    callback();
  }
}
```

В `_transform()` ничего не пушится — только накопление. В `_flush()` — один объект. Transform не обязан выдавать выход на каждый вход.

**3) Rate Limiter**

Задерживает chunk для ограничения пропускной способности:

```
class RateLimiter extends Transform {
  constructor(bytesPerSecond, options) {
    super(options);
    this.bytesPerSecond = bytesPerSecond;
    this.tokens = bytesPerSecond;
    this.lastRefill = Date.now();
  }

  _transform(chunk, encoding, callback) {
    this._refillTokens();

    const wait =
      Math.max(0, chunk.length - this.tokens) / this.bytesPerSecond;

    setTimeout(() => {
      this.tokens = Math.max(0, this.tokens - chunk.length);
      this.push(chunk);
      callback();
    }, wait * 1000);
  }

  _refillTokens() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.bytesPerSecond,
      this.tokens + elapsed * this.bytesPerSecond
    );
    this.lastRefill = now;
  }
}
```

Token bucket: при нехватке токенов callback откладывается. Полезно для throttling под ёмкость downstream.

**4) Deduplicator**

В `objectMode` убирает дубликаты по ключу:

```
class Deduplicator extends Transform {
  constructor(keyField, options) {
    super({ ...options, objectMode: true });
    this.keyField = keyField;
    this.seen = new Set();
  }

  _transform(obj, encoding, callback) {
    const key = obj[this.keyField];
    if (!this.seen.has(key)) {
      this.seen.add(key);
      this.push(obj);
    }
    callback();
  }
}
```

Set уже виденных ключей: новый ключ — push, иначе drop. Stateful filter.

Transform умеют агрегировать, фильтровать, форматировать, throttle, дедуплицировать. Любая операция «поток chunk → поток chunk» — кандидат на `Transform`.

## Ошибки и cleanup

`Transform` наследует обработку ошибок от `Readable` и `Writable`. Ошибка в `_transform()` или `_flush()` передаётся в callback → событие `'error'`.

```
_transform(chunk, encoding, callback) {
  try {
    const result = this.process(chunk);
    this.push(result);
    callback();
  } catch (err) {
    callback(err);
  }
}
```

Можно использовать async `_transform()` / `_flush()`:

```
async _transform(chunk, encoding, callback) {
  try {
    const result = await this.processAsync(chunk);
    this.push(result);
    callback();
  } catch (err) {
    callback(err);
  }
}
```

Или без callback — с promise:

```
async _transform(chunk, encoding) {
  const result = await this.processAsync(chunk);
  this.push(result);
}
```

Отклонение promise Node трактует как ошибку и передаёт в callback.

Для cleanup — `_destroy()` при уничтожении stream:

```
_destroy(err, callback) {
  this.cleanup();
  callback(err);
}
```

Полезно, если transform держит ресурсы (файлы, БД, таймеры).

!!!warning ""

    Всегда вешайте обработчик `'error'` на создаваемые и используемые `Transform` streams. Без слушателя необработанная ошибка может завершить процесс.

```
transform.on("error", (err) => {
  console.error("Transform error:", err);
});
```

## objectMode в Transform

С `Transform` можно смешивать режимы writable и readable.

По умолчанию обе стороны в byte mode. Можно задать:

-   `writableObjectMode: true` — writable принимает объекты, readable отдаёт буферы/строки
-   `readableObjectMode: true` — writable принимает буферы/строки, readable отдаёт объекты
-   `objectMode: true` — objectMode на обеих сторонах

Transform: JSON из байт в объекты:

```
class JSONParser extends Transform {
  constructor(options) {
    super({ ...options, readableObjectMode: true });
  }

  _transform(chunk, encoding, callback) {
    try {
      const obj = JSON.parse(chunk.toString());
      this.push(obj);
      callback();
    } catch (err) {
      callback(err);
    }
  }
}
```

Writable в byte mode, readable в objectMode.

Обратно — объекты в JSON-строки:

```
class JSONStringifier extends Transform {
  constructor(options) {
    super({ ...options, writableObjectMode: true });
  }

  _transform(obj, encoding, callback) {
    try {
      const json = JSON.stringify(obj);
      this.push(json);
      callback();
    } catch (err) {
      callback(err);
    }
  }
}
```

Pipeline может плавно переходить байты → объекты → обработка → снова байты перед записью.

## Упрощённое создание Transform

Для простых transform не обязателен класс — опции с функциями `transform` и `flush`:

```
import { Transform } from "stream";

const uppercase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  },
});
```

Удобно для разовых transform. Node вызывает функции как `_transform()` и `_flush()`.

С `stream.pipeline()` можно передать async generator:

```
import { pipeline } from "stream/promises";

await pipeline(
  source,
  async function* (source) {
    for await (const chunk of source) {
      yield chunk.toString().toUpperCase();
    }
  },
  destination
);
```

Каждый `yield` — push chunk. Лаконично для простых transform и async iteration.

Сложный stateful transform — класс. Простой разовый в pipeline — inline-опции или generator.

## Производительность

`Transform` добавляет слой абстракции: буферизация, события, callback на каждый chunk. На высокой пропускной способности это заметно.

Миллионы мелких chunk в секунду — накладные расходы на экземпляры и вызовы `_transform()`. Рассмотрите **batching** — обработка массивов объектов, меньше вызовов.

Вместо:

```
for await (const obj of stream) {
  process(obj);
}
```

Пакетами:

```
for await (const batch of batchedStream) {
  for (const obj of batch) {
    process(obj);
  }
}
```

Это делает `BatchAccumulator` выше.

Копирование буферов: частый `Buffer.concat()` при накоплении — аллокации и копии на каждый chunk. На больших объёмах медленно. Альтернатива — связный список буферов или `BufferList` из пакета `'bl'`.

Transform без накопления должен сразу пушить chunk — эффективно. Накопление в массив/буфер — память и задержка.

Сначала измеряйте (`clinic.js`, встроенный profiler). Многие transform уже достаточно быстры; высоконагруженным pipeline нужна внимательность к этим деталям.

## Тестирование пользовательских Transform

**Запись и чтение:**

```
import { Readable, Writable } from "stream";
import { pipeline } from "stream/promises";

const input = Readable.from(["hello", "world"]);
const output = [];

const collector = new Writable({
  write(chunk, encoding, callback) {
    output.push(chunk.toString());
    callback();
  },
});

await pipeline(input, myTransform, collector);

assert.deepEqual(output, ["HELLO", "WORLD"]);
```

`Readable` с известными данными → ваш `Transform` → `Writable`-коллектор → assert.

**Граничные случаи:** пустой вход, один chunk, много мелких, крупные chunk, неполные данные на EOF, невалидные данные — отдельный тест на сценарий.

**Backpressure:**

Медленный `Writable` и проверка, что `Transform` его уважает:

```
const slow = new Writable({
  write(chunk, encoding, callback) {
    setTimeout(callback, 100);
  },
});

const start = Date.now();
await pipeline(fastSource, myTransform, slow);
const elapsed = Date.now() - start;

assert(elapsed > expectedMinimum);
```

Если backpressure игнорируется, pipeline завершится быстрее ожидаемого — transform обгонит медленный приёмник.

## Связанное чтение

-   Предыдущая: [Writable streams Node.js](./writable-streams.md)
-   Далее: [Конвейеры stream в Node.js: ошибки, очистка и AbortSignal](./modern-pipelines-error-handling.md)
