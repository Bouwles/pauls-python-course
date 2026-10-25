GRID = ["FERCRA", "TYRBAN", "IDGULC", "KEWLLH", "ELLASO", "OPAMPR"]

WORDS = ["FERRY", "CRAB", "ANCHOR", "TIDE", "KELP", "WHELK", "GULL", "BUOY", "LAMP", "ROPE"]

# SETTLE is here, but only for a search that frees the squares a dead end used.
SETTLE = ["ASE", "EET", "TLT"]


def check_path(grid, word, got):
    if not isinstance(got, (list, tuple)):
        raise CheckFailed(f"{word} is in the grid, so find_word should give back a list of squares.", actual=repr(got))
    squares = [tuple(square) for square in got]
    if len(squares) != len(word):
        raise CheckFailed(f"{word} has {len(word)} letters, so it needs {len(word)} squares.", actual=squares)
    for (row, col), letter in zip(squares, word):
        if not (0 <= row < len(grid) and 0 <= col < len(grid[row])) or grid[row][col] != letter:
            raise CheckFailed(f"Square {(row, col)} should hold {letter}.", actual=squares)
    for (row, col), (next_row, next_col) in zip(squares, squares[1:]):
        if abs(row - next_row) + abs(col - next_col) != 1:
            raise CheckFailed(f"{(next_row, next_col)} isn't up, down, left or right of {(row, col)}.", actual=squares)
    if len(set(squares)) != len(squares):
        raise CheckFailed("A square is used twice.", actual=squares)


def found(grid, word):
    def check(ctx):
        module = ctx.module()
        check_path(grid, word, module.find_word(list(grid), word))
    return check


def not_found(grid, word, message):
    def check(ctx):
        module = ctx.module()
        got = module.find_word(list(grid), word)
        if got is not None:
            raise CheckFailed(message, expected="None", actual=repr(got))
    return check


TESTS = [
    custom("FERRY turns a corner", found(GRID, "FERRY"), visible=True),
    function("What's missing", call="missing", args=(GRID, WORDS), expect=["WHELK", "BUOY", "ROPE"], visible=True),
    custom("TIDE", found(GRID, "TIDE")),
    custom("ANCHOR, all the way down", found(GRID, "ANCHOR")),
    custom("LAMP", found(GRID, "LAMP")),
    custom("CRAB doubles back", found(GRID, "CRAB")),
    custom("TIDES", not_found(GRID, "TIDES", "TIDE is there, but there's no S next to its E."),
           hint="Every letter has to be found. Running out of neighbours on the last letter still means the word isn't there."),
    custom("One letter", found(GRID, "W")),
    custom("Not a letter of it", not_found(GRID, "QUIZ", "There's no Q in the grid at all.")),
    custom("No square twice", not_found(["AB", "CD"], "ABA", "The only A next to the B is the one already used."),
           hint="Keep track of the squares the word is using, and don't step on one of them again."),
    custom("SETTLE", found(SETTLE, "SETTLE"),
           hint="When a square leads nowhere, take it off the path again so another try can use it."),
    custom("Longer than the grid", not_found(["AB", "BA"], "ABABA", "Four squares can't spell a five-letter word.")),
    function("Nothing missing", call="missing", args=(GRID, ["GULL", "KELP"]), expect=[]),
    function("Asked twice", call="missing", args=(GRID, ["ROPE", "TIDE", "ROPE"]), expect=["ROPE", "ROPE"]),
]
