---
id: learn-if
type: learn
title: Choosing what to run
concept: if-elif-else
code: |
  speed = 340
  if speed > 300:
      print("Faster than 300")
  else:
      print("300 or slower")
  print("Lap done")
---
`if` lets a program choose. It asks a question, and runs some lines only when the answer is `True`:

```python
if speed > 300:
    print("Faster than 300")
```

The `if` line ends with a colon. The lines that belong to it, called its **block**, are indented four spaces (the Tab key puts them in). The block runs only when the test is `True`. `else:` adds a block for when it's `False`.

The first line that isn't indented is outside the `if`, so it runs either way. On the right, `Lap done` always prints.

The usual mistake is giving `else` a test of its own, like `else speed <= 300:`. `else` never has one. It takes whatever the `if` didn't.
