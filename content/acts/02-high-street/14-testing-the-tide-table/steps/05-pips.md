---
id: pips
type: pips
title: Pip's Version
files: [bank.py, test_bank.py]
entry: test_bank.py
dialogue:
  - pip: "Agnes wanted tests for the accounts. I wrote four. They all pass."
  - pip: "I broke bank.py on purpose to check. They still all pass. That's good, isn't it."
dialogue_after:
  - pip: "So a test that can't fail isn't a test. It's decoration. Expensive decoration."
hints:
  nudge: "If `deposit` paid everything in twice, which of Pip's tests would notice?"
  plan:
    - Give every test an assert
    - Compare with an answer worked out by hand, not with the code itself
    - Check the balance and the history, not only what a method returns
    - Add tests for the edges, like taking out exactly everything
    - Expect the error, and fail if it doesn't come
  shape: |
    def test_deposit():
        account = Account("Bea", 1042)
        account.deposit(2000)
        assert account.balance == ___
        assert account.history == ___


    def test_withdraw_everything():
        account = Account("Gwen", 21)
        account.deposit(800)
        assert account.withdraw(800) is ___


    def test_deposit_nothing():
        account = Account("Pip", 13)
        try:
            account.deposit(0)
        except ___:
            return
        assert False, "deposit(0) should raise a ValueError"
---
The post office's `Account` is in `bank.py`; Pip's tests are in `test_bank.py`. Run it: every test passes.

Fix the tests, not `bank.py`. When you press Check, your tests run against the real `bank.py`, then against copies with a bug planted in each method. A good test passes on the real one and fails on the broken one.
