"""Nell's junk tower: crates inside crates. A part is a (name, kg) pair; a crate is a list."""

TOWER = [("bell", 1), [("gear", 2), [("anvil", 30)]], ("lamp", 3)]


def total_weight(crate):
    """The weight of every part in the crate, however deep."""
    total = 0
    for thing in crate:
        if isinstance(thing, list):
            total += total_weight(thing)
        else:
            total += thing[1]
    return total


def depth(crate):
    """How many crates deep it goes. A crate with no crates inside is 1."""
    deepest_inside = 0
    for thing in crate:
        if isinstance(thing, list):
            deepest_inside = max(deepest_inside, depth(thing))
    return 1 + deepest_inside


def path_to(crate, name):
    """Positions from the outside crate to the first part called name, or None."""
    for position, thing in enumerate(crate):
        if isinstance(thing, list):
            rest = path_to(thing, name)
            if rest is not None:
                return [position] + rest
        elif thing[0] == name:
            return [position]
    return None


if __name__ == "__main__":
    print(f"Total: {total_weight(TOWER)} kg")
    print(f"Depth: {depth(TOWER)} crates")
    print(f"The anvil: {path_to(TOWER, 'anvil')}")
