"""Question 6: the ferry's load limit."""


def crossings_needed(crates, limit):
    """How many crossings the crates take, in order, with no more than limit kg on each."""
    crossings = 1
    load = 0
    for weight in crates:
        if load + weight > limit:
            crossings += 1
            load = 0
        load += weight
    return crossings


def smallest_limit(crates, days):
    """The smallest load limit that gets every crate across in days crossings or fewer."""
    if not crates:
        return 0
    low = max(crates)       # it has to carry the heaviest crate
    high = sum(crates)      # everything in one crossing: always enough
    while low < high:
        middle = (low + high) // 2
        if crossings_needed(crates, middle) <= days:
            high = middle       # middle works: the answer is middle or lighter
        else:
            low = middle + 1    # middle doesn't: the answer is heavier
    return low


if __name__ == "__main__":
    # Tests first: the examples from the question, then my own edge cases.
    assert smallest_limit([4, 8, 3, 5, 6], 3) == 11
    assert smallest_limit([4, 8, 3, 5, 6], 5) == 8
    assert smallest_limit([], 3) == 0
    assert smallest_limit([7], 1) == 7
    assert smallest_limit([4, 8, 3, 5, 6], 1) == 26
    print("All my tests pass.")
