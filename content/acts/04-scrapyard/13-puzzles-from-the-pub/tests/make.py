PUZZLE_ONE = """..72.169.
.3..5...8
..26397.5
.......6.
29.3.....
6...178..
...1..98.
8..4.3..2
5...684.7"""

SOLVED_ONE = [
    [4, 5, 7, 2, 8, 1, 6, 9, 3],
    [9, 3, 6, 7, 5, 4, 2, 1, 8],
    [1, 8, 2, 6, 3, 9, 7, 4, 5],
    [7, 1, 5, 8, 9, 2, 3, 6, 4],
    [2, 9, 8, 3, 4, 6, 5, 7, 1],
    [6, 4, 3, 5, 1, 7, 8, 2, 9],
    [3, 7, 4, 1, 2, 5, 9, 8, 6],
    [8, 6, 9, 4, 7, 3, 1, 5, 2],
    [5, 2, 1, 9, 6, 8, 4, 3, 7],
]

HARD = """2.5......
..3..6..5
16..2.7..
.16.3...7
..47...5.
....5.2.4
......3.2
.328..54.
....73..."""

SHOWN_ONE = """. . 7 | 2 . 1 | 6 9 .
. 3 . | . 5 . | . . 8
. . 2 | 6 3 9 | 7 . 5
------+-------+------
. . . | . . . | . 6 .
2 9 . | 3 . . | . . .
6 . . | . 1 7 | 8 . .
------+-------+------
. . . | 1 . . | 9 8 .
8 . . | 4 . 3 | . . 2
5 . . | . 6 8 | 4 . 7"""


def grid_of(text):
    return [[0 if square == "." else int(square) for square in line] for line in text.splitlines() if line.strip()]


def valid_solution(puzzle, grid, what):
    for row in range(9):
        for col in range(9):
            if puzzle[row][col] and grid[row][col] != puzzle[row][col]:
                raise CheckFailed(f"{what}: the given {puzzle[row][col]} at {(row, col)} was changed.")
    groups = [grid[row] for row in range(9)]
    groups += [[grid[row][col] for row in range(9)] for col in range(9)]
    groups += [[grid[row][col] for row in range(box_row, box_row + 3) for col in range(box_col, box_col + 3)]
               for box_row in (0, 3, 6) for box_col in (0, 3, 6)]
    for group in groups:
        if sorted(group) != list(range(1, 10)):
            raise CheckFailed(f"{what}: every row, column and box should hold 1 to 9 once each.", actual=str(group))


def solves_one(ctx):
    grid = grid_of(PUZZLE_ONE)
    if ctx.module().solve(grid) is not True:
        raise CheckFailed("solve should give back True for a puzzle it can solve.")
    if grid != SOLVED_ONE:
        raise CheckFailed("solve should fill the blanks of the grid it's given, in place.", expected=str(SOLVED_ONE[0]), actual=str(grid[0]))


def solves_hard(ctx):
    puzzle = grid_of(HARD)
    grid = [row[:] for row in puzzle]
    if ctx.module().solve(grid) is not True:
        raise CheckFailed("This puzzle has a solution, with only 28 squares given.")
    valid_solution(puzzle, grid, "A harder puzzle")


def cant_be_done(ctx):
    puzzle = grid_of(PUZZLE_ONE)
    puzzle[3][0] = 4
    grid = [row[:] for row in puzzle]
    if ctx.module().solve(grid) is not False:
        raise CheckFailed("With a 4 put in the first column, the top left square has nothing that fits: solve should give back False.")
    if grid != puzzle:
        raise CheckFailed("When there's no solution, every digit solve wrote in should be rubbed out again.")


def stuck_late(ctx):
    puzzle = grid_of(PUZZLE_ONE)
    puzzle[8][1] = 0
    puzzle[8][2] = 0
    puzzle[0][0] = 4
    puzzle[7][1] = 1
    grid = [row[:] for row in puzzle]
    got = ctx.module().solve(grid)
    if got is not False or grid != puzzle:
        raise CheckFailed("This one only fails near the bottom, after many squares are filled. solve should give back False and leave the grid exactly as it was.",
                          expected="False, the grid unchanged", actual=f"{got}, {'unchanged' if grid == puzzle else 'changed'}")


def already_solved(ctx):
    grid = [row[:] for row in SOLVED_ONE]
    if ctx.module().solve(grid) is not True or grid != SOLVED_ONE:
        raise CheckFailed("A grid with no blanks is solved already: True, and nothing changed.")


def one_blank(ctx):
    grid = [row[:] for row in SOLVED_ONE]
    grid[4][4] = 0
    if ctx.module().solve(grid) is not True or grid[4][4] != 4:
        raise CheckFailed("With one blank, solve should fill it with the only digit that fits.", expected=4, actual=grid[4][4])


def places(row, col, digit, expected, message):
    def check(ctx):
        got = ctx.module().can_place(grid_of(PUZZLE_ONE), row, col, digit)
        if got is not expected:
            raise CheckFailed(message, expected=expected, actual=got)
    return check


def blanks(ctx):
    module = ctx.module()
    first = module.next_blank(grid_of(PUZZLE_ONE))
    if first != (0, 0):
        raise CheckFailed("The first blank of puzzle one is the top left square.", expected=(0, 0), actual=first)
    grid = [row[:] for row in SOLVED_ONE]
    grid[5][3] = 0
    grid[7][0] = 0
    if module.next_blank(grid) != (5, 3):
        raise CheckFailed("Read along each row from the top: (5, 3) comes before (7, 0).", expected=(5, 3), actual=module.next_blank(grid))
    if module.next_blank([row[:] for row in SOLVED_ONE]) is not None:
        raise CheckFailed("A grid with no blanks has no next blank: None.")


def shows(ctx):
    got = ctx.module().show(grid_of(PUZZLE_ONE))
    if got != SHOWN_ONE:
        raise CheckFailed("show draws the grid with a space between squares, | between boxes and a line of ------+-------+------ between bands.",
                          expected=SHOWN_ONE, actual=got)


ROUND = """Puzzle 1
4 5 7 | 2 8 1 | 6 9 3
9 3 6 | 7 5 4 | 2 1 8
1 8 2 | 6 3 9 | 7 4 5
------+-------+------
7 1 5 | 8 9 2 | 3 6 4
2 9 8 | 3 4 6 | 5 7 1
6 4 3 | 5 1 7 | 8 2 9
------+-------+------
3 7 4 | 1 2 5 | 9 8 6
8 6 9 | 4 7 3 | 1 5 2
5 2 1 | 9 6 8 | 4 3 7

Puzzle 2
3 5 8 | 7 2 9 | 1 6 4
9 7 2 | 4 6 1 | 3 8 5
1 4 6 | 5 8 3 | 9 2 7
------+-------+------
4 8 1 | 2 3 5 | 7 9 6
7 6 9 | 8 1 4 | 5 3 2
5 2 3 | 6 9 7 | 4 1 8
------+-------+------
8 3 4 | 9 5 2 | 6 7 1
2 9 5 | 1 7 6 | 8 4 3
6 1 7 | 3 4 8 | 2 5 9

Puzzle 3
No solution. It can't be done."""

TESTS = [
    custom("Puzzle one, solved", solves_one, visible=True),
    output("Yahya's three puzzles", expect=ROUND, visible=True),
    custom("Already in the row", places(0, 0, 7, False, "7 is already in the top row, so it can't go in the top left square.")),
    custom("Already in the column", places(0, 0, 8, False, "8 is already in the first column."),
           hint="Look down the whole column, every row from 0 to 8."),
    custom("Already in the box", places(0, 0, 3, False, "3 is already in the top left box, at (1, 1)."),
           hint="The box starts at row // 3 * 3 and col // 3 * 3, and is three squares each way."),
    custom("Free to go", places(0, 0, 4, True, "4 isn't in the top row, the first column or the top left box.")),
    custom("Finding the next blank", blanks),
    custom("A harder puzzle", solves_hard),
    custom("One that can't be done", cant_be_done,
           hint="When no digit fits, give back False. The digits written in on the way have to be rubbed out as each try fails."),
    custom("One that fails late", stuck_late,
           hint="Every digit written in on a branch that fails has to be set back to 0 before the next digit is tried."),
    custom("Solved already", already_solved, hint="No blank at all means it's solved: give back True straight away."),
    custom("One blank left", one_blank),
    custom("The grid drawn", shows),
]
