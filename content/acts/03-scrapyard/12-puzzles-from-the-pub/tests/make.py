import random as _random

COINS = [1, 2, 5, 10, 20, 50, 100, 200]


class TooManyCalls(Exception):
    pass


def counting(module, name, limit):
    """Count every call to the learner's function, including the calls it makes to itself."""
    original = getattr(module, name)
    box = {"calls": 0}

    def wrapper(*args, **kwargs):
        box["calls"] += 1
        if box["calls"] > limit:
            raise TooManyCalls()
        return original(*args, **kwargs)

    setattr(module, name, wrapper)
    return wrapper, box


def true_distance(given, correct):
    previous = list(range(len(correct) + 1))
    for row, letter in enumerate(given, start=1):
        current = [row]
        for col, other in enumerate(correct, start=1):
            current.append(previous[col - 1] if letter == other else 1 + min(previous[col], current[col - 1], previous[col - 1]))
        previous = current
    return previous[-1]


def two_pounds(ctx):
    module = ctx.module()
    ways_to_pay, box = counting(module, "ways_to_pay", 50_000)
    try:
        got = ways_to_pay(200, list(COINS))
    except TooManyCalls:
        raise CheckFailed("Making £2 from eight coins took more than 50,000 calls to ways_to_pay. The same questions are being worked out again and again.")
    except RecursionError:
        raise CheckFailed("Making £2 went too deep for Python. A table filled from 0p upwards needs no recursion at all.")
    if got != 73682:
        raise CheckFailed("There are 73,682 ways to make £2 from the eight coins.", expected=73682, actual=got)


def long_words(ctx):
    module = ctx.module()
    rng = _random.Random(7)
    given = "".join(rng.choice("ACGT") for _ in range(60))
    correct = "".join(rng.choice("ACGT") for _ in range(55))
    edit_distance, box = counting(module, "edit_distance", 50_000)
    try:
        got = edit_distance(given, correct)
    except TooManyCalls:
        raise CheckFailed("Comparing two words of about sixty letters took more than 50,000 calls to edit_distance. Work each pair of beginnings out once: a table does it.")
    expected = true_distance(given, correct)
    if got != expected:
        raise CheckFailed("Two long strings of letters.", expected=expected, actual=got)


def both_ways(ctx):
    module = ctx.module()
    for one, other in [("whelk", "whale"), ("anchor", "ancho"), ("lamp", "plum"), ("", "tide")]:
        there, back = module.edit_distance(one, other), module.edit_distance(other, one)
        if there != back or there != true_distance(one, other):
            raise CheckFailed(f"Turning {one!r} into {other!r} takes as many changes as turning it back.",
                              expected=(true_distance(one, other), true_distance(one, other)), actual=(there, back))


TESTS = [
    function("4p from 1p and 2p", call="ways_to_pay", args=(4, [1, 2]), expect=3, visible=True),
    function("Lighthose", call="edit_distance", args=("Lighthose", "Lighthouse"), expect=1, visible=True),
    function("50p in change", call="ways_to_pay", args=(50, [1, 2, 5, 10, 20]), expect=450,
             hint="Count one kind of coin at a time, so 1p then 2p and 2p then 1p are one handful."),
    function("The coins in another order", call="ways_to_pay", args=(50, [20, 10, 5, 2, 1]), expect=450),
    function("Nothing to pay", call="ways_to_pay", args=(0, [1, 2, 5]), expect=1,
             hint="There's exactly one way to pay 0p: hand over no coins."),
    function("Can't be done", call="ways_to_pay", args=(3, [2]), expect=0),
    function("No coins at all", call="ways_to_pay", args=(7, []), expect=0),
    function("A pound without the big coins", call="ways_to_pay", args=(100, [1, 2, 5, 10, 20, 50]), expect=4562),
    custom("£2 from all eight coins", two_pounds),
    function("Nothing into nothing", call="edit_distance", args=("", ""), expect=0),
    function("Something from nothing", call="edit_distance", args=("", "TIDE"), expect=4,
             hint="Turning no letters into four letters takes four letters put in. That's the first row of the table."),
    function("Nothing from something", call="edit_distance", args=("TIDE", ""), expect=4),
    function("Spelt right", call="edit_distance", args=("ferry", "ferry"), expect=0),
    function("One letter short", call="edit_distance", args=("anchor", "ancho"), expect=1),
    function("Whelk for whale", call="edit_distance", args=("whelk", "whale"), expect=2),
    function("Lamp for plum", call="edit_distance", args=("lamp", "plum"), expect=3,
             hint="When two letters don't match, try all three: take one out (from above), put one in (from the left), or swap (up and to the left)."),
    custom("There and back", both_ways),
    custom("Sixty letters", long_words),
    function("Right, in any case", call="mark", args=("  LIGHTHOUSE ", "Lighthouse"), expect="right"),
    function("Mr Ashby's answer", call="mark", args=("Lighthose", "Lighthouse"), expect="near enough"),
    function("Two slips in ten letters", call="mark", args=("Lihgthouse", "Lighthouse"), expect="near enough",
             hint="Ten letters allow two changes. Swapping two letters round takes two."),
    function("Three slips in ten letters", call="mark", args=("Lightship", "lighthouse"), expect="wrong"),
    function("Whelk", call="mark", args=("Whelk", "Whale"), expect="wrong"),
    function("No slips in a short answer", call="mark", args=("cod", "Cog"), expect="wrong",
             hint="Gwen allows one change for every five letters of the right answer. Three letters allow none."),
    output("Gwen's answers", expect="50p in change: 450 ways\n'Lighthose' for 'Lighthouse': near enough\n'Whelk' for 'Whale': wrong"),
]
