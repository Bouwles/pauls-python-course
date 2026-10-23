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

    # Teach it to show itself: __str__ and __repr__
    # Decide what == means, for bikes and for everything else: __eq__


# ElectricBike, Dev's way
#   Say what kind of thing it is
#   Let the parent set up its part
#   Add what is new: charge
#   Change only what differs: give_back and __str__


# Shed, Kat's way: it has a list of bikes
#   add(bike), free(), and __len__ for len(shed)


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
