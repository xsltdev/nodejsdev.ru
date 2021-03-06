# Модуль os

!!!success "Стабильность: 2 – Стабильная"

Модуль **`os`** предоставляет набор операционных системных методов. Его можно вызвать так:

```js
const os = require('os');
```

## os.EOL

- `<Строка>`

Строковая константа, определяющая маркер конца текущей строки:

- `\n` на POSIX
- `\r\n` на Windows

## os.arch()

Метод `os.arch()` возвращает строку, которая определяет архитектуру CPU на данной ОС для которой компилируется бинарный Node.js.

Текущие возможные значения:

`arm`, `arm64`, `ia32`, `mips`, `mipsel`, `ppc`, `ppc64`, `s390`, `s390x`, `x32`, `x64` и `x86`

Равнозначно `process.arch`.

## os.constants

- `<Объект>`

Возвращает объект, содержащий общеиспользуемые константы операционнной системы для кодировки ошибок, сигналов процессов и тому подобное. Заданные константы описываются в константах ОС.

## os.cpus()

Возвращает `<Массив>`
Метод `os.cpus()` возвращает массив объектов, которые содержат информацию про каждый установленное ядро/CPU.

Свойства каждого объекта включают в себя:

- `model` `<Строка>`
- `speed` `<число>` (в МГц)
- `times` `<объект>`
  : - `user` `<число>` Число миллисекунд, которые CPU провел в пользовательском режиме
  : - `nice` `<число>` Число миллисекунд, которые CPU провел в nice режиме.
  : - `sys` `<число>` Число миллисекунд, которые CPU провел в sys режиме.
  : - `Idle` `<число>` Число миллисекунд, которые CPU провел в idle режиме.
  : - `Irq` `<число>` Число миллисекунд, которые CPU провел в irq режиме.

Пример:

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
  {
    model:
      'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 511580,
      nice: 20,
      sys: 40900,
      idle: 1070842510,
      irq: 0,
    },
  },
  {
    model:
      'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 291660,
      nice: 0,
      sys: 34360,
      idle: 1070888000,
      irq: 10,
    },
  },
  {
    model:
      'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 308260,
      nice: 0,
      sys: 55410,
      idle: 1071129970,
      irq: 880,
    },
  },
  {
    model:
      'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 266450,
      nice: 1480,
      sys: 34920,
      idle: 1072572010,
      irq: 30,
    },
  },
];
```

Примечание: так как значения `nice` являются заданными для UNIX, на Windows значения `nice` для всех процессоров всегда равняются `0`.

## os.endianness()

Возвращает: `<строка>`

Метод `os.endianness()` возвращает строку, определяющую порядок байт CPU для которого скомпилирован бинарный Node.js.

Возможные значения:

- `BE` для большого эндиана
- `LE` для малого эндиана

## os.freemem()

Возвращает: `<Integer>`

Метод `os.freemem()` возвращает количество свободной системной памяти в байтах в виде целого числа.

## os.homedir()

Возвращает: `<строка>`

Метод `os.homedir()` возвращает домашнюю директорию для текущего пользователя в виде строки.

## os.hostname()

Возвращает: `<строка>`

Метод `os.hostname()` возвращает имя хоста операционной системы в в виде строки.

## os.loadavg()

Возвращает: `<массив>`

Метод `os.loadavg()` возвращает массив, содержащий средние значения нагрузки за `1` и `15` минут.

Средняя нагрузка – это мера активности системы, вычисленная операционной системой и выраженная в виде дробного числа. Следуя правилу большого пальца, средняя нагрузка в идеале должна быть меньше, чем число логических CPU в системе.

Средняя нагрузка является исключительно UNIX-овым концептом и не имеет реальных аналогов на Windows. На Windows данный метод всегда будет возвращать значения `[0, 0, 0]`.

## os.networkInterfaces()

Возвращает: `<объект>`

Метод `os.networkInterfaces()` возвращает объект, содержащий только сетевые интерфейсы, которые были назначены на адрес сети.

Каждый ключ возвращаемого объекта указывает на сетевой интерфейс. Соответствующее ему значение является массивом объектов, каждый из которых описывает назначенный адрес сети.

Свойства, доступные для назначенного объекта адреса сети, включают:

- `address` `<Строка>` Назначенный адрес IPv4 или IPv6
- `netmask` `<Строка>` Сетевая маска IPv4 или IPv6
- `family` `<Строка>` IPv4или IPv6
- `mac` `<Строка>` MAC-адрес сетевого интерфейса
- `internal` `<boolean>` `true`, если сетевой интерфейс является замкнутым либо недоступным удаленно, во всех прочих случаях `false`
- `scopeid` `<число>` ID окружения для IPv6 (задается только если `family` имеет значение IPv6)

```js
{
	  lo: [
    {
     address: '127.0.0.1',
     netmask: '255.0.0.0',
	      family: 'IPv4',
     mac: '00:00:00:00:00:00',
      internal: true
    },
    {
      address: '::1',
      netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
     family: 'IPv6',
      mac: '00:00:00:00:00:00',
      internal: true
    }
  ],
  eth0: [
    {
      address: '192.168.1.108',
      netmask: '255.255.255.0',
      family: 'IPv4',
      mac: '01:02:03:0a:0b:0c',
      internal: false
    },
    {
      address: 'fe80::a00:27ff:fe4e:66a1',
      netmask: 'ffff:ffff:ffff:ffff::',
      family: 'IPv6',
      mac: '01:02:03:0a:0b:0c',
      internal: false
    }
  ]
}
```

## os.platform()

Возвращает: `<Строка>`

Метод `os.plaform()` возвращает строку, показывающущю, какая платформа ОС была установлена во время компиляции Node.js.

Возможные значения:

- `aix`
- `darwin`
- `freebsd`
- `linux`
- `openbsd`
- `sunos`
- `win32`

Является эквивалентом `process.platform`.

Примечание: значение `android` тоже может возвращаться, если Node.js билдится на операционной системе Android. Однако, поддержка Node.js на Android пока что экспериментальна.

## os.release()

Возвращает: `<Строка>`

Метод `os.release()` возвращает строку, показывающую релиз операционной системы.

Примечание: на системах POSIX релиз ОС определяется вызовом `uname(3)`. На Windows используют `GetVersionExW()`.

## os.tmpdir()

Возвращает: `<Строка>`

Метод `os.tmpdir()` возвращает строку, задающую операционную директорию по умолчанию для хранения временных файлов.

## os.totalmem()

Возвращает: `<Integer>`

Метод `os.totalmem()` возвращает все количество системной памяти в байтах в виде целого числа.

## os.type()

Возвращает: `<Строка>`

Метод `os.type()` возвращает строку, показывающую имя операционной системы, возвращенное `uname(3)`. Например, `Linux` на Linux, `Darwin` на OS X и `Windows_NT` на Windows.

Больше информации про [запуск uname](https://en.wikipedia.org/wiki/Uname#Examples) на разных операционных системах.

## os.uptime()

Возвращает: `<Integer>`

Метод `os.uptime()` возвращает время безотказной работы системы в секундах.

Примечание: по меркам целых значений Node.js, данное число представлено как `double`. Однако, дробные секунды не могут быть возвращены и данное значение обычно принимается как целое.

## os.userInfo()

```
os.userInfo([options])
```

- `options` `<Объект>`
  : - `encoding` `<Строка>` Кодировка символов, используемая для интерпретации получаемых строк. Если `encoding` устанавливается на `buffer`, значения `username`, `shell`, и `homedir` будут экземплярами `Buffer`. (по умолчанию `utf8`)

Возвращает: `<Объект>`

Метод `os.userInfo()` возвращает информацию о текущем пользователе – на платформах POSIX это обычно входит в настройки файла пароля. Возвращенный объект включает в себя `username`, `uid`, `gid`, `shell`, и `homedir`. На Windows поля `uid` и `gid` имеют значение `-1` и `shell` имеет значение `null`.

Значение `homedir`, возвращаемое через `os.userInfo()` предоставляется операционной системой. Эти отличается от результата работы `os.homedir()`, который запрашивает некоторые переменные окружения для домашней директории прежде, чем получить ответ от системы.

## Константы ОС

Нижеприведенные константы экспортируются из `os.constants`.

Примечание: не на каждой операционной системе доступны все константы.

### Константы сигналов

Эти константы сигналов экспортируются из `os.constants.signals`:

| Константа           | Описание                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `SIGHUP`            | Посылается для индикации закрытия управляющего терминала или существования родительского процесса                                      |
| `SIGINT`            | Посылается для индикации, когда пользователь хочет прервать процесс ((Ctrl+C))                                                         |
| `SIGQUIT`           | Посылается для индикации, когда пользователь хочет завершить процесс и выполнить сброс ядра.                                           |
| `SIGILL`            | Отправляется в процесс для уведомления о попытках выполнения недопустимой, некорректной, неизвестной или привелигированной инструкции. |
| `SIGTRAP`           | Отправляется в процесс, когда происходит иключение.                                                                                    |
| `SIGABRT`           | Отправляется в процесс для запроса о прерывании.                                                                                       |
| `SIGIOT`            | Синоним `SIGABRT`                                                                                                                      |
| `SIGBUS`            | Отправляется в процесс для предупреждения об ошибке шины.                                                                              |
| `SIGFPE`            | Отправляется в процесс для предупреждения о выполнении недопустимой арифметической операции.                                           |
| `SIGKILL`           | Отправляется в процесс для его немедленного завершения.                                                                                |
| `SIGUSR1` `SIGUSR2` | Отправляется в процесс для определения заданных пользователем условий.                                                                 |
| `SIGSEGV`           | Отправляется в процесс для уведомления об ошибке сегментации.                                                                          |
| `SIGPIPE`           | Отправляется в процесс при попытке записи в отключенный пайп.                                                                          |
| `SIGALRM`           | Отправляется в процесс, когда истекает системный таймер.                                                                               |
| `SIGTERM`           | Отправляется в процесс для запроса о завершении.                                                                                       |
| `SIGCHLD`           | Отправляется в процесс, когда завершается дочерний процесс.                                                                            |
| `SIGSTKFLT`         | Отправляется в процесс для индикации ошибки стека на сопроцессоре.                                                                     |
| `SIGCONT`           | Отправляется с инструкциями операционной системе для продолжения приостановленного процесса.                                           |
| `SIGSTOP`           | Отправляется с инструкциями операционной системе для остановки процесса.                                                               |
| `SIGTSTP`           | Отправляется в процесс с запросом на остановку.                                                                                        |
| `SIGBREAK`          | Отправляется для индикации, когда пользователь хочет прервать процесс.                                                                 |
| `SIGTTIN`           | Отправляется в процесс, когда он читает TTY, находясь в режиме бэкграунда.                                                             |
| `SIGTTOU`           | Отправляется в процесс, когда он записывает в TTY, находясь в режиме бэкграунда.                                                       |
| `SIGURG`            | Отправляется в процесс, когда нужно прочитать срочные данные из сокета                                                                 |
| `SIGXCPU`           | Отправляется в процесс, когда он превосходит свой лимит использования CPU.                                                             |
| `SIGXFSZ`           | Отправляется в процесс, когда он создает больший файл, чем максимально допустимый.                                                     |
| `SIGVTALRM`         | Отправляется в процесс при истечении виртуального таймера.                                                                             |
| `SIGPROF`           | Отправляется в процесс при истечении системного таймера.                                                                               |
| `SIGWINCH`          | Отправляется в процесс, когда управляющий терминал меняет размер.                                                                      |
| `SIGIO`             | Отправляется в процесс, когда доступен ввод-вывод (I/O)                                                                                |
| `SIGPOLL`           | Синоним `SIGIO`                                                                                                                        |
| `SIGLOST`           | Отправляется в процесс, когда теряется блокировщик файла.                                                                              |
| `SIGPWR`            | Отправляется в процесс для уведомления об ошибке включения.                                                                            |
| `SIGINFO`           | Синоним `SIGPWR`                                                                                                                       |
| `SIGSYS`            | Отправляется в процесс для уведомления о некорректном аргументе.                                                                       |
| `SIGUNUSED`         | Синоним `SIGSYS`                                                                                                                       |

### Константы ошибок

Следующие константы ошибок экспортируются из `os.constants.errno`:

#### Константы ошибок POSIX

| Константа         | Описание                                                                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E2BIG`           | Показывает, что список аргументов длиннее, чем ожидалось                                                                                                                                           |
| `EACCES`          | Показывает, что операция не получила достаточного разрешения                                                                                                                                       |
| `EADDRINUSE`      | Адрес сети уже используется                                                                                                                                                                        |
| `EADDRNOTAVAIL`   | Адрес сети на данный момент недоступен для использования                                                                                                                                           |
| `EAFNOSUPPORT`    | Семейство адресов сети не поддерживается                                                                                                                                                           |
| `EAGAIN`          | На данный момент нет доступных данных, нужно попробовать выполнить операцию позже                                                                                                                  |
| `EALREADY`        | Сокет уже обрабатывает соединение                                                                                                                                                                  |
| `EBADF`           | Файловый дескриптор невалидный                                                                                                                                                                     |
| `EBADMSG`         | Недопустимые данные                                                                                                                                                                                |
| `EBUSY`           | Девайс или источник заняты                                                                                                                                                                         |
| `ECANCELED`       | Операция была отменена                                                                                                                                                                             |
| `ECHILD`          | Дочерний процесс не существует                                                                                                                                                                     |
| `ECONNABORTED`    | Сетевое соединение было прервано                                                                                                                                                                   |
| `ECONNREFUSED`    | Сетевое соединение отклонено                                                                                                                                                                       |
| `ECONNRESET`      | Сетевое соединение сброшено                                                                                                                                                                        |
| `EDEADLK`         | Удалось избежать окончания ресурсов                                                                                                                                                                |
| `EDESTADDRREQ`    | Требуется адрес назначения                                                                                                                                                                         |
| `EDOM`            | Аргумент находится вне домена функции                                                                                                                                                              |
| `EDQUOT`          | Превышено выделенное пространство диска                                                                                                                                                            |
| `EEXIST`          | Файл уже существует                                                                                                                                                                                |
| `EFAULT`          | Недопустимый указатель адреса                                                                                                                                                                      |
| `EFBIG`           | Файл слишком большой                                                                                                                                                                               |
| `EHOSTUNREACH`    | Хост недоступен                                                                                                                                                                                    |
| `EIDRM`           | Идентификатор был удален                                                                                                                                                                           |
| `EILSEQ`          | Недопустимая последовательность байтов                                                                                                                                                             |
| `EINPROGRESS`     | Операция уже выполняется                                                                                                                                                                           |
| `EINTR`           | Вызов функции был прерван                                                                                                                                                                          |
| `EINVAL`          | Получен недопустимый аргумент                                                                                                                                                                      |
| `EIO`             | Ошибка ввода-вывод                                                                                                                                                                                 |
| `EISCONN`         | Сокет подключен                                                                                                                                                                                    |
| `EISDIR`          | Путь является директорией                                                                                                                                                                          |
| `ELOOP`           | Слишком много уровней символьных ссылок в пути                                                                                                                                                     |
| `EMFILE`          | Слишком много открытых файлов                                                                                                                                                                      |
| `EMLINK`          | Слишком много ссылок на файл                                                                                                                                                                       |
| `EMSGSIZE`        | Полученное сообщение слишком длинное                                                                                                                                                               |
| `EMULTIHOP`       | Была попытка многоинтервального подключения                                                                                                                                                        |
| `ENAMETOOLONG`    | Имя файла слишком длинное                                                                                                                                                                          |
| `ENETDOWN`        | Сеть «упала»                                                                                                                                                                                       |
| `ENETRESET`       | Соединение было прервано сетью                                                                                                                                                                     |
| `ENETUNREACH`     | Сеть недоступна                                                                                                                                                                                    |
| `ENFILE`          | Слишком много открытых файлов в системе                                                                                                                                                            |
| `ENOBUFS`         | Нет доступного места для буфера                                                                                                                                                                    |
| `ENODATA`         | Нет доступных сообщений в первой очереди на чтение в стриме                                                                                                                                        |
| `ENODEV`          | Нет такого девайса                                                                                                                                                                                 |
| `ENOENT`          | Нет такого файла или директории                                                                                                                                                                    |
| `ENOEXEC`         | Формат выполнения ошибочен                                                                                                                                                                         |
| `ENOLCK`          | Нет доступных блокировок                                                                                                                                                                           |
| `ENOLINK`         | Ссылка была разорвана                                                                                                                                                                              |
| `ENOMEM`          | Недостаточно места                                                                                                                                                                                 |
| `ENOMSG`          | Нет сообщений заданного типа                                                                                                                                                                       |
| `ENOPROTOOPT`     | Данный протокол недоступен                                                                                                                                                                         |
| `ENOSPC`          | Нет доступного места на девайсе                                                                                                                                                                    |
| `ENOSR`           | Нет доступных ресурсов стрима                                                                                                                                                                      |
| `ENOSTR`          | Данный ресурс не является стримом                                                                                                                                                                  |
| `ENOSYS`          | Функция не была реализована                                                                                                                                                                        |
| `ENOTCONN`        | Сокет не был подключен                                                                                                                                                                             |
| `ENOTDIR`         | Путь не является директорией                                                                                                                                                                       |
| `ENOTEMPTY`       | Директория не является пустой                                                                                                                                                                      |
| `ENOTSOCK`        | Данный элемент не является сокетом                                                                                                                                                                 |
| `ENOTSUP`         | Данная операция не поддерживается                                                                                                                                                                  |
| `ENOTTY`          | Некорректные операции для управления вводом-выводом                                                                                                                                                |
| `ENXIO`           | Нет такого девайса или адреса                                                                                                                                                                      |
| `EOPNOTSUPP`      | Операция не поддерживается на сокете. Следует помнить, что так как `ENOTSUP` и `EOPNOTSUPP` имеют одинаковые значения на Linux, соответственно POSIX.1 значения этих ошибок должны быть разделены. |
| `EOVERFLOW`       | Значение слишком большое для хранения в данном типе данных                                                                                                                                         |
| `EPERM`           | Операция не разрешена                                                                                                                                                                              |
| `EPIPE`           | Нерабочий пайп                                                                                                                                                                                     |
| `EPROTO`          | Ошибка протокола                                                                                                                                                                                   |
| `EPROTONOSUPPORT` | Протокол не поддерживается                                                                                                                                                                         |
| `EPROTOTYPE`      | Неправильный тип протокола для сокета                                                                                                                                                              |
| `ERANGE`          | Результат слишком большой                                                                                                                                                                          |
| `EROFS`           | Файловая система открыта только для чтения                                                                                                                                                         |
| `ESPIPE`          | Недопустимая операция поиска                                                                                                                                                                       |
| `ESRCH`           | Нет такого процесса                                                                                                                                                                                |
| `ESTALE`          | Файловый обработчик устарел                                                                                                                                                                        |
| `ETIME`           | Вышло время                                                                                                                                                                                        |
| `ETIMEDOUT`       | Время соединения вышло                                                                                                                                                                             |
| `ETXTBSY`         | Текстовый файл занят                                                                                                                                                                               |
| `EWOULDBLOCK`     | Операция будет заблокирована                                                                                                                                                                       |
| `EXDEV`           | Неточная ссылка                                                                                                                                                                                    |

#### Константы ошибок для Windows

Следующие коды ошибок являются характерными для Windows.

| Константа                | Описание                                              |
| ------------------------ | ----------------------------------------------------- |
| `WSAEINTR`               | Указывает на прерванный вызов функции                 |
| `WSAEBADF`               | Указывает на недопустимый файловый обработчик         |
| `WSAEACCES`              | Нет достаточно прав для выполнения операции           |
| `WSAEFAULT`              | Недопустимый указатель адреса                         |
| `WSAEINVAL`              | Был передан недопустимый аргумент                     |
| `WSAEMFILE`              | Слишком много открытых файлов                         |
| `WSAEWOULDBLOCK`         | Ресурс временно недоступен                            |
| `WSAEINPROGRESS`         | Операция на данный момент выполняется                 |
| `WSAEALREADY`            | Операция уже выполняется                              |
| `WSAENOTSOCK`            | Ресурс не является сокетом                            |
| `WSAEDESTADDRREQ`        | Требуется адрес назначения                            |
| `WSAEMSGSIZE`            | Размер сообщения слишком большой                      |
| `WSAEPROTOTYPE`          | Неправильный тип протокола для сокета                 |
| `WSAENOPROTOOPT`         | Ошибка протокола                                      |
| `WSAEPROTONOSUPPORT`     | Протокол не поддерживается                            |
| `WSAESOCKTNOSUPPORT`     | Тип сокета не поддерживается                          |
| `WSAEOPNOTSUPP`          | Операция не поддерживается                            |
| `WSAEPFNOSUPPORT`        | Семейство протоколов не поддерживается                |
| `WSAEAFNOSUPPORT`        | Семейство адресов не поддерживается                   |
| `WSAEADDRINUSE`          | Адрес сети недоступен                                 |
| `WSAENETDOWN`            | Сеть «упала»                                          |
| `WSAENETUNREACH`         | Сеть недоступна                                       |
| `WSAENETRESET`           | Сетевое соединение было сброшено                      |
| `WSAECONNABORTED`        | Соединение было прервано                              |
| `WSAECONNRESET`          | Соединение было сброшено пиром                        |
| `WSAENOBUFS`             | Нет свободного места для буфера                       |
| `WSAEISCONN`             | Сокет уже подключен                                   |
| `WSAENOTCONN`            | Сокет не подключен                                    |
| `WSAESHUTDOWN`           | Данные не могут быть отправлены после закрытия сокета |
| `WSAETOOMANYREFS`        | Слишком много ссылок                                  |
| `WSAETIMEDOUT`           | Время соединения вышло                                |
| `WSAECONNREFUSED`        | Соединение отклонено                                  |
| `WSAELOOP`               | Имя не может быть переведено                          |
| `WSAENAMETOOLONG`        | Имя слишком длинное                                   |
| `WSAEHOSTDOWN`           | Сетевой хост «упал»                                   |
| `WSAEHOSTUNREACH`        | Нет маршрута к сетевому хосту                         |
| `WSAENOTEMPTY`           | Директория не является пустой                         |
| `WSAEPROCLIM`            | Слишком много процессов                               |
| `WSAEUSERS`              | Пользовательская квота была превышена                 |
| `WSAEDQUOT`              | Дисковая квота была превышена                         |
| `WSAESTALE`              | Ссылка на устаревший файловый обработчик              |
| `WSAEREMOTE`             | Элемент удален                                        |
| `WSASYSNOTREADY`         | Сетевая подсистема не готова                          |
| `WSAVERNOTSUPPORTED`     | Версия `winsock.dll` недоступна                       |
| `WSANOTINITIALISED`      | Успешный запуск `WSAStartup` не был выполнен          |
| `WSAEDISCON`             | Тихое закрытие в процессе                             |
| `WSAENOMORE`             | Нет больше результатов                                |
| `WSAECANCELLED`          | Операция была отменена                                |
| `WSAEINVALIDPROCTABLE`   | Недопустимая таблица процедурный вызовов              |
| `WSAEINVALIDPROVIDER`    | Недопустимый сервисный провайдер                      |
| `WSAEPROVIDERFAILEDINIT` | Сервисный провайдер не прошел инициализацию           |
| `WSASYSCALLFAILURE`      | Ошибка системного вызова                              |
| `WSASERVICE_NOT_FOUND`   | Сервис не был найден                                  |
| `WSATYPE_NOT_FOUND`      | Тип класса не найден                                  |
| `WSA_E_NO_MORE`          | Нет больше результатов                                |
| `WSA_E_CANCELLED`        | Вызов был отменен                                     |
| `WSAEREFUSED`            | Запрос к базе данных был отклонен                     |

### Константы libuv

| Константа          | Описание |
| ------------------ | -------- |
| `UV_UDP_REUSEADDR` |          |
