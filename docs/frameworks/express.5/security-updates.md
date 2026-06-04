---
description: Ознакомьтесь с последними обновлениями и исправлениями безопасности Express.js, включая списки уязвимостей по версиям.
---

# Обновления безопасности

!!!alert ""

    Уязвимости Node.js напрямую влияют на Express. Поэтому [следите за уязвимостями Node.js](https://nodejs.org/en/blog/vulnerability/) и используйте последнюю стабильную версию Node.js.

Список ниже содержит уязвимости Express, исправленные в соответствующих обновлениях версий.

!!!info ""

    Если вы считаете, что нашли уязвимость в Express, см. Security Policies and Procedures.

## 4.x

-   4.21.2
    -   Зависимость `path-to-regexp` обновлена для устранения [уязвимости](https://github.com/pillarjs/path-to-regexp/security/advisories/GHSA-rhx6-c78j-4q9w).
-   4.21.1
    -   Зависимость `cookie` обновлена для устранения [уязвимости](https://github.com/jshttp/cookie/security/advisories/GHSA-pxg6-pf52-xh8x). Это может затронуть приложение, если вы используете `res.cookie`.
-   4.20.0
    -   Исправлена XSS-уязвимость в `res.redirect` ([advisory](https://github.com/expressjs/express/security/advisories/GHSA-qw6h-vgh9-j6wx), [CVE-2024-43796](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-43796)).
    -   Зависимость `serve-static` обновлена для устранения [уязвимости](https://github.com/advisories/GHSA-cm22-4g7w-348p).
    -   Зависимость `send` обновлена для устранения [уязвимости](https://github.com/advisories/GHSA-m6fv-jmcg-4jfg).
    -   Зависимость `path-to-regexp` обновлена для устранения [уязвимости](https://github.com/pillarjs/path-to-regexp/security/advisories/GHSA-9wv6-86v2-598j).
    -   Зависимость `body-parser` обновлена для устранения [уязвимости](https://github.com/advisories/GHSA-qwcr-r2fm-qrc7). Это может затронуть приложение, если у вас включено URL-encoding.
-   4.19.0, 4.19.1
    -   Исправлена уязвимость open redirect в `res.location` и `res.redirect` ([advisory](https://github.com/expressjs/express/security/advisories/GHSA-rv95-896h-c2vc), [CVE-2024-29041](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-29041)).
-   4.17.3
    -   Зависимость `qs` обновлена для устранения [уязвимости](https://github.com/advisories/GHSA-hrpp-h998-j3pp). Это может затронуть приложение при использовании API: `req.query`, `req.body`, `req.param`.
-   4.16.0
    -   Зависимость `forwarded` обновлена для устранения [уязвимости](https://npmjs.com/advisories/527). Это может затронуть приложение при использовании API: `req.host`, `req.hostname`, `req.ip`, `req.ips`, `req.protocol`.
    -   Зависимость `mime` обновлена для устранения [уязвимости](https://npmjs.com/advisories/535), но эта проблема не влияет на Express.
    -   Зависимость `send` обновлена для защиты от [уязвимости Node.js 8.5.0](https://nodejs.org/en/blog/vulnerability/september-2017-path-validation/). Это касается только запуска Express на конкретной версии Node.js 8.5.0.
-   4.15.5
    -   Зависимость `debug` обновлена для устранения [уязвимости](https://snyk.io/vuln/npm:debug:20170905), но эта проблема не влияет на Express.
    -   Зависимость `fresh` обновлена для устранения [уязвимости](https://npmjs.com/advisories/526). Это влияет на приложение при использовании API: `express.static`, `req.fresh`, `res.json`, `res.jsonp`, `res.send`, `res.sendfile`, `res.sendFile`, `res.sendStatus`.
-   4.15.3
    -   Зависимость `ms` обновлена для устранения [уязвимости](https://snyk.io/vuln/npm:ms:20170412). Это может затронуть приложение, если в опцию `maxAge` (для `express.static`, `res.sendfile`, `res.sendFile`) передается недоверенный строковый ввод.
-   4.15.2
    -   Зависимость `qs` обновлена для устранения [уязвимости](https://snyk.io/vuln/npm:qs:20170213), но эта проблема не влияет на Express. Обновление до 4.15.2 — хорошая практика, но не обязательное условие для закрытия этой уязвимости.
-   4.11.1
    -   Исправлена уязвимость раскрытия корневого пути в `express.static`, `res.sendfile` и `res.sendFile`.
-   4.10.7
    -   Исправлена уязвимость open redirect в `express.static` ([advisory](https://npmjs.com/advisories/35), [CVE-2015-1164](http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2015-1164)).
-   4.8.8
    -   Исправлены уязвимости directory traversal в `express.static` ([advisory](http://npmjs.com/advisories/32) , [CVE-2014-6394](http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-6394)).
-   4.8.4
    -   В Node.js 0.10 в ряде случаев возможна утечка `fd`, влияющая на `express.static` и `res.sendfile`. Злонамеренные запросы могли приводить к утечке `fd`, ошибкам `EMFILE` и недоступности сервера.
-   4.8.0
    -   Sparse arrays с очень большими индексами в query string могли приводить к исчерпанию памяти процесса и падению сервера.
    -   Сильно вложенные объекты в query string могли блокировать процесс и временно делать сервер недоступным.

## 3.x

!!!warning ""

    **Express 3.x ДОСТИГ END-OF-LIFE И БОЛЬШЕ НЕ ПОДДЕРЖИВАЕТСЯ**

    Известные и неизвестные проблемы безопасности и производительности в 3.x не исправлялись с последнего обновления (1 августа 2015). Настоятельно рекомендуется использовать последнюю версию Express.

    Если вы не можете обновиться выше 3.x, рассмотрите Commercial Support Options.

-   3.19.1
    -   Исправлена уязвимость раскрытия корневого пути в `express.static`, `res.sendfile` и `res.sendFile`.
-   3.19.0
    -   Исправлена уязвимость open redirect в `express.static` ([advisory](https://npmjs.com/advisories/35), [CVE-2015-1164](http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2015-1164)).
-   3.16.10
    -   Исправлены уязвимости directory traversal в `express.static`.
-   3.16.6
    -   В Node.js 0.10 в ряде случаев возможна утечка `fd`, влияющая на `express.static` и `res.sendfile`. Злонамеренные запросы могли приводить к утечке `fd`, ошибкам `EMFILE` и недоступности сервера.
-   3.16.0
    -   Sparse arrays с очень большими индексами в query string могли приводить к исчерпанию памяти процесса и падению сервера.
    -   Сильно вложенные объекты в query string могли блокировать процесс и временно делать сервер недоступным.
-   3.3.0
    -   Ответ 404 при неподдерживаемой попытке method override был подвержен XSS-атакам.
