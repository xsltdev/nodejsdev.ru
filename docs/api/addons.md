---
title: C++ addons
description: Дополнения - это динамически компонуемые общие объекты, написанные на C++
---

# Дополнения C++

<!--introduced_in=v0.10.0-->

<!-- type=misc -->

_Аддоны_ - это динамически компонуемые общие объекты, которые можно загружать через функцию [`require()`][`require()`] как обычные модули Node.js. Аддоны предоставляют интерфейс вызова внешних функций между JavaScript и нативным кодом.

Существует три варианта реализации аддонов:

-   [Node-API][node-api] (рекомендуется)
-   `nan` ([Native Abstractions for Node.js][native abstractions for node.js])
-   прямое использование внутренних библиотек V8, libuv и Node.js

Остальная часть этого документа посвящена последнему варианту, который требует знания нескольких компонентов и API:

-   [V8][v8]: библиотека C++, которую Node.js использует для реализации JavaScript. Она предоставляет механизмы для создания объектов, вызова функций и т.д. API V8 в основном документирован в заголовочном файле `v8.h` (`deps/v8/include/v8.h` в дереве исходников Node.js), а также доступен [онлайн][v8-docs].

-   [`libuv`][`libuv`]: библиотека на языке C, которая реализует цикл событий Node.js, его рабочие потоки и все асинхронное поведение платформы. Она также служит кроссплатформенной библиотекой абстракций, предоставляя простой POSIX-подобный доступ к множеству стандартных системных задач во всех основных операционных системах, включая работу с файловой системой, сокетами, таймерами и системными событиями. libuv также предоставляет абстракцию потоков, похожую на POSIX threads, для более сложных асинхронных аддонов, которым уже недостаточно стандартного цикла событий. Авторам аддонов следует избегать блокировки цикла событий операциями ввода-вывода и другими длительными задачами, передавая работу через libuv неблокирующим системным операциям, рабочим потокам или пользовательскому использованию потоков libuv.

-   Внутренние библиотеки Node.js: сам Node.js экспортирует C++ API, которые могут использовать аддоны; важнейший из них - класс `node::ObjectWrap`.

-   Другие статически скомпонованные библиотеки (включая OpenSSL): эти библиотеки расположены в каталоге `deps/` дерева исходников Node.js. Node.js намеренно реэкспортирует только символы libuv, OpenSSL, V8 и zlib, и именно ими аддоны могут пользоваться в той или иной степени. Дополнительную информацию см. в разделе [Связывание с библиотеками, включенными в Node.js][linking to libraries included with node.js].

Все приведенные ниже примеры доступны для [загрузки][download] и могут использоваться как отправная точка для написания аддона.

## Hello world

Этот пример "Hello world" представляет собой простой аддон, написанный на C++, который эквивалентен следующему коду на JavaScript:

```js
module.exports.hello = () => 'world';
```

Сначала создайте файл `hello.cc`:

```cpp
// hello.cc
#include <node.h>

namespace demo {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::NewStringType;
using v8::Object;
using v8::String;
using v8::Value;

void Method(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(
      isolate, "world", NewStringType::kNormal).ToLocalChecked());
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "hello", Method);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize) // Примечание: без точки с запятой, это не функция

}  // namespace demo
```

На большинстве платформ можно начать со следующего `Makefile`:

<!--lint disable no-tabs remark-lint-->

```bash
NODEJS_DEV_ROOT ?= $(shell dirname "$$(command -v node)")/..
CXXFLAGS = -std=c++23 -I$(NODEJS_DEV_ROOT)/include/node -fPIC -shared -Wl,-undefined,dynamic_lookup

hello.node: hello.cc
	$(CXX) $(CXXFLAGS) -o $@ $<
```

<!--lint enable no-tabs remark-lint-->

Затем следующие команды скомпилируют и запустят код:

```console
$ make
$ node -p 'require("./hello.node").hello()'
world
```

Чтобы интегрироваться с экосистемой npm, см. [раздел сборки][building].

### Контекстно-зависимые аддоны

Аддоны, определенные с помощью `NODE_MODULE()`, нельзя одновременно загружать в нескольких контекстах или нескольких потоках.

Существуют среды, в которых аддоны Node.js могут понадобиться к загрузке несколько раз и в разных контекстах. Например, среда выполнения [Electron][electron] запускает несколько экземпляров Node.js в одном процессе. У каждого экземпляра будет собственный кэш `require()`, поэтому каждый экземпляр должен корректно работать с нативным аддоном, загруженным через `require()`. Это означает, что аддон должен поддерживать многократную инициализацию.

Контекстно-зависимый аддон можно построить с помощью макроса `NODE_MODULE_INITIALIZER`, который разворачивается в имя функции, которую Node.js ожидает найти при загрузке аддона. Инициализация аддона может выглядеть так:

```cpp
using namespace v8;

extern "C" NODE_MODULE_EXPORT void
NODE_MODULE_INITIALIZER(Local<Object> exports,
                        Local<Value> module,
                        Local<Context> context) {
  /* Здесь выполняются шаги инициализации аддона. */
}
```

Другой вариант - использовать макрос `NODE_MODULE_INIT()`, который тоже создает контекстно-зависимый аддон. В отличие от `NODE_MODULE()`, применяемого для построения аддона вокруг конкретной функции инициализации, `NODE_MODULE_INIT()` сам служит объявлением такого инициализатора, за которым сразу следует тело функции.

Внутри тела функции после вызова `NODE_MODULE_INIT()` можно использовать следующие три переменные:

-   `Local<Object> exports`,
-   `Local<Value> module`, и
-   `Local<Context> context`

При создании контекстно-зависимого аддона необходимо внимательно управлять глобальными статическими данными, чтобы обеспечить стабильность и корректность. Поскольку аддон может загружаться несколько раз, потенциально даже из разных потоков, любые глобальные статические данные, хранящиеся в аддоне, должны быть надежно защищены и не должны содержать постоянных ссылок на объекты JavaScript. Причина в том, что объекты JavaScript действительны только в одном контексте и, скорее всего, приведут к сбою при обращении к ним из неправильного контекста или из потока, отличного от того, в котором они были созданы.

Чтобы избежать использования глобальных статических данных, контекстно-зависимый аддон можно организовать следующим образом:

-   Определить класс, который будет хранить данные конкретного экземпляра аддона и иметь статический член следующего вида:

    ```cpp
    static void DeleteInstance(void* data) {
      // Приведите `data` к экземпляру класса и удалите его.
    }
    ```

-   Выделить экземпляр этого класса в куче в инициализаторе аддона. Это можно сделать с помощью ключевого слова `new`.
-   Вызвать `node::AddEnvironmentCleanupHook()`, передав созданный выше экземпляр и указатель на `DeleteInstance()`. Это гарантирует, что экземпляр будет удален при завершении среды.
-   Сохранить экземпляр класса в `v8::External`, и
-   Передать `v8::External` всем методам, экспортируемым в JavaScript, передав его в `v8::FunctionTemplate::New()` или `v8::Function::New()`, которые создают функции JavaScript, поддерживаемые нативным кодом. Третий параметр `v8::FunctionTemplate::New()` или `v8::Function::New()` принимает `v8::External` и делает его доступным в нативном callback через метод `v8::FunctionCallbackInfo::Data()`.

Это гарантирует, что данные экземпляра аддона попадут в каждую привязку, которую можно вызвать из JavaScript. Эти же данные экземпляра необходимо также передавать в любые асинхронные callback, которые может создавать аддон.

Следующий пример иллюстрирует реализацию контекстно-зависимого аддона:

```cpp
#include <node.h>

using namespace v8;

class AddonData {
 public:
  explicit AddonData(Isolate* isolate):
      call_count(0) {
    // Гарантируем удаление этих данных экземпляра аддона при очистке среды.
    node::AddEnvironmentCleanupHook(isolate, DeleteInstance, this);
  }

  // Данные конкретного экземпляра аддона.
  int call_count;

  static void DeleteInstance(void* data) {
    delete static_cast<AddonData*>(data);
  }
};

static void Method(const v8::FunctionCallbackInfo<v8::Value>& info) {
  // Получаем данные конкретного экземпляра аддона.
  AddonData* data =
      reinterpret_cast<AddonData*>(info.Data().As<External>()->Value());
  data->call_count++;
  info.GetReturnValue().Set((double)data->call_count);
}

// Инициализируем этот аддон как контекстно-зависимый.
NODE_MODULE_INIT(/* exports, module, context */) {
  Isolate* isolate = Isolate::GetCurrent();

  // Создаем новый экземпляр `AddonData` для этого экземпляра аддона и
  // привязываем его жизненный цикл к жизненному циклу среды Node.js.
  AddonData* data = new AddonData(isolate);

  // Оборачиваем данные в `v8::External`, чтобы передать их методу,
  // который мы экспортируем.
  Local<External> external = External::New(isolate, data);

  // Экспортируем метод `Method` в JavaScript и гарантируем, что он получит
  // данные конкретного экземпляра аддона, созданные выше, передавая `external`
  // как третий параметр в конструктор `FunctionTemplate`.
  exports->Set(context,
               String::NewFromUtf8(isolate, "method").ToLocalChecked(),
               FunctionTemplate::New(isolate, Method, external)
                  ->GetFunction(context).ToLocalChecked()).FromJust();
}
```

#### Поддержка Worker

<!-- YAML
changes:
  - version:
    - v14.8.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34572
    description: Cleanup hooks may now be asynchronous.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.8.0, v12.19.0 | Перехватчики очистки теперь могут быть асинхронными. |

Чтобы аддон можно было загружать из нескольких окружений Node.js, например из основного потока и потока Worker, он должен либо:

-   быть аддоном [Node-API][node-api],
-   либо быть объявлен как контекстно-зависимый с помощью `NODE_MODULE_INIT()`, как описано выше.

Чтобы поддерживать потоки [`Worker`][`worker`], аддоны должны освобождать все ресурсы, которые они могли выделить, когда такой поток завершается. Этого можно добиться с помощью функции `AddEnvironmentCleanupHook()`:

```cpp
void AddEnvironmentCleanupHook(v8::Isolate* isolate,
                               void (*fun)(void* arg),
                               void* arg);
```

Эта функция добавляет hook, который выполнится перед завершением конкретного экземпляра Node.js. При необходимости такие hook можно удалить до их выполнения с помощью `RemoveEnvironmentCleanupHook()`, имеющей ту же сигнатуру. Callback вызываются в порядке LIFO.

При необходимости существует дополнительная пара перегрузок `AddEnvironmentCleanupHook()` и `RemoveEnvironmentCleanupHook()`, где hook очистки принимает callback-функцию. Это можно использовать для корректного завершения асинхронных ресурсов, например любых дескрипторов libuv, зарегистрированных аддоном.

Следующий `addon.cc` использует `AddEnvironmentCleanupHook`:

```cpp
// addon.cc
#include <node.h>
#include <assert.h>
#include <stdlib.h>

using node::AddEnvironmentCleanupHook;
using v8::HandleScope;
using v8::Isolate;
using v8::Local;
using v8::Object;

// Примечание: в реальном приложении не полагайтесь на статические/глобальные данные.
static char cookie[] = "yum yum";
static int cleanup_cb1_called = 0;
static int cleanup_cb2_called = 0;

static void cleanup_cb1(void* arg) {
  Isolate* isolate = static_cast<Isolate*>(arg);
  HandleScope scope(isolate);
  Local<Object> obj = Object::New(isolate);
  assert(!obj.IsEmpty());  // проверяем, что VM все еще жива
  assert(obj->IsObject());
  cleanup_cb1_called++;
}

static void cleanup_cb2(void* arg) {
  assert(arg == static_cast<void*>(cookie));
  cleanup_cb2_called++;
}

static void sanity_check(void*) {
  assert(cleanup_cb1_called == 1);
  assert(cleanup_cb2_called == 1);
}

// Инициализируем этот аддон как контекстно-зависимый.
NODE_MODULE_INIT(/* exports, module, context */) {
  Isolate* isolate = Isolate::GetCurrent();

  AddEnvironmentCleanupHook(isolate, sanity_check, nullptr);
  AddEnvironmentCleanupHook(isolate, cleanup_cb2, cookie);
  AddEnvironmentCleanupHook(isolate, cleanup_cb1, isolate);
}
```

Проверьте в JavaScript, выполнив:

```js
// test.js
require('./build/Release/addon');
```

### Сборка {#building}

После написания исходного кода его необходимо скомпилировать в бинарный файл `addon.node`. Для этого создайте в корне проекта файл `binding.gyp`, описывающий конфигурацию сборки модуля в формате, похожем на JSON. Этот файл используется инструментом [`node-gyp`][`node-gyp`], специально созданным для компиляции аддонов Node.js.

```json
{
    "targets": [
        {
            "target_name": "addon",
            "sources": ["hello.cc"]
        }
    ]
}
```

Версия утилиты `node-gyp` поставляется вместе с Node.js как часть `npm`. Эта версия не предназначена для прямого использования разработчиками и нужна только для поддержки команды `npm install`, которая компилирует и устанавливает аддоны. Разработчики, которые хотят использовать `node-gyp` напрямую, могут установить его командой `npm install -g node-gyp`. Дополнительную информацию, включая требования для разных платформ, см. в [инструкции по установке][installation instructions] `node-gyp`.

После создания файла `binding.gyp` используйте команду `node-gyp configure`, чтобы сгенерировать соответствующие файлы сборки для текущей платформы. В каталоге `build/` будет создан либо `Makefile` (на Unix-платформах), либо файл `vcxproj` (в Windows).

Затем выполните команду `node-gyp build`, чтобы получить скомпилированный файл `addon.node`. Он будет помещен в каталог `build/Release/`.

Когда аддон Node.js устанавливается через `npm install`, npm использует собственную встроенную версию `node-gyp` для выполнения тех же действий и по требованию собирает скомпилированную версию аддона под платформу пользователя.

После сборки бинарный аддон можно использовать в Node.js, указав [`require()`][`require()`] на собранный модуль `addon.node`:

```js
// hello.js
const addon = require('./build/Release/addon');

console.log(addon.hello());
// Печатает: 'world'
```

Поскольку точный путь к скомпилированному бинарному файлу аддона может отличаться в зависимости от способа сборки (например, иногда это `./build/Debug/`), аддоны могут использовать пакет [bindings][bindings] для загрузки скомпилированного модуля.

Хотя реализация пакета `bindings` значительно сложнее в части поиска модулей аддонов, по сути она использует шаблон `try...catch`, похожий на следующий:

```js
try {
    return require('./build/Release/addon.node');
} catch (err) {
    return require('./build/Debug/addon.node');
}
```

### Связывание с библиотеками, включенными в Node.js {#linking-to-libraries-included-with-nodejs}

Node.js использует статически скомпонованные библиотеки, такие как V8, libuv и OpenSSL. Все аддоны должны ссылаться на V8 и могут также ссылаться на любые другие зависимости. Обычно для этого достаточно добавить соответствующие директивы `#include <...>` (например, `#include <v8.h>`), а `node-gyp` автоматически найдет нужные заголовки. Однако стоит учитывать несколько нюансов:

-   Когда запускается `node-gyp`, он определяет конкретную версию Node.js и скачивает либо полный архив исходников, либо только заголовки. Если скачан полный исходный код, аддон получает доступ ко всему набору зависимостей Node.js. Однако если скачаны только заголовки Node.js, будут доступны только символы, экспортируемые самим Node.js.

-   `node-gyp` можно запустить с флагом `--nodedir`, указывающим на локальную копию исходного кода Node.js. В этом случае аддон получит доступ ко всему набору зависимостей.

### Загрузка аддонов с помощью `require()`

Расширение имени файла скомпилированного бинарного аддона - `.node` (в отличие от `.dll` или `.so`). Функция [`require()`][`require()`] умеет искать файлы с расширением `.node` и инициализировать их как динамически компонуемые библиотеки.

При вызове [`require()`][`require()`] расширение `.node` обычно можно опустить, и Node.js все равно найдет и инициализирует аддон. Однако есть одно важное замечание: сначала Node.js попытается найти и загрузить модули или файлы JavaScript с тем же базовым именем. Например, если в том же каталоге, что и бинарный файл `addon.node`, есть файл `addon.js`, то [`require('addon')`][`require()`] отдаст приоритет файлу `addon.js` и загрузит именно его.

### Загрузка аддонов с помощью `import`

<!-- YAML
added:
  - v23.6.0
  - v22.20.0
-->

> Стабильность: 1.0 - Ранняя стадия разработки

Вы можете использовать флаг [`--experimental-addon-modules`][`--experimental-addon-modules`], чтобы включить поддержку как статического `import`, так и динамического `import()` для загрузки бинарных аддонов.

Если взять пример Hello World выше, можно сделать так:

=== "MJS"

    ```js
    // hello.mjs
    import myAddon from './hello.node';
    // Примечание: import {hello} from './hello.node' не сработает

    console.log(myAddon.hello());
    ```

```console
$ node --experimental-addon-modules hello.mjs
world
```

## Нативные абстракции для Node.js

Каждый из примеров в этом документе напрямую использует API Node.js и V8 для реализации аддонов. API V8 может значительно меняться от одной версии V8 к другой (и от одного мажорного релиза Node.js к следующему). При каждом таком изменении аддоны может потребоваться обновлять и пересобирать, чтобы они продолжали работать. График релизов Node.js спроектирован так, чтобы минимизировать частоту и влияние подобных изменений, но обеспечить стабильность API V8 сам Node.js практически не может.

[Native Abstractions for Node.js][native abstractions for node.js] (или `nan`) предоставляют набор инструментов, которые разработчикам аддонов рекомендуется использовать для сохранения совместимости между прошлыми и будущими релизами V8 и Node.js. Пример использования см. в [examples][examples] для `nan`.

## Node-API

> Стабильность: 2 - Стабильная

См. [C/C++ addons with Node-API][node-api].

## Примеры аддонов

Ниже приведены несколько примеров аддонов, призванных помочь разработчикам начать работу. Эти примеры используют API V8. Для справки по различным вызовам V8 обращайтесь к онлайн-документации [V8 reference][v8-docs], а к [Embedder's Guide][embedder's guide] V8 - за объяснением таких понятий, как дескрипторы, области видимости, шаблоны функций и т.д.

Во всех этих примерах используется следующий файл `binding.gyp`:

```json
{
    "targets": [
        {
            "target_name": "addon",
            "sources": ["addon.cc"]
        }
    ]
}
```

Если используется более одного файла `.cc`, просто добавьте дополнительное имя файла в массив `sources`:

```json
"sources": ["addon.cc", "myexample.cc"]
```

Когда файл `binding.gyp` готов, примеры аддонов можно настроить и собрать с помощью `node-gyp`:

```bash
node-gyp configure build
```

### Аргументы функций

Обычно аддоны экспортируют объекты и функции, доступные из JavaScript, выполняющегося внутри Node.js. Когда функции вызываются из JavaScript, входные аргументы и возвращаемое значение необходимо преобразовывать в код C/C++ и обратно.

Следующий пример показывает, как читать аргументы функции, переданные из JavaScript, и как возвращать результат:

```cpp
// addon.cc
#include <node.h>

namespace demo {

using v8::Exception;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

// Это реализация метода "add"
// Входные аргументы передаются через
// структуру const FunctionCallbackInfo<Value>& args
void Add(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  // Проверяем количество переданных аргументов.
  if (args.Length() < 2) {
    // Выбрасываем Error, который будет передан обратно в JavaScript
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate,
                            "Wrong number of arguments").ToLocalChecked()));
    return;
  }

  // Проверяем типы аргументов
  if (!args[0]->IsNumber() || !args[1]->IsNumber()) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate,
                            "Wrong arguments").ToLocalChecked()));
    return;
  }

  // Выполняем операцию
  double value =
      args[0].As<Number>()->Value() + args[1].As<Number>()->Value();
  Local<Number> num = Number::New(isolate, value);

  // Устанавливаем возвращаемое значение (через переданный
  // FunctionCallbackInfo<Value>&)
  args.GetReturnValue().Set(num);
}

void Init(Local<Object> exports) {
  NODE_SET_METHOD(exports, "add", Add);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Init)

}  // namespace demo
```

После компиляции пример аддона можно подключить и использовать из Node.js:

```js
// test.js
const addon = require('./build/Release/addon');

console.log('Здесь должно быть восемь:', addon.add(3, 5));
```

### Callback-функции

В аддонах распространена практика передачи JavaScript-функций в функцию C++ и их вызова оттуда. Следующий пример показывает, как вызывать такие callback:

```cpp
// addon.cc
#include <node.h>

namespace demo {

using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Null;
using v8::Object;
using v8::String;
using v8::Value;

void RunCallback(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  Local<Context> context = isolate->GetCurrentContext();
  Local<Function> cb = Local<Function>::Cast(args[0]);
  const unsigned argc = 1;
  Local<Value> argv[argc] = {
      String::NewFromUtf8(isolate,
                          "hello world").ToLocalChecked() };
  cb->Call(context, Null(isolate), argc, argv).ToLocalChecked();
}

void Init(Local<Object> exports, Local<Object> module) {
  NODE_SET_METHOD(module, "exports", RunCallback);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Init)

}  // namespace demo
```

В этом примере используется двухаргументная форма `Init()`, получающая полный объект `module` в качестве второго аргумента. Это позволяет аддону полностью перезаписать `exports` одной функцией вместо добавления функции как свойства `exports`.

Для проверки выполните следующий JavaScript:

```js
// test.js
const addon = require('./build/Release/addon');

addon((msg) => {
    console.log(msg);
    // Печатает: 'hello world'
});
```

В этом примере callback-функция вызывается синхронно.

### Фабрика объектов

Аддоны могут создавать и возвращать новые объекты прямо из функции C++, как показано в следующем примере. Создается и возвращается объект со свойством `msg`, которое повторяет строку, переданную в `createObject()`:

```cpp
// addon.cc
#include <node.h>

namespace demo {

using v8::Context;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

void CreateObject(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  Local<Context> context = isolate->GetCurrentContext();

  Local<Object> obj = Object::New(isolate);
  obj->Set(context,
           String::NewFromUtf8(isolate,
                               "msg").ToLocalChecked(),
                               args[0]->ToString(context).ToLocalChecked())
           .FromJust();

  args.GetReturnValue().Set(obj);
}

void Init(Local<Object> exports, Local<Object> module) {
  NODE_SET_METHOD(module, "exports", CreateObject);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Init)

}  // namespace demo
```

Чтобы протестировать это в JavaScript:

```js
// test.js
const addon = require('./build/Release/addon');

const obj1 = addon('hello');
const obj2 = addon('world');
console.log(obj1.msg, obj2.msg);
// Печатает: 'hello world'
```

### Фабрика функций

Еще один распространенный сценарий - создание JavaScript-функций, которые оборачивают функции C++, и возврат этих функций обратно в JavaScript:

```cpp
// addon.cc
#include <node.h>

namespace demo {

using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

void MyFunction(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(
      isolate, "hello world").ToLocalChecked());
}

void CreateFunction(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  Local<Context> context = isolate->GetCurrentContext();
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, MyFunction);
  Local<Function> fn = tpl->GetFunction(context).ToLocalChecked();

  // Уберите это, чтобы сделать функцию анонимной
  fn->SetName(String::NewFromUtf8(
      isolate, "theFunction").ToLocalChecked());

  args.GetReturnValue().Set(fn);
}

void Init(Local<Object> exports, Local<Object> module) {
  NODE_SET_METHOD(module, "exports", CreateFunction);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Init)

}  // namespace demo
```

Для проверки:

```js
// test.js
const addon = require('./build/Release/addon');

const fn = addon();
console.log(fn());
// Печатает: 'hello world'
```

### Обертывание объектов C++

Также можно оборачивать объекты/классы C++ так, чтобы новые экземпляры можно было создавать с помощью оператора JavaScript `new`:

```cpp
// addon.cc
#include <node.h>
#include "myobject.h"

namespace demo {

using v8::Local;
using v8::Object;

void InitAll(Local<Object> exports) {
  MyObject::Init(exports);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, InitAll)

}  // namespace demo
```

Затем в `myobject.h` класс-обертка наследуется от `node::ObjectWrap`:

```cpp
// myobject.h
#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <node.h>
#include <node_object_wrap.h>

namespace demo {

class MyObject : public node::ObjectWrap {
 public:
  static void Init(v8::Local<v8::Object> exports);

 private:
  explicit MyObject(double value = 0);
  ~MyObject();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void PlusOne(const v8::FunctionCallbackInfo<v8::Value>& args);

  double value_;
};

}  // namespace demo

#endif
```

В `myobject.cc` реализуйте методы, которые должны быть экспортированы. В следующем коде метод `plusOne()` экспортируется путем добавления его в прототип конструктора:

```cpp
// myobject.cc
#include "myobject.h"

namespace demo {

using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::ObjectTemplate;
using v8::String;
using v8::Value;

MyObject::MyObject(double value) : value_(value) {
}

MyObject::~MyObject() {
}

void MyObject::Init(Local<Object> exports) {
  Isolate* isolate = Isolate::GetCurrent();
  Local<Context> context = isolate->GetCurrentContext();

  Local<ObjectTemplate> addon_data_tpl = ObjectTemplate::New(isolate);
  addon_data_tpl->SetInternalFieldCount(1);  // 1 поле для MyObject::New()
  Local<Object> addon_data =
      addon_data_tpl->NewInstance(context).ToLocalChecked();

  // Подготавливаем шаблон конструктора
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New, addon_data);
  tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Прототип
  NODE_SET_PROTOTYPE_METHOD(tpl, "plusOne", PlusOne);

  Local<Function> constructor = tpl->GetFunction(context).ToLocalChecked();
  addon_data->SetInternalField(0, constructor);
  exports->Set(context, String::NewFromUtf8(
      isolate, "MyObject").ToLocalChecked(),
      constructor).FromJust();
}

void MyObject::New(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  Local<Context> context = isolate->GetCurrentContext();

  if (args.IsConstructCall()) {
    // Вызывается как конструктор: `new MyObject(...)`
    double value = args[0]->IsUndefined() ?
        0 : args[0]->NumberValue(context).FromMaybe(0);
    MyObject* obj = new MyObject(value);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  } else {
    // Вызывается как обычная функция `MyObject(...)`, превращаем в вызов конструктора.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Function> cons =
        args.Data().As<Object>()->GetInternalField(0)
            .As<Value>().As<Function>();
    Local<Object> result =
        cons->NewInstance(context, argc, argv).ToLocalChecked();
    args.GetReturnValue().Set(result);
  }
}

void MyObject::PlusOne(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  MyObject* obj = ObjectWrap::Unwrap<MyObject>(args.This());
  obj->value_ += 1;

  args.GetReturnValue().Set(Number::New(isolate, obj->value_));
}

}  // namespace demo
```

Чтобы собрать этот пример, файл `myobject.cc` необходимо добавить в `binding.gyp`:

```json
{
    "targets": [
        {
            "target_name": "addon",
            "sources": ["addon.cc", "myobject.cc"]
        }
    ]
}
```

Протестируйте его:

```js
// test.js
const addon = require('./build/Release/addon');

const obj = new addon.MyObject(10);
console.log(obj.plusOne());
// Печатает: 11
console.log(obj.plusOne());
// Печатает: 12
console.log(obj.plusOne());
// Печатает: 13
```

Деструктор объекта-обертки будет вызван, когда объект будет собран сборщиком мусора. Для тестирования деструкторов существуют флаги командной строки, позволяющие принудительно запускать сборку мусора. Эти флаги предоставляются базовым движком JavaScript V8. Они могут измениться или быть удалены в любой момент. Node.js и V8 их не документируют, и использовать их вне тестирования никогда не следует.

При завершении процесса или потоков Worker деструкторы движком JS не вызываются. Поэтому ответственность за отслеживание этих объектов и их корректное уничтожение во избежание утечек ресурсов лежит на пользователе.

### Фабрика обернутых объектов

В качестве альтернативы можно использовать паттерн фабрики, чтобы не создавать экземпляры объектов явно через оператор JavaScript `new`:

```js
const obj = addon.createObject();
// вместо:
// const obj = new addon.Object();
```

Сначала метод `createObject()` реализуется в `addon.cc`:

```cpp
// addon.cc
#include <node.h>
#include "myobject.h"

namespace demo {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

void CreateObject(const FunctionCallbackInfo<Value>& args) {
  MyObject::NewInstance(args);
}

void InitAll(Local<Object> exports, Local<Object> module) {
  MyObject::Init();

  NODE_SET_METHOD(module, "exports", CreateObject);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, InitAll)

}  // namespace demo
```

В `myobject.h` добавляется статический метод `NewInstance()`, отвечающий за создание объекта. Этот метод заменяет использование `new` в JavaScript:

```cpp
// myobject.h
#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <node.h>
#include <node_object_wrap.h>

namespace demo {

class MyObject : public node::ObjectWrap {
 public:
  static void Init();
  static void NewInstance(const v8::FunctionCallbackInfo<v8::Value>& args);

 private:
  explicit MyObject(double value = 0);
  ~MyObject();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void PlusOne(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Global<v8::Function> constructor;
  double value_;
};

}  // namespace demo

#endif
```

Реализация в `myobject.cc` похожа на предыдущий пример:

```cpp
// myobject.cc
#include <node.h>
#include "myobject.h"

namespace demo {

using node::AddEnvironmentCleanupHook;
using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Global;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

// Внимание! Это не потокобезопасно, такой аддон нельзя использовать
// в потоках worker.
Global<Function> MyObject::constructor;

MyObject::MyObject(double value) : value_(value) {
}

MyObject::~MyObject() {
}

void MyObject::Init() {
  Isolate* isolate = Isolate::GetCurrent();
  // Подготавливаем шаблон конструктора
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Прототип
  NODE_SET_PROTOTYPE_METHOD(tpl, "plusOne", PlusOne);

  Local<Context> context = isolate->GetCurrentContext();
  constructor.Reset(isolate, tpl->GetFunction(context).ToLocalChecked());

  AddEnvironmentCleanupHook(isolate, [](void*) {
    constructor.Reset();
  }, nullptr);
}

void MyObject::New(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  Local<Context> context = isolate->GetCurrentContext();

  if (args.IsConstructCall()) {
    // Вызывается как конструктор: `new MyObject(...)`
    double value = args[0]->IsUndefined() ?
        0 : args[0]->NumberValue(context).FromMaybe(0);
    MyObject* obj = new MyObject(value);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  } else {
    // Вызывается как обычная функция `MyObject(...)`, превращаем в вызов конструктора.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Function> cons = Local<Function>::New(isolate, constructor);
    Local<Object> instance =
        cons->NewInstance(context, argc, argv).ToLocalChecked();
    args.GetReturnValue().Set(instance);
  }
}

void MyObject::NewInstance(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  const unsigned argc = 1;
  Local<Value> argv[argc] = { args[0] };
  Local<Function> cons = Local<Function>::New(isolate, constructor);
  Local<Context> context = isolate->GetCurrentContext();
  Local<Object> instance =
      cons->NewInstance(context, argc, argv).ToLocalChecked();

  args.GetReturnValue().Set(instance);
}

void MyObject::PlusOne(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  MyObject* obj = ObjectWrap::Unwrap<MyObject>(args.This());
  obj->value_ += 1;

  args.GetReturnValue().Set(Number::New(isolate, obj->value_));
}

}  // namespace demo
```

И снова, чтобы собрать этот пример, файл `myobject.cc` необходимо добавить в `binding.gyp`:

```json
{
    "targets": [
        {
            "target_name": "addon",
            "sources": ["addon.cc", "myobject.cc"]
        }
    ]
}
```

Протестируйте его:

```js
// test.js
const createObject = require('./build/Release/addon');

const obj = createObject(10);
console.log(obj.plusOne());
// Печатает: 11
console.log(obj.plusOne());
// Печатает: 12
console.log(obj.plusOne());
// Печатает: 13

const obj2 = createObject(20);
console.log(obj2.plusOne());
// Печатает: 21
console.log(obj2.plusOne());
// Печатает: 22
console.log(obj2.plusOne());
// Печатает: 23
```

### Передача обернутых объектов

Помимо оборачивания и возврата объектов C++, можно передавать обернутые объекты дальше, разворачивая их с помощью вспомогательной функции Node.js `node::ObjectWrap::Unwrap`. Следующий пример показывает функцию `add()`, которая может принимать два объекта `MyObject` как входные аргументы:

```cpp
// addon.cc
#include <node.h>
#include <node_object_wrap.h>
#include "myobject.h"

namespace demo {

using v8::Context;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

void CreateObject(const FunctionCallbackInfo<Value>& args) {
  MyObject::NewInstance(args);
}

void Add(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  Local<Context> context = isolate->GetCurrentContext();

  MyObject* obj1 = node::ObjectWrap::Unwrap<MyObject>(
      args[0]->ToObject(context).ToLocalChecked());
  MyObject* obj2 = node::ObjectWrap::Unwrap<MyObject>(
      args[1]->ToObject(context).ToLocalChecked());

  double sum = obj1->value() + obj2->value();
  args.GetReturnValue().Set(Number::New(isolate, sum));
}

void InitAll(Local<Object> exports) {
  MyObject::Init();

  NODE_SET_METHOD(exports, "createObject", CreateObject);
  NODE_SET_METHOD(exports, "add", Add);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, InitAll)

}  // namespace demo
```

В `myobject.h` добавляется новый публичный метод, позволяющий получить доступ к приватным значениям после разворачивания объекта.

```cpp
// myobject.h
#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <node.h>
#include <node_object_wrap.h>

namespace demo {

class MyObject : public node::ObjectWrap {
 public:
  static void Init();
  static void NewInstance(const v8::FunctionCallbackInfo<v8::Value>& args);
  inline double value() const { return value_; }

 private:
  explicit MyObject(double value = 0);
  ~MyObject();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Global<v8::Function> constructor;
  double value_;
};

}  // namespace demo

#endif
```

Реализация `myobject.cc` остается похожей на предыдущую версию:

```cpp
// myobject.cc
#include <node.h>
#include "myobject.h"

namespace demo {

using node::AddEnvironmentCleanupHook;
using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Global;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

// Внимание! Это не потокобезопасно, такой аддон нельзя использовать
// в потоках worker.
Global<Function> MyObject::constructor;

MyObject::MyObject(double value) : value_(value) {
}

MyObject::~MyObject() {
}

void MyObject::Init() {
  Isolate* isolate = Isolate::GetCurrent();
  // Подготавливаем шаблон конструктора
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  Local<Context> context = isolate->GetCurrentContext();
  constructor.Reset(isolate, tpl->GetFunction(context).ToLocalChecked());

  AddEnvironmentCleanupHook(isolate, [](void*) {
    constructor.Reset();
  }, nullptr);
}

void MyObject::New(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  Local<Context> context = isolate->GetCurrentContext();

  if (args.IsConstructCall()) {
    // Вызывается как конструктор: `new MyObject(...)`
    double value = args[0]->IsUndefined() ?
        0 : args[0]->NumberValue(context).FromMaybe(0);
    MyObject* obj = new MyObject(value);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  } else {
    // Вызывается как обычная функция `MyObject(...)`, превращаем в вызов конструктора.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Function> cons = Local<Function>::New(isolate, constructor);
    Local<Object> instance =
        cons->NewInstance(context, argc, argv).ToLocalChecked();
    args.GetReturnValue().Set(instance);
  }
}

void MyObject::NewInstance(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  const unsigned argc = 1;
  Local<Value> argv[argc] = { args[0] };
  Local<Function> cons = Local<Function>::New(isolate, constructor);
  Local<Context> context = isolate->GetCurrentContext();
  Local<Object> instance =
      cons->NewInstance(context, argc, argv).ToLocalChecked();

  args.GetReturnValue().Set(instance);
}

}  // namespace demo
```

Протестируйте его:

```js
// test.js
const addon = require('./build/Release/addon');

const obj1 = addon.createObject(10);
const obj2 = addon.createObject(20);
const result = addon.add(obj1, obj2);

console.log(result);
// Печатает: 30
```

[building]: #building
[electron]: https://electronjs.org/
[embedder's guide]: https://v8.dev/docs/embed
[linking to libraries included with node.js]: #linking-to-libraries-included-with-nodejs
[native abstractions for node.js]: https://github.com/nodejs/nan
[node-api]: n-api.md
[v8]: https://v8.dev/
[`--experimental-addon-modules`]: cli.md#--experimental-addon-modules
[`worker`]: worker_threads.md#class-worker
[`libuv`]: https://github.com/libuv/libuv
[`node-gyp`]: https://github.com/nodejs/node-gyp
[`require()`]: modules.md#requireid
[bindings]: https://github.com/TooTallNate/node-bindings
[download]: https://github.com/nodejs/node-addon-examples
[examples]: https://github.com/nodejs/nan/tree/HEAD/examples/
[installation instructions]: https://github.com/nodejs/node-gyp#installation
[v8-docs]: https://v8docs.nodesource.com/
