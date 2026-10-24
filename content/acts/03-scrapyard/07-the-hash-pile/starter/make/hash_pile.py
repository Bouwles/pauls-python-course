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


if __name__ == "__main__":
    parts = yard_parts(200)
