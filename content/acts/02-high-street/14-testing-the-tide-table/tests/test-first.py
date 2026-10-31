import types as _types


def load_tests(ctx, bank_source=None):
    files = {} if bank_source is None else {"bank.py": bank_source}
    module = ctx.module(files=files)
    tests = [(name, value) for name, value in vars(module).items()
             if name.startswith("test_") and isinstance(value, _types.FunctionType)]
    if not tests:
        raise CheckFailed("There are no test_ functions in test_bank.py.")
    return tests


def failures(tests):
    failed = []
    for name, test in tests:
        try:
            test()
        except Exception as problem:
            failed.append((name, problem))
    return failed


def mutant(source, old, new):
    if old not in source:
        raise RuntimeError("content bug: the text to break is not in bank.py: " + old)
    return source.replace(old, new, 1)


def passes_on(source, who):
    def check(ctx):
        failed = failures(load_tests(ctx, source))
        if failed:
            name, problem = failed[0]
            if source is None:
                message = f"{name} fails on your bank.py. Either the test or the code is wrong: run test_bank.py and read the FAILED line."
            else:
                message = f"{name} fails on {who}, which is right. Check the answer it expects."
            raise CheckFailed(message, actual=f"{type(problem).__name__}: {problem}")
    return check


def catches(source, what, old, new):
    broken = mutant(source, old, new)

    def check(ctx):
        if not failures(load_tests(ctx, broken)):
            raise CheckFailed(f"Every test passed on a bank.py where {what}. A test that can't fail isn't checking anything.")
    return check


REFERENCE = '# Savings accounts for the class trip fund. Money is kept in whole pence.\n# Aaesha\'s note, at the top of the file:\n# "Before you change it, how will you know it still works? A."\n\n\nclass Account:\n    """One savings account."""\n\n    def __init__(self, holder, number):\n        self.holder = holder\n        self.number = number\n        self.balance = 0\n        self.history = []\n\n    def deposit(self, pence):\n        """Pay pence in. Raises ValueError unless it\'s more than 0."""\n        if pence <= 0:\n            raise ValueError("A deposit must be more than 0.")\n        self.balance += pence\n        self.history.append(pence)\n\n    def withdraw(self, pence):\n        """Take pence out and return True, or return False if there isn\'t enough."""\n        if pence <= 0:\n            raise ValueError("A withdrawal must be more than 0.")\n        if pence > self.balance:\n            return False\n        self.balance -= pence\n        self.history.append(-pence)\n        return True\n\n    def __str__(self):\n        return f"Account {self.number}, {self.holder}: £{self.balance / 100:.2f}"\n\n    def transfer(self, other, pence):\n        """Move pence from this account into other, and return True.\n\n        If this account hasn\'t enough, nothing moves and it returns False.\n        An amount that isn\'t more than 0 raises ValueError.\n        """\n        if not self.withdraw(pence):\n            return False\n        other.deposit(pence)\n        return True\n\n    def add_interest(self, percent):\n        """Pay in percent interest on the balance, to the nearest penny, and return it.\n\n        Interest that rounds to nothing isn\'t paid in, and isn\'t in the history.\n        """\n        interest = round(self.balance * percent / 100)\n        if interest > 0:\n            self.deposit(interest)\n        return interest\n'

GOOD = '        if not self.withdraw(pence):\n            return False\n        other.deposit(pence)\n        return True'


TESTS = [
    custom("Your tests pass on a transfer that is right", passes_on(REFERENCE, "Paul's transfer"), visible=True,
           hint="One of your tests expects something the requirement doesn't say. Check its answer against the brief."),
    custom("Your tests notice a transfer that pays nobody",
           catches(REFERENCE, "transfer takes the money out and never pays it in", GOOD, "        if not self.withdraw(pence):\n            return False\n        return True"), visible=True,
           hint="After a transfer, check both balances: the money leaves one account and arrives in the other."),
    custom("Your tests notice a transfer that pays itself",
           catches(REFERENCE, "transfer pays the money back into the same account", GOOD, "        if not self.withdraw(pence):\n            return False\n        self.deposit(pence)\n        return True"),
           hint="Check the other account's balance, not only the first one's."),
    custom("Your tests notice a transfer that makes money out of nothing",
           catches(REFERENCE, "transfer pays in even when there isn't enough", GOOD, "        self.withdraw(pence)\n        other.deposit(pence)\n        return True"),
           hint="Test a transfer of more than the balance: it returns False, and neither balance moves."),
    custom("Your tests notice a transfer that always says no",
           catches(REFERENCE, "transfer always returns False", GOOD, "        return False"),
           hint="Test a transfer that should work, and check it returns True."),
    custom("Your tests notice a transfer that won't move everything",
           catches(REFERENCE, "transfer refuses exactly the whole balance", GOOD, "        if pence >= self.balance or not self.withdraw(pence):\n            return False\n        other.deposit(pence)\n        return True"),
           hint="Test the boundary: an account with 700 in it can transfer exactly 700."),
    custom("Your tests notice a transfer that lets nothing through",
           catches(REFERENCE, "transfer(other, 0) quietly does nothing", GOOD, "        if pence == 0:\n            return True\n" + GOOD),
           hint="A transfer of 0 should raise a ValueError, the way a deposit of 0 does. A test can expect it with try and except."),
]
