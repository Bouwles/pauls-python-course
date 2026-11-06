---
id: learn-scope
type: learn
title: What stays inside
concept: scope
code: |
  def add_tip(bill):
      tip = bill * 0.1
      return bill + tip

  total = add_tip(40.0)
  print(total)
---
A variable made inside a function belongs to that function. It exists while the function runs and is gone when it ends. Where a name can be used is called its **scope**.

That keeps functions apart. One function's working-out can't get mixed up with another's, even when they use the same names.

`tip` is made inside `add_tip`, so only `add_tip` can use it. The example prints `44.0`. Add `print(tip)` as the last line and run it: a NameError, because outside the function there's no `tip`.

The usual slip is to expect a value made inside a function to be there afterwards. To get a value out, `return` it, and keep it with `=` where you call it.
