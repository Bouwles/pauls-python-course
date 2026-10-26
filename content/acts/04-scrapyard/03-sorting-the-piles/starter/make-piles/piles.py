"""Sorting Visualiser, part one: two sorts by hand, and a pile drawn as bars."""


def draw(pile):
    """The pile as bars, one line per weight: the weight, then a # for each kilo."""


def selection_sort(weights, frames=None):
    """Sort weights in place: the lightest of the rest goes next, one swap per pass.

    If frames is a list, a copy of the pile goes on it after every pass.
    """


def insertion_sort(weights, frames=None):
    """Sort weights in place: slide each one left past every heavier one.

    If frames is a list, a copy of the pile goes on it after every pass.
    """
    # Take each one in turn, from the second
    # Pick it up
    # While the one to its left is heavier, move that one right
    # Put it down in the gap


if __name__ == "__main__":
    pile = [7, 3, 9, 3, 1, 12, 5]
    print(draw(pile))
    for sort in [selection_sort, insertion_sort]:
        frames = []
        sort(list(pile), frames)
        print()
        print(f"{sort.__name__}: {len(frames)} passes")
        print(draw(frames[-1]))
