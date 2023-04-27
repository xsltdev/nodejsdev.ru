---
description: Модуль tty предоставляет классы tty.ReadStream и tty.WriteStream
---

# TTY

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/tty.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:tty` предоставляет классы `tty.ReadStream` и `tty.WriteStream`. В большинстве случаев нет необходимости или возможности использовать этот модуль напрямую. Однако к нему можно получить доступ, используя:

```js
const tty = require('node:tty');
```

Когда Node.js определяет, что он запускается с подключенным текстовым терминалом ("TTY"), [`process.stdin`](process.md#processstdin) по умолчанию будет инициализирован как экземпляр `tty.ReadStream`, а [`process.stdout`](process.md#processstdout) и [`process.stderr`](process.md#processstderr) по умолчанию будут экземплярами `tty.WriteStream`. Предпочтительным методом определения того, выполняется ли Node.js в контексте TTY, является проверка того, что значение свойства `process.stdout.isTTY` равно `true`:

```console
$ node -p -e "Boolean(process.stdout.isTTY)"
true
$ node -p -e "Boolean(process.stdout.isTTY)" | cat
false
```

В большинстве случаев у приложения практически не должно быть причин вручную создавать экземпляры классов `tty.ReadStream` и `tty.WriteStream`.

## Класс: `tty.ReadStream`

-   Расширяет: {net.Socket}

Представляет читаемую сторону TTY. В обычных обстоятельствах [`process.stdin`](process.md#processstdin) будет единственным экземпляром `tty.ReadStream` в процессе Node.js, и не должно быть причин для создания дополнительных экземпляров.

### `readStream.isRaw`

Значение `boolean`, которое равно `true`, если TTY в настоящее время настроен на работу в качестве необработанного устройства. По умолчанию имеет значение `false`.

### `readStream.isTTY`

Булево значение, которое всегда `true` для экземпляров `tty.ReadStream`.

### `readStream.setRawMode(mode)`

-   `mode` {boolean} If `true`, configures the `tty.ReadStream` to operate as a raw device. If `false`, configures the `tty.ReadStream` to operate in its default mode. The `readStream.isRaw` property will be set to the resulting mode.
-   Returns: {this} The read stream instance.

Allows configuration of `tty.ReadStream` so that it operates as a raw device.

When in raw mode, input is always available character-by-character, not including modifiers. Additionally, all special processing of characters by the terminal is disabled, including echoing input characters. <kbd>Ctrl</kbd>+<kbd>C</kbd> will no longer cause a `SIGINT` when in this mode.

## Класс: `tty.WriteStream`

-   Расширяет: {net.Socket}

Представляет записываемую сторону TTY. В обычных обстоятельствах [`process.stdout`](process.md#processstdout) и [`process.stderr`](process.md#processstderr) будут единственными экземплярами `tty.WriteStream`, созданными для процесса Node.js, и не должно быть причин для создания дополнительных экземпляров.

### Событие: `'resize'`

Событие `'resize'` генерируется всякий раз, когда изменяется одно из свойств `writeStream.columns` или `writeStream.rows`. При вызове обратного вызова слушателя никакие аргументы не передаются.

```js
process.stdout.on('resize', () => {
    console.log('Размер экрана изменился!');
    console.log(
        `${process.stdout.columns}x${process.stdout.rows}`
    );
});
```

### `writeStream.clearLine(dir[, callback])`

-   `dir` {число}
    -   `-1`: влево от курсора
    -   `1`: вправо от курсора
    -   `0`: вся строка
-   `callback` {функция} Вызывается после завершения операции.
-   Возвращает: {boolean} `false`, если поток желает, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

`writeStream.clearLine()` очищает текущую строку этого `WriteStream` в направлении, определенном `dir`.

### `writeStream.clearScreenDown([callback])`

-   `callback` {Функция} Вызывается после завершения операции.
-   Возвращает: {boolean} `false`, если поток желает, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

`writeStream.clearScreenDown()` очищает данный `WriteStream` от текущего курсора вниз.

### `writeStream.columns`

Число, указывающее количество колонок, которые в настоящее время имеет TTY. Это свойство обновляется при каждом событии `'resize'`.

### `writeStream.cursorTo(x[, y][, callback])`

-   `x` {число}
-   `y` {число}
-   `callback` {функция} Вызывается после завершения операции.
-   Возвращает: {boolean} `false`, если поток желает, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

`writeStream.cursorTo()` перемещает курсор этого `WriteStream` в указанную позицию.

### `writeStream.getColorDepth([env])`

-   `env` {Object} Объект, содержащий переменные окружения для проверки. Это позволяет имитировать использование конкретного терминала. **По умолчанию:** `process.env`.
-   Возвращает: {число}

Возвращает:

-   `1` для 2,
-   `4` для 16,
-   `8` для 256,
-   `24` для 16 777 216 поддерживаемых цветов.

Используйте этот параметр, чтобы определить, какие цвета поддерживает терминал. Из-за природы цветов в терминалах возможны как ложные положительные, так и ложные отрицательные результаты. Это зависит от информации о процессе и переменных окружения, которые могут врать о том, какой терминал используется. Можно передать объект `env` для имитации использования определенного терминала. Это может быть полезно для проверки поведения определенных параметров окружения.

Для принудительной поддержки определенного цвета используйте одну из следующих настроек окружения.

-   2 цвета: `FORCE_COLOR = 0` (отключает цвета)
-   16 цветов: `FORCE_COLOR = 1` (отключает цвета)
-   256 цветов: `FORCE_COLOR = 2`.
-   16,777,216 цветов: `FORCE_COLOR = 3`.

Отключение поддержки цветов также возможно с помощью переменных окружения `NO_COLOR` и `NODE_DISABLE_COLORS`.

### `writeStream.getWindowSize()`

-   Возвращает: {number\[\]}

`writeStream.getWindowSize()` возвращает размер TTY, соответствующий данному `WriteStream`. Массив имеет тип `[numColumns, numRows]`, где `numColumns` и `numRows` представляют собой количество столбцов и строк в соответствующем TTY.

### `writeStream.hasColors([count][, env])`

-   `count` {целое число} Количество запрашиваемых цветов (минимум 2). **По умолчанию:** 16.
-   `env` {Object} Объект, содержащий переменные окружения для проверки. Это позволяет имитировать использование конкретного терминала. **По умолчанию:** `process.env`.
-   Возвращает: {boolean}

Возвращает `true`, если `writeStream` поддерживает по крайней мере столько цветов, сколько указано в `count`. Минимальная поддержка - 2 (черный и белый).

Имеет такие же ложные срабатывания и отрицательные результаты, как описано в [`writeStream.getColorDepth()`](#writestreamgetcolordepthenv).

```js
process.stdout.hasColors();
// Возвращает true или false в зависимости от того, поддерживает ли `stdout` хотя бы 16 цветов.
process.stdout.hasColors(256);
// Возвращает true или false в зависимости от того, поддерживает ли `stdout` не менее 256 цветов.
process.stdout.hasColors({ TMUX: '1' });
// Возвращает true.
process.stdout.hasColors(2 ** 24, { TMUX: '1' });
// Возвращает false (настройка окружения делает вид, что поддерживает 2 ** 8 цветов).
```

### `writeStream.isTTY`

Булево значение, которое всегда равно `true`.

### `writeStream.moveCursor(dx, dy[, callback])`

-   `dx` {число}
-   `dy` {число}
-   `callback` {функция} Вызывается после завершения операции.
-   Возвращает: {boolean} `false`, если поток желает, чтобы вызывающий код дождался события `'drain'`, прежде чем продолжить запись дополнительных данных; иначе `true`.

`writeStream.moveCursor()` перемещает курсор этого `WriteStream` _относительно_ его текущей позиции.

### `writeStream.rows`

Число, указывающее количество строк, которые в настоящее время имеет TTY. Это свойство обновляется при каждом событии `'resize'`.

## `tty.isatty(fd)`

-   `fd` {number} Числовой дескриптор файла
-   Возвращает: {булево}

Метод `tty.isatty()` возвращает `true`, если данный `fd` ассоциирован с TTY, и `false`, если нет, включая случаи, когда `fd` не является неотрицательным целым числом.
