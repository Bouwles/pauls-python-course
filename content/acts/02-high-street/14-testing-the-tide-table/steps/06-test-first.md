---
id: test-first
type: modify
title: Tests first
files: [bank.py, test_bank.py]
entry: test_bank.py
dialogue:
  - agnes: "Requirement four. Money moves between accounts. None appears on the way, and none goes missing."
on_pass: { agnes: "Money moved, money refused, exactly everything, and nothing at all. That's the list I'd have written." }
hints:
  nudge: "After Bea pays Gwen £5, what should each balance be? And what if Bea only has £3?"
  plan:
    - Name each test for the case it checks
    - Money leaves one account and arrives in the other
    - "Not enough: nothing moves, in either account"
    - "The boundary: exactly everything"
    - A bad amount
  shape: |
    def test_transfer():
        bea = Account("Bea", 1042)
        gwen = Account("Gwen", 21)
        bea.deposit(2000)
        assert bea.transfer(gwen, 500) is True
        assert bea.balance == ___
        assert gwen.balance == ___


    def test_transfer_too_much():
        pip = Account("Pip", 13)
        mira = Account("Mira", 1)
        pip.deposit(300)
        assert pip.transfer(mira, 301) is ___
        assert ___
---
`transfer(other, pence)` should move money from one account into another and return `True`. If the account hasn't enough, nothing moves and it returns `False`. An amount that isn't more than 0 raises a `ValueError`, as a deposit does.

It doesn't exist yet: `bank.py` has its docstring and a line that raises an error. Write its tests first, in `test_bank.py`. Run them, and they fail. That's the point: a test you've seen fail is a test you know can fail.

When you press Check, your tests run against a correct `transfer` Moss keeps on the back bench, then against broken ones.
