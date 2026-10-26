"""Question 6: the ferry's load limit."""


def smallest_limit(crates, days):
    """The smallest load limit that gets every crate across in days crossings or fewer."""
    pass


if __name__ == "__main__":
    # Tests first: the examples from the question, then your own edge cases.
    assert smallest_limit([4, 8, 3, 5, 6], 3) == 11
    assert smallest_limit([4, 8, 3, 5, 6], 5) == 8
    print("All my tests pass.")
