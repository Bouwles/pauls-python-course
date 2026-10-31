# The League course, raced by the Arcade League's own rules, from club-course.json.
# Yahya copied them out and checked them against the League's notes. Twice.

import json

with open("club-course.json") as f:
    COURSE = json.load(f)

LAYOUT = COURSE["layout"]                    # S start, F finish, # rock, ~ rock pool, . sand
ROWS, COLS = len(LAYOUT), len(LAYOUT[0])
START = tuple(COURSE["start"])
FINISH = tuple(COURSE["finish"])
MOVES = COURSE["moves"]                      # up, down, left, right: actions 0, 1, 2 and 3
STEPS = [(-1, 0), (1, 0), (0, -1), (0, 1)]
SIDEWAYS = [(2, 3), (2, 3), (0, 1), (0, 1)]  # a slip turns up or down into left or right, and so on
MAX_MOVES = COURSE["max_steps"]              # a League race stops here, finished or not
ROCKS = [(row, col) for row in range(ROWS) for col in range(COLS) if LAYOUT[row][col] == "#"]
POOLS = [(row, col) for row in range(ROWS) for col in range(COLS) if LAYOUT[row][col] == "~"]
# Every tile a race can be going on: not a rock, not the finish.
TILES = [(row, col) for row in range(ROWS) for col in range(COLS) if LAYOUT[row][col] not in "#F"]


def slip_chance(tile):
    """How often the crab slips sideways from this tile: more in a rock pool than on sand."""
    return COURSE["slip"]["pool"] if tile in POOLS else COURSE["slip"]["sand"]


def move(tile, action):
    """Where one move leads. Into a rock or off the course, it stays put."""
    row, col = tile[0] + STEPS[action][0], tile[1] + STEPS[action][1]
    if 0 <= row < ROWS and 0 <= col < COLS and LAYOUT[row][col] != "#":
        return (row, col)
    return tile


def step(tile, action, rng):
    """One move: (where it ends up, the reward, whether the race is over).

    Every move costs -1, because the League counts moves. Reaching the finish ends the race.
    """
    if rng.random() < slip_chance(tile):
        action = SIDEWAYS[action][0 if rng.random() < 0.5 else 1]
    after = move(tile, action)
    return after, -1, after == FINISH


def random_start(rng):
    """A tile picked at random: practice races start anywhere on the course."""
    return TILES[rng.integers(len(TILES))]


def race(policy, rng):
    """One League race from the start, following policy (rows of actions, 0 to 3).

    Returns the number of moves it took: MAX_MOVES if it never got there.
    """
    tile = START
    for moves in range(1, MAX_MOVES + 1):
        tile, _, over = step(tile, policy[tile[0]][tile[1]], rng)
        if over:
            return moves
    return MAX_MOVES


def show_policy(policy):
    """Print a policy as arrows on the course."""
    arrows = "^v<>"
    for row in range(ROWS):
        print(" ".join(LAYOUT[row][col] if LAYOUT[row][col] in "#F" else arrows[policy[row][col]]
                       for col in range(COLS)))
