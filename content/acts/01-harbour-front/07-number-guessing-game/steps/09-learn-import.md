---
id: learn-import
type: learn
title: Borrowing tools
concept: imports
code: |
  import math

  print(math.sqrt(49))
---
A **module** is a file of extra tools that comes with Python. `import` loads one, so your program can use it.

Python starts small, and keeps tools like square roots and random numbers in modules until you ask for them. `math` has the maths. `random` has the random numbers Caitlin's game needs.

Put `import math` at the top of the file. Then write the module's name, a dot and the tool: `math.sqrt(49)` means the square root tool inside `math`. The example prints `7.0`.

The usual slip is to leave out the import. Then Python has never heard of `math`, and the line that uses it stops with a NameError. Delete line 1 and run it to see.
