# Moss's own copy of track.py, so the checks never depend on changes made to yours.
TRACK_PY = '# The committee\'s racing grid, as a Markov decision process.\n# Moss\'s copy, as last week, with step() added: the grid as Sir Reginald meets it.\n\nfrom saltmarsh import show_grid\n\nTRACK = [\n    "...F",\n    ".#.P",\n    "S...",\n]\nSTART = (2, 0)\nACTIONS = ["up", "down", "left", "right"]\nSTEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}\nSIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}\nSTEP_REWARD = -1\nFINISH_REWARD = 10\nPOOL_REWARD = -10\nSLIP = 0.2   # how often he goes sideways instead, half each way\n\n# Every tile he can stand on, rock excluded, finish and pool included.\nTILES = [(row, col) for row in range(len(TRACK)) for col in range(len(TRACK[0])) if TRACK[row][col] != "#"]\n# The tiles where a race can still be going on: everything but the finish and the pool.\nRACING = [tile for tile in TILES if TRACK[tile[0]][tile[1]] not in "FP"]\n\n# Along the bottom and up the far side, as the club has raced since 1951.\nTRADITIONAL = {\n    (0, 0): "right", (0, 1): "right", (0, 2): "right",\n    (1, 0): "up", (1, 2): "up",\n    (2, 0): "right", (2, 1): "right", (2, 2): "right", (2, 3): "up",\n}\n\n\ndef mark(tile):\n    """The letter on a tile: \'.\', \'#\', \'F\', \'P\' or \'S\'."""\n    row, col = tile\n    return TRACK[row][col]\n\n\ndef is_over(tile):\n    """True on the finish and in the rock pool: the race is over."""\n    return mark(tile) in "FP"\n\n\ndef reward_for(tile):\n    """The reward for stepping onto tile."""\n    if mark(tile) == "F":\n        return FINISH_REWARD\n    if mark(tile) == "P":\n        return POOL_REWARD\n    return STEP_REWARD\n\n\ndef move(tile, direction):\n    """Where one step in direction leads. Off the edge or into the rock, he stays put."""\n    row, col = tile\n    d_row, d_col = STEPS[direction]\n    new_row, new_col = row + d_row, col + d_col\n    if 0 <= new_row < len(TRACK) and 0 <= new_col < len(TRACK[0]) and TRACK[new_row][new_col] != "#":\n        return (new_row, new_col)\n    return tile\n\n\ndef outcomes(tile, action, slip=SLIP):\n    """Every (probability, next tile, reward, over) that can follow action on tile."""\n    if is_over(tile):\n        return []\n    result = []\n    for chance, direction in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:\n        after = move(tile, direction)\n        result.append((chance, after, reward_for(after), is_over(after)))\n    return result\n\n\ndef step(tile, action, rng):\n    """One step on the real grid: (where he ends up, the reward, whether the race is over).\n\n    This is all a racing crab ever finds out. It reads outcomes() so you don\'t have to:\n    the same as rng.choice with the chances, only quicker.\n    """\n    roll = rng.random()\n    for chance, after, reward, over in outcomes(tile, action):\n        roll -= chance\n        if roll < 0:\n            break\n    return after, reward, over\n\n\ndef random_start(rng):\n    """A racing tile picked at random: practice races start anywhere."""\n    return RACING[rng.integers(len(RACING))]\n\n\nARROWS = {"up": "^", "down": "v", "left": "<", "right": ">"}\n\n\ndef show_policy(policy):\n    """Print a policy as arrows on the grid."""\n    for row in range(len(TRACK)):\n        print(" ".join(ARROWS[policy[(row, col)]] if (row, col) in policy else TRACK[row][col]\n                       for col in range(len(TRACK[0]))))\n\n\ndef show_values(values):\n    """Print the worth of every tile, laid out like the grid."""\n    for row in range(len(TRACK)):\n        print("".join("     #" if TRACK[row][col] == "#" else f"{values[(row, col)]:6.1f}"\n                      for col in range(len(TRACK[0]))))\n\n\ndef draw(values=None, policy=None, q=None, title=None):\n    """Draw the grid in the output panel, one frame per call.\n\n    values and policy are dictionaries keyed by tile; q, if given, maps each\n    tile to its four action values (up, down, left, right), shown on hover.\n    """\n    rows, cols = range(len(TRACK)), range(len(TRACK[0]))\n    grid = [[None if TRACK[r][c] == "#" else (values or {}).get((r, c), 0) for c in cols] for r in rows]\n    arrows = [[(policy or {}).get((r, c)) for c in cols] for r in rows]\n    show_grid(grid, policy=arrows, q=q, crab=START, walls=[(1, 1)], goal=[(0, 3)], title=title)\n'

NO_SLIP_PY = TRACK_PY.replace("SLIP = 0.2", "SLIP = 0.0")

TRACK = ["...F", ".#.P", "S..."]
STEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}
SIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}
TILES = [(r, c) for r in range(3) for c in range(4) if TRACK[r][c] != "#"]
RACING = [tile for tile in TILES if TRACK[tile[0]][tile[1]] not in "FP"]
TRADITIONAL = {
    (0, 0): "right", (0, 1): "right", (0, 2): "right", (1, 0): "up", (1, 2): "up",
    (2, 0): "right", (2, 1): "right", (2, 2): "right", (2, 3): "up",
}


def moss_outcomes(tile, action, slip):
    result = []
    for chance, way in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:
        r, c = tile[0] + STEPS[way][0], tile[1] + STEPS[way][1]
        after = (r, c) if 0 <= r < 3 and 0 <= c < 4 and TRACK[r][c] != "#" else tile
        letter = TRACK[after[0]][after[1]]
        result.append((chance, after, {"F": 10, "P": -10}.get(letter, -1), letter in "FP"))
    return result


def moss_evaluate(policy, gamma=0.9, slip=0.2):
    values = {tile: 0.0 for tile in TILES}
    for _ in range(400):
        for tile in RACING:
            values[tile] = sum(p * (r + (0 if over else gamma * values[after]))
                               for p, after, r, over in moss_outcomes(tile, policy[tile], slip))
    return values


def learned(ctx, slipping, races, seed, alpha):
    import numpy as np
    m = ctx.module(files={"track.py": TRACK_PY if slipping else NO_SLIP_PY})
    values = m.td_evaluate(TRADITIONAL, races, np.random.default_rng(seed), alpha=alpha)
    if not isinstance(values, dict) or any(tile not in values for tile in TILES):
        raise CheckFailed("td_evaluate should give back a dictionary with a worth for every tile.", actual=repr(values))
    return values


def finish_stays_nothing(ctx):
    values = learned(ctx, True, 300, 1, 0.05)
    for tile, name in [((0, 3), "finish"), ((1, 3), "rock pool")]:
        if abs(values[tile]) > 1e-12:
            raise CheckFailed(f"The race is over in the {name}, so nothing can follow it: its worth should stay 0.",
                              expected=0.0, actual=round(values[tile], 2))


def without_slipping(ctx):
    values = learned(ctx, False, 500, 2, 0.5)
    want = moss_evaluate(TRADITIONAL, slip=0.0)
    for tile in TILES:
        if abs(values[tile] - want[tile]) > 1e-3:
            raise CheckFailed(f"With no slipping, the traditional line's worth at {tile} is exactly {want[tile]:.2f}.",
                              expected=round(want[tile], 2), actual=round(values[tile], 2))


def with_slipping(ctx):
    values = learned(ctx, True, 3000, 3, 0.02)
    want = moss_evaluate(TRADITIONAL)
    for tile in TILES:
        if abs(values[tile] - want[tile]) > 2.5:
            raise CheckFailed(f"After 3000 races, the worth of {tile} should be near what the map says.",
                              expected=f"{want[tile]:.2f}, give or take 2.5", actual=round(values[tile], 2))


TESTS = [
    custom("The finish and the pool stay at 0", finish_stays_nothing, visible=True),
    custom("Races with no slipping", without_slipping, visible=True),
    custom("Races on the real grid", with_slipping),
]
