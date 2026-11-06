---
id: predict-str
type: predict
title: How an account introduces itself
concept: dunder-methods
code: |
  class Account:
      def __init__(self, holder, balance):
          self.holder = holder
          self.balance = balance

      def __str__(self):
          return f"{self.holder}: £{self.balance / 100:.2f}"


  savings = Account("Neil", 1999)
  print(savings)
  print(f"Balance: {savings}")
question: What does this print?
options:
  - text: |-
      Neil: £19.99
      Balance: Neil: £19.99
    correct: true
    feedback: "`print` and f-strings both ask the object for its text, and `__str__` is how an object answers."
  - text: The account's type and its address, twice
    misconception: print-ignores-str
    feedback: "That's what you'd see without a `__str__`: something like `<__main__.Account object at 0x...>`. With one, `print` uses it."
  - text: |-
      Neil: £19.99
      Balance: Neil
    misconception: fstring-shows-first-attribute
    feedback: "An f-string doesn't pick an attribute. It turns the whole object into text the same way `print` does: with `__str__`."
---
Neil was the first to open a festival account. He paid in before Caitlin had finished explaining.
