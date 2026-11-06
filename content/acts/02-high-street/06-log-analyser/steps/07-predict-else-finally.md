---
id: predict-else-finally
type: predict
title: Else, and finally
concept: try-except
code: |
  for text in ["41.5", "hot"]:
      try:
          temperature = float(text)
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
    feedback: "`else` runs only when the `try` had no error. `finally` runs every time round, error or not."
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
Two readings from the motors: one good, one not. Follow each pass through the four blocks.
