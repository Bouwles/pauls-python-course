from bank import Account


def test_deposit():
    account = Account("Aaesha", 1042)
    account.deposit(2000)
    assert account.balance == 2000
    assert account.history == [2000]


def test_withdraw():
    account = Account("Aaesha", 1042)
    account.deposit(2000)
    assert account.withdraw(750) is True
    assert account.balance == 1250
    assert account.history == [2000, -750]


def test_withdraw_everything():
    account = Account("Caitlin", 21)
    account.deposit(800)
    assert account.withdraw(800) is True
    assert account.balance == 0


def test_too_much():
    account = Account("Yahya", 13)
    account.deposit(500)
    assert account.withdraw(501) is False
    assert account.balance == 500
    assert account.history == [500]


def test_str():
    account = Account("Aaesha", 1042)
    account.deposit(1250)
    assert str(account) == "Account 1042, Aaesha: £12.50"


def test_deposit_nothing():
    account = Account("Yahya", 13)
    try:
        account.deposit(0)
    except ValueError:
        return
    assert False, "deposit(0) should raise a ValueError"


# transfer: tests first.
#   Name each test for the case it checks
#   Money leaves one account and arrives in the other
#   Not enough: nothing moves, in either account
#   The boundary: exactly everything
#   A bad amount


# A stand-in for pytest: run every test_ function and say how it went.
# At home, delete these lines and type pytest instead.
if __name__ == "__main__":
    for name, test in list(globals().items()):
        if name.startswith("test_"):
            try:
                test()
                print("passed", name)
            except Exception as problem:
                print("FAILED", name, type(problem).__name__, problem)
