---
id: test-first
type: modify
title: Tests first
files: [bank.py, test_bank.py]
entry: test_bank.py
dialogue:
  - aaesha: "Requirement four. Money moves between accounts. None appears on the way, and none goes missing."
on_pass: { aaesha: "Money moved, money refused, exactly everything, and nothing at all. That's the list I'd have written." }
hints:
  nudge: "After Aaesha pays Caitlin £5, what should each balance be? And what if Aaesha only has £3?"
  plan:
    - Name each test for the case it checks
    - Money leaves one account and arrives in the other
    - "Not enough: nothing moves, in either account"
    - "The boundary: exactly everything"
    - A bad amount
  shape: |
    def test_transfer():
        aaesha = Account("Aaesha", 1042)
        caitlin = Account("Caitlin", 21)
        aaesha.deposit(2000)
        assert aaesha.transfer(caitlin, 500) is True
        assert aaesha.balance == ___
        assert caitlin.balance == ___


    def test_transfer_too_much():
        yahya = Account("Yahya", 13)
        riya = Account("Riya", 1)
        yahya.deposit(300)
        assert yahya.transfer(riya, 301) is ___
        assert ___
---
`transfer(other, pence)` should move money from one account into another and return `True`. If the account hasn't enough, nothing moves and it returns `False`. An amount that isn't more than 0 raises a `ValueError`, as a deposit does.

It doesn't exist yet: `bank.py` has its docstring and a line that raises an error. Write its tests first, in `test_bank.py`. Run them, and they fail. That's the point: a test you've seen fail is a test you know can fail.

When you press Check, your tests run against a correct `transfer` Paul keeps in a drawer, then against broken ones.
