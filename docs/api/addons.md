# С/С++ Addons

**Аддоны Node.js** – это динамически подключаемые объекты, написанные на C или С++, которые могут быть загружены в Node.js посредством функции `require()` и использованы так, как будто они являются обычным модулем Node.js. Они используются в основном для того чтобы реализовать интерфейс между JavaScript на Node.js и библиотеками С/С++.

На данный момент метод для реализации аддонов является довольно сложным, требующим знания некоторых компонентов и API.

- **V8**: С++ библиотека Node.js, на текущий момент используемая для реализации JavaScript. V8 предоставляет механизмы для создания объектов, вызова функций и т. п. API V8 задокументировано главным образом в хэдер-файле `v8.h` (`deps/v8/include/v8.h`) в дереве Node.js, которое так же есть в онлайне
- **libuv**: библиотека на С, которая реализует цикл обработки событий в Node.js, его рабочие потоки и все асинхронные поведения платформы. Она также предоставляет кроссплатформенную абстрактную библиотеку, POSIX доступ ко всем основным операционным системам для общих системных задач, таких, как взаимодействие с файловой системой, сокеты, таймеры и системные события. libuv также работает с поточной абстракцией типа pthread, которая используется для запуска более сложных асинхронных аддонов, выходящих за рамки стандартного цикла обработки событий.
- Внутренние библиотеки Node.js. Сам Node.js экспортирует большое количество C/C++ API, которые могут быть использованы аддонами, самый важный из которых - это класс `node::ObjectWrap`
- Node.js включает в себя другие статичные библиотеки, в том числе OpenSSL. Эти библиотеки находятся в директории `deps/` дерева Node.js. Только символы V8 и OpenSSL специально ре-экспортируются Node.js и могут быть использованы аддонами в разной степени.

Все последующие примеры доступны для скачивания на [гитхабе](https://github.com/nodejs/node-addon-examples) и могут быть использованы как основа для создания собственного аддона

## Hello world

Простой пример "Hello world" - аддон. написанный на С++, являющийся эквивалентом нижеприведенному JavaScript коду:

```js
module.exports.hello = () => 'world';
```

Сначала нужно создать файл `hello.cc`:

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
		args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
	}

	void init(Local <Object> exports) {
		NODE_SET_METHOD(exports, "hello", Method);
	}

	NODE_MODULE(addon, init)
}
// namespace demo
```

Следует заметить, что все аддоны в Node.js должны экспортировать фукцию инициализации по следующему шаблону:

```cpp
void Initialize(Local <Object> exports);
NODE_MODULE(module_name, Initialize)
```

После `NODE_MODULE` нет точки с запятой, как как это не функция (см. `node.h`)

`module_name` должно совпадать с окончательным именем бинарного файла (без суффикса `.node`)

В примере `hello.cc` функцией инициализации является `init`, а имя модуля аддона - `addon`

### Сборка

После того, как исходный код был написан, нужно скомпилировать его в бинарный файл `addon.node`. Для этого создается файл `binding.gyp` в верхушке проекта, описывающего конфигурацию вашего модуля в формате JSON. Этот файл будет использован [node-gyp](https://github.com/nodejs/node-gyp) инструментом, написанным специально для того, чтобы компилировать аддоны Node.js.

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

!!! note "Примечание"

    Версия утилиты node-gyp поставляется вместе с Node.js как часть npm. Эта версия не является доступной непосредственно для разработчиков и преназначена только для поддержки возможности использования команды `npm install` для компиляции и установки аддонов. Разработчики, которые хотят использовать node-gyp напрямую, должнв установить эту утилиту с помощью команды `npm install -g node-gyp`. Инструкция по установке, пока на английском.

После создания файла `binding.gyp` нужно использовать `node-gyp configure` для генерации соответствующих файлов сборки проекта на текущей платформе. Эта команда генерирует либо `Makefile` (для Unix-платформ), либо `vcxproj` (для Windows) в директории `build/`.

Затем нужно вызвать команду `node-gyp build` для генерации компилированного файла `addon.node`. Он будет находиться в директории `build/Release/`.

При вызове `npm install` для установки аддона, npm использует собственную версию `node-gyp` для выполнения такого же набора действий, генерируя скомпирированную версию аддона для платформы пользователя по запросу.

После сборки бинарный аддон может быть использован внутри Node.js посредством `reqiure()` во встроенном модуле `addon.node`:

```js
// hello.js
const addon = require('./build/Release/addon');
console.log(addon.hello()); // 'world'
```

Более подробное объяснение см. в примерах ниже для применения на практике.

Так как точный путь к скомпилированному бинарному файлу аддона может изменяться в зависимости от способа компиляции (например, иногда он находится в `./build/Debug/`), аддоны могут использовать пакет bindings для загрузки скомпилированного модуля.

Следует заметить, что реализация пакета bindings достаточно сложна (а именно в том, как размещаются модули). Здесь используется шаблон try-catch:

```js
try {
  return require('./build/Release/addon.node');
} catch (err) {
  return require('./build/Debug/addon.node');
}
```

### Связка с собственными зависимостями Node.js

Node.js использует большое количество статичных библиотек, типа V8, libuv, OpenSSL. Все аддоны должны ссылаться на V8, а также могут содержать ссылку на любую другую зависимость. Это довольно просто осуществить: нужно добавить соответствующее выражение `#include <...>` (например, `#include <v8.h>`) и `node-gyp` разместит соответствующие заголовки автоматически. Однако, здесь тоже можно напороться на подводные камни:

- При запуске `node-gyp` определяется версия релиза Node.js и загружается либо полный архив с исходным кодом, либо только заголовки. Если полный архив загружен, аддоны будут иметь абсолютный доступ к полному набору зависимостей Node.js. Тем не менее, если загружены только заголовки, будут доступны лишь экспортированные Node.js символы.
- Утилита `node-gyp` может быть запущена с помощью флага `--nodedir`, указывающего на исходный образ Node.js. Используя эту опцию, аддоны могут получить доступ к полному набору зависимостей.

### Загрузка аддонов с помощью reqiure()

Расширение бинарного файла скомпилированного аддона - `.node`. Функция `require()` написана для того. чтобы мониторить файлы с расширением `.node` и инициализировать их как динамически подключаемые библиотеки.

При вызове `require()` расширение `.node` обычно опускается и Node.js все еще может найти и инициализировать аддон. Однако, есть загвоздка: Node.js сначала попытается разместить и загрузить модули файлов JavaScript, что может привести к повторению имен файлов. К примеру: Если файл `addon.js` находится в той же директории, что и `addon.node`, вызов `require('addon')` может отдать приоритет `addon.js` и загрузить этот файл вместо `addon.node`.

## Нативные абстракции в Node.js

Каждый из примеров, приведенных в этой документации, иллюстрирует прямое использование Node.js и V8 API для реализации аддонов. Важно понимать, что V8 API может изменяться от релиза к релизу (и с релизами Node.js). С каждым изменением аддоны, возможно, нужно будет обновлять и рекомпилировать для того, чтобы они продолжали функционировать. График релизов Node.js разработан так, чтобы минимизировать частоту таких изменений, однако, это все, что на данный момент может сделать Node.js для гарантии стабильности V8 API.

Нативные абстракции для Node.js (или nan) предоставляют набор инструментов, которые рекомендуют использовать разработчики аддонов для сохранения совместимости между прошлыми и будущими релизами V8 и Node.js. В примерах nan наглядно показывается их использование.

## Примеры аддонов

Ниже приведены несколько примеров аддонов для начинающих разработчиков. В примерах используется V8 API. Каждый из примеров использует файл `binding.gyp`.

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

В случаях, когда файлов `.cc` больше одного, просто допишите еще одно имя файла в массив `sources`. Вот так:

```
"sources": [ "addon.cc", "myexample.cc" ]
```

Когда файл `binding.gyp` готов, аддоны можно сконфигурировать и собрать с помощью `node-gyp`:

```
$ node-gyp configure build
```

### Аргументы функции

Аддоны, как правило, обращаются к объектам и функциям JavaScript при запуске Node.js. Когда функции вызываются через JavaScript, входящие аргументы и возвращаемые значения должны быть отображены в коде C/C++.

Этот пример показывает, как считывать аргументы функции, переданные из JavaScript и как возвратить результат:

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
// const FunctionCallbackInfo& args struct

void Add(const FunctionCallbackInfo<Value>& args) {

	Isolate* isolate = args.GetIsolate();

	// Check the number of arguments passed.

	if (args.Length() < 2) {
	// Throw an Error that is passed back to JavaScript
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Wrong number of arguments")));
		return;
	}
	// Check the argument types

	if (!args[0]->IsNumber() || !args[1]->IsNumber()) {
		isolate->ThrowException(Exception::TypeError(
		String::NewFromUtf8(isolate, "Wrong arguments")));
		return;
	}
	// Perform the operation

	double value = args[0]->NumberValue() + args[1]->NumberValue();

	Local<Number> num = Number::New(isolate, value);
	// Set the return value (using the passed in
	// FunctionCallbackInfo<Value>&)

	args.GetReturnValue().Set(num);
}

void Init(Local<Object> exports) {
	NODE_SET_METHOD(exports, "add", Add);
}

NODE_MODULE(addon, Init)
} // namespace demo
```

После компиляции аддон может быть вызван и использован в Node.js:

```js
// test.js
const addon = require('./build/Release/addon');
console.log('This should be eight:', addon.add(3, 5));
```

### Обратные вызовы

Частой практикой при работе с аддонами является передача функций JavaScript в функции С++ и их запуск уже из С++. Пример ниже демонстрирует как вызывать такие обратные вызовы (callbacks):

```cpp
// addon.cc
#include <node.h>

namespace demo {

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
		Local<Function> cb = Local<Function>::Cast(args[0]);
		const unsigned argc = 1;
		Local<Value> argv[argc] = { String::NewFromUtf8(isolate, "hello world") };
		cb->Call(Null(isolate), argc, argv);
	}

	void Init(Loca<Object> exports, Local<Object> module) {
		NODE_SET_METHOD(module, "exports", RunCallback);
	}

	NODE_MODULE(addon, Init)
} // namespace demo
```

Следует заметить, что этот пример показывает использование двух-аргументной формы `Init()`, которая получает целый объект `module` как второй аргумент. Это позволяет аддону полностью перезаписать `exports` с помощью единственной функции вместо добавления функции в качестве свойства `exports`.

Чтобы протестировать это, запустим следующий JavaScript код:

```js
// test.js
const addon = require('./build/Release/addon');

addon((msg) => {
  console.log(msg); // 'hello world'
});
```

Обратите внимание: в этом примере функция обратного вызова вызывается синхронно.

### Фабрика объектов

Аддоны могут создавать и возвращать новые объекты из функций С++, что демонстируется в следующем примере. Объект создается и возвращается со свойством `msg`, которая выводит на экран строку, переданную `createObject()`:

```cpp
// addon.cc
#include <node.h>

namespace demo {

	using v8::FunctionCallbackInfo;
	using v8::Isolate;
	using v8::Local;
	using v8::Object;
	using v8::String;
	using v8::Value;

	void CreateObject(const FunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();
		Local<Object> obj = Object::New(isolate);
		obj->Set(String::NewFromUtf8(isolate, "msg"), args[0]->ToString());
		args.GetReturnValue().Set(obj);
	}

	void Init(Local<Object> exports, Local<Object> module) {
		NODE_SET_METHOD(module, "exports", CreateObject);
	}

	NODE_MODULE(addon, Init)
} // namespace demo
```

Тестируем на JavaScript:

```js
// test.js
const addon = require('./build/Release/addon');
var obj1 = addon('hello');
var obj2 = addon('world');
console.log(obj1.msg + ' ' + obj2.msg); // 'hello world'
```

### Фабрика функций

Следующий частый сценарий - создание функций JavaScript, которые содержат в себе С++ функции и возвращение их в JavaScript:

```cpp
// addon.cc
#include <node.h>

namespace demo {

	using v8::Exception;
	using v8::FunctionCallbackInfo;
	using v8::FunctionTemplate;
	using v8::Isolate;
	using v8::Local;
	using v8::Object;
	using v8::String;
	using v8::Value;

	void MyFunction(const FunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();
		args.GetReturnValue().Set(String::NewFromUtf8(isolate, "hello world"));
	}

	void CreateFunction(const FunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();
		Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, MyFunction);
		Local<Function> fn = tpl->GetFunction();
		// omit this to make it anonymous
		fn->SetName(String::NewFromUtf8(isolate, "theFunction"));
		args.GetReturnValue().Set(fn);
	}

	void Init(Local<Object> exports, Local<Object> module) {
		NODE_SET_METHOD(module,"exports", CreateFunction);
	}

	NODE_MODULE(addon, Init)
} // namespace demo
```

Тестируем:

```js
// test.js
const addon = require('./build/Release/addon');
var fn = addon();
console.log(fn()); // 'hello world'
```

### Обертывание С++ объектов

Возможно обернуть С++ объекты/классы таким образом, что можно будет создать экземпляры JavaScript с помощью оператора `new`

```cpp
// addon.cc
#include <node.h>
#include "myobject.h";

namespace demo {
	using v8::Local;
	using v8::Object;

	void InitAll(Local<Object> exports) {
		MyObject::Init(exports);
	}

	NODE_MODULE(addon, InitAll)
} // namespace demo
```

Затем в `myobject.h` класс-оболочка наследует из `node::ObjectWrap`:

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

			static v8::Persistent<v8::Function> constructor;
			double value_;
	};
} // namespace demo

#endif
```

В `myobject.cc` нужно реализовать те методы, которые будут выполняться. В примере ниже, метод `plusOne()` выполняется посредством добавления его в прототип конструктора:

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
	using v8::Persistent;
	using v8::String;
	using v8::Value;

	Persistent<Function> MyObject::constructor;

	MyObject::MyObject(double value) : value_(value) {
	}

	MyObject::~MyObject() {
	}

	void MyObject::Init(Local<Object> exports) {
		Isolate* isolate = exports->GetIsolate();

		// Prepare constructor template
		Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
		tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject"));
		tpl->InstanceTemplate()->SetInternalFieldCount(1);

		// Prototype
		NODE_SET_PROTOTYPE_METHOD(tpl, "plusOne", PlusOne);

		constructor.Reset(isolate, tpl->GetFunction());

		exports->Set(String::NewFromUtf8(isolate, "MyObject"),
		tpl->GetFunction());
	}

	void MyObject::New(const FunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();

		if (args.IsConstructCall()) {
			// Invoked as constructor: `new MyObject(...)`
			double value = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
			MyObject* obj = new MyObject(value);
			obj->Wrap(args.This());
			args.GetReturnValue().Set(args.This());
		} else {
			// Invoked as plain function `MyObject(...)`, turn into construct call.
			const int argc = 1;
			Local<Value> argv[argc] = { args[0] };
			Local<Context> context = isolate->GetCurrentContext();
			Local<Function> cons = Local::New(isolate, constructor);
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
} // namespace demo
```

Для сборки файл `myobject.cc` должен быть добавлен в `binding.gyp`:

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

Тест:

```js
// test.js
const addon = require('./build/Release/addon');
var obj = new addon.MyObject(10);
console.log(obj.plusOne()); // 11
console.log(obj.plusOne()); // 12
console.log(obj.plusOne()); // 13
```

### Фабрика обертываемых объектов

В качестве альтернативы, можно использовать фабричный паттерн для того, чтобы избежать явного создания экземпляров объектов с помощью оператора JavaScript `new`:

```js
var obj = addon.createObject();
// instead of:
// var obj = new addon.Object();
```

Метод `createObject()` реализован в `addon.cc`:

```cpp
// addon.cc
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

	void InitAll(Local<Value> exports, Local<Object> module) {
		MyObject::Init(exports->GetIsolate());
		NODE_SET_METHOD(module, "exports", CreateObject);
	}

	NODE_MODULE(addon, InitAll)
	// namespace demo
}
```

В `myobject.h` статичный метод `NewInstance()` добавляется для обработки экземпляра объекта. Этот метод применяется в случае использования `new`:

```cpp
// addon.cc
#include <node.h>
#include "myobject.h";

namespace demo {
	using v8::Local;
	using v8::Object;

	void InitAll(Local<Object> exports) {
		MyObject::Init(exports);
	}

	NODE_MODULE(addon, InitAll)
} // namespace demo
```

Затем в `myobject.h` класс-оболочка наследует из `node::ObjectWrap`:

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
			static v8::Persistent<v8::Function> constructor;
			double value_;
	};
} // namespace demo
#endif
```

Реализация в `myobject.cc` похожа на предыдущий пример:

```cpp
// myobject.cc
#include <node.h>
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
	using v8::Persistent;
	using v8::String;
	using v8::Value;

	Persistent<Function> MyObject::constructor;

	MyObject::MyObject(double value) : value_(value) {
	}

	MyObject::~MyObject() {
	}

	void MyObject::Init(Isolate* isolate) {
		// Prepare constructor template
		Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
		tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject"));
		tpl->InstanceTemplate()->SetInternalFieldCount(1);

		// Prototype
		NODE_SET_PROTOTYPE_METHOD(tpl, "plusOne", PlusOne);
		constructor.Reset(isolate, tpl->GetFunction());
	}

	void MyObject::New(const FunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();

		if (args.IsConstructCall()) {
			// Invoked as constructor: `new MyObject(...)`
			double value = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
			MyObject* obj = new MyObject(value);
			obj->Wrap(args.This());
			args.GetReturnValue().Set(args.This());
		} else {
			// Invoked as plain function `MyObject(...)`, turn into construct call.
			const int argc = 1;
			Local<Value> argv[argc] = { args[0] };
			Local<Context> context = isolate->GetCurrentContext();
			Local<Function> cons = Local::New(isolate, constructor);
			Local<Object> result =
				cons->NewInstance(context, argc, argv).ToLocalChecked();
			args.GetReturnValue().Set(result);
		}
	}

	void MyObject::NewInstance(constFunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();
		const int argc = 1;
		Local<Value> argv[argc] = { args[0] };
		Local<Context> context = isolate->GetCurrentContext();
		Local<Function> cons = Local::New(isolate, constructor);
		Local<Object> result =
			cons->NewInstance(context, argc, argv).ToLocalChecked();
		args.GetReturnValue().Set(instance);
	}

	void MyObject::PlusOne(const FunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();
		MyObject* obj = ObjectWrap::Unwrap<MyObject>(args.Holder());
		obj->value_ += 1;
		args.GetReturnValue().Set(Number::New(isolate, obj->value_));
	}
}// namespace demo
```

И опять: для сборки `myobject.cc` должен быть добавлен в `binding.gyp`:

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

Тестируем:

```js
// test.js
const addon = require('./build/Release/addon');

var obj = createObject(10);
console.log(obj.plusOne()); // 11
console.log(obj.plusOne()); // 12
console.log(obj.plusOne()); // 13

var obj2 = createObject(20);
console.log(obj2.plusOne()); // 21
console.log(obj2.plusOne()); // 22
console.log(obj2.plusOne()); // 23
```

### Передача обертываемых объектов

В дополнение к обертыванию и возвращению С++ объектов, возможно также передавать обертываемые объекты путем их разворачивания с помощью вспомогательной функции Node.js `node::ObjectWrap::Unwrap`. Этот пример показывает, как применять функцию `add()`, которая принимает два объекта `MyObject` как входящие аргументы:

```cpp
// addon.cc
#include <node.h>
#include <node_object_wrap.h>
#include "myobject.h"

namespace demo {

	using v8::FunctionCallbackInfo;
	using v8::Isolate;
	using v8::Local;
	using v8::Number;
	using v8::Object;
	using v8::String;
	using v8::Value;

	void createObject::New(const FunctionCallbackInfo<Value>& args);

	MyObject::NewInstance(args){
	}

	void Add(const FunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();
		MyObject* obj1 = node::ObjectWrap::Unwrap<MyObject>(
		args[0]->ToObject());
		MyObject* obj2 = node::ObjectWrap::Unwrap<MyObject>(
		args[1]->ToObject());
		double sum = obj1->value() + obj2->value();
		args.GetReturnValue().Set(Number::New(isolate, sum));
	}

	void InitAll(Local<Object> exports) {
		MyObject::Init(exports->GetIsolate());
		NODE_SET_METHOD(exports, "createObject", CreateObject);
		NODE_SET_METHOD(exports, "add", Add);
	}

	NODE_MODULE(addon, InitAll)
}// namespace demo
```

В `myobject.h` новый `public` метод добавляется для того, чтобы открыть доступ к скрытым значениям после разворачивания объекта.

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

			static void NewInstance(class v8::FunctionCallbackInfo<v8::Value>& args);

			inline double value() class { return value_; }

		private:
			explicit MyObject(double value = 0);
			~MyObject();

			static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

			static v8::Persistent<v8::Function> constructor;
			double value_;
	};
} // namespace demo
#endif
```

Реализация `myobject.cc` также похожа:

```cpp
// myobject.cc
#include <node.h>
#include "myobject.h"

namespace demo {

	using v8::Context;
	using v8::Function;
	using v8::FunctionCallbackInfo;
	using v8::FunctionTemplate;
	using v8::Isolate;
	using v8::Local;
	using v8::Object;
	using v8::Persistent;
	using v8::String;
	using v8::Value;

	Persistent<Function> MyObject::constructor;

	MyObject::MyObject(double value) : value_(value) {
	}

	MyObject::~MyObject() {
	}

	void MyObject::Init(Isolate* isolate) {
		// Prepare constructor template
		Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
		tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject"));
		tpl->InstanceTemplate()->SetInternalFieldCount(1);
		constructor.Reset(isolate, tpl->GetFunction());
	}

	void MyObject::New(constFunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();
		if (args.IsConstructCall()) {
			// Invoked as constructor: `new MyObject(...)`
			double value = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
			MyObject* obj = new MyObject(value);
			obj->Wrap(args.This());
			args.GetReturnValue().Set(args.This());
		} else {
			// Invoked as plain function `MyObject(...)`, turn into construct call.
			const int argc = 1;
			Local<Value> argv[argc] = { args[0] };
			Local<Context> context = isolate->GetCurrentContext();
			Local<Function> cons = Local::New(isolate, constructor);
			Local<Object> result =
				cons->NewInstance(context, argc, argv).ToLocalChecked();
			args.GetReturnValue().Set(instance);
		}
	}

	oid MyObject::NewInstance(constFunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();
		const int argc = 1;
		Local<Value> argv[argc] = { args[0] };
		Local<Context> context = isolate->GetCurrentContext();
		Local<Function> cons = Local::New(isolate, constructor);
		Local<Object> result =
			cons->NewInstance(context, argc, argv).ToLocalChecked();
		args.GetReturnValue().Set(instance);
	}
} // namespace demo
```

Тест:

```js
// test.js
const addon = require('./build/Release/addon');

var obj = addon.createObject(10);
var obj2 = addon.createObject(20);
var result = addon.add(obj1, obj2);

console.log(result); // 30
```

### Хуки AtExit

Хук `AtExit` – это функция, которая вызывается после цикла обработки событий Node.js, который закончился до того, как JavaScript VM прекращает работу и Node.js закрывается. Хуки `AtExit` регистрируются с помощью `node::AtExit` API.

```
void AtExit(callback, args)
```

- `callback`: `void (*)(void*)` – указатель на функцию, вызываемую при выходе.
- `args`: `void*` – указатель на переход к функции обратного вызова при выходе.

Exit хуки запускаются после окончания цикла обработки событий, но до того, как убивается процесс VM.

`AtExit` принимает два параметра: указатель на функцию обратного вызова, которую нужно запустить при выходе, и указатель на нетипизированные данные, которые нужно передать этой функции.

Функции обратного вызова запускаются в порядке "последний пришел - первый ушел".

Нижеприведенный `addon.cc` реализует `AtExit`:

```cpp
// addon.cc
#undef NDEBUG
#include <assert.h>
#include <stdlib.h>
#include <node.h>

namespace demo {

	using node::AtExit;
	using v8::HandleScope;
	using v8::Isolate;
	using v8::Local;
	using v8::Object;

	static char cookie[] = "yum yum";
	static int at_exit_cb1_called = 0;
	static int at_exit_cb2_called = 0;

	static void at_exit_cb1(void* arg) {
		Isolate* isolate = static_cast<Isolate*>(arg);
		HandleScope scope(isolate);
		Local<Object> obj = Object::New(isolate);
		assert(!obj.IsEmpty()); // assert VM is still alive
		assert(obj->IsObject());
		at_exit_cb1_called++;
	}

	static void at_exit_cb2(void* arg) {
		assert(arg == static_cast<void*>(cookie));
		at_exit_cb2_called++;
	}

	static void sanity_check(void*) {
		assert(at_exit_cb1_called == 1);
		assert(at_exit_cb2_called == 2);
	}

	void init(Local<Object> exports) {
		AtExit(sanity_check);
		AtExit(at_exit_cb2, cookie);
		AtExit(at_exit_cb2, cookie);
		AtExit(at_exit_cb1, exports->GetIsolate());
	}

	NODE_MODULE(addon, init);
} // namespace demo
```

Тестируем:

```js
// test.js
const addon = require('./build/Release/addon');
```
