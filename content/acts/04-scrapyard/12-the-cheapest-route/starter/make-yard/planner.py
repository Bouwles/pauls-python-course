"""Route Planner, the yard: read Penhallow's map, find the quickest way to the crane, and draw it."""
import heapq

try:
    from workshop import show_grid
except ImportError:
    # Outside the browser there's nothing to draw on; the answers are the same.
    def show_grid(*args, **kwargs):
        pass

# Nell's yard, on paper, winter of '96: I walked it with a tape measure.
# The machine on the hill found the way across in a blink, and never asked
# what was at the other end. A.P.
YARD_FILE = "yard.txt"

COSTS = {".": 1, "S": 1, "G": 1, "~": 3, "#": None}
ARROWS = {(-1, 0): "^", (1, 0): "v", (0, -1): "<", (0, 1): ">"}


def show_search(tiles, best, current, goal, route=()):
    """Moss's drawing, ready to use: the minutes so far on every tile reached, the route as arrows.

    best is a dictionary of {tile: minutes so far}. Call it each time round your loop, then once
    more with the route, and press Run.
    """
    values = [[best.get((row, col)) for col in range(len(tiles[row]))] for row in range(len(tiles))]
    walls = [(row, col) for row in range(len(tiles)) for col in range(len(tiles[row])) if tiles[row][col] is None]
    arrows = [[None] * len(tiles[row]) for row in range(len(tiles))]
    for (row, col), (next_row, next_col) in zip(route, route[1:]):
        arrows[row][col] = {(-1, 0): "^", (1, 0): "v", (0, -1): "<", (0, 1): ">"}[(next_row - row, next_col - col)]
    show_grid(values, policy=arrows, crab=current, walls=walls, goal=[goal], title="Nell's yard")


# From the maze solver, with a cost on every tile: what it takes to step onto it.
def read_yard(text):
    """(tiles, start, goal) from Penhallow's map. ValueError if the map is wrong."""
    tiles = []
    starts = []
    goals = []
    for line in text.splitlines():
        if not line.strip():
            continue
        row = []
        for letter in line:
            if letter not in COSTS:
                raise ValueError(f"{letter!r} isn't on Penhallow's key")
            if letter == "S":
                starts.append((len(tiles), len(row)))
            elif letter == "G":
                goals.append((len(tiles), len(row)))
            row.append(COSTS[letter])
        if tiles and len(row) != len(tiles[0]):
            raise ValueError(f"row {len(tiles)} is {len(row)} tiles long, not {len(tiles[0])}")
        tiles.append(row)
    if len(starts) != 1 or len(goals) != 1:
        raise ValueError(f"the map needs one S and one G, not {len(starts)} and {len(goals)}")
    return tiles, starts[0], goals[0]


def neighbours(tiles, tile):
    """The tiles up, down, left and right of tile that are in the yard and not scrap."""
    row, col = tile
    found = []
    for next_row, next_col in ((row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)):
        if 0 <= next_row < len(tiles) and 0 <= next_col < len(tiles[next_row]) and tiles[next_row][next_col] is not None:
            found.append((next_row, next_col))
    return found


def manhattan(tile, goal):
    """Rows apart plus columns apart."""


def a_star(tiles, start, goal):
    """(minutes, route) for the quickest way from start to goal, or None."""


def draw_route(tiles, route):
    """The yard as strings, with the route drawn in arrows and G at its end."""


if __name__ == "__main__":
    with open(YARD_FILE) as yard_file:
        text = yard_file.read()
    tiles, start, goal = read_yard(text)
    found = a_star(tiles, start, goal)
    if found is None:
        print("No way from the gate to the crane")
    else:
        minutes, route = found
        print(f"Gate to crane: {minutes} minutes, {len(route) - 1} steps")
        for line in draw_route(tiles, route):
            print(line)
