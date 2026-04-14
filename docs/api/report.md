---
title: Диагностический отчёт
description: JSON-диагностический отчёт о процессе Node.js — стеки, куча, ресурсы; запуск по флагам, сигналам и через process.report
---

# Диагностический отчёт

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/report.html)

<!--introduced_in=v11.8.0-->

<!-- type=misc -->

<!-- name=report -->

<!-- YAML
changes:
  - version:
    - v23.3.0
    - v22.13.0
    pr-url: https://github.com/nodejs/node/pull/55697
    description: Added `--report-exclude-env` option for excluding environment variables from report generation.
  - version:
    - v22.0.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/51645
    description: Added `--report-exclude-network` option for excluding networking operations that can slow down report generation in some cases.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.3.0, v22.13.0 | Добавлен параметр `--report-exclude-env` для исключения переменных окружения из создаваемого отчёта. |
    | v22.0.0, v20.13.0 | Добавлен параметр `--report-exclude-network` для исключения сетевых операций, которые в некоторых случаях могут замедлить создание отчётов. |

!!!success "Стабильность: 2 – Стабильная"

    API является удовлетворительным. Совместимость с npm имеет высший приоритет и не будет нарушена, кроме случаев явной необходимости.

Формирует диагностическую сводку в формате JSON и записывает её в файл.

Отчёт предназначен для разработки, тестов и продуктива: фиксирует и сохраняет данные для разбора проблем. В него входят стеки JavaScript и нативного кода, статистика кучи, сведения о платформе, использование ресурсов и т.д. При включённой опции отчёты можно получать при необработанных исключениях, фатальных ошибках и пользовательских сигналах, а также вызывать программно через API.

Ниже приведён полный пример отчёта, сгенерированного при необработанном исключении.

```json
{
  "header": {
    "reportVersion": 5,
    "event": "exception",
    "trigger": "Exception",
    "filename": "report.20181221.005011.8974.0.001.json",
    "dumpEventTime": "2018-12-21T00:50:11Z",
    "dumpEventTimeStamp": "1545371411331",
    "processId": 8974,
    "cwd": "/home/nodeuser/project/node",
    "commandLine": [
      "/home/nodeuser/project/node/out/Release/node",
      "--report-uncaught-exception",
      "/home/nodeuser/project/node/test/report/test-exception.js",
      "child"
    ],
    "nodejsVersion": "v12.0.0-pre",
    "glibcVersionRuntime": "2.17",
    "glibcVersionCompiler": "2.17",
    "wordSize": "64 bit",
    "arch": "x64",
    "platform": "linux",
    "componentVersions": {
      "node": "12.0.0-pre",
      "v8": "7.1.302.28-node.5",
      "uv": "1.24.1",
      "zlib": "1.2.11",
      "ares": "1.15.0",
      "modules": "68",
      "nghttp2": "1.34.0",
      "napi": "3",
      "llhttp": "1.0.1",
      "openssl": "1.1.0j"
    },
    "release": {
      "name": "node"
    },
    "osName": "Linux",
    "osRelease": "3.10.0-862.el7.x86_64",
    "osVersion": "#1 SMP Wed Mar 21 18:14:51 EDT 2018",
    "osMachine": "x86_64",
    "cpus": [
      {
        "model": "Intel(R) Core(TM) i7-6820HQ CPU @ 2.70GHz",
        "speed": 2700,
        "user": 88902660,
        "nice": 0,
        "sys": 50902570,
        "idle": 241732220,
        "irq": 0
      },
      {
        "model": "Intel(R) Core(TM) i7-6820HQ CPU @ 2.70GHz",
        "speed": 2700,
        "user": 88902660,
        "nice": 0,
        "sys": 50902570,
        "idle": 241732220,
        "irq": 0
      }
    ],
    "networkInterfaces": [
      {
        "name": "en0",
        "internal": false,
        "mac": "13:10:de:ad:be:ef",
        "address": "10.0.0.37",
        "netmask": "255.255.255.0",
        "family": "IPv4"
      }
    ],
    "host": "test_machine"
  },
  "javascriptStack": {
    "message": "Error: *** test-exception.js: throwing uncaught Error",
    "stack": [
      "at myException (/home/nodeuser/project/node/test/report/test-exception.js:9:11)",
      "at Object.<anonymous> (/home/nodeuser/project/node/test/report/test-exception.js:12:3)",
      "at Module._compile (internal/modules/cjs/loader.js:718:30)",
      "at Object.Module._extensions..js (internal/modules/cjs/loader.js:729:10)",
      "at Module.load (internal/modules/cjs/loader.js:617:32)",
      "at tryModuleLoad (internal/modules/cjs/loader.js:560:12)",
      "at Function.Module._load (internal/modules/cjs/loader.js:552:3)",
      "at Function.Module.runMain (internal/modules/cjs/loader.js:771:12)",
      "at executeUserCode (internal/bootstrap/node.js:332:15)"
    ]
  },
  "nativeStack": [
    {
      "pc": "0x000055b57f07a9ef",
      "symbol": "report::GetNodeReport(v8::Isolate*, node::Environment*, char const*, char const*, v8::Local<v8::String>, std::ostream&) [./node]"
    },
    {
      "pc": "0x000055b57f07cf03",
      "symbol": "report::GetReport(v8::FunctionCallbackInfo<v8::Value> const&) [./node]"
    },
    {
      "pc": "0x000055b57f1bccfd",
      "symbol": " [./node]"
    },
    {
      "pc": "0x000055b57f1be048",
      "symbol": "v8::internal::Builtin_HandleApiCall(int, v8::internal::Object**, v8::internal::Isolate*) [./node]"
    },
    {
      "pc": "0x000055b57feeda0e",
      "symbol": " [./node]"
    }
  ],
  "javascriptHeap": {
    "totalMemory": 5660672,
    "executableMemory": 524288,
    "totalCommittedMemory": 5488640,
    "availableMemory": 4341379928,
    "totalGlobalHandlesMemory": 8192,
    "usedGlobalHandlesMemory": 3136,
    "usedMemory": 4816432,
    "memoryLimit": 4345298944,
    "mallocedMemory": 254128,
    "externalMemory": 315644,
    "peakMallocedMemory": 98752,
    "nativeContextCount": 1,
    "detachedContextCount": 0,
    "doesZapGarbage": 0,
    "heapSpaces": {
      "read_only_space": {
        "memorySize": 524288,
        "committedMemory": 39208,
        "capacity": 515584,
        "used": 30504,
        "available": 485080
      },
      "new_space": {
        "memorySize": 2097152,
        "committedMemory": 2019312,
        "capacity": 1031168,
        "used": 985496,
        "available": 45672
      },
      "old_space": {
        "memorySize": 2273280,
        "committedMemory": 1769008,
        "capacity": 1974640,
        "used": 1725488,
        "available": 249152
      },
      "code_space": {
        "memorySize": 696320,
        "committedMemory": 184896,
        "capacity": 152128,
        "used": 152128,
        "available": 0
      },
      "map_space": {
        "memorySize": 536576,
        "committedMemory": 344928,
        "capacity": 327520,
        "used": 327520,
        "available": 0
      },
      "large_object_space": {
        "memorySize": 0,
        "committedMemory": 0,
        "capacity": 1520590336,
        "used": 0,
        "available": 1520590336
      },
      "new_large_object_space": {
        "memorySize": 0,
        "committedMemory": 0,
        "capacity": 0,
        "used": 0,
        "available": 0
      }
    }
  },
  "resourceUsage": {
    "rss": "35766272",
    "free_memory": "1598337024",
    "total_memory": "17179869184",
    "available_memory": "1598337024",
    "maxRss": "36624662528",
    "constrained_memory": "36624662528",
    "userCpuSeconds": 0.040072,
    "kernelCpuSeconds": 0.016029,
    "cpuConsumptionPercent": 5.6101,
    "userCpuConsumptionPercent": 4.0072,
    "kernelCpuConsumptionPercent": 1.6029,
    "pageFaults": {
      "IORequired": 0,
      "IONotRequired": 4610
    },
    "fsActivity": {
      "reads": 0,
      "writes": 0
    }
  },
  "uvthreadResourceUsage": {
    "userCpuSeconds": 0.039843,
    "kernelCpuSeconds": 0.015937,
    "cpuConsumptionPercent": 5.578,
    "userCpuConsumptionPercent": 3.9843,
    "kernelCpuConsumptionPercent": 1.5937,
    "fsActivity": {
      "reads": 0,
      "writes": 0
    }
  },
  "libuv": [
    {
      "type": "async",
      "is_active": true,
      "is_referenced": false,
      "address": "0x0000000102910900",
      "details": ""
    },
    {
      "type": "timer",
      "is_active": false,
      "is_referenced": false,
      "address": "0x00007fff5fbfeab0",
      "repeat": 0,
      "firesInMsFromNow": 94403548320796,
      "expired": true
    },
    {
      "type": "check",
      "is_active": true,
      "is_referenced": false,
      "address": "0x00007fff5fbfeb48"
    },
    {
      "type": "idle",
      "is_active": false,
      "is_referenced": true,
      "address": "0x00007fff5fbfebc0"
    },
    {
      "type": "prepare",
      "is_active": false,
      "is_referenced": false,
      "address": "0x00007fff5fbfec38"
    },
    {
      "type": "check",
      "is_active": false,
      "is_referenced": false,
      "address": "0x00007fff5fbfecb0"
    },
    {
      "type": "async",
      "is_active": true,
      "is_referenced": false,
      "address": "0x000000010188f2e0"
    },
    {
      "type": "tty",
      "is_active": false,
      "is_referenced": true,
      "address": "0x000055b581db0e18",
      "width": 204,
      "height": 55,
      "fd": 17,
      "writeQueueSize": 0,
      "readable": true,
      "writable": true
    },
    {
      "type": "signal",
      "is_active": true,
      "is_referenced": false,
      "address": "0x000055b581d80010",
      "signum": 28,
      "signal": "SIGWINCH"
    },
    {
      "type": "tty",
      "is_active": true,
      "is_referenced": true,
      "address": "0x000055b581df59f8",
      "width": 204,
      "height": 55,
      "fd": 19,
      "writeQueueSize": 0,
      "readable": true,
      "writable": true
    },
    {
      "type": "loop",
      "is_active": true,
      "address": "0x000055fc7b2cb180",
      "loopIdleTimeSeconds": 22644.8
    },
    {
      "type": "tcp",
      "is_active": true,
      "is_referenced": true,
      "address": "0x000055e70fcb85d8",
      "localEndpoint": {
        "host": "localhost",
        "ip4": "127.0.0.1",
        "port": 48986
      },
      "remoteEndpoint": {
        "host": "localhost",
        "ip4": "127.0.0.1",
        "port": 38573
      },
      "sendBufferSize": 2626560,
      "recvBufferSize": 131072,
      "fd": 24,
      "writeQueueSize": 0,
      "readable": true,
      "writable": true
    }
  ],
  "workers": [],
  "environmentVariables": {
    "REMOTEHOST": "REMOVED",
    "MANPATH": "/opt/rh/devtoolset-3/root/usr/share/man:",
    "XDG_SESSION_ID": "66126",
    "HOSTNAME": "test_machine",
    "HOST": "test_machine",
    "TERM": "xterm-256color",
    "SHELL": "/bin/csh",
    "SSH_CLIENT": "REMOVED",
    "PERL5LIB": "/opt/rh/devtoolset-3/root//usr/lib64/perl5/vendor_perl:/opt/rh/devtoolset-3/root/usr/lib/perl5:/opt/rh/devtoolset-3/root//usr/share/perl5/vendor_perl",
    "OLDPWD": "/home/nodeuser/project/node/src",
    "JAVACONFDIRS": "/opt/rh/devtoolset-3/root/etc/java:/etc/java",
    "SSH_TTY": "/dev/pts/0",
    "PCP_DIR": "/opt/rh/devtoolset-3/root",
    "GROUP": "normaluser",
    "USER": "nodeuser",
    "LD_LIBRARY_PATH": "/opt/rh/devtoolset-3/root/usr/lib64:/opt/rh/devtoolset-3/root/usr/lib",
    "HOSTTYPE": "x86_64-linux",
    "XDG_CONFIG_DIRS": "/opt/rh/devtoolset-3/root/etc/xdg:/etc/xdg",
    "MAIL": "/var/spool/mail/nodeuser",
    "PATH": "/home/nodeuser/project/node:/opt/rh/devtoolset-3/root/usr/bin:/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin",
    "PWD": "/home/nodeuser/project/node",
    "LANG": "en_US.UTF-8",
    "PS1": "\\u@\\h : \\[\\e[31m\\]\\w\\[\\e[m\\] >  ",
    "SHLVL": "2",
    "HOME": "/home/nodeuser",
    "OSTYPE": "linux",
    "VENDOR": "unknown",
    "PYTHONPATH": "/opt/rh/devtoolset-3/root/usr/lib64/python2.7/site-packages:/opt/rh/devtoolset-3/root/usr/lib/python2.7/site-packages",
    "MACHTYPE": "x86_64",
    "LOGNAME": "nodeuser",
    "XDG_DATA_DIRS": "/opt/rh/devtoolset-3/root/usr/share:/usr/local/share:/usr/share",
    "LESSOPEN": "||/usr/bin/lesspipe.sh %s",
    "INFOPATH": "/opt/rh/devtoolset-3/root/usr/share/info",
    "XDG_RUNTIME_DIR": "/run/user/50141",
    "_": "./node"
  },
  "userLimits": {
    "core_file_size_blocks": {
      "soft": "",
      "hard": "unlimited"
    },
    "data_seg_size_bytes": {
      "soft": "unlimited",
      "hard": "unlimited"
    },
    "file_size_blocks": {
      "soft": "unlimited",
      "hard": "unlimited"
    },
    "max_locked_memory_bytes": {
      "soft": "unlimited",
      "hard": 65536
    },
    "max_memory_size_bytes": {
      "soft": "unlimited",
      "hard": "unlimited"
    },
    "open_files": {
      "soft": "unlimited",
      "hard": 4096
    },
    "stack_size_bytes": {
      "soft": "unlimited",
      "hard": "unlimited"
    },
    "cpu_time_seconds": {
      "soft": "unlimited",
      "hard": "unlimited"
    },
    "max_user_processes": {
      "soft": "unlimited",
      "hard": 4127290
    },
    "virtual_memory_bytes": {
      "soft": "unlimited",
      "hard": "unlimited"
    }
  },
  "sharedObjects": [
    "/lib64/libdl.so.2",
    "/lib64/librt.so.1",
    "/lib64/libstdc++.so.6",
    "/lib64/libm.so.6",
    "/lib64/libgcc_s.so.1",
    "/lib64/libpthread.so.0",
    "/lib64/libc.so.6",
    "/lib64/ld-linux-x86-64.so.2"
  ]
}
```

## Использование

```bash
node --report-uncaught-exception --report-on-signal \
--report-on-fatalerror app.js
```

* `--report-uncaught-exception` — включает генерацию отчёта при необработанных исключениях. Удобно при анализе стека JavaScript вместе с нативным стеком и прочими данными окружения.

* `--report-on-signal` — включает генерацию отчёта при получении процессом Node.js указанного сигнала (или сигнала по умолчанию; ниже описано, как его сменить). По умолчанию используется `SIGUSR2`. Это полезно, когда отчёт нужно инициировать из другой программы. Мониторы приложений могут периодически собирать отчёты и строить представления по внутренним данным рантайма.

Генерация отчёта по сигналу в Windows не поддерживается.

Обычно менять сигнал запуска отчёта не требуется. Если `SIGUSR2` уже занят, этот флаг позволяет выбрать другой сигнал для отчёта и сохранить исходное назначение `SIGUSR2`.

* `--report-on-fatalerror` — включает отчёт при фатальных ошибках (внутренних ошибках рантайма Node.js, например нехватке памяти), ведущих к завершению приложения. Позволяет изучить кучу, стек, состояние цикла событий, потребление ресурсов и т.д.

* `--report-compact` — записывает отчёты в компактном однострочном JSON, удобном для систем обработки логов, в отличие от многострочного формата по умолчанию.

* `--report-directory` — каталог, в котором будет создан отчёт.

* `--report-filename` — имя файла, в который пишется отчёт.

* `--report-signal` — задаёт или сбрасывает сигнал для генерации отчёта (в Windows не поддерживается). По умолчанию `SIGUSR2`.

* `--report-exclude-network` — исключает `header.networkInterfaces` и отключает обратные DNS-запросы для `libuv.*.(remote|local)Endpoint.host` в отчёте. По умолчанию не задано, интерфейсы включаются.

* `--report-exclude-env` — исключает `environmentVariables` из отчёта. По умолчанию не задано, переменные окружения включаются.

Отчёт также можно сформировать из JavaScript-приложения:

```js
process.report.writeReport();
```

Необязательный аргумент `filename` — имя файла, куда записывается отчёт.

```js
process.report.writeReport('./foo.json');
```

Необязательный аргумент `err` — объект `Error`, задающий контекст для стека JavaScript в отчёте. При обработке ошибок в колбэке или обработчике исключений это позволяет включить в отчёт и место исходной ошибки, и место её обработки.

```js
try {
  process.chdir('/non-existent-path');
} catch (err) {
  process.report.writeReport(err);
}
// Любой другой код
```

Если переданы и имя файла, и объект ошибки, объект ошибки должен быть вторым аргументом.

```js
try {
  process.chdir('/non-existent-path');
} catch (err) {
  process.report.writeReport(filename, err);
}
// Any other code
```

Содержимое диагностического отчёта можно получить как объект JavaScript:

```js
const report = process.report.getReport();
console.log(typeof report === 'object'); // true

// Аналогично выводу process.report.writeReport()
console.log(JSON.stringify(report, null, 2));
```

Необязательный аргумент `err` — объект `Error` для контекста стека JavaScript в отчёте.

```js
const report = process.report.getReport(new Error('custom error'));
console.log(typeof report === 'object'); // true
```

Варианты API удобны для проверки состояния рантайма из приложения — например для самонастройки потребления ресурсов, балансировки и мониторинга.

Отчёт включает заголовок (тип события, дата, время, PID, версия Node.js), разделы со стеками JavaScript и нативным стеком, сведения о куче V8, дескрипторах `libuv` и информацию об ОЗУ, CPU и лимитах системы. Пример можно получить в REPL Node.js:

```console
$ node
> process.report.writeReport();
Writing Node.js report to file: report.20181126.091102.8480.0.001.json
Node.js report completed
>
```

При записи отчёта в stderr выводятся сообщения о начале и конце, а вызывающему возвращается имя файла. Имя по умолчанию содержит дату, время, PID и порядковый номер — он помогает сопоставлять дампы с состоянием при нескольких отчётах одного процесса.

## Версия отчёта

У диагностического отчёта есть однозначный номер версии (`report.header.reportVersion`), описывающий формат. Номер повышается при добавлении или удалении полей либо изменении типа значения. Определения версий согласованы между релизами LTS.

### История версий

#### Версия 5

<!-- YAML
changes:
  - version:
    - v23.5.0
    - v22.13.0
    pr-url: https://github.com/nodejs/node/pull/56068
    description: Fix typos in the memory limit units.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.5.0, v22.13.0 | Исправлены опечатки в единицах ограничения памяти. |

Ключи `data_seg_size_kbytes`, `max_memory_size_kbytes` и `virtual_memory_kbytes` в разделе `userLimits` заменены на `data_seg_size_bytes`, `max_memory_size_bytes` и `virtual_memory_bytes` — значения задаются в байтах.

```json
{
  "userLimits": {
    // Некоторые ключи опущены ...
    "data_seg_size_bytes": { // заменяет data_seg_size_kbytes
      "soft": "unlimited",
      "hard": "unlimited"
    },
    // ...
    "max_memory_size_bytes": { // заменяет max_memory_size_kbytes
      "soft": "unlimited",
      "hard": "unlimited"
    },
    // ...
    "virtual_memory_bytes": { // заменяет virtual_memory_kbytes
      "soft": "unlimited",
      "hard": "unlimited"
    }
  }
}
```

#### Версия 4

<!-- YAML
changes:
  - version:
    - v23.3.0
    - v22.13.0
    pr-url: https://github.com/nodejs/node/pull/55697
    description: Added `--report-exclude-env` option for excluding environment variables from report generation.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.3.0, v22.13.0 | Добавлен параметр `--report-exclude-env` для исключения переменных окружения из создаваемого отчёта. |

В конечные точки дескрипторов `tcp` и `udp` libuv добавлены поля `ipv4` и `ipv6`. Примеры:

```json
{
  "libuv": [
    {
      "type": "tcp",
      "is_active": true,
      "is_referenced": true,
      "address": "0x000055e70fcb85d8",
      "localEndpoint": {
        "host": "localhost",
        "ip4": "127.0.0.1", // новый ключ
        "port": 48986
      },
      "remoteEndpoint": {
        "host": "localhost",
        "ip4": "127.0.0.1", // новый ключ
        "port": 38573
      },
      "sendBufferSize": 2626560,
      "recvBufferSize": 131072,
      "fd": 24,
      "writeQueueSize": 0,
      "readable": true,
      "writable": true
    },
    {
      "type": "tcp",
      "is_active": true,
      "is_referenced": true,
      "address": "0x000055e70fcd68c8",
      "localEndpoint": {
        "host": "ip6-localhost",
        "ip6": "::1", // новый ключ
        "port": 52266
      },
      "remoteEndpoint": {
        "host": "ip6-localhost",
        "ip6": "::1", // новый ключ
        "port": 38573
      },
      "sendBufferSize": 2626560,
      "recvBufferSize": 131072,
      "fd": 25,
      "writeQueueSize": 0,
      "readable": false,
      "writable": false
    }
  ]
}
```

#### Версия 3

<!-- YAML
changes:
  - version:
    - v19.1.0
    - v18.13.0
    pr-url: https://github.com/nodejs/node/pull/45254
    description: Add more memory info.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.1.0, v18.13.0 | Добавлена дополнительная информация о памяти. |

В раздел `resourceUsage` добавлены следующие поля, связанные с памятью.

```json
{
  "resourceUsage": {
    "rss": "35766272",
    "free_memory": "1598337024",
    "total_memory": "17179869184",
    "available_memory": "1598337024",
    "constrained_memory": "36624662528"
  }
}
```

#### Версия 2

<!-- YAML
changes:
  - version:
      - v13.9.0
      - v12.16.2
    pr-url: https://github.com/nodejs/node/pull/31386
    description: Workers are now included in the report.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.9.0, v12.16.2 | Потоки Worker теперь включаются в отчёт. |

Добавлена поддержка [`Worker`](worker_threads.md). Подробнее — в разделе «Взаимодействие с worker» ниже на этой странице.

#### Версия 1

Первая версия формата диагностического отчёта.

## Настройка

Дополнительная настройка генерации отчётов на лету задаётся свойствами `process.report`:

`reportOnFatalError` — при `true` формировать отчёт при фатальных ошибках. По умолчанию `false`.

`reportOnSignal` — при `true` формировать отчёт по сигналу. В Windows не поддерживается. По умолчанию `false`.

`reportOnUncaughtException` — при `true` формировать отчёт при необработанном исключении. По умолчанию `false`.

`signal` — идентификатор POSIX-сигнала для внешнего запуска отчёта. По умолчанию `'SIGUSR2'`.

`filename` — имя выходного файла. Для `stdout` и `stderr` отчёт пишется в соответствующий поток; тогда `directory` игнорируется. URL не поддерживаются. По умолчанию составное имя с меткой времени, PID и порядковым номером.

`directory` — каталог для файла отчёта. URL не поддерживаются. По умолчанию — текущий рабочий каталог процесса Node.js.

`excludeNetwork` — исключает `header.networkInterfaces` из отчёта.

```js
// Формировать отчёт только при необработанных исключениях.
process.report.reportOnFatalError = false;
process.report.reportOnSignal = false;
process.report.reportOnUncaughtException = true;

// Формировать отчёт как для внутренних ошибок, так и по внешнему сигналу.
process.report.reportOnFatalError = true;
process.report.reportOnSignal = true;
process.report.reportOnUncaughtException = false;

// Изменить сигнал по умолчанию на 'SIGQUIT' и включить его.
process.report.reportOnFatalError = false;
process.report.reportOnUncaughtException = false;
process.report.reportOnSignal = true;
process.report.signal = 'SIGQUIT';

// Отключить вывод сетевых интерфейсов
process.report.excludeNetwork = true;
```

Настройка при инициализации модуля также задаётся переменными окружения:

```bash
NODE_OPTIONS="--report-uncaught-exception \
  --report-on-fatalerror --report-on-signal \
  --report-signal=SIGUSR2  --report-filename=./report.json \
  --report-directory=/home/nodeuser"
```

Подробное описание API см. в разделе [`документация process`](process.md).

## Взаимодействие с worker {#interaction-with-workers}

<!-- YAML
changes:
  - version:
      - v13.9.0
      - v12.16.2
    pr-url: https://github.com/nodejs/node/pull/31386
    description: Workers are now included in the report.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.9.0, v12.16.2 | Потоки Worker теперь включаются в отчёт. |

Потоки [`Worker`](worker_threads.md) могут формировать отчёты так же, как основной поток.

В отчёт входят сведения о дочерних worker’ах текущего потока в разделе `workers`; у каждого worker’а отчёт в стандартном формате.

Поток, формирующий отчёт, ждёт завершения отчётов worker’ов; задержка обычно невелика, так как для генерации отчёта прерываются и выполнение JavaScript, и цикл событий.

[`Worker`]: worker_threads.md
[`документация process`]: process.md
