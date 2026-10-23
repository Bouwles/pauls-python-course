"""Dev and Kat's shed, part 2."""


class Bike:
    """One bike in the shed."""

    def __init__(self, number, rate):
        self.number = number
        self.rate = rate
        self.rider = None

    def hire(self, rider):
        """Lend the bike to rider. False if it is already out."""
        if self.rider is not None:
            return False
        self.rider = rider
        return True

    def give_back(self, hours):
        """Take the bike back and return the cost."""
        self.rider = None
        return hours * self.rate

    def __str__(self):
        return f"Bike {self.number}"

    def __repr__(self):
        return f"Bike({self.number}, {self.rate})"

    def __eq__(self, other):
        if isinstance(other, Bike):
            return self.number == other.number
        return NotImplemented


class ElectricBike(Bike):
    """A bike with a battery: a fee on top, and a charge that runs down."""

    def __init__(self, number, rate, charge=100):
        super().__init__(number, rate)
        self.charge = charge

    def give_back(self, hours):
        cost = super().give_back(hours) + 2
        self.charge = max(0, self.charge - 10 * hours)
        return cost

    def __str__(self):
        return f"Electric bike {self.number} ({self.charge}%)"


class Shed:
    """Kat's way: a shed has bikes. It is not a kind of bike, or a kind of list."""

    def __init__(self):
        self.bikes = []

    def add(self, bike):
        self.bikes.append(bike)

    def free(self):
        return [bike for bike in self.bikes if bike.rider is None]

    def __len__(self):
        return len(self.bikes)


if __name__ == "__main__":
    shed = Shed()
    shed.add(Bike(7, 4))
    shed.add(Bike(12, 5))
    volt = ElectricBike(9, 6)
    shed.add(volt)
    volt.hire("Gwen")
    print(f"Shed of {len(shed)} bikes")
    print("Free:", shed.free())
    volt.give_back(2)
    print(volt)
