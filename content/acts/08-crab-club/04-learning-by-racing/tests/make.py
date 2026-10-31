# Paul's own copies of track.py and dp.py, so the checks never depend on changes made to yours.
TRACK_PY = '# The Arcade\'s racing grid, as a Markov decision process.\n# Paul\'s copy, as last week, with step() added: the grid as the crab meets it.\n\nfrom workshop import show_grid\n\nTRACK = [\n    "...F",\n    ".#.P",\n    "S...",\n]\nSTART = (2, 0)\nACTIONS = ["up", "down", "left", "right"]\nSTEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}\nSIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}\nSTEP_REWARD = -1\nFINISH_REWARD = 10\nPOOL_REWARD = -10\nSLIP = 0.2   # how often it goes sideways instead, half each way\n\n# Every tile it can stand on, rock excluded, finish and pool included.\nTILES = [(row, col) for row in range(len(TRACK)) for col in range(len(TRACK[0])) if TRACK[row][col] != "#"]\n# The tiles where a race can still be going on: everything but the finish and the pool.\nRACING = [tile for tile in TILES if TRACK[tile[0]][tile[1]] not in "FP"]\n\n# Along the bottom and up the far side, the way everyone in the League races it.\nTRADITIONAL = {\n    (0, 0): "right", (0, 1): "right", (0, 2): "right",\n    (1, 0): "up", (1, 2): "up",\n    (2, 0): "right", (2, 1): "right", (2, 2): "right", (2, 3): "up",\n}\n\n\ndef mark(tile):\n    """The letter on a tile: \'.\', \'#\', \'F\', \'P\' or \'S\'."""\n    row, col = tile\n    return TRACK[row][col]\n\n\ndef is_over(tile):\n    """True on the finish and in the rock pool: the race is over."""\n    return mark(tile) in "FP"\n\n\ndef reward_for(tile):\n    """The reward for stepping onto tile."""\n    if mark(tile) == "F":\n        return FINISH_REWARD\n    if mark(tile) == "P":\n        return POOL_REWARD\n    return STEP_REWARD\n\n\ndef move(tile, direction):\n    """Where one step in direction leads. Off the edge or into the rock, it stays put."""\n    row, col = tile\n    d_row, d_col = STEPS[direction]\n    new_row, new_col = row + d_row, col + d_col\n    if 0 <= new_row < len(TRACK) and 0 <= new_col < len(TRACK[0]) and TRACK[new_row][new_col] != "#":\n        return (new_row, new_col)\n    return tile\n\n\ndef outcomes(tile, action, slip=SLIP):\n    """Every (probability, next tile, reward, over) that can follow action on tile."""\n    if is_over(tile):\n        return []\n    result = []\n    for chance, direction in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:\n        after = move(tile, direction)\n        result.append((chance, after, reward_for(after), is_over(after)))\n    return result\n\n\ndef step(tile, action, rng):\n    """One step on the real grid: (where it ends up, the reward, whether the race is over).\n\n    This is all a racing crab ever finds out. It reads outcomes() so you don\'t have to:\n    the same as rng.choice with the chances, only quicker.\n    """\n    roll = rng.random()\n    for chance, after, reward, over in outcomes(tile, action):\n        roll -= chance\n        if roll < 0:\n            break\n    return after, reward, over\n\n\ndef random_start(rng):\n    """A racing tile picked at random: practice races start anywhere."""\n    return RACING[rng.integers(len(RACING))]\n\n\nARROWS = {"up": "^", "down": "v", "left": "<", "right": ">"}\n\n\ndef show_policy(policy):\n    """Print a policy as arrows on the grid."""\n    for row in range(len(TRACK)):\n        print(" ".join(ARROWS[policy[(row, col)]] if (row, col) in policy else TRACK[row][col]\n                       for col in range(len(TRACK[0]))))\n\n\ndef show_values(values):\n    """Print the worth of every tile, laid out like the grid."""\n    for row in range(len(TRACK)):\n        print("".join("     #" if TRACK[row][col] == "#" else f"{values[(row, col)]:6.1f}"\n                      for col in range(len(TRACK[0]))))\n\n\ndef draw(values=None, policy=None, q=None, title=None):\n    """Draw the grid in the output panel, one frame per call.\n\n    values and policy are dictionaries keyed by tile; q, if given, maps each\n    tile to its four action values (up, down, left, right), shown on hover.\n    """\n    rows, cols = range(len(TRACK)), range(len(TRACK[0]))\n    grid = [[None if TRACK[r][c] == "#" else (values or {}).get((r, c), 0) for c in cols] for r in rows]\n    arrows = [[(policy or {}).get((r, c)) for c in cols] for r in rows]\n    show_grid(grid, policy=arrows, q=q, crab=START, walls=[(1, 1)], goal=[(0, 3)], title=title)\n'

DP_PY = '# Knowing the track: the worth of every tile, worked out without a single race.\n\nfrom track import ACTIONS, TILES, TRADITIONAL, draw, is_over, outcomes, show_policy, show_values\n\n\ndef q_value(values, tile, action, gamma=0.9):\n    """What action is worth on tile: for each outcome, its reward plus gamma times\n    the worth of where it leads (nothing, if the race is over), weighted by its chance."""\n    total = 0\n    for chance, after, reward, over in outcomes(tile, action):\n        future = 0 if over else gamma * values[after]\n        total += chance * (reward + future)\n    return total\n\n\ndef evaluate(policy, gamma=0.9, theta=1e-6):\n    """The worth of every tile, following policy. The finish and the pool stay at 0."""\n    values = {tile: 0.0 for tile in TILES}\n    while True:\n        biggest_change = 0\n        for tile in TILES:\n            if is_over(tile):\n                continue\n            new = q_value(values, tile, policy[tile], gamma)\n            biggest_change = max(biggest_change, abs(new - values[tile]))\n            values[tile] = new\n        if biggest_change < theta:\n            return values\n\n\ndef greedy(values, gamma=0.9):\n    """The best action on every tile where the race isn\'t over, looking one step ahead."""\n    return {tile: max(ACTIONS, key=lambda action: q_value(values, tile, action, gamma))\n            for tile in TILES if not is_over(tile)}\n\n\ndef value_iteration(gamma=0.9, theta=1e-6):\n    """The worth of every tile under the best possible policy."""\n    values = {tile: 0.0 for tile in TILES}\n    sweep = 0\n    while True:\n        sweep += 1\n        biggest_change = 0\n        for tile in TILES:\n            if is_over(tile):\n                continue\n            new = max(q_value(values, tile, action, gamma) for action in ACTIONS)\n            biggest_change = max(biggest_change, abs(new - values[tile]))\n            values[tile] = new\n        draw(values, greedy(values, gamma), title=f"value iteration, sweep {sweep}")\n        if biggest_change < theta:\n            return values\n\n\ndef policy_iteration(policy, gamma=0.9):\n    """Evaluate, improve, repeat, until the policy stops changing. Returns (policy, values)."""\n    while True:\n        values = evaluate(policy, gamma)\n        better = greedy(values, gamma)\n        if better == policy:\n            return policy, values\n        policy = better\n\n\nif __name__ == "__main__":\n    print("The traditional line")\n    show_values(evaluate(TRADITIONAL))\n    print()\n    best_values = value_iteration()\n    print("The best line")\n    show_values(best_values)\n    show_policy(greedy(best_values))\n    print()\n    best_policy, _ = policy_iteration(TRADITIONAL)\n    print("Policy iteration agrees:", best_policy == greedy(best_values))\n'

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
LONG_WAY = {
    (0, 0): "right", (0, 1): "right", (0, 2): "right", (1, 0): "up", (1, 2): "up",
    (2, 0): "up", (2, 1): "left", (2, 2): "up", (2, 3): "left",
}


def paul_outcomes(tile, action, slip):
    result = []
    for chance, way in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:
        r, c = tile[0] + STEPS[way][0], tile[1] + STEPS[way][1]
        after = (r, c) if 0 <= r < 3 and 0 <= c < 4 and TRACK[r][c] != "#" else tile
        letter = TRACK[after[0]][after[1]]
        result.append((chance, after, {"F": 10, "P": -10}.get(letter, -1), letter in "FP"))
    return result


def paul_evaluate(policy, gamma=0.9, slip=0.2):
    """The worth of every tile, worked out from the map, as in the Gridworld Solver."""
    values = {tile: 0.0 for tile in TILES}
    for _ in range(400):
        for tile in RACING:
            values[tile] = sum(p * (r + (0 if over else gamma * values[after]))
                               for p, after, r, over in paul_outcomes(tile, policy[tile], slip))
    return values


def learn(ctx, slipping=True):
    return ctx.module(files={"track.py": TRACK_PY if slipping else NO_SLIP_PY, "dp.py": DP_PY})


def rng(seed):
    import numpy as np
    return np.random.default_rng(seed)


def close_values(got, want, what, tol):
    if not isinstance(got, dict):
        raise CheckFailed(f"{what} should give back a dictionary from each tile to its worth.", actual=repr(got))
    missing = [tile for tile in TILES if tile not in got]
    if missing:
        raise CheckFailed(f"{what} should have a value for every tile in TILES, the finish and the pool included. Missing: {missing}.")
    for tile in TILES:
        if got[tile] is None or abs(got[tile] - want[tile]) > tol:
            raise CheckFailed(f"{what}: the worth of {tile} is too far from what the map says.",
                              expected=f"{want[tile]:.2f}, give or take {tol}", actual=got[tile])


def returns_by_hand(ctx):
    m = learn(ctx)
    for rewards, gamma, want in [([-1, -1, -1, -1, 10], 0.9, [3.122, 4.58, 6.2, 8.0, 10.0]), ([10, -1], 0.5, [9.5, -1.0])]:
        got = m.returns_from(rewards, gamma)
        if got is None or len(list(got)) != len(want) or any(abs(g - w) > 1e-6 for g, w in zip(got, want)):
            raise CheckFailed(f"returns_from({rewards}, {gamma}): the return from each step, first to last.", expected=want, actual=got)


def one_td_update(ctx):
    m = learn(ctx)
    values = {(1, 2): 0.0, (0, 2): 8.0}
    error = m.td_update(values, (1, 2), -1, (0, 2), False, alpha=0.5, gamma=0.9)
    if abs(values[(1, 2)] - 3.1) > 1e-9:
        raise CheckFailed("From (1, 2), reward -1, to (0, 2) worth 8.0: the target is -1 + 0.9 × 8.0 = 6.2, and alpha 0.5 moves the worth half way there.",
                          expected=3.1, actual=values[(1, 2)])
    if error is None or abs(error - 6.2) > 1e-9:
        raise CheckFailed("td_update should return the TD error: the target minus the old worth.", expected=6.2, actual=error)


def returns_edges(ctx):
    m = learn(ctx)
    for rewards, gamma, want in [([], 0.9, []), ([5], 0.3, [5.0]), ([3, 4, -2], 0.0, [3.0, 4.0, -2.0]), ([1, 1, 1], 1.0, [3.0, 2.0, 1.0])]:
        got = m.returns_from(rewards, gamma)
        if got is None or len(list(got)) != len(want) or any(abs(g - w) > 1e-6 for g, w in zip(got, want)):
            raise CheckFailed(f"returns_from({rewards}, {gamma}) should be {want}.", expected=want, actual=got)


def td_at_the_end(ctx):
    m = learn(ctx)
    values = {(2, 3): -4.0, (1, 3): 99.0}
    error = m.td_update(values, (2, 3), -10, (1, 3), True, alpha=0.25, gamma=0.9)
    if abs(values[(2, 3)] - (-5.5)) > 1e-9:
        raise CheckFailed("Into the pool, the race is over: the target is the reward alone, -10, whatever the pool's entry says.",
                          expected=-5.5, actual=values[(2, 3)])
    if error is None or abs(error - (-6.0)) > 1e-9:
        raise CheckFailed("The TD error here is -10 - (-4.0).", expected=-6.0, actual=error)


def as_steps(got, what):
    if got is None:
        raise CheckFailed(f"{what} should return a list of (tile, action, reward), one per step.", actual="None")
    out = []
    for item in got:
        if not isinstance(item, (tuple, list)) or len(item) != 3:
            raise CheckFailed(f"{what}: each step should be a tuple of three things, (tile, action, reward).", actual=repr(item))
        out.append((tuple(item[0]), item[1], item[2]))
    return out


def race_without_slipping(ctx):
    m = learn(ctx, slipping=False)
    for name, policy, start, want in [
        ("the traditional line from the start", TRADITIONAL, (2, 0),
         [((2, 0), "right", -1), ((2, 1), "right", -1), ((2, 2), "right", -1), ((2, 3), "up", -10)]),
        ("the long way from next to the finish", LONG_WAY, (0, 2), [((0, 2), "right", 10)]),
    ]:
        got = as_steps(m.episode(policy, rng(1), start), "episode")
        if got != want:
            raise CheckFailed(f"With no slipping, {name} should go like this.", expected=want, actual=got)


def race_limit(ctx):
    m = learn(ctx, slipping=False)
    stubborn = {tile: "left" for tile in RACING}
    got = as_steps(m.episode(stubborn, rng(2), (2, 0), limit=7), "episode")
    if got != [((2, 0), "left", -1)] * 7:
        raise CheckFailed("Told left at the start and never slipping, it bumps the edge for ever. With limit=7 the race should stop after 7 steps.",
                          expected=[((2, 0), "left", -1)] * 7, actual=got)


def mc_without_slipping(ctx):
    m = learn(ctx, slipping=False)
    for gamma in [0.9, 0.5]:
        close_values(m.mc_evaluate(LONG_WAY, 300, rng(3), gamma=gamma), paul_evaluate(LONG_WAY, gamma, slip=0.0),
                     f"mc_evaluate(LONG_WAY, 300, rng, gamma={gamma}) with no slipping", 1e-6)


def td_without_slipping(ctx):
    m = learn(ctx, slipping=False)
    for gamma in [0.9, 0.5]:
        close_values(m.td_evaluate(LONG_WAY, 500, rng(4), alpha=0.5, gamma=gamma), paul_evaluate(LONG_WAY, gamma, slip=0.0),
                     f"td_evaluate(LONG_WAY, 500, rng, alpha=0.5, gamma={gamma}) with no slipping", 1e-3)


def td_uses_alpha(ctx):
    m = learn(ctx)
    got = m.td_evaluate(TRADITIONAL, 50, rng(5), alpha=0.0)
    if not isinstance(got, dict) or any(abs(got.get(tile, 0.0)) > 1e-12 for tile in TILES):
        raise CheckFailed("With alpha=0.0 nothing should ever change: every worth stays 0.", actual=got)


def mc_on_the_grid(ctx):
    m = learn(ctx)
    close_values(m.mc_evaluate(TRADITIONAL, 3000, rng(6)), paul_evaluate(TRADITIONAL),
                 "Monte Carlo on the traditional line, 3000 races", 1.2)


def td_on_the_grid(ctx):
    m = learn(ctx)
    close_values(m.td_evaluate(TRADITIONAL, 3000, rng(7), alpha=0.02), paul_evaluate(TRADITIONAL),
                 "TD(0) on the traditional line, 3000 races with alpha 0.02", 2.5)


def only_step(ctx):
    import ast
    for node in ast.walk(ctx.tree):
        if isinstance(node, ast.Name) and node.id == "outcomes":
            raise CheckFailed("learn.py reads outcomes(), which is the map. A racing crab only gets step().")
        if isinstance(node, ast.alias) and node.name == "outcomes":
            raise CheckFailed("learn.py imports outcomes, which is the map. A racing crab only gets step().")


def whole_program(ctx):
    result = ctx.run_program(files={"track.py": TRACK_PY, "dp.py": DP_PY})
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    if len(result.lines()) < 9:
        raise CheckFailed("Print the values worked out from the map, then the Monte Carlo and TD values, and how far each is from the map.", actual=result.output)


TESTS = [
    custom("The return from every step", returns_by_hand, visible=True),
    custom("One TD update, by hand", one_td_update, visible=True),
    custom("Returns from short races", returns_edges, hint="An empty race has no returns: give back an empty list."),
    custom("A TD update into the pool", td_at_the_end,
           hint="When over is True, nothing comes after: the target is just the reward."),
    custom("Races without slipping", race_without_slipping,
           hint="Keep the tile it was on, the action it was told and the reward, then move it to where step() says."),
    custom("A race that never ends", race_limit, hint="Stop when the race has limit steps in it, even if it isn't over."),
    custom("Monte Carlo with no slipping", mc_without_slipping,
           hint="With no slipping every return from a tile is the same, so the average must be exactly the map's value. Check that gamma is passed on."),
    custom("TD with no slipping", td_without_slipping, hint="Pass alpha and gamma on to td_update."),
    custom("TD with alpha 0 learns nothing", td_uses_alpha),
    custom("Monte Carlo on the real grid", mc_on_the_grid,
           hint="Each race starts at random_start(rng). Average every return that followed each tile."),
    custom("TD on the real grid", td_on_the_grid),
    custom("No peeking at the map", only_step, hint="Use step(tile, action, rng) and nothing else from the grid."),
    custom("The whole program runs", whole_program),
]
