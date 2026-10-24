---
id: make-fine-tests
type: make
title: Mrs Vance's fines, tested
files: [fines.py, test_fines.py]
entry: test_fines.py
dialogue:
  - vance: "The fines are right. I want proof they stay right after the council's nephew has had a go."
on_pass: { vance: "Six wrong versions, and your tests turned away every one. Like a good catalogue." }
---
Mrs Vance's `fines.py` is right. Write the tests that prove it in `test_fines.py`: functions whose names start with `test_`, each checking one thing with `assert`. Press Run to run them.

`fine(days_late, childrens=False)` gives back the fine for one book, in pence:

1. Up to 2 days late, there's no fine.
2. After that, it's 10p for every day late, counting from the first.
3. Never more than 300p.
4. Children's books pay half, worked out after the cap.
5. A negative number of days raises `ValueError`. Catch it inside the test.

The checks run your tests on Mrs Vance's `fines.py`, where every one must pass. Then they run them on six copies, each with one rule broken. Every broken copy must fail at least one of your tests.
