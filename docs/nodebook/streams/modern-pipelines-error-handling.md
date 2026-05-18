---
description: stream.pipeline() в Node.js — ошибки, очистка ресурсов, stream.finished() и AbortSignal
---

# Конвейеры stream в Node.js: ошибки, очистка и AbortSignal

Источник: [theNodeBook — Stream Pipeline: Errors, Cleanup & AbortSignal](https://www.thenodebook.com/streams/modern-pipelines-error-handling)

Конвейеры stream в Node.js соединяют несколько стадий в один путь данных. Сложность — в согласовании жизненного цикла. Одна стадия может упасть, закрыться раньше времени, включить backpressure или оставить файловый дескриптор открытым, пока другая ещё держит данные в буфере. `source.pipe(dest)` связывает поток данных и backpressure между двумя stream. `stream.pipeline()` добавляет согласованное распространение ошибок и очистку по всей цепочке.

## Обработка ошибок конвейера stream в Node.js

Используйте `pipeline()`, когда сбой одной стадии должен остановить весь путь: функция уничтожает stream по необходимости и сообщает о завершении через callback или promise. `finished()` наблюдает за stream до успешного завершения или ошибки. Современные конвейеры также принимают стадии на async generator и `AbortSignal` для отмены.

Вы уже знаете, как работают отдельные stream — `Readable` производит данные, `Writable` потребляет, `Transform` обрабатывает между ними. У каждого типа свой буфер, свой механизм backpressure и свой жизненный цикл событий. В реальных приложениях stream редко живут изолированно. Их соединяют в **конвейеры**, где данные идут от источника через несколько стадий преобразования к финальному приёмнику.

И концепция проста — «прокачать» данные из одного stream в другой — но сделать это **правильно** сложно. При соединении stream появляются **несколько источников ошибок**, **несколько сигналов backpressure** и **несколько сценариев очистки ресурсов**. Если любой stream в конвейере падает, что происходит с остальными? Если backpressure возникает посередине, доходит ли он до источника? При завершении конвейера все ли ресурсы освобождены?

Эта глава отвечает на эти вопросы. Разберём классический `pipe()` — зачем он есть и почему для продакшена недостаточен. Затем подробно `stream.pipeline()` — современный рекомендуемый способ собирать конвейеры с корректной обработкой ошибок и очисткой. Посмотрим паттерны обработки ошибок, специфичные для streaming. Рассмотрим async iteration как альтернативу конвейеру. В конце — продвинутые паттерны композиции для переиспользуемых сегментов.

Глава про то, как **правильно** соединять stream: распространение ошибок, очистка ресурсов и backpressure на всех стадиях.

## Метод pipe()

Кратко: `pipe()` соединяет `Readable` с `Writable`, автоматически обрабатывая backpressure — вызывает `pause()`, когда `write()` возвращает `false`, и `resume()` при событии `drain` у `Writable`. Этот паттерн подробно разбирался в главе про Writable stream.

Метод возвращает destination stream, что позволяет строить цепочки:

```
readable.pipe(transform1).pipe(transform2).pipe(writable);
```

Получается четырёхстадийный конвейер: readable → transform1 → transform2 → writable. Данные идут последовательно, **backpressure распространяется назад** от writable к readable. Если `writable` сигнализирует backpressure, вся цепочка ставится на паузу; при `drain` сигнал возобновления идёт вперёд.

Конкретный пример — сжатие лог-файла:

```
import { createReadStream, createWriteStream } from "fs";
import { createGzip } from "zlib";

createReadStream("app.log")
  .pipe(createGzip())
  .pipe(createWriteStream("app.log.gz"));
```

Три stream, два вызова `pipe()`. Читатель отдаёт чанки, gzip сжимает, writer сохраняет результат. Память остаётся ограниченной, потому что каждая стадия уважает backpressure.

Но у `pipe()` есть проблема: **обработка ошибок**.

Когда в piped stream возникает ошибка, stream эмитит событие `error`. Ошибка остаётся на том stream, который её сгенерировал. Как вы знаете из глав про Readable и Writable, на каждый stream нужен свой обработчик `error`, иначе процесс упадёт. В конвейерах это особенно болезненно.

```
const reader = createReadStream("input.txt");
const transform = createGzip();
const writer = createWriteStream("output.gz");

reader.pipe(transform).pipe(writer);

reader.on("error", (err) => {
  console.error("Reader error:", err);
});

transform.on("error", (err) => {
  console.error("Transform error:", err);
});

writer.on("error", (err) => {
  console.error("Writer error:", err);
});
```

Нужны три отдельных обработчика. Пропустите один — процесс упадёт. Утомительно, легко ошибиться и, честно говоря, нелепо для задачи, которая должна быть простой.

Хуже того: при ошибке посередине конвейера остальные stream **не останавливаются автоматически**. Допустим, transform падает на чанке. Transform эмитит `error` и перестаёт обрабатывать. Reader продолжает читать и писать в transform в сломанном состоянии. Writer ждёт данные, которых не будет, и может никогда не эмитить `finish`, потому что конвейер не завершился чисто.

Остаются **висящие ресурсы**: незакрытые файловые дескрипторы, сетевые соединения, неосвобождённые буферы. Конвейер в частично упавшем состоянии, и для очистки приходится вручную вызывать `destroy()` на каждом stream:

```
reader.on("error", (err) => {
  reader.destroy();
  transform.destroy();
  writer.destroy();
  console.error("Pipeline failed:", err);
});

transform.on("error", (err) => {
  reader.destroy();
  transform.destroy();
  writer.destroy();
  console.error("Pipeline failed:", err);
});

writer.on("error", (err) => {
  reader.destroy();
  transform.destroy();
  writer.destroy();
  console.error("Pipeline failed:", err);
});
```

Многословно, повторяется и хрупко. Добавили stream в конвейер — обновляйте все обработчики.

Ещё ограничение `pipe()`: сложно понять, когда **весь** конвейер завершился. Readable эмитит `end`, writable — `finish`. На что подписываться? При нескольких transform каждый эмитит свой `end`, финальный destination — `finish`. Нужно отслеживать **правильное событие на правильном stream**, и это зависит от структуры конвейера.

Для простых сценариев из двух stream `pipe()` подходит. Для продакшен-конвейеров с несколькими стадиями и требованиями к ошибкам — нет. Поэтому появился `stream.pipeline()`.

## Метод unpipe()

Перед `pipeline()` стоит упомянуть `unpipe()` — на практике он нужен редко. Метод отключает piped stream:

```
const writer = writable();
readable.pipe(writer);

// Later, disconnect
readable.unpipe(writer);
```

После `unpipe()` readable перестаёт отправлять данные указанному writable. Без аргументов отключаются все получатели:

```
readable.unpipe();
```

Зачем это? В основном для динамической маршрутизации: перенаправить выход stream по условию во время выполнения. Например, читаете сокет, сначала пишете в файл, потом по данным переключаете destination:

```
socket.on("data", (chunk) => {
  if (shouldRedirect(chunk)) {
    socket.unpipe(fileWriter);
    socket.pipe(differentWriter);
  }
});
```

На практике `unpipe()` почти не нужен. Большинство конвейеров статичны — поток задаётся при старте и идёт до конца. Динамическую маршрутизацию лучше решать абстракциями уровнем выше — routing stream или условными transform.

Главное про `unpipe()`: destination **не** завершается автоматически. Метод снимает слушатели destination с source. Состояние flowing mode source зависит от оставшихся потребителей: если pipe и `data`-слушателей не осталось, stream переходит в paused mode; если есть — `data` продолжают идти. Чтобы закрыть destination, нужно вручную вызвать `end()`.

## stream.pipeline()

`stream.pipeline()` — современный способ собирать stream. Функция появилась в Node.js именно из‑за проблем `pipe()` с ошибками и очисткой. Базовое использование:

```
import { pipeline } from "stream";

pipeline(readable, transform, writable, (err) => {
  if (err) {
    console.error("Pipeline failed:", err);
  } else {
    console.log("Pipeline succeeded");
  }
});
```

Вместо цепочки `pipe()` передаёте все stream аргументами, затем callback на завершение или ошибку. Сигнатура:

```
pipeline(stream1, stream2, ..., streamN, callback)
```

`pipeline()` делает три вещи, которых нет у `pipe()`:

1.  **Автоматическое распространение ошибок** — при `error` на любом stream конвейер останавливается, callback получает эту ошибку. Один обработчик на границе конвейера покрывает всю цепочку.
2.  **Автоматическая очистка** — при ошибке или успешном завершении вызывается `destroy()` на всех stream: закрываются дескрипторы, освобождаются буферы, рвутся соединения.
3.  **Один callback завершения** — одна точка для всего.

Практический пример:

```
import { pipeline } from "stream";
import { createReadStream, createWriteStream } from "fs";
import { createGzip } from "zlib";

pipeline(
  createReadStream("input.txt"),
  createGzip(),
  createWriteStream("output.gz"),
  (err) => {
    if (err) {
      console.error("Compression failed:", err);
    } else {
      console.log("Compression succeeded");
    }
  }
);
```

Любая стадия может упасть — чтение файла, повреждённые данные в gzip, диск переполнен при записи. Callback получит ошибку, все три stream будут уничтожены. При успехе `err` будет `undefined`.

Проще, чем эквивалент на `pipe()` с ручными обработчиками: без отдельных `error`, без ручного `destroy`, без угадывания, на каком stream слушать завершение.

Есть promise-версия в модуле `stream/promises`:

```
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream } from "fs";
import { createGzip } from "zlib";

try {
  await pipeline(
    createReadStream("input.txt"),
    createGzip(),
    createWriteStream("output.gz")
  );
  console.log("Compression succeeded");
} catch (err) {
  console.error("Compression failed:", err);
}
```

Promise резолвится при успехе или реджектится при ошибке любого stream. Естественно вписывается в async/await: `try/catch`, как для любого rejected promise.

Это **рекомендуемый паттерн** для современного Node.js: `stream/promises` и async/await для читаемой композиции конвейеров.

## Как pipeline() работает внутри

Внутреннее устройство объясняет поведение при сбое стадии. При вызове `pipeline(s1, s2, s3, callback)` функция выполняет четыре вида координации:

1.  Соединяет stream теми же механиками `pipe()`, что в предыдущих главах — с автоматическим backpressure.
2.  Вешает обработчики `error` на все stream для согласованной обработки.
3.  Вызывает `destroy()` на всех stream при ошибке или завершении.
4.  Один раз вызывает callback с ошибкой или `undefined`.

Ключевое отличие от ручного `pipe()` — **координация ошибок и автоматическая очистка**. Backpressure тот же (подробно в главе про Writable stream), но с продакшен-уровнем управления ошибками.

Упрощённая концептуальная модель (не реальная реализация Node.js):

```
function simplifiedPipeline(...args) {
  const callback = args.pop();
  const streams = args;

  // Connect streams with pipe()
  for (let i = 0; i < streams.length - 1; i++) {
    streams[i].pipe(streams[i + 1]);
  }

  // Track completion
  const lastStream = streams[streams.length - 1];
  lastStream.on("finish", () => {
    destroyAll(streams);
    callback();
  });

  // Handle errors
  for (const stream of streams) {
    stream.on("error", (err) => {
      destroyAll(streams);
      callback(err);
    });
  }
}

function destroyAll(streams) {
  for (const stream of streams) {
    stream.destroy();
  }
}
```

!!!note ""

    Это педагогическая модель «что делает» `pipeline()`, а не «как устроено внутри». Реальная реализация Node.js (на базе библиотеки `pump`) обрабатывает async iterables, генераторы, сложные ошибки, гарантию однократного callback, определение типов stream и другие краевые случаи.

`pipeline()` обрабатывает случай, когда stream эмитит ошибку **после** уничтожения — бывает в кастомных stream с асинхронными операциями. Реализация гарантирует **один** вызов callback, даже если несколько stream падают одновременно.

## pipeline() с функциями-трансформами

В `pipeline()` можно передавать **async generator functions** — они трактуются как transform:

```
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream } from "fs";

await pipeline(
  createReadStream("input.txt"),
  async function* (source) {
    for await (const chunk of source) {
      yield chunk.toString().toUpperCase();
    }
  },
  createWriteStream("output.txt")
);
```

Генератор посередине автоматически оборачивается в `Transform`. Для каждого чанка из source генератор преобразует (здесь — в верхний регистр) и отдаёт результат. Значения из `yield` становятся чанками выходного stream.

Удобно для простых преобразований: вместо класса `Transform` — inline-генератор. Читается как цикл: **для каждого входного чанка — выходной чанк.**

Можно использовать обычные async-функции, возвращающие async iterable:

```
async function uppercase(source) {
  for await (const chunk of source) {
    yield chunk.toString().toUpperCase();
  }
}

await pipeline(
  createReadStream("input.txt"),
  uppercase,
  createWriteStream("output.txt")
);
```

`pipeline()` распознаёт async iterables и внутри оборачивает их в Transform.

Можно цепочкой из нескольких генераторов:

```
await pipeline(
  createReadStream("log.txt"),
  async function* (source) {
    let buffer = "";
    for await (const chunk of source) {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        yield line + "\n";
      }
    }
    if (buffer) yield buffer;
  },
  async function* (source) {
    for await (const line of source) {
      if (!line.startsWith("#")) {
        yield line;
      }
    }
  },
  createWriteStream("filtered.txt")
);
```

Первый генератор переводит буферы в строки и режет на строки с буфером на границах чанков. Второй отфильтровывает строки, начинающиеся с `#`. Каждый генератор — стадия, `pipeline()` связывает их.

Так в современном Node.js обычно строят конвейеры: простые преобразования — inline-генераторы; сложные stateful — класс `Transform`; при необходимости смешивают.

!!!warning ""

    В генераторах конвейера в выход stream попадают только значения из `yield`. Значение из `return` **не** уходит в pipeline — оно доступно только коду, который напрямую потребляет генератор. В transform-стадиях всегда используйте `yield` для выходных чанков.

## Обработка ошибок в конвейерах stream

В конвейерах ошибки сложнее, чем в коде с одним stream: сценарии, которых нет при работе с одним потоком. Stream эмитят `error` при сбоях чтения, записи, сети и т.д.

В конвейере ошибки могут прийти **одновременно из разных мест**:

-   **источник** — файл не найден, нет прав, обрыв сети;
-   **transform** — невалидные данные, ошибка парсинга или валидации;
-   **приёмник** — диск полон, broken pipe, закрыт удалённый endpoint.

Каждая проявляется как `error` на соответствующем stream. С `pipe()` обрабатывали бы отдельно; с `pipeline()` всё попадает в callback или rejection promise.

Что с данными при ошибке посередине? Читаете 100 МБ, transform на 50 МБ натыкается на повреждённые данные. Первые 50 МБ уже могли быть записаны.

Зависит от поведения destination. Запись в файл — в файле **частичный** результат: файл есть, но неполный и, возможно, невалидный. `pipeline()` не откатывает уже записанное в underlying resource.

Нужна логика на уровне приложения. Паттерн: писать во временный файл и переименовывать только при успехе:

```
import { rename, unlink } from "fs/promises";

const tempFile = "output.tmp";
const finalFile = "output.dat";

try {
  await pipeline(source, transform, createWriteStream(tempFile));
  await rename(tempFile, finalFile);
} catch (err) {
  await unlink(tempFile); // Clean up partial file
  throw err;
}
```

Успех — temp переименовывается в финальное имя. Ошибка — temp удаляется. По финальному пути либо полный результат, либо файла нет.

Другой паттерн — транзакции в БД: все строки в транзакции, commit только после успешного конвейера:

```
const tx = await db.beginTransaction();

try {
  await pipeline(
    source,
    transform,
    new DatabaseWriter(tx)
  );
  await tx.commit();
} catch (err) {
  await tx.rollback();
  throw err;
}
```

`pipeline()` отвечает только за **очистку на уровне stream** — `destroy()`. **Очистка предметной области** (удаление частичных файлов, rollback транзакций) — **ваша** ответственность.

При ошибке одной стадии `pipeline()` сразу вызывает `destroy()` на остальных: `close`, отмена pending-операций. Это правильно: упала одна стадия — весь конвейер останавливается.

Если нужно различать источник ошибки (read vs write), в callback приходит только **первая** ошибка. Можно помечать ошибки в кастомных stream:

```
class SourceStream extends Readable {
  _read() {
    const err = new Error("Read failed");
    err.code = "ERR_SOURCE_READ";
    this.destroy(err);
  }
}

pipeline(source, transform, destination, (err) => {
  if (err && err.code === "ERR_SOURCE_READ") {
    console.error("Source read error:", err);
  } else if (err) {
    console.error("Other error:", err);
  }
});
```

Свойство `code` помогает различать ошибки в общем обработчике.

Другой паттерн — `stream.finished()` для наблюдения за конкретным stream внутри большого конвейера:

```
import { pipeline, finished } from "stream";

const transform = createSomeTransform();

finished(transform, (err) => {
  if (err) {
    console.error("Transform specifically failed:", err);
  }
});

pipeline(source, transform, destination, (err) => {
  if (err) {
    console.error("Overall pipeline failed:", err);
  }
});
```

`finished()` вешает слушатели и вызывает callback, когда stream завершился, упал или был уничтожен.

## stream.finished()

`stream.finished()` заслуживает отдельного внимания.

Функция принимает stream и callback, вызывая callback при завершении (успех или ошибка):

```
import { finished } from "stream";

finished(someStream, (err) => {
  if (err) {
    console.error("Stream errored:", err);
  } else {
    console.log("Stream finished successfully");
  }
});
```

«Завершён» для `Readable` — `null` отправлен или stream уничтожен. Для `Writable` — запись закончена, эмитирован `finish` или destroy. Для `Duplex`/`Transform` — завершены обе стороны.

Безопаснее, чем слушать только `end` или `finish`: `finished()` также слушает `error`, `close`, `destroy` и разбирает, действительно ли stream завершён.

Promise-версия:

```
import { finished } from "stream/promises";

try {
  await finished(someStream);
  console.log("Stream finished");
} catch (err) {
  console.error("Stream errored:", err);
}
```

Promise резолвится при успехе или реджектится при ошибке.

!!!note ""

    `stream.finished()` намеренно оставляет висящие слушатели (`error`, `end`, `finish`, `close`) после вызова callback или settlement promise — чтобы ловить неожиданные ошибки от некорректных реализаций stream и не ронять процесс. Для короткоживущих stream GC обычно справляется. Для долгоживущих или чувствительных к памяти приложений есть опция `cleanup`:

```
import { finished } from "stream/promises";

await finished(someStream, { cleanup: true }); // Removes listeners after completion
```

Зачем `finished()` вместо `end`/`finish`? Stream может завершиться по-разному: естественный `end`, destroy из‑за ошибки, явный `destroy()`. `finished()` покрывает все случаи одним callback или promise — «этот stream закончил работу, как бы то ни было».

Полезно, когда нужно знать о завершении **конкретного** stream, пока общий конвейер ещё идёт. Например, tee/broadcast — source в несколько destination:

```
const dest1 = createWriteStream("output1.txt");
const dest2 = createWriteStream("output2.txt");

source.pipe(dest1);
source.pipe(dest2);

await Promise.all([
  finished(dest1),
  finished(dest2),
]);

console.log("Both destinations finished");
```

Ждём, пока оба destination допишут данные.

## Восстановление после ошибок в конвейерах

Не каждая ошибка фатальна — часть можно повторить. Сетевой обрыв может быть временным; `EACCES` при чтении файла — нет.

Первый шаг — **классификация**: операционная ошибка или баг? Временная или постоянная?

Для временных ошибок — retry вокруг конвейера:

```
async function pipelineWithRetry(maxRetries) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await pipeline(source(), transform, destination);
      return; // Success
    } catch (err) {
      if (isTransientError(err) && attempt < maxRetries) {
        console.log(`Attempt ${attempt + 1} failed, retrying...`);
        await delay(1000 * Math.pow(2, attempt)); // Exponential backoff
      } else {
        throw err; // Give up
      }
    }
  }
}

function isTransientError(err) {
  return err.code === "ECONNRESET" || err.code === "ETIMEDOUT"; // Network errors
}
```

До `maxRetries` попыток, exponential backoff на transient-ошибках, иначе throw.

`source()` — **функция**, создающая новый source. Stream после error и `destroy()` нельзя переиспользовать; каждая попытка — новые экземпляры.

Fallback: основной источник упал — пробуем запасной:

```
try {
  await pipeline(primarySource, transform, destination);
} catch (err) {
  console.warn("Primary source failed, trying fallback");
  await pipeline(fallbackSource, transform, destination);
}
```

Полезно для резервных источников (CDN → origin).

При сбое destination — запись в другое место:

```
try {
  await pipeline(source, transform, primaryDest);
} catch (err) {
  console.warn("Primary destination failed, trying backup");
  await pipeline(source(), transform, backupDest);
}
```

Снова `source()` для нового чтения после уничтожения первого source.

**Принцип:** заранее решите, какие ошибки восстанавливаемы, и реализуйте retry/fallback **на уровне конвейера**. Stream обрабатывают чанки и события; политику повторов координирует приложение.

## Проблема частичных данных

При падении конвейера посередине уже записанные данные **остаются**. `pipeline()` их не убирает.

Это риск **целостности**: экспорт БД на 60% — файл на 60%; повтор может дублировать данные или перезаписать файл целиком — зависит от режима открытия.

**Стратегии:**

**1. Временный файл и атомарное переименование**

```
const temp = "output.tmp";
const final = "output.dat";

try {
  await pipeline(source, transform, createWriteStream(temp));
  await rename(temp, final);
} catch (err) {
  await unlink(temp).catch(() => {}); // Clean up, ignore errors
  throw err;
}
```

**Самый безопасный** паттерн для файлов: финальный путь существует только после успеха.

**2. Append и идемпотентность**

Если выход поддерживает append (логи) и операции идемпотентны:

```
await pipeline(source, transform, createWriteStream("output.log", { flags: "a" }));
```

Повтор дописывает данные; при дедупликации downstream это приемлемо.

**3. Транзакционные приёмники**

БД, очереди, часть облачных хранилищ — commit только при успехе конвейера (см. пример с `beginTransaction` выше).

**4. Маркер завершения**

```
await pipeline(source, transform, createWriteStream("output.dat"));
await writeFile("output.dat.complete", "");
```

Перед обработкой `output.dat` проверяйте маркер; без маркера — файл неполный.

Выбор зависит от возможностей destination и требований к согласованности. Явно решите, что происходит при частичном сбое.

## Уничтожение stream

`stream.destroy()` уже разбирался в главах про Readable и Writable. `destroy()` переводит stream в destroyed, эмитит `close`, при переданной ошибке — `error`.

В `pipeline()` уничтожение **любого** stream приводит к `destroy()` остальных и вызову callback с ошибкой:

```
const source = createReadStream("input.txt");
const dest = createWriteStream("output.txt");

pipeline(source, dest, (err) => {
  if (err) {
    console.error("Pipeline stopped:", err.message);
  }
});

// Later, cancel the pipeline (e.g., after user action)
setTimeout(() => {
  source.destroy(new Error("Cancelled by user"));
}, 100);
```

`source.destroy()` останавливает чтение, эмитит `close` и при ошибке — `error`. `pipeline()` видит ошибку, уничтожает `dest`, вызывает callback.

Автоочистка — ещё плюс перед ручным `pipe()`.

Удобно для отмены по действию пользователя: destroy source — конвейер останавливается, ресурсы освобождаются, callback обрабатывает отмену.

Можно destroy без ошибки:

```
source.destroy();
```

Stream уничтожен без `error`; callback всё равно вызовется с `err === null` — остановка без трактовки как сбой.

`destroy()` **идемпотентен** — повторные вызовы игнорируются.

При `destroy()` буферизованные данные **теряются**: не сброшенные записи в `Writable`, не прочитанные в `Readable`. Destroy — «остановиться сейчас и выбросить состояние», не «дожать pending».

Для graceful shutdown writable используйте `end()`:

```
writable.end(); // Finish writing buffered data, then close
```

`end()` только для Writable. У Readable нет graceful stop — либо дочитать всё, либо `destroy()`.

## Конвейеры на async iteration

В главе про Readable stream разбирали `for await...of` с автоматическим backpressure. Это альтернатива `pipe()` и `pipeline()` для логики обработки.

При итерации по Readable протокол итератора реализует backpressure: следующий чанк не тянется, пока не завершена текущая итерация. Асинхронная обработка — stream ждёт:

```
for await (const chunk of readableStream) {
  await processAsync(chunk); // Stream waits for this
}
```

Механику backpressure в async iteration см. в главе про Readable stream; здесь — применение к **сборке конвейера**.

Можно читать source через `for await...of`, преобразовывать и писать в destination:

```
const source = createReadStream("input.txt");
const dest = createWriteStream("output.txt");

for await (const chunk of source) {
  const transformed = chunk.toString().toUpperCase();
  const ok = dest.write(transformed);
  if (!ok) {
    await new Promise((resolve) => dest.once("drain", resolve));
  }
}

dest.end();
```

Ручной конвейер: явный backpressure при `write() === false` — ждать `drain`. Забыли проверку — неограниченный рост памяти (см. главу про Writable stream).

Чище — `stream.Readable.from()` с async generator:

```
async function* transform(source) {
  for await (const chunk of source) {
    yield chunk.toString().toUpperCase();
  }
}

const source = createReadStream("input.txt");
const transformed = Readable.from(transform(source));
const dest = createWriteStream("output.txt");

await pipeline(transformed, dest);
```

Генератор оборачивается в Readable, `pipeline()` даёт устойчивость к ошибкам.

Цепочка генераторов:

```
async function* toUppercase(source) {
  for await (const chunk of source) {
    yield chunk.toString().toUpperCase();
  }
}

async function* filterEmpty(source) {
  for await (const line of source) {
    if (line.trim().length > 0) {
      yield line;
    }
  }
}

await pipeline(
  source,
  toUppercase,
  filterEmpty,
  dest
);
```

Особенно удобно для **`objectMode`**, когда чанк — объект:

```
async function* parseJSON(source) {
  for await (const line of source) {
    yield JSON.parse(line);
  }
}

async function* extractField(source, field) {
  for await (const obj of source) {
    yield obj[field];
  }
}

await pipeline(
  source,
  parseJSON,
  (source) => extractField(source, "name"),
  dest
);
```

Каждая стадия — функция из async iterable в async iterable. `pipeline()` склеивает их — функциональная композиция, часто понятнее классов Transform.

## Backpressure при async iteration в конвейерах

Ключевые моменты при `for await...of` в конвейерах:

1.  **Await async-работы** — итератор тянет по одному чанку; await передаёт backpressure от скорости обработки к source.
2.  **Сохраняйте backpressure** — избегайте `promises.push(processAsync(chunk))`, когда весь stream уходит в память до обработки.
3.  **Ограниченный параллелизм** — для параллельной обработки с верхней границей используйте, например, `p-limit`.

!!!warning ""

    Без `await` внутри цикла backpressure теряется:

```
// WRONG - loses backpressure
for await (const chunk of source) {
  slowOperation(chunk); // No await! Loop continues immediately
}

// CORRECT - maintains backpressure
for await (const chunk of source) {
  await slowOperation(chunk); // Stream waits until this completes
}
```

Плюс подхода — явный контроль потока. Минус — обработку ошибок и очистку нужно делать сами, без автоматики `pipeline()`.

Подробная механика — раздел «Backpressure in Async Iteration» в главе про Readable stream.

## Композируемые трансформы

В главе про Transform stream — кастомные transform. Здесь — **переиспользуемые компоненты** через фабрики:

```
function createCSVParser() {
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          this.push(line.split(","));
        }
      }
      callback();
    },
  });
}

// Use in multiple pipelines
await pipeline(source1, createCSVParser(), dest1);
await pipeline(source2, createCSVParser(), dest2);
```

Каждый вызов `createCSVParser()` — новый экземпляр. Один stream нельзя переиспользовать в двух конвейерах после end/error; фабрику — можно.

Настраиваемые фабрики:

```
function createFieldExtractor(fields) {
  return new Transform({
    objectMode: true,
    transform(obj, encoding, callback) {
      const extracted = {};
      for (const field of fields) {
        extracted[field] = obj[field];
      }
      this.push(extracted);
      callback();
    },
  });
}

await pipeline(
  source,
  createFieldExtractor(["name", "email"]),
  dest
);
```

Сложные конвейеры — композиция сегментов:

```
function createProcessingPipeline(source, dest) {
  return pipeline(
    source,
    createCSVParser(),
    createFieldExtractor(["name", "email"]),
    createValidator(),
    dest
  );
}

await createProcessingPipeline(source1, dest1);
await createProcessingPipeline(source2, dest2);
```

`createProcessingPipeline()` инкапсулирует всю цепочку — higher-order function для stream.

Композиция генераторов:

```
const parseCSV = async function* (source) {
  for await (const chunk of source) {
    const lines = chunk.toString().split("\n");
    for (const line of lines) {
      if (line.trim()) {
        yield line.split(",");
      }
    }
  }
};

const extractFields = (fields) =>
  async function* (source) {
    for await (const obj of source) {
      const extracted = {};
      for (const field of fields) {
        extracted[field] = obj[field];
      }
      yield extracted;
    }
  };

await pipeline(
  source,
  parseCSV,
  extractFields(["name", "email"]),
  dest
);
```

Функциональный стиль хорошо ложится на streaming в Node.js.

## Сегменты конвейера

**Сегмент конвейера** — переиспользуемый кусок: один transform, цепочка transform или условная маршрутизация.

Сегмент валидации с отводом невалидных объектов:

```
function createValidationSegment(schema, errorDest) {
  const valid = new PassThrough({ objectMode: true });
  const invalid = new PassThrough({ objectMode: true });

  invalid.pipe(errorDest);

  return new Transform({
    objectMode: true,
    transform(obj, encoding, callback) {
      if (schema.validate(obj)) {
        this.push(obj);
      } else {
        invalid.write(obj);
      }
      callback();
    },
  });
}
```

Валидные объекты идут downstream, невалидные — в error destination (лог, отдельный stream). Ветвление: один вход, два выхода.

```
const errorLog = createWriteStream("errors.log");

await pipeline(
  source,
  createValidationSegment(mySchema, errorLog),
  dest
);
```

Конвейер продолжается при невалидных объектах — они просто уходят в другую ветку.

Условный сегмент:

```
function createConditionalSegment(condition, trueTransform, falseTransform) {
  return new Transform({
    objectMode: true,
    async transform(obj, encoding, callback) {
      try {
        const result = await condition(obj);
        const transform = result ? trueTransform : falseTransform;
        transform.write(obj);
        callback();
      } catch (err) {
        callback(err);
      }
    },
  });
}
```

По результату `condition` объект отправляется в `trueTransform` или `falseTransform` — routing.

Ветвление, маршрутизация, условия — кирпичи для сложных потоков данных при фокусированных переиспользуемых сегментах.

## Tee и broadcast

Иногда одни и те же данные нужны нескольким приёмникам — **tee** (как тройник) или **broadcast**.

Простейший способ — два `pipe()` с одного source:

```
source.pipe(dest1);
source.pipe(dest2);
```

Оба destination получают одни чанки. Но backpressure общий: если `dest1` медленный и ставит source на паузу, страдает и быстрый `dest2`. Source не может паузить для одного и продолжать для другого — **все или никто**. При tee через `pipe()` темп задаёт **самый медленный** приёмник.

Если это приемлемо — достаточно простого piping. Для независимого backpressure — сложнее.

`PassThrough` как промежуточные буферы:

```
const pass1 = new PassThrough();
const pass2 = new PassThrough();

source.on("data", (chunk) => {
  pass1.write(chunk);
  pass2.write(chunk);
});

source.on("end", () => {
  pass1.end();
  pass2.end();
});

pass1.pipe(dest1);
pass2.pipe(dest2);
```

У `dest1` и `dest2` backpressure независим: медленный `dest1` буферизуется в `pass1`, быстрый `dest2` не ждёт. Но backpressure на уровне source **ломается**: оба PassThrough могут раздуваться в памяти без ограничения.

Для независимых destination с ограниченной памятью нужен fan-out, который ждёт `drain` у всех destination, сигнализировавших backpressure:

```
class FanOut extends Writable {
  constructor(destinations, options) {
    super(options);
    this.destinations = destinations;
  }

  _write(chunk, encoding, callback) {
    const allReady = [];

    // Write to all destinations and check for backpressure
    for (const dest of this.destinations) {
      const canContinue = dest.write(chunk, encoding);
      if (!canContinue) {
        // Destination buffer is full, wait for drain
        allReady.push(
          new Promise((resolve) => {
            dest.once('drain', resolve);
          })
        );
      }
    }

    // If any destination signaled backpressure, wait for all to drain
    if (allReady.length > 0) {
      Promise.all(allReady)
        .then(() => callback())
        .catch((err) => callback(err));
    } else {
      // All writes succeeded without backpressure
      callback();
    }
  }

  _final(callback) {
    // End all destinations when this stream ends
    for (const dest of this.destinations) {
      dest.end();
    }
    callback();
  }
}
```

Writable пересылает чанк всем destination. `write() === false` — буфер полон, ждём `drain`. Собираем promise для всех «затормозивших» destination и вызываем callback только после drain у всех — backpressure доходит до source.

```
pipeline(source, new FanOut([dest1, dest2]), (err) => {
  // Pipeline done
});
```

Паттерн редко нужен в приложениях: обычно либо соглашаются на темп самого медленного, либо на неограниченный буфер в PassThrough. Настоящий fan-out с независимым backpressure — для логирования, мониторинга и узких сценариев.

## Интеграция AbortSignal

Stream в Node.js поддерживают `AbortSignal`. В promise-версии `pipeline()` можно передать signal — при abort конвейер уничтожается:

```
import { pipeline } from "stream/promises";

const controller = new AbortController();

try {
  await pipeline(source, transform, dest, { signal: controller.signal });
} catch (err) {
  if (err.name === "AbortError") {
    console.log("Pipeline cancelled");
  } else {
    throw err;
  }
}

// Note: You can also check err.code === 'ABORT_ERR' which is more robust
// since the code property is harder to accidentally modify

// To cancel: controller.abort();
```

`controller.abort()` немедленно рвёт конвейер: все stream уничтожены, promise реджектится с **`AbortError`**, pending-операции отменяются.

Полезно для отмены пользователем, таймаутов, очистки в долгих операциях.

Таймаут:

```
const signal = AbortSignal.timeout(5000); // 5 second timeout

try {
  await pipeline(source, transform, dest, { signal });
  console.log("Pipeline completed");
} catch (err) {
  if (err.name === "AbortError") {
    console.log("Pipeline timed out");
  } else {
    throw err;
  }
}
```

Несколько источников отмены — `AbortSignal.any()`:

```
const userCancel = new AbortController();
const timeout = AbortSignal.timeout(10000);

const signal = AbortSignal.any([userCancel.signal, timeout]);

try {
  await pipeline(source, transform, dest, { signal });
} catch (err) {
  if (err.name === "AbortError") {
    console.log("Cancelled by either user or timeout");
  } else {
    throw err;
  }
}
```

Композитный signal abort'ится при отмене пользователем **или** по таймауту.

AbortSignal делает отмену явной и стандартной: вместо ручного `destroy()` на каждом stream — `abort()` signal, очистку делает `pipeline()`.

## Примеры из практики

Несколько полных конвейеров, собирающих идеи главы.

**1) Обработка лог-файла**

Чтение большого лога, парсинг строк как JSON, фильтр по уровню, запись в отдельные файлы:

```
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream } from "fs";
import { Transform } from "stream";

async function* parseLines(source) {
  let buffer = "";
  for await (const chunk of source) {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (line.trim()) {
        try {
          yield JSON.parse(line);
        } catch (err) {
          console.error("Parse error:", err);
        }
      }
    }
  }
  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer);
    } catch (err) {
      console.error("Parse error:", err);
    }
  }
}

class LevelSplitter extends Transform {
  constructor(level, dest, options) {
    super({ ...options, objectMode: true });
    this.level = level;
    this.dest = dest;
  }

  _transform(log, encoding, callback) {
    if (log.level === this.level) {
      this.dest.write(JSON.stringify(log) + "\n");
    }
    this.push(log);
    callback();
  }
}

const errorDest = createWriteStream("errors.log");
const warnDest = createWriteStream("warnings.log");

await pipeline(
  createReadStream("app.log"),
  parseLines,
  new LevelSplitter("ERROR", errorDest),
  new LevelSplitter("WARN", warnDest),
  createWriteStream("all.log")
);
```

Генератор `parseLines` решает типичную задачу построчной обработки: чанки не совпадают с границами строк. Чанк может оборвать строку посередине, разрезав `{"level":"ERROR"...` на два чанка. Решение — накопление в буфере:

```
let buffer = "";
for await (const chunk of source) {
  buffer += chunk.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop();  // Save incomplete line for next chunk
  // Process complete lines...
}
```

После `split("\n")` последний элемент массива — либо пустая строка (чанк закончился на `\n`), либо незавершённая строка. `pop()` сохраняет этот хвост; следующий чанк допишет его до полной строки. После цикла обрабатывается оставшийся буфер — в том числе для файлов без завершающего `\n`.

`try/catch` вокруг `JSON.parse()` не даёт битой строке убить весь импорт:

```
try {
  yield JSON.parse(line);
} catch (err) {
  console.error("Parse error:", err);
}
```

Без обработки ошибок одна невалидная JSON-строка роняет весь конвейер и теряется весь прогресс. С обработкой конвейер логирует ошибку и продолжает. В реальных логах бывают повреждённые записи — конвейер должен переживать невалидные данные без остановки.

`LevelSplitter` и отводит данные в side channel, и пропускает всё дальше:

```
_transform(log, encoding, callback) {
  if (log.level === this.level) {
    this.dest.write(JSON.stringify(log) + "\n");  // Side channel
  }
  this.push(log);  // Pass through to next stage
  callback();
}
```

Каждая запись идёт по основному конвейеру, а логи уровня ERROR **дополнительно** пишутся в `errors.log`. Получается ветвящийся конвейер: после `parseLines` все логи продолжают путь; ERROR дублируются в `errors.log`, WARN — в `warnings.log`, финальный поток — в `all.log`.

Подход экономичен по памяти: файл читается один раз, разделение идёт в потоке при постоянном объёме памяти. Два отдельных конвейера удвоили бы I/O и память.

Опция `{ objectMode: true }` соответствует типу входа: transform получает объекты JavaScript из `parseLines`, а не буферы. В side destination пишем JSON-строки через `JSON.stringify(log) + "\n"`. Парсим один раз, в конвейере работаем с объектами, сериализуем только при записи на диск.

Сплиттеры стоят последовательно:

```
parseLines → LevelSplitter("ERROR") → LevelSplitter("WARN") → all.log
```

Каждый вызывает `this.push(log)` и передаёт объекты дальше. Финальный `all.log` тоже получает объекты; Writable по умолчанию вызовет `toString()` — для нормального формата в продакшене перед финальным destination добавьте serialize transform (в примере упрощено; в бою — например `async function* serializeJSON(source) { for await (const obj of source) yield JSON.stringify(obj) + "\n"; }`).

**2) Импорт CSV с валидацией**

Чтение CSV, разбор строк, валидация и пакетная вставка в БД:

```
async function* parseCSV(source) {
  let buffer = "";
  let headers = null;

  for await (const chunk of source) {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!headers) {
        headers = line.split(",");
      } else {
        const values = line.split(",");
        const row = {};
        for (let i = 0; i < headers.length; i++) {
          row[headers[i]] = values[i];
        }
        yield row;
      }
    }
  }
}

async function* validate(source, schema) {
  for await (const row of source) {
    if (schema.validate(row)) {
      yield row;
    } else {
      console.error("Invalid row:", row);
    }
  }
}

async function* batch(source, size) {
  let batch = [];
  for await (const item of source) {
    batch.push(item);
    if (batch.length >= size) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length > 0) {
    yield batch;
  }
}

class DatabaseWriter extends Writable {
  constructor(db, options) {
    super({ ...options, objectMode: true });
    this.db = db;
  }

  async _write(batch, encoding, callback) {
    try {
      await this.db.insertMany(batch);
      callback();
    } catch (err) {
      callback(err);
    }
  }
}

await pipeline(
  createReadStream("data.csv"),
  parseCSV,
  (source) => validate(source, mySchema),
  (source) => batch(source, 100),
  new DatabaseWriter(db)
);
```

Конвейер собирает переиспользуемые генераторы для преобразования данных и batching для операций с БД.

В отличие от `parseLines`, `parseCSV` хранит состояние между чанками — нужно помнить строку заголовков:

```
let buffer = "";
let headers = null;  // Persists across all chunks

for await (const chunk of source) {
  // ... process chunks
  if (!headers) {
    headers = line.split(",");  // First line becomes headers
  } else {
    // Subsequent lines become data objects
    const values = line.split(",");
    const row = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = values[i];
    }
    yield row;
  }
}
```

Переменная `headers` живёт всё время работы генератора: первая строка становится заголовками, остальные превращаются в объекты. Сырой CSV:

```
name,email,age
Alice,alice@example.com,30
Bob,bob@example.com,25
```

Становится структурированными объектами:

```
{ name: "Alice", email: "alice@example.com", age: "30" }
{ name: "Bob", email: "bob@example.com", age: "25" }
```

Весь CSV в память не загружается — каждая строка обрабатывается по мере прохождения потока.

Генератор `validate` фильтрует без изменения валидных данных:

```
async function* validate(source, schema) {
  for await (const row of source) {
    if (schema.validate(row)) {
      yield row;  // Valid rows continue
    } else {
      console.error("Invalid row:", row);  // Invalid rows logged, not yielded
    }
  }
}
```

Валидные строки идут дальше. Невалидные логируются и пропускаются — плохие данные не попадают в БД.

Ошибка на невалидной строке обрушила бы конвейер и уничтожила бы прогресс. Реальные данные грязные — логирование с продолжением позволяет разобрать ошибки после импорта.

Генератор `batch` группирует строки перед записью в БД:

```
async function* batch(source, size) {
  let batch = [];
  for await (const item of source) {
    batch.push(item);
    if (batch.length >= size) {
      yield batch;  // Emit full batch
      batch = [];   // Reset for next batch
    }
  }
  if (batch.length > 0) {
    yield batch;  // Don't forget partial final batch
  }
}
```

Поток отдельных элементов превращается в поток пакетов:

```
Input:  item1, item2, item3, ..., item100, item101, ...
Output: [item1...item100], [item101...item200], ...
```

Round-trip к БД дороги. Пакеты по 100 строк могут дать порядка 100× ускорения по сравнению с вставкой по одной. Размер batch — компромисс: слишком малый — много round-trip и низкая скорость; слишком большой — память, риск таймаута, сложнее восстановление после ошибки. Для большинства БД разумны пакеты 100–1000.

Проверка `if (batch.length > 0)` после цикла отдаёт финальный неполный пакет. Без неё хвостовые строки теряются молча.

`DatabaseWriter` обрабатывает асинхронный I/O:

```
async _write(batch, encoding, callback) {
  try {
    await this.db.insertMany(batch);
    callback();  // Signal success
  } catch (err) {
    callback(err);  // Signal error
  }
}
```

Метод `_write` может быть async, но callback вызывать обязательно: без аргументов при успехе, `callback(err)` при ошибке.

Пока выполняется `await this.db.insertMany(batch)`, stream на паузе — следующий пакет не придёт, пока не завершится текущая вставка. Так не перегружают БД.

Стрелочные функции `(source) => validate(source, mySchema)` передают дополнительные аргументы в генераторы:

```
await pipeline(
  createReadStream("data.csv"),
  parseCSV,
  (source) => validate(source, mySchema),
  (source) => batch(source, 100),
  new DatabaseWriter(db)
);
```

Вы создаёте специализированные версии универсальных генераторов для конкретного конвейера.

Весь конвейер использует примерно постоянную память независимо от размера файла: при разборе CSV — только текущая строка, при валидации — одна строка, при batching — не более 100 строк, при записи — только текущий пакет. CSV на 10 ГБ и на 10 МБ потребляют сопоставимый объём памяти.

## Связанное чтение

-   Предыдущая: [Transform stream в Node.js](./transform-streams.md)
-   Далее: [Zero-copy stream: scatter/gather](./zero-copy-scatter-gather.md)
