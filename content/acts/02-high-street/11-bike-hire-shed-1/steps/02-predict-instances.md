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
    feedback: "Each `Account(...)` makes a separate object with attributes of its own. Changing `riya.balance` leaves `yahya` alone."
  - text: "700 700"
    misconception: attributes-shared-between-objects
    feedback: "The class is the pattern. Each object made from it keeps its own attributes: `riya` and `yahya` are two accounts."
  - text: "500 900"
    misconception: attributes-fixed-by-init
    feedback: "The lines in the class set the starting values. After that, `riya.balance = 700` changes `riya`'s balance like any other assignment."
---
Two accounts from one pattern. Line 9 changes one of them.
