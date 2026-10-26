---
id: reading
type: reading
title: How pytest does it
---
Real Python projects use **pytest**. You write the same plain `test_` functions with `assert`. pytest finds every file named `test_*.py`, runs every function in it whose name starts with `test_`, and reports each one: a dot for a pass, an F for a failure, with the values on both sides of the `assert` that failed.

```console
$ pytest
collected 4 items

test_till.py ..F.                                                        [100%]

    def test_nothing_ordered():
>       assert price("bread", 0) == 1
E       assert 0 == 1
E        +  where 0 = price('bread', 0)

test_till.py:19: AssertionError
========================= 1 failed, 3 passed in 0.02s ==========================
```

pytest also has a neater way to expect an error: `with pytest.raises(ValueError):`. The `try` and `except` way works everywhere, so it's the one used here.

pytest doesn't run in this workshop, so these files end with a few lines that do the finding and running. At home you'll delete them and type `pytest`. The checks in this job do what pytest does, and one thing more: they plant bugs in `bank.py` to see whether your tests notice.
