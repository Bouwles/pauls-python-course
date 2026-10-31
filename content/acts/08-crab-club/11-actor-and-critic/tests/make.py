import numpy as np

# Paul's own copy of track.py, so the checks never depend on changes made to yours.
TRACK_PY = '# The Arcade\'s racing grid, as a Markov decision process.\n# Paul\'s copy, with step() for learning by racing and average_return() for judging.\n\nfrom workshop import show_grid\n\nTRACK = [\n    "...F",\n    ".#.P",\n    "S...",\n]\nSTART = (2, 0)\nACTIONS = ["up", "down", "left", "right"]\nSTEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}\nSIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}\nSTEP_REWARD = -1\nFINISH_REWARD = 10\nPOOL_REWARD = -10\nSLIP = 0.2   # how often it goes sideways instead, half each way\n\n# Every tile it can stand on, rock excluded, finish and pool included.\nTILES = [(row, col) for row in range(len(TRACK)) for col in range(len(TRACK[0])) if TRACK[row][col] != "#"]\n\n\ndef mark(tile):\n    """The letter on a tile: \'.\', \'#\', \'F\', \'P\' or \'S\'."""\n    row, col = tile\n    return TRACK[row][col]\n\n\ndef is_over(tile):\n    """True on the finish and in the rock pool: the race is over."""\n    return mark(tile) in "FP"\n\n\n# Every tile where the race is still on.\nRACING = [tile for tile in TILES if not is_over(tile)]\n\n\ndef reward_for(tile):\n    """The reward for stepping onto tile."""\n    if mark(tile) == "F":\n        return FINISH_REWARD\n    if mark(tile) == "P":\n        return POOL_REWARD\n    return STEP_REWARD\n\n\ndef move(tile, direction):\n    """Where one step in direction leads. Off the edge or into the rock, it stays put."""\n    row, col = tile\n    d_row, d_col = STEPS[direction]\n    new_row, new_col = row + d_row, col + d_col\n    if 0 <= new_row < len(TRACK) and 0 <= new_col < len(TRACK[0]) and TRACK[new_row][new_col] != "#":\n        return (new_row, new_col)\n    return tile\n\n\ndef outcomes(tile, action, slip=SLIP):\n    """Every (probability, next tile, reward, over) that can follow action on tile."""\n    if is_over(tile):\n        return []\n    result = []\n    for chance, direction in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:\n        after = move(tile, direction)\n        result.append((chance, after, reward_for(after), is_over(after)))\n    return result\n\n\ndef step(tile, action, rng, slip=SLIP):\n    """One move on race day: (where it ends up, the reward, whether the race is over)."""\n    if rng.random() < slip:\n        action = SIDEWAYS[action][int(rng.integers(2))]\n    after = move(tile, action)\n    return after, reward_for(after), is_over(after)\n\n\ndef discounted_return(rewards, gamma=0.9):\n    """Each reward counts gamma times less than the one before it."""\n    total = 0\n    for reward in reversed(rewards):\n        total = reward + gamma * total\n    return total\n\n\ndef average_return(choose, rng, races=1000, gamma=0.9, limit=100):\n    """Race from the start races times, asking choose(tile) for each move. The average return."""\n    returns = []\n    for _ in range(races):\n        tile, rewards = START, []\n        while not is_over(tile) and len(rewards) < limit:\n            tile, reward, _ = step(tile, choose(tile), rng)\n            rewards.append(reward)\n        returns.append(discounted_return(rewards, gamma))\n    return sum(returns) / races\n\n\nARROWS = {"up": "^", "down": "v", "left": "<", "right": ">"}\n\n\ndef show_policy(policy):\n    """Print a policy (a dictionary from tile to action) as arrows on the grid."""\n    for row in range(len(TRACK)):\n        print(" ".join(ARROWS[policy[(row, col)]] if (row, col) in policy else TRACK[row][col]\n                       for col in range(len(TRACK[0]))))\n\n\ndef draw(values=None, policy=None, q=None, crab=START, title=None):\n    """Draw the grid in the output panel, one frame per call.\n\n    values and policy are dictionaries keyed by tile; q, if given, maps each\n    tile to its four action values (up, down, left, right), shown on hover.\n    """\n    rows, cols = range(len(TRACK)), range(len(TRACK[0]))\n    grid = [[None if TRACK[r][c] == "#" else (values or {}).get((r, c), 0) for c in cols] for r in rows]\n    arrows = [[(policy or {}).get((r, c)) for c in cols] for r in rows]\n    show_grid(grid, policy=arrows, q=q, crab=crab, walls=[(1, 1)], goal=[(0, 3)], title=title)\n'

TRACK = ["...F", ".#.P", "S..."]
STEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}
SIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}
ACTIONS = ["up", "down", "left", "right"]
TILES = [(r, c) for r in range(3) for c in range(4) if TRACK[r][c] != "#"]
RACING = [tile for tile in TILES if TRACK[tile[0]][tile[1]] not in "FP"]


def paul_outcomes(tile, action):
    result = []
    for chance, way in [(0.8, action)] + [(0.1, side) for side in SIDEWAYS[action]]:
        r, c = tile[0] + STEPS[way][0], tile[1] + STEPS[way][1]
        after = (r, c) if 0 <= r < 3 and 0 <= c < 4 and TRACK[r][c] != "#" else tile
        letter = TRACK[after[0]][after[1]]
        result.append((chance, after, {"F": 10, "P": -10}.get(letter, -1), letter in "FP"))
    return result


def paul_softmax(prefs):
    weights = np.exp(prefs - prefs.max())
    return weights / weights.sum()


def paul_values(theta, gamma=0.9):
    """The exact worth of every tile when every move is drawn from theta's chances."""
    values = {tile: 0.0 for tile in TILES}
    for _ in range(300):
        for tile in RACING:
            p = paul_softmax(theta[tile])
            values[tile] = sum(p[i] * sum(c * (r + (0 if over else gamma * values[after]))
                                          for c, after, r, over in paul_outcomes(tile, ACTIONS[i])) for i in range(4))
    return values


def learner(ctx):
    return ctx.module(files={"track.py": TRACK_PY})


def close(got, want, what, tol=1e-6):
    if got is None:
        raise CheckFailed(f"{what} gave back None. Did you forget to return it?")
    if not np.allclose(np.asarray(got, dtype=float), np.asarray(want, dtype=float), atol=tol):
        raise CheckFailed(f"{what} is wrong.", expected=np.round(np.asarray(want, dtype=float), 4).tolist(),
                          actual=np.round(np.asarray(got, dtype=float), 4).tolist())


def verdicts(ctx):
    m = learner(ctx)
    values = np.zeros((3, 4))
    values[2, 0], values[1, 0], values[0, 2] = 2.0, 4.0, 7.0
    close(m.td_error(values, (2, 0), -1, (1, 0), False, 0.9), 0.6, "td_error moving from (2, 0), worth 2.0, to (1, 0), worth 4.0")
    close(m.td_error(values, (0, 2), 10, (0, 3), True, 0.9), 3.0, "td_error stepping onto the finish from (0, 2), worth 7.0")


def by_hand(ctx):
    m = learner(ctx)
    theta = np.zeros((3, 4, 4))
    values = np.zeros((3, 4))
    values[2, 0], values[1, 0] = 2.0, 4.0
    error = m.update(theta, values, (2, 0), 0, -1, (1, 0), False, 0.9, 0.5, 0.25)
    close(error, 0.6, "The TD error update returns")
    close(values[2, 0], 2.15, "values[2, 0] after the critic learns (2.0 + 0.25 x 0.6)")
    want = np.zeros((3, 4, 4))
    want[2, 0] = 0.5 * 0.6 * (np.array([1.0, 0, 0, 0]) - 0.25)
    close(theta, want, "theta after the actor learns: 0.5 x 0.6 x (1 for up, minus the chances) on (2, 0)")


def other_gamma(ctx):
    m = learner(ctx)
    values = np.zeros((3, 4))
    values[1, 2], values[0, 2] = -3.0, 8.0
    close(m.td_error(values, (1, 2), -1, (0, 2), False, 0.5), 6.0, "td_error with gamma 0.5")
    close(m.td_error(values, (1, 2), -10, (1, 3), True), -7.0, "td_error falling into the pool")


def bad_news(ctx):
    m = learner(ctx)
    rng = np.random.default_rng(1)
    theta = rng.normal(0, 1, (3, 4, 4))
    values = rng.normal(0, 2, (3, 4))
    values[0, 3] = values[1, 3] = 0.0
    before_theta, before_values = theta.copy(), values.copy()
    tile, action, reward, after, over = (2, 3), 0, -10, (1, 3), True
    error = m.update(theta, values, tile, action, reward, after, over, 0.9, 0.3, 0.1)
    want_error = reward - before_values[tile]
    close(error, want_error, "The TD error for a move into the pool")
    want_values = before_values.copy()
    want_values[tile] += 0.1 * want_error
    close(values, want_values, "values after a move into the pool")
    grad = np.zeros_like(theta)
    grad[tile] = -paul_softmax(before_theta[tile])
    grad[tile][action] += 1
    close(theta, before_theta + 0.3 * want_error * grad, "theta after a move into the pool, using the chances from before the change")
    if paul_softmax(theta[tile])[action] >= paul_softmax(before_theta[tile])[action]:
        raise CheckFailed("A move that went worse than the critic expected should become less likely.")


def in_place(ctx):
    m = learner(ctx)
    theta = np.zeros((3, 4, 4))
    values = np.zeros((3, 4))
    m.update(theta, values, (0, 2), 3, 10, (0, 3), True)
    if values[0, 2] == 0 or not theta[0, 2].any():
        raise CheckFailed("update should change the theta and values it is given, in place.")


def the_clip(ctx):
    m = learner(ctx)
    for args, want in [((1.5, 2.0), 2.4), ((0.5, 2.0), 1.0), ((1.5, -2.0), -3.0), ((0.5, -2.0), -1.6)]:
        close(m.clipped_objective(*args), want, f"clipped_objective{args}")


def more_clips(ctx):
    m = learner(ctx)
    close(m.clipped_objective(1.1, 2.0), 2.2, "clipped_objective(1.1, 2.0), inside the range")
    close(m.clipped_objective(1.5, 2.0, epsilon=0.1), 2.2, "clipped_objective(1.5, 2.0, epsilon=0.1)")
    close(m.clipped_objective(np.array([0.5, 1.0, 1.5, 1.5]), np.array([2.0, 2.0, 2.0, -1.0])), [1.0, 2.0, 2.4, -1.5],
          "clipped_objective on arrays of ratios and advantages")


def critic_alone(ctx):
    m = learner(ctx)
    result = m.train(400, np.random.default_rng(2), actor_rate=0.0, critic_rate=0.1)
    if not isinstance(result, tuple) or len(result) != 2:
        raise CheckFailed("train should return two things: return theta, values", actual=repr(result)[:80])
    theta, values = result
    truth = paul_values(np.zeros((3, 4, 4)))
    gap = np.mean([abs(values[tile] - truth[tile]) for tile in RACING])
    if gap > 2.0:
        raise CheckFailed("With actor_rate=0 it races at random for ever, and the critic should learn what random racing is worth.",
                          expected="within 2 of the true values on average", actual=f"{gap:.2f} out on average")


def learns(ctx):
    m = learner(ctx)
    result = m.train(150, np.random.default_rng(1))
    if not isinstance(result, tuple) or len(result) != 2:
        raise CheckFailed("train should return two things: return theta, values", actual=repr(result)[:80])
    theta, values = result
    worth = paul_values(np.asarray(theta, dtype=float))[(2, 0)]
    if worth < -3:
        raise CheckFailed("After 150 races its policy should be worth far more than racing at random (-9.1).",
                          expected="more than -3", actual=round(worth, 2))


def whole_program(ctx):
    result = ctx.run_program(files={"track.py": TRACK_PY})
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    if len(result.lines()) < 8:
        raise CheckFailed("Print its moves, the critic's values, its average return, and PPO's clip four times.", actual=result.output)


TESTS = [
    custom("The critic's verdict", verdicts, visible=True),
    custom("One step of actor-critic, by hand", by_hand, visible=True),
    custom("Verdicts with another gamma, and the pool", other_gamma, hint="When the race is over, nothing comes after: leave out gamma times values[after]."),
    custom("A move into the pool", bad_news, hint="Work out the error and grad_log_chance first, then change values and theta."),
    custom("update changes the arrays it is given", in_place, hint="values[tile] += ... and theta += ... change the caller's arrays; theta = theta + ... doesn't."),
    custom("PPO's clip", the_clip),
    custom("More clips, and arrays", more_clips, hint="np.minimum(ratio * advantage, np.clip(ratio, 1 - epsilon, 1 + epsilon) * advantage) works for arrays too."),
    custom("The critic on its own", critic_alone, timeout=20),
    custom("150 races and it races well", learns, timeout=20),
    custom("The whole program runs", whole_program, timeout=20),
]
