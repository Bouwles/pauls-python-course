"""Merge sort for Nell's piles: stable, and O(n log n) whatever order they arrive in."""
import random
import time

KINDS = ["anchor-shackle", "bike-bell", "clock-spring", "gear-12t", "hubcap", "kettle-element",
         "lamp-lens", "mangle-roller", "pram-wheel", "spring-coil", "valve-brass", "winch-handle"]


def pier_lot(count, seed=1):
    """The pier's parts as (name, kg) pairs, in the order they come off the lorry."""
    lorry = random.Random(seed)
    return [(lorry.choice(KINDS), lorry.randint(1, 40)) for _ in range(count)]


if __name__ == "__main__":
    yard = [("hubcap", 4), ("kettle-element", 2), ("spring-coil", 4), ("gear-12t", 1)]
    print(yard)
