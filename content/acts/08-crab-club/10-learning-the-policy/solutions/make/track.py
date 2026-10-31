# The Arcade's racing grid, as a Markov decision process.
# Paul's copy, with step() for learning by racing and average_return() for judging.

try:
    from workshop import show_grid  # draws in the workshop's output panel
except ImportError:  # anywhere else, drawing does nothing and the rest still runs
    def show_grid(*args, **kwargs):
        pass

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
SLIP = 0.2   # how often it goes sideways instead, half each way

# Every tile it can stand on, rock excluded, finish and pool included.
TILES = [(row, col) for row in range(len(TRACK)) for col in range(len(TRACK[0])) if TRACK[row][col] != "#"]


def mark(tile):
    """The letter on a tile: '.', '#', 'F', 'P' or 'S'."""
    row, col = tile
    return TRACK[row][col]


def is_over(tile):
    """True on the finish and in the rock pool: the race is over."""
    return mark(tile) in "FP"


# Every tile where the race is still on.
RACING = [tile for tile in TILES if not is_over(tile)]


def reward_for(tile):
    """The reward for stepping onto tile."""
    if mark(tile) == "F":
        return FINISH_REWARD
    if mark(tile) == "P":
        return POOL_REWARD
    return STEP_REWARD


def move(tile, direction):
    """Where one step in direction leads. Off the edge or into the rock, it stays put."""
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


def step(tile, action, rng, slip=SLIP):
    """One move on race day: (where it ends up, the reward, whether the race is over)."""
    if rng.random() < slip:
        action = SIDEWAYS[action][int(rng.integers(2))]
    after = move(tile, action)
    return after, reward_for(after), is_over(after)


def discounted_return(rewards, gamma=0.9):
    """Each reward counts gamma times less than the one before it."""
    total = 0
    for reward in reversed(rewards):
        total = reward + gamma * total
    return total


def average_return(choose, rng, races=1000, gamma=0.9, limit=100):
    """Race from the start races times, asking choose(tile) for each move. The average return."""
    returns = []
    for _ in range(races):
        tile, rewards = START, []
        while not is_over(tile) and len(rewards) < limit:
            tile, reward, _ = step(tile, choose(tile), rng)
            rewards.append(reward)
        returns.append(discounted_return(rewards, gamma))
    return sum(returns) / races


ARROWS = {"up": "^", "down": "v", "left": "<", "right": ">"}


def show_policy(policy):
    """Print a policy (a dictionary from tile to action) as arrows on the grid."""
    for row in range(len(TRACK)):
        print(" ".join(ARROWS[policy[(row, col)]] if (row, col) in policy else TRACK[row][col]
                       for col in range(len(TRACK[0]))))


def draw(values=None, policy=None, q=None, crab=START, title=None):
    """Draw the grid in the output panel, one frame per call.

    values and policy are dictionaries keyed by tile; q, if given, maps each
    tile to its four action values (up, down, left, right), shown on hover.
    """
    rows, cols = range(len(TRACK)), range(len(TRACK[0]))
    grid = [[None if TRACK[r][c] == "#" else (values or {}).get((r, c), 0) for c in cols] for r in rows]
    arrows = [[(policy or {}).get((r, c)) for c in cols] for r in rows]
    show_grid(grid, policy=arrows, q=q, crab=crab, walls=[(1, 1)], goal=[(0, 3)], title=title)
