"""Question 5: sandbanks at low water."""


def bank_sizes(chart):
    """The size of every sandbank on the chart, biggest first."""
    pass


if __name__ == "__main__":
    # Tests first: the examples from the question, then your own edge cases.
    assert bank_sizes(["##..#",
                       "#...#",
                       "..#..",
                       "....."]) == [3, 2, 1]
    assert bank_sizes(["#.",
                       ".#"]) == [1, 1]
    print("All my tests pass.")
