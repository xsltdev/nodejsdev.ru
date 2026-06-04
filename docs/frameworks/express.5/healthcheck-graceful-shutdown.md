---
description: Узнайте, как реализовать health checks и graceful shutdown в Express-приложениях для повышения надежности, управления деплоями и интеграции с балансировщиками вроде Kubernetes.
---

# Health Checks и Graceful Shutdown

## Graceful shutdown

Когда вы выкладываете новую версию приложения, предыдущую нужно заменить. Процесс-менеджер сначала отправит приложению сигнал SIGTERM, сообщая о скором завершении. После получения сигнала приложение должно перестать принимать новые запросы, завершить текущие, освободить ресурсы (включая подключения к БД и file lock) и завершиться.

### Пример

```js
const server = app.listen(port);

process.on('SIGTERM', () => {
    debug('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        debug('HTTP server closed');
    });
});
```

## Health checks

Балансировщик использует health checks, чтобы определить, здорова ли инстанция приложения и может ли она принимать запросы. Например, в [Kubernetes есть два типа проверок](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/):

-   `liveness` — определяет, когда перезапускать контейнер.
-   `readiness` — определяет, когда контейнер готов принимать трафик. Если pod не готов, его исключают из балансировщиков сервиса.
