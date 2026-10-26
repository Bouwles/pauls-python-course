---
id: make-money
type: make
title: The rules
files: [money.py]
entry: money.py
on_pass: { sanjay: "No sweets, no spending that's secretly income, and November's food under budget. That's the biscuit tin retired." }
hints:
  nudge: "Which methods need a single month's transactions? Could `spending` lean on `in_month`, and `over_budget` on `spending`?"
  plan:
    - Write MoneyError, then Transaction as a frozen dataclass
    - In __init__, keep your own copies of the transactions and the budgets
    - In add, check the rules in order and raise MoneyError at the first one broken
    - remove and set_budget refuse what they can't do
    - Write in_month, then build spending on it, and over_budget on spending
  shape: |
    class Ledger:
        def __init__(self, transactions=None, budgets=None):
            self.transactions = list(transactions) if transactions else ___
            self.budgets = ___

        def add(self, day, pence, category, note=""):
            if pence == 0:
                raise MoneyError("An amount can't be 0.")
            if category not in ___:
                raise MoneyError(f"There's no category called {category}.")
            ...
            transaction = Transaction(day, pence, category, note)
            self.transactions.___(transaction)
            return transaction

        def in_month(self, year, month):
            found = [t for t in self.transactions if ___]
            return sorted(found, key=___)
---
The rules first. The requirements are at the top of `money.py`, exactly as the checks read them: names, arguments, and the message for every refusal.

Money is in whole pence, as at the post office: -450 is £4.50 spent. Only the command line will turn it into pounds, for Sanjay to read.

The visible checks add a transaction and work out a balance. The hidden ones try every rule both ways, including the ones people forget: November last year isn't this November, and two `Ledger`s must never share a list.

Try it as you go with a few lines under `if __name__ == "__main__":`. They won't run during the checks.
