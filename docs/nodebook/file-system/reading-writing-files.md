---
description: Файловый I/O в Node.js — readFile, writeFile, streams, fs.read/fs.write, fsync и readline
---

# Файловый I/O в Node.js: readFile, writeFile, streams и fsync

Источник: [theNodeBook — Reading and Writing Files](https://www.thenodebook.com/file-system/reading-writing-files)

Файловый I/O в Node.js перемещает байты между хранилищем и памятью процесса. Здесь разбираются целиком файловые хелперы, streaming API, низкоуровневые операции с дескриптором, синхронные варианты и promise-формы. `fs.readFile()` читает весь файл в память. `fs.writeFile()` записывает полный payload. Streams передают данные по частям и применяют backpressure.

## Чтение и запись файлов в Node.js

Выбор API — это вопрос памяти, порядка операций и durability. Целикомфайловые хелперы подходят для маленьких файлов. Streams — для больших и для pipeline. Вызовы на уровне дескриптора — для произвольного доступа. `fsync()` просит ОС сбросить состояние файла на носитель после записей, где нужна семантика durability.

Каждая файловая операция в Node.js начинается с файлового дескриптора. В предыдущей подглаве разобраны выделение, учёт и освобождение. Дальше модуль `fs` делится на целиком файловые хелперы (`readFile`, `writeFile`, `appendFile`), stream API (`createReadStream`, `createWriteStream`), побайтовые вызовы (`fs.read`, `fs.write`), построчное чтение и вызовы durability вроде `fsync()`. Под большинством этих операций лежит путь через thread pool libuv — он задаёт их производительность.

## Чтение целых файлов с readFile

Самый простой API чтения — `fs.readFile()`. Передаёте путь — получаете содержимое.

```js
const fs = require('fs');
fs.readFile('./config.json', 'utf8', (err, data) => {
    if (err) throw err;
    const config = JSON.parse(data);
});
```

Node открывает файл, вызывает `fstat`, чтобы узнать размер, выделяет буфер такого размера, читает все байты, закрывает дескриптор и отдаёт результат в callback. Если передать кодировку вроде `'utf8'`, Node конвертирует буфер в строку перед возвратом. Без кодировки получите сырой `Buffer`.

Promise-версия читается проще:

```js
const data = await fs.promises.readFile(
    './config.json',
    'utf8'
);
const config = JSON.parse(data);
```

Поведение то же, но обёрнуто в promise — можно использовать async/await. Под капотом путь I/O идентичен: dispatch в thread pool, syscalls, resolve promise по завершении.

### readFileSync и блокировка

Синхронный аналог блокирует главный поток:

```js
const data = fs.readFileSync('./config.json', 'utf8');
```

Всё останавливается, пока чтение не завершится. Таймеры не срабатывают. Входящие запросы не обрабатываются. Microtasks не выполняются. Event loop заморожен.

Для startup-кода это нормально. Загрузка конфигурации до того, как сервер начнёт принимать соединения, никому не мешает — конкуренции ещё нет. CLI-утилиты, которые читают файл, преобразуют и выходят, — то же самое. Event loop не занят полезной работой, блокировать его не стоит ничего.

```js
// При старте — нормально
const config = JSON.parse(
    fs.readFileSync('./config.json', 'utf8')
);
const app = createServer(config);
app.listen(3000);
```

Но в обработчике запроса `readFileSync` катастрофичен. Чтение файла за 10 мс блокирует весь процесс на 10 мс. Если каждый запрос так делает, абсолютный теоретический потолок пропускной способности — ровно 100 запросов в секунду (1000 мс / 10 мс). Приложение, которое обычно выдерживает 5000 rps, упирается в жёсткую стену на 100. И это при быстром SSD — на сетевых ФС или под нагрузкой на диск чтение может занимать 50–100 мс, и потолок падает до 10–20 rps.

!!!note ""

    `readFileSync` в hot path сервера — антипаттерн. Синхронный I/O допустим при старте, в CLI и скриптах, пока event loop не обслуживает конкурентную нагрузку.

### Последствия для памяти

`readFile` загружает весь файл в один буфер. Конфиг 10 КБ — 10 КБ памяти. Лог 500 МБ — 500 МБ. Зависимость линейная и безжалостная.

Память буферов живёт вне управляемой кучи V8 (это разбиралось в главе про buffers), но V8 всё равно учитывает её через external memory. Крупные выделения чаще запускают GC. V8 на время sweep останавливает event loop. При сотнях мегабайт буферов паузы GC 50–200 мс — и на это время все соединения стоят.

Параллельные чтения усугубляют проблему. Десять запросов, каждый читает файл 100 МБ? Гигабайт одновременных буферов. В контейнере на 512 МБ RAM — конец. Даже при 4 ГБ одно давление на GC убивает производительность.

Порог, после которого `readFile` перестаёт быть практичным, зависит от окружения и уровня конкуренции. Грубо: файлы до 1 МБ почти всегда ок. 1–50 МБ — если читаете по одному. Больше — streams.

!!!note ""

    `readFile` на файле в гигабайты либо падает с ошибкой выделения, либо вызывает паузы GC на секунды. Для больших файлов streams — не опция «для красоты», а необходимость.

### Обработка ошибок

Файловые операции падают. Путь может не существовать. Прав может не хватать. Диск полон или отключён. Свойство `.code` объекта ошибки говорит, что случилось:

```js
try {
    const data = await fs.promises.readFile(path, 'utf8');
    return JSON.parse(data);
} catch (err) {
    if (err.code === 'ENOENT') return {}; // файла нет
    if (err.code === 'EACCES')
        throw new Error('permission denied');
    throw err;
}
```

`ENOENT` — путь не существует. Часто ожидаемо: кэш-файл ещё не создан, опциональный конфиг. Обрабатывают значением по умолчанию. `EACCES` — нет права на чтение. `EISDIR` — передали путь к каталогу. `EMFILE` — исчерпан лимит файловых дескрипторов (см. предыдущую подглаву).

В callback API ошибка приходит первым аргументом. В promises — reject. В sync — throw. Коды ошибок одинаковы во всех стилях.

### Опция AbortSignal

Можно отменить выполняющийся `readFile` через `AbortSignal`:

```js
const controller = new AbortController();
setTimeout(() => controller.abort(), 500);

try {
    const data = await fs.promises.readFile('./huge.bin', {
        signal: controller.signal,
    });
} catch (err) {
    if (err.name === 'AbortError')
        console.log('read cancelled');
}
```

Если abort сработает до завершения чтения, Node закроет дескриптор и отклонит promise с `AbortError`. Удобно для таймаутов на файловые операции или отмены долгого чтения пользователем.

## Запись целых файлов с writeFile

`fs.writeFile()` — зеркало на стороне записи. Путь и данные:

```js
await fs.promises.writeFile(
    './output.json',
    JSON.stringify(data)
);
```

Node открывает файл (создаёт, если нет), обрезает до нулевой длины, пишет все байты, закрывает дескриптор. Флаг по умолчанию — `'w'`: запись, создать при необходимости, обрезать если существует.

Данные могут быть строкой (в байты с `'utf8'` по умолчанию), `Buffer`, `TypedArray` или `DataView`. Для строк можно указать другую кодировку:

```js
await fs.promises.writeFile(
    './output.txt',
    content,
    'latin1'
);
```

### Эксклюзивное создание с 'wx'

Флаг `'wx'` делает создание файла атомарным: операция падает, если файл уже есть.

```js
await fs.promises.writeFile(
    './lock.pid',
    process.pid.toString(),
    {
        flag: 'wx',
    }
);
```

На уровне syscall это `O_CREAT | O_WRONLY | O_EXCL`. Ядро либо создаёт файл и открывает его, либо возвращает `EEXIST`. Нет окна гонки между «проверить, есть ли» и «создать». Два процесса создают один lock-файл? Побеждает ровно один.

### Права при создании файла

Когда `writeFile` создаёт новый файл, опция `mode` задаёт права:

```js
await fs.promises.writeFile('./secret.key', keyData, {
    mode: 0o600, // только владелец: чтение и запись
});
```

По умолчанию `0o666`, с учётом umask процесса (часто `0o022` → `0o644`). Нюанс: `mode` действует только при создании. Если файл уже есть, права не меняются. Чтобы принудить права всегда — вызовите `chmod` после записи.

### Проблема обрезки (truncation)

Флаг `'w'` обрезает файл перед записью новых данных. Если процесс упадёт между обрезкой и завершением записи, останется пустой или частично записанный файл. Для конфигов, state-файлов и всего, где порча на рестарте ломает приложение, это реальный риск.

!!!note ""

    Запись «на месте» через `'w'` не атомарна для читателей. Для критичного состояния используйте паттерн временный файл + `rename()` — читатель видит либо старое содержимое, либо новое целиком.

Исправление — паттерн temp-file-and-rename:

```js
const crypto = require('crypto');
const tmpPath = `${target}.tmp.${crypto
    .randomBytes(4)
    .toString('hex')}`;
await fs.promises.writeFile(tmpPath, data);
await fs.promises.rename(tmpPath, target);
```

Пишете во временный файл с уникальным именем. Запись упала — оригинал цел. Успех — `rename` атомарно подменяет старый файл. На POSIX `rename()` в пределах одной ФС атомарен: читатели видят либо старое, либо новое содержимое, не полузаписанное. Случайный суффикс убирает коллизии при параллельной записи в одну цель.

### writeFileSync

Та же блокирующая семантика, что у `readFileSync`. Syscalls на главном потоке, event loop заморожен. Подходит для startup и скриптов. В hot path сервера — смерть для throughput.

```js
try {
    fs.writeFileSync(
        './output.json',
        JSON.stringify(result)
    );
} catch (err) {
    console.error('write failed:', err.code);
}
```

Ошибки — исключения. Без `try/catch` `ENOSPC` (диск полон) или `EACCES` уронят процесс.

## Дозапись в файлы (append)

`fs.appendFile()` открывает файл с флагом `O_APPEND` и пишет в конец:

```js
const entry = `${new Date().toISOString()} Server started\n`;
await fs.promises.appendFile('./server.log', entry);
```

Файла нет — создаётся. Есть — данные в конец, существующее содержимое не трогается.

На уровне ядра `O_APPEND` атомарно перемещает указатель в конец и пишет одной операцией. Даже при параллельной дозаписи из двух процессов каждая отдельная запись целиком попадает в конец — записи не перекрываются и не портят друг друга. Может перемешаться только порядок строк. Для логов, где строки независимы, а порядок восстанавливается по timestamp, это как раз то, что нужно.

То же поведение даёт `{ flag: 'a' }` у `writeFile`. `appendFile` существует ради ясности намерения.

### Когда append недостаточен

Append отлично для логов, растущих CSV и audit trail. Но не для форматов, где весь файл должен быть валидным. В JSON нельзя дописать хвост — закрывающая скобка уже на месте. Нужно прочитать, распарсить, изменить структуру и записать целиком (лучше с атомарной подменой).

При высокой частоте логов повторный `appendFile` неэффективен: каждый раз открытие и закрытие. Лучше write stream в режиме append:

```js
const log = fs.createWriteStream('./app.log', {
    flags: 'a',
});
log.write('entry one\n');
log.write('entry two\n');
```

Stream держит дескриптор открытым и обрабатывает backpressure, если запись не успевает за потоком событий.

## Файловый I/O на streams

Streams обрабатывают данные по частям. Вместо загрузки всего файла в память работаете с кусками — обычно по 64 КБ. Потребление памяти постоянно при любом размере файла. 10 МБ и 10 ГБ занимают при обработке примерно одинаково.

### createReadStream

```js
const stream = fs.createReadStream('./access.log', 'utf8');
stream.on('data', (chunk) => {
    // chunk — строка, обычно ~64 КБ
});
stream.on('end', () => console.log('done'));
```

Node открывает файл, читает `highWaterMark` байт (по умолчанию 64 КБ), эмитит `'data'`, читает следующие 64 КБ, снова эмитит, до EOF. Затем `'end'` и закрытие дескриптора.

С `'utf8'` chunks — строки. Без кодировки — `Buffer`. Для бинарных файлов (изображения, видео, архивы) кодировку не задавайте.

`highWaterMark` задаёт размер chunk:

```js
const stream = fs.createReadStream('./file.bin', {
    highWaterMark: 256 * 1024, // chunks по 256 КБ
});
```

Крупнее chunks — меньше syscalls и итераций event loop, но больше памяти на chunk. На NVMe большие chunks иногда дают выше throughput: узкое место в JS, не в диске. При многих параллельных чтениях в ограниченной памяти уменьшайте до 4–16 КБ. Дефолт 64 КБ разумен в большинстве случаев.

### Чтение диапазона байт

`createReadStream` поддерживает `start` и `end` для срезов:

```js
const stream = fs.createReadStream('./video.mp4', {
    start: 1048576, // байт 1 МБ
    end: 2097151, // байт 2 МБ − 1 (включительно)
});
```

Node делает seek на `start`, читает до `end`, остальное не трогает. HTTP Range для seek в видео и докачки — тот же паттерн: сервер читает только запрошенный диапазон.

### createWriteStream

Записывающий аналог:

```js
const out = fs.createWriteStream('./output.txt');
out.write('first chunk\n');
out.write('second chunk\n');
out.end('final chunk\n');
```

Каждый `write()` буферизует данные. Когда внутренний буфер превышает `highWaterMark` (для write streams по умолчанию 16 КБ), `write()` возвращает `false` — сигнал backpressure: пора паузить. Событие `'drain'` — буфер снова ниже порога, писать безопасно. Вручную backpressure редко нужен: `pipeline` делает это за вас.

`end()` сбрасывает остаток, закрывает дескриптор, эмитит `'finish'`. Дозапись вместо перезаписи — флаг `'a'`:

```js
const log = fs.createWriteStream('./server.log', {
    flags: 'a',
});
```

### Соединение через pipeline

Сила файловых streams — в связке:

```js
const { pipeline } = require('stream/promises');
await pipeline(
    fs.createReadStream('./input.bin'),
    fs.createWriteStream('./output.bin')
);
```

Данные идут chunk за chunk. `pipeline` настраивает backpressure: запись не успевает — чтение паузится, пока буфер не освободится. Ошибка на любом stream — `pipeline` уничтожает все и отклоняет promise. В новом коде используйте `pipeline`, а не `pipe()`: `pipe()` не пробрасывает ошибки — сбой записи может оставить read stream открытым и утекает дескриптор.

!!!note ""

    `pipe()` без обработки ошибок — частый источник утечек дескрипторов. Для файловых копий и цепочек предпочитайте `stream/promises.pipeline`.

Цепочки с transform работают так же:

```js
const zlib = require('zlib');
await pipeline(
    fs.createReadStream('./data.json'),
    zlib.createGzip(),
    fs.createWriteStream('./data.json.gz')
);
```

Три stream, два соединения. Chunks с диска через сжатие в новый файл. Память постоянна: в любой момент в pipeline только несколько chunks. Сжать файл 100 ГБ можно с потреблением памяти меньше мегабайта.

### Отдача файлов по HTTP

Типичный паттерн — stream файла прямо в HTTP-ответ:

```js
const http = require('http');
http.createServer((req, res) => {
    const stream = fs.createReadStream(
        './static/bundle.js'
    );
    stream.on('error', () => {
        res.writeHead(404);
        res.end();
    });
    stream.pipe(res);
}).listen(3000);
```

Файл идёт клиенту без буферизации целиком в памяти. Десять параллельных скачиваний по 50 МБ — порядка 640 КБ (10 × 64 КБ на chunk), а не 500 МБ при десяти `readFile`.

### Buffer-all против stream — выбор

**Buffer-all** (`readFile` / `writeFile`), когда:

-   файл маленький (до нескольких МБ) и нужен целиком;
-   парсите формат, требующий полного содержимого (JSON, XML);
-   важнее простота, чем экономия памяти.

**Stream**, когда:

-   файл большой или размер непредсказуем;
-   обрабатываете инкрементально (анализ логов, трансформация, копирование);
-   просто проксируете данные без полного просмотра;
-   память ограничена (контейнеры, много параллельных файловых операций).

Компромисс — сложность ради эффективности: chunks, async-события, flow control. Для больших файлов альтернативы нет.

## Низкоуровневые байтовые операции: fs.read и fs.write

`fs.read()` и `fs.write()` работают на уровне байт. Вы выделяете буфер, указываете смещение в файле и контролируете, сколько байт переносится. Под ними всё остальное — `readFile`, streams и readline в итоге зовут `fs.read`.

### Чтение с заданной позиции

Классическая форма API — шесть параметров:

```js
fs.read(fd, buffer, offset, length, position, callback);
```

Дескриптор, заранее выделенный буфер, смещение внутри буфера, сколько читать, позиция в файле. Callback: `(err, bytesRead, buffer)`.

У promise-версии через `FileHandle` чище:

```js
const fd = await fs.promises.open('./data.bin', 'r');
const buf = Buffer.allocUnsafe(64);
const { bytesRead } = await fd.read(buf, 0, 64, 0);
```

64 байта с позиции 0 файла в `buf`, начиная с offset 0 в буфере. `bytesRead` — сколько реально прочитано: меньше 64, если файл короче, или 0 на EOF.

`position` — произвольный доступ. Число — seek на этот offset. `null` — чтение с текущей позиции с её продвижением. Явные позиции позволяют прыгать по файлу без последовательного чтения с начала.

### Разбор бинарного заголовка

Многие бинарные форматы начинаются с фиксированного заголовка: PNG — 8 байт сигнатуры, ZIP — central directory в конце, файлы БД хранят счётчики, версию и смещения данных в header.

Гипотетический формат с заголовком 64 байта:

```js
const fd = await fs.promises.open('./database.db', 'r');
const header = Buffer.allocUnsafe(64);
const { bytesRead } = await fd.read(header, 0, 64, 0);

if (bytesRead < 64) throw new Error('Incomplete header');

const magic = header.readUInt32BE(0); // 4-байтовая сигнатура
const version = header.readUInt32LE(4); // версия формата
const recordCount = header.readUInt32LE(8);
const dataOffset = header.readUInt32LE(12);
```

Четыре чтения из буфера заголовка уже в памяти — это смещения в buffer, не повторные чтения с диска. Запись №5 при фиксированных 128 байт на запись:

```js
const recordBuf = Buffer.allocUnsafe(128);
const pos = dataOffset + 5 * 128;
const { bytesRead } = await fd.read(recordBuf, 0, 128, pos);

if (bytesRead < 128) throw new Error('Incomplete record');

await fd.close();
```

Два чтения с диска — 64 байта заголовка, 128 записи. Файл 10 ГБ с миллионами записей — прочитано 192 байта. `readFile` попытался бы выделить 10 ГБ.

### Запись с заданной позиции

`fs.write()` симметричен:

```js
const fd = await fs.promises.open('./database.db', 'r+');
const buf = Buffer.allocUnsafe(4);
buf.writeUInt32LE(42, 0);
await fd.write(buf, 0, 4, 16); // запись с байта 16
await fd.close();
```

Режим `'r+'` сохраняет содержимое. 4 байта по offset 16, остальное не трогается. Так БД обновляют отдельные записи без перезаписи всего файла.

!!!note ""

    Для точечной записи в существующий файл нужен `'r+'`. Флаг `'w'` обрежет файл до нулевой длины до вашей записи и уничтожит данные.

### Повторное использование буфера в цикле чтения

Плюс низкоуровневого чтения — reuse буфера. Один раз выделили — используете снова:

```js
const buf = Buffer.allocUnsafe(4096);
let position = 0;
let bytesRead;
do {
    ({ bytesRead } = await fd.read(buf, 0, 4096, position));
    if (bytesRead > 0)
        processChunk(buf.subarray(0, bytesRead));
    position += bytesRead;
} while (bytesRead > 0);
```

Один буфер 4 КБ на каждую итерацию. В tight loop по большому файлу меньше давления на GC, чем у `readFile` (один огромный буфер) или streams (новый буфер на chunk). `subarray` — view без копирования (см. главу про buffers).

`allocUnsafe` здесь безопасен: read сразу перезаписывает буфер. Обрабатывайте только `buf.subarray(0, bytesRead)`, не весь буфер — за `bytesRead` может лежать неинициализированная память от прошлого выделения.

### Когда опускаться на низкий уровень

`fs.read()` / `fs.write()`, когда нужны:

-   **Побайтовая точность** — диапазоны в бинарных форматах, заголовки, записи фиксированного размера, length-prefixed протоколы.
-   **Произвольный доступ** — переход по вычисленным offset из индекса или метаданных.
-   **Reuse буфера** — одно выделение на множество чтений в performance-sensitive циклах.
-   **Свои абстракции** — то, что не покрывают `readFile` и streams: постраничный движок, парсер бинарного протокола.

Большинство прикладного кода эти API не трогает. Они для случаев, где высокоуровневые абстракции не подходят.

## Сброс на диск: fsync

Когда запись «успешна», данные могут ещё сидеть в buffer cache ОС, а не на физическом носителе. Ядро батчит записи ради производительности — байты в RAM, пока ядро не сбросит (на Linux обычно в пределах ~30 с, `dirty_expire_centisecs`).

Потеря питания или kernel panic до flush — данные пропали. Callback вернулся, promise resolved, но на диск байты не дошли.

`fsync()` заставляет ядро сбросить буферизованные записи по дескриптору на устройство:

```js
const fd = await fs.promises.open('./ledger.dat', 'w');
await fd.write(buf, 0, buf.length, 0);
await fd.sync();
await fd.close();
```

`sync()` блокирует worker thread pool, пока контроллер диска не подтвердит запись на persistent storage. Это медленно: SSD 1–10 мс, HDD 10–50 мс, NFS ещё дольше.

Для temp-file-and-rename с durability:

```js
const fd = await fs.promises.open(tmpPath, 'w');
await fd.write(data, 0, data.length, 0);
await fd.sync(); // данные на диске
await fd.close();
await fs.promises.rename(tmpPath, targetPath);
```

`sync` до `close` гарантирует физическую запись до того, как `rename` сделает файл видимым. Без него сбой между `close` и фоновым flush ядра может потерять данные.

!!!note ""

    Большинству записей `fsync` не нужен: логи, кэши, временные файлы восстанавливаются. `fsync` критичен для WAL БД, финансовых записей и любого state, где потеря — тихая порча данных.

## Построчное чтение с readline

Текстовые файлы часто построчны: логи, CSV, конфиги, JSONL. Модуль `readline` разбирает readable stream на строки с постоянной памятью:

```js
const readline = require('readline/promises');
const file = await fs.promises.open('./access.log');
const rl = readline.createInterface({
    input: file.createReadStream(),
    crlfDelay: Infinity,
});

for await (const line of rl) {
    if (line.includes('ERROR')) console.log(line);
}
await file.close();
```

`crlfDelay: Infinity` нормализует окончания строк: пара `\r\n`, разорванная между двумя chunks, считается одним переводом строки. Иначе при `\r` в конце одного chunk и `\n` в следующем с задержкой больше 100 мс (дефолтный `crlfDelay`) получите лишнюю пустую строку.

Цикл `for await` — async iterator: по одной строке. Естественный backpressure: underlying stream не читает следующий chunk, пока вы не готовы к следующей строке. Медленная обработка строки (API, БД) автоматически тормозит чтение файла.

### Как readline буферизует строки

readline читает chunks из input stream (`'data'`), дописывает во внутренний string buffer и ищет `\n`. Нашёл — отрезает строку и отдаёт.

Сложность — границы chunks. Chunk 64 КБ может разрезать строку пополам: первый заканчивается на `"2024-01-15 request to /api/us"`, второй начинается с `"ers 200 OK\n"`. readline держит частичную строку в буфере, пока следующий chunk не допишет. Полные строки отдаются сразу; неполные ждут.

На `end` stream остаток буфера (последняя строка без завершающего `\n`) уходит финальным событием строки.

### Ранний выход и поиск

Можно выйти из цикла раньше:

```js
for await (const line of rl) {
    if (line.startsWith('FATAL')) {
        console.log('Found:', line);
        break;
    }
}
await file.close();
```

`break` в `for await` рвёт async iterator, закрывает readline и останавливает stream. Файл 10 ГБ, нужная строка в первых 100 КБ — прочитано ~100 КБ.

### Пакетная параллельная обработка

Последовательная обработка ок для I/O-bound работы. Если на каждую строку — независимая async-операция (API, insert в БД), последовательность может быть медленной. Батчи дают контролируемую конкуренцию:

```js
const batch = [];
for await (const line of rl) {
    batch.push(processLine(line));
    if (batch.length >= 20) {
        await Promise.all(batch);
        batch.length = 0;
    }
}
if (batch.length > 0) await Promise.all(batch);
```

20 строк, параллельная обработка, ждём все, следующие 20. `await Promise.all(batch)` также тормозит чтение — readline паузится, пока batch не завершён, и не копятся бесконечные in-flight promise.

### readline против ручного split по chunks

Можно сами на `createReadStream` и `split('\n')`:

```js
const stream = fs.createReadStream('./file.txt', 'utf8');
let leftover = '';
stream.on('data', (chunk) => {
    const lines = (leftover + chunk).split('\n');
    leftover = lines.pop();
    for (const line of lines) processLine(line);
});
stream.on('end', () => {
    if (leftover) processLine(leftover);
});
```

Ручной split покрывает простой случай. readline закрывает `\r\n`, `crlfDelay` для кроссплатформенности, promises API с async iterators и корректную очистку underlying stream. Для чего-то серьёзнее quick script — `readline`.

## Как libuv диспетчеризует файловый I/O

Часть, которую многие пропускают, но она объясняет характер производительности файлового I/O в Node.

POSIX не даёт по-настоящему асинхронного файлового I/O так же, как для сокетов. В Linux `io_uring` с ядра 5.1, в libuv есть экспериментальная поддержка, но на Node.js v24 на большинстве деплоев файловые операции всё ещё идут через thread pool. У macOS `kqueue`, у Windows IOCP — но они для сокетов и pipe, не для обычных файлов. libuv имитирует async файловый I/O пулом worker threads.

Вызов `fs.readFile('./data.json', callback)` — фактическая последовательность:

JavaScript-слой Node валидирует аргументы и создаёт C++-объект `FSReqCallback`. Он оборачивает `uv_fs_t` — тип запроса libuv для ФС. В `uv_fs_t` — какой syscall (`UV_FS_OPEN`, `UV_FS_READ`, `UV_FS_CLOSE`), путь, буфер, флаги, указатель на JS callback.

Затем `uv_fs_open()`. Syscall `open()` не выполняется сразу: libuv кладёт запрос в work queue thread pool — связный список под mutex. Один из worker threads (по умолчанию 4, до 1024 через `UV_THREADPOOL_SIZE`) забирает запрос, когда освободится.

Worker выполняет блокирующий POSIX `open()`. Ядро обходит каталоги, проверяет права, выделяет дескриптор, при необходимости читает inode с диска. Микросекунды на тёплом кэше или миллисекунды при disk I/O — но на worker thread, event loop в JS продолжает крутиться.

После `open()` worker кладёт дескриптор (или код ошибки) в поле result `uv_fs_t`. Для `readFile` следуют `uv_fs_fstat()` за размером, затем `uv_fs_read()` — каждый раз тот же цикл: очередь, worker, блокирующий syscall, result. В конце `uv_fs_close()`.

После последней операции worker сигналит event loop через async handle. Loop в poll phase забирает result из `uv_fs_t`, разворачивает callback из `FSReqCallback` и вызывает его с данными или ошибкой.

Полный цикл — JS → C++ binding → work queue libuv → worker → syscall → result → уведомление loop → callback — на **каждую** файловую операцию. Один `readFile` — минимум три прохода (open, read, close), плюс часто stat.

### Конкуренция за thread pool

По умолчанию 4 worker thread. Одновременно выполняются не больше четырёх файловых операций. 100 параллельных `readFile` — 4 в работе, 96 в очереди. Узкое место в I/O-heavy приложениях.

Можно увеличить `UV_THREADPOOL_SIZE`:

```js
// До любого I/O (например, в entry point)
process.env.UV_THREADPOOL_SIZE = '16';
```

!!!note ""

    `UV_THREADPOOL_SIZE` нужно задать **до** первого использования thread pool (до `require` модулей, которые сразу делают DNS/crypto/fs). Иначе размер пула уже зафиксирован.

Больше потоков — больше памяти (у libuv по умолчанию ~8 МБ stack на thread) и overhead на переключение контекста. Sweet spot зависит от нагрузки; для disk-heavy часто 8–16. После 32 прирост редок.

Нюанс: `fs` делит pool с `dns.lookup`, частью crypto и `zlib`. Всплеск DNS может занять все 4 потока — файловые чтения встанут в очередь. Конкуренция за pool даёт всплески latency файлового I/O при здоровом storage.

### Sync-варианты обходят thread pool

`readFileSync`, `writeFileSync` и другие sync вызовы идут напрямую: блокирующий syscall на главном потоке. Нет offload — event loop заморожен на время ответа диска.

Promise API использует тот же thread pool, что и callbacks. Отличие только в JS-слое: вместо callback — resolve Promise и microtasks. Путь I/O идентичен.

## Выбор подходящего API

| Сценарий | API | Почему |
| --- | --- | --- |
| Маленький config/JSON при старте | readFileSync | Блокировка безвредна до активного event loop |
| Маленький файл в обработчике запроса | promises.readFile | Неблокирующе, просто |
| Обработка большого файла | createReadStream | Постоянная память, любой размер |
| Запись state/config | writeFile + temp-rename | Атомарная подмена без порчи |
| Дозапись в лог | appendFile или write stream | O_APPEND гарантирует позицию |
| Большой вывод данных | createWriteStream | Backpressure, экономия памяти |
| Разбор бинарного формата | fs.read с позициями | Произвольный доступ, контроль байт |
| Анализ логов, CSV | readline + read stream | Построчно, постоянная память |
| Durability после записи | fsync перед close | Сброс на физический носитель |

Sync-варианты — для startup, CLI и скриптов. В любом коде, пока event loop активен и обслуживает конкурентную работу, — async. Promise API (`fs.promises.*`) — самый чистый для современных приложений: async/await, `try/catch`, естественная стыковка с остальным async-кодом.

Есть спектр контроля. `readFile` и `writeFile` делают всё: open, size, read/write, close. Streams добавляют chunked processing и flow control. `fs.read` / `fs.write` — сырой побайтовый доступ. `readline` — построчный разбор поверх streams. Каждый уровень вниз меняет простоту на точность. Берите самую высокую абстракцию, которая решает задачу. Спускайтесь ниже только когда нужен контроль.

## Связанное чтение

-   Предыдущая: [Файловые дескрипторы в Node.js](./file-descriptors-and-handles.md)
-   Далее: [fs.promises и FileHandle в Node.js](./fs-promises-filehandle.md)
