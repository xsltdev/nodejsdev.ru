---
description: Readable streams в Node.js — flowing, paused, backpressure и внутренняя буферизация
---

# Readable streams в Node.js: flowing, paused и backpressure

Источник: [theNodeBook — Readable Streams](https://www.thenodebook.com/streams/readable-streams)

Readable stream в Node.js — это state machine на стороне производителя для данных по частям. Сюда входят файлы, сокеты, тела HTTP, сгенерированные последовательности, потоки объектов и любой источник, который может отдавать chunks со временем. Readable держит внутренний буфер, отслеживает режим flowing или paused, вызывает `_read()`, когда нужны новые данные, эмитит `data` в flowing mode и возвращает chunks из `read()` в paused mode.

## Что такое Readable stream в Node.js

`highWaterMark` задаёт порог буфера, который определяет, насколько активно stream запрашивает у источника новые chunks. `readable.pause()` меняет режим потребления: автоматическая доставка через событие `data` останавливается, при этом буферизованные данные и чтение у источника по-прежнему следуют state machine потока.

Теперь вы понимаете, зачем нужны streams. Они решают задачу обработки больших наборов данных без загрузки всего в память. Вы видели концептуальную разницу между push и pull моделями и знаете, что streams в Node.js смешивают оба подхода. Остаётся практический вопрос: как реально использовать Readable streams в коде и, что важнее, как они устроены внутри?

Readable streams — входная точка в streaming в Node.js. Они **производят** данные: из файлов, сетевых соединений, структур в памяти — откуда угодно. Для практической работы нужна модель состояния readable-стороны: как буферизуются данные, как stream общается с потребителями и когда просит источник о новых порциях.

Мы выстроим это понимание по шагам. Сначала разберём класс `Readable` — опции, контракт, события. Затем — два режима работы и что запускает переходы между ними. После этого — внутренняя буферизация: здесь управляется память и здесь реально важен `highWaterMark`. В конце — собственные Readable streams и все способы их потребления. В итоге у вас будет цельная ментальная модель движения данных от источника через Readable stream к потребителю.

## Класс Readable Stream

Начнём с самого объекта. Когда вы импортируете `stream` из Node и обращаетесь к `stream.Readable`, вы получаете класс, наследующий `EventEmitter`. Это наследование формирует публичный контракт: каждый Readable stream эмитит события `data`, `end`, `error`, `readable`, и большая часть поведения доступна через них.

Создавать Readable stream напрямую в прикладном коде редко. Чаще вы получаете их из API Node.js — `fs.createReadStream()` или `http.IncomingMessage`. Но если создаёте сами — через наследование класса или `new stream.Readable(options)` — передаёте объект конфигурации, управляющий поведением.

Самая важная опция — `highWaterMark`. Это число: максимум байт (или объектов в `objectMode`), которые stream буферизует внутри, прежде чем перестанет тянуть данные из источника. Считайте это порогом буферизации. По умолчанию 65536 байт (64 КБ) — баланс памяти и накладных расходов на системные вызовы в дефолтах Node для файлового чтения.

Почему это важно? Readable stream держит внутренний буфер между источником и потребителем. Когда потребитель готов, он забирает данные из буфера. Когда буфер опустошается, stream просит источник пополнить его. `highWaterMark` определяет момент «буфер достаточно полон, пора перестать запрашивать у источника». Если в буфере байт не меньше `highWaterMark`, stream ждёт, пока буфер снова опустится ниже порога, и только тогда запрашивает новые данные.

Как это выглядит:

```js
import { Readable } from 'stream';

const readable = new Readable({
    highWaterMark: 1024, // буфер 1 КБ
});
```

Здесь создан Readable с порогом буфера 1 КБ. Если stream читает файл, он не запросит больше 1 КБ данных вперёд относительно скорости потребления.

Другая опция, меняющая контракт, — `objectMode`. По умолчанию Readable работает с `Buffer` и строками. Иногда нужно стримить произвольные JavaScript-объекты. `objectMode: true` меняет поведение: вместо байтов буферизуются объекты, а `highWaterMark` — это счётчик объектов, не байт. В `objectMode` дефолтный `highWaterMark` — 16 объектов.

```js
const objectStream = new Readable({
    objectMode: true,
    highWaterMark: 100, // до 100 объектов в буфере
});
```

Это удобно для pipeline со структурированными данными: читаете строки из БД и прогоняете через transform-стадии — каждая строка становится единицей потока, без конвертации в buffer и обратно.

Опция `encoding` — ещё одна деталь конфигурации. По умолчанию при чтении Readable отдаёт `Buffer`. Если задать `encoding`, например `'utf8'`, stream автоматически конвертирует буферы в строки. Это удобство: всегда можно вызвать `buffer.toString('utf8')` сами, но код чище, когда вы точно работаете с текстом.

```js
const textStream = new Readable({
    encoding: 'utf8',
});
```

Теперь при эмиссии данных stream отдаёт строки.

Это базовые опции. Есть и другие — `read` (функция чтения inline), `destroy` (очистка), `autoDestroy` (автоматически уничтожать stream после завершения) — но `highWaterMark`, `objectMode` и `encoding` настраивают чаще всего: буферизацию, единицы chunk и тип эмитируемых значений.

## События

Readable streams общаются с внешним миром в основном через события. Разберём каждое: когда срабатывает и что означает.

Событие `data` — самое прямолинейное. В flowing mode stream эмитит `data`, когда данные доступны. Каждое событие несёт chunk — `Buffer`, строку (если задан `encoding`) или объект (в `objectMode`).

```js
readable.on('data', (chunk) => {
    console.log(`Received ${chunk.length} bytes`);
});
```

Подписка на `data` **неявно** переводит stream в flowing mode. Слушатель меняет поведение: данные начинают течь, как только доступны, stream **пушит** их в обработчик. Тянуть вручную не нужно.

Событие `end` — когда stream больше не может отдать данных: источник исчерпан. Для файла — достигнут конец файла; для HTTP-ответа — сервер закончил тело ответа. Аргументов нет, только сигнал: «я закончил».

```js
readable.on('end', () => {
    console.log('No more data');
});
```

Событие `error` — при сбое: файл удалили во время чтения, оборвалось соединение, источник выбросил ошибку. Stream эмитит `error` с объектом ошибки. Без обработчика `error` Node.js выбросит исключение и может уронить процесс. Поэтому к streams **всегда** нужен обработчик ошибок.

```js
readable.on('error', (err) => {
    console.error('Stream error:', err);
});
```

Событие `readable` тоньше. Оно срабатывает, когда из stream можно что-то прочитать. В основном актуально в paused mode (про **flowing** и **paused** мы говорили в предыдущей главе; ниже режимы уточним снова). `readable` говорит: «во внутреннем буфере есть данные; вызовите `read()` — получите chunk».

```js
readable.on('readable', () => {
    let chunk;
    while ((chunk = readable.read()) !== null) {
        console.log(`Read ${chunk.length} bytes`);
    }
});
```

Срабатывает `readable`, внутри обработчика в цикле вызывается `readable.read()`, пока не вернётся `null` (буфер пуст). Это pull-потребление, в отличие от push через `data`.

Есть также `close`: stream и нижележащие ресурсы закрыты. Это не то же самое, что `end`. `end` — «данных больше нет», ресурсы могут быть ещё открыты. `close` — «ресурсы освобождены». Слушайте `close`, когда важен момент финальной очистки.

Эти события — публичная поверхность Readable streams. И потребление, и реализация вращаются вокруг них и их семантики.

## Режим flowing и paused (кратко)

Вернёмся к режимам работы, которые мы кратко затронули раньше. Каждый Readable stream в любой момент в одном из двух режимов: **flowing** или **paused**. Режим определяет, как данные переходят из внутреннего буфера в ваш код.

В **paused mode** stream заполняет внутренний буфер до `highWaterMark` и ждёт явных чтений. Нужно вызывать `readable.read()`, чтобы вытянуть данные. Paused mode — состояние по умолчанию при создании нового Readable.

В **flowing mode** данные текут сами. Как только chunk есть в буфере, stream эмитит `data`. `read()` не вызываете — данные приходят к вам.

Зачем два режима? Разные сценарии потребления выигрывают от разного контроля. Иногда нужен максимальный поток и backpressure через `pause()`/`resume()`. Иногда — точный контроль момента чтения. Paused mode даёт этот контроль; flowing mode упрощает код и повышает пропускную способность, когда обработка успевает за потоком.

Переключение режимов. Новый Readable начинает в paused mode. В flowing mode переводит любое из:

-   подписка на событие `data`;
-   вызов `resume()`;
-   вызов `pipe()` в Writable stream.

Обратно в paused — вызов `pause()` (но только если нет назначений `pipe()`).

Нюанс: если Readable подключён к Writable через `pipe()`, контроль потока принадлежит цепочке pipe. Механизм `pipe()` реагирует на сигналы backpressure от Writable. Это задумано: `pipe()` — более высокий уровень абстракции с автоматическим backpressure, а ручные `pause()`/`resume()` мешают этой координации.

Потребление в paused mode:

```js
const readable = getReadableStream();

readable.on('readable', () => {
    let chunk;
    while ((chunk = readable.read()) !== null) {
        processChunk(chunk);
    }
});

readable.on('end', () => {
    console.log('Stream ended');
});
```

Stream остаётся в paused mode. `readable` сигнализирует о данных; `read()` вызывается, пока не вернёт `null`. Момент чтения под вашим контролем.

Потребление в flowing mode:

```js
const readable = getReadableStream();

readable.on('data', (chunk) => {
    processChunk(chunk);
});

readable.on('end', () => {
    console.log('Stream ended');
});
```

Как только повесили слушатель `data`, stream переходит в flowing mode. Данные пушатся автоматически. Если `processChunk()` медленный, данные копятся в памяти, пока вы не реализуете backpressure через `pause()`.

Backpressure в flowing mode:

```js
readable.on('data', (chunk) => {
    const canContinue = processChunk(chunk);
    if (!canContinue) {
        readable.pause();
        // Когда обработка догонит:
        // readable.resume();
    }
});
```

Когда `processChunk()` сигнализирует, что не успевает, вызываем `pause()` — поток `data` останавливается. Позже, в callback или после promise, `resume()` возобновляет поток.

Третий, менее частый способ — `read(size)` в paused mode без слушателя `readable`. Можно в любой момент вызвать `readable.read(size)` и забрать заданное число байт из буфера. Если байт меньше — вернётся то, что есть; если буфер пуст — `null`.

```js
const chunk = readable.read(100);
if (chunk !== null) {
    console.log(`Read ${chunk.length} bytes`);
}
```

Точный контроль объёма за одно чтение полезен для протоколов с заголовками фиксированного размера.

Итог: режимы — разные стратегии памяти и конкурентности. Paused делает backpressure явным. Flowing даёт простоту и скорость, когда обработка не отстаёт. Понимание, когда какой режим использовать, — часть мастерства streams.

## Внутренняя буферизация

Разберём, что происходит внутри Readable stream. При чтении данные не «телепортируются» из источника (файл, сокет, генератор) сразу в ваш код. Они проходят через **внутренний буфер** stream.

Внутренний буфер — очередь chunks. Когда stream тянет данные из источника, chunks попадают в буфер. Когда вы потребляете (`read()` в paused mode или `data` в flowing mode), chunks удаляются. Буфер растёт, если источник быстрее потребителя, и сжимается, когда потребитель догоняет.

Буфер — не один большой `Buffer`, а **массив chunks** (раньше был связный список, заменили ради производительности). Каждый chunk остаётся в своём выделенном `Buffer`, массив хранит порядок. Массив иногда переразмечается, но выигрыш в locality кэша и простоте итерации обычно перевешивает.

Состояние буфера можно посмотреть через `_readableState` (внутреннее API, префикс `_` — сигнал), но для отладки это полезно:

```js
const state = readable._readableState;
console.log(`Buffer length: ${state.length} bytes`);
console.log(`Buffer count: ${state.buffer.length} chunks`);
console.log(`highWaterMark: ${state.highWaterMark} bytes`);
```

`state.length` — сколько байт сейчас в буфере. `state.buffer` — сам массив, `state.buffer.length` — число chunks. `state.highWaterMark` — настроенный порог или дефолтные 64 КБ.

Механизм пополнения: когда суммарная длина буфера ниже `highWaterMark` и stream нуждается в данных (потребитель читает или режим flowing), вызывается внутренний `_read()`. Он тянет данные из источника и кладёт в буфер. В кастомном Readable вы реализуете `_read()`; в `fs.createReadStream()` это делает Node.

`_read()` означает: «в буфере есть место, принесите данные». Реализация должна взять данные у источника и передать в буфер через `push()`. Упрощённый пример:

```js
class MyReadable extends Readable {
    _read(size) {
        const chunk = this.getDataFromSomeTypeOfSource(
            size
        );
        if (chunk) {
            this.push(chunk); // добавляет во внутренний буфер
        } else {
            this.push(null); // конец данных
        }
    }
}
```

`_read(size)` получает подсказку размера — обычно значение `highWaterMark`. Это только hint: можно пушить больше или меньше, stream адаптируется. Уважение hint помогает эффективнее работать с I/O.

При `this.push(chunk)` происходит несколько вещей. Chunk добавляется во внутренний буфер. В flowing mode chunk может сразу уйти как событие `data` (минуя буфер, если потребитель готов). В paused mode может сработать `readable`.

`push()` возвращает boolean. `false` означает, что буфер достиг или превысил `highWaterMark` (`state.length >= state.highWaterMark`), и источнику пора остановиться. Тогда `_read()` не должен продолжать тянуть данные; stream вызовет `_read()` снова, когда буфер опустится ниже порога.

Более полный пример:

```js
class FileReader extends Readable {
    constructor(fd, options) {
        super(options);
        this.fd = fd;
    }

    _read(size) {
        const buffer = Buffer.allocUnsafe(size);
        fs.read(
            this.fd,
            buffer,
            0,
            size,
            null,
            (err, bytesRead) => {
                if (err) {
                    this.destroy(err);
                } else if (bytesRead === 0) {
                    this.push(null); // EOF
                } else {
                    this.push(buffer.slice(0, bytesRead));
                }
            }
        );
    }
}
```

Упрощённый читатель файла: `_read()` читает `size` байт с дескриптора и пушит в stream. Ноль байт — конец файла, `push(null)`. Ошибка — `destroy(err)`.

Реализация streams в Node гарантирует: `_read()` не вызовут снова, пока вы не вызовете `push()`. Даже при асинхронном `fs.read()` не нужен флаг от перекрывающихся вызовов — state machine stream справляется сама. Backpressure тоже автоматический: `_read()` не повторится, пока буфер не опустится ниже `highWaterMark`.

Поведение буфера различается в byte mode и `objectMode`. В byte mode считаются байты и сравниваются с байтовым `highWaterMark`. В `objectMode` — число объектов и object-count `highWaterMark`. Структура та же, меняется учёт.

Ещё деталь: «reading state» внутри. Если `_read()` уже вызван и ещё не сделал `push()` или `push(null)`, повторный `_read()` не пойдёт. Это защищает источник от лавины параллельных запросов.

Вся эта буферизация сглаживает рассинхрон скорости источника и потребителя. Источник отдаёт пачками (сеть, пакеты) — буфер выравнивает поток для потребителя. Потребитель иногда ждёт (запись в БД) — буфер держит данные до готовности. `highWaterMark` задаёт размер этого буфера и компромисс память ↔ пропускная способность.

## Реализация собственных Readable streams

Разобрав внутренности, реализуем свои Readable streams. Это реже, чем потребление, но важно для библиотек, кастомных источников и глубокого понимания.

Стандартный путь — наследовать `Readable` и реализовать `_read()`. Простой пример: stream, эмитирующий числа от 1 до N.

```js
import { Readable } from 'stream';

class CounterStream extends Readable {
    constructor(max, options) {
        super(options);
        this.max = max;
        this.current = 1;
    }

    _read() {
        if (this.current <= this.max) {
            this.push(String(this.current));
            this.current++;
        } else {
            this.push(null);
        }
    }
}
```

Каждое число пушится как строка. После `max` — `push(null)`. Возврат `push()` здесь не проверяем: при синхронной генерации stream сам вызывает `_read()` по мере необходимости; если буфер полон, `_read()` не повторится, пока буфер не освободится.

Потребление:

```js
const counter = new CounterStream(5);

counter.on('data', (chunk) => {
    console.log(`Received: ${chunk}`);
});

counter.on('end', () => {
    console.log('Counter ended');
});
```

Вывод:

```
Received: 1
Received: 2
Received: 3
Received: 4
Received: 5
Counter ended
```

Более реалистичный пример — stream строк из текстового файла (логи, CSV):

!!!note ""

    Не переживайте, если код с API `fs` пока непонятен. Файловую систему разберём в следующей главе.

```js
import { Readable } from 'stream';
import fs from 'fs';

class LineStream extends Readable {
    constructor(filePath, options) {
        super(options);
        this.fd = fs.openSync(filePath, 'r');
        this.buffer = '';
        this.position = 0;
    }

    _read() {
        const chunk = Buffer.alloc(1024);
        const bytesRead = fs.readSync(
            this.fd,
            chunk,
            0,
            1024,
            this.position
        );
        if (bytesRead === 0) {
            if (this.buffer.length > 0) {
                this.push(this.buffer);
            }
            this.push(null);
            return;
        }

        this.position += bytesRead;
        this.buffer += chunk.slice(0, bytesRead).toString();

        let lineEnd;
        while (
            (lineEnd = this.buffer.indexOf('\n')) !== -1
        ) {
            const line = this.buffer.slice(0, lineEnd);
            this.buffer = this.buffer.slice(lineEnd + 1);
            if (!this.push(line)) {
                return;
            }
        }
    }

    _destroy(err, callback) {
        if (this.fd !== undefined) {
            fs.close(this.fd, callback);
        } else {
            callback(err);
        }
    }
}
```

Stream читает куски файла, копит их во внутренней строке и пушит готовые строки (без `\n`). Остаток в буфере в конце файла — финальная строка.

Метод `_destroy()` — хук очистки при уничтожении stream. У Readable по умолчанию `autoDestroy: true`, поэтому `_destroy()` вызовется **автоматически** после завершения (`push(null)`). Здесь закрываем файловый дескриптор. Проверка `this.fd` — на краевые случаи.

В цикле `while` проверяем возврат `push()`. `false` — ранний выход из `_read()`, уважение backpressure: при паузе потребителя или полном буфере новые строки не пушим, пока снова не вызовут `_read()`.

Как в предыдущей главе, для многих задач проще `stream.Readable.from()` — Readable из iterable или async iterable. Массив, генератор, async generator — stream в одну строку.

```js
import { Readable } from 'stream';

async function* generateNumbers() {
    for (let i = 1; i <= 5; i++) {
        await new Promise((resolve) =>
            setTimeout(resolve, 100)
        );
        yield i;
    }
}

const stream = Readable.from(generateNumbers());

stream.on('data', (num) => {
    console.log(`Received: ${num}`);
});
```

`Readable.from()` берёт на себя вызовы `next()`, ожидание promise, push в stream до завершения генератора. Для простых источников из структурированных данных ручное наследование `Readable` часто не нужно.

При ошибке на источнике уничтожайте stream с этой ошибкой — поток остановится, сработает `error`, ресурсы очистятся.

```js
_read() {
  this.fetchData((err, data) => {
    if (err) {
      this.destroy(err); // эмитит 'error'
    } else if (data === null) {
      this.push(null); // конец stream
    } else {
      this.push(data);
    }
  });
}
```

`this.destroy(err)` переводит stream в destroyed: `_read()` больше не вызывается, эмитится `error`. Если есть `_destroy()`, он вызовется для очистки.

## Паттерны потребления

Соберём в одном месте все способы потребления Readable streams и когда что выбирать.

**События (flowing mode)** — самый прямой путь: слушатели `data` и `end`, stream пушит данные.

```js
readable.on('data', (chunk) => {
    processChunk(chunk);
});

readable.on('end', () => {
    console.log('Done');
});

readable.on('error', (err) => {
    console.error('Error:', err);
});
```

Просто и быстро, если обработка лёгкая. Медленная или асинхронная `processChunk()` требует ручного `pause()`/`resume()` — сложнее.

**Async iteration** — современный и эргономичный вариант. Readable streams — async iterables, их едят `for await...of`.

```js
try {
    for await (const chunk of readable) {
        await processChunk(chunk);
    }
    console.log('Done');
} catch (err) {
    console.error('Error:', err);
}
```

Backpressure здесь по умолчанию: если `processChunk()` возвращает promise, следующий chunk не тянется, пока promise не resolve. Рекомендуется для большинства случаев.

**Явный `read()` (paused mode)** — точный контроль.

```js
readable.on('readable', () => {
    let chunk;
    while ((chunk = readable.read()) !== null) {
        processChunk(chunk);
    }
});

readable.on('end', () => {
    console.log('Done');
});
```

`read(size)` удобен для бинарных протоколов с заголовками фиксированного размера:

```js
const header = readable.read(4);
if (header !== null) {
    const bodyLength = header.readUInt32BE(0);
    const body = readable.read(bodyLength);
    if (body !== null) {
        processMessage(header, body);
    }
}
```

Мощно, но многословно: state machine на вас, в том числе «данных ещё мало».

**`pipe()`** соединяет Readable с Writable с автоматическим backpressure. Подробнее — в главах про pipe и Writable streams.

```js
readable.pipe(writable);

readable.on('error', (err) => {
    console.error('Read error:', err);
});

writable.on('error', (err) => {
    console.error('Write error:', err);
});
```

`pipe()` слушает `data`, пишет в Writable. Если `write()` вернул `false` (буфер Writable полон), `pipe()` делает `pause()` на Readable. На `drain` Writable — `resume()` на Readable. Удобно, но ошибки не распространяются сами — нужны обработчики на обоих stream, очистка при сбое может быть капризной.

**`stream.pipeline()`** — современная и надёжная альтернатива `pipe()`: несколько stream, ошибки и cleanup автоматически.

```js
import { pipeline } from 'stream/promises';

try {
    await pipeline(readable, writable);
    console.log('Pipeline succeeded');
} catch (err) {
    console.error('Pipeline failed:', err);
}
```

`pipeline` из `stream/promises` возвращает promise: resolve при успехе, reject при ошибке любого участника; при ошибке уничтожает все stream в цепочке. Для продакшена — предпочтительный способ композиции. Transform-функции разберём позже с Transform streams.

Итого: быстрая обработка — события; async с backpressure — `for await...of`; бинарные протоколы — `read()`; связка stream — `pipeline()`.

## Переходы режимов и управление состоянием

Уточним, когда именно меняются flowing и paused и как выглядит внутреннее состояние — иначе легко потерять данные или сломать backpressure.

При создании Readable в paused mode, флаг `state.flowing` равен `null` — ни paused, ни flowing: stream ещё не стартовал.

Первый слушатель `data` ставит `state.flowing` в `true`, режим flowing. Данные текут сразу, если буфер не пуст, или как только появятся.

`pause()` ставит `false`: `data` не эмитятся, но буфер может заполняться до `highWaterMark`; дальше `_read()` не вызывается.

`resume()` снова `true`: снова `data`, при опустошении буфера ниже `highWaterMark` — снова `_read()`.

Если снять все слушатели `data` (и нет `pipe()`), `state.flowing` остаётся `true`. Нюанс: формально flowing, но слушателей нет — `data` некуда деться. Stream продолжит опустошать буфер и звать `_read()`, эмитированные данные «пропадут». Новый слушатель `data` получит только **новые** события, не то, что ушло без слушателя. Чтобы реально остановить обработку, нужен явный `pause()` (`flowing` → `false`).

Это важно при динамическом добавлении/снятии слушателей и middleware вокруг streams. Снятие `data` не останавливает источник — только убирает получателя.

Paused (`false`) — явный `pause()` или backpressure у назначения `pipe()`.

Зачем всё это? При динамических слушателях и обёртках над streams нужно понимать переходы, иначе данные теряются или backpressure не срабатывает.

Наблюдение переходов:

```js
const readable = getReadableStream();

console.log(`Initial flowing: ${readable.readableFlowing}`); // null

readable.on('data', (chunk) => {
    console.log(`Received ${chunk.length} bytes`);
});

console.log(
    `After data listener: ${readable.readableFlowing}`
); // true

readable.removeAllListeners('data');
console.log(
    `After removing listeners: ${readable.readableFlowing}`
); // true (всё ещё!)

readable.pause();
console.log(`After pause: ${readable.readableFlowing}`); // false

readable.resume();
console.log(`After resume: ${readable.readableFlowing}`); // true
```

Свойство `readableFlowing` публичное: `null`, `false` или `true`.

Ещё флаг `ended`: после `end` данных больше не будет, `read()` вернёт `null`. Stream остаётся ended до destroy. Корректный stream после `end` новые данные не эмитит.

Флаг `destroyed`: после destroy событий почти нет (кроме `close`), чтение/запись бессмысленны, ресурсы освобождены.

Эти флаги помогают отвечать на «почему нет `data`?» и «почему stream завис?» — часто не тот режим, уже `end` или уже `destroyed`.

## Backpressure на практике

Сделаем backpressure конкретным: что будет, если его игнорировать.

Читаем большой файл и на каждый chunk шлём HTTP-запрос (~100 мс). Наивный код без backpressure:

```js
const readable = fs.createReadStream('large-file.txt');

readable.on('data', async (chunk) => {
    await fetch('https://api.example.com/process', {
        method: 'POST',
        body: chunk,
    });
});

readable.on('end', () => {
    console.log('Done');
});
```

Stream эмитит `data` так быстро, как читает файл. Каждый `data` запускает async-обработчик, но stream **не ждёт** завершения запроса. Накапливаются тысячи параллельных запросов — память и сеть под ударом. Потребитель медленнее производителя, тормоза нет — провал backpressure.

Исправление через `pause`/`resume`:

```js
const readable = fs.createReadStream('large-file.txt');

readable.on('data', async (chunk) => {
    readable.pause();
    await fetch('https://thenodebook.com/process', {
        method: 'POST',
        body: chunk,
    });
    readable.resume();
});

readable.on('end', () => {
    console.log('Done');
});
```

На каждый `data` — `pause()`, обработка, затем `resume()`. Один запрос в полёте, скорость чтения файла совпадает со скоростью HTTP. Но паттерн **неудобен**: `pause`/`resume` засоряют логику; при ошибке легко забыть `resume()` и «заморозить» stream.

Чище — async iteration:

```js
const readable = fs.createReadStream('large-file.txt');

for await (const chunk of readable) {
    await fetch('https://thenodebook.com/process', {
        method: 'POST',
        body: chunk,
    });
}

console.log('Done');
```

Тот же эффект backpressure без ручных `pause`/`resume`: следующий chunk не тянется, пока не завершится итерация с `await fetch()`.

Нужна контролируемая параллельность (например, до 5 запросов)? Одного `for await` мало — понадобится лимитер (`p-limit`, `async` и т.п.) — отдельная тема, но реализуемо.

Вывод: backpressure **не автоматичен**, если вы сами его не встроили. Слушатели `data` по умолчанию его не дают — только `pause`/`resume`. `for await...of` даёт по дизайну. `pipe()` и `pipeline()` смотрят на Writable. Выбирайте паттерн потребления с учётом нужды в автоматическом backpressure.

## Чтение в object mode

В object mode вместо `Buffer`/строк пушатся произвольные JavaScript-значения, а `highWaterMark` — счётчик объектов. Пример — stream строк из БД:

```js
import { Readable } from 'stream';

class RowStream extends Readable {
    constructor(db, query, options) {
        super({ ...options, objectMode: true });
        this.db = db;
        this.query = query;
        this.offset = 0;
    }

    async _read() {
        try {
            const rows = await this.db.query(this.query, {
                offset: this.offset,
                limit: 100,
            });
            for (const row of rows) this.push(row);
            rows.length > 0
                ? (this.offset += rows.length)
                : this.push(null);
        } catch (err) {
            this.destroy(err);
        }
    }
}
```

Батчи по 100 строк, каждая строка — объект. Буфер и backpressure: при заполнении `_read()` не зовут снова, запросы к БД естественно притормаживают. Потребитель:

```js
const stream = new RowStream(db, 'SELECT * FROM users');

for await (const row of stream) {
    console.log(`User: ${row.name}, Email: ${row.email}`);
}
```

Object mode уместен для записей, а не сырых байт: не сериализуем в JSON-buffer-parse, а пушим объекты напрямую.

!!!warning ""

    `highWaterMark` считает **объекты**, не байты. Память зависит от размера объектов: 16 объектов по 10 МБ — ~160 МБ при `highWaterMark: 16`. Node не измеряет размер произвольных объектов в байтах, только их число. Подбирайте `highWaterMark` с учётом ожидаемого размера записей.

## Краевые случаи и отладка

Несколько ловушек Readable streams.

**Пустой stream.** Можно завершиться сразу: `push(null)` в `_read()` без единого chunk — будет `end` без `data`. Валидно (пустой файл), но удивляет потребителей, ждущих хотя бы одно `data`.

**Необработанный `error`.** Без слушателя `error` Node выбросит исключение. Всегда вешайте обработчик, хотя бы для лога.

**Destroyed stream.** После `destroy()` читать нельзя. Преждевременный `destroy()` при данных в буфере — потеря данных. Нужна graceful-очистка — `push(null)`, а не мгновенный `destroy()`.

**Смешение паттернов.** И `readable`, и `data` на одном stream путают поведение: `readable` мешает переходу в flowing, `data` может не сработать как ожидаете. Один паттерн на stream.

**`read(size)`**. Вернёт до `size` байт из того, что есть; меньше — отдаст меньше; пустой буфер — `null`. Не блокируется.

**`readable.destroyed`.** В кастомной логике перед `read()`/`push()` проверяйте destroyed — иначе ошибки и странное поведение.

Для отладки — `_readableState`:

```js
console.log(readable._readableState);
```

Там `buffer`, `length`, `highWaterMark`, `flowing`, `ended`, `endEmitted`, `reading`, `destroyed` и др.

Подробные логи streams:

```bash
NODE_DEBUG=stream node your-script.js
```

В stderr — когда зовут `_read()`, когда пушат, когда эмитят события. Шумно, но полезно для разбора порядка операций.

## Память и выбор highWaterMark

Дефолт 64 КБ — разумный компромисс, но нагрузки разные.

Если источник и потребитель примерно равны по скорости и файл большой, больший `highWaterMark` может поднять throughput — меньше системных вызовов `fs.read()`:

```js
const readable = fs.createReadStream('large-file.bin', {
    highWaterMark: 128 * 1024, // 128 КБ
});
```

Больше буфер — больше памяти на stream. Тысячи параллельных stream (высоконагруженный сервер) — суммарный объём растёт; иногда `highWaterMark` **уменьшают**:

```js
const readable = fs.createReadStream('file.txt', {
    highWaterMark: 4 * 1024, // 4 КБ
});
```

Для real-time (живое видео) меньший `highWaterMark` — ниже задержка: stream не ждёт заполнения большого буфера. Если latency не критична, а нужен throughput — буфер больше.

В `objectMode` та же логика в единицах объектов: мелкие объекты — 16 может мало; крупные — 16 может многовато.

Универсального ответа нет. Профилируйте память и throughput при разных `highWaterMark`. Дефолт обычно ок; горячие пути иногда требуют настройки.

## Readable.from() и async iterables

`Readable.from()` связывает async iterables (генераторы, массивы, async generators) с API streams без ручного `_read()`.

Async generator постраничного API:

```js
async function* fetchPages(url) {
    let page = 1;
    while (true) {
        const response = await fetch(`${url}?page=${page}`);
        const data = await response.json();
        if (data.items.length === 0) break;
        for (const item of data.items) {
            yield item;
        }
        page++;
    }
}
```

В Readable stream:

```js
const stream = Readable.from(
    fetchPages('https://api.example.com/items')
);

stream.pipe(someWritable);
```

`Readable.from()` вызывает `next()`, ждёт promise, пушит значение, повторяет. Ошибка генератора — `error` на stream. Завершение — `push(null)`.

Обычные iterables тоже:

```js
const stream = Readable.from([1, 2, 3, 4, 5]);

for await (const num of stream) {
    console.log(num);
}
```

Каждый элемент массива — chunk. Удобно для тестов и стыковки с stream-API.

Readable streams — не только файлы и сокеты. Это абстракция **последовательности значений** из I/O, вычислений или обхода структур. `Readable.from()` снижает порог входа для любого iterable/async iterable.

## Итог

Краткий обзор пройденного.

Readable stream — **производитель** данных. Он тянет данные из источника (файл, сокет, генератор, запрос к БД) и отдаёт потребителю. Между источником и потребителем — внутренний буфер (массив chunks), сглаживающий разницу скоростей и реализующий backpressure.

Два режима: **paused** (явный `read()`) и **flowing** (автоматические `data`). Режим меняют слушатели, `pause()`, `resume()`, `pipe()`.

`highWaterMark` — порог буфера: выше — `_read()` не зовут, backpressure на источник; ниже — снова запрашивают данные.

Свой Readable: наследование `Readable`, `_read()`, `push(chunk)`, в конце `push(null)`, при ошибке `destroy(err)`.

Потребление: события `data`/`end`, `for await...of`, явный `read()`, `pipe()`, `pipeline()` — разный баланс простоты, backpressure и контроля.

События: `data`, `end`, `error`, `readable`, `close`.

Backpressure ограничивает память: медленный потребитель требует async iteration, `pipeline()` или ручной pause/resume.

Object mode — объекты вместо байт, `highWaterMark` в объектах.

Эта модель — источник, буфер, `highWaterMark`, режимы, события, backpressure — база для Writable, Transform и Duplex. Глубокое понимание Readable — половина streaming в Node.js; запись, преобразование и композиция опираются на то же.

## Связанное чтение

-   Предыдущая: [Основы streams в Node.js](./foundation-of-streams.md)
-   Далее: [Writable streams в Node.js](./writable-streams.md)
