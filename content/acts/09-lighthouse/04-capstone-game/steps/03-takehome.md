---
id: pier-game
type: takehome
title: Caitlin's cabinet
python: "3.10"
requirements: [pygame]
heavy: true
setup: |
  pygame opens a window of its own: `python main.py` starts the game, and closing the window or pressing Escape stops it. If `pip install pygame` fails on a brand-new version of Python, use the version before it for this project's virtual environment. The tests never open a window, so pytest works anywhere.
dialogue:
  - caitlin.laughing: "The rules are in the tests. I wrote them with Aaesha. She kept saying 'exactly'."
---
Download the project: `pier.py` and `scores.py` with their docstrings and empty methods, a `main.py` that opens a window and runs the loop but draws nothing yet, and the agreed tests in `tests/`.

1. Work through the four milestones below, with the project open.
2. Put your own tests in `tests/test_mine.py`.

The tests import `pier.py` and `scores.py`, never pygame, except one marked `local`, which runs `python main.py --frames 30` to check your loop runs.

Done: `pytest` passes every test, yours included. Then hand the report in here.

```console
(.venv) $ pytest -x
(.venv) $ python main.py
```
