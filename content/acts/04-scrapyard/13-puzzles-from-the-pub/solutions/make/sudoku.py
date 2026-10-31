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
    if digit in grid[row]:
        return False
    for other_row in range(9):
        if grid[other_row][col] == digit:
            return False
    box_row = row // 3 * 3
    box_col = col // 3 * 3
    for other_row in range(box_row, box_row + 3):
        for other_col in range(box_col, box_col + 3):
            if grid[other_row][other_col] == digit:
                return False
    return True


def next_blank(grid):
    """The first blank square, reading along each row from the top, or None if there isn't one."""
    for row in range(9):
        for col in range(9):
            if grid[row][col] == 0:
                return row, col
    return None


def solve(grid):
    """Fill every blank so the puzzle is solved, and give back True; or give back False, grid as it was."""
    # No blank left: that's a solution
    blank = next_blank(grid)
    if blank is None:
        return True
    row, col = blank
    # Try each digit in turn in the next blank
    for digit in range(1, 10):
        # Already in its row, column or box: skip it
        if not can_place(grid, row, col, digit):
            continue
        # Write it in, and carry on from the next blank
        grid[row][col] = digit
        # It led to a solution: pass it back
        if solve(grid):
            return True
        # It didn't: rub it out, and try the next
        grid[row][col] = 0
    # Nothing fits here: go back a square
    return False


def show(grid):
    """The grid as nine lines of text, . for a blank, with lines between the boxes."""
    lines = []
    for row in range(9):
        if row in (3, 6):
            lines.append("------+-------+------")
        squares = ["." if digit == 0 else str(digit) for digit in grid[row]]
        lines.append(" | ".join(" ".join(squares[col:col + 3]) for col in (0, 3, 6)))
    return "\n".join(lines)


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
