---
id: predict-def
type: predict
title: A new word
concept: functions
code: |
  def ring_bell():
      print("Ding")

  print("End of class")
  ring_bell()
  ring_bell()
question: What does this print?
options:
  - text: |-
      End of class
      Ding
      Ding
    correct: true
    feedback: "The `def` only teaches Python what `ring_bell` means. The bell rings when it's called, once per call."
  - text: |-
      Ding
      End of class
      Ding
      Ding
    misconception: def-runs-body
    feedback: "The lines under `def` don't run when Python reads them. They wait until the function is called."
  - text: End of class
    misconception: call-needs-print
    feedback: "`ring_bell()` on its own line runs the function, and the function does its own printing. No `print` needed around it."
---
The bell for the end of class, as a function.
