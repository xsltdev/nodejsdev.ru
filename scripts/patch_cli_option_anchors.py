#!/usr/bin/env python3
"""Add explicit {#...} anchors to ### option headings in docs/api/cli.md (Node.js URL style)."""
from __future__ import annotations

import re
from pathlib import Path

CLI = Path(__file__).resolve().parents[1] / "docs" / "api" / "cli.md"


def node_style_anchor(heading_line: str) -> str | None:
    m = re.match(r"^###\s+(.+?)\s*$", heading_line)
    if not m:
        return None
    rest = m.group(1).strip()
    if "{#" in rest:
        return None
    parts = re.findall(r"`([^`]+)`", rest)
    if not parts:
        return None
    if len(parts) == 1:
        return parts[0].replace("=", "")
    # e.g. `-r`, `--require module` -> `-r---require-module`
    a0, a1 = parts[0], parts[1]
    rhs = re.sub(r'["\']', "", a1).lstrip("-").replace(" ", "-").replace("=", "")
    return f"{a0}---{rhs}"


def main() -> None:
    text = CLI.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    out: list[str] = []
    changed = 0
    for line in lines:
        if not line.startswith("###"):
            out.append(line)
            continue
        if "{#" in line:
            out.append(line)
            continue
        anchor = node_style_anchor(line.rstrip("\n"))
        if not anchor:
            out.append(line)
            continue
        stripped = line.rstrip("\n\r")
        nl = line[len(stripped) :]
        out.append(f"{stripped} {{#{anchor}}}{nl}")
        changed += 1
    new_text = "".join(out)
    if new_text != text:
        CLI.write_text(new_text, encoding="utf-8")
    print(f"cli.md: added explicit anchors to {changed} headings")


if __name__ == "__main__":
    main()
