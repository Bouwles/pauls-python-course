"""Sorting Visualiser, part one: two sorts by hand, and a pile drawn as bars."""


def draw(pile):
    """The pile as bars, one line per weight: the weight, then a # for each kilo."""
    return "\n".join(f"{weight:>3} {'#' * weight}" for weight in pile)


def selection_sort(weights, frames=None):
    """Sort weights in place: the lightest of the rest goes next, one swap per pass.

    If frames is a list, a copy of the pile goes on it after every pass.
    """
    for start in range(len(weights) - 1):
        lightest = start
        for position in range(start + 1, len(weights)):
            if weights[position] < weights[lightest]:
                lightest = position
        weights[start], weights[lightest] = weights[lightest], weights[start]
        if frames is not None:
            frames.append(list(weights))


def insertion_sort(weights, frames=None):
    """Sort weights in place: slide each one left past every heavier one.

    If frames is a list, a copy of the pile goes on it after every pass.
    """
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
        if frames is not None:
            frames.append(list(weights))


if __name__ == "__main__":
    pile = [7, 3, 9, 3, 1, 12, 5]
    print(draw(pile))
    for sort in [selection_sort, insertion_sort]:
        frames = []
        sort(list(pile), frames)
        print()
        print(f"{sort.__name__}: {len(frames)} passes")
        print(draw(frames[-1]))
