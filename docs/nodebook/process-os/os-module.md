---
description: Модуль os Node.js — CPU, память, сетевые интерфейсы и данные платформы
---

# Модуль os Node.js: CPU, память, сетевые интерфейсы и данные платформы

Источник: [theNodeBook — Node.js os Module](https://www.thenodebook.com/process-os/os-module)

Модуль `os` Node.js — это JavaScript-обёртка для инспекции хоста. Учёт CPU, доступный параллелизм, объёмы памяти, load average, сетевые интерфейсы, идентификаторы платформы, временные пути, записи пользователей и константы — всё это здесь. Объект `process` рассказывает о текущей программе. `os` — о машине, на которой эта программа выполняется.

## Модуль os в Node.js

Большинство значений ресурсов — снимки, собранные через libuv или платформенные API в момент вызова. `os.availableParallelism()` обычно даёт более точную подсказку для конкурентности, чем сырой счётчик CPU: он может учитывать affinity и лимиты CPU quota. Данные сетевых интерфейсов могут включать внутренние, IPv4, IPv6, виртуальные и контейнерные интерфейсы.

`require('node:os')` даёт API Node для инспекции хоста. Объект `process` (разобран в предыдущей главе) сообщает pid, использование памяти, окружение, аргументы и состояние выхода текущей программы. Модуль `os` — о ядрах CPU, общей RAM, адресах интерфейсов, идентификаторах платформы и версии ядра.

```js
const os = require('node:os');
```

Многие функции ресурсов — тонкие обёртки над вызовами libuv, которые сами оборачивают платформенные системные API. Часть значений — константы или идентификаторы времени сборки. `os.platform()` и `os.arch()` не опрашивают ядро при каждом вызове. `os.freemem()` читает актуальное значение памяти. Вызовите её дважды с интервалом в секунду — получите разные числа, если за это время что-то выделило или освободило память.

В модуле `os` около двух десятков функций и несколько констант. Одни — однострочники, которые вызовут один раз при старте. Другие — CPU, память, load average — попадают в дашборды мониторинга, health check endpoints и скрипты планирования ёмкости. CPU и память несут больше всего операционной глубины, поэтому идут первыми.

## Информация о CPU

`os.cpus()` возвращает массив объектов — по одному на каждое логическое ядро CPU.

```js
const cpus = os.cpus();
console.log(cpus.length);
console.log(cpus[0]);
```

Вывод может выглядеть так:

```js
{
  model: 'Apple M1 Pro',
  speed: 2400,
  times: { user: 483200, nice: 0, sys: 198300, idle: 2918400, irq: 0 }
}
```

Строка `model` приходит напрямую из ядра. `speed` — в МГц, базовая тактовая частота. Поле `times` — учёт CPU: пять полей, все в миллисекундах, сколько времени это ядро провело в каждом состоянии с момента загрузки.

`user` — время в пользовательском пространстве: ваше приложение, сам Node.js, всё, что не код ядра. `sys` — время в пространстве ядра: syscalls, планирование, переключения контекста, обработчики прерываний, драйверы устройств. `idle` — ядро простаивало, ждало работы. `nice` — время процессов с пониженным приоритетом («niced»), уступающих CPU другим. В Windows `nice` всегда 0. `irq` — обработка аппаратных прерываний: диск сообщил о завершении I/O, сетевая карта — о пакете, таймер PIT.

Слово «логическое» важно. На машине с 8 физическими ядрами и включённым hyperthreading `os.cpus()` вернёт 16 записей. Каждое физическое ядро ведёт два аппаратных потока, деля execution units. Ядро ОС показывает каждый аппаратный поток как отдельный логический CPU. Если нужен именно физический счёт ядер, `os.cpus().length` на hyperthreaded-машинах завышает. Apple Silicon иначе: performance- и efficiency-ядра, все по отдельности, без hyperthreading. M1 Pro с 8 performance и 2 efficiency — 10 записей.

У поля `speed` свои нюансы. На Intel с Turbo Boost или AMD с Precision Boost сообщается базовая частота. Boost может быть намного выше: CPU под нагрузкой на 4,8 ГГц, а `os.cpus()` показывает 2400 МГц. На Apple Silicon — частота performance-ядер; efficiency-ядра медленнее, но все записи в массиве показывают одно и то же значение `speed` независимо от типа ядра. Поле — в лучшем случае приближение.

### Расчёт загрузки CPU

Один снимок `os.cpus()` даёт накопленные с загрузки totals — бесполезно для «что CPU делает прямо сейчас». Нужны два снимка и дельта.

```js
function cpuAverage() {
    const cpus = os.cpus();
    let idle = 0,
        total = 0;
    for (const { times: t } of cpus) {
        idle += t.idle;
        total += t.user + t.nice + t.sys + t.idle + t.irq;
    }
    return {
        idle: idle / cpus.length,
        total: total / cpus.length,
    };
}
```

Два замера с интервалом в секунду, вычитание первого из второго — дельта:

```js
const start = cpuAverage();
setTimeout(() => {
    const end = cpuAverage();
    const idleDiff = end.idle - start.idle;
    const totalDiff = end.total - start.total;
    console.log(
        `CPU usage: ${(
            100 -
            (idleDiff / totalDiff) * 100
        ).toFixed(1)}%`
    );
}, 1000);
```

Математика: total минус idle — busy time. Busy / total × 100. Чем шире окно выборки, тем сглаженнее показание. 1 секунда — нормально для дашбордов. Для алертов в реальном времени 5 секунд сглаживают всплески, вызывающие ложные срабатывания.

Можно считать загрузку по ядрам, а не усреднять. Это информативнее: однопоточная нагрузка может забить одно ядро на 100%, остальные простаивают — среднее на 16 ядрах покажет ~6%. Дельты по ядрам это покажут.

```js
function perCoreDelta(prev, curr) {
    return curr.map((cpu, i) => {
        const p = prev[i].times,
            c = cpu.times;
        const idle = c.idle - p.idle;
        const total =
            c.user +
            c.sys +
            c.idle +
            c.nice +
            c.irq -
            (p.user + p.sys + p.idle + p.nice + p.irq);
        return ((1 - idle / total) * 100).toFixed(1);
    });
}
```

Получите массив процентов по ядрам. Полезно для thread pinning и распределения нагрузки. В production-сэмплерах стоит учитывать CPU hotplug, пропущенные записи и нулевую total-дельту при очень коротких окнах.

## os.availableParallelism()

Появилось в Node 19.4 и backport в 18.14. Возвращает, сколько потоков runtime реально может использовать для параллельной работы.

```js
os.availableParallelism(); // 4 (в контейнере с лимитом 4 ядра)
os.cpus().length; // 64 (на хосте 64 ядра)
```

На bare metal числа обычно совпадают. В контейнерах могут расходиться. `os.cpus().length` — логические CPU через API информации о CPU; во многих контейнерах это счёт хоста, а не quota. `os.availableParallelism()` — API для sizing с учётом affinity и quota.

При размере пулов потоков или воркеров берите `os.availableParallelism()`. `os.cpus().length` в контейнере на 2 CPU даст 64 потока на 2 ядра — thrashing вместо параллелизма. Это касается и thread pool libuv (глава 1): дефолтный `UV_THREADPOOL_SIZE` 4 уместен при 4+ ядрах, но при 1 CPU в контейнере даже 4 потока дают лишние переключения контекста.

Внутри вызывается `uv_available_parallelism()` libuv. На Linux libuv сначала считает CPU, разрешённые маской affinity через `sched_getaffinity()`, при неудаче — `sysconf(_SC_NPROCESSORS_ONLN)`, затем снижает результат, если cgroup CPU quota меньше. На macOS — `hw.activecpu`, затем `hw.logicalcpu`, затем `hw.ncpu`. На Windows — CPU в маске affinity текущего процесса.

Путь cgroup стоит понимать. В cgroups v2 `cpu.max` — два значения: `quota period`. Лимит 2 CPU может быть `200000 100000`: 200 000 мкс CPU на 100 000 мкс wall time — два ядра. libuv читает текущий cgroup из `/proc/self/cgroup`, обходит иерархию, делит quota на period целочисленно и для очень малых положительных quota ставит минимум `1`. При quota `max` остаётся affinity или online CPU count.

## Память на уровне системы и процесса

`os.totalmem()` — общая RAM системы в байтах. `os.freemem()` — сколько доступно.

```js
const total = os.totalmem();
const free = os.freemem();
const usedPct = ((1 - free / total) * 100).toFixed(1);
console.log(`${usedPct}% memory used`);
```

Это системные числа. `process.memoryUsage()` (первая подглава) — RSS, heap и external память вашего процесса Node. Другой масштаб. `os.freemem()` — вся машина; `process.memoryUsage().rss` — только ваш процесс.

Смысл «свободной» памяти различается по ОС — это важно знать.

На Linux `os.freemem()` читает `MemAvailable` из `/proc/meminfo`. Оценка ядра, сколько памяти можно выделить новым приложениям с учётом page cache и reclaimable slab, которые ядро отожмёт под давлением. Лучше, чем `MemFree` — только страницы, которые никогда не использовались или явно освобождены. На загруженном Linux может быть 200 МБ `MemFree` и 8 ГБ `MemAvailable`: остальное — disk cache, который отдадут при необходимости.

Поле, которое вы меряете, важно для health check. Алерт «свободной памяти меньше 500 МБ» требует понимания, какой именно «free». `MemFree` на busy Linux-сервере почти всегда крошечный — норма: ядро заполняет RAM кэшем, пустая RAM пропадает зря. `MemAvailable` — лучший сигнал ёмкости.

На macOS вызов идёт в Mach VM. Память: wired (ядро, навсегда в RAM), active (недавний доступ), inactive (кэш, reclaimable), free (не выделена). libuv складывает inactive и free — inactive доступна для новых аллокаций. На Windows `GlobalMemoryStatusEx` даёт `ullAvailPhys` с учётом reclaimable cache.

`os.totalmem()` предсказуемее: установленная RAM как видит ОС. На 16 ГБ — около 16 ГБ минус 300–500 МБ на firmware и резервы железа.

### Память в контейнерах

В модуле `os` асимметрия осведомлённости о контейнерах. `os.availableParallelism()` уважает cgroup CPU limits. `os.totalmem()` и `os.freemem()` в контейнере с лимитом 512 МБ всё равно показывают хост: 64 ГБ, если столько на машине.

Node знает о лимитах памяти процесса — автоподстройка `--max-old-space-size` использует это, когда доступно. Модуль `os` отдаёт память хоста. Для реального потолка контейнера — process-level API, а не ручной разбор cgroup-файлов.

```js
function memoryHealth() {
    const rss = process.memoryUsage().rss;
    const limit = process.constrainedMemory();
    const available = process.availableMemory();
    return { rss, limit, available };
}
```

`process.constrainedMemory()` возвращает число — лимит памяти процесса, когда Node его определяет; документированный fallback при отсутствии ограничения — `0`, на части Linux возможен sentinel «без лимита» больше физической RAM. В мониторинге трактуйте `0` или значение больше `os.totalmem()` как «нет меньшего process limit». `process.availableMemory()` — свободная память для процесса с учётом ОС и cgroup. В production сравнивайте `process.memoryUsage().rss` с лимитом процесса, а не с `os.totalmem()`, если контейнер 512 МБ на хосте 64 ГБ.

## Load average

```js
os.loadavg(); // [1.34, 2.01, 1.87]
```

Три числа: экспоненциально взвешенные скользящие средние за 1, 5 и 15 минут. В Windows всегда `[0, 0, 0]` — эквивалентной метрики ядра нет.

Load average — спрос на вычислительные ресурсы: среднее число процессов, выполняющихся на CPU, и ждущих в run queue. В Linux также uninterruptible sleep — обычно ожидание disk I/O на syscall, который нельзя прервать. Специфика Linux. FreeBSD и macOS в load average считают в основном runnable.

Включение I/O-wait в Linux делает load average мерой общего спроса, включая I/O. Тяжёлый disk I/O — высокий load при низком CPU. На macOS те же процессы дадут меньший load.

Интерпретация: сравнивайте load с числом CPU. На 4 ядрах load 4.0 — все ядра заняты, очередь пуста. Load 8.0 — в среднем 4 процесса работают и 4 ждут ядра. Ниже 4.0 — запас ёмкости.

```js
const load1m = os.loadavg()[0];
const cpuCount = os.availableParallelism();
const ratio = load1m / cpuCount;
```

`ratio` выше 1.0 — run queue переполнена. Выше 0.7 — по опыту стоит присмотреться. Ниже 0.3 — машина в основном простаивает. Это ориентиры: I/O-heavy нагрузки терпят больший load, потому что часть «нагрузки» — сон на диске, а не CPU.

15-минутное среднее сглаживает всплески. 1 мин = 12, 15 мин = 2 — краткий burst. Все три растут — устойчивый рост. 1 мин падает при высоком 15 мин — всплеск прошёл, среднее затухает. Экспоненциальное взвешивание: недавние секунды важнее старых внутри окна.

Ядро Linux обновляет load каждые 5 секунд. Между обновлениями значение устаревает. 1-минутное — decay с постоянной времени 1 минута, сэмпл каждые 5 с: `load(t) = load(t-1) * exp(-5/60) + n * (1 - exp(-5/60))`, где `n` — текущее число runnable+uninterruptible. 5 и 15 минут — та же формула с другими константами.

На macOS ядро считает похоже по глубине run queue Mach scheduler, но интервал сэмплинга и константы decay чуть другие — прямое сравнение Linux-сервера и macOS dev-машины некорректно. Load average — для трендов на одной машине, не для кроссплатформенного сравнения.

## Сетевые интерфейсы

`os.networkInterfaces()` — объект по имени интерфейса. Значение — массив адресов: один интерфейс часто имеет IPv4 и IPv6, иногда несколько каждого.

```js
const interfaces = os.networkInterfaces();
console.log(Object.keys(interfaces));
// ['lo0', 'en0', 'en1', 'utun0', 'awdl0', 'bridge0']
```

Имена интерфейсов зависят от ОС. `en0` — обычно основной на macOS (Wi‑Fi или Ethernet). На Linux: `eth0`, `ens3`, `wlp2s0`, `enp0s25`. `lo0` / `lo` — loopback. `utun` на macOS — VPN. `docker0` на хосте с Docker. `veth*` — пары veth контейнер–bridge.

Поля объекта адреса:

```js
{
  address: '192.168.1.42',
  netmask: '255.255.255.0',
  family: 'IPv4',
  mac: 'a4:83:e7:2b:1f:c0',
  internal: false,
  cidr: '192.168.1.42/24'
}
```

`internal: true` для loopback (127.0.0.1, ::1). `family` — `'IPv4'` или `'IPv6'`. `cidr` — адрес и длина префикса. `mac` — MAC в hex через двоеточие. `scopeid` на link-local IPv6 (fe80::) — идентификатор интерфейса, т.к. link-local привязаны к интерфейсу.

Типичная задача — внешний IPv4 хоста:

```js
function getExternalIPv4() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal)
                return net.address;
        }
    }
}
```

Берётся первый не-internal IPv4. При нескольких интерфейсах порядок не гарантирован — может вернуться IP Docker bridge вместо LAN. Фильтруйте по имени интерфейса или подсети. На серверах с bonding, VPN и docker0 несколько non-internal адресов — порядок зависит от перечисления ядром.

`os.networkInterfaces()` возвращает только интерфейсы с назначенным адресом. Порт с кабелем без DHCP lease не появится. Административно выключенные тоже не видны. Данные — снимок: после DHCP с новым IP кэш устарел.

Про MAC: на loopback `'00:00:00:00:00:00'`. У части virtual/tun/VPN — нули. На bare metal MAC в прошивке NIC. В VM и контейнерах — виртуальный MAC от гипервизора/runtime. Docker генерирует MAC из пула по ID контейнера. MAC для fingerprinting или лицензий в virtual/container средах ненадёжен.

IPv6 в выводе часто есть, даже если IPv6 «не используете»: современные ОС настраивают link-local (fe80::) на активных интерфейсах. Идентификатор интерфейса может быть EUI-64, но дефолты ОС чаще stable privacy или random token, а не MAC-derived. Обычно минимум две записи на физический интерфейс: IPv4 и link-local IPv6.

## Платформа и архитектура

Несколько функций возвращают строки идентификации системы. Пересекаются по смыслу, но источники разные.

`os.platform()` — то же, что `process.platform`: `'linux'`, `'darwin'`, `'win32'`, `'freebsd'`, `'openbsd'`, `'sunos'`, `'aix'`. Платформа, под которую собран Node, compile-time константа.

`os.type()` на Unix вызывает `uname()` и возвращает имя системы. Linux — `'Linux'`. macOS — `'Darwin'`. Windows — `'Windows_NT'`. Отличие от `os.platform()`: `os.type()` — runtime syscall, `os.platform()` — compile-time. На практике согласуются. `os.type()` — conventional uname (`'Darwin'`), `os.platform()` — нормализованный идентификатор Node (`'darwin'`).

`os.arch()` — архитектура CPU: `'x64'`, `'arm64'`, `'ia32'`, `'arm'`, `'s390x'`, `'ppc64'`, `'mips'`, `'riscv64'`. Как `process.arch`. Compile-time — архитектура сборки Node.

`os.machine()` (Node 18.9+) — `uname()`, имя железа как в ядре, без нормализации. Apple Silicon: `os.arch()` и `os.machine()` — `'arm64'`. x86_64 Linux: `os.arch()` — `'x64'`, `os.machine()` — `'x86_64'`. Node нормализует имена; `os.machine()` — дословно из ядра.

```js
console.log(os.platform()); // 'darwin'
console.log(os.type()); // 'Darwin'
console.log(os.arch()); // 'arm64'
console.log(os.machine()); // 'arm64'
```

`os.release()` — строка версии ядра. Linux: `'5.15.0-76-generic'`. macOS: `'23.1.0'` (Darwin kernel, не маркетинговая «Sonoma 14.1»). Windows: `'10.0.22621'`.

`os.version()` (Node 13+) — полная строка версии ОС. macOS: длинная строка Darwin Kernel Version… Linux: `'#86-Ubuntu SMP Mon Oct 2…'` — build string ядра, не надёжный идентификатор дистрибутива. Для «Ubuntu», «Debian», версии образа — `/etc/os-release`.

Нюанс Windows: `os.release()` `'10.0.22621'` и для Windows 10, и для 11 — внутренний номер остался 10.0.x. Windows 11 — build ≥ 22000, из одного `os.release()` «Windows 11» не вывести. `os.version()` на Windows — `'Windows 10 Pro'` / `'Windows 11 Home'` из реестра через libuv, удобнее для отображения.

Эти значения — platform detection, нативные бинарники, startup-логи, user-agent, CLI с разным поведением на Windows и Unix.

```js
const binPath = `./vendor/${os.platform()}-${os.arch()}/tool`;
```

Паттерн `platform-arch` в пути — как у `esbuild` и `swc`: отдельные каталоги или optional dependencies (`esbuild-darwin-arm64`, `esbuild-linux-x64`).

## Системные пути и идентичность

`os.hostname()` — hostname системы. На Unix обычно как `hostname`. В облаке — instance ID или `ip-10-0-1-43.ec2.internal`. В Kubernetes pod — часто имя pod.

```js
os.hostname(); // 'macbook-pro.local'
```

Реализация: `uv_os_gethostname()` → `gethostname()` на Unix, `GetComputerNameExW()` на Windows. Hostname может мениться во время работы процесса; каждый вызов — текущее значение.

`os.homedir()` — домашний каталог текущего пользователя. Unix: сначала `HOME`, иначе passwd через `getpwuid_r()`. Windows: `USERPROFILE`, иначе `HOMEDRIVE` + `HOMEPATH`. Переменная окружения важнее — изменённый `HOME` меняет результат.

`os.tmpdir()` — каталог временных файлов по умолчанию. Unix: `TMPDIR`, `TMP`, `TEMP`, иначе `/tmp`. Windows: `TEMP`, `TMP`, иначе `%SystemRoot%\temp` / `%windir%\temp`.

```js
os.homedir(); // '/Users/ishtmeet'
os.tmpdir(); // '/tmp'
```

Обе функции чувствительны к env. `TMPDIR=/scratch` — `os.tmpdir()` вернёт `/scratch`. Хардкод `/tmp` ломается в CI и контейнерах с нестандартным temp. Для переносимости — `os.tmpdir()`.

На macOS `os.tmpdir()` часто `/var/folders/xx/…/T/`, не `/tmp`: macOS выставляет per-user `TMPDIR`. `/tmp` есть, но `os.tmpdir()` туда не указывает.

## Информация о пользователе

```js
const info = os.userInfo();
```

Объект: `uid`, `gid`, `username`, `homedir`, `shell`. На Unix — `getpwuid_r()` по effective UID процесса (потокобезопасный `_r`).

```js
{
  uid: 501,
  gid: 20,
  username: 'ishtmeet',
  homedir: '/Users/ishtmeet',
  shell: '/bin/zsh'
}
```

`homedir` из `os.userInfo()` — из passwd / directory services. `os.homedir()` — сначала `HOME`. При `HOME=/custom node app.js` `os.homedir()` — `/custom`, `os.userInfo().homedir` — системный home. Для приложений чаще прав `os.homedir()` — уважает runtime-конфигурацию.

На Windows `uid` и `gid` — `-1` (нет Unix numeric ID, есть SID). `username` — `GetUserNameW`. `shell` — `null`.

Опция `encoding`: по умолчанию `'utf8'`. `{ encoding: 'buffer' }` — Buffer для полей, если путь/имя не в UTF-8 (legacy locale, редко).

## Переводы строк и endianness

`os.EOL` — `'\n'` на Unix, `'\r\n'` на Windows. Константа.

```js
const lines = ['first line', 'second line', 'third line'];
const output = lines.join(os.EOL);
```

Для файлов «на этой же платформе» `os.EOL` согласует с конвенцией ОС. Для кроссплатформенных JSON, YAML, git — чаще явный `'\n'`. `core.autocrlf` и парсеры обычно справляются с `'\n'`. `os.EOL` важен для консоли и логов, которые читают системные утилиты.

`os.endianness()` — `'LE'` или `'BE'`. x86, x64, ARM в стандартном режиме — `'LE'`. Big-endian Node сейчас редок: часть POWER, MIPS, embedded. Для бинарных протоколов чаще явные `Buffer.readInt32BE()` / `readInt32LE()` по спецификации протокола, а не host endianness.

## Uptime системы

```js
os.uptime(); // 847293
```

Uptime хоста в секундах с последней загрузки. Сервер 10 дней — ~864 000. `process.uptime()` — uptime процесса Node, обычно намного меньше.

Linux: `/proc/uptime` (первое число). macOS: `sysctl` `KERN_BOOTTIME`, разница с текущим временем. Windows: `GetTickCount64()` / 1000.

Полезно в health check: `os.uptime()` < 300 с — недавняя перезагрузка хоста. В контейнере `os.uptime()` — хост; uptime контейнера — `process.uptime()` (если Node стартует с контейнером) или `/proc/1/stat` init-процесса.

## os.constants

Объект констант: чаще всего `os.constants.signals`, `os.constants.errno`, `os.constants.priority` — имена к числовым значениям.

```js
os.constants.signals.SIGTERM; // 15
os.constants.signals.SIGKILL; // 9
os.constants.signals.SIGINT; // 2
```

Объект signals — константы платформы для Node. Linux/macOS: POSIX-имена `SIGHUP`, `SIGINT`, `SIGTERM`, `SIGKILL`, `SIGUSR1`, `SIGUSR2`; RT-сигналы Linux вне объекта. Windows: `SIGINT`, `SIGTERM`, `SIGKILL`, `SIGBREAK` и родственные. Обработка сигналов — предыдущая подглава; `os.constants.signals` — программный доступ к номерам.

```js
os.constants.errno.ENOENT; // 2
os.constants.errno.EACCES; // 13
os.constants.errno.EADDRINUSE; // 98 (Linux) или 48 (macOS)
```

Errno — положительные целые, зависят от платформы. `EADDRINUSE` — 98 на Linux, 48 на macOS. Объекты ошибок Node обычно дают portable `err.code` вроде `'EADDRINUSE'` и могут иметь отрицательный `err.errno` (libuv). Не смешивайте: `os.constants.errno` — номера ОС, libuv return codes — отрицательные `UV_E*`. В коде проверяйте `err.code`, не хардкодьте числа.

Есть `os.constants.priority` для уровней приоритета процесса:

```js
os.constants.priority.PRIORITY_LOW; // 19
os.constants.priority.PRIORITY_BELOW_NORMAL; // 10
os.constants.priority.PRIORITY_NORMAL; // 0
os.constants.priority.PRIORITY_HIGH; // -14
```

Используются с `os.getPriority()` и `os.setPriority()` ниже.

## Приоритет процесса

`os.getPriority()` и `os.setPriority()` — планирование приоритета.

```js
os.getPriority(); // 0 (нормальный для текущего процесса)
os.getPriority(1234); // приоритет процесса 1234
```

Без аргументов или `0` — текущий процесс. PID — другой процесс. Возврат — Unix «nice»: 0 норма, положительные ниже приоритет (до 19), отрицательные выше (до -20).

```js
os.setPriority(os.constants.priority.PRIORITY_LOW);
```

`PRIORITY_LOW` (19) — уступать CPU другим. Фоновые воркеры, batch, обслуживание. `PRIORITY_HIGH` (-14) — предпочтение планировщика, но повышение может требовать привилегий.

На Linux — `setpriority()` / `getpriority()`. Обычный пользователь может повысить nice (снизить свой приоритет). Понижение nice — `CAP_SYS_NICE`, root или `RLIMIT_NICE`. На Windows константы мапятся на priority classes Windows.

Типичная ошибка: `os.setPriority(pid, priority)` без обработки `EACCES` / `EPERM` — `ERR_SYSTEM_ERROR`. Оборачивайте в try/catch.

Практика: фоновый job processor рядом с HTTP на одной VM — `PRIORITY_BELOW_NORMAL` для фона. В отдельных контейнерах изоляцию даёт scheduler контейнеров; на shared VM/bare metal приоритет — рабочий рычаг.

## Как устроены os.cpus() и os.freemem() внутри

Тяжёлые API `os` — нативные биндинги, libuv и платформенные интерфейсы ядра. Константы и build-time ID — короче. Цепочка CPU information показывает глубину абстракции.

`os.cpus()` в C++ вызывает `uv_cpu_info()`, выделяет массив `uv_cpu_info_t` по-разному на каждой платформе.

**Linux.** libuv открывает `/proc/stat`, парсит строки per-CPU:

```
cpu0 10132153 290696 3084719 46828483 16683 0 25195 0 0 0
```

По порядку: user, nice, system, idle, iowait, irq, softirq, steal, guest, guest_nice — в clock ticks (jiffies). Jiffy обычно 10 мс при `CONFIG_HZ=100`, бывает 250 или 1000. libuv нормализует в миллисекунды: деление на `sysconf(_SC_CLK_TCK)` × 1000. Модель CPU — `/proc/cpuinfo` (`model name`), speed — `cpu MHz`.

`iowait` — CPU idle при outstanding I/O; libuv вкладывает в `idle`. `steal` — гипервизор отдал vCPU другой VM (облако). `guest` / `guest_nice` — гостевая VM; ядро учитывает их в user/nice.

На 32-bit счётчики times могут переполниться: per-CPU jiffies как `unsigned long` 32-bit. При HZ=100 overflow ~497 дней uptime — дельты и проценты CPU становятся мусором. На 64-bit счётчики 64-bit. Для долгоживущего Node на 32-bit embedded — учитывайте wrap.

**macOS.** `host_processor_info()` с `PROCESSOR_CPU_LOAD_INFO` — `processor_cpu_load_info` на логическое CPU, `cpu_ticks`: USER, SYSTEM, IDLE, NICE. IRQ в system. Тики Mach → мс через `mach_timebase_info()`. Модель/speed: sysctl `machdep.cpu.brand_string`, `hw.cpufrequency`. На Apple Silicon одна частота для всех записей — P/E cores через API не различить.

**Windows.** `GetSystemInfo()` для count, `NtQuerySystemInformation(SystemProcessorPerformanceInformation)` для timing в 100-ns (FILETIME). Модель — реестр `HKLM\HARDWARE\DESCRIPTION\System\CentralProcessor\0\ProcessorNameString`, MHz — `~MHz` в том же ключе.

Память: `os.freemem()` → `uv_get_free_memory()`.

**Linux.** `/proc/meminfo`, `MemAvailable`. До ядра 3.14 (2014) fallback на `MemFree` — только полностью свободные страницы vs оценка с reclaimable cache/slab. `os.totalmem()` → `uv_get_total_memory()`, `MemTotal`.

**macOS.** Free: `host_statistics64(HOST_VM_INFO64)`, `free_count` + `inactive_count` × `vm_page_size` (16384 на Apple Silicon, 4096 на Intel). Total: `sysctl HW_MEMSIZE`. Модель wired/active/inactive/speculative/free; «free» alone на busy Mac низкий — RAM под кэш.

**Windows.** `GlobalMemoryStatusEx`: `ullAvailPhys`, `ullTotalPhys`, с учётом reclaimable cache.

`uv_get_constrained_memory()` → `process.constrainedMemory()` (Node 19.6+): cgroup v2 `memory.max`/`memory.high`, v1 `memory.limit_in_bytes`, rlimits. `uv_get_available_memory()` → `process.availableMemory()`. Модуль `os` их не экспортирует — давление памяти процесса на `process`, не на `os`.

## Практические паттерны

Health check для monitoring endpoint:

```js
function systemHealth() {
    const cpus = os.availableParallelism();
    const loadPerCpu = os.loadavg()[0] / cpus;
    const total = os.totalmem(),
        cap = process.constrainedMemory();
    const limit = cap > 0 && cap < total ? cap : total;
    const availableMb = Math.round(
        process.availableMemory() / 1048576
    );
    const limitMb = Math.round(limit / 1048576);
    return { cpus, loadPerCpu, availableMb, limitMb };
}
```

Для platform-conditional логики кэшируйте — `os.platform()` константа, но вызовы в hot path накапливаются:

```js
const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';
const isLinux = os.platform() === 'linux';
```

Поиск IP машины для service discovery:

```js
function getServiceAddress() {
    for (const [n, addrs] of Object.entries(
        os.networkInterfaces()
    )) {
        const v4 = addrs.find(
            (a) => a.family === 'IPv4' && !a.internal
        );
        if (v4)
            return {
                interface: n,
                address: v4.address,
                cidr: v4.cidr,
            };
    }
    return null;
}
```

В Kubernetes pod IP часто нужен для bind HTTP. Service mesh sidecars (Envoy, Linkerd) — pod IP для прокси. Health endpoints — на каком адресе слушаем. `os.networkInterfaces()` — runtime discovery вместо хардкода или только env.

«Первый non-internal IPv4» на хостах с Docker bridge, VPN и несколькими NIC — лишь первый кандидат. Регистрация сервиса: явная env-переменная, allowlist интерфейсов или match подсети.

### Логирование при старте

Информация о системе при старте процесса — частый паттерн для разбора production:

```js
const hostTotal = os.totalmem();
const constrained = process.constrainedMemory();
const limit =
    constrained > 0 && constrained < hostTotal
        ? constrained
        : hostTotal;
```

Логируйте и память хоста, и лимит процесса:

```js
console.log({
    hostname: os.hostname(),
    platform: `${os.platform()}-${os.arch()}`,
    cpus: os.availableParallelism(),
    hostMemMb: Math.round(hostTotal / 1048576),
    limitMemMb: Math.round(limit / 1048576),
    availableMemMb: Math.round(
        process.availableMemory() / 1048576
    ),
});
```

В 3 ночи по логам разница «2 CPU и 512 МБ лимит» vs «64 CPU и 256 ГБ хоста» меняет диагноз. Эти поля убирают догадки при инциденте.

## Чего модуль os не покрывает

Разбивка памяти процесса — `process.memoryUsage()`. Uptime процесса — `process.uptime()`. Переменные окружения — `process.env`. `os` — только инспекция уровня машины.

Дисковой информации нет: нет `os.diskfree()` / `os.disks()`. Для диска — `fs.statfs()` (Node 18.15+): total/free/available для ФС по пути; перечислить все mount point встроенными API Node нельзя.

GPU — вне `os`: VRAM, температура, utilization — native addons, `nvidia-smi`, платформенные API.

Батареи нет: нет `os.battery()`. Linux — `/sys/class/power_supply/`, macOS — IOKit, Windows — `GetSystemPowerStatus()`. libuv/Node это не оборачивают.

Температура, вентиляторы, прочий hardware monitoring — тоже вне scope. `os` даёт то, что оборачивает libuv для I/O-серверного ПО: CPU, память, сеть, идентичность платформы.

Списка процессов нет: нет `os.processes()`. Linux — `/proc/<pid>`, macOS — `sysctl KERN_PROC`, Windows — `CreateToolhelp32Snapshot()`. Библиотеки вроде `ps-list` — обёртки; из коробки Node не даёт.

`os` почти везде read-only. Исключение — `os.setPriority()`. Hostname, интерфейсы, лимиты памяти, sysctl через `os` не меняются — child process с привилегированными командами или native addons.

Практическое правило: `os` — пассивная инспекция хоста. `process` — текущая программа. `fs`, child processes или native code — файловые системы, устройства, привилегированная конфигурация.

## Связанное чтение

-   Предыдущая: [Сигналы и коды выхода Node.js](./signals-exit-codes.md)
-   Далее: [Стандартный ввод-вывод Node.js](./standard-io.md)
