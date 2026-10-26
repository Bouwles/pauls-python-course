import numpy as np

RATES = [0.10, 0.14, 0.08, 0.17]


def every_version_handed_out(ctx):
    m = ctx.module()
    estimates, counts = m.run_test(RATES, 1000, np.random.default_rng(1))
    untried = [version for version, count in enumerate(counts) if count == 0]
    if untried:
        raise CheckFailed("It explores one visitor in ten, so in 1000 visitors every version should be handed out. Some still have a count of 0.",
                          expected="every count above 0", actual=str([int(c) for c in counts]))


def estimates_match(ctx):
    m = ctx.module()
    estimates, counts = m.run_test(RATES, 8000, np.random.default_rng(2), epsilon=1.0)
    for version, (estimate, rate) in enumerate(zip(estimates, RATES)):
        if abs(estimate - rate) > 0.025:
            raise CheckFailed("Exploring for every one of 8000 visitors, each estimate should land close to its version's real rate.",
                              expected=str(RATES), actual=str([round(float(e), 3) for e in estimates]))


def counts_add_up(ctx):
    m = ctx.module()
    estimates, counts = m.run_test(RATES, 300, np.random.default_rng(3))
    if int(np.sum(counts)) != 300:
        raise CheckFailed("300 visitors, so the counts should add up to 300.", expected=300, actual=int(np.sum(counts)))


def settles_on_best(ctx):
    m = ctx.module()
    estimates, counts = m.run_test([0.05, 0.4, 0.1], 2000, np.random.default_rng(4))
    if counts[1] < 1600:
        raise CheckFailed("With rates 0.05, 0.4 and 0.1, most of 2000 visitors should be handed version 1.",
                          expected="over 1600 visitors for version 1", actual=str([int(c) for c in counts]))


TESTS = [
    custom("Every version gets handed out", every_version_handed_out, visible=True),
    custom("Exploring every time, the estimates match the rates", estimates_match, visible=True),
    custom("The counts add up to the visitors", counts_add_up),
    custom("It settles on the best version", settles_on_best,
           hint="The reward belongs to the version the visitor was actually handed."),
]
