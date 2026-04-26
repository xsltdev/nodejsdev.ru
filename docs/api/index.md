---
title: API Node.js
description: Справочник по API Node.js с обзором встроенных модулей и ключевых возможностей платформы
hide:
    - toc
---

# API Node.js

<div class="grid cards" style="margin-top: 1.6em" markdown>

-   :material-file-document-multiple-outline:{ .lg .middle } **[Об этой документации](documentation.md)**
-   :material-play-circle-outline:{ .lg .middle } **[Использование и пример](synopsis.md)**
-   :material-check-decagram:{ .lg .middle } **[Тестирование утверждений](assert.md)**
-   :material-sync:{ .lg .middle } **[Отслеживание асинхронного контекста](async_context.md)**
-   :material-hook:{ .lg .middle } **[Асинхронные хуки](async_hooks.md)**
-   :simple-buffer:{ .lg .middle } **[Буфер](buffer.md)**
-   :material-language-cpp:{ .lg .middle } **[Дополнения C++](addons.md)**
-   :material-api:{ .lg .middle } **[Дополнения C/C++ с Node-API](n-api.md)**
-   :material-puzzle-outline:{ .lg .middle } **[API встраивания C++](embedding.md)**
-   :material-source-fork:{ .lg .middle } **[Дочерние процессы](child_process.md)**
-   :material-server-network:{ .lg .middle } **[Кластер](cluster.md)**
-   :material-console-line:{ .lg .middle } **[Параметры командной строки](cli.md)**
-   :material-console:{ .lg .middle } **[Консоль](console.md)**
-   :material-shield-key-outline:{ .lg .middle } **[Криптография](crypto.md)**
-   :material-bug-outline:{ .lg .middle } **[Отладчик](debugger.md)**
-   :material-timeline-clock-outline:{ .lg .middle } **[Устаревшие API](deprecations.md)**
-   :material-chart-timeline-variant:{ .lg .middle } **[Канал диагностики](diagnostics_channel.md)**
-   :material-dns:{ .lg .middle } **[DNS](dns.md)**
-   :material-web:{ .lg .middle } **[Домен](domain.md)**
-   :material-variable-box:{ .lg .middle } **[Переменные окружения](environment_variables.md)**
-   :material-alert-circle-outline:{ .lg .middle } **[Ошибки](errors.md)**
-   :material-lightning-bolt-outline:{ .lg .middle } **[События](events.md)**
-   :material-folder-open-outline:{ .lg .middle } **[Файловая система](fs.md)**
-   :material-earth:{ .lg .middle } **[Глобальные объекты](globals.md)**
-   :material-protocol:{ .lg .middle } **[HTTP](http.md)**
-   :material-rocket-launch-outline:{ .lg .middle } **[HTTP/2](http2.md)**
-   :material-lock-outline:{ .lg .middle } **[HTTPS](https.md)**
-   :material-magnify:{ .lg .middle } **[Инспектор](inspector.md)**
-   :material-translate:{ .lg .middle } **[Интернационализация](intl.md)**
-   :material-package-variant:{ .lg .middle } **[Модули: CommonJS](modules.md)**
-   :material-language-javascript:{ .lg .middle } **[Модули: ECMAScript](esm.md)**
-   :material-code-braces:{ .lg .middle } **[Модули: API `node:module`](module.md)**
-   :material-package-variant-closed:{ .lg .middle } **[Модули: пакеты](packages.md)**
-   :material-language-typescript:{ .lg .middle } **[Модули: TypeScript](typescript.md)**
-   :material-lan-connect:{ .lg .middle } **[Сеть (net)](net.md)**
-   :material-repeat-variant:{ .lg .middle } **[API итерируемых потоков](stream_iter.md)**
-   :material-monitor:{ .lg .middle } **[Операционная система](os.md)**
-   :material-map-marker-path:{ .lg .middle } **[Path](path.md)**
-   :material-speedometer:{ .lg .middle } **[Хуки производительности](perf_hooks.md)**
-   :material-shield-account-outline:{ .lg .middle } **[Разрешения](permissions.md)**
-   :material-cog-outline:{ .lg .middle } **[Процесс](process.md)**
-   :material-alphabetical-variant:{ .lg .middle } **[Punycode](punycode.md)**
-   :material-format-list-bulleted-type:{ .lg .middle } **[Строка запроса](querystring.md)**
-   :material-keyboard-outline:{ .lg .middle } **[Readline (построчный ввод)](readline.md)**
-   :material-console-network:{ .lg .middle } **[REPL](repl.md)**
-   :material-file-chart-outline:{ .lg .middle } **[Отчёт](report.md)**
-   :material-application-export:{ .lg .middle } **[Одноисполняемые приложения](single-executable-applications.md)**
-   :material-database-outline:{ .lg .middle } **[SQLite](sqlite.md)**
-   :material-waves:{ .lg .middle } **[Поток](stream.md)**
-   :material-format-text-variant-outline:{ .lg .middle } **[Декодер строк](string_decoder.md)**
-   :material-flask-outline:{ .lg .middle } **[Запуск тестов](test.md)**
-   :material-timer-outline:{ .lg .middle } **[Таймеры](timers.md)**
-   :material-certificate-outline:{ .lg .middle } **[TLS/SSL](tls.md)**
-   :material-chart-scatter-plot:{ .lg .middle } **[События трассировки](tracing.md)**
-   :material-console:{ .lg .middle } **[TTY](tty.md)**
-   :material-access-point-network:{ .lg .middle } **[Сокеты UDP/датаграмм](dgram.md)**
-   :material-link-variant:{ .lg .middle } **[URL](url.md)**
-   :material-toolbox-outline:{ .lg .middle } **[Утилиты](util.md)**
-   :material-speedometer-medium:{ .lg .middle } **[V8](v8.md)**
-   :material-cube-outline:{ .lg .middle } **[VM](vm.md)**
-   :simple-webassembly:{ .lg .middle } **[WASI](wasi.md)**
-   :material-lock-check-outline:{ .lg .middle } **[Web Crypto API](webcrypto.md)**
-   :material-wave-arrow-right:{ .lg .middle } **[Web Streams API](webstreams.md)**
-   :material-account-group-outline:{ .lg .middle } **[Потоки worker](worker_threads.md)**
-   :material-waves-arrow-right:{ .lg .middle } **[Zlib](zlib.md)**
-   :material-archive-sync-outline:{ .lg .middle } **[Итерируемое сжатие Zlib](zlib_iter.md)**

</div>
