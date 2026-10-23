class Bike:
    def __init__(self, number, kind, rate):
        self.number = number
        self.kind = kind
        self.rate = rate
        self.rider = None

    def hire(self, rider):
        self.rider = rider

    def cost(self, hours):
        return hours * self.rate


red = Bike(7, "town", 4)
red.hire("Bea")
print(red.rider, red.cost(3))
