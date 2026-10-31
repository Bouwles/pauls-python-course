"""The family tree of parts: the clockmaker's catalogue, as a binary search tree."""


class Card:
    """One catalogue card, with the cards just below it on each side."""

    def __init__(self, number, name):
        self.number = number
        self.name = name
        self.left = None
        self.right = None


def _count(card):
    if card is None:
        return 0
    return 1 + _count(card.left) + _count(card.right)


def _height(card):
    if card is None:
        return 0
    return 1 + max(_height(card.left), _height(card.right))


def _in_order(card, pairs):
    if card is None:
        return
    _in_order(card.left, pairs)
    pairs.append((card.number, card.name))
    _in_order(card.right, pairs)


def _pre_order(card, numbers):
    if card is None:
        return
    numbers.append(card.number)
    _pre_order(card.left, numbers)
    _pre_order(card.right, numbers)


def _post_order(card, numbers):
    if card is None:
        return
    _post_order(card.left, numbers)
    _post_order(card.right, numbers)
    numbers.append(card.number)


def _between(card, low, high, pairs):
    if card is None:
        return
    if low < card.number:
        _between(card.left, low, high, pairs)
    if low <= card.number <= high:
        pairs.append((card.number, card.name))
    if card.number < high:
        _between(card.right, low, high, pairs)


class Catalogue:
    """Cards filed by number: smaller down the left of each card, bigger down the right."""

    def __init__(self):
        self.root = None
        self.looks = 0

    def add(self, number, name):
        if self.root is None:
            self.root = Card(number, name)
            return
        card = self.root
        while True:
            if number == card.number:
                card.name = name
                return
            if number < card.number:
                if card.left is None:
                    card.left = Card(number, name)
                    return
                card = card.left
            else:
                if card.right is None:
                    card.right = Card(number, name)
                    return
                card = card.right

    def find(self, number):
        card = self.root
        while card is not None:
            self.looks = self.looks + 1
            if number == card.number:
                return card.name
            card = card.left if number < card.number else card.right
        return None

    def __len__(self):
        return _count(self.root)

    def height(self):
        return _height(self.root)

    def in_order(self):
        pairs = []
        _in_order(self.root, pairs)
        return pairs

    def pre_order(self):
        numbers = []
        _pre_order(self.root, numbers)
        return numbers

    def post_order(self):
        numbers = []
        _post_order(self.root, numbers)
        return numbers

    def between(self, low, high):
        pairs = []
        _between(self.root, low, high, pairs)
        return pairs


# The clockmaker's catalogue cards, in the order they were filed. Every card
# knows which side of its parent it belongs on, and why: smaller, or bigger.
CLOCKMAKERS_CARDS = [
    (500, "anchor chain"), (250, "bike bell"), (750, "tin bath"), (101, "bolt tin"),
    (342, "brass valve"), (621, "mangle roller"), (977, "winch handle"), (188, "clock spring"),
    (377, "brass bell"), (430, "lamp lens"), (702, "pram wheel"), (850, "kettle element"),
    (133, "gear wheel"), (555, "hubcap"), (915, "spring coil"),
]


if __name__ == "__main__":
    catalogue = Catalogue()
    for number, name in CLOCKMAKERS_CARDS:
        catalogue.add(number, name)
    print(f"Catalogue: {len(catalogue)} cards, {catalogue.height()} levels")
    catalogue.looks = 0
    print(f"Card 342: {catalogue.find(342)}, in {catalogue.looks} looks")
    catalogue.looks = 0
    if catalogue.find(999) is None:
        print(f"Card 999: not in the catalogue, {catalogue.looks} looks")
    pairs = catalogue.in_order()
    print(f"In order: {pairs[0][0]} {pairs[0][1]} first, {pairs[-1][0]} {pairs[-1][1]} last")
    print("Brass section, 300 to 399:", catalogue.between(300, 399))
    print("Copied out:", catalogue.pre_order())
