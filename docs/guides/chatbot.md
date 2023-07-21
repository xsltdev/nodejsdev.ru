---
description: Как создать чат-бота с поддержкой искусственного интеллекта с помощью OpenAI, ChatGPT, Node.js и React
---

# Как создать чат-бота с поддержкой искусственного интеллекта

Искусственный интеллект (ИИ) в последнее время набирает обороты, а [ChatGPT](https://platform.openai.com/) произвел революцию в интернете благодаря функции [завершения чата](https://platform.openai.com/docs/guides/chat).

С его помощью можно сделать многое: составить электронное письмо или другой документ, ответить на вопросы о наборе документов, создать разговорные агенты, придать вашему программному обеспечению интерфейс на естественном языке, обучать различным предметам, переводить языки и так далее.

В этой статье мы расскажем об основах создания чат-приложения с использованием функции [chat completion](https://platform.openai.com/docs/guides/chat), чтобы каждый программист мог легко с ней справиться. Это не так сложно, как кажется. Вы убедитесь в этом, следуя данному руководству.

!!!tip "Вы узнаете следующее"

    -   Как создать приложение для чата с помощью CLI, используя только Node.js.
    -   Как создать приложение для чата, используя только React.
    -   Как объединить React и Node.js для создания лучшего программного обеспечения чата AI.

Этот учебник будет основан на модели [`gpt-3.5-turbo`](https://platform.openai.com/docs/models/gpt-3-5).

## Предварительные условия

Этот учебник требует базовых знаний JavaScript, CSS, React и Node.js.

Вам также понадобится учетная запись на платформе OpenAI, где размещен chatGPT. Он бесплатный, поэтому вы можете создать его [здесь](https://platform.openai.com/overview).

## Как создать приложение ИИ чата с помощью CLI на Node.js

Этот раздел будет посвящен созданию чат-приложения, которое будет работать только в терминале с помощью [Node.js](https://nodejs.org/).

Начните с создания каталога для проекта:

```
mkdir nodejs-chatgpt-tutorial
```

Перейдите в папку:

```
cd nodejs-chatgpt-tutorial
```

Инициализируйте проект:

```
npm init -y
```

В результате будет создан файл `package.json` для отслеживания деталей проекта

Добавьте в файл следующую строку кода:

```js
 "type": "module"
```

Это позволит вам использовать оператор импорта модуля ES6.

Установите [OpenAI](https://openai.com/) с помощью приведенной ниже команды:

```
npm i openai
```

Создайте файл, в котором будет находиться весь код. Назовите его `index.js`:

```
touch index.js
```

Импортируйте `Configuration` и `OpenAIApi` из модуля [OpenAI](https://openai.com/) и `readline` из модуля [readline](https://nodejs.org/api/readline.html):

```js
import { Configuration, OpenAIApi } from 'openai';
import readline from 'readline';
```

Создайте конфигурацию OpenAI следующим образом:

```js
const configuration = new Configuration({
    organization: 'org-0nmrFWw6wSm6xIJXSbx4FpTw',
    apiKey:
        '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',
});
```

Этот код создает новый экземпляр объекта `Configuration`. Внутри него вы введете значения для ваших `организации` и `apiKey`. Подробности о вашей организации вы можете найти в [settings](https://platform.openai.com/account/org-settings), а информацию о вашем apiKey - в [API](https://platform.openai.com/account/api-keys) [keys](https://platform.openai.com/account/api-keys). Если у вас нет существующего API Key, вы можете создать его.

Введите следующий код после конфигурации, чтобы создать новый экземпляр API OpenAI:

```js
const openai = new OpenAIApi(configuration);
```

Вы будете использовать ее на протяжении всего проекта.

Введите приведенный ниже код для проверки функции `createChatCompletion`:

```js
openai
    .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
    })
    .then((res) => {
        console.log(res.data.choices[0].message.content);
    })
    .catch((e) => {
        console.log(e);
    });
```

Этот код вызывает функцию `createChatCompletion`, которая запускает конечную точку (`https://api.openai.com/v1/chat/completions`). Функция принимает объект аргументов (`модель` используемого chatGPT и массив `сообщений` между пользователем и ИИ. Мы рассмотрим, как использовать массив `сообщений` для ведения истории чата и улучшения приложения в следующем разделе).

Каждое сообщение - это объект, содержащий `роль` (то есть, кто отправил сообщение. Значение может быть `помощник`, если сообщение исходит от ИИ, или `пользователь`, если сообщение исходит от человека) и `содержание` (отправленная информация).

Наконец, код печатает ответ (`res.data.choices[0].message.content`) от ИИ. Запустите файл в терминале с помощью этой команды:

```
node index
```

Это позволит получить ответ от искусственного интеллекта через несколько секунд.

И это все, что нужно для создания чат-бота!

Но было бы полезно сделать приложение более интерактивным, запрашивая ввод от пользователя вместо жесткого кодирования содержания сообщения в коде. В этом нам поможет модуль [readline](../api/readline.md).

Чтобы сделать его интерактивным, удалите последний введенный код и добавьте следующий:

```js
const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
```

Этот код создает пользовательский интерфейс в терминале, который позволяет пользователям вводить свои вопросы.

Затем предложите пользователю ввести сообщение, используя приведенный ниже код:

```js
userInterface.prompt();
```

Наконец, введите следующий код:

```js
userInterface.on('line', async (input) => {
    await openai
        .createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: input }],
        })
        .then((res) => {
            console.log(
                res.data.choices[0].message.content
            );
            userInterface.prompt();
        })
        .catch((e) => {
            console.log(e);
        });
});
```

В приведенном выше коде,

-   Когда пользователь что-то набирает и нажимает `Enter`, приведенный выше код запускает функцию обратного вызова.
-   Она передает все, что было набрано пользователем в качестве `ввода`.
-   Теперь `input` используется в качестве `content`.
-   После отображения ответа ИИ пользователю предлагается ввести другое сообщение в блоке `then`.

Смотрите весь код на [GitHub](https://github.com/EBEREGIT/nodejs-chatgpt-tutorial).

Запустите файл и пообщайтесь с ИИ. Это будет выглядеть так, как показано на рисунке ниже:

![CLI chat with AI](chatbot-1.png)

Отлично! Это интерактивный чат CLI.

Это полезно нескольким людям (например, инженерам), но при этом имеет хорошую безопасность, поскольку находится на стороне сервера.

Но как насчет других людей, которые могут не понимать, как использовать CLI-приложение? Им нужно что-то более простое в использовании с лучшим пользовательским интерфейсом (UI) и удобством использования (UX). Следующий раздел будет посвящен созданию такого приложения с помощью [React](https://reactdev.ru/).

## Как создать приложение для чата с помощью React

Цель этого раздела - помочь разработчикам фронтенда освоить API ChatGPT для создания приложения чата и создать лучший пользовательский интерфейс, чтобы пользователи получали лучший опыт. Полученные здесь знания вы можете применить к другим фронтенд-фреймворкам или библиотекам.

Первое, что нужно сделать, это настроить базовый котел React. Для этого я буду использовать [Vite](https://vitejs.dev/guide/#scaffolding-your-first-vite-project). Вы можете использовать Vite для создания любого современного фронтенд-проекта на JavaScript. Используйте команду ниже:

```
npm create vite@latest
```

Эта команда предложит вам создать имя и папку для вашего проекта и выбрать фреймворк или библиотеку (в этом учебнике используется React). После этого вы перейдете в папку и выполните следующую команду:

```
npm install
npm run dev
```

Эти команды установят необходимые зависимости и запустят локальный сервер на порту `5173`.

Далее, установите [OpenAI](https://openai.com/) с помощью команды ниже:

```
npm i openai
```

Этот модуль предоставляет доступ ко всему, что нам нужно для создания приложения чата.

Теперь мы готовы приступить к написанию кода!

Перейдите в файл `src/App.jsx` и удалите все его содержимое. Затем добавьте следующие утверждения импорта:

```js
import { useState } from 'react';
import { Configuration, OpenAIApi } from 'openai';
```

Код выше импортирует `Configuration` для установки значений конфигурации и `OpenAIApi` для предоставления нам доступа к функциям завершения чата.

После этого создайте конфигурацию следующим образом:

```js
const configuration = new Configuration({
    organization: 'org-0nmrFWw6wSm6xIJXSbx4FpTw',
    apiKey:
        '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',
});
```

Этот код создает новый экземпляр объекта `Configuration`. Внутри него вы вводите значения для ваших `организации` и `apiKey`. Подробности о вашей организации вы можете найти в [settings](https://platform.openai.com/account/org-settings), а информацию о вашем apiKey - в [API](https://platform.openai.com/account/api-keys) [keys](https://platform.openai.com/account/api-keys). Если у вас нет существующего API Key, вы можете создать его.

Введите следующий код после конфигурации, чтобы создать новый экземпляр API OpenAI:

```js
const openai = new OpenAIApi(configuration);
```

Мы будем использовать его на протяжении всего проекта.

Создайте и экспортируйте функцию по умолчанию:

```js
function App() {
    return (
        <main>
            <h1>Chat AI Tutorial</h1>
        <main/>
    );
};

export default App;
```

В этой функции будет находиться остальная часть кода.

Установите следующие состояния перед оператором `return`:

```js
const [message, setMessage] = useState('');
const [chats, setChats] = useState([]);
const [isTyping, setIsTyping] = useState(false);
```

-   В массиве `message` будет храниться информация, отправленная из приложения в ИИ.
-   Массив `chats` будет отслеживать все сообщения, отправленные обеими сторонами (пользователем и ИИ).
-   Переменная `isTyping` будет уведомлять пользователя о том, набирает ли бот текст или нет.

Введите следующие строки кода под тегом h1

```js
<div className={isTyping ? '' : 'hide'}>
    <p>
        <i>{isTyping ? 'Typing' : ''}</i>
    </p>
</div>
```

Приведенный выше код будет отображать `Typing` всякий раз, когда пользователь ожидает ответа от ИИ.

Создайте форму, в которой пользователь может ввести сообщение, добавив приведенный ниже код в элемент `main`:

```js
<form action="" onSubmit={(e) => chat(e, message)}>
    <input
        type="text"
        name="message"
        value={message}
        placeholder="Type a message here and hit Enter..."
        onChange={(e) => setMessage(e.target.value)}
    />
</form>
```

Этот код создает форму с одним входом. Каждый раз, когда форма отправляется нажатием клавиши `Enter`, запускается функция `chat`.

Функция чата принимает два (2) аргумента (`e` и `message`) следующим образом:

```js
const chat = async (e, message) => {
    /* ... */
};
```

Введите в функцию следующие строки:

```js
e.preventDefault();

if (!message) return;
setIsTyping(true);
```

Приведенный выше код предотвращает перезагрузку веб-страницы `form`, проверяет, было ли сообщение набрано перед отправкой, и устанавливает `isTyping` в `true`, чтобы указать, что приложение начало работать над введенными данными.

ChatGPT имеет формат, в котором должны быть сообщения. Он принимает следующий шаблон:

```
{role: user | assistant, content: message to be sent}
```

Каждое сообщение (`содержание`) должно показывать, кто его отправил. Роль - `помощник`, если чат от ИИ, но `пользователь`, если от человека. Поэтому, прежде чем отправить сообщение, убедитесь, что оно правильно оформлено и добавьте его в массив (`chats`) следующим образом:

```js
let msgs = chats;
msgs.push({ role: 'user', content: message });
setChats(msgs);

setMessage('');
```

Последняя строка выше очищает вход, чтобы пользователь мог набрать еще одну заметку.

Теперь мы вызовем конечную точку `createChatCompletion`, вызвав функцию `createChatCompletion` с помощью кода ниже:

```js
await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
        {
            role: 'system',
            content:
                'You are a EbereGPT. You can help with graphic design tasks',
        },
        ...chats,
    ],
});
```

Функция `createChatCompletion` принимает как минимум два (2) аргумента (`модель` и `сообщения`):

-   Модель определяет используемую версию chatGPT.
-   Сообщения - это список всех сообщений между пользователем и ИИ на данный момент и системное сообщение, которое дает ИИ представление о том, какую помощь он может оказать.

```js
{
    role: "system",
    content: "You are a EbereGPT. You can help with graphic design tasks",
}
```

Вы можете изменить содержание так, как вам удобно.

Сообщения" не обязательно должны содержать более одного объекта в массиве. Это может быть просто одно сообщение. Но когда это массив, это обеспечивает историю сообщений, на которую ИИ может опираться, чтобы давать лучшие ответы в будущем, и это заставляет пользователя набирать меньше текста, так как нет необходимости постоянно быть слишком описательным.

Функция `createChatCompletion` возвращает промис. Поэтому используйте блок `then...catch...`, чтобы получить ответ.

```js
.then((res) => {
    msgs.push(res.data.choices[0].message);
    setChats(msgs);
    setIsTyping(false);
})
.catch((error) => {
    console.log(error);
});
```

Этот код добавляет сообщение, полученное от ИИ, в массив `chats` и устанавливает `isTyping` в false, указывая на то, что ИИ закончил отвечать.

Теперь вы должны получать обратную связь (`Typing`) каждый раз, когда вы отправляете сообщение:

![Chat application giving feedback when the AI is about to respond](chatbot-2.png)

Пришло время отобразить историю чата, чтобы пользователь мог ее увидеть.

Введите следующий код прямо под тегом `h1`:

```js
<section>
    {chats && chats.length
        ? chats.map((chat, index) => (
              <p
                  key={index}
                  className={
                      chat.role === 'user' ? 'user_msg' : ''
                  }
              >
                  <span>
                      <b>{chat.role.toUpperCase()}</b>
                  </span>
                  <span>:</span>
                  <span>{chat.content}</span>
              </p>
          ))
        : ''}
</section>
```

Приведенный выше код перебирает `chats` и показывает их пользователю один за другим. Он выводит `role` в верхнем регистре и `content` сообщения рядом.

Вот как должен выглядеть вывод:

![ChatBot Working As Expected without CSS](chatbot-3.png)

Это выглядит круто!

Но добавив немного стилизации, вы придадите ему привлекательный вид, как [WhatsApp](https://www.whatsapp.com/) или [Messenger](https://www.messenger.com/).

Замените содержимое файла `src/index.css` на следующее:

```css
:root {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial,
        sans-serif;
    line-height: 1.5;
    font-weight: 400;
    color-scheme: light dark;
    color: rgba(255, 255, 255, 0.87);
    background-color: #242424;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
}
h1 {
    font-size: 3.2em;
    line-height: 1.1;
    text-align: center;
    position: sticky;
    top: 0;
    background-color: #242424;
}
main {
    max-width: 500px;
    margin: auto;
}
p {
    background-color: darkslategray;
    max-width: 70%;
    padding: 15px;
    border-radius: 50px;
}
p span {
    margin: 5px;
}
p span:first-child {
    margin-right: 0;
}
.user_msg {
    text-align: right;
    margin-left: 30%;
    display: flex;
    flex-direction: row-reverse;
}
.hide {
    visibility: hidden;
    display: none;
}
form {
    text-align: center;
    position: sticky;
    bottom: 0;
}
input {
    width: 100%;
    height: 40px;
    border: none;
    padding: 10px;
    font-size: 1.2rem;
}
input:focus {
    outline: none;
}
```

И удалите все стили из файла `src/App.css`.

Вы можете найти [полный код на GitHub](https://github.com/EBEREGIT/react-chatgpt-tutorial).

Теперь приложение должно иметь новый вид:

![ChatBot Working As Expected with CSS](chatbot-4.png)

На этом создание чатбота с помощью React и ChatGPT завершено. Это не так сложно, как кажется.

Но фронтенд-приложения, подобные этому, лучше всего подходят для демонстрации, а не для производства. Проблема создания приложения таким образом заключается в том, что фронтенд раскрывает API-ключ для кибер-атак.

Чтобы решить эту проблему, возможно, имеет смысл сохранить API Key и Organisation Id в безопасном месте в облаке и ссылаться на них, или создать бэкэнд для вашего приложения с лучшей безопасностью.

Следующий раздел будет работать над этой проблемой.

## Как объединить React и Node.js для создания ИИ чата

В этом разделе мы объединим силы предыдущих разделов, чтобы создать более безопасное приложение, демонстрирующее лучшие UI и UX.

Мы улучшим раздел Node, используя сервер для выставления конечной точки для потребления фронтендом и упростим взаимодействие фронтенда с бэкендом вместо прямого обращения к [OpenAI](https://openai.com/).

### Как установить проект

В этой части будут созданы папки и файлы, необходимые для проекта.

Создайте каталог проекта:

```
mkdir react-node-chatgpt-tutorial
```

Перейдите в папку:

```
cd react-node-chatgpt-tutorial
```

Установите React с помощью Vite и назовите папку `frontend`. Используйте эту команду:

```
npm create vite@latest
```

После этого перейдите в папку и выполните следующую команду:

```
npm install
npm run dev
```

Эти команды установят необходимые зависимости и запустят локальный сервер на порту `5173`.

Создайте папку бэкенда:

```
mkdir backend
```

Теперь перейдите в папку backend и инициализируйте проект с помощью этой команды:

```
npm init -y
```

Это создаст файл `package.json` для отслеживания деталей проекта.

Добавьте в файл следующую строку кода:

```js
"type": "module"
```

Это позволит использовать модули ES6.

Установите [OpenAI](https://openai.com/) и другие зависимости с помощью команды ниже:

```
npm i openai body-parser cors express
```

Создайте файл, в котором будет находиться весь код. Назовите его `index.js`:

```
touch index.js
```

На этом настройка проекта завершена. Теперь есть две папки (`frontend` и `backend`).

### Как создать сервер

Эта часть будет посвящена созданию локального сервера, который будет слушать порт `8000`.

Первое, что нужно сделать, это импортировать необходимые модули следующим образом:

```js
import { Configuration, OpenAIApi } from 'openai';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
```

Далее настройте `express`, `порт` для прослушивания, `body-parser` для получения входных данных и `cors` для свободного обмена данными между фронтендом и бэкендом. Используйте приведенный ниже код:

```js
const app = express();
const port = 8000;
app.use(bodyParser.json());
app.use(cors());
```

Наконец, введите следующий код:

```js
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
```

На этом установка сервера завершена.

Когда вы запустите `index.js`, вы должны получить следующий результат:

```
listening on port 8000
```

### Как создать конечную точку

В этой части мы создадим конечную точку, которая будет получать сообщения от фронтенда, используя тело запроса, и возвращать ответ вызывающей стороне.

Начните с установки параметров конфигурации, как мы это делали в предыдущих разделах:

```js
const configuration = new Configuration({
    organization: 'org-0nmrFWw6wSm6xIJXSbx4FpTw',
    apiKey:
        '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',
});
const openai = new OpenAIApi(configuration);
```

Затем создайте асинхронный POST-маршрут, используя приведенный ниже код:

```js
app.post('/', async (request, response) => {});
```

Эта конечная точка будет вызываться с помощью `http://localhost:8000/`.

В функции обратного вызова введите код ниже, чтобы получить входные данные `chats` из тела запроса (`request.body`):

```js
const { chats } = request.body;
```

Теперь вызовите конечную точку `createChatCompletion`, как мы это делали в разделе React:

```js
const result = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
        {
            role: 'system',
            content:
                'You are a EbereGPT. You can help with graphic design tasks',
        },
        ...chats,
    ],
});
```

Разница здесь в том, что вместо использования блока `then...catch...` мы присвоили его переменной (`result`) и вернули ответ с помощью `response.json()`, как в следующем коде:

```js
response.json({
    output: result.data.choices[0].message,
});
```

Найдите код этой части на [GitHub здесь](https://github.com/EBEREGIT/react-nodejs-chatgpt-tutorial/tree/master/backend).

Вот результат тестирования на Postman:

![Output From Postman](chatbot-5.png)

На этом часть кода, посвященная бэкенду, завершена. В следующей части мы соединим фронтенд с бэкендом, используя только что созданную конечную точку (`http://localhost:8000/`).

### Как подключиться к бэкенду с фронтенда

В этой части мы переходим на фронтенд, где создадим форму. Форма будет отправлять сообщение на бэкенд через конечную точку API и получать ответ через ту же среду.

Перейдите в файл `frontend/src/App.jsx` и введите следующий код:

```js
import { useState } from 'react';

function App() {
    const [message, setMessage] = useState('');
    const [chats, setChats] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    const chat = async (e, message) => {
        e.preventDefault();

        if (!message) return;
        setIsTyping(true);

        let msgs = chats;
        msgs.push({ role: 'user', content: message });
        setChats(msgs);

        setMessage('');

        alert(message);
    };

    return (
        <main>
            <h1>FullStack Chat AI Tutorial</h1>

            <section>
                {chats && chats.length
                    ? chats.map((chat, index) => (
                          <p
                              key={index}
                              className={
                                  chat.role === 'user'
                                      ? 'user_msg'
                                      : ''
                              }
                          >
                              <span>
                                  <b>
                                      {chat.role.toUpperCase()}
                                  </b>
                              </span>
                              <span>:</span>
                              <span>{chat.content}</span>
                          </p>
                      ))
                    : ''}
            </section>

            <div className={isTyping ? '' : 'hide'}>
                <p>
                    <i>{isTyping ? 'Typing' : ''}</i>
                </p>
            </div>

            <form
                action=""
                onSubmit={(e) => chat(e, message)}
            >
                <input
                    type="text"
                    name="message"
                    value={message}
                    placeholder="Type a message here and hit Enter..."
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                />
            </form>
        </main>
    );
}
export default App;
```

Этот код похож на код из предыдущего раздела. Но мы удалили конфигурации OpenAI, поскольку в этом разделе они нам больше не понадобятся.

На данный момент при отправке формы появляется предупреждение. Это изменится через некоторое время.

В функции чата избавьтесь от сообщения `alert` и введите следующее:

```js
fetch('http://localhost:8000/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        chats,
    }),
})
    .then((response) => response.json())
    .then((data) => {
        msgs.push(data.output);
        setChats(msgs);
        setIsTyping(false);
    })
    .catch((error) => {
        console.log(error);
    });
```

Приведенный выше код вызывает созданную нами конечную точку и передает ей массив `chats` для обработки. Затем он возвращает ответ, который добавляется в `чаты` и отображается в пользовательском интерфейсе.

Ниже показано, как выглядит пользовательский интерфейс на данный момент:

![Fullstack Chat UI before Styling](chatbot-6.png)

Пользовательский интерфейс может выглядеть лучше, если вы добавите следующие стили в файл `frontend/src/index.css`:

```css
:root {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial,
        sans-serif;
    line-height: 1.5;
    font-weight: 400;

    color-scheme: light dark;
    color: rgba(255, 255, 255, 0.87);
    background-color: #242424;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
}

html,
body {
    scroll-behavior: smooth;
}

h1 {
    font-size: 3.2em;
    line-height: 1.1;
    text-align: center;
    position: sticky;
    top: 0;
    background-color: #242424;
}

main {
    max-width: 800px;
    margin: auto;
}

p {
    background-color: darkslategray;
    max-width: 70%;
    padding: 15px;
    border-radius: 50px;
}

p span {
    margin: 5px;
}

p span:first-child {
    margin-right: 0;
}

.user_msg {
    text-align: right;
    margin-left: 30%;
    display: flex;
    flex-direction: row-reverse;
}

.hide {
    visibility: hidden;
    display: none;
}

form {
    text-align: center;
    position: sticky;
    bottom: 0;
}

input {
    width: 100%;
    height: 40px;
    border: none;
    padding: 10px;
    font-size: 1.2rem;
    background-color: rgb(28, 23, 23);
}

input:focus {
    outline: none;
}
```

И удалите все стили из файла `frontend/src/App.css`.

Код для этой части находится на [GitHub](https://github.com/EBEREGIT/react-nodejs-chatgpt-tutorial/tree/master/frontend).

Теперь вот окончательный результат:

![FullStack ChatBot Working As Expected with CSS](chatbot-7.png)

Поздравляю с завершением проекта!

Полный стек чатбота был более трудоемким, но он помог нам разделить проблемы, создать более безопасное и привлекательное приложение и предложить лучший опыт пользователям. Так что это стоило усилий.

Вы можете найти [код этого раздела на GitHub](https://github.com/EBEREGIT/react-nodejs-chatgpt-tutorial).

## Заключение

Этот учебник, надеюсь, показал вам, что любой человек, обладающий базовыми знаниями программирования, может создавать программное обеспечение с искусственным интеллектом. Вы узнали, как создать чат-бота с помощью React и Nodejs, мы обсудили плюсы и минусы каждой технологии. Наконец, мы создали решение, которое было одновременно функциональным, безопасным и визуально привлекательным.

Прочитав это руководство, вы теперь можете изучить такие функциональные возможности ИИ, как работа с изображениями и взаимодействие со звуком. Не пожалейте времени на изучение [документации](https://platform.openai.com/docs/introduction) и посмотрите, как вы можете расширить то, что мы здесь рассмотрели.

## Ссылки

-   [How to Build an AI-Powered ChatBot with OpenAI, ChatGPT, Node.js, and React](https://www.freecodecamp.org/news/how-to-build-a-chatbot-with-openai-chatgpt-nodejs-and-react/)
