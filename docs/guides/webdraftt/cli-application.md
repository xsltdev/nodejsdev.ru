# Создание CLI-приложения

Node.js позволяет создавать CLI-приложения, взаимодействие с которыми осуществляется через интерфейс командной строки.

Для начала необходимо установить модули `commander` и `inquirer`. Commander предоставляет гибкое API для обработки команд и параметров командной строки, а inquirer позволяет пользователю взаимодействовать с приложением через консоль в процессе его работы.

```
npm install commander inquirer --save
```

Рассмотрим пример консольного Node.js приложения, которое создает конфигурационные файлы в одном из трех форматов: `json`, `txt` или `cfg` (по умолчанию). Также предусмотрим возможность просматривать список уже созданных файлов.

_app.js_

```js
#!/usr/bin/env node

const commander = require('commander'),
    { prompt } = require('inquirer'),
    chalk = require('chalk'),
    fs = require('fs');

commander
    .version('1.0.0')
    .description('Configuration files creator.');

commander
    .command('create <name>')
    .option('--extension <value>', 'File extension')
    .alias('c')
    .description('Create new configuration file.')
    .action((name, cmd) => {
        if (
            cmd.extension &&
            !['json', 'txt', 'cfg'].includes(cmd.extension)
        ) {
            console.log(
                chalk.red('\nExtension is not allowed.')
            );
        } else {
            prompt([
                {
                    type: 'input',
                    name: 'charset',
                    message: 'Charset: ',
                },
                {
                    type: 'input',
                    name: 'max_ram_usage',
                    message: 'Max RAM usage, Mb: ',
                },
                {
                    type: 'input',
                    name: 'max_cpu_usage',
                    message: 'Max CPU usage, %: ',
                },
                {
                    type: 'input',
                    name: 'check_updates_interval',
                    message: 'Updates interval, ms: ',
                },
                {
                    type: 'input',
                    name: 'processes_count',
                    message: 'Processes count: ',
                },
            ]).then((options) => {
                if (
                    cmd.extension &&
                    cmd.extension === 'json'
                ) {
                    fs.writeFileSync(
                        `files/${name}.${cmd.extension}`,
                        JSON.stringify(options)
                    );
                } else {
                    let data = '';
                    for (let item in options)
                        data += `${item}=${options[item]} \n`;

                    fs.writeFileSync(
                        `files/${name}.cfg`,
                        data
                    );
                }
                console.log(
                    chalk.green(
                        `\nFile "${name}.${
                            cmd.extension || 'cfg'
                        }" created.`
                    )
                );
            });
        }
    });

commander
    .command('all')
    .alias('a')
    .description('Show all configuration files.')
    .action(() => {
        const files = fs.readdirSync('files');

        let data = '';
        for (let file of files) data += `${file} \n`;

        console.log(
            chalk.grey(`\nConfiguration files: \n\n${data}`)
        );
    });

commander.parse(process.argv);
```

При создании Node.js CLI-приложения можно указать его метаданные: версию и описание.

```js
commander
    .version('1.0.0')
    .description('Configuration files creator.');
```

Чтобы узнать версию, выполните следующую команду.

```
node app.js --version
```

Для просмотра списка возможных команд и их опций укажите параметр `--help`.

```
node app.js --help
```

Команды описываются с помощью метода `command()` модуля `commander`, которому параметром передается имя команды с названием задаваемого ей параметра, заключенного в угловые скобки.

```js
command('create <name>');
```

Для описания самой команды имеется метод `description()`.

```js
description('Create new configuration file.');
```

Метод `option()` позволяет задать дополнительные необязательные аргументы команды. Самому методу передаются два аргумента:

-   имя параметра;
-   описание параметра (необязательно).

```js
option('--extension <value>', 'File extension');
```

Краткая форма записи команды задается методом `alias()`.

```js
alias('a');
```

В методе `action()` описывается логика обработки создаваемой `command()` команды. Параметрами `action()` принимает все значения основных параметров команды, а последним параметром объект с дополнительными параметрами, заданными методом `option()`.

```js
action((name, cmd) => {});
```

После описания всех команд обязательно необходимо вызвать метод `parse()` и передать ему все параметры командной строки.

```js
commander.parse(process.argv);
```

Для ввода параметров конфигурационного файла в приведенном примере Node.js CLI-приложения используется модуль `inquirer`. С помощью его метода `prompt` задается массив параметров, которые должен заполнить пользователь. Сам метод возвращает объект `Promise` с заполненными данными в виде объекта.

```ts
prompt([
    {
        type: 'input',
        name: 'charset',
        message: 'Charset: ',
    },
]).then((options) => {});
```

Вводимый пользователем параметр описывается объектом со следующими свойствами:

-   `type` - тип поля, возможные значения: `input`, `number`, `confirm`, `list`, `rawlist`, `expand`, `checkbox`, `password` и `editor`;
-   `name` - имя параметра;
-   `message` - текст, который будет отображаться пользователю при запросе ввода параметра;
-   `default` - значение параметра по умолчанию.

Здесь указаны основные свойства, с полным перечнем можно ознакомиться [здесь](https://www.npmjs.com/package/inquirer).

Теперь рассмотрим, как запускать свое приложение не напрямую через скрипт, а с использованием глобальной команды.

В `app.js` в самом начале уже имеется следующая строка.

```js
#!/usr/bin/env node

```

Она указывает, что обработка данного файла должна осуществляться Node.js.

Теперь обновим файл `package.json`.

```json
{
    "name": "cfg",
    "preferGlobal": true,
    "bin": "./app.js"
}
```

И выполним из директории проекта следующую команду.

```
npm link
```

Теперь созданное Node.js CLI-приложение может вызываться глобально из командной строки следующим образом.

```
cfg all
```
