---
description: В dns модуль включает разрешение имен
---

# Модуль dns

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/dns.js -->

В `dns` модуль включает разрешение имен. Например, используйте его для поиска IP-адресов имен хостов.

Хотя назван в честь [Система доменных имен (DNS)](https://en.wikipedia.org/wiki/Domain_Name_System), он не всегда использует протокол DNS для поиска. [`dns.lookup()`](#dnslookuphostname-options-callback) использует средства операционной системы для выполнения разрешения имен. Возможно, не потребуется никаких сетевых подключений. Чтобы выполнить разрешение имен так, как это делают другие приложения в той же системе, используйте [`dns.lookup()`](#dnslookuphostname-options-callback).

```js
const dns = require('dns');

dns.lookup('example.org', (err, address, family) => {
  console.log('address: %j family: IPv%s', address, family);
});
// address: "93.184.216.34" family: IPv4
```

Все остальные функции в `dns` модуль подключается к реальному DNS-серверу для выполнения разрешения имен. Они всегда будут использовать сеть для выполнения DNS-запросов. Эти функции не используют тот же набор файлов конфигурации, что и [`dns.lookup()`](#dnslookuphostname-options-callback) (например. `/etc/hosts`). Используйте эти функции, чтобы всегда выполнять запросы DNS, минуя другие средства разрешения имен.

```js
const dns = require('dns');

dns.resolve4('archive.org', (err, addresses) => {
  if (err) throw err;

  console.log(`addresses: ${JSON.stringify(addresses)}`);

  addresses.forEach((a) => {
    dns.reverse(a, (err, hostnames) => {
      if (err) {
        throw err;
      }
      console.log(
        `reverse for ${a}: ${JSON.stringify(hostnames)}`
      );
    });
  });
});
```

Увидеть [Раздел "Соображения по реализации"](#implementation-considerations) для дополнительной информации.

## Класс: `dns.Resolver`

<!-- YAML
added: v8.3.0
-->

Независимый преобразователь для DNS-запросов.

При создании нового распознавателя используются настройки сервера по умолчанию. Установка серверов, используемых для распознавателя, с помощью [`resolver.setServers()`](#dnssetserversservers) не влияет на другие резолверы:

```js
const { Resolver } = require('dns');
const resolver = new Resolver();
resolver.setServers(['4.4.4.4']);

// This request will use the server at 4.4.4.4, independent of global settings.
resolver.resolve4('example.org', (err, addresses) => {
  // ...
});
```

Следующие методы из `dns` доступны:

- [`resolver.getServers()`](#dnsgetservers)
- [`resolver.resolve()`](#dnsresolvehostname-rrtype-callback)
- [`resolver.resolve4()`](#dnsresolve4hostname-options-callback)
- [`resolver.resolve6()`](#dnsresolve6hostname-options-callback)
- [`resolver.resolveAny()`](#dnsresolveanyhostname-callback)
- [`resolver.resolveCaa()`](#dnsresolvecaahostname-callback)
- [`resolver.resolveCname()`](#dnsresolvecnamehostname-callback)
- [`resolver.resolveMx()`](#dnsresolvemxhostname-callback)
- [`resolver.resolveNaptr()`](#dnsresolvenaptrhostname-callback)
- [`resolver.resolveNs()`](#dnsresolvenshostname-callback)
- [`resolver.resolvePtr()`](#dnsresolveptrhostname-callback)
- [`resolver.resolveSoa()`](#dnsresolvesoahostname-callback)
- [`resolver.resolveSrv()`](#dnsresolvesrvhostname-callback)
- [`resolver.resolveTxt()`](#dnsresolvetxthostname-callback)
- [`resolver.reverse()`](#dnsreverseip-callback)
- [`resolver.setServers()`](#dnssetserversservers)

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

Создайте новый преобразователь.

- `options` {Объект}
  - `timeout` {integer} Тайм-аут запроса в миллисекундах или `-1` использовать тайм-аут по умолчанию.
  - `tries` {integer} Число попыток, которые преобразователь попытается связаться с каждым сервером имен, прежде чем отказаться. **Дефолт:** `4`

### `resolver.cancel()`

<!-- YAML
added: v8.3.0
-->

Отмените все невыполненные DNS-запросы, сделанные этим преобразователем. Соответствующие обратные вызовы будут вызываться с ошибкой с кодом `ECANCELLED`.

### `resolver.setLocalAddress([ipv4][, ipv6])`

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
-->

- `ipv4` {строка} Строковое представление IPv4-адреса. **Дефолт:** `'0.0.0.0'`
- `ipv6` {строка} Строковое представление IPv6-адреса. **Дефолт:** `'::0'`

Экземпляр резолвера будет отправлять свои запросы с указанного IP-адреса. Это позволяет программам указывать исходящие интерфейсы при использовании в многосетевых системах.

Если адрес v4 или v6 не указан, он устанавливается по умолчанию, и операционная система автоматически выберет локальный адрес.

Преобразователь будет использовать локальный адрес v4 при запросах к DNS-серверам IPv4 и локальный адрес v6 при запросах к DNS-серверам IPv6. В `rrtype` запросов на разрешение не влияет на используемый локальный адрес.

## `dns.getServers()`

<!-- YAML
added: v0.11.3
-->

- Возвращает: {строка \[]}

Возвращает массив строк IP-адресов, отформатированных в соответствии с [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6), которые в настоящее время настроены для разрешения DNS. Строка будет включать раздел порта, если используется настраиваемый порт.

<!-- eslint-disable semi-->

```js
[
  '4.4.4.4',
  '2001:4860:4860::8888',
  '4.4.4.4:1053',
  '[2001:4860:4860::8888]:1053',
];
```

## `dns.lookup(hostname[, options], callback)`

<!-- YAML
added: v0.1.90
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/39987
    description: The `verbatim` options defaults to `true` now.
  - version: v8.5.0
    pr-url: https://github.com/nodejs/node/pull/14731
    description: The `verbatim` option is supported now.
  - version: v1.2.0
    pr-url: https://github.com/nodejs/node/pull/744
    description: The `all` option is supported now.
-->

- `hostname` {нить}
- `options` {целое | Объект}
  - `family` {integer} Семейство записей. Должно быть `4`, `6`, или `0`. Значение `0` указывает, что возвращаются оба адреса IPv4 и IPv6. **Дефолт:** `0`.
  - `hints` {number} один или несколько [поддержанный `getaddrinfo` флаги](#supported-getaddrinfo-flags). Несколько флагов могут быть переданы побитовым способом. `OR`их ценности.
  - `all` {boolean} Когда `true`, обратный вызов возвращает все разрешенные адреса в массиве. В противном случае возвращает единственный адрес. **Дефолт:** `false`.
  - `verbatim` {boolean} Когда `true`, обратный вызов получает адреса IPv4 и IPv6 в том порядке, в котором их вернул преобразователь DNS. Когда `false`, Адреса IPv4 помещаются перед адресами IPv6. **Дефолт:** `true` (адреса переупорядочены). Значение по умолчанию можно настроить с помощью [`dns.setDefaultResultOrder()`](#dnssetdefaultresultorderorder) или [`--dns-result-order`](cli.md#--dns-result-orderorder).
- `callback` {Функция}
  - `err` {Ошибка}
  - `address` {строка} Строковое представление адреса IPv4 или IPv6.
  - `family` {целое число} `4` или `6`, обозначая семью `address`, или `0` если адрес не является адресом IPv4 или IPv6. `0` является вероятным индикатором ошибки в службе разрешения имен, используемой операционной системой.

Разрешает имя хоста (например, `'nodejs.org'`) в первую найденную запись A (IPv4) или AAAA (IPv6). Все `option` свойства не являются обязательными. Если `options` является целым числом, тогда оно должно быть `4` или `6` - если `options` не указан, то возвращаются оба адреса IPv4 и IPv6, если они найдены.

С `all` опция установлена на `true`, аргументы в пользу `callback` изменить на `(err, addresses)`, с участием `addresses` являясь массивом объектов со свойствами `address` а также `family`.

При ошибке `err` является [`Error`](errors.md#class-error) объект, где `err.code` это код ошибки. Имейте в виду, что `err.code` будет установлен на `'ENOTFOUND'` не только тогда, когда имя хоста не существует, но и когда поиск завершается неудачно по другим причинам, например из-за отсутствия доступных файловых дескрипторов.

`dns.lookup()` не обязательно имеет какое-либо отношение к протоколу DNS. Реализация использует средство операционной системы, которое может связывать имена с адресами и наоборот. Эта реализация может иметь тонкие, но важные последствия для поведения любой программы Node.js. Пожалуйста, найдите время, чтобы проконсультироваться с [Раздел "Соображения по реализации"](#implementation-considerations) Перед использованием `dns.lookup()`.

Пример использования:

```js
const dns = require('dns');
const options = {
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
};
dns.lookup('example.com', options, (err, address, family) =>
  console.log('address: %j family: IPv%s', address, family)
);
// address: "2606:2800:220:1:248:1893:25c8:1946" family: IPv6

// When options.all is true, the result will be an Array.
options.all = true;
dns.lookup('example.com', options, (err, addresses) =>
  console.log('addresses: %j', addresses)
);
// addresses: [{"address":"2606:2800:220:1:248:1893:25c8:1946","family":6}]
```

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)версия ed, и `all` не установлен на `true`, он возвращает `Promise` для `Object` с участием `address` а также `family` характеристики.

### Поддерживаемые флаги getaddrinfo

<!-- YAML
changes:
  - version:
     - v13.13.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32183
    description: Added support for the `dns.ALL` flag.
-->

Следующие флаги могут быть переданы как подсказки для [`dns.lookup()`](#dnslookuphostname-options-callback).

- `dns.ADDRCONFIG`: Ограничивает возвращаемые типы адресов типами адресов без обратной связи, настроенных в системе. Например, адреса IPv4 возвращаются только в том случае, если в текущей системе настроен хотя бы один адрес IPv4.
- `dns.V4MAPPED`: Если было указано семейство IPv6, но адреса IPv6 не найдены, вернуть сопоставленные IPv6-адреса IPv4. Он не поддерживается некоторыми операционными системами (например, FreeBSD 10.1).
- `dns.ALL`: Если `dns.V4MAPPED` указано, возвращаются разрешенные IPv6-адреса, а также IPv4-сопоставленные IPv6-адреса.

## `dns.lookupService(address, port, callback)`

<!-- YAML
added: v0.11.14
-->

- `address` {нить}
- `port` {количество}
- `callback` {Функция}
  - `err` {Ошибка}
  - `hostname` {строка} например `example.com`
  - `service` {строка} например `http`

Решает данный `address` а также `port` в имя хоста и службу, используя лежащую в основе операционной системы `getnameinfo` реализация.

Если `address` не является действительным IP-адресом, `TypeError` будет брошен. В `port` будет принужден к номеру. Если это не законный порт, `TypeError` будет брошен.

При ошибке `err` является [`Error`](errors.md#class-error) объект, где `err.code` это код ошибки.

```js
const dns = require('dns');
dns.lookupService(
  '127.0.0.1',
  22,
  (err, hostname, service) => {
    console.log(hostname, service);
    // Prints: localhost ssh
  }
);
```

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed версия, он возвращает `Promise` для `Object` с участием `hostname` а также `service` характеристики.

## `dns.resolve(hostname[, rrtype], callback)`

<!-- YAML
added: v0.1.27
-->

- `hostname` {строка} Имя хоста для разрешения.
- `rrtype` {строка} Тип записи ресурса. **Дефолт:** `'A'`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `records` {строка \[] | Объект \[] | Объект}

Использует протокол DNS для разрешения имени хоста (например, `'nodejs.org'`) в массив записей ресурсов. В `callback` функция имеет аргументы `(err, records)`. В случае успеха `records` будет массивом записей ресурсов. Тип и структура индивидуальных результатов варьируются в зависимости от `rrtype`:

| `rrtype` | `records` содержит | Тип результата | Сокращенный метод | | ----------- | -------------------------------- | ---- --------- | -------------------------- | | `'A'` | Адреса IPv4 (по умолчанию) | {строка} | [`dns.resolve4()`](#dnsresolve4hostname-options-callback) | | `'AAAA'` | Адреса IPv6 | {строка} | [`dns.resolve6()`](#dnsresolve6hostname-options-callback) | | `'ANY'` | любые записи | {Object} | [`dns.resolveAny()`](#dnsresolveanyhostname-callback) | | `'CAA'` | Записи авторизации CA | {Object} | [`dns.resolveCaa()`](#dnsresolvecaahostname-callback) | | `'CNAME'` | канонические записи имен | {строка} | [`dns.resolveCname()`](#dnsresolvecnamehostname-callback) | | `'MX'` | записи обмена почтой | {Object} | [`dns.resolveMx()`](#dnsresolvemxhostname-callback) | | `'NAPTR'` | записи указателя авторитетного имени | {Object} | [`dns.resolveNaptr()`](#dnsresolvenaptrhostname-callback) | | `'NS'` | записи сервера имен | {строка} | [`dns.resolveNs()`](#dnsresolvenshostname-callback) | | `'PTR'` | записи указателя | {строка} | [`dns.resolvePtr()`](#dnsresolveptrhostname-callback) | | `'SOA'` | начало авторитетных записей | {Object} | [`dns.resolveSoa()`](#dnsresolvesoahostname-callback) | | `'SRV'` | служебные записи | {Object} | [`dns.resolveSrv()`](#dnsresolvesrvhostname-callback) | | `'TXT'` | текстовые записи | {строка \[]} | [`dns.resolveTxt()`](#dnsresolvetxthostname-callback) |

При ошибке `err` является [`Error`](errors.md#class-error) объект, где `err.code` один из [Коды ошибок DNS]().

## `dns.resolve4(hostname[, options], callback)`

<!-- YAML
added: v0.1.16
changes:
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/9296
    description: This method now supports passing `options`,
                 specifically `options.ttl`.
-->

- `hostname` {строка} Имя хоста для разрешения.
- `options` {Объект}
  - `ttl` {boolean} Получить значение времени жизни (TTL) каждой записи. Когда `true`, обратный вызов получает массив `{ address: '1.2.3.4', ttl: 60 }` объекты, а не массив строк, с TTL, выраженным в секундах.
- `callback` {Функция}
  - `err` {Ошибка}
  - `addresses` {строка \[] | Объект\[]}

Использует протокол DNS для разрешения адресов IPv4 (`A` записи) для `hostname`. В `addresses` аргумент передан в `callback` функция будет содержать массив адресов IPv4 (например, `['74.125.79.104', '74.125.79.105', '74.125.79.106']`).

## `dns.resolve6(hostname[, options], callback)`

<!-- YAML
added: v0.1.16
changes:
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/9296
    description: This method now supports passing `options`,
                 specifically `options.ttl`.
-->

- `hostname` {строка} Имя хоста для разрешения.
- `options` {Объект}
  - `ttl` {boolean} Получить значение времени жизни (TTL) каждой записи. Когда `true`, обратный вызов получает массив `{ address: '0:1:2:3:4:5:6:7', ttl: 60 }` объекты, а не массив строк, с TTL, выраженным в секундах.
- `callback` {Функция}
  - `err` {Ошибка}
  - `addresses` {строка \[] | Объект\[]}

Использует протокол DNS для разрешения адресов IPv6 (`AAAA` записи) для `hostname`. В `addresses` аргумент передан в `callback` функция будет содержать массив адресов IPv6.

## `dns.resolveAny(hostname, callback)`

- `hostname` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `ret` {Объект\[]}

Использует протокол DNS для разрешения всех записей (также известный как `ANY` или `*` запрос). В `ret` аргумент передан в `callback` Функция будет массивом, содержащим различные типы записей. У каждого объекта есть свойство `type` что указывает на тип текущей записи. И в зависимости от `type`, на объекте будут присутствовать дополнительные свойства:

| Тип | Недвижимость | | ------ | ------------ | | `'A'` | `address`/`ttl` | | `'AAAA'` | `address`/`ttl` | | `'CNAME'` | `value` | | `'MX'` | Ссылаться на [`dns.resolveMx()`](#dnsresolvemxhostname-callback) | | `'NAPTR'` | Ссылаться на [`dns.resolveNaptr()`](#dnsresolvenaptrhostname-callback) | | `'NS'` | `value` | | `'PTR'` | `value` | | `'SOA'` | Ссылаться на [`dns.resolveSoa()`](#dnsresolvesoahostname-callback) | | `'SRV'` | Ссылаться на [`dns.resolveSrv()`](#dnsresolvesrvhostname-callback) | | `'TXT'` | Этот тип записи содержит свойство массива, называемое `entries` который относится к [`dns.resolveTxt()`](#dnsresolvetxthostname-callback), например `{ entries: ['...'], type: 'TXT' }` |

Вот пример `ret` объект, переданный в обратный вызов:

<!-- eslint-disable semi -->

```js
[
  { type: 'A', address: '127.0.0.1', ttl: 299 },
  { type: 'CNAME', value: 'example.com' },
  {
    type: 'MX',
    exchange: 'alt4.aspmx.l.example.com',
    priority: 50,
  },
  { type: 'NS', value: 'ns1.example.com' },
  {
    type: 'TXT',
    entries: ['v=spf1 include:_spf.example.com ~all'],
  },
  {
    type: 'SOA',
    nsname: 'ns1.example.com',
    hostmaster: 'admin.example.com',
    serial: 156696742,
    refresh: 900,
    retry: 900,
    expire: 1800,
    minttl: 60,
  },
];
```

Операторы DNS-серверов могут не отвечать на `ANY` запросы. Может быть лучше вызывать отдельные методы, например [`dns.resolve4()`](#dnsresolve4hostname-options-callback), [`dns.resolveMx()`](#dnsresolvemxhostname-callback), и так далее. Подробнее см. [RFC 8482](https://tools.ietf.org/html/rfc8482).

## `dns.resolveCname(hostname, callback)`

<!-- YAML
added: v0.3.2
-->

- `hostname` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `addresses` {нить\[]}

Использует протокол DNS для разрешения `CNAME` записи для `hostname`. В `addresses` аргумент передан в `callback` функция будет содержать массив записей канонических имен, доступных для `hostname` (например. `['bar.example.com']`).

## `dns.resolveCaa(hostname, callback)`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

- `hostname` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `records` {Объект\[]}

Использует протокол DNS для разрешения `CAA` записи для `hostname`. В `addresses` аргумент передан в `callback` функция будет содержать массив авторизационных записей центра сертификации, доступных для `hostname` (например. `[{critical: 0, iodef: 'mailto:pki@example.com'}, {critical: 128, issue: 'pki.example.com'}]`).

## `dns.resolveMx(hostname, callback)`

<!-- YAML
added: v0.1.27
-->

- `hostname` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `addresses` {Объект\[]}

Использует протокол DNS для разрешения записей почтового обмена (`MX` записи) для `hostname`. В `addresses` аргумент передан в `callback` функция будет содержать массив объектов, содержащий как `priority` а также `exchange` собственность (например, `[{priority: 10, exchange: 'mx.example.com'}, ...]`).

## `dns.resolveNaptr(hostname, callback)`

<!-- YAML
added: v0.9.12
-->

- `hostname` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `addresses` {Объект\[]}

Использует протокол DNS для разрешения записей на основе регулярных выражений (`NAPTR` записи) для `hostname`. В `addresses` аргумент передан в `callback` функция будет содержать массив объектов со следующими свойствами:

- `flags`
- `service`
- `regexp`
- `replacement`
- `order`
- `preference`

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
-->

- `hostname` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `addresses` {нить\[]}

Использует протокол DNS для разрешения записей сервера имен (`NS` записи) для `hostname`. В `addresses` аргумент передан в `callback` функция будет содержать массив записей сервера имен, доступных для `hostname` (например. `['ns1.example.com', 'ns2.example.com']`).

## `dns.resolvePtr(hostname, callback)`

<!-- YAML
added: v6.0.0
-->

- `hostname` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `addresses` {нить\[]}

Использует протокол DNS для разрешения записей указателей (`PTR` записи) для `hostname`. В `addresses` аргумент передан в `callback` функция будет массивом строк, содержащих записи ответа.

## `dns.resolveSoa(hostname, callback)`

<!-- YAML
added: v0.11.10
-->

- `hostname` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `address` {Объект}

Использует протокол DNS для разрешения начала авторитетной записи (`SOA` запись) для `hostname`. В `address` аргумент передан в `callback` функция будет объектом со следующими свойствами:

- `nsname`
- `hostmaster`
- `serial`
- `refresh`
- `retry`
- `expire`
- `minttl`

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
-->

- `hostname` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `addresses` {Объект\[]}

Использует протокол DNS для разрешения служебных записей (`SRV` записи) для `hostname`. В `addresses` аргумент передан в `callback` Функция будет массивом объектов со следующими свойствами:

- `priority`
- `weight`
- `port`
- `name`

<!-- eslint-skip -->

```js
{
  priority: 10,
  weight: 5,
  port: 21223,
  name: 'service.example.com'
}
```

## `dns.resolveTxt(hostname, callback)`

<!-- YAML
added: v0.1.27
-->

<!--lint disable no-undefined-references list-item-bullet-indent-->

- `hostname` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `records` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type" class="type"><строка \[] \[]></a>

<!--lint enable no-undefined-references list-item-bullet-indent-->

Использует протокол DNS для разрешения текстовых запросов (`TXT` записи) для `hostname`. В `records` аргумент передан в `callback` функция - это двумерный массив текстовых записей, доступных для `hostname` (например. `[ ['v=spf1 ip4:0.0.0.0 ', '~all' ] ]`). Каждый подмассив содержит фрагменты TXT одной записи. В зависимости от варианта использования они могут быть объединены или рассматриваться отдельно.

## `dns.reverse(ip, callback)`

<!-- YAML
added: v0.1.16
-->

- `ip` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `hostnames` {нить\[]}

Выполняет обратный DNS-запрос, который разрешает адрес IPv4 или IPv6 в массив имен узлов.

При ошибке `err` является [`Error`](errors.md#class-error) объект, где `err.code` один из [Коды ошибок DNS](#error-codes).

## `dns.setDefaultResultOrder(order)`

<!-- YAML
added:
  - v16.4.0
  - v14.18.0
-->

- `order` {строка} должна быть `'ipv4first'` или `'verbatim'`.

Установите значение по умолчанию `verbatim` в [`dns.lookup()`](#dnslookuphostname-options-callback) а также [`dnsPromises.lookup()`](#dnspromiseslookuphostname-options). Значение может быть:

- `ipv4first`: устанавливает по умолчанию `verbatim` `false`.
- `verbatim`: устанавливает по умолчанию `verbatim` `true`.

По умолчанию `ipv4first` а также [`dns.setDefaultResultOrder()`](#dnssetdefaultresultorderorder) иметь более высокий приоритет, чем [`--dns-result-order`](cli.md#--dns-result-orderorder). Когда используешь [рабочие потоки](worker_threads.md), [`dns.setDefaultResultOrder()`](#dnssetdefaultresultorderorder) из основного потока не повлияет на заказы DNS по умолчанию в воркерах.

## `dns.setServers(servers)`

<!-- YAML
added: v0.11.3
-->

- `servers` {string \[]} массив [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6) форматированные адреса

Устанавливает IP-адрес и порт серверов, которые будут использоваться при выполнении разрешения DNS. В `servers` аргумент - это массив [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6) форматированные адреса. Если это порт DNS по умолчанию IANA (53), его можно не указывать.

```js
dns.setServers([
  '4.4.4.4',
  '[2001:4860:4860::8888]',
  '4.4.4.4:1053',
  '[2001:4860:4860::8888]:1053',
]);
```

Если указан неверный адрес, будет выдана ошибка.

В `dns.setServers()` нельзя вызывать во время выполнения DNS-запроса.

В [`dns.setServers()`](#dnssetserversservers) метод влияет только на [`dns.resolve()`](#dnsresolvehostname-rrtype-callback), `dns.resolve*()` а также [`dns.reverse()`](#dnsreverseip-callback) (и в частности _нет_ [`dns.lookup()`](#dnslookuphostname-options-callback)).

Этот метод работает так же, как [resolve.conf](https://man7.org/linux/man-pages/man5/resolv.conf.5.html). То есть, если попытка разрешить с помощью первого предоставленного сервера приводит к `NOTFOUND` ошибка, `resolve()` метод будет _нет_ попытаться решить с последующими предоставленными серверами. Резервные DNS-серверы будут использоваться только в том случае, если истекло время ожидания более ранних из них или возникла другая ошибка.

## DNS обещает API

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

В `dns.promises` API предоставляет альтернативный набор асинхронных методов DNS, которые возвращают `Promise` объекты вместо использования обратных вызовов. API доступен через `require('dns').promises` или `require('dns/promises')`.

### Класс: `dnsPromises.Resolver`

<!-- YAML
added: v10.6.0
-->

Независимый преобразователь для DNS-запросов.

При создании нового распознавателя используются настройки сервера по умолчанию. Установка серверов, используемых для распознавателя, с помощью [`resolver.setServers()`](#dnspromisessetserversservers) не влияет на другие резолверы:

```js
const { Resolver } = require('dns').promises;
const resolver = new Resolver();
resolver.setServers(['4.4.4.4']);

// This request will use the server at 4.4.4.4, independent of global settings.
resolver.resolve4('example.org').then((addresses) => {
  // ...
});

// Alternatively, the same code can be written using async-await style.
(async function () {
  const addresses = await resolver.resolve4('example.org');
})();
```

Следующие методы из `dnsPromises` Доступны API:

- [`resolver.getServers()`](#dnspromisesgetservers)
- [`resolver.resolve()`](#dnspromisesresolvehostname-rrtype)
- [`resolver.resolve4()`](#dnspromisesresolve4hostname-options)
- [`resolver.resolve6()`](#dnspromisesresolve6hostname-options)
- [`resolver.resolveAny()`](#dnspromisesresolveanyhostname)
- [`resolver.resolveCaa()`](#dnspromisesresolvecaahostname)
- [`resolver.resolveCname()`](#dnspromisesresolvecnamehostname)
- [`resolver.resolveMx()`](#dnspromisesresolvemxhostname)
- [`resolver.resolveNaptr()`](#dnspromisesresolvenaptrhostname)
- [`resolver.resolveNs()`](#dnspromisesresolvenshostname)
- [`resolver.resolvePtr()`](#dnspromisesresolveptrhostname)
- [`resolver.resolveSoa()`](#dnspromisesresolvesoahostname)
- [`resolver.resolveSrv()`](#dnspromisesresolvesrvhostname)
- [`resolver.resolveTxt()`](#dnspromisesresolvetxthostname)
- [`resolver.reverse()`](#dnspromisesreverseip)
- [`resolver.setServers()`](#dnspromisessetserversservers)

### `resolver.cancel()`

<!-- YAML
added:
  - v15.3.0
  - v14.17.0
-->

Отмените все невыполненные DNS-запросы, сделанные этим преобразователем. Соответствующие обещания будут отклонены с ошибкой с кодом `ECANCELLED`.

### `dnsPromises.getServers()`

<!-- YAML
added: v10.6.0
-->

- Возвращает: {строка \[]}

Возвращает массив строк IP-адресов, отформатированных в соответствии с [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6), которые в настоящее время настроены для разрешения DNS. Строка будет включать раздел порта, если используется настраиваемый порт.

<!-- eslint-disable semi-->

```js
[
  '4.4.4.4',
  '2001:4860:4860::8888',
  '4.4.4.4:1053',
  '[2001:4860:4860::8888]:1053',
];
```

### `dnsPromises.lookup(hostname[, options])`

<!-- YAML
added: v10.6.0
-->

- `hostname` {нить}
- `options` {целое | Объект}
  - `family` {integer} Семейство записей. Должно быть `4`, `6`, или `0`. Значение `0` указывает, что возвращаются оба адреса IPv4 и IPv6. **Дефолт:** `0`.
  - `hints` {number} один или несколько [поддержанный `getaddrinfo` флаги](#supported-getaddrinfo-flags). Несколько флагов могут быть переданы побитовым способом. `OR`их ценности.
  - `all` {boolean} Когда `true`, то `Promise` разрешается со всеми адресами в массиве. В противном случае возвращает единственный адрес. **Дефолт:** `false`.
  - `verbatim` {boolean} Когда `true`, то `Promise` разрешается с помощью адресов IPv4 и IPv6 в том порядке, в котором их вернул преобразователь DNS. Когда `false`, Адреса IPv4 помещаются перед адресами IPv6. **Дефолт:** В данный момент `false` (адреса переупорядочиваются), но ожидается, что это изменится в недалеком будущем. Значение по умолчанию можно настроить с помощью [`dns.setDefaultResultOrder()`](#dnssetdefaultresultorderorder) или [`--dns-result-order`](cli.md#--dns-result-orderorder). Новый код должен использовать `{ verbatim: true }`.

Разрешает имя хоста (например, `'nodejs.org'`) в первую найденную запись A (IPv4) или AAAA (IPv6). Все `option` свойства не являются обязательными. Если `options` является целым числом, тогда оно должно быть `4` или `6` - если `options` не указан, то возвращаются оба адреса IPv4 и IPv6, если они найдены.

С `all` опция установлена на `true`, то `Promise` решается с `addresses` являясь массивом объектов со свойствами `address` а также `family`.

В случае ошибки `Promise` отклоняется с [`Error`](errors.md#class-error) объект, где `err.code` это код ошибки. Имейте в виду, что `err.code` будет установлен на `'ENOTFOUND'` не только тогда, когда имя хоста не существует, но и когда поиск завершается неудачно по другим причинам, например из-за отсутствия доступных файловых дескрипторов.

[`dnsPromises.lookup()`](#dnspromiseslookuphostname-options) не обязательно имеет какое-либо отношение к протоколу DNS. Реализация использует средство операционной системы, которое может связывать имена с адресами и наоборот. Эта реализация может иметь тонкие, но важные последствия для поведения любой программы Node.js. Пожалуйста, найдите время, чтобы проконсультироваться с [Раздел "Соображения по реализации"](#implementation-considerations) Перед использованием `dnsPromises.lookup()`.

Пример использования:

```js
const dns = require('dns');
const dnsPromises = dns.promises;
const options = {
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
};

dnsPromises
  .lookup('example.com', options)
  .then((result) => {
    console.log(
      'address: %j family: IPv%s',
      result.address,
      result.family
    );
    // address: "2606:2800:220:1:248:1893:25c8:1946" family: IPv6
  });

// When options.all is true, the result will be an Array.
options.all = true;
dnsPromises
  .lookup('example.com', options)
  .then((result) => {
    console.log('addresses: %j', result);
    // addresses: [{"address":"2606:2800:220:1:248:1893:25c8:1946","family":6}]
  });
```

### `dnsPromises.lookupService(address, port)`

<!-- YAML
added: v10.6.0
-->

- `address` {нить}
- `port` {количество}

Решает данный `address` а также `port` в имя хоста и службу, используя лежащую в основе операционной системы `getnameinfo` реализация.

Если `address` не является действительным IP-адресом, `TypeError` будет брошен. В `port` будет принужден к номеру. Если это не законный порт, `TypeError` будет брошен.

В случае ошибки `Promise` отклоняется с [`Error`](errors.md#class-error) объект, где `err.code` это код ошибки.

```js
const dnsPromises = require('dns').promises;
dnsPromises
  .lookupService('127.0.0.1', 22)
  .then((result) => {
    console.log(result.hostname, result.service);
    // Prints: localhost ssh
  });
```

### `dnsPromises.resolve(hostname[, rrtype])`

<!-- YAML
added: v10.6.0
-->

- `hostname` {строка} Имя хоста для разрешения.
- `rrtype` {строка} Тип записи ресурса. **Дефолт:** `'A'`.

Использует протокол DNS для разрешения имени хоста (например, `'nodejs.org'`) в массив записей ресурсов. В случае успеха `Promise` разрешается с помощью массива записей ресурсов. Тип и структура индивидуальных результатов различаются в зависимости от `rrtype`:

| `rrtype` | `records` содержит | Тип результата | Сокращенный метод | | ----------- | -------------------------------- | ---- --------- | -------------------------- | | `'A'` | Адреса IPv4 (по умолчанию) | {строка} | [`dnsPromises.resolve4()`](#dnspromisesresolve4hostname-options) | | `'AAAA'` | Адреса IPv6 | {строка} | [`dnsPromises.resolve6()`](#dnspromisesresolve6hostname-options) | | `'ANY'` | любые записи | {Object} | [`dnsPromises.resolveAny()`](#dnspromisesresolveanyhostname) | | `'CAA'` | Записи авторизации CA | {Object} | [`dnsPromises.resolveCaa()`](#dnspromisesresolvecaahostname) | | `'CNAME'` | канонические записи имен | {строка} | [`dnsPromises.resolveCname()`](#dnspromisesresolvecnamehostname) | | `'MX'` | записи обмена почтой | {Object} | [`dnsPromises.resolveMx()`](#dnspromisesresolvemxhostname) | | `'NAPTR'` | записи указателя авторитетного имени | {Object} | [`dnsPromises.resolveNaptr()`](#dnspromisesresolvenaptrhostname) | | `'NS'` | записи сервера имен | {строка} | [`dnsPromises.resolveNs()`](#dnspromisesresolvenshostname) | | `'PTR'` | записи указателя | {строка} | [`dnsPromises.resolvePtr()`](#dnspromisesresolveptrhostname) | | `'SOA'` | начало авторитетных записей | {Object} | [`dnsPromises.resolveSoa()`](#dnspromisesresolvesoahostname) | | `'SRV'` | служебные записи | {Object} | [`dnsPromises.resolveSrv()`](#dnspromisesresolvesrvhostname) | | `'TXT'` | текстовые записи | {строка \[]} | [`dnsPromises.resolveTxt()`](#dnspromisesresolvetxthostname) |

В случае ошибки `Promise` отклоняется с [`Error`](errors.md#class-error) объект, где `err.code` один из [Коды ошибок DNS]().

### `dnsPromises.resolve4(hostname[, options])`

<!-- YAML
added: v10.6.0
-->

- `hostname` {строка} Имя хоста для разрешения.
- `options` {Объект}
  - `ttl` {boolean} Получить значение времени жизни (TTL) каждой записи. Когда `true`, то `Promise` разрешается с помощью массива `{ address: '1.2.3.4', ttl: 60 }` объекты, а не массив строк, с TTL, выраженным в секундах.

Использует протокол DNS для разрешения адресов IPv4 (`A` записи) для `hostname`. В случае успеха `Promise` разрешается массивом адресов IPv4 (например, `['74.125.79.104', '74.125.79.105', '74.125.79.106']`).

### `dnsPromises.resolve6(hostname[, options])`

<!-- YAML
added: v10.6.0
-->

- `hostname` {строка} Имя хоста для разрешения.
- `options` {Объект}
  - `ttl` {boolean} Получить значение времени жизни (TTL) каждой записи. Когда `true`, то `Promise` разрешается с помощью массива `{ address: '0:1:2:3:4:5:6:7', ttl: 60 }` объекты, а не массив строк, с TTL, выраженным в секундах.

Использует протокол DNS для разрешения адресов IPv6 (`AAAA` записи) для `hostname`. В случае успеха `Promise` разрешается массивом адресов IPv6.

### `dnsPromises.resolveAny(hostname)`

<!-- YAML
added: v10.6.0
-->

- `hostname` {нить}

Использует протокол DNS для разрешения всех записей (также известный как `ANY` или `*` запрос). В случае успеха `Promise` разрешается массивом, содержащим различные типы записей. У каждого объекта есть свойство `type` что указывает на тип текущей записи. И в зависимости от `type`, на объекте будут присутствовать дополнительные свойства:

| Тип | Недвижимость | | ------ | ------------ | | `'A'` | `address`/`ttl` | | `'AAAA'` | `address`/`ttl` | | `'CNAME'` | `value` | | `'MX'` | Ссылаться на [`dnsPromises.resolveMx()`](#dnspromisesresolvemxhostname) | | `'NAPTR'` | Ссылаться на [`dnsPromises.resolveNaptr()`](#dnspromisesresolvenaptrhostname) | | `'NS'` | `value` | | `'PTR'` | `value` | | `'SOA'` | Ссылаться на [`dnsPromises.resolveSoa()`](#dnspromisesresolvesoahostname) | | `'SRV'` | Ссылаться на [`dnsPromises.resolveSrv()`](#dnspromisesresolvesrvhostname) | | `'TXT'` | Этот тип записи содержит свойство массива, называемое `entries` который относится к [`dnsPromises.resolveTxt()`](#dnspromisesresolvetxthostname), например `{ entries: ['...'], type: 'TXT' }` |

Вот пример объекта результата:

<!-- eslint-disable semi -->

```js
[
  { type: 'A', address: '127.0.0.1', ttl: 299 },
  { type: 'CNAME', value: 'example.com' },
  {
    type: 'MX',
    exchange: 'alt4.aspmx.l.example.com',
    priority: 50,
  },
  { type: 'NS', value: 'ns1.example.com' },
  {
    type: 'TXT',
    entries: ['v=spf1 include:_spf.example.com ~all'],
  },
  {
    type: 'SOA',
    nsname: 'ns1.example.com',
    hostmaster: 'admin.example.com',
    serial: 156696742,
    refresh: 900,
    retry: 900,
    expire: 1800,
    minttl: 60,
  },
];
```

### `dnsPromises.resolveCaa(hostname)`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

- `hostname` {нить}

Использует протокол DNS для разрешения `CAA` записи для `hostname`. В случае успеха `Promise` разрешается с помощью массива объектов, содержащих доступные записи авторизации центра сертификации, доступные для `hostname` (например. `[{critical: 0, iodef: 'mailto:pki@example.com'},{critical: 128, issue: 'pki.example.com'}]`).

### `dnsPromises.resolveCname(hostname)`

<!-- YAML
added: v10.6.0
-->

- `hostname` {нить}

Использует протокол DNS для разрешения `CNAME` записи для `hostname`. В случае успеха `Promise` разрешается массивом записей канонических имен, доступных для `hostname` (например. `['bar.example.com']`).

### `dnsPromises.resolveMx(hostname)`

<!-- YAML
added: v10.6.0
-->

- `hostname` {нить}

Использует протокол DNS для разрешения записей почтового обмена (`MX` записи) для `hostname`. В случае успеха `Promise` разрешается массивом объектов, содержащим как `priority` а также `exchange` собственность (например, `[{priority: 10, exchange: 'mx.example.com'}, ...]`).

### `dnsPromises.resolveNaptr(hostname)`

<!-- YAML
added: v10.6.0
-->

- `hostname` {нить}

Использует протокол DNS для разрешения записей на основе регулярных выражений (`NAPTR` записи) для `hostname`. В случае успеха `Promise` разрешается массивом объектов со следующими свойствами:

- `flags`
- `service`
- `regexp`
- `replacement`
- `order`
- `preference`

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

- `hostname` {нить}

Использует протокол DNS для разрешения записей сервера имен (`NS` записи) для `hostname`. В случае успеха `Promise` разрешается с помощью массива записей сервера имен, доступных для `hostname` (например. `['ns1.example.com', 'ns2.example.com']`).

### `dnsPromises.resolvePtr(hostname)`

<!-- YAML
added: v10.6.0
-->

- `hostname` {нить}

Использует протокол DNS для разрешения записей указателей (`PTR` записи) для `hostname`. В случае успеха `Promise` разрешается массивом строк, содержащих записи ответа.

### `dnsPromises.resolveSoa(hostname)`

<!-- YAML
added: v10.6.0
-->

- `hostname` {нить}

Использует протокол DNS для разрешения начала авторитетной записи (`SOA` запись) для `hostname`. В случае успеха `Promise` разрешается объектом со следующими свойствами:

- `nsname`
- `hostmaster`
- `serial`
- `refresh`
- `retry`
- `expire`
- `minttl`

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

- `hostname` {нить}

Использует протокол DNS для разрешения служебных записей (`SRV` записи) для `hostname`. В случае успеха `Promise` разрешается массивом объектов со следующими свойствами:

- `priority`
- `weight`
- `port`
- `name`

<!-- eslint-skip -->

```js
{
  priority: 10,
  weight: 5,
  port: 21223,
  name: 'service.example.com'
}
```

### `dnsPromises.resolveTxt(hostname)`

<!-- YAML
added: v10.6.0
-->

- `hostname` {нить}

Использует протокол DNS для разрешения текстовых запросов (`TXT` записи) для `hostname`. В случае успеха `Promise` разрешается двумерным массивом текстовых записей, доступных для `hostname` (например. `[ ['v=spf1 ip4:0.0.0.0 ', '~all' ] ]`). Каждый подмассив содержит фрагменты TXT одной записи. В зависимости от варианта использования они могут быть объединены или рассматриваться отдельно.

### `dnsPromises.reverse(ip)`

<!-- YAML
added: v10.6.0
-->

- `ip` {нить}

Выполняет обратный DNS-запрос, который разрешает адрес IPv4 или IPv6 в массив имен узлов.

В случае ошибки `Promise` отклоняется с [`Error`](errors.md#class-error) объект, где `err.code` один из [Коды ошибок DNS]().

### `dnsPromises.setDefaultResultOrder(order)`

<!-- YAML
added:
  - v16.4.0
  - v14.18.0
-->

- `order` {строка} должна быть `'ipv4first'` или `'verbatim'`.

Установите значение по умолчанию `verbatim` в [`dns.lookup()`](#dnslookuphostname-options-callback) а также [`dnsPromises.lookup()`](#dnspromiseslookuphostname-options). Значение может быть:

- `ipv4first`: устанавливает по умолчанию `verbatim` `false`.
- `verbatim`: устанавливает по умолчанию `verbatim` `true`.

По умолчанию `ipv4first` а также [`dnsPromises.setDefaultResultOrder()`](#dnspromisessetdefaultresultorderorder) иметь более высокий приоритет, чем [`--dns-result-order`](cli.md#--dns-result-orderorder). Когда используешь [рабочие потоки](worker_threads.md), [`dnsPromises.setDefaultResultOrder()`](#dnspromisessetdefaultresultorderorder) из основного потока не повлияет на заказы DNS по умолчанию в воркерах.

### `dnsPromises.setServers(servers)`

<!-- YAML
added: v10.6.0
-->

- `servers` {string \[]} массив [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6) форматированные адреса

Устанавливает IP-адрес и порт серверов, которые будут использоваться при выполнении разрешения DNS. В `servers` аргумент - это массив [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6) форматированные адреса. Если это порт DNS по умолчанию IANA (53), его можно не указывать.

```js
dnsPromises.setServers([
  '4.4.4.4',
  '[2001:4860:4860::8888]',
  '4.4.4.4:1053',
  '[2001:4860:4860::8888]:1053',
]);
```

Если указан неверный адрес, будет выдана ошибка.

В `dnsPromises.setServers()` нельзя вызывать во время выполнения DNS-запроса.

Этот метод работает так же, как [resolve.conf](https://man7.org/linux/man-pages/man5/resolv.conf.5.html). То есть, если попытка разрешить с помощью первого предоставленного сервера приводит к `NOTFOUND` ошибка, `resolve()` метод будет _нет_ попытаться решить с последующими предоставленными серверами. Резервные DNS-серверы будут использоваться только в том случае, если истекло время ожидания более ранних из них или возникла другая ошибка.

## Коды ошибок

Каждый DNS-запрос может возвращать один из следующих кодов ошибки:

- `dns.NODATA`: DNS-сервер вернул ответ без данных.
- `dns.FORMERR`: Запрос утверждений DNS-сервера был искажен.
- `dns.SERVFAIL`: DNS-сервер вернул общий сбой.
- `dns.NOTFOUND`: Имя домена не найдено.
- `dns.NOTIMP`: DNS-сервер не выполняет запрошенную операцию.
- `dns.REFUSED`: DNS-сервер отклонил запрос.
- `dns.BADQUERY`: Неверный DNS-запрос.
- `dns.BADNAME`: Неверное имя хоста.
- `dns.BADFAMILY`: Неподдерживаемое семейство адресов.
- `dns.BADRESP`: Неверный ответ DNS.
- `dns.CONNREFUSED`: Не удалось связаться с DNS-серверами.
- `dns.TIMEOUT`: Тайм-аут при обращении к DNS-серверам.
- `dns.EOF`: Конец файла.
- `dns.FILE`: Ошибка чтения файла.
- `dns.NOMEM`: Недостаточно памяти.
- `dns.DESTRUCTION`: Канал уничтожается.
- `dns.BADSTR`: Неверно отформатированная строка.
- `dns.BADFLAGS`: Указаны недопустимые флаги.
- `dns.NONAME`: Данное имя хоста не является числовым.
- `dns.BADHINTS`: Указаны флаги недействительных подсказок.
- `dns.NOTINITIALIZED`: Инициализация библиотеки c-ares еще не выполнена.
- `dns.LOADIPHLPAPI`: Ошибка загрузки `iphlpapi.dll`.
- `dns.ADDRGETNETWORKPARAMS`: Не могли найти `GetNetworkParams` функция.
- `dns.CANCELLED`: DNS-запрос отменен.

## Соображения по реализации

Несмотря на то что [`dns.lookup()`](#dnslookuphostname-options-callback) и различные `dns.resolve*()/dns.reverse()` у функций одна и та же цель - связать сетевое имя с сетевым адресом (или наоборот), их поведение совершенно иное. Эти различия могут иметь тонкие, но существенные последствия для поведения программ Node.js.

### `dns.lookup()`

Под капотом, [`dns.lookup()`](#dnslookuphostname-options-callback) использует те же возможности операционной системы, что и большинство других программ. Например, [`dns.lookup()`](#dnslookuphostname-options-callback) почти всегда разрешает заданное имя так же, как `ping` команда. В большинстве POSIX-подобных операционных систем поведение [`dns.lookup()`](#dnslookuphostname-options-callback) Функцию можно изменить, изменив настройки в nsswitch.conf (5) и / или resolv.conf (5), но изменение этих файлов изменит поведение всех других программ, работающих в той же операционной системе.

Хотя призыв к `dns.lookup()` будет асинхронным с точки зрения JavaScript, он реализован как синхронный вызов getaddrinfo (3), который выполняется в пуле потоков libuv. Это может иметь неожиданные негативные последствия для производительности некоторых приложений, см. [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize) документация для получения дополнительной информации.

Различные сетевые API будут вызывать `dns.lookup()` внутренне, чтобы разрешить имена хостов. Если это проблема, рассмотрите возможность разрешения имени хоста на адрес, используя `dns.resolve()` и используя адрес вместо имени хоста. Кроме того, некоторые сетевые API (например, [`socket.connect()`](net.md#socketconnectoptions-connectlistener) а также [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback)) разрешить распознаватель по умолчанию, `dns.lookup()`, подлежит замене.

### `dns.resolve()`, `dns.resolve*()` а также `dns.reverse()`

Эти функции реализованы совершенно иначе, чем [`dns.lookup()`](#dnslookuphostname-options-callback). Они не используют getaddrinfo (3) и _всегда_ выполнить DNS-запрос в сети. Эта сетевая связь всегда выполняется асинхронно и не использует пул потоков libuv.

В результате эти функции не могут иметь такое же негативное влияние на другую обработку, которая происходит в пуле потоков libuv, который [`dns.lookup()`](#dnslookuphostname-options-callback) могу иметь.

Они не используют тот же набор файлов конфигурации, что [`dns.lookup()`](#dnslookuphostname-options-callback) использует. Например, _они не используют конфигурацию из `/etc/hosts`_.
