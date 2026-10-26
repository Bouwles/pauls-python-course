def account(ctx, *args):
    m = ctx.module()
    if not hasattr(m, "Account"):
        raise CheckFailed("There is no class called Account.")
    return m.Account(*args)


def attribute(a, name):
    if not hasattr(a, name):
        raise CheckFailed(f"The account has no {name} attribute. Set self.{name} in __init__.")
    return getattr(a, name)


def expect_equal(what, got, want):
    if got != want or (type(got) is bool) != (type(want) is bool):
        raise CheckFailed(what, expected=repr(want), actual=repr(got))


def raises_value_error(what, action):
    try:
        action()
    except ValueError:
        return
    except Exception as error:  # noqa: BLE001
        raise CheckFailed(f"{what} should raise a ValueError, not a {type(error).__name__}.", expected="ValueError", actual=type(error).__name__)
    raise CheckFailed(f"{what} should raise a ValueError.", expected="ValueError", actual="no error")


def new_account(ctx):
    a = account(ctx, "Bea Hollis", 1042)
    for name, want in [("holder", "Bea Hollis"), ("number", 1042), ("balance", 0), ("history", [])]:
        expect_equal(f"A new account's {name} should be {want!r}.", attribute(a, name), want)


def pay_in_take_out(ctx):
    a = account(ctx, "Bea Hollis", 1042)
    a.deposit(2000)
    result = a.withdraw(750)
    expect_equal("withdraw should return True when there's enough.", result, True)
    expect_equal("2000 in and 750 out leaves 1250.", a.balance, 1250)
    expect_equal("The history should have the deposit, then the withdrawal as a negative number.", a.history, [2000, -750])


def as_text(ctx):
    a = account(ctx, "Old Tom", 7)
    expect_equal("str() of a new account", str(a), "Account 7, Old Tom: £0.00")
    a.deposit(1999)
    expect_equal("str() after paying in 1999 pence", str(a), "Account 7, Old Tom: £19.99")
    a.deposit(10001)
    expect_equal("str() with pounds in the hundreds", str(a), "Account 7, Old Tom: £120.00")


def no_overdraft(ctx):
    a = account(ctx, "Pip", 13)
    a.deposit(500)
    result = a.withdraw(501)
    expect_equal("Taking out more than the balance should return False.", result, False)
    expect_equal("A refused withdrawal leaves the balance alone.", a.balance, 500)
    expect_equal("A refused withdrawal isn't in the history.", a.history, [500])


def everything_out(ctx):
    a = account(ctx, "Gwen", 21)
    a.deposit(800)
    expect_equal("Taking out exactly the balance is allowed.", a.withdraw(800), True)
    expect_equal("That leaves nothing.", a.balance, 0)
    expect_equal("And then there's nothing left to take.", a.withdraw(1), False)


def bad_deposits(ctx):
    a = account(ctx, "Pip", 13)
    raises_value_error("deposit(-500)", lambda: a.deposit(-500))
    raises_value_error("deposit(0)", lambda: a.deposit(0))
    expect_equal("A refused deposit changes nothing.", (a.balance, a.history), (0, []))


def bad_withdrawals(ctx):
    a = account(ctx, "Pip", 13)
    a.deposit(100)
    raises_value_error("withdraw(-100)", lambda: a.withdraw(-100))
    raises_value_error("withdraw(0)", lambda: a.withdraw(0))
    expect_equal("A refused withdrawal changes nothing.", (a.balance, a.history), (100, [100]))


def two_accounts(ctx):
    m = ctx.module()
    bea = m.Account("Bea", 1)
    gwen = m.Account("Gwen", 2)
    bea.deposit(300)
    expect_equal("Paying into Bea's account changed Gwen's balance.", gwen.balance, 0)
    expect_equal("Paying into Bea's account changed Gwen's history.", gwen.history, [])


TESTS = [
    custom("A new account", new_account, visible=True),
    custom("Bea pays in £20 and takes out £7.50", pay_in_take_out, visible=True),
    custom("str() of an account", as_text,
           hint="The balance is in pence: divide by 100 for pounds, and show two decimal places."),
    custom("No more out than went in", no_overdraft,
           hint="Check the balance before you change anything, and return False without touching it."),
    custom("Everything out, and then nothing", everything_out,
           hint="Exactly the balance is fine. One penny more isn't."),
    custom("Paying in nothing, or less than nothing", bad_deposits,
           hint="raise ValueError(...) before the balance is touched, for 0 and for anything below it."),
    custom("Taking out nothing, or less than nothing", bad_withdrawals,
           hint="A withdrawal of -100 would be a deposit in disguise. Raise a ValueError for 0 and below."),
    custom("Two accounts keep their own money", two_accounts,
           hint="If only this fails, make sure history is made in __init__, as self.history = [], so each account has its own list."),
]
