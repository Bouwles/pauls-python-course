# Savings accounts for the class trip fund. Money is kept in whole pence.
# Aaesha's note, at the top of the file:
# "Before you change it, how will you know it still works? A."


class Account:
    """One savings account."""

    def __init__(self, holder, number):
        self.holder = holder
        self.number = number
        self.balance = 0
        self.history = []

    def deposit(self, pence):
        """Pay pence in. Raises ValueError unless it's more than 0."""
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

    def __str__(self):
        return f"Account {self.number}, {self.holder}: £{self.balance / 100:.2f}"

    def transfer(self, other, pence):
        """Move pence from this account into other, and return True.

        If this account hasn't enough, nothing moves and it returns False.
        An amount that isn't more than 0 raises ValueError.
        """
        raise NotImplementedError("Tests first. Then this.")
