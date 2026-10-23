"""Penhallow's bolt rack: one bolt to a drawer, smallest first."""
import bisect

RACK = [3, 3, 4, 5, 5, 6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 12, 12, 16, 16, 20, 20, 24, 30, 30]


def find_bolt(sizes, size):
    """A drawer holding a bolt of this size, or -1 if there isn't one."""
    # Mark the first and last drawer it could be in
    low = 0
    high = len(sizes) - 1
    # While there's anywhere left to look
    while low <= high:
        # Look in the middle
        middle = (low + high) // 2
        # Found it: say where
        if sizes[middle] == size:
            return middle
        # Too small: throw away the middle and everything before it
        if sizes[middle] < size:
            low = middle + 1
        # Too big: throw away the middle and everything after it
        else:
            high = middle - 1
    # Nowhere left: say so
    return -1


def count_between(sizes, low, high):
    """How many bolts are from low to high mm, both included."""
    if low > high:
        return 0
    return bisect.bisect_right(sizes, high) - bisect.bisect_left(sizes, low)


def add_bolt(sizes, size):
    """Put a bolt in the rack in order, after any the same size. Returns its drawer."""
    drawer = bisect.bisect_right(sizes, size)
    sizes.insert(drawer, size)
    return drawer


if __name__ == "__main__":
    print(f"Rack: {len(RACK)} drawers, {RACK[0]} mm to {RACK[-1]} mm")
    for size in [16, 7]:
        drawer = find_bolt(RACK, size)
        if drawer == -1:
            print(f"{size} mm: none in the rack")
        else:
            print(f"{size} mm: drawer {drawer}")
    print(f"6 mm to 10 mm: {count_between(RACK, 6, 10)} bolts")
    print(f"New 11 mm bolt: drawer {add_bolt(RACK, 11)}")
