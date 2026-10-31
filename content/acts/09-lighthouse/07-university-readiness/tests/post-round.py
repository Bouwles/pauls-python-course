import random as _random

STREETS = ["Ash Grove", "Clock Lane", "Foundry Road", "High Street", "Queen's Row", "River Walk"]


def leaves_parcels_alone(ctx):
    module = ctx.module()
    parcels = [("A", "Queen's Row", 4), ("B", "Queen's Row", 1), ("C", "Foundry Road", 3)]
    module.round_order(parcels)
    if parcels != [("A", "Queen's Row", 4), ("B", "Queen's Row", 1), ("C", "Foundry Road", 3)]:
        raise CheckFailed("round_order should hand back a new list and leave the courier's parcels as they came.",
                          expected=[("A", "Queen's Row", 4), ("B", "Queen's Row", 1), ("C", "Foundry Road", 3)], actual=parcels)


def comes_before(first, second):
    """True if parcel first may be delivered before parcel second (positions break ties)."""
    (first_at, (_, first_street, first_number)), (second_at, (_, second_street, second_number)) = first, second
    if first_street != second_street:
        return first_street < second_street
    first_side, second_side = first_number % 2 == 0, second_number % 2 == 0
    if first_side != second_side:
        return not first_side
    if first_number != second_number:
        return first_number < second_number if not first_side else first_number > second_number
    return first_at < second_at


def whole_town(ctx):
    module = ctx.module()
    sack = _random.Random(14)
    parcels = [(f"P{sack.randint(1, 999_999)}-{index}", sack.choice(STREETS), sack.randint(1, 60))
               for index in range(30_000)]
    sack.shuffle(parcels)
    got = module.round_order(list(parcels))
    labels = [label for label, _, _ in parcels]
    if not isinstance(got, list) or sorted(got) != sorted(labels):
        raise CheckFailed("The round should deliver every one of the 30,000 parcels exactly once.")
    where = {label: (position, parcel) for position, (label, parcel) in enumerate(zip(labels, parcels))}
    for earlier, later in zip(got, got[1:]):
        if not comes_before(where[earlier], where[later]):
            _, (_, street, number) = where[earlier]
            _, (_, next_street, next_number) = where[later]
            raise CheckFailed(f"Out of order on the round: {earlier} ({number} {street}) went before {later} ({next_number} {next_street}).",
                              expected=f"{later} first", actual=f"{earlier} first")


TESTS = [
    function("Up the odd side, down the even", call="round_order",
             args=([("A", "Queen's Row", 4), ("B", "Queen's Row", 1), ("C", "Queen's Row", 3), ("D", "Queen's Row", 2)],),
             expect=["B", "C", "A", "D"], visible=True),
    function("Two streets, and two parcels for one house", call="round_order",
             args=([("E", "Queen's Row", 2), ("F", "High Street", 5), ("G", "Queen's Row", 2), ("H", "High Street", 2)],),
             expect=["F", "H", "E", "G"], visible=True),
    function("An empty sack", call="round_order", args=([],), expect=[],
             hint="No parcels, no round: an empty list."),
    function("One parcel", call="round_order", args=([("K", "River Walk", 12)],), expect=["K"]),
    function("Only the odd side", call="round_order",
             args=([("A", "River Walk", 9), ("B", "River Walk", 1), ("C", "River Walk", 5)],), expect=["B", "C", "A"]),
    function("Only the even side", call="round_order",
             args=([("A", "River Walk", 2), ("B", "River Walk", 10), ("C", "River Walk", 6)],), expect=["B", "C", "A"],
             hint="Coming back down the even side, the numbers go down: 10, 6, 2."),
    function("Numbers, not text", call="round_order",
             args=([("A", "Foundry Road", 11), ("B", "Foundry Road", 9), ("C", "Foundry Road", 10), ("D", "Foundry Road", 12)],),
             expect=["B", "A", "D", "C"],
             hint="9 comes before 11, and 12 before 10 on the way back. Compare the house numbers as numbers."),
    function("Three parcels for one house", call="round_order",
             args=([("Z", "Clock Lane", 3), ("M", "Clock Lane", 3), ("A", "Clock Lane", 3)],), expect=["Z", "M", "A"],
             hint="Parcels for the same house stay in the order they came. Leave the label out of the key, and let a stable sort keep them."),
    function("Same number, different streets", call="round_order",
             args=([("A", "River Walk", 4), ("B", "Ash Grove", 4), ("C", "Foundry Road", 4)],), expect=["B", "C", "A"]),
    function("Streets in alphabetical order", call="round_order",
             args=([("A", "Queen's Row", 1), ("B", "High Street", 2), ("C", "Ash Grove", 8), ("D", "High Street", 1)],),
             expect=["C", "D", "B", "A"]),
    custom("The courier's parcels stay as they came", leaves_parcels_alone,
           hint="parcels.sort() reorders the courier's own list. sorted(parcels) makes a new one."),
    custom("The whole city's post", whole_town, timeout=8,
           hint="If only this fails, look at parcels for the same house: they must keep the order they came in."),
]
