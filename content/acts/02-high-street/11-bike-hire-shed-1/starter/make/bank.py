"""Savings accounts for the class festival fund. Money is kept in whole pence."""


class Account:
    """One savings account."""

    # Give each new one its starting attributes: holder, number, balance, history

    # deposit(pence), then withdraw(pence)
    #   Say no before you change anything
    #   Then change the object

    # Methods that answer a question about it: __str__


if __name__ == "__main__":
    savings = Account("Aaesha", 1042)
    savings.deposit(2000)
    savings.withdraw(750)
    print(savings)
    print(savings.withdraw(5000))
    print(savings.history)
