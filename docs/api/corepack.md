---
description: экспериментальный инструмент, помогающий управлять версиями ваших менеджеров пакетов
---

# Corepack

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/corepack.html)

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

**[Corepack](https://github.com/nodejs/corepack)** - это экспериментальный инструмент, помогающий управлять версиями ваших менеджеров пакетов. Он предоставляет двоичные прокси для каждого [поддерживаемого пакетного менеджера](#supported-package-managers), которые при вызове определяют, какой пакетный менеджер настроен для текущего проекта, прозрачно устанавливают его, если необходимо, и, наконец, запускают его, не требуя явного взаимодействия с пользователем.

Эта функция упрощает два основных рабочих процесса:

- Она облегчает работу с новыми сотрудниками, поскольку им больше не придется следовать специфическим для системы процессам установки только для того, чтобы иметь нужный менеджер пакетов.

- Это позволяет вам гарантировать, что все члены вашей команды будут использовать именно ту версию менеджера пакетов, которую вы хотите, без необходимости вручную синхронизировать ее каждый раз, когда вам нужно сделать обновление.

## Рабочие процессы

### Включение функции

Из-за своего экспериментального статуса, Corepack в настоящее время должен быть явно включен, чтобы иметь какой-либо эффект. Для этого выполните [`corepack enable`](https://github.com/nodejs/corepack#corepack-enable--name), который установит симлинки в вашем окружении рядом с бинарным файлом `node` (и перезапишет существующие симлинки, если необходимо).

С этого момента любой вызов [supported binaries](#supported-package-managers) будет работать без дополнительных настроек. Если у вас возникнут проблемы, запустите [`corepack disable`](https://github.com/nodejs/corepack#corepack-disable--name), чтобы удалить прокси из вашей системы (и подумайте об открытии проблемы в [репозитории Corepack](https://github.com/nodejs/corepack), чтобы сообщить нам об этом).

### Конфигурирование пакета

Прокси Corepack найдет ближайший файл [`package.json`](packages.md#nodejs-packagejson-field-definitions) в текущей иерархии каталогов для извлечения его свойства [`"packageManager"`](packages.md#packagemanager).

Если значение соответствует поддерживаемому пакетному менеджеру, Corepack убедится, что все обращения к соответствующим двоичным файлам выполняются по запрошенной версии, загружая ее по требованию, если это необходимо, и прерывая, если она не может быть успешно получена.

### Обновление глобальных версий

При запуске вне существующего проекта (например, при запуске `yarn init`) Corepack по умолчанию будет использовать предопределенные версии, примерно соответствующие последним стабильным релизам каждого инструмента. Эти версии можно отменить, выполнив команду [`corepack prepare`](https://github.com/nodejs/corepack#corepack-prepare--nameversion) вместе с версией пакетного менеджера, которую вы хотите установить:

```bash
corepack prepare yarn@x.y.z --activate
```

В качестве альтернативы можно использовать тег или диапазон:

```bash
corepack prepare pnpm@latest --activate
corepack prepare yarn@stable --activate
```

### Автономный рабочий процесс

Многие производственные среды не имеют доступа к сети. Поскольку Corepack обычно загружает релизы менеджеров пакетов прямо из их реестров, он может конфликтовать с такими средами. Чтобы этого не произошло, вызывайте команду [`corepack prepare`](https://github.com/nodejs/corepack#corepack-prepare--nameversion), пока у вас есть доступ к сети (обычно в то же время, когда вы готовите образ для развертывания). Это гарантирует, что необходимые менеджеры пакетов будут доступны даже без доступа к сети.

Команда `prepare` имеет [различные флаги](https://github.com/nodejs/corepack#utility-commands). Для получения дополнительной информации обратитесь к подробной документации [Corepack documentation](https://github.com/nodejs/corepack#readme).

## Поддерживаемые менеджеры пакетов

Следующие двоичные файлы предоставляются через Corepack:

<table>
<thead>
<tr class="header">
<th>Package manager</th>
<th>Binary names</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><a href="https://yarnpkg.com">Yarn</a></td>
<td><code>yarn</code>, <code>yarnpkg</code></td>
</tr>
<tr class="even">
<td><a href="https://pnpm.js.org">pnpm</a></td>
<td><code>pnpm</code>, <code>pnpx</code></td>
</tr>
</tbody>
</table>

## Общие вопросы

### Как Corepack взаимодействует с npm?

Хотя Corepack может поддерживать npm, как и любой другой менеджер пакетов, его shims не включен по умолчанию. Это имеет несколько последствий:

- Всегда можно выполнить команду `npm` в проекте, настроенном на использование с другим пакетным менеджером, поскольку Corepack не может перехватить ее.

- Хотя `npm` является допустимой опцией в свойстве [`"packageManager"`](packages.md#packagemanager), отсутствие shim приведет к использованию глобального npm.

### Запуск `npm install -g yarn` не работает

npm предотвращает случайное переопределение двоичных файлов Corepack при глобальной установке. Чтобы избежать этой проблемы, рассмотрите один из следующих вариантов:

- Не выполнять эту команду; Corepack в любом случае предоставит двоичные файлы менеджеров пакетов и обеспечит постоянную доступность требуемых версий, поэтому явная установка менеджеров пакетов не требуется.

- Добавьте флаг `--force` к `npm install`; это скажет npm, что можно переопределить двоичные файлы, но при этом вы удалите файлы Corepack. (Запустите [`corepack enable`](https://github.com/nodejs/corepack#corepack-enable--name), чтобы добавить их обратно).