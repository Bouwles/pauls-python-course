---
id: learn-return
type: learn
title: Handing the answer back
concept: return-values
code: |
  def share(bill, people):
      return bill / people

  each = share(12.0, 4)
  print(each)
  print(share(10.0, 2) + 1)
---
`return` hands a value back to the code that called the function. The call then stands for that value, so `each = share(12.0, 4)` puts `3.0` in `each`.

That's what lets functions build on each other: one works out a number, and other code uses it.

`return` also ends the function, there and then. Any lines after it don't run. The example prints `3.0`, then `6.0`, because `share(10.0, 2)` gives back `5.0` and the last line adds 1.

The usual slip is to `print` where you meant to `return`. Printing shows a value to a person. The code that called the function gets nothing back.
