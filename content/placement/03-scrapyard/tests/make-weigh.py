import ast as _ast
import random as _random

LORRY = [("hubcap", 4), ("gear", 1), ("spring", 4)]


class TooMany(Exception):
    pass


class Counter:
    def __init__(self, limit):
        self.count = 0
        self.limit = limit

    def tick(self):
        self.count += 1
        if self.count > self.limit:
            raise TooMany()


def counted_kg(counter):
    class Kg(int):
        """A weight that counts every comparison made with it."""

        def __lt__(self, other):
            counter.tick()
            return int(self) < int(other)

        def __le__(self, other):
            counter.tick()
            return int(self) <= int(other)

        def __gt__(self, other):
            counter.tick()
            return int(self) > int(other)

        def __ge__(self, other):
            counter.tick()
            return int(self) >= int(other)

        def __eq__(self, other):
            counter.tick()
            return int(self) == int(other)

        def __ne__(self, other):
            counter.tick()
            return int(self) != int(other)

        __hash__ = int.__hash__

    return Kg


class Pile:
    """A million parts, lightest first, made up as they're looked at. Part i weighs i // 4 kg."""

    def __init__(self, size=1_000_000):
        self.size = size
        self.looks = 0

    def __len__(self):
        return self.size

    def part(self, index):
        return (f"part-{index}", index // 4)

    def __getitem__(self, index):
        if isinstance(index, slice):
            positions = range(*index.indices(self.size))
            self.looks += len(positions)
            return [self.part(i) for i in positions]
        if index < 0:
            index += self.size
        if not 0 <= index < self.size:
            raise IndexError("pile index out of range")
        self.looks += 1
        return self.part(index)

    def __iter__(self):
        self.looks += self.size
        return (self.part(i) for i in range(self.size))

    def __contains__(self, item):
        self.looks += self.size
        return False


def weight(part):
    return part[1]


def sorts(parts, label=None):
    def check(ctx):
        module = ctx.module()
        given = list(parts)
        got = module.sort_parts(given)
        expected = sorted(parts, key=weight)
        if got != expected:
            small = len(parts) <= 8
            plain = sorted(got, key=weight) == expected if isinstance(got, list) and len(got) == len(expected) else False
            raise CheckFailed(f"sort_parts({label or parts}): lightest first, ties in the order given.",
                              expected=repr(expected) if small else "lightest first, ties in the order given",
                              actual=repr(got) if small else ("ties out of order" if plain else "not lightest first"))
        if given != list(parts):
            raise CheckFailed("sort_parts should leave the list it was given as it was.", expected=repr(list(parts)), actual=repr(given))
    return check


def new_list(ctx):
    module = ctx.module()
    parts = [("gear", 1), ("hubcap", 4)]
    got = module.sort_parts(parts)
    if got is parts:
        raise CheckFailed("sort_parts gave back the very list it was given. It should give back a new one.")


def stable_lorry(ctx):
    module = ctx.module()
    lorry = _random.Random(8)
    parts = [(f"part-{number}", lorry.randint(1, 5)) for number in range(300)]
    got = module.sort_parts(list(parts))
    expected = sorted(parts, key=weight)
    if got != expected:
        plain = isinstance(got, list) and sorted(got, key=weight) == expected
        raise CheckFailed("300 parts weighing 1 to 5 kg: lightest first, and parts of the same weight in the order they came.",
                          expected="ties in the order they came", actual="ties out of order" if plain else "not lightest first")


def comparisons(ctx):
    module = ctx.module()
    counter = Counter(150_000)
    Kg = counted_kg(counter)
    lorry = _random.Random(4)
    plain = [(f"part-{number}", lorry.randint(1, 1000)) for number in range(4096)]
    parts = [(name, Kg(kg)) for name, kg in plain]
    try:
        got = module.sort_parts(parts)
    except TooMany:
        raise CheckFailed("Sorting 4,096 parts made more than 150,000 comparisons. An O(n log n) sort needs about 50,000.")
    if [(name, int(kg)) for name, kg in got] != sorted(plain, key=weight):
        raise CheckFailed("4,096 parts should come out lightest first, ties in the order they came.")


def finds(parts, kg, expected, message):
    def check(ctx):
        module = ctx.module()
        got = module.first_at_least(list(parts), kg)
        if got != expected:
            raise CheckFailed(message, expected=expected, actual=got)
    return check


def million(kg, expected, message):
    def check(ctx):
        module = ctx.module()
        pile = Pile()
        got = module.first_at_least(pile, kg)
        if got != expected:
            raise CheckFailed(message, expected=expected, actual=got)
        if pile.looks > 60:
            raise CheckFailed(f"It looked at {pile.looks:,} parts. A binary search needs about twenty for a million.",
                              expected="60 or fewer", actual=pile.looks)
    return check


def by_hand(tree, source):
    for node in _ast.walk(tree):
        if isinstance(node, (_ast.Import, _ast.ImportFrom)):
            names = [alias.name for alias in node.names] + [getattr(node, "module", None) or ""]
            if "bisect" in names:
                return "Search by hand: no bisect."
        if isinstance(node, _ast.Call):
            name = node.func.attr if isinstance(node.func, _ast.Attribute) else getattr(node.func, "id", None)
            if name in ("sorted", "sort"):
                return f"Sort by hand: no {name}()."
    return None


SORTED = [("gear", 1), ("bell", 2), ("hubcap", 4), ("spring", 4), ("valve", 4), ("anvil", 9)]


TESTS = [
    function("Nell's three parts", call="sort_parts", args=(LORRY,), expect=[("gear", 1), ("hubcap", 4), ("spring", 4)],
             visible=True),
    function("The first at 4 kg", call="first_at_least", args=([("gear", 1), ("hubcap", 4), ("spring", 4)], 4), expect=1,
             visible=True),
    function("An empty lorry", call="sort_parts", args=([],), expect=[]),
    function("One part", call="sort_parts", args=([("anvil", 9)],), expect=[("anvil", 9)]),
    custom("A new list", new_list),
    custom("Seven parts", sorts([("a", 5), ("b", 3), ("c", 8), ("d", 1), ("e", 9), ("f", 2), ("g", 7)])),
    custom("Already lightest first", sorts([("a", 1), ("b", 2), ("c", 3), ("d", 4), ("e", 5)])),
    custom("Heaviest first", sorts([("a", 5), ("b", 4), ("c", 3), ("d", 2), ("e", 1)])),
    custom("All the same weight", sorts([("a", 3), ("b", 3), ("c", 3), ("d", 3)]),
           hint="Parts of the same weight stay in the order they were given. On a tie, take the one that came first."),
    custom("Every tie in order", stable_lorry,
           hint="Merge sort keeps ties in order if, on a tie, it takes from the left pile: compare with <=."),
    custom("Four thousand parts, n log n", comparisons,
           hint="Comparing every part with every other is O(n squared). Split the pile, sort each half, and merge."),
    function("Lighter than everything", call="first_at_least", args=(SORTED, 0), expect=0),
    function("Heavier than everything", call="first_at_least", args=(SORTED, 10), expect=6,
             hint="If no part weighs that much, give back len(parts): the position just past the end."),
    function("The first of a run", call="first_at_least", args=(SORTED, 4), expect=2,
             hint="Three parts weigh 4 kg. Keep looking left after you find one, until you find the first."),
    function("A weight that isn't there", call="first_at_least", args=(SORTED, 3), expect=2,
             hint="Nothing weighs 3 kg, so the first part weighing at least 3 kg is the first 4 kg one."),
    function("The heaviest", call="first_at_least", args=(SORTED, 9), expect=5),
    function("An empty pile", call="first_at_least", args=([], 4), expect=0),
    function("One part, heavy enough", call="first_at_least", args=([("anvil", 9)], 5), expect=0),
    function("One part, too light", call="first_at_least", args=([("gear", 1)], 5), expect=1),
    custom("A million parts, found in a handful", million(123_456, 493_824, "Parts weigh i // 4 kg, so the first 123,456 kg part is at 493,824."),
           hint="Each look should throw away half of what's left. Looking at the parts one at a time opens hundreds of thousands."),
    custom("A million parts, and none heavy enough", million(250_000, 1_000_000, "Nothing weighs 250,000 kg: give back len(parts).")),
    custom("A million parts, the very first", million(0, 0, "The first part weighs 0 kg.")),
    structure("Sorted and searched by hand", check=by_hand),
]
