---
title: C++ addons
description: Дополнения являются динамически связанными общими объектами, написанными на C++
---

# Дополнения C++

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/addons.html)

**Аддоны** - это динамически связанные общие объекты, написанные на C++. Функция [`require()`](modules.md#requireid) может загружать аддоны как обычные модули Node.js. Аддоны обеспечивают интерфейс между JavaScript и библиотеками C/C++.

Существует три варианта реализации аддонов: Node-API, nan или прямое использование внутренних библиотек V8, libuv и Node.js. Если нет необходимости в прямом доступе к функциональности, которая не раскрывается Node-API, используйте Node-API. Дополнительную информацию о Node-API см. в [C/C++ addons with Node-API](n-api.md).

Если не использовать Node-API, реализация аддонов сложна и требует знания нескольких компонентов и API:

-   [V8](https://v8.dev/): библиотека C++, которую Node.js использует для реализации JavaScript. V8 предоставляет механизмы для создания объектов, вызова функций и т.д. API V8 документирован в основном в заголовочном файле `v8.h` (`deps/v8/include/v8.h` в дереве исходников Node.js), который также доступен [online](https://v8docs.nodesource.com/).

-   [libuv](https://github.com/libuv/libuv): Библиотека на языке Си, реализующая цикл событий Node.js, его рабочие потоки и все асинхронное поведение платформы. Она также служит кроссплатформенной библиотекой абстракций, предоставляя простой, POSIX-подобный доступ во всех основных операционных системах ко многим общим системным задачам, таким как взаимодействие с файловой системой, сокетами, таймерами и системными событиями. libuv также предоставляет абстракцию потоков, подобную POSIX-потокам, для более сложных асинхронных аддонов, которым необходимо выйти за рамки стандартного цикла событий. Авторы аддонов должны избегать блокирования цикла событий при вводе/выводе или других трудоемких задач, перегружая работу через libuv на неблокирующие системные операции, рабочие потоки или пользовательское использование потоков libuv.

-   Внутренние библиотеки Node.js. Сам Node.js экспортирует C++ API, которые могут использовать аддоны, наиболее важным из которых является класс `node::ObjectWrap`.

-   Node.js включает другие статически связанные библиотеки, включая OpenSSL. Эти другие библиотеки находятся в директории `deps/` в дереве исходников Node.js. Только символы libuv, OpenSSL, V8 и zlib целенаправленно реэкспортируются Node.js и могут в различной степени использоваться аддонами.

Все следующие примеры доступны для [загрузки](https://github.com/nodejs/node-addon-examples) и могут быть использованы в качестве отправной точки для аддона.

## Hello world

Этот пример "Hello world" представляет собой простой аддон, написанный на C++, который является эквивалентом следующего кода JavaScript:

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
using v8::Object;
using v8::String;
using v8::Value;


void Method(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(
      isolate, "world").ToLocalChecked());
}


void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "hello", Method);
}


NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)


}  // namespace demo
```

Все аддоны Node.js должны экспортировать функцию инициализации по образцу:

```cpp
void Initialize(Local<Object> exports);
NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
```

После `NODE_MODULE` не ставится точка с запятой, поскольку это не функция (см. `node.h`).

Имя `module_name` должно совпадать с именем файла конечного бинарного файла (исключая суффикс `.node`).

Так, в примере `hello.cc` функция инициализации - `Initialize`, а имя модуля аддона - `addon`.

При создании аддонов с помощью `node-gyp`, использование макроса `NODE_GYP_MODULE_NAME` в качестве первого параметра `NODE_MODULE()` обеспечит передачу имени конечного бинарного модуля в `NODE_MODULE()`.

Аддоны, определенные с помощью `NODE_MODULE()`, не могут быть загружены в нескольких контекстах или нескольких потоках одновременно.

### Контекстно-зависимые аддоны

Существуют среды, в которых аддоны Node.js могут быть загружены несколько раз в различных контекстах. Например, среда выполнения [Electron](https://electronjs.org/) запускает несколько экземпляров Node.js в одном процессе. Каждый экземпляр будет иметь свой собственный кэш `require()`, и поэтому каждому экземпляру потребуется собственный аддон для корректного поведения при загрузке через `require()`. Это означает, что аддон должен поддерживать несколько инициализаций.

Контекстно-зависимый аддон может быть построен с помощью макроса `NODE_MODULE_INITIALIZER`, который расширяется до имени функции, которую Node.js будет ожидать найти при загрузке аддона. Таким образом, аддон может быть инициализирован, как показано в следующем примере:

```cpp
using namespace v8;

extern "C" NODE_MODULE_EXPORT void
NODE_MODULE_INITIALIZER(Local<Object> exports,
                        Local<Value> module,
                        Local<Context> context) {
  /* Perform addon initialization steps here. */
}
```

Другой вариант - использовать макрос `NODE_MODULE_INIT()`, который также создаст аддон с учетом контекста. В отличие от `NODE_MODULE()`, который используется для построения аддона вокруг заданной функции инициализатора аддона, `NODE_MODULE_INIT()` служит для объявления такого инициализатора, за которым следует тело функции.

Следующие три переменные могут быть использованы в теле функции после вызова `NODE_MODULE_INIT()`:

-   `Local<Object> exports`,
-   `Local<Value> module`, и
-   `Local<Context> context`

Выбор в пользу создания контекстно-зависимого аддона влечет за собой ответственность за тщательное управление глобальными статическими данными. Поскольку аддон может быть загружен несколько раз, возможно даже из разных потоков, любые глобальные статические данные, хранящиеся в аддоне, должны быть надлежащим образом защищены и не должны содержать постоянных ссылок на объекты JavaScript. Причина этого заключается в том, что объекты JavaScript действительны только в одном контексте, и при обращении к ним из неправильного контекста или из потока, отличного от того, в котором они были созданы, скорее всего, произойдет сбой.

Контекстно-зависимый аддон может быть структурирован таким образом, чтобы избежать глобальных статических данных, выполнив следующие шаги:

-   Определите класс, который будет хранить данные для каждого экземпляра аддона и который имеет статический член вида

```cpp
static void DeleteInstance(void* data) {
	// Приводим `data` к экземпляру класса и удаляем его.
}
```

-   Выделите экземпляр этого класса в инициализаторе аддона. Это можно сделать с помощью ключевого слова `new`.

-   Вызовите `node::AddEnvironmentCleanupHook()`, передав ему созданный выше экземпляр и указатель на `DeleteInstance()`. Это гарантирует, что экземпляр будет удален, когда среда будет снесена.

-   Храните экземпляр класса в `v8::External`, и

-   Передайте `v8::External` всем методам, открываемым для JavaScript, передав его в `v8::FunctionTemplate::New()` или `v8::Function::New()`, которые создают функции JavaScript с поддержкой родного языка. Третий параметр `v8::FunctionTemplate::New()` или `v8::Function::New()` принимает `v8::External` и делает его доступным в нативном обратном вызове с помощью метода `v8::FunctionCallbackInfo::Data()`.

Это гарантирует, что данные для каждого экземпляра аддона достигнут каждого связывания, которое может быть вызвано из JavaScript. Данные экземпляра аддона также должны быть переданы в любые асинхронные обратные вызовы, которые аддон может создать.

Следующий пример иллюстрирует реализацию контекстно-зависимого аддона:

```cpp
#include <node.h>

using namespace v8;

class AddonData {
 public:
  explicit AddonData(Isolate* isolate):
      call_count(0) {
    // Ensure this per-addon-instance data is deleted at environment cleanup.
    node::AddEnvironmentCleanupHook(isolate, DeleteInstance, this);
  }

  // Per-addon data.
  int call_count;

  static void DeleteInstance(void* data) {
    delete static_cast<AddonData*>(data);
  }
};

static void Method(const v8::FunctionCallbackInfo<v8::Value>& info) {
  // Retrieve the per-addon-instance data.
  AddonData* data =
      reinterpret_cast<AddonData*>(info.Data().As<External>()->Value());
  data->call_count++;
  info.GetReturnValue().Set((double)data->call_count);
}

// Initialize this addon to be context-aware.
NODE_MODULE_INIT(/* exports, module, context */) {
  Isolate* isolate = context->GetIsolate();

  // Create a new instance of `AddonData` for this instance of the addon and
  // tie its life cycle to that of the Node.js environment.
  AddonData* data = new AddonData(isolate);

  // Wrap the data in a `v8::External` so we can pass it to the method we
  // expose.
  Local<External> external = External::New(isolate, data);

  // Expose the method `Method` to JavaScript, and make sure it receives the
  // per-addon-instance data we created above by passing `external` as the
  // third parameter to the `FunctionTemplate` constructor.
  exports->Set(context,
               String::NewFromUtf8(isolate, "method").ToLocalChecked(),
               FunctionTemplate::New(isolate, Method, external)
                  ->GetFunction(context).ToLocalChecked()).FromJust();
}
```

#### Поддержка Worker

Чтобы загружаться из нескольких окружений Node.js, таких как основной поток и рабочий поток, дополнение должно либо:

-   Быть аддоном Node-API, либо
-   быть объявлено как контекстно-зависимое с помощью `NODE_MODULE_INIT()`, как описано выше.

Для поддержки потоков [`Worker`](worker_threads.md#class-worker) аддонам необходимо очистить все ресурсы, которые они могли выделить, когда такой поток существует. Этого можно достичь с помощью функции `AddEnvironmentCleanupHook()`:

```cpp
void AddEnvironmentCleanupHook(v8::Isolate* isolate,
                               void (*fun)(void* arg),
                               void* arg);
```

Эта функция добавляет хук, который будет выполняться перед выключением данного экземпляра Node.js. При необходимости такие хуки могут быть удалены до их запуска с помощью `RemoveEnvironmentCleanupHook()`, которая имеет ту же сигнатуру. Обратные вызовы выполняются в порядке "последний-первый-выход".

При необходимости существует дополнительная пара перегрузок `AddEnvironmentCleanupHook()` и `RemoveEnvironmentCleanupHook()`, где крючок очистки принимает функцию обратного вызова. Это можно использовать для отключения асинхронных ресурсов, таких как любые обработчики `libuv`, зарегистрированные аддоном.

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


// Note: In a real-world application, do not rely on static/global data.
static char cookie[] = "yum yum";
static int cleanup_cb1_called = 0;
static int cleanup_cb2_called = 0;


static void cleanup_cb1(void* arg) {
  Isolate* isolate = static_cast<Isolate*>(arg);
  HandleScope scope(isolate);
  Local<Object> obj = Object::New(isolate);
  assert(!obj.IsEmpty()); // assert VM is still alive
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


// Инициализируем этот аддон, чтобы он был контекстно-зависимым.
NODE_MODULE_INIT(/* exports, module, context */) {
  Isolate* isolate = context->GetIsolate();


  AddEnvironmentCleanupHook(isolate, sanity_check, nullptr);
  AddEnvironmentCleanupHook(isolate, cleanup_cb2, cookie);
  AddEnvironmentCleanupHook(isolate, cleanup_cb1, isolate);
}
```

Протестируйте на JavaScript, выполнив:

```js
// test.js
require('./build/Release/addon');
```

### Сборка

После написания исходного кода его необходимо скомпилировать в бинарный файл `addon.node`. Для этого создайте файл `binding.gyp` на верхнем уровне проекта, описывающий конфигурацию сборки модуля с помощью JSON-подобного формата. Этот файл используется [node-gyp](https://github.com/nodejs/node-gyp), инструментом, написанным специально для компиляции аддонов Node.js.

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

Версия утилиты `node-gyp` поставляется и распространяется с Node.js как часть `npm`. Эта версия не предоставляется разработчикам напрямую для использования и предназначена только для поддержки возможности использования команды `npm install` для компиляции и установки аддонов. Разработчики, желающие использовать `node-gyp` напрямую, могут установить его с помощью команды `npm install -g node-gyp`. Дополнительную информацию, включая требования для конкретной платформы, смотрите в `node-gyp` [инструкции по установке](https://github.com/nodejs/node-gyp#installation).

После создания файла `binding.gyp` используйте команду `node-gyp configure` для создания соответствующих файлов сборки проекта для текущей платформы. В результате будет создан либо `Makefile` (на платформах Unix), либо `vcxproj` (на Windows) в каталоге `build/`.

Затем вызовите команду `node-gyp build` для создания скомпилированного файла `addon.node`. Он будет помещен в каталог `build/Release/`.

При использовании `npm install` для установки аддона Node.js, npm использует свою собственную версию `node-gyp` для выполнения того же набора действий, генерируя скомпилированную версию аддона для платформы пользователя по требованию.

После сборки бинарный аддон можно использовать из Node.js, указав [`require()`](modules.md#requireid) на собранный модуль `addon.node`:

```js
// hello.js
const addon = require('./build/Release/addon');

console.log(addon.hello());
// Печатает: 'world'
```

Поскольку точный путь к скомпилированному бинарному файлу аддона может меняться в зависимости от того, как он был скомпилирован (например, иногда он может находиться в `./build/Debug/`), аддоны могут использовать пакет [bindings](https://github.com/TooTallNate/node-bindings) для загрузки скомпилированного модуля.

Хотя реализация пакета `bindings` более сложна в определении местоположения модулей аддонов, по сути, она использует схему `try...catch`, подобную следующей:

```js
try {
    return require('./build/Release/addon.node');
} catch (err) {
    return require('./build/Debug/addon.node');
}
```

### Связывание с библиотеками, включенными в Node.js

Node.js использует статически связанные библиотеки, такие как V8, libuv и OpenSSL. Все аддоны должны ссылаться на V8 и могут ссылаться на любые другие зависимости. Обычно для этого достаточно включить соответствующие утверждения `#include <...>` (например, `#include <v8.h>`), и `node-gyp` автоматически найдет соответствующие заголовки. Однако есть несколько предостережений, о которых следует знать:

-   Когда `node-gyp` запускается, он определяет конкретную версию выпуска Node.js и загружает либо полный tarball исходников, либо только заголовки. Если загружается полный исходник, аддоны получат полный доступ к полному набору зависимостей Node.js. Однако если загружены только заголовки Node.js, то будут доступны только символы, экспортируемые Node.js.

-   `node-gyp` может быть запущен с флагом `--nodedir`, указывающим на локальный образ исходного кода Node.js. При использовании этой опции аддон будет иметь доступ к полному набору зависимостей.

### Загрузка аддонов с помощью `require()`

Расширение имени файла скомпилированного бинарного файла аддона - `.node` (в отличие от `.dll` или `.so`). Функция [`require()`](modules.md#requireid) написана для поиска файлов с расширением `.node` и инициализации их как динамически подключаемых библиотек.

При вызове [`require()`](modules.md#requireid) расширение `.node` обычно можно опустить, и Node.js все равно найдет и инициализирует аддон. Однако есть одна оговорка: Node.js сначала попытается найти и загрузить модули или файлы JavaScript, которые имеют одинаковое базовое имя. Например, если есть файл `addon.js` в том же каталоге, что и двоичный файл `addon.node`, то [`require('addon')`](modules.md#requireid) отдаст предпочтение файлу `addon.js` и загрузит его вместо него.

## Нативные абстракции для Node.js

Каждый из примеров, проиллюстрированных в этом документе, напрямую использует API Node.js и V8 для реализации аддонов. API V8 может значительно изменяться от одного выпуска V8 к другому (и от одного основного выпуска Node.js к другому). При каждом изменении может потребоваться обновление и перекомпиляция аддонов для продолжения их работы. График выпуска Node.js разработан таким образом, чтобы минимизировать частоту и влияние таких изменений, но Node.js мало что может сделать для обеспечения стабильности API V8.

[Native Abstractions for Node.js](https://github.com/nodejs/nan) (или `nan`) предоставляет набор инструментов, которые разработчикам аддонов рекомендуется использовать для поддержания совместимости между прошлыми и будущими выпусками V8 и Node.js. Смотрите `nan` [примеры](https://github.com/nodejs/nan/tree/HEAD/examples/) для иллюстрации того, как его можно использовать.

## Node-API

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Node-API - это API для создания собственных аддонов. Он не зависит от базовой среды выполнения JavaScript (например, V8) и поддерживается как часть самого Node.js. Этот API будет стабилен к бинарному интерфейсу приложения (ABI) во всех версиях Node.js. Он предназначен для того, чтобы изолировать аддоны от изменений в базовом движке JavaScript и позволить модулям, скомпилированным для одной версии, работать на более поздних версиях Node.js без перекомпиляции. Аддоны собираются/пакуются с использованием тех же подходов/инструментов, которые описаны в этом документе (node-gyp и т.д.). Единственное различие заключается в наборе API, которые используются родным кодом. Вместо использования API V8 или [Native Abstractions for Node.js](https://github.com/nodejs/nan) используются функции, доступные в Node-API.

Создание и поддержка аддона, пользующегося стабильностью ABI, обеспечиваемой Node-API, сопряжено с определенными [соображениями по реализации](n-api.md#implications-of-abi-stability).

Чтобы использовать Node-API в приведенном выше примере "Hello world", замените содержимое файла `hello.cc` следующим. Все остальные инструкции остаются неизменными.

```cpp
// hello.cc using Node-API
#include <node_api.h>

namespace demo {

napi_value Method(napi_env env, napi_callback_info args) {
  napi_value greeting;
  napi_status status;

  status = napi_create_string_utf8(env, "world", NAPI_AUTO_LENGTH, &greeting);
  if (status != napi_ok) return nullptr;
  return greeting;
}

napi_value init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value fn;

  status = napi_create_function(env, nullptr, 0, Method, nullptr, &fn);
  if (status != napi_ok) return nullptr;

  status = napi_set_named_property(env, exports, "hello", fn);
  if (status != napi_ok) return nullptr;
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)

}  // namespace demo
```

Доступные функции и способы их использования описаны в [C/C++ addons with Node-API](n-api.md).

## Примеры аддонов

Ниже приведены примеры аддонов, призванные помочь разработчикам начать работу. В примерах используются API V8. Обратитесь к онлайновой [V8 reference](https://v8docs.nodesource.com/) для справки по различным вызовам V8, а также к [Embedder's Guide](https://v8.dev/docs/embed) для объяснения некоторых используемых понятий, таких как дескрипторы, диапазоны, шаблоны функций и т.д.

Каждый из этих примеров использует следующий файл `binding.gyp`:

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

В случаях, когда существует более одного файла `.cc`, просто добавьте имя дополнительного файла в массив `sources`:

```json
"sources": ["addon.cc", "myexample.cc"].
```

Когда файл `binding.gyp` готов, примеры аддонов можно настроить и собрать с помощью `node-gyp`:

```console
> node-gyp configure build
```

### Аргументы функции

Аддоны обычно предоставляют объекты и функции, доступ к которым можно получить из JavaScript, запущенного в Node.js. Когда функции вызываются из JavaScript, входные аргументы и возвращаемое значение должны быть отображены в код на C/C++.

Следующий пример иллюстрирует, как читать аргументы функции, переданные из JavaScript, и как возвращать результат:

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


// Это реализация метода "add".
// Входные аргументы передаются с помощью
// const FunctionCallbackInfo<Value>& args struct
void Add(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();


  // Проверьте количество переданных аргументов.
  if (args.Length() < 2) {
    // Выброс ошибки, которая передается обратно в JavaScript
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate,
                            "Wrong number of arguments").ToLocalChecked()));
    return;
  }


  // Check the argument types
  if (!args[0]->IsNumber() || !args[1]->IsNumber()) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate,
                            "Wrong arguments").ToLocalChecked()));
    return;
  }


  // Perform the operation
  double value =
      args[0].As<Number>()->Value() + args[1].As<Number>()->Value();
  Local<Number> num = Number::New(isolate, value);


  // Set the return value (using the passed in
  // FunctionCallbackInfo<Value>&)
  args.GetReturnValue().Set(num);
}


void Init(Local<Object> exports) {
  NODE_SET_METHOD(exports, "add", Add);
}


NODE_MODULE(NODE_GYP_MODULE_NAME, Init)


}  // namespace demo
```

После компиляции пример аддона может быть востребован и использован из Node.js:

```js
// test.js
const addon = require('./build/Release/addon');

console.log('Здесь должно быть восемь:', addon.add(3, 5));
```

### Обратные вызовы

В аддонах принято передавать функции JavaScript в функцию C++ и выполнять их оттуда. В следующем примере показано, как вызывать такие обратные вызовы:

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


}  // пространство имен demo
```

В этом примере используется двухаргументная форма `Init()`, которая получает полный объект `модуля` в качестве второго аргумента. Это позволяет аддону полностью переписать `exports` одной функцией вместо того, чтобы добавлять функцию как свойство `exports`.

Чтобы проверить это, выполните следующий JavaScript:

```js
// test.js
const addon = require('./build/Release/addon');

addon((msg) => {
    console.log(msg);
    // Печатает: 'hello world'
});
```

В этом примере функция обратного вызова вызывается синхронно.

### Фабрика объектов

Аддоны могут создавать и возвращать новые объекты внутри функции C++, как показано в следующем примере. Объект создается и возвращается со свойством `msg`, которое повторяет строку, переданную в `createObject()`:

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


}  // пространство имен demo
```

Чтобы протестировать его на JavaScript:

```js
// test.js
const addon = require('./build/Release/addon');

const obj1 = addon('hello');
const obj2 = addon('world');
console.log(obj1.msg, obj2.msg);
// Печатает: 'hello world'
```

### Фабрика функций

Другой распространенный сценарий - создание функций JavaScript, которые обертывают функции C++, и возвращение этих функций обратно в JavaScript:

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


  // опустите это, чтобы сделать ее анонимной
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
// Prints: 'hello world'
```

### Обертывание объектов C++

Также можно обернуть объекты/классы C++ таким образом, чтобы можно было создавать новые экземпляры с помощью оператора JavaScript `new`:

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

Затем, в `myobject.h`, класс-обертка наследуется от `node::ObjectWrap`:

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

В файле `myobject.cc` реализуйте различные методы, которые должны быть открыты. Ниже метод `plusOne()` реализуется путем добавления его в прототип конструктора:

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
  Isolate* isolate = exports->GetIsolate();
  Local<Context> context = isolate->GetCurrentContext();


  Local<ObjectTemplate> addon_data_tpl = ObjectTemplate::New(isolate);
  addon_data_tpl->SetInternalFieldCount(1); // 1 field for the MyObject::New()
  Local<Object> addon_data =
      addon_data_tpl->NewInstance(context).ToLocalChecked();


  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New, addon_data);
  tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);


  // Prototype
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
      // Invoked as plain function `MyObject(...)`, turn into construct call.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Function> cons =
        args.Data().As<Object>()->GetInternalField(0).As<Function>();
    Local<Object> result =
        cons->NewInstance(context, argc, argv).ToLocalChecked();
    args.GetReturnValue().Set(result);
  }
}

void MyObject::PlusOne(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  MyObject* obj = ObjectWrap::Unwrap<MyObject>(args.Holder());
  obj->value_ += 1;

  args.GetReturnValue().Set(Number::New(isolate, obj->value_));
}

}  // namespace demo
```

Чтобы собрать этот пример, файл `myobject.cc` должен быть добавлен к файлу `binding.gyp`:

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
// Prints: 11
console.log(obj.plusOne());
// Prints: 12
console.log(obj.plusOne());
// Prints: 13
```

Деструктор для объекта-обертки будет запущен, когда объект будет собран. Для проверки деструктора существуют флаги командной строки, которые можно использовать для принудительной сборки мусора. Эти флаги предоставляются базовым движком V8 JavaScript. Они могут быть изменены или удалены в любое время. Они не документированы Node.js или V8, и их никогда не следует использовать вне тестирования.

При завершении процесса или рабочих потоков деструкторы не вызываются движком JS. Поэтому пользователь несет ответственность за отслеживание этих объектов и их надлежащее уничтожение во избежание утечки ресурсов.

### Фабрика обернутых объектов

В качестве альтернативы можно использовать паттерн фабрики, чтобы избежать явного создания экземпляров объектов с помощью оператора JavaScript `new`:

```js
const obj = addon.createObject();
// instead of:
// const obj = new addon.Object();
```

Во-первых, метод `createObject()` реализован в файле `addon.cc`:

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
  MyObject::Init(exports->GetIsolate());

  NODE_SET_METHOD(module, "exports", CreateObject);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, InitAll)

}  // namespace demo
```

В `myobject.h` добавлен статический метод `NewInstance()` для обработки инстанцирования объекта. Этот метод заменяет использование `new` в JavaScript:

```cpp
// myobject.h
#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <node.h>
#include <node_object_wrap.h>

namespace demo {

class MyObject : public node::ObjectWrap {
 public:
  static void Init(v8::Isolate* isolate);
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

Реализация в `myobject.cc` аналогична предыдущему примеру:

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

// Warning! This is not thread-safe, this addon cannot be used for worker
// threads.
Global<Function> MyObject::constructor;

MyObject::MyObject(double value) : value_(value) {
}

MyObject::~MyObject() {
}

void MyObject::Init(Isolate* isolate) {
  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
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
    // Invoked as constructor: `new MyObject(...)`
    double value = args[0]->IsUndefined() ?
        0 : args[0]->NumberValue(context).FromMaybe(0);
    MyObject* obj = new MyObject(value);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  } else {
    // Invoked as plain function `MyObject(...)`, turn into construct call.
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

  MyObject* obj = ObjectWrap::Unwrap<MyObject>(args.Holder());
  obj->value_ += 1;

  args.GetReturnValue().Set(Number::New(isolate, obj->value_));
}

}  // namespace demo
```

И снова, чтобы собрать этот пример, файл `myobject.cc` должен быть добавлен в `binding.gyp`:

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
// Prints: 11
console.log(obj.plusOne());
// Prints: 12
console.log(obj.plusOne());
// Prints: 13

const obj2 = createObject(20);
console.log(obj2.plusOne());
// Prints: 21
console.log(obj2.plusOne());
// Prints: 22
console.log(obj2.plusOne());
// Prints: 23
```

### Передача обернутых объектов

В дополнение к обертыванию и возврату объектов C++, можно передавать обернутые объекты, разворачивая их с помощью вспомогательной функции Node.js `node::ObjectWrap::Unwrap`. В следующих примерах показана функция `add()`, которая может принимать два объекта `MyObject` в качестве входных аргументов:

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
  MyObject::Init(exports->GetIsolate());


  NODE_SET_METHOD(exports, "createObject", CreateObject);
  NODE_SET_METHOD(exports, "add", Add);
}


NODE_MODULE(NODE_GYP_MODULE_NAME, InitAll)


}  // namespace demo
```

В `myobject.h` добавлен новый публичный метод, позволяющий получить доступ к приватным значениям после разворачивания объекта.

```cpp
// myobject.h
#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <node.h>
#include <node_object_wrap.h>

namespace demo {

class MyObject : public node::ObjectWrap {
 public:
  static void Init(v8::Isolate* isolate);
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

Реализация `myobject.cc` аналогична предыдущей:

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

// Warning! This is not thread-safe, this addon cannot be used for worker
// threads.
Global<Function> MyObject::constructor;

MyObject::MyObject(double value) : value_(value) {
}

MyObject::~MyObject() {
}

void MyObject::Init(Isolate* isolate) {
  // Prepare constructor template
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
    // Invoked as constructor: `new MyObject(...)`
    double value = args[0]->IsUndefined() ?
        0 : args[0]->NumberValue(context).FromMaybe(0);
    MyObject* obj = new MyObject(value);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  } else {
    // Invoked as plain function `MyObject(...)`, turn into construct call.
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

Протестируйте его с помощью:

```js
// test.js
const addon = require('./build/Release/addon');

const obj1 = addon.createObject(10);
const obj2 = addon.createObject(20);
const result = addon.add(obj1, obj2);

console.log(result);
// Печатает: 30
```
