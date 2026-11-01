import copy as _copy
import heapq as _heapq
import random as _random

PARK = """\
S.....#.......#.....
.####.#.~~~~~.#.###.
.#....#.~###~...#...
.#.####.~#G.~####.#.
.#......~#.#~.....#.
.######.~#.#~####.#.
........~~.~~...#.#.
.####.#######.#.#...
......#.......#...#.
"""

DRAWN = [
    "v.....#.......#.....",
    "v####.#.~~~~~.#.###.",
    "v#....#.~###~...#...",
    "v#.####.~#G.~####.#.",
    "v#......~#^#~.....#.",
    "v######.~#^#~####.#.",
    ">>>>>>>>>>^~~...#.#.",
    ".####.#######.#.#...",
    "......#.......#...#.",
]

N = None


class TooMany(Exception):
    pass


def quiet(module):
    """Drawings are for Run. The checks switch them off."""
    for name in ("show_grid", "show_graph", "show_search"):
        if hasattr(module, name):
            setattr(module, name, lambda *args, **kwargs: None)
    return module


def counting_neighbours(module, limit):
    original = module.neighbours
    box = {"calls": 0}

    def wrapper(tiles, tile):
        box["calls"] += 1
        if box["calls"] > limit:
            raise TooMany()
        return original(tiles, tile)

    module.neighbours = wrapper
    return box


def true_best(tiles, start, goal):
    """Dijkstra, for checking: the fewest minutes from start to goal, or None."""
    best = {start: 0}
    waiting = [(0, start)]
    while waiting:
        minutes, (row, col) = _heapq.heappop(waiting)
        if (row, col) == goal:
            return minutes
        if minutes > best[(row, col)]:
            continue
        for next_row, next_col in ((row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)):
            if 0 <= next_row < len(tiles) and 0 <= next_col < len(tiles[next_row]) and tiles[next_row][next_col] is not None:
                cost = minutes + tiles[next_row][next_col]
                if (next_row, next_col) not in best or cost < best[(next_row, next_col)]:
                    best[(next_row, next_col)] = cost
                    _heapq.heappush(waiting, (cost, (next_row, next_col)))
    return None


def check_route(tiles, start, goal, got):
    want = true_best(tiles, start, goal)
    if want is None:
        if got is not None:
            raise CheckFailed(f"There's no way from {start} to {goal}, so a_star should give back None.", expected="None",
                              actual=repr(got)[:200])
        return
    if not isinstance(got, (tuple, list)) or len(got) != 2:
        raise CheckFailed("a_star should give back (minutes, route).", actual=repr(got)[:200])
    minutes, route = got
    route = [tuple(tile) for tile in route] if isinstance(route, (list, tuple)) else route
    if minutes != want:
        raise CheckFailed(f"The quickest way from {start} to {goal} takes {want} minutes.", expected=want, actual=minutes)
    if not isinstance(route, list) or route[:1] != [start] or route[-1:] != [goal]:
        raise CheckFailed(f"The route should be a list of tiles from {start} to {goal}.", actual=repr(route)[:200])
    total = 0
    for (row, col), (next_row, next_col) in zip(route, route[1:]):
        if abs(row - next_row) + abs(col - next_col) != 1:
            raise CheckFailed(f"{(next_row, next_col)} isn't up, down, left or right of {(row, col)}.", actual=repr(route)[:200])
        if not (0 <= next_row < len(tiles) and 0 <= next_col < len(tiles[next_row])) or tiles[next_row][next_col] is None:
            raise CheckFailed(f"The route goes onto {(next_row, next_col)}, which is hedge or outside the car park.", actual=repr(route)[:200])
        total += tiles[next_row][next_col]
    if total != minutes:
        raise CheckFailed(f"The minutes say {minutes}, but stepping along that route costs {total}.", expected=minutes, actual=total)


def route(tiles, start, goal):
    def check(ctx):
        module = quiet(ctx.module())
        given = _copy.deepcopy(tiles)
        check_route(tiles, start, goal, module.a_star(given, start, goal))
        if given != tiles:
            raise CheckFailed("a_star should leave the tiles as it found them.")
    return check


def the_park(ctx):
    module = quiet(ctx.module())
    tiles, start, goal = module.read_park(PARK)
    check_route(tiles, start, goal, module.a_star(tiles, start, goal))


def bad_map(text, message):
    def check(ctx):
        module = quiet(ctx.module())
        try:
            got = module.read_park(text)
        except ValueError:
            return
        raise CheckFailed(message, expected="ValueError", actual=repr(got)[:200])
    return check


def leans_to_goal(ctx):
    module = quiet(ctx.module())
    tiles = [[1] * 30 for _ in range(30)]
    box = counting_neighbours(module, 100)
    try:
        got = module.a_star(tiles, (15, 0), (15, 29))
    except TooMany:
        raise CheckFailed("Crossing an empty car park 30 tiles wide looked round more than 100 tiles. A* with the Manhattan estimate should head straight for the goal, as Neil does.")
    if box["calls"] == 0:
        raise CheckFailed("a_star should find the way on with your neighbours function.")
    check_route(tiles, (15, 0), (15, 29), got)


def big_park(ctx):
    module = quiet(ctx.module())
    rng = _random.Random(41)
    tiles = [[None if rng.random() < 0.25 else (3 if rng.random() < 0.2 else 1) for _ in range(50)] for _ in range(50)]
    tiles[0][0] = 1
    tiles[49][49] = 1
    check_route(tiles, (0, 0), (49, 49), module.a_star(_copy.deepcopy(tiles), (0, 0), (49, 49)))


def single(ctx):
    module = quiet(ctx.module())
    got = module.draw_route([[1, N], [3, 1]], [(1, 0)])
    if got != [".#", "G."]:
        raise CheckFailed("A route of one tile is just the G.", expected=[".#", "G."], actual=got)


SMALL = [[1, 1, N], [3, 1, 1]]

THROUGH_MUD = [
    [1, 1, 3, 1, 1],
    [1, N, N, N, 1],
    [1, N, N, N, 1],
    [1, 1, 1, 1, 1],
]

ROUND_MUD = [
    [1, 3, 3, 3, 1],
    [1, 1, 1, 1, 1],
]

OPEN = [[1, 1, 1], [1, 1, 1], [1, 1, 1]]

WALLED = [
    [1, 1, N, 1],
    [1, 1, N, 1],
    [1, 1, N, 1],
]

TESTS = [
    function("A small map", call="read_park", args=("S.#\n~.G\n",), expect=([[1, 1, None], [3, 1, 1]], (0, 0), (1, 2)), visible=True),
    custom("Gate to car in the car park", the_park, visible=True),
    function("The car park, drawn", call="draw_route",
             args=([[None if c == "#" else 3 if c == "~" else 1 for c in line] for line in PARK.splitlines()],
                   [(0, 0), (1, 0), (2, 0), (3, 0), (4, 0), (5, 0), (6, 0), (6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6),
                    (6, 7), (6, 8), (6, 9), (6, 10), (5, 10), (4, 10), (3, 10)]),
             expect=DRAWN, visible=True),
    function("Blank lines ignored", call="read_park", args=("\nS.\n.G\n\n",), expect=([[1, 1], [1, 1]], (0, 0), (1, 1)),
             hint="Skip any line with nothing on it, before it becomes a row."),
    custom("No gate", bad_map("...\n..G\n", "A map with no S should raise ValueError.")),
    custom("Two cars", bad_map("S.G\n..G\n", "A map with two Gs should raise ValueError."),
           hint="Count the Ss and Gs as you go, and check there's exactly one of each at the end."),
    custom("Ragged rows", bad_map("S..\n.G\n", "Rows of different lengths should raise ValueError.")),
    custom("A letter not on the key", bad_map("S.X\n..G\n", "An X isn't on the map's key, so it should raise ValueError.")),
    function("In a corner", call="neighbours", args=(SMALL, (0, 0)), expect=[(1, 0), (0, 1)]),
    function("Up, down, left, right", call="neighbours", args=(OPEN, (1, 1)), expect=[(0, 1), (2, 1), (1, 0), (1, 2)],
             hint="Up, then down, then left, then right."),
    function("Next to a hedge", call="neighbours", args=(SMALL, (0, 1)), expect=[(1, 1), (0, 0)]),
    function("Boxed in", call="neighbours", args=([[N, N, N], [N, 1, N], [N, N, N]], (1, 1)), expect=[]),
    function("Manhattan", call="manhattan", args=((2, 3), (5, 1)), expect=5),
    function("No distance at all", call="manhattan", args=((4, 4), (4, 4)), expect=0),
    function("Already there", call="a_star", args=(OPEN, (1, 1), (1, 1)), expect=(0, [(1, 1)]),
             hint="If the start is the goal, there's nothing to pay: (0, [start])."),
    function("Walled off", call="a_star", args=(WALLED, (0, 0), (2, 3)), expect=None,
             hint="When nothing is left waiting and the goal was never settled, give back None."),
    function("The goal is a hedge", call="a_star", args=(WALLED, (0, 0), (1, 2)), expect=None),
    custom("Straight through the mud", route(THROUGH_MUD, (0, 0), (0, 4)),
           hint="Each step costs the tile it lands on. One mud tile at 3 beats eight clear ones."),
    custom("Round the mud", route(ROUND_MUD, (0, 0), (0, 4)),
           hint="Three mud tiles cost 9. Going round costs 6."),
    custom("Equally quick routes", route(OPEN, (0, 0), (2, 2))),
    custom("Heading for the car", leans_to_goal,
           hint="Push each tile with its minutes so far plus manhattan(tile, goal), so the heap hands out the tile with the smallest total."),
    custom("A car park of 2,500 tiles", big_park),
    function("Drawing one tile", call="draw_route", args=([[1, N], [3, 1]], [(1, 0)]), expect=[".#", "G."]),
    function("Drawing nothing", call="draw_route", args=([[1, N], [3, 1]], []), expect=[".#", "~."]),
    function("Left and up", call="draw_route", args=(OPEN, [(2, 2), (2, 1), (1, 1), (0, 1), (0, 0)]), expect=["G<.", ".^.", ".^<"],
             hint="Each tile shows the way out of it: ^ for up, v for down, < for left, > for right."),
    output("The main block", expect="Gate to car: 23 minutes, 19 steps\n" + "\n".join(DRAWN)),
]
