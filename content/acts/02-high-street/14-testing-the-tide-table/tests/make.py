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


def their_account(ctx):
    module = _types.ModuleType("learner_bank")
    exec(compile(ctx.files.get("bank.py", ""), "bank.py", "exec"), module.__dict__)
    if not hasattr(module, "Account"):
        raise CheckFailed("There is no Account in bank.py.")
    return module.Account


def same(what, got, want):
    if got != want or type(got) is not type(want):
        raise CheckFailed(what, expected=repr(want), actual=repr(got))


def money_moves(ctx):
    Account = their_account(ctx)
    aaesha, caitlin = Account("Aaesha", 1), Account("Caitlin", 2)
    aaesha.deposit(2000)
    same("aaesha.transfer(caitlin, 500)", aaesha.transfer(caitlin, 500), True)
    same("Aaesha's balance afterwards", aaesha.balance, 1500)
    same("Caitlin's balance afterwards", caitlin.balance, 500)
    same("Aaesha's history", aaesha.history, [2000, -500])
    same("Caitlin's history", caitlin.history, [500])


def not_enough(ctx):
    Account = their_account(ctx)
    yahya, riya = Account("Yahya", 13), Account("Riya", 1)
    yahya.deposit(300)
    same("yahya.transfer(riya, 301)", yahya.transfer(riya, 301), False)
    same("Yahya's balance afterwards", yahya.balance, 300)
    same("Riya's balance afterwards", riya.balance, 0)
    same("yahya.transfer(riya, 300), exactly everything", yahya.transfer(riya, 300), True)
    same("Riya's balance after that", riya.balance, 300)


def bad_transfer(ctx):
    Account = their_account(ctx)
    aaesha, caitlin = Account("Aaesha", 1), Account("Caitlin", 2)
    aaesha.deposit(100)
    try:
        aaesha.transfer(caitlin, -50)
    except ValueError:
        same("A refused transfer leaves Caitlin alone", caitlin.balance, 0)
        return
    raise CheckFailed("transfer(caitlin, -50) should raise a ValueError.", expected="ValueError", actual="no error")


def interest(ctx):
    Account = their_account(ctx)
    paul = Account("Paul", 7)
    paul.deposit(1250)
    same("add_interest(2) on £12.50", paul.add_interest(2), 25)
    same("and the balance", paul.balance, 1275)
    same("and the history", paul.history, [1250, 25])
    odd = Account("Paul", 8)
    odd.deposit(1999)
    same("add_interest(2) on £19.99, to the nearest penny", odd.add_interest(2), 40)


def no_interest(ctx):
    Account = their_account(ctx)
    yahya = Account("Yahya", 13)
    same("add_interest(2) on nothing", yahya.add_interest(2), 0)
    same("leaves the history empty", yahya.history, [])
    small = Account("Yahya", 14)
    small.deposit(49)
    same("add_interest(1) on 49p rounds to nothing", small.add_interest(1), 0)
    same("and pays nothing in", small.history, [49])


TESTS = [
    custom("Every test in test_bank.py passes on your bank.py", passes_on(None, "your bank.py"), visible=True,
           hint="Run test_bank.py and read the FAILED lines: each names the test and what went wrong."),
    custom("Money moves from one account to another", money_moves, visible=True,
           hint="withdraw from this account; if that worked, deposit into the other."),
    custom("Not enough, then exactly enough", not_enough,
           hint="withdraw already says False when there isn't enough. Use what it tells you."),
    custom("A transfer of less than nothing", bad_transfer,
           hint="withdraw raises the ValueError for you, before anything moves."),
    custom("Interest, to the nearest penny", interest,
           hint="round(self.balance * percent / 100) is the interest in whole pence. Pay it in with deposit."),
    custom("No interest on nothing", no_interest,
           hint="Interest that rounds to 0 isn't paid in: deposit(0) would raise a ValueError, and quite right too."),
    custom("Your tests agree with the brief", passes_on(REFERENCE, "Paul's reference bank.py"),
           hint="One of your tests expects something the requirements don't say. Check its answer against the brief."),
    custom("Your tests notice interest that isn't rounded",
           catches(REFERENCE, "add_interest pays in fractions of a penny", "        interest = round(self.balance * percent / 100)", "        interest = self.balance * percent / 100"),
           hint="Test an amount that doesn't come out even: 2% of £19.99 is 39.98 pence, which pays 40."),
    custom("Your tests notice interest of 100 times too much",
           catches(REFERENCE, "add_interest forgets to divide by 100", "round(self.balance * percent / 100)", "round(self.balance * percent)"),
           hint="Work the interest out by hand and assert it: 2% of 1250 is 25."),
    custom("Your tests notice interest paid in on an empty account",
           catches(REFERENCE, "add_interest pays in even when it rounds to nothing", "        if interest > 0:\n            self.deposit(interest)", "        self.deposit(interest)"),
           hint="Test an account with nothing in it: add_interest gives 0 and the history stays empty."),
    custom("Your tests still notice a transfer that pays nobody",
           catches(REFERENCE, "transfer takes the money out and never pays it in", "        other.deposit(pence)\n", ""),
           hint="Keep the transfer tests from the last step."),
]
