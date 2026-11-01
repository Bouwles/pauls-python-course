"""Savings accounts for the class festival fund. Money is kept in whole pence."""


class Account:
    """One savings account."""

    # Give each new one its starting attributes: holder, number, balance, history
    def __init__(self, holder, number):
        self.holder = holder
        self.number = number
        self.balance = 0
        self.history = []

    # Methods that change the object: deposit(pence), withdraw(pence)
    def deposit(self, pence):
        """Pay pence in. Raises ValueError unless it's more than 0."""
        # Say no before you change anything
        if pence <= 0:
            raise ValueError("A deposit must be more than 0.")
        self.balance += pence
        self.history.append(pence)

    def withdraw(self, pence):
        """Take pence out and return True, or return False if there isn't enough."""
        if pence <= 0:
            raise ValueError("A withdrawal must be more than 0.")
        if pence > self.balance:
            return False
        self.balance -= pence
        self.history.append(-pence)
        return True

    # Methods that answer a question about it: __str__
    def __str__(self):
        return f"Account {self.number}, {self.holder}: £{self.balance / 100:.2f}"


if __name__ == "__main__":
    savings = Account("Aaesha", 1042)
    savings.deposit(2000)
    savings.withdraw(750)
    print(savings)
    print(savings.withdraw(5000))
    print(savings.history)
