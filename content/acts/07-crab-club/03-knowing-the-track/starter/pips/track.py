# The committee's racing grid, as a Markov decision process.
# Your track.py from last week, tidied by Moss, who added three ways to show it.

from saltmarsh import show_grid

TRACK = [
    "...F",
    ".#.P",
    "S...",
]
START = (2, 0)
ACTIONS = ["up", "down", "left", "right"]
STEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}
SIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}
STEP_REWARD = -1
FINISH_REWARD = 10
POOL_REWARD = -10
SLIP = 0.2   # how often he goes sideways instead, half each way

# Every tile he can stand on, rock excluded, finish and pool included.
TILES = [(row, col) for row in range(len(TRACK)) for col in range(len(TRACK[0])) if TRACK[row][col] != "#"]

# Along the bottom and up the far side, as the club has raced since 1951.
TRADITIONAL = {
    (0, 0): "right", (0, 1): "right", (0, 2): "right",
    (1, 0): "up", (1, 2): "up",
    (2, 0): "right", (2, 1): "right", (2, 2): "right", (2, 3): "up",
}


def mark(tile):
    """The letter on a tile: '.', '#', 'F', 'P' or 'S'."""
    row, col = tile
    return TRACK[row][col]


def is_over(tile):
    """True on the finish and in the rock pool: the race is over."""
    return mark(tile) in "FP"


def reward_for(tile):
    """The reward for stepping onto tile."""
    if mark(tile) == "F":
        return FINISH_REWARD
    if mark(tile) == "P":
        return POOL_REWARD
    return STEP_REWARD


def move(tile, direction):
    """Where one step in direction leads. Off the edge or into the rock, he stays put."""
    row, col = tile
    d_row, d_col = STEPS[direction]
    new_row, new_col = row + d_row, col + d_col
    if 0 <= new_row < len(TRACK) and 0 <= new_col < len(TRACK[0]) and TRACK[new_row][new_col] != "#":
        return (new_row, new_col)
    return tile


def outcomes(tile, action, slip=SLIP):
    """Every (probability, next tile, reward, over) that can follow action on tile."""
    if is_over(tile):
        return []
    result = []
    for chance, direction in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:
        after = move(tile, direction)
        result.append((chance, after, reward_for(after), is_over(after)))
    return result


ARROWS = {"up": "^", "down": "v", "left": "<", "right": ">"}


def show_policy(policy):
    """Print a policy as arrows on the grid."""
    for row in range(len(TRACK)):
        print(" ".join(ARROWS[policy[(row, col)]] if (row, col) in policy else TRACK[row][col]
                       for col in range(len(TRACK[0]))))


def show_values(values):
    """Print the worth of every tile, laid out like the grid."""
    for row in range(len(TRACK)):
        print("".join("     #" if TRACK[row][col] == "#" else f"{values[(row, col)]:6.1f}"
                      for col in range(len(TRACK[0]))))


def draw(values=None, policy=None, q=None, title=None):
    """Draw the grid in the output panel, one frame per call.

    values and policy are dictionaries keyed by tile; q, if given, maps each
    tile to its four action values (up, down, left, right), shown on hover.
    """
    rows, cols = range(len(TRACK)), range(len(TRACK[0]))
    grid = [[None if TRACK[r][c] == "#" else (values or {}).get((r, c), 0) for c in cols] for r in rows]
    arrows = [[(policy or {}).get((r, c)) for c in cols] for r in rows]
    show_grid(grid, policy=arrows, q=q, crab=START, walls=[(1, 1)], goal=[(0, 3)], title=title)
