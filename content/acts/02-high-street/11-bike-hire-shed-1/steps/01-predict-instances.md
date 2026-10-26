---
id: predict-instances
type: predict
title: Two accounts from one pattern
concept: classes
code: |
  class Account:
      def __init__(self, holder, balance):
          self.holder = holder
          self.balance = balance


  bea = Account("Bea", 500)
  gwen = Account("Gwen", 900)
  bea.balance = 700
  print(bea.balance, gwen.balance)
question: What does this print?
options:
  - text: "700 900"
    correct: true
    feedback: "Right. Each `Account(...)` makes a separate object with attributes of its own. Changing `bea.balance` leaves `gwen` alone."
  - text: "700 700"
    misconception: attributes-shared-between-objects
    feedback: "The class is the pattern. Each object made from it keeps its own attributes: `bea` and `gwen` are two accounts."
  - text: "500 900"
    misconception: attributes-fixed-by-init
    feedback: "`__init__` sets the starting values. After that, `bea.balance = 700` changes `bea`'s balance like any other assignment."
  - text: An error, because Account("Bea", 500) passes two arguments and __init__ has three
    misconception: self-passed-by-caller
    error: TypeError
    feedback: "Python passes `self` for you: it's the new account. You pass only `holder` and `balance`."
---
A **class** is a pattern for making objects. `Account("Bea", 500)` makes one account, then runs `__init__` on it with `self` as the new account. Each `self.something = ...` line sticks an **attribute** on that account: a value it keeps.

Mira's savings ledger has two hundred accounts in it, and one pattern would do for all of them. Read it, then commit to an answer.
