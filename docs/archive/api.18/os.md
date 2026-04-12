---
title: OS
description: Модуль os предоставляет методы и свойства утилит, связанных с операционной системой
---

# Операционная система

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/os.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:os` предоставляет методы и свойства утилит, связанных с операционной системой. Доступ к нему можно получить с помощью:

```js
const os = require('node:os');
```

<!-- 0000.part.md -->

## `os.EOL`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Маркер конца строки, специфичный для операционной системы.

-   `\n` на POSIX
-   `\r\n` в Windows

<!-- 0001.part.md -->

## `os.availableParallelism()`

-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает оценку количества параллелизма по умолчанию, которое программа должна использовать. Всегда возвращает значение больше нуля.

Эта функция является небольшой оберткой для функции libuv [`uv_available_parallelism()`](https://docs.libuv.org/en/v1.x/misc.html#c.uv_available_parallelism).

<!-- 0002.part.md -->

## `os.arch()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает архитектуру процессора операционной системы, для которой был скомпилирован двоичный файл Node.js. Возможные значения: `'arm'`, `'arm64'`, `'ia32'`, `'mips'`, `'mipsel'`, `'ppc'`, `'ppc64'`, `'s390'`, `'s390x'`, и `'x64'`.

Возвращаемое значение эквивалентно [`process.arch`](process.md#processarch).

<!-- 0003.part.md -->

## `os.constants`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Содержит часто используемые константы, специфичные для операционной системы, для кодов ошибок, сигналов процесса и так далее. Определенные константы описаны в [OS constants](#os-constants).

<!-- 0004.part.md -->

## `os.cpus()`

-   Возвращает: {Object\[\]}

Возвращает массив объектов, содержащих информацию о каждом логическом ядре процессора.

Свойства, включенные в каждый объект, включают:

-   `модель` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `скорость` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) (в МГц)
-   `times` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `user` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество миллисекунд, проведенных процессором в пользовательском режиме.
    -   `nice` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество миллисекунд, проведенных процессором в приятном режиме.
    -   `sys` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество миллисекунд, проведенных процессором в режиме sys.
    -   `idle` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество миллисекунд, проведенных процессором в режиме простоя.
    -   `irq` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество миллисекунд, проведенных процессором в режиме irq.

<!-- конец списка -->

```js
[
    {
        model:
            'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
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
        model:
            'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
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
        model:
            'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
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
        model:
            'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
        speed: 2926,
        times: {
            user: 256880,
            nice: 0,
            sys: 19430,
            idle: 1070905480,
            irq: 20,
        },
    },
];
```

Значения `nice` относятся только к POSIX. В Windows значения `nice` для всех процессоров всегда равны 0.

`os.cpus().length` не следует использовать для вычисления количества параллелизма, доступного приложению. Для этой цели используйте [`os.availableParallelism()`](#osavailableparallelism).

<!-- 0005.part.md -->

## `os.devNull`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Путь к файлу нулевого устройства в зависимости от платформы.

-   `\.\nul` в Windows
-   `/dev/null` на POSIX

<!-- 0006.part.md -->

## `os.endianness()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает строку, определяющую эндианальность процессора, для которого был скомпилирован двоичный файл Node.js.

Возможные значения: `'BE'` для big endian и `'LE'` для little endian.

<!-- 0007.part.md -->

## `os.freemem()`

-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает количество свободной системной памяти в байтах в виде целого числа.

<!-- 0008.part.md -->

## `os.getPriority([pid])`

-   `pid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор процесса для получения приоритета планирования. **По умолчанию:** `0`.
-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает приоритет планирования для процесса, указанного `pid`. Если `pid` не указан или равен `0`, возвращается приоритет текущего процесса.

<!-- 0009.part.md -->

## `os.homedir()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает строковый путь к домашнему каталогу текущего пользователя.

На POSIX используется переменная окружения `$HOME`, если она определена. В противном случае используется [эффективный UID](https://en.wikipedia.org/wiki/User_identifier#Effective_user_ID) для поиска домашнего каталога пользователя.

В Windows используется переменная окружения `USERPROFILE`, если она определена. В противном случае используется путь к каталогу профиля текущего пользователя.

<!-- 0010.part.md -->

## `os.hostname()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает имя хоста операционной системы в виде строки.

<!-- 0011.part.md -->

## `os.loadavg()`

-   Возвращает: {число\[\]}

Возвращает массив, содержащий средние значения нагрузки за 1, 5 и 15 минут.

Среднее значение нагрузки - это мера активности системы, рассчитываемая операционной системой и выражаемая в виде дробного числа.

Среднее значение нагрузки - это понятие, специфичное для Unix. В Windows возвращаемое значение всегда равно `[0, 0, 0]`.

<!-- 0012.part.md -->

## `os.machine()`

-   Возвращает {строку}

Возвращает тип машины в виде строки, например, `arm`, `arm64`, `aarch64`, `mips`, `mips64`, `ppc64`, `ppc64le`, `s390`, `s390x`, `i386`, `i686`, `x86_64`.

В POSIX системах тип машины определяется вызовом [`uname(3)`](https://linux.die.net/man/3/uname). В Windows используется `RtlGetVersion()`, а если она недоступна, то используется `GetVersionExW()`. Дополнительную информацию см. в <https://en.wikipedia.org/wiki/Uname#Examples>.

<!-- 0013.part.md -->

## `os.networkInterfaces()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает объект, содержащий сетевые интерфейсы, которым был присвоен сетевой адрес.

Каждый ключ возвращаемого объекта идентифицирует сетевой интерфейс. Связанное значение представляет собой массив объектов, каждый из которых описывает назначенный сетевой адрес.

Свойства, доступные для объекта назначенного сетевого адреса, включают:

-   `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Назначенный адрес IPv4 или IPv6.
-   `netmask` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Маска сети IPv4 или IPv6
-   `family` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) либо `IPv4`, либо `IPv6`.
-   `mac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) MAC-адрес сетевого интерфейса
-   `internal` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если сетевой интерфейс является loopback или подобным интерфейсом, к которому нет удаленного доступа; иначе `false`.
-   `scopeid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Числовой идентификатор области действия IPv6 (указывается только в том случае, если `family` - `IPv6`)
-   `cidr` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Назначенный IPv4 или IPv6 адрес с префиксом маршрутизации в нотации CIDR. Если `netmask` недействительна, это свойство устанавливается в `null`.

<!-- конец списка -->

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

<!-- 0014.part.md -->

## `os.platform()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает строку, идентифицирующую платформу операционной системы, для которой был скомпилирован двоичный файл Node.js. Значение устанавливается во время компиляции. Возможные значения: `'aix'`, `'darwin'`, `'freebsd'`, `'linux'`, `'openbsd'`, `'sunos'`, и `'win32'`.

Возвращаемое значение эквивалентно [`process.platform`](process.md#processplatform).

Значение `'android'` также может быть возвращено, если Node.js построен на операционной системе Android. [Поддержка Android является экспериментальной](https://github.com/nodejs/node/blob/HEAD/BUILDING.md#androidandroid-based-devices-eg-firefox-os).

<!-- 0015.part.md -->

## `os.release()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает операционную систему в виде строки.

В POSIX системах выпуск операционной системы определяется вызовом [`uname(3)`](https://linux.die.net/man/3/uname). В Windows используется `GetVersionExW()`. Дополнительную информацию см. на <https://en.wikipedia.org/wiki/Uname#Examples>.

<!-- 0016.part.md -->

## `os.setPriority([pid, ]priority)`

-   `pid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор процесса, для которого нужно установить приоритет планирования. **По умолчанию:** `0`.
-   `priority` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Приоритет планирования, который нужно назначить процессу.

Пытается установить приоритет планирования для процесса, указанного `pid`. Если `pid` не указан или равен `0`, используется идентификатор текущего процесса.

Входное значение `priority` должно быть целым числом между `-20` (высокий приоритет) и `19` (низкий приоритет). Из-за различий между уровнями приоритетов Unix и классами приоритетов Windows, `priority` отображается на одну из шести констант приоритетов в `os.constants.priority`. При извлечении уровня приоритета процесса это сопоставление диапазонов может привести к тому, что возвращаемое значение будет немного отличаться в Windows. Чтобы избежать путаницы, установите `priority` в одну из констант приоритета.

В Windows установка приоритета в `PRIORITY_HIGHEST` требует повышенных привилегий пользователя. В противном случае установленный приоритет будет молча снижен до `PRIORITY_HIGH`.

<!-- 0017.part.md -->

## `os.tmpdir()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает каталог по умолчанию операционной системы для временных файлов в виде строки.

<!-- 0018.part.md -->

## `os.totalmem()`

-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает общий объем системной памяти в байтах в виде целого числа.

<!-- 0019.part.md -->

## `os.type()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает имя операционной системы, полученное с помощью [`uname(3)`](https://linux.die.net/man/3/uname). Например, возвращается `'Linux'` в Linux, `'Darwin'` в macOS и `'Windows_NT'` в Windows.

Дополнительную информацию о результатах выполнения [`uname(3)`](https://linux.die.net/man/3/uname) в различных операционных системах см. в <https://en.wikipedia.org/wiki/Uname#Examples>.

<!-- 0020.part.md -->

## `os.uptime()`

-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает время работы системы в количестве секунд.

<!-- 0021.part.md -->

## `os.userInfo([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка символов, используемая для интерпретации результирующих строк. Если `encoding` имеет значение `'buffer'`, значения `username`, `hell` и `homedir` будут экземплярами `Buffer`. **По умолчанию:** `'utf8'`.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает информацию о текущем действующем пользователе. На POSIX платформах это обычно подмножество файла паролей. Возвращаемый объект включает в себя `username`, `uid`, `gid`, `hell` и `homedir`. В Windows поля `uid` и `gid` равны `-1`, а `shell` - `null`.

Значение `homedir`, возвращаемое `os.userInfo()`, предоставляется операционной системой. Это отличается от результата `os.homedir()`, который запрашивает переменные окружения для домашнего каталога, прежде чем вернуться к ответу операционной системы.

Выбрасывает [`SystemError`](errors.md#class-systemerror), если у пользователя нет `имени пользователя` или `homedir`.

<!-- 0022.part.md -->

## `os.version()`

-   Возвращает {строку}

Возвращает строку, идентифицирующую версию ядра.

В POSIX системах выпуск операционной системы определяется вызовом [`uname(3)`](https://linux.die.net/man/3/uname). В Windows используется `RtlGetVersion()`, а если она недоступна, то используется `GetVersionExW()`. Дополнительную информацию см. в <https://en.wikipedia.org/wiki/Uname#Examples>.

<!-- 0023.part.md -->

## Константы ОС

Следующие константы экспортируются в `os.constants`.

Не все константы будут доступны в каждой операционной системе.

<!-- 0024.part.md -->

### Signal constants

The following signal constants are exported by `os.constants.signals`.

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>SIGHUP</code>

</td>

<td>

Sent to indicate when a controlling terminal is closed or a parent process exits.

</td>

</tr>

<tr>

<td>

<code>SIGINT</code>

</td>

<td>

Sent to indicate when a user wishes to interrupt a process (<kbd>Ctrl</kbd>+<kbd>C</kbd>).

</td>

</tr>

<tr>

<td>

<code>SIGQUIT</code>

</td>

<td>

Sent to indicate when a user wishes to terminate a process and perform a core dump.

</td>

</tr>

<tr>

<td>

<code>SIGILL</code>

</td>

<td>

Sent to a process to notify that it has attempted to perform an illegal, malformed, unknown, or privileged instruction.

</td>

</tr>

<tr>

<td>

<code>SIGTRAP</code>

</td>

<td>

Sent to a process when an exception has occurred.

</td>

</tr>

<tr>

<td>

<code>SIGABRT</code>

</td>

<td>

Sent to a process to request that it abort.

</td>

</tr>

<tr>

<td>

<code>SIGIOT</code>

</td>

<td>

Synonym for <code>SIGABRT</code>

</td>

</tr>

<tr>

<td>

<code>SIGBUS</code>

</td>

<td>

Sent to a process to notify that it has caused a bus error.

</td>

</tr>

<tr>

<td>

<code>SIGFPE</code>

</td>

<td>

Sent to a process to notify that it has performed an illegal arithmetic operation.

</td>

</tr>

<tr>

<td>

<code>SIGKILL</code>

</td>

<td>

Sent to a process to terminate it immediately.

</td>

</tr>

<tr>

<td>

<code>SIGUSR1</code> <code>SIGUSR2</code>

</td>

<td>

Sent to a process to identify user-defined conditions.

</td>

</tr>

<tr>

<td>

<code>SIGSEGV</code>

</td>

<td>

Sent to a process to notify of a segmentation fault.

</td>

</tr>

<tr>

<td>

<code>SIGPIPE</code>

</td>

<td>

Sent to a process when it has attempted to write to a disconnected pipe.

</td>

</tr>

<tr>

<td>

<code>SIGALRM</code>

</td>

<td>

Sent to a process when a system timer elapses.

</td>

</tr>

<tr>

<td>

<code>SIGTERM</code>

</td>

<td>

Sent to a process to request termination.

</td>

</tr>

<tr>

<td>

<code>SIGCHLD</code>

</td>

<td>

Sent to a process when a child process terminates.

</td>

</tr>

<tr>

<td>

<code>SIGSTKFLT</code>

</td>

<td>

Sent to a process to indicate a stack fault on a coprocessor.

</td>

</tr>

<tr>

<td>

<code>SIGCONT</code>

</td>

<td>

Sent to instruct the operating system to continue a paused process.

</td>

</tr>

<tr>

<td>

<code>SIGSTOP</code>

</td>

<td>

Sent to instruct the operating system to halt a process.

</td>

</tr>

<tr>

<td>

<code>SIGTSTP</code>

</td>

<td>

Sent to a process to request it to stop.

</td>

</tr>

<tr>

<td>

<code>SIGBREAK</code>

</td>

<td>

Sent to indicate when a user wishes to interrupt a process.

</td>

</tr>

<tr>

<td>

<code>SIGTTIN</code>

</td>

<td>

Sent to a process when it reads from the TTY while in the background.

</td>

</tr>

<tr>

<td>

<code>SIGTTOU</code>

</td>

<td>

Sent to a process when it writes to the TTY while in the background.

</td>

</tr>

<tr>

<td>

<code>SIGURG</code>

</td>

<td>

Sent to a process when a socket has urgent data to read.

</td>

</tr>

<tr>

<td>

<code>SIGXCPU</code>

</td>

<td>

Sent to a process when it has exceeded its limit on CPU usage.

</td>

</tr>

<tr>

<td>

<code>SIGXFSZ</code>

</td>

<td>

Sent to a process when it grows a file larger than the maximum allowed.

</td>

</tr>

<tr>

<td>

<code>SIGVTALRM</code>

</td>

<td>

Sent to a process when a virtual timer has elapsed.

</td>

</tr>

<tr>

<td>

<code>SIGPROF</code>

</td>

<td>

Sent to a process when a system timer has elapsed.

</td>

</tr>

<tr>

<td>

<code>SIGWINCH</code>

</td>

<td>

Sent to a process when the controlling terminal has changed its size.

</td>

</tr>

<tr>

<td>

<code>SIGIO</code>

</td>

<td>

Sent to a process when I/O is available.

</td>

</tr>

<tr>

<td>

<code>SIGPOLL</code>

</td>

<td>

Synonym for <code>SIGIO</code>

</td>

</tr>

<tr>

<td>

<code>SIGLOST</code>

</td>

<td>

Sent to a process when a file lock has been lost.

</td>

</tr>

<tr>

<td>

<code>SIGPWR</code>

</td>

<td>

Sent to a process to notify of a power failure.

</td>

</tr>

<tr>

<td>

<code>SIGINFO</code>

</td>

<td>

Synonym for <code>SIGPWR</code>

</td>

</tr>

<tr>

<td>

<code>SIGSYS</code>

</td>

<td>

Sent to a process to notify of a bad argument.

</td>

</tr>

<tr>

<td>

<code>SIGUNUSED</code>

</td>

<td>

Synonym for <code>SIGSYS</code>

</td>

</tr>

</table>

<!-- 0025.part.md -->

### Константы ошибок

Следующие константы ошибок экспортируются `os.constants.errno`.

<!-- 0026.part.md -->

#### POSIX error constants

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>E2BIG</code>

</td>

<td>

Indicates that the list of arguments is longer than expected.

</td>

</tr>

<tr>

<td>

<code>EACCES</code>

</td>

<td>

Indicates that the operation did not have sufficient permissions.

</td>

</tr>

<tr>

<td>

<code>EADDRINUSE</code>

</td>

<td>

Indicates that the network address is already in use.

</td>

</tr>

<tr>

<td>

<code>EADDRNOTAVAIL</code>

</td>

<td>

Indicates that the network address is currently unavailable for use.

</td>

</tr>

<tr>

<td>

<code>EAFNOSUPPORT</code>

</td>

<td>

Indicates that the network address family is not supported.

</td>

</tr>

<tr>

<td>

<code>EAGAIN</code>

</td>

<td>

Indicates that there is no data available and to try the operation again later.

</td>

</tr>

<tr>

<td>

<code>EALREADY</code>

</td>

<td>

Indicates that the socket already has a pending connection in progress.

</td>

</tr>

<tr>

<td>

<code>EBADF</code>

</td>

<td>

Indicates that a file descriptor is not valid.

</td>

</tr>

<tr>

<td>

<code>EBADMSG</code>

</td>

<td>

Indicates an invalid data message.

</td>

</tr>

<tr>

<td>

<code>EBUSY</code>

</td>

<td>

Indicates that a device or resource is busy.

</td>

</tr>

<tr>

<td>

<code>ECANCELED</code>

</td>

<td>

Indicates that an operation was canceled.

</td>

</tr>

<tr>

<td>

<code>ECHILD</code>

</td>

<td>

Indicates that there are no child processes.

</td>

</tr>

<tr>

<td>

<code>ECONNABORTED</code>

</td>

<td>

Indicates that the network connection has been aborted.

</td>

</tr>

<tr>

<td>

<code>ECONNREFUSED</code>

</td>

<td>

Indicates that the network connection has been refused.

</td>

</tr>

<tr>

<td>

<code>ECONNRESET</code>

</td>

<td>

Indicates that the network connection has been reset.

</td>

</tr>

<tr>

<td>

<code>EDEADLK</code>

</td>

<td>

Indicates that a resource deadlock has been avoided.

</td>

</tr>

<tr>

<td>

<code>EDESTADDRREQ</code>

</td>

<td>

Indicates that a destination address is required.

</td>

</tr>

<tr>

<td>

<code>EDOM</code>

</td>

<td>

Indicates that an argument is out of the domain of the function.

</td>

</tr>

<tr>

<td>

<code>EDQUOT</code>

</td>

<td>

Indicates that the disk quota has been exceeded.

</td>

</tr>

<tr>

<td>

<code>EEXIST</code>

</td>

<td>

Indicates that the file already exists.

</td>

</tr>

<tr>

<td>

<code>EFAULT</code>

</td>

<td>

Indicates an invalid pointer address.

</td>

</tr>

<tr>

<td>

<code>EFBIG</code>

</td>

<td>

Indicates that the file is too large.

</td>

</tr>

<tr>

<td>

<code>EHOSTUNREACH</code>

</td>

<td>

Indicates that the host is unreachable.

</td>

</tr>

<tr>

<td>

<code>EIDRM</code>

</td>

<td>

Indicates that the identifier has been removed.

</td>

</tr>

<tr>

<td>

<code>EILSEQ</code>

</td>

<td>

Indicates an illegal byte sequence.

</td>

</tr>

<tr>

<td>

<code>EINPROGRESS</code>

</td>

<td>

Indicates that an operation is already in progress.

</td>

</tr>

<tr>

<td>

<code>EINTR</code>

</td>

<td>

Indicates that a function call was interrupted.

</td>

</tr>

<tr>

<td>

<code>EINVAL</code>

</td>

<td>

Indicates that an invalid argument was provided.

</td>

</tr>

<tr>

<td>

<code>EIO</code>

</td>

<td>

Indicates an otherwise unspecified I/O error.

</td>

</tr>

<tr>

<td>

<code>EISCONN</code>

</td>

<td>

Indicates that the socket is connected.

</td>

</tr>

<tr>

<td>

<code>EISDIR</code>

</td>

<td>

Indicates that the path is a directory.

</td>

</tr>

<tr>

<td>

<code>ELOOP</code>

</td>

<td>

Indicates too many levels of symbolic links in a path.

</td>

</tr>

<tr>

<td>

<code>EMFILE</code>

</td>

<td>

Indicates that there are too many open files.

</td>

</tr>

<tr>

<td>

<code>EMLINK</code>

</td>

<td>

Indicates that there are too many hard links to a file.

</td>

</tr>

<tr>

<td>

<code>EMSGSIZE</code>

</td>

<td>

Indicates that the provided message is too long.

</td>

</tr>

<tr>

<td>

<code>EMULTIHOP</code>

</td>

<td>

Indicates that a multihop was attempted.

</td>

</tr>

<tr>

<td>

<code>ENAMETOOLONG</code>

</td>

<td>

Indicates that the filename is too long.

</td>

</tr>

<tr>

<td>

<code>ENETDOWN</code>

</td>

<td>

Indicates that the network is down.

</td>

</tr>

<tr>

<td>

<code>ENETRESET</code>

</td>

<td>

Indicates that the connection has been aborted by the network.

</td>

</tr>

<tr>

<td>

<code>ENETUNREACH</code>

</td>

<td>

Indicates that the network is unreachable.

</td>

</tr>

<tr>

<td>

<code>ENFILE</code>

</td>

<td>

Indicates too many open files in the system.

</td>

</tr>

<tr>

<td>

<code>ENOBUFS</code>

</td>

<td>

Indicates that no buffer space is available.

</td>

</tr>

<tr>

<td>

<code>ENODATA</code>

</td>

<td>

Indicates that no message is available on the stream head read queue.

</td>

</tr>

<tr>

<td>

<code>ENODEV</code>

</td>

<td>

Indicates that there is no such device.

</td>

</tr>

<tr>

<td>

<code>ENOENT</code>

</td>

<td>

Indicates that there is no such file or directory.

</td>

</tr>

<tr>

<td>

<code>ENOEXEC</code>

</td>

<td>

Indicates an exec format error.

</td>

</tr>

<tr>

<td>

<code>ENOLCK</code>

</td>

<td>

Indicates that there are no locks available.

</td>

</tr>

<tr>

<td>

<code>ENOLINK</code>

</td>

<td>

Indications that a link has been severed.

</td>

</tr>

<tr>

<td>

<code>ENOMEM</code>

</td>

<td>

Indicates that there is not enough space.

</td>

</tr>

<tr>

<td>

<code>ENOMSG</code>

</td>

<td>

Indicates that there is no message of the desired type.

</td>

</tr>

<tr>

<td>

<code>ENOPROTOOPT</code>

</td>

<td>

Indicates that a given protocol is not available.

</td>

</tr>

<tr>

<td>

<code>ENOSPC</code>

</td>

<td>

Indicates that there is no space available on the device.

</td>

</tr>

<tr>

<td>

<code>ENOSR</code>

</td>

<td>

Indicates that there are no stream resources available.

</td>

</tr>

<tr>

<td>

<code>ENOSTR</code>

</td>

<td>

Indicates that a given resource is not a stream.

</td>

</tr>

<tr>

<td>

<code>ENOSYS</code>

</td>

<td>

Indicates that a function has not been implemented.

</td>

</tr>

<tr>

<td>

<code>ENOTCONN</code>

</td>

<td>

Indicates that the socket is not connected.

</td>

</tr>

<tr>

<td>

<code>ENOTDIR</code>

</td>

<td>

Indicates that the path is not a directory.

</td>

</tr>

<tr>

<td>

<code>ENOTEMPTY</code>

</td>

<td>

Indicates that the directory is not empty.

</td>

</tr>

<tr>

<td>

<code>ENOTSOCK</code>

</td>

<td>

Indicates that the given item is not a socket.

</td>

</tr>

<tr>

<td>

<code>ENOTSUP</code>

</td>

<td>

Indicates that a given operation is not supported.

</td>

</tr>

<tr>

<td>

<code>ENOTTY</code>

</td>

<td>

Indicates an inappropriate I/O control operation.

</td>

</tr>

<tr>

<td>

<code>ENXIO</code>

</td>

<td>

Indicates no such device or address.

</td>

</tr>

<tr>

<td>

<code>EOPNOTSUPP</code>

</td>

<td>

Indicates that an operation is not supported on the socket. Although <code>ENOTSUP</code> and <code>EOPNOTSUPP</code> have the same value on Linux, according to POSIX.1 these error values should be distinct.)

</td>

</tr>

<tr>

<td>

<code>EOVERFLOW</code>

</td>

<td>

Indicates that a value is too large to be stored in a given data type.

</td>

</tr>

<tr>

<td>

<code>EPERM</code>

</td>

<td>

Indicates that the operation is not permitted.

</td>

</tr>

<tr>

<td>

<code>EPIPE</code>

</td>

<td>

Indicates a broken pipe.

</td>

</tr>

<tr>

<td>

<code>EPROTO</code>

</td>

<td>

Indicates a protocol error.

</td>

</tr>

<tr>

<td>

<code>EPROTONOSUPPORT</code>

</td>

<td>

Indicates that a protocol is not supported.

</td>

</tr>

<tr>

<td>

<code>EPROTOTYPE</code>

</td>

<td>

Indicates the wrong type of protocol for a socket.

</td>

</tr>

<tr>

<td>

<code>ERANGE</code>

</td>

<td>

Indicates that the results are too large.

</td>

</tr>

<tr>

<td>

<code>EROFS</code>

</td>

<td>

Indicates that the file system is read only.

</td>

</tr>

<tr>

<td>

<code>ESPIPE</code>

</td>

<td>

Indicates an invalid seek operation.

</td>

</tr>

<tr>

<td>

<code>ESRCH</code>

</td>

<td>

Indicates that there is no such process.

</td>

</tr>

<tr>

<td>

<code>ESTALE</code>

</td>

<td>

Indicates that the file handle is stale.

</td>

</tr>

<tr>

<td>

<code>ETIME</code>

</td>

<td>

Indicates an expired timer.

</td>

</tr>

<tr>

<td>

<code>ETIMEDOUT</code>

</td>

<td>

Indicates that the connection timed out.

</td>

</tr>

<tr>

<td>

<code>ETXTBSY</code>

</td>

<td>

Indicates that a text file is busy.

</td>

</tr>

<tr>

<td>

<code>EWOULDBLOCK</code>

</td>

<td>

Indicates that the operation would block.

</td>

</tr>

<tr>

<td>

<code>EXDEV</code>

</td>

<td>

Indicates an improper link.

</td>

</tr>

</table>

<!-- 0027.part.md -->

#### Windows-specific error constants

The following error codes are specific to the Windows operating system.

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>WSAEINTR</code>

</td>

<td>

Indicates an interrupted function call.

</td>

</tr>

<tr>

<td>

<code>WSAEBADF</code>

</td>

<td>

Indicates an invalid file handle.

</td>

</tr>

<tr>

<td>

<code>WSAEACCES</code>

</td>

<td>

Indicates insufficient permissions to complete the operation.

</td>

</tr>

<tr>

<td>

<code>WSAEFAULT</code>

</td>

<td>

Indicates an invalid pointer address.

</td>

</tr>

<tr>

<td>

<code>WSAEINVAL</code>

</td>

<td>

Indicates that an invalid argument was passed.

</td>

</tr>

<tr>

<td>

<code>WSAEMFILE</code>

</td>

<td>

Indicates that there are too many open files.

</td>

</tr>

<tr>

<td>

<code>WSAEWOULDBLOCK</code>

</td>

<td>

Indicates that a resource is temporarily unavailable.

</td>

</tr>

<tr>

<td>

<code>WSAEINPROGRESS</code>

</td>

<td>

Indicates that an operation is currently in progress.

</td>

</tr>

<tr>

<td>

<code>WSAEALREADY</code>

</td>

<td>

Indicates that an operation is already in progress.

</td>

</tr>

<tr>

<td>

<code>WSAENOTSOCK</code>

</td>

<td>

Indicates that the resource is not a socket.

</td>

</tr>

<tr>

<td>

<code>WSAEDESTADDRREQ</code>

</td>

<td>

Indicates that a destination address is required.

</td>

</tr>

<tr>

<td>

<code>WSAEMSGSIZE</code>

</td>

<td>

Indicates that the message size is too long.

</td>

</tr>

<tr>

<td>

<code>WSAEPROTOTYPE</code>

</td>

<td>

Indicates the wrong protocol type for the socket.

</td>

</tr>

<tr>

<td>

<code>WSAENOPROTOOPT</code>

</td>

<td>

Indicates a bad protocol option.

</td>

</tr>

<tr>

<td>

<code>WSAEPROTONOSUPPORT</code>

</td>

<td>

Indicates that the protocol is not supported.

</td>

</tr>

<tr>

<td>

<code>WSAESOCKTNOSUPPORT</code>

</td>

<td>

Indicates that the socket type is not supported.

</td>

</tr>

<tr>

<td>

<code>WSAEOPNOTSUPP</code>

</td>

<td>

Indicates that the operation is not supported.

</td>

</tr>

<tr>

<td>

<code>WSAEPFNOSUPPORT</code>

</td>

<td>

Indicates that the protocol family is not supported.

</td>

</tr>

<tr>

<td>

<code>WSAEAFNOSUPPORT</code>

</td>

<td>

Indicates that the address family is not supported.

</td>

</tr>

<tr>

<td>

<code>WSAEADDRINUSE</code>

</td>

<td>

Indicates that the network address is already in use.

</td>

</tr>

<tr>

<td>

<code>WSAEADDRNOTAVAIL</code>

</td>

<td>

Indicates that the network address is not available.

</td>

</tr>

<tr>

<td>

<code>WSAENETDOWN</code>

</td>

<td>

Indicates that the network is down.

</td>

</tr>

<tr>

<td>

<code>WSAENETUNREACH</code>

</td>

<td>

Indicates that the network is unreachable.

</td>

</tr>

<tr>

<td>

<code>WSAENETRESET</code>

</td>

<td>

Indicates that the network connection has been reset.

</td>

</tr>

<tr>

<td>

<code>WSAECONNABORTED</code>

</td>

<td>

Indicates that the connection has been aborted.

</td>

</tr>

<tr>

<td>

<code>WSAECONNRESET</code>

</td>

<td>

Indicates that the connection has been reset by the peer.

</td>

</tr>

<tr>

<td>

<code>WSAENOBUFS</code>

</td>

<td>

Indicates that there is no buffer space available.

</td>

</tr>

<tr>

<td>

<code>WSAEISCONN</code>

</td>

<td>

Indicates that the socket is already connected.

</td>

</tr>

<tr>

<td>

<code>WSAENOTCONN</code>

</td>

<td>

Indicates that the socket is not connected.

</td>

</tr>

<tr>

<td>

<code>WSAESHUTDOWN</code>

</td>

<td>

Indicates that data cannot be sent after the socket has been shutdown.

</td>

</tr>

<tr>

<td>

<code>WSAETOOMANYREFS</code>

</td>

<td>

Indicates that there are too many references.

</td>

</tr>

<tr>

<td>

<code>WSAETIMEDOUT</code>

</td>

<td>

Indicates that the connection has timed out.

</td>

</tr>

<tr>

<td>

<code>WSAECONNREFUSED</code>

</td>

<td>

Indicates that the connection has been refused.

</td>

</tr>

<tr>

<td>

<code>WSAELOOP</code>

</td>

<td>

Indicates that a name cannot be translated.

</td>

</tr>

<tr>

<td>

<code>WSAENAMETOOLONG</code>

</td>

<td>

Indicates that a name was too long.

</td>

</tr>

<tr>

<td>

<code>WSAEHOSTDOWN</code>

</td>

<td>

Indicates that a network host is down.

</td>

</tr>

<tr>

<td>

<code>WSAEHOSTUNREACH</code>

</td>

<td>

Indicates that there is no route to a network host.

</td>

</tr>

<tr>

<td>

<code>WSAENOTEMPTY</code>

</td>

<td>

Indicates that the directory is not empty.

</td>

</tr>

<tr>

<td>

<code>WSAEPROCLIM</code>

</td>

<td>

Indicates that there are too many processes.

</td>

</tr>

<tr>

<td>

<code>WSAEUSERS</code>

</td>

<td>

Indicates that the user quota has been exceeded.

</td>

</tr>

<tr>

<td>

<code>WSAEDQUOT</code>

</td>

<td>

Indicates that the disk quota has been exceeded.

</td>

</tr>

<tr>

<td>

<code>WSAESTALE</code>

</td>

<td>

Indicates a stale file handle reference.

</td>

</tr>

<tr>

<td>

<code>WSAEREMOTE</code>

</td>

<td>

Indicates that the item is remote.

</td>

</tr>

<tr>

<td>

<code>WSASYSNOTREADY</code>

</td>

<td>

Indicates that the network subsystem is not ready.

</td>

</tr>

<tr>

<td>

<code>WSAVERNOTSUPPORTED</code>

</td>

<td>

Indicates that the <code>winsock.dll</code> version is out of range.

</td>

</tr>

<tr>

<td>

<code>WSANOTINITIALISED</code>

</td>

<td>

Indicates that successful WSAStartup has not yet been performed.

</td>

</tr>

<tr>

<td>

<code>WSAEDISCON</code>

</td>

<td>

Indicates that a graceful shutdown is in progress.

</td>

</tr>

<tr>

<td>

<code>WSAENOMORE</code>

</td>

<td>

Indicates that there are no more results.

</td>

</tr>

<tr>

<td>

<code>WSAECANCELLED</code>

</td>

<td>

Indicates that an operation has been canceled.

</td>

</tr>

<tr>

<td>

<code>WSAEINVALIDPROCTABLE</code>

</td>

<td>

Indicates that the procedure call table is invalid.

</td>

</tr>

<tr>

<td>

<code>WSAEINVALIDPROVIDER</code>

</td>

<td>

Indicates an invalid service provider.

</td>

</tr>

<tr>

<td>

<code>WSAEPROVIDERFAILEDINIT</code>

</td>

<td>

Indicates that the service provider failed to initialized.

</td>

</tr>

<tr>

<td>

<code>WSASYSCALLFAILURE</code>

</td>

<td>

Indicates a system call failure.

</td>

</tr>

<tr>

<td>

<code>WSASERVICE_NOT_FOUND</code>

</td>

<td>

Indicates that a service was not found.

</td>

</tr>

<tr>

<td>

<code>WSATYPE_NOT_FOUND</code>

</td>

<td>

Indicates that a class type was not found.

</td>

</tr>

<tr>

<td>

<code>WSA_E_NO_MORE</code>

</td>

<td>

Indicates that there are no more results.

</td>

</tr>

<tr>

<td>

<code>WSA_E_CANCELLED</code>

</td>

<td>

Indicates that the call was canceled.

</td>

</tr>

<tr>

<td>

<code>WSAEREFUSED</code>

</td>

<td>

Indicates that a database query was refused.

</td>

</tr>

</table>

<!-- 0028.part.md -->

### константы dlopen

Если они доступны в операционной системе, следующие константы экспортируются в `os.constants.dlopen`. Подробную информацию см. в разделе dlopen(3).

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>RTLD_LAZY</code>

</td>

<td>

Perform lazy binding. Node.js sets this flag by default.

</td>

</tr>

<tr>

<td>

<code>RTLD_NOW</code>

</td>

<td>

Resolve all undefined symbols in the library before dlopen(3) returns.

</td>

</tr>

<tr>

<td>

<code>RTLD_GLOBAL</code>

</td>

<td>

Symbols defined by the library will be made available for symbol resolution of subsequently loaded libraries.

</td>

</tr>

<tr>

<td>

<code>RTLD_LOCAL</code>

</td>

<td>

The converse of <code>RTLD_GLOBAL</code>. This is the default behavior if neither flag is specified.

</td>

</tr>

<tr>

<td>

<code>RTLD_DEEPBIND</code>

</td>

<td>

Make a self-contained library use its own symbols in preference to symbols from previously loaded libraries.

</td>

</tr>

</table>

<!-- 0029.part.md -->

### Константы приоритетов

Следующие константы планирования процессов экспортируются `os.constants.priority`.

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>PRIORITY_LOW</code>

</td>

<td>

The lowest process scheduling priority. This corresponds to <code>IDLE_PRIORITY_CLASS</code> on Windows, and a nice value of <code>19</code> on all other platforms.

</td>

</tr>

<tr>

<td>

<code>PRIORITY_BELOW_NORMAL</code>

</td>

<td>

The process scheduling priority above <code>PRIORITY_LOW</code> and below <code>PRIORITY_NORMAL</code>. This corresponds to <code>BELOW_NORMAL_PRIORITY_CLASS</code> on Windows, and a nice value of <code>10</code> on all other platforms.

</td>

</tr>

<tr>

<td>

<code>PRIORITY_NORMAL</code>

</td>

<td>

The default process scheduling priority. This corresponds to <code>NORMAL_PRIORITY_CLASS</code> on Windows, and a nice value of <code>0</code> on all other platforms.

</td>

</tr>

<tr>

<td>

<code>PRIORITY_ABOVE_NORMAL</code>

</td>

<td>

The process scheduling priority above <code>PRIORITY_NORMAL</code> and below <code>PRIORITY_HIGH</code>. This corresponds to <code>ABOVE_NORMAL_PRIORITY_CLASS</code> on Windows, and a nice value of <code>-7</code> on all other platforms.

</td>

</tr>

<tr>

<td>

<code>PRIORITY_HIGH</code>

</td>

<td>

The process scheduling priority above <code>PRIORITY_ABOVE_NORMAL</code> and below <code>PRIORITY_HIGHEST</code>. This corresponds to <code>HIGH_PRIORITY_CLASS</code> on Windows, and a nice value of <code>-14</code> on all other platforms.

</td>

</tr>

<tr>

<td>

<code>PRIORITY_HIGHEST</code>

</td>

<td>

The highest process scheduling priority. This corresponds to <code>REALTIME_PRIORITY_CLASS</code> on Windows, and a nice value of <code>-20</code> on all other platforms.

</td>

</tr>

</table>

<!-- 0030.part.md -->

### libuv constants

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>UV_UDP_REUSEADDR</code>

</td>

<td>

</td>

</tr>

</table>

<!-- 0031.part.md -->

