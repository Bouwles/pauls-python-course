---
id: learn-str
type: learn
title: In plain words
concept: dunder-methods
code: |
  class Ticket:
      def __init__(self, number, prize):
          self.number = number
          self.prize = prize

      def __str__(self):
          return f"Ticket {self.number}: {self.prize}"


  winner = Ticket(14, "a board game")
  print(winner)
  print(f"Tonight's winner. {winner}")
---
Methods with two underscores each side, like `__init__`, are **dunder methods** (dunder for double underscore). Python calls them for you at the right moment.

`__str__` is the one Python calls whenever an object has to become text: in `print`, in an f-string, or in `str(winner)`. Caitlin wants `print(account)` to say `Account 1042, Aaesha: £12.50`.

It takes only `self`, and it must `return` the text, not print it. The example prints `Ticket 14: a board game`, then the same inside a longer line.

The usual slip is to leave it out and expect `print` to guess. Without `__str__`, an object prints as its type and an address in memory, like `<__main__.Ticket object at 0x10e4>`. Delete lines 6 and 7 and run it.
