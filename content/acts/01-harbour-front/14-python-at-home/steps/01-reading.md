---
id: what-goes-where
type: reading
title: What goes where
dialogue:
  - neil: "Four things. None of them is hard. People get stuck by doing them in the wrong order."
---
**Python** is a program on your computer that runs other programs. You talk to it through a **terminal**: a window where you type a command, press Enter, and read what comes back.

An **editor** is where you write the code. VS Code is free, and it shows Python's mistakes as you type.

A **virtual environment** is a folder, usually called `.venv`, holding one project's own copy of the packages it needs. Two projects can then need different versions of the same package without arguing. You make one per project and switch it on whenever you work there.

**pytest** runs a project's tests and reports which pass. The checks in the Workshop work the same way.

```console
$ python3 -m venv .venv
$ source .venv/bin/activate
(.venv) $ pip install -r requirements.txt
(.venv) $ pytest
```
