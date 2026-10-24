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


def moss_worth(policy, gamma=0.9):
    """The exact expected return from the start under a policy."""
    values = {tile: 0.0 for tile in TILES}
    for _ in range(300):
        for tile in RACING:
            values[tile] = sum(p * (r + (0 if over else gamma * values[after]))
                               for p, after, r, over in moss_outcomes(tile, policy[tile]))
    return values[(2, 0)]


def moss_features(tile):
    x = np.zeros(7)
    x[tile[0]] = 1.0
    x[3 + tile[1]] = 1.0
    return x


def moss_q(params, X):
    return np.maximum(0, X @ params["W1"] + params["b1"]) @ params["W2"] + params["b2"]


def moss_params(seed, hidden=5):
    rng = np.random.default_rng(seed)
    return {"W1": rng.normal(0, 0.6, (7, hidden)), "b1": rng.normal(0, 0.1, hidden),
            "W2": rng.normal(0, 0.6, (hidden, 4)), "b2": rng.normal(0, 0.1, 4)}


def moss_targets(target_params, rewards, X_after, overs, gamma):
    return rewards + gamma * moss_q(target_params, X_after).max(axis=1) * (1 - overs)


def moss_loss(params, batch, y):
    X = np.array([moss_features(t) for t, _, _, _, _ in batch])
    actions = np.array([a for _, a, _, _, _ in batch])
    return np.mean((moss_q(params, X)[np.arange(len(batch)), actions] - y) ** 2)


BATCH = [((2, 0), 0, -1, (1, 0), False), ((2, 2), 0, -1, (1, 2), False), ((1, 2), 0, -1, (0, 2), False),
         ((0, 2), 3, 10, (0, 3), True), ((2, 3), 0, -10, (1, 3), True), ((2, 1), 2, -1, (2, 0), False)]


def batch_targets(target_params, batch, gamma=0.9):
    rewards = np.array([r for _, _, r, _, _ in batch], dtype=float)
    X_after = np.array([moss_features(t) for _, _, _, t, _ in batch])
    overs = np.array([o for _, _, _, _, o in batch], dtype=float)
    return moss_targets(target_params, rewards, X_after, overs, gamma)


def dqn(ctx):
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


def seven_numbers(ctx):
    m = dqn(ctx)
    same_array(m.features((2, 0)), [0, 0, 1, 1, 0, 0, 0], "features((2, 0)), the start")
    same_array(m.features((0, 3)), [1, 0, 0, 0, 0, 0, 1], "features((0, 3)), the finish")


def target_numbers(ctx):
    m = dqn(ctx)
    frozen = moss_params(4)
    rewards = np.array([-1.0, 10.0, -1.0, -10.0])
    after = [(1, 0), (0, 3), (2, 1), (1, 3)]
    X_after = np.array([moss_features(t) for t in after])
    overs = np.array([0.0, 1.0, 0.0, 1.0])
    got = m.targets(frozen, rewards, X_after, overs, 0.9)
    same_array(got, moss_targets(frozen, rewards, X_after, overs, 0.9), "targets for four moves, two of them ending the race")


def more_features(ctx):
    m = dqn(ctx)
    for tile in [(1, 2), (0, 0), (2, 3)]:
        same_array(m.features(tile), moss_features(tile), f"features({tile})")


def the_network(ctx):
    m = dqn(ctx)
    params = moss_params(1)
    X = np.array([moss_features(t) for t in [(2, 0), (0, 2), (1, 0)]])
    same_array(m.q_values(params, X), moss_q(params, X), "q_values for three tiles at once")


def targets_other_gamma(ctx):
    m = dqn(ctx)
    frozen = moss_params(5)
    rewards = np.array([-1.0, -1.0])
    X_after = np.array([moss_features((0, 2)), moss_features((2, 2))])
    overs = np.array([0.0, 0.0])
    same_array(m.targets(frozen, rewards, X_after, overs, 0.5), moss_targets(frozen, rewards, X_after, overs, 0.5),
               "targets with gamma 0.5")


def remembers(ctx):
    m = dqn(ctx)
    memory = m.ReplayBuffer(5)
    for i in range(3):
        memory.add((2, i), 3, -1, (2, i + 1), False)
    if len(memory) != 3:
        raise CheckFailed("Three moves remembered, so len(memory) should be 3.", expected=3, actual=len(memory))
    for i in range(3, 7):
        memory.add((2, i % 4), 3, -1, (2, (i + 1) % 4), False)
    if len(memory) != 5:
        raise CheckFailed("A buffer of capacity 5 holds at most 5 memories.", expected=5, actual=len(memory))
    tiles = sorted(tuple(item[0]) for item in memory.sample(5, np.random.default_rng(1)))
    want = sorted([(2, i % 4) for i in range(2, 7)])
    if tiles != want:
        raise CheckFailed("After seven moves in a buffer of five, the two oldest should be gone.", expected=want, actual=tiles)


def same_seed_same_batch(ctx):
    m = dqn(ctx)
    memory = m.ReplayBuffer(100)
    for i in range(20):
        memory.add((i // 4 % 3, i % 4), i % 4, -i, (0, 0), False)
    first = memory.sample(6, np.random.default_rng(11))
    second = memory.sample(6, np.random.default_rng(11))
    if first is None or len(first) != 6:
        raise CheckFailed("sample(6, rng) should give back a list of 6 memories.", actual=repr(first))
    rewards = [item[2] for item in first]
    if len(set(rewards)) != 6:
        raise CheckFailed("A batch should be 6 different memories, none picked twice.", actual=rewards)
    if [item[2] for item in second] != rewards:
        raise CheckFailed("The same seed should pick the same batch. Use the rng you're given for every random choice.",
                          expected=rewards, actual=[item[2] for item in second])
    if rewards in ([-i for i in range(6)], [-i for i in range(14, 20)]):
        raise CheckFailed("The batch came out in the order the moves happened. Pick it at random.", actual=rewards)


def fair_sampling(ctx):
    m = dqn(ctx)
    memory = m.ReplayBuffer(10)
    for i in range(5):
        memory.add((2, 0), 0, i, (1, 0), False)
    rng = np.random.default_rng(3)
    tally = np.zeros(5)
    for _ in range(1500):
        for item in memory.sample(2, rng):
            tally[int(item[2])] += 1
    shares = tally / tally.sum()
    if np.abs(shares - 0.2).max() > 0.03:
        raise CheckFailed("Every memory should be just as likely to be picked.", expected="about 20% each",
                          actual=", ".join(f"{s:.0%}" for s in shares))


def one_step(ctx):
    m = dqn(ctx)
    params, frozen = moss_params(2), moss_params(3)
    keep = {k: v.copy() for k, v in frozen.items()}
    y = batch_targets(frozen, BATCH)
    before = moss_loss(params, BATCH, y)
    got = m.train_step(params, frozen, BATCH, 0.9, 0.05)
    if got is None or abs(float(got) - before) > 1e-6:
        raise CheckFailed("train_step should return the loss on the batch before the step.", expected=round(before, 4), actual=got)
    for k in keep:
        if not np.array_equal(frozen[k], keep[k]):
            raise CheckFailed(f"train_step changed the frozen copy's {k}. Only params should learn.")
    after = moss_loss(params, BATCH, y)
    if not after < before - 1e-4:
        raise CheckFailed("After one step the TD error on the same batch should be smaller.", expected=f"less than {before:.4f}", actual=round(after, 4))


def step_uses_frozen_targets(ctx):
    m = dqn(ctx)
    params, frozen = moss_params(6), moss_params(7)
    work = {k: v.copy() for k, v in params.items()}
    m.train_step(work, frozen, BATCH, 0.9, 0.01)
    # Moss's own step, with the frozen copy's targets.
    y = batch_targets(frozen, BATCH)
    X = np.array([moss_features(t) for t, _, _, _, _ in BATCH])
    actions = np.array([a for _, a, _, _, _ in BATCH])
    eps = 1e-6
    for name in ["b2", "W2"]:
        grad = np.zeros_like(params[name])
        for index in np.ndindex(params[name].shape):
            up = {k: v.copy() for k, v in params.items()}
            down = {k: v.copy() for k, v in params.items()}
            up[name][index] += eps
            down[name][index] -= eps
            grad[index] = (moss_loss(up, BATCH, y) - moss_loss(down, BATCH, y)) / (2 * eps)
        want = params[name] - 0.01 * grad
        if not np.allclose(work[name], want, atol=1e-5):
            raise CheckFailed(f"After train_step, {name} isn't where one gradient step on the frozen copy's targets puts it. "
                              "Work out the targets with target_params, then step params by rate times the gradient.")


def explores_less(ctx):
    m = dqn(ctx)
    for args, want in [((0,), 1.0), ((50,), 0.525), ((100,), 0.05), ((400,), 0.05)]:
        got = m.epsilon_at(*args)
        if got is None or abs(got - want) > 1e-9:
            raise CheckFailed(f"epsilon_at{args} should be {want}.", expected=want, actual=got)


def explores_less_quicker(ctx):
    m = dqn(ctx)
    for args, want in [((5, 10), 0.525), ((10, 10), 0.05), ((1, 20), 0.9525)]:
        got = m.epsilon_at(*args)
        if got is None or abs(got - want) > 1e-9:
            raise CheckFailed(f"epsilon_at{args} should be {want}.", expected=want, actual=got)


def a_real_copy(ctx):
    m = dqn(ctx)
    params = moss_params(8)
    frozen = m.copy_params(params)
    if not isinstance(frozen, dict) or set(frozen) != set(params):
        raise CheckFailed("copy_params should give back a dictionary with the same keys: W1, b1, W2, b2.", actual=repr(frozen)[:80])
    for k in params:
        if not np.array_equal(frozen[k], params[k]):
            raise CheckFailed(f"The copy's {k} should start equal to the original's.")
    params["W2"] -= 1.0
    params["b1"] += 1.0
    if np.array_equal(frozen["W2"], params["W2"]) or np.array_equal(frozen["b1"], params["b1"]):
        raise CheckFailed("Training params changed the frozen copy too. Two names for the same arrays aren't a copy: each array needs .copy().")


def learns_the_track(ctx):
    m = dqn(ctx)
    params = m.train(150, np.random.default_rng(2))
    if not isinstance(params, dict):
        raise CheckFailed("train should return the trained params.", actual=repr(params)[:80])
    X = np.array([moss_features(t) for t in RACING])
    q = moss_q(params, X)
    line = {tile: ACTIONS[int(np.argmax(row))] for tile, row in zip(RACING, q)}
    worth = moss_worth(line)
    if worth < -2.5:
        raise CheckFailed("After 150 races, the network's line should be worth far more than racing at random (-9.1) "
                          "or the traditional line (-7.6).", expected="more than -2.5", actual=round(worth, 2))


def whole_program(ctx):
    result = ctx.run_program(files={"track.py": TRACK_PY})
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    if len(result.lines()) < 4:
        raise CheckFailed("Print the network's line, its average return, and the random crab's.", actual=result.output)


TESTS = [
    custom("Seven numbers for a tile", seven_numbers, visible=True),
    custom("Targets, by the frozen copy", target_numbers, visible=True),
    custom("Features for other tiles", more_features),
    custom("The network", the_network, hint="A ReLU hidden layer, X @ W1 + b1, then hidden @ W2 + b2: one row of four Q-values per row of X."),
    custom("Targets with another gamma", targets_other_gamma),
    custom("The buffer forgets the oldest", remembers, hint="When there are more than capacity memories, drop the first one added."),
    custom("Same seed, same batch", same_seed_same_batch, hint="rng.choice(len(memories), size=size, replace=False) picks different positions at random."),
    custom("Every memory equally likely", fair_sampling),
    custom("One step makes the TD error smaller", one_step, hint="Return the loss that gradients() gives you, from before the weights move."),
    custom("The step chases the frozen targets", step_uses_frozen_targets),
    custom("Exploring less", explores_less, hint="A straight line from 1.0 at race 0 to 0.05 at race decay."),
    custom("Exploring less, sooner", explores_less_quicker),
    custom("A frozen copy that stays frozen", a_real_copy, hint="{name: weights for ...} copies the dictionary, not the arrays inside it."),
    custom("150 races and he knows the track", learns_the_track, timeout=20,
           hint="Remember every move; once there are 32 memories, one train_step per move; refresh the frozen copy every 50 moves."),
    custom("The whole program runs", whole_program, timeout=20),
]
