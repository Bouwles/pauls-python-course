"""Hash map from scratch: a dictionary made by hand, to see how dict does it."""

KINDS = ["bolt", "nut", "washer", "spring", "hinge", "valve", "gear", "chain", "hubcap", "bell"]


def stock_parts(count):
    """count different part names, the way the store room's stock list writes them."""
    return [f"{KINDS[number % len(KINDS)]}-{number // len(KINDS) + 1}" for number in range(count)]


# The rule for which pile a name goes in: times thirty-one, add the next letter,
# and keep the remainder by 1,000,003. Thirty-one because it's prime. Java's
# strings hash with the same number.
def part_hash(name):
    number = 0
    for character in name:
        number = (number * 31 + ord(character)) % 1_000_003
    return number


if __name__ == "__main__":
    parts = stock_parts(200)
