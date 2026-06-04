---
description: Узнайте, как кастомизировать и расширять Express.js API, переопределяя методы и свойства объектов request/response через прототипы.
---

# Переопределение Express API

Express API состоит из различных методов и свойств объектов request и response. Они наследуются через прототипы. Для расширения Express API есть две точки:

1.  Глобальные прототипы `express.request` и `express.response`.
2.  Прототипы уровня приложения `app.request` и `app.response`.

Изменение глобальных прототипов влияет на все загруженные в процессе Express-приложения. При необходимости изменения можно ограничить одним приложением, изменяя только app-specific прототипы после создания приложения.

## Методы

Вы можете переопределять сигнатуру и поведение существующих методов, назначив собственную функцию.

Ниже пример переопределения поведения `res.sendStatus`.

```js
app.response.sendStatus = function (
    statusCode,
    type,
    message
) {
    // code is intentionally kept simple for demonstration purpose
    return this.contentType(type)
        .status(statusCode)
        .send(message);
};
```

Эта реализация полностью меняет исходную сигнатуру `res.sendStatus`. Теперь метод принимает код статуса, тип контента и сообщение для отправки клиенту.

Переопределенный метод теперь можно использовать так:

```js
res.sendStatus(
    404,
    'application/json',
    '{"error":"resource not found"}'
);
```

## Свойства

Свойства в Express API бывают двух типов:

1.  Присваиваемые свойства (например: `req.baseUrl`, `req.originalUrl`)
2.  Свойства-геттеры (например: `req.secure`, `req.ip`)

Так как свойства из первой категории динамически присваиваются объектам `request` и `response` в рамках текущего request-response цикла, их поведение нельзя переопределить.

Свойства из второй категории можно переопределять через API расширения Express.

Следующий код меняет логику вычисления `req.ip`: теперь возвращается значение заголовка запроса `Client-IP`.

```js
Object.defineProperty(app.request, 'ip', {
    configurable: true,
    enumerable: true,
    get() {
        return this.get('Client-IP');
    },
});
```

## Прототип

Чтобы Express API работал корректно, объекты request/response, передаваемые в Express (например, через `app(req, res)`), должны наследоваться из нужной цепочки прототипов. По умолчанию это `http.IncomingRequest.prototype` для request и `http.ServerResponse.prototype` для response.

Если нет необходимости, рекомендуется делать это только на уровне приложения, а не глобально. Также убедитесь, что используемый прототип максимально соответствует функциональности прототипов по умолчанию.

```js
// Use FakeRequest and FakeResponse in place of http.IncomingRequest and http.ServerResponse
// for the given app reference
Object.setPrototypeOf(
    Object.getPrototypeOf(app.request),
    FakeRequest.prototype
);
Object.setPrototypeOf(
    Object.getPrototypeOf(app.response),
    FakeResponse.prototype
);
```
