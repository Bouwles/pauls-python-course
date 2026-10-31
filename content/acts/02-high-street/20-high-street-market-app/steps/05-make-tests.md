---
id: make-tests
type: make
title: Your own tests
files: [money.py, storage.py, cli.py, test_money.py]
entry: test_money.py
starter_from: make-cli
dialogue:
  - aaesha: "Anyone can say it works. Tests say what would happen if it didn't."
on_pass: { aaesha: "Eight broken ledgers, eight caught. Riya can stop worrying." }
hints:
  nudge: "For each rule in the requirements, what would someone have to break for a test of yours to fail?"
  plan:
    - Make a fresh Ledger() in every test
    - Write one test for each rule, the refusals and the things that should still work
    - "Use assert refused(lambda: ...) for the refusals"
    - "Test the edges: exactly the budget, last year's November"
    - Run the file and fix whatever fails
  shape: |
    def test_nothing_is_refused():
        ledger = Ledger()
        assert refused(lambda: ledger.add(NOV_3, ___, "food"))


    def test_exactly_the_budget_is_not_over():
        ledger = Ledger()
        ledger.set_budget("food", 450)
        ledger.add(NOV_3, ___, "food")
        assert ledger.over_budget(2026, 11) == ___
---
Last file. Write tests for the rules in `test_money.py`: plain functions whose names start with `test_`, each making a fresh `Ledger` and checking one thing with `assert`. Run the file to run them all.

`refused`, at the top of the file, checks that something raises `MoneyError`.

The checks run your tests three ways: on your `money.py`, on Paul's, and on eight copies of Paul's that each break one rule. Your tests should pass on the first two and fail on every one of the eight.
