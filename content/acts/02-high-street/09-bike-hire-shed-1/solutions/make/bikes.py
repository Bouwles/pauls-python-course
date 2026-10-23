"""Dev and Kat's bikes."""


class Bike:
    """One bike in the shed."""

    # Give each new one its starting attributes: number, kind, rate, rider, hours
    def __init__(self, number, kind, rate):
        self.number = number
        self.kind = kind
        self.rate = rate
        self.rider = None
        self.hours = 0

    # Methods that change the object: hire(rider), give_back(hours)
    def hire(self, rider):
        """Lend the bike to rider. False if it is already out."""
        if self.rider is not None:
            return False
        self.rider = rider
        return True

    def give_back(self, hours):
        """Take the bike back after hours of riding, and return the cost."""
        self.hours += hours
        self.rider = None
        return hours * self.rate

    # Methods that answer a question about it: describe()
    def describe(self):
        """One line: number, kind, rate, and who has it."""
        if self.rider is None:
            where = "free"
        else:
            where = f"out with {self.rider}"
        return f"Bike {self.number}, {self.kind}, £{self.rate:.2f} an hour, {where}"


if __name__ == "__main__":
    red = Bike(7, "town", 4)
    print(red.describe())
    red.hire("Bea")
    print(red.describe())
    cost = red.give_back(3)
    print(f"Bea owes £{cost:.2f}")
