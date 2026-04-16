---
title: API встраивания C++
description: C++ API Node.js для выполнения JavaScript в среде Node.js из других приложений на C++
---

# C++ API для встраивания

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/embedding.html)

<!--introduced_in=v12.19.0-->

Node.js предоставляет ряд C++ API для выполнения JavaScript в среде Node.js из другого ПО на C++.

Документация по этим API находится в файле [src/node.h][src/node.h] в дереве исходного кода Node.js. Помимо API Node.js, часть необходимых понятий задаётся API встраивания V8.

Поскольку использование Node.js как встраиваемой библиотеки отличается от кода, который запускает сам Node.js, несовместимые изменения не следуют обычной [политике устаревания Node.js][deprecation policy] и могут появляться в каждом мажорном релизе semver без предварительного предупреждения.

## Пример приложения для встраивания

В следующих разделах кратко описано, как с помощью этих API с нуля собрать приложение, эквивалентное `node -e <code>`, то есть принимающее фрагмент JavaScript и выполняющее его в среде, характерной для Node.js.

Полный код см. [в дереве исходного кода Node.js][embedtest.cc].

### Настройка состояния процесса

Для работы Node.js нужно управление состоянием на уровне процесса:

* разбор аргументов и [опций CLI][CLI options] Node.js;
* требования V8 к процессу, в частности экземпляр `v8::Platform`.

В примере ниже показано, как это настроить. Некоторые имена классов взяты из пространств имён C++ `node` и `v8` соответственно.

```cpp
int main(int argc, char** argv) {
  argv = uv_setup_args(argc, argv);
  std::vector<std::string> args(argv, argv + argc);
  // Разбор опций CLI Node.js и вывод ошибок, возникших при разборе.
  std::unique_ptr<node::InitializationResult> result =
      node::InitializeOncePerProcess(args, {
        node::ProcessInitializationFlags::kNoInitializeV8,
        node::ProcessInitializationFlags::kNoInitializeNodeV8Platform
      });

  for (const std::string& error : result->errors())
    fprintf(stderr, "%s: %s\n", args[0].c_str(), error.c_str());
  if (result->early_return() != 0) {
    return result->exit_code();
  }

  // Создать экземпляр v8::Platform. MultiIsolatePlatform::Create() —
  // способ получить v8::Platform, который Node.js использует при создании
  // потоков Worker. Без экземпляра MultiIsolatePlatform потоки Worker отключены.
  std::unique_ptr<MultiIsolatePlatform> platform =
      MultiIsolatePlatform::Create(4);
  V8::InitializePlatform(platform.get());
  V8::Initialize();

  // Содержимое этой функции — ниже.
  int ret = RunNodeInstance(
      platform.get(), result->args(), result->exec_args());

  V8::Dispose();
  V8::DisposePlatform();

  node::TearDownOncePerProcess();
  return ret;
}
```

### Настройка состояния экземпляра

<!-- YAML
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35597
    description:
      The `CommonEnvironmentSetup` and `SpinEventLoop` utilities were added.
-->

В Node.js есть понятие «экземпляр Node.js», обычно обозначаемый как `node::Environment`. С каждым `node::Environment` связано:

* ровно один `v8::Isolate` (один экземпляр JS-движка);
* ровно один `uv_loop_t` (один цикл событий);
* несколько `v8::Context`, но ровно один основной `v8::Context`;
* один `node::IsolateData` с данными, которые могут разделяться несколькими `node::Environment`. Встраивающий код должен гарантировать, что `node::IsolateData` разделяется только между `node::Environment`, использующими один и тот же `v8::Isolate`; Node.js эту проверку не выполняет.

Чтобы настроить `v8::Isolate`, нужен `v8::ArrayBuffer::Allocator`. Вариант по умолчанию — аллокатор Node.js через `node::ArrayBufferAllocator::Create()`. Он даёт небольшой выигрыш в производительности, когда аддоны используют C++ API `Buffer` Node.js, и нужен для учёта памяти `ArrayBuffer` в [`process.memoryUsage()`](process.md#processmemoryusage).

Кроме того, каждый `v8::Isolate`, используемый экземпляром Node.js, нужно регистрировать и снимать с регистрации на `MultiIsolatePlatform`, если он используется, чтобы платформа знала, какой цикл событий применять для задач, планируемых этим `v8::Isolate`.

Вспомогательная функция `node::NewIsolate()` создаёт `v8::Isolate`, настраивает его хуками Node.js (включая обработчик ошибок Node.js) и регистрирует на платформе автоматически.

```cpp
int RunNodeInstance(MultiIsolatePlatform* platform,
                    const std::vector<std::string>& args,
                    const std::vector<std::string>& exec_args) {
  int exit_code = 0;

  // Цикл libuv, v8::Isolate и окружение Node.js.
  std::vector<std::string> errors;
  std::unique_ptr<CommonEnvironmentSetup> setup =
      CommonEnvironmentSetup::Create(platform, &errors, args, exec_args);
  if (!setup) {
    for (const std::string& err : errors)
      fprintf(stderr, "%s: %s\n", args[0].c_str(), err.c_str());
    return 1;
  }

  Isolate* isolate = setup->isolate();
  Environment* env = setup->env();

  {
    Locker locker(isolate);
    Isolate::Scope isolate_scope(isolate);
    HandleScope handle_scope(isolate);
    // v8::Context нужно войти при вызовах node::CreateEnvironment() и node::LoadEnvironment().
    Context::Scope context_scope(setup->context());

    // Настроить экземпляр Node.js и выполнить код.
    // Есть вариант с колбэком, которому передаются объекты `require` и `process`
    // для ручной компиляции и запуска скриптов.
    // `require` в этом скрипте *не* обращается к файловой системе и может подгружать
    // только встроенные модули Node.js.
    // `module.createRequire()` используется, чтобы создать функцию, которая может
    // загружать файлы с диска стандартным загрузчиком CommonJS вместо внутреннего `require`.
    MaybeLocal<Value> loadenv_ret = node::LoadEnvironment(
        env,
        "const publicRequire ="
        "  require('node:module').createRequire(process.cwd() + '/');"
        "globalThis.require = publicRequire;"
        "require('node:vm').runInThisContext(process.argv[1]);");

    if (loadenv_ret.IsEmpty())  // Произошло исключение JavaScript.
      return 1;

    exit_code = node::SpinEventLoop(env).FromMaybe(1);

    // node::Stop() можно вызвать, чтобы явно остановить цикл событий и не давать
    // дальше выполнять JavaScript. Вызов допустим с любого потока и ведёт себя
    // как worker.terminate(), если вызван не из основного потока воркера.
    node::Stop(env);
  }

  return exit_code;
}
```

[CLI options]: cli.md
[`process.memoryUsage()`]: process.md#processmemoryusage
[deprecation policy]: deprecations.md
[embedtest.cc]: https://github.com/nodejs/node/blob/HEAD/test/embedding/embedtest.cc
[src/node.h]: https://github.com/nodejs/node/blob/HEAD/src/node.h
