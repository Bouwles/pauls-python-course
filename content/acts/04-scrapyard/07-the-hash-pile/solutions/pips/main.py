def part_hash(name):
    number = 0
    for character in name:
        number = (number * 31 + ord(character)) % 1_000_003
    return number


class Stock:
    """The Archive's stationery count: names to counts, filed in piles."""

    def __init__(self):
        self.piles = [[] for _ in range(4)]
        self.count = 0

    def _pile(self, name):
        return self.piles[part_hash(name) % len(self.piles)]

    def put(self, name, value):
        pile = self._pile(name)
        for position, (stored, _value) in enumerate(pile):
            if stored == name:
                pile[position] = (name, value)
                return
        pile.append((name, value))
        self.count = self.count + 1
        if self.count > 0.75 * len(self.piles):
            old_piles = self.piles
            self.piles = [[] for _ in range(2 * len(old_piles))]
            for old_pile in old_piles:
                for pair in old_pile:
                    self._pile(pair[0]).append(pair)

    def get(self, name, default=None):
        for stored, value in self._pile(name):
            if stored == name:
                return value
        return default


if __name__ == "__main__":
    stock = Stock()
    counts = {"folders": 12, "labels": 300, "pencils": 40, "staples": 5000, "tape": 6}
    for name, count in counts.items():
        stock.put(name, count)
    for name in counts:
        print(name, stock.get(name))
