---
id: reading
type: reading
title: How pytest does it
---
Real Python projects use **pytest**. You write the same plain `test_` functions with `assert`. pytest finds every file named `test_*.py`, runs every function in it whose name starts with `test_`, and reports each one: a dot for a pass, an F for a failure, with the values on both sides of the `assert` that failed.

```console
$ pytest
============================= test session starts ==============================
collected 3 items

test_till.py ..F                                                         [100%]

=================================== FAILURES ===================================
_____________________________ test_nothing_ordered _____________________________

    def test_nothing_ordered():
>       assert price("bread", 0) == 1
E       assert 0 == 1
E        +  where 0 = price('bread', 0)

test_till.py:13: AssertionError
========================= 1 failed, 2 passed in 0.02s ==========================
```

pytest doesn't run in this workshop, so the files here end with a few lines that do the finding and running. When you set Python up at home, you'll delete those lines and type `pytest`. The tests themselves won't change.

The checks in this job do what pytest does, and one thing more: they plant bugs in `tides.py` to see whether your tests notice.
