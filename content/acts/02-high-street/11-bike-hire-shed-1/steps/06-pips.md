---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Mira's accounts, done properly. A class and everything."
  - pip: "It says deposit takes one argument but I gave it two. I gave it one. I counted."
dialogue_after:
  - pip: "Self counts. Even when you don't write it in the call. Especially then."
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
Run Pip's program. Bea pays in £20 and takes out £7.50, so it should print `Bea 1250`: her balance, in pence.

There are two bugs, and the second only shows itself once the first is fixed. Read the traceback from the bottom.
