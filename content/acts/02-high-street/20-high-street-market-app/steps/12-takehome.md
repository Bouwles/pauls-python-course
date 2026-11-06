---
id: package
type: takehome
title: A proper package
python: "3.10"
dialogue:
  - paul.neutral: "On the workbench it's four files in a row. At home it's a package: a folder that knows it's one program."
setup: |
  A **package** is a folder of modules with an `__init__.py` in it. Its modules import each other by the package's name, `from finance.money import Ledger`, so it works from wherever it's run. `__main__.py` is what `python -m finance` runs.
---
The download is laid out the way real Python projects are:

```
finance/__init__.py    makes finance a package
finance/__main__.py    what python -m finance runs
finance/money.py       copy yours in
finance/storage.py     copy yours in
finance/cli.py         copy yours in
tests/                 copy your test_money.py in
README.md              yours to write
```

Copy your four files into place, then change each `from money import` to `from finance.money import`, and the same for `storage`, as the last step showed. Write the README. Then run `pytest`, and `python -m finance report 2026-11`. When every test passes, yours included, hand it in.
