---
title: Debugger
description: Node.js включает утилиту отладки командной строки. Чтобы использовать его, запустите Node.js с inspect аргумент, за которым следует путь к сценарию для отладки
---

# Отладчик

[:octicons-tag-24: v18.x.x](https://nodejs.org/dist/latest-v18.x/docs/api/debugger.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Node.js включает в себя утилиту отладки командной строки. Клиент отладчика Node.js не является полнофункциональным отладчиком, но простой степпинг и инспекция возможны.

Чтобы воспользоваться им, запустите Node.js с аргументом `inspect`, за которым следует путь к отлаживаемому скрипту.

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

Отладчик автоматически прерывается на первой исполняемой строке. Чтобы вместо этого он работал до первой точки останова (заданной оператором [`debugger`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger)), установите переменную окружения `NODE_INSPECT_RESUME_ON_START` в `1`.

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

Команда `repl` позволяет оценивать код удаленно. Команда `next` переходит к следующей строке. Введите `help`, чтобы узнать, какие еще команды доступны.

Нажатие `enter` без ввода команды повторит предыдущую команду отладчика.

<!-- 0000.part.md -->

## Наблюдатели

Во время отладки можно следить за значениями выражений и переменных. В каждой точке останова каждое выражение из списка наблюдателей будет оценено в текущем контексте и отображено непосредственно перед листингом исходного кода точки останова.

Чтобы начать наблюдение за выражением, введите `watch('my_expression')`. Команда `watchers` выведет активные наблюдатели. Чтобы удалить наблюдателя, введите `unwatch('my_expression')`.

<!-- 0001.part.md -->

## Ссылка на команду

<!-- 0002.part.md -->

### Шаги

-   `cont`, `c`: Продолжить выполнение
-   `next`, `n`: Следующий шаг
-   `step`, `s`: Шаг в
-   `out`, `o`: Шаг наружу
-   `pause`: Приостановить выполнение кода (как кнопка паузы в Инструментах разработчика)

<!-- 0003.part.md -->

### Точки останова

-   `setBreakpoint()`, `sb()`: Установить точку останова на текущей строке
-   `setBreakpoint(line)`, `sb(line)`: Установить точку останова на определенной строке
-   `setBreakpoint('fn()')`, `sb(...)`: Установка точки останова на первом утверждении в теле функции
-   `setBreakpoint('script.js', 1)`, `sb(...)`: Установить точку останова на первой строке файла `script.js`.
-   `setBreakpoint('script.js', 1, 'num < 4')`, `sb(...)`: Устанавливает условную точку останова на первой строке `script.js`, которая прерывается только тогда, когда `num < 4` оценивается в `true`.
-   `clearBreakpoint('script.js', 1)`, `cb(...)`: Очистить точку останова в `script.js` на строке 1

Также можно установить точку останова в файле (модуле), который еще не загружен:

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

Также можно установить условную точку останова, которая прерывается только тогда, когда заданное выражение оценивается в `true`:

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

<!-- 0004.part.md -->

### Информация

-   `backtrace`, `bt`: Печать обратной трассировки текущего кадра выполнения
-   `list(5)`: Вывести исходный код скриптов с контекстом в 5 строк (по 5 строк до и после)
-   `watch(expr)`: Добавить выражение в список наблюдения
-   `unwatch(expr)`: Удалить выражение из списка наблюдения
-   `unwatch(index)`: Удалить выражение с определенным индексом из списка наблюдения
-   `watchers`: Список всех наблюдателей и их значений (автоматически выводится на каждой точке останова)
-   `repl`: Открыть repl отладчика для оценки в контексте отладочного скрипта
-   `exec expr`, `p expr`: Выполнить выражение в контексте отладочного скрипта и вывести его значение
-   `profile`: Начать сеанс профилирования процессора
-   `profileEnd`: Остановить текущий сеанс профилирования процессора
-   `profiles`: Список всех завершенных сеансов профилирования процессора
-   `profiles[n].save(filepath = 'node.cpupuprofile')`: Сохранить сессию профилирования процессора на диск в формате JSON
-   `takeHeapSnapshot(filepath = 'node.heapsnapshot')`: Сделать снимок кучи и сохранить на диск в формате JSON

<!-- 0005.part.md -->

### Контроль исполнения

-   `run`: Запуск скрипта (автоматически запускается при старте отладчика)
-   `restart`: Перезапустить скрипт
-   `kill`: Убить скрипт

<!-- 0006.part.md -->

### Различные

-   `scripts`: Список всех загруженных скриптов
-   `version`: Отображение версии V8

<!-- 0007.part.md -->

## Расширенное использование

<!-- 0008.part.md -->

### Интеграция инспектора V8 для Node.js

Интеграция V8 Inspector позволяет прикрепить Chrome DevTools к экземплярам Node.js для отладки и профилирования. Он использует протокол [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/).

V8 Inspector можно включить, передав флаг `--inspect` при запуске приложения Node.js. Также можно указать пользовательский порт с этим флагом, например, `--inspect=9222` будет принимать соединения DevTools на порту 9222.

Чтобы прервать работу на первой строке кода приложения, передайте флаг `--inspect-brk` вместо `--inspect`.

```console
$ node --inspect index.js
Debugger listening on ws://127.0.0.1:9229/dc9010dd-f8b8-4ac5-a510-c1a114ec7d29
For help, see: https://nodejs.org/en/docs/inspector
```

(В приведенном примере UUID dc9010dd-f8b8-4ac5-a510-c1a114ec7d29 в конце URL генерируется на лету, он меняется в разных сеансах отладки).

Если браузер Chrome старше 66.0.3345.0, используйте `inspector.html` вместо `js_app.html` в приведенном выше URL.

Chrome DevTools пока не поддерживает отладку [рабочих потоков](worker_threads.md). Для их отладки можно использовать [ndb](https://github.com/GoogleChromeLabs/ndb/).

<!-- 0009.part.md -->

