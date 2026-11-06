---
id: at-home
type: takehome
title: Python on your own computer
python: "3.10"
dialogue:
  - neil.pleased: "Download it, set it up, make the tests pass. Then hand the results in from your own terminal."
---
The project has `hello.py`, whose `greeting` function you finish, and six tests. Three check your function. Three check your computer: that Python is recent enough, that the virtual environment is switched on, and that `hello.py` runs from the terminal.

Open the project folder in VS Code (File, then Open Folder) and write `greeting` there. Run `pytest` after each change. When all six pass, hand it in.

If a setup test fails, its message says what to do. The usual one is forgetting to switch the virtual environment on in a new terminal.
