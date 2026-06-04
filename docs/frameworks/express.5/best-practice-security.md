---
description: Изучите ключевые практики безопасности для Express-приложений в production: TLS, валидация ввода, безопасные cookie и защита от уязвимостей.
---

# Лучшие практики production: безопасность {#best-practice-security}

Термин _"production"_ обозначает этап жизненного цикла ПО, когда приложение или API уже доступно конечным пользователям. В отличие от этого, на этапе _"development"_ код активно пишется и тестируется, а приложение обычно недоступно извне. Соответствующие окружения называются _production_ и _development_.

Окружения development и production обычно настроены по-разному и имеют сильно отличающиеся требования. То, что допустимо в development, может быть неприемлемо в production. Например, подробные логи ошибок полезны для отладки, но в production могут стать угрозой безопасности. В development можно меньше думать о масштабируемости, надежности и производительности, а в production это критично.

!!!info ""

    Если вы считаете, что нашли уязвимость в Express, см. Security Policies and Procedures.

Практики безопасности для Express-приложений в production включают:

-   [Лучшие практики production: безопасность](#best-practice-security)
    -   [Не используйте устаревшие или уязвимые версии Express](#do-not-use-deprecated-or-vulnerable-express-versions)
    -   [Используйте TLS](#use-tls)
    -   [Не доверяйте пользовательскому вводу](#do-not-trust-user-input)
        -   [Предотвращайте open redirects](#prevent-open-redirects)
    -   [Используйте Helmet](#use-helmet)
    -   [Снижайте fingerprinting](#reduce-fingerprinting)
    -   [Используйте cookie безопасно](#use-cookies-securely)
        -   [Не используйте имя session cookie по умолчанию](#do-not-use-the-default-session-cookie-name)
        -   [Настройте параметры безопасности cookie](#set-cookie-security-options)
    -   [Предотвращайте brute-force атаки на авторизацию](#prevent-brute-force-attacks-on-login)
    -   [Следите за безопасностью зависимостей](#ensure-dependencies-are-secure)
        -   [Избегайте других известных уязвимостей](#avoid-other-known-vulnerabilities)
    -   [Дополнительные рекомендации](#additional-considerations)

## Не используйте устаревшие или уязвимые версии Express {#do-not-use-deprecated-or-vulnerable-express-versions}

Express 2.x и 3.x больше не поддерживаются. Проблемы безопасности и производительности в этих версиях не исправляются. Не используйте их. Если вы еще не перешли на версию 4+, следуйте migration guide или рассмотрите Commercial Support Options.

Также убедитесь, что не используете уязвимые версии Express из [Security updates](./security-updates.md). Если используете — обновитесь до стабильной версии, предпочтительно последней.

## Используйте TLS {#use-tls}

Если приложение работает с чувствительными данными или передает их, используйте [Transport Layer Security](https://en.wikipedia.org/wiki/Transport_Layer_Security) (TLS) для защиты соединения и данных. Эта технология шифрует данные перед отправкой от клиента к серверу и защищает от ряда распространенных атак. Хотя Ajax- и POST-запросы могут казаться «скрытыми» в браузере, сетевой трафик подвержен [packet sniffing](https://en.wikipedia.org/wiki/Packet_analyzer) и [man-in-the-middle attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack).

Возможно, вам знакомо шифрование Secure Socket Layer (SSL). [TLS is simply the next progression of SSL](<https://msdn.microsoft.com/en-us/library/windows/desktop/aa380515(v=vs.85).aspx>). Иными словами, если вы использовали SSL, стоит перейти на TLS. Обычно для терминации TLS рекомендуют Nginx. Для настройки TLS на Nginx (и других серверах) см. [Recommended Server Configurations (Mozilla Wiki)](https://wiki.mozilla.org/Security/Server_Side_TLS#Recommended_Server_Configurations).

Удобный способ получить бесплатный TLS-сертификат — [Let's Encrypt](https://letsencrypt.org/about/), открытый автоматизированный центр сертификации (CA) от [Internet Security Research Group (ISRG)](https://www.abetterinternet.org/).

## Не доверяйте пользовательскому вводу {#do-not-trust-user-input}

Для веб-приложений одно из ключевых требований безопасности — корректная валидация и обработка пользовательского ввода. Формы ввода бывают разными, и здесь мы не покрываем все случаи. В конечном итоге ответственность за проверку и безопасную обработку вводимых данных лежит на вас.

### Предотвращайте open redirects {#prevent-open-redirects}

Пример потенциально опасного ввода — _open redirect_, когда приложение принимает URL от пользователя (часто в query, например `?url=https://example.com`) и через `res.redirect` устанавливает заголовок `location`, возвращая статус 3xx.

Приложение должно проверять, допустим ли редирект на переданный URL, чтобы не отправлять пользователей на вредоносные ссылки (например, фишинговые сайты).

Вот пример проверки URL перед использованием `res.redirect` или `res.location`:

```js
app.use((req, res) => {
    try {
        if (new Url(req.query.url).host !== 'example.com') {
            return res
                .status(400)
                .end(
                    `Unsupported redirect to host: ${req.query.url}`
                );
        }
    } catch (e) {
        return res
            .status(400)
            .end(`Invalid url: ${req.query.url}`);
    }
    res.redirect(req.query.url);
});
```

## Используйте Helmet {#use-helmet}

[Helmet][helmet] помогает защитить приложение от ряда известных веб-уязвимостей за счет корректной настройки HTTP-заголовков.

Helmet — это middleware, который выставляет security-related HTTP response headers. По умолчанию он задает:

-   `Content-Security-Policy`: строгий allow-list действий на странице, снижающий множество атак
-   `Cross-Origin-Opener-Policy`: помогает изолировать страницу на уровне процесса
-   `Cross-Origin-Resource-Policy`: блокирует cross-origin загрузку ваших ресурсов
-   `Origin-Agent-Cluster`: делает изоляцию процессов origin-based
-   `Referrer-Policy`: управляет заголовком [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer)
-   `Strict-Transport-Security`: указывает браузерам предпочитать HTTPS
-   `X-Content-Type-Options`: предотвращает [MIME sniffing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#mime_sniffing)
-   `X-DNS-Prefetch-Control`: управляет DNS prefetching
-   `X-Download-Options`: принудительно сохраняет загрузки (только Internet Explorer)
-   `X-Frame-Options`: устаревший заголовок для смягчения [Clickjacking](https://en.wikipedia.org/wiki/Clickjacking)
-   `X-Permitted-Cross-Domain-Policies`: контролирует cross-domain поведение продуктов Adobe, например Acrobat
-   `X-Powered-By`: информация о веб-сервере; удаляется, так как может помогать простым атакам
-   `X-XSS-Protection`: устаревший заголовок для смягчения [XSS attacks](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting), который может ухудшать безопасность, поэтому Helmet его отключает

Каждый заголовок можно настроить или отключить. Подробнее — в [документации Helmet][helmet].

Установите Helmet как обычный модуль:

```bash
$ npm install helmet
```

Затем подключите его в коде:

```js
// ...

const helmet = require('helmet');
app.use(helmet());

// ...
```

## Снижайте fingerprinting {#reduce-fingerprinting}

Дополнительным уровнем защиты является снижение возможности определить ПО, используемое сервером — так называемый "fingerprinting". Сам по себе fingerprinting не всегда уязвимость, но уменьшение его точности улучшает общий профиль безопасности. ПО сервера часто определяется по особенностям ответов на запросы, например по HTTP-заголовкам.

По умолчанию Express отправляет заголовок `X-Powered-By`, который можно отключить через `app.disable()`:

```js
app.disable('x-powered-by');
```

<Alert type="info">

Отключение заголовка `X-Powered-By` не мешает опытному атакующему определить, что приложение работает на Express. Это может отпугнуть только простые атаки — существуют и другие способы определить стек.

</Alert>

Express также отправляет собственные форматированные сообщения "404 Not Found" и ошибки форматтера. Это можно изменить, [добавив свой not found handler](./faq.md#how-do-i-handle-404-responses) и [написав свой error handler](./error-handling.md#writing-error-handlers):

```js
// last app.use calls right before app.listen():

// custom 404
app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
});

// custom error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
```

## Используйте cookie безопасно {#use-cookies-securely}

Чтобы cookie не открывали путь к атакам, не используйте имя session cookie по умолчанию и задавайте безопасные параметры cookie.

Есть два основных middleware-модуля для cookie-сессий:

-   [express-session](https://www.npmjs.com/package/express-session), который заменяет встроенный в Express 3.x middleware `express.session`.
-   [cookie-session](https://www.npmjs.com/package/cookie-session), который заменяет встроенный в Express 3.x middleware `express.cookieSession`.

Ключевое различие между ними — способ хранения данных сессии. Middleware [express-session](https://www.npmjs.com/package/express-session) хранит данные сессии на сервере; в cookie сохраняется только session ID, а не сами данные. По умолчанию используется in-memory storage, который не предназначен для production. В production нужен масштабируемый session-store; см. список [compatible session stores](https://github.com/expressjs/session#compatible-session-stores).

В отличие от этого, middleware [cookie-session](https://www.npmjs.com/package/cookie-session) использует cookie-backed storage: сериализует в cookie всю сессию, а не только ключ. Используйте его, только если данные сессии небольшие и легко кодируются примитивами (а не объектами). Хотя браузеры обычно поддерживают как минимум 4096 байт на cookie, чтобы не выйти за лимит, ориентируйтесь на 4093 байта на домен. Также помните: данные cookie видны клиенту, поэтому если нужна большая защищенность/скрытность, `express-session` обычно лучше.

### Не используйте имя session cookie по умолчанию {#do-not-use-the-default-session-cookie-name}

Использование стандартного имени session cookie может упростить атаки. Проблема похожа на `X-Powered-By`: потенциальный атакующий может использовать это для fingerprinting сервера и выбора целевых атак.

Чтобы избежать этого, используйте нейтральные имена cookie; например, с middleware [express-session](https://www.npmjs.com/package/express-session):

```js
const session = require('express-session');
app.set('trust proxy', 1); // trust first proxy
app.use(
    session({
        secret: 's3Cur3',
        name: 'sessionId',
    })
);
```

### Настройте параметры безопасности cookie {#set-cookie-security-options}

Для усиления безопасности задайте следующие опции cookie:

-   `secure` — гарантирует, что браузер отправляет cookie только по HTTPS.
-   `httpOnly` — гарантирует, что cookie отправляется только по HTTP(S), а не доступен клиентскому JavaScript, что помогает защититься от XSS.
-   `domain` — задает домен cookie; сравнивается с доменом сервера, к которому идет запрос.
-   `path` — задает путь cookie; сравнивается с путем запроса.
-   `expires` — задает дату истечения для persistent cookie.

Ниже пример с middleware [cookie-session](https://www.npmjs.com/package/cookie-session):

```js
const session = require('cookie-session');
const express = require('express');
const app = express();

const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
app.use(
    session({
        name: 'session',
        keys: ['key1', 'key2'],
        cookie: {
            secure: true,
            httpOnly: true,
            domain: 'example.com',
            path: 'foo/bar',
            expires: expiryDate,
        },
    })
);
```

## Предотвращайте brute-force атаки на авторизацию {#prevent-brute-force-attacks-on-login}

Убедитесь, что endpoints входа защищены, чтобы лучше защищать приватные данные.

Простой и эффективный подход — блокировать попытки авторизации по двум метрикам:

1.  Число последовательных неудачных попыток для одной пары «имя пользователя + IP-адрес».
2.  Число неудачных попыток с одного IP-адреса за длительный период. Например, блокируйте IP, если за день он совершил 100 неудачных попыток.

Пакет [rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible) дает инструменты для быстрой реализации этой техники. Пример есть в документации: [login-endpoint protection](https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#login-endpoint-protection)

## Следите за безопасностью зависимостей {#ensure-dependencies-are-secure}

Использовать npm для управления зависимостями удобно и эффективно. Но пакеты могут содержать критические уязвимости, которые затронут и ваше приложение. Безопасность приложения определяется «самым слабым звеном» в зависимостях.

Начиная с npm@6, npm автоматически проверяет каждый запрос на установку. Также можно использовать `npm audit` для анализа дерева зависимостей.

```bash
$ npm audit
```

Если нужна более строгая безопасность, рассмотрите [Snyk](https://snyk.io/).

Snyk предлагает и [CLI-инструмент](https://www.npmjs.com/package/snyk), и [интеграцию с GitHub](https://snyk.io/docs/github), которая проверяет приложение по [базе уязвимостей open source от Snyk](https://snyk.io/vuln/) на наличие известных проблем в зависимостях. Установите CLI так:

```bash
$ npm install -g snyk
$ cd your-app
```

Используйте эту команду для проверки приложения на уязвимости:

```bash
$ snyk test
```

### Избегайте других известных уязвимостей {#avoid-other-known-vulnerabilities}

Следите за advisory в [Node Security Project](https://npmjs.com/advisories) и [Snyk](https://snyk.io/vuln/), которые могут затрагивать Express и другие используемые модули. В целом это отличные источники знаний и инструментов по безопасности Node.

Наконец, Express-приложения, как и любые веб-приложения, могут быть уязвимы к различным веб-атакам. Изучите известные [web vulnerabilities](https://www.owasp.org/www-project-top-ten/) и принимайте меры защиты.

## Дополнительные рекомендации {#additional-considerations}

Ниже — дополнительные рекомендации из [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/). За подробностями обращайтесь к оригинальной статье:

-   Всегда фильтруйте и санитизируйте пользовательский ввод для защиты от XSS и command injection.
-   Защищайтесь от SQL injection с помощью параметризованных запросов или prepared statements.
-   Используйте open-source инструмент [sqlmap](http://sqlmap.org/) для поиска SQL injection уязвимостей.
-   Используйте [nmap](https://nmap.org/) и [sslyze](https://github.com/nabla-c0d3/sslyze) для проверки SSL-конфигурации (шифры, ключи, renegotiation) и валидности сертификата.
-   Используйте [safe-regex](https://www.npmjs.com/package/safe-regex), чтобы убедиться, что ваши регулярные выражения не подвержены [regular expression denial of service](https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS).

[helmet]: https://helmetjs.github.io/
