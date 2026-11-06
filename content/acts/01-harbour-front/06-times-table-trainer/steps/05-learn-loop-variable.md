---
id: learn-loop-variable
type: learn
title: The number on each pass
concept: loop-variables
code: |
  for night in range(1, 4):
      print(f"Night {night}")
  print("Last night was", night)
---
The name after `for` is the **loop variable**. On each pass, Python puts the next number from the range into it, and the body can use it like any other variable: print it, or multiply with it. So `n * 3` in the body gives a different answer on every pass. Name it for what each number is, like `night` or `question`.

Changing the loop variable inside the body doesn't change how many passes there are. The next pass just puts in the next number.

After the loop, it keeps the last number it was given, so the last line on the right prints `Last night was 3`. The usual mistake is thinking it disappears when the loop ends.
