# Paul's own copy of track.py, so the checks never depend on changes made to yours.
TRACK_PY = '# The Arcade\'s racing grid, as a Markov decision process.\n# Your track.py from last week, tidied by Paul, who added three ways to show it.\n\nfrom workshop import show_grid\n\nTRACK = [\n    "...F",\n    ".#.P",\n    "S...",\n]\nSTART = (2, 0)\nACTIONS = ["up", "down", "left", "right"]\nSTEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}\nSIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}\nSTEP_REWARD = -1\nFINISH_REWARD = 10\nPOOL_REWARD = -10\nSLIP = 0.2   # how often it goes sideways instead, half each way\n\n# Every tile it can stand on, rock excluded, finish and pool included.\nTILES = [(row, col) for row in range(len(TRACK)) for col in range(len(TRACK[0])) if TRACK[row][col] != "#"]\n\n# Along the bottom and up the far side, the way everyone in the League races it.\nTRADITIONAL = {\n    (0, 0): "right", (0, 1): "right", (0, 2): "right",\n    (1, 0): "up", (1, 2): "up",\n    (2, 0): "right", (2, 1): "right", (2, 2): "right", (2, 3): "up",\n}\n\n\ndef mark(tile):\n    """The letter on a tile: \'.\', \'#\', \'F\', \'P\' or \'S\'."""\n    row, col = tile\n    return TRACK[row][col]\n\n\ndef is_over(tile):\n    """True on the finish and in the rock pool: the race is over."""\n    return mark(tile) in "FP"\n\n\ndef reward_for(tile):\n    """The reward for stepping onto tile."""\n    if mark(tile) == "F":\n        return FINISH_REWARD\n    if mark(tile) == "P":\n        return POOL_REWARD\n    return STEP_REWARD\n\n\ndef move(tile, direction):\n    """Where one step in direction leads. Off the edge or into the rock, it stays put."""\n    row, col = tile\n    d_row, d_col = STEPS[direction]\n    new_row, new_col = row + d_row, col + d_col\n    if 0 <= new_row < len(TRACK) and 0 <= new_col < len(TRACK[0]) and TRACK[new_row][new_col] != "#":\n        return (new_row, new_col)\n    return tile\n\n\ndef outcomes(tile, action, slip=SLIP):\n    """Every (probability, next tile, reward, over) that can follow action on tile."""\n    if is_over(tile):\n        return []\n    result = []\n    for chance, direction in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:\n        after = move(tile, direction)\n        result.append((chance, after, reward_for(after), is_over(after)))\n    return result\n\n\nARROWS = {"up": "^", "down": "v", "left": "<", "right": ">"}\n\n\ndef show_policy(policy):\n    """Print a policy as arrows on the grid."""\n    for row in range(len(TRACK)):\n        print(" ".join(ARROWS[policy[(row, col)]] if (row, col) in policy else TRACK[row][col]\n                       for col in range(len(TRACK[0]))))\n\n\ndef show_values(values):\n    """Print the worth of every tile, laid out like the grid."""\n    for row in range(len(TRACK)):\n        print("".join("     #" if TRACK[row][col] == "#" else f"{values[(row, col)]:6.1f}"\n                      for col in range(len(TRACK[0]))))\n\n\ndef draw(values=None, policy=None, q=None, title=None):\n    """Draw the grid in the output panel, one frame per call.\n\n    values and policy are dictionaries keyed by tile; q, if given, maps each\n    tile to its four action values (up, down, left, right), shown on hover.\n    """\n    rows, cols = range(len(TRACK)), range(len(TRACK[0]))\n    grid = [[None if TRACK[r][c] == "#" else (values or {}).get((r, c), 0) for c in cols] for r in rows]\n    arrows = [[(policy or {}).get((r, c)) for c in cols] for r in rows]\n    show_grid(grid, policy=arrows, q=q, crab=START, walls=[(1, 1)], goal=[(0, 3)], title=title)\n'

TRACK = ["...F", ".#.P", "S..."]
STEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}
SIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}
ACTIONS = ["up", "down", "left", "right"]
TILES = [(r, c) for r in range(3) for c in range(4) if TRACK[r][c] != "#"]
RACING = [tile for tile in TILES if TRACK[tile[0]][tile[1]] not in "FP"]
TRADITIONAL = {
    (0, 0): "right", (0, 1): "right", (0, 2): "right", (1, 0): "up", (1, 2): "up",
    (2, 0): "right", (2, 1): "right", (2, 2): "right", (2, 3): "up",
}
LONG_WAY = {
    (0, 0): "right", (0, 1): "right", (0, 2): "right", (1, 0): "up", (1, 2): "up",
    (2, 0): "up", (2, 1): "left", (2, 2): "up", (2, 3): "left",
}
BEST = {
    (0, 0): "right", (0, 1): "right", (0, 2): "right", (1, 0): "up", (1, 2): "up",
    (2, 0): "up", (2, 1): "right", (2, 2): "up", (2, 3): "left",
}


def paul_outcomes(tile, action):
    result = []
    for chance, way in [(0.8, action)] + [(0.1, side) for side in SIDEWAYS[action]]:
        r, c = tile[0] + STEPS[way][0], tile[1] + STEPS[way][1]
        after = (r, c) if 0 <= r < 3 and 0 <= c < 4 and TRACK[r][c] != "#" else tile
        letter = TRACK[after[0]][after[1]]
        result.append((chance, after, {"F": 10, "P": -10}.get(letter, -1), letter in "FP"))
    return result


def paul_q(values, tile, action, gamma):
    return sum(p * (r + (0 if over else gamma * values[after])) for p, after, r, over in paul_outcomes(tile, action))


def paul_evaluate(policy, gamma):
    values = {tile: 0.0 for tile in TILES}
    for _ in range(400):
        for tile in RACING:
            values[tile] = paul_q(values, tile, policy[tile], gamma)
    return values


def paul_best(gamma):
    values = {tile: 0.0 for tile in TILES}
    for _ in range(400):
        for tile in RACING:
            values[tile] = max(paul_q(values, tile, action, gamma) for action in ACTIONS)
    return values


def paul_greedy(values, gamma):
    return {tile: max(ACTIONS, key=lambda action: paul_q(values, tile, action, gamma)) for tile in RACING}


def dp(ctx):
    return ctx.module(files={"track.py": TRACK_PY})


def close_values(got, want, what):
    if not isinstance(got, dict):
        raise CheckFailed(f"{what} should give back a dictionary from each tile to its worth.", actual=repr(got))
    missing = [tile for tile in TILES if tile not in got]
    if missing:
        raise CheckFailed(f"{what} should have a value for every tile in TILES, the finish and the pool included. Missing: {missing}.")
    for tile in TILES:
        if got[tile] is None or abs(got[tile] - want[tile]) > 1e-3:
            raise CheckFailed(f"{what}: the worth of {tile} is wrong.", expected=round(want[tile], 3), actual=got[tile])


def same_policy(got, want, what):
    if not isinstance(got, dict):
        raise CheckFailed(f"{what} should be a dictionary from each tile to an action.", actual=repr(got))
    for tile in RACING:
        if got.get(tile) != want[tile]:
            raise CheckFailed(f"{what}: the best action on {tile} is {want[tile]!r}.", expected=want[tile], actual=got.get(tile))


def by_hand(ctx):
    m = dp(ctx)
    zeros = {tile: 0.0 for tile in TILES}
    for tile, action, gamma, want in [((0, 2), "right", 0.9, 7.8), ((2, 0), "up", 0.9, -1.0)]:
        got = m.q_value(zeros, tile, action, gamma)
        if got is None or abs(got - want) > 1e-9:
            raise CheckFailed(f"With every value at 0, q_value(values, {tile}, {action!r}, {gamma}) is just the expected reward.", expected=want, actual=got)


def traditional_worth(ctx):
    close_values(dp(ctx).evaluate(TRADITIONAL, 0.9), paul_evaluate(TRADITIONAL, 0.9), "evaluate(TRADITIONAL, 0.9)")


def looks_ahead(ctx):
    m = dp(ctx)
    fives = {tile: 5.0 for tile in TILES}
    for tile, action, gamma, want in [((0, 2), "right", 0.9, 8.7), ((2, 0), "up", 0.5, 1.5)]:
        got = m.q_value(fives, tile, action, gamma)
        if got is None or abs(got - want) > 1e-9:
            raise CheckFailed(f"With every value at 5.0, q_value(values, {tile}, {action!r}, {gamma}) should be {want}.", expected=want, actual=got)


def other_policy(ctx):
    m = dp(ctx)
    close_values(m.evaluate(LONG_WAY, 0.9), paul_evaluate(LONG_WAY, 0.9), "evaluate(LONG_WAY, 0.9)")
    close_values(m.evaluate(LONG_WAY, 1.0), paul_evaluate(LONG_WAY, 1.0), "evaluate(LONG_WAY, 1.0)")


def other_gamma(ctx):
    close_values(dp(ctx).evaluate(TRADITIONAL, 0.5), paul_evaluate(TRADITIONAL, 0.5), "evaluate(TRADITIONAL, 0.5)")


def greedy_on_best(ctx):
    m = dp(ctx)
    same_policy(m.greedy(paul_best(0.9), 0.9), BEST, "greedy on the best values")


def greedy_on_traditional(ctx):
    m = dp(ctx)
    values = paul_evaluate(TRADITIONAL, 0.9)
    same_policy(m.greedy(values, 0.9), paul_greedy(values, 0.9), "greedy on the traditional line's values")


def best_values(ctx):
    close_values(dp(ctx).value_iteration(0.9), paul_best(0.9), "value_iteration(0.9)")


def best_values_other_gammas(ctx):
    m = dp(ctx)
    for gamma in [0.5, 0.99]:
        close_values(m.value_iteration(gamma), paul_best(gamma), f"value_iteration({gamma})")


def improving(start, name):
    def check(ctx):
        result = dp(ctx).policy_iteration(dict(start), 0.9)
        if not isinstance(result, tuple) or len(result) != 2:
            raise CheckFailed("policy_iteration should return two things: return policy, values", actual=repr(result))
        policy, values = result
        same_policy(policy, BEST, f"policy_iteration from {name}")
        close_values(values, paul_best(0.9), f"the values policy_iteration gives back from {name}")
    return check


def whole_program(ctx):
    result = ctx.run_program(files={"track.py": TRACK_PY})
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    if len(result.lines()) < 3:
        raise CheckFailed("Print the traditional line's values, then the best values and the best line.", actual=result.output)


TESTS = [
    custom("One step's worth, by hand", by_hand, visible=True),
    custom("The traditional line's worth", traditional_worth, visible=True),
    custom("q_value looks past the next step", looks_ahead,
           hint="When over is True the race has ended: nothing comes after it, so leave out gamma times its value."),
    custom("evaluate follows the policy it is given", other_policy),
    custom("evaluate uses gamma", other_gamma, hint="Pass gamma on to q_value."),
    custom("greedy on the best values", greedy_on_best,
           hint="For each tile, the action with the biggest q_value. max(ACTIONS, key=...) does it."),
    custom("greedy on the traditional line's values", greedy_on_traditional),
    custom("value_iteration finds the best values", best_values,
           hint="The same sweep as evaluate, but each tile takes the biggest q_value over all four actions."),
    custom("value_iteration with other gammas", best_values_other_gammas),
    custom("policy_iteration from the traditional line", improving(TRADITIONAL, "the traditional line"),
           hint="Evaluate the policy, take greedy on those values, and stop when greedy gives back the same policy."),
    custom("policy_iteration from the long way round", improving(LONG_WAY, "the long way round")),
    custom("The whole program runs", whole_program),
]
