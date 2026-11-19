---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin.proud: "I've done the festival accounts properly with a class and everything, and it took ten minutes start to finish."
  - caitlin.confused: "It says deposit takes one argument but I gave it two, when I definitely gave it one. Can you look?"
dialogue_after:
  - caitlin.surprised: "Oh, self counts even when you don't write it in the call."
hints:
  nudge: "Inside `deposit`, which object is `self`, and how does `deposit` get it?"
  plan:
    - Read the traceback and count the arguments Python passes
    - Give deposit its self
    - Run again and check the balance
    - Keep the new balance on the object, not in a local variable
  shape: |
    def deposit(___, pence):
        self.balance = self.balance + pence

    def withdraw(self, pence):
        ___ = self.balance - pence
---
Run Caitlin's program. Aaesha pays in £20 and takes out £7.50, so it should print `Aaesha 1250`: her balance, in pence.

There are two bugs, and the second only shows itself once the first is fixed. Read the traceback from the bottom.
