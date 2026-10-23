"""Nell's spares check, and what the pier will do to it."""
import math
import time

YARD_FILE = "yard.txt"
PIER_PARTS = 10_000


# Spares check, from Penhallow's stock program.
# Compares every part with every part after it. Fine for two hundred parts;
# if Nell ever has two thousand, find another way.
#
# The machine on the hill gets slower every night, because it remembers
# every night before. I could make it forget. I haven't the heart. A.P.
def spares(parts):
    found = set()
    for first in range(len(parts)):
        for second in range(first + 1, len(parts)):
            if parts[first] == parts[second]:
                found.add(parts[first])
    return sorted(found)


if __name__ == "__main__":
    with open(YARD_FILE) as yard_file:
        parts = [line.strip() for line in yard_file if line.strip()]
    print(f"Yard today: {len(parts)} parts")

    # Read the clock

    # Do the job, once

    # Read the clock again and subtract

    # Scale up for the size you care about
