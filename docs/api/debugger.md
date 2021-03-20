# Debugger

!!!success "Стабильность: 2 – Стабильно"

Node.js включает в себя полную внепроцессную утилиту по отладке, доступ к которой осуществляется через простой протокол на основе TCP и встроенный клиент. Для использования нужно запустить Node.js с аргументом `debug`, где нужно указать путь к скрипту дебага; запрос будет выводиться с отображением успешного запуска отладчика.

```
$ node debug myscript.js
> debugger listening on port 5858
connecting... ok
break in /home/indutny/Code/git/indutny/myscript.js:1
  1 x = 5;
  2 setTimeout(() => {
  3   debugger;
debug<
```

Клиент отладчика в Node.js не является полным отладчиком, но ему подвластны некоторые простые действия.

Вставка выражения `debugger;` в код источника или скрипт позволяет вотметить контрольную точку в этой самой позиции в коде:

```js
// myscript.js
x = 5;
setTimeout(() => {
  debugger;
  console.log('world');
}, 1000);
console.log('hello');
```

После того, как запущен отладчик, контрольная точка будет находиться в строке 4:

```
$ node debug myscript.js
> debugger listening on port 5858
connecting... ok
break in /home/indutny/Code/git/indutny/myscript.js:1
  1 x = 5;
  2 setTimeout(() =< {
  3   debugger;
debug< cont
> hello
break in /home/indutny/Code/git/indutny/myscript.js:3
  1 x = 5;
  2 setTimeout(() =< {
  3   debugger;
  4   console.log('world');
  5 }, 1000);
debug< next
break in /home/indutny/Code/git/indutny/myscript.js:4
  2 setTimeout(() =< {
  3   debugger;
  4   console.log('world');
  5 }, 1000);
  6 console.log('hello');
debug> repl
Press Ctrl + C to leave debug repl
< x
5
< 2+2
4
debug< next
> world
break in /home/indutny/Code/git/indutny/myscript.js:5
  3   debugger;
  4   console.log('world');
  5 }, 1000);
  6 console.log('hello');
  7
debug< quit
```

Команда `repl` позволяет удаленно оценивать код. Команда `next` перемещает на следующую строку. Для того, чтобы увидеть остальные доступные команды, наберите `help`.

Нажатие ++enter++ без введения команды повторит предыдущую команду.

## Отслеживание (Watchers)

Возможно отслеживать выражения и значения переменных во время отладки. В каждой контрольной точке каждое выражение из списка отслеживания будет оценено в текущем контексте и отображено непосредственно перед листингом исходного кода в контрольной точке.

Для начала отслеживания выражения, наберите `watch('my_expression')`. Команда `watchers` покажет активные отслеживания. Для удаления отслеживания, наберите `unwatch('my_expression')`.

## Справочник команд

### Шаги

- `cont`, `c` – Продолжать выполнение
- `next`, `n` – следующий шаг
- `step`, `s` – войти
- `out`, `o` – выйти
- `pause` – приостановить запускаемый код (как кнопка "pause" в инструментах разработчика)

### Контрольные точки

- `setBreakpoint()`, `sb()` – установка контрольной точки в текущей строке
- `setBreakpoint(line)`, `sb(line)` – установка контрольной точки в заданной строке
- `setBreakpoint('fn()')`, `sb(...)` – установка контрольной точки в первое выражение в теле функции
- `setBreakpoint('script.js', 1)`, `sb(...)` – установка контрольной точки в первую строку `script.js`
- `clearBreakpoint('script.js', 1)`, `cb(...)` – удалить контрольную точку из `script.js` из первой строки

Также возможно установить контрольную точку в файл (модуль), который еще не загружен:

```
$ ./node debug test/fixtures/break-in-module/main.js
> debugger listening on port 5858
connecting to port 5858... ok
break in test/fixtures/break-in-module/main.js:1
  1 var mod = require('./mod.js');
  2 mod.hello();
  3 mod.hello();
debug< setBreakpoint('mod.js', 23)
Warning: script 'mod.js' was not loaded yet.
  1 var mod = require('./mod.js');
  2 mod.hello();
  3 mod.hello();
debug< c
break in test/fixtures/break-in-module/mod.js:23
 21
 22 exports.hello = () =< {
 23   return 'hello from module';
 24 };
 25
debug<
```

### Информация

- `backtrace`, `bt` – выводит на экран трассировку текущего фрейма выполнения
- `list(5)` – список скриптов исходного кода в контексте пяти строк (пять строк до и пять после)
- `watch(expr)` – добавить выражение в список отслеживания
- `unwatch(expr)` – удалить выражение из списка отслеживания
- `watchers` – список всех отслеживаний и их значений (автоматически собирается в каждой контрольной точке)
- `repl` – открывает repl в отладчике в контекте скрипта отладчика
- `exec expr` – выполняет выражение в контесте скрипта отладчика

### Контроль выполнения

- `run` – запускает скрипт (автоматически запускается после старта отладчика)
- `restart` – перезапускает скрипт
- `kill` – завершает скрипт

### Разное

- `scripts` – список всех загруженных скриптов
- `version` – отображает версию V8

## Продвинутое использование

Альтернативный способ включения отладчика - запустить Node.js с флагом командной строки `--debug` или посредством отправки сигнала `SIGUSR1` существующему процессу Node.js.

После того, как процесс был установлен в режим отладки этим способом, его можно проинспектировать, используя отладчик Node.js: либо подсоединяясь к `pid` запущенного процесса, либо через ссылку URI на отладчик:

- `node debug -p` – соединяет с процессом через `pid`
- `node debug` – соединяет с процессом через URI (типа localhost:5858)

## Интеграция V8 Inspector в Node.js

!!!note "Примечание"

    Эта фича является экспериментальной

Интеграция V8 Inspector позволяет добавить Chrome DevTools в экземпляры Node.js для отладки и профайлинга.

V8 Inspector можно включить посредством передачи флага `--inspect` при запуске приложения Node.js. Также возможно создать кастомный порт с таким флагом, например: `--inspect=9222` позволит соединения DevTools на порте `9222`.

Для завершения на первой строке кода приложения, добавьте флаг `--debug-brk` дополнительно к `--inspect`.
