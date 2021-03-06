# Модуль dns

!!!success "Стабильность: 2 – Стабильно"

Модуль `dns` содержит функции, принадлежащие двум различным категориям:

1. Функции, которые используют возможности предустановленной операционной системы для выполнения разрешения имен, и которые не обязательно отвечают за связь с сетью. Эта категория состоит из одной функции: `dns.lookup()`. Разработчики, которые пытаются реализовать разрешение имен таким же способом, как в других приложениях на такой же операционной системе, должны использовать `dns.lookup()`.

Например, nodejs.org:

```js
const dns = require('dns');
dns.lookup('nodejs.org', (err, addresses, family) => {
  console.log('addresses:', addresses);
});
```

2. Функции, которые коннектятся к настоящему DNS-серверу для выполнения разрешения имен, что всегда используют подключение к сети для выполнения DNS-запросов. Эта категория состоит из всех функций модуля `dns`, кроме `dns.lookup()`. Эти функции не используют тот же набор конфигурационных файлов, который используется `dns.lookup()` (например, `/etc/hosts`). Разработчики, которые хотят использовать эти функции, не используют возможности предустановленной ОС для разрешения имем, вместо этого им нужно выполнять DNS-запросы всегда.

Ниже приведен пример, который разрешает nodejs.org, затем реверсирует разрешение IP адресов, которые возвращаются:

```js
const dns = require('dns');

dns.resolve4('nodejs.org', (err, addresses) => {
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

Могут быть некоторые слабые последствия при выборе одного или другого, поэтому стоит обратиться к Implementation considerations section (Раздел решений в реализации) для получения информации.

## dns.getServers()

```
dns.getServers()
```

Добавлено в v0.11.3

Возвращает массив, состоящий из строк IP адресов, которые используются для разрешения имен.

## dns.lookup()

```
dns.lookup(hostname[, options], callback)
```

Добавлено в v0.1.90

Разрешает имя хостинга (например, 'nodejs.org') в первой A (IPv4) или AAAA (IPv6). `options` могут быть объектом или целым числом. Если `options` нет, тогда оба адреса IPv4 и IPv6 являются валидными. Если `options` – целое число, то значения будут `4` или `6`.

В другом случае, `options` может быть объектом, имеющим такие свойства:

`family` `<Число>`
: Семейство записей. Если она есть, значение будет `4` или `6`. Если нет, принимаются оба адреса IPv4 и IPv6.

`hints` `<Число>`
: Если такой параметр есть, то он должен быть одним из поддерживаемых флагов `getaddrinfo`. Если `hints` нет, то флаги не передаются в `getaddrinfo`. Множественные флаги могут передаваться через `hints` с помощью применения логического ИЛИ к их значениям. См. "Поддерживаемые флаги `getaddrinfo`".

`all` `<Boolean>`
: Если значение `true`, обратный вызов возвращает все разрешенные адресса в массиве, в ином случае возвращается один адрес. По умолчанию имеет значение `false`.

Все свойства являются опциональными. Пример использования опций приведен ниже:

```js
{
  family: 4,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
  all: false
}
```

Функция `callback` имеет аргументы `(err, address, family)`. `address` является представлением адресов IPv4 или IPv6 в виде строки. `family` – целое число, либо `4`, либо `6`, и обозначает семейство `address` (не обязательно значение, первоначально переданное в `lookup`).

Если опция `all` имеет значение `true`, то аргументы меняются на `(err, addresses)`, где `addresses` является массивом объектов со свойствами `address` и `family`.

`err` является объектом `Error`, где `err.code` – код ошибки. Помните, что `err.code` имеет значение `ENOENT` не только когда имя хоста не существует, но также когда поиск неудачен в других случаях, как, например, не найдены доступные файловые дескрипторы.

`dns.lookup()` не обязательно должна что-то делать с протоколом DNS. Реализация использует возможности ОС, которые могут соотносить имена с адресами и наоборот. Эта реализация может оказывать слабые, но важные последствия на поведение любой программы Node.js. Поэтому стоит обратиться к разделу решений реализации перед использованием `dns.lookup()`.

### Поддерживаемые флаги getaddrinfo

Следующие флаги могут передаватся как подсказки в `dns.lookup()`.

`dns.ADDRCONFIG`
: Возвращаемые типы адресов определяются типами адресов, которые поддерживаются текущей системой. Например, адреса IPv4 возвращаются только если текущая система имеет хотя бы один сконфигурированный адрес IPv4. Замкнутые адреса не рассматриваются.

`dns.V4MAPPED`
: Если семейство IPv6 было определено, но не найдены адреса Ipv6, то возвращаются адреса IPv4, помеченные, как IPv6. Заметьте, что этот флаг не поддерживается на некоторых ОС (например, FreeBSD 10.1)

## dns.lookupService()

```
dns.lookupService(address, port, callback)
```

Добавлено в v0.11.14

Разрешает данный `address` и `port` в имя хоста и сервиса, используя предустановленную в ОС реализацию `getnameinfo`.

Если `address` не является валидным IP адресом, то выпадает ошибка `TypeError`. `port` будет переведен в число. Если порт не является легальным портом, выпадает ошибка `TypeError`.

Функция обратного вызова имеет аргументы `(err, hostname, service)`. Аргументы `hostname` и `service` являются строками (`'localhost'` и `'http'` соотствественно).

`err` является объектом `Error`, где `err.code` – код ошибки.

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

## dns.resolve()

```
dns.resolve(hostname[, rrtype], callback)
```

Добавлено в v0.1.27

Использует протокол DNS для разрешения имени хоста (например, 'nodejs.org') в массив типов записей, определенных `rrtype`.

Валидные значение для `rrtype`:

- `'A'` – адреса IPv4, по умолчанию
- `'AAAA'` – адреса IPv6
- `'MX'` – почтовые записи
- `'TXT'` – текстовые записи
- `'SRV'` – записи SRV
- `'PTR'` – записи PTR
- `'NS'` – записи имен сервера
- `'CNAME'` – записи каноничных имен
- `'SOA'` – старт авторитетной записи
- `'NAPTR'` – запись указателя на имя

Функция обратного вызова имеет аргументы `(err, addresses)`. При успешном запуске, `addresses` будет массивом, за исключением момента решения записи SOA, которая возвращает объект, структуризированный тем же способом, как объект, возвращенный методом `dns.resolveSoa()`. Тип каждой составляющей `addresses` определяется типом записи и описывается в документации для соответствующих методов поиска.

`err` является объектом `Error`, где `err.code` – один из кодов ошибок, перечисленных ниже.

## dns.resolve4()

```
dns.resolve4(hostname, callback)
```

Добавлено в v0.1.16

Использует протокол DNS для разрешения адресов IPv4 (записи A) для имени хоста. Аргумент `addresses`, который передается функции обратного вызова, будет содержать массив адресов IPv4 (например, `['74.125.79.104', '74.125.79.105', '74.125.79.106']`).

## dns.resolve6()

```
dns.resolve6(hostname, callback)
```

Добавлено в v0.1.16

Использует протокол DNS для разрешения адресов IPv6 (записи AAAA) для имени хоста. Аргумент `addresses`, который передается функции обратного вызова, будет содержать массив адресов IPv6.

## dns.resolveCname()

```
dns.resolveCname(hostname, callback)
```

Добавлено в v0.3.2

Использует протокол DNS для разрешения записей CNAME для имени хоста. Аргумент `addresses`, который передается функции обратного вызова, будет содержать массив записей каноничных имен, доступных `hostname` (например, `['bar.example.com']`).

## dns.resolveMx()

```
dns.resolveMx(hostname, callback)
```

Добавлено в v0.1.27

Использует протокол DNS для разрешения записей обмена сообщениями (MX). Аргумент `addresses`, который передается функции обратного вызова, будет содержать массив объектов, которые содержат свойства `priority` и `exchange` (например, `[{priority: 10, exchange: 'mx.example.com'}, ...]`).

## dns.resolveNaptr()

```
dns.resolveNaptr(hostname, callback)
```

Использует протокол DNS для разрешения записей на основе регулярных выражений NAPTR. Функция обратного вызова имеет аргументы `(err, addresses)`. Аргумент `addresses`, который передается функции обратного вызова, будет содержать массив объектов со следующими свойствами:

- `flags`
- `service`
- `regexp`
- `replacement`
- `order`
- `preference`

К примеру:

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

## dns.resolveNs()

```
dns.resolveNs(hostname, callback)
```

Добавлено в v0.1.90

Использует протокол DNS для разрешения записей серверных имен NS. Аргумент `addresses`, который передается функции обратного вызова, будет содержать массив записей серверных имен, доступных `hostname` (например, `['ns1.example.com', 'ns2.example.com']`)

## dns.resolvePtr()

```
dns.resolvePtr(hostname, callback)
```

Добавлено в v6.0.0

Использует протокол DNS для разрешения записей указателя (PTR) для `hostname`. Аргумент `addresses`, который передается функции обратного вызова, будет массивом строк, которые содержат ответные записи.

## dns.resolveSoa()

```
dns.resolveSoa(hostname, callback)
```

Добавлено в v0.11.10

Использует протокол DNS для разрешения старта авторитетной записи (SOA). Аргумент `addresses`, который передается функции обратного вызова, будет объектом со следующими свойствами:

- `nsname`
- `hostmaster`
- `serial`
- `refresh`
- `retry`
- `expire`
- `minttl`

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

## dns.resolveSrv()

```
dns.resolveSrv(hostname, callback)
```

Добавлено в v0.1.27

Использует протокол DNS для разрешения сервисных записей (SRV) для `hostname`. Аргумент `addresses`, который передается функции обратного вызова, будет массивом объектов со следующими свойствами:

- `priority`
- `weight`
- `port`
- `name`

```js
{
  priority: 10,
  weight: 5,
  port: 21223,
  name: 'service.example.com'
}
```

## dns.resolveTxt()

```
dns.resolveTxt(hostname, callback)
```

Добавлено в v0.1.27

Использует протокол DNS для разрешения текстовых запросов (TXT) для `hostname`. Аргумент `addresses`, который передается функции обратного вызова, является двумерным массивом текстовых записей, доступных `hostname` (например, `[ ['v=spf1 ip4:0.0.0.0 ', '~all' ] ]`). Каждый подмассив содержит TXT части одной записи. В зависимости от использования, эти части либо объединяются вместе, либо используются раздельно.

## dns.reverse()

```
dns.reverse(ip, callback)
```

Добавлено в v0.1.16

Выполняет реверсию запроса DNS, который разрешает адрес IPv4 либо IPv6 в массив имен хоста.

Функция обратного вызова имеет аргументы `(err, hostnames)`, где `hostnames` – это массив разрешенных имен хоста для данного `ip`.

`err` является объектом `Error`, где `err.code` – один из кодов ошибок DNS.

## dns.setServers()

```
dns.setServers(servers)
```

Добавлено в v0.11.3

Настраивает IP адреса серверов для использования при разрешении. Аргумент `servers` является массивом адресов IPv4 или IPv6.

Если адресу задан порт, он будет удален.

Если адрес не является валидным, то выпадает ошибка.

Метод `dns.setServers()` должен вызываться, когда запрос DNS находится в процессе.

## Коды ошибок

Каждый DNS-запрос может возвращать один из следующих кодов ошибок:

`dns.NODATA`
: возвращенный ответ DNS сервера без данных

`dns.FORMERR`
: сообщение от DNS сервера: формат запроса не определен

`dns.SERVFAIL`
: общая ошибка DNS сервера

`dns.NOTFOUND`
: имя домена не найдено

`dns.NOTIMP`
: DNS сервер не может реализовать запрошенную операцию

`dns.REFUSED`
: отказанный запрос DNS сервера

`dns.BADQUERY`
: ошибочный формат запроса DNS

`dns.BADNAME`
: ошибочный формат имени хоста

`dns.BADFAMILY`
: неподдерживаемое семейство адресов

`dns.BADRESP`
: ошибочный формат ответа DNS

`dns.CONNREFUSED`
: нет контакта с DNS серверами

`dns.TIMEOUT`
: Вышло время подсоединения к серверу

`dns.EOF`
: конец файла

`dns.FILE`
: ошибка чтения файла

`dns.NOMEM`
: нет свободной памяти

`dns.DESTRUCTION`
: канал удаляется

`dns.BADSTR`
: ошибочный формат строки

`dns.BADFLAGS`
: заданы нелегальные флаги

`dns.NONAME`
: заданное имя хоста не является числом

`dns.BADHINT`
: нелегальные флаги подсказок

`dns.NOTINITIALIZED`
: инициализация библиотеки еще не выполнена

`dns.LOADIPHLPAPI`
: ошибка загрузки `iphlpapi.dll`

`dns.ADDRGETNETWORKPARAMS`
: нельзя найти функцию `GetNetworkParams`

`dns.CANCELLED`
: DNS-запрос отменен

## Решения реализации

Несмотря на то, что `dns.lookup()` и различные функции `dns.resolve()`, `dns.reverse()` имеют одинаковую цель: ассоциирование имени сети с адресом сети (или наоборот), их поведение различается. Эти различия могут оказывать слабые, но важные последствия на поведение программ Node.js.

### dns.lookup()

Если глянуть глубже, `dns.lookup()` использует те же самые возможности ОС, что и другие программы. например, `dns.lookup()` почти всегда разрешает данное имя тем же способом, что и команда `ping`. В большинстве ОС по типу POSIX поведение функции `dns.lookup()` может модифицироваться посредством изменения настроек `nsswitch.conf(5)` и/или `resolv.conf(5)`, но заметьте, что изменение этих файлов повлечет за собой изменения всех других програм, запущенных на той же ОС.

Хотя вызов `dns.lookup()` может быть асинхронным со стороны JavaScript, он реализован как синхронный вызов `getaddrinfo(3)`, который запускается на пуле потоков `libuv`. Так как пул потоков `libuv` имеет фиксированный размер, это означает, что если по какой-либо причине вызов `getaddrinfo(3)` длится долгое время, другие операции, которые могли быть запущены в пуле потоков `libuv` (такие, как операции файловой системы) столкнутся с пониженной производительностью. Для устранения этой проблемы можно увеличить размер пула потоков `libuv` посредством настройки значения переменной окружения `UV_THREADPOOL_SIZE` больше, чем `4` (текущее значение по умолчанию). См. документацию по `libuv`.

### dns.resolve(), dns.resolve() и dns.reverse()

Эти функции реализованы немного по-другому, чем `dns.lookup()`. Они не используют `getaddrinfo(3)` и всегда выполняют DNS-запрос по сети. Эта сетевая связь всегда реализована асинхронно, и не использует пул потоков `libuv`.

В результате, эти функции не могут иметь одинаковое негативное влияние на другие процессы, выполняемые в пуле потоков `libuv`, в отличие от `dns.lookup()`.

Они не используют одинаковые настройки конфигурационных файлов, в отличие от `dns.lookup()`. Например, эти функции не используют конфигурацию из `/etc/hosts`.
