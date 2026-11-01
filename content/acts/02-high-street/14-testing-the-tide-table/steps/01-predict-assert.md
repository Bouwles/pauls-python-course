---
id: predict-assert
type: predict
title: Checking what you believe
concept: assert
code: |
  def pounds(pence):
      return pence / 100


  assert pounds(1250) == 12.5
  print("1250 checked")
  assert pounds(5) == 0.5
  print("5 checked")
question: What happens?
verify: error
options:
  - text: It prints 1250 checked, then stops with an AssertionError
    correct: true
    error: AssertionError
    feedback: "Right. Five pence is 0.05 pounds, not 0.5, so the second `assert` stops the program. Here the check was wrong, not the code: tests can be wrong too. The first `assert` held, so it did nothing at all."
  - text: It prints both lines
    misconception: failed-assert-continues
    feedback: "A failed `assert` isn't a warning. It raises an AssertionError, and the program stops on that line."
  - text: It prints True, 1250 checked, False, 5 checked
    misconception: assert-prints-result
    feedback: "`assert` never prints anything. If the condition is true, nothing happens; if it's false, the program stops."
---
`assert` checks something you believe is true. If it is, nothing happens. If it isn't, the program stops with an `AssertionError`.

Here is the start of a check on the festival fund's sums. Read both `assert` lines carefully.
