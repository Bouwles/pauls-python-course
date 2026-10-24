"""Weighing Nell's junk tower, and packing the lorry."""
import functools

# A crate is a list. A number in it is a part, in kilos; a list in it is a crate inside.
PIER_TOWER = [4, [2, 3], [1, [5, [6]]]]


def weigh(crate):
    """Total kilos of every part in the crate, however deep."""
    total = 0
    for thing in crate:
        if isinstance(thing, list):
            total = total + weigh(thing)
        else:
            total = total + thing
    return total


def count_parts(crate):
    """How many parts are in the crate, however deep."""
    count = 0
    for thing in crate:
        if isinstance(thing, list):
            count = count + count_parts(thing)
        else:
            count = count + 1
    return count


def depth(crate):
    """How many crates deep: 1 for a crate with no crates inside."""
    deepest_inside = 0
    for thing in crate:
        if isinstance(thing, list):
            deepest_inside = max(deepest_inside, depth(thing))
    return 1 + deepest_inside


# Lorry packer, from Penhallow's stock program, now with a memory.
@functools.cache
def packings(length):
    """How many ways to fill a bed length metres long with 1 m and 2 m crates."""
    if length < 0:
        return 0
    if length == 0:
        return 1
    return packings(length - 1) + packings(length - 2)


if __name__ == "__main__":
    print(f"Tower: {weigh(PIER_TOWER)} kg in {count_parts(PIER_TOWER)} parts, {depth(PIER_TOWER)} crates deep")
    print(f"12 m lorry: {packings(12)} packings")
    print(f"40 m ferry deck: {packings(40)} packings")
