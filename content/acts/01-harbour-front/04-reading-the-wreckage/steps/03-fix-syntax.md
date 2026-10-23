---
id: fix-syntax
type: fix
title: Piece one, the header
dialogue:
  - moss: "First piece. It won't even start."
  - moss: "That's Dennis on your desk. When you're stuck, explain the problem to him."
  - moss: "He won't answer. That's the point."
hints:
  nudge: "Count the brackets on the line the error points at. Does every ( have a )?"
  plan:
    - Read the last line of the error
    - Go to the line number it gives
    - Close the bracket that was never closed
  shape: |
    # Header for the tide table.
    print("SALTMARSH HARBOUR TIDES"___
    print("High and low water, north quay")
---
A **SyntaxError** means Python couldn't read the code at all, so not even the first line runs. The `^` points at where Python noticed the problem.

Fix it so the header prints:

```
SALTMARSH HARBOUR TIDES
High and low water, north quay
```
