"""Gwen's picture round: which words are in the grid, and which aren't."""

# Picture round, for Gwen's quiz, 1994. Ten words; three aren't in the grid,
# and that's the puzzle. If I'm not back by the next quiz, Tom knows where
# the answers are. A.P.
GRID = [
    "FERCRA",
    "TYRBAN",
    "IDGULC",
    "KEWLLH",
    "ELLASO",
    "OPAMPR",
]

WORDS = ["FERRY", "CRAB", "ANCHOR", "TIDE", "KELP", "WHELK", "GULL", "BUOY", "LAMP", "ROPE"]


def find_word(grid, word):
    """The squares that spell word, as (row, col) pairs, or None."""
    path = []

    def follow(row, col):
        if not (0 <= row < len(grid) and 0 <= col < len(grid[row])):
            return False
        if (row, col) in path or grid[row][col] != word[len(path)]:
            return False
        path.append((row, col))
        if len(path) == len(word):
            return True
        for next_row, next_col in ((row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)):
            if follow(next_row, next_col):
                return True
        path.pop()
        return False

    if not word:
        return []
    for row in range(len(grid)):
        for col in range(len(grid[row])):
            if follow(row, col):
                return path
    return None


def missing(grid, words):
    """The words that aren't in the grid, in the order given."""
    return [word for word in words if find_word(grid, word) is None]


if __name__ == "__main__":
    not_there = missing(GRID, WORDS)
    print(f"In the grid: {len(WORDS) - len(not_there)} of {len(WORDS)}")
    print(f"Not in the grid: {', '.join(not_there)}")
