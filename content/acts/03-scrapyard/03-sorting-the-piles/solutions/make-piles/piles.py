"""Two ways to sort Nell's piles by hand, lightest first."""


def selection_sort(weights):
    """Sort weights in place: the lightest of the rest goes next, one swap per pass."""
    for start in range(len(weights) - 1):
        lightest = start
        for position in range(start + 1, len(weights)):
            if weights[position] < weights[lightest]:
                lightest = position
        weights[start], weights[lightest] = weights[lightest], weights[start]


def insertion_sort(weights):
    """Sort weights in place: slide each one left past every heavier one."""
    # Take each one in turn, from the second
    for position in range(1, len(weights)):
        # Pick it up
        current = weights[position]
        slot = position
        # While the one to its left is heavier, move that one right
        while slot > 0 and weights[slot - 1] > current:
            weights[slot] = weights[slot - 1]
            slot = slot - 1
        # Put it down in the gap
        weights[slot] = current


if __name__ == "__main__":
    pile = [7, 3, 9, 3, 1, 12, 5]
    selection_sort(pile)
    print(pile)
    pile = [7, 3, 9, 3, 1, 12, 5]
    insertion_sort(pile)
    print(pile)
