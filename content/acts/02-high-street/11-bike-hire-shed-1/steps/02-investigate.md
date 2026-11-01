---
id: investigate
type: investigate
title: Methods and self
concept: methods
code: |
  class Account:
      def __init__(self, holder, balance):
          self.holder = holder
          self.balance = balance

      def deposit(self, pence):
          self.balance = self.balance + pence

      def can_afford(self, pence):
          return pence <= self.balance


  riya = Account("Riya", 500)
  riya.deposit(250)
  print(riya.balance)
  print(riya.can_afford(1000))
tasks:
  - id: self-is-bea
    prompt: "`riya.deposit(250)` passes one argument, but `deposit` has two parameters. Add `print(self)` inside `deposit`, and `print(riya)` at the very bottom. Do they show the same object? Answer yes or no."
    kind: answer
    accept: ["yes", "y", "yes, the same", "same"]
    feedback: "Yes: the same address both times. `riya.deposit(250)` runs `deposit` with `self` set to `riya`, the object before the dot."
    wrong: "Compare the numbers after `at` in the two lines."
  - id: second-account
    prompt: "Take the two extra prints out. Add a second account, `yahya = Account(\"Yahya\", 900)`, pay in 100, then print `yahya.balance` and `yahya.can_afford(1000)`."
    kind: run
    tests: |
      TESTS = [
          output("Yahya's balance", expect=r"^1000$", match="regex",
                 hint="Call deposit on yahya, the object, not on Account: yahya.deposit(100)."),
          output("Yahya can afford it now", expect=r"^True$", match="regex"),
      ]
    solution: |
      class Account:
          def __init__(self, holder, balance):
              self.holder = holder
              self.balance = balance

          def deposit(self, pence):
              self.balance = self.balance + pence

          def can_afford(self, pence):
              return pence <= self.balance


      riya = Account("Riya", 500)
      riya.deposit(250)
      print(riya.balance)
      print(riya.can_afford(1000))
      yahya = Account("Yahya", 900)
      yahya.deposit(100)
      print(yahya.balance)
      print(yahya.can_afford(1000))
  - id: no-self
    prompt: "In `deposit`, change `self.balance = self.balance + pence` to `balance = self.balance + pence` and run it. What does `print(riya.balance)` show now?"
    kind: answer
    accept: ["500"]
    feedback: "500. Without `self.`, the new total goes into a local variable that vanishes when the method ends. The account never heard about the 250."
    wrong: "It's the first number printed."
---
A function inside a class is a **method**. Its first parameter, `self`, is the object the method was called on. Methods use `self.` to read and change that object's attributes.

Caitlin's accounts count in pence, so 500 is five pounds. Work through the questions, and reset the code whenever you like.
