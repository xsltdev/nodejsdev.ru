---
description: Writable streams Node.js — backpressure, drain, _write и корректные паттерны записи
---

# Writable streams Node.js: backpressure и drain

Источник: [theNodeBook — Writable Streams](https://www.thenodebook.com/streams/writable-streams)

Writable stream в Node.js — это конечный автомат на стороне потребителя для данных по частям (chunk). Механика строится вокруг обратного давления (backpressure). `write(chunk)` принимает данные, складывает ожидающие записи во внутреннюю очередь и в итоге передаёт каждый chunk нижележащему приёмнику — файлу, сокету, потоку сжатия или кастомному назначению. Возвращаемое значение сообщает производителю, ниже ли буфер порога.

## Что такое Writable stream в Node.js

`write()`, возвращающий `false`, означает: вызывающий код должен дождаться `drain`, прежде чем слать ещё. Поток сохраняет порядок записей, отслеживает колбэки и координирует финальные записи через `end()`. Кастомные Writable реализуют `_write()` или `_writev()` и вызывают переданный колбэк, когда приёмник принял chunk.

Вы уже видели, как работают Readable streams: внутренние буферы, переключение режимов, доставка данных потребителю. Теперь нужно развернуть перспективу и посмотреть на другую сторону уравнения потоков: **куда уходят данные после того, как их произвели?**

Это область **Writable streams**. Если Readable — про извлечение данных из источника, Writable — про запись **в** назначение. Файлы на диске, сетевые сокеты, HTTP‑ответы, алгоритмы сжатия, подключения к БД — везде, где вы отправляете данные по частям, вы работаете с той или иной формой Writable stream.

Запись в Writable stream имеет обратную связь. `write()` принимает данные и возвращает boolean о состоянии буфера на стороне writable. Если игнорировать этот сигнал, процесс начнёт потреблять больше памяти, чем ожидаете. Этот сигнал — **backpressure**, и продакшен‑код, который обрабатывает потоки данных, обязан его учитывать.

Ниже — Writable streams с нуля: класс `Writable` (опции, события, смысл возвращаемого значения `write()`), затем **backpressure** (зачем он нужен, как внутренняя буферизация его создаёт и что будет, если его игнорировать), реализация кастомных Writable и практические паттерны записи в реальных приложениях.

## Класс Writable stream

Создавая или получая Writable stream, вы работаете с объектом, расширяющим `EventEmitter`, как и Readable. Потоки в Node.js общаются через события: асинхронные I/O завершаются или падают позже.

Задача Writable stream в концепции проста: принимать chunks через `write()` и отправлять их в нижележащее назначение. Это может быть что угодно — файловый дескриптор ОС, TCP‑сокет, массив в памяти. Writable stream не волнует конкретика: он даёт интерфейс и логику буферизации. Назначение абстрагировано во внутренний метод `_write()`, который реализуют подклассы.

Опции конфигурации задают поведение Writable stream под нагрузкой.

Опция `highWaterMark` похожа на Readable, но смысл чуть другой. Для Writable `highWaterMark` — **максимальное число байт** (или объектов в `objectMode`), которое поток буферизует внутри, прежде чем начнёт сигнализировать backpressure. По умолчанию `16384` байта — те же 16 КБ, что у Readable.

При вызове `write()` данные обычно попадают во внутренний буфер, пока назначение их не примет. Если назначение быстрое (запись в `/dev/null` или в сокет с запасом пропускной способности), буфер почти пуст и записи завершаются быстро. Если назначение медленное (механический диск под нагрузкой, перегруженная сеть), буфер заполняется.

Когда объём буфера достигает или превышает `highWaterMark`, `write()` **возвращает `false`**. Это **сигнал backpressure**: «я буферизую слишком много, замедлитесь или остановитесь, пока снова не буду готов». Если приложение игнорирует сигнал и продолжает `write()`, буфер растёт, память растёт, пока процесс не исчерпает её.

Пример конфигурации:

```js
import { Writable } from 'stream';

const writable = new Writable({
    highWaterMark: 8192, // порог буфера 8 КБ
});
```

Поток сигнализирует backpressure, когда внутренний буфер достигает 8 КБ. Записи после сигнала всё ещё принимаются; `false` означает, что нужно приостановиться.

Опция `objectMode`, как у Readable, переводит поток с байтов на произвольные объекты JavaScript. В `objectMode` `highWaterMark` — **число объектов** в буфере, а не байты. По умолчанию в `objectMode` — 16 объектов.

```js
const objectWritable = new Writable({
    objectMode: true,
    highWaterMark: 50, // до 50 объектов в буфере
});
```

Полезно в конвейерах обработки, где chunk — логическая единица (строка БД, разобранная запись лога, JSON‑документ), а не кусок байтов.

Опция `decodeStrings` задаёт, преобразовывать ли строки в `Buffer` перед передачей в `_write()`. По умолчанию `true`. При `false` строки идут как есть — нужно, если Writable специально обрабатывает строки иначе, чем буферы.

```js
const stringWritable = new Writable({
    decodeStrings: false, // строки остаются строками
});
```

Есть `defaultEncoding` — кодировка при преобразовании строк в буферы (если `decodeStrings: true`). По умолчанию `'utf8'` — почти всегда то, что нужно для текста.

Наконец, `emitClose` управляет событием `close` при `destroy()`. По умолчанию `true`. Без веской причины лучше не трогать.

Чтобы эффективно работать с Writable, нужно понимать события и что они означают.

## События Writable streams

Writable stream испускает события при смене состояния. Каждое — в определённой точке жизненного цикла.

Главное для backpressure — **`drain`**. Оно срабатывает, когда внутренний буфер был полон (`write()` возвращал `false`) и опустился ниже `highWaterMark`. `drain` — сигнал возобновить запись.

Типичный паттерн:

```js
function writeData(writable, data) {
    if (!writable.write(data)) {
        writable.once('drain', () => {
            // буфер освободился, можно писать дальше
            continueWriting();
        });
    }
}
```

`write()` вернул `false` — буфер полон. Вешаем одноразовый слушатель `drain` и останавливаем логику записи. Когда приходит `drain`, снова есть место.

!!!note ""

    Блокировка в `write()` убила бы смысл асинхронной модели I/O Node.js. Если бы `write()` блокировал, event loop замер бы в ожидании завершения записи. Событийный сигнал оставляет loop свободным для другой работы, пока буфер потока опустошается.

Событие **`finish`** срабатывает после `end()`, когда все буферизованные данные успешно записаны в назначение. Поток завершил работу. `finish` — **до** `close`: запись закончена, ресурсы назначения могут ещё быть открыты.

```js
writable.on('finish', () => {
    console.log('All data written');
});

writable.write('some data');
writable.end(); // больше записей не будет
```

`end()` говорит: «больше данных не будет». После `end()` вызов `write()` бросит ошибку. Поток обрабатывает оставшийся буфер и при успехе испускает `finish`.

Событие **`close`** — когда поток и нижележащие ресурсы закрыты. **После** `finish`. Не все потоки испускают `close` — зависит от реализации ресурса. У файловых потоков `close` — при закрытии дескриптора; у сокетов — при закрытии сокета.

```js
writable.on('close', () => {
    console.log('Stream closed');
});
```

Событие **`error`** — при сбое записи: диск заполнен, сеть оборвалась, ошибка внутри назначения. Без обработчика `error` исключение может уронить процесс — как у Readable.

```js
writable.on('error', (err) => {
    console.error('Write error:', err);
});
```

Событие **`pipe`** — когда Readable подключён через `pipe()`. В обработчик передаётся источник — в основном для логирования и отладки.

```js
writable.on('pipe', (src) => {
    console.log('Something is piping into me');
});
```

Есть **`unpipe`** — когда Readable отключают от этого Writable.

Эти события — поверхность API Writable streams. Чтобы использовать их правильно, нужно разобрать **backpressure** — ядро управления потоком в потоковых системах.

## Понимание backpressure

Backpressure звучит абстрактно, пока не увидишь последствия без него. Конкретный сценарий.

Программа читает большой файл и пишет в другое место. **Наивный** вариант:

```js
import { createReadStream, createWriteStream } from 'fs';

const readable = createReadStream('input.dat');
const writable = createWriteStream('output.dat');

readable.on('data', (chunk) => {
    writable.write(chunk);
});
```

Читаем chunks из `input.dat` и пишем в `output.dat`. Просто? Но есть **скрытая проблема**. Что если Readable отдаёт данные быстрее, чем Writable успевает их принять?

Диск читает 100 МБ/с, пишет 50 МБ/с. Readable даёт 100 МБ/с chunks, вы вызываете `write()` на каждый. Writable обрабатывает 50 МБ/с — остальные 50 МБ/с **копятся во внутреннем буфере**. За секунду — 50 МБ в буфере, за две — 100 МБ, за десять — 500 МБ. Буфер растёт, пока процесс не упадёт от нехватки памяти.

Эту проблему решает backpressure. Writable говорит производителю «замедлись» — **возвращая `false` из `write()`**. Производитель должен паузу до `drain`, когда поток снова готов.

Правильный вариант:

```js
readable.on('data', (chunk) => {
    const canContinue = writable.write(chunk);
    if (!canContinue) {
        readable.pause();
        writable.once('drain', () => {
            readable.resume();
        });
    }
});
```

`write()` вернул `false` — ставим Readable на паузу, он перестаёт испускать `data`. Буфер Writable опустошается по мере записи в назначение. Когда буфер ниже `highWaterMark`, срабатывает `drain` — возобновляем Readable. **Поток данных регулируется скоростью потребителя, а не производителя.**

Паттерн настолько частый, что в Node.js есть `pipe()` с таким flow control из коробки. Подробнее — в отдельной главе; здесь важно, что управление backpressure — часть модели потоков.

Что происходит внутри при `write()`?

`writable.write(chunk)` проверяет, идёт ли уже запись в назначение. Если да — chunk в буфер. Если назначение свободно — chunk сразу в `_write()`, который делает I/O.

Внутренний буфер — **связный список запросов на запись**. Каждый запрос: chunk, кодировка (для строки), колбэк по завершении. Повторные `write()` дополняют список.

После добавления (или передачи в `_write()`) поток считает размер буфера: для байтовых потоков — сумма длин chunks; в `objectMode` — число объектов. Если сумма ≥ `highWaterMark`, `write()` возвращает `false`, иначе `true`.

Упрощённая модель:

```js
class SimplifiedWritable {
    constructor(options) {
        this.highWaterMark = options.highWaterMark || 16384;
        this.buffer = [];
        this.bufferSize = 0;
        this.writing = false;
    }

    write(chunk) {
        this.buffer.push(chunk);
        this.bufferSize += chunk.length;

        if (!this.writing) {
            this._processBuffer();
        }

        return this.bufferSize < this.highWaterMark;
    }

    _processBuffer() {
        // записывает chunks в назначение
    }
}
```

Идея: `write()` добавляет в буфер и возвращает boolean — ниже ли порог.

Скорость опустошения буфера зависит от `_write()` и производительности назначения. Быстрый SSD — буфер быстро пустеет; медленная сеть — медленно. Writable измеряет давление в очереди и сигнализирует переполнение.

Поэтому `highWaterMark` — **параметр настройки**. Слишком низкий — частые сигналы backpressure и паузы, ниже throughput. Слишком высокий — много данных в памяти; нормально при запасе RAM, плохо при тысячах потоков или жёстких лимитах.

**16 КБ по умолчанию** — разумный компромисс: реже backpressure при типичных записях и не даёт медленным приёмникам накопить огромный буфер.

Что если игнорировать backpressure? Миллион вызовов `write()` по 1 КБ без проверки возврата — буфер ~1 ГБ только на этот поток.

Несколько файлов или HTTP‑запросов одновременно — гигабайты буферизованных записей. В какой‑то момент ОС не выделяет память — **out-of-memory**.

В продакшене это частая причина утечек памяти: быстрый источник, медленное назначение, возврат `write()` не проверяют.

Исправление простое, но требует дисциплины: **проверять возврат, паузить производителя, ждать `drain`, возобновлять.**

## Внутренняя буферизация Writable streams

Структура и управление внутренним буфером определяют память и производительность потокового кода.

Writable хранит объект `_writableState` (приватный, с подчёркиванием), но понимание полей помогает предсказывать поведение.

`bufferedRequestCount` — число запросов на запись в буфере. Каждый `write()`, пока поток уже пишет, увеличивает счётчик; по завершении записи в назначение — уменьшает.

`length` — суммарный размер буферизованных данных (байты или число объектов в `objectMode`). Сравнивается с `highWaterMark`, чтобы решить, вернуть ли `false`.

Флаг `writing` — идёт ли сейчас операция записи. При вызове `_write()` — `true`; после колбэка `_write()` — `false`. Пока `writing === true`, новые chunks буферизуются, а не идут сразу в `_write()`.

Буфер (в старых версиях Node — связный список запросов; в новых — более эффективная структура) концептуально остаётся **очередью FIFO**: сначала самый старый chunk.

При `write()` и `writing === false` chunk сразу в `_write()` с колбэком. По завершении — следующий из буфера, пока буфер не пуст.

Если размер буфера падает ниже `highWaterMark` после того, как был ≥ `highWaterMark`, испускается `drain` — **backpressure снят**.

Более детальная модель:

```js
class DetailedWritable {
    constructor(options) {
        this.highWaterMark = options.highWaterMark || 16384;
        this.buffer = [];
        this.length = 0;
        this.writing = false;
        this.needDrain = false;
    }

    write(chunk) {
        this.buffer.push(chunk);
        this.length += chunk.length;

        const ret = this.length < this.highWaterMark;
        if (!ret) {
            this.needDrain = true;
        }

        if (!this.writing) {
            this._doWrite();
        }

        return ret;
    }

    _doWrite() {
        if (this.buffer.length === 0) {
            if (this.needDrain) {
                this.needDrain = false;
                this.emit('drain');
            }
            return;
        }

        const chunk = this.buffer.shift();
        this.length -= chunk.length;
        this.writing = true;

        this._write(chunk, (err) => {
            this.writing = false;
            if (err) {
                this.emit('error', err);
            } else {
                this._doWrite();
            }
        });
    }
}
```

Упрощённо: `write()` буферизует и возвращает `false` при превышении `highWaterMark`; `_doWrite()` обрабатывает по одному chunk; при пустом буфере и `needDrain` — `drain`.

Буфер — **очередь между производителем** (`write()`) и назначением (`_write()`). Производитель может добавлять быстро; медленное назначение раздувает очередь. Backpressure (`false` и `drain`) — обратная связь «замедлись».

Поток **сигнализирует** backpressure через возврат `write()`. Если после `false` продолжать `write()`, буфер растёт до OOM. Дизайн даёт приложению выбор: жёсткий real-time — иногда сбрасывают данные; есть запас RAM — буферизуют агрессивнее. **Корректное поведение по умолчанию — пауза при `false`.**

Память буфера — сверх памяти самих chunks: каждый запрос — объект с chunk, кодировкой, колбэком, метаданными. Миллионы мелких `write()` дают заметный overhead объектов — одна из причин батчить мелкие записи в крупные chunks.

Методы `cork()` и `uncork()` оптимизируют буферизацию при множестве мелких записей.

`writable.cork()` переводит поток в **закупоренное** состояние: все записи буферизуются, `_write()` не вызывается. Идея — серия мелких `write()` и одна пачка на выходе.

`writable.uncork()` сбрасывает буфер. Если есть `_writev()`, вызывается он со всеми chunks; иначе — `_write()` по очереди.

```js
writable.cork();
writable.write('line 1\n');
writable.write('line 2\n');
writable.write('line 3\n');
writable.uncork();
```

Без `cork()` каждый `write()` может сразу вызвать `_write()` — три отдельные I/O. С `cork()` — одна операция (при `_writev()`) или последовательность без пауз.

Полезно при множестве мелких записей: три syscall по 8 байт медленнее одного на 24 байта.

В типичном прикладном коде `cork()`/`uncork()` редко нужны — чаще в библиотеках и обработчиках протоколов с мелкими фреймами.

`cork()` можно вызывать несколько раз — внутренний счётчик; столько же раз нужен `uncork()` для сброса (**вложенный cork**).

## Реализация кастомных Writable streams

Пользоваться Writable — одно; понимать внутренности — другое. **Лучший способ закрепить модель — реализовать свой Writable stream.**

Паттерн прост: наследуете `Writable` и реализуете `_write()`. Три аргумента: chunk, кодировка (для строки), колбэк по завершении записи.

Минимальный пример:

```js
import { Writable } from 'stream';

class NullWritable extends Writable {
    _write(chunk, encoding, callback) {
        callback(); // запись завершена сразу
    }
}
```

Как `/dev/null`: данные принимаются и отбрасываются. `_write()` сразу вызывает колбэк — успех.

Writable, пишущий в массив:

```js
class ArrayWritable extends Writable {
    constructor(options) {
        super(options);
        this.data = [];
    }

    _write(chunk, encoding, callback) {
        this.data.push(chunk);
        callback();
    }
}
```

Chunks накапливаются в `data`.

Если запись **асинхронная** — БД, сеть — колбэк важен: **его вызывают после завершения асинхронной операции.**

Имитация async‑записи:

```js
class AsyncWritable extends Writable {
    _write(chunk, encoding, callback) {
        setTimeout(() => {
            console.log('Wrote:', chunk.toString());
            callback();
        }, 100);
    }
}
```

`setTimeout` имитирует I/O 100 мс. До `callback()` следующий буферизованный chunk не обработают. **Так поток подстраивается под скорость назначения.**

При ошибке передают её в колбэк:

```js
class ErrorWritable extends Writable {
    _write(chunk, encoding, callback) {
        if (chunk.toString().includes('bad')) {
            callback(new Error('Invalid data'));
        } else {
            callback();
        }
    }
}
```

Ошибка в колбэке → событие `error`, буферизованные записи отбрасываются, поток в **состоянии ошибки**.

`_writev()` — **опциональная оптимизация** для пакетной записи. При буферизации или cork поток может вызвать `_writev()` с массивом chunks вместо многократного `_write()`.

Сигнатура `_writev()`:

```js
class BatchWritable extends Writable {
    _writev(chunks, callback) {
        const allData = Buffer.concat(
            chunks.map((c) => c.chunk)
        );
        console.log(
            'Batch write:',
            allData.length,
            'bytes'
        );
        callback();
    }
}
```

`chunks` — массив объектов с `chunk` и `encoding`. Обработали пачку — один колбэк.

`_writev()` не обязателен: без него — `_write()` на каждый chunk. Имеет смысл, если назначение умеет batch (многстрочный SQL, протокол с объединением сообщений).

Хук `_final()` вызывается при завершении (после `end()` и обработки буфера), **до** `finish`. Для финального flush или закрытия дескриптора.

```js
class CleanupWritable extends Writable {
    _write(chunk, encoding, callback) {
        // запись данных
        callback();
    }

    _final(callback) {
        console.log('Finalizing...');
        // очистка
        callback();
    }
}
```

Колбэк `_final()` обязателен — после него `finish`.

Реалистичнее — лог в файл с форматированием:

```js
import { Writable } from 'stream';
import { open, write as fsWrite } from 'fs';

class LogWritable extends Writable {
    constructor(filename, options) {
        super(options);
        this.filename = filename;
        this.fd = null;
        this._open();
    }

    _open() {
        open(this.filename, 'a', (err, fd) => {
            if (err) {
                this.destroy(err);
            } else {
                this.fd = fd;
                this.emit('open', fd);
            }
        });
    }

    _write(chunk, encoding, callback) {
        if (!this.fd) {
            this.once('open', () => {
                this._write(chunk, encoding, callback);
            });
            return;
        }

        const line = `[${new Date().toISOString()}] ${chunk}\n`;
        fsWrite(this.fd, line, callback);
    }

    _final(callback) {
        if (this.fd) {
            require('fs').close(this.fd, callback);
        } else {
            callback();
        }
    }
}
```

Файл открывается в конструкторе; `_write()` добавляет timestamp; `_final()` закрывает дескриптор. Если файл ещё не открыт — ждут `open` и повторяют `_write()`. **Частый паттерн** при асинхронной инициализации ресурса.

Кастомный Writable даёт **полный контроль** над тем, куда и как уходят данные: БД, внешние API, сжатие — интерфейс гибкий для любого назначения.

## Корректная запись в Writable streams

Зная внутренности, ниже — практические паттерны.

**Главное правило:** всегда проверяйте возврат `write()`. При `false` — пауза источника и ожидание `drain`.

Чтение из одного потока и запись в другой:

```js
import { createReadStream, createWriteStream } from 'fs';

const reader = createReadStream('input.txt');
const writer = createWriteStream('output.txt');

reader.on('data', (chunk) => {
    const ok = writer.write(chunk);
    if (!ok) {
        reader.pause();
    }
});

writer.on('drain', () => {
    reader.resume();
});

reader.on('end', () => {
    writer.end();
});
```

При `false` читатель на паузе; на `drain` — снова читает. Буфер writer ограничен: reader ждёт, пока назначение не догонит.

По окончании вызывайте `end()` — больше данных не будет. Можно передать финальный chunk:

```js
writer.end('final chunk');
```

Эквивалентно:

```js
writer.write('final chunk');
writer.end();
```

После `end()` — оставшийся буфер, при наличии `_final()`, затем `finish`. Дальнейший `write()` бросит ошибку.

Это **ERR_STREAM_WRITE_AFTER_END**:

```js
writer.end();
writer.write('more data'); // throws ERR_STREAM_WRITE_AFTER_END
```

**Частая ошибка:** асинхронный код ещё пишет, а другая ветка уже вызвала `end()`. Нужно дождаться всех записей перед `end()`.

`cork()`/`uncork()` в приложениях — при множестве мелких записей подряд:

```js
writer.cork();
for (let i = 0; i < 1000; i++) {
    writer.write(`line ${i}\n`);
}
writer.uncork();
```

На практике редко нужно вручную: `pipe()` и `pipeline()` сами управляют backpressure; внутренняя буферизация потока уже даёт некоторый батчинг. **Cork в основном для библиотечного кода** — HTTP/2, протоколы БД.

Ручной backpressure неизбежен, когда данные из **непотокового** источника — например, массив:

```js
async function writeArray(writable, array) {
    for (const item of array) {
        const ok = writable.write(item);
        if (!ok) {
            await new Promise((resolve) => {
                writable.once('drain', resolve);
            });
        }
    }
    writable.end();
}
```

При `false` ждут `drain` — цикл не кормит поток, пока буфер выше порога, даже если массив огромен, а поток медленный.

Есть `stream.Writable.toWeb()` для WHATWG `WritableStream` и async iteration — отдельная тема веб‑API.

Встроенный flow control через возврат `write()` и `drain`. **Учитывать его не опционально** — разница между «работает под лёгкой нагрузкой» и стабильностью в продакшене.

Полный пример: большой CSV → парсинг строк → БД с корректным backpressure:

```js
import { createReadStream } from 'fs';
import { Writable } from 'stream';
import { pipeline } from 'stream/promises';

class DatabaseWriter extends Writable {
    constructor(db) {
        super({ objectMode: true });
        this.db = db;
    }

    async _write(row, encoding, callback) {
        try {
            await this.db.insert(row);
            callback();
        } catch (err) {
            callback(err);
        }
    }
}

async function importCSV(filename, db) {
    const reader = createReadStream(filename);
    const parser = parseCSV(); // гипотетический парсер CSV
    const writer = new DatabaseWriter(db);

    await pipeline(reader, parser, writer);
    console.log('Import complete');
}
```

`pipeline()` сам управляет backpressure. `DatabaseWriter` пишет строки в БД; `async _write()` допустим — Node ждёт завершения перед следующим chunk.

Здесь не проверяют `write()` и не слушают `drain` — это делает `pipeline()`. **Рекомендуемый паттерн:** `pipeline()` или `pipe()`, backpressure на Node, вы — в логике преобразования.

Когда `pipeline()` не подходит — несколько источников/приёмников, интеграция с непотоковым API — backpressure вручную: **проверка `write()`, пауза при `false`, возобновление на `drain`.**

## Механика переполнения буфера

Пошаговая цепочка до исчерпания памяти объясняет, зачем нужен backpressure.

Копирование 1 ГБ с SSD на сетевой ресурс: SSD ~500 МБ/с, сеть ~10 МБ/с — **разница скоростей ~50×**.

Код:

```js
readable.on('data', (chunk) => {
    writable.write(chunk); // возврат игнорируется
});
```

Readable отдаёт chunks по 64 КБ с максимальной скоростью SSD. Каждые **128 микросекунд** новый chunk (64 КБ при 500 МБ/с). Сеть принимает chunk 64 КБ примерно раз в **6,4 мс** (10 МБ/с).

За первые 6,4 мс Readable отдал ~50 chunks, Writable отправил 1 — **49 chunks в буфере (~3,1 МБ)**.

За 64 мс — 500 chunks против 10 отправленных, **~490 в буфере (~30,6 МБ)**.

За секунду — сотни мегабайт в буфере; за две — почти гигабайт. Потом OOM.

Это не плавное замедление: **процесс жив до внезапной смерти.** Event loop отзывчив, пока аллокатор не откажет — V8 бросит out-of-memory.

Код с **учётом backpressure**:

```js
readable.on('data', (chunk) => {
    const ok = writable.write(chunk);
    if (!ok) {
        readable.pause();
    }
});

writable.on('drain', () => {
    readable.resume();
});
```

При достижении `highWaterMark` (16 КБ по умолчанию) `write()` → `false`, Readable на паузе. Writable продолжает слать буфер в сеть. Ниже порога — `drain`, Readable снова читает.

Буфер колеблется между 0 и `highWaterMark`, не растёт безгранично. Память ограничена `highWaterMark` плюс размер одного chunk от Readable — при дефолтах порядка **~32 КБ** независимо от размера файла и скорости сети.

В этом сила backpressure: скорости производителя и потребителя развязаны при **ограниченной** памяти.

Нюанс: `highWaterMark` **не жёсткий потолок**. Буфер может быть больше. `highWaterMark` задаёт, **когда** `write()` вернёт `false`. Chunk 10 МБ в пустой буфер даст 10 МБ в буфере при `highWaterMark` 16 КБ — и `false` на этом вызове.

Пиковая память ≈ **`highWaterMark` + размер крупнейшего chunk**. Chunks 64 КБ и `highWaterMark` 16 КБ → ~80 КБ; chunks 1 МБ → ~1 МБ. **Размер chunk важен** в условиях жёстких лимитов памяти.

!!!note ""

    `highWaterMark` — порог сигнала backpressure, а не жёсткий лимит размера буфера. Один большой chunk может временно раздуть буфер выше порога.

Другой случай: **несколько производителей в один Writable** — десять операций пишут в один лог. Без backpressure у каждого своя скорость, буфер растёт на всех. Десять потоков × 16 КБ легко превращаются в сотни килобайт и больше; на загруженном сервере — утечка памяти.

Решение то же: каждый проверяет `write()`, паузит при `false`; один `drain` — все возобновляются; буфер ограничен.

## Обработка ошибок Writable streams

Счастливый путь: данные текут, backpressure соблюдается, `end()` чистый. Что при сбоях?

Ошибки возможны на этапе назначения (диск полон, сеть оборвалась, права), в данных, в неверном состоянии потока.

В `_write()`, `_writev()`, `_final()` ошибку передают в колбэк → событие `error` → поток в **состоянии ошибки**, буфер сбрасывается, дальнейшие `write()` бросают.

```js
class FailingWritable extends Writable {
    _write(chunk, encoding, callback) {
        callback(new Error('Write failed'));
    }
}

const writable = new FailingWritable();

writable.on('error', (err) => {
    console.error('Stream error:', err.message);
});

writable.write('test'); // error
writable.write('more'); // throws ERR_STREAM_DESTROYED
```

Первый `write()` — `error`; поток уничтожен, следующий `write()` — исключение.

!!!warning ""

    Без обработчика `error` исключение может уронить процесс. **На каждый Writable, который создаёте или получаете, вешайте обработчик ошибок** — особенно в продакшене.

Паттерны для конвейеров — в главе про pipeline. Пока — обработчик на каждый Writable.

`write()` после `end()` — **ошибка программирования**, `ERR_STREAM_WRITE_AFTER_END`. Часто при параллельных асинхронных путях: одна ветка вызвала `end()`, другая ещё пишет. Координируйте: `end()` только после всех записей (`Promise.all()`, счётчик pending writes).

Проблема:

```js
async function buggyWrite(writable) {
    setTimeout(() => {
        writable.write('async write');
    }, 100);

    writable.end(); // раньше async write
}
```

Исправление:

```js
async function correctWrite(writable) {
    await new Promise((resolve) => {
        setTimeout(() => {
            writable.write('async write', resolve);
        }, 100);
    });

    writable.end();
}
```

`end()` только после завершения async‑записи.

`destroy(err)` — принудительное закрытие, опционально с ошибкой. Буфер отбрасывается, затем `error` (если передан `err`) и `close`.

```js
writable.destroy(new Error('Aborted'));
```

Полезно при отмене загрузки пользователем. **Немедленное** завершение, записи в буфере могут не дойти.

Свойство `destroyed`:

```js
if (!writable.destroyed) {
    writable.write('data');
}
```

Проверка перед записью в уже уничтоженный поток.

## Свойства и интроспекция

Writable expose свойства для отладки, мониторинга и решений о flow control.

`writableLength` — сколько байт (или объектов в `objectMode`) сейчас в буфере:

```js
console.log(writable.writableLength);
```

Близко к `writableHighWaterMark` — скоро backpressure. Можно для мягкого rate limiting или прогресса загрузки.

`writableHighWaterMark` — значение порога:

```js
console.log(writable.writableHighWaterMark);
```

`writable` — можно ли вызывать `write()`:

```js
if (writable.writable) {
    writable.write('data');
}
```

`false` после `destroy()` или `end()`.

`writableEnded` — вызывали ли `end()`:

```js
console.log(writable.writableEnded);
```

`true` после `end()`, даже до `finish`.

`writableFinished` — был ли `finish`:

```js
console.log(writable.writableFinished);
```

`true` после обработки всех записей и `finish`.

`writableCorked` — сколько раз `cork()` без `uncork()`:

```js
writable.cork();
writable.cork();
console.log(writable.writableCorked); // 2
```

Для отладки cork/uncork.

`writableObjectMode` — режим объектов:

```js
console.log(writable.writableObjectMode);
```

Задаётся при создании, не меняется. Для универсальных утилит над byte‑ и object‑потоками.

В прикладном коде редко нужны; при отладке потоков и generic‑утилитах — **незаменимы**.

## Очередь write request подробнее

Как управляются запросы на запись в очереди — для оценки производительности и памяти.

`write()` оборачивает chunk и метаданные в **объект запроса на запись**:

-   сам chunk (`Buffer`, строка или объект);
-   кодировка (для строки);
-   колбэк по завершении (опционально);
-   ссылка на следующий запрос.

Объекты образуют **связный список**: голова — обрабатываемый запрос, хвост — последний добавленный. Новый `write()` — в хвост.

По колбэку `_write()` текущий снимается с головы, следующий становится головой; если есть — снова `_write()`; иначе очередь пуста, ждут `write()`.

Каждый объект даёт **overhead** (указатели, метаданные, замыкания). Миллион `write()` по 1 байту — миллион объектов по ~50–100 байт overhead при данных 1 МБ. **Батчинг мелких записей** (1000 × 1 КБ вместо миллиона × 1 байт) сильно снижает overhead очереди.

`cork()`/`uncork()` и очередь: при cork запросы создаются и копятся, `_write()` ждёт; при `uncork()` — `_writev()` на всю пачку или цикл `_write()`.

С cork:

```js
writable.cork();
writable.write('a'); // в очередь
writable.write('b'); // в очередь
writable.write('c'); // в очередь
writable.uncork(); // _writev(["a", "b", "c"])
```

Без cork:

```js
writable.write('a'); // _write("a")
writable.write('b'); // в очередь
writable.write('c'); // в очередь
// по завершении каждого _write — следующий
```

При эффективном `_writev()` три chunk — **одна I/O** вместо трёх. Для сокетов и файлов это часто быстрее; для массива в памяти — без разницы. `_writev()` опционален — оптимизация там, где batch выгоден.

## Writable streams в objectMode

В основном говорили о байтах; `objectMode` меняет контракт в конвейерах обработки.

В `objectMode` `highWaterMark` — **число объектов**, не байты. По умолчанию 16. Каждый объект в буфере +1 к счётчику независимо от размера в памяти.

!!!warning ""

    В `objectMode` `highWaterMark` **не лимит памяти**, а лимит числа единиц в полёте. Шестнадцать объектов по 10 МБ — 160 МБ при `highWaterMark: 16`. Это намеренно: логические записи (строки БД), а не байты.

Реализация как у byte stream с `objectMode: true`:

```js
class RowWriter extends Writable {
    constructor(db, options) {
        super({ ...options, objectMode: true });
        this.db = db;
    }

    async _write(row, encoding, callback) {
        try {
            await this.db.insert(row);
            callback();
        } catch (err) {
            callback(err);
        }
    }
}
```

Каждый `write()` — объект строки; `encoding` в `objectMode` игнорируется (передаётся `'buffer'` для совместимости сигнатуры).

Частый паттерн: byte stream → `objectMode` через `Transform`, например JSON Lines:

```js
import { Transform } from 'stream';

class JSONLineParser extends Transform {
    constructor(options) {
        super({ ...options, objectMode: true });
        this.buffer = '';
    }

    _transform(chunk, encoding, callback) {
        this.buffer += chunk.toString();
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop(); // неполная строка

        for (const line of lines) {
            if (line.trim()) {
                try {
                    this.push(JSON.parse(line));
                } catch (err) {
                    return callback(err);
                }
            }
        }
        callback();
    }
}
```

`Transform` накапливает байты в строки и пушит объекты — выход `objectMode`, вход байтовый.

`objectMode` удобен в **ETL**, обработке логов, импорте/экспорте — везде, где этап работает с записями, а не сырыми chunks.

## Хук `_final()` подробнее

`_final()` часто недопонимают. Это хук нормального завершения: после всех `write()`, **до** `finish`.

Задача `_final()` — финальная запись или очистка: footer сжатия, flush накопленного batch.

Writable с батчингом:

```js
class BatchingWritable extends Writable {
    constructor(batchSize, options) {
        super(options);
        this.batchSize = batchSize;
        this.batch = [];
    }

    _write(chunk, encoding, callback) {
        this.batch.push(chunk);
        if (this.batch.length >= this.batchSize) {
            this._flush(callback);
        } else {
            callback();
        }
    }

    _final(callback) {
        if (this.batch.length > 0) {
            this._flush(callback);
        } else {
            callback();
        }
    }

    _flush(callback) {
        const data = Buffer.concat(this.batch);
        this.batch = [];
        // запись data в назначение
        callback();
    }
}
```

`_write()` наполняет batch; при размере — flush. `_final()` сбрасывает **остаток** при `end()`.

!!!warning ""

    **Без `_final()`** неполный batch теряется: `finish` есть, последние chunks не дошли до назначения. **Частый баг** в Writable с батчингом.

Колбэк `_final()` обязателен; без него `finish` не придёт — поток зависнет. Ошибка в колбэке → `error` вместо `finish`.

Async:

```js
async _final(callback) {
  try {
    await this.flushAsync();
    callback();
  } catch (err) {
    callback(err);
  }
}
```

Или promise без колбэка:

```js
async _final() {
  await this.flushAsync();
}
```

Promise из `_final()` Node ждёт до `finish` или `error` при reject.

## Кастомный Writable с ограничением скорости

Пример rate limit: backpressure, тайминг, очередь.

```js
import { Writable } from 'stream';

class RateLimitedWritable extends Writable {
    constructor(dest, bytesPerSecond, options) {
        super(options);
        this.dest = dest;
        this.bytesPerSecond = bytesPerSecond;
        this.tokens = bytesPerSecond;
        this.lastRefill = Date.now();
    }

    _write(chunk, encoding, callback) {
        this._refillTokens();

        if (this.tokens >= chunk.length) {
            this.tokens -= chunk.length;
            this.dest.write(chunk, encoding, callback);
        } else {
            const wait =
                ((chunk.length - this.tokens) /
                    this.bytesPerSecond) *
                1000;
            setTimeout(() => {
                this.tokens = 0;
                this.dest.write(chunk, encoding, callback);
            }, wait);
        }
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

**Token bucket:** токены (байты), пополнение `bytesPerSecond` в секунду. Хватает токенов — запись сразу; иначе `setTimeout` до накопления.

Паттерн для API rate limit, throttle логов, pacing экспорта.

Колбэк при отложенной записи вызывается позже — очередь Writable заблокирована до завершения. **Корректно:** backpressure естественно, пока колбэк не вызван.

## Backpressure при нескольких writers

Несколько производителей в один Writable усложняют картину.

Каждый вызывает `write()` и видит возврат. `drain` — **на всех** слушателей. Один паузится на `false`; при `drain` все возобновляются.

Возможен **thundering herd**: 100 паузенных на `drain`; все резюмируют и снова заливают буфер — снова `false` у всех. Крайний случай, но реальный: координация backpressure между производителями нетривиальна.

Решение — очередь уровнем выше: производители кладут в очередь, **один** consumer пишет в поток и обрабатывает backpressure.

Или семафор: не более N писателей одновременно.

На практике проще **не плодить много concurrent writers в один поток** — лог‑библиотека с внутренней координацией или мультиплексор потоков.

!!!note ""

    Backpressure — **сигнал на поток**, не на производителя. Несколько производителей требуют координации уровнем выше, иначе возможны патологические осцилляции буфера.

## Профилирование памяти Writable stream

Память растёт — подозрение на потоки. Как диагностировать?

Проверьте backpressure — лог при `write()`:

```js
const ok = writable.write(chunk);
if (!ok) {
    console.log(
        'Backpressure! Buffer size:',
        writable.writableLength
    );
}
```

«Backpressure!» без паузы — **игнорируете сигнал**.

Если паузите, а память растёт — периодически `writableLength`:

```js
setInterval(() => {
    console.log('Buffer size:', writable.writableLength);
}, 1000);
```

Стабильный рост — назначение медленнее производителя (ожидаемо или зависло).

Снимок кучи Node:

```js
const v8 = require('v8');
const fs = require('fs');

const snapshot = v8.writeHeapSnapshot();
console.log('Heap snapshot written to', snapshot);
```

В Chrome DevTools ищите миллионы `Buffer` и объектов запросов записи — типичная утечка при неограниченном буфере.

`node --trace-gc app.js` — частый GC при высокой аллокации быстрее, чем сбор — как при растущем буфере.

В продакшене метрика `writable.writableLength`: стабильно у `writableHighWaterMark` — узкое место в конвейере.

## Запись в несколько Writable одновременно

Один chunk — в файл и БД, или на несколько endpoint'ов.

Вручную:

```js
function writeToAll(writables, chunk) {
    const results = writables.map((w) => w.write(chunk));
    return results.every((r) => r === true);
}

const ok = writeToAll([writable1, writable2], chunk);
if (!ok) {
    // хотя бы один поток сигнализировал backpressure
}
```

Backpressure сложен: один `false`, другие `true` — паузить всех или только медленного? Ждать drain у всех — тормозите быстрые; не ждать — буфер медленного растёт.

Лучше fan-out внутри одного Writable:

```js
class FanOutWritable extends Writable {
    constructor(destinations, options) {
        super(options);
        this.destinations = destinations;
    }

    _write(chunk, encoding, callback) {
        let pending = this.destinations.length;
        let error = null;

        const done = (err) => {
            if (err) error = err;
            if (--pending === 0) {
                callback(error);
            }
        };

        this.destinations.forEach((dest) => {
            dest.write(chunk, encoding, done);
        });
    }
}
```

Пишет во все назначения параллельно; колбэк `_write()` — когда все завершили (или первая ошибка). Медленное назначение задерживает колбэк → буфер `FanOutWritable` растёт → backpressure производителю.

Полезно для мульти‑логов, репликации, broadcast событий.

## Выбор highWaterMark для Writable streams

**16 КБ по умолчанию** — баланс для большинства сценариев.

Крупные chunks — **поднимайте `highWaterMark`** (2–4 МБ при chunks 1 МБ), иначе backpressure на каждой записи.

Жёсткие лимиты памяти (Docker, embedded) — **снижайте** до 4–8 КБ.

Много одновременных потоков: `highWaterMark × число потоков` — оценка буферной памяти (1000 HTTP‑ответов × 16 КБ ≈ 16 МБ только буферы).

В `objectMode` — **число объектов** в полёте (100–1000 для БД, 10–50 для парсинга файлов) — зависит от размера объекта и throughput.

Делайте `highWaterMark` **настраиваемым**, меряйте throughput и память, подстраивайте.

Помните: порог сигнала, буфер может быть больше из‑за крупных chunks.

## Связанное чтение

-   Предыдущая: [Readable streams Node.js](./readable-streams.md)
-   Далее: [Transform streams Node.js](./transform-streams.md)
