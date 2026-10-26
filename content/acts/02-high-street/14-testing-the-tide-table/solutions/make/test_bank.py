from bank import Account


def test_deposit():
    account = Account("Bea", 1042)
    account.deposit(2000)
    assert account.balance == 2000
    assert account.history == [2000]


def test_withdraw():
    account = Account("Bea", 1042)
    account.deposit(2000)
    assert account.withdraw(750) is True
    assert account.balance == 1250
    assert account.history == [2000, -750]


def test_withdraw_everything():
    account = Account("Gwen", 21)
    account.deposit(800)
    assert account.withdraw(800) is True
    assert account.balance == 0


def test_too_much():
    account = Account("Pip", 13)
    account.deposit(500)
    assert account.withdraw(501) is False
    assert account.balance == 500
    assert account.history == [500]


def test_str():
    account = Account("Bea Hollis", 1042)
    account.deposit(1250)
    assert str(account) == "Account 1042, Bea Hollis: £12.50"


def test_deposit_nothing():
    account = Account("Pip", 13)
    try:
        account.deposit(0)
    except ValueError:
        return
    assert False, "deposit(0) should raise a ValueError"

def test_transfer():
    bea = Account("Bea", 1042)
    gwen = Account("Gwen", 21)
    bea.deposit(2000)
    assert bea.transfer(gwen, 500) is True
    assert bea.balance == 1500
    assert gwen.balance == 500


def test_transfer_too_much():
    pip = Account("Pip", 13)
    mira = Account("Mira", 1)
    pip.deposit(300)
    assert pip.transfer(mira, 301) is False
    assert pip.balance == 300
    assert mira.balance == 0


def test_transfer_everything():
    bea = Account("Bea", 1042)
    gwen = Account("Gwen", 21)
    bea.deposit(700)
    assert bea.transfer(gwen, 700) is True
    assert bea.balance == 0
    assert gwen.balance == 700


def test_transfer_nothing():
    bea = Account("Bea", 1042)
    gwen = Account("Gwen", 21)
    bea.deposit(700)
    try:
        bea.transfer(gwen, 0)
    except ValueError:
        return
    assert False, "transfer of 0 should raise a ValueError"

def test_interest():
    account = Account("Old Tom", 7)
    account.deposit(1250)
    assert account.add_interest(2) == 25
    assert account.balance == 1275
    assert account.history == [1250, 25]


def test_interest_rounds_to_the_penny():
    account = Account("Old Tom", 7)
    account.deposit(1999)
    assert account.add_interest(2) == 40
    assert account.balance == 2039


def test_no_interest_on_nothing():
    account = Account("Pip", 13)
    assert account.add_interest(2) == 0
    assert account.balance == 0
    assert account.history == []


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
