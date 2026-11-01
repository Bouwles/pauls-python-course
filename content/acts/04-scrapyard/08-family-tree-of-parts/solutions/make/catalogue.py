"""The family tree of parts: Neil's rocket catalogue, as a binary search tree."""


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


# Neil's rocket catalogue cards, in the order he filed them. Every card
# knows which side of its parent it belongs on, and why: smaller, or bigger.
ROCKET_CARDS = [
    (500, "nose cone"), (250, "fin set"), (750, "launch rail"), (101, "body tube"),
    (342, "parachute"), (621, "motor mount"), (977, "launch pad"), (188, "centering ring"),
    (377, "shock cord"), (430, "altimeter"), (702, "launch lug"), (850, "igniter"),
    (133, "coupler"), (555, "nose weight"), (915, "launch controller"),
]


if __name__ == "__main__":
    catalogue = Catalogue()
    for number, name in ROCKET_CARDS:
        catalogue.add(number, name)
    print(f"Catalogue: {len(catalogue)} cards, {catalogue.height()} levels")
    catalogue.looks = 0
    print(f"Card 342: {catalogue.find(342)}, in {catalogue.looks} looks")
    catalogue.looks = 0
    if catalogue.find(999) is None:
        print(f"Card 999: not in the catalogue, {catalogue.looks} looks")
    pairs = catalogue.in_order()
    print(f"In order: {pairs[0][0]} {pairs[0][1]} first, {pairs[-1][0]} {pairs[-1][1]} last")
    print("Recovery section, 300 to 399:", catalogue.between(300, 399))
    print("Copied out:", catalogue.pre_order())
