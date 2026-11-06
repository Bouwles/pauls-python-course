---
id: learn-venv
type: learn
title: A virtual environment
concept: virtual-environments
---
A **virtual environment** is a folder inside a project, usually called `.venv`, holding that project's own copy of Python and its packages. A **package** is code someone else wrote that you install, like pytest.

With one per project, two projects can need different versions of the same package without breaking each other.

You make it once per project, then switch it on in every new terminal. While it's on, the prompt starts with `(.venv)`, and `pip install` puts packages into it alone.

```console
$ python3 -m venv .venv
$ source .venv/bin/activate
(.venv) $ pip install pytest
```

On Windows, the second line is `.venv\Scripts\Activate.ps1`.

The usual slip is opening a new terminal and forgetting to switch it on again. Look for `(.venv)` before you start.
