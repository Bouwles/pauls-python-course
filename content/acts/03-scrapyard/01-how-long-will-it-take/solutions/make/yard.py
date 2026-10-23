"""Nell's spares check, and what the pier will do to it."""
import math
import time

YARD_FILE = "yard.txt"
PIER_PARTS = 10_000


def spares_by_pairs(parts):
    """Penhallow's way: compare every part with every part after it.

    Returns (spares, comparisons).
    """
    found = set()
    comparisons = 0
    for first in range(len(parts)):
        for second in range(first + 1, len(parts)):
            comparisons = comparisons + 1
            if parts[first] == parts[second]:
                found.add(parts[first])
    return sorted(found), comparisons


def spares_by_set(parts):
    """One pass, remembering what has been seen. Returns (spares, lookups)."""
    seen = set()
    found = set()
    lookups = 0
    for part in parts:
        lookups = lookups + 1
        if part in seen:
            found.add(part)
        else:
            seen.add(part)
    return sorted(found), lookups


def growth_ratio(find_spares, n):
    """How many times more steps find_spares takes for 2n parts than for n."""
    _, steps_now = find_spares([f"part-{number}" for number in range(n)])
    _, steps_doubled = find_spares([f"part-{number}" for number in range(2 * n)])
    return round(steps_doubled / steps_now, 1)


def estimate(seconds, n_now, n_later, growth):
    """Scale a time measured with n_now parts up to n_later parts."""
    if growth == "O(1)":
        scale = 1
    elif growth == "O(log n)":
        scale = math.log(n_later) / math.log(n_now)
    elif growth == "O(n)":
        scale = n_later / n_now
    elif growth == "O(n log n)":
        scale = (n_later * math.log(n_later)) / (n_now * math.log(n_now))
    elif growth == "O(n^2)":
        scale = (n_later / n_now) ** 2
    else:
        raise ValueError(f"unknown growth {growth}")
    return seconds * scale


if __name__ == "__main__":
    with open(YARD_FILE) as yard_file:
        parts = [line.strip() for line in yard_file if line.strip()]
    found, comparisons = spares_by_pairs(parts)
    print(f"Yard today: {len(parts)} parts, {len(found)} kinds with spares")
    print(f"By pairs: {comparisons} comparisons, x{growth_ratio(spares_by_pairs, len(parts))} when the yard doubles")
    found, lookups = spares_by_set(parts)
    print(f"By set: {lookups} lookups, x{growth_ratio(spares_by_set, len(parts))} when the yard doubles")

    # Read the clock
    start = time.perf_counter()
    # Do the job, once
    spares_by_pairs(parts)
    # Read the clock again and subtract
    seconds = time.perf_counter() - start
    # Scale up for the size you care about
    with_pier = estimate(seconds, len(parts), len(parts) + PIER_PARTS, "O(n^2)")
    print(f"By pairs took {seconds:.4f} s. With the pier: about {with_pier:.1f} s, every time a part comes in.")
