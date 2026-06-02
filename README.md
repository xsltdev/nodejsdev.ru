# Справочник

Для разметки контента используется markdown, собирается сайт движком [ProperDocs](https://properdocs.org/).

## Участие

Чтобы исправить ошибку или добавить что-то новое в этот репозиторий, вам нужно открыть пулл-реквест на Гитхабе. Кроме того, на каждой странице сайта справа от заголовка есть иконка редактирования (карандаш).

## Сборка справочника

Для сборки справочника нужно [установить ProperDocs](https://properdocs.org/user-guide/installation/), [расширения PyMdown](https://facelessuser.github.io/pymdown-extensions/installation/) и тему [MaterialX for ProperDocs](https://jaywhj.github.io/mkdocs-materialx/):

```
python -m venv .venv
source .venv/bin/activate
pip3 install -r ./requirements.txt
```

Сборка проекта:

```
properdocs build
```

Режим разработчика:

```
properdocs serve --dirtyreload
```

## Публикация

Все одобренные пулл-реквесты будут автоматически опубликованы на [сайте справочника](https://nodejsdev.ru/)
