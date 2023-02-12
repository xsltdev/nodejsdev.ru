---
description: Node.js включает утилиту отладки командной строки. Чтобы использовать его, запустите Node.js с inspect аргумент, за которым следует путь к сценарию для отладки
---

# Debugger

<!--introduced_in=v0.9.12-->

> Стабильность: 2 - стабильная

<!-- type=misc -->

Node.js включает утилиту отладки командной строки. Чтобы использовать его, запустите Node.js с `inspect` аргумент, за которым следует путь к сценарию для отладки.

```console
$ node inspect myscript.js
< Debugger listening on ws://127.0.0.1:9229/621111f9-ffcb-4e82-b718-48a145fa5db8
< For help, see: https://nodejs.org/en/docs/inspector
<
< Debugger attached.
<
 ok
Break on start in myscript.js:2
  1 // myscript.js
> 2 global.x = 5;
  3 setTimeout(() => {
  4   debugger;
debug>
```

Клиент отладчика Node.js не является полнофункциональным отладчиком, но возможны простые действия и проверка.

Вставка заявления `debugger;` в исходный код скрипта включит точку останова в этой позиции в коде:

<!-- eslint-disable no-debugger -->

```js
// myscript.js
global.x = 5;
setTimeout(() => {
  debugger;
  console.log('world');
}, 1000);
console.log('hello');
```

После запуска отладчика точка останова появится в строке 3:

```console
$ node inspect myscript.js
< Debugger listening on ws://127.0.0.1:9229/621111f9-ffcb-4e82-b718-48a145fa5db8
< For help, see: https://nodejs.org/en/docs/inspector
<
< Debugger attached.
<
 ok
Break on start in myscript.js:2
  1 // myscript.js
> 2 global.x = 5;
  3 setTimeout(() => {
  4   debugger;
debug> cont
< hello
<
break in myscript.js:4
  2 global.x = 5;
  3 setTimeout(() => {
> 4   debugger;
  5   console.log('world');
  6 }, 1000);
debug> next
break in myscript.js:5
  3 setTimeout(() => {
  4   debugger;
> 5   console.log('world');
  6 }, 1000);
  7 console.log('hello');
debug> repl
Press Ctrl+C to leave debug repl
> x
5
> 2 + 2
4
debug> next
< world
<
break in myscript.js:6
  4   debugger;
  5   console.log('world');
> 6 }, 1000);
  7 console.log('hello');
  8
debug> .exit
$
```

В `repl` Команда позволяет удаленно оценивать код. В `next` команда переходит к следующей строке. Тип `help` чтобы узнать, какие другие команды доступны.

Нажатие `enter` без ввода команды будет повторять предыдущую команду отладчика.

## Наблюдатели

Во время отладки можно наблюдать за значениями выражений и переменных. В каждой точке останова каждое выражение из списка наблюдателей будет оцениваться в текущем контексте и отображаться непосредственно перед листингом исходного кода точки останова.

Чтобы начать просмотр выражения, введите `watch('my_expression')`. Команда `watchers` напечатает активных наблюдателей. Чтобы удалить наблюдателя, введите `unwatch('my_expression')`.

## Справочник по командам

### Шагая

- `cont`, `c`: Продолжить выполнение
- `next`, `n`: Шаг следующий
- `step`, `s`: Шаг в
- `out`, `o`: Выйти
- `pause`: Приостановить выполнение кода (например, кнопка паузы в Инструментах разработчика)

### Контрольные точки

- `setBreakpoint()`, `sb()`: Установить точку останова на текущей строке
- `setBreakpoint(line)`, `sb(line)`: Установить точку останова на определенной строке
- `setBreakpoint('fn()')`, `sb(...)`: Установить точку останова на первом операторе в теле функции
- `setBreakpoint('script.js', 1)`, `sb(...)`: Установить точку останова на первой строке `script.js`
- `setBreakpoint('script.js', 1, 'num < 4')`, `sb(...)`: Установить условную точку останова на первой строке `script.js` это ломается только когда `num < 4` оценивает `true`
- `clearBreakpoint('script.js', 1)`, `cb(...)`: Очистить точку останова в `script.js` в строке 1

Также можно установить точку останова в еще не загруженном файле (модуле):

```console
$ node inspect main.js
< Debugger listening on ws://127.0.0.1:9229/48a5b28a-550c-471b-b5e1-d13dd7165df9
< For help, see: https://nodejs.org/en/docs/inspector
<
< Debugger attached.
<
 ok
Break on start in main.js:1
> 1 const mod = require('./mod.js');
  2 mod.hello();
  3 mod.hello();
debug> setBreakpoint('mod.js', 22)
Warning: script 'mod.js' was not loaded yet.
debug> c
break in mod.js:22
 20 // USE OR OTHER DEALINGS IN THE SOFTWARE.
 21
>22 exports.hello = function() {
 23   return 'hello from module';
 24 };
debug>
```

Также можно установить условную точку останова, которая прерывается только тогда, когда данное выражение оценивается как `true`:

```console
$ node inspect main.js
< Debugger listening on ws://127.0.0.1:9229/ce24daa8-3816-44d4-b8ab-8273c8a66d35
< For help, see: https://nodejs.org/en/docs/inspector
< Debugger attached.
Break on start in main.js:7
  5 }
  6
> 7 addOne(10);
  8 addOne(-1);
  9
debug> setBreakpoint('main.js', 4, 'num < 0')
  1 'use strict';
  2
  3 function addOne(num) {
> 4   return num + 1;
  5 }
  6
  7 addOne(10);
  8 addOne(-1);
  9
debug> cont
break in main.js:4
  2
  3 function addOne(num) {
> 4   return num + 1;
  5 }
  6
debug> exec('num')
-1
debug>
```

### Информация

- `backtrace`, `bt`: Распечатать обратную трассировку текущего кадра выполнения
- `list(5)`: Список исходных кодов скриптов с 5-строчным контекстом (5 строк до и после)
- `watch(expr)`: Добавить выражение в список наблюдения
- `unwatch(expr)`: Удалить выражение из списка наблюдения
- `watchers`: Список всех наблюдателей и их значений (автоматически перечисляются для каждой точки останова)
- `repl`: Открыть ответ отладчика для оценки в контексте отладочного скрипта
- `exec expr`: Выполнить выражение в контексте сценария отладки

### Контроль исполнения

- `run`: Запустить скрипт (автоматически запускается при запуске отладчика)
- `restart`: Перезапустить скрипт
- `kill`: Убить скрипт

### Различный

- `scripts`: Список всех загруженных скриптов
- `version`: Показать версию V8

## Расширенное использование

### Интеграция инспектора V8 для Node.js

Интеграция V8 Inspector позволяет подключать Chrome DevTools к экземплярам Node.js для отладки и профилирования. Он использует [Протокол Chrome DevTools](https://chromedevtools.github.io/devtools-protocol/).

Инспектор V8 можно включить, передав `--inspect` флаг при запуске приложения Node.js. Также можно указать настраиваемый порт с этим флагом, например `--inspect=9222` будет принимать подключения DevTools через порт 9222.

Чтобы разбить первую строку кода приложения, передайте `--inspect-brk` флаг вместо `--inspect`.

```console
$ node --inspect index.js
Debugger listening on ws://127.0.0.1:9229/dc9010dd-f8b8-4ac5-a510-c1a114ec7d29
For help, see: https://nodejs.org/en/docs/inspector
```

(В приведенном выше примере UUID dc9010dd-f8b8-4ac5-a510-c1a114ec7d29 в конце URL-адреса создается «на лету», он меняется в разных сеансах отладки.)

Если браузер Chrome старше 66.0.3345.0, используйте `inspector.html` вместо того `js_app.html` в указанном выше URL.

Chrome DevTools не поддерживает отладку [рабочие потоки](worker_threads.md) пока что. [ndb](https://github.com/GoogleChromeLabs/ndb/) можно использовать для их отладки.
