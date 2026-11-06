---
id: predict-syntax
type: predict
title: Does line 1 run?
concept: syntax-error
code: |
  print("Practice 09:30")
  print("Race 16:00)
question: What appears when this runs?
verify: error
options:
  - text: "It prints Practice 09:30, then shows an error"
    misconception: syntax-error-runs-earlier-lines
    feedback: "With a SyntaxError, Python can't read the file, so it runs none of it. Line 1 never prints, even though it's fine."
  - text: "Only the error: nothing prints"
    correct: true
    error: SyntaxError
    feedback: "Right. Python reads the whole file first, finds a string on line 2 that never ends, and runs nothing at all."
---
Line 1 is fine. The string on line 2 has no quote at its end. Remember when Python reads the file.
