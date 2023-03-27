---
description: Node.js предоставляет ряд C++ API, которые можно использовать для выполнения JavaScript в среде Node.js из других C++ программ
---

# C++ API для встраивания

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/embedding.html)

Node.js предоставляет ряд C++ API, которые можно использовать для выполнения JavaScript в среде Node.js из других C++ программ.

Документацию по этим API можно найти в [src/node.h](https://github.com/nodejs/node/blob/HEAD/src/node.h) в дереве исходных текстов Node.js. В дополнение к API, предоставляемым Node.js, некоторые необходимые концепции обеспечиваются API V8 embedder.

Поскольку использование Node.js в качестве встроенной библиотеки отличается от написания кода, выполняемого Node.js, изменения, приводящие к взлому, не соответствуют типичной политике Node.js deprecation policy и могут происходить в каждом полуглавном выпуске без предварительного предупреждения.

## Пример приложения для встраивания

В следующих разделах будет представлен обзор того, как использовать эти API для создания приложения с нуля, которое будет выполнять эквивалент `node -e <code>`, т.е. брать кусок JavaScript и запускать его в среде, специфичной для Node.js.

Полный код можно найти [в дереве исходных текстов Node.js](https://github.com/nodejs/node/blob/HEAD/test/embedding/embedtest.cc).

### Настройка состояния каждого процесса

Для работы Node.js требуется некоторое управление состоянием каждого процесса:

- Разбор аргументов для Node.js [опции CLI](cli.md),
- требования V8 к процессам, такие как экземпляр `v8::Platform`.

В следующем примере показано, как их можно настроить. Некоторые имена классов взяты из пространств имен `node` и `v8` C++, соответственно.

```cpp
int main(int argc, char** argv) {
  argv = uv_setup_args(argc, argv);
  std::vector<std::string> args(argv, argv + argc);
  // Разбор опций Node.js CLI и вывод любых ошибок, возникших во время
  // попытке разобрать их.
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


  // Создаем экземпляр v8::Platform. `MultiIsolatePlatform::Create()` - это способ.
  // для создания экземпляра v8::Platform, который Node.js может использовать при создании
  // рабочих потоков. Когда экземпляр `MultiIsolatePlatform` отсутствует,
  // рабочие потоки отключаются.
  std::unique_ptr<MultiIsolatePlatform> platform =
      MultiIsolatePlatform::Create(4);
  V8::InitializePlatform(platform.get());
  V8::Initialize();


  // Содержание этой функции см. ниже.
  int ret = RunNodeInstance(
      platform.get(), result->args(), result->exec_args());


  V8::Dispose();
  V8::DisposePlatform();


  node::TearDownOncePerProcess();
  return ret;
}
```

### Состояние экземпляра

В Node.js есть понятие "экземпляр Node.js", который обычно называют `node::Environment`. С каждым `node::Environment` ассоциируется:

- Ровно один `v8::Isolate`, т.е. один экземпляр JS Engine,
- Ровно один `uv_loop_t`, т.е. один цикл событий, и
- Несколько `v8::Context`, но только один главный `v8::Context`.
- Один экземпляр `node::IsolateData`, содержащий информацию, которая может быть общей для нескольких `node::Environment`, использующих один и тот же `v8::Isolate`. В настоящее время тестирование этого сценария не проводилось.

Для того чтобы установить `v8::Isolate`, необходимо предоставить `v8::ArrayBuffer::Allocator`. Одним из возможных вариантов является аллокатор по умолчанию Node.js, который можно создать с помощью `node::ArrayBufferAllocator::Create()`. Использование аллокатора Node.js позволяет незначительно оптимизировать производительность, когда аддоны используют API Node.js C++ `Buffer`, и необходимо для отслеживания памяти `ArrayBuffer` в [`process.memoryUsage()`](process.md#processmemoryusage).

Кроме того, каждый `v8::Isolate`, используемый для экземпляра Node.js, должен быть зарегистрирован и снят с регистрации в экземпляре `MultiIsolatePlatform`, если он используется, чтобы платформа знала, какой цикл событий использовать для задач, запланированных `v8::Isolate`.

Вспомогательная функция `node::NewIsolate()` создает `v8::Isolate`, устанавливает на него некоторые специфичные для Node.js хуки (например, обработчик ошибок Node.js) и автоматически регистрирует его на платформе.

```cpp
int RunNodeInstance(MultiIsolatePlatform* platform,
                    const std::vector<std::string>& args,
                    const std::vector<std::string>& exec_args) {
  int exit_code = 0;

  // Setup up a libuv event loop, v8::Isolate, and Node.js Environment.
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
    // The v8::Context needs to be entered when node::CreateEnvironment() and
    // node::LoadEnvironment() are being called.
    Context::Scope context_scope(setup->context());


    // Set up the Node.js instance for execution, and run code inside of it.
    // There is also a variant that takes a callback and provides it with
    // the `require` and `process` objects, so that it can manually compile
    // and run scripts as needed.
    // The `require` function inside this script does *not* access the file
    // system, and can only load built-in Node.js modules.
    // `module.createRequire()` is being used to create one that is able to
    // load files from the disk, and uses the standard CommonJS file loader
    // instead of the internal-only `require` function.
    MaybeLocal<Value> loadenv_ret = node::LoadEnvironment(
        env,
        "const publicRequire ="
        "  require('node:module').createRequire(process.cwd() + '/');"
        "globalThis.require = publicRequire;"
        "require('node:vm').runInThisContext(process.argv[1]);");

    if (loadenv_ret.IsEmpty())  // There has been a JS exception.
      return 1;

    exit_code = node::SpinEventLoop(env).FromMaybe(1);

    // node::Stop() can be used to explicitly stop the event loop and keep
    // further JavaScript from running. It can be called from any thread,
    // and will act like worker.terminate() if called from another thread.
    node::Stop(env);
  }

  return exit_code;
}
```
