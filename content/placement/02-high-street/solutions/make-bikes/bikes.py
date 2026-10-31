"""Caitlin's bike hire: the bikes, and the shed that has them."""


class Bike:
    """One hire bike. rider is None while it's in the shed."""

    def __init__(self, number, kind, rate):
        self.number = number
        self.kind = kind
        self.rate = rate
        self.rider = None

    def hire(self, rider):
        if self.rider is not None:
            raise ValueError(f"Bike {self.number} is already out.")
        self.rider = rider

    def give_back(self, hours):
        """Back in the shed. Gives back the charge: at least an hour's worth."""
        if self.rider is None:
            raise ValueError(f"Bike {self.number} isn't out.")
        self.rider = None
        return self.rate * max(hours, 1)

    def __str__(self):
        if self.rider is None:
            return f"Bike {self.number}: {self.kind}, in"
        return f"Bike {self.number}: {self.kind}, out with {self.rider}"

    def __eq__(self, other):
        if not isinstance(other, Bike):
            return NotImplemented
        return self.number == other.number

    def __lt__(self, other):
        return self.number < other.number


class Shed:
    """A shed has bikes."""

    def __init__(self, bikes):
        self.bikes = list(bikes)

    def __len__(self):
        return len(self.bikes)

    def __contains__(self, number):
        return any(bike.number == number for bike in self.bikes)

    def available(self):
        return sorted(bike for bike in self.bikes if bike.rider is None)


if __name__ == "__main__":
    shed = Shed([Bike(5, "road", 4.0), Bike(2, "tandem", 6.0), Bike(9, "cargo", 5.0)])
    shed.bikes[1].hire("Riya")
    for bike in sorted(shed.bikes):
        print(bike)
    print(f"In the shed: {[bike.number for bike in shed.available()]}")
