import json

import numpy as np

# The League's rules, copied by Paul, so the checks never depend on course.py.
LAYOUT = [
    "S...#....",
    ".#..#.~..",
    ".#....~..",
    "...##...#",
    ".~....#..",
    ".~#...#..",
    "....#...F",
]
ROWS, COLS = 7, 9
START, FINISH = (0, 0), (6, 8)
STEPS = [(-1, 0), (1, 0), (0, -1), (0, 1)]
SIDEWAYS = [(2, 3), (2, 3), (0, 1), (0, 1)]
RACES = 200
TO_BEAT = 17.0   # the shortest route, followed blindly, averages about 17.1 moves


def paul_race(policy, rng):
    tile = START
    for moves in range(1, 101):
        action = int(policy[tile[0]][tile[1]])
        if rng.random() < (0.35 if LAYOUT[tile[0]][tile[1]] == "~" else 0.1):
            action = SIDEWAYS[action][0 if rng.random() < 0.5 else 1]
        row, col = tile[0] + STEPS[action][0], tile[1] + STEPS[action][1]
        if 0 <= row < ROWS and 0 <= col < COLS and LAYOUT[row][col] != "#":
            tile = (row, col)
        if tile == FINISH:
            return moves
    return 100


def judge(q, what):
    """Race the greedy policy of a Q-table RACES times on fixed seeds, as the League would."""
    q = np.asarray(q, dtype=float)
    if q.shape != (ROWS, COLS, 4):
        raise CheckFailed(f"{what}: the Q-table should be {ROWS} rows by {COLS} columns by 4 actions.", expected=(ROWS, COLS, 4), actual=q.shape)
    policy = q.argmax(axis=2)
    moves = [paul_race(policy, np.random.default_rng(1000 + i)) for i in range(RACES)]
    finished = sum(1 for m in moves if m < 100)
    mean = sum(moves) / RACES
    if finished < RACES - 2:
        stuck = [(r, c) for r in range(ROWS) for c in range(COLS) if LAYOUT[r][c] not in "#F"
                 and LAYOUT[min(max(r + STEPS[policy[r][c]][0], 0), ROWS - 1)][min(max(c + STEPS[policy[r][c]][1], 0), COLS - 1)] == "#"]
        raise CheckFailed(f"{what}: the crab finished only {finished} of {RACES} test races in 100 moves. "
                          f"Somewhere its best move walks into a rock or off the course, or two tiles send it back and forth."
                          + (f" Tiles pointing at a rock: {stuck[:4]}." if stuck else ""),
                          expected=f"at least {RACES - 2} finished", actual=finished)
    if mean >= TO_BEAT:
        raise CheckFailed(f"{what}: {mean:.2f} moves on average over {RACES} test races. Beat {TO_BEAT}: the shortest route, followed blindly, manages about 17.1.",
                          expected=f"under {TO_BEAT}", actual=round(mean, 2))
    return mean


def crab(ctx):
    return ctx.module()


def rng(seed):
    return np.random.default_rng(seed)


def one_update(ctx):
    m = crab(ctx)
    Q = np.zeros((ROWS, COLS, 4))
    Q[0, 1] = [-5.0, -4.0, -6.0, -3.0]
    error = m.q_update(Q, (0, 0), 3, -1, (0, 1), False, alpha=0.5, gamma=1.0)
    if abs(Q[0, 0, 3] - (-2.0)) > 1e-9:
        raise CheckFailed("Right from the start onto (0, 1), whose best action is worth -3: the target is -1 + -3 = -4, and alpha 0.5 moves Q half way there.",
                          expected=-2.0, actual=float(Q[0, 0, 3]))
    if error is None or abs(error - (-4.0)) > 1e-9:
        raise CheckFailed("q_update should return the TD error: the target minus the old Q-value.", expected=-4.0, actual=error)
    if np.count_nonzero(Q[0, 0]) != 1:
        raise CheckFailed("Only the action it took should change.", actual=Q[0, 0].tolist())


def learns_the_course(ctx):
    m = crab(ctx)
    Q = m.train(3000, rng(11))
    judge(Q, "train(3000, rng)")


def update_at_finish(ctx):
    m = crab(ctx)
    Q = np.zeros((ROWS, COLS, 4))
    Q[6, 8] = [50.0, 50.0, 50.0, 50.0]
    Q[6, 7, 3] = -1.5
    m.q_update(Q, (6, 7), 3, -1, (6, 8), True, alpha=0.5, gamma=1.0)
    if abs(Q[6, 7, 3] - (-1.25)) > 1e-9:
        raise CheckFailed("Onto the finish, the race is over: the target is the reward alone, -1, whatever the finish's entries say.",
                          expected=-1.25, actual=float(Q[6, 7, 3]))


def best_next_action(ctx):
    m = crab(ctx)
    Q = np.zeros((ROWS, COLS, 4))
    Q[2, 3] = [-9.0, -2.0, -9.0, -9.0]
    m.q_update(Q, (2, 2), 3, -1, (2, 3), False, alpha=1.0, gamma=0.5)
    if abs(Q[2, 2, 3] - (-2.0)) > 1e-9:
        raise CheckFailed("Q-learning's target uses the best action on the next tile, here -2.0, and gamma: -1 + 0.5 × -2.0.",
                          expected=-2.0, actual=float(Q[2, 2, 3]))


def choosing_greedily(ctx):
    m = crab(ctx)
    Q = np.zeros((ROWS, COLS, 4))
    Q[4, 4] = [-3.0, -1.0, -2.0, -5.0]
    for tile, want in [((4, 4), 1), ((2, 2), 0)]:
        got = m.choose(Q, tile, 0.0, rng(1))
        if got != want:
            raise CheckFailed(f"With epsilon 0, choose should give the action with the biggest Q-value on {tile}"
                              + (" (on a tie, the first, as np.argmax does)." if want == 0 else "."), expected=want, actual=got)


def exploring(ctx):
    m = crab(ctx)
    Q = np.zeros((ROWS, COLS, 4))
    Q[4, 4] = [-3.0, -2.0, -2.0, -1.0]
    generator = rng(2)
    counts = [0, 0, 0, 0]
    for _ in range(4000):
        counts[int(m.choose(Q, (4, 4), 1.0, generator))] += 1
    if min(counts) < 850 or max(counts) > 1150:
        raise CheckFailed("With epsilon 1, every action should come up about equally often.", expected="about 1000 each", actual=counts)
    best = sum(1 for _ in range(4000) if int(m.choose(Q, (4, 4), 0.2, generator)) == 3) / 4000
    if not 0.81 <= best <= 0.89:
        raise CheckFailed("With epsilon 0.2, the best action should come up about 85 times in 100: 80 when exploiting, and 5 more when exploring picks it.",
                          expected="about 0.85", actual=round(best, 3))


def greedy_grid(ctx):
    m = crab(ctx)
    Q = rng(3).normal(size=(ROWS, COLS, 4))
    got = m.greedy_policy(Q)
    want = Q.argmax(axis=2).tolist()
    try:
        same = [[int(a) for a in row] for row in got] == want
    except (TypeError, ValueError):
        same = False
    if not same:
        raise CheckFailed(f"greedy_policy should give {ROWS} rows of {COLS} actions: the best action on each tile.", actual=repr(got)[:200])


def uses_alpha(ctx):
    m = crab(ctx)
    Q = m.train(20, rng(4), alpha=0.0)
    if np.asarray(Q).shape != (ROWS, COLS, 4) or np.abs(np.asarray(Q)).max() > 1e-12:
        raise CheckFailed("With alpha 0, training should change nothing: every Q-value stays 0.")


def learns_again(ctx):
    m = crab(ctx)
    Q = m.train(3000, rng(12))
    judge(Q, "train(3000, rng) with another seed")


def league_entry(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    text = (result.files_out or {}).get("league.json")
    if text is None:
        raise CheckFailed("The program should save league.json.")
    try:
        entry = json.loads(text)
    except ValueError:
        raise CheckFailed("league.json isn't valid JSON. Write it with json.dump.", actual=text[:120])
    if not isinstance(entry, dict) or entry.get("format") != "ppc-league-1":
        raise CheckFailed('league.json should be {"format": "ppc-league-1", "q": ...}.', actual=text[:120])
    if "q" not in entry:
        raise CheckFailed('league.json needs the Q-table under "q": Q.tolist() turns the array into lists json can write.')
    judge(entry["q"], "The Q-table in league.json")


TESTS = [
    custom("One Q-learning update, by hand", one_update, visible=True),
    custom("The crab learns the League course", learns_the_course, visible=True, timeout=60,
           hint="Alternate the practice races: one from START, the next from random_start(rng). Up to MAX_MOVES moves each, choosing with epsilon-greedy."),
    custom("An update onto the finish", update_at_finish, hint="When over is True, nothing follows: the target is just the reward."),
    custom("The target uses the best next action", best_next_action,
           hint="Q[after].max() is the best action's worth on the next tile."),
    custom("Choosing with no exploring", choosing_greedily),
    custom("Exploring", exploring, hint="Explore with chance epsilon: rng.random() < epsilon, then any of the four actions."),
    custom("The greedy policy", greedy_grid, hint="Q.argmax(axis=2) gives the best action on every tile; .tolist() makes it lists."),
    custom("Training with alpha 0 learns nothing", uses_alpha, hint="Pass alpha on to q_update."),
    custom("He learns it with another seed too", learns_again, timeout=60),
    custom("league.json is a League entry", league_entry, timeout=90,
           hint='Save {"format": "ppc-league-1", "q": Q.tolist()} with json.dump, after training 3000 races.'),
]
