"""Run these with: pytest"""
import subprocess
import sys
from datetime import date
from pathlib import Path

import pytest

PROJECT = Path(__file__).resolve().parent.parent
NOV_3 = date(2026, 11, 3)


def test_the_rules_come_from_the_package():
    from finance.money import Ledger, MoneyError

    ledger = Ledger()
    ledger.add(NOV_3, -450, "food", "chips")
    assert ledger.balance() == -450
    with pytest.raises(MoneyError):
        ledger.add(NOV_3, 0, "food")


def test_the_file_comes_from_the_package(tmp_path):
    from finance.money import Ledger
    from finance.storage import load_ledger, save_ledger

    ledger = Ledger()
    ledger.add(NOV_3, -450, "food", "chips")
    save_ledger(tmp_path / "money.json", ledger)
    assert load_ledger(tmp_path / "money.json").transactions == ledger.transactions


def test_the_command_line_comes_from_the_package(monkeypatch, capsys):
    from finance.cli import main

    monkeypatch.setattr(sys, "argv", ["finance", "--file", str(PROJECT / "money.json"), "balance"])
    main()
    assert capsys.readouterr().out == "Balance: £1,738.05\n"


def test_it_can_run_as_a_module():
    entry = PROJECT / "finance" / "__main__.py"
    assert entry.exists() and "main()" in entry.read_text(encoding="utf-8"), "finance/__main__.py should call main(), so python -m finance works."


def test_readme_is_your_own():
    text = (PROJECT / "README.md").read_text(encoding="utf-8")
    assert "Replace this line" not in text, "README.md still has the line asking you to replace it."
    assert "python -m finance" in text, "Say how to run it: python -m finance, then a command."


@pytest.mark.local
def test_runs_from_the_terminal():
    result = subprocess.run([sys.executable, "-m", "finance", "balance"], cwd=PROJECT, capture_output=True, text=True, timeout=30)
    assert result.stdout == "Balance: £1,738.05\n", f"python -m finance balance printed {result.stdout!r} {result.stderr!r}"
