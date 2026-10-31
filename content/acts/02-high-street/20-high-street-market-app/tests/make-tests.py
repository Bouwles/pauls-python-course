# Paul's money.py, the one the requirements describe. Your tests should pass on it.
REFERENCE = '"""Personal finance: what came in, what went out, and the budgets.\n\nNo files and no printing in here. storage.py and cli.py do that.\n"""\n# Riya\'s note, from the first page of her plan:\n# Who\'s going to use this? Students with a part-time job and rent to pay.\n# Test it on a made-up month first. Real money only goes in once it works. R.\n\nfrom dataclasses import dataclass\nfrom datetime import date\n\nCATEGORIES = ("food", "fun", "home", "income", "shop", "travel")\n\n\nclass MoneyError(Exception):\n    """A transaction or a budget that breaks one of the rules."""\n\n\n@dataclass(frozen=True)\nclass Transaction:\n    day: date\n    pence: int\n    category: str\n    note: str = ""\n\n\nclass Ledger:\n    """Every transaction, and a budget for each kind of spending."""\n\n    def __init__(self, transactions: list[Transaction] | None = None,\n                 budgets: dict[str, int] | None = None):\n        self.transactions = list(transactions) if transactions else []\n        self.budgets = dict(budgets) if budgets else {}\n\n    def add(self, day: date, pence: int, category: str, note: str = "") -> Transaction:\n        """Record money in or out, or raise MoneyError saying why not."""\n        if pence == 0:\n            raise MoneyError("An amount can\'t be 0.")\n        if category not in CATEGORIES:\n            raise MoneyError(f"There\'s no category called {category}.")\n        if category == "income" and pence < 0:\n            raise MoneyError("Income is money in, so it has to be more than 0.")\n        if category != "income" and pence > 0:\n            raise MoneyError(f"Spending on {category} is money out, so it has to be less than 0.")\n        transaction = Transaction(day, pence, category, note)\n        self.transactions.append(transaction)\n        return transaction\n\n    def remove(self, transaction: Transaction) -> None:\n        """Take a transaction out, or raise MoneyError if it isn\'t there."""\n        if transaction not in self.transactions:\n            raise MoneyError("That transaction isn\'t in the ledger.")\n        self.transactions.remove(transaction)\n\n    def set_budget(self, category: str, pence: int) -> None:\n        """A monthly budget for one kind of spending."""\n        if category not in CATEGORIES or category == "income":\n            raise MoneyError(f"There\'s no spending category called {category}.")\n        if pence <= 0:\n            raise MoneyError("A budget has to be more than 0.")\n        self.budgets[category] = pence\n\n    def balance(self) -> int:\n        """Everything in, less everything out, in pence."""\n        return sum(transaction.pence for transaction in self.transactions)\n\n    def in_month(self, year: int, month: int) -> list[Transaction]:\n        """That month\'s transactions, in date order."""\n        found = [t for t in self.transactions if t.day.year == year and t.day.month == month]\n        return sorted(found, key=lambda transaction: transaction.day)\n\n    def spending(self, year: int, month: int) -> dict[str, int]:\n        """How much went on each kind of spending that month, in pence, alphabetical."""\n        spent: dict[str, int] = {}\n        for transaction in self.in_month(year, month):\n            if transaction.pence < 0:\n                spent[transaction.category] = spent.get(transaction.category, 0) - transaction.pence\n        return {category: spent[category] for category in sorted(spent)}\n\n    def over_budget(self, year: int, month: int) -> list[str]:\n        """The kinds of spending that went over their budget that month, alphabetical."""\n        return [category for category, pence in self.spending(year, month).items()\n                if category in self.budgets and pence > self.budgets[category]]\n'

# Eight copies of it, each with one rule broken. Your tests should fail on every one.
MUTANTS = {'zero': ('        if pence == 0:\n            raise MoneyError("An amount can\'t be 0.")\n', ''), 'category': ('        if category not in CATEGORIES:\n            raise MoneyError(f"There\'s no category called {category}.")\n', ''), 'income': ('        if category == "income" and pence < 0:', '        if False:'), 'spending': ('        if category != "income" and pence > 0:', '        if False:'), 'year': ('t.day.year == year and t.day.month == month', 't.day.month == month'), 'over': ('and pence > self.budgets[category]', 'and pence >= self.budgets[category]'), 'copy': ('self.transactions = list(transactions) if transactions else []', 'self.transactions = transactions if transactions is not None else []'), 'income-spent': ('            if transaction.pence < 0:\n                spent[', '            if True:\n                spent[')}


def run_tests(ctx, money_source=None):
    """Run every test_ function in test_money.py. Gives back (names, failures)."""
    files = None if money_source is None else {"money.py": money_source}
    module = ctx.module(files=files)
    tests = sorted((name, test) for name, test in vars(module).items()
                   if name.startswith("test_") and callable(test))
    failures = []
    for name, test in tests:
        try:
            test()
        except Exception as error:
            failures.append(f"{name}: {type(error).__name__} {error}".strip())
    return [name for name, _ in tests], failures


def mutant(key):
    old, new = MUTANTS[key]
    return REFERENCE.replace(old, new)


def enough_tests(ctx):
    names, _ = run_tests(ctx)
    if len(names) < 8:
        raise CheckFailed("Write at least eight test functions, each named test_ something.", expected="8 or more", actual=f"{len(names)}: {', '.join(names) or 'none'}")


def pass_on_yours(ctx):
    names, failures = run_tests(ctx)
    if failures:
        raise CheckFailed("Your tests should all pass on your own money.py. Either the test or the ledger is wrong.", expected="no failures", actual="; ".join(failures))


def pass_on_reference(ctx):
    names, failures = run_tests(ctx, REFERENCE)
    if failures:
        raise CheckFailed("These tests fail on a ledger that follows the requirements exactly.", expected="no failures", actual="; ".join(failures))


def catches(key, message):
    def check(ctx):
        names, failures = run_tests(ctx, mutant(key))
        if not failures:
            raise CheckFailed(message)
    return check


TESTS = [
    custom("At least eight tests", enough_tests, visible=True),
    custom("Your tests pass on your ledger", pass_on_yours, visible=True),
    custom("Your tests agree with the requirements", pass_on_reference,
           hint="Test through add, remove, set_budget, balance, in_month, spending and over_budget, and expect exactly what the requirements say."),
    custom("Your tests catch a transaction of nothing", catches("zero", "None of your tests fails when an amount of 0 goes in."),
           hint="assert refused(lambda: ledger.add(day, 0, \"food\"))."),
    custom("Your tests catch a category that doesn't exist", catches("category", "None of your tests fails when someone spends on sweets."),
           hint="Assert that adding spending on a category that isn't one of the six is refused."),
    custom("Your tests catch income that's money out", catches("income", "None of your tests fails when income of less than 0 goes in."),
           hint="Income has to be more than 0. Assert that -145000 of income is refused."),
    custom("Your tests catch spending that's money in", catches("spending", "None of your tests fails when spending of more than 0 goes in."),
           hint="Spending has to be less than 0. Assert that 450 of food is refused."),
    custom("Your tests catch a month from the wrong year", catches("year", "None of your tests fails when in_month counts November last year as this November."),
           hint="Add something in November 2025 as well, and check in_month(2026, 11) leaves it out."),
    custom("Your tests catch exactly the budget counted as over", catches("over", "None of your tests fails when spending exactly the budget counts as over it."),
           hint="Set a budget, spend exactly that, and assert over_budget is empty. The edge is where the bug lives."),
    custom("Your tests catch a ledger that changes your list", catches("copy", "None of your tests fails when the ledger adds to the list it was given."),
           hint="Give Ledger a list, add something, and assert your list is the length it was."),
    custom("Your tests catch income counted as spending", catches("income-spent", "None of your tests fails when spending counts income as well."),
           hint="Put some income in the month, and check spending still gives only the money out."),
]
