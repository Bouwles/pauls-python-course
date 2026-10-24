"""Question 1: matching brackets."""


def first_error(text):
    """Where the first bracket problem in text is, or -1 if there isn't one."""
    pass


if __name__ == "__main__":
    # Tests first: the examples from the question, then your own edge cases.
    assert first_error("[lamp(on]") == 8
    assert first_error("(dusk (dawn)") == 0
    print("All my tests pass.")
