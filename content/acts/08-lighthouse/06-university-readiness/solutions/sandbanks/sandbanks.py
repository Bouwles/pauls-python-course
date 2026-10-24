"""Question 5: sandbanks at low water."""


def bank_size(chart, row, column, counted):
    """How many sand squares join this one, counting each square once."""
    if row < 0 or row >= len(chart) or column < 0 or column >= len(chart[row]):
        return 0
    if chart[row][column] != "#" or (row, column) in counted:
        return 0
    counted.add((row, column))
    return (1
            + bank_size(chart, row - 1, column, counted)
            + bank_size(chart, row + 1, column, counted)
            + bank_size(chart, row, column - 1, counted)
            + bank_size(chart, row, column + 1, counted))


def bank_sizes(chart):
    """The size of every sandbank on the chart, biggest first."""
    counted = set()
    sizes = []
    for row in range(len(chart)):
        for column in range(len(chart[row])):
            if chart[row][column] == "#" and (row, column) not in counted:
                sizes.append(bank_size(chart, row, column, counted))
    return sorted(sizes, reverse=True)


if __name__ == "__main__":
    # Tests first: the examples from the question, then my own edge cases.
    assert bank_sizes(["##..#",
                       "#...#",
                       "..#..",
                       "....."]) == [3, 2, 1]
    assert bank_sizes(["#.",
                       ".#"]) == [1, 1]
    assert bank_sizes([]) == []
    assert bank_sizes(["...."]) == []
    print("All my tests pass.")
