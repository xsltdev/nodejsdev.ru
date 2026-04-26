"""Ищет файл .ads в папке страницы или выше по дереву docs и передаёт HTML в шаблон."""

from pathlib import Path


def on_page_context(context, page, config, nav):
    folder_ads_html = ""
    try:
        f = page.file
        abs_src = getattr(f, "abs_src_path", None) if f is not None else None
        if abs_src:
            src = Path(abs_src).resolve()
            docs_dir = Path(config.docs_dir).resolve()
            current = src.parent

            while True:
                try:
                    current.relative_to(docs_dir)
                except ValueError:
                    break
                ads_file = current / ".ads"
                if ads_file.is_file():
                    folder_ads_html = ads_file.read_text(encoding="utf-8")
                    break
                if current == docs_dir:
                    break
                parent = current.parent
                if parent == current:
                    break
                current = parent
    except (AttributeError, OSError, TypeError, ValueError):
        pass

    context["folder_ads_html"] = folder_ads_html
    return context
