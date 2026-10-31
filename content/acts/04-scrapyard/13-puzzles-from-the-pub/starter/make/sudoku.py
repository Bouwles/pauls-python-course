"""Sudoku Solver: Yahya's puzzle book, solved by backtracking."""

PUZZLE_FILE = "puzzles.txt"

# The last three sudokus in Yahya's puzzle book. No answers in the back.


def read_puzzles(text):
    """Every puzzle in text: nine lines of nine, . or 0 for a blank. Nine rows of nine numbers each."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if len(lines) % 9 != 0:
        raise ValueError(f"{len(lines)} lines isn't a whole number of puzzles")
    puzzles = []
    for first in range(0, len(lines), 9):
        grid = []
        for line in lines[first:first + 9]:
            if len(line) != 9 or any(square not in ".0123456789" for square in line):
                raise ValueError(f"{line!r} isn't a row of a sudoku")
            grid.append([0 if square == "." else int(square) for square in line])
        puzzles.append(grid)
    return puzzles


def can_place(grid, row, col, digit):
    """True if digit isn't already in the square's row, its column or its 3 by 3 box."""


def next_blank(grid):
    """The first blank square, reading along each row from the top, or None if there isn't one."""


def solve(grid):
    """Fill every blank so the puzzle is solved, and give back True; or give back False, grid as it was."""
    # No blank left: that's a solution
    # Try each digit in turn in the next blank
    #     Already in its row, column or box: skip it
    #     Write it in, and carry on from the next blank
    #     It led to a solution: pass it back
    #     It didn't: rub it out, and try the next
    # Nothing fits here: go back a square


def show(grid):
    """The grid as nine lines of text, . for a blank, with lines between the boxes."""


if __name__ == "__main__":
    with open(PUZZLE_FILE) as puzzle_file:
        puzzles = read_puzzles(puzzle_file.read())
    for number, grid in enumerate(puzzles, start=1):
        print(f"Puzzle {number}")
        if solve(grid):
            print(show(grid))
        else:
            print("No solution. It can't be done.")
        print()
