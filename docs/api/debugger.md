---
title: Debugger
description: Утилита отладки командной строки Node.js — пошаговое выполнение и инспекция кода через node inspect и интеграцию с Chrome DevTools
---

# Отладчик

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/debugger.html)

<!--introduced_in=v0.9.12-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- type=misc -->

Node.js включает утилиту отладки командной строки. Клиент отладчика Node.js не является полнофункциональным отладчиком, но доступны простой пошаговый режим и инспекция.

Чтобы воспользоваться ею, запустите Node.js с аргументом `inspect`, за которым укажите путь к отлаживаемому скрипту.

```console
$ node inspect myscript.js
< Debugger listening on ws://127.0.0.1:9229/621111f9-ffcb-4e82-b718-48a145fa5db8
< For help, see: https://nodejs.org/en/docs/inspector
<
connecting to 127.0.0.1:9229 ... ok
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

Отладчик автоматически останавливается на первой исполняемой строке. Чтобы вместо этого выполнение шло до первой точки останова (заданной оператором [`debugger`][`debugger`]), установите переменную окружения `NODE_INSPECT_RESUME_ON_START` в `1`.

```console
$ cat myscript.js
// myscript.js
global.x = 5;
setTimeout(() => {
  debugger;
  console.log('world');
}, 1000);
console.log('hello');
$ NODE_INSPECT_RESUME_ON_START=1 node inspect myscript.js
< Debugger listening on ws://127.0.0.1:9229/f1ed133e-7876-495b-83ae-c32c6fc319c2
< For help, see: https://nodejs.org/en/docs/inspector
<
connecting to 127.0.0.1:9229 ... ok
< Debugger attached.
<
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

Команда `repl` позволяет вычислять код удалённо. Команда `next` переходит к следующей строке. Введите `help`, чтобы увидеть остальные доступные команды.

Нажатие `enter` без ввода команды повторяет предыдущую команду отладчика.

## Наблюдатели

Во время отладки можно следить за значениями выражений и переменных. В каждой точке останова каждое выражение из списка наблюдателей вычисляется в текущем контексте и отображается непосредственно перед листингом исходного кода точки останова.

Чтобы начать наблюдение за выражением, введите `watch('my_expression')`. Команда `watchers` выводит активных наблюдателей. Чтобы удалить наблюдателя, введите `unwatch('my_expression')`.

## Справочник команд

### Пошаговое выполнение

* `cont`, `c`: продолжить выполнение
* `next`, `n`: шаг с обходом (следующая строка)
* `step`, `s`: шаг с заходом
* `out`, `o`: шаг с выходом
* `pause`: приостановить выполнение кода (как кнопка паузы в инструментах разработчика)

### Точки останова

* `setBreakpoint()`, `sb()`: установить точку останова на текущей строке
* `setBreakpoint(line)`, `sb(line)`: установить точку останова на указанной строке
* `setBreakpoint('fn()')`, `sb(...)`: установить точку останова на первом операторе в теле функции
* `setBreakpoint('script.js', 1)`, `sb(...)`: установить точку останова на первой строке файла `script.js`
* `setBreakpoint('script.js', 1, 'num < 4')`, `sb(...)`: установить условную точку останова на первой строке `script.js`, которая срабатывает только когда выражение `num < 4` равно `true`
* `clearBreakpoint('script.js', 1)`, `cb(...)`: снять точку останова в `script.js` на строке 1

Также можно установить точку останова в файле (модуле), который ещё не загружен:

```console
$ node inspect main.js
< Debugger listening on ws://127.0.0.1:9229/48a5b28a-550c-471b-b5e1-d13dd7165df9
< For help, see: https://nodejs.org/en/docs/inspector
<
connecting to 127.0.0.1:9229 ... ok
< Debugger attached.
<
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

Также можно установить условную точку останова, которая срабатывает только когда заданное выражение вычисляется в `true`:

```console
$ node inspect main.js
< Debugger listening on ws://127.0.0.1:9229/ce24daa8-3816-44d4-b8ab-8273c8a66d35
< For help, see: https://nodejs.org/en/docs/inspector
<
connecting to 127.0.0.1:9229 ... ok
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

* `backtrace`, `bt`: вывести обратную трассировку текущего кадра выполнения
* `list(5)`: показать исходный код скриптов с контекстом в 5 строк (5 строк до и после)
* `watch(expr)`: добавить выражение в список наблюдателей
* `unwatch(expr)`: удалить выражение из списка наблюдателей
* `unwatch(index)`: удалить выражение с указанным индексом из списка наблюдателей
* `watchers`: перечислить всех наблюдателей и их значения (автоматически выводится в каждой точке останова)
* `repl`: открыть repl отладчика для вычислений в контексте отлаживаемого скрипта
* `exec expr`, `p expr`: выполнить выражение в контексте отлаживаемого скрипта и вывести его значение
* `profile`: начать сеанс профилирования CPU
* `profileEnd`: завершить текущий сеанс профилирования CPU
* `profiles`: перечислить все завершённые сеансы профилирования CPU
* `profiles[n].save(filepath = 'node.cpuprofile')`: сохранить сеанс профилирования CPU на диск в формате JSON
* `takeHeapSnapshot(filepath = 'node.heapsnapshot')`: сделать снимок кучи и сохранить на диск в формате JSON

### Управление выполнением

* `run`: запустить скрипт (выполняется автоматически при старте отладчика)
* `restart`: перезапустить скрипт
* `kill`: завершить скрипт

### Разное

* `scripts`: перечислить все загруженные скрипты
* `version`: показать версию V8

## Расширенное использование

### Интеграция V8 Inspector с Node.js

Интеграция V8 Inspector позволяет подключать Chrome DevTools к процессам Node.js для отладки и профилирования. Используется [протокол Chrome DevTools][Chrome DevTools Protocol].

V8 Inspector включается флагом `--inspect` при запуске приложения Node.js. Также можно указать свой порт, например `--inspect=9222` — подключения DevTools будут приниматься на порту 9222.

При использовании флага `--inspect` код выполняется сразу, до подключения отладчика. То есть выполнение начинается до того, как вы сможете начать отладку, что может быть нежелательно, если нужно отлаживать с самого начала.

В таких случаях есть два варианта:

1. Флаг `--inspect-wait`: ожидает подключения отладчика перед выполнением кода. Позволяет начать отладку с самого начала выполнения.
2. Флаг `--inspect-brk`: в отличие от `--inspect`, останавливается на первой строке кода сразу после подключения отладчика. Удобно для пошаговой отладки с самого начала без предварительного выполнения кода.

Выбирая между `--inspect`, `--inspect-wait` и `--inspect-brk`, учитывайте, нужно ли немедленное выполнение, ожидание подключения отладчика до старта или останов на первой строке для пошаговой отладки.

```console
$ node --inspect index.js
Debugger listening on ws://127.0.0.1:9229/dc9010dd-f8b8-4ac5-a510-c1a114ec7d29
For help, see: https://nodejs.org/en/docs/inspector
```

(В примере выше UUID `dc9010dd-f8b8-4ac5-a510-c1a114ec7d29` в конце URL генерируется на лету и отличается в разных сеансах отладки.)

[Chrome DevTools Protocol]: https://chromedevtools.github.io/devtools-protocol/
[`debugger`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger
