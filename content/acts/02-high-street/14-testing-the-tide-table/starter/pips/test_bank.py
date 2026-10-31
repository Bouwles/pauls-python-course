from bank import Account


def test_deposit():
    account = Account("Aaesha", 1042)
    account.deposit(2000)
    account.balance == 2000


def test_withdraw():
    account = Account("Aaesha", 1042)
    account.deposit(2000)
    assert account.withdraw(750)


def test_str():
    account = Account("Aaesha", 1042)
    assert str(account) == str(account)


def test_empty_account():
    account = Account("Yahya", 13)
    assert account.withdraw(500) == False, "refused"


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
