---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Mr Okonjo's sums, in a file of their own. Any program in his shop can borrow them."
code: |
  """Sizes for Mr Okonjo's shop. Import it; don't copy it."""
  import math

  CM_PER_INCH = 2.54


  def to_inches(cm):
      """Centimetres to inches."""
      return cm / CM_PER_INCH


  def cloth_needed(chest, leg):
      """Metres of cloth for a suit, rounded up to a whole metre."""
      return math.ceil((chest + 2 * leg) / 100)


  if __name__ == "__main__":
      # Quick checks, for when this file is run on its own.
      print(f"{to_inches(112):.1f}")
      print(cloth_needed(112, 84))
subgoals:
  - label: Say what the module is for
    lines: [1, 1]
  - label: Import what it needs, at the top
    lines: [2, 4]
  - label: Only definitions at the top level
    lines: [7, 14]
  - label: Quick checks under the main guard
    lines: [17, 20]
explain:
  prompt: "Another program does `import sizes`. Which lines of `sizes.py` run, and which don't?"
  answer: "Everything down to line 14 runs, but that only imports math and defines things. The checks under `if __name__ == \"__main__\":` don't run, because when the file is imported, `__name__` is `\"sizes\"`."
  concept: main-guard
---
This is a whole file, `sizes.py`, written to be imported. Another program in the shop uses it like this:

```python
import sizes

print(sizes.cloth_needed(96, 74))
```

A file's name without `.py` is its module name. When a file is imported, `__name__` holds that name instead of `"__main__"`, so the last block only runs when someone runs `sizes.py` itself.
