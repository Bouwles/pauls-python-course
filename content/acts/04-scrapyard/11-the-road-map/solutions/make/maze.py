"""Maze Solver: the way through Yahya's maze, the fewest steps from the start to the goal."""
from collections import deque

try:
    from workshop import show_grid
except ImportError:
    # Outside the browser there's nothing to draw on; the answers are the same.
    def show_grid(*args, **kwargs):
        pass

MAZE_FILE = "maze.txt"

# Yahya's maze, copied off the Puzzle Room wall. The class races it on Fridays.


def read_maze(text):
    """(grid, start, goal) from a maze drawn as text: # walls, . open, S start, G goal."""
    grid = [line for line in text.splitlines() if line.strip()]
    start = goal = None
    for row, line in enumerate(grid):
        for col, tile in enumerate(line):
            if tile == "S":
                start = (row, col)
            elif tile == "G":
                goal = (row, col)
    if start is None or goal is None:
        raise ValueError("a maze needs an S and a G")
    return grid, start, goal


def neighbours(grid, tile):
    """The open tiles up, down, left and right of tile, inside the maze, in that order."""
    row, col = tile
    found = []
    for next_row, next_col in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:
        if 0 <= next_row < len(grid) and 0 <= next_col < len(grid[next_row]) and grid[next_row][next_col] != "#":
            found.append((next_row, next_col))
    return found


def shortest_path(grid, start, goal):
    """The tiles from start to goal in the fewest steps, by breadth-first search, or None."""
    # Mark the start as reached, and queue it
    came_from = {start: None}
    queue = deque([start])
    # While anything is queued
    while queue:
        # Take the tile at the front
        tile = queue.popleft()
        if tile == goal:
            path = []
            while tile is not None:
                path.append(tile)
                tile = came_from[tile]
            return path[::-1]
        # Look at each neighbour
        for neighbour in neighbours(grid, tile):
            # If it's somewhere new: note where it was reached from, and queue it
            if neighbour not in came_from:
                came_from[neighbour] = tile
                queue.append(neighbour)
    return None


def explore(grid, start):
    """Every tile a depth-first walk reaches from start, in the order it first reaches them."""
    order = []
    reached = set()

    def visit(tile):
        order.append(tile)
        reached.add(tile)
        for neighbour in neighbours(grid, tile):
            if neighbour not in reached:
                visit(neighbour)

    visit(start)
    return order


def unreachable(grid, start):
    """Every open tile that can't be reached from start, in order, row by row."""
    reached = set(explore(grid, start))
    return [(row, col) for row, line in enumerate(grid) for col, tile in enumerate(line)
            if tile != "#" and (row, col) not in reached]


def draw_path(grid, path):
    """The maze as lines of text, with * on every tile of the path but the S and the G."""
    on_path = set(path or [])
    lines = []
    for row, line in enumerate(grid):
        tiles = []
        for col, tile in enumerate(line):
            if (row, col) in on_path and tile == ".":
                tiles.append("*")
            else:
                tiles.append(tile)
        lines.append("".join(tiles))
    return lines


if __name__ == "__main__":
    with open(MAZE_FILE) as maze_file:
        grid, start, goal = read_maze(maze_file.read())
    path = shortest_path(grid, start, goal)
    walls = [(row, col) for row, line in enumerate(grid) for col, tile in enumerate(line) if tile == "#"]
    steps = set(path or [])
    show_grid([[1 if (row, col) in steps else 0 for col in range(len(line))] for row, line in enumerate(grid)],
              crab=start, walls=walls, goal=[goal], title="Start to goal")
    if path is None:
        print("No way through.")
    else:
        print(f"Start to goal: {len(path) - 1} steps")
        for line in draw_path(grid, path):
            print(line)
    print(f"Depth first reaches {len(explore(grid, start))} tiles")
    cut_off = unreachable(grid, start)
    print(f"Cut off: {', '.join(str(tile) for tile in cut_off) if cut_off else 'nothing'}")
