"""Sorting Visualiser, part one: two sorts by hand, and a pile of laps drawn as bars."""


def draw(pile):
    """The pile as bars, one line per lap: its tenths off the record, then a # for each tenth."""
    return "\n".join(f"{lap:>3} {'#' * lap}" for lap in pile)


def selection_sort(laps, frames=None):
    """Sort laps in place: the fastest of the rest goes next, one swap per pass.

    If frames is a list, a copy of the pile goes on it after every pass.
    """
    for start in range(len(laps) - 1):
        fastest = start
        for position in range(start + 1, len(laps)):
            if laps[position] < laps[fastest]:
                fastest = position
        laps[start], laps[fastest] = laps[fastest], laps[start]
        if frames is not None:
            frames.append(list(laps))


def insertion_sort(laps, frames=None):
    """Sort laps in place: slide each one left past every slower one.

    If frames is a list, a copy of the pile goes on it after every pass.
    """
    # Take each one in turn, from the second
    for position in range(1, len(laps)):
        # Pick it up
        current = laps[position]
        slot = position
        # While the one to its left is slower, move that one right
        while slot > 0 and laps[slot - 1] > current:
            laps[slot] = laps[slot - 1]
            slot = slot - 1
        # Put it down in the gap
        laps[slot] = current
        if frames is not None:
            frames.append(list(laps))


if __name__ == "__main__":
    pile = [7, 3, 9, 3, 1, 12, 5]
    print(draw(pile))
    for sort in [selection_sort, insertion_sort]:
        frames = []
        sort(list(pile), frames)
        print()
        print(f"{sort.__name__}: {len(frames)} passes")
        print(draw(frames[-1]))
