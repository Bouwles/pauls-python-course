---
id: predict-init
type: predict
title: Never set
concept: attributes
code: |
  class Account:
      def __init__(self, holder):
          self.holder = holder
          self.balance = 0


  savings = Account("Neil")
  print(savings.holder, savings.balance)
  print(savings.history)
question: What happens when this runs?
verify: error
options:
  - text: |-
      Neil 0
      None
    misconception: missing-attribute-is-none
    feedback: "An attribute nobody set isn't `None`. It isn't there at all, and reading it stops the program."
  - text: |-
      Neil 0
      then an AttributeError
    correct: true
    error: AttributeError
    feedback: "`__init__` never set `history`, so the account has no such attribute. That's why every attribute belongs in `__init__`, even an empty list."
  - text: Nothing, because __init__ was never called
    misconception: init-called-by-hand
    feedback: "Nobody calls `__init__` by hand. `Account(\"Neil\")` runs it by itself, so `holder` and `balance` are set."
---
Neil's festival account, from a class that forgot something.
