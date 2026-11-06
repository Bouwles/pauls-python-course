---
id: what-goes-where
type: reading
title: What goes where
dialogue:
  - neil.neutral.point: "Four things, in order, like a pre-flight check. People get stuck by doing them in the wrong order."
---
Here's the order you'll set things up in on your own computer. The next step has the full guide for Windows, macOS and Linux.

1. **Python**, version 3.10 or newer: the program that runs your programs.
2. **An editor**, where you write the code. VS Code is free, and it shows Python's mistakes as you type.
3. **A terminal**, open in the project's folder, with the virtual environment made and switched on.
4. **pytest**, installed into that environment, to run the project's tests.

```console
$ python3 -m venv .venv
$ source .venv/bin/activate
(.venv) $ pip install -r requirements.txt
(.venv) $ pytest
```

`requirements.txt` lists the packages a project needs, so `pip install -r requirements.txt` installs them all in one go.
