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


  riya = Account("Riya", 500)
  yahya = Account("Yahya", 900)
  riya.balance = 700
  print(riya.balance, yahya.balance)
question: What does this print?
options:
  - text: "700 900"
    correct: true
    feedback: "Right. Each `Account(...)` makes a separate object with attributes of its own. Changing `riya.balance` leaves `yahya` alone."
  - text: "700 700"
    misconception: attributes-shared-between-objects
    feedback: "The class is the pattern. Each object made from it keeps its own attributes: `riya` and `yahya` are two accounts."
  - text: "500 900"
    misconception: attributes-fixed-by-init
    feedback: "`__init__` sets the starting values. After that, `riya.balance = 700` changes `riya`'s balance like any other assignment."
  - text: An error, because Account("Riya", 500) passes two arguments and __init__ has three
    misconception: self-passed-by-caller
    error: TypeError
    feedback: "Python passes `self` for you: it's the new account. You pass only `holder` and `balance`."
---
A **class** is a pattern for making objects. `Account("Riya", 500)` makes one account, then runs `__init__` on it with `self` as the new account. Each `self.something = ...` line sticks an **attribute** on that account: a value it keeps.

Riya's trip fund has an account for everyone in the class, and one pattern would do for all of them. Read it, then lock in your answer.
