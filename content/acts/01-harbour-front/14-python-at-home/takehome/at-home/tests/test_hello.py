"""Run these with: pytest"""
import subprocess
import sys
from pathlib import Path

import pytest

from hello import greeting

PROJECT = Path(__file__).resolve().parent.parent


def test_greeting():
    assert greeting("Riya") == "Morning, Riya."


def test_greeting_another_name():
    assert greeting("Caitlin and Yahya") == "Morning, Caitlin and Yahya."


def test_greeting_ignores_spaces():
    assert greeting("  Aaesha ") == "Morning, Aaesha."


@pytest.mark.local
def test_python_is_recent_enough():
    assert sys.version_info >= (3, 10), f"This is Python {sys.version.split()[0]}. Install 3.10 or newer, then make the virtual environment again."


@pytest.mark.local
def test_virtual_environment_is_switched_on():
    assert sys.prefix != sys.base_prefix, "The virtual environment isn't switched on. Run the activate line from README.md, then pytest again."


@pytest.mark.local
def test_runs_from_the_terminal():
    result = subprocess.run([sys.executable, "hello.py", "Paul"], cwd=PROJECT, capture_output=True, text=True, timeout=30)
    assert result.stdout == "Morning, Paul.\n", f"python hello.py Paul printed {result.stdout!r}"
