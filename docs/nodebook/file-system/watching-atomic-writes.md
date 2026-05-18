---
description: fs.watch, fs.watchFile, атомарная запись через rename и практика наблюдения за файлами в Node.js
---

# Наблюдение за файлами и атомарная запись в Node.js

Источник: [theNodeBook — Watching Files and Atomic Writes](https://www.thenodebook.com/file-system/watching-atomic-writes)

Наблюдение за файлами в Node.js связывает JavaScript-колбэки с механизмами ОС. В этой главе — `fs.watch()`, `fs.watchFile()`, слияние событий, различия платформ и паттерны атомарной записи. `fs.watch()` подписывается на события ядра. `fs.watchFile()` опрашивает метаданные. Атомарная запись обычно пишет во временный файл, сбрасывает буферы и переименовывает его поверх целевого.

Код наблюдателя нуждается в debounce, проверке путей и дисциплине перезагрузки. Событие изменения означает, что watcher увидел активность в ФС. Это **не** доказывает, что файл готов к разбору. В продакшене перезагрузчики конфигурации обычно ждут короткую паузу, делают `stat`, читают файл целиком, валидируют и только потом подменяют состояние.

`fs.watch('./config.json', callback)` выглядит как одна строка. За ней — цепочка syscall'ов, специфичная для ОС: inotify в Linux, FSEvents в macOS, ReadDirectoryChangesW в Windows. Каждый механизм работает по-своему, отчитывается по-своему и ломается по-своему. Документация Node прямо предупреждает: «API `fs.watch` не на 100% согласован между платформами и в некоторых ситуациях недоступен».

Та же непоследовательность затрагивает атомарные записи. Редакторы часто пишут во временный файл и переименовывают его на место цели. Watcher видит события `rename`, а не записи. Атомарная запись и наблюдение за файлами пересекаются через эти rename — их нужно читать вместе.

!!!note ""

    **Что такое атомарная запись?** В вычислениях «атомарная» операция даёт наблюдателям одно неделимое изменение состояния. При замене файла видимое состояние — либо старый файл, либо переименованная замена. Это гарантия **согласованности**, а не **долговечности**. Пережить отключение питания требует явных вызовов `fsync()` — об этом позже в главе. Поскольку ОС не даёт одной операции «атомарно заменить содержимое файла», приложения обычно сначала пишут новые данные во временный файл, затем одним `rename()` переносят его на место.

## fs.watch() и слой событий ОС

API прост:

```js
import fs from 'node:fs';

const watcher = fs.watch(
    './config.json',
    (event, filename) => {
        console.log(`${event}: ${filename}`);
    }
);
```

`event` — `'change'` или `'rename'`. `filename` — файл, вызвавший событие. На некоторых платформах `filename` бывает `null`. Возвращаемый `FSWatcher` — EventEmitter: можно слушать `'error'`.

Два типа событий на все операции ФС — весь словарь Node. Изменение содержимого — `'change'`. Удаление, переименование, создание — `'rename'`. На части платформ одна модификация даёт оба. По одному событию нельзя отличить удаление от переименования — всё `'rename'`.

### Как события сопоставляются с механизмами ОС

В Linux `fs.watch()` использует inotify. При наблюдении за файлом libuv вызывает `inotify_init1()`, затем `inotify_add_watch()` для каждого пути. Ядро подписывается на `IN_MODIFY`, `IN_ATTRIB`, `IN_DELETE_SELF`, `IN_MOVE_SELF` и другие. Node сводит их к `'change'` или `'rename'`: модификации и смена атрибутов (`IN_ATTRIB`) → `'change'`; удаление, создание, перемещение — чаще `'rename'`.

В macOS Node использует kqueue для файлов и FSEvents для каталогов. FSEvents работает на уровне дерева каталогов; уведомления по файлам возможны, но быстрые события сливаются. Десять правок одного файла подряд могут дать меньше уведомлений, чем в Linux. macOS оптимизирует низкие накладные расходы на больших деревьях, а не точный счёт событий.

В Windows ReadDirectoryChangesW наблюдает каталоги и сообщает действия: `FILE_ACTION_MODIFIED`, `FILE_ACTION_ADDED`, `FILE_ACTION_REMOVED`, `FILE_ACTION_RENAMED_OLD_NAME`, `FILE_ACTION_RENAMED_NEW_NAME`. API буферный и асинхронный. Если события приходят быстрее, чем вы их читаете, буфер переполняется. Windows возвращает `ERROR_NOTIFY_ENUM_DIR` — конкретные записи уже потеряны, безопасный путь — пересканировать каталог.

Пример несогласованности: запись, дополнение, переименование:

```js
import fs from 'node:fs';

fs.writeFileSync('./test.txt', 'hello');
fs.appendFileSync('./test.txt', ' world');
fs.renameSync('./test.txt', './test-renamed.txt');
```

Linux (inotify) обычно даёт три события: `change`, `change`, `rename`. macOS может слить две записи в одно `change` или не сообщить о модификации, если rename следует сразу. Windows сообщает модификации по отдельности, но на rename отдаёт **новое** имя, а Linux — старое.

Вывод прямой: нельзя писать код, зависящий от точного числа или порядка событий на всех платформах.

### Наблюдение за каталогом и за файлом

Наблюдение за каталогом даёт события для всего внутри — создание, изменение, удаление, переименование. Параметр `filename` обычно указывает, какой файл изменился. Наблюдение за одним файлом — только для конкретного inode.

Подвох при watch на уровне файла: если смотреть `config.json` и его удалят, watch на этот inode в Linux становится недействительным. Новый файл по тому же пути — другой inode. Watcher остаётся на старом inode, новый путь не зарегистрирован.

Это важнее, чем кажется. Редакторы при сохранении часто удаляют и создают файл заново. Некоторые инструменты пишут в `config.json.tmp`, переименовывают `config.json` в `config.json~`, затем `config.json.tmp` → `config.json`. Для watcher исходный файл «уехал» переименованием. В Linux watch на исходном inode может указывать на `config.json~`, а не на новый `config.json`.

В продакшене чаще смотрят родительский каталог. При удалении и пересоздании (атомарная запись, safe-save редактора) каталожный watcher ловит rename, потому что сам каталог на месте. File-level watcher часто пропускает замену.

### Опция `recursive`

```js
fs.watch(
    './src',
    { recursive: true },
    (event, filename) => {
        console.log(`Changed: ${filename}`);
    }
);
```

В macOS рекурсивное наблюдение — нативная поддержка FSEvents на дереве. Одним watch покрывается дерево.

В Windows ReadDirectoryChangesW поддерживает рекурсивный флаг нативно — схожая эффективность.

В Linux `recursive: true` долго не поддерживался. С Node v19.1.0 рекурсия на Linux реализована обходом дерева и отдельными inotify-watch на подкаталоги. Это дороже, чем нативная рекурсия в macOS/Windows. Каждый подкаталог съедает слот inotify; Node должен замечать новые подкаталоги и вешать на них watch.

Лимит inotify важен. На многих дистрибутивах Linux по умолчанию 8192 watch на пользователя (иногда 65536). Проверка: `cat /proc/sys/fs/inotify/max_user_watches`. Проект с 10 000 каталогов исчерпывает лимит — ошибка `ENOSPC`, хотя места на диске может быть полно: переполнена таблица inotify. Увеличение:

```bash
echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches
```

Команда меняет значение до перезагрузки. Для постоянства — sysctl.

Это одна из первых поломок при деплое file-watching (dev-серверы, сборщики) на Linux: на Mac работает, на сервере «no space» из-за inotify, а не диска.

### Опция `persistent` и удержание процесса

По умолчанию активный watcher не даёт процессу Node завершиться: в event loop есть живой handle. `persistent: false` — watcher пассивен: срабатывает, пока процесс жив по другим причинам, но сам процесс не держит.

```js
fs.watch('./file.txt', { persistent: false }, (event) => {
    console.log('Changed');
});
```

Частая путаница в скриптах «дождаться одного изменения и выйти»: процесс висит, потому что watcher держит event loop. Либо закрывайте watcher в колбэке, либо `persistent: false`.

### Ошибки watcher

`FSWatcher` эмитит `'error'`. Обрабатывайте их как часть API:

```js
watcher.on('error', (err) => {
    console.error('Watch failed:', err.message);
});
```

Типичные случаи: путь не существует (`ENOENT`), лимит inotify (`ENOSPC`), потеря доступа, удаление наблюдаемого каталога. Без обработчика — необработанное исключение и падение процесса.

### Закрытие watcher

```js
watcher.close();
```

Освобождает handle ОС: в Linux — дескриптор inotify; в macOS — kqueue или FSEvents. Тот же принцип, что у файловых дескрипторов: ресурсы конечны, утечки watcher в долгоживущем процессе упираются в лимиты.

Если watcher создаются в runtime (сессия пользователя, загруженный файл) — храните в `Map` и закрывайте при очистке ресурса. 10 watcher в минуту → ~14 400 в сутки; лимит inotify за часы.

## fs.watchFile() и опрос stat

`fs.watchFile()` игнорирует события ОС. Он опрашивает метаданные через `fs.stat()` с фиксированным интервалом и вызывает колбэк при изменении.

```js
fs.watchFile(
    './config.json',
    { interval: 2000 },
    (curr, prev) => {
        console.log(
            `mtime: ${prev.mtime} -> ${curr.mtime}`
        );
        console.log(`size: ${prev.size} -> ${curr.size}`);
    }
);
```

Колбэк получает два объекта Stats: текущий и предыдущий. Можно сравнивать mtime, ctime, size, права, число ссылок. Node вызывает слушатель при изменении stat между опросами. Для содержимого сравнивайте `curr.mtimeMs` и `prev.mtimeMs`.

### Как устроен опрос внутри

Node держит внутреннюю карту файлов под `fs.watchFile()`. Таймер с заданным интервалом на каждом тике опрашивает пути stat-подобными операциями. Callback и promise API ФС идут через thread pool libuv — тяжёлый опрос конкурирует с другой работой ФС. При изменении stat вызывается колбэк с предыдущим и текущим `Stats`.

Стоимость растёт линейно. 100 файлов с интервалом 1 с → 100 stat в секунду, каждый занимает слот pool. По умолчанию 4 слота. Параллельно DNS, чтение файлов, crypto — stat добавляет задержку всему.

### Почему интервал по умолчанию 5007 мс

Не 5000. В документации Node — 5007 мс. Это историческое значение по умолчанию, не контракт по времени. Если важна задержка обнаружения или нагрузка на ФС — задавайте интервал явно и меряйте на целевой ФС.

```js
fs.watchFile(
    './config.json',
    { interval: 1000 },
    (curr, prev) => {
        if (curr.mtimeMs !== prev.mtimeMs) {
            console.log('Content changed');
        }
    }
);
```

Короче интервал — быстрее обнаружение, выше цена. Для конфига, меняющегося раз в деплой, 10–30 с достаточно. Для dev-сервера — 1 с может быть ок. Для субсекундного обнаружения опрос — не тот инструмент; нужен `fs.watch()`.

### Когда опрос лучше событий

Опрос надёжнее на многих сетевых ФС: NFS, CIFS, SMB — доставка событий ненадёжна или отсутствует, записи идут на удалённом сервере. `fs.watch()` здесь часто бесполезен. `fs.watchFile()` делает stat и читает метаданные с удалённой ФС — медленно, но работает.

Опрос помогает, когда `fs.watch()` ломается: после удаления и пересоздания файла в Linux, на платформах с ненадёжными событиями, в контейнерах без inotify в overlay, на ФС без notification API. Docker-тома с некоторыми драйверами: `fs.watch()` молчит, опрос ловит изменения.

### Остановка stat-watcher

```js
fs.unwatchFile('./config.json');
```

`fs.watchFile()` ничего не возвращает — нет `.close()`. Тот же путь в `fs.unwatchFile()`. Несколько слушателей на один файл — без второго аргумента снимаются все; со вторым аргументом (функция) — только один.

### Точность mtime

`fs.watchFile()` зависит от изменений stat. Современные ФС (ext4, APFS, NTFS, ZFS) дают субсекундные метки; при `bigint: true` у Node есть наносекундные поля stat. Старые ФС (FAT32), часть сетевых и виртуализированных mount'ов — грубее. Две записи в один тик метки времени сливаются в одно видимое состояние stat.

mtime обычно меняется при записи или truncate, но момент наблюдения зависит от ФС и ядра. Опрос видит снимки с интервалом. Файл могут открыть, изменить дважды и закрыть между двумя опросами — `fs.watchFile()` увидит только финальный stat.

## Выбор между fs.watch() и fs.watchFile()

`fs.watch()` быстрый — события за миллисекунды в Linux, на macOS иногда с большей задержкой. Эффективный — без опроса, доставка из ядра. Но непоследователен: пропуски, дубликаты, поломка после удаления файла. Словарь событий грубый — только `'change'` и `'rename'`.

`fs.watchFile()` медленный — задержка = интервал опроса; субсекундный опрос всё равно пропускает изменения на многих ФС. Дорогой — stat на каждом тике. Плюс: работает там, где событий нет. Если метаданные между опросами различаются — будет колбэк.

В продакшене чаще не используют ни то ни другое напрямую.

### Зачем существует chokidar

chokidar оборачивает оба API и нормализует поведение между платформами:

-   **Рекурсия в Linux.** Обход дерева, inotify на подкаталоги, добавление/снятие watch при появлении/исчезновении каталогов.
-   **Нормализация событий.** Вместо `'change'`/`'rename'` — `'add'`, `'change'`, `'unlink'`, `'addDir'`, `'unlinkDir'`.
-   **Safe-save редакторов.** Temp + rename сводится к одному `'change'`, а не лавине `'unlink'`/`'add'`.
-   **Опрос.** `usePolling` и интервал — для ФС без надёжных событий.
-   **Начальный скан.** При старте — `'add'` для уже существующих файлов.

```js
import chokidar from 'chokidar';

const watcher = chokidar.watch('./src', {
    ignored: /node_modules/,
    persistent: true,
});
watcher.on('change', (p) => console.log(`Changed: ${p}`));
watcher.on('add', (p) => console.log(`Added: ${p}`));
```

Многие сборщики, test runner'ы и dev-серверы используют chokidar или аналог. Для одного известного файла на известной платформе хватает `fs.watch()`. Для кроссплатформы и рекурсии — библиотека.

## Наблюдение за файлами на практике

Перед debounce — паттерны продакшена.

### Hot reload конфигурации

Конфиг грузится при старте; изменения без рестарта сервера.

```js
import fs from 'node:fs';
import path from 'node:path';

const configPath = path.resolve('./config.json');
let config = JSON.parse(
    fs.readFileSync(configPath, 'utf8')
);
```

```js
const reloadConfig = debounce(() => {
    try {
        const raw = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(raw);
        console.log('Config reloaded');
    } catch (err) {
        console.error(
            'Bad config, keeping old:',
            err.message
        );
    }
}, 500);
```

```js
const dir = path.dirname(configPath);
const base = path.basename(configPath);

fs.watch(dir, (event, filename) => {
    if (filename === base) reloadConfig();
});
```

`try/catch` критичен: невалидный JSON — остаётся старый конфиг. Debounce гасит многошаговое сохранение редактора. Watch родительского каталога переживает delete-and-recreate лучше, чем watch файла. Синхронное чтение в колбэке блокирует ненадолго, но всё равно нужна валидация: факт чтения байт ≠ валидная конфигурация.

### Наблюдение за каталогом с новыми файлами

Загрузки, входящие данные, очередь задач:

```js
import fs from 'node:fs';
import path from 'node:path';

const processed = new Set();

fs.watch('./uploads', (event, filename) => {
    if (!filename || processed.has(filename)) return;
    queueIfStable(
        path.join('./uploads', filename),
        filename
    );
});
```

```js
async function queueIfStable(fullPath, filename) {
    const first = await fs.promises
        .stat(fullPath)
        .catch(() => null);
    if (!first?.isFile()) return;
    await new Promise((r) => setTimeout(r, 250));
    const second = await fs.promises
        .stat(fullPath)
        .catch(() => null);
    if (!second || first.size !== second.size) return;
    processed.add(filename);
    processFile(fullPath);
}
```

`'rename'` срабатывает и на создание, и на удаление. `stat` отделяет существующие файлы от исчезнувших имён. Второй `stat` — простая защита от обработки незавершённой записи. При высокой нагрузке пусть писатели грузят под временным именем и переименовывают в `uploads` только когда файл готов.

### Обнаружение ротации логов

Приложение пишет в `app.log`. Внешний инструмент переименовывает в `app.log.1` и ожидает запись в новый `app.log`.

```js
import fs from 'node:fs';

let logStream = fs.createWriteStream('./app.log', {
    flags: 'a',
});
let watcher;
```

```js
function reopenLog() {
    watcher?.close();
    logStream.end(() => {
        logStream = fs.createWriteStream('./app.log', {
            flags: 'a',
        });
        logStream.once('open', watchLog);
    });
}
```

```js
function watchLog() {
    watcher = fs.watch('./app.log', (event) => {
        if (event === 'rename') reopenLog();
    });
    watcher.on('error', (err) =>
        console.error(err.message)
    );
}
watchLog();
```

При ротации rename обычно даёт `'rename'`. Закрываете старый stream (fd может указывать на `app.log.1`), открываете новый для `app.log`. Watcher перезапускается после `open`, потому что в Linux `fs.watch` привязан к inode, который только что переименовали. Паттерн для rename-ротации. Copy-truncate (тот же inode) требует другой логики reopen.

### Сетевые файловые системы

`fs.watch()` опирается на локальное ядро. На NFS, SMB, CIFS записи на удалённой машине — локальное ядро их не видит, inotify/FSEvents/ReadDirectoryChangesW молчат.

Для сетевых mount'ов: опрос через `fs.watchFile()` или другой канал — HTTP webhook, очередь, триггер БД при изменении удалённых данных.

### Утечки ресурсов watcher

Каждый watcher держит ресурсы ОС. В Linux — дескриптор inotify. На всех платформах — fd или handle.

Watcher на сессию/файл/запрос без закрытия накапливаются. 10 в минуту → 14 400 в день. Linux: `ENOSPC` или `EMFILE`, рост памяти от JS-объектов и колбэков.

Исправление: создание watcher парить с очисткой. `Map` по ключу (user ID, путь, сессия), явный `close` при освобождении ресурса.

```js
const watchers = new Map();

function startWatching(key, filePath) {
    if (watchers.has(key)) return;
    watchers.set(
        key,
        fs.watch(filePath, () => handleChange(key))
    );
}
```

```js
function stopWatching(key) {
    const watcher = watchers.get(key);
    watcher?.close();
    watchers.delete(key);
}
```

В тестах закрывайте все watcher в `afterEach` — иначе event loop жив и процесс висит до таймаута.

### События не мгновенны

Даже `fs.watch()` имеет задержку. Linux: inotify обычно за миллисекунды. macOS: FSEvents может батчить — 100 мс и больше, до секунды под нагрузкой. Windows: похожая вариативность.

Жёсткие требования «обнаружить за 10 мс» — file watching может не хватить. Нужен явный сигнал от писателя: IPC, Unix domain socket, флаг в shared memory.

## Debounce событий file watch

Одно логическое сохранение в редакторе может дать 2–3+ события: temp, удаление оригинала, rename. Или отдельно запись и обновление метаданных при закрытии. Три срабатывания на одно сохранение.

Если обработчик пересобирает проект, перечитывает конфиг или заливает файл — три запуска за 50 мс вредны. Debounce откладывает действие, пока события не прекратятся на заданное время.

```js
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
```

Каждое событие сбрасывает таймер. Функция выполняется после `delay` мс тишины.

```js
const onChange = debounce((event, filename) => {
    console.log('File settled, reloading...');
}, 300);
fs.watch('./', (event, filename) => {
    if (filename === 'config.json')
        onChange(event, filename);
});
```

Задержка по контексту: 100–300 мс для dev-инструментов; 500 мс–1 с для продакшен-конфига, чтобы deploy-скрипт точно дописал файл. Сканирование лог-каталога может обойтись без debounce, если нужна мгновенная реакция на новые файлы.

### Дедупликация через stat

Дополнение: при событии делать `stat` и сравнивать сигнатуру с прошлой.

```js
let lastSeen = null;
fs.watch(
    path.dirname(configPath),
    async (event, filename) => {
        if (filename !== path.basename(configPath)) return;
        const stats = await fs.promises
            .stat(configPath)
            .catch(() => null);
        if (!stats) return;
        const signature = `${stats.mtimeMs}:${stats.size}`;
        if (signature === lastSeen) return;
        lastSeen = signature;
        console.log('Config actually changed');
    }
);
```

Отсекает дубликаты ОС и лишние уведомления только по метаданным. Это дешёвый фильтр, не доказательство, что писатель закончил: размер может стабилизироваться до `close`, содержимое может меняться при том же размере.

Надёжнее: stat-фильтр, затем debounce на всплеск событий.

### Паттерны safe-save редакторов

Редакторы не просто open-write-close. Safe-save защищает от битого файла при краше. Vim, VS Code, Sublime, JetBrains и др. часто делают атомарную запись внутри — она ломает наивные watcher'ы.

CLI (`sed -i`) и библиотеки атомарной записи: `config.json.tmp` → backup `config.json~` → rename tmp на место — три события. Vim по умолчанию чуть иначе (backup + новый файл), но inode всё равно меняются. VS Code — случайное имя temp в том же каталоге, затем rename — два шага. Иногда temp в другом каталоге — возможен cross-filesystem.

На границе watcher file-level watch в Linux: `'rename'`, когда оригинал ушёл в backup; inotify следует за inode → watch может смотреть на `config.json~`. Новый `config.json` — другой inode, контент пропущен. С точки зрения watcher файл «переименовали и всё».

В macOS каталожный FSEvents справляется лучше, но число событий непредсказуемо.

Стандартный обход — watch родительского каталога, фильтр по имени, debounce до завершения записи. Inode каталога стабилен.

Отсюда chokidar: распознать последовательность и выдать одно «файл изменился». Реализуемо вручную, но утомительно.

## Как работают inotify и FSEvents — внутренности ядра

Различия платформ идут из разного дизайна подсистем ядра. Понимание объясняет поведение `fs.watch()` и почему обёртка не сделает платформы идентичными.

### inotify в Linux

Три syscall: `inotify_init1()`, `inotify_add_watch()`, `read()`.

`inotify_init1()` создаёт экземпляр inotify и fd — очередь событий. fd в event loop: libuv в epoll, при готовности — чтение.

`inotify_add_watch(fd, pathname, mask)` — маска: `IN_MODIFY`, `IN_ATTRIB`, `IN_CREATE`, `IN_DELETE`, `IN_MOVED_FROM` / `IN_MOVED_TO` и др. Ядро возвращает watch descriptor.

При событии ядро пишет `inotify_event` во внутренний буфер fd: wd, mask, cookie (связка пар rename), длина, имя файла. Чтение через `read()` на fd inotify.

libuv оборачивает это в `uv_fs_event`. `fs.watch()` создаёт `uv_fs_event_t`, `inotify_init1()` (часто один экземпляр на loop), `inotify_add_watch()`, epoll, чтение struct'ов, маппинг wd → путь, перевод в `'change'`/`'rename'`, колбэк на следующей итерации loop.

inotify смотрит inode. Каталог — события только **в этом** каталоге, не в подкаталогах. Рекурсия = отдельный `inotify_add_watch()` на каждый подкаталог, лимит `max_user_watches`, `ENOSPC`.

inotify детальнее FSEvents по маскам. Очередь может сливать одинаковые непрочитанные события и **отбрасывать** при переполнении (`max_queued_events`, часто 16384). Это не audit log.

### FSEvents в macOS

Другая архитектура: Spotlight, Time Machine — огромные деревья с низкой нагрузкой на CPU. Приоритет — дерево и экономия ресурсов, не поштучная точность.

FSEvents смотрит пути каталогов; уведомления на каталог и всё ниже. Node: kqueue для файлов, FSEvents для каталогов — backend зависит от того, что смотрите. Для дерева один поток FSEvents без watch на каждый подкаталог.

Ядро ведёт поток событий со слоем coalescing. Десять правок за 100 мс могут стать одним-двумя уведомлениями. FSEvents говорит «что-то изменилось здесь», а не «вот все N изменений». Для индексации Spotlight идеально; для счёта каждого промежуточного состояния — источник путаницы.

Доставка асинхронная, с задержкой. Параметр latency при создании потока — минимальный интервал между доставками; в типичных реализациях ~1 с по умолчанию. libuv передаёт 0, но ядро всё равно сливает всплески.

Для каталогов можно запросить file-level с `kFSEventStreamCreateFlagFileEvents`. Coalescing остаётся. Node документирует `filename` как опциональный даже там, где он есть — нужен fallback на `null`.

### ReadDirectoryChangesW в Windows

`ReadDirectoryChangesW()` наблюдает handle каталога, заполняет буфер записями: тип действия и относительное имя. Рекурсия нативно. Rename — пара old/new, удобнее, чем cookie inotify.

Слабость — переполнение буфера. События быстрее обработки → отброс, `ERROR_NOTIFY_ENUM_DIR`, `'error'` в Node. Восстановление — ручной rescan. Большой буфер и быстрая обработка смягчают, но верхней границы объёма всплеска нет.

### Практический итог

Библиотека не сделает системы идентичными. inotify — per-inode, маски, конечная очередь. FSEvents — дерево, coalescing, асинхронность, низкие накладные расходы на огромные иерархии. Windows — между ними, с буфером и риском overflow.

Лучшее, что делает chokidar: debounce, dedup, подтверждение stat, единый словарь событий — много логики вокруг API из трёх строк.

## Проблема наивной перезаписи файла

`fs.writeFile()` с флагом `'w'` по умолчанию **сразу** обнуляет файл, затем пишет новое содержимое. Между truncate и концом записи файл пуст или частично заполнен. Краш процесса (`SIGKILL`, питание) — потеря и старых, и новых данных.

Без краша запись может быть частичной: Node пишет чанками через `write()`. Диск заполнился на 60% — `ENOSPC`, в файле 60% нового, старого нет. Ошибка в логе, файл уже испорчен.

Читатели видят байты на диске в момент открытия. Параллельное чтение конфига во время записи — обрезанный JSON, parse error, 500, на следующем запросе всё ок — гонка по времени.

`'r+'` не truncate при открытии, но при более коротком новом содержимом нужен ручной truncate после записи; краш между записью и truncate — хвост старого контента. Нет комбинации флагов, делающей in-place перезапись безопасной: open, write, close — отдельные syscall'ы, сбой между ними портит файл.

## Паттерн «временный файл + rename»

Решение: писать во временный файл, затем `rename()` temp → цель. На POSIX `rename()` **атомарен**, если источник и назначение на одной ФС: обновляется указатель inode в записи каталога за одну операцию. Читатели видят либо старый файл (открыли до rename), либо новый (после). Промежуточного «наполовину записано» в каталоге нет.

```js
import crypto from 'node:crypto';

const suffix = crypto.randomBytes(6).toString('hex');
const tempPath = `./config.json.tmp-${suffix}`;
await fs.promises.writeFile(tempPath, data, { flag: 'wx' });
await fs.promises.rename(tempPath, './config.json');
```

`'wx'` — эксклюзивная запись: `O_WRONLY | O_CREAT | O_EXCL`, проверка и создание атомарны в ядре. Коллизия имён — `EEXIST`, retry с новым суффиксом. На сетевых ФС exclusive mode может быть ненадёжен — осторожность на shared mount.

### Почему rename() атомарен в POSIX

Каталог — отображение имён на номера inode. `rename` A → B в одном каталоге и на одной ФС: запись B указывает на inode A, запись A удаляется в одной транзакции ФС. Либо полный успех, либо полный отказ — промежуточного состояния для других процессов нет.

Если B существовал, старый inode B разыменовывается (link count −1). Процессы с открытым fd на старый B читают данные, пока fd живы; новые открытия B получают inode после rename.

### Почему важна одна файловая система

Атомарность только в пределах одного mount. Temp в `/tmp`, цель в `/var/app` — `EXDEV`, rename падает. Temp создавайте **в каталоге цели**.

В Docker `/tmp` часто другой mount, чем data volume — та же ловушка с `os.tmpdir()`.

### Права после rename

После rename цель **наследует inode temp** — права и владельца temp. Было `0644 www-data`, temp `0600 deploy` — приложение под `www-data` не прочитает конфиг.

Сохранение прав оригинала:

```js
const original = await fs.promises
    .stat(targetPath)
    .catch(() => null);
await fs.promises.writeFile(tempPath, data, {
    flag: 'wx',
    mode: original?.mode ?? 0o666,
});
await fs.promises.rename(tempPath, targetPath);
```

`mode` — биты прав при создании. Не копирует владельца, ACL, xattr. `chown()` часто недоступен без root.

### Отличия Windows

Блокировки файлов: на POSIX можно заменить открытый файл — старый inode живёт по fd. В Windows открытый целевой файл часто блокирует rename → `EPERM`/`EACCES`. Операция атомарно **не выполнилась**, замена заблокирована.

Обход — retry с backoff:

```js
async function renameWithRetry(tempPath, targetPath) {
    for (let i = 0; i < 5; i++) {
        try {
            await fs.promises.rename(tempPath, targetPath);
            return;
        } catch (err) {
            if (
                !['EPERM', 'EACCES'].includes(err.code) ||
                i === 4
            )
                throw err;
            await new Promise((r) =>
                setTimeout(r, 50 * (i + 1))
            );
        }
    }
}
```

Есть Win32 `ReplaceFile()` с сохранением метаданных — Node не экспонирует через `fs.rename()`.

## Временные файлы и каталоги

### fs.mkdtemp() для временных каталогов

```js
import os from 'node:os';
import path from 'node:path';

const dir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'myapp-')
);
```

Создаёт что-то вроде `/tmp/myapp-a7F3kL` атомарно со случайным суффиксом. `os.tmpdir()` — системный temp.

Для **атомарной записи одного файла** temp кладите в каталог цели, не в `os.tmpdir()`.

`mkdtemp()` — для staging нескольких файлов, изолированных шагов сборки. Для одного файла — random name в каталоге цели с `O_EXCL`.

### TOCTOU и зачем O_EXCL

TOCTOU (time-of-check-time-of-use): проверили, что файла нет, затем создаёте — между проверкой и созданием другой процесс успел создать файл или symlink.

```js
// Уязвимо к TOCTOU:
const exists = await fs.promises.access(tempPath).then(
    () => true,
    () => false
);
if (!exists) {
    await fs.promises.writeFile(tempPath, data);
}
```

Между `access()` и `writeFile()` — конкурент или атакующий на shared системе. `'w'` без `O_EXCL` может писать по symlink.

`'wx'` / `O_EXCL` убирает окно: одна атомарная операция в ядре — создали или `EEXIST`.

Актуально на multi-user, CI, shared dev-машинах и при нескольких экземплярах приложения + cron + deploy в одних каталогах.

### Очистка временных файлов

Temp остаются при краше между созданием temp и rename.

Имена с timestamp: `.tmp-1708538400000-a1b2c3`. При старте — удалять старше порога.

Учёт активных temp в `Set`, удаление в `finally`, на `exit`:

```js
import fs from 'node:fs';

const tracked = new Set();
process.on('exit', () => {
    for (const p of tracked) {
        try {
            fs.unlinkSync(p);
        } catch {}
    }
});
```

На `SIGKILL` и segfault handler не сработает — startup cleanup как страховка. Немного `.tmp-*` в data dir — норма.

Периодическая очистка на сервере:

```js
async function cleanStaleTemps(dir, maxAgeMs = 3600000) {
    const now = Date.now();
    for (const name of await fs.promises.readdir(dir)) {
        const match = /^\.tmp-(\d+)-/.exec(name);
        if (!match || now - Number(match[1]) <= maxAgeMs)
            continue;
        await fs.promises
            .unlink(path.join(dir, name))
            .catch(() => {});
    }
}
```

По умолчанию 1 час. `.catch` — файл уже удалили или rename успел между `readdir` и `unlink`.

## Атомарная запись и file watching вместе

Rename при атомарной записи часто приходит как `'rename'`. Код только на `'change'` пропустит обновление.

Надёжно: watch родительского каталога, игнорировать тип события, перечитать после debounce.

```js
const reload = debounce(async () => {
    try {
        const raw = await fs.promises.readFile(
            configPath,
            'utf8'
        );
        config = JSON.parse(raw);
    } catch (err) {
        console.error('Keeping old config:', err.message);
    }
}, 500);
```

```js
fs.watch(path.dirname(configPath), (event, filename) => {
    if (filename === path.basename(configPath)) reload();
});
```

Любое подходящее событие → попытка reload. Debounce гасит всплеск от rename. `try/catch` — на краткое отсутствие имени при backup-rename. Каталожный watch переживает delete/recreate; file-level на Linux ломается после замены inode.

## Полная реализация атомарной записи

```js
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
```

```js
function tempNameFor(targetPath) {
    const dir = path.dirname(targetPath);
    const suffix = crypto.randomBytes(6).toString('hex');
    return path.join(dir, `.tmp-${Date.now()}-${suffix}`);
}
```

```js
async function atomicWrite(targetPath, data, options = {}) {
    const tempPath = tempNameFor(targetPath);
    const original = await fs.promises
        .stat(targetPath)
        .catch(() => null);
    const writeOptions = {
        ...options,
        mode: original?.mode ?? 0o666,
        flag: 'wx',
    };
    try {
        await fs.promises.writeFile(
            tempPath,
            data,
            writeOptions
        );
        await renameWithRetry(tempPath, targetPath);
    } catch (err) {
        await fs.promises.unlink(tempPath).catch(() => {});
        throw err;
    }
}
```

Temp с timestamp и `O_EXCL`. Сохранение `mode` оригинала. `flag: 'wx'` после опций вызывающего — нельзя случайно отключить exclusive. Атомарный rename. Удаление temp при ошибке. Читатели видят старое или полное новое, не частичное.

Для Windows — retry на `EPERM`/`EACCES`. Для долговечности при отключении питания — `fsync()` на fd temp до close и `fsync()` каталога после rename. Большинству приложений хватает согласованности без directory sync; БД и WAL — другое.

Накладные расходы: одна лишняя запись + rename (для малых конфигов — пренебрежимо; для больших файлов — двойной объём записи, rename почти бесплатен как смена записи каталога). Для append-only логов, ephemeral scratch и регенерируемых артефактов сборки паттерн не обязателен.

### Когда использовать атомарную запись

**Конфигурация** — по умолчанию атомарно. Битый конфиг = сервис не стартует, ручное восстановление дорого; для килобайт JSON цена мала.

**Состояние на диске** — кэши, сессии, feature flags. Атомарность даёт полную старую или полную новую **последовательность байт**, не семантическую валидность — валидируйте до rename, если это важно.

**PID-файлы** — усечённый PID → лишний инстанс у process manager.

Не нужно: append-only логи с допустимым крашем, сами ephemeral temp, артефакты сборки из исходников. Долговечность логов и порядок append из нескольких процессов — отдельные темы.

### Атомарное обновление нескольких файлов через symlink

Temp+rename атомарен для **одного** файла. Несколько файлов (статика, data + index): успешный rename A и краш до B → читатель видит новый A со старым B.

Паттерн symlink swap: все файлы в новую версионированную директорию, затем атомарная подмена symlink «current»:

```js
const newDir = `./data/v-${Date.now()}`;
await fs.promises.mkdir(newDir, { recursive: true });
await fs.promises.writeFile(
    `${newDir}/config.json`,
    configData
);
await fs.promises.writeFile(
    `${newDir}/index.dat`,
    indexData
);
```

```js
const tmpLink = `./data/.current-tmp-${Date.now()}`;
await fs.promises.symlink(newDir, tmpLink);
await fs.promises.rename(tmpLink, './data/current');
```

`rename` symlink на POSIX атомарен: до rename `current` → старая версия, после → новая; читатели по symlink видят согласованный набор. Старые версии — rollback или cleanup. В Windows symlinks могут требовать прав/developer mode — часто другой слой косвенности.

### Долговечность vs согласованность

Атомарная запись даёт **видимую согласованность** (старое или полное новое). **Долговечность** — что переживёт отключение питания.

`fs.writeFile()` пишет в page cache ядра, flush на диск — по расписанию (~30 с). Питание до flush — потеря «записанного».

Нужен `fsync()` на fd temp после записи, до rename:

```js
const handle = await fs.promises.open(tempPath, 'wx');
try {
    await handle.writeFile(data);
    await handle.sync();
} finally {
    await handle.close();
}
await fs.promises.rename(tempPath, targetPath);
```

`handle.sync()` сбрасывает данные и метаданные файла на носитель (с оговорками write cache диска).

Для crash-durable замены — sync **каталога** после rename:

```js
const dir = await fs.promises.open(
    path.dirname(targetPath),
    'r'
);
try {
    await dir.sync();
} finally {
    await dir.close();
}
```

Запись каталога (имя → inode) тоже в cache. SQLite/PostgreSQL так делают; для маленького конфига на каждую запись directory sync обычно избыточен.

File watching и атомарная замена встречаются на границе: **путь изменился** с точки зрения наблюдателя. Колбэк watcher — повод перепроверить состояние, не доказательство конкретной операции. Писатель публикует полные данные. Watcher ждёт, перечитывает, валидирует и меняет состояние приложения только когда новые байты имеют смысл.

## Связанное чтение

-   Предыдущая: [fs.promises и FileHandle](fs-promises-filehandle.md)
-   Далее: [Права, метаданные и краевые случаи](permissions-metadata-edge-cases.md)
