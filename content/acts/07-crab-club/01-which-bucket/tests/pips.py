import numpy as np

RATES = [0.30, 0.55, 0.20, 0.45, 0.70]


def every_bucket_tried(ctx):
    m = ctx.module()
    estimates, counts = m.practise(RATES, 1000, np.random.default_rng(1))
    untried = [bucket for bucket, count in enumerate(counts) if count == 0]
    if untried:
        raise CheckFailed("It explores one run in ten, so in 1000 runs every bucket should be tried. Some still have a count of 0.",
                          expected="every count above 0", actual=str([int(c) for c in counts]))


def estimates_match(ctx):
    m = ctx.module()
    estimates, counts = m.practise(RATES, 5000, np.random.default_rng(2), epsilon=1.0)
    for bucket, (estimate, rate) in enumerate(zip(estimates, RATES)):
        if abs(estimate - rate) > 0.07:
            raise CheckFailed("Exploring every run for 5000 runs, each estimate should land close to its bucket's real rate.",
                              expected=str(RATES), actual=str([round(float(e), 2) for e in estimates]))


def counts_add_up(ctx):
    m = ctx.module()
    estimates, counts = m.practise(RATES, 300, np.random.default_rng(3))
    if int(np.sum(counts)) != 300:
        raise CheckFailed("300 runs, so the counts should add up to 300.", expected=300, actual=int(np.sum(counts)))


def settles_on_best(ctx):
    m = ctx.module()
    estimates, counts = m.practise([0.1, 0.9, 0.2], 2000, np.random.default_rng(4))
    if counts[1] < 1600:
        raise CheckFailed("With rates 0.1, 0.9 and 0.2, most of 2000 runs should go on bucket 1.",
                          expected="over 1600 runs on bucket 1", actual=str([int(c) for c in counts]))


TESTS = [
    custom("Every bucket gets tried", every_bucket_tried, visible=True),
    custom("Exploring every run, the estimates match the rates", estimates_match, visible=True),
    custom("The counts add up to the runs", counts_add_up),
    custom("It settles on the best bucket", settles_on_best,
           hint="The reward belongs to the bucket Sir Reginald actually ate from."),
]
