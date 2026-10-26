"""Question 1: matching brackets."""

PARTNERS = {")": "(", "]": "[", "}": "{"}


def first_error(text):
    """Where the first bracket problem in text is, or -1 if there isn't one."""
    still_open = []     # positions of brackets not yet closed, innermost last
    for position, character in enumerate(text):
        if character in "([{":
            still_open.append(position)
        elif character in PARTNERS:
            if not still_open or text[still_open[-1]] != PARTNERS[character]:
                return position
            still_open.pop()
    if still_open:
        return still_open[0]
    return -1


if __name__ == "__main__":
    # Tests first: the examples from the question, then my own edge cases.
    assert first_error("[lamp(on]") == 8
    assert first_error("(dusk (dawn)") == 0
    assert first_error("{dusk: [lamp(on)]}") == -1
    assert first_error("") == -1
    assert first_error(")") == 0
    assert first_error("([)]") == 2
    print("All my tests pass.")
