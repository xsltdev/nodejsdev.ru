---
title: OS
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

Тонкая обёртка над [`uv_available_parallelism()`][`uv_available_parallelism()`] в libuv.

## `os.arch()`

<!-- YAML
added: v0.5.0
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Архитектура ЦП, под которую скомпилирован бинарник Node.js. Возможные значения:
`'arm'`, `'arm64'`, `'ia32'`, `'loong64'`,
`'mips'`, `'mipsel'`, `'ppc64'`, `'riscv64'`, `'s390x'` и `'x64'`.

Эквивалентно [`process.arch`][`process.arch`].

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

В POSIX тип определяется вызовом [`uname(3)`][`uname(3)`]. В Windows — `RtlGetVersion()`, при недоступности — `GetVersionExW()`. См. также
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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.4.0 | Свойство Family теперь возвращает строку вместо числа. |
    | v18.0.0 | Свойство Family теперь возвращает число вместо строки. |

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект с сетевыми интерфейсами, которым назначен адрес.

Каждый ключ — имя интерфейса; значение — массив объектов с описанием назначенного адреса.

Свойства объекта адреса:

* `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) назначенный IPv4 или IPv6
* `netmask` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) маска сети IPv4 или IPv6
* `family` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `IPv4` или `IPv6`
* `mac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) MAC-адрес интерфейса
* `internal` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` для loopback и аналогичных недоступных извне интерфейсов; иначе `false`
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

Эквивалентно [`process.platform`][`process.platform`].

Может вернуться `'android'`, если Node.js собран для Android.
[Поддержка Android экспериментальна][Android building].

## `os.release()`

<!-- YAML
added: v0.3.3
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строка с версией выпуска ОС.

В POSIX — через [`uname(3)`][`uname(3)`]. В Windows — `GetVersionExW()`. См.
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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v2.0.0 | Эта функция теперь является кроссплатформенной и больше не возвращает путь с косой чертой на конце ни на одной платформе. |

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

Имя ОС, как в [`uname(3)`][`uname(3)`]. Например `'Linux'`, `'Darwin'` на macOS, `'Windows_NT'` в Windows.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Результат этой функции больше не содержит дробный компонент в Windows. |

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

Выбрасывает [`SystemError`][`SystemError`], если нет `username` или `homedir`.

## `os.version()`

<!-- YAML
added:
 - v13.11.0
 - v12.17.0
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строка с версией ядра.

В POSIX — через [`uname(3)`][`uname(3)`]. В Windows — `RtlGetVersion()`, при необходимости `GetVersionExW()`. См.
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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v5.11.0 | Добавлена ​​поддержка SIGINFO. |

Константы сигналов экспортируются в `os.constants.signals`.

<table>
  <tr>
    <th>Константа</th>
    <th>Описание</th>
  </tr>
  <tr>
    <td><code>SIGHUP</code></td>
    <td>Сигнал при закрытии управляющего терминала или выходе родительского процесса.</td>
  </tr>
  <tr>
    <td><code>SIGINT</code></td>
    <td>Сигнал при прерывании процесса пользователем (<kbd>Ctrl</kbd>+<kbd>C</kbd>).</td>
  </tr>
  <tr>
    <td><code>SIGQUIT</code></td>
    <td>Сигнал при запросе завершения процесса и создания дампа памяти.</td>
  </tr>
  <tr>
    <td><code>SIGILL</code></td>
    <td>Сообщает процессу о недопустимой, некорректной, неизвестной или привилегированной инструкции.</td>
  </tr>
  <tr>
    <td><code>SIGTRAP</code></td>
    <td>Посылается процессу при исключении.</td>
  </tr>
  <tr>
    <td><code>SIGABRT</code></td>
    <td>Запрос аварийного завершения процесса.</td>
  </tr>
  <tr>
    <td><code>SIGIOT</code></td>
    <td>Синоним <code>SIGABRT</code></td>
  </tr>
  <tr>
    <td><code>SIGBUS</code></td>
    <td>Сообщает процессу об ошибке шины.</td>
  </tr>
  <tr>
    <td><code>SIGFPE</code></td>
    <td>Сообщает процессу о недопустимой арифметической операции.</td>
  </tr>
  <tr>
    <td><code>SIGKILL</code></td>
    <td>Немедленное завершение процесса.</td>
  </tr>
  <tr>
    <td><code>SIGUSR1</code> <code>SIGUSR2</code></td>
    <td>Пользовательские условия (SIGUSR1/SIGUSR2).</td>
  </tr>
  <tr>
    <td><code>SIGSEGV</code></td>
    <td>Сообщает процессу о нарушении сегментации.</td>
  </tr>
  <tr>
    <td><code>SIGPIPE</code></td>
    <td>Запись в разорванный канал (pipe).</td>
  </tr>
  <tr>
    <td><code>SIGALRM</code></td>
    <td>Истёк системный таймер.</td>
  </tr>
  <tr>
    <td><code>SIGTERM</code></td>
    <td>Запрос завершения процесса.</td>
  </tr>
  <tr>
    <td><code>SIGCHLD</code></td>
    <td>Завершился дочерний процесс.</td>
  </tr>
  <tr>
    <td><code>SIGSTKFLT</code></td>
    <td>Ошибка стека сопроцессора.</td>
  </tr>
  <tr>
    <td><code>SIGCONT</code></td>
    <td>Продолжить приостановленный процесс.</td>
  </tr>
  <tr>
    <td><code>SIGSTOP</code></td>
    <td>Остановить процесс.</td>
  </tr>
  <tr>
    <td><code>SIGTSTP</code></td>
    <td>Запрос остановки процесса.</td>
  </tr>
  <tr>
    <td><code>SIGBREAK</code></td>
    <td>Прерывание процесса по запросу пользователя.</td>
  </tr>
  <tr>
    <td><code>SIGTTIN</code></td>
    <td>Чтение из TTY процессом в фоне.</td>
  </tr>
  <tr>
    <td><code>SIGTTOU</code></td>
    <td>Запись в TTY процессом в фоне.</td>
  </tr>
  <tr>
    <td><code>SIGURG</code></td>
    <td>Срочные данные на сокете.</td>
  </tr>
  <tr>
    <td><code>SIGXCPU</code></td>
    <td>Превышен лимит использования CPU.</td>
  </tr>
  <tr>
    <td><code>SIGXFSZ</code></td>
    <td>Файл превысил допустимый размер.</td>
  </tr>
  <tr>
    <td><code>SIGVTALRM</code></td>
    <td>Истёк виртуальный таймер.</td>
  </tr>
  <tr>
    <td><code>SIGPROF</code></td>
    <td>Истёк системный таймер (SIGPROF).</td>
  </tr>
  <tr>
    <td><code>SIGWINCH</code></td>
    <td>Изменился размер управляющего терминала.</td>
  </tr>
  <tr>
    <td><code>SIGIO</code></td>
    <td>Доступен ввод-вывод.</td>
  </tr>
  <tr>
    <td><code>SIGPOLL</code></td>
    <td>Синоним <code>SIGIO</code></td>
  </tr>
  <tr>
    <td><code>SIGLOST</code></td>
    <td>Потеряна блокировка файла.</td>
  </tr>
  <tr>
    <td><code>SIGPWR</code></td>
    <td>Сбой питания.</td>
  </tr>
  <tr>
    <td><code>SIGINFO</code></td>
    <td>Синоним <code>SIGPWR</code></td>
  </tr>
  <tr>
    <td><code>SIGSYS</code></td>
    <td>Неверный аргумент.</td>
  </tr>
  <tr>
    <td><code>SIGUNUSED</code></td>
    <td>Синоним <code>SIGSYS</code></td>
  </tr>
</table>

### Константы ошибок

Константы ошибок экспортируются в `os.constants.errno`.

#### Константы ошибок POSIX

<table>
  <tr>
    <th>Константа</th>
    <th>Описание</th>
  </tr>
  <tr>
    <td><code>E2BIG</code></td>
    <td>Список аргументов слишком длинный.</td>
  </tr>
  <tr>
    <td><code>EACCES</code></td>
    <td>Недостаточно прав для операции.</td>
  </tr>
  <tr>
    <td><code>EADDRINUSE</code></td>
    <td>Сетевой адрес уже используется.</td>
  </tr>
  <tr>
    <td><code>EADDRNOTAVAIL</code></td>
    <td>Сетевой адрес сейчас недоступен.</td>
  </tr>
  <tr>
    <td><code>EAFNOSUPPORT</code></td>
    <td>Семейство сетевых адресов не поддерживается.</td>
  </tr>
  <tr>
    <td><code>EAGAIN</code></td>
    <td>Данных нет; повторите операцию позже.</td>
  </tr>
  <tr>
    <td><code>EALREADY</code></td>
    <td>У сокета уже есть незавершённое подключение.</td>
  </tr>
  <tr>
    <td><code>EBADF</code></td>
    <td>Некорректный файловый дескриптор.</td>
  </tr>
  <tr>
    <td><code>EBADMSG</code></td>
    <td>Некорректное сообщение данных.</td>
  </tr>
  <tr>
    <td><code>EBUSY</code></td>
    <td>Устройство или ресурс заняты.</td>
  </tr>
  <tr>
    <td><code>ECANCELED</code></td>
    <td>Операция отменена.</td>
  </tr>
  <tr>
    <td><code>ECHILD</code></td>
    <td>Нет дочерних процессов.</td>
  </tr>
  <tr>
    <td><code>ECONNABORTED</code></td>
    <td>Сетевое соединение прервано.</td>
  </tr>
  <tr>
    <td><code>ECONNREFUSED</code></td>
    <td>В соединении отказали.</td>
  </tr>
  <tr>
    <td><code>ECONNRESET</code></td>
    <td>Соединение сброшено.</td>
  </tr>
  <tr>
    <td><code>EDEADLK</code></td>
    <td>Тупик ресурсов разрешён.</td>
  </tr>
  <tr>
    <td><code>EDESTADDRREQ</code></td>
    <td>Требуется адрес назначения.</td>
  </tr>
  <tr>
    <td><code>EDOM</code></td>
    <td>Аргумент вне области определения функции.</td>
  </tr>
  <tr>
    <td><code>EDQUOT</code></td>
    <td>Превышена дисковая квота.</td>
  </tr>
  <tr>
    <td><code>EEXIST</code></td>
    <td>Файл уже существует.</td>
  </tr>
  <tr>
    <td><code>EFAULT</code></td>
    <td>Некорректный адрес указателя.</td>
  </tr>
  <tr>
    <td><code>EFBIG</code></td>
    <td>Файл слишком велик.</td>
  </tr>
  <tr>
    <td><code>EHOSTUNREACH</code></td>
    <td>Узел недоступен.</td>
  </tr>
  <tr>
    <td><code>EIDRM</code></td>
    <td>Идентификатор удалён.</td>
  </tr>
  <tr>
    <td><code>EILSEQ</code></td>
    <td>Недопустимая последовательность байт.</td>
  </tr>
  <tr>
    <td><code>EINPROGRESS</code></td>
    <td>Операция уже выполняется.</td>
  </tr>
  <tr>
    <td><code>EINTR</code></td>
    <td>Вызов функции прерван.</td>
  </tr>
  <tr>
    <td><code>EINVAL</code></td>
    <td>Передан неверный аргумент.</td>
  </tr>
  <tr>
    <td><code>EIO</code></td>
    <td>Неуточнённая ошибка ввода-вывода.</td>
  </tr>
  <tr>
    <td><code>EISCONN</code></td>
    <td>Сокет подключён.</td>
  </tr>
  <tr>
    <td><code>EISDIR</code></td>
    <td>Путь указывает на каталог.</td>
  </tr>
  <tr>
    <td><code>ELOOP</code></td>
    <td>Слишком много уровней символических ссылок в пути.</td>
  </tr>
  <tr>
    <td><code>EMFILE</code></td>
    <td>Слишком много открытых файлов.</td>
  </tr>
  <tr>
    <td><code>EMLINK</code></td>
    <td>Слишком много жёстких ссылок на файл.</td>
  </tr>
  <tr>
    <td><code>EMSGSIZE</code></td>
    <td>Сообщение слишком длинное.</td>
  </tr>
  <tr>
    <td><code>EMULTIHOP</code></td>
    <td>Попытка multihop.</td>
  </tr>
  <tr>
    <td><code>ENAMETOOLONG</code></td>
    <td>Имя файла слишком длинное.</td>
  </tr>
  <tr>
    <td><code>ENETDOWN</code></td>
    <td>Сеть недоступна.</td>
  </tr>
  <tr>
    <td><code>ENETRESET</code></td>
    <td>Сеть прервала соединение.</td>
  </tr>
  <tr>
    <td><code>ENETUNREACH</code></td>
    <td>Сеть недостижима.</td>
  </tr>
  <tr>
    <td><code>ENFILE</code></td>
    <td>В системе слишком много открытых файлов.</td>
  </tr>
  <tr>
    <td><code>ENOBUFS</code></td>
    <td>Нет места в буфере.</td>
  </tr>
  <tr>
    <td><code>ENODATA</code></td>
    <td>Нет сообщения в очереди чтения потока.</td>
  </tr>
  <tr>
    <td><code>ENODEV</code></td>
    <td>Нет такого устройства.</td>
  </tr>
  <tr>
    <td><code>ENOENT</code></td>
    <td>Нет такого файла или каталога.</td>
  </tr>
  <tr>
    <td><code>ENOEXEC</code></td>
    <td>Ошибка формата исполняемого файла.</td>
  </tr>
  <tr>
    <td><code>ENOLCK</code></td>
    <td>Нет доступных блокировок.</td>
  </tr>
  <tr>
    <td><code>ENOLINK</code></td>
    <td>Связь разорвана.</td>
  </tr>
  <tr>
    <td><code>ENOMEM</code></td>
    <td>Недостаточно памяти.</td>
  </tr>
  <tr>
    <td><code>ENOMSG</code></td>
    <td>Нет сообщения нужного типа.</td>
  </tr>
  <tr>
    <td><code>ENOPROTOOPT</code></td>
    <td>Протокол недоступен.</td>
  </tr>
  <tr>
    <td><code>ENOSPC</code></td>
    <td>На устройстве нет места.</td>
  </tr>
  <tr>
    <td><code>ENOSR</code></td>
    <td>Нет ресурсов потока.</td>
  </tr>
  <tr>
    <td><code>ENOSTR</code></td>
    <td>Ресурс не является потоком.</td>
  </tr>
  <tr>
    <td><code>ENOSYS</code></td>
    <td>Функция не реализована.</td>
  </tr>
  <tr>
    <td><code>ENOTCONN</code></td>
    <td>Сокет не подключён.</td>
  </tr>
  <tr>
    <td><code>ENOTDIR</code></td>
    <td>Путь не является каталогом.</td>
  </tr>
  <tr>
    <td><code>ENOTEMPTY</code></td>
    <td>Каталог не пуст.</td>
  </tr>
  <tr>
    <td><code>ENOTSOCK</code></td>
    <td>Объект не является сокетом.</td>
  </tr>
  <tr>
    <td><code>ENOTSUP</code></td>
    <td>Операция не поддерживается.</td>
  </tr>
  <tr>
    <td><code>ENOTTY</code></td>
    <td>Недопустимая операция управления вводом-выводом.</td>
  </tr>
  <tr>
    <td><code>ENXIO</code></td>
    <td>Нет такого устройства или адреса.</td>
  </tr>
  <tr>
    <td><code>EOPNOTSUPP</code></td>
    <td>Операция не поддерживается для сокета. Хотя на Linux <code>ENOTSUP</code> и <code>EOPNOTSUPP</code> совпадают, в POSIX.1 это разные коды.)</td>
  </tr>
  <tr>
    <td><code>EOVERFLOW</code></td>
    <td>Значение слишком велико для типа данных.</td>
  </tr>
  <tr>
    <td><code>EPERM</code></td>
    <td>Операция не разрешена.</td>
  </tr>
  <tr>
    <td><code>EPIPE</code></td>
    <td>Разорванный канал (pipe).</td>
  </tr>
  <tr>
    <td><code>EPROTO</code></td>
    <td>Ошибка протокола.</td>
  </tr>
  <tr>
    <td><code>EPROTONOSUPPORT</code></td>
    <td>Протокол не поддерживается.</td>
  </tr>
  <tr>
    <td><code>EPROTOTYPE</code></td>
    <td>Неверный тип протокола для сокета.</td>
  </tr>
  <tr>
    <td><code>ERANGE</code></td>
    <td>Результат слишком велик.</td>
  </tr>
  <tr>
    <td><code>EROFS</code></td>
    <td>Файловая система только для чтения.</td>
  </tr>
  <tr>
    <td><code>ESPIPE</code></td>
    <td>Некорректная операция позиционирования.</td>
  </tr>
  <tr>
    <td><code>ESRCH</code></td>
    <td>Нет такого процесса.</td>
  </tr>
  <tr>
    <td><code>ESTALE</code></td>
    <td>Устаревший дескриптор файла.</td>
  </tr>
  <tr>
    <td><code>ETIME</code></td>
    <td>Таймер истёк.</td>
  </tr>
  <tr>
    <td><code>ETIMEDOUT</code></td>
    <td>Истекло время ожидания соединения.</td>
  </tr>
  <tr>
    <td><code>ETXTBSY</code></td>
    <td>Текстовый файл занят.</td>
  </tr>
  <tr>
    <td><code>EWOULDBLOCK</code></td>
    <td>Операция заблокировала бы выполнение.</td>
  </tr>
  <tr>
    <td><code>EXDEV</code></td>
    <td>Некорректная связь.</td>
  </tr>
</table>

#### Константы ошибок Windows

Следующие коды ошибок относятся к Windows.

<table>
  <tr>
    <th>Константа</th>
    <th>Описание</th>
  </tr>
  <tr>
    <td><code>WSAEINTR</code></td>
    <td>Прерванный вызов функции.</td>
  </tr>
  <tr>
    <td><code>WSAEBADF</code></td>
    <td>Некорректный дескриптор файла.</td>
  </tr>
  <tr>
    <td><code>WSAEACCES</code></td>
    <td>Недостаточно прав для завершения операции.</td>
  </tr>
  <tr>
    <td><code>WSAEFAULT</code></td>
    <td>Некорректный адрес указателя.</td>
  </tr>
  <tr>
    <td><code>WSAEINVAL</code></td>
    <td>Передан неверный аргумент.</td>
  </tr>
  <tr>
    <td><code>WSAEMFILE</code></td>
    <td>Слишком много открытых файлов.</td>
  </tr>
  <tr>
    <td><code>WSAEWOULDBLOCK</code></td>
    <td>Ресурс временно недоступен.</td>
  </tr>
  <tr>
    <td><code>WSAEINPROGRESS</code></td>
    <td>Операция уже выполняется.</td>
  </tr>
  <tr>
    <td><code>WSAEALREADY</code></td>
    <td>Операция уже выполняется.</td>
  </tr>
  <tr>
    <td><code>WSAENOTSOCK</code></td>
    <td>Ресурс не является сокетом.</td>
  </tr>
  <tr>
    <td><code>WSAEDESTADDRREQ</code></td>
    <td>Требуется адрес назначения.</td>
  </tr>
  <tr>
    <td><code>WSAEMSGSIZE</code></td>
    <td>Сообщение слишком длинное.</td>
  </tr>
  <tr>
    <td><code>WSAEPROTOTYPE</code></td>
    <td>Неверный тип протокола для сокета.</td>
  </tr>
  <tr>
    <td><code>WSAENOPROTOOPT</code></td>
    <td>Неверная опция протокола.</td>
  </tr>
  <tr>
    <td><code>WSAEPROTONOSUPPORT</code></td>
    <td>Протокол не поддерживается.</td>
  </tr>
  <tr>
    <td><code>WSAESOCKTNOSUPPORT</code></td>
    <td>Тип сокета не поддерживается.</td>
  </tr>
  <tr>
    <td><code>WSAEOPNOTSUPP</code></td>
    <td>Операция не поддерживается.</td>
  </tr>
  <tr>
    <td><code>WSAEPFNOSUPPORT</code></td>
    <td>Семейство протоколов не поддерживается.</td>
  </tr>
  <tr>
    <td><code>WSAEAFNOSUPPORT</code></td>
    <td>Семейство адресов не поддерживается.</td>
  </tr>
  <tr>
    <td><code>WSAEADDRINUSE</code></td>
    <td>Сетевой адрес уже используется.</td>
  </tr>
  <tr>
    <td><code>WSAEADDRNOTAVAIL</code></td>
    <td>Сетевой адрес недоступен.</td>
  </tr>
  <tr>
    <td><code>WSAENETDOWN</code></td>
    <td>Сеть недоступна.</td>
  </tr>
  <tr>
    <td><code>WSAENETUNREACH</code></td>
    <td>Сеть недостижима.</td>
  </tr>
  <tr>
    <td><code>WSAENETRESET</code></td>
    <td>Соединение сброшено.</td>
  </tr>
  <tr>
    <td><code>WSAECONNABORTED</code></td>
    <td>Соединение прервано.</td>
  </tr>
  <tr>
    <td><code>WSAECONNRESET</code></td>
    <td>Удалённый узел сбросил соединение.</td>
  </tr>
  <tr>
    <td><code>WSAENOBUFS</code></td>
    <td>Нет места в буфере.</td>
  </tr>
  <tr>
    <td><code>WSAEISCONN</code></td>
    <td>Сокет уже подключён.</td>
  </tr>
  <tr>
    <td><code>WSAENOTCONN</code></td>
    <td>Сокет не подключён.</td>
  </tr>
  <tr>
    <td><code>WSAESHUTDOWN</code></td>
    <td>Нельзя отправлять данные после shutdown сокета.</td>
  </tr>
  <tr>
    <td><code>WSAETOOMANYREFS</code></td>
    <td>Слишком много ссылок.</td>
  </tr>
  <tr>
    <td><code>WSAETIMEDOUT</code></td>
    <td>Истекло время ожидания соединения.</td>
  </tr>
  <tr>
    <td><code>WSAECONNREFUSED</code></td>
    <td>В соединении отказали.</td>
  </tr>
  <tr>
    <td><code>WSAELOOP</code></td>
    <td>Имя нельзя преобразовать.</td>
  </tr>
  <tr>
    <td><code>WSAENAMETOOLONG</code></td>
    <td>Имя слишком длинное.</td>
  </tr>
  <tr>
    <td><code>WSAEHOSTDOWN</code></td>
    <td>Сетевой узел недоступен.</td>
  </tr>
  <tr>
    <td><code>WSAEHOSTUNREACH</code></td>
    <td>Нет маршрута до узла.</td>
  </tr>
  <tr>
    <td><code>WSAENOTEMPTY</code></td>
    <td>Каталог не пуст.</td>
  </tr>
  <tr>
    <td><code>WSAEPROCLIM</code></td>
    <td>Слишком много процессов.</td>
  </tr>
  <tr>
    <td><code>WSAEUSERS</code></td>
    <td>Превышена квота пользователя.</td>
  </tr>
  <tr>
    <td><code>WSAEDQUOT</code></td>
    <td>Превышена дисковая квота.</td>
  </tr>
  <tr>
    <td><code>WSAESTALE</code></td>
    <td>Устаревшая ссылка на дескриптор файла.</td>
  </tr>
  <tr>
    <td><code>WSAEREMOTE</code></td>
    <td>Объект удалённый.</td>
  </tr>
  <tr>
    <td><code>WSASYSNOTREADY</code></td>
    <td>Сетевая подсистема не готова.</td>
  </tr>
  <tr>
    <td><code>WSAVERNOTSUPPORTED</code></td>
    <td>Версия <code>winsock.dll</code> вне допустимого диапазона.</td>
  </tr>
  <tr>
    <td><code>WSANOTINITIALISED</code></td>
    <td>Успешный WSAStartup ещё не выполнялся.</td>
  </tr>
  <tr>
    <td><code>WSAEDISCON</code></td>
    <td>Выполняется корректное завершение.</td>
  </tr>
  <tr>
    <td><code>WSAENOMORE</code></td>
    <td>Больше нет результатов.</td>
  </tr>
  <tr>
    <td><code>WSAECANCELLED</code></td>
    <td>Операция отменена.</td>
  </tr>
  <tr>
    <td><code>WSAEINVALIDPROCTABLE</code></td>
    <td>Таблица вызовов процедур некорректна.</td>
  </tr>
  <tr>
    <td><code>WSAEINVALIDPROVIDER</code></td>
    <td>Некорректный поставщик услуг.</td>
  </tr>
  <tr>
    <td><code>WSAEPROVIDERFAILEDINIT</code></td>
    <td>Не удалось инициализировать поставщика услуг.</td>
  </tr>
  <tr>
    <td><code>WSASYSCALLFAILURE</code></td>
    <td>Ошибка системного вызова.</td>
  </tr>
  <tr>
    <td><code>WSASERVICE_NOT_FOUND</code></td>
    <td>Служба не найдена.</td>
  </tr>
  <tr>
    <td><code>WSATYPE_NOT_FOUND</code></td>
    <td>Тип класса не найден.</td>
  </tr>
  <tr>
    <td><code>WSA_E_NO_MORE</code></td>
    <td>Больше нет результатов.</td>
  </tr>
  <tr>
    <td><code>WSA_E_CANCELLED</code></td>
    <td>Вызов отменён.</td>
  </tr>
  <tr>
    <td><code>WSAEREFUSED</code></td>
    <td>Запрос к базе отклонён.</td>
  </tr>
</table>

### Константы dlopen

Если доступны в ОС, эти константы экспортируются в `os.constants.dlopen`. Подробности — в dlopen(3).

<table>
  <tr>
    <th>Константа</th>
    <th>Описание</th>
  </tr>
  <tr>
    <td><code>RTLD_LAZY</code></td>
    <td>Ленивое связывание. По умолчанию Node.js задаёт этот флаг.</td>
  </tr>
  <tr>
    <td><code>RTLD_NOW</code></td>
    <td>Разрешить все неопределённые символы до возврата из dlopen(3).</td>
  </tr>
  <tr>
    <td><code>RTLD_GLOBAL</code></td>
    <td>Символы библиотеки доступны для разрешения в последующих загрузках.</td>
  </tr>
  <tr>
    <td><code>RTLD_LOCAL</code></td>
    <td>Противоположность <code>RTLD_GLOBAL</code>. Поведение по умолчанию, если флаги не заданы.</td>
  </tr>
  <tr>
    <td><code>RTLD_DEEPBIND</code></td>
    <td>Самодостаточная библиотека предпочитает свои символы символам ранее загруженных библиотек.</td>
  </tr>
</table>

### Константы приоритета

<!-- YAML
added: v10.10.0
-->

Константы планирования процессов экспортируются в
`os.constants.priority`.

<table>
  <tr>
    <th>Константа</th>
    <th>Описание</th>
  </tr>
  <tr>
    <td><code>PRIORITY_LOW</code></td>
    <td>Наименьший приоритет планирования: <code>IDLE_PRIORITY_CLASS</code> в Windows, nice <code>19</code> на остальных платформах.</td>
  </tr>
  <tr>
    <td><code>PRIORITY_BELOW_NORMAL</code></td>
    <td>Приоритет между <code>PRIORITY_LOW</code> и <code>PRIORITY_NORMAL</code>: <code>BELOW_NORMAL_PRIORITY_CLASS</code> в Windows, nice <code>10</code> иначе.</td>
  </tr>
  <tr>
    <td><code>PRIORITY_NORMAL</code></td>
    <td>Приоритет по умолчанию: <code>NORMAL_PRIORITY_CLASS</code> в Windows, nice <code>0</code> иначе.</td>
  </tr>
  <tr>
    <td><code>PRIORITY_ABOVE_NORMAL</code></td>
    <td>Приоритет между <code>PRIORITY_NORMAL</code> и <code>PRIORITY_HIGH</code>: <code>ABOVE_NORMAL_PRIORITY_CLASS</code> в Windows, nice <code>-7</code> иначе.</td>
  </tr>
  <tr>
    <td><code>PRIORITY_HIGH</code></td>
    <td>Приоритет между <code>PRIORITY_ABOVE_NORMAL</code> и <code>PRIORITY_HIGHEST</code>: <code>HIGH_PRIORITY_CLASS</code> в Windows, nice <code>-14</code> иначе.</td>
  </tr>
  <tr>
    <td><code>PRIORITY_HIGHEST</code></td>
    <td>Наивысший приоритет: <code>REALTIME_PRIORITY_CLASS</code> в Windows, nice <code>-20</code> иначе.</td>
  </tr>
</table>

### Константы libuv

<table>
  <tr>
    <th>Константа</th>
    <th>Описание</th>
  </tr>
  <tr>
    <td><code>UV_UDP_REUSEADDR</code></td>
    <td></td>
  </tr>
</table>

[Android building]: https://github.com/nodejs/node/blob/HEAD/BUILDING.md#android
[EUID]: https://en.wikipedia.org/wiki/User_identifier#Effective_user_ID
[`SystemError`]: errors.md#class-systemerror
[`process.arch`]: process.md#processarch
[`process.platform`]: process.md#processplatform
[`uname(3)`]: https://linux.die.net/man/3/uname
[`uv_available_parallelism()`]: https://docs.libuv.org/en/v1.x/misc.html#c.uv_available_parallelism
