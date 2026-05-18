---
description: fs.promises в Node.js — Promise API, FileHandle, закрытие дескрипторов и await using
---

# fs.promises и FileHandle в Node.js

Источник: [theNodeBook — Node.js fs.promises: FileHandle & Cleanup](https://www.thenodebook.com/file-system/fs-promises-filehandle)

`fs.promises` — promise-based API файловой системы в Node.js. Механика включает асинхронные open, read, write, stat, sync и close. `fs.promises.open()` возвращает объект `FileHandle` вокруг открытого дескриптора. Удобные функции вроде `readFile()` открывают файл, выполняют операцию и закрывают его внутри. Код с FileHandle держит открытый ресурс на виду.

## fs.promises и FileHandle

Правило очистки не меняется: закройте handle. `try/finally` — распространённый паттерн, потому что ошибки возможны между open и close. Параллельные операции требуют осторожности: порядок больше не задаётся последовательными `await`.

Каждая функция `fs`, которую вы использовали до сих пор, принимает callback. Вы передаёте функцию, Node вызывает её по завершении операции, вы обрабатываете ошибку или результат. Это работает. Но вложенные callbacks при нескольких файловых операциях быстро запутывают код — а координация обработки ошибок через цепочки `if (err) return callback(err)` утомительна и плохо масштабируется.

Пространство имён `fs.promises` это исправляет. У каждой асинхронной операции с файловой системой появляется «близнец», возвращающий Promise. Импортируете из `node:fs/promises`, делаете `await` результата и ловите ошибки через `try`/`catch`. Те же вызовы libuv. Те же системные вызовы ядра. Меняется JavaScript-обёртка — и от этого меняется всё, как читается код.

Но важнее `FileHandle`. Когда вы вызываете `fs.promises.open()`, вы не получаете сырой целочисленный file descriptor. Вы получаете объект — он оборачивает fd, отслеживает жизненный цикл, даёт методы для любой нужной операции и интегрируется с современной семантикой очистки вроде `await using`. File descriptor (разобран в предыдущей главе) по-прежнему внутри. Просто вручную им управлять не обязательно.

## Пространство имён fs.promises

Два способа получить API:

```
import { readFile, writeFile, open } from 'node:fs/promises';
```

Или если в одном файле нужны и callback API, и promise API:

```
import fs from 'node:fs';
const fsp = fs.promises;
```

Первый вариант чище: именованные импорты, tree-shakeable в бандлерах, только нужные функции. Второй удобен при миграции, когда callback-код переводят на promises по одной функции.

### Что доступно

Пространство имён повторяет почти каждую асинхронную функцию `fs`. Частичный список часто используемых:

-   `readFile(path, options)` — весь файл в память, возвращает Buffer или string
-   `writeFile(path, data, options)` — заменяет содержимое файла
-   `appendFile(path, data, options)` — дописывает в конец
-   `open(path, flags, mode)` — открывает файл, возвращает FileHandle
-   `stat(path, options)` и `lstat(path, options)` — метаданные
-   `readdir(path, options)` — список каталога
-   `mkdir(path, options)` — создать каталог (поддерживает `{ recursive: true }`)
-   `rm(path, options)` — удалить файлы или каталоги (поддерживает `{ recursive: true, force: true }`)
-   `rename(oldPath, newPath)` — переименовать или переместить
-   `copyFile(src, dest, mode)` — копировать файл
-   `cp(src, dest, options)` — рекурсивное копирование файлов или каталогов (добавлено в v16.7)
-   `unlink(path)` — удалить файл
-   `symlink(target, path, type)` — создать символическую ссылку
-   `link(existingPath, newPath)` — создать жёсткую ссылку
-   `chmod(path, mode)` — изменить права
-   `chown(path, uid, gid)` — изменить владельца
-   `utimes(path, atime, mtime)` — установить метки времени
-   `mkdtemp(prefix, options)` — уникальный временный каталог
-   `realpath(path, options)` — разрешить симлинки
-   `access(path, mode)` — проверить доступность
-   `truncate(path, len)` — усечь файл

Каждая возвращает Promise: при успехе — результат, при ошибке — reject. Единообразие — суть: можно строить цепочки, параллелить через `Promise.all()` и обрабатывать ошибки в одном месте.

### Сравнение двух API

Callback `fs.readFile` и promise-based `readFile` из `node:fs/promises` вызывают один и тот же C++ binding. Оба доходят до `uv_fs_read` в libuv. Оба отправляют работу в thread pool одинаково. Системный вызов ядра идентичен.

```
import { readFile } from 'node:fs/promises';

const data = await readFile('/tmp/config.json', 'utf8');
const config = JSON.parse(data);
```

Сравните с callback-формой:

```
import fs from 'node:fs';

fs.readFile('/tmp/config.json', 'utf8', (err, data) => {
  if (err) throw err;
  const config = JSON.parse(data);
});
```

Та же операция. Та же производительность на уровне syscall. Promise-версия добавляет одну microtask на resolution — это ничтожно по сравнению с реальным дисковым I/O. Нужны десятки тысяч крошечных файловых операций в плотном цикле, прежде чем overhead станет заметен — и тогда лучше батчить через `Promise.all()`, а не откатываться к callbacks.

Реальная разница — в структуре кода. Последовательные операции с callbacks вкладываются. С promises остаются линейными:

```
const configText = await readFile('config.json', 'utf8');
const config = JSON.parse(configText);
const data = await readFile(config.dataPath, 'utf8');
processData(data);
```

Четыре строки. Сверху вниз. Любая бросает — попадает в ближайший `catch`. Без вложенности, без ручных `if (err)` на каждом шаге.

### Паттерны обработки ошибок

Основной паттерн — блок `try`/`catch`:

```
try {
  const data = await readFile(path, 'utf8');
  return JSON.parse(data);
} catch (err) {
  if (err.code === 'ENOENT') return null;
  throw err;
}
```

Смотрите на `err.code`, чтобы решить, что делать. `ENOENT` — файла нет; возможно, это нормально, и можно вернуть fallback. Всё остальное — пробрасывайте. Те же объекты ошибок, что в callbacks: те же свойства `code` и `syscall`. Обработка просто переезжает в `catch` вместо веток `if (err)`.

Один паттерн создаёт проблемы: случайное проглатывание ошибок.

```
const data = await readFile(path, 'utf8').catch(() => null);
```

Выглядит аккуратно. Но ловит _любую_ ошибку — отказ в доступе, сбой I/O, битый путь — и молча возвращает `null`. Если используете `.catch()` inline, будьте конкретны, какие ошибки допустимы. Иначе — `try`/`catch` и явная логика.

!!!note ""

    Забытый `await` у promise, который reject'ится, превращается в unhandled rejection. В Node v15+ по умолчанию такие rejection завершают процесс. Всегда `await` для fs на promises или хотя бы `.catch()`.

Ещё одна ловушка:

```
async function cleanup() {
  readFile('/tmp/data.txt'); // без await — ошибка станет unhandled rejection
}
```

### fs.promises.constants

Объект `constants` на `fs.promises` зеркалит `fs.constants`. Флаги прав, режимы доступа к файлу, флаги копирования — всё на месте:

```
import { access, constants } from 'node:fs/promises';

await access('/tmp/data.txt', constants.R_OK | constants.W_OK);
```

Побитовое OR объединяет несколько проверок. `R_OK` — чтение, `W_OK` — запись. Если файл не проходит любую проверку, promise reject'ится с `EACCES`.

Эти константы чаще всего нужны с `access()`, `copyFile()` и `open()`. Для `open()` обычно передают строковые флаги вроде `'r'` или `'w'` вместо числовых констант, но они мапятся на те же значения.

!!!note ""

    `access()` проверяет права в момент вызова, но до фактического `open()` права могут измениться — race между проверкой и открытием. Для большинства случаев лучше просто `open()` в `try`/`catch` и обработать ошибку. `access()` как предварительная проверка уместен, когда нужно сообщить о правах без попытки операции — UI файлового браузера или валидация конфига перед долгим процессом.

### Операции с каталогами

Несколько функций для каталогов заслуживают внимания: у них есть опции, существенно меняющие поведение.

`mkdir` с `{ recursive: true }` создаёт весь путь, включая промежуточные каталоги:

```
await mkdir('/tmp/a/b/c/d', { recursive: true });
```

Нет ошибки, если путь уже существует. Без `recursive` создание `/tmp/a/b/c/d` упадёт, если `/tmp/a/b/c` ещё нет. Возвращается первый каталог, который реально создали, или `undefined`, если ничего создавать не пришлось.

`readdir` с `{ withFileTypes: true }` возвращает объекты `Dirent` вместо строк:

```
const entries = await readdir('/tmp', { withFileTypes: true });
for (const entry of entries) {
  console.log(entry.name, entry.isFile(), entry.isDirectory());
}
```

У каждого `Dirent` есть `isFile()`, `isDirectory()`, `isSymbolicLink()`. Тип файла без отдельного `stat()` на каждую запись. Для каталогов с тысячами файлов это экономит тысячи syscall.

Опция `{ recursive: true }` у `readdir` (добавлена в v20.1.0, backport в v18.17) обходит всё дерево каталогов:

```
const allFiles = await readdir('/project/src', { recursive: true });
```

Возвращает каждый файл и подкаталог с путями относительно стартового. Удобно, но осторожно с большими деревьями — весь список загружается в память сразу.

`rm` с `{ recursive: true, force: true }` — promise-аналог `rm -rf`:

```
await rm('/tmp/build-output', { recursive: true, force: true });
```

`force: true` подавляет ошибку, если пути нет. Без неё удаление несуществующего пути бросает `ENOENT`.

## Объект FileHandle

Вызов `fs.promises.open()` даёт FileHandle. В отличие от `fs.open()` из callback API, который в callback отдаёт сырой целочисленный fd, `open()` из promises возвращает объект-обёртку с методами.

```
import { open } from 'node:fs/promises';

const fh = await open('/tmp/data.txt', 'r');
console.log(fh.fd); // сырой integer, например 21
```

Свойство `fd` есть, если нужно — передать в native addon или старый callback-код, ожидающий число. Но чаще вызывают методы прямо на FileHandle.

### Методы FileHandle

Что даёт FileHandle:

**Чтение и запись:**

-   `fh.read(buffer, offset, length, position)` — низкоуровневое чтение байтов в buffer
-   `fh.write(buffer, offset, length, position)` — низкоуровневая запись из buffer
-   `fh.readFile(options)` — прочитать весь файл с текущей позиции
-   `fh.writeFile(data, options)` — перезаписать содержимое
-   `fh.appendFile(data, options)` — дописать данные

**Метаданные и управление:**

-   `fh.stat(options)` — размер, метки времени, права
-   `fh.truncate(len)` — усечь или расширить файл до `len` байт
-   `fh.chmod(mode)` — изменить права
-   `fh.chown(uid, gid)` — изменить владельца
-   `fh.utimes(atime, mtime)` — обновить atime/mtime

**Надёжность на диск:**

-   `fh.sync()` — сбросить данные и метаданные на диск (fsync)
-   `fh.datasync()` — только данные, без метаданных (fdatasync)

**Векторный I/O:**

-   `fh.readv(buffers, position)` — scatter read в несколько буферов
-   `fh.writev(buffers, position)` — gather write из нескольких буферов

**Streams:**

-   `fh.createReadStream(options)` — readable stream с этого файла
-   `fh.createWriteStream(options)` — writable stream в этот файл

**Жизненный цикл:**

-   `fh.close()` — закрыть underlying fd
-   `fh[Symbol.asyncDispose]()` — автоматическое закрытие (для `await using`)

Каждый метод возвращает Promise. Каждый — с `await`.

### Чтение байтов

Низкоуровневый `fh.read()` работает напрямую с буферами:

```
const fh = await open('/tmp/data.bin', 'r');
const buf = Buffer.alloc(64);
const { bytesRead, buffer } = await fh.read(buf, 0, 64, 0);
console.log(bytesRead, buffer.subarray(0, bytesRead));
await fh.close();
```

Возвращается объект с `bytesRead` (сколько реально прочитано — может быть меньше 64, если файл меньше) и `buffer` (ссылка на переданный буфер). `position` — смещение в файле. `null` — читать с текущей позиции.

Проще перегрузка, если нужны только данные:

```
const fh = await open('/tmp/data.bin', 'r');
const { bytesRead, buffer } = await fh.read({ buffer: Buffer.alloc(64) });
await fh.close();
```

Объектная форма позволяет не указывать позиционные аргументы. `offset` по умолчанию 0, `length` — длина буфера, `position` — `null` (текущая позиция).

### Запись байтов

`fh.write()` зеркалит `fh.read()`:

```
const fh = await open('/tmp/out.bin', 'w');
const data = Buffer.from('hello, file');
const { bytesWritten } = await fh.write(data, 0, data.length, 0);
await fh.close();
```

Можно писать строки напрямую:

```
const fh = await open('/tmp/out.txt', 'w');
const { bytesWritten } = await fh.write('some text', null, 'utf8');
await fh.close();
```

Для строки второй аргумент — position (или `null` для текущей), третий — encoding.

### readFile и writeFile на FileHandle

Иногда файл открывают с целью — проверить stat, условно прочитать, сделать несколько операций — и посередине нужно прочитать всё целиком. У FileHandle есть `readFile` и `writeFile`:

```
const fh = await open('package.json', 'r');
const stats = await fh.stat();
if (stats.size > 10_000_000) throw new Error('too large');
const content = await fh.readFile('utf8');
await fh.close();
```

Открыли файл, проверили размер, только потом читаем содержимое. Один `open`. Один fd. Альтернатива — отдельные `stat()` и `readFile()` из корневого namespace — открыла бы файл дважды.

`fh.writeFile()` полностью заменяет содержимое:

```
const fh = await open('/tmp/state.json', 'w');
await fh.writeFile(JSON.stringify({ count: 42 }));
await fh.close();
```

### FileHandle как async iterable

FileHandle реализует async iterable protocol. Можно итерировать строки файла:

```
const fh = await open('/tmp/log.txt', 'r');
for await (const line of fh.readLines()) {
  process.stdout.write(line + '\n');
}
await fh.close();
```

`readLines()` возвращает async iterable по одной строке, внутри используя readline. Память постоянна при любом размере файла — читает chunk'и и режет по границам строк.

Можно использовать FileHandle с `createReadStream`:

```
const fh = await open('/tmp/data.csv', 'r');
const stream = fh.createReadStream({ encoding: 'utf8' });
for await (const chunk of stream) {
  processChunk(chunk);
}
```

Stream привязан к fd FileHandle. Когда stream закончился, fd остаётся открытым — FileHandle всё ещё нужно закрыть. Или `await using` — и можно не думать.

### stat, truncate и datasync

Менее очевидные методы:

`fh.stat()` возвращает тот же `Stats`, что и корневой `stat()`, но по уже открытому fd. Без повторного разрешения пути и лишнего open/close. Полезно, когда после открытия нужно принять решение по метаданным до read/write.

`fh.truncate(len)` задаёт размер файла. Если `len` меньше текущего — файл укорачивается, хвост пропадает. Если больше — растёт, новые байты нули (разреженная «дыра» на поддерживающих ФС). Нужно при перезаписи, когда новые данные короче старых — без truncate останется хвост старого содержимого.

```
await using fh = await open('/tmp/data.txt', 'r+');
await fh.writeFile('short');
await fh.truncate(5);
```

`fh.datasync()` и `fh.sync()` сбрасывают буферизованные данные на диск. Разница: `sync()` — данные _и_ метаданные файла (размер, метки, права). `datasync()` — только данные. На Linux `datasync()` — syscall `fdatasync`, быстрее: обновление метаданных — лишняя запись inode. Если важны только байты на диске, а не согласованность метаданных — `datasync()`.

## Обязанность close()

Когда вы `open()` и получаете FileHandle, вы владеете file descriptor до `close()`. Забыли закрыть — утечка дескриптора. Достаточно таких утечек — лимит fd на процесс, EMFILE (разобрано в предыдущей главе) для всего: открытие файлов, сокеты, pipe.

Базовый паттерн:

```
const fh = await open(path, 'r');
try {
  const data = await fh.readFile('utf8');
  return JSON.parse(data);
} finally {
  await fh.close();
}
```

`finally` выполняется и при успехе, и при throw. fd закрывается в любом случае. Между `try` и `finally` можно добавить `catch` для специфичной обработки, но для очистки важен `finally`.

Нюанс: если сам `open()` упал, `fh` не присвоен. Блок `try`/`finally` не выполняется. Закрывать нечего. Ошибка уходит наверх как обычно.

Несколько FileHandle:

```
const src = await open(srcPath, 'r');
try {
  const dest = await open(destPath, 'w');
  try {
    const data = await src.readFile();
    await dest.writeFile(data);
  } finally {
    await dest.close();
  }
} finally {
  await src.close();
}
```

Вложенные `try`/`finally`. Многословно. У каждого ресурса свой cleanup. С тремя–четырьмя handle хуже. `await using` как раз для случая, когда этот паттерн не масштабируется.

### Что будет, если не закрыть

Node отслеживает незакрытые FileHandle. Если FileHandle стал недостижим без `close()` — собрался GC при открытом fd — Node закроет underlying fd и выведет предупреждение:

```
(node:12345) Warning: Closing file descriptor 21 on garbage collection
```

В предупреждении номер fd. Полезно для отладки, но на это полагаться нельзя. Момент GC непредсказуем. V8 может не собирать секунды и минуты — в это окно fd открыт и считается в лимит процесса.

Механизм — `FinalizationRegistry`. При создании FileHandle Node регистрирует его с callback FinalizationRegistry. Если GC забрал JS-объект FileHandle до `close()`, срабатывает registry и Node закрывает fd. Подробнее — в разделе про internals ниже.

## await using

Предложение TC39 Explicit Resource Management попало в V8 и доступно в Node.js v22 без флагов. FileHandle реализует `Symbol.asyncDispose`, значит `await using` работает из коробки:

```
async function readConfig(path) {
  await using fh = await open(path, 'r');
  return JSON.parse(await fh.readFile('utf8'));
}
```

При выходе из области видимости функции — нормальном return или throw — runtime вызывает `fh[Symbol.asyncDispose]()`, то есть `fh.close()`. Без `try`/`finally`. Без забытых close. Язык берёт очистку на себя.

Несколько handle? Каждый закрывается в обратном порядке объявления:

```
async function copyFile(src, dest) {
  await using srcFh = await open(src, 'r');
  await using destFh = await open(dest, 'w');
  await destFh.writeFile(await srcFh.readFile());
}
```

При выходе сначала `destFh`, потом `srcFh`. Обратный порядок, как у стека ресурсов. Сравните с вложенными `try`/`finally` выше — то же поведение, доля кода.

### Как работает Symbol.asyncDispose

При `await using x = expr` runtime:

1.  Вычисляет `expr` и присваивает `x`.
2.  Проверяет `[Symbol.asyncDispose]` (или `[Symbol.dispose]` для синхронного `using`).
3.  Регистрирует `x` в стеке disposal для текущего блока.
4.  При выходе из блока обходит стек в обратном порядке, вызывая `await x[Symbol.asyncDispose]()`.

Реализация у FileHandle минимальна:

```
[Symbol.asyncDispose]() {
  return this.close();
}
```

Просто `close()`. Поведение очистки даёт синтаксис, не метод. `await using` вызывает это при выходе из scope. Ошибка при disposal оборачивается в `SuppressedError`, если блок уже бросал — сохраняются и исходная ошибка, и ошибка disposal.

### await using vs try/finally

Используйте `await using`, когда:

-   открываете файл, делаете работу, нужна гарантированная очистка;
-   несколько ресурсов с предсказуемым порядком;
-   код должен явно показывать владение ресурсом.

Возвращайтесь к `try`/`finally`, когда:

-   в cleanup нужна своя логика (логи, метрики, условное закрытие);
-   ошибки close обрабатываете иначе, чем ошибки операций;
-   код должен работать на старых версиях Node.

Для нового кода под Node v22+ `await using` — разумный default. Короче, сложнее ошибиться, яснее намерение.

## Удобные функции vs FileHandle

У `fs.promises` два уровня API. Удобные функции — `readFile`, `writeFile`, `stat`, `mkdir` и т.д. — работают с путями: открыть, операция, закрыть, вернуть результат. Один вызов, одна операция, очистка встроена.

```
const data = await readFile('/tmp/config.json', 'utf8');
```

Операции FileHandle идут через `open()`: handle, методы, close по завершении. Больше кода, больше контроля.

Когда что?

**Удобные функции** — разовые операции: прочитать конфиг, записать результат, проверить путь. Жизненный цикл open/close скрыт.

**FileHandle** — несколько операций над одним файлом: прочитать заголовок, seek, записать; stat и условное чтение; держать файл открытым через async-границы — батчи, дописывание во времени.

Есть и производительность. stat и затем read через удобные функции — два open:

```
const stats = await stat(path);
const data = await readFile(path, 'utf8');
```

Два `open()`, два `close()` под капотом. С FileHandle:

```
await using fh = await open(path, 'r');
const stats = await fh.stat();
const data = await fh.readFile('utf8');
```

Один `open()`, один `close()`. Вдвое меньше syscall. На одном файле — микросекунды. На тысячах в batch job — заметно.

## Параллельные файловые операции

Независимые операции можно перекрывать. `Promise.all()` запускает всё сразу:

```
const [configText, schemaText, dataText] = await Promise.all([
  readFile('config.json', 'utf8'),
  readFile('schema.json', 'utf8'),
  readFile('data.json', 'utf8'),
]);
```

Три чтения в thread pool одновременно. `await` завершится, когда все три готовы. Любой reject — `Promise.all` reject с этой ошибкой, остальные результаты отбрасываются.

Когда нужны все результаты независимо от отдельных сбоев:

```
const results = await Promise.allSettled([
  readFile('a.json', 'utf8'),
  readFile('b.json', 'utf8'),
  readFile('maybe-missing.json', 'utf8'),
]);
```

У каждого элемента `status` `'fulfilled'` или `'rejected'`, с `value` или `reason`. Обрабатываете успехи и провалы по отдельности.

### Когда параллельность вредит

Параллельный file I/O не всегда быстрее. Thread pool конечен (по умолчанию 4 worker'а). 200 одновременных чтений — одновременно 4, остальные в очереди. Файлы на одном диске — head thrashing на HDD или перегрузка контроллера на SSD.

Для больших батчей лучше ограниченная concurrency:

```
async function readBatch(paths, concurrency = 8) {
  const results = [];
  for (let i = 0; i < paths.length; i += concurrency) {
    const batch = paths.slice(i, i + concurrency);
    const data = await Promise.all(batch.map(p => readFile(p, 'utf8')));
    results.push(...data);
  }
  return results;
}
```

Обрабатываете `concurrency` файлов, ждёте батч, следующий. Контролируете число in-flight операций — меньше голодания thread pool и давления на I/O.

### Смешение последовательного и параллельного

Реальные сценарии комбинируют оба паттерна. Сначала конфиг (последовательно — от него зависит дальнейшее), потом батч данных (параллельно — независимы), потом summary (последовательно — зависит от всех результатов):

```
const config = JSON.parse(await readFile('config.json', 'utf8'));
const datasets = await Promise.all(
  config.files.map(f => readFile(f, 'utf8'))
);
const summary = buildSummary(datasets);
await writeFile('summary.json', JSON.stringify(summary));
```

Структура отражает зависимости данных. Последовательно, где must; параллельно, где can. Thread pool перекрывает работу, код читается сверху вниз.

!!!note ""

    `Promise.all` и запись в _один_ файл из нескольких promise — гонка. `writeFile` не атомарен: два concurrent write в один path могут перемешаться и испортить файл. Параллелите запись только в _разные_ файлы.

## Миграция с callbacks на promises

Если код уже на callback-based `fs`, переход механический. Паттерн одинаков для каждой функции.

**Было:**

```
fs.readFile(path, 'utf8', (err, data) => {
  if (err) return handleError(err);
  doSomething(data);
});
```

**Стало:**

```
try {
  const data = await readFile(path, 'utf8');
  doSomething(data);
} catch (err) {
  handleError(err);
}
```

Маппинг: параметры callback → присваивания с `await`. Ветки `if (err)` → `catch`. Вложенные callbacks → линейные `await`.

### Обёртка legacy-кода

Для сторонних библиотек или своих callback-функций — `util.promisify`:

```
import { promisify } from 'node:util';
import { stat } from 'node:fs';

const statAsync = promisify(stat);
const info = await statAsync('/tmp/data.txt');
```

Для самого `fs` не нужно — есть `node:fs/promises`. Для старых модулей и своих callback API `promisify` — мост.

Обратное направление — promise из callback-вызывающего кода:

```
function legacyReadConfig(path, callback) {
  readFile(path, 'utf8')
    .then(data => callback(null, JSON.parse(data)))
    .catch(err => callback(err));
}
```

Оба направления работают. Смешивайте при миграции. Новый код — promises; старый рефакторите по мере касания.

### Ловушки миграции

**Забытый await.** `async` функция вызывает `writeFile()` без `await` — возвращается сразу, запись идёт в фоне. Следующая строка может упасть, если файл ещё не записан.

**Двойная обработка ошибок.** `try`/`catch` и `.catch()` на одном вызове — одно лишнее, взаимодействие путает. Один стиль на call site.

**Unhandled rejection при fire-and-forget.** Вызов async без await и без `.catch()` — reject никуда. Node v15+ считает это фатальным. Намеренный fire-and-forget — `.catch()`:

```
writeFile('/tmp/log.txt', logData).catch(console.error);
```

**Смешение sync и promise в одной функции.** `fs.existsSync()` перед `await readFile()` работает, но бьёт по смыслу: sync блокирует event loop. В async-функции держите всё async:

```
try {
  await access(path);
} catch {
  // файла нет — обработать
}
```

Или просто попытка операции и обработка ошибки вместо предварительной проверки.

**Коды ошибок.** Объекты ошибок `fs.promises` идентичны callback: тот же `code` (`ENOENT`, `EACCES`, `EISDIR` и т.д.), `syscall`, `path`. Логика из `if (err)` переносится в `catch` без изменений.

## Как fs.promises оборачивает libuv

И callback, и promise API приходят в одно место: `uv_fs_*` в libuv. Разница — в JavaScript-обвязке между вашим кодом и C++.

Путь callback API — через `lib/fs.js`. `fs.readFile(path, cb)` создаёт `FSReqCallback` — C++-обёртку с JS callback. Вызывается `uv_fs_read()` с этим request. libuv завершает в worker thread pool, сигналит event loop, C++ completion вызывает ваш callback с ошибкой или результатом.

Путь promise API — `lib/internal/fs/promises.js`. Тот же libuv, другая обёртка: `FSReqPromise` с persistent ссылкой на V8 Promise Resolver. По завершении C++ вызывает `resolver->Resolve(result)` или `resolver->Reject(error)`. Значение приходит в `await` через microtask queue.

Код в `lib/internal/fs/promises.js` прямолинеен. Упрощённо, как внутри работает `readFile`:

```
function readFile(path, options) {
  const req = new FSReqPromise();
  binding.read(fd, buffer, offset, length, position, req);
  return req.promise;
}
```

У `FSReqPromise` есть `.promise` — настоящий `Promise`, resolve/reject захвачены при создании. `binding.read()` уходит в libuv. По завершении C++ резолвит promise. Промежуточный слой не трогает JS-поток до resolution.

### Internals FileHandle

Класс `FileHandle` в `lib/internal/fs/promises.js` — JS-класс с fd и методами. Каждый метод создаёт `FSReqPromise`, диспатчит операцию, возвращает promise.

Дополнительное состояние: закрыт ли handle. Вызов метода на закрытом handle — `ERR_USE_AFTER_CLOSE`. После close `fd` — `-1`. FileHandle ref-counted: C++ handle держит event loop живым, пока открыт. Незакрытый FileHandle мешает чистому выходу процесса, как таймер или серверный сокет.

`fh.close()` уменьшает ref count, отправляет `uv_fs_close` в thread pool, возвращает Promise по фактическому закрытию дескриптора ядром. FileHandle помечает себя закрытым сразу — методы больше нельзя, хотя close ещё не завершён.

### Страховочная сетка FinalizationRegistry

Каждый FileHandle из `open()` регистрируется в `FinalizationRegistry`. Упрощённо из исходников Node:

```
const kCloseResolve = Symbol('kCloseResolve');
const kFd = Symbol('kFd');

const registry = new FinalizationRegistry((ref) => {
  // ref содержит сырой fd
  if (ref.fd !== -1) {
    process.emitWarning(
      `Closing file descriptor ${ref.fd} on garbage collection`
    );
    // Node делает асинхронный background close (uv_fs_close),
    // а не блокирующий closeSync, чтобы не стопорить event loop.
    internalBackgroundClose(ref.fd);
  }
});
```

В конструкторе FileHandle: `registry.register(this, { fd: this[kFd] })`. Слабая ссылка: если FileHandle собрали GC, callback finalization получает held value с номером fd.

Сетка ограничена. Callback FinalizationRegistry — microtask после GC, но момент GC недетерминирован. fd может оставаться открытым секунды, минуты или весь жизненный цикл процесса без давления на heap.

Нюанс: held value (`{ fd }`) не должно ссылаться на сам FileHandle — иначе FileHandle никогда не станет unreachable, registry удержит его, смысл теряется. Node хранит только сырой integer fd.

Предупреждение намеренное. Node сигнализирует: вы забыли close. В production это баг.

### C++ класс FSReqPromise

В `src/node_file.cc` `FSReqPromise` наследует `FSReqBase`, держит persistent ссылку на V8 Promise Resolver. В completion handler libuv:

1.  Из request извлекается `FSReqPromise`.
2.  При ошибке libuv — JS error с кодом (`ENOENT`, `EACCES`…) и `resolver->Reject()`.
3.  При успехе — marshal результата (bytes read, stat structure…) и `resolver->Resolve()`.

На шаге marshal promise и callback расходятся чуть: callback вызывает вашу функцию синхронно на потоке event loop; promise — `resolver->Resolve()`, microtask, `await` на следующем checkpoint. Одна microtask на операцию — источник (пренебрежимого) overhead.

`FSReqPromise` и `FSReqCallback` делят `FSReqBase` — dispatch в libuv идентичен. Promise-вариант меняет только completion: resolve/reject вместо JS callback. Разницу заметят бенчмарки на миллионах операций — и то слабо.

## FileHandle и streams

FileHandle создаёт streams, привязанные к его fd:

```
await using fh = await open('/tmp/large-file.csv', 'r');
const stream = fh.createReadStream({ encoding: 'utf8' });
```

Stream читает с дескриптора handle. Stream не владеет fd. Закрытие stream не закрывает FileHandle. Нужно управлять обоими жизненными циклами. С `await using` handle закроется при выходе из scope — убедитесь, что stream уже дочитал.

Безопасный паттерн с `pipeline()`:

```
import { pipeline } from 'node:stream/promises';

await using fh = await open('input.csv', 'r');
const readable = fh.createReadStream();
await pipeline(readable, transformStream, outputStream);
```

`await pipeline(...)` завершится, когда данные прошли. Потом `fh` закроется через `await using`. Порядок верный: pipeline кончился до выхода из scope.

Для writable:

```
await using fh = await open('output.log', 'a');
const writable = fh.createWriteStream();
writable.write('entry 1\n');
writable.write('entry 2\n');
writable.end();
```

`writable.end()` сигнализирует конец. fd остаётся открытым до close FileHandle. `autoClose` у `createWriteStream` по умолчанию `true` и для path, и для FileHandle. При `autoClose: true` fd закрывается на `'error'` или `'finish'` — это может инвалидировать FileHandle. Если lifecycle handle ведёте через `await using` или `try`/`finally`, явно `autoClose: false`.

## Какой API выбрать

Три варианта: синхронный `fs.*Sync`, callback `fs.*`, promise `fs.promises.*`.

**Sync** — стартовый код, CLI, build-скрипты. Где event loop не важен. Просто, без сложности с ошибками, блокирует поток.

**Callbacks** — legacy на callbacks. Горячие пути, где замерили overhead microtask (редко). Библиотеки, ожидающие callbacks.

**Promises** — всё остальное. Новый прикладной код, server handlers, middleware, batch, всё с `async`/`await`. Default для современного Node.js.

Экосистема ушла в promises и `async`/`await`. HTTP-фреймворки, драйверы БД, очереди — promises. Файловые операции должны совпадать. Callbacks в promise-кодовой базе — трение, разная обработка ошибок, путаница для новых разработчиков.

По производительности: overhead promises над callbacks — одна microtask на операцию. File I/O — миллисекунды. Microtask — микросекунды. Математика ясна. Promises, пока профайлер не покажет иное — и тогда ответ скорее «батчить через `Promise.all`», чем «вернуться к callbacks».

!!!note ""

    Новые возможности в релизах Node чаще сначала появляются в `fs.promises`: `cp()`, `readdir` с `{ recursive: true }`, `glob()` (v22). Callback API их тоже получает, но импульс явно на стороне promises. Callbacks — дольше ждать фич и читать доки, всё чаще предполагающие promise API.

`glob()` ещё достаточно нов; многие проекты тянут `fast-glob` или `globby`:

```
import { glob } from 'node:fs/promises';

for await (const tsFile of glob('**/*.ts', { cwd: '/project/src' })) {
  console.log(tsFile);
}
```

Async iterable совпадающих путей. Итерация `for await...of` или массив через `Array.fromAsync()`. Встроено в Node, без зависимости. `*` — любые символы кроме разделителей пути, `**` — любое число каталогов. Для tooling и build-систем, раньше тянувших сторонние glob-пакеты, это заметный шаг.

## Связанное чтение

-   Предыдущая: [Файловый I/O Node.js: fs.readFile, fs.writeFile, streams и fsync](./reading-writing-files.md)
-   Далее: [fs.watch в Node.js: слежение за файлами, атомарная запись и OS watchers](./watching-atomic-writes.md)
