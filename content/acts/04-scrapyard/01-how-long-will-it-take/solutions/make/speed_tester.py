"""Speed Tester: how the work grows as the pile grows, for Neil's spares check."""
import math
import time

STOCK_FILE = "stock.txt"
LOT_PARTS = 10_000
GROWTHS = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)"]
BAR_WIDTH = 40


# Spares check, from Neil's parts script.
# Compares every part with every part after it. Fine for the two hundred in
# the drawers; if the kart track's lot ever turns up, find another way.
def spares(parts):
    found = set()
    for first in range(len(parts)):
        for second in range(first + 1, len(parts)):
            if parts[first] == parts[second]:
                found.add(parts[first])
    return sorted(found)


def spares_by_pairs(parts):
    """Neil's way: compare every part with every part after it.

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


def time_once(function, data):
    """Seconds taken by function(data), run once."""
    # Read the clock
    start = time.perf_counter()
    # Do the job, once
    function(data)
    # Read the clock again and subtract
    return time.perf_counter() - start


def scale(n_now, n_later, growth):
    """How many times more work n_later items take than n_now, for this growth."""
    if growth == "O(1)":
        return 1
    elif growth == "O(log n)":
        return math.log(n_later) / math.log(n_now)
    elif growth == "O(n)":
        return n_later / n_now
    elif growth == "O(n log n)":
        return (n_later * math.log(n_later)) / (n_now * math.log(n_now))
    elif growth == "O(n^2)":
        return (n_later / n_now) ** 2
    else:
        raise ValueError(f"unknown growth {growth}")


def guess_growth(n, steps_n, steps_2n):
    """The growth whose scale from n to 2n comes closest to what was measured."""
    # Check the ratio against the growth you expect
    measured = steps_2n / steps_n
    best = GROWTHS[0]
    for growth in GROWTHS:
        if abs(scale(n, 2 * n, growth) - measured) < abs(scale(n, 2 * n, best) - measured):
            best = growth
    return best


def chart(sizes, values):
    """A bar chart as text: one line per size, the biggest bar BAR_WIDTH long."""
    biggest = max(values)
    lines = []
    for size, value in zip(sizes, values):
        length = round(value / biggest * BAR_WIDTH) if biggest > 0 else 0
        bar = "#" * length
        lines.append(f"{size:>6} | {bar:<{BAR_WIDTH}} {value}")
    return "\n".join(lines)


def report(title, sizes, values):
    """Print one chart, and the growth it looks like."""
    print()
    print(title)
    print(chart(sizes, values))
    growth = guess_growth(sizes[-2], values[-2], values[-1])
    print(f"Growth: {growth}")
    return growth


if __name__ == "__main__":
    with open(STOCK_FILE) as stock_file:
        parts = [line.strip() for line in stock_file if line.strip()]
    found, lookups = spares_by_set(parts)
    print(f"Parts drawers today: {len(parts)} parts, {len(found)} kinds with spares")

    sizes = [200, 400, 800]
    stocks = [[f"part-{number}" for number in range(n)] for n in sizes]
    report("By pairs, comparisons:", sizes, [spares_by_pairs(stock)[1] for stock in stocks])
    report("By set, lookups:", sizes, [spares_by_set(stock)[1] for stock in stocks])
    seconds = [round(time_once(spares_by_pairs, stock), 4) for stock in stocks]
    growth = report("By pairs, seconds:", sizes, seconds)

    # Scale up for the size you care about
    today = time_once(spares_by_pairs, parts)
    with_lot = today * scale(len(parts), len(parts) + LOT_PARTS, growth)
    print()
    print(f"By pairs today: {today:.4f} s. With the track's lot: about {with_lot:.1f} s, every time a part comes in.")
