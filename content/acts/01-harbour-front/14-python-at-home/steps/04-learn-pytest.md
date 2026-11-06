---
id: learn-pytest
type: learn
title: Tests that check for you
code: |
  def greeting(name):
      return f"Morning, {name}."


  def test_greeting():
      assert greeting("Riya") == "Morning, Riya."


  test_greeting()
  print("Passed.")
---
A **test** is a small function that calls your code and checks the answer. `assert` says what must be true. If it isn't, the program stops with an AssertionError.

Tests check your work the same way every time, so you don't have to. The checks in the Workshop are tests like these.

**pytest** is a package that finds every function whose name starts with `test_`, runs them all, and reports which passed. There's no pytest here, so the example calls its test by hand and prints `Passed.` Change `Morning` to `Hello` on line 2 and run it: the `assert` fails.

The usual slip is changing a test to fit a wrong answer. When a test fails, fix the code, not the test.
