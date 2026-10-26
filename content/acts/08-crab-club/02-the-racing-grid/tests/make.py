import numpy as np

# Moss's own copy of the track, to check against.
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


def moss_outcomes(tile, action, slip=0.2):
    result = []
    for chance, way in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:
        r, c = tile[0] + STEPS[way][0], tile[1] + STEPS[way][1]
        after = (r, c) if 0 <= r < 3 and 0 <= c < 4 and TRACK[r][c] != "#" else tile
        letter = TRACK[after[0]][after[1]]
        result.append((chance, after, {"F": 10, "P": -10}.get(letter, -1), letter in "FP"))
    return result


def moss_value(policy, gamma=0.9):
    """The exact expected return from the start, by sweeping until nothing changes."""
    values = {tile: 0.0 for tile in TILES}
    for _ in range(500):
        for tile in RACING:
            values[tile] = sum(p * (r + (0 if over else gamma * values[after]))
                               for p, after, r, over in moss_outcomes(tile, policy[tile]))
    return values[(2, 0)]


def moss_return(rewards, gamma):
    return sum(gamma ** t * reward for t, reward in enumerate(rewards))


def gathered(possible):
    """{next tile: (total probability, reward, over)}, ignoring outcomes with no chance."""
    table = {}
    for item in possible:
        if not isinstance(item, tuple) or len(item) != 4:
            raise CheckFailed("Each outcome should be a tuple of four things: (probability, next tile, reward, over).", actual=repr(item))
        chance, after, reward, over = item
        if chance == 0:
            continue
        after = tuple(after)
        old = table.get(after, (0.0, reward, over))
        table[after] = (old[0] + chance, reward, over)
    return table


def same_outcomes(m, tile, action, slip=None):
    got = m.outcomes(tile, action) if slip is None else m.outcomes(tile, action, slip=slip)
    if got is None:
        raise CheckFailed("outcomes should return a list of (probability, next tile, reward, over).", actual="None")
    want = gathered(moss_outcomes(tile, action, 0.2 if slip is None else slip))
    have = gathered(got)
    call = f"outcomes({tile}, {action!r}" + ("" if slip is None else f", slip={slip}") + ")"
    if set(have) != set(want) or any(abs(have[k][0] - want[k][0]) > 1e-9 for k in want):
        show = lambda table: ", ".join(f"{k}: {v[0]:.2f}" for k, v in sorted(table.items()))
        raise CheckFailed(f"{call}: the chances of ending up on each tile are wrong.", expected=show(want), actual=show(have))
    for k in want:
        if have[k][1:] != want[k][1:]:
            raise CheckFailed(f"{call}: landing on {k} should give reward {want[k][1]} with over={want[k][2]}.",
                              expected=str(want[k][1:]), actual=str(have[k][1:]))


def first_steps(ctx):
    m = ctx.module()
    for tile, direction, want in [((2, 0), "up", (1, 0)), ((2, 0), "left", (2, 0)), ((2, 1), "up", (2, 1))]:
        got = m.move(tile, direction)
        if got is None or tuple(got) != want:
            reason = {(2, 0): "off the edge", (2, 1): "into the rock"}.get(want, "")
            raise CheckFailed(f"move({tile}, {direction!r}) should give {want}" + (f": a step {reason} leaves him where he was." if reason else "."), expected=want, actual=got)


def up_from_start(ctx):
    same_outcomes(ctx.module(), (2, 0), "up")


def more_steps(ctx):
    m = ctx.module()
    for tile, direction, want in [((0, 2), "right", (0, 3)), ((1, 0), "right", (1, 0)), ((0, 0), "up", (0, 0)), ((2, 3), "right", (2, 3)), ((1, 2), "down", (2, 2))]:
        got = m.move(tile, direction)
        if got is None or tuple(got) != want:
            raise CheckFailed(f"move({tile}, {direction!r}) should give {want}.", expected=want, actual=got)


def next_to_finish(ctx):
    same_outcomes(ctx.module(), (0, 2), "right")


def under_the_pool(ctx):
    same_outcomes(ctx.module(), (2, 3), "up")


def in_the_corner(ctx):
    same_outcomes(ctx.module(), (0, 0), "up")


def no_slipping(ctx):
    m = ctx.module()
    same_outcomes(m, (1, 2), "up", slip=0.0)
    same_outcomes(m, (2, 1), "left", slip=0.5)


def adds_up(ctx):
    m = ctx.module()
    for tile in RACING:
        for action in STEPS:
            same_outcomes(m, tile, action)
            total = sum(item[0] for item in m.outcomes(tile, action))
            if abs(total - 1) > 1e-9:
                raise CheckFailed(f"The chances in outcomes({tile}, {action!r}) add up to {total:.2f}. Something always happens, so they should add up to 1.")


def race_over(ctx):
    m = ctx.module()
    for tile in [(0, 3), (1, 3)]:
        got = m.outcomes(tile, "left")
        if got != []:
            raise CheckFailed(f"{tile} ends the race, so nothing can follow: outcomes should give [].", expected=[], actual=got)


def raced(m, *args, **kwargs):
    rewards = m.race(*args, **kwargs)
    if rewards is None:
        raise CheckFailed("race should return the list of rewards from the race.", actual="None")
    return list(rewards)


def races_without_slipping(ctx):
    m = ctx.module()
    rng = np.random.default_rng(1)
    for name, policy, start, want in [("the traditional line", TRADITIONAL, (2, 0), [-1, -1, -1, -10]),
                                      ("the long way", LONG_WAY, (2, 0), [-1, -1, -1, -1, 10]),
                                      ("a race from next to the finish", LONG_WAY, (0, 2), [10])]:
        got = raced(m, policy, rng, start=start, slip=0.0)
        if list(got) != want:
            raise CheckFailed(f"With no slipping, {name} should give these rewards.", expected=want, actual=got)


def race_limit(ctx):
    m = ctx.module()
    stubborn = {tile: "left" for tile in RACING}
    got = raced(m, stubborn, np.random.default_rng(2), slip=0.0, limit=7)
    if list(got) != [-1] * 7:
        raise CheckFailed("Told left at the start and never slipping, he bumps the edge for ever. With limit=7 the race should stop after 7 rewards.", expected=[-1] * 7, actual=got)


def race_on_average(ctx):
    m = ctx.module()
    rng = np.random.default_rng(3)
    for name, policy, want, tol in [("the traditional line", TRADITIONAL, -7.61, 0.5), ("the long way", LONG_WAY, 1.04, 0.3)]:
        average = np.mean([moss_return(raced(m, policy, rng), 0.9) for _ in range(2000)])
        if abs(average - want) > tol:
            raise CheckFailed(f"Over 2000 races, {name} should average a discounted return of about {want}.", expected=want, actual=round(float(average), 2))


def returns(ctx):
    m = ctx.module()
    for rewards, gamma, want in [([-1, -1, -1, -1, 10], 0.9, 3.122), ([10, -1], 0.5, 9.5), ([], 0.9, 0), ([5], 0.3, 5), ([1, 1, 1], 1.0, 3), ([3, 4], 0.0, 3)]:
        got = m.discounted_return(rewards, gamma)
        if got is None or abs(got - want) > 1e-6:
            raise CheckFailed(f"discounted_return({rewards}, {gamma}) should be {want}.", expected=want, actual=got)


def my_line(ctx):
    m = ctx.module()
    line = getattr(m, "MY_LINE", None)
    if not isinstance(line, dict):
        raise CheckFailed("Write MY_LINE: a dictionary from each tile to an action.")
    missing = [tile for tile in RACING if tile not in line]
    if missing:
        raise CheckFailed(f"MY_LINE needs an action for every tile he could be on, wherever he slips to. It has none for {missing}.")
    wrong = [line[tile] for tile in RACING if line[tile] not in STEPS]
    if wrong:
        raise CheckFailed(f"Actions are 'up', 'down', 'left' and 'right'. MY_LINE has {wrong[0]!r}.")
    yours, theirs = moss_value(line), moss_value(TRADITIONAL)
    if yours < theirs + 1:
        raise CheckFailed(f"MY_LINE is worth {yours:.2f} from the start; the traditional line is worth {theirs:.2f}. Beat it by more than 1.", expected=f"more than {theirs + 1:.2f}", actual=round(yours, 2))


def whole_program(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    if len(result.lines()) < 2:
        raise CheckFailed("Print each policy and its average return over 1000 races.", actual=result.output)


TESTS = [
    custom("One step from the start", first_steps, visible=True),
    custom("Told up at the start", up_from_start, visible=True),
    custom("More steps, edges and the rock", more_steps),
    custom("Next to the finish", next_to_finish, hint="Stepping onto the finish is worth +10 and ends the race: over is True."),
    custom("Under the rock pool", under_the_pool, hint="Stepping into the pool is worth -10 and ends the race."),
    custom("In the corner", in_the_corner, hint="Two different slips can both leave him where he is. Keep both outcomes; their chances add up."),
    custom("Other amounts of slipping", no_slipping, hint="Use the slip you're given: 1 - slip straight on, slip / 2 each way sideways."),
    custom("Every tile, every action", adds_up),
    custom("Nothing follows the end of a race", race_over, hint="On the finish or in the pool, return an empty list."),
    custom("Races without slipping", races_without_slipping, hint="Follow policy[tile] from start until the race is over, keeping each reward."),
    custom("A race that never ends", race_limit, hint="Stop when the list of rewards reaches limit, even if the race isn't over."),
    custom("Races on average", race_on_average,
           hint="Pick each outcome with its own chance: rng.choice(len(possible), p=chances) does it."),
    custom("Discounted returns", returns, hint="Start from the last reward and work back: total = reward + gamma * total."),
    custom("Your line beats tradition", my_line),
    custom("The whole program runs", whole_program),
]
