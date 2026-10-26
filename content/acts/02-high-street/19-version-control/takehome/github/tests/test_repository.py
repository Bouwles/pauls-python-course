"""Run these with: pytest"""
import os
import subprocess
from pathlib import Path

import pytest

PROJECT = Path(__file__).resolve().parent.parent


def read(name):
    return (PROJECT / name).read_text(encoding="utf-8")


def git(*args):
    env = {**os.environ, "GIT_TERMINAL_PROMPT": "0"}
    return subprocess.run(["git", *args], cwd=PROJECT, capture_output=True, text=True, timeout=60, env=env)


def test_readme_is_your_own():
    text = read("README.md")
    assert "Replace this line" not in text, "README.md still has the line asking you to replace it with your own words."
    assert len(text.split()) >= 30, "Say in a few sentences of your own what the program does and who it's for: 30 words or more."


def test_readme_says_how_to_run_it():
    assert "python jobs.py" in read("README.md"), "README.md should say how to run it: python jobs.py"


def test_tracker_still_works():
    from jobs import JOBS, by_urgency

    urgencies = [urgency for name, urgency in by_urgency(JOBS)]
    assert urgencies == sorted(urgencies), "by_urgency should still put the most urgent job first."


@pytest.mark.local
def test_is_a_repository():
    assert git("rev-parse", "--is-inside-work-tree").stdout.strip() == "true", "This folder isn't a git repository yet. Run git init in it."


@pytest.mark.local
def test_has_history():
    count = git("rev-list", "--count", "HEAD").stdout.strip()
    assert count.isdigit() and int(count) >= 2, "Make at least two commits: the project as it came, then your README."


@pytest.mark.local
def test_keeps_the_clutter_out():
    ignore = PROJECT / ".gitignore"
    assert ignore.exists(), "Add a .gitignore file, so __pycache__ and .venv stay out of the repository."
    text = ignore.read_text(encoding="utf-8")
    assert "__pycache__" in text and ".venv" in text, ".gitignore should have a line for __pycache__/ and one for .venv/"


@pytest.mark.local
def test_everything_is_committed():
    changed = git("status", "--porcelain", "--untracked-files=no").stdout.strip()
    assert changed == "", f"These have changed since the last commit:\n{changed}\nCommit them, or the copy on GitHub won't match."


@pytest.mark.local
def test_origin_is_on_github():
    url = git("remote", "get-url", "origin").stdout.strip()
    assert "github.com" in url, "Add your GitHub repository as origin: git remote add origin, then its address."


@pytest.mark.local
def test_pushed():
    upstream = git("rev-parse", "@{u}")
    assert upstream.returncode == 0, "Push it, and tell git where it lives: git push -u origin main"
    assert upstream.stdout.strip() == git("rev-parse", "HEAD").stdout.strip(), "There are commits here that GitHub hasn't got. git push sends them."
