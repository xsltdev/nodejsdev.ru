---
title: QUIC
description: Экспериментальный модуль node:quic — протокол QUIC, сессии, потоки и параметры транспорта
---

# QUIC

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/quic.html)





!!!warning "Стабильность: 1 – Экспериментальная"

    `1.0` — ранняя разработка. Возможность ещё не завершена и может существенно измениться. Эта возможность не подпадает под правила семантического версионирования.



Модуль `node:quic` реализует протокол QUIC.
Чтобы им пользоваться, запустите Node.js с опцией `--experimental-quic`:

=== "MJS"

    ```js
    import quic from 'node:quic';
    ```

=== "CJS"

    ```js
    const quic = require('node:quic');
    ```

Модуль доступен только в схеме `node:`.

## `quic.connect(address[, options])`



* `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<net.SocketAddress>`](net.md)
* `options` [`<quic.SessionOptions>`](quic.md)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис с [quic.QuicSession](quic.md)

Инициирует новую клиентскую сессию.

=== "MJS"

    ```js
    import { connect } from 'node:quic';
    import { Buffer } from 'node:buffer';
    
    const enc = new TextEncoder();
    const alpn = 'foo';
    const client = await connect('123.123.123.123:8888', { alpn });
    await client.createUnidirectionalStream({
      body: enc.encode('hello world'),
    });
    ```

По умолчанию каждый вызов `connect(...)` создаёт новый локальный
экземпляр `QuicEndpoint`, привязанный к новому случайному локальному IP-порту. Чтобы
задать точный локальный адрес или мультиплексировать несколько
сессий QUIC через один локальный порт, передайте опцию `endpoint`
со значением `QuicEndpoint` или `EndpointOptions`.

=== "MJS"

    ```js
    import { QuicEndpoint, connect } from 'node:quic';
    
    const endpoint = new QuicEndpoint({
      address: '127.0.0.1:1234',
    });
    
    const client = await connect('123.123.123.123:8888', { endpoint });
    ```

## `quic.listen(onsession,[options])`



* `onsession` [`<quic.OnSessionCallback>`](quic.md)
* `options` [`<quic.SessionOptions>`](quic.md)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис с [quic.QuicEndpoint](quic.md)

Настраивает endpoint на прослушивание как сервер. Когда удалённый пир
инициирует новую сессию, вызывается переданный callback `onsession` с созданной
сессией.

=== "MJS"

    ```js
    import { listen } from 'node:quic';
    
    const endpoint = await listen((session) => {
      // ... обработка сессии
    });
    
    // Закрытие endpoint позволяет завершить уже открытые на момент close
    // сессии естественным образом и не принимать новые.
    // Когда все сессии завершатся, endpoint будет уничтожен.
    // Вызов возвращает промис, который выполнится после уничтожения endpoint.
    await endpoint.close();
    ```

По умолчанию каждый вызов `listen(...)` создаёт новый локальный
`QuicEndpoint`, привязанный к новому случайному локальному IP-порту. Чтобы
задать точный локальный адрес или мультиплексировать несколько
сессий QUIC через один локальный порт, передайте опцию `endpoint`
со значением `QuicEndpoint` или `EndpointOptions`.

Один `QuicEndpoint` можно настроить на прослушивание как сервер
не более одного раза.

## Класс: `QuicEndpoint`

`QuicEndpoint` инкапсулирует локальную привязку UDP-порта для QUIC. Может использоваться
и как клиент, и как сервер.

### `new QuicEndpoint([options])`



* `options` [`<quic.EndpointOptions>`](quic.md)

### `endpoint.address`



* Тип: [`<net.SocketAddress>`](net.md) | undefined

Локальный UDP-адрес сокета, к которому привязан endpoint, если есть.

Если endpoint сейчас не привязан, значение будет `undefined`. Только для чтения.

### `endpoint.busy`



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `endpoint.busy` равен `true`, endpoint временно отклоняет
создание новых сессий. Чтение и запись.

=== "MJS"

    ```js
    // Пометить endpoint занятым — новые сессии не принимаются
    endpoint.busy = true;
    
    // Снять занятость — новые сессии снова разрешены
    endpoint.busy = false;
    ```

Свойство `busy` полезно при высокой нагрузке на endpoint, когда нужно
временно отклонять новые сессии, пока он не разгрузится.

### `endpoint.close()`



* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Корректно закрывает endpoint. Endpoint закроется и уничтожится, когда
закроются все текущие сессии. После вызова новые сессии отклоняются.

Возвращает промис, выполняющийся после уничтожения endpoint.

### `endpoint.closed`



* Тип: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Промис, выполняющийся после уничтожения endpoint. Это тот же промис, что возвращает
`endpoint.close()`. Только для чтения.

### `endpoint.closing`



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если вызван `endpoint.close()` и закрытие endpoint ещё не завершилось.
Только для чтения.

### `endpoint.destroy([error])`



* `error` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Принудительно закрывает endpoint, немедленно закрывая все открытые сессии.

### `endpoint.destroyed`



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если вызван `endpoint.destroy()`. Только для чтения.

### `endpoint.setSNIContexts(entries[, options])`



* `entries` [`<object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект «имя хоста — параметры TLS-идентичности».
  В каждой записи должны быть `keys` и `certs`.
* `options` [`<object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `replace` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, заменяет всю карту SNI. Если `false`
    (по умолчанию), объединяет записи с существующей картой.

Заменяет или обновляет TLS-контексты SNI для этого endpoint. Позволяет
менять TLS-идентичность (ключ/сертификат) для имён хостов
без перезапуска endpoint. Существующие сессии не затрагиваются — обновлённые контексты используют только
новые сессии.

=== "MJS"

    ```js
    endpoint.setSNIContexts({
      'api.example.com': { keys: [newApiKey], certs: [newApiCert] },
    });
    
    // Заменить всю карту SNI
    endpoint.setSNIContexts({
      'api.example.com': { keys: [newApiKey], certs: [newApiCert] },
    }, { replace: true });
    ```

### `endpoint.stats`



* Тип: [`<quic.QuicEndpoint.Stats>`](quic.md)

Статистика, собранная для активной сессии. Только для чтения.

### `endpoint[Symbol.asyncDispose]()`



Вызывает `endpoint.close()` и возвращает промис, выполняющийся после закрытия
endpoint.

## Класс: `QuicEndpoint.Stats`



Представление собранной статистики для endpoint.

### `endpointStats.createdAt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Метка времени создания endpoint. Только для чтения.

### `endpointStats.destroyedAt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Метка времени уничтожения endpoint. Только для чтения.

### `endpointStats.bytesReceived`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число байт, полученных этим endpoint. Только для чтения.

### `endpointStats.bytesSent`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число байт, отправленных этим endpoint. Только для чтения.

### `endpointStats.packetsReceived`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число успешно принятых этим endpoint QUIC-пакетов. Только для чтения.

### `endpointStats.packetsSent`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число успешно отправленных этим endpoint QUIC-пакетов. Только для чтения.

### `endpointStats.serverSessions`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число сессий, инициированных пиром и принятых этим endpoint. Только для чтения.

### `endpointStats.clientSessions`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число сессий, инициированных этим endpoint. Только для чтения.

### `endpointStats.serverBusyCount`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Сколько раз начальный пакет был отклонён из-за
  пометки endpoint как занятого. Только для чтения.

### `endpointStats.retryCount`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число попыток QUIC retry на этом endpoint. Только для чтения.

### `endpointStats.versionNegotiationCount`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число сессий, отклонённых из-за несовпадения версии QUIC. Только для чтения.

### `endpointStats.statelessResetCount`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число обработанных этим endpoint stateless reset. Только для чтения.

### `endpointStats.immediateCloseCount`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число сессий, закрытых до завершения рукопожатия. Только для чтения.

## Класс: `QuicSession`



`QuicSession` представляет локальную сторону QUIC-соединения.

### `session.close()`



* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Инициирует корректное закрытие сессии. Уже открытые потоки могут
завершиться, новые не открываются. Когда все потоки закроются,
сессия будет уничтожена. Промис выполнится после уничтожения сессии.

### `session.closed`



* Тип: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Промис, выполняющийся после уничтожения сессии.

### `session.destroy([error])`



* `error` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Немедленно уничтожает сессию. Все потоки уничтожаются,
сессия закрывается.

### `session.destroyed`



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если вызван `session.destroy()`. Только для чтения.

### `session.endpoint`



* Тип: [`<quic.QuicEndpoint>`](quic.md)

Конечная точка, создавшая эту сессию. Только для чтения.

### `session.onstream`



* Тип: [`<quic.OnStreamCallback>`](quic.md)

Вызывается при инициации нового потока удалённым пиром. Чтение и запись.

### `session.ondatagram`



* Тип: [`<quic.OnDatagramCallback>`](quic.md)

Вызывается при получении новой датаграммы от удалённого пира. Чтение и запись.

### `session.ondatagramstatus`



* Тип: [`<quic.OnDatagramStatusCallback>`](quic.md)

Вызывается при изменении статуса датаграммы. Чтение и запись.

### `session.onpathvalidation`



* Тип: [`<quic.OnPathValidationCallback>`](quic.md)

Вызывается при обновлении проверки пути. Чтение и запись.

### `session.onsessionticket`



* Тип: [`<quic.OnSessionTicketCallback>`](quic.md)

Вызывается при получении нового session ticket. Чтение и запись.

### `session.onversionnegotiation`



* Тип: [`<quic.OnVersionNegotiationCallback>`](quic.md)

Вызывается при начале согласования версии. Чтение и запись.

### `session.onhandshake`



* Тип: [`<quic.OnHandshakeCallback>`](quic.md)

Вызывается при завершении TLS-рукопожатия. Чтение и запись.

### `session.createBidirectionalStream([options])`



* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `body` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [`<Blob>`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
  * `sendOrder` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) с [quic.QuicStream](quic.md)

Открывает новый двунаправленный поток. Если опция `body` не указана,
исходящий поток будет полузакрыт.

### `session.createUnidirectionalStream([options])`



* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `body` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [`<Blob>`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
  * `sendOrder` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) с [quic.QuicStream](quic.md)

Открывает новый однонаправленный поток. Если опция `body` не указана,
исходящий поток будет закрыт.

### `session.path`



* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined
  * `local` [`<net.SocketAddress>`](net.md)
  * `remote` [`<net.SocketAddress>`](net.md)

Локальный и удалённый адреса сокета, связанные с сессией. Только для чтения.

### `session.sendDatagram(datagram)`



* `datagram` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
* Возвращает: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Отправляет ненадёжную датаграмму удалённому пиру, возвращая идентификатор датаграммы.
Если полезная нагрузка задана как `ArrayBufferView`, владение
этим представлением передаётся нижележащему потоку.

### `session.stats`



* Тип: [`<quic.QuicSession.Stats>`](quic.md)

Текущая статистика сессии. Только для чтения.

### `session.updateKey()`



Инициирует обновление ключа для сессии.

### `session[Symbol.asyncDispose]()`



Вызывает `session.close()` и возвращает промис, выполняющийся после закрытия сессии.

## Класс: `QuicSession.Stats`



### `sessionStats.createdAt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.closingAt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.handshakeCompletedAt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.handshakeConfirmedAt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.bytesReceived`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.bytesSent`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.bidiInStreamCount`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.bidiOutStreamCount`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.uniInStreamCount`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.uniOutStreamCount`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.maxBytesInFlights`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.bytesInFlight`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.blockCount`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.cwnd`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.latestRtt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.minRtt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.rttVar`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.smoothedRtt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.ssthresh`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.datagramsReceived`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.datagramsSent`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.datagramsAcknowledged`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.datagramsLost`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

## Класс: `QuicStream`



### `stream.closed`



* Тип: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Промис, выполняющийся после полного закрытия потока.

### `stream.destroy([error])`



* `error` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Немедленно и аварийно уничтожает поток.

### `stream.destroyed`



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если вызван `stream.destroy()`.

### `stream.direction`



* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из значений: `'bidi'` или `'uni'`.

Направленность потока. Только для чтения.

### `stream.id`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Идентификатор потока. Только для чтения.

### `stream.onblocked`



* Тип: [`<quic.OnBlockedCallback>`](quic.md)

Вызывается, когда поток заблокирован. Чтение и запись.

### `stream.onreset`



* Тип: [`<quic.OnStreamErrorCallback>`](quic.md)

Вызывается при сбросе потока. Чтение и запись.

### `stream.readable`



* Тип: [`<ReadableStream>`](webstreams.md#readablestream)

### `stream.session`



* Тип: [`<quic.QuicSession>`](quic.md)

Сессия, создавшая этот поток. Только для чтения.

### `stream.stats`



* Тип: [`<quic.QuicStream.Stats>`](quic.md)

Текущая статистика потока. Только для чтения.

## Класс: `QuicStream.Stats`



### `streamStats.ackedAt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.bytesReceived`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.bytesSent`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.createdAt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.destroyedAt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.finalSize`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.isConnected`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.maxOffset`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.maxOffsetAcknowledged`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.maxOffsetReceived`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.openedAt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.receivedAt`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

## Типы

### Тип: `EndpointOptions`



* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Параметры конфигурации endpoint, передаваемые при создании `QuicEndpoint`.

#### `endpointOptions.address`



* Тип: [`<net.SocketAddress>`](net.md) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Локальный UDP-адрес и порт для привязки endpoint.

Если не указано, endpoint привяжется к IPv4 `localhost` на случайном порту.

#### `endpointOptions.addressLRUSize`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Конечная точка хранит внутренний кэш проверенных адресов сокетов для
оптимизации. Эта опция задаёт максимальное число адресов в кэше.
Расширенная опция, обычно не требуется.

#### `endpointOptions.ipv6Only`



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

При `true` endpoint привязывается только к IPv6-адресам.

#### `endpointOptions.maxConnectionsPerHost`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное число одновременных сессий на один удалённый адрес пира.

#### `endpointOptions.maxConnectionsTotal`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное общее число одновременных сессий.

#### `endpointOptions.maxRetries`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное число попыток QUIC retry на один удалённый адрес пира.

#### `endpointOptions.maxStatelessResetsPerHost`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное число stateless reset на один удалённый адрес пира.

#### `endpointOptions.retryTokenExpiration`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Время, в течение которого считается действительным QUIC retry token.

#### `endpointOptions.resetTokenSecret`



* Тип: [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

16-байтовый секрет для генерации QUIC retry token.

#### `endpointOptions.tokenExpiration`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Время, в течение которого считается действительным QUIC token.

#### `endpointOptions.tokenSecret`



* Тип: [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

16-байтовый секрет для генерации QUIC token.

#### `endpointOptions.udpReceiveBufferSize`



* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `endpointOptions.udpSendBufferSize`



* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `endpointOptions.udpTTL`



* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `endpointOptions.validateAddress`



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

При `true` endpoint должен проверять адреса пиров через retry-пакеты
при установлении нового соединения.

### Тип: `SessionOptions`



#### `sessionOptions.alpn`



* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) (клиент) | [string[]](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) (сервер)

Идентификатор(ы) ALPN (согласование протокола прикладного уровня).

Для **клиентских** сессий — одна строка с желаемым протоколом
(например `'h3'`).

Для **серверных** сессий — массив имён протоколов в порядке предпочтения,
которые поддерживает сервер (например `['h3', 'h3-29']`). При TLS-рукопожатии
сервер выбирает первый протокол из своего списка, который поддерживает и клиент.

Согласованный ALPN определяет прикладную реализацию для сессии. Варианты `'h3'` и `'h3-*'` выбирают HTTP/3;
остальные значения — реализацию по умолчанию.

По умолчанию: `'h3'`

#### `sessionOptions.ca` (только клиент)



* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [`<ArrayBuffer[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

Сертификаты центра сертификации (CA) для клиентских сессий. Для серверных сертификаты CA
задаются по идентичности в карте [`sessionOptions.sni`](#sessionoptionssni-server-only).

#### `sessionOptions.cc`



* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Алгоритм контроля перегрузки; должен быть одним из `'reno'`, `'cubic'` или `'bbr'`.

Расширенная опция, обычно не требуется.

#### `sessionOptions.certs` (только клиент)



* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [`<ArrayBuffer[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

TLS-сертификаты для клиентских сессий. Для серверных сессий сертификаты
задаются по идентичности в [`sessionOptions.sni`](#sessionoptionssni-server-only).

#### `sessionOptions.ciphers`



* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список поддерживаемых шифров TLS 1.3.

#### `sessionOptions.crl` (только клиент)



* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [`<ArrayBuffer[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

Списки отзыва сертификатов (CRL) для клиентских сессий. Для серверных CRL задаются
по идентичности в [`sessionOptions.sni`](#sessionoptionssni-server-only).

#### `sessionOptions.groups`



* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список групп шифров TLS 1.3.

#### `sessionOptions.keylog`



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` — включить вывод TLS key logging.

#### `sessionOptions.keys` (только клиент)



Добавлено в: v23.8.0

* Тип: [`<KeyObject>`](#class-keyobject) | [`<KeyObject[]>`](#class-keyobject)

Криптографические ключи TLS для клиентских сессий. Для серверных ключи
задаются по идентичности в [`sessionOptions.sni`](#sessionoptionssni-server-only).

#### `sessionOptions.maxPayloadSize`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальный размер полезной нагрузки UDP-пакета.

#### `sessionOptions.maxStreamWindow`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальный размер окна управления потоком.

#### `sessionOptions.maxWindow`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальный размер окна управления сессией.

#### `sessionOptions.minVersion`



* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Минимально допустимый номер версии QUIC. Расширенная опция, обычно не требуется.

#### `sessionOptions.preferredAddressPolicy`



* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из `'use'`, `'ignore'` или `'default'`.

Если удалённый пир объявляет preferred address, опция задаёт,
использовать его или игнорировать.

#### `sessionOptions.qlog`



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` — включить вывод qlog.

#### `sessionOptions.sessionTicket`



* Тип: [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) Билет сессии для возобновления сессии 0-RTT.

#### `sessionOptions.handshakeTimeout`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное время в миллисекундах на TLS-рукопожатие до тайм-аута.

#### `sessionOptions.servername` (только клиент)



* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя сервера пира (SNI). По умолчанию `'localhost'`.

#### `sessionOptions.sni` (только сервер)



* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект «имя хоста — параметры TLS-идентичности» для поддержки указания
имени сервера (SNI). Обязателен для серверных сессий. Специальный ключ `'*'` задаёт
идентичность по умолчанию, если не подошло другое имя. В записи могут быть:

* `keys` [`<KeyObject>`](#class-keyobject) | [`<KeyObject[]>`](#class-keyobject) Закрытые ключи TLS. **Обязательно.**
* `certs` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [`<ArrayBuffer[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
  Сертификаты TLS. **Обязательно.**
* `ca` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [`<ArrayBuffer[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
  Необязательные переопределения CA.
* `crl` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [`<ArrayBuffer[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
  Необязательные списки отзыва сертификатов.
* `verifyPrivateKey` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Проверять закрытый ключ. По умолчанию: `false`.

=== "MJS"

    ```js
    const endpoint = await listen(callback, {
      sni: {
        '*': { keys: [defaultKey], certs: [defaultCert] },
        'api.example.com': { keys: [apiKey], certs: [apiCert] },
        'www.example.com': { keys: [wwwKey], certs: [wwwCert], ca: [customCA] },
      },
    });
    ```

Общие параметры TLS (`ciphers`, `groups`, `keylog`, `verifyClient` и др.)
задаются на верхнем уровне опций сессии и применяются ко всем
идентичностям. Каждая запись SNI переопределяет только поля сертификата.

Карту SNI можно заменить во время выполнения через `endpoint.setSNIContexts()`:
карта атомарно меняется для новых сессий, существующие продолжают использовать прежнюю идентичность.

#### `sessionOptions.tlsTrace`



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` — включить трассировку TLS.

#### `sessionOptions.transportParams`



* Тип: [`<quic.TransportParams>`](quic.md)

Параметры транспорта QUIC для сессии.

#### `sessionOptions.unacknowledgedPacketThreshold`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное число неподтверждённых пакетов, допустимое для сессии.

#### `sessionOptions.verifyClient`



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` — требовать проверку клиентского TLS-сертификата.

#### `sessionOptions.verifyPrivateKey` (только клиент)



* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` — требовать проверку закрытого ключа для клиентских сессий. Для серверных
эта опция задаётся по идентичности в
[`sessionOptions.sni`](#sessionoptionssni-server-only).

#### `sessionOptions.version`



* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Номер версии QUIC. Расширенная опция, обычно не требуется.

### Тип: `TransportParams`



#### `transportParams.preferredAddressIpv4`



* Тип: [`<net.SocketAddress>`](net.md) Предпочитаемый объявляемый IPv4-адрес.

#### `transportParams.preferredAddressIpv6`



* Тип: [`<net.SocketAddress>`](net.md) Предпочитаемый объявляемый IPv6-адрес.

#### `transportParams.initialMaxStreamDataBidiLocal`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.initialMaxStreamDataBidiRemote`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.initialMaxStreamDataUni`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.initialMaxData`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.initialMaxStreamsBidi`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.initialMaxStreamsUni`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.maxIdleTimeout`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.activeConnectionIDLimit`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.ackDelayExponent`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.maxAckDelay`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.maxDatagramFrameSize`



* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

## Обратные вызовы

### Callback: `OnSessionCallback`



* `this` [`<quic.QuicEndpoint>`](quic.md)
* `session` [`<quic.QuicSession>`](quic.md)

Вызывается при инициации новой сессии удалённым пиром.

### Callback: `OnStreamCallback`



* `this` [`<quic.QuicSession>`](quic.md)
* `stream` [`<quic.QuicStream>`](quic.md)

### Callback: `OnDatagramCallback`



* `this` [`<quic.QuicSession>`](quic.md)
* `datagram` [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
* `early` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

### Callback: `OnDatagramStatusCallback`



* `this` [`<quic.QuicSession>`](quic.md)
* `id` [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
* `status` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из значений: `'lost'` или `'acknowledged'`.

### Callback: `OnPathValidationCallback`



* `this` [`<quic.QuicSession>`](quic.md)
* `result` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из значений: `'success'`, `'failure'` или `'aborted'`.
* `newLocalAddress` [`<net.SocketAddress>`](net.md)
* `newRemoteAddress` [`<net.SocketAddress>`](net.md)
* `oldLocalAddress` [`<net.SocketAddress>`](net.md)
* `oldRemoteAddress` [`<net.SocketAddress>`](net.md)
* `preferredAddress` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

### Callback: `OnSessionTicketCallback`



* `this` [`<quic.QuicSession>`](quic.md)
* `ticket` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### Callback: `OnVersionNegotiationCallback`



* `this` [`<quic.QuicSession>`](quic.md)
* `version` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `requestedVersions` [`<number[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `supportedVersions` [`<number[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

### Callback: `OnHandshakeCallback`



* `this` [`<quic.QuicSession>`](quic.md)
* `sni` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `alpn` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `cipher` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `cipherVersion` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `validationErrorReason` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `validationErrorCode` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `earlyDataAccepted` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

### Callback: `OnBlockedCallback`



* `this` [`<quic.QuicStream>`](quic.md)

### Callback: `OnStreamErrorCallback`



* `this` [`<quic.QuicStream>`](quic.md)
* `error` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

## Диагностические каналы

### Channel: `quic.endpoint.created`



* `endpoint` [`<quic.QuicEndpoint>`](quic.md)
* `config` [`<quic.EndpointOptions>`](quic.md)

### Channel: `quic.endpoint.listen`



* `endpoint` [`<quic.QuicEndpoint>`](quic.md)
* `options` [`<quic.SessionOptions>`](quic.md)

### Channel: `quic.endpoint.closing`



* `endpoint` [`<quic.QuicEndpoint>`](quic.md)
* `hasPendingError` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

### Channel: `quic.endpoint.closed`



* `endpoint` [`<quic.QuicEndpoint>`](quic.md)

### Channel: `quic.endpoint.error`



* `endpoint` [`<quic.QuicEndpoint>`](quic.md)
* `error` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

### Channel: `quic.endpoint.busy.change`



* `endpoint` [`<quic.QuicEndpoint>`](quic.md)
* `busy` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

### Channel: `quic.session.created.client`



### Channel: `quic.session.created.server`



### Channel: `quic.session.open.stream`



### Channel: `quic.session.received.stream`



### Channel: `quic.session.send.datagram`



### Channel: `quic.session.update.key`



### Channel: `quic.session.closing`



### Channel: `quic.session.closed`



### Channel: `quic.session.receive.datagram`



### Channel: `quic.session.receive.datagram.status`



### Channel: `quic.session.path.validation`



### Channel: `quic.session.ticket`



### Channel: `quic.session.version.negotiation`



### Channel: `quic.session.handshake`



[`sessionOptions.sni`]: #sessionoptionssni-server-only
