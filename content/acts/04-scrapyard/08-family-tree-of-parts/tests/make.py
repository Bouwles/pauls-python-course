import random as _random

CARDS = [
    (500, "nose cone"), (250, "fin set"), (750, "launch rail"), (101, "body tube"),
    (342, "parachute"), (621, "motor mount"), (977, "launch pad"), (188, "centering ring"),
    (377, "shock cord"), (430, "altimeter"), (702, "launch lug"), (850, "igniter"),
    (133, "coupler"), (555, "nose weight"), (915, "launch controller"),
]


class _Card:
    def __init__(self, number, name):
        self.number, self.name, self.left, self.right = number, name, None, None


class _Reference:
    """Paul's catalogue, kept on the back bench to check yours against."""

    def __init__(self, cards=()):
        self.root = None
        self.looks = 0
        for number, name in cards:
            self.add(number, name)

    def add(self, number, name):
        if self.root is None:
            self.root = _Card(number, name)
            return
        card = self.root
        while True:
            if number == card.number:
                card.name = name
                return
            side = "left" if number < card.number else "right"
            if getattr(card, side) is None:
                setattr(card, side, _Card(number, name))
                return
            card = getattr(card, side)

    def find(self, number):
        card = self.root
        while card is not None:
            self.looks += 1
            if number == card.number:
                return card.name
            card = card.left if number < card.number else card.right
        return None


def shape(card):
    """The tree as nested tuples: (number, name, left, right)."""
    if card is None:
        return None
    for attribute in ("number", "name", "left", "right"):
        if not hasattr(card, attribute):
            raise CheckFailed(f"Every card should have number, name, left and right attributes; this one has no {attribute}.")
    return (card.number, card.name, shape(card.left), shape(card.right))


def walk(card, order, out):
    if card is None:
        return
    if order == "pre":
        out.append(card.number)
    walk(card.left, order, out)
    if order == "in":
        out.append((card.number, card.name))
    walk(card.right, order, out)
    if order == "post":
        out.append(card.number)
    return out


def ref_height(card):
    if card is None:
        return 0
    return 1 + max(ref_height(card.left), ref_height(card.right))


def filed(ctx, cards):
    module = ctx.module()
    catalogue = module.Catalogue()
    for number, name in cards:
        catalogue.add(number, name)
    return catalogue


def same(got, expected, message):
    if got != expected:
        raise CheckFailed(message, expected=expected, actual=got)


def a_few_cards(ctx):
    catalogue = filed(ctx, [(500, "nose cone"), (250, "fin set"), (750, "launch rail")])
    same(catalogue.find(250), "fin set", "find gives back the name filed under the number.")
    same(catalogue.in_order(), [(250, "fin set"), (500, "nose cone"), (750, "launch rail")],
         "in_order lists the pairs, smallest number first.")


def empty(ctx):
    catalogue = filed(ctx, [])
    same(catalogue.root, None, "An empty catalogue has no root card.")
    same(len(catalogue), 0, "No cards filed.")
    same(catalogue.height(), 0, "An empty tree has no levels.")
    same(catalogue.in_order(), [], "Nothing to list in order.")
    same(catalogue.pre_order(), [], "Nothing to copy out.")
    same(catalogue.post_order(), [], "Nothing to copy out.")
    same(catalogue.between(0, 1000), [], "Nothing in range.")
    same(catalogue.find(500), None, "Nothing to find.")
    same(catalogue.looks, 0, "Finding in an empty catalogue looks at no cards.")


def one_card(ctx):
    catalogue = filed(ctx, [(342, "parachute")])
    same(len(catalogue), 1, "One card filed.")
    same(catalogue.height(), 1, "A single card is one level.")
    same(shape(catalogue.root), (342, "parachute", None, None), "The only card is the root, with nothing below it.")
    same(catalogue.find(342), "parachute", "The root card is found.")
    same(catalogue.looks, 1, "Finding the root takes one look.")


def in_place(ctx):
    catalogue = filed(ctx, CARDS)
    same(shape(catalogue.root), shape(_Reference(CARDS).root),
         "Each card goes left at every smaller number and right at every bigger one, until there's an empty place.")


def filed_twice(ctx):
    catalogue = filed(ctx, CARDS + [(342, "parachute, large"), (500, "nose cone, scorched")])
    reference = _Reference(CARDS + [(342, "parachute, large"), (500, "nose cone, scorched")])
    same(len(catalogue), 15, "Filing a number again replaces its name and adds no card.")
    same(catalogue.find(342), "parachute, large", "The newer name replaces the old one.")
    same(shape(catalogue.root), shape(reference.root), "Replacing a name doesn't change the shape of the tree.")


def looks_counted(ctx):
    catalogue = filed(ctx, CARDS)
    for number, expected_name, expected_looks, path in [
        (500, "nose cone", 1, "500"),
        (342, "parachute", 3, "500, 250, 342"),
        (430, "altimeter", 5, "500, 250, 342, 377, 430"),
        (999, None, 3, "500, 750, 977, then nothing to the right"),
        (0, None, 3, "500, 250, 101, then nothing to the left"),
        (600, None, 4, "500, 750, 621, 555, then nothing to the right"),
    ]:
        catalogue.looks = 0
        got = catalogue.find(number)
        same(got, expected_name, f"find({number}) should give back {expected_name!r}.")
        same(catalogue.looks, expected_looks, f"find({number}) looks at {path}: {expected_looks} looks.")


def looks_add_up(ctx):
    catalogue = filed(ctx, CARDS)
    catalogue.find(342)
    catalogue.find(430)
    same(catalogue.looks, 8, "looks keeps counting from one find to the next: 3 looks, then 5.")


def heights(ctx):
    same(filed(ctx, CARDS).height(), 5, "Neil's fifteen cards make five levels: 500, 250, 101, 188, 133 is the longest way down.")
    same(filed(ctx, [(2, "b"), (1, "a"), (3, "c")]).height(), 2, "A card with one card on each side is two levels.")
    same(filed(ctx, [(1, "a"), (2, "b"), (3, "c"), (4, "d")]).height(), 4, "Four cards filed in order make a stick, four levels high.")


def orders(ctx):
    catalogue = filed(ctx, CARDS)
    reference = _Reference(CARDS)
    same(catalogue.in_order(), sorted(CARDS), "in_order lists every pair, smallest number first.")
    same(catalogue.pre_order(), walk(reference.root, "pre", []), "pre_order: each card, then its left side, then its right.")
    same(catalogue.post_order(), walk(reference.root, "post", []), "post_order: the left side, then the right side, then the card.")


def between(ctx):
    catalogue = filed(ctx, CARDS)
    same(catalogue.between(300, 399), [(342, "parachute"), (377, "shock cord")], "The recovery section.")
    same(catalogue.between(342, 377), [(342, "parachute"), (377, "shock cord")], "Both ends are included.")
    same(catalogue.between(378, 429), [], "Nothing is numbered from 378 to 429.")
    same(catalogue.between(400, 300), [], "A range whose low end is above its high end holds nothing.")
    same(catalogue.between(-5, 101), [(101, "body tube")], "Only 101 is in range.")
    same(catalogue.between(0, 1000), sorted(CARDS), "The whole catalogue is in range.")


def negatives(ctx):
    catalogue = filed(ctx, [(0, "nothing much"), (-40, "a hole"), (25, "washer")])
    same(catalogue.in_order(), [(-40, "a hole"), (0, "nothing much"), (25, "washer")], "Negative numbers sort like any other.")
    same(catalogue.find(-40), "a hole", "A negative number can be found.")
    same(catalogue.find(0), "nothing much", "So can 0.")


def random_thousand(ctx):
    dealer = _random.Random(8)
    numbers = dealer.sample(range(100_000), 1000)
    cards = [(number, f"part {number}") for number in numbers]
    repeats = [(number, f"part {number}, again") for number in dealer.sample(numbers, 50)]
    catalogue = filed(ctx, cards + repeats)
    reference = _Reference(cards + repeats)
    same(len(catalogue), 1000, "A thousand different numbers, fifty of them filed twice.")
    same(catalogue.height(), ref_height(reference.root), "The height of a thousand cards filed at random.")
    same(catalogue.in_order(), walk(reference.root, "in", []), "A thousand cards, in order.")
    same(catalogue.pre_order(), walk(reference.root, "pre", []), "A thousand cards, copied out in pre-order.")
    same(catalogue.post_order(), walk(reference.root, "post", []), "A thousand cards, copied out in post-order.")
    catalogue.looks = 0
    for number in numbers[:300]:
        catalogue.find(number)
        reference.find(number)
    same(catalogue.looks, reference.looks, "Finding three hundred of them should look at one card per level on the way down, no more.")
    low, high = 20_000, 40_000
    same(catalogue.between(low, high), [pair for pair in walk(reference.root, "in", []) if low <= pair[0] <= high],
         "Every card numbered from 20,000 to 40,000.")


def a_stick(ctx):
    catalogue = filed(ctx, [(number, f"part {number}") for number in range(1, 201)])
    same(catalogue.height(), 200, "Two hundred cards filed in order make a stick: every card on the right of the last.")
    same(catalogue.root.left, None, "Nothing is smaller than the first card, so nothing is on its left.")
    same(len(catalogue.in_order()), 200, "All two hundred, in order.")
    catalogue.looks = 0
    catalogue.find(200)
    same(catalogue.looks, 200, "Finding the last card of a stick looks at every card: that's why the order cards are filed in matters.")


def in_order_new_list(ctx):
    catalogue = filed(ctx, CARDS)
    first = catalogue.in_order()
    first.clear()
    same(len(catalogue.in_order()), 15, "Changing the list in_order gave back shouldn't change the next one.")


TESTS = [
    custom("A few cards", a_few_cards, visible=True),
    output("The main block", visible=True,
           expect="Catalogue: 15 cards, 5 levels\nCard 342: parachute, in 3 looks\nCard 999: not in the catalogue, 3 looks\n"
                  "In order: 101 body tube first, 977 launch pad last\n"
                  "Recovery section, 300 to 399: [(342, 'parachute'), (377, 'shock cord')]\n"
                  "Copied out: [500, 250, 101, 188, 133, 342, 377, 430, 750, 621, 555, 702, 977, 850, 915]"),
    custom("An empty catalogue", empty, hint="An empty side counts 0 cards and 0 levels. Every method should cope with a root of None."),
    custom("One card", one_card),
    custom("Every card in its place", in_place,
           hint="Walk down from the root, left for smaller and right for bigger, and put the new card in the first empty place."),
    custom("A number filed twice", filed_twice,
           hint="If the walk meets a card with the same number, change its name and stop."),
    custom("Looks for each find", looks_counted,
           hint="Add one to looks for each card you compare the number with, and stop at the card or at an empty place."),
    custom("looks keeps counting", looks_add_up, hint="Only the person checking resets looks; find adds to it."),
    custom("Heights", heights, hint="A card is one level more than the taller of its two sides; an empty side is 0."),
    custom("In, pre and post order", orders),
    custom("Between two numbers", between, hint="Keep a pair only if low <= number <= high, and list them smallest first."),
    custom("Negative numbers and nought", negatives,
           hint="Check for an empty place with `is None`, not by whether a number is 0."),
    custom("A thousand cards at random", random_thousand, timeout=5),
    custom("Two hundred cards in order", a_stick, timeout=5),
    custom("in_order hands back a new list", in_order_new_list),
]
