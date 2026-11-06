---
id: learn-methods
type: learn
title: What an account can do
concept: methods
code: |
  class Account:
      def __init__(self, holder):
          self.holder = holder
          self.balance = 0

      def deposit(self, pence):
          self.balance = self.balance + pence

      def can_afford(self, pence):
          return pence <= self.balance


  riya = Account("Riya")
  riya.deposit(500)
  print(riya.balance, riya.can_afford(800))
---
A **method** is a function inside a class. You call it on an object, with a dot: `riya.deposit(500)`.

Python passes the object before the dot as the first parameter, `self`. So inside `deposit`, `self` is `riya`, and `self.balance` is her balance. One method serves every account.

Methods that change the object set attributes on `self`. Methods that answer a question `return` the answer. The example prints `500 False`.

Every method needs `self` first in its `def` line, even though the call leaves it out. Without it, Python's count of arguments comes out one too many.

The usual slip is to leave `self.` off inside a method. `balance = ...` makes a local variable that vanishes when the method ends.
