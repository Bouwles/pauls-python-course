import numpy as np

# Moss's own copy of track.py, so the checks never depend on changes made to yours.
TRACK_PY = '# The committee\'s racing grid, as a Markov decision process.\n# Moss\'s copy, with step() for learning by racing and average_return() for judging.\n\nfrom saltmarsh import show_grid\n\nTRACK = [\n    "...F",\n    ".#.P",\n    "S...",\n]\nSTART = (2, 0)\nACTIONS = ["up", "down", "left", "right"]\nSTEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}\nSIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}\nSTEP_REWARD = -1\nFINISH_REWARD = 10\nPOOL_REWARD = -10\nSLIP = 0.2   # how often he goes sideways instead, half each way\n\n# Every tile he can stand on, rock excluded, finish and pool included.\nTILES = [(row, col) for row in range(len(TRACK)) for col in range(len(TRACK[0])) if TRACK[row][col] != "#"]\n\n\ndef mark(tile):\n    """The letter on a tile: \'.\', \'#\', \'F\', \'P\' or \'S\'."""\n    row, col = tile\n    return TRACK[row][col]\n\n\ndef is_over(tile):\n    """True on the finish and in the rock pool: the race is over."""\n    return mark(tile) in "FP"\n\n\n# Every tile where the race is still on.\nRACING = [tile for tile in TILES if not is_over(tile)]\n\n\ndef reward_for(tile):\n    """The reward for stepping onto tile."""\n    if mark(tile) == "F":\n        return FINISH_REWARD\n    if mark(tile) == "P":\n        return POOL_REWARD\n    return STEP_REWARD\n\n\ndef move(tile, direction):\n    """Where one step in direction leads. Off the edge or into the rock, he stays put."""\n    row, col = tile\n    d_row, d_col = STEPS[direction]\n    new_row, new_col = row + d_row, col + d_col\n    if 0 <= new_row < len(TRACK) and 0 <= new_col < len(TRACK[0]) and TRACK[new_row][new_col] != "#":\n        return (new_row, new_col)\n    return tile\n\n\ndef outcomes(tile, action, slip=SLIP):\n    """Every (probability, next tile, reward, over) that can follow action on tile."""\n    if is_over(tile):\n        return []\n    result = []\n    for chance, direction in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:\n        after = move(tile, direction)\n        result.append((chance, after, reward_for(after), is_over(after)))\n    return result\n\n\ndef step(tile, action, rng, slip=SLIP):\n    """One move on race day: (where he ends up, the reward, whether the race is over)."""\n    if rng.random() < slip:\n        action = SIDEWAYS[action][int(rng.integers(2))]\n    after = move(tile, action)\n    return after, reward_for(after), is_over(after)\n\n\ndef discounted_return(rewards, gamma=0.9):\n    """Each reward counts gamma times less than the one before it."""\n    total = 0\n    for reward in reversed(rewards):\n        total = reward + gamma * total\n    return total\n\n\ndef average_return(choose, rng, races=1000, gamma=0.9, limit=100):\n    """Race from the start races times, asking choose(tile) for each move. The average return."""\n    returns = []\n    for _ in range(races):\n        tile, rewards = START, []\n        while not is_over(tile) and len(rewards) < limit:\n            tile, reward, _ = step(tile, choose(tile), rng)\n            rewards.append(reward)\n        returns.append(discounted_return(rewards, gamma))\n    return sum(returns) / races\n\n\nARROWS = {"up": "^", "down": "v", "left": "<", "right": ">"}\n\n\ndef show_policy(policy):\n    """Print a policy (a dictionary from tile to action) as arrows on the grid."""\n    for row in range(len(TRACK)):\n        print(" ".join(ARROWS[policy[(row, col)]] if (row, col) in policy else TRACK[row][col]\n                       for col in range(len(TRACK[0]))))\n\n\ndef draw(values=None, policy=None, q=None, crab=START, title=None):\n    """Draw the grid in the output panel, one frame per call.\n\n    values and policy are dictionaries keyed by tile; q, if given, maps each\n    tile to its four action values (up, down, left, right), shown on hover.\n    """\n    rows, cols = range(len(TRACK)), range(len(TRACK[0]))\n    grid = [[None if TRACK[r][c] == "#" else (values or {}).get((r, c), 0) for c in cols] for r in rows]\n    arrows = [[(policy or {}).get((r, c)) for c in cols] for r in rows]\n    show_grid(grid, policy=arrows, q=q, crab=crab, walls=[(1, 1)], goal=[(0, 3)], title=title)\n'

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


def moss_softmax(prefs):
    weights = np.exp(prefs - prefs.max())
    return weights / weights.sum()


def moss_values(theta, gamma=0.9):
    """The exact worth of every tile when every move is drawn from theta's chances."""
    values = {tile: 0.0 for tile in TILES}
    for _ in range(300):
        for tile in RACING:
            p = moss_softmax(theta[tile])
            values[tile] = sum(p[i] * sum(c * (r + (0 if over else gamma * values[after]))
                                          for c, after, r, over in moss_outcomes(tile, ACTIONS[i])) for i in range(4))
    return values


def moss_step(tile, action, rng):
    if rng.random() < 0.2:
        action = SIDEWAYS[action][int(rng.integers(2))]
    r, c = tile[0] + STEPS[action][0], tile[1] + STEPS[action][1]
    after = (r, c) if 0 <= r < 3 and 0 <= c < 4 and TRACK[r][c] != "#" else tile
    letter = TRACK[after[0]][after[1]]
    return after, {"F": 10, "P": -10}.get(letter, -1), letter in "FP"


def moss_race(theta, rng, limit=50):
    tile, moves = (2, 0), []
    while TRACK[tile[0]][tile[1]] not in "FP" and len(moves) < limit:
        action = int(rng.choice(4, p=moss_softmax(theta[tile])))
        after, reward, _ = moss_step(tile, ACTIONS[action], rng)
        moves.append((tile, action, reward))
        tile = after
    return moves


def moss_gradient(theta, races, gamma=0.9, baseline=None):
    grad = np.zeros_like(theta)
    for moves in races:
        total, later = 0.0, []
        for _, _, reward in reversed(moves):
            total = reward + gamma * total
            later.append(total)
        for (tile, action, _), ret in zip(moves, reversed(later)):
            score = ret - (0 if baseline is None else baseline[tile])
            g = -moss_softmax(theta[tile])
            g[action] += 1
            grad[tile] += score * g
    return grad / len(races)


RACES = [
    [((2, 0), 0, -1), ((1, 0), 0, -1), ((0, 0), 3, -1), ((0, 1), 3, -1), ((0, 2), 3, 10)],
    [((2, 0), 3, -1), ((2, 1), 3, -1), ((2, 2), 3, -1), ((2, 3), 0, -10)],
    [((2, 0), 0, -1), ((2, 0), 0, -1), ((1, 0), 2, -1), ((1, 0), 0, -1), ((0, 0), 3, -1)],
]


def some_theta(seed):
    return np.random.default_rng(seed).normal(0, 1, (3, 4, 4))


def learner(ctx):
    return ctx.module(files={"track.py": TRACK_PY})


def same_array(got, want, what, tol=1e-6):
    if got is None:
        raise CheckFailed(f"{what} gave back None. Did you forget to return it?")
    got = np.asarray(got, dtype=float)
    want = np.asarray(want, dtype=float)
    if got.shape != want.shape:
        raise CheckFailed(f"{what} should have shape {want.shape}.", expected=str(want.shape), actual=str(got.shape))
    if not np.allclose(got, want, atol=tol):
        raise CheckFailed(f"{what} has the wrong numbers.", expected=np.round(want, 4).tolist(), actual=np.round(got, 4).tolist())


def even_chances(ctx):
    m = learner(ctx)
    theta = np.zeros((3, 4, 4))
    same_array(m.chances(theta, (2, 0)), [0.25] * 4, "chances(theta, (2, 0)) with every preference 0")
    theta[(0, 2)] = [2.0, 0.0, 0.0, 1.0]
    same_array(m.chances(theta, (0, 2)), moss_softmax(theta[(0, 2)]), "chances for preferences [2, 0, 0, 1]")


def fixed_batch(ctx):
    m = learner(ctx)
    theta = some_theta(1)
    same_array(m.reinforce_gradient(theta, RACES, 0.9), moss_gradient(theta, RACES, 0.9),
               "reinforce_gradient on three fixed races, no baseline")


def huge_preferences(ctx):
    m = learner(ctx)
    theta = np.zeros((3, 4, 4))
    theta[(2, 0)] = [1000.0, 999.0, 0.0, -5.0]
    got = m.chances(theta, (2, 0))
    if got is None or not np.all(np.isfinite(got)):
        raise CheckFailed("With preferences like 1000, the chances came out as nan or inf.", actual=repr(got))
    same_array(got, moss_softmax(theta[(2, 0)]), "chances for preferences [1000, 999, 0, -5]")


def measured_gradient(ctx):
    m = learner(ctx)
    theta = some_theta(2)
    for tile, action in [((2, 0), 0), ((1, 2), 3), ((0, 1), 2)]:
        got = m.grad_log_chance(theta, tile, action)
        want = np.zeros_like(theta)
        for i in range(4):
            up, down = theta.copy(), theta.copy()
            up[tile][i] += 1e-6
            down[tile][i] -= 1e-6
            want[tile][i] = (np.log(moss_softmax(up[tile])[action]) - np.log(moss_softmax(down[tile])[action])) / 2e-6
        same_array(got, want, f"grad_log_chance(theta, {tile}, {action}) against the gradient measured by nudging", tol=1e-5)


def to_go(ctx):
    m = learner(ctx)
    for rewards, gamma, want in [([-1, -1, 10], 0.9, [6.2, 8.0, 10.0]), ([5], 0.9, [5]), ([-2, 0, 8], 0.5, [0.0, 4.0, 8.0]), ([], 0.9, [])]:
        got = m.returns_to_go(rewards, gamma)
        if got is None or len(got) != len(want) or not np.allclose(np.asarray(got, dtype=float), want):
            raise CheckFailed(f"returns_to_go({rewards}, {gamma}) should be {want}.", expected=want, actual=got)


def with_baseline(ctx):
    m = learner(ctx)
    theta = some_theta(3)
    baseline = np.random.default_rng(4).normal(-3, 2, (3, 4))
    same_array(m.reinforce_gradient(theta, RACES, 0.9, baseline), moss_gradient(theta, RACES, 0.9, baseline),
               "reinforce_gradient on three fixed races, with a baseline")
    same_array(m.reinforce_gradient(theta, RACES[:1], 0.5), moss_gradient(theta, RACES[:1], 0.5),
               "reinforce_gradient on one race, gamma 0.5")


def one_race(ctx):
    m = learner(ctx)
    theta = np.full((3, 4, 4), -30.0)
    for tile, action in {(2, 0): 0, (1, 0): 0, (0, 0): 3, (0, 1): 3, (0, 2): 3, (2, 1): 2, (2, 2): 0, (1, 2): 0, (2, 3): 2}.items():
        theta[tile][action] = 30.0
    rng = np.random.default_rng(5)
    for _ in range(20):
        moves = m.race(theta, rng)
        if not isinstance(moves, list) or not moves:
            raise CheckFailed("race should return a list of (tile, action, reward), one for every move.", actual=repr(moves)[:80])
        if tuple(moves[0][0]) != (2, 0):
            raise CheckFailed("Every race starts at (2, 0).", actual=moves[0])
        for tile, action, reward in moves:
            if int(action) != int(np.argmax(theta[tuple(tile)])):
                raise CheckFailed(f"On {tuple(tile)} his preferences make one move all but certain, but the race has action {action}. "
                                  "Draw each move from chances(theta, tile).", actual=moves)
        if moves[-1][2] not in (10, -10) and len(moves) < 50:
            raise CheckFailed("A race goes on until the finish, the pool, or the limit.", actual=moves)


def by_chance(ctx):
    m = learner(ctx)
    theta = np.zeros((3, 4, 4))
    theta[(2, 0)] = [np.log(3.0), 0.0, 0.0, 0.0]
    rng = np.random.default_rng(6)
    first = [int(m.race(theta, rng, limit=1)[0][1]) for _ in range(2000)]
    share = first.count(0) / 2000
    if abs(share - 0.5) > 0.04:
        raise CheckFailed("With preferences [ln 3, 0, 0, 0] at the start, up should be his first move half the time.",
                          expected="about 50%", actual=f"{share:.0%}")
    if len(m.race(np.zeros((3, 4, 4)), rng, limit=3)) > 3:
        raise CheckFailed("With limit=3, a race stops after 3 moves at most.")


def steadier(ctx):
    m = learner(ctx)
    theta = np.zeros((3, 4, 4))
    values = moss_values(theta)
    baseline = np.zeros((3, 4))
    for tile, value in values.items():
        baseline[tile] = value
    rng = np.random.default_rng(7)
    batches = [[moss_race(theta, rng) for _ in range(4)] for _ in range(80)]
    plain = np.array([m.reinforce_gradient(theta, batch) for batch in batches])
    steady = np.array([m.reinforce_gradient(theta, batch, baseline=baseline) for batch in batches])
    plain_spread, steady_spread = np.sqrt(plain.var(axis=0).sum()), np.sqrt(steady.var(axis=0).sum())
    if not steady_spread < 0.75 * plain_spread:
        raise CheckFailed("With each tile's true worth as the baseline, 80 estimates should disagree far less than with none.",
                          expected=f"well under {plain_spread:.1f}", actual=round(float(steady_spread), 1))


def learns(ctx):
    m = learner(ctx)
    result = m.train(300, np.random.default_rng(1))
    if not isinstance(result, tuple) or len(result) != 2:
        raise CheckFailed("train should return two things: return theta, baseline", actual=repr(result)[:80])
    theta, baseline = result
    if np.asarray(baseline).shape != (3, 4):
        raise CheckFailed("The baseline should be a (3, 4) array: a number for every tile.", actual=str(np.asarray(baseline).shape))
    worth = moss_values(np.asarray(theta, dtype=float))[(2, 0)]
    if worth < -3:
        raise CheckFailed("After 300 races his policy should be worth far more than racing at random (-9.1).",
                          expected="more than -3", actual=round(worth, 2))


def whole_program(ctx):
    result = ctx.run_program(files={"track.py": TRACK_PY})
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    if len(result.lines()) < 4:
        raise CheckFailed("Print the two spreads, his most likely moves and his average return.", actual=result.output)


TESTS = [
    custom("Even chances to start", even_chances, visible=True),
    custom("REINFORCE on a fixed batch of races", fixed_batch, visible=True),
    custom("Huge preferences", huge_preferences, hint="Take the biggest preference away from all four before exp. The chances don't change, and exp can't overflow."),
    custom("The gradient of log chance, measured", measured_gradient),
    custom("Returns to go", to_go, hint="Work backwards: total = reward + gamma * total, keeping each total, then turn the list round."),
    custom("REINFORCE with a baseline", with_baseline, hint="Take the tile's baseline away from each return before multiplying."),
    custom("A race follows his chances", one_race),
    custom("Moves drawn by chance", by_chance, hint="rng.choice(4, p=chances(theta, tile)) draws one move with those chances."),
    custom("A baseline steadies the estimates", steadier),
    custom("300 races and he races well", learns, timeout=20,
           hint="Each episode: one race, theta += rate * reinforce_gradient(theta, [moves], gamma, baseline), then the baseline nudged towards each return."),
    custom("The whole program runs", whole_program, timeout=20),
]
