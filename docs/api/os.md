---
title: Операционная система
description: Модуль node:os — методы и свойства для сведений об операционной системе
---

# Операционная система

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/os.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/os.js -->

Модуль `node:os` предоставляет утилиты, связанные с операционной системой. Подключение:

=== "MJS"

    ```js
    import os from 'node:os';
    ```

=== "CJS"

    ```js
    const os = require('node:os');
    ```

## `os.EOL`

<!-- YAML
added: v0.7.8
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Маркер конца строки для текущей ОС.

* `\n` в POSIX
* `\r\n` в Windows

## `os.availableParallelism()`

<!-- YAML
added:
  - v19.4.0
  - v18.14.0
-->

* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Оценка рекомендуемой степени параллелизма для программы.
Всегда возвращает значение больше нуля.

Тонкая обёртка над [`uv_available_parallelism()`](https://docs.libuv.org/en/v1.x/misc.html#c.uv_available_parallelism) в libuv.

## `os.arch()`

<!-- YAML
added: v0.5.0
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Архитектура ЦП, под которую скомпилирован бинарник Node.js. Возможные значения:
`'arm'`, `'arm64'`, `'ia32'`, `'loong64'`,
`'mips'`, `'mipsel'`, `'ppc64'`, `'riscv64'`, `'s390x'` и `'x64'`.

Эквивалентно [`process.arch`](process.md#processarch).

## `os.constants`

<!-- YAML
added: v6.3.0
-->

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Часто используемые константы ОС: коды ошибок, сигналы процесса и т.д. Перечень —
в разделе [Константы ОС](#os-constants).

## `os.cpus()`

<!-- YAML
added: v0.3.3
-->

* Возвращает: [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Массив объектов с информацией о каждом логическом ядре ЦП.
Пустой массив, если сведений нет (например, недоступна `/proc`).

Свойства каждого объекта:

* `model` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `speed` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) (в МГц)
* `times` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `user` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) миллисекунды в пользовательском режиме
  * `nice` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) миллисекунды в режиме nice
  * `sys` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) миллисекунды в режиме ядра
  * `idle` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) миллисекунды в простое
  * `irq` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) миллисекунды обработки IRQ

<!-- eslint-disable @stylistic/js/semi -->

```js
[
  {
    model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 252020,
      nice: 0,
      sys: 30340,
      idle: 1070356870,
      irq: 0,
    },
  },
  {
    model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 306960,
      nice: 0,
      sys: 26980,
      idle: 1071569080,
      irq: 0,
    },
  },
  {
    model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 248450,
      nice: 0,
      sys: 21750,
      idle: 1070919370,
      irq: 0,
    },
  },
  {
    model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 256880,
      nice: 0,
      sys: 19430,
      idle: 1070905480,
      irq: 20,
    },
  },
]
```

Значения `nice` только для POSIX. В Windows у всех процессоров `nice` всегда 0.

Не используйте `os.cpus().length` для оценки доступного параллелизма.
Для этого используйте [`os.availableParallelism()`](#osavailableparallelism).

## `os.devNull`

<!-- YAML
added:
  - v16.3.0
  - v14.18.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Путь к нулевому устройству для текущей платформы.

* `\\.\nul` в Windows
* `/dev/null` в POSIX

## `os.endianness()`

<!-- YAML
added: v0.9.4
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строка с порядком байт ЦП, под которое скомпилирован бинарник Node.js.

Возможные значения: `'BE'` (big-endian) и `'LE'` (little-endian).

## `os.freemem()`

<!-- YAML
added: v0.3.3
-->

* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Объём свободной оперативной памяти в байтах (целое число).

## `os.getPriority([pid])`

<!-- YAML
added: v10.10.0
-->

* `pid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор процесса для запроса приоритета планирования.
  **По умолчанию:** `0`.
* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Приоритет планирования процесса `pid`. Если `pid` не передан или равен `0`, возвращается приоритет текущего процесса.

## `os.homedir()`

<!-- YAML
added: v2.3.0
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строка с путём домашнего каталога текущего пользователя.

В POSIX используется переменная `$HOME`, если задана. Иначе —
[эффективный UID][EUID] для поиска домашнего каталога.

В Windows — переменная `USERPROFILE`, если задана. Иначе — путь к каталогу профиля.

## `os.hostname()`

<!-- YAML
added: v0.3.3
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя хоста ОС в виде строки.

## `os.loadavg()`

<!-- YAML
added: v0.3.3
-->

* Возвращает: [`<number[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Массив из средних нагрузок за 1, 5 и 15 минут.

Средняя нагрузка — показатель активности системы, вычисляемый ОС дробным числом.

Понятие характерно для Unix. В Windows всегда `[0, 0, 0]`.

## `os.machine()`

<!-- YAML
added:
  - v18.9.0
  - v16.18.0
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Тип машины строкой, например `arm`, `arm64`, `aarch64`,
`mips`, `mips64`, `ppc64`, `ppc64le`, `s390x`, `i386`, `i686`, `x86_64`.

В POSIX тип определяется вызовом [`uname(3)`](https://linux.die.net/man/3/uname). В Windows — `RtlGetVersion()`, при недоступности — `GetVersionExW()`. См. также
<https://en.wikipedia.org/wiki/Uname#Examples>.

## `os.networkInterfaces()`

<!-- YAML
added: v0.6.0
changes:
  - version: v18.4.0
    pr-url: https://github.com/nodejs/node/pull/43054
    description: The `family` property now returns a string instead of a number.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41431
    description: The `family` property now returns a number instead of a string.
-->

Добавлено в: v0.6.0

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект с сетевыми интерфейсами, которым назначен адрес.

Каждый ключ — имя интерфейса; значение — массив объектов с описанием назначенного адреса.

Свойства объекта адреса:

* `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) назначенный IPv4 или IPv6
* `netmask` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) маска сети IPv4 или IPv6
* `family` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `IPv4` или `IPv6`
* `mac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) MAC-адрес интерфейса
* `internal` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` для петлевых и аналогичных недоступных извне интерфейсов; иначе `false`
* `scopeid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) числовой IPv6 scope ID (только при `family` равном `IPv6`)
* `cidr` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) адрес в нотации CIDR с префиксом маршрутизации. При неверной `netmask` — `null`.

<!-- eslint-skip -->

```js
{
  lo: [
    {
      address: '127.0.0.1',
      netmask: '255.0.0.0',
      family: 'IPv4',
      mac: '00:00:00:00:00:00',
      internal: true,
      cidr: '127.0.0.1/8'
    },
    {
      address: '::1',
      netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      family: 'IPv6',
      mac: '00:00:00:00:00:00',
      scopeid: 0,
      internal: true,
      cidr: '::1/128'
    }
  ],
  eth0: [
    {
      address: '192.168.1.108',
      netmask: '255.255.255.0',
      family: 'IPv4',
      mac: '01:02:03:0a:0b:0c',
      internal: false,
      cidr: '192.168.1.108/24'
    },
    {
      address: 'fe80::a00:27ff:fe4e:66a1',
      netmask: 'ffff:ffff:ffff:ffff::',
      family: 'IPv6',
      mac: '01:02:03:0a:0b:0c',
      scopeid: 1,
      internal: false,
      cidr: 'fe80::a00:27ff:fe4e:66a1/64'
    }
  ]
}
```

## `os.platform()`

<!-- YAML
added: v0.5.0
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строка с платформой ОС, под которую скомпилирован бинарник Node.js. Значение задаётся при сборке.
Возможные значения: `'aix'`, `'darwin'`, `'freebsd'`,`'linux'`,
`'openbsd'`, `'sunos'` и `'win32'`.

Эквивалентно [`process.platform`](process.md#processplatform).

Может вернуться `'android'`, если Node.js собран для Android.
[Поддержка Android экспериментальна][Android building].

## `os.release()`

<!-- YAML
added: v0.3.3
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строка с версией выпуска ОС.

В POSIX — через [`uname(3)`](https://linux.die.net/man/3/uname). В Windows — `GetVersionExW()`. См.
<https://en.wikipedia.org/wiki/Uname#Examples>.

## `os.setPriority([pid, ]priority)`

<!-- YAML
added: v10.10.0
-->

* `pid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор процесса для установки приоритета.
  **По умолчанию:** `0`.
* `priority` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Приоритет планирования.

Пытается задать приоритет планирования процесса `pid`. Если `pid` не передан или равен `0`, используется текущий процесс.

`priority` — целое от `-20` (высокий) до `19` (низкий). Из‑за различий уровней приоритета Unix и классов приоритета Windows значение отображается на один из шести констант в `os.constants.priority`. При чтении приоритета на Windows результат может немного отличаться; чтобы не путаться, задавайте `priority` одной из констант.

В Windows для `PRIORITY_HIGHEST` нужны повышенные права; иначе приоритет тихо снижается до `PRIORITY_HIGH`.

## `os.tmpdir()`

<!-- YAML
added: v0.9.9
changes:
  - version: v2.0.0
    pr-url: https://github.com/nodejs/node/pull/747
    description: This function is now cross-platform consistent and no longer
                 returns a path with a trailing slash on any platform.
-->

Добавлено в: v0.9.9

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Каталог временных файлов по умолчанию для ОС.

В Windows приоритет у переменных `TEMP` и `TMP` (выше у `TEMP`). Если не заданы — `%SystemRoot%\temp` или `%windir%\temp`.

Не в Windows: `TMPDIR`, `TMP` и `TEMP` проверяются в этом порядке. Если ни одна не задана — `/tmp`.

Многие дистрибутивы задают `TMPDIR` или `TEMP`/`TMP` по умолчанию. Результат `os.tmpdir()` обычно отражает настройки системы, если пользователь явно не переопределил их.

## `os.totalmem()`

<!-- YAML
added: v0.3.3
-->

* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Общий объём оперативной памяти в байтах (целое число).

## `os.type()`

<!-- YAML
added: v0.3.3
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя ОС, как в [`uname(3)`](https://linux.die.net/man/3/uname). Например `'Linux'`, `'Darwin'` на macOS, `'Windows_NT'` в Windows.

Дополнительно см. <https://en.wikipedia.org/wiki/Uname#Examples>.

## `os.uptime()`

<!-- YAML
added: v0.3.3
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/20129
    description: The result of this function no longer contains a fraction
                 component on Windows.
-->

Добавлено в: v0.3.3

* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Время работы системы в секундах.

## `os.userInfo([options])`

<!-- YAML
added: v6.0.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка для строк результата.
    При `'buffer'` поля `username`, `shell` и `homedir` — экземпляры `Buffer`. **По умолчанию:** `'utf8'`.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Сведения о текущем эффективном пользователе. В POSIX обычно подмножество файла паролей: `username`, `uid`, `gid`, `shell`, `homedir`. В Windows `uid` и `gid` равны `-1`, `shell` — `null`.

`homedir` здесь даёт ОС; это не то же самое, что `os.homedir()`, который сначала смотрит переменные окружения.

Выбрасывает [`SystemError`](errors.md#class-systemerror), если нет `username` или `homedir`.

## `os.version()`

<!-- YAML
added:
 - v13.11.0
 - v12.17.0
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строка с версией ядра.

В POSIX — через [`uname(3)`](https://linux.die.net/man/3/uname). В Windows — `RtlGetVersion()`, при необходимости `GetVersionExW()`. См.
<https://en.wikipedia.org/wiki/Uname#Examples>.

## Константы ОС

Константы экспортируются через `os.constants`.

Не все константы доступны на каждой ОС.

### Константы сигналов

<!-- YAML
changes:
  - version: v5.11.0
    pr-url: https://github.com/nodejs/node/pull/6093
    description: Added support for `SIGINFO`.
-->

Константы сигналов экспортируются в `os.constants.signals`.

| Константа | Описание |
| --- | --- |
| `SIGHUP` | Сигнал при закрытии управляющего терминала или выходе родительского процесса. |
| `SIGINT` | Сигнал при прерывании процесса пользователем (<kbd>Ctrl</kbd>+<kbd>C</kbd>). |
| `SIGQUIT` | Сигнал при запросе завершения процесса и создания дампа памяти. |
| `SIGILL` | Сообщает процессу о недопустимой, некорректной, неизвестной или привилегированной инструкции. |
| `SIGTRAP` | Посылается процессу при исключении. |
| `SIGABRT` | Запрос аварийного завершения процесса. |
| `SIGIOT` | Синоним `SIGABRT` |
| `SIGBUS` | Сообщает процессу об ошибке шины. |
| `SIGFPE` | Сообщает процессу о недопустимой арифметической операции. |
| `SIGKILL` | Немедленное завершение процесса. |
| `SIGUSR1` `SIGUSR2` | Пользовательские условия (SIGUSR1/SIGUSR2). |
| `SIGSEGV` | Сообщает процессу о нарушении сегментации. |
| `SIGPIPE` | Запись в разорванный канал (pipe). |
| `SIGALRM` | Истёк системный таймер. |
| `SIGTERM` | Запрос завершения процесса. |
| `SIGCHLD` | Завершился дочерний процесс. |
| `SIGSTKFLT` | Ошибка стека сопроцессора. |
| `SIGCONT` | Продолжить приостановленный процесс. |
| `SIGSTOP` | Остановить процесс. |
| `SIGTSTP` | Запрос остановки процесса. |
| `SIGBREAK` | Прерывание процесса по запросу пользователя. |
| `SIGTTIN` | Чтение из TTY процессом в фоне. |
| `SIGTTOU` | Запись в TTY процессом в фоне. |
| `SIGURG` | Срочные данные на сокете. |
| `SIGXCPU` | Превышен лимит использования CPU. |
| `SIGXFSZ` | Файл превысил допустимый размер. |
| `SIGVTALRM` | Истёк виртуальный таймер. |
| `SIGPROF` | Истёк системный таймер (SIGPROF). |
| `SIGWINCH` | Изменился размер управляющего терминала. |
| `SIGIO` | Доступен ввод-вывод. |
| `SIGPOLL` | Синоним `SIGIO` |
| `SIGLOST` | Потеряна блокировка файла. |
| `SIGPWR` | Сбой питания. |
| `SIGINFO` | Синоним `SIGPWR` |
| `SIGSYS` | Неверный аргумент. |
| `SIGUNUSED` | Синоним `SIGSYS` |

### Константы ошибок

Константы ошибок экспортируются в `os.constants.errno`.

#### Константы ошибок POSIX

| Константа | Описание |
| --- | --- |
| `E2BIG` | Список аргументов слишком длинный. |
| `EACCES` | Недостаточно прав для операции. |
| `EADDRINUSE` | Сетевой адрес уже используется. |
| `EADDRNOTAVAIL` | Сетевой адрес сейчас недоступен. |
| `EAFNOSUPPORT` | Семейство сетевых адресов не поддерживается. |
| `EAGAIN` | Данных нет; повторите операцию позже. |
| `EALREADY` | У сокета уже есть незавершённое подключение. |
| `EBADF` | Некорректный файловый дескриптор. |
| `EBADMSG` | Некорректное сообщение данных. |
| `EBUSY` | Устройство или ресурс заняты. |
| `ECANCELED` | Операция отменена. |
| `ECHILD` | Нет дочерних процессов. |
| `ECONNABORTED` | Сетевое соединение прервано. |
| `ECONNREFUSED` | В соединении отказали. |
| `ECONNRESET` | Соединение сброшено. |
| `EDEADLK` | Тупик ресурсов разрешён. |
| `EDESTADDRREQ` | Требуется адрес назначения. |
| `EDOM` | Аргумент вне области определения функции. |
| `EDQUOT` | Превышена дисковая квота. |
| `EEXIST` | Файл уже существует. |
| `EFAULT` | Некорректный адрес указателя. |
| `EFBIG` | Файл слишком велик. |
| `EHOSTUNREACH` | Узел недоступен. |
| `EIDRM` | Идентификатор удалён. |
| `EILSEQ` | Недопустимая последовательность байт. |
| `EINPROGRESS` | Операция уже выполняется. |
| `EINTR` | Вызов функции прерван. |
| `EINVAL` | Передан неверный аргумент. |
| `EIO` | Неуточнённая ошибка ввода-вывода. |
| `EISCONN` | Сокет подключён. |
| `EISDIR` | Путь указывает на каталог. |
| `ELOOP` | Слишком много уровней символических ссылок в пути. |
| `EMFILE` | Слишком много открытых файлов. |
| `EMLINK` | Слишком много жёстких ссылок на файл. |
| `EMSGSIZE` | Сообщение слишком длинное. |
| `EMULTIHOP` | Попытка multihop. |
| `ENAMETOOLONG` | Имя файла слишком длинное. |
| `ENETDOWN` | Сеть недоступна. |
| `ENETRESET` | Сеть прервала соединение. |
| `ENETUNREACH` | Сеть недостижима. |
| `ENFILE` | В системе слишком много открытых файлов. |
| `ENOBUFS` | Нет места в буфере. |
| `ENODATA` | Нет сообщения в очереди чтения потока. |
| `ENODEV` | Нет такого устройства. |
| `ENOENT` | Нет такого файла или каталога. |
| `ENOEXEC` | Ошибка формата исполняемого файла. |
| `ENOLCK` | Нет доступных блокировок. |
| `ENOLINK` | Связь разорвана. |
| `ENOMEM` | Недостаточно памяти. |
| `ENOMSG` | Нет сообщения нужного типа. |
| `ENOPROTOOPT` | Протокол недоступен. |
| `ENOSPC` | На устройстве нет места. |
| `ENOSR` | Нет ресурсов потока. |
| `ENOSTR` | Ресурс не является потоком. |
| `ENOSYS` | Функция не реализована. |
| `ENOTCONN` | Сокет не подключён. |
| `ENOTDIR` | Путь не является каталогом. |
| `ENOTEMPTY` | Каталог не пуст. |
| `ENOTSOCK` | Объект не является сокетом. |
| `ENOTSUP` | Операция не поддерживается. |
| `ENOTTY` | Недопустимая операция управления вводом-выводом. |
| `ENXIO` | Нет такого устройства или адреса. |
| `EOPNOTSUPP` | Операция не поддерживается для сокета. Хотя на Linux `ENOTSUP` и `EOPNOTSUPP` совпадают, в POSIX.1 это разные коды.) |
| `EOVERFLOW` | Значение слишком велико для типа данных. |
| `EPERM` | Операция не разрешена. |
| `EPIPE` | Разорванный канал (pipe). |
| `EPROTO` | Ошибка протокола. |
| `EPROTONOSUPPORT` | Протокол не поддерживается. |
| `EPROTOTYPE` | Неверный тип протокола для сокета. |
| `ERANGE` | Результат слишком велик. |
| `EROFS` | Файловая система только для чтения. |
| `ESPIPE` | Некорректная операция позиционирования. |
| `ESRCH` | Нет такого процесса. |
| `ESTALE` | Устаревший дескриптор файла. |
| `ETIME` | Таймер истёк. |
| `ETIMEDOUT` | Истекло время ожидания соединения. |
| `ETXTBSY` | Текстовый файл занят. |
| `EWOULDBLOCK` | Операция заблокировала бы выполнение. |
| `EXDEV` | Некорректная связь. |

#### Константы ошибок Windows

Следующие коды ошибок относятся к Windows.

| Константа | Описание |
| --- | --- |
| `WSAEINTR` | Прерванный вызов функции. |
| `WSAEBADF` | Некорректный дескриптор файла. |
| `WSAEACCES` | Недостаточно прав для завершения операции. |
| `WSAEFAULT` | Некорректный адрес указателя. |
| `WSAEINVAL` | Передан неверный аргумент. |
| `WSAEMFILE` | Слишком много открытых файлов. |
| `WSAEWOULDBLOCK` | Ресурс временно недоступен. |
| `WSAEINPROGRESS` | Операция уже выполняется. |
| `WSAEALREADY` | Операция уже выполняется. |
| `WSAENOTSOCK` | Ресурс не является сокетом. |
| `WSAEDESTADDRREQ` | Требуется адрес назначения. |
| `WSAEMSGSIZE` | Сообщение слишком длинное. |
| `WSAEPROTOTYPE` | Неверный тип протокола для сокета. |
| `WSAENOPROTOOPT` | Неверная опция протокола. |
| `WSAEPROTONOSUPPORT` | Протокол не поддерживается. |
| `WSAESOCKTNOSUPPORT` | Тип сокета не поддерживается. |
| `WSAEOPNOTSUPP` | Операция не поддерживается. |
| `WSAEPFNOSUPPORT` | Семейство протоколов не поддерживается. |
| `WSAEAFNOSUPPORT` | Семейство адресов не поддерживается. |
| `WSAEADDRINUSE` | Сетевой адрес уже используется. |
| `WSAEADDRNOTAVAIL` | Сетевой адрес недоступен. |
| `WSAENETDOWN` | Сеть недоступна. |
| `WSAENETUNREACH` | Сеть недостижима. |
| `WSAENETRESET` | Соединение сброшено. |
| `WSAECONNABORTED` | Соединение прервано. |
| `WSAECONNRESET` | Удалённый узел сбросил соединение. |
| `WSAENOBUFS` | Нет места в буфере. |
| `WSAEISCONN` | Сокет уже подключён. |
| `WSAENOTCONN` | Сокет не подключён. |
| `WSAESHUTDOWN` | Нельзя отправлять данные после shutdown сокета. |
| `WSAETOOMANYREFS` | Слишком много ссылок. |
| `WSAETIMEDOUT` | Истекло время ожидания соединения. |
| `WSAECONNREFUSED` | В соединении отказали. |
| `WSAELOOP` | Имя нельзя преобразовать. |
| `WSAENAMETOOLONG` | Имя слишком длинное. |
| `WSAEHOSTDOWN` | Сетевой узел недоступен. |
| `WSAEHOSTUNREACH` | Нет маршрута до узла. |
| `WSAENOTEMPTY` | Каталог не пуст. |
| `WSAEPROCLIM` | Слишком много процессов. |
| `WSAEUSERS` | Превышена квота пользователя. |
| `WSAEDQUOT` | Превышена дисковая квота. |
| `WSAESTALE` | Устаревшая ссылка на дескриптор файла. |
| `WSAEREMOTE` | Объект удалённый. |
| `WSASYSNOTREADY` | Сетевая подсистема не готова. |
| `WSAVERNOTSUPPORTED` | Версия `winsock.dll` вне допустимого диапазона. |
| `WSANOTINITIALISED` | Успешный WSAStartup ещё не выполнялся. |
| `WSAEDISCON` | Выполняется корректное завершение. |
| `WSAENOMORE` | Больше нет результатов. |
| `WSAECANCELLED` | Операция отменена. |
| `WSAEINVALIDPROCTABLE` | Таблица вызовов процедур некорректна. |
| `WSAEINVALIDPROVIDER` | Некорректный поставщик услуг. |
| `WSAEPROVIDERFAILEDINIT` | Не удалось инициализировать поставщика услуг. |
| `WSASYSCALLFAILURE` | Ошибка системного вызова. |
| `WSASERVICE_NOT_FOUND` | Служба не найдена. |
| `WSATYPE_NOT_FOUND` | Тип класса не найден. |
| `WSA_E_NO_MORE` | Больше нет результатов. |
| `WSA_E_CANCELLED` | Вызов отменён. |
| `WSAEREFUSED` | Запрос к базе отклонён. |

### Константы dlopen

Если доступны в ОС, эти константы экспортируются в `os.constants.dlopen`. Подробности — в dlopen(3).

| Константа | Описание |
| --- | --- |
| `RTLD_LAZY` | Ленивое связывание. По умолчанию Node.js задаёт этот флаг. |
| `RTLD_NOW` | Разрешить все неопределённые символы до возврата из dlopen(3). |
| `RTLD_GLOBAL` | Символы библиотеки доступны для разрешения в последующих загрузках. |
| `RTLD_LOCAL` | Противоположность `RTLD_GLOBAL`. Поведение по умолчанию, если флаги не заданы. |
| `RTLD_DEEPBIND` | Самодостаточная библиотека предпочитает свои символы символам ранее загруженных библиотек. |

### Константы приоритета

<!-- YAML
added: v10.10.0
-->

Константы планирования процессов экспортируются в
`os.constants.priority`.

| Константа | Описание |
| --- | --- |
| `PRIORITY_LOW` | Наименьший приоритет планирования: `IDLE_PRIORITY_CLASS` в Windows, nice `19` на остальных платформах. |
| `PRIORITY_BELOW_NORMAL` | Приоритет между `PRIORITY_LOW` и `PRIORITY_NORMAL`: `BELOW_NORMAL_PRIORITY_CLASS` в Windows, nice `10` иначе. |
| `PRIORITY_NORMAL` | Приоритет по умолчанию: `NORMAL_PRIORITY_CLASS` в Windows, nice `0` иначе. |
| `PRIORITY_ABOVE_NORMAL` | Приоритет между `PRIORITY_NORMAL` и `PRIORITY_HIGH`: `ABOVE_NORMAL_PRIORITY_CLASS` в Windows, nice `-7` иначе. |
| `PRIORITY_HIGH` | Приоритет между `PRIORITY_ABOVE_NORMAL` и `PRIORITY_HIGHEST`: `HIGH_PRIORITY_CLASS` в Windows, nice `-14` иначе. |
| `PRIORITY_HIGHEST` | Наивысший приоритет: `REALTIME_PRIORITY_CLASS` в Windows, nice `-20` иначе. |

### Константы libuv

| Константа | Описание |
| --- | --- |
| `UV_UDP_REUSEADDR` |  |

[Android building]: https://github.com/nodejs/node/blob/HEAD/BUILDING.md#android
[EUID]: https://en.wikipedia.org/wiki/User_identifier#Effective_user_ID
[`SystemError`]: errors.md#class-systemerror
[`process.arch`]: process.md#processarch
[`process.platform`]: process.md#processplatform
[`uname(3)`]: https://linux.die.net/man/3/uname
[`uv_available_parallelism()`]: https://docs.libuv.org/en/v1.x/misc.html#c.uv_available_parallelism
