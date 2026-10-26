---
id: predict-def
type: predict
title: A new word
concept: functions
code: |
  def ring_bell():
      print("Ding")

  print("Last orders")
  ring_bell()
  ring_bell()
question: What does this print?
options:
  - text: |-
      Last orders
      Ding
      Ding
    correct: true
    feedback: "Right. The `def` only teaches Python what `ring_bell` means. The bell rings when it's called, once per call."
  - text: |-
      Ding
      Last orders
      Ding
      Ding
    misconception: def-runs-body
    feedback: "The lines under `def` don't run when Python reads them. They wait until the function is called."
  - text: Last orders
    misconception: call-needs-print
    feedback: "`ring_bell()` on its own line runs the function, and the function does its own printing. No `print` needed around it."
after: |
  Run it. Then add a third `ring_bell()` at the bottom.
---
`def` teaches Python a new command. The indented lines underneath are what the command does.

None of them run until the command is used, with brackets: `ring_bell()`. That's called **calling** the function.
