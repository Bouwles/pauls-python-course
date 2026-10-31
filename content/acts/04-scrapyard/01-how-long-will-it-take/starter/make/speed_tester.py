"""Speed Tester: how the work grows as the pile grows, for Paul's spares check."""
import math
import time

STOCK_FILE = "stock.txt"
LOT_PARTS = 10_000
GROWTHS = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)"]
BAR_WIDTH = 40


# Spares check, from Paul's stock script.
# Compares every part with every part after it. Fine for two hundred parts;
# if the store room ever holds two thousand, find another way.
def spares(parts):
    found = set()
    for first in range(len(parts)):
        for second in range(first + 1, len(parts)):
            if parts[first] == parts[second]:
                found.add(parts[first])
    return sorted(found)


def spares_by_pairs(parts):
    """Paul's way: compare every part with every part after it.

    Returns (spares, comparisons).
    """


def spares_by_set(parts):
    """One pass, remembering what has been seen. Returns (spares, lookups)."""


def time_once(function, data):
    """Seconds taken by function(data), run once."""
    # Read the clock
    # Do the job, once
    # Read the clock again and subtract


def scale(n_now, n_later, growth):
    """How many times more work n_later items take than n_now, for this growth."""


def guess_growth(n, steps_n, steps_2n):
    """The growth whose scale from n to 2n comes closest to what was measured."""
    # Check the ratio against the growth you expect


def chart(sizes, values):
    """A bar chart as text: one line per size, the biggest bar BAR_WIDTH long."""


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
    print(f"Store room today: {len(parts)} parts, {len(found)} kinds with spares")

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
    print(f"By pairs today: {today:.4f} s. With the clockmaker's lot: about {with_lot:.1f} s, every time a part comes in.")
