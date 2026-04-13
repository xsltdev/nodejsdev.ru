---
title: DNS
description: Модуль node:dns — разрешение имён хостов в IP-адреса и обратно; lookup через ОС и прямые DNS-запросы
---

# DNS

<!--introduced_in=v0.10.0-->

> Стабильность: 2 — Стабильная

<!-- source_link=lib/dns.js -->

Модуль `node:dns` выполняет разрешение имён: например, поиск IP-адресов по имени хоста.

Несмотря на название [системы доменных имён (DNS)][Domain Name System (DNS)], для поиска не всегда используется протокол DNS. [`dns.lookup()`][`dns.lookup()`] опирается на средства ОС для разрешения имён. Сетевой обмен может и не понадобиться. Чтобы вести себя при разрешении имён так же, как другие приложения в системе, используйте [`dns.lookup()`][`dns.lookup()`].

=== "MJS"

    ```js
    import dns from 'node:dns';

    dns.lookup('example.org', (err, address, family) => {
      console.log('address: %j family: IPv%s', address, family);
    });
    // address: "2606:2800:21f:cb07:6820:80da:af6b:8b2c" family: IPv6
    ```

=== "CJS"

    ```js
    const dns = require('node:dns');

    dns.lookup('example.org', (err, address, family) => {
      console.log('address: %j family: IPv%s', address, family);
    });
    // address: "2606:2800:21f:cb07:6820:80da:af6b:8b2c" family: IPv6
    ```

Остальные функции модуля `node:dns` подключаются к реальному DNS-серверу для
разрешения имён. Они всегда используют сеть для DNS-запросов. Набор
конфигурационных файлов у них другой, чем у [`dns.lookup()`][`dns.lookup()`] (например, не
учитывается `/etc/hosts`). Используйте их, когда нужны именно DNS-запросы, минуя
прочие механизмы разрешения имён в ОС.

=== "MJS"

    ```js
    import dns from 'node:dns';

    dns.resolve4('archive.org', (err, addresses) => {
      if (err) throw err;

      console.log(`addresses: ${JSON.stringify(addresses)}`);

      addresses.forEach((a) => {
        dns.reverse(a, (err, hostnames) => {
          if (err) {
            throw err;
          }
          console.log(`reverse for ${a}: ${JSON.stringify(hostnames)}`);
        });
      });
    });
    ```

=== "CJS"

    ```js
    const dns = require('node:dns');

    dns.resolve4('archive.org', (err, addresses) => {
      if (err) throw err;

      console.log(`addresses: ${JSON.stringify(addresses)}`);

      addresses.forEach((a) => {
        dns.reverse(a, (err, hostnames) => {
          if (err) {
            throw err;
          }
          console.log(`reverse for ${a}: ${JSON.stringify(hostnames)}`);
        });
      });
    });
    ```

Подробнее см. раздел [особенности реализации][Implementation considerations section].

## Класс: `dns.Resolver`

<!-- YAML
added: v8.3.0
-->

Независимый резолвер для DNS-запросов.

При создании резолвера используются настройки серверов по умолчанию. Список
серверов, заданный через
[`resolver.setServers()`][`dns.setServers()`] для одного резолвера, не влияет на
другие:

=== "MJS"

    ```js
    import { Resolver } from 'node:dns';
    const resolver = new Resolver();
    resolver.setServers(['4.4.4.4']);

    // Запрос пойдёт на 4.4.4.4, независимо от глобальных настроек
    resolver.resolve4('example.org', (err, addresses) => {
      // ...
    });
    ```

=== "CJS"

    ```js
    const { Resolver } = require('node:dns');
    const resolver = new Resolver();
    resolver.setServers(['4.4.4.4']);

    // Запрос пойдёт на 4.4.4.4, независимо от глобальных настроек
    resolver.resolve4('example.org', (err, addresses) => {
      // ...
    });
    ```

Для резолвера доступны те же методы, что и в модуле `node:dns`:

* [`resolver.getServers()`][`dns.getServers()`]
* [`resolver.resolve()`][`dns.resolve()`]
* [`resolver.resolve4()`][`dns.resolve4()`]
* [`resolver.resolve6()`][`dns.resolve6()`]
* [`resolver.resolveAny()`][`dns.resolveAny()`]
* [`resolver.resolveCaa()`][`dns.resolveCaa()`]
* [`resolver.resolveCname()`][`dns.resolveCname()`]
* [`resolver.resolveMx()`][`dns.resolveMx()`]
* [`resolver.resolveNaptr()`][`dns.resolveNaptr()`]
* [`resolver.resolveNs()`][`dns.resolveNs()`]
* [`resolver.resolvePtr()`][`dns.resolvePtr()`]
* [`resolver.resolveSoa()`][`dns.resolveSoa()`]
* [`resolver.resolveSrv()`][`dns.resolveSrv()`]
* [`resolver.resolveTlsa()`][`dns.resolveTlsa()`]
* [`resolver.resolveTxt()`][`dns.resolveTxt()`]
* [`resolver.reverse()`][`dns.reverse()`]
* [`resolver.setServers()`][`dns.setServers()`]

### `Resolver([options])`

<!-- YAML
added: v8.3.0
changes:
  - version:
      - v16.7.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/39610
    description: The `options` object now accepts a `tries` option.
  - version: v12.18.3
    pr-url: https://github.com/nodejs/node/pull/33472
    description: The constructor now accepts an `options` object.
                 The single supported option is `timeout`.
-->

Добавлено в: v8.3.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.7.0, v14.18.0 | Объект `options` теперь принимает опцию `tries`. |
    | v12.18.3 | Конструктор теперь принимает объект options. Единственная поддерживаемая опция — «timeout». |

Создаёт новый резолвер.

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `timeout` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут запроса в миллисекундах или `-1` для значения по умолчанию.
  * `tries` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько раз резолвер пытается связаться с каждым DNS-сервером, прежде чем сдаться. **По умолчанию:** `4`
  * `maxTimeout` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальная задержка между повторными попытками, в миллисекундах.
    **По умолчанию:** `0` (отключено).

### `resolver.cancel()`

<!-- YAML
added: v8.3.0
-->

Отменяет все незавершённые DNS-запросы этого резолвера. Соответствующие
колбэки будут вызваны с ошибкой с кодом `ECANCELLED`.

### `resolver.setLocalAddress([ipv4][, ipv6])`

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
-->

* `ipv4` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковое представление IPv4-адреса.
  **По умолчанию:** `'0.0.0.0'`
* `ipv6` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковое представление IPv6-адреса.
  **По умолчанию:** `'::0'`

Экземпляр резолвера отправляет запросы с указанного IP-адреса.
Так программы на системах с несколькими интерфейсами могут выбрать исходящий интерфейс.

Если адрес v4 или v6 не задан, подставляется значение по умолчанию, а локальный адрес
выбирает ОС.

Для запросов к IPv4 DNS-серверам используется локальный адрес v4, к IPv6 DNS-серверам —
локальный v6. Тип `rrtype` запроса на выбранный локальный адрес не влияет.

## `dns.getServers()`

<!-- YAML
added: v0.11.3
-->

* Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив строк IP-адресов в формате [RFC 5952][RFC 5952],
сейчас настроенных для DNS-разрешения. Если задан нестандартный порт, строка может содержать секцию с портом.

<!-- eslint-disable @stylistic/js/semi-->

```js
[
  '8.8.8.8',
  '2001:4860:4860::8888',
  '8.8.8.8:1053',
  '[2001:4860:4860::8888]:1053',
]
```

## `dns.lookup(hostname[, options], callback)`

<!-- YAML
added: v0.1.90
changes:
  - version:
    - v22.1.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52492
    description: The `verbatim` option is now deprecated in favor of the new `order` option.
  - version: v18.4.0
    pr-url: https://github.com/nodejs/node/pull/43054
    description: For compatibility with `node:net`, when passing an option
                 object the `family` option can be the string `'IPv4'` or the
                 string `'IPv6'`.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v17.0.0
    pr-url: https://github.com/nodejs/node/pull/39987
    description: The `verbatim` options defaults to `true` now.
  - version: v8.5.0
    pr-url: https://github.com/nodejs/node/pull/14731
    description: The `verbatim` option is supported now.
  - version: v1.2.0
    pr-url: https://github.com/nodejs/node/pull/744
    description: The `all` option is supported now.
-->

Добавлено в: v0.1.90

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.1.0, v20.13.0 | Опция `verbatim` теперь устарела в пользу новой опции `order`. |
    | v18.4.0 | Для совместимости с node:net при передаче объекта опции параметром Family может быть строка IPv4 или строка IPv6. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v17.0.0 | Параметры `verbatim` теперь по умолчанию имеют значение `true`. |
    | v8.5.0 | Опция `verbatim` теперь поддерживается. |
    | v1.2.0 | Опция `all` теперь поддерживается. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `family` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Семейство записей: должно быть `4`, `6` или `0`. Для
    обратной совместимости строки `'IPv4'` и `'IPv6'` интерпретируются как `4`
    и `6` соответственно. Значение `0` означает, что может быть возвращён IPv4 или IPv6.
    Если `0` используется вместе с `{ all: true }` (см. ниже), возвращаются IPv4,
    IPv6 или оба — в зависимости от резолвера ОС. **По умолчанию:** `0`.
  * `hints` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Одна или несколько [supported `getaddrinfo` flags][supported `getaddrinfo` flags].
    Несколько флагов можно объединить побитовым `ИЛИ`.
  * `all` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, колбэк получает все разрешённые адреса в виде
    массива. Иначе — один адрес. **По умолчанию:** `false`.
  * `order` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) При `verbatim` адреса возвращаются в том порядке, как выдал резолвер.
    При `ipv4first` сначала IPv4, затем IPv6. При `ipv6first` — наоборот.
    **По умолчанию:** `verbatim` (порядок не меняется).
    Значение по умолчанию задаётся через [`dns.setDefaultResultOrder()`][`dns.setDefaultResultOrder()`] или
    [`--dns-result-order`][`--dns-result-order`].
  * `verbatim` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, IPv4 и IPv6 приходят в порядке, который вернул DNS-резолвер.
    Если `false`, IPv4 оказываются перед IPv6.
    Параметр устаревает в пользу `order`. Если заданы оба, приоритет у `order`.
    В новом коде используйте только `order`.
    **По умолчанию:** `true` (порядок не меняется). Значение по умолчанию настраивается через
    [`dns.setDefaultResultOrder()`][`dns.setDefaultResultOrder()`] или [`--dns-result-order`][`--dns-result-order`].
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковое представление IPv4- или IPv6-адреса.
  * `family` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `4` или `6` — семейство `address`, либо `0`, если адрес
    не IPv4 и не IPv6. `0` часто указывает на ошибку в службе разрешения имён ОС.

Разрешает имя хоста (например `'nodejs.org'`) в первую найденную запись A (IPv4) или
AAAA (IPv6). Все поля `options` необязательны. Если `options` — целое число, это должно быть `4` или `6`. Если `options` не переданы, могут быть возвращены IPv4, IPv6 или оба — если найдены.

При `all: true` сигнатура колбэка — `(err, addresses)`, где `addresses` — массив объектов с полями `address` и `family`.

При ошибке `err` — объект [`Error`][`Error`], поле `err.code` — код ошибки.
`err.code` бывает `'ENOTFOUND'` не только при несуществующем имени, но и при других сбоях lookup,
например при нехватке дескрипторов файлов.

`dns.lookup()` не обязан использовать протокол DNS.
Реализация вызывает средства ОС, сопоставляющие имена и адреса. От этого зависят
тонкие, но важные особенности поведения программ. Перед использованием `dns.lookup()`
прочитайте раздел [особенности реализации][Implementation considerations section].

Пример:

=== "MJS"

    ```js
    import dns from 'node:dns';
    const options = {
      family: 6,
      hints: dns.ADDRCONFIG | dns.V4MAPPED,
    };
    dns.lookup('example.org', options, (err, address, family) =>
      console.log('address: %j family: IPv%s', address, family));
    // address: "2606:2800:21f:cb07:6820:80da:af6b:8b2c" family: IPv6

    // Если options.all истинно, результат — массив
    options.all = true;
    dns.lookup('example.org', options, (err, addresses) =>
      console.log('addresses: %j', addresses));
    // addresses: [{"address":"2606:2800:21f:cb07:6820:80da:af6b:8b2c","family":6}]
    ```

=== "CJS"

    ```js
    const dns = require('node:dns');
    const options = {
      family: 6,
      hints: dns.ADDRCONFIG | dns.V4MAPPED,
    };
    dns.lookup('example.org', options, (err, address, family) =>
      console.log('address: %j family: IPv%s', address, family));
    // address: "2606:2800:21f:cb07:6820:80da:af6b:8b2c" family: IPv6

    // Если options.all истинно, результат — массив
    options.all = true;
    dns.lookup('example.org', options, (err, addresses) =>
      console.log('addresses: %j', addresses));
    // addresses: [{"address":"2606:2800:21f:cb07:6820:80da:af6b:8b2c","family":6}]
    ```

Если метод вызывается через [`util.promisify()`][`util.promisify()`], и `all` не равен `true`,
возвращается `Promise` с объектом `{ address, family }`.

### Поддерживаемые флаги getaddrinfo {: #supported-getaddrinfo-flags}

<!-- YAML
changes:
  - version:
     - v13.13.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32183
    description: Added support for the `dns.ALL` flag.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.13.0, v12.17.0 | Добавлена ​​поддержка флага `dns.ALL`. |

В качестве подсказок для [`dns.lookup()`][`dns.lookup()`] можно передать такие флаги:

* `dns.ADDRCONFIG`: Возвращаемые типы адресов ограничены теми, что есть у нелокальных
  интерфейсов в системе. Например, IPv4 возвращаются только если в системе настроен хотя бы один IPv4.
* `dns.V4MAPPED`: Если указано семейство IPv6, но IPv6-адресов нет, можно получить
  IPv4, отображённые в IPv6. На части ОС не поддерживается (например FreeBSD 10.1).
* `dns.ALL`: Вместе с `dns.V4MAPPED` возвращаются и разрешённые IPv6, и IPv4, отображённые в IPv6.

## `dns.lookupService(address, port, callback)`

<!-- YAML
added: v0.11.14
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.11.14

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) e.g. `example.com`
  * `service` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) e.g. `http`

Преобразует `address` и `port` в имя хоста и имя службы через `getnameinfo` ОС.

Если `address` не является допустимым IP, выбрасывается `TypeError`.
`port` приводится к числу. Если порт недопустим, выбрасывается `TypeError`.

При ошибке `err` — объект [`Error`][`Error`], поле `err.code` — код ошибки.

=== "MJS"

    ```js
    import dns from 'node:dns';
    dns.lookupService('127.0.0.1', 22, (err, hostname, service) => {
      console.log(hostname, service);
      // Вывод: localhost ssh
    });
    ```

=== "CJS"

    ```js
    const dns = require('node:dns');
    dns.lookupService('127.0.0.1', 22, (err, hostname, service) => {
      console.log(hostname, service);
      // Вывод: localhost ssh
    });
    ```

Если метод обёрнут в [`util.promisify()`][`util.promisify()`], возвращается `Promise` с объектом
`{ hostname, service }`.

## `dns.resolve(hostname[, rrtype], callback)`

<!-- YAML
added: v0.1.27
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.1.27

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
* `rrtype` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип ресурсной записи. **По умолчанию:** `'A'`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `records` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

По протоколу DNS разрешает имя хоста (например `'nodejs.org'`) в массив
ресурсных записей. У колбэка аргументы `(err, records)`. При успехе `records` —
массив записей. Тип и структура элементов зависят от `rrtype`:

| `rrtype`  | Содержимое `records`            | Тип результата | Краткий метод            |
| --------- | ------------------------------- | -------------- | ------------------------ |
| `'A'`     | IPv4-адреса (по умолчанию)      | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)       | [`dns.resolve4()`][`dns.resolve4()`]     |
| `'AAAA'`  | IPv6-адреса                     | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)       | [`dns.resolve6()`][`dns.resolve6()`]     |
| `'ANY'`   | любые записи                    | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dns.resolveAny()`][`dns.resolveAny()`]   |
| `'CAA'`   | записи авторизации ЦС           | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dns.resolveCaa()`][`dns.resolveCaa()`]   |
| `'CNAME'` | канонические имена              | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)       | [`dns.resolveCname()`][`dns.resolveCname()`] |
| `'MX'`    | почтовый обмен                  | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dns.resolveMx()`][`dns.resolveMx()`]    |
| `'NAPTR'` | записи NAPTR                    | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dns.resolveNaptr()`][`dns.resolveNaptr()`] |
| `'NS'`    | серверы имён                    | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)       | [`dns.resolveNs()`][`dns.resolveNs()`]    |
| `'PTR'`   | указатели                       | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)       | [`dns.resolvePtr()`][`dns.resolvePtr()`]   |
| `'SOA'`   | начало зоны                     | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dns.resolveSoa()`][`dns.resolveSoa()`]   |
| `'SRV'`   | службы                          | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dns.resolveSrv()`][`dns.resolveSrv()`]   |
| `'TLSA'`  | привязки сертификатов           | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dns.resolveTlsa()`][`dns.resolveTlsa()`]  |
| `'TXT'`   | текстовые записи                | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)    | [`dns.resolveTxt()`][`dns.resolveTxt()`]   |

При ошибке `err` — объект [`Error`][`Error`], поле `err.code` — один из
[DNS error codes][DNS error codes].

## `dns.resolve4(hostname[, options], callback)`

<!-- YAML
added: v0.1.16
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/9296
    description: This method now supports passing `options`,
                 specifically `options.ttl`.
-->

Добавлено в: v0.1.16

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v7.2.0 | Этот метод теперь поддерживает передачу «options», в частности «options.ttl». |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `ttl` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Получать TTL каждой записи.
    Если `true`, колбэк получает массив объектов
    `{ address: '1.2.3.4', ttl: 60 }` вместо массива строк;
    TTL в секундах.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `addresses` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

По протоколу DNS разрешает IPv4-адреса (записи `A`) для `hostname`.
Аргумент `addresses` у колбэка — массив IPv4-адресов, например
`['74.125.79.104', '74.125.79.105', '74.125.79.106']`.

## `dns.resolve6(hostname[, options], callback)`

<!-- YAML
added: v0.1.16
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/9296
    description: This method now supports passing `options`,
                 specifically `options.ttl`.
-->

Добавлено в: v0.1.16

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v7.2.0 | Этот метод теперь поддерживает передачу «options», в частности «options.ttl». |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `ttl` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Получать TTL каждой записи.
    Если `true`, колбэк получает массив объектов
    `{ address: '0:1:2:3:4:5:6:7', ttl: 60 }` вместо массива строк;
    TTL в секундах.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `addresses` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

По протоколу DNS разрешает IPv6-адреса (записи `AAAA`) для `hostname`.
Аргумент `addresses` у колбэка — массив IPv6-адресов.

## `dns.resolveAny(hostname, callback)`

<!-- YAML
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `ret` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

По протоколу DNS разрешает все записи (запрос `ANY` или `*`).
Аргумент `ret` у колбэка — массив объектов разных типов. У каждого объекта есть поле `type` —
тип записи. В зависимости от `type` присутствуют дополнительные поля:

| Type      | Свойства                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `'A'`     | `address`/`ttl`                                                                                                                                  |
| `'AAAA'`  | `address`/`ttl`                                                                                                                                  |
| `'CAA'`   | см. [`dns.resolveCaa()`][`dns.resolveCaa()`]                                                                                                                       |
| `'CNAME'` | `value`                                                                                                                                          |
| `'MX'`    | см. [`dns.resolveMx()`][`dns.resolveMx()`]                                                                                                                        |
| `'NAPTR'` | см. [`dns.resolveNaptr()`][`dns.resolveNaptr()`]                                                                                                                     |
| `'NS'`    | `value`                                                                                                                                          |
| `'PTR'`   | `value`                                                                                                                                          |
| `'SOA'`   | см. [`dns.resolveSoa()`][`dns.resolveSoa()`]                                                                                                                       |
| `'SRV'`   | см. [`dns.resolveSrv()`][`dns.resolveSrv()`]                                                                                                                       |
| `'TLSA'`  | см. [`dns.resolveTlsa()`][`dns.resolveTlsa()`]                                                                                                                      |
| `'TXT'`   | У записи есть массив `entries`, см. [`dns.resolveTxt()`][`dns.resolveTxt()`], напр. `{ entries: ['...'], type: 'TXT' }`                                            |

Пример значения `ret` в колбэке:

<!-- eslint-disable @stylistic/js/semi -->

```js
[ { type: 'A', address: '127.0.0.1', ttl: 299 },
  { type: 'CNAME', value: 'example.com' },
  { type: 'MX', exchange: 'alt4.aspmx.l.example.com', priority: 50 },
  { type: 'NS', value: 'ns1.example.com' },
  { type: 'TXT', entries: [ 'v=spf1 include:_spf.example.com ~all' ] },
  { type: 'SOA',
    nsname: 'ns1.example.com',
    hostmaster: 'admin.example.com',
    serial: 156696742,
    refresh: 900,
    retry: 900,
    expire: 1800,
    minttl: 60 } ]
```

Операторы DNS могут не отвечать на запросы `ANY`;
надёжнее вызывать отдельные методы вроде [`dns.resolve4()`][`dns.resolve4()`],
[`dns.resolveMx()`][`dns.resolveMx()`] и т. д. Подробнее — [RFC 8482][RFC 8482].

## `dns.resolveCname(hostname, callback)`

<!-- YAML
added: v0.3.2
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.3.2

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `addresses` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи `CNAME` для `hostname`.
Аргумент `addresses` у колбэка — массив канонических имён для `hostname`
(например `['bar.example.com']`).

## `dns.resolveCaa(hostname, callback)`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `records` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

По протоколу DNS разрешает записи `CAA` для `hostname`.
Аргумент `addresses` у колбэка — массив записей авторизации центра сертификации
для `hostname` (например `[{critical: 0, iodef:
'mailto:pki@example.com'}, {critical: 128, issue: 'pki.example.com'}]`).

## `dns.resolveMx(hostname, callback)`

<!-- YAML
added: v0.1.27
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.1.27

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `addresses` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

По протоколу DNS разрешает записи почтового обмена (`MX`) для `hostname`.
Аргумент `addresses` у колбэка — массив объектов с полями `priority` и `exchange`
(например `[{priority: 10, exchange: 'mx.example.com'}, ...]`).

## `dns.resolveNaptr(hostname, callback)`

<!-- YAML
added: v0.9.12
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.9.12

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `addresses` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

По протоколу DNS разрешает записи `NAPTR` для `hostname`.
Аргумент `addresses` у колбэка — массив объектов со свойствами:

* `flags`
* `service`
* `regexp`
* `replacement`
* `order`
* `preference`

<!-- eslint-skip -->

```js
{
  flags: 's',
  service: 'SIP+D2U',
  regexp: '',
  replacement: '_sip._udp.example.com',
  order: 30,
  preference: 100
}
```

## `dns.resolveNs(hostname, callback)`

<!-- YAML
added: v0.1.90
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.1.90

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `addresses` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи серверов имён (`NS`) для `hostname`.
Аргумент `addresses` у колбэка — массив записей NS для `hostname`
(например `['ns1.example.com', 'ns2.example.com']`).

## `dns.resolvePtr(hostname, callback)`

<!-- YAML
added: v6.0.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v6.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `addresses` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи `PTR` для `hostname`.
Аргумент `addresses` у колбэка — массив строк с ответными записями.

## `dns.resolveSoa(hostname, callback)`

<!-- YAML
added: v0.11.10
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.11.10

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `address` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

По протоколу DNS разрешает запись начала зоны (`SOA`) для `hostname`.
Аргумент `address` у колбэка — объект со свойствами:

* `nsname`
* `hostmaster`
* `serial`
* `refresh`
* `retry`
* `expire`
* `minttl`

<!-- eslint-skip -->

```js
{
  nsname: 'ns.example.com',
  hostmaster: 'root.example.com',
  serial: 2013101809,
  refresh: 10000,
  retry: 2400,
  expire: 604800,
  minttl: 3600
}
```

## `dns.resolveSrv(hostname, callback)`

<!-- YAML
added: v0.1.27
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.1.27

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `addresses` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

По протоколу DNS разрешает записи `SRV` для `hostname`.
Аргумент `addresses` у колбэка — массив объектов со свойствами:

* `priority`
* `weight`
* `port`
* `name`

<!-- eslint-skip -->

```js
{
  priority: 10,
  weight: 5,
  port: 21223,
  name: 'service.example.com'
}
```

## `dns.resolveTlsa(hostname, callback)`

<!-- YAML
added:
  - v23.9.0
  - v22.15.0
-->

<!--lint disable no-undefined-references list-item-bullet-indent-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `records` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

<!--lint enable no-undefined-references list-item-bullet-indent-->

По протоколу DNS разрешает записи привязки сертификатов (`TLSA`) для `hostname`.
Аргумент `records` у колбэка — массив объектов со свойствами:

* `certUsage`
* `selector`
* `match`
* `data`

<!-- eslint-skip -->

```js
{
  certUsage: 3,
  selector: 1,
  match: 1,
  data: [ArrayBuffer]
}
```

## `dns.resolveTxt(hostname, callback)`

<!-- YAML
added: v0.1.27
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.1.27

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `records` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает текстовые записи (`TXT`) для `hostname`.
Аргумент `records` у колбэка — двумерный массив фрагментов TXT для `hostname` (например
`[ ['v=spf1 ip4:0.0.0.0 ', '~all' ] ]`). Каждый подмассив — части одной TXT-записи.
Их можно объединить в строку или обрабатывать по отдельности.

## `dns.reverse(ip, callback)`

<!-- YAML
added: v0.1.16
-->

* `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `hostnames` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Выполняет обратный DNS-запрос: IPv4- или IPv6-адрес преобразуется в массив имён хостов.

При ошибке `err` — объект [`Error`][`Error`], поле `err.code` — один из
[DNS error codes][DNS error codes].

## `dns.setDefaultResultOrder(order)`

<!-- YAML
added:
  - v16.4.0
  - v14.18.0
changes:
  - version:
    - v22.1.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52492
    description: The `ipv6first` value is supported now.
  - version: v17.0.0
    pr-url: https://github.com/nodejs/node/pull/39987
    description: Changed default value to `verbatim`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.1.0, v20.13.0 | Значение `ipv6first` теперь поддерживается. |
    | v17.0.0 | Изменено значение по умолчанию на `verbatim`. |

* `order` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) должно быть `'ipv4first'`, `'ipv6first'` или `'verbatim'`.

Задаёт значение `order` по умолчанию для [`dns.lookup()`][`dns.lookup()`] и
[`dnsPromises.lookup()`][`dnsPromises.lookup()`]:

* `ipv4first`: по умолчанию `order` равен `ipv4first`.
* `ipv6first`: по умолчанию `order` равен `ipv6first`.
* `verbatim`: по умолчанию `order` равен `verbatim`.

По умолчанию используется `verbatim`; [`dns.setDefaultResultOrder()`][`dns.setDefaultResultOrder()`] имеет
более высокий приоритет, чем [`--dns-result-order`][`--dns-result-order`]. В [worker threads][worker threads]
вызов [`dns.setDefaultResultOrder()`][`dns.setDefaultResultOrder()`] из основного потока не меняет порядок DNS
в воркерах.

## `dns.getDefaultResultOrder()`

<!-- YAML
added:
  - v20.1.0
  - v18.17.0
changes:
  - version:
    - v22.1.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52492
    description: The `ipv6first` value is supported now.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.1.0, v20.13.0 | Значение `ipv6first` теперь поддерживается. |

Возвращает значение `order` по умолчанию для [`dns.lookup()`][`dns.lookup()`] и
[`dnsPromises.lookup()`][`dnsPromises.lookup()`]:

* `ipv4first` — если по умолчанию `ipv4first`.
* `ipv6first` — если по умолчанию `ipv6first`.
* `verbatim` — если по умолчанию `verbatim`.

## `dns.setServers(servers)`

<!-- YAML
added: v0.11.3
-->

* `servers` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) массив адресов в формате [RFC 5952][RFC 5952]

Задаёт IP-адреса и порты DNS-серверов для разрешения имён. Аргумент `servers` —
массив строк в формате [RFC 5952][RFC 5952]. Порт по умолчанию IANA для DNS (53) можно не указывать.

```js
dns.setServers([
  '8.8.8.8',
  '[2001:4860:4860::8888]',
  '8.8.8.8:1053',
  '[2001:4860:4860::8888]:1053',
]);
```

При неверном адресе будет выброшена ошибка.

`dns.setServers()` нельзя вызывать во время выполнения DNS-запроса.

[`dns.setServers()`][`dns.setServers()`] влияет только на [`dns.resolve()`][`dns.resolve()`],
`dns.resolve*()` и [`dns.reverse()`][`dns.reverse()`], но **не** на [`dns.lookup()`][`dns.lookup()`].

Поведение похоже на
[resolv.conf](https://man7.org/linux/man-pages/man5/resolv.conf.5.html):
если разрешение через первый сервер даёт `NOTFOUND`, `resolve()` **не** переходит
к следующим серверам. Резервные серверы используются при таймауте или иной ошибке
раньше, чем `NOTFOUND`.

## API промисов DNS {: #dns-promises-api}

<!-- YAML
added: v10.6.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/32953
    description: Exposed as `require('dns/promises')`.
  - version:
    - v11.14.0
    - v10.17.0
    pr-url: https://github.com/nodejs/node/pull/26592
    description: This API is no longer experimental.
-->

Добавлено в: v10.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Представлено как `require('dns/promises')`. |
    | v11.14.0, v10.17.0 | Этот API больше не является экспериментальным. |

API `dns.promises` предлагает асинхронные методы DNS, возвращающие `Promise` вместо колбэков.
Доступ: `require('node:dns').promises` или `require('node:dns/promises')`.

### Класс: `dnsPromises.Resolver`

<!-- YAML
added: v10.6.0
-->

Независимый резолвер для DNS-запросов.

При создании используются серверы по умолчанию. Список серверов, заданный через
[`resolver.setServers()`][`dnsPromises.setServers()`] для одного резолвера, не влияет на
другие:

=== "MJS"

    ```js
    import { Resolver } from 'node:dns/promises';
    const resolver = new Resolver();
    resolver.setServers(['4.4.4.4']);

    // Запрос пойдёт на 4.4.4.4, независимо от глобальных настроек
    const addresses = await resolver.resolve4('example.org');
    ```

=== "CJS"

    ```js
    const { Resolver } = require('node:dns').promises;
    const resolver = new Resolver();
    resolver.setServers(['4.4.4.4']);

    // Запрос пойдёт на 4.4.4.4, независимо от глобальных настроек
    resolver.resolve4('example.org').then((addresses) => {
      // ...
    });

    // То же можно записать через async/await
    (async function() {
      const addresses = await resolver.resolve4('example.org');
    })();
    ```

Для резолвера доступны методы API `dnsPromises`:

* [`resolver.getServers()`][`dnsPromises.getServers()`]
* [`resolver.resolve()`][`dnsPromises.resolve()`]
* [`resolver.resolve4()`][`dnsPromises.resolve4()`]
* [`resolver.resolve6()`][`dnsPromises.resolve6()`]
* [`resolver.resolveAny()`][`dnsPromises.resolveAny()`]
* [`resolver.resolveCaa()`][`dnsPromises.resolveCaa()`]
* [`resolver.resolveCname()`][`dnsPromises.resolveCname()`]
* [`resolver.resolveMx()`][`dnsPromises.resolveMx()`]
* [`resolver.resolveNaptr()`][`dnsPromises.resolveNaptr()`]
* [`resolver.resolveNs()`][`dnsPromises.resolveNs()`]
* [`resolver.resolvePtr()`][`dnsPromises.resolvePtr()`]
* [`resolver.resolveSoa()`][`dnsPromises.resolveSoa()`]
* [`resolver.resolveSrv()`][`dnsPromises.resolveSrv()`]
* [`resolver.resolveTlsa()`][`dnsPromises.resolveTlsa()`]
* [`resolver.resolveTxt()`][`dnsPromises.resolveTxt()`]
* [`resolver.reverse()`][`dnsPromises.reverse()`]
* [`resolver.setServers()`][`dnsPromises.setServers()`]

### `resolver.cancel()`

<!-- YAML
added:
  - v15.3.0
  - v14.17.0
-->

Отменяет все незавершённые DNS-запросы этого резолвера. Соответствующие
промисы будут отклонены с кодом `ECANCELLED`.

### `dnsPromises.getServers()`

<!-- YAML
added: v10.6.0
-->

* Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив строк IP в формате [RFC 5952][RFC 5952],
сейчас настроенных для DNS-разрешения. При нестандартном порту строка может содержать порт.

<!-- eslint-disable @stylistic/js/semi-->

```js
[
  '8.8.8.8',
  '2001:4860:4860::8888',
  '8.8.8.8:1053',
  '[2001:4860:4860::8888]:1053',
]
```

### `dnsPromises.lookup(hostname[, options])`

<!-- YAML
added: v10.6.0
changes:
  - version:
    - v22.1.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52492
    description: The `verbatim` option is now deprecated in favor of the new `order` option.
-->

Добавлено в: v10.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.1.0, v20.13.0 | Опция `verbatim` теперь устарела в пользу новой опции `order`. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `family` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Семейство записей: `4`, `6` или `0`. Значение
    `0` — IPv4 или IPv6. С `{ all: true }` (см. ниже) могут вернуться оба семейства,
    в зависимости от резолвера ОС. **По умолчанию:** `0`.
  * `hints` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Одна или несколько [supported `getaddrinfo` flags][supported `getaddrinfo` flags].
    Несколько флагов объединяются побитовым `ИЛИ`.
  * `all` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, промис разрешается массивом всех адресов.
    Иначе — одним адресом. **По умолчанию:** `false`.
  * `order` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) При `verbatim` порядок адресов как у DNS-резолвера. При `ipv4first` —
    сначала IPv4. При `ipv6first` — сначала IPv6.
    **По умолчанию:** `verbatim` (порядок не меняется).
    Значение по умолчанию задаётся через [`dns.setDefaultResultOrder()`][`dns.setDefaultResultOrder()`] или
    [`--dns-result-order`][`--dns-result-order`]. В новом коде используйте `{ order: 'verbatim' }`.
  * `verbatim` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, порядок IPv4/IPv6 как у резолвера. Если `false`,
    IPv4 перед IPv6.
    Устаревает в пользу `order`. Если заданы оба, приоритет у `order`.
    **По умолчанию:** сейчас `false` (порядок меняется), в будущем может измениться.
    Настраивается через [`dns.setDefaultResultOrder()`][`dns.setDefaultResultOrder()`] или
    [`--dns-result-order`][`--dns-result-order`].

Разрешает имя хоста (например `'nodejs.org'`) в первую запись A или AAAA. Все поля `options` необязательны. Если `options` — число `4` или `6`, задаётся семейство. Без `options` могут вернуться IPv4, IPv6 или оба.

При `all: true` промис разрешается массивом `{ address, family }`.

При ошибке промис отклоняется с [`Error`][`Error`], поле `err.code` — код ошибки.
`err.code` бывает `'ENOTFOUND'` не только при отсутствии имени, но и при других сбоях,
например нехватке дескрипторов.

[`dnsPromises.lookup()`][`dnsPromises.lookup()`] не обязан использовать протокол DNS; используются средства ОС.
Перед применением прочитайте [особенности реализации][Implementation considerations section].

Пример:

=== "MJS"

    ```js
    import dns from 'node:dns';
    const dnsPromises = dns.promises;
    const options = {
      family: 6,
      hints: dns.ADDRCONFIG | dns.V4MAPPED,
    };

    await dnsPromises.lookup('example.org', options).then((result) => {
      console.log('address: %j family: IPv%s', result.address, result.family);
      // address: "2606:2800:21f:cb07:6820:80da:af6b:8b2c" family: IPv6
    });

    // Если options.all истинно, результат — массив
    options.all = true;
    await dnsPromises.lookup('example.org', options).then((result) => {
      console.log('addresses: %j', result);
      // addresses: [{"address":"2606:2800:21f:cb07:6820:80da:af6b:8b2c","family":6}]
    });
    ```

=== "CJS"

    ```js
    const dns = require('node:dns');
    const dnsPromises = dns.promises;
    const options = {
      family: 6,
      hints: dns.ADDRCONFIG | dns.V4MAPPED,
    };

    dnsPromises.lookup('example.org', options).then((result) => {
      console.log('address: %j family: IPv%s', result.address, result.family);
      // address: "2606:2800:21f:cb07:6820:80da:af6b:8b2c" family: IPv6
    });

    // Если options.all истинно, результат — массив
    options.all = true;
    dnsPromises.lookup('example.org', options).then((result) => {
      console.log('addresses: %j', result);
      // addresses: [{"address":"2606:2800:21f:cb07:6820:80da:af6b:8b2c","family":6}]
    });
    ```

### `dnsPromises.lookupService(address, port)`

<!-- YAML
added: v10.6.0
-->

* `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Преобразует `address` и `port` в имя хоста и службу через `getnameinfo` ОС.

Неверный `address` даёт `TypeError`. `port` приводится к числу; недопустимый порт — `TypeError`.

При ошибке промис отклоняется с [`Error`][`Error`], поле `err.code` — код ошибки.

=== "MJS"

    ```js
    import dnsPromises from 'node:dns/promises';
    const result = await dnsPromises.lookupService('127.0.0.1', 22);

    console.log(result.hostname, result.service); // Вывод: localhost ssh
    ```

=== "CJS"

    ```js
    const dnsPromises = require('node:dns').promises;
    dnsPromises.lookupService('127.0.0.1', 22).then((result) => {
      console.log(result.hostname, result.service);
      // Вывод: localhost ssh
    });
    ```

### `dnsPromises.resolve(hostname[, rrtype])`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
* `rrtype` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип ресурсной записи. **По умолчанию:** `'A'`.

По протоколу DNS разрешает имя хоста в массив записей. При успехе промис разрешается массивом `records`. Структура элементов зависит от `rrtype`:

| `rrtype`  | Содержимое `records`            | Тип результата | Краткий метод                    |
| --------- | ------------------------------- | -------------- | -------------------------------- |
| `'A'`     | IPv4 (по умолчанию)             | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)       | [`dnsPromises.resolve4()`][`dnsPromises.resolve4()`]     |
| `'AAAA'`  | IPv6                            | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)       | [`dnsPromises.resolve6()`][`dnsPromises.resolve6()`]     |
| `'ANY'`   | любые записи                    | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dnsPromises.resolveAny()`][`dnsPromises.resolveAny()`]   |
| `'CAA'`   | авторизация ЦС                  | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dnsPromises.resolveCaa()`][`dnsPromises.resolveCaa()`]   |
| `'CNAME'` | канонические имена              | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)       | [`dnsPromises.resolveCname()`][`dnsPromises.resolveCname()`] |
| `'MX'`    | почтовый обмен                  | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dnsPromises.resolveMx()`][`dnsPromises.resolveMx()`]    |
| `'NAPTR'` | NAPTR                           | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dnsPromises.resolveNaptr()`][`dnsPromises.resolveNaptr()`] |
| `'NS'`    | серверы имён                    | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)       | [`dnsPromises.resolveNs()`][`dnsPromises.resolveNs()`]    |
| `'PTR'`   | указатели                       | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)       | [`dnsPromises.resolvePtr()`][`dnsPromises.resolvePtr()`]   |
| `'SOA'`   | начало зоны                     | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dnsPromises.resolveSoa()`][`dnsPromises.resolveSoa()`]   |
| `'SRV'`   | службы                          | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dnsPromises.resolveSrv()`][`dnsPromises.resolveSrv()`]   |
| `'TLSA'`  | привязки сертификатов           | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)       | [`dnsPromises.resolveTlsa()`][`dnsPromises.resolveTlsa()`]  |
| `'TXT'`   | текстовые записи                | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)    | [`dnsPromises.resolveTxt()`][`dnsPromises.resolveTxt()`]   |

При ошибке промис отклоняется с [`Error`][`Error`], поле `err.code` — один из [DNS error codes][DNS error codes].

### `dnsPromises.resolve4(hostname[, options])`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `ttl` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Получать TTL каждой записи.
    Если `true`, промис разрешается массивом объектов
    `{ address: '1.2.3.4', ttl: 60 }` вместо массива строк; TTL в секундах.

По протоколу DNS разрешает IPv4 (записи `A`) для `hostname`. При успехе промис разрешается массивом IPv4-адресов (например `['74.125.79.104', '74.125.79.105', '74.125.79.106']`).

### `dnsPromises.resolve6(hostname[, options])`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `ttl` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Получать TTL каждой записи.
    Если `true`, промис разрешается массивом объектов
    `{ address: '0:1:2:3:4:5:6:7', ttl: 60 }` вместо массива строк; TTL в секундах.

По протоколу DNS разрешает IPv6 (записи `AAAA`) для `hostname`. При успехе промис разрешается массивом IPv6-адресов.

### `dnsPromises.resolveAny(hostname)`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает все записи (запрос `ANY` или `*`).
При успехе промис разрешается массивом объектов разных типов. У каждого есть поле `type`; дальше набор полей зависит от типа:

| Type      | Свойства                                                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'A'`     | `address`/`ttl`                                                                                                                                          |
| `'AAAA'`  | `address`/`ttl`                                                                                                                                          |
| `'CAA'`   | см. [`dnsPromises.resolveCaa()`][`dnsPromises.resolveCaa()`]                                                                                                                       |
| `'CNAME'` | `value`                                                                                                                                                  |
| `'MX'`    | см. [`dnsPromises.resolveMx()`][`dnsPromises.resolveMx()`]                                                                                                                        |
| `'NAPTR'` | см. [`dnsPromises.resolveNaptr()`][`dnsPromises.resolveNaptr()`]                                                                                                                     |
| `'NS'`    | `value`                                                                                                                                                  |
| `'PTR'`   | `value`                                                                                                                                                  |
| `'SOA'`   | см. [`dnsPromises.resolveSoa()`][`dnsPromises.resolveSoa()`]                                                                                                                       |
| `'SRV'`   | см. [`dnsPromises.resolveSrv()`][`dnsPromises.resolveSrv()`]                                                                                                                       |
| `'TLSA'`  | см. [`dnsPromises.resolveTlsa()`][`dnsPromises.resolveTlsa()`]                                                                                                                      |
| `'TXT'`   | массив `entries`, см. [`dnsPromises.resolveTxt()`][`dnsPromises.resolveTxt()`], напр. `{ entries: ['...'], type: 'TXT' }`                                                            |

Пример результата:

<!-- eslint-disable @stylistic/js/semi -->

```js
[ { type: 'A', address: '127.0.0.1', ttl: 299 },
  { type: 'CNAME', value: 'example.com' },
  { type: 'MX', exchange: 'alt4.aspmx.l.example.com', priority: 50 },
  { type: 'NS', value: 'ns1.example.com' },
  { type: 'TXT', entries: [ 'v=spf1 include:_spf.example.com ~all' ] },
  { type: 'SOA',
    nsname: 'ns1.example.com',
    hostmaster: 'admin.example.com',
    serial: 156696742,
    refresh: 900,
    retry: 900,
    expire: 1800,
    minttl: 60 } ]
```

### `dnsPromises.resolveCaa(hostname)`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи `CAA` для `hostname`. При успехе промис разрешается массивом объектов
с записями авторизации ЦС для `hostname`
(например `[{critical: 0, iodef: 'mailto:pki@example.com'},{critical: 128, issue:
'pki.example.com'}]`).

### `dnsPromises.resolveCname(hostname)`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи `CNAME` для `hostname`. При успехе промис разрешается массивом канонических имён
для `hostname` (например `['bar.example.com']`).

### `dnsPromises.resolveMx(hostname)`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи `MX` для `hostname`. При успехе промис разрешается массивом объектов
с полями `priority` и `exchange` (например
`[{priority: 10, exchange: 'mx.example.com'}, ...]`).

### `dnsPromises.resolveNaptr(hostname)`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи `NAPTR` для `hostname`. При успехе промис разрешается массивом
объектов со свойствами:

* `flags`
* `service`
* `regexp`
* `replacement`
* `order`
* `preference`

<!-- eslint-skip -->

```js
{
  flags: 's',
  service: 'SIP+D2U',
  regexp: '',
  replacement: '_sip._udp.example.com',
  order: 30,
  preference: 100
}
```

### `dnsPromises.resolveNs(hostname)`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи `NS` для `hostname`. При успехе промис разрешается массивом серверов имён
для `hostname` (например
`['ns1.example.com', 'ns2.example.com']`).

### `dnsPromises.resolvePtr(hostname)`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи `PTR` для `hostname`. При успехе промис разрешается массивом строк
с ответными записями.

### `dnsPromises.resolveSoa(hostname)`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает запись `SOA` для `hostname`. При успехе промис разрешается объектом со свойствами:

* `nsname`
* `hostmaster`
* `serial`
* `refresh`
* `retry`
* `expire`
* `minttl`

<!-- eslint-skip -->

```js
{
  nsname: 'ns.example.com',
  hostmaster: 'root.example.com',
  serial: 2013101809,
  refresh: 10000,
  retry: 2400,
  expire: 604800,
  minttl: 3600
}
```

### `dnsPromises.resolveSrv(hostname)`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи `SRV` для `hostname`. При успехе промис разрешается массивом объектов со свойствами:

* `priority`
* `weight`
* `port`
* `name`

<!-- eslint-skip -->

```js
{
  priority: 10,
  weight: 5,
  port: 21223,
  name: 'service.example.com'
}
```

### `dnsPromises.resolveTlsa(hostname)`

<!-- YAML
added:
  - v23.9.0
  - v22.15.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи `TLSA` для `hostname`. При успехе промис разрешается массивом объектов со свойствами:

* `certUsage`
* `selector`
* `match`
* `data`

<!-- eslint-skip -->

```js
{
  certUsage: 3,
  selector: 1,
  match: 1,
  data: [ArrayBuffer]
}
```

### `dnsPromises.resolveTxt(hostname)`

<!-- YAML
added: v10.6.0
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По протоколу DNS разрешает записи `TXT` для `hostname`. При успехе промис разрешается двумерным массивом
фрагментов TXT для `hostname` (например
`[ ['v=spf1 ip4:0.0.0.0 ', '~all' ] ]`). Каждый подмассив — части одной записи; их можно склеить или обработать отдельно.

### `dnsPromises.reverse(ip)`

<!-- YAML
added: v10.6.0
-->

* `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Обратный DNS-запрос: IPv4- или IPv6-адрес преобразуется в массив имён хостов.

При ошибке промис отклоняется с [`Error`][`Error`], поле `err.code` — один из [DNS error codes][DNS error codes].

### `dnsPromises.setDefaultResultOrder(order)`

<!-- YAML
added:
  - v16.4.0
  - v14.18.0
changes:
  - version:
    - v22.1.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52492
    description: The `ipv6first` value is supported now.
  - version: v17.0.0
    pr-url: https://github.com/nodejs/node/pull/39987
    description: Changed default value to `verbatim`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.1.0, v20.13.0 | Значение `ipv6first` теперь поддерживается. |
    | v17.0.0 | Изменено значение по умолчанию на `verbatim`. |

* `order` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) должно быть `'ipv4first'`, `'ipv6first'` или `'verbatim'`.

Задаёт значение `order` по умолчанию для [`dns.lookup()`][`dns.lookup()`] и
[`dnsPromises.lookup()`][`dnsPromises.lookup()`]:

* `ipv4first` — по умолчанию `ipv4first`.
* `ipv6first` — по умолчанию `ipv6first`.
* `verbatim` — по умолчанию `verbatim`.

По умолчанию `verbatim`; [`dnsPromises.setDefaultResultOrder()`][`dnsPromises.setDefaultResultOrder()`] важнее
[`--dns-result-order`][`--dns-result-order`]. В [worker threads][worker threads] вызов из основного потока не меняет порядок DNS в воркерах.

### `dnsPromises.getDefaultResultOrder()`

<!-- YAML
added:
  - v20.1.0
  - v18.17.0
-->

Возвращает значение `dnsOrder`.

### `dnsPromises.setServers(servers)`

<!-- YAML
added: v10.6.0
-->

* `servers` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) массив адресов в формате [RFC 5952][RFC 5952]

Задаёт IP и порты DNS-серверов. Аргумент `servers` — массив строк [RFC 5952][RFC 5952]; порт 53 можно не указывать.

```js
dnsPromises.setServers([
  '8.8.8.8',
  '[2001:4860:4860::8888]',
  '8.8.8.8:1053',
  '[2001:4860:4860::8888]:1053',
]);
```

При неверном адресе будет выброшена ошибка.

`dnsPromises.setServers()` нельзя вызывать во время DNS-запроса.

Поведение аналогично [resolv.conf](https://man7.org/linux/man-pages/man5/resolv.conf.5.html):
при `NOTFOUND` на первом сервере `resolve()` не переходит к следующим; резерв используется при таймауте или иной ошибке.

## Коды ошибок {: #error-codes}

Каждый DNS-запрос может завершиться одним из кодов:

* `dns.NODATA`: ответ без данных.
* `dns.FORMERR`: сервер считает запрос некорректным.
* `dns.SERVFAIL`: общий сбой сервера.
* `dns.NOTFOUND`: доменное имя не найдено.
* `dns.NOTIMP`: операция не реализована на сервере.
* `dns.REFUSED`: сервер отказал в запросе.
* `dns.BADQUERY`: некорректный DNS-запрос.
* `dns.BADNAME`: некорректное имя хоста.
* `dns.BADFAMILY`: неподдерживаемое семейство адресов.
* `dns.BADRESP`: некорректный ответ DNS.
* `dns.CONNREFUSED`: не удалось связаться с DNS-серверами.
* `dns.TIMEOUT`: таймаут при обращении к DNS.
* `dns.EOF`: конец файла.
* `dns.FILE`: ошибка чтения файла.
* `dns.NOMEM`: нехватка памяти.
* `dns.DESTRUCTION`: канал уничтожается.
* `dns.BADSTR`: некорректная строка.
* `dns.BADFLAGS`: недопустимые флаги.
* `dns.NONAME`: данное имя не является числовым адресом.
* `dns.BADHINTS`: недопустимые флаги подсказок.
* `dns.NOTINITIALIZED`: библиотека c-ares ещё не инициализирована.
* `dns.LOADIPHLPAPI`: ошибка загрузки `iphlpapi.dll`.
* `dns.ADDRGETNETWORKPARAMS`: не найдена функция `GetNetworkParams`.
* `dns.CANCELLED`: запрос отменён.

API `dnsPromises` экспортирует те же коды, например `dnsPromises.NODATA`.

## Особенности реализации {: #implementation-considerations}

И [`dns.lookup()`][`dns.lookup()`], и функции `dns.resolve*()` / `dns.reverse()` сопоставляют сетевое имя и адрес (или наоборот), но делают это по-разному. Это влияет на поведение приложений Node.js.

### `dns.lookup()`

Внутри [`dns.lookup()`][`dns.lookup()`] использует те же механизмы ОС, что и большинство программ: обычно имя разрешается так же, как в команде `ping`. В POSIX-системах поведение можно менять через nsswitch.conf(5) и resolv.conf(5), и это затронет все программы на машине.

С точки зрения JavaScript вызов асинхронный, но под капотом выполняется синхронный getaddrinfo(3) в пуле потоков libuv — см. [`UV_THREADPOOL_SIZE`][`UV_THREADPOOL_SIZE`].

Многие сетевые API внутри вызывают `dns.lookup()`. Если это мешает, заранее разрешите имя через `dns.resolve()` и передавайте адрес. Часть API ([`socket.connect()`][`socket.connect()`], [`dgram.createSocket()`][`dgram.createSocket()`] и др.) позволяет подменить резолвер по умолчанию (`dns.lookup()`).

### `dns.resolve()`, `dns.resolve*()` и `dns.reverse()`

Эти функции устроены иначе, чем [`dns.lookup()`][`dns.lookup()`]: не используют getaddrinfo(3) и **всегда** выполняют DNS-запрос по сети. Обмен асинхронный и не задействует пул потоков libuv.

Поэтому они не создают такой же конкуренции за пул, как [`dns.lookup()`][`dns.lookup()`].

Набор конфигурации у них другой: например, не используется `/etc/hosts` так, как при lookup.

[DNS error codes]: #error-codes
[Domain Name System (DNS)]: https://en.wikipedia.org/wiki/Domain_Name_System
[Implementation considerations section]: #implementation-considerations
[RFC 5952]: https://tools.ietf.org/html/rfc5952#section-6
[RFC 8482]: https://tools.ietf.org/html/rfc8482
[`--dns-result-order`]: cli.md#--dns-result-orderorder
[`Error`]: errors.md#class-error
[`UV_THREADPOOL_SIZE`]: cli.md#uv_threadpool_sizesize
[`dgram.createSocket()`]: dgram.md#dgramcreatesocketoptions-callback
[`dns.getServers()`]: #dnsgetservers
[`dns.lookup()`]: #dnslookuphostname-options-callback
[`dns.resolve()`]: #dnsresolvehostname-rrtype-callback
[`dns.resolve4()`]: #dnsresolve4hostname-options-callback
[`dns.resolve6()`]: #dnsresolve6hostname-options-callback
[`dns.resolveAny()`]: #dnsresolveanyhostname-callback
[`dns.resolveCaa()`]: #dnsresolvecaahostname-callback
[`dns.resolveCname()`]: #dnsresolvecnamehostname-callback
[`dns.resolveMx()`]: #dnsresolvemxhostname-callback
[`dns.resolveNaptr()`]: #dnsresolvenaptrhostname-callback
[`dns.resolveNs()`]: #dnsresolvenshostname-callback
[`dns.resolvePtr()`]: #dnsresolveptrhostname-callback
[`dns.resolveSoa()`]: #dnsresolvesoahostname-callback
[`dns.resolveSrv()`]: #dnsresolvesrvhostname-callback
[`dns.resolveTlsa()`]: #dnsresolvetlsahostname-callback
[`dns.resolveTxt()`]: #dnsresolvetxthostname-callback
[`dns.reverse()`]: #dnsreverseip-callback
[`dns.setDefaultResultOrder()`]: #dnssetdefaultresultorderorder
[`dns.setServers()`]: #dnssetserversservers
[`dnsPromises.getServers()`]: #dnspromisesgetservers
[`dnsPromises.lookup()`]: #dnspromiseslookuphostname-options
[`dnsPromises.resolve()`]: #dnspromisesresolvehostname-rrtype
[`dnsPromises.resolve4()`]: #dnspromisesresolve4hostname-options
[`dnsPromises.resolve6()`]: #dnspromisesresolve6hostname-options
[`dnsPromises.resolveAny()`]: #dnspromisesresolveanyhostname
[`dnsPromises.resolveCaa()`]: #dnspromisesresolvecaahostname
[`dnsPromises.resolveCname()`]: #dnspromisesresolvecnamehostname
[`dnsPromises.resolveMx()`]: #dnspromisesresolvemxhostname
[`dnsPromises.resolveNaptr()`]: #dnspromisesresolvenaptrhostname
[`dnsPromises.resolveNs()`]: #dnspromisesresolvenshostname
[`dnsPromises.resolvePtr()`]: #dnspromisesresolveptrhostname
[`dnsPromises.resolveSoa()`]: #dnspromisesresolvesoahostname
[`dnsPromises.resolveSrv()`]: #dnspromisesresolvesrvhostname
[`dnsPromises.resolveTlsa()`]: #dnspromisesresolvetlsahostname
[`dnsPromises.resolveTxt()`]: #dnspromisesresolvetxthostname
[`dnsPromises.reverse()`]: #dnspromisesreverseip
[`dnsPromises.setDefaultResultOrder()`]: #dnspromisessetdefaultresultorderorder
[`dnsPromises.setServers()`]: #dnspromisessetserversservers
[`socket.connect()`]: net.md#socketconnectoptions-connectlistener
[`util.promisify()`]: util.md#utilpromisifyoriginal
[supported `getaddrinfo` flags]: #supported-getaddrinfo-flags
[worker threads]: worker_threads.md
