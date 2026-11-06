---
id: learn-class
type: learn
title: A pattern for things
concept: classes
code: |
  class Account:
      def __init__(self, holder, balance):
          self.holder = holder
          self.balance = balance


  riya = Account("Riya", 500)
  yahya = Account("Yahya", 900)
  print(riya.holder, riya.balance)
  print(yahya.holder, yahya.balance)
---
A **class** is a pattern for making things. `class Account:` describes what every account keeps. Calling the class, `Account("Riya", 500)`, makes one new **object** from that pattern.

Caitlin's festival fund needs an account for everyone going. One pattern does for all of them, however many there are.

Each object keeps its own values, called **attributes**, and you read them with a dot: `riya.balance`. The lines inside the class that set them are the next step. The example makes two accounts and prints `Riya 500`, then `Yahya 900`.

Name a class for one thing, in capitalised words: `Account`, not `accounts`.

The usual slip is to think objects from one class share their attributes. Each account has its own.
