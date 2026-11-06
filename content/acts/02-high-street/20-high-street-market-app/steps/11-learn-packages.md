---
id: learn-packages
type: learn
title: A folder of modules
concept: modules
---
A **package** is a folder of modules that belong together, with a file called `__init__.py` inside it. That file can be nearly empty: it tells Python the folder is a package.

Four loose files become one thing: other code imports it by one name, and it runs with one command.

Inside a package, imports name the package first: `from finance.money import Ledger`, not `from money import Ledger`. A file called `__main__.py` in the package is what runs when you type `python -m finance` in a terminal. `-m` means run this module or package by name.

```console
$ python -m finance report 2026-11
$ pytest
```

The usual slip is to leave the old imports as they were. `from money import` can't find `money` once it lives inside `finance`.
