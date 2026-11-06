---
id: learn-infinite
type: learn
title: A loop that never ends
concept: infinite-loops
code: |
  chimes = 3
  while chimes > 0:
      print("Bong")
      chimes = chimes - 1
  print("Quiet")
---
An **infinite loop** is a loop whose test never becomes `False`, so it goes round for ever and the program hangs. Everyone writes one sooner or later, so it's worth knowing the fix.

The example prints `Bong` three times, then `Quiet`. Line 4 is what stops it. Delete line 4 and run it: `chimes` stays at 3, `chimes > 0` stays `True`, and the bongs carry on until the editor gives up after 2000 lines. A loop that prints nothing just hangs, and you press **Stop**.

The usual slip is to expect the variable in the test to change by itself. It never does. A line inside the loop has to change it on every pass, like line 4 here.
