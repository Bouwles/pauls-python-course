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


def missing(grid, words):
    """The words that aren't in the grid, in the order given."""


if __name__ == "__main__":
    not_there = missing(GRID, WORDS)
    print(f"In the grid: {len(WORDS) - len(not_there)} of {len(WORDS)}")
    print(f"Not in the grid: {', '.join(not_there)}")
