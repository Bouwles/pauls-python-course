# Bake sale stock sheets, for the Studio's new board games. Caitlin, last term.
# By hand, everything gets counted twice. This counts it once, carefully.

STANDARD_BAKE = {
    "bread": {"baked": 40, "sold": 0},
    "buns": {"baked": 60, "sold": 0},
    "brownies": {"baked": 12, "sold": 0},
}


def new_day():
    """Return a fresh stock sheet for the day, from the standard bake."""
    # Copies are cheap. Finding out you needed one is not. C.
    return STANDARD_BAKE.copy()


def bake_more(sheet, item, quantity):
    """We ran out and baked another batch."""
    sheet[item]["baked"] += quantity


def sell(sheet, item, quantity):
    """Record a sale on the day's sheet."""
    sheet[item]["sold"] += quantity


def left(sheet, item):
    """How many of item are still on the shelves."""
    return sheet[item]["baked"] - sheet[item]["sold"]


def report(sheet):
    """One line per item: how many are left, of how many baked."""
    lines = []
    for item, counts in sheet.items():
        lines.append(f"{item}: {left(sheet, item)} left of {counts['baked']}")
    return lines
