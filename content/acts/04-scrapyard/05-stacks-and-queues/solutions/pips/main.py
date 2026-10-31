class Tally:
    """A count of parts in the store room, with an undo button."""

    def __init__(self):
        self.counts = {}
        self.history = []

    def add(self, part, count):
        self.counts[part] = self.counts.get(part, 0) + count
        self.history.append((part, count))

    def undo(self):
        if not self.history:
            return
        part, count = self.history.pop()
        self.counts[part] = self.counts[part] - count


if __name__ == "__main__":
    tally = Tally()
    tally.add("hubcap", 4)
    tally.add("bike-bell", 2)
    tally.add("hubcap", 40)
    tally.undo()
    print(tally.counts)
