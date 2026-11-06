---
id: make
type: make
title: Make the account
files: [bank.py]
entry: bank.py
on_pass: { caitlin.laughing: "Minus five pounds, refused. Somebody asked whether that's personal. It isn't. It's validation." }
hints:
  nudge: "What does an account need to remember about itself, and which method changes each of those things?"
  plan:
    - Give each new one its starting attributes
    - Say no before you change anything
    - Then change the object
    - "Methods that answer a question about it: __str__"
  shape: |
    class Account:
        def __init__(self, holder, number):
            self.holder = holder
            self.number = number
            self.balance = ___
            self.history = ___

        def deposit(self, pence):
            if pence <= 0:
                raise ___("A deposit must be more than 0.")
            self.balance += pence
            self.history.append(___)

        def withdraw(self, pence):
            if pence <= 0:
                raise ValueError("A withdrawal must be more than 0.")
            if pence > self.balance:
                return ___
            ...

        def __str__(self):
            return f"Account {self.number}, {self.holder}: £{self.balance / 100:___}"
---
Write `Account` in `bank.py`, as in the brief. The bottom of the file already uses it the way Caitlin will, and the comments are the steps from Paul's spare-parts drawer.

```
Account 1042, Aaesha: £12.50
False
[2000, -750]
```

Money is in whole pence everywhere: 2000 is £20. Only `__str__` turns it into pounds, for people to read, with `:.2f`. A float can't hold most amounts of money exactly, and a fund that loses a penny a day loses Caitlin's trust by Friday.

The checks open accounts of their own, pay in and take out, and try to pay in nothing at all.
