---
id: learn-assert
type: learn
title: Checking what you believe
concept: assert
code: |
  def pounds(pence):
      return pence / 100


  assert pounds(250) == 2.5
  print("250 checked")
  assert pounds(1999) == 19.99, "1999 pence should be £19.99"
  print("1999 checked")
---
`assert` checks something you believe is true. If it's true, nothing happens at all. If it's false, the program stops with an **AssertionError**.

It's how a program checks itself. Aaesha won't pay into the festival fund until something checks the accounts, every time anyone changes them.

`assert pounds(250) == 2.5, "message"` can carry a message after a comma, shown when it fails. The part after the comma is never compared with anything. The example prints `250 checked`, then `1999 checked`. Change `19.99` to `19.9` and run it to see one fail.

The usual slip is to work out the expected answer with the code you're checking. `assert pounds(5) == pounds(5)` can never fail, however wrong `pounds` is. Work it out by hand.
