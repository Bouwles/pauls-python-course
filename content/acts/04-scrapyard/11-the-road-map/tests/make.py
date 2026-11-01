SMALL = """S.#
..#
#.G"""

MAZE_OUTPUT = """Start to goal: 19 steps
S.....#.......#.....
*####.#.......#.###.
*#....#..###....#...
*#.####..#G..####.#.
*#.......#*#......#.
*######..#*#.####.#.
***********.....#.#.
.####.#######.#.#...
......#.#...#.#...#.
Depth first reaches 111 tiles
Cut off: (8, 7), (8, 9), (8, 10), (8, 11)"""


def grid_of(text):
    return [line for line in text.splitlines() if line.strip()]


def the_maze(ctx):
    return grid_of(ctx.files["maze.txt"])


def valid_path(grid, path, start, goal, steps, what):
    if not isinstance(path, list) or not path:
        raise CheckFailed(f"{what} should give back a list of tiles.", actual=repr(path))
    if tuple(path[0]) != start or tuple(path[-1]) != goal:
        raise CheckFailed(f"{what} should start at {start} and end at {goal}.", actual=f"{path[0]} to {path[-1]}")
    for one, other in zip(path, path[1:]):
        if abs(one[0] - other[0]) + abs(one[1] - other[1]) != 1:
            raise CheckFailed(f"{what} jumps from {one} to {other}. Each step goes up, down, left or right.")
    for row, col in path:
        if grid[row][col] == "#":
            raise CheckFailed(f"{what} goes through a wall at {(row, col)}.")
    if len(path) - 1 != steps:
        raise CheckFailed(f"{what} isn't the shortest way.", expected=f"{steps} steps", actual=f"{len(path) - 1} steps")


def maze_path(ctx):
    grid = the_maze(ctx)
    valid_path(grid, ctx.module().shortest_path(grid, (0, 0), (3, 10)), (0, 0), (3, 10), 19, "The way from the start to the goal")


def small_path(ctx):
    grid = grid_of(SMALL)
    valid_path(grid, ctx.module().shortest_path(grid, (0, 0), (2, 2)), (0, 0), (2, 2), 4, "The way through the small maze")


def tied_paths(ctx):
    grid = grid_of("S...\n.#..\n...G")
    valid_path(grid, ctx.module().shortest_path(grid, (0, 0), (2, 3)), (0, 0), (2, 3), 5, "Through a maze with two ways round")


def open_field(ctx):
    grid = ["." * 30 for _ in range(30)]
    valid_path(grid, ctx.module().shortest_path(grid, (0, 0), (29, 29)), (0, 0), (29, 29), 58, "Across thirty by thirty open tiles")


def no_way(ctx):
    grid = grid_of("S#.\n##.\n..G")
    got = ctx.module().shortest_path(grid, (0, 0), (2, 2))
    if got is not None:
        raise CheckFailed("When the goal can't be reached, shortest_path gives back None.", expected=None, actual=got)


def already_there(ctx):
    grid = grid_of(SMALL)
    got = ctx.module().shortest_path(grid, (1, 1), (1, 1))
    if got != [(1, 1)]:
        raise CheckFailed("From a tile to itself is a path of one tile.", expected=[(1, 1)], actual=got)


def explores(text, start, expected):
    def check(ctx):
        got = ctx.module().explore(grid_of(text), start)
        if [tuple(tile) for tile in (got or [])] != expected:
            raise CheckFailed("explore should list tiles in the order a depth-first walk first reaches them: up, down, left, right, as deep as it can go first.",
                              expected=expected, actual=got)
    return check


def maze_round(ctx):
    got = ctx.module().explore(the_maze(ctx), (0, 0))
    if len(got or []) != 111 or len(set(map(tuple, got))) != 111:
        raise CheckFailed("From the start, depth first reaches 111 tiles, each once.", expected=111, actual=len(got or []))


def maze_cut_off(ctx):
    got = ctx.module().unreachable(the_maze(ctx), (0, 0))
    expected = [(8, 7), (8, 9), (8, 10), (8, 11)]
    if [tuple(tile) for tile in (got or [])] != expected:
        raise CheckFailed("Four tiles at the bottom can't be reached from the start.", expected=expected, actual=got)


def nothing_cut_off(ctx):
    got = ctx.module().unreachable(grid_of(SMALL), (0, 0))
    if got != []:
        raise CheckFailed("Every open tile in the small maze can be reached.", expected=[], actual=got)


def drawn(ctx):
    got = ctx.module().draw_path(grid_of(SMALL), [(0, 0), (1, 0), (1, 1), (2, 1), (2, 2)])
    expected = ["S.#", "**#", "#*G"]
    if got != expected:
        raise CheckFailed("draw_path puts * on the path's tiles, and leaves S, G and everything else as it was.", expected=expected, actual=got)


def drawn_without_path(ctx):
    got = ctx.module().draw_path(grid_of(SMALL), None)
    if got != grid_of(SMALL):
        raise CheckFailed("With no path, the maze is drawn as it is.", expected=grid_of(SMALL), actual=got)


TESTS = [
    function("Neighbours in the small maze", call="neighbours", args=(grid_of(SMALL), (1, 1)), expect=[(0, 1), (2, 1), (1, 0)], visible=True),
    output("Neil's car park, solved", expect=MAZE_OUTPUT, visible=True),
    function("Neighbours in a corner", call="neighbours", args=(grid_of(SMALL), (0, 0)), expect=[(1, 0), (0, 1)],
             hint="Tiles off the edge of the maze aren't neighbours. Check the row and column are inside it before you look."),
    function("Neighbours at the bottom edge", call="neighbours", args=(grid_of(SMALL), (2, 2)), expect=[(2, 1)]),
    function("Neighbours in order", call="neighbours", args=(["...", "...", "..."], (1, 1)), expect=[(0, 1), (2, 1), (1, 0), (1, 2)],
             hint="Up, down, left, right: in that order, every time."),
    custom("The way to the goal", maze_path),
    custom("A small maze", small_path),
    custom("Two ways round", tied_paths),
    custom("Thirty by thirty, wide open", open_field),
    custom("No way through", no_way, hint="If the queue runs out before the goal comes off it, there's no way: None."),
    custom("Already there", already_there),
    custom("Depth first on a small maze", explores(SMALL, (0, 0), [(0, 0), (1, 0), (1, 1), (0, 1), (2, 1), (2, 2)]),
           hint="Note a tile, then go down each new neighbour in turn, as far as it goes, before trying the next."),
    custom("Depth first on an open square", explores("...\n...", (0, 0), [(0, 0), (1, 0), (1, 1), (0, 1), (0, 2), (1, 2)])),
    custom("Depth first round the maze", maze_round),
    custom("What's cut off in the maze", maze_cut_off,
           hint="Every open tile, ., S or G, that explore doesn't reach, in order, row by row."),
    custom("Nothing cut off", nothing_cut_off),
    custom("The path drawn", drawn),
    custom("No path to draw", drawn_without_path),
]
