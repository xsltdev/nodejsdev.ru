---
title: QUIC
description: Экспериментальный модуль node:quic — протокол QUIC, сессии, потоки и параметры транспорта
---

# QUIC

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/quic.html)

<!-- introduced_in=v23.8.0-->

<!-- YAML
added: v23.8.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    `1.0` — ранняя разработка. Возможность ещё не завершена и может существенно измениться. Эта возможность не подпадает под правила семантического версионирования.

<!-- source_link=lib/quic.js -->

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

<!-- YAML
added: v23.8.0
-->

* `address` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<net.SocketAddress>](net.md)
* `options` [<quic.SessionOptions>](quic.md)
* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис с [quic.QuicSession](quic.md)

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

<!-- YAML
added: v23.8.0
-->

* `onsession` {quic.OnSessionCallback}
* `options` [<quic.SessionOptions>](quic.md)
* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис с [quic.QuicEndpoint](quic.md)

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

<!-- YAML
added: v23.8.0
-->

* `options` [<quic.EndpointOptions>](quic.md)

### `endpoint.address`

<!-- YAML
added: v23.8.0
-->

* Тип: [<net.SocketAddress>](net.md) | undefined

Локальный UDP-адрес сокета, к которому привязан endpoint, если есть.

Если endpoint сейчас не привязан, значение будет `undefined`. Только для чтения.

### `endpoint.busy`

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

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

<!-- YAML
added: v23.8.0
-->

* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Корректно закрывает endpoint. Endpoint закроется и уничтожится, когда
закроются все текущие сессии. После вызова новые сессии отклоняются.

Возвращает промис, выполняющийся после уничтожения endpoint.

### `endpoint.closed`

<!-- YAML
added: v23.8.0
-->

* Тип: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Промис, выполняющийся после уничтожения endpoint. Это тот же промис, что возвращает
`endpoint.close()`. Только для чтения.

### `endpoint.closing`

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если вызван `endpoint.close()` и закрытие endpoint ещё не завершилось.
Только для чтения.

### `endpoint.destroy([error])`

<!-- YAML
added: v23.8.0
-->

* `error` {any}

Принудительно закрывает endpoint, немедленно закрывая все открытые сессии.

### `endpoint.destroyed`

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если вызван `endpoint.destroy()`. Только для чтения.

### `endpoint.setSNIContexts(entries[, options])`

<!-- YAML
added: REPLACEME
-->

* `entries` {object} Объект «имя хоста — параметры TLS-идентичности».
  В каждой записи должны быть `keys` и `certs`.
* `options` {object}
  * `replace` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, заменяет всю карту SNI. Если `false`
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

<!-- YAML
added: v23.8.0
-->

* Тип: [<quic.QuicEndpoint.Stats>](quic.md)

Статистика, собранная для активной сессии. Только для чтения.

### `endpoint[Symbol.asyncDispose]()`

<!-- YAML
added: v23.8.0
-->

Вызывает `endpoint.close()` и возвращает промис, выполняющийся после закрытия
endpoint.

## Класс: `QuicEndpoint.Stats`

<!-- YAML
added: v23.8.0
-->

Представление собранной статистики для endpoint.

### `endpointStats.createdAt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Метка времени создания endpoint. Только для чтения.

### `endpointStats.destroyedAt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Метка времени уничтожения endpoint. Только для чтения.

### `endpointStats.bytesReceived`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число байт, полученных этим endpoint. Только для чтения.

### `endpointStats.bytesSent`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число байт, отправленных этим endpoint. Только для чтения.

### `endpointStats.packetsReceived`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число успешно принятых этим endpoint QUIC-пакетов. Только для чтения.

### `endpointStats.packetsSent`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число успешно отправленных этим endpoint QUIC-пакетов. Только для чтения.

### `endpointStats.serverSessions`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число сессий, инициированных пиром и принятых этим endpoint. Только для чтения.

### `endpointStats.clientSessions`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число сессий, инициированных этим endpoint. Только для чтения.

### `endpointStats.serverBusyCount`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Сколько раз начальный пакет был отклонён из-за
  пометки endpoint как занятого. Только для чтения.

### `endpointStats.retryCount`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число попыток QUIC retry на этом endpoint. Только для чтения.

### `endpointStats.versionNegotiationCount`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число сессий, отклонённых из-за несовпадения версии QUIC. Только для чтения.

### `endpointStats.statelessResetCount`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число обработанных этим endpoint stateless reset. Только для чтения.

### `endpointStats.immediateCloseCount`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Общее число сессий, закрытых до завершения рукопожатия. Только для чтения.

## Класс: `QuicSession`

<!-- YAML
added: v23.8.0
-->

`QuicSession` представляет локальную сторону QUIC-соединения.

### `session.close()`

<!-- YAML
added: v23.8.0
-->

* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Инициирует корректное закрытие сессии. Уже открытые потоки могут
завершиться, новые не открываются. Когда все потоки закроются,
сессия будет уничтожена. Промис выполнится после уничтожения сессии.

### `session.closed`

<!-- YAML
added: v23.8.0
-->

* Тип: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Промис, выполняющийся после уничтожения сессии.

### `session.destroy([error])`

<!-- YAML
added: v23.8.0
-->

* `error` {any}

Немедленно уничтожает сессию. Все потоки уничтожаются,
сессия закрывается.

### `session.destroyed`

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если вызван `session.destroy()`. Только для чтения.

### `session.endpoint`

<!-- YAML
added: v23.8.0
-->

* Тип: [<quic.QuicEndpoint>](quic.md)

Endpoint, создавший эту сессию. Только для чтения.

### `session.onstream`

<!-- YAML
added: v23.8.0
-->

* Тип: {quic.OnStreamCallback}

Вызывается при инициации нового потока удалённым пиром. Чтение и запись.

### `session.ondatagram`

<!-- YAML
added: v23.8.0
-->

* Тип: {quic.OnDatagramCallback}

Вызывается при получении новой датаграммы от удалённого пира. Чтение и запись.

### `session.ondatagramstatus`

<!-- YAML
added: v23.8.0
-->

* Тип: {quic.OnDatagramStatusCallback}

Вызывается при изменении статуса датаграммы. Чтение и запись.

### `session.onpathvalidation`

<!-- YAML
added: v23.8.0
-->

* Тип: {quic.OnPathValidationCallback}

Вызывается при обновлении проверки пути. Чтение и запись.

### `session.onsessionticket`

<!-- YAML
added: v23.8.0
-->

* Тип: {quic.OnSessionTicketCallback}

Вызывается при получении нового session ticket. Чтение и запись.

### `session.onversionnegotiation`

<!-- YAML
added: v23.8.0
-->

* Тип: {quic.OnVersionNegotiationCallback}

Вызывается при начале согласования версии. Чтение и запись.

### `session.onhandshake`

<!-- YAML
added: v23.8.0
-->

* Тип: {quic.OnHandshakeCallback}

Вызывается при завершении TLS-рукопожатия. Чтение и запись.

### `session.createBidirectionalStream([options])`

<!-- YAML
added: v23.8.0
-->

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `body` [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [<Blob>](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
  * `sendOrder` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) с [quic.QuicStream](quic.md)

Открывает новый двунаправленный поток. Если опция `body` не указана,
исходящий поток будет полузакрыт.

### `session.createUnidirectionalStream([options])`

<!-- YAML
added: v23.8.0
-->

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `body` [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [<Blob>](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
  * `sendOrder` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) с [quic.QuicStream](quic.md)

Открывает новый однонаправленный поток. Если опция `body` не указана,
исходящий поток будет закрыт.

### `session.path`

<!-- YAML
added: v23.8.0
-->

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined
  * `local` [<net.SocketAddress>](net.md)
  * `remote` [<net.SocketAddress>](net.md)

Локальный и удалённый адреса сокета, связанные с сессией. Только для чтения.

### `session.sendDatagram(datagram)`

<!-- YAML
added: v23.8.0
-->

* `datagram` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
* Возвращает: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Отправляет ненадёжную датаграмму удалённому пиру, возвращая идентификатор датаграммы.
Если полезная нагрузка задана как `ArrayBufferView`, владение
этим представлением передаётся нижележащему потоку.

### `session.stats`

<!-- YAML
added: v23.8.0
-->

* Тип: [<quic.QuicSession.Stats>](quic.md)

Текущая статистика сессии. Только для чтения.

### `session.updateKey()`

<!-- YAML
added: v23.8.0
-->

Инициирует обновление ключа для сессии.

### `session[Symbol.asyncDispose]()`

<!-- YAML
added: v23.8.0
-->

Вызывает `session.close()` и возвращает промис, выполняющийся после закрытия сессии.

## Класс: `QuicSession.Stats`

<!-- YAML
added: v23.8.0
-->

### `sessionStats.createdAt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.closingAt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.handshakeCompletedAt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.handshakeConfirmedAt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.bytesReceived`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.bytesSent`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.bidiInStreamCount`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.bidiOutStreamCount`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.uniInStreamCount`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.uniOutStreamCount`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.maxBytesInFlights`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.bytesInFlight`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.blockCount`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.cwnd`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.latestRtt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.minRtt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.rttVar`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.smoothedRtt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.ssthresh`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.datagramsReceived`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.datagramsSent`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.datagramsAcknowledged`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `sessionStats.datagramsLost`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

## Класс: `QuicStream`

<!-- YAML
added: v23.8.0
-->

### `stream.closed`

<!-- YAML
added: v23.8.0
-->

* Тип: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Промис, выполняющийся после полного закрытия потока.

### `stream.destroy([error])`

<!-- YAML
added: v23.8.0
-->

* `error` {any}

Немедленно и аварийно уничтожает поток.

### `stream.destroyed`

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если вызван `stream.destroy()`.

### `stream.direction`

<!-- YAML
added: v23.8.0
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из значений: `'bidi'` или `'uni'`.

Направленность потока. Только для чтения.

### `stream.id`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Идентификатор потока. Только для чтения.

### `stream.onblocked`

<!-- YAML
added: v23.8.0
-->

* Тип: {quic.OnBlockedCallback}

Вызывается, когда поток заблокирован. Чтение и запись.

### `stream.onreset`

<!-- YAML
added: v23.8.0
-->

* Тип: {quic.OnStreamErrorCallback}

Вызывается при сбросе потока. Чтение и запись.

### `stream.readable`

<!-- YAML
added: v23.8.0
-->

* Тип: [<ReadableStream>](webstreams.md#readablestream)

### `stream.session`

<!-- YAML
added: v23.8.0
-->

* Тип: [<quic.QuicSession>](quic.md)

Сессия, создавшая этот поток. Только для чтения.

### `stream.stats`

<!-- YAML
added: v23.8.0
-->

* Тип: [<quic.QuicStream.Stats>](quic.md)

Текущая статистика потока. Только для чтения.

## Класс: `QuicStream.Stats`

<!-- YAML
added: v23.8.0
-->

### `streamStats.ackedAt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.bytesReceived`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.bytesSent`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.createdAt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.destroyedAt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.finalSize`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.isConnected`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.maxOffset`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.maxOffsetAcknowledged`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.maxOffsetReceived`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.openedAt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

### `streamStats.receivedAt`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

## Типы

### Type: `EndpointOptions`

<!-- YAML
added: v23.8.0
-->

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Параметры конфигурации endpoint, передаваемые при создании `QuicEndpoint`.

#### `endpointOptions.address`

<!-- YAML
added: v23.8.0
-->

* Тип: [<net.SocketAddress>](net.md) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Локальный UDP-адрес и порт для привязки endpoint.

Если не указано, endpoint привяжется к IPv4 `localhost` на случайном порту.

#### `endpointOptions.addressLRUSize`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Endpoint хранит внутренний кэш проверенных адресов сокетов для
оптимизации. Эта опция задаёт максимальное число адресов в кэше.
Расширенная опция, обычно не требуется.

#### `endpointOptions.ipv6Only`

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

При `true` endpoint привязывается только к IPv6-адресам.

#### `endpointOptions.maxConnectionsPerHost`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное число одновременных сессий на один удалённый адрес пира.

#### `endpointOptions.maxConnectionsTotal`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное общее число одновременных сессий.

#### `endpointOptions.maxRetries`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное число попыток QUIC retry на один удалённый адрес пира.

#### `endpointOptions.maxStatelessResetsPerHost`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное число stateless reset на один удалённый адрес пира.

#### `endpointOptions.retryTokenExpiration`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Время, в течение которого считается действительным QUIC retry token.

#### `endpointOptions.resetTokenSecret`

<!-- YAML
added: v23.8.0
-->

* Тип: [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

16-байтовый секрет для генерации QUIC retry token.

#### `endpointOptions.tokenExpiration`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Время, в течение которого считается действительным QUIC token.

#### `endpointOptions.tokenSecret`

<!-- YAML
added: v23.8.0
-->

* Тип: [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

16-байтовый секрет для генерации QUIC token.

#### `endpointOptions.udpReceiveBufferSize`

<!-- YAML
added: v23.8.0
-->

* Тип: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `endpointOptions.udpSendBufferSize`

<!-- YAML
added: v23.8.0
-->

* Тип: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `endpointOptions.udpTTL`

<!-- YAML
added: v23.8.0
-->

* Тип: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `endpointOptions.validateAddress`

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

При `true` endpoint должен проверять адреса пиров через retry-пакеты
при установлении нового соединения.

### Type: `SessionOptions`

<!-- YAML
added: v23.8.0
-->

#### `sessionOptions.alpn`

<!-- YAML
added: REPLACEME
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) (client) | [string[]](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) (server)

Идентификатор(ы) ALPN (Application-Layer Protocol Negotiation).

Для **клиентских** сессий — одна строка с желаемым протоколом
(например `'h3'`).

Для **серверных** сессий — массив имён протоколов в порядке предпочтения,
которые поддерживает сервер (например `['h3', 'h3-29']`). При TLS-рукопожатии
сервер выбирает первый протокол из своего списка, который поддерживает и клиент.

Согласованный ALPN определяет реализацию Application для сессии. Варианты `'h3'` и `'h3-*'` выбирают HTTP/3;
остальные значения — реализацию по умолчанию.

По умолчанию: `'h3'`

#### `sessionOptions.ca` (client only)

<!-- YAML
added: v23.8.0
-->

* Тип: [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [<ArrayBuffer[]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView[]>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

CA-сертификаты для клиентских сессий. Для серверных сертификаты CA
задаются по идентичности в карте [`sessionOptions.sni`][].

#### `sessionOptions.cc`

<!-- YAML
added: v23.8.0
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Алгоритм контроля перегрузки; должен быть одним из `'reno'`, `'cubic'` или `'bbr'`.

Расширенная опция, обычно не требуется.

#### `sessionOptions.certs` (client only)

<!-- YAML
added: v23.8.0
-->

* Тип: [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [<ArrayBuffer[]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView[]>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

TLS-сертификаты для клиентских сессий. Для серверных сертификаты
задаются по идентичности в [`sessionOptions.sni`][].

#### `sessionOptions.ciphers`

<!-- YAML
added: v23.8.0
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список поддерживаемых шифров TLS 1.3.

#### `sessionOptions.crl` (client only)

<!-- YAML
added: v23.8.0
-->

* Тип: [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [<ArrayBuffer[]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView[]>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

CRL для клиентских сессий. Для серверных CRL задаются
по идентичности в [`sessionOptions.sni`][].

#### `sessionOptions.groups`

<!-- YAML
added: v23.8.0
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список групп шифров TLS 1.3.

#### `sessionOptions.keylog`

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` — включить вывод TLS key logging.

#### `sessionOptions.keys` (client only)

<!-- YAML
added: v23.8.0
changes:
  - version: v25.9.0
    pr-url: https://github.com/nodejs/node/pull/62335
    description: CryptoKey is no longer accepted.
-->

Добавлено в: v23.8.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v25.9.0 | CryptoKey больше не принимается. |

* Тип: [<KeyObject>](#class-keyobject) | [<KeyObject[]>](#class-keyobject)

Криптографические ключи TLS для клиентских сессий. Для серверных ключи
задаются по идентичности в [`sessionOptions.sni`][].

#### `sessionOptions.maxPayloadSize`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальный размер полезной нагрузки UDP-пакета.

#### `sessionOptions.maxStreamWindow`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальный размер окна управления потоком.

#### `sessionOptions.maxWindow`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальный размер окна управления сессией.

#### `sessionOptions.minVersion`

<!-- YAML
added: v23.8.0
-->

* Тип: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Минимально допустимый номер версии QUIC. Расширенная опция, обычно не требуется.

#### `sessionOptions.preferredAddressPolicy`

<!-- YAML
added: v23.8.0
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из `'use'`, `'ignore'` или `'default'`.

Если удалённый пир объявляет preferred address, опция задаёт,
использовать его или игнорировать.

#### `sessionOptions.qlog`

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` — включить вывод qlog.

#### `sessionOptions.sessionTicket`

<!-- YAML
added: v23.8.0
-->

* Тип: [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) Session ticket для возобновления сессии 0-RTT.

#### `sessionOptions.handshakeTimeout`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное время в миллисекундах на TLS-рукопожатие до тайм-аута.

#### `sessionOptions.servername` (client only)

<!-- YAML
added: v23.8.0
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя сервера пира (SNI). По умолчанию `'localhost'`.

#### `sessionOptions.sni` (server only)

<!-- YAML
added: REPLACEME
-->

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект «имя хоста — параметры TLS-идентичности» для поддержки Server Name
Indication (SNI). Обязателен для серверных сессий. Специальный ключ `'*'` задаёт
идентичность по умолчанию, если не подошло другое имя. В записи могут быть:

* `keys` [<KeyObject>](#class-keyobject) | [<KeyObject[]>](#class-keyobject) Закрытые ключи TLS. **Обязательно.**
* `certs` [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [<ArrayBuffer[]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView[]>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
  Сертификаты TLS. **Обязательно.**
* `ca` [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [<ArrayBuffer[]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView[]>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
  Необязательные переопределения CA.
* `crl` [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) | [<ArrayBuffer[]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<ArrayBufferView[]>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
  Необязательные списки отзыва сертификатов.
* `verifyPrivateKey` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Проверять закрытый ключ. По умолчанию: `false`.

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

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` — включить трассировку TLS.

#### `sessionOptions.transportParams`

<!-- YAML
added: v23.8.0
-->

* Тип: [<quic.TransportParams>](quic.md)

Параметры транспорта QUIC для сессии.

#### `sessionOptions.unacknowledgedPacketThreshold`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальное число неподтверждённых пакетов, допустимое для сессии.

#### `sessionOptions.verifyClient`

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` — требовать проверку клиентского TLS-сертификата.

#### `sessionOptions.verifyPrivateKey` (client only)

<!-- YAML
added: v23.8.0
-->

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` — требовать проверку закрытого ключа для клиентских сессий. Для серверных
эта опция задаётся по идентичности в
[`sessionOptions.sni`][].

#### `sessionOptions.version`

<!-- YAML
added: v23.8.0
-->

* Тип: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Номер версии QUIC. Расширенная опция, обычно не требуется.

### Type: `TransportParams`

<!-- YAML
added: v23.8.0
-->

#### `transportParams.preferredAddressIpv4`

<!-- YAML
added: v23.8.0
-->

* Тип: [<net.SocketAddress>](net.md) Предпочитаемый объявляемый IPv4-адрес.

#### `transportParams.preferredAddressIpv6`

<!-- YAML
added: v23.8.0
-->

* Тип: [<net.SocketAddress>](net.md) Предпочитаемый объявляемый IPv6-адрес.

#### `transportParams.initialMaxStreamDataBidiLocal`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.initialMaxStreamDataBidiRemote`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.initialMaxStreamDataUni`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.initialMaxData`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.initialMaxStreamsBidi`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.initialMaxStreamsUni`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.maxIdleTimeout`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.activeConnectionIDLimit`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.ackDelayExponent`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.maxAckDelay`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transportParams.maxDatagramFrameSize`

<!-- YAML
added: v23.8.0
-->

* Тип: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

## Обратные вызовы

### Callback: `OnSessionCallback`

<!-- YAML
added: v23.8.0
-->

* `this` [<quic.QuicEndpoint>](quic.md)
* `session` [<quic.QuicSession>](quic.md)

Вызывается при инициации новой сессии удалённым пиром.

### Callback: `OnStreamCallback`

<!-- YAML
added: v23.8.0
-->

* `this` [<quic.QuicSession>](quic.md)
* `stream` [<quic.QuicStream>](quic.md)

### Callback: `OnDatagramCallback`

<!-- YAML
added: v23.8.0
-->

* `this` [<quic.QuicSession>](quic.md)
* `datagram` [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
* `early` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

### Callback: `OnDatagramStatusCallback`

<!-- YAML
added: v23.8.0
-->

* `this` [<quic.QuicSession>](quic.md)
* `id` [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
* `status` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из значений: `'lost'` или `'acknowledged'`.

### Callback: `OnPathValidationCallback`

<!-- YAML
added: v23.8.0
-->

* `this` [<quic.QuicSession>](quic.md)
* `result` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из значений: `'success'`, `'failure'` или `'aborted'`.
* `newLocalAddress` [<net.SocketAddress>](net.md)
* `newRemoteAddress` [<net.SocketAddress>](net.md)
* `oldLocalAddress` [<net.SocketAddress>](net.md)
* `oldRemoteAddress` [<net.SocketAddress>](net.md)
* `preferredAddress` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

### Callback: `OnSessionTicketCallback`

<!-- YAML
added: v23.8.0
-->

* `this` [<quic.QuicSession>](quic.md)
* `ticket` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### Callback: `OnVersionNegotiationCallback`

<!-- YAML
added: v23.8.0
-->

* `this` [<quic.QuicSession>](quic.md)
* `version` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `requestedVersions` [<number[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `supportedVersions` [<number[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

### Callback: `OnHandshakeCallback`

<!-- YAML
added: v23.8.0
-->

* `this` [<quic.QuicSession>](quic.md)
* `sni` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `alpn` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `cipher` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `cipherVersion` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `validationErrorReason` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `validationErrorCode` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `earlyDataAccepted` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

### Callback: `OnBlockedCallback`

<!-- YAML
added: v23.8.0
-->

* `this` [<quic.QuicStream>](quic.md)

### Callback: `OnStreamErrorCallback`

<!-- YAML
added: v23.8.0
-->

* `this` [<quic.QuicStream>](quic.md)
* `error` {any}

## Диагностические каналы

### Channel: `quic.endpoint.created`

<!-- YAML
added: v23.8.0
-->

* `endpoint` [<quic.QuicEndpoint>](quic.md)
* `config` [<quic.EndpointOptions>](quic.md)

### Channel: `quic.endpoint.listen`

<!-- YAML
added: v23.8.0
-->

* `endpoint` [<quic.QuicEndpoint>](quic.md)
* `options` [<quic.SessionOptions>](quic.md)

### Channel: `quic.endpoint.closing`

<!-- YAML
added: v23.8.0
-->

* `endpoint` [<quic.QuicEndpoint>](quic.md)
* `hasPendingError` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

### Channel: `quic.endpoint.closed`

<!-- YAML
added: v23.8.0
-->

* `endpoint` [<quic.QuicEndpoint>](quic.md)

### Channel: `quic.endpoint.error`

<!-- YAML
added: v23.8.0
-->

* `endpoint` [<quic.QuicEndpoint>](quic.md)
* `error` {any}

### Channel: `quic.endpoint.busy.change`

<!-- YAML
added: v23.8.0
-->

* `endpoint` [<quic.QuicEndpoint>](quic.md)
* `busy` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

### Channel: `quic.session.created.client`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.created.server`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.open.stream`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.received.stream`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.send.datagram`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.update.key`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.closing`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.closed`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.receive.datagram`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.receive.datagram.status`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.path.validation`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.ticket`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.version.negotiation`

<!-- YAML
added: v23.8.0
-->

### Channel: `quic.session.handshake`

<!-- YAML
added: v23.8.0
-->

[`sessionOptions.sni`]: #sessionoptionssni-server-only
