"""Nell's yard: read Penhallow's map, find the quickest way to the crane, and draw it."""
import heapq

from saltmarsh import show_grid

# Nell's yard, on paper, winter of '96: I walked it with a tape measure.
# The machine on the hill found the way across in a blink, and never asked
# what was at the other end. A.P.
YARD_FILE = "yard.txt"


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


if __name__ == "__main__":
    with open(YARD_FILE) as yard_file:
        text = yard_file.read()
