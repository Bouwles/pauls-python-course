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


  savings = Account("Old Tom", 1999)
  print(savings)
  print(f"Balance: {savings}")
question: What does this print?
options:
  - text: |-
      Old Tom: £19.99
      Balance: Old Tom: £19.99
    correct: true
    feedback: "Right. `print` and f-strings both ask the object for its text, and `__str__` is how an object answers."
  - text: The account's type and its address, twice
    misconception: print-ignores-str
    feedback: "That's what you'd see without a `__str__`: something like `<__main__.Account object at 0x...>`. With one, `print` uses it."
  - text: |-
      Old Tom: £19.99
      Balance: Old Tom
    misconception: fstring-shows-first-attribute
    feedback: "An f-string doesn't pick an attribute. It turns the whole object into text the same way `print` does: with `__str__`."
---
Methods with two underscores either side, like `__init__`, are ones Python calls for you. `__str__` is called whenever an object has to become text: in `print`, in an f-string, or in `str(account)`.

Old Tom has had a savings account since 1962. He has paid in, by Mira's count, very little.
