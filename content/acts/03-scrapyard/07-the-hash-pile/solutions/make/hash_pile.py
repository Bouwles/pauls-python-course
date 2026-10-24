"""Nell's hash pile: a dictionary made by hand."""

KINDS = ["bolt", "nut", "washer", "spring", "hinge", "valve", "gear", "chain", "hubcap", "bell"]


def yard_parts(count):
    """count different part names, the way Nell's stock list writes them."""
    return [f"{KINDS[number % len(KINDS)]}-{number // len(KINDS) + 1}" for number in range(count)]


# Nell's rule, written down. She does it by eye and won't hear of a sum.
# Thirty-one because it's prime, and because she was thirty-one the year
# she took the yard on. Either reason will do. A.P.
def scrap_hash(name):
    number = 0
    for character in name:
        number = (number * 31 + ord(character)) % 1_000_003
    return number


class HashPile:
    """Names and values, filed in piles by scrap_hash."""

    def __init__(self, piles=8):
        self.piles = [[] for _ in range(piles)]
        self.count = 0
        self.probes = 0

    def _pile(self, name):
        return self.piles[scrap_hash(name) % len(self.piles)]

    def _find(self, pile, name):
        """The position of name in pile, or -1, counting a probe per comparison."""
        for position, (stored, _value) in enumerate(pile):
            self.probes = self.probes + 1
            if stored == name:
                return position
        return -1

    def put(self, name, value):
        pile = self._pile(name)
        position = self._find(pile, name)
        if position >= 0:
            pile[position] = (name, value)
            return
        pile.append((name, value))
        self.count = self.count + 1
        if self.count > 0.75 * len(self.piles):
            self._double()

    def _double(self):
        old_piles = self.piles
        self.piles = [[] for _ in range(2 * len(old_piles))]
        for pile in old_piles:
            for name, value in pile:
                self._pile(name).append((name, value))

    def get(self, name, default=None):
        pile = self._pile(name)
        position = self._find(pile, name)
        if position < 0:
            return default
        return pile[position][1]

    def remove(self, name):
        pile = self._pile(name)
        position = self._find(pile, name)
        if position < 0:
            raise KeyError(name)
        _name, value = pile.pop(position)
        self.count = self.count - 1
        return value

    def __contains__(self, name):
        return self._find(self._pile(name), name) >= 0

    def __len__(self):
        return self.count

    def load(self):
        return self.count / len(self.piles)


if __name__ == "__main__":
    parts = yard_parts(200)
    yard = HashPile()
    for number, name in enumerate(parts):
        yard.put(name, number)
    print(f"{len(yard)} parts in {len(yard.piles)} piles, {yard.load():.2f} to a pile")
    yard.probes = 0
    for name in parts:
        yard.get(name)
    print(f"Finding every part: {yard.probes} probes")
    probes = 0
    for name in parts:
        for stored in parts:
            probes = probes + 1
            if stored == name:
                break
    print(f"Finding every part along one long list: {probes} probes")
