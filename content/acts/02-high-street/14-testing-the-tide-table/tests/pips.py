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


BANK = '# Savings accounts for the class trip fund. Money is kept in whole pence.\n# Aaesha\'s note, at the top of the file:\n# "Before you change it, how will you know it still works? A."\n\n\nclass Account:\n    """One savings account."""\n\n    def __init__(self, holder, number):\n        self.holder = holder\n        self.number = number\n        self.balance = 0\n        self.history = []\n\n    def deposit(self, pence):\n        """Pay pence in. Raises ValueError unless it\'s more than 0."""\n        if pence <= 0:\n            raise ValueError("A deposit must be more than 0.")\n        self.balance += pence\n        self.history.append(pence)\n\n    def withdraw(self, pence):\n        """Take pence out and return True, or return False if there isn\'t enough."""\n        if pence <= 0:\n            raise ValueError("A withdrawal must be more than 0.")\n        if pence > self.balance:\n            return False\n        self.balance -= pence\n        self.history.append(-pence)\n        return True\n\n    def __str__(self):\n        return f"Account {self.number}, {self.holder}: £{self.balance / 100:.2f}"\n'

DEPOSIT_GUARD = "        if pence <= 0:\n            raise ValueError(\"A deposit"


TESTS = [
    custom("Every test passes on the real bank.py", passes_on(BANK, "the real bank.py"), visible=True),
    custom("Your tests notice a deposit that pays in twice",
           catches(BANK, "deposit adds every amount twice", "        self.balance += pence\n", "        self.balance += pence * 2\n"), visible=True,
           hint="A line that only compares, like account.balance == 2000, checks nothing. It needs assert in front."),
    custom("Your tests notice a withdraw that forgets the history",
           catches(BANK, "withdraw leaves the history alone", "        self.history.append(-pence)\n", ""),
           hint="Check the whole history after a withdrawal: [2000, -750]."),
    custom("Your tests notice a withdraw that takes the money but says False",
           catches(BANK, "withdraw takes the money and returns False", "        self.history.append(-pence)\n        return True", "        self.history.append(-pence)\n        return False"),
           hint="assert account.withdraw(750) passes for any answer that isn't empty or False. Check the balance afterwards too."),
    custom("Your tests notice a withdraw that won't empty an account",
           catches(BANK, "taking out exactly the balance is refused", "        if pence > self.balance:", "        if pence >= self.balance:"),
           hint="Test the edge: an account with 800 in it can take out exactly 800."),
    custom("Your tests notice an account that shows pence as pounds",
           catches(BANK, "str() shows 1250 pence as £1250.00", "{self.balance / 100:.2f}", "{self.balance:.2f}"),
           hint="Compare str(account) with the line you'd expect, worked out by hand, not with str(account)."),
    custom("Your tests notice a deposit of nothing being allowed",
           catches(BANK, "deposit(0) is allowed", DEPOSIT_GUARD, "        if pence < 0:\n            raise ValueError(\"A deposit"),
           hint="A test can expect an error: try deposit(0) inside try, return from except ValueError, and assert False after it."),
]
