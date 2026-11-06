---
id: learn-tests
type: learn
title: A test is a function
concept: pytest
code: |
  def slices_each(slices, people):
      if people <= 0:
          raise ValueError("Nobody to share with.")
      return slices // people


  def test_even_share():
      assert slices_each(12, 4) == 3


  def test_nobody_to_share_with():
      try:
          slices_each(12, 0)
      except ValueError:
          return
      assert False, "slices_each should refuse 0 people"


  test_even_share()
  test_nobody_to_share_with()
  print("Both passed")
---
A **test** is a small function whose name starts with `test_`. It checks one thing with `assert`, against an answer you worked out yourself.

You met them in Python at Home. **pytest**, a tool you install, finds every `test_` function and runs it, so all your tests run with one command.

To test that an error comes, call the code inside `try`. `except` catches the error you expect and `return` ends the test there, a pass. If the error never comes, `assert False` fails it. The example runs both tests by hand and prints `Both passed`.

The usual slip is a test with no `assert`. It works things out and checks nothing, so it passes whatever the code does.
