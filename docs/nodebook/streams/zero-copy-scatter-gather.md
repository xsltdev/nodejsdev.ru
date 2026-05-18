---
description: Zero-copy в потоках Node.js — writev, scatter/gather I/O, пулинг буферов и производительность
---

# Zero-copy потоки Node.js: writev и scatter/gather I/O

Источник: [theNodeBook — Zero-Copy Streams](https://www.thenodebook.com/streams/zero-copy-scatter-gather)

Zero-copy в потоках Node.js — это сокращение лишних копий байтов между буферами, объектами JavaScript, нативными биндингами и вызовами ядра. Проблема обычно проявляется на путях с высокой пропускной способностью, где копирование доминирует. Полезные инструменты: представления `Buffer`, владение чанками в stream, `writev`, `cork()`, `uncork()` и transform-код, который не склеивает каждый чанк через конкатенацию.

## Паттерны zero-copy в потоках Node.js

Scatter/gather I/O позволяет объединить несколько буферов в одну нативную операцию записи. Пулинг буферов снижает churn аллокаций. Оба подхода требуют дисциплины времени жизни: чанк, переданный вниз по потоку, должен оставаться стабильным, пока потребитель с ним не закончит; view поверх большого `Buffer` может удерживать всё выделение в памяти.

!!!warning ""

    Эта глава — продвинутая оптимизация производительности. Если читать некомфортно, можно пропустить и вернуться позже. Техники здесь важнее всего, когда вы обрабатываете большие объёмы данных и уже профилированием выявили I/O как узкое место.

Каждый раз, когда вы копируете файл в Node.js, те же данные, скорее всего, копируются четыре раза. Сначала с диска в память ядра. Затем из памяти ядра в память процесса Node.js. Потом из памяти процесса обратно в память ядра для назначения. Наконец — из памяти ядра на диск назначения. Четыре копии там, где концептуально достаточно одной операции.

Это важно, потому что копирование дорого. Каждая копия тратит время CPU, полосу памяти и загрязняет кэш. Когда через pipeline из потоков проходят гигабайты, лишние копии становятся узким местом. Диск может тянуть 2 ГБ/с, а вы получаете 500 МБ/с, потому что CPU тратит циклы на перекладывание байтов в памяти вместо полезной работы.

Техники этой главы — zero-copy, scatter/gather I/O, пулинг буферов — не академическая экзотика. Это разница между pipeline, который выжимает железо, и pipeline, который тратит ресурсы на «бухгалтерию». Мы разберём, как данные реально движутся в системе, где происходят копии и как их убрать. Затем — батчинг I/O для снижения накладных расходов syscall и стратегии управления буферами для снижения давления на GC.

В конце вы поймёте, как ускорить потоки, почему они медленные и какие оптимизации реально важны для вашей нагрузки.

## Что такое zero-copy?

Термин «zero-copy» используют свободно — важен точный путь копирования.

Традиционный I/O копирует данные между разными областями памяти. ОС строго разделяет пространство ядра (где работает kernel) и пользовательское пространство (где работает приложение). Это нужно для стабильности: приложения не должны портить память ядра и мешать друг другу.

Когда вы читаете файл в Node.js, обычно происходит следующее. ОС читает данные с диска в буфер ядра — первая копия (диск → память ядра). Процесс Node.js не может напрямую читать память ядра, поэтому ОС копирует данные из буфера ядра в память процесса — вторая копия. При записи в другой файл процесс обратный: запись в буфер в user space, копия в буфер ядра (третья), запись на диск (четвёртая).

Четыре копии для простого копирования файла.

Каждая копия включает дорогие шаги: CPU читает из одного адреса и пишет в другой, тратя циклы на вычисления. Загрязняется кэш — при копировании мегабайт из кэша вытесняются полезные данные других частей программы, позже — промахи кэша.

Полоса памяти конечна. При повторном копировании тех же байтов вы многократно расходуете bandwidth для одних и тех же данных — на больших объёмах это становится bottleneck.

Пример: веб-сервер отдаёт видео 1 ГБ. При традиционном I/O 1 ГБ копируется четыре раза, но каждая копия через CPU — это чтение и запись по шине памяти. Разбивка bandwidth:

-   Диск → буфер ядра: DMA write (1 ГБ)
-   Ядро → user space: CPU read + write (2 ГБ)
-   User space → ядро: CPU read + write (2 ГБ)
-   Ядро → сеть: DMA read (1 ГБ)

Итого 6 ГБ bandwidth памяти на 1 ГБ полезных данных. На системе с ~50 ГБ/с по памяти один такой transfer может съесть ~120 мс только на операции с памятью — до учёта latency диска и сети.

Zero-copy — техника устранения части или всех промежуточных копий. «Ноль» условен: данные всё равно должны переместиться, но можно избежать копий между ядром и user space — там основная CPU-нагрузка.

Если вы просто переносите данные из файла в файл без анализа и изменений, зачем тащить их в память процесса? Данные уже в ядре — kernel может переложить их из буфера источника в буфер назначения, минуя процесс.

Syscall `sendfile()` в Linux делает именно это: «скопируй с дескриптора A на дескриптор B» — целиком в kernel space, без копии в user space и без memcpy в процессе.

Реализация зависит от ОС: Linux — `sendfile()` и `splice()`; FreeBSD и macOS — `sendfile()` с другой семантикой; Windows — `TransmitFile()`.

На системах с DMA (Direct Memory Access) ещё лучше: контроллеры переносят данные между устройствами и памятью без участия CPU. Диск читает прямо в память, сетевая карта читает из памяти и шлёт в сеть. CPU только настраивает transfer.

В идеале CPU только инициирует перенос; данные идут через DMA и копии kernel-to-kernel, не попадая в user space и не расходуя циклы на memcpy. На практике копии остаются (диск → буфер ядра → регион DMA сетевой карты), но это лучше, чем четыре копии через user space.

Zero-copy работает, пока данные идут без изменений. Как только нужен transform — парсинг, сжатие, шифрование — нужен доступ в user space. Общие kernel API двигают байты; transform принадлежит процессу. Вы копируете в процесс, меняете, копируете обратно.

Zero-copy даёт максимум throughput для «прозрачного» прокси: HTTP-прокси, раздача статики, reverse proxy без модификации тела. Ограничение: zero-copy не для всех пар источник–назначение. Linux `sendfile()` требует обычный файл-источник с `mmap()`; socket-to-socket на Linux — `splice()` через pipe, сложнее.

Понимание ограничений помогает понять, когда потоки будут быстрыми (zero-copy применим) и когда медленнее (fallback на обычный I/O). На высокообъёмных путях zero-copy возможен, когда источник, назначение, протокол и платформа это поддерживают.

Дальше — как это соотносится с потоками Node.js.

## Zero-copy в потоках Node.js

Распространённое заблуждение: Node.js автоматически использует `sendfile()` при `pipe()` файла в сокет. На деле стандартный путь потоков — буферизованный I/O через JavaScript.

```javascript
const readable = createReadStream('largefile.mp4');
const socket = getSocketSomehow();

readable.pipe(socket);
```

Стандартный `pipe()` читает через буферы user space обычными `read()` и `write()`. Данные: диск → буфер ядра → память процесса Node.js → буфер ядра → сокет. Классический путь с четырьмя копиями.

Несмотря на статьи в сети, потоки Node.js — буферизованный I/O. Что верно:

**В libuv есть `uv_fs_sendfile()`**, Node использует его для file-to-file, например `fs.copyFile()`. На Linux это может быть `sendfile()` или copy-on-write reflink (`COPYFILE_FICLONE`). Это копирование файл–файл.

**Потоки Node.js идут через JavaScript.** При `pipe()` вешаются слушатели: readable шлёт `data` с `Buffer`, writable получает `write()` на каждый чанк. Всё в JS, данные в heap V8. Обхода ядра «магией» нет.

Почему Node не использует `sendfile()` для file→socket:

1.  `sendfile()` ведёт себя по-разному на Linux, macOS, FreeBSD; Windows — `TransmitFile()`. Абстракция дорога.
2.  **HTTPS усложняет.** Zero-copy требует неизменённого потока в ядре. Классический TLS шифрует в user space. Linux 4.13+ — kTLS в ядре, но Node.js kTLS пока не использует; HTTPS всё ещё шифруется в процессе. Для продакшена выгода kernel zero-copy в Node ограничена.
3.  Backpressure потоков завязан на JS-колбэки и `drain`. Интеграция с `sendfile()` сложна.
4.  Поддержка `sendfile()` в раннем Node была, но убрана после перехода libeio → libuv из‑за багов и кроссплатформенности.

Когда в Node.js всё же есть выгода zero-copy:

**`fs.copyFile()` для файл–файл.** libuv `uv_fs_copyfile()` может использовать `sendfile()` или reflink:

```javascript
import { copyFile, constants } from 'fs/promises';

// Сначала copy-on-write, иначе копия через sendfile
await copyFile(src, dest, constants.COPYFILE_FICLONE);
```

На Btrfs, XFS, APFS reflink — мгновенная копия с общими блоками до изменения — настоящий zero-copy.

**Нативные аддоны.** Для file→socket можно вызвать `sendfile()` напрямую, самим обрабатывая partial writes, backpressure и платформы. Редко окупается.

**HTTP/2 `respondWithFile()`.** Модуль `http2` оптимизирует отдачу файлов; данные всё равно проходят user space, но эффективнее ручного стриминга.

Практический вывод: оптимизируйте то, что контролируете — размеры буферов, лишние копии в коде, `_writev()` для батчинга. Это измеримые победы.

Абстракция потоков ставит корректность, гибкость и кроссплатформенность выше сырого throughput. Сценарии kernel zero-copy (огромные файлы, тысячи клиентов) часто лучше отдают nginx или CDN, а не Node.js.

Идеи zero-copy полезны и без обхода ядра: минимизируйте копии в своём коде — об этом дальше.

## Отображение памяти (memory mapping)

Ещё один zero-copy подход: вместо чтения файла в буфер — отобразить файл в адресное пространство процесса. Содержимое файла — регион памяти; доступ — чтение из этого региона.

mmap использует виртуальную память ОС: kernel мапит страницы файла в адресное пространство и подгружает их при обращении. Запись помечает страницу dirty и сбрасывает на диск позже.

Это zero-copy в смысле отсутствия явного копирования в отдельный буфер — вы работаете с данными файла через map.

В ядре Node.js нет встроенного `mmap()`. Пакеты вроде `node-mmap` и `mmap-io` устарели. Нужны поддерживаемые форки или оценка: часто хватает `fs.read()` с offset.

mmap удобен для случайного доступа к огромным файлам — как к массиву байтов без seek/read чанками. Но readahead при mmap реактивен (page faults), для чисто последовательного стриминга `createReadStream` обычно быстрее.

Для стриминга mmap редко уместен; для БД со случайным доступом — да. Измеряйте на своей нагрузке.

## Как избежать лишних копий Buffer в коде

Даже без OS zero-copy можно убрать лишние копии в приложении.

Частый виновник — `Buffer.concat()`:

```javascript
const chunks = [];
readable.on('data', (chunk) => {
    chunks.push(chunk);
});

readable.on('end', () => {
    const combined = Buffer.concat(chunks);
    processData(combined);
});
```

Сбор чанков и `Buffer.concat()` — новый буфер и копия всех чанков.

Если нужен один непрерывный буфер — копия неизбежна. Если можно обрабатывать по чанкам:

```javascript
readable.on('data', (chunk) => {
    processChunk(chunk);
});
```

Без промежуточного буфера и конкатенации.

Антипаттерн — строка туда-обратно:

```javascript
const str = buffer.toString('utf8');
const processedStr = processString(str);
const newBuffer = Buffer.from(processedStr, 'utf8');
```

Каждая конверсия аллоцирует и копирует. Если хватает `buffer.indexOf()`, `buffer.subarray()` — оставайтесь в байтах.

Срез буфера — zero-copy при правильном использовании:

```javascript
const slice = buffer.subarray(10, 50);
```

Данные не копируются: view на байты 10–50, общая память с оригиналом. Изменение slice меняет оригинал.

Используйте `subarray()`, не `slice()`. `Buffer.slice()` с тем же поведением устарел (DEP0158) и расходится с `TypedArray.prototype.slice()`, который копирует. В Node.js v25 `slice()` даёт deprecation warning.

Опасность: крошечные slice от многих больших буферов удерживают большие буферы в GC.

Безопасный паттерн: slice для временной обработки, копия для долгого хранения:

```javascript
const slice = buffer.subarray(10, 50);
processTemporarily(slice);

// Если нужно сохранить надолго:
const copy = Buffer.from(slice);
// Теперь оригинал можно собрать GC
```

Избегайте `Buffer.from(buffer)` без необходимости в копии:

```javascript
// Лишняя копия:
const copy = Buffer.from(originalBuffer);
writeStream.write(copy);

// Достаточно оригинала:
writeStream.write(originalBuffer);
```

Writable обычно не мутирует буфер — копия не нужна.

Каждый `Buffer.concat()`, `Buffer.from()`, `buffer.toString()` может аллоцировать и копировать. Делайте это только когда семантика требует. Для view — `subarray()`.

## Scatter/gather I/O

Scatter/gather сокращает число syscall при работе с несколькими буферами.

Классика: три буфера — три `write`:

```javascript
fs.writeSync(fd, buffer1);
fs.writeSync(fd, buffer2);
fs.writeSync(fd, buffer3);
```

Каждый syscall — переход user↔kernel, валидация, настройка I/O. На мелких записях накладные расходы syscall могут превысить стоимость самой записи.

Оценка: syscall ~50–200 нс на переключение режима + ~100–500 нс работы ядра — порядка 150–700 нс до переноса данных. Три записи по 1 КБ — 450–2100 нс только overhead; запись 3 КБ на быстром SSD может быть сопоставима или меньше.

На 1000 мелких буферов — сотни микросекунд только на syscall; на миллионах операций в секунду это ощутимый CPU.

Scatter/gather передаёт несколько буферов одним syscall. Gather (запись) собирает данные из буферов; scatter (чтение) раскладывает входящие данные по буферам.

В Linux gather — `writev()` (массив iovec). Scatter — `readv()`: заполняет буферы по порядку, переходя ко второму, если первый заполнен. Удобно для фиксированного заголовка и переменного тела.

Node.js: gather через `_writev()` на writable; scatter в stream API нет — поток не знает заранее, сколько буферов. Низкоуровнево — `fs.readv()` и `fs.writev()`.

Если writable реализует `_writev()`, Node батчит и вызывает `_writev()` с массивом чанков вместо многократного `_write()`:

```javascript
class BatchWriter extends Writable {
    _writev(chunks, callback) {
        // chunks: [{ chunk, encoding }, ...]
        const buffers = chunks.map(({ chunk }) => chunk);

        // Одна syscall на все буферы
        fs.writev(this.fd, buffers, (err) => {
            callback(err);
        });
    }
}
```

Вместо N syscall — один. Для HTTP с множеством мелких `write` выигрыш заметен.

Node вызывает `_writev()` только при буферизации нескольких чанков. Медленный поток чанков — отдельные `_write()`. Принудительный батч — `cork()`:

```javascript
writable.cork();
writable.write(chunk1);
writable.write(chunk2);
writable.write(chunk3);
writable.uncork(); // Сброс одним _writev()
```

Cork подавляет немедленные `_write()` и копит чанки. Uncork сбрасывает, желательно через `_writev()`.

Для scatter в stream API нет `readv()` hook: readable тянет данные по запросу, число буферов не фиксировано. С `fs` — `fs.readv()`.

Батчинг I/O в один syscall снижает overhead; scatter/gather — механизм для нескольких буферов.

## Реализация `_writev()` для максимального throughput

Пример оптимизации writable при записи в сокет:

```javascript
class BatchedSocket extends Writable {
    constructor(socket, options) {
        super(options);
        this.socket = socket;
    }

    _write(chunk, encoding, callback) {
        this.socket.write(chunk, callback);
    }

    _writev(chunks, callback) {
        const buffers = chunks.map((c) => c.chunk);
        const combined = Buffer.concat(buffers);

        this.socket.write(combined, callback);
    }
}
```

Здесь `_writev()` конкатенирует — одна копия, но часто выгоднее N syscall.

Без `_writev()` — N syscall (дорого). С конкатенацией — одна копия и один syscall. Если syscall дороже копии — батч выигрывает.

Лучше — настоящий vectored I/O:

```javascript
_writev(chunks, callback) {
  const buffers = chunks.map((c) => c.chunk);

  fs.writev(this.fd, buffers, (err) => {
    callback(err);
  });
}
```

Ядро пишет все буферы без склейки в user space — настоящий gather.

Для сокетов `net.Socket` на уровне JS — обычные stream write; libuv внутри использует vectored write где поддерживается. Реализуйте `_writev()` и дайте сокету батчить — выиграете от оптимизаций libuv.

Всегда реализуйте `_writev()`, если назначение поддерживает батч. Даже с конкатенацией часто быстрее множества syscall.

Адаптивный батчинг: на крупных чанках батч мало помогает; на мелких — критичен:

```javascript
let pendingWrites = 0;
let isCorked = false;

function writeWithBatching(chunk) {
    pendingWrites++;

    if (
        pendingWrites === 1 &&
        chunk.length < 4096 &&
        !isCorked
    ) {
        writable.cork();
        isCorked = true;
    }

    writable.write(chunk, (err) => {
        pendingWrites = Math.max(0, pendingWrites - 1);
        if (pendingWrites === 0 && isCorked) {
            writable.uncork();
            isCorked = false;
        }
    });
}
```

Упрощённая эвристика: cork на первом мелком write, uncork когда очередь опустела. В продакшене — тайминг, размеры, обработка close/error.

## Пулинг буферов

Каждая аллокация буфера — работа для V8 и GC. На высокопропускных потоках миллионы мелких буферов создают GC pressure: чаще паузы.

`Buffer.alloc(size)` — поиск памяти (возможен GC), метаданные, обнуление, учёт. Мелкий 1 КБ буфер — порядка 500–2000 нс в зависимости от heap. 100 000 чанков/с — 5–20% CPU только на аллокации.

При unreachable буферах GC их собирает; частые allocate/free дергают поколения, продвигают в old generation — дороже.

Пулинг — переиспользование буферов вместо новых аллокаций. Выделили N буферов, выдаёте из пула, возвращаете вместо GC. Pop/push из массива на порядки быстрее GC.

Сложность — время жизни. Вернуть буфер в пул можно только когда нигде нет ссылок. Use-after-free в JS — порча данных при повторном использовании.

Безопасно пулить буферы с коротким, предсказуемым циклом: прочитали → обработали сразу → вернули в пул.

Простейший вариант — один переиспользуемый буфер:

```javascript
const reusableBuffer = Buffer.allocUnsafe(65536);

readable.on('data', (chunk) => {
    chunk.copy(reusableBuffer, 0, 0, chunk.length);
    processBuffer(reusableBuffer.subarray(0, chunk.length));
});
```

Один буфер 64 КБ: копия чанка, обработка, снова тот же буфер — без аллокации на чанк.

`Buffer.allocUnsafe()` не обнуляет память — быстрее, но в буфере могут остаться старые байты. Безопасно, если сразу перезаписываете всё нужное и отдаёте только slice по фактической длине:

```javascript
const buf = Buffer.allocUnsafe(1024);
const bytesRead = readDataInto(buf);
const safeSlice = buf.subarray(0, bytesRead);
```

Гибкий пул:

```javascript
class BufferPool {
    constructor(bufferSize, poolSize) {
        this.bufferSize = bufferSize;
        this.pool = [];

        for (let i = 0; i < poolSize; i++) {
            this.pool.push(Buffer.allocUnsafe(bufferSize));
        }
    }

    acquire() {
        return (
            this.pool.pop() ||
            Buffer.allocUnsafe(this.bufferSize)
        );
    }

    release(buffer) {
        if (this.pool.length < 100) {
            this.pool.push(buffer);
        }
    }
}
```

Пул пуст — новая аллокация; пул переполнен — буфер не возвращаем, чтобы не копить память.

!!!warning ""

    Базовый пул не обнуляет буфер при `release`. Для паролей, токенов, PII — `buffer.fill(0)` перед возвратом или не пулите буферы с чувствительными данными.

Readable с пулом:

```javascript
const pool = new BufferPool(16384, 10);

class PooledReadable extends Readable {
    _read(size) {
        const buffer = pool.acquire();

        readDataInto(buffer, (err, bytesRead) => {
            if (err) {
                pool.release(buffer);
                this.destroy(err);
            } else if (bytesRead === 0) {
                pool.release(buffer);
                this.push(null);
            } else {
                const data = Buffer.from(
                    buffer.subarray(0, bytesRead)
                );
                this.push(data);
                pool.release(buffer);
            }
        });
    }
}
```

`Buffer.from(subarray)` — явная копия: `subarray` разделяет память с пуловым буфером; если `push` subarray и сразу `release`, потребитель может увидеть порчу при переиспользовании буфера.

Настоящий zero-copy пулинг требует передавать пуловые буферы вниз и освобождать после потребления — координация с consumer. На практике пулинг чаще при своём протоколе с обеих сторон.

Пулинг снижает аллокации и GC. `allocUnsafe` — для буферов, которые сразу перезапишете; осторожно со slice и утечкой неинициализированных байт.

## Батчинг записей: cork и uncork

Cork говорит writable копить записи вместо немедленного сброса. Uncork сбрасывает, желательно одним `_writev()`.

Выгода — меньше операций записи. Цена — latency (данные ждут в буфере).

Cork перед серией мелких записей:

```javascript
writable.cork();
for (const item of items) {
    writable.write(processItem(item));
}
writable.uncork();
```

Если `processItem()` бросит исключение, `uncork()` не вызовется — поток останется corked. Всегда `try/finally`:

```javascript
writable.cork();
try {
    // ... writes ...
} finally {
    writable.uncork();
}
```

Node считает вложенные cork: каждый `cork()` +1, `uncork()` −1; flush при нуле:

```javascript
writable.cork(); // counter = 1
writable.cork(); // counter = 2
writable.uncork(); // counter = 1, без flush
writable.uncork(); // counter = 0, flush
```

Вложенные функции могут cork/uncork локально; внешний cork держит буфер до финального uncork:

```javascript
function writeHeader(writable) {
    writable.cork();
    writable.write(header);
    writable.uncork();
}

function writeBody(writable) {
    writable.cork();
    for (const chunk of chunks) {
        writable.write(chunk);
    }
    writable.uncork();
}

writable.cork();
writeHeader(writable);
writeBody(writable);
writable.uncork(); // Финальный сброс всего
```

Не corkите, если чанки уже мегабайтные — overhead буфера может съесть выгоду. Cork — для множества мелких записей.

Не держите cork на весь жизненный цикл длинного потока — растёт память и latency. Cork только вокруг burst.

Адаптивный cork: если записи идут чаще 10 мс — cork; пауза 10 мс — uncork:

```javascript
let lastWrite = Date.now();
let corked = false;
let uncorkTimer = null;

function adaptiveWrite(chunk) {
    const now = Date.now();

    if (now - lastWrite < 10 && !corked) {
        writable.cork();
        corked = true;
    }

    writable.write(chunk);
    lastWrite = now;

    if (uncorkTimer) clearTimeout(uncorkTimer);
    uncorkTimer = setTimeout(() => {
        if (corked) {
            writable.uncork();
            corked = false;
        }
        uncorkTimer = null;
    }, 10);
}
```

Порог подбирайте по нагрузке.

## Избегайте накладных расходов конкатенации строк в потоках

Конкатенация строк при накоплении большого текста может быть неэффективной. V8 оптимизирует через cons strings (ropes) — отложенное копирование, flattening при доступе. В потоках с множеством чанков дерево cons strings растёт, flattening в итоге дорогой, память на дерево тоже.

Проблемный паттерн:

```javascript
let text = '';
readable.on('data', (chunk) => {
    text += chunk.toString();
});
```

Каждый `+=` — cons string или flattening предыдущих; на большом файле — глубокое дерево или повторный flatten, близко к O(N²).

Исправление — массив чанков и один `join`:

```javascript
const chunks = [];
readable.on('data', (chunk) => {
    chunks.push(chunk.toString());
});

readable.on('end', () => {
    const text = chunks.join('');
    processText(text);
});
```

`push` дёшев; `join` — одна аллокация и один проход. Линейно.

Лучше копить `Buffer` и склеить в конце:

```javascript
const buffers = [];
readable.on('data', (chunk) => {
    buffers.push(chunk);
});

readable.on('end', () => {
    const combined = Buffer.concat(buffers);
    processBuffer(combined);
});
```

`Buffer.concat()` — одна аллокация. `toString()` — только когда нужна строка.

Инкрементальная обработка без накопления:

```javascript
readable.on('data', (chunk) => {
    processChunk(chunk);
});
```

Антипаттерн — строка для простого поиска:

```javascript
const str = buffer.toString();
if (str.includes('keyword')) {
    // ...
}
```

В буфере:

```javascript
if (buffer.indexOf('keyword') !== -1) {
    // ...
}
```

Строки неизменяемы; конкатенация создаёт новые. В потоках минимизируйте строки, работайте с `Buffer`, для накопления — массивы чанков.

## Трюк `stream.read(0)`

Редкий приём: `read(0)` на readable.

Обычно `read(size)` забирает `size` байт из внутреннего буфера. `read(0)` проверяет буфер и может вызвать `_read()`, если:

1.  Внутренний буфер ниже `highWaterMark`
2.  Поток не в середине другого `_read()`

Полезно в paused mode — подтолкнуть заполнение без потребления:

```javascript
readable.pause();

// Позже — запросить чтение без потребления:
readable.read(0);
```

`_read()` почти всегда асинхронен — `read(0)` только _инициирует_ запрос:

```javascript
readable.pause();
setupResources();
readable.read(0);

// Неверно: буфер ещё пуст
// readable.resume();

// Верно: дождаться данных
readable.once('readable', () => {
    readable.resume();
});
```

Ниша для низкоуровневой обвязки потоков. Для обычного кода можно не трогать.

Для отладки: если `_read()` не вызвался — смотрите `readable.readableLength` и `highWaterMark`.

## Избегайте промежуточных transform

Каждый transform в pipeline — буферизация, `_transform()`, снова буфер. Много стадий — накладные расходы суммируются.

Объединение transform сокращает стадии:

```javascript
// Медленнее: три transform
pipeline(
    source,
    toUpperCase,
    removeWhitespace,
    trimLines,
    dest
);

// Быстрее: один combined
pipeline(source, allInOne, dest);
```

Меньше буферов и вызовов. Цена — модульность.

Компромисс: отдельные transform для ясности; при профилировании hot path — объединить:

```javascript
const combined = new Transform({
    transform(chunk, encoding, callback) {
        let result = toUpperCase(chunk);
        result = removeWhitespace(result);
        result = trimLines(result);
        this.push(result);
        callback();
    },
});
```

Уберите no-op transform: если transform не нужен — не вставляйте passthrough «на всякий случай»:

```javascript
if (shouldTransform) {
    pipeline(source, transform, dest);
} else {
    pipeline(source, dest);
}
```

Каждая стадия стоит денег. На hot path объединяйте; для переиспользуемых кирпичей — отдельные модули.

## `readable.readableFlowing` для ручного контроля

`readable.readableFlowing`: `true` — flowing, `false` — paused, `null` — режим ещё не задан.

```javascript
readable.on('data', (chunk) => {
    processChunk(chunk);

    if (shouldPause()) {
        readable.pause();
    }
});

if (readable.readableFlowing === false) {
    readable.resume();
}
```

Проверка перед `resume()` избегает лишнего вызова (микрооптимизация на миллионах чанков).

Адаптация к состоянию:

```javascript
if (readable.readableFlowing === null) {
    readable.on('data', handler);
} else if (readable.readableFlowing === false) {
    readable.resume();
}
```

Для отладки: нет данных — смотрите `readableFlowing` (`false` — на паузе, `null` — flowing ещё не включён, `true` — ищите проблему elsewhere).

## Профилирование производительности

Оптимизации имеют смысл только если улучшают _вашу_ нагрузку. Измеряйте.

Базовый throughput:

```javascript
const start = Date.now();
let bytes = 0;

source.on('data', (chunk) => {
    bytes += chunk.length;
});

source.on('end', () => {
    const duration = (Date.now() - start) / 1000;
    const throughput = bytes / duration / 1024 / 1024;
    console.log(`Baseline: ${throughput.toFixed(2)} MB/s`);
});
```

Запишите baseline. Меняйте по одной оптимизации и пересчитывайте.

Память:

```javascript
setInterval(() => {
    const mem = process.memoryUsage();
    console.log(
        `Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(
            2
        )} MB`
    );
}, 1000);
```

Пулинг снизил heap без потери throughput — win. Снизил throughput сильнее экономии памяти — откатите.

Профайлер Node:

```javascript
node --prof script.js
node --prof-process isolate-*.log > profile.txt
```

Ищите время в `Buffer.concat`, syscall, transform. 50% в `Buffer.concat()` — оптимизируйте это.

Профилируйте реальную нагрузку: JSON — JSON, файлы — реальные размеры. Мелкие чанки и крупные ведут себя по-разному.

Преждевременная оптимизация — зло. Сначала измерение.

## Паттерны производительности в продакшене

**Идеи zero-copy** важны при высокой полосе и малом transform (статика, видео, прокси). Node streams сами не дают kernel `sendfile()`; выигрыш — меньше копий в user space: без лишнего `Buffer.concat()`, `subarray()`, `_writev()`. CDN-масштаб file→socket — чаще nginx, не Node.

JSON API до ~100 КБ — zero-copy не поможет: ответ генерируется, transform неизбежен. Оптимизируйте сериализацию и БД.

**Scatter/gather (`writev`)** — при множестве мелких записей (HTTP-заголовки). Без `writev` — десятки syscall; с `writev` — один или несколько. На высоконагруженном HTTP latency может упасть на 10–30%.

Крупные чанки (64 КБ с файла) — `writev` почти не меняет картину: и так один syscall на чанк.

**Пулинг** — при экстремальной частоте аллокаций (пакеты, IoT, тики). GC pause −50–80% возможен. При ~1000 буферов/с в типичном вебе — польза сомнительна, сложность не окупается.

**Cork/uncork** — burst записей (батч из БД). 1000 записей → 10–50 операций. Непрерывный tail лога — batch не снижает суммарный I/O, может добавить latency.

Алгоритм:

1.  **Профиль под реальной нагрузкой** (`perf`, Instruments, `--prof`). Высокий CPU при низкой утилизации диска/сети — bottleneck в копировании/syscall. Насыщенный I/O при низком CPU — лимит канала, не CPU overhead.
2.  **Аллокации и GC** (`process.memoryUsage()`, `--trace-gc`). Много МБ/с аллокаций и паузы >10 мс — пулинг. Скромные аллокации и паузы <1 мс — пулинг лишний.
3.  **Число syscall** (`strace`, `dtruss`). Тысячи мелких `write` — `writev`/cork. В основном крупные I/O — батч не важен.
4.  **A/B бенчмарк** каждой оптимизации. +20% throughput без роста latency — оставляем. Нет эффекта или хуже — убираем.

## Оптимизированный pipeline копирования файла

Пример с крупными буферами, `_writev()` и аккуратной работой с буферами:

```javascript
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';

const pool = new BufferPool(65536, 10);

class OptimizedWriter extends Writable {
    constructor(dest, options) {
        super(options);
        this.dest = dest;
    }

    _write(chunk, encoding, callback) {
        this.dest.write(chunk, callback);
    }

    _writev(chunks, callback) {
        const buffers = chunks.map((c) => c.chunk);
        const combined = Buffer.concat(buffers);
        this.dest.write(combined, callback);
    }
}

async function optimizedCopy(src, dest) {
    const reader = createReadStream(src, {
        highWaterMark: 65536,
    });

    const writer = new OptimizedWriter(
        createWriteStream(dest, { highWaterMark: 65536 })
    );

    await pipeline(reader, writer);
}

await optimizedCopy('input.dat', 'output.dat');
```

64 КБ — с Node.js 22 это дефолт для `createReadStream`/`createWriteStream`; явный `highWaterMark` для ясности. Базовый `stream.Readable` по умолчанию 16 КБ.

Без обработки данных — `fs.copyFile()` с OS-оптимизациями:

```javascript
import { copyFile, constants } from 'fs/promises';

await copyFile(src, dest, constants.COPYFILE_FICLONE);
```

Итог: крупные буферы + `_writev()` + `copyFile`, когда stream processing не нужен.

## Измерение и отладка

**Трассировка syscall** — `strace` с суммарной статистикой:

```
strace -c -f node your-script.js
```

Много отдельных `write` при реализованном `_writev()` — cork не сработал или чанки не буферизуются. `writev` с тем же числом операций, что и чанки — батч работает.

Детали:

```
strace -e write,writev -f node your-script.js
```

**CPU profiling `perf`:**

```
perf record -F 99 -g node your-script.js
perf report
```

Высокий `memcpy` / `Buffer.concat` — лишние копии. Высокий syscall entry — batching. `sendfile` в профиле — kernel zero-copy активен; нет — не используется.

**Heap** — Chrome DevTools с `--inspect`, снимки до/after; миллионы мелких `Buffer` — пулинг. `node --heap-prof` для анализа в DevTools.

**GC** — `node --trace-gc`; частые minor GC — высокая аллокация; реже major GC после пулинга — хороший знак. `--trace-gc-verbose` — promotion, выжившие объекты.

**Задержка event loop** — `perf_hooks`:

```javascript
import { monitorEventLoopDelay } from 'perf_hooks';

const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

setInterval(() => {
    console.log(
        `p50: ${(h.percentile(50) / 1e6).toFixed(2)}ms`
    );
    console.log(
        `p99: ${(h.percentile(99) / 1e6).toFixed(2)}ms`
    );
    console.log(`max: ${(h.max / 1e6).toFixed(2)}ms`);
}, 1000);
```

Скачки p99 при стримах — синхронный `Buffer.concat` на огромных буферах или слишком крупные чанки. Дробите работу.

**`NODE_DEBUG`:**

```
NODE_DEBUG=fs,net,stream node your-script.js
```

`DEBUG=*` — для npm-пакета `debug`, не для внутренностей Node. Syscall — `strace` / `dtruss`.

Вместе: syscall — I/O, CPU profile — вычисления, heap — аллокации, GC — память, event loop — отзывчивость.

## Когда применять эти техники

**Минимизировать копии буферов:**

-   большие файлы в stream pipeline;
-   высокопропускная обработка данных;
-   раздача статики (kernel zero-copy в Node не автоматичен).

**`fs.copyFile()` с `COPYFILE_FICLONE`** — настоящий zero-copy дубликат на Btrfs, XFS, APFS.

**Не переусердствовать с копиями, если:**

-   нужен transform (копии неизбежны);
-   данные малы;
-   CPU не упирается в буферные операции (сначала профиль).

**`_writev()` / scatter-gather:**

-   много мелких чанков;
-   высокий overhead syscall (подтверждён профилем);
-   назначение поддерживает vectored write.

**Пропустить, если:**

-   чанки уже крупные;
-   пишете в in-memory буфер без выгоды от batch.

**Пулинг:**

-   миллионы буферов, сильный GC;
-   одинаковый размер;
-   контролируете lifecycle.

**Пропустить:**

-   переменный размер;
-   GC не bottleneck.

**Cork/uncork:**

-   burst мелких записей;
-   известные границы burst;
-   latency в burst приемлема.

**Пропустить:**

-   записи уже естественно батчатся;
-   критична минимальная latency.

Сначала измерение, потом оптимизация. Техники добавляют сложность — применяйте там, где профиль показывает выигрыш.

## Связанное чтение

-   Предыдущая: [Современные pipeline потоков и обработка ошибок](modern-pipelines-error-handling.md)
-   Далее: [Дескрипторы файлов в Node.js: FileHandle, флаги и EMFILE](../file-system/file-descriptors-and-handles.md)
