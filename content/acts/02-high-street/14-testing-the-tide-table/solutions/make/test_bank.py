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

def test_transfer():
    aaesha = Account("Aaesha", 1042)
    caitlin = Account("Caitlin", 21)
    aaesha.deposit(2000)
    assert aaesha.transfer(caitlin, 500) is True
    assert aaesha.balance == 1500
    assert caitlin.balance == 500


def test_transfer_too_much():
    yahya = Account("Yahya", 13)
    riya = Account("Riya", 1)
    yahya.deposit(300)
    assert yahya.transfer(riya, 301) is False
    assert yahya.balance == 300
    assert riya.balance == 0


def test_transfer_everything():
    aaesha = Account("Aaesha", 1042)
    caitlin = Account("Caitlin", 21)
    aaesha.deposit(700)
    assert aaesha.transfer(caitlin, 700) is True
    assert aaesha.balance == 0
    assert caitlin.balance == 700


def test_transfer_nothing():
    aaesha = Account("Aaesha", 1042)
    caitlin = Account("Caitlin", 21)
    aaesha.deposit(700)
    try:
        aaesha.transfer(caitlin, 0)
    except ValueError:
        return
    assert False, "transfer of 0 should raise a ValueError"

def test_interest():
    account = Account("Paul", 7)
    account.deposit(1250)
    assert account.add_interest(2) == 25
    assert account.balance == 1275
    assert account.history == [1250, 25]


def test_interest_rounds_to_the_penny():
    account = Account("Paul", 7)
    account.deposit(1999)
    assert account.add_interest(2) == 40
    assert account.balance == 2039


def test_no_interest_on_nothing():
    account = Account("Yahya", 13)
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
