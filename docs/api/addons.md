# Дополнения C++

<!--introduced_in=v0.10.0-->

<!-- type=misc -->

_Дополнения_ являются динамически связанными общими объектами, написанными на C++. В [`require()`](modules.md#requireid) функция может загружать аддоны как обычные модули Node.js. Аддоны обеспечивают интерфейс между библиотеками JavaScript и C/C++.

Есть три варианта реализации надстроек: Node-API, nan или прямое использование внутренних библиотек V8, libuv и Node.js. Если нет необходимости в прямом доступе к функциям, которые не предоставляются Node-API, используйте Node-API. Ссылаться на [Аддоны C/C++ с Node-API](n-api.md) для получения дополнительной информации о Node-API.

Когда Node-API не используется, реализация дополнений усложняется и требует знания нескольких компонентов и API:

- [V8](https://v8.dev/): библиотека C ++, которую Node.js использует для реализации JavaScript. V8 предоставляет механизмы для создания объектов, вызова функций и т. Д. API V8 документирован в основном в `v8.h` заголовочный файл (`deps/v8/include/v8.h` в дереве исходного кода Node.js), который также доступен [онлайн](https://v8docs.nodesource.com/).

- [libuv](https://github.com/libuv/libuv): Библиотека C, которая реализует цикл событий Node.js, его рабочие потоки и все асинхронное поведение платформы. Он также служит библиотекой кросс-платформенной абстракции, предоставляя простой POSIX-подобный доступ во всех основных операционных системах ко многим общим системным задачам, таким как взаимодействие с файловой системой, сокетами, таймерами и системными событиями. libuv также предоставляет абстракцию потоков, аналогичную потокам POSIX, для более сложных асинхронных надстроек, которые должны выходить за рамки стандартного цикла обработки событий. Авторам аддонов следует избегать блокировки цикла событий с помощью ввода-вывода или других задач, требующих больших затрат времени, путем разгрузки работы через libuv на неблокирующие системные операции, рабочие потоки или пользовательское использование потоков libuv.

- Внутренние библиотеки Node.js. Сам Node.js экспортирует C ++ API, которые могут использовать надстройки, наиболее важным из которых является `node::ObjectWrap` класс.

- Node.js включает другие статически связанные библиотеки, включая OpenSSL. Эти другие библиотеки расположены в `deps/` в дереве исходных кодов Node.js. Только символы libuv, OpenSSL, V8 и zlib целенаправленно реэкспортируются с помощью Node.js и могут использоваться в различной степени аддонами. Видеть [Связывание с библиотеками, включенными в Node.js](#linking-to-libraries-included-with-nodejs) для дополнительной информации.

Все следующие примеры доступны для [скачать](https://github.com/nodejs/node-addon-examples) и может использоваться как отправная точка для дополнения.

## Привет, мир

Этот пример «Hello world» представляет собой простое дополнение, написанное на C ++, которое является эквивалентом следующего кода JavaScript:

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

Все надстройки Node.js должны экспортировать функцию инициализации по шаблону:

```cpp
void Initialize(Local<Object> exports);
NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
```

Нет точки с запятой после `NODE_MODULE` так как это не функция (см. `node.h`).

В `module_name` должно соответствовать имени файла окончательного двоичного файла (исключая `.node` суффикс).

в `hello.cc` Например, тогда функция инициализации `Initialize` и имя модуля аддона `addon`.

При создании дополнений с `node-gyp`, используя макрос `NODE_GYP_MODULE_NAME` как первый параметр `NODE_MODULE()` гарантирует, что имя финального двоичного файла будет передано в `NODE_MODULE()`.

### Контекстно-зависимые надстройки

Есть среды, в которых надстройки Node.js, возможно, придется загружать несколько раз в разных контекстах. Например, [Электрон](https://electronjs.org/) среда выполнения запускает несколько экземпляров Node.js в одном процессе. У каждого экземпляра будет свой `require()` кеш, и, следовательно, каждому экземпляру потребуется собственный аддон для правильного поведения при загрузке через `require()`. Это означает, что надстройка должна поддерживать несколько инициализаций.

Контекстно-зависимый аддон можно создать с помощью макроса `NODE_MODULE_INITIALIZER`, которое расширяется до имени функции, которую Node.js ожидает найти при загрузке надстройки. Таким образом, надстройку можно инициализировать, как в следующем примере:

```cpp
using namespace v8;

extern "C" NODE_MODULE_EXPORT void
NODE_MODULE_INITIALIZER(Local<Object> exports,
                        Local<Value> module,
                        Local<Context> context) {
  /* Perform addon initialization steps here. */
}
```

Другой вариант - использовать макрос `NODE_MODULE_INIT()`, который также создаст надстройку с учетом контекста. В отличие от `NODE_MODULE()`, который используется для создания аддона вокруг заданной функции инициализатора аддона, `NODE_MODULE_INIT()` служит объявлением такого инициализатора, за которым следует тело функции.

Следующие три переменные могут использоваться внутри тела функции после вызова `NODE_MODULE_INIT()`:

- `Local<Object> exports`,
- `Local<Value> module`, а также
- `Local<Context> context`

Выбор в пользу создания надстройки с учетом контекста влечет за собой ответственность за тщательное управление глобальными статическими данными. Поскольку надстройка может загружаться несколько раз, потенциально даже из разных потоков, любые глобальные статические данные, хранящиеся в надстройке, должны быть должным образом защищены и не должны содержать никаких постоянных ссылок на объекты JavaScript. Причина этого в том, что объекты JavaScript действительны только в одном контексте и, вероятно, вызовут сбой при доступе из неправильного контекста или из другого потока, чем тот, в котором они были созданы.

Контекстно-зависимый аддон можно структурировать так, чтобы избежать глобальных статических данных, выполнив следующие шаги:

- Определите класс, который будет содержать данные для каждого экземпляра надстройки и который имеет статический член формы
  ```cpp
  static void DeleteInstance(void* data) {
    // Cast `data` to an instance of the class and delete it.
  }
  ```
- Выделите в куче экземпляр этого класса в инициализаторе аддона. Это можно сделать с помощью `new` ключевое слово.
- Вызов `node::AddEnvironmentCleanupHook()`, передав ему созданный выше экземпляр и указатель на `DeleteInstance()`. Это обеспечит удаление экземпляра при разрыве среды.
- Сохраните экземпляр класса в `v8::External`, а также
- Пройти `v8::External` ко всем методам, доступным для JavaScript, передав его в `v8::FunctionTemplate::New()` или `v8::Function::New()` который создает встроенные функции JavaScript. Третий параметр `v8::FunctionTemplate::New()` или `v8::Function::New()` принимает `v8::External` и делает его доступным в нативном обратном вызове с помощью `v8::FunctionCallbackInfo::Data()` метод.

Это гарантирует, что данные для каждого экземпляра надстройки достигнут каждой привязки, которая может быть вызвана из JavaScript. Данные для каждого экземпляра надстройки также должны передаваться в любые асинхронные обратные вызовы, которые надстройка может создать.

В следующем примере показана реализация надстройки с учетом контекста:

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

#### Поддержка рабочих

<!-- YAML
changes:
  - version:
    - v14.8.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34572
    description: Cleanup hooks may now be asynchronous.
-->

Для загрузки из нескольких сред Node.js, таких как основной поток и рабочий поток, надстройка должна:

- Быть дополнением к Node-API или
- Быть объявленным как контекстно-зависимое, используя `NODE_MODULE_INIT()` как описано выше

Чтобы поддержать [`Worker`](worker_threads.md#class-worker) потоков, аддонам необходимо очистить все ресурсы, которые они могли выделить, когда такой поток существует. Это может быть достигнуто за счет использования `AddEnvironmentCleanupHook()` функция:

```cpp
void AddEnvironmentCleanupHook(v8::Isolate* isolate,
                               void (*fun)(void* arg),
                               void* arg);
```

Эта функция добавляет ловушку, которая будет запускаться до завершения работы данного экземпляра Node.js. При необходимости такие крючки можно удалить перед запуском с помощью `RemoveEnvironmentCleanupHook()`с такой же подписью. Обратные вызовы выполняются в порядке «последний пришел - первый ушел».

При необходимости есть дополнительная пара `AddEnvironmentCleanupHook()` а также `RemoveEnvironmentCleanupHook()` перегрузки, где обработчик очистки принимает функцию обратного вызова. Это можно использовать для отключения асинхронных ресурсов, таких как любые дескрипторы libuv, зарегистрированные надстройкой.

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
  assert(!obj.IsEmpty());  // assert VM is still alive
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

// Initialize this addon to be context-aware.
NODE_MODULE_INIT(/* exports, module, context */) {
  Isolate* isolate = context->GetIsolate();

  AddEnvironmentCleanupHook(isolate, sanity_check, nullptr);
  AddEnvironmentCleanupHook(isolate, cleanup_cb2, cookie);
  AddEnvironmentCleanupHook(isolate, cleanup_cb1, isolate);
}
```

Протестируйте в JavaScript, запустив:

```js
// test.js
require('./build/Release/addon');
```

### Строительство

После того, как исходный код был написан, он должен быть скомпилирован в двоичный файл. `addon.node` файл. Для этого создайте файл с именем `binding.gyp` на верхнем уровне проекта, описывающем конфигурацию сборки модуля в формате, подобном JSON. Этот файл используется [узел-гипс](https://github.com/nodejs/node-gyp), инструмент, написанный специально для компиляции надстроек Node.js.

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

Версия `node-gyp` Утилита входит в комплект и распространяется с Node.js как часть `npm`. Эта версия не предоставляется разработчикам напрямую и предназначена только для поддержки возможности использования `npm install` команда для компиляции и установки дополнений. Разработчики, желающие использовать `node-gyp` напрямую можно установить с помощью команды `npm install -g node-gyp`. Увидеть `node-gyp` [Инструкция по установке](https://github.com/nodejs/node-gyp#installation) для получения дополнительной информации, включая требования для конкретной платформы.

Однажды `binding.gyp` файл был создан, используйте `node-gyp configure` для создания соответствующих файлов сборки проекта для текущей платформы. Это сгенерирует либо `Makefile` (на платформах Unix) или `vcxproj` файл (в Windows) в `build/` каталог.

Затем вызовите `node-gyp build` команда для генерации скомпилированного `addon.node` файл. Это будет помещено в `build/Release/` каталог.

Когда используешь `npm install` для установки надстройки Node.js npm использует собственную версию `node-gyp` для выполнения того же набора действий, генерируя скомпилированную версию аддона для платформы пользователя по запросу.

После сборки бинарный аддон можно использовать из Node.js, указав [`require()`](modules.md#requireid) к построенному `addon.node` модуль:

```js
// hello.js
const addon = require('./build/Release/addon');

console.log(addon.hello());
// Prints: 'world'
```

Поскольку точный путь к скомпилированному двоичному файлу надстройки может варьироваться в зависимости от того, как он скомпилирован (т.е. иногда он может находиться в `./build/Debug/`), аддоны могут использовать [привязки](https://github.com/TooTallNate/node-bindings) пакет для загрузки скомпилированного модуля.

В то время как `bindings` реализация пакета более сложна в том, как он находит дополнительные модули, по сути, он использует `try…catch` шаблон похож на:

```js
try {
  return require('./build/Release/addon.node');
} catch (err) {
  return require('./build/Debug/addon.node');
}
```

### Связывание с библиотеками, включенными в Node.js

Node.js использует статически связанные библиотеки, такие как V8, libuv и OpenSSL. Все дополнения должны быть связаны с V8 и могут также связываться с любыми другими зависимостями. Обычно это так же просто, как включение соответствующих `#include <...>` заявления (например, `#include <v8.h>`) а также `node-gyp` автоматически найдет соответствующие заголовки. Однако следует помнить о нескольких предостережениях:

- Когда `node-gyp` запускается, он обнаружит конкретную версию выпуска Node.js и загрузит либо полный архив исходных текстов, либо только заголовки. Если загружен полный исходный код, надстройки будут иметь полный доступ к полному набору зависимостей Node.js. Однако, если загружены только заголовки Node.js, то будут доступны только символы, экспортированные с помощью Node.js.

- `node-gyp` можно запустить с помощью `--nodedir` флаг, указывающий на локальное исходное изображение Node.js. Используя эту опцию, аддон получит доступ ко всему набору зависимостей.

### Загрузка дополнений с помощью `require()`

Расширение имени файла скомпилированного двоичного файла аддона: `.node` (в отличие от `.dll` или `.so`). В [`require()`](modules.md#requireid) функция написана для поиска файлов с `.node` расширение файла и инициализировать их как динамически подключаемые библиотеки.

При звонке [`require()`](modules.md#requireid), то `.node` расширение обычно можно опустить, и Node.js все равно найдет и инициализирует аддон. Однако есть одно предостережение: Node.js сначала попытается найти и загрузить модули или файлы JavaScript, которые имеют одно и то же базовое имя. Например, если есть файл `addon.js` в том же каталоге, что и двоичный `addon.node`, тогда [`require('addon')`](modules.md#requireid) будет отдавать предпочтение `addon.js` файл и загрузите его вместо этого.

## Нативные абстракции для Node.js

Каждый из примеров, проиллюстрированных в этом документе, напрямую использует API-интерфейсы Node.js и V8 для реализации надстроек. API V8 может и претерпел кардинальные изменения от одного выпуска V8 к другому (и от одного основного выпуска Node.js к другому). При каждом изменении может потребоваться обновление и перекомпиляция надстроек, чтобы они продолжали работать. График выпуска Node.js разработан таким образом, чтобы минимизировать частоту и влияние таких изменений, но Node.js мало что может сделать для обеспечения стабильности API V8.

В [Нативные абстракции для Node.js](https://github.com/nodejs/nan) (или `nan`) предоставляют набор инструментов, которые разработчикам аддонов рекомендуется использовать для обеспечения совместимости между прошлыми и будущими выпусками V8 и Node.js. Увидеть `nan` [Примеры](https://github.com/nodejs/nan/tree/HEAD/examples/) для иллюстрации того, как его можно использовать.

## Узел-API

> Стабильность: 2 - стабильная

Node-API - это API для создания собственных надстроек. Он не зависит от базовой среды выполнения JavaScript (например, V8) и поддерживается как часть самого Node.js. Этот API будет иметь двоичный интерфейс приложения (ABI), стабильный во всех версиях Node.js. Он предназначен для защиты надстроек от изменений в базовом движке JavaScript и позволяет модулям, скомпилированным для одной версии, работать в более поздних версиях Node.js без перекомпиляции. Аддоны создаются / упаковываются с использованием того же подхода / инструментов, которые описаны в этом документе (node-gyp и т. Д.). Единственное отличие - это набор API, которые используются в машинном коде. Вместо использования V8 или [Нативные абстракции для Node.js](https://github.com/nodejs/nan) API, используются функции, доступные в Node-API.

Создание и поддержка аддона, который выигрывает от стабильности ABI, обеспечиваемой Node-API, несет с собой определенные [соображения по реализации](n-api.md#implications-of-abi-stability).

Чтобы использовать Node-API в приведенном выше примере «Hello world», замените содержимое `hello.cc` со следующим. Все остальные инструкции остаются прежними.

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

Доступные функции и способы их использования описаны в [Аддоны C / C ++ с Node-API](n-api.md).

## Примеры аддонов

Ниже приведены несколько примеров надстроек, призванных помочь разработчикам начать работу. В примерах используются API V8. Обратитесь к онлайн [Ссылка на V8](https://v8docs.nodesource.com/) для помощи с различными вызовами V8 и V8 [Руководство по встраиванию](https://github.com/v8/v8/wiki/Embedder's%20Guide) для объяснения нескольких используемых понятий, таких как ручки, области действия, шаблоны функций и т. д.

В каждом из этих примеров используются следующие `binding.gyp` файл:

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

В случаях, когда имеется более одного `.cc` файла, просто добавьте дополнительное имя файла в `sources` множество:

```json
"sources": ["addon.cc", "myexample.cc"]
```

Однажды `binding.gyp` файл готов, примеры дополнений могут быть настроены и собраны с помощью `node-gyp`:

```console
$ node-gyp configure build
```

### Аргументы функции

Аддоны обычно предоставляют объекты и функции, к которым можно получить доступ из JavaScript, запущенного в Node.js. Когда функции вызываются из JavaScript, входные аргументы и возвращаемое значение должны отображаться в код C / C ++ и из него.

В следующем примере показано, как читать аргументы функции, переданные из JavaScript, и как вернуть результат:

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

// This is the implementation of the "add" method
// Input arguments are passed using the
// const FunctionCallbackInfo<Value>& args struct
void Add(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  // Check the number of arguments passed.
  if (args.Length() < 2) {
    // Throw an Error that is passed back to JavaScript
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

После компиляции пример надстройки может потребоваться и использоваться из Node.js:

```js
// test.js
const addon = require('./build/Release/addon');

console.log('This should be eight:', addon.add(3, 5));
```

### Обратные вызовы

В надстройках обычной практикой является передача функций JavaScript в функцию C ++ и их выполнение оттуда. В следующем примере показано, как вызывать такие обратные вызовы:

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

В этом примере используется форма с двумя аргументами `Init()` который получает полную `module` объект в качестве второго аргумента. Это позволяет аддону полностью перезаписывать `exports` с одной функцией вместо добавления функции как свойства `exports`.

Чтобы проверить это, запустите следующий JavaScript:

```js
// test.js
const addon = require('./build/Release/addon');

addon((msg) => {
  console.log(msg);
  // Prints: 'hello world'
});
```

В этом примере функция обратного вызова вызывается синхронно.

### Фабрика объектов

Аддоны могут создавать и возвращать новые объекты из функции C ++, как показано в следующем примере. Объект создается и возвращается со свойством `msg` который перекликается со строкой, переданной в `createObject()`:

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

Чтобы проверить это в JavaScript:

```js
// test.js
const addon = require('./build/Release/addon');

const obj1 = addon('hello');
const obj2 = addon('world');
console.log(obj1.msg, obj2.msg);
// Prints: 'hello world'
```

### Фабрика функций

Другой распространенный сценарий - создание функций JavaScript, которые обертывают функции C ++ и возвращают их обратно в JavaScript:

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

  // omit this to make it anonymous
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

Тестировать:

```js
// test.js
const addon = require('./build/Release/addon');

const fn = addon();
console.log(fn());
// Prints: 'hello world'
```

### Упаковка объектов C ++

Также можно обернуть объекты / классы C ++ таким образом, чтобы можно было создавать новые экземпляры с помощью JavaScript. `new` оператор:

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

Затем в `myobject.h`, класс-оболочка наследуется от `node::ObjectWrap`:

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

В `myobject.cc`, реализуйте различные методы, которые должны быть представлены. Ниже метод `plusOne()` отображается путем добавления его к прототипу конструктора:

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
  addon_data_tpl->SetInternalFieldCount(1);  // 1 field for the MyObject::New()
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

Чтобы построить этот пример, `myobject.cc` файл необходимо добавить в `binding.gyp`:

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

Проверьте это с помощью:

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

Деструктор для объекта-оболочки будет запущен, когда объект будет собран сборщиком мусора. Для тестирования деструктора есть флаги командной строки, которые можно использовать, чтобы сделать возможным принудительную сборку мусора. Эти флаги предоставляются базовым механизмом JavaScript V8. Они могут быть изменены или удалены в любое время. Они не документируются в Node.js или V8, и их никогда не следует использовать вне тестирования.

Во время завершения работы процесса или рабочих потоков деструкторы не вызываются движком JS. Поэтому ответственность за отслеживание этих объектов и обеспечение их надлежащего уничтожения во избежание утечки ресурсов лежит на пользователе.

### Фабрика упакованных предметов

В качестве альтернативы можно использовать шаблон фабрики, чтобы избежать явного создания экземпляров объекта с помощью JavaScript. `new` оператор:

```js
const obj = addon.createObject();
// instead of:
// const obj = new addon.Object();
```

Во-первых, `createObject()` метод реализован в `addon.cc`:

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

В `myobject.h`, статический метод `NewInstance()` добавлен для обработки экземпляра объекта. Этот метод заменяет использование `new` в JavaScript:

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

Реализация в `myobject.cc` аналогичен предыдущему примеру:

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

Еще раз, чтобы построить этот пример, `myobject.cc` файл необходимо добавить в `binding.gyp`:

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

Проверьте это с помощью:

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

### Передача завернутых объектов вокруг

Помимо упаковки и возврата объектов C ++, можно передавать завернутые объекты, разворачивая их с помощью вспомогательной функции Node.js. `node::ObjectWrap::Unwrap`. В следующих примерах показана функция `add()` это может занять два `MyObject` объекты в качестве входных аргументов:

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

В `myobject.h`, добавлен новый общедоступный метод, позволяющий получить доступ к закрытым значениям после разворачивания объекта.

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

Реализация `myobject.cc` похож на предыдущий:

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

Проверьте это с помощью:

```js
// test.js
const addon = require('./build/Release/addon');

const obj1 = addon.createObject(10);
const obj2 = addon.createObject(20);
const result = addon.add(obj1, obj2);

console.log(result);
// Prints: 30
```
