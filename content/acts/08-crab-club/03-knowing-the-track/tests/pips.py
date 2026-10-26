# Moss's own copy of track.py, so the checks never depend on changes made to yours.
TRACK_PY = '# The committee\'s racing grid, as a Markov decision process.\n# Your track.py from last week, tidied by Moss, who added three ways to show it.\n\nfrom workshop import show_grid\n\nTRACK = [\n    "...F",\n    ".#.P",\n    "S...",\n]\nSTART = (2, 0)\nACTIONS = ["up", "down", "left", "right"]\nSTEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}\nSIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}\nSTEP_REWARD = -1\nFINISH_REWARD = 10\nPOOL_REWARD = -10\nSLIP = 0.2   # how often he goes sideways instead, half each way\n\n# Every tile he can stand on, rock excluded, finish and pool included.\nTILES = [(row, col) for row in range(len(TRACK)) for col in range(len(TRACK[0])) if TRACK[row][col] != "#"]\n\n# Along the bottom and up the far side, as the club has raced since 1951.\nTRADITIONAL = {\n    (0, 0): "right", (0, 1): "right", (0, 2): "right",\n    (1, 0): "up", (1, 2): "up",\n    (2, 0): "right", (2, 1): "right", (2, 2): "right", (2, 3): "up",\n}\n\n\ndef mark(tile):\n    """The letter on a tile: \'.\', \'#\', \'F\', \'P\' or \'S\'."""\n    row, col = tile\n    return TRACK[row][col]\n\n\ndef is_over(tile):\n    """True on the finish and in the rock pool: the race is over."""\n    return mark(tile) in "FP"\n\n\ndef reward_for(tile):\n    """The reward for stepping onto tile."""\n    if mark(tile) == "F":\n        return FINISH_REWARD\n    if mark(tile) == "P":\n        return POOL_REWARD\n    return STEP_REWARD\n\n\ndef move(tile, direction):\n    """Where one step in direction leads. Off the edge or into the rock, he stays put."""\n    row, col = tile\n    d_row, d_col = STEPS[direction]\n    new_row, new_col = row + d_row, col + d_col\n    if 0 <= new_row < len(TRACK) and 0 <= new_col < len(TRACK[0]) and TRACK[new_row][new_col] != "#":\n        return (new_row, new_col)\n    return tile\n\n\ndef outcomes(tile, action, slip=SLIP):\n    """Every (probability, next tile, reward, over) that can follow action on tile."""\n    if is_over(tile):\n        return []\n    result = []\n    for chance, direction in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:\n        after = move(tile, direction)\n        result.append((chance, after, reward_for(after), is_over(after)))\n    return result\n\n\nARROWS = {"up": "^", "down": "v", "left": "<", "right": ">"}\n\n\ndef show_policy(policy):\n    """Print a policy as arrows on the grid."""\n    for row in range(len(TRACK)):\n        print(" ".join(ARROWS[policy[(row, col)]] if (row, col) in policy else TRACK[row][col]\n                       for col in range(len(TRACK[0]))))\n\n\ndef show_values(values):\n    """Print the worth of every tile, laid out like the grid."""\n    for row in range(len(TRACK)):\n        print("".join("     #" if TRACK[row][col] == "#" else f"{values[(row, col)]:6.1f}"\n                      for col in range(len(TRACK[0]))))\n\n\ndef draw(values=None, policy=None, q=None, title=None):\n    """Draw the grid in the output panel, one frame per call.\n\n    values and policy are dictionaries keyed by tile; q, if given, maps each\n    tile to its four action values (up, down, left, right), shown on hover.\n    """\n    rows, cols = range(len(TRACK)), range(len(TRACK[0]))\n    grid = [[None if TRACK[r][c] == "#" else (values or {}).get((r, c), 0) for c in cols] for r in rows]\n    arrows = [[(policy or {}).get((r, c)) for c in cols] for r in rows]\n    show_grid(grid, policy=arrows, q=q, crab=START, walls=[(1, 1)], goal=[(0, 3)], title=title)\n'

TRACK = ["...F", ".#.P", "S..."]
STEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}
SIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}
ACTIONS = ["up", "down", "left", "right"]
TILES = [(r, c) for r in range(3) for c in range(4) if TRACK[r][c] != "#"]
RACING = [tile for tile in TILES if TRACK[tile[0]][tile[1]] not in "FP"]


def moss_outcomes(tile, action):
    result = []
    for chance, way in [(0.8, action)] + [(0.1, side) for side in SIDEWAYS[action]]:
        r, c = tile[0] + STEPS[way][0], tile[1] + STEPS[way][1]
        after = (r, c) if 0 <= r < 3 and 0 <= c < 4 and TRACK[r][c] != "#" else tile
        letter = TRACK[after[0]][after[1]]
        result.append((chance, after, {"F": 10, "P": -10}.get(letter, -1), letter in "FP"))
    return result


def moss_best(gamma):
    values = {tile: 0.0 for tile in TILES}
    for _ in range(400):
        for tile in RACING:
            values[tile] = max(sum(p * (r + (0 if over else gamma * values[after]))
                                   for p, after, r, over in moss_outcomes(tile, action))
                               for action in ACTIONS)
    return values


def best_values(gamma, tiles=TILES):
    def check(ctx):
        m = ctx.module(files={"track.py": TRACK_PY})
        got = m.value_iteration(gamma)
        want = moss_best(gamma)
        if not isinstance(got, dict):
            raise CheckFailed("value_iteration should give back a dictionary from each tile to its worth.", actual=repr(got))
        for tile in tiles:
            if abs(got[tile] - want[tile]) > 1e-3:
                raise CheckFailed(f"value_iteration({gamma}): the worth of {tile} is wrong.", expected=round(want[tile], 3), actual=round(got[tile], 3))
    return check


TESTS = [
    custom("Under the rock pool", best_values(0.9, [(2, 3)]), visible=True,
           hint="Told left, he slips into the pool one time in ten. Weight each outcome by its chance."),
    custom("Every tile, gamma 0.9", best_values(0.9), visible=True),
    custom("Every tile, gamma 0.5", best_values(0.5)),
    custom("Every tile, gamma 0.99", best_values(0.99)),
]
