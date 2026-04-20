---
title: TTY
description: Модуль node:tty предоставляет классы tty.ReadStream и tty.WriteStream для работы с текстовым терминалом
---

# TTY

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/tty.html)



!!!success "Стабильность: 2 – Стабильная"

    API является удовлетворительным. Совместимость с npm имеет высший приоритет и не будет нарушена, кроме случаев явной необходимости.



Модуль `node:tty` предоставляет классы `tty.ReadStream` и `tty.WriteStream`.
В большинстве случаев не потребуется и не получится использовать этот модуль напрямую. Тем не менее к нему можно обратиться так:

```js
const tty = require('node:tty');
```

Когда Node.js определяет, что он запущен с подключённым текстовым терминалом («TTY»),
[`process.stdin`](process.md#processstdin) по умолчанию инициализируется как экземпляр `tty.ReadStream`, а [`process.stdout`](process.md#processstdout) и [`process.stderr`](process.md#processstderr) по
умолчанию — как экземпляры `tty.WriteStream`. Предпочтительный способ выяснить, выполняется ли Node.js в контексте TTY, — проверить, что значение свойства `process.stdout.isTTY` равно `true`:

```console
$ node -p -e "Boolean(process.stdout.isTTY)"
true
$ node -p -e "Boolean(process.stdout.isTTY)" | cat
false
```

В большинстве случаев у приложения почти не должно быть причин вручную создавать экземпляры классов `tty.ReadStream` и `tty.WriteStream`.

## Класс: `tty.ReadStream`



* Расширяет: [net.Socket](net.md#class-netsocket)

Представляет читаемую сторону TTY. В обычных условиях
[`process.stdin`](process.md#processstdin) будет единственным экземпляром `tty.ReadStream` в процессе Node.js, и не должно быть причин создавать дополнительные экземпляры.

### `readStream.isRaw`



Значение `boolean`: `true`, если TTY в данный момент настроен на работу в режиме «сырого» устройства.

Этот флаг при старте процесса всегда `false`, даже если терминал работает в raw-режиме. Его значение меняется при последующих вызовах
`setRawMode`.

### `readStream.isTTY`



Значение `boolean`, которое для экземпляров `tty.ReadStream` всегда `true`.

### `readStream.setRawMode(mode)`



* `mode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, настраивает `tty.ReadStream` на работу в режиме «сырого» устройства. Если `false` — на обычный режим. Свойство `readStream.isRaw` будет установлено в соответствующий режим.
* Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this) Экземпляр потока чтения.

Позволяет настроить `tty.ReadStream` так, чтобы он работал как «сырое» устройство.

В raw-режиме ввод всегда доступен посимвольно, без модификаторов. Кроме того, отключается вся специальная обработка символов терминалом, включая эхо ввода.
<kbd>Ctrl</kbd>+<kbd>C</kbd> в этом режиме больше не вызывает `SIGINT`.

## Класс: `tty.WriteStream`



* Расширяет: [net.Socket](net.md#class-netsocket)

Представляет записываемую сторону TTY. В обычных условиях
[`process.stdout`](process.md#processstdout) и [`process.stderr`](process.md#processstderr) будут единственными
созданными для процесса Node.js экземплярами `tty.WriteStream`, и не должно быть причин создавать дополнительные экземпляры.

### `new tty.ReadStream(fd[, options])`



Добавлено в: v0.5.8

* `fd` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Дескриптор файла, связанный с TTY.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры, передаваемые родительскому `net.Socket`;
  см. `options` у [конструктора `net.Socket`](net.md#new-netsocketoptions).
* Возвращает: [`<tty.ReadStream>`](tty.md)

Создаёт `ReadStream` для `fd`, связанного с TTY.

### `new tty.WriteStream(fd)`



* `fd` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Дескриптор файла, связанный с TTY.
* Возвращает: [`<tty.WriteStream>`](tty.md)

Создаёт `WriteStream` для `fd`, связанного с TTY.

### Событие: `'resize'`



Событие `'resize'` генерируется всякий раз, когда меняется одно из свойств `writeStream.columns`
или `writeStream.rows`. При вызове обработчика аргументы не передаются.

```js
process.stdout.on('resize', () => {
  console.log('screen size has changed!');
  console.log(`${process.stdout.columns}x${process.stdout.rows}`);
});
```

### `writeStream.clearLine(dir[, callback])`



Добавлено в: v0.7.7

* `dir` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `-1`: влево от курсора
  * `1`: вправо от курсора
  * `0`: вся строка
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается по завершении операции.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false`, если поток просит вызывающий код дождаться
  события `'drain'` перед продолжением записи; иначе `true`.

`writeStream.clearLine()` очищает текущую строку этого `WriteStream` в направлении, заданном `dir`.

### `writeStream.clearScreenDown([callback])`



Добавлено в: v0.7.7

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается по завершении операции.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false`, если поток просит вызывающий код дождаться
  события `'drain'` перед продолжением записи; иначе `true`.

`writeStream.clearScreenDown()` очищает этот `WriteStream` от текущей позиции курсора вниз.

### `writeStream.columns`



Число (`number`), задающее текущее число колонок TTY. Это свойство
обновляется при каждом событии `'resize'`.

### `writeStream.cursorTo(x[, y][, callback])`



Добавлено в: v0.7.7

* `x` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `y` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается по завершении операции.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false`, если поток просит вызывающий код дождаться
  события `'drain'` перед продолжением записи; иначе `true`.

`writeStream.cursorTo()` перемещает курсор этого `WriteStream` в указанную позицию.

### `writeStream.getColorDepth([env])`



* `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект с переменными окружения для проверки. Это
  позволяет имитировать использование конкретного терминала. **По умолчанию:**
  `process.env`.
* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает:

* `1` для 2,
* `4` для 16,
* `8` для 256,
* `24` для 16 777 216 поддерживаемых цветов.

Используйте этот метод, чтобы определить, какие цвета поддерживает терминал. Из-за особенностей цвета в терминалах возможны ложные срабатывания в обе стороны. Это зависит от информации о процессе и переменных окружения, которые могут неверно указывать используемый терминал.
Можно передать объект `env`, чтобы имитировать конкретный терминал. Это полезно для проверки поведения при определённых настройках окружения.

Чтобы зафиксировать поддержку цвета, используйте одну из следующих настроек окружения.

* 2 цвета: `FORCE_COLOR = 0` (отключает цвета)
* 16 цветов: `FORCE_COLOR = 1`
* 256 цветов: `FORCE_COLOR = 2`
* 16 777 216 цветов: `FORCE_COLOR = 3`

Отключить поддержку цветов можно также переменными окружения `NO_COLOR` и
`NODE_DISABLE_COLORS`.

### `writeStream.getWindowSize()`



* Возвращает: [`<number[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

`writeStream.getWindowSize()` возвращает размер TTY,
соответствующий этому `WriteStream`. Массив имеет вид
`[numColumns, numRows]`, где `numColumns` и `numRows` — число
столбцов и строк соответствующего TTY.

### `writeStream.hasColors([count][, env])`



* `count` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Запрашиваемое число цветов (минимум 2).
  **По умолчанию:** 16.
* `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект с переменными окружения для проверки. Это
  позволяет имитировать использование конкретного терминала. **По умолчанию:**
  `process.env`.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если `writeStream` поддерживает не меньше цветов, чем указано в
`count`. Минимальная поддержка — 2 (чёрный и белый).

Те же ложные срабатывания и ограничения, что описаны для
[`writeStream.getColorDepth()`](#writestreamgetcolordepthenv).

```js
process.stdout.hasColors();
// Returns true or false depending on if `stdout` supports at least 16 colors.
process.stdout.hasColors(256);
// Returns true or false depending on if `stdout` supports at least 256 colors.
process.stdout.hasColors({ TMUX: '1' });
// Returns true.
process.stdout.hasColors(2 ** 24, { TMUX: '1' });
// Returns false (the environment setting pretends to support 2 ** 8 colors).
```

### `writeStream.isTTY`



Значение `boolean`, которое всегда `true`.

### `writeStream.moveCursor(dx, dy[, callback])`



Добавлено в: v0.7.7

* `dx` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `dy` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается по завершении операции.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false`, если поток просит вызывающий код дождаться
  события `'drain'` перед продолжением записи; иначе `true`.

`writeStream.moveCursor()` перемещает курсор этого `WriteStream` _относительно_ текущей позиции.

### `writeStream.rows`



Число (`number`), задающее текущее число строк TTY. Это свойство
обновляется при каждом событии `'resize'`.

## `tty.isatty(fd)`



* `fd` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Числовой дескриптор файла
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Метод `tty.isatty()` возвращает `true`, если указанный `fd` связан с
TTY, и `false`, если нет, в том числе когда `fd` не является неотрицательным целым числом.

[`net.Socket` constructor]: net.md#new-netsocketoptions
[`process.stderr`]: process.md#processstderr
[`process.stdin`]: process.md#processstdin
[`process.stdout`]: process.md#processstdout
[`writeStream.getColorDepth()`]: #writestreamgetcolordepthenv
