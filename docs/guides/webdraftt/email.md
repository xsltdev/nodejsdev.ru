# Отправка E-mail

Для отправки E-mail в Node.js приложениях используется npm модуль `nodemailer`.

```
npm install nodemailer --save
```

Разработчики модуля nodemailer сделали все, чтобы его использование в Node.js было как можно более простым. Рассмотрим пример.

_nodemailer.js_

```js
const nodemailer = require('nodemailer')

let testEmailAccount = await nodemailer.createTestAccount()

let transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testEmailAccount.user,
    pass: testEmailAccount.pass,
  },
})

let result = await transporter.sendMail({
  from: '"Node js" <nodejs@example.com>',
  to: 'user@example.com, user@example.com',
  subject: 'Message from Node js',
  text: 'This message was sent from Node js server.',
  html:
    'This <i>message</i> was sent from <strong>Node js</strong> server.',
})

console.log(result)
```

В первую очередь необходимо создать так называемый `transporter`, который хранит всю конфигурацию SMTP. Для создания `transporter` используется метод `createTransport()`, который принимает объект со следующими полями:

- `host` - адрес почтового сервера, который будет отправлять посылаемые e-mail;
- `port` - порт почтового сервера, по умолчанию может быть `25`, `465` или `587`;
- `secure` - булевое значение, задается `true`, если используется SSL, в таком случае значением port должно быть `465`;
- `auth` - объект со свойствами `user` и `pass`, в которых указывается логин и пароль используемого почтового аккаунта соответственно.

!!! note ""

    В случае отсутствия реального аккаунта в процессе разработки можно использовать тестовый почтовый аккаунт `ethereal`, входящий в модуль `nodemailer`. Аккаунт создается вызовом метода `createTestAccount()`, который возвращает логин и пароль для доступа к аккаунту.

Для отправки сообщения через аккаунт сервиса Gmail, методу `createTransport()` необходимо передать такую конфигурацию.

```js
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword',
  },
})
```

Сама отправка e-mail осуществляется вызовом метода `sendMail()` у объекта `transporter`. Метод `sendMail()` принимает объект со следующей структурой:

- `from` - email адрес отправителя сообщения, дополнительно может быть указано имя (см. пример);
- `to` - адрес получателя, через запятую или в виде массива можно указать множество получателей;
- `subject` - тема сообщения;
- `text` - текст сообщения;
- `html` - текст сообщения в формате HTML;
- `attachments` - прикрепленные к сообщению файлы.

Рассмотрим пример отправки e-mail с файлами.

```js
await transporter.sendMail({
  from: '"Node js" <nodejs@example.com>',
  to: 'user@example.com, user@example.com',
  subject: 'Attachments',
  text: 'This message with attachments.',
  html:
    'This <i>message</i> with <strong>attachments</strong>.',
  attachments: [
    { filename: 'greetings.txt', path: '/assets/files/' },
    {
      filename: 'greetings.txt',
      content: 'Message from file.',
    },
    { path: 'data:text/plain;base64,QmFzZTY0IG1lc3NhZ2U=' },
    {
      raw: `
          Content-Type: text/plain
          Content-Disposition: attachment;

          Message from file.
        `,
    },
  ],
})
```

Файлы отправляются массивом в свойстве `attachments`. Каждый элемент массива описывает один файл объектом следующей структуры:

- `filename` - имя файла в сообщении;
- `content` - содержимое файла;
- `path` - путь к файлу, который будет передан потоком, его именем будет значение, указанное в `filename`;
- `href` - путь к файлу, который будет вложен в сообщение;
- `contentType` - тип содержимого файла;
- `contentDisposition`;
- `encoding` - кодировка содержимого файла;
- `raw` - задание файла в “сыром” формате.
