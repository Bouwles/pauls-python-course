"""Merge sort for Nell's piles: stable, and O(n log n) whatever order they arrive in."""
import random
import time

KINDS = ["anchor-shackle", "bike-bell", "clock-spring", "gear-12t", "hubcap", "kettle-element",
         "lamp-lens", "mangle-roller", "pram-wheel", "spring-coil", "valve-brass", "winch-handle"]


def pier_lot(count, seed=1):
    """The pier's parts as (name, kg) pairs, in the order they come off the lorry."""
    lorry = random.Random(seed)
    return [(lorry.choice(KINDS), lorry.randint(1, 40)) for _ in range(count)]


def merge(left, right, key):
    """Merge two lists already sorted by key. On a tie, left comes first."""
    # Start an empty pile, and a finger at the front of each
    merged = []
    next_left = 0
    next_right = 0
    # While both piles have parts left
    while next_left < len(left) and next_right < len(right):
        # Take the lighter front part; on a tie, take from the left
        if key(left[next_left]) <= key(right[next_right]):
            merged.append(left[next_left])
            next_left = next_left + 1
        else:
            merged.append(right[next_right])
            next_right = next_right + 1
    # Tip whatever's left on the end
    merged.extend(left[next_left:])
    merged.extend(right[next_right:])
    # Hand back the merged pile
    return merged


def merge_sort(items, key=lambda item: item):
    """A new list of items sorted by key. Stable; items is left as it was."""
    piles = [[item] for item in items]
    while len(piles) > 1:
        merged_piles = []
        for start in range(0, len(piles), 2):
            if start + 1 < len(piles):
                merged_piles.append(merge(piles[start], piles[start + 1], key))
            else:
                merged_piles.append(piles[start])
        piles = merged_piles
    if piles:
        return piles[0]
    return []


def weight_of(part):
    return part[1]


if __name__ == "__main__":
    yard = [("hubcap", 4), ("kettle-element", 2), ("spring-coil", 4), ("gear-12t", 1)]
    print(f"Lightest first: {merge_sort(yard, key=weight_of)}")

    pier = pier_lot(10_000)
    start = time.perf_counter()
    mine = merge_sort(pier, key=weight_of)
    mine_seconds = time.perf_counter() - start
    start = time.perf_counter()
    theirs = sorted(pier, key=weight_of)
    sorted_seconds = time.perf_counter() - start
    print(f"Pier lot: {len(pier)} parts, same order as sorted(): {mine == theirs}")
    print(f"merge_sort: {mine_seconds:.3f} s, sorted(): {sorted_seconds:.3f} s")
