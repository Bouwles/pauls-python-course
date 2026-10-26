---
id: predict-else-finally
type: predict
title: Else, and finally
concept: try-except
code: |
  for text in ["4.2", "deep"]:
      try:
          depth = float(text)
      except ValueError:
          print("bad")
      else:
          print("good")
      finally:
          print("checked")
question: What does this print?
options:
  - text: |-
      good
      checked
      bad
      checked
    correct: true
    feedback: "Right. `else` runs only when the `try` had no error. `finally` runs every time round, error or not."
  - text: |-
      good
      checked
      bad
    misconception: finally-only-on-success
    feedback: "`finally` runs whatever happened, error included. That's what it's for: things that must happen either way."
  - text: |-
      good
      bad
      checked
    misconception: finally-runs-at-end
    feedback: "`finally` belongs to the `try`, which is inside the loop. It runs once for each reading, not once at the end."
---
Two more words for a `try`. `else:` runs only if the `try` block had no error. `finally:` has the last word on the matter.

Two readings from the tide gauge: one good, one not.
