---
id: learn-terminal
type: learn
title: The terminal
concept: terminal-basics
---
A **terminal** is a window where you type a command, press Enter, and read what comes back. On your own computer it does the job of the Workshop's Run button.

A terminal is always in a folder, and commands look for files there. `cd` moves into a folder, `cd ..` moves up one, and `ls` lists what's here (`dir` on Windows). `python hello.py` runs the file `hello.py` with Python.

```console
$ cd at-home
$ ls
README.md  hello.py  pytest.ini  tests
$ python hello.py Paul
Morning, Paul.
```

Anything after the file name, like `Paul`, reaches the program in a list called `sys.argv`.

The usual slip is running a file from the wrong folder. If the terminal can't find `hello.py`, `cd` into the folder it's in first.
