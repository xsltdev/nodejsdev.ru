---
description: Модуль dns обеспечивает разрешение имен
---

# DNS

[:octicons-tag-24: v18.x.x](https://nodejs.org/dist/latest-v18.x/docs/api/dns.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:dns` обеспечивает разрешение имен. Например, используйте его для поиска IP-адресов имен хостов.

Хотя он назван в честь [Domain Name System (DNS)](https://en.wikipedia.org/wiki/Domain_Name_System), он не всегда использует протокол DNS для поиска. [`dns.lookup()`](#dnslookuphostname-options-callback) использует средства операционной системы для выполнения разрешения имен. Ему может не потребоваться сетевое взаимодействие. Чтобы выполнить разрешение имен так, как это делают другие приложения на той же системе, используйте [`dns.lookup()`](#dnslookuphostname-options-callback).

```js
const dns = require('node:dns');

dns.lookup('example.org', (err, address, family) => {
    console.log(
        'address: %j family: IPv%s',
        address,
        family
    );
});
// address: "93.184.216.34" family: IPv4
```

Все остальные функции модуля `node:dns` подключаются к реальному DNS-серверу для выполнения разрешения имен. Они всегда будут использовать сеть для выполнения DNS-запросов. Эти функции не используют тот же набор конфигурационных файлов, который используется [`dns.lookup()`](#dnslookuphostname-options-callback) (например, `/etc/hosts`). Используйте эти функции, чтобы всегда выполнять DNS-запросы, минуя другие средства разрешения имен.

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
            console.log(
                `reverse for ${a}: ${JSON.stringify(
                    hostnames
                )}`
            );
        });
    });
});
```

<!-- 0000.part.md -->

## Класс: `dns.Resolver`

Независимый резольвер для DNS-запросов.

При создании нового резолвера используются настройки серверов по умолчанию. Установка серверов, используемых для резолвера, с помощью [`resolver.setServers()`](#dnssetserversservers) не влияет на другие резолверы:

```js
const { Resolver } = require('node:dns');
const resolver = new Resolver();
resolver.setServers(['4.4.4.4']);

// Этот запрос будет использовать сервер по адресу 4.4.4.4, независимо от глобальных настроек.
resolver.resolve4('example.org', (err, addresses) => {
    // ...
});
```

Доступны следующие методы из модуля `node:dns`:

-   [`resolver.getServers()`](#dnsgetservers)
-   [`resolver.resolve()`](#dnsresolvehostname-rrtype-callback)
-   [`resolver.resolve4()`](#dnsresolve4hostname-options-callback)
-   [`resolver.resolve6()`](#dnsresolve6hostname-options-callback)
-   [`resolver.resolveAny()`](#dnsresolveanyhostname-callback)
-   [`resolver.resolveCaa()`](#dnsresolvecaahostname-callback)
-   [`resolver.resolveCname()`](#dnsresolvecnamehostname-callback)
-   [`resolver.resolveMx()`](#dnsresolvemxhostname-callback)
-   [`resolver.resolveNaptr()`](#dnsresolvenaptrhostname-callback)
-   [`resolver.resolveNs()`](#dnsresolvenshostname-callback)
-   [`resolver.resolvePtr()`](#dnsresolveptrhostname-callback)
-   [`resolver.resolveSoa()`](#dnsresolvesoahostname-callback)
-   [`resolver.resolveSrv()`](#dnsresolvesrvhostname-callback)
-   [`resolver.resolveTxt()`](#dnsresolvetxthostname-callback)
-   [`resolver.reverse()`](#dnsreverseip-callback)
-   [`resolver.setServers()`](#dnssetserversservers)

<!-- 0001.part.md -->

### `Resolver([options])`

Создайте новый резольвер.

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `timeout` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут запроса в миллисекундах, или `-1` для использования таймаута по умолчанию.
    -   `tries` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество попыток, которое преобразователь будет пытаться выполнить, связываясь с каждым сервером имен, прежде чем сдаться. **По умолчанию:** `4`.

<!-- 0002.part.md -->

### `resolver.cancel()`

Отменяет все невыполненные DNS-запросы, сделанные этим резольвером. Соответствующие обратные вызовы будут вызваны с ошибкой с кодом `ECANCELLED`.

<!-- 0003.part.md -->

### `resolver.setLocalAddress([ipv4][, ipv6])`

-   `ipv4` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковое представление адреса IPv4. **По умолчанию:** `0.0.0.0.0`.
-   `ipv6` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковое представление адреса IPv6. **По умолчанию:** `::0`.

Экземпляр резолвера будет посылать свои запросы с указанного IP-адреса. Это позволяет программам указывать исходящие интерфейсы при использовании на многохоумных системах.

Если адрес v4 или v6 не указан, он будет установлен по умолчанию, и операционная система автоматически выберет локальный адрес.

При запросах к DNS-серверам IPv4 преобразователь будет использовать локальный адрес v4, а при запросах к DNS-серверам IPv6 - локальный адрес v6. Тип `rrtype` запросов разрешения не влияет на используемый локальный адрес.

<!-- 0004.part.md -->

## `dns.getServers()`

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив строк IP-адресов, отформатированных в соответствии с [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6), которые в настоящее время настроены для разрешения DNS. Строка будет включать раздел порта, если используется пользовательский порт.

```js
[
    '4.4.4.4',
    '2001:4860:4860::8888',
    '4.4.4.4:1053',
    '[2001:4860:4860::8888]:1053',
];
```

<!-- 0005.part.md -->

## `dns.lookup(hostname[, options], callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` {integer | Object}
    -   `family` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Семейство записей. Должно быть `4`, `6` или `0`. По причинам обратной совместимости, `'IPv4'` и `'IPv6'` интерпретируются как `4` и `6` соответственно. Значение `0` указывает, что возвращаются адреса IPv4 и IPv6. **По умолчанию:** `0`.
    -   `hints` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Один или несколько поддерживаемых флагов `getaddrinfo`. Несколько флагов могут быть переданы путем побитового `OR` их значений.
    -   `all` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, обратный вызов возвращает все разрешенные адреса в массиве. В противном случае возвращается один адрес. **По умолчанию:** `false`.
    -   `verbatim` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, обратный вызов получает адреса IPv4 и IPv6 в том порядке, в котором их вернул DNS-резольвер. При `false` адреса IPv4 размещаются перед адресами IPv6. **По умолчанию:** `true` (адреса не переупорядочиваются). Значение по умолчанию настраивается с помощью [`dns.setDefaultResultOrder()`](#dnssetdefaultresultorderorder) или [`--dns-result-order`](cli.md#--dns-result-orderorder).
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковое представление адреса IPv4 или IPv6.
    -   `family` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `4` или `6`, обозначающие семейство `адреса`, или `0`, если адрес не является адресом IPv4 или IPv6. `0` является вероятным индикатором ошибки в службе разрешения имен, используемой операционной системой.

Разрешает имя хоста (например, `'nodejs.org'`) в первую найденную запись A (IPv4) или AAAA (IPv6). Все свойства `option` являются необязательными. Если `options` - целое число, то оно должно быть `4` или `6` - если `options` равно `0` или не указано, то возвращаются оба адреса IPv4 и IPv6, если они найдены.

Если опция `all` установлена в `true`, аргументы для `callback` изменяются на `(err, addresses)`, причем `addresses` является массивом объектов со свойствами `address` и `family`.

При ошибке, `err` - это объект [`Error`](errors.md#class-error), где `err.code` - это код ошибки. Следует помнить, что `err.code` будет установлен в `'ENOTFOUND'` не только тогда, когда имя хоста не существует, но и когда поиск не удался по другим причинам, таким как отсутствие доступных дескрипторов файлов.

Функция `dns.lookup()` не обязательно имеет отношение к протоколу DNS. Реализация использует средства операционной системы, которые могут связывать имена с адресами и наоборот. Эта реализация может иметь тонкие, но важные последствия для поведения любой программы Node.js.

Пример использования:

```js
const dns = require('node:dns');
const options = {
    family: 6,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
};
dns.lookup('example.com', options, (err, address, family) =>
    console.log(
        'address: %j family: IPv%s',
        address,
        family
    )
);
// address: "2606:2800:220:1:248:1893:25c8:1946" family: IPv6

// When options.all is true, the result will be an Array.
options.all = true;
dns.lookup('example.com', options, (err, addresses) =>
    console.log('addresses: %j', addresses)
);
// addresses: [{"address":"2606:2800:220:1:248:1893:25c8:1946","family":6}]
```

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed версия, и `all` не установлено в `true`, он возвращает `Promise` для `Object` со свойствами `address` и `family`.

<!-- 0006.part.md -->

### Поддерживаемые флаги getaddrinfo

Следующие флаги могут быть переданы в качестве подсказок в [`dns.lookup()`](#dnslookuphostname-options-callback).

-   `dns.ADDRCONFIG`: Ограничивает возвращаемые типы адресов типами непетлевых адресов, настроенных в системе. Например, адреса IPv4 возвращаются только в том случае, если в текущей системе настроен хотя бы один адрес IPv4.
-   `dns.V4MAPPED`: Если было указано семейство IPv6, но IPv6-адреса не были найдены, то возвращаются IPv4-маппированные IPv6-адреса. Не поддерживается в некоторых операционных системах (например, FreeBSD 10.1).
-   `dns.ALL`: Если указано `dns.V4MAPPED`, то возвращаются разрешенные IPv6-адреса, а также IPv4-маппированные IPv6-адреса.

<!-- 0007.part.md -->

## `dns.lookupService(address, port, callback)`

-   `адрес` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `порт` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` {ошибка}
    -   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) например, `example.com`
    -   `сервис` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), например `http`.

Разрешает заданные `address` и `port` в имя хоста и сервис, используя базовую реализацию операционной системы `getnameinfo`.

Если `address` не является действительным IP-адресом, будет выдана ошибка `TypeError`. Порт `port` будет приведен к числу. Если это не законный порт, будет выдана ошибка `TypeError`.

При ошибке, `err` - это объект [`Error`](errors.md#class-error), где `err.code` - код ошибки.

```js
const dns = require('node:dns');
dns.lookupService(
    '127.0.0.1',
    22,
    (err, hostname, service) => {
        console.log(hostname, service);
        // Опечатка: localhost ssh
    }
);
```

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed версия, он возвращает `Promise` для `Object` со свойствами `hostname` и `Service`.

<!-- 0008.part.md -->

## `dns.resolve(hostname[, rrtype], callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
-   `rrtype` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип записи ресурса. **По умолчанию:** `'A'`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `records` {string\[\] | Object\[\] | Object}

Использует протокол DNS для преобразования имени хоста (например, `'nodejs.org'`) в массив записей ресурсов. Функция `callback` имеет аргументы `(err, records)`. В случае успеха `records` будет представлять собой массив записей ресурсов. Тип и структура отдельных результатов зависит от `rrtype`:

| `rrtype` | `records` содержит | Тип результата | Метод сокращения | . |
| --- | --- | --- | --- | --- |
| `'A'` | IPv4-адреса (по умолчанию) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dns.resolve4()`](#dnsresolve4hostname-options-callback) |
| `'AAAA'` | IPv6-адреса | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dns.resolve6()`](#dnsresolve6hostname-options-callback) |  |
| `'ANY'` | любые записи | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dns.resolveAny()`](#dnsresolveanyhostname-callback) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) |
| `'CAA'` | записи авторизации CA | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dns.resolveCaa()`](#dnsresolvecaahostname-callback) |
| `'CNAME'` | записи канонических имен | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dns.resolveCname()`](#dnsresolvecnamehostname-callback) |
| `'MX'` | записи почтового обмена | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dns.resolveMx()`](#dnsresolvemxhostname-callback) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) |
| `'NAPTR'` | записи указателей полномочий на имя | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dns.resolveNaptr()`](#dnsresolvenaptrhostname-callback) |
| `'NS'` | записи сервера имен | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dns.resolveNs()`](#dnsresolvenshostname-callback) |
| `'PTR'` | записи указателей | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dns.resolvePtr()`](#dnsresolveptrhostname-callback) |
| `'SOA'` | начало авторитетных записей | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dns.resolveSoa()`](#dnsresolvesoahostname-callback) |
| `'SRV'` | служебные записи | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dns.resolveSrv()`](#dnsresolvesrvhostname-callback) |
| `'TXT'` | текстовые записи | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dns.resolveTxt()`](#dnsresolvetxthostname-callback) |

При ошибке, `err` - это объект [`Error`](errors.md#class-error), где `err.code` - один из кодов ошибок DNS.

<!-- 0009.part.md -->

## `dns.resolve4(hostname[, options], callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `ttl` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Извлекает значение времени жизни (TTL) каждой записи. Если `true`, обратный вызов получает массив `{адрес: '1.2.3.4', ttl: 60 }` объектов, а не массив строк, с TTL, выраженным в секундах.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `addresses` {string\[\] | Object\[\]}

Использует протокол DNS для разрешения адресов IPv4 (записи `A`) для имени `hostname`. Аргумент `addresses`, передаваемый в функцию `callback`, будет содержать массив IPv4-адресов (например, `['74.125.79.104', '74.125.79.105', '74.125.79.106']`).

<!-- 0010.part.md -->

## `dns.resolve6(hostname[, options], callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `ttl` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Получение значения времени жизни (TTL) каждой записи. Если `true`, обратный вызов получает массив `{ address: '0:1:2:3:4:5:6:7', ttl: 60 }` объектов, а не массив строк, с TTL, выраженным в секундах.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `addresses` {string\[\] | Object\[\]}

Использует протокол DNS для разрешения адресов IPv6 (записи `AAAA`) для имени `hostname`. Аргумент `addresses`, передаваемый в функцию `callback`, будет содержать массив IPv6-адресов.

<!-- 0011.part.md -->

## `dns.resolveAny(hostname, callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `ret` {Объект\[\]}

Использует протокол DNS для разрешения всех записей (также известный как `ANY` или `*` запрос). Аргумент `ret`, передаваемый в функцию `callback`, будет массивом, содержащим различные типы записей. Каждый объект имеет свойство `type`, которое указывает на тип текущей записи. В зависимости от `type` у объекта будут присутствовать дополнительные свойства:

| Type | Properties |
| --- | --- |
| `'A'` | `address`/`ttl` |
| `'AAAA' |  | `address`/`ttl` |
| ``CNAME'` | `value`. |
| `'MX'` | См. [`dns.resolveMx()`](#dnsresolvemxhostname-callback) |
|  | `'NAPTR'` | Обратитесь к [`dns.resolveNaptr()`](#dnsresolvenaptrhostname-callback) |  |
| `'NS'` | `значение` |
|  | `'PTR'` | `value` |
| `'SOA'` | См. [`dns.resolveSoa()`](#dnsresolvesoahostname-callback) |  | `'SOA'` | См. |
|  | `'SRV'` | Обратитесь к [`dns.resolveSrv()`](#dnsresolvesrvhostname-callback) |  |
|  | `'TXT'` | Этот тип записи содержит свойство массива `entries`, которое ссылается на [`dns.resolveTxt()`](#dnsresolvetxthostname-callback), например, `{ entries: ['...'], type: 'TXT' }` |

Вот пример объекта `ret`, передаваемого обратному вызову:

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

Операторы DNS-серверов могут не отвечать на `ANY` запросы. Возможно, лучше вызывать отдельные методы, такие как [`dns.resolve4()`](#dnsresolve4hostname-options-callback), [`dns.resolveMx()`](#dnsresolvemxhostname-callback) и так далее. Более подробно см. в [RFC 8482](https://tools.ietf.org/html/rfc8482).

<!-- 0012.part.md -->

## `dns.resolveCname(hostname, callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `addresses` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения записей `CNAME` для имени `hostname`. Аргумент `addresses`, передаваемый в функцию `callback`, будет содержать массив канонических записей имен, доступных для `имени хоста` (например, `['bar.example.com']`).

<!-- 0013.part.md -->

## `dns.resolveCaa(hostname, callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `records` {Object\[\]}

Использует протокол DNS для разрешения записей `CAA` для имени `hostname`. Аргумент `addresses`, передаваемый функции `callback`, будет содержать массив записей авторизации центра сертификации, доступных для имени `hostname` (например, `[{critical: 0, iodef: 'mailto:pki@example.com'}, {critical: 128, issue: 'pki.example.com'}]`).

<!-- 0014.part.md -->

## `dns.resolveMx(hostname, callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `addresses` {Object\[\]}

Использует протокол DNS для разрешения записей почтового обмена (`MX` записей) для имени `hostname`. Аргумент `addresses`, передаваемый в функцию `callback`, будет содержать массив объектов, содержащих свойства `приоритет` и `обмен` (например, `[{приоритет: 10, обмен: 'mx.example.com'}, ...]`).

<!-- 0015.part.md -->

## `dns.resolveNaptr(hostname, callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `addresses` {Object\[\]}

Использует протокол DNS для разрешения записей на основе регулярных выражений (`NAPTR` записей) для имени `hostname`. Аргумент `addresses`, передаваемый в функцию `callback`, будет содержать массив объектов со следующими свойствами:

-   `flags`
-   `service`
-   `regexp`
-   `replacement`
-   `order`
-   `preference`

<!-- end list -->

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

<!-- 0016.part.md -->

## `dns.resolveNs(hostname, callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `addresses` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения записей сервера имен (`NS` записей) для имени `hostname`. Аргумент `addresses`, передаваемый в функцию `callback`, будет содержать массив записей сервера имен, доступных для `hostname` (например, `['ns1.example.com', 'ns2.example.com']`).

<!-- 0017.part.md -->

## `dns.resolvePtr(hostname, callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `addresses` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения записей указателей (`PTR` записей) для имени `hostname`. Аргумент `addresses`, передаваемый функции `callback`, будет представлять собой массив строк, содержащих ответные записи.

<!-- 0018.part.md -->

## `dns.resolveSoa(hostname, callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `address` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Использует протокол DNS для разрешения записи начала полномочий (`SOA` запись) для `имени хоста`. Аргумент `address`, передаваемый в функцию `callback`, будет объектом со следующими свойствами:

-   `nsname`
-   `hostmaster`
-   `serial`
-   `refresh`
-   `retry`
-   `expire`
-   `minttl`

<!-- end list -->

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

<!-- 0019.part.md -->

## `dns.resolveSrv(hostname, callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `addresses` {Object\[\]}

Использует протокол DNS для разрешения служебных записей (`SRV` записей) для имени `hostname`. Аргумент `addresses`, передаваемый в функцию `callback`, будет представлять собой массив объектов со следующими свойствами:

-   `priority`
-   `weight`
-   `port`
-   `name`

<!-- end list -->

```js
{
  priority: 10,
  weight: 5,
  port: 21223,
  name: 'service.example.com'
}
```

<!-- 0020.part.md -->

## `dns.resolveTxt(hostname, callback)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `records` \<string\[\]\[\]\>

Использует протокол DNS для разрешения текстовых запросов (`TXT` записей) для `имени хоста`. Аргумент `records`, передаваемый функции `callback`, представляет собой двумерный массив текстовых записей, доступных для `hostname` (например, `[ ['v=spf1 ip4:0.0.0.0 ', '~all' ]`). Каждый подмассив содержит TXT-фрагменты одной записи. В зависимости от случая использования, они могут быть либо объединены вместе, либо рассматриваться отдельно.

<!-- 0021.part.md -->

## `dns.reverse(ip, callback)`

-   `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `hostnames` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Выполняет обратный DNS запрос, который разрешает IPv4 или IPv6 адрес в массив имен хостов.

При ошибке `err` является объектом [`Error`](errors.md#class-error), где `err.code` является одним из кодов ошибок DNS.

<!-- 0022.part.md -->

## `dns.setDefaultResultOrder(order)`

-   `order` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) должен быть `'ipv4first'` или `'verbatim'`.

Установите значение по умолчанию `verbatim` в [`dns.lookup()`](#dnslookuphostname-options-callback) и [`dnsPromises.lookup()`](#dnspromiseslookuphostname-options). Значение может быть следующим:

-   `ipv4first`: устанавливает по умолчанию `verbatim` `false`.
-   `verbatim`: устанавливает значение по умолчанию `verbatim` `true`.

По умолчанию `verbatim` и [`dns.setDefaultResultOrder()`](#dnssetdefaultresultorderorder) имеют более высокий приоритет, чем [`--dns-result-order`](cli.md#--dns-result-orderorder). При использовании [рабочих потоков](worker_threads.md), [`dns.setDefaultResultOrder()`](#dnssetdefaultresultorderorder) из главного потока не влияет на стандартные dns-заказы в рабочих.

<!-- 0023.part.md -->

## `dns.setServers(servers)`

-   `servers` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) массив адресов в формате [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6)

Устанавливает IP-адрес и порт серверов, которые будут использоваться при выполнении разрешения DNS. Аргумент `servers` представляет собой массив адресов в формате [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6). Если порт является портом DNS по умолчанию IANA (53), его можно опустить.

```js
dns.setServers([
    '4.4.4.4',
    '[2001:4860:4860::8888]',
    '4.4.4.4:1053',
    '[2001:4860:4860::8888]:1053',
]);
```

Если указан неверный адрес, будет выдана ошибка.

Метод `dns.setServers()` не должен вызываться во время выполнения DNS-запроса.

Метод [`dns.setServers()`](#dnssetserversservers) влияет только на [`dns.resolve()`](#dnsresolvehostname-rrtype-callback), `dns.resolve*()` и [`dns.reverse()`](#dnsreverseip-callback) (и конкретно _не_ [`dns.lookup()`](#dnslookuphostname-options-callback)).

Этот метод работает аналогично [resolve.conf](https://man7.org/linux/man-pages/man5/resolv.conf.5.html). То есть, если попытка разрешения с первым указанным сервером приводит к ошибке `NOTFOUND`, метод `resolve()` не будет _не_ пытаться разрешить с последующими указанными серверами. Резервные DNS-серверы будут использоваться только в том случае, если предыдущие серверы завершатся по времени или приведут к какой-либо другой ошибке.

<!-- 0024.part.md -->

## DNS promises API

API `dns.promises` предоставляет альтернативный набор асинхронных методов DNS, которые возвращают объекты `Promise`, а не используют обратные вызовы. API доступен через `require('node:dns').promises` или `require('node:dns/promises')`.

<!-- 0025.part.md -->

### Класс: `dnsPromises.Resolver`

Независимый резольвер для DNS-запросов.

При создании нового резолвера используются настройки серверов по умолчанию. Установка серверов, используемых для резолвера, с помощью [`resolver.setServers()`](#dnspromisessetserversservers) не влияет на другие резолверы:

```js
const { Resolver } = require('node:dns').promises;
const resolver = new Resolver();
resolver.setServers(['4.4.4.4']);

// Этот запрос будет использовать сервер по адресу 4.4.4.4, независимо от глобальных настроек.
resolver.resolve4('example.org').then((addresses) => {
    // ...
});

// Альтернативно, тот же код можно написать, используя стиль async-await.
(async function () {
    const addresses = await resolver.resolve4(
        'example.org'
    );
})();
```

Доступны следующие методы из API `dnsPromises`:

-   [`resolver.getServers()`](#dnspromisesgetservers)
-   [`resolver.resolve()`](#dnspromisesresolvehostname-rrtype)
-   [`resolver.resolve4()`](#dnspromisesresolve4hostname-options)
-   [`resolver.resolve6()`](#dnspromisesresolve6hostname-options)
-   [`resolver.resolveAny()`](#dnspromisesresolveanyhostname)
-   [`resolver.resolveCaa()`](#dnspromisesresolvecaahostname)
-   [`resolver.resolveCname()`](#dnspromisesresolvecnamehostname)
-   [`resolver.resolveMx()`](#dnspromisesresolvemxhostname)
-   [`resolver.resolveNaptr()`](#dnspromisesresolvenaptrhostname)
-   [`resolver.resolveNs()`](#dnspromisesresolvenshostname)
-   [`resolver.resolvePtr()`](#dnspromisesresolveptrhostname)
-   [`resolver.resolveSoa()`](#dnspromisesresolvesoahostname)
-   [`resolver.resolveSrv()`](#dnspromisesresolvesrvhostname)
-   [`resolver.resolveTxt()`](#dnspromisesresolvetxthostname)
-   [`resolver.reverse()`](#dnspromisesreverseip)
-   [`resolver.setServers()`](#dnspromisessetserversservers)

<!-- 0026.part.md -->

### `resolver.cancel()`

Отменяет все невыполненные DNS-запросы, сделанные этим резольвером. Соответствующие обещания будут отклонены с ошибкой с кодом `ECANCELLED`.

<!-- 0027.part.md -->

### `dnsPromises.getServers()`

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив строк IP-адресов, отформатированных в соответствии с [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6), которые в настоящее время настроены для разрешения DNS. Строка будет включать раздел порта, если используется пользовательский порт.

```js
[
    '4.4.4.4',
    '2001:4860:4860::8888',
    '4.4.4.4:1053',
    '[2001:4860:4860::8888]:1053',
];
```

<!-- 0028.part.md -->

### `dnsPromises.lookup(hostname[, options])`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` {integer | Object}
    -   `family` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Семейство записей. Должно быть `4`, `6` или `0`. Значение `0` указывает, что возвращаются адреса IPv4 и IPv6. **По умолчанию:** `0`.
    -   `hints` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Один или несколько поддерживаемых флагов `getaddrinfo`. Несколько флагов могут быть переданы путем побитового `OR` их значений.
    -   `all` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, то `Promise` разрешается со всеми адресами в массиве. В противном случае возвращается один адрес. **По умолчанию:** `false`.
    -   `verbatim` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Когда `true`, `Promise` разрешается с адресами IPv4 и IPv6 в том порядке, в котором их вернул преобразователь DNS. Когда `false`, адреса IPv4 размещаются перед адресами IPv6. **По умолчанию:** в настоящее время `false` (адреса переупорядочиваются), но ожидается, что в ближайшем будущем это изменится. Значение по умолчанию настраивается с помощью [`dns.setDefaultResultOrder()`](#dnssetdefaultresultorderorder) или [`--dns-result-order`](cli.md#--dns-result-orderorder). В новом коде следует использовать `{ verbatim: true }`.

Разрешает имя хоста (например, `'nodejs.org'`) в первую найденную запись A (IPv4) или AAAA (IPv6). Все свойства `option` являются необязательными. Если `options` является целым числом, то оно должно быть `4` или `6` - если `options` не указано, то возвращаются оба адреса IPv4 и IPv6, если они найдены.

Если опция `all` установлена в `true`, то `Promise` разрешается с `addresses`, являющимся массивом объектов со свойствами `address` и `family`.

При ошибке `Promise` отклоняется с объектом [`Error`](errors.md#class-error), где `err.code` - код ошибки. Следует помнить, что `err.code` будет установлен в `'ENOTFOUND'` не только когда имя хоста не существует, но и когда поиск не удается выполнить другими способами, например, нет доступных дескрипторов файлов.

`dnsPromises.lookup()` не обязательно имеет отношение к протоколу DNS. Реализация использует средства операционной системы, которые могут связывать имена с адресами и наоборот. Эта реализация может иметь тонкие, но важные последствия для поведения любой программы Node.js.

Пример использования:

```js
const dns = require('node:dns');
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

<!-- 0029.part.md -->

### `dnsPromises.lookupService(address, port)`

-   `адрес` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `порт` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Разрешает заданные `address` и `port` в имя хоста и сервис, используя реализацию `getnameinfo` операционной системы.

Если `address` не является действительным IP-адресом, будет выдана ошибка `TypeError`. Порт `port` будет приведен к числу. Если это не законный порт, будет выдана ошибка `TypeError`.

При ошибке, `Promise` отклоняется с объектом [`Error`](errors.md#class-error), где `err.code` - код ошибки.

```js
const dnsPromises = require('node:dns').promises;
dnsPromises
    .lookupService('127.0.0.1', 22)
    .then((result) => {
        console.log(result.hostname, result.service);
        // Опечатка: localhost ssh
    });
```

<!-- 0030.part.md -->

### `dnsPromises.resolve(hostname[, rrtype])`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
-   `rrtype` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип записи ресурса. **По умолчанию:** `A`.

Использует протокол DNS для преобразования имени хоста (например, `'nodejs.org'`) в массив записей ресурсов. В случае успеха `Promise` разрешается в массив записей ресурсов. Тип и структура отдельных результатов зависят от `rrtype`:

| `rrtype` | `records` contains | Result type | Shorthand method |
| --- | --- | --- | --- |
| `'A'` | IPv4-адреса (по умолчанию) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dnsPromises.resolve4()`](#dnspromisesresolve4hostname-options) |
| `'AAAA'` | IPv6-адреса | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dnsPromises.resolve6()`](#dnspromisesresolve6hostname-options) |  |
| `'ANY'` | любые записи | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dnsPromises.resolveAny()`](#dnspromisesresolveanyhostname) |  |
| `'CAA'` | записи авторизации CA | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dnsPromises.resolveCaa()`](#dnspromisesresolvecaahostname) |  |
| `'CNAME'` | записи канонических имен | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dnsPromises.resolveCname()`](#dnspromisesresolvecnamehostname) |  |
| `'MX'` | записи почтового обмена | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dnsPromises.resolveMx()`](#dnspromisesresolvemxhostname) |  |
| `'NAPTR'` | записи указателей полномочий на имя | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dnsPromises.resolveNaptr()`](#dnspromisesresolvenaptrhostname) |  |
| `'NS'` | записи сервера имен | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dnsPromises.resolveNs()`](#dnspromisesresolvenshostname) |  |
| `'PTR'` | записи указателей | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dnsPromises.resolvePtr()`](#dnspromisesresolveptrhostname) |  |
| `'SOA'` | начало авторитетных записей | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dnsPromises.resolveSoa()`](#dnspromisesresolvesoahostname) |  |
| `'SRV'` | служебные записи | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`dnsPromises.resolveSrv()`](#dnspromisesresolvesrvhostname) |  |
| `'TXT'` | текстовые записи | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`dnsPromises.resolveTxt()`](#dnspromisesresolvetxthostname) |

При ошибке `Promise` отклоняется с объектом [`Error`](errors.md#class-error), где `err.code` - один из кодов ошибок DNS.

<!-- 0031.part.md -->

### `dnsPromises.resolve4(hostname[, options])`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `ttl` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Получение значения времени жизни (TTL) каждой записи. Если `true`, то `Promise` разрешается с массивом `{адрес: '1.2.3.4', ttl: 60 }` объектов, а не массивом строк, с TTL, выраженным в секундах.

Использует протокол DNS для разрешения адресов IPv4 (записи `A`) для имени `hostname`. В случае успеха `Promise` преобразуется в массив IPv4-адресов (например, `['74.125.79.104', '74.125.79.105', '74.125.79.106']`).

<!-- 0032.part.md -->

### `dnsPromises.resolve6(hostname[, options])`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для разрешения.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `ttl` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Получение значения времени жизни (TTL) каждой записи. Если `true`, то `Promise` разрешается с массивом `{ address: '0:1:2:3:4:5:6:7', ttl: 60 }` объектов, а не массива строк, с TTL, выраженным в секундах.

Использует протокол DNS для разрешения адресов IPv6 (записи `AAAA`) для имени `hostname`. В случае успеха `Promise` преобразуется в массив IPv6-адресов.

<!-- 0033.part.md -->

### `dnsPromises.resolveAny(hostname)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения всех записей (также известный как `ANY` или `*` запрос). В случае успеха, `Promise` разрешается с массивом, содержащим различные типы записей. Каждый объект имеет свойство `type`, которое указывает на тип текущей записи. В зависимости от `type` у объекта будут присутствовать дополнительные свойства:

| Type | Properties |
| --- | --- |
| `'A'` | `address`/`ttl` |
| `'AAAA' |  | `address`/`ttl` |
| ``CNAME'` | `value`. |
| `'MX'` | См. [`dnsPromises.resolveMx()`](#dnspromisesresolvemxhostname) |  |
| `'NAPTR'` | Обратитесь к [`dnsPromises.resolveNaptr()`](#dnspromisesresolvenaptrhostname) |  |
| `'NS'` | `значение` |
| `'PTR'` | `value` |
| `'SOA'` | См. [`dnsPromises.resolveSoa()`](#dnspromisesresolvesoahostname) |  | `'SOA'` | См. |
|  | `'SRV'` | Обратитесь к [`dnsPromises.resolveSrv()`](#dnspromisesresolvesrvhostname) |  |
| `'TXT'` | Этот тип записи содержит свойство массива `entries`, которое ссылается на [`dnsPromises.resolveTxt()`](#dnspromisesresolvetxthostname), например `{ entries: ['...'], type: 'TXT' }` |

Вот пример объекта результата:

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

<!-- 0034.part.md -->

### `dnsPromises.resolveCaa(hostname)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения записей `CAA` для имени `hostname`. При успехе `Promise` разрешается с массивом объектов, содержащих доступные записи авторизации центра сертификации, доступные для `имени хоста` (например, `[{критический: 0, iodef: 'mailto:pki@example.com'},{критический: 128, issue: 'pki.example.com'}]`).

<!-- 0035.part.md -->

### `dnsPromises.resolveCname(hostname)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения записей `CNAME` для имени `hostname`. В случае успеха `Promise` разрешается с массивом канонических записей имен, доступных для `имени хоста` (например, `['bar.example.com']`).

<!-- 0036.part.md -->

### `dnsPromises.resolveMx(hostname)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения записей почтового обмена (`MX` записей) для `имени хоста`. В случае успеха, `Promise` разрешается с массивом объектов, содержащих свойства `приоритет` и `обмен` (например, `[{приоритет: 10, обмен: 'mx.example.com'}, ...]`).

<!-- 0037.part.md -->

### `dnsPromises.resolveNaptr(hostname)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения записей на основе регулярных выражений (`NAPTR` записей) для `hostname`. В случае успеха, `Promise` разрешается с массивом объектов со следующими свойствами:

-   `flags`
-   `service`
-   `regexp`
-   `replacement`
-   `order`
-   `preference`

<!-- end list -->

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

<!-- 0038.part.md -->

### `dnsPromises.resolveNs(hostname)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения записей сервера имен (`NS` записей) для `имени хоста`. В случае успеха `Promise` разрешается с массивом записей сервера имен, доступных для `hostname` (например, `['ns1.example.com', 'ns2.example.com']`).

<!-- 0039.part.md -->

### `dnsPromises.resolvePtr(hostname)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения записей указателей (`PTR` записей) для `имени хоста`. В случае успеха `Promise` разрешается с массивом строк, содержащих ответные записи.

<!-- 0040.part.md -->

### `dnsPromises.resolveSoa(hostname)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения записи начала полномочий (`SOA` запись) для `hostname`. В случае успеха `Promise` разрешается объект со следующими свойствами:

-   `nsname`
-   `hostmaster`
-   `serial`
-   `refresh`
-   `retry`
-   `expire`
-   `minttl`

<!-- end list -->

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

<!-- 0041.part.md -->

### `dnsPromises.resolveSrv(hostname)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения служебных записей (`SRV` записей) для `hostname`. В случае успеха `Promise` разрешается с массивом объектов со следующими свойствами:

-   `priority`
-   `weight`
-   `port`
-   `name`

<!-- end list -->

```js
{
  priority: 10,
  weight: 5,
  port: 21223,
  name: 'service.example.com'
}
```

<!-- 0042.part.md -->

### `dnsPromises.resolveTxt(hostname)`

-   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Использует протокол DNS для разрешения текстовых запросов (записей `TXT`) для имени `hostname`. В случае успеха `Promise` разрешается двумерный массив текстовых записей, доступных для `hostname` (например, `[ ['v=spf1 ip4:0.0.0.0 ', '~all' ]`). Каждый подмассив содержит TXT-фрагменты одной записи. В зависимости от случая использования, они могут быть либо объединены вместе, либо рассматриваться отдельно.

<!-- 0043.part.md -->

### `dnsPromises.reverse(ip)`

-   `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Выполняет обратный DNS-запрос, который разрешает адрес IPv4 или IPv6 в массив имен хостов.

При ошибке `Promise` отклоняется с объектом [`Error`](errors.md#class-error), где `err.code` - один из кодов ошибок DNS.

<!-- 0044.part.md -->

### `dnsPromises.setDefaultResultOrder(order)`

-   `order` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) должен быть `'ipv4first'` или `'verbatim'`.

Установите значение по умолчанию `verbatim` в [`dns.lookup()`](#dnslookuphostname-options-callback) и [`dnsPromises.lookup()`](#dnspromiseslookuphostname-options). Значение может быть следующим:

-   `ipv4first`: устанавливает по умолчанию `verbatim` `false`.
-   `verbatim`: устанавливает значение по умолчанию `verbatim` `true`.

По умолчанию `verbatim` и [`dnsPromises.setDefaultResultOrder()`](#dnspromisessetdefaultresultorderorder) имеют более высокий приоритет, чем [`--dns-result-order`](cli.md#--dns-result-orderorder). При использовании [рабочих потоков](worker_threads.md), [`dnsPromises.setDefaultResultOrder()`](#dnspromisessetdefaultresultorderorder) из главного потока не влияет на стандартные dns-заказы в рабочих.

<!-- 0045.part.md -->

### `dnsPromises.setServers(servers)`

-   `servers` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) массив адресов в формате [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6)

Устанавливает IP-адрес и порт серверов, которые будут использоваться при выполнении разрешения DNS. Аргумент `servers` представляет собой массив адресов в формате [RFC 5952](https://tools.ietf.org/html/rfc5952#section-6). Если порт является портом DNS по умолчанию IANA (53), его можно опустить.

```js
dnsPromises.setServers([
    '4.4.4.4',
    '[2001:4860:4860::8888]',
    '4.4.4.4:1053',
    '[2001:4860:4860::8888]:1053',
]);
```

Если указан неверный адрес, будет выдана ошибка.

Метод `dnsPromises.setServers()` не должен вызываться во время выполнения DNS-запроса.

Этот метод работает аналогично [resolve.conf](https://man7.org/linux/man-pages/man5/resolv.conf.5.html). То есть, если попытка разрешить запрос с помощью первого указанного сервера приводит к ошибке `NOTFOUND`, метод `resolve()` не будет _не_ пытаться разрешить запрос с помощью последующих указанных серверов. Резервные DNS-серверы будут использоваться только в том случае, если предыдущие серверы завершатся по времени или приведут к какой-либо другой ошибке.

<!-- 0046.part.md -->

## Коды ошибок

Каждый запрос DNS может вернуть один из следующих кодов ошибок:

-   `dns.NODATA`: DNS-сервер вернул ответ без данных.
-   `dns.FORMERR`: DNS-сервер утверждает, что запрос был неправильно отформатирован.
-   `dns.SERVFAIL`: DNS-сервер вернул общий отказ.
-   `dns.NOTFOUND`: Доменное имя не найдено.
-   `dns.NOTIMP`: DNS-сервер не выполняет запрошенную операцию.
-   `dns.REFUSED`: DNS-сервер отклонил запрос.
-   `dns.BADQUERY`: Неправильно отформатированный DNS-запрос.
-   `dns.BADNAME`: Неправильное форматирование имени хоста.
-   `dns.BADFAMILY`: Неподдерживаемое семейство адресов.
-   `dns.BADRESP`: Неправильное форматирование ответа DNS.
-   `dns.CONNREFUSED`: Не удалось связаться с DNS-серверами.
-   `dns.TIMEOUT`: Таймаут при обращении к DNS-серверам.
-   `dns.EOF`: Конец файла.
-   `dns.FILE`: Ошибка чтения файла.
-   `dns.NOMEM`: Закончилась память.
-   `dns.DESTRUCTION`: Канал уничтожается.
-   `dns.BADSTR`: Неправильно отформатированная строка.
-   `dns.BADFLAGS`: Указаны нелегальные флаги.
-   `dns.NONAME`: Заданное имя хоста не является числовым.
-   `dns.BADHINTS`: Указаны недопустимые флаги подсказок.
-   `dns.NOTINITIALIZED`: инициализация библиотеки c-ares еще не выполнена.
-   `dns.LOADIPHLPAPI`: Ошибка при загрузке `iphlpapi.dll`.
-   `dns.ADDRGETNETWORKPARAMS`: Не удалось найти функцию `GetNetworkParams`.
-   `dns.CANCELLED`: DNS-запрос отменен.

API `dnsPromises` также экспортирует вышеуказанные коды ошибок, например, `dnsPromises.NODATA`.

<!-- 0047.part.md -->

## Соображения по реализации

Хотя [`dns.lookup()`](#dnslookuphostname-options-callback) и различные функции `dns.resolve*()/dns.reverse()` имеют одну и ту же цель - связать сетевое имя с сетевым адресом (или наоборот), их поведение совершенно различно. Эти различия могут иметь тонкие, но значительные последствия для поведения программ Node.js.

<!-- 0048.part.md -->

### `dns.lookup()`

Под капотом [`dns.lookup()`](#dnslookuphostname-options-callback) использует те же средства операционной системы, что и большинство других программ. Например, [`dns.lookup()`](#dnslookuphostname-options-callback) почти всегда разрешает заданное имя так же, как и команда `ping`. В большинстве POSIX-подобных операционных систем поведение функции [`dns.lookup()`](#dnslookuphostname-options-callback) может быть изменено путем изменения настроек в nsswitch.conf(5) и/или resolv.conf(5), но изменение этих файлов изменит поведение всех других программ, работающих в той же операционной системе.

Хотя вызов `dns.lookup()` будет асинхронным с точки зрения JavaScript, он реализован как синхронный вызов getaddrinfo(3), который выполняется в пуле потоков libuv. Это может иметь неожиданные негативные последствия для производительности некоторых приложений, см. документацию [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize) для получения дополнительной информации.

Различные сетевые API будут вызывать `dns.lookup()` для разрешения имен хостов. Если это является проблемой, рассмотрите возможность преобразования имени хоста в адрес с помощью `dns.resolve()` и использования адреса вместо имени хоста. Кроме того, некоторые сетевые API (например, [`socket.connect()`](net.md#socketconnectoptions-connectlistener) и [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback)) позволяют заменить резольвер по умолчанию, `dns.lookup()`, на другой.

<!-- 0049.part.md -->

### `dns.resolve()`, `dns.resolve*()` и `dns.reverse()`

Эти функции реализованы совершенно иначе, чем [`dns.lookup()`](#dnslookuphostname-options-callback). Они не используют getaddrinfo(3) и _всегда_ выполняют DNS-запрос по сети. Это сетевое взаимодействие всегда выполняется асинхронно и не использует пул потоков libuv.

В результате, эти функции не могут оказать такого же негативного влияния на другие процессы, происходящие в пуле потоков libuv, как [`dns.lookup()`](#dnslookuphostname-options-callback).

Они не используют тот же набор конфигурационных файлов, что и [`dns.lookup()`](#dnslookuphostname-options-callback). Например, они не используют конфигурацию из `/etc/hosts`.

<!-- 0050.part.md -->

