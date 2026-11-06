"""Hash map from scratch: a dictionary made by hand, to see how dict does it."""

KINDS = ["bolt", "nut", "washer", "spring", "kingpin", "valve", "gear", "chain", "rotor", "sprocket"]


def stock_parts(count):
    """count different part names, the way Neil's parts list writes them."""
    return [f"{KINDS[number % len(KINDS)]}-{number // len(KINDS) + 1}" for number in range(count)]


# The rule for which pile a name goes in: times thirty-one, add the next letter,
# and keep the remainder by 1,000,003. Thirty-one because it's prime. Java's
# strings hash with the same number.
def part_hash(name):
    number = 0
    for character in name:
        number = (number * 31 + ord(character)) % 1_000_003
    return number


class HashMap:
    """Names and values, filed in piles by part_hash, every probe counted."""
    # Start with empty piles, a count, and no probes
    # Which pile: the hash, remainder by the number of piles
    # Look along that pile, a probe per comparison
    # put: already there? Replace its pair where it stands
    #      a new one goes on the end of its pile, and is counted
    #      too full? Double the piles
    # Doubling: twice the piles, and everything moved to its new pile
    # get, remove, __contains__, __len__ and load


if __name__ == "__main__":
    parts = stock_parts(200)
