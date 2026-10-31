"""Personal finance: what came in, what went out, and the budgets.

No files and no printing in here. storage.py and cli.py do that.
"""
# Riya's note, from the first page of her plan:
# Who's going to use this? Students with a part-time job and rent to pay.
# Test it on a made-up month first. Real money only goes in once it works. R.

from dataclasses import dataclass
from datetime import date

CATEGORIES = ("food", "fun", "home", "income", "shop", "travel")


class MoneyError(Exception):
    """A transaction or a budget that breaks one of the rules."""


@dataclass(frozen=True)
class Transaction:
    day: date
    pence: int
    category: str
    note: str = ""


class Ledger:
    """Every transaction, and a budget for each kind of spending."""

    def __init__(self, transactions: list[Transaction] | None = None,
                 budgets: dict[str, int] | None = None):
        self.transactions = list(transactions) if transactions else []
        self.budgets = dict(budgets) if budgets else {}

    def add(self, day: date, pence: int, category: str, note: str = "") -> Transaction:
        """Record money in or out, or raise MoneyError saying why not."""
        if pence == 0:
            raise MoneyError("An amount can't be 0.")
        if category not in CATEGORIES:
            raise MoneyError(f"There's no category called {category}.")
        if category == "income" and pence < 0:
            raise MoneyError("Income is money in, so it has to be more than 0.")
        if category != "income" and pence > 0:
            raise MoneyError(f"Spending on {category} is money out, so it has to be less than 0.")
        transaction = Transaction(day, pence, category, note)
        self.transactions.append(transaction)
        return transaction

    def remove(self, transaction: Transaction) -> None:
        """Take a transaction out, or raise MoneyError if it isn't there."""
        if transaction not in self.transactions:
            raise MoneyError("That transaction isn't in the ledger.")
        self.transactions.remove(transaction)

    def set_budget(self, category: str, pence: int) -> None:
        """A monthly budget for one kind of spending."""
        if category not in CATEGORIES or category == "income":
            raise MoneyError(f"There's no spending category called {category}.")
        if pence <= 0:
            raise MoneyError("A budget has to be more than 0.")
        self.budgets[category] = pence

    def balance(self) -> int:
        """Everything in, less everything out, in pence."""
        return sum(transaction.pence for transaction in self.transactions)

    def in_month(self, year: int, month: int) -> list[Transaction]:
        """That month's transactions, in date order."""
        found = [t for t in self.transactions if t.day.year == year and t.day.month == month]
        return sorted(found, key=lambda transaction: transaction.day)

    def spending(self, year: int, month: int) -> dict[str, int]:
        """How much went on each kind of spending that month, in pence, alphabetical."""
        spent: dict[str, int] = {}
        for transaction in self.in_month(year, month):
            if transaction.pence < 0:
                spent[transaction.category] = spent.get(transaction.category, 0) - transaction.pence
        return {category: spent[category] for category in sorted(spent)}

    def over_budget(self, year: int, month: int) -> list[str]:
        """The kinds of spending that went over their budget that month, alphabetical."""
        return [category for category, pence in self.spending(year, month).items()
                if category in self.budgets and pence > self.budgets[category]]
