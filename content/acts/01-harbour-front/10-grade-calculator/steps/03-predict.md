---
id: predict-none
type: predict
title: Printed, or handed back
concept: none
code: |
  def remark(score):
      print(f"{score} points")

  result = remark(7)
  print(result)
question: What does this print?
options:
  - text: |-
      7 points
      7 points
    misconception: print-is-return
    feedback: "Printing shows text to a person. It doesn't hand anything back, so `result` doesn't get the text."
  - text: 7 points
    misconception: none-prints-nothing
    feedback: "`result` is `None`, and printing `None` shows the word `None`. It doesn't print a blank."
  - text: |-
      7 points
      None
    correct: true
    feedback: "Right. `remark` prints, then hands back nothing, because it has no `return`. Nothing, in Python, is `None`."
  - text: An error
    misconception: missing-return-is-error
    error: TypeError
    feedback: "A function without `return` is allowed. It quietly hands back `None`."
after: |
  Run it. Then change `print` inside the function to `return` and run it again.
---
Every function hands something back. If it never reaches a `return`, what it hands back is `None`: Python's word for nothing at all.
