---
id: pier-game
type: takehome
title: Gwen's cabinet
python: "3.10"
requirements: [pygame]
heavy: true
setup: |
  pygame opens a window of its own: `python main.py` starts the game, and closing the window or pressing Escape stops it. If `pip install pygame` fails on a brand-new version of Python, use the version before it for this project's virtual environment. The tests never open a window, so pytest works anywhere.
dialogue:
  - gwen: "The rules are in the tests. I wrote them with Moss. He kept saying 'exactly'."
---
The project has `pier.py` and `scores.py` with their docstrings and empty methods, a `main.py` that opens a window and runs the loop but draws nothing yet, and the agreed tests in `tests/`.

The tests import `pier.py` and `scores.py` and never pygame, except one, marked `local`, which runs `python main.py --frames 30` with no window to check your loop runs. Your own tests go in `tests/test_mine.py`.

Download it now and keep it open through the milestones. When every test passes, yours included, hand the report in here.

```console
(.venv) $ pytest -x
(.venv) $ python main.py
```
