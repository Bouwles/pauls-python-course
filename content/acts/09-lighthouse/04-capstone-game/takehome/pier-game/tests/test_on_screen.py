"""The line between the rules and the drawing, and the drawing itself."""
import ast
import os
import subprocess
import sys
from pathlib import Path

import pytest

PROJECT = Path(__file__).resolve().parent.parent


def imported_names(filename):
    tree = ast.parse((PROJECT / filename).read_text(encoding="utf-8"))
    names = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            names.update(alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            names.add(node.module.split(".")[0])
    return names


def test_the_rules_never_import_pygame():
    for filename in ("pier.py", "scores.py"):
        assert "pygame" not in imported_names(filename), f"{filename} imports pygame. Keep the drawing in main.py."


@pytest.mark.local
def test_the_game_runs_without_a_window():
    env = {**os.environ, "SDL_VIDEODRIVER": "dummy", "SDL_AUDIODRIVER": "dummy"}
    result = subprocess.run([sys.executable, "main.py", "--frames", "30"], cwd=PROJECT, env=env,
                            capture_output=True, text=True, timeout=120)
    assert result.returncode == 0, f"python main.py --frames 30 stopped with an error:\n{result.stderr[-800:]}"
