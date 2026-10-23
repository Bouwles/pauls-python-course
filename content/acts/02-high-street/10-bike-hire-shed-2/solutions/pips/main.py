class Bike:
    def __init__(self, number, rate):
        self.number = number
        self.rate = rate
        self.rider = None

    def __eq__(self, other):
        if isinstance(other, Bike):
            return self.number == other.number
        return NotImplemented

    def hire(self, rider):
        if self.rider is not None:
            return False
        self.rider = rider
        return True


class ElectricBike(Bike):
    def __init__(self, number, rate, charge=100):
        super().__init__(number, rate)
        self.charge = charge


volt = ElectricBike(9, 6)
print(volt.hire("Gwen"))
print(volt == Bike(9, 4))
print(volt == "bike 9")
