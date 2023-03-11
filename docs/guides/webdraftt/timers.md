# Таймеры

В Node.js таймерами называются те функции, которые выполняют переданные им функции в какой-то момент времени в будущем и являются частью встроенного модуля `Timers`. Для эмуляции JavaScript API, функции модуля доступны глобально, поэтому импорт `Timers` не требуется.

Хотя реализация таймеров в Node.js и близка к тем, что имеются в браузере, но некоторые различия все же имеются. Рассмотрим подробно.

## setTimeout()

Функция `setTimeout()` выполняет переданную функцию после истечения заданного в миллисекундах интервала времени.

```js
console.log('Console before timeout')

setTimeout(() => console.log('Delayed execution'), 3000)

console.log('Console after timeout')
```

Результат работы кода.

```
Console before timeout
Console after timeout
Delayed execution //по истечении 3 секунд
```

При объяснении [event loop](event-loop.md) уже объяснялось, что таймеры могут выполняться не через точно заданный промежуток времени - все зависит от очереди callback-функций завершенных асинхронных операций. Если время истечет в процессе выполнения callback-ов, то таймер выполнится сразу после их завершения, но после стадии check цикла событий. А это значит, что может пройти больше времени, чем было задано.

## setImmediate()

Функция-таймер выполняет переданную ей функцию в самом конце текущей итерации event loop. Это означает, что функция выполнится после всех событий ввода/вывода.

```js
console.log('Console before immediate')

setImmediate(() => console.log('Immediate execution'))

console.log('Console after immediate')
```

Результат работы кода.

```
Console before immediate
Console after immediate
Immediate execution //сразу после выполнения остального кода
```

## setInterval()

Функция `setInterval()` используется для выполнения определенного кода множество через заданный интервал времени и принимает два параметра

- функция для выполнения;
- интервал времени в миллисекундах, через который переданная первым аргументом функция, должна быть вызвана снова.

```js
setInterval(() => console.log('Interval execution'), 1000)
```

Результат работы кода.

```
Interval execution
Interval execution
Interval execution
Interval execution
... (каждую секунду)
```

Как и в случае с Node.js таймером `setTimeout()`, повторное выполнение функции не может быть гарантировано по истечении точно заданного интервала. Event loop может внести свои корректировки.

## Отмена таймеров

Каждая из Node.js функций-таймеров - `setTimeout()`, `setImmediate()` и `setInterval()` - при вызове возвращает объект `timer`, который можно использовать для завершения работы таймеров, передав его соответствующей очищающей функции.

```js
console.log('Before')

let timeout = setTimeout(
  () => console.log('Delayed execution'),
  3000
)
let immediate = setImmediate(() =>
  console.log('Immediate execution')
)
let interval = setInterval(
  () => console.log('Interval execution'),
  1000
)

clearTimeout(timeout)
clearImmediate(immediate)
clearInterval(interval)

console.log('After')
```

Результат работы кода.

```
Before
After
```

!!! note ""

    Не забывайте отменять выполнение таймеров, когда они вам не нужны. Их хранение в оперативной памяти требует лишних ресурсов и может привести к утечке памяти.
