BEST_LINE = {0: 3, 1: 3, 2: 3, 4: 0, 6: 0, 8: 0, 9: 3, 10: 0, 11: 2}


def grid(ctx, **kwargs):
    return ctx.module().RacingGrid(**kwargs)


def checked_step(env, action, what):
    result = env.step(action)
    if not isinstance(result, tuple) or len(result) != 5:
        raise CheckFailed(f"{what}: step should return five things: observation, reward, terminated, truncated, info.", actual=repr(result))
    return result


def checked_reset(env, what, **kwargs):
    result = env.reset(**kwargs)
    if not isinstance(result, tuple) or len(result) != 2:
        raise CheckFailed(f"{what}: reset should return two things: observation, info.", actual=repr(result))
    return result


def starts_at_the_start(ctx):
    env = grid(ctx)
    observation, info = checked_reset(env, "reset(seed=1)", seed=1)
    if observation != 8 or not isinstance(info, dict):
        raise CheckFailed("reset should give the start's tile number, 2 * 4 + 0 = 8, and an info dictionary.", expected=(8, {}), actual=(observation, info))


def no_slipping(ctx):
    env = grid(ctx, slip=0.0)
    checked_reset(env, "reset", seed=1)
    got = []
    for action in [0, 0, 3, 3, 3]:
        observation, reward, terminated, truncated, info = checked_step(env, action, "step")
        got.append((observation, reward, terminated, truncated))
    want = [(4, -1.0, False, False), (0, -1.0, False, False), (1, -1.0, False, False), (2, -1.0, False, False), (3, 10.0, True, False)]
    if got != want:
        raise CheckFailed("With no slipping, up, up, right, right, right from the start should reach the finish.", expected=want, actual=got)


def five_things(ctx):
    env = grid(ctx)
    checked_reset(env, "reset", seed=2)
    observation, reward, terminated, truncated, info = checked_step(env, 3, "step(3)")
    if not isinstance(observation, int) or isinstance(observation, bool):
        raise CheckFailed("The observation should be a whole number: the tile number.", actual=repr(observation))
    if not isinstance(reward, float):
        raise CheckFailed("The reward should be a float, as Gymnasium's are: -1.0, not -1.", actual=repr(reward))
    if not isinstance(terminated, bool) or not isinstance(truncated, bool):
        raise CheckFailed("terminated and truncated should each be True or False.", actual=(terminated, truncated))
    if not isinstance(info, dict) or not isinstance(info.get("slipped"), bool):
        raise CheckFailed('info should be a dictionary with "slipped": True or False.', actual=repr(info))


def edges_and_rock(ctx):
    env = grid(ctx, slip=0.0)
    checked_reset(env, "reset", seed=1)
    for action, want, why in [(2, 8, "off the edge"), (3, 9, "a step right"), (0, 9, "into the rock")]:
        observation, reward, terminated, truncated, _ = checked_step(env, action, "step")
        if (observation, reward, terminated) != (want, -1.0, False):
            raise CheckFailed(f"With no slipping, {why} should leave him on tile {want}, at a cost of -1.",
                              expected=(want, -1.0, False), actual=(observation, reward, terminated))


def into_the_pool(ctx):
    env = grid(ctx, slip=0.0)
    checked_reset(env, "reset", seed=1)
    for action in [3, 3, 3]:
        checked_step(env, action, "step")
    observation, reward, terminated, truncated, _ = checked_step(env, 0, "step")
    if (observation, reward, terminated, truncated) != (7, -10.0, True, False):
        raise CheckFailed("Up from under the pool, with no slipping: tile 7, -10, and the race is over.",
                          expected=(7, -10.0, True, False), actual=(observation, reward, terminated, truncated))


def time_limit(ctx):
    env = grid(ctx, slip=0.0, max_steps=5)
    checked_reset(env, "reset", seed=1)
    flags = []
    for _ in range(5):
        _, _, terminated, truncated, _ = checked_step(env, 2, "step")
        flags.append((terminated, truncated))
    want = [(False, False)] * 4 + [(False, True)]
    if flags != want:
        raise CheckFailed("Bumping the edge with max_steps=5: the fifth step is truncated, not terminated. The race was stopped, not finished.",
                          expected=want, actual=flags)


def race_log(env, seed, steps=60):
    """Follow the best line for some steps, resetting without a seed whenever a race ends."""
    log = []
    observation, _ = checked_reset(env, "reset", seed=seed)
    for _ in range(steps):
        observation, reward, terminated, truncated, info = checked_step(env, BEST_LINE.get(observation, 0), "step")
        log.append((observation, reward, terminated, truncated, info.get("slipped") if isinstance(info, dict) else None))
        if terminated or truncated:
            observation, _ = checked_reset(env, "reset")
    return log


def same_seed(ctx):
    if race_log(grid(ctx), 4) != race_log(grid(ctx), 4):
        raise CheckFailed("Two grids reset with seed 4 and raced the same way should race identically. "
                          "Make the generator from the seed, and draw every random number from it.")


def seed_carries_on(ctx):
    env = grid(ctx)
    first = race_log(env, 5)
    if sum(1 for entry in first if entry[2] or entry[3]) < 3:
        raise CheckFailed("Following the best line, sixty steps should hold several races.")
    if race_log(env, 5) != first:
        raise CheckFailed("Reset with seed 5, then with no seed after each race: doing that twice should give the same races. "
                          "reset() with no seed should carry on with the generator it has, not make a new one.")


def different_seeds(ctx):
    logs = {tuple(race_log(grid(ctx), seed, steps=30)) for seed in range(8)}
    if len(logs) < 4:
        raise CheckFailed("Different seeds should give different races.")


def slipping(ctx):
    env = grid(ctx)
    observation, _ = checked_reset(env, "reset", seed=6)
    slips = 0
    for _ in range(4000):
        observation, _, terminated, truncated, info = checked_step(env, BEST_LINE.get(observation, 0), "step")
        slips += bool(info.get("slipped"))
        if terminated or truncated:
            observation, _ = checked_reset(env, "reset")
    if not 0.17 <= slips / 4000 <= 0.23:
        raise CheckFailed("With slip=0.2 he should slip about two steps in ten.", expected="about 0.2", actual=round(slips / 4000, 3))
    always = grid(ctx, slip=1.0)
    checked_reset(always, "reset", seed=7)
    seen = set()
    for _ in range(40):
        observation, *_ = checked_step(always, 0, "step")
        seen.add(observation)
        checked_reset(always, "reset")
    if seen != {8, 9}:
        raise CheckFailed("With slip=1.0 and told up from the start, he always goes sideways: left into the edge (8) or right (9).",
                          expected={8, 9}, actual=seen)


def episodes(ctx):
    m = ctx.module()
    got = m.run_episode(m.RacingGrid(slip=0.0), lambda observation: BEST_LINE[observation], seed=1)
    if got is None or tuple(got) != (6.0, 5):
        raise CheckFailed("With no slipping, the best line from the start takes 5 steps and earns -1 four times, then 10.", expected=(6.0, 5), actual=got)
    got = m.run_episode(m.RacingGrid(slip=0.0, max_steps=7), lambda observation: 2, seed=1)
    if got is None or tuple(got) != (-7.0, 7):
        raise CheckFailed("Bumping the edge with max_steps=7: run_episode should stop when the episode is truncated.", expected=(-7.0, 7), actual=got)
    env = m.RacingGrid()
    if m.run_episode(env, lambda observation: BEST_LINE[observation], seed=3) != m.run_episode(env, lambda observation: BEST_LINE[observation], seed=3):
        raise CheckFailed("run_episode should pass its seed to reset, so the same seed gives the same episode.")


def whole_program(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    if len(result.lines()) < 2:
        raise CheckFailed("Print a line for random moves and a line for the best line.", actual=result.output)


TESTS = [
    custom("reset gives the start", starts_at_the_start, visible=True),
    custom("A race with no slipping", no_slipping, visible=True),
    custom("step gives five things", five_things, hint='Return the tile number as an int, the reward as a float, two bools, and {"slipped": ...}.'),
    custom("Edges and the rock", edges_and_rock),
    custom("Into the pool", into_the_pool),
    custom("The time limit", time_limit, hint="truncated is True when the step count reaches max_steps and the race isn't already over."),
    custom("The same seed, the same races", same_seed),
    custom("reset() with no seed carries on", seed_carries_on,
           hint="Make a new generator only when reset is given a seed. Otherwise keep the one you have."),
    custom("Different seeds, different races", different_seeds),
    custom("Slipping", slipping, hint="Slip with chance slip; a slip turns the move sideways, either way with equal chance."),
    custom("run_episode", episodes, hint="Reset with the seed, then step with policy(observation) until terminated or truncated."),
    custom("The whole program runs", whole_program),
]
