---
id: learn-init
type: learn
title: Setting up each new one
concept: init
code: |
  class Account:
      def __init__(self, holder, number):
          self.holder = holder
          self.number = number
          self.balance = 0
          self.history = []


  savings = Account("Aaesha", 1042)
  print(savings.holder, savings.number)
  print(savings.balance, savings.history)
---
`__init__` (two underscores each side) is a function inside the class that Python runs by itself every time a new object is made. Its job is to give the object its starting attributes.

Its first parameter, `self`, is the new object. The others come from the call: `Account("Aaesha", 1042)` sets `holder` to `"Aaesha"` and `number` to 1042. You never pass `self`; Python does.

`self.holder = holder` sticks an attribute called `holder` on the new object. Set every attribute here, even the ones that start empty, like a balance of 0 and an empty history. The example prints `Aaesha 1042`, then `0 []`.

The usual slip is to expect an attribute nobody set to be `None`. Reading one is an AttributeError.
