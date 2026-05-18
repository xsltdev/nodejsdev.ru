---
description: Стандартный ввод-вывод Node.js — stdin, stdout, stderr, TTY, backpressure и конвейеры
---

# Стандартный ввод-вывод Node.js: stdin, stdout и backpressure

Источник: [theNodeBook — Node.js Standard I/O](https://www.thenodebook.com/process-os/standard-io)

Node.js стартует с тремя стандартными потоками ввода-вывода. На уровне runtime они сопоставлены с файловыми дескрипторами: `process.stdin` читает из дескриптора 0, `process.stdout` пишет в дескриптор 1, `process.stderr` — в дескриптор 2. Эти потоки могут указывать на терминал, pipe, файл, сокет или унаследованный дескриптор. Определение TTY меняет поведение.

## stdin, stdout и stderr в Node.js

Стандартный вывод несёт данные программы. Стандартный поток ошибок — диагностику. Разделение позволяет shell-конвейерам обрабатывать данные, пока логи остаются видимыми. Backpressure по-прежнему важен: выходные потоки могут буферизовать данные, когда приёмник не успевает принимать записи с той же скоростью.

Каждый Unix-процесс стартует с тремя открытыми файловыми дескрипторами. fd 0 — стандартный ввод. fd 1 — стандартный вывод. fd 2 — стандартный поток ошибок. Node накладывает поверх них объекты stream: `process.stdin`, `process.stdout` и `process.stderr`. Имена свойств одни и те же. За ними — разный backing handle в зависимости от того, что shell подключил до старта Node.

Неудобная часть скрыта под привычным API. `.write()`, `.on('data')` и `.pipe()` выглядят обычно. Затем Node переключается между синхронными и асинхронными записями, буферизацией, режимом терминала, файла и pipe — в зависимости от состояния fd, которое ваш скрипт унаследовал. Путь выполнения уже выбран до первого `import`.

## Три потока

`process.stdin` — Readable stream (см. [Readable streams](../streams/readable-streams.md)). `process.stdout` и `process.stderr` — Writable streams. Они сопоставлены со стандартными файловыми дескрипторами (см. [Файловые дескрипторы и handles](../file-system/file-descriptors-and-handles.md)), которые родительский процесс передаёт в Node.

У стандартных потоков есть дополнительные правила runtime. Readable из `fs.createReadStream()` ведёт себя как файловый stream. Writable сокета — как сокетный. Стандартные потоки смотрят на fd 0, fd 1 и fd 2 и выбирают обработку TTY, pipe или файла. Они могут блокироваться. Могут буферизовать. Могут потерять буферизованные данные, если `process.exit()` обрывает процесс.

```js
process.stdout.write('hello');
process.stderr.write('debug info');
```

Оба вызова пишут строку в Writable stream. stdout несёт данные программы. stderr — диагностику. При `node app.js | grep foo` в pipe попадает только stdout. stderr по-прежнему идёт в терминал, пока shell не перенаправит и fd 2. Так машиночитаемый вывод отделяется от предупреждений, stack trace, строк прогресса и отладочного шума.

Отсюда же много этикета CLI. Команда, печатающая JSON, должна класть на stdout только JSON. Тайминги, сообщения о пропущенных файлах, предупреждения парсера и progress bar — на stderr. Тогда вызов `node tool.js > data.json` даёт чистый файл, а терминал всё ещё показывает диагностику, потому что fd 2 остался подключён к терминалу.

Собственные экземпляры `Console` могут писать куда угодно. Вернёмся к этому после разбора механики stream.

## process.stdin

`process.stdin` стартует в paused mode (см. [Readable streams](../streams/readable-streams.md)). Ничего не течёт, пока код не повесит listener, не вызовет `resume()` или не сделает `pipe()`. После начала чтения stdin держит ref на event loop (см. [Event loop](../node-arch/event-loop-intro.md)), поэтому процесс жив, пока активен ввод.

Минимальный пример выглядит скучно:

```js
process.stdin.on('data', (chunk) => {
    console.log(`Got: ${chunk}`);
});
```

Событие `data` отдаёт чанки `Buffer`. Ввод с терминала обычно приходит по строке: драйвер терминала буферизует до Enter. У piped-ввода границы чанков свободнее. `echo "hello" | node script.js` может дать один чанк, крупный producer — много. Границы чанков — деталь реализации, парсер должен трактовать их как произвольные диапазоны байт.

Эта фраза отсекает целый класс багов. JSONL-парсер не может считать «один чанк = одна строка». Парсер протокола не может считать «один чанк = одно сообщение». stdin — всё ещё stream, и действует обычное правило: накапливать до полной единицы, затем парсить её.

Форма с async iterator использует тот же stream:

```js
for await (const chunk of process.stdin) {
    console.log(`Got: ${chunk}`);
}
```

Меньше обвязки. Те же байты. Цикл завершается, когда stdin заканчивается: Ctrl+D на Unix, Ctrl+Z на Windows или EOF от piped-источника.

По умолчанию чанки — сырые байты. `chunk.toString()` даёт текст, потому что `Buffer.prototype.toString()` по умолчанию использует `utf8`. Бинарным утилитам лучше оставить `Buffer`. Текстовым — вызвать `process.stdin.setEncoding('utf8')`, тогда события `data` отдают строки напрямую.

### Построчно с readline

Интерактивным CLI обычно нужны целые строки, а не сырые чанки. Модуль readline (см. [Файловая система](../file-system/reading-writing-files.md)) делает буферизацию:

```js
import { createInterface } from 'node:readline';

const rl = createInterface({ input: process.stdin });
rl.on('line', (line) => {
    console.log(`You said: ${line}`);
});
```

Интерфейс буферизует байты, декодирует текст и режет по границам строк (`\n` или `\r\n`). С TTY он ещё согласуется с редактированием в терминале: Backspace, стрелки, история. С pipe — просто делит ввод на строки. Pipe несёт байты. Дисциплина строк терминала даёт поведение редактирования.

Есть и promise API:

```js
import { createInterface } from 'node:readline/promises';

const rl = createInterface({ input: process.stdin });
const answer = await rl.question('Your name? ');
console.log(`Hello, ${answer}`);
rl.close();
```

`rl.question()` пишет prompt в stdout, ждёт одну строку и резолвит строку. `rl.close()` снимает ref readline с stdin, и процесс может завершиться, когда остальная работа закончена.

### Raw mode

TTY-stdin можно перевести в raw mode:

```js
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', (key) => {
    if (key[0] === 3) process.exit(); // Ctrl+C
    process.stdout.write(key);
});
```

Raw mode отдаёт нажатия сразу. Терминал перестаёт буферизовать по строкам. Программа получает байты и сама решает, эхоировать ли что-то. Ctrl+C приходит как `0x03`, а не как SIGINT — поведение задаёт обработчик. Пароли, меню, управление REPL и редакторский ввод зависят от этого режима.

`setRawMode()` требует `process.stdin.isTTY === true`. У piped stdin нет режима терминала — вызов бросит исключение.

Многобайтовые клавиши приходят многобайтовыми буферами. Стрелка вверх — `\x1b[A`, вниз — `\x1b[B`, вправо — `\x1b[C`, влево — `\x1b[D`. Код получает `Buffer` на 3 байта. Библиотеки вроде `keypress` и внутренний разбор клавиш readline декодируют ANSI-последовательности. Raw-утилитам со стрелками нужен такой парсер.

Raw mode меняет требования к очистке терминала. Если программа включила raw mode и упала, не восстановив исходный режим, терминал пользователя может остаться в странном состоянии: без построчной буферизации, без видимого эхо, Ctrl+C как байт. Аккуратные TTY-программы восстанавливают cooked mode в `finally` и обработчиках сигналов. Node восстанавливает исходный режим TTY при нормальном shutdown, но `process.exit()` из произвольных мест усложняет рассуждения об очистке.

stdin держит ref на event loop. Повесьте `data` — процесс не завершится. Для интерактивных программ это правильно. Некоторым утилитам нужен опциональный ввод с клавиатуры, пока идёт основная работа — им лучше позволить выходу по завершении основной задачи.

```js
process.stdin.resume();
process.stdin.unref();
```

После `unref()` (см. [Event loop](../node-arch/event-loop-intro.md)) stdin всё ещё слушает, но не удерживает event loop. Процесс завершается, когда закончится вся остальная ref'd работа. Позже можно вызвать `process.stdin.ref()`, если снова нужен интерактивный prompt.

Dev-утилиты часто так и делают: старт с unref'd stdin, ref при входе в интерактивный отладочный режим. Неинтерактивные запуски завершаются как обычно.

## process.stdout

`process.stdout` — Writable stream. В него пишут `console.log()` и `process.stdout.write()`.

```js
console.log('hello'); // пишет "hello\n"
process.stdout.write('hello'); // пишет "hello" (без перевода строки)
```

`console.log()` вызывает `util.format()` для аргументов, добавляет `\n` и пишет в `process.stdout`. `process.stdout.write()` пишет переданные байты как есть. Для prompt, progress bar, TUI и точного контроля переводов строк — прямой вызов stream.

`util.format()` делает реальную работу до записи. `console.log('count: %d', 42)` обрабатывает printf-плейсхолдеры. `console.log({ a: 1 })` вызывает `util.inspect()`. `console.log('a', 'b', 'c')` склеивает аргументы пробелами. Всё это синхронно до того, как stdout увидит чанк.

Шаг форматирования важен на горячих путях. Отключённая отладочная строка с `console.log(obj)` всё равно платит за inspect до записи в stdout. Для CLI с десятками строк это не заметно. В tight loop стоимость логирования часто — форматирование и TTY I/O не меньше, чем syscall `write()`.

Writable streams возвращают boolean из `write()` — stdout следует контракту. `true` — внутренний буфер ниже highWaterMark (см. [Основы потоков](../streams/foundation-of-streams.md)). `false` — порог пересечён, следующие записи лучше отложить до `drain` (там же).

```js
const ok = process.stdout.write(bigChunk);
if (!ok) {
    process.stdout.once('drain', () => {
        // можно снова писать
    });
}
```

Большинство CLI игнорирует возвращаемое значение. Несколько строк статуса редко создают давление. Форматтер, сливающий мегабайты в stdout, — другое дело. Медленный потребитель и бесконечные записи раздувают внутренний буфер Node, пока потребитель не догонит или heap не сдастся.

Для stdout через pipe highWaterMark по умолчанию — 16 КБ. Для TTY stdout на Unix синхронные записи не оставляют pending буфер stream после каждого вызова — порог почти не проявляется.

Backpressure быстро виден в конвейерах. `node dump.js | gzip > out.gz` — stdout ждёт сжатие. `node dump.js | head -10` — pipe закрывается рано. `node dump.js > /mnt/slow/out.txt` — блокировка на файловой системе. Другая цель — тот же `process.stdout.write()`.

Возвращаемое значение — единственный сигнал циклу до роста памяти. Tight producer, игнорирующий `false`, может поставить в очередь тысячи чанков, пока downstream читает первые. Node примет их в буфер Writable, пока heap не ответит. Уважение к `false` превращает цикл в темпированного producer, а не тест на рост heap.

### Размеры терминала

TTY stdout отдаёт размер терминала:

```js
console.log(process.stdout.columns); // например, 120
console.log(process.stdout.rows); // например, 40
```

Свойства — ширина и высота в символьных ячейках. Они обновляются при изменении окна, stdout эмитит `resize`:

```js
process.stdout.on('resize', () => {
    console.log(
        `${process.stdout.columns}x${process.stdout.rows}`
    );
});
```

У piped stdout и перенаправления в файл `columns` и `rows` — `undefined`. TUI, progress bar и таблицы обычно откатываются к 80 колонкам.

Событие `resize` идёт от TTY handle libuv. На Unix терминал шлёт SIGWINCH при смене размера. libuv отслеживает сигнал, запрашивает размер через `ioctl(fd, TIOCGWINSZ, &winsize)` и отражает результат в JavaScript stream.

### Управление курсором ANSI

TTY stdout принимает ANSI escape-последовательности:

```js
process.stdout.write('\x1b[2J'); // очистить экран
process.stdout.write('\x1b[H'); // курсор в левый верхний угол
process.stdout.write('\x1b[5;10H'); // строка 5, колонка 10
```

Управление курсором — просто байты в stdout. Пакеты `ansi-escapes`, `chalk`, `kleur` оборачивают последовательности, но операция всё равно — запись в fd 1.

Progress часто перерисовывает одну строку:

```js
process.stdout.write('\r'); // возврат каретки (начало строки)
process.stdout.clearLine(0); // очистить текущую строку
process.stdout.cursorTo(0); // курсор в колонку 0
process.stdout.write('Progress: 42%');
```

`clearLine()` и `cursorTo()` есть у TTY streams — внутри пишут ANSI. У piped stdout этих методов нет; TUI нужна ветка `isTTY`.

Ветка должна менять и формат вывода. Интерактивно можно перерисовывать строку. В pipe лучше дописывать простые записи. Progress bar с `\r` в лог-файле даёт нечитаемые байты. CLI, переключающийся на построчный статус при piped stdout, ведёт себя лучше в shell, CI и снапшотах тестов.

## process.stderr

`process.stderr` — тоже Writable stream. Туда пишут `console.error()`, `console.warn()`, `console.trace()` и `console.dir()`. В stdout — `console.log()`, `console.info()`, `console.table()`, `console.count()`.

Разделение важно в конвейерах. `node app.js | grep pattern` отдаёт grep только fd 1. Предупреждения, stack trace, progress и отладка на fd 2 остаются в терминале, пока не перенаправите.

```js
console.log('data output'); // в pipe -> grep
console.error('debug info'); // в терминал
```

stderr — диагностика. stdout — данные программы. Многие скрипты начинают с `console.log()` для всего и потом плохо встают в pipe, потому что отладка смешивается с данными. Маленькое исправление: `console.error()` для диагностики, `console.log()` для данных.

stderr подходит и для прогресса. Загрузчик может слать байты файла в stdout, а progress — в stderr. Форматтер — JSON в stdout, предупреждения парсера — в stderr. Вызывающая сторона перенаправляет потоки независимо, без отдельного флага.

Shell перенаправляет fd 1 и fd 2 по отдельности:

```bash
node app.js > output.txt 2> errors.txt
node app.js > output.txt 2>&1  # stderr в stdout
node app.js 2>/dev/null        # отбросить ошибки
```

Программа получает итоговую таблицу fd. Shell настраивает всё до старта Node: открывает файлы, `dup2()` для fd 1 или 2, затем exec бинарника Node. К моменту JavaScript `process.stdout` и `process.stderr` оборачивают то, что shell оставил.

`2>&1` копирует текущую цель fd 1 в fd 2. Порядок важен: редиректы слева направо. `node app.js > out.txt 2>&1` — оба потока в `out.txt`. `node app.js 2>&1 > out.txt` — stderr на исходный stdout, stdout в файл.

## Определение TTY

`process.stdout.isTTY` — `true`, когда stdout подключён к терминалу. Для pipe и файлов — `undefined`.

```js
if (process.stdout.isTTY) {
    process.stdout.write('\x1b[31mred text\x1b[0m\n');
} else {
    process.stdout.write('red text\n');
}
```

Цветные CLI держат ветку рядом. ANSI в терминале — цвет. В файле или downstream — буквальные байты вроде `^[[31m`. `isTTY` говорит, указывает ли fd 1 на терминал.

То же для всех трёх потоков:

-   `process.stdin.isTTY` — `true` при интерактивном терминале, `undefined` при pipe
-   `process.stdout.isTTY` — `true` при выводе в терминал, `undefined` при pipe или редиректе
-   `process.stderr.isTTY` — `true` при диагностике в терминал, `undefined` при редиректе stderr

У каждого потока свой статус TTY. `node app.js | cat` — stdout не TTY, stderr может остаться TTY. `node app.js 2>/dev/null` меняет stderr, stdout не трогает.

Независимость важна для цвета. Многие утилиты отключают цвет на stdout при pipe, но оставляют цвет на stderr, если он всё ещё терминал. Свести весь процесс к «интерактивный / неинтерактивный» теряет эту деталь.

### Определение цвета

Node даёт проверки цветовых возможностей на TTY streams:

```js
process.stdout.getColorDepth(); // 1, 4, 8 или 24
process.stdout.hasColors(256); // true/false
```

`getColorDepth()` — битность поддержки цвета. 1 — монохром. 4 — 16 цветов. 8 — 256. 24 — true color. На не-TTY — 1.

`hasColors(count)` — поддерживает ли терминал не меньше `count` цветов. Второй аргумент — объект окружения, например `hasColors(256, myEnvObject)` — удобно в тестах с `TERM`, `NO_COLOR`, `FORCE_COLOR`.

Node учитывает `COLORTERM`, `TERM`, `NO_COLOR`, `FORCE_COLOR`. `NO_COLOR=1` просит отключить цвет. `FORCE_COLOR` — цвет даже при pipe; CI иногда так делают логи читабельнее.

```js
if (process.env.NO_COLOR) {
    // пользователь явно просит без цвета
} else if (process.stdout.hasColors(256)) {
    // вывод на 256 цветов
} else if (process.stdout.isTTY) {
    // базовые 16 цветов
}
```

`chalk`, `kleur`, `colorette` делают это внутри. Обычно вызывают библиотеку и не дублируют логику.

## Блокирующие и неблокирующие записи

Поведение блокировки stdin, stdout и stderr зависит от типа соединения. Матрица различается на Linux, macOS и Windows.

Сначала TTY. На Linux и macOS записи в `process.stdout` и `process.stderr` синхронны, когда stream подключён к терминалу. `write()` блокирует event loop, пока ядро не примет байты для драйвера терминала. На Windows TTY-записи асинхронны: libuv ведёт их через консоль Windows.

Pipe меняет часть матрицы. На POSIX записи в pipe асинхронны. Данные идут в путь записи Node/libuv, затем в буфер pipe ядра. Медленный потребитель заполняет буфер — backpressure возвращается в Writable stream. Буфер pipe ядра часто ~64 КБ на Linux и ~16 КБ на macOS (точное число зависит от версии ядра и настроек). На Windows записи в pipe для стандартных потоков синхронны.

Файлы проще. Редирект `node script.js > output.txt` — синхронные записи на поддерживаемых платформах. Syscall возвращается после принятия байтов в файловый путь; сброс на диск ядро может отложить.

Итого: TTY — синхронно на POSIX, асинхронно на Windows. Pipe — асинхронно на POSIX, синхронно на Windows. Файл — синхронно на поддерживаемых платформах.

Дополнительно: колбэк у `.write()` означает, что Node обработал чанк в пути записи stream. Для pipe — libuv завершил async write request. Для Unix TTY колбэк может выполниться в том же turn после блокирующего syscall. Один API — разное время.

Поведение задаёт libuv (см. [Что такое Node.js](../node-arch/what-is-nodejs.md)). Когда fd 1 или 2 — TTY, libuv использует `uv_tty_t`. На Unix путь пишет напрямую блокирующими `write(2)`. Вывод в терминал обычно маленький — блокирующий путь без очереди для записей, завершающихся в syscall. Когда fd — pipe, libuv использует `uv_pipe_t` с async-очередью и участием в event loop. Вывод в pipe может стоять дольше: скорость читателя определяет опустошение буфера ядра. Обычные файлы — синхронные записи: файловый I/O через thread pool (там же) мог бы завершаться не по порядку.

Это важно. Две записи в stdout должны сохранять порядок. Асинхронные записи в перенаправленный файл через pool могли бы дать завершение write 2 раньше write 1. Синхронные записи сохраняют порядок ценой блокировки главного потока на медленной цели.

Медленные файлы реальны. Сетевой mount, почти полный диск, загруженная ФС — `write()` в stdout может блокировать заметно. Большинство CLI это принимают. Сервер с тяжёлым логом в медленный перенаправленный stdout лучше измерить, а не считать логирование бесплатным.

### process.exit() и буферизованный вывод

```js
process.stdout.write('results\n');
process.exit(0);
```

TTY stdout на Unix сбрасывается до `process.exit()`, потому что запись блокирует до принятия ядром. Pipe stdout на POSIX может потерять строку: `write()` ставит чанк в очередь и возвращается, `process.exit()` убивает процесс до завершения записи.

Такой баг часто встречается в CLI: в терминале работает, под `| tee` или коллектором логов теряется последняя строка. Причина в типе соединения, не в строке.

При явном выходе используйте колбэк записи:

```js
process.stdout.write('results\n', () => {
    process.exit(0);
});
```

Для `console.log()` чаще достаточно `process.exitCode`:

```js
process.exitCode = 0;
console.log('results');
```

Задайте код выхода. Не планируйте новую работу. Дайте event loop опустеть — pending записи успеют. `drain` помогает только после `write() === false`; маленькая очередь в pipe может не дать события `drain`. Колбэк `write` — точный крючок для одного чанка.

Тонкость у `console`: у `console.log()` нет колбэка завершения на вызов. Форматирование и запись — и возврат. Если процесс должен выйти сразу после финального сообщения, `process.stdout.write(message, callback)` даёт явную точку. `console.log()` нормален при естественном завершении; для жёсткой последовательности shutdown он неудобен.

stderr следует той же матрице, плюс практика: аварийная диагностика часто в stderr, потому что stderr часто всё ещё TTY, а Unix TTY-запись блокирует. Piped stderr тоже может потерять буфер при раннем `process.exit()`.

Поэтому fatal-path должен быть скучным: записать диагностику, по возможности синхронная очистка, `process.exitCode` при нормальном завершении, `process.exit()` только когда нужно немедленное убийство процесса.

## Объект console

`console` в Node — экземпляр `Console`, привязанный к `process.stdout` и `process.stderr`.

```js
import { Console } from 'node:console';

const logger = new Console({
    stdout: process.stdout,
    stderr: process.stderr,
});
```

Глобальный console настроен так же. Каждый метод форматирует аргументы, выбирает stdout или stderr и пишет. Можно направить свой `Console` в файлы:

```js
import { createWriteStream } from 'node:fs';

const log = new Console({
    stdout: createWriteStream('/tmp/app.log'),
    stderr: createWriteStream('/tmp/app.err'),
});
log.log('this goes to /tmp/app.log');
```

Разделение методов фиксировано. В stdout: `console.log()`, `console.info()`, `console.table()`, `console.count()`, `console.countReset()`, `console.time()`, `console.timeLog()`, `console.timeEnd()`, `console.group()`, `console.groupEnd()`. В stderr: `console.error()`, `console.warn()`, `console.trace()`, `console.dir()`, неуспешный `console.assert()`.

`console.log()` и `console.info()` — одна реализация. То же для `console.error()` и `console.warn()`. Вызов `util.format()` и запись в выбранный stream.

```js
console.table([
    { name: 'alice', score: 95 },
    { name: 'bob', score: 87 },
]);
```

`console.table()` печатает ASCII-таблицу в stdout: inspect объектов, колонки по ключам, выравнивание. Второй аргумент — колонки: `console.table(data, ['name'])`. Вывод для людей. Межпрограммный обмен — JSON, NDJSON или CSV.

Таблица идёт в stdout и попадает в shell-редирект. Для отчётов людям это нормально. Для API между процессами — плохой дефолт: пробелы, обрезка и правила inspect — детали представления.

```js
console.time('query');
await db.query('SELECT * FROM users');
console.timeEnd('query'); // query: 42.123ms
```

`console.time()` запускает высокоточный таймер по метке. `console.timeEnd()` останавливает и пишет миллисекунды в stdout. `console.timeLog()` — elapsed без остановки. Несколько меток параллельно. Предупреждение о несуществующей метке — в stderr.

Внутри — высокоточные часы, возможны дробные миллисекунды. Вывод всё равно идёт в stdout как у `console.log()`. В конвейере строки тайминга становятся частью данных, если не переназначить `Console` на stderr.

```js
console.trace('checkpoint');
```

`console.trace()` пишет `Trace: checkpoint` и stack в stderr, процесс продолжается. Формат как у stack в `Error`.

Удобно для временной диагностики в pipe: данные в stdout, stack — в stderr, следующая программа в конвейере не спутает stack с данными.

## Паттерны с pipe

Node вписывается в Unix-конвейеры через stdin и stdout.

```js
process.stdin.pipe(process.stdout);
```

Читает fd 0, пишет fd 1. stdin — Readable, stdout — Writable, `.pipe()` (см. [Основы потоков](../streams/foundation-of-streams.md)) соединяет с учётом backpressure.

Фильтр по строкам начинается с readline:

```js
import { createInterface } from 'node:readline';

const rl = createInterface({ input: process.stdin });
for await (const line of rl) {
    process.stdout.write(line.toUpperCase() + '\n');
}
```

Запуск: `cat file.txt | node upper.js | head -5`. stdin от `cat`, stdout к `head`, stderr свободен для диагностики.

JSONL-фильтр разделяет хороший вывод и плохой ввод:

```js
import { createInterface } from 'node:readline';

const rl = createInterface({ input: process.stdin });
```

Итератор строк по fd 0. Цикл фильтрации:

```js
for await (const line of rl) {
    try {
        const obj = JSON.parse(line);
        if (obj.level === 'error')
            process.stdout.write(`${line}\n`);
    } catch {
        process.stderr.write(`invalid JSON: ${line}\n`);
    }
}
```

Валидные записи — stdout. Ошибки парсинга — stderr. `node filter.js < logs.jsonl > errors.jsonl 2> parse-failures.txt` — данные и диагностика в разных файлах.

`try/catch` держит конвейер живым после битой строки: сообщить, пропустить, читать дальше.

`process.stdout.write()` в цикле может вернуть `false`. Для небольших фильтров это терпимо. Для высокого объёма — приостановить ввод или `Transform` + `pipeline()`, чтобы backpressure шёл по всей цепочке (см. [Современные pipeline](../streams/modern-pipelines-error-handling.md)).

Когда stdin в pipe, он заканчивается при закрытии upstream:

```js
let total = 0;
process.stdin.on('data', (chunk) => {
    total += chunk.length;
});
process.stdin.on('end', () => {
    console.log(`Read ${total} bytes`);
});
```

TTY stdin заканчивается по EOF пользователя. Оба случая — через событие `end` (см. [Readable streams](../streams/readable-streams.md)).

Завершение конвейера направленное. В `node producer.js | node consumer.js` выход producer закрывает pipe — у consumer `end` на stdin. Выход consumer закрывает read side — у producer SIGPIPE или `EPIPE` на stdout. Два направления сбоя выглядят по-разному.

Для Unix pipe это норма. Завершение upstream — EOF данных. Завершение downstream — сломанная цель записи. Хорошие CLI трактуют первое как completion, второе — как чистую раннюю остановку, если downstream намеренно вышел.

Для stream-преобразований `pipeline()` (там же) даёт распространение ошибок и очистку:

```js
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';

const upper = new Transform({
    transform(chunk, enc, cb) {
        cb(null, chunk.toString().toUpperCase());
    },
});
await pipeline(process.stdin, upper, process.stdout);
```

Построчный вариант короче для текстовых фильтров. `pipeline()` лучше, когда преобразование естественно stream-образно и нужен backpressure end-to-end.

## Как Node поднимает stdin, stdout и stderr

До пользовательского кода Node вешает ленивые геттеры стандартных потоков на `process`. Путь главного потока — `lib/internal/bootstrap/switches/is_main_thread.js`; у worker threads отдельный путь с проксированным stdout/stderr.

Создание по обращению. Первое чтение `process.stdout` вызывает внутренний `getStdout()`, тот — `createWritableStdioStream(1)`. Далее `guessHandleType(fd)` уходит в C++ binding `process.binding('uv').guessHandleType(fd)` → libuv `uv_guess_handle(fd)`.

`uv_guess_handle()` делает `fstat()` и на Unix проверяет терминал через `isatty(fd)`. Возвращает тип handle: `UV_TTY`, `UV_NAMED_PIPE`, `UV_FILE`, `UV_UNKNOWN`. Node по нему выбирает класс JavaScript stream.

Цепочка для writable: `getStdout()` кэширует объект; `createWritableStdioStream(1)` классифицирует fd 1; классификация задаёт конструктор и политику записи; результат на `process` переиспользуется. `process.stderr` — то же с fd 2. stdin — sibling readable path с fd 0.

Ленивость важна. Скрипт пишет только в stdout и не трогает stdin — handle stdin не создаётся. Меньше libuv handle на shutdown.

`UV_TTY` — fd 1 или 2 указывает на терминал. Node создаёт `TTYWrap` вокруг `uv_tty_t`, наружу — `net.Socket` в TTY mode. Handle хранит fd, исходный режим терминала для восстановления, размер окна через `ioctl(fd, TIOCGWINSZ, &winsize)` — оттуда `columns`, `rows`, `setRawMode()`, проверки цвета.

JavaScript-объект с socket-подобным API — из stream stack Node. TTY нужен duplex-подобный stdin и совместимые записи stdout/stderr — обёртка socket вокруг нативного handle. fd всё ещё терминальное устройство; методы socket, требующие адрес peer, мало что дают.

`UV_NAMED_PIPE` — pipe или Unix domain socket. Handle `uv_pipe_t`, снаружи `net.Socket` в pipe mode. Записи в очередь libuv как `uv_write_t`. libuv регистрирует готовность fd к записи через epoll/kqueue. Буфер pipe ядра полон — запрос в очереди, stream сообщает backpressure через `write() === false`.

Поэтому stdout через pipe может держать процесс после синхронного JavaScript: pending `uv_write_t` — активная работа. Event loop крутится, пока запросы не завершатся или не упадут. `process.exit()` обходит слив. Естественный выход — даёт.

`UV_FILE` — обычный файл. Node создаёт `fs.WriteStream` для stdout/stderr или `fs.ReadStream` для stdin. Записи в файловые стандартные потоки внутри используют синхронный `fs.writeSync()`. Thread pool мог бы переупорядочить concurrent writes. Sync сохраняет порядок текста.

Обычные файлы объясняют, почему перенаправленный stdout может быть медленнее терминала. Локальный SSD — дёшево в page cache. Удалённая ФС — дольше блокировка. API stream скрывает разницу, latency остаётся на JS-потоке.

`UV_UNKNOWN` — fallback: socket-обёртка для fd, который libuv не классифицировал. Редко в обычных shell, важно для embedded, нестандартных supervisor и тестов с кастомными дескрипторами. API стандартных потоков есть, ошибки записи идут через stream.

stdin — тот же detection с Readable. TTY stdin — TTY-capable socket. Pipe stdin — pipe-backed socket. File stdin (`node script.js < input.txt`) — `fs.ReadStream`.

Файловый stdin част в batch: `node parse.js < input.ndjson` даёт `fs.ReadStream` на fd 0, потребление через `for await`, `data` или `pipe()`. Источник сменился с терминала на файл; для кода это по-прежнему Readable.

У TTY stdin отдельный путь: Ctrl+C от терминала. В cooked mode драйвер превращает Ctrl+C в SIGINT. В raw mode в JavaScript приходит байт `0x03`. Переключение режимов — сохранение/восстановление атрибутов через `tcsetattr()`, libuv TTY согласует это с сигналами Node.

Worker threads получают проксированный stdout. `process.stdout` и `process.stderr` в worker шлют данные родителю по внутреннему каналу, родитель пишет в свой fd 1/2. Вывод worker асинхронен. `process.stdin` в worker — `null`; ввод только сообщениями от main thread.

На тестовый вывод это влияет: `console.log()` из worker идёт через родителя. Порядок с логами main thread зависит от доставки сообщений и записи родителя. Для точного порядка — структурированные сообщения родителю, один поток владеет финальным выводом.

## Крайние случаи и подводные камни

TTY stdout — экземпляр `net.Socket`:

```js
import net from 'node:net';

console.log(process.stdout instanceof net.Socket);
// true (когда подключён к TTY)
```

Часть унаследованных методов socket на терминальном fd мало осмыслена. Полезнее поведение при ошибках: stdout может эмитить `error`, если запись в fd не удалась.

Broken pipe — частый случай. `node app.js | head -1`: `head` выходит после одной строки. Следующая запись в stdout попадает в закрытую read side. Node игнорирует SIGPIPE при старте и превращает сбой в `EPIPE` на `process.stdout`.

```js
process.stdout.on('error', (err) => {
    if (err.code === 'EPIPE') {
        process.exit(0);
    }
});
```

Программы для конвейеров должны обрабатывать `EPIPE`: ранний выход потребителя — нормальное завершение, а не необработанная ошибка stream.

`head` — типичный repro: намеренный выход после достаточного числа строк. Producer не виноват. Потребитель закрыл pipe. `EPIPE` как успех держит shell-конвейеры тихими.

Смесь sync и async записей может удивить:

```js
process.stdout.write('A');
setTimeout(() => process.stdout.write('B'), 0);
process.stdout.write('C');
```

На TTY `A` и `C` синхронны, таймер пишет `B` — вывод `ACB`. На pipe `A` и `C` обычно в очереди до фазы таймера — снова `ACB`. При больших объёмах и backpressure тайминг заметнее, но порядок постановки в очередь до yield к event loop сохраняется.

`console.log()` может блокировать: пишет в stdout, stdout может быть синхронным. Тяжёлый лог в терминал доминирует в бенчмарке. Pipe в `/dev/null` или редирект в файл — измерять работу приложения без latency TTY.

Вторая ловушка бенчмарка: редирект в обычный файл тоже синхронен. `/dev/null` снимает большую часть стоимости. Реальный файл на медленном устройстве измеряет ещё и ФС.

`isTTY` — один бит классификации. Pipe и файл дают `undefined`. Если нужно различить их, `fs.fstatSync(1)` смотрит fd 1: pipe, char device или regular file. Большинству CLI хватает ветки TTY.

Глубже — в утилитах с разным поведением для файла и pipe: seek-friendly вывод при regular file на fd 1, поток записей при pipe. Большинство программ не идут туда: stdout — API назначения, даже когда за ним файл.

Последняя ловушка — выход процесса. `process.exit()` синхронно гоняет `exit` handlers и завершает. Pending async writes остаются pending навсегда. Безопаснее `process.exitCode = N`:

```js
process.exitCode = 1;
console.error('something went wrong');
// дать event loop опустеть
```

Задайте код. Не создавайте новую работу. Дайте циклу опустеть — pipe stdout/stderr успеют сбросить буфер.

Стандартные потоки снаружи малы, но несут границу процесса. Shell задаёт дескрипторы. Node оборачивает лениво. libuv выбирает тип handle. Код видит stream — поведение stream из всей этой цепочки.

## Связанное чтение

-   Предыдущая: [Модуль os в Node.js](./os-module.md)
-   Далее: [CLI-флаги Node.js: NODE_OPTIONS, preloads и диагностика](../runtime-platform/cli-runtime-configuration.md)
