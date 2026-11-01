class Tally:
    """A count of paint tubes in the Makerspace, with an undo button."""

    def __init__(self):
        self.counts = {}
        self.history = []

    def add(self, paint, count):
        self.counts[paint] = self.counts.get(paint, 0) + count
        self.history.append((paint, count))

    def undo(self):
        if not self.history:
            return
        paint, count = self.history.pop(0)
        self.counts[paint] = self.counts[paint] - count


if __name__ == "__main__":
    tally = Tally()
    tally.add("cadmium-yellow", 4)
    tally.add("ultramarine", 2)
    tally.add("cadmium-yellow", 40)
    tally.undo()
    print(tally.counts)
