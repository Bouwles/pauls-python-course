---
id: predict-assert
type: predict
title: Checking what you believe
concept: assert
code: |
  def to_minutes(time):
      hours, mins = time.split(":")
      return int(hours) * 60 + int(mins)


  assert to_minutes("06:42") == 402
  print("06:42 checked")
  assert to_minutes("00:05") == 50
  print("00:05 checked")
question: What happens?
verify: error
options:
  - text: It prints 06:42 checked, then stops with an AssertionError
    correct: true
    error: AssertionError
    feedback: "Right. `to_minutes(\"00:05\")` is 5, not 50, so the second `assert` stops the program. Here the check was wrong, not the code: tests can be wrong too. The first `assert` held, so it did nothing at all."
  - text: It prints both lines
    misconception: failed-assert-continues
    feedback: "A failed `assert` isn't a warning. It raises an AssertionError, and the program stops on that line."
  - text: It prints True, 06:42 checked, False, 00:05 checked
    misconception: assert-prints-result
    feedback: "`assert` never prints anything. If the condition is true, nothing happens; if it's false, the program stops."
---
`assert` checks something you believe is true. If it is, nothing happens. If it isn't, the program stops with an `AssertionError`.

Here is the start of a check on Penhallow's tide code. Read both `assert` lines carefully.
