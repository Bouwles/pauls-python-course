---
id: learn-argv
type: learn
title: Words after the program's name
concept: sys-argv
code: |
  import sys

  sys.argv = ["hours.py", "radio", "3"]
  print(sys.argv[0])
  print(sys.argv[1:])
  print(int(sys.argv[2]) * 2)
---
In a terminal you can type words after a program's name: `python hours.py radio 3`. Python puts them in `sys.argv`, a list in the `sys` module, ready for the program to read.

That's how Paul's to-do tool will be told what to do, without asking any questions.

`sys.argv[0]` is the program's own name. The words typed after it start at `sys.argv[1]`, and every one is text, even `3`. Line 3 fills `sys.argv` by hand, as Python would for that command. In the Workshop, the Arguments box beside Run does it for you. The example prints `hours.py`, then `['radio', '3']`, then `6`.

The usual slip is to read `sys.argv[0]` as the first word typed. It's the program's name.
