import random as _random


def _crossings(crates, limit):
    crossings, load = 1, 0
    for weight in crates:
        if weight > limit:
            return None
        if load + weight > limit:
            crossings, load = crossings + 1, 0
        load += weight
    return crossings


def smallest_and_enough(seed, count, days, heaviest):
    def check(ctx):
        module = ctx.module()
        stack = _random.Random(seed)
        crates = [stack.randint(1, heaviest) for _ in range(count)]
        got = module.smallest_limit(list(crates), days)
        if not isinstance(got, int):
            raise CheckFailed(f"smallest_limit should give back a whole number of kilos, for {count:,} crates.", actual=got)
        needed = _crossings(crates, got)
        if needed is None or needed > days:
            raise CheckFailed(f"{count:,} crates in {days:,} crossings: a limit of {got:,} kg isn't enough.",
                              expected=f"no more than {days:,} crossings", actual=f"{needed} crossings" if needed else "a crate over the limit")
        lighter = _crossings(crates, got - 1)
        if lighter is not None and lighter <= days:
            raise CheckFailed(f"{count:,} crates in {days:,} crossings: {got - 1:,} kg would do, so {got:,} isn't the smallest.",
                              expected=f"{got - 1:,} or less", actual=got)
    return check


def all_the_same(ctx):
    module = ctx.module()
    got = module.smallest_limit([9_973] * 50_000, 37)
    if got != 13_483_496:
        raise CheckFailed("50,000 crates of 9,973 kg in 37 crossings: 1,352 crates a crossing, so 1,352 times 9,973 kg.",
                          expected=13_483_496, actual=got)


TESTS = [
    function("Five crates in three crossings", call="smallest_limit", args=([4, 8, 3, 5, 6], 3), expect=11, visible=True),
    function("Five crates in five crossings", call="smallest_limit", args=([4, 8, 3, 5, 6], 5), expect=8, visible=True),
    function("No crates", call="smallest_limit", args=([], 3), expect=0,
             hint="With nothing to carry, the smallest limit is 0. max() of an empty list is an error."),
    function("One crate", call="smallest_limit", args=([7], 1), expect=7),
    function("Everything in one crossing", call="smallest_limit", args=([4, 8, 3, 5, 6], 1), expect=26),
    function("More crossings than crates", call="smallest_limit", args=([4, 8, 3], 10), expect=8,
             hint="Even with crossings to spare, the ferry has to carry the heaviest crate on its own."),
    function("All the same weight", call="smallest_limit", args=([5] * 10, 3), expect=20),
    function("One to ten in five crossings", call="smallest_limit", args=(list(range(1, 11)), 5), expect=15,
             hint="Check the limit right at the boundary. If middle works, the answer could still be middle itself: keep it in the range."),
    function("Six crates in three crossings", call="smallest_limit", args=([3, 2, 2, 4, 1, 4], 3), expect=6),
    function("Five crates in four crossings", call="smallest_limit", args=([1, 2, 3, 1, 1], 4), expect=3),
    function("The crates stay in order", call="smallest_limit", args=([10, 1, 1, 10], 2), expect=11,
             hint="The crates go in the order they're stacked. Sorting them, or pairing the heavy with the light, answers a different question."),
    custom("50,000 crates of 9,973 kg", all_the_same, timeout=6,
           hint="Trying every limit from the heaviest crate upwards is millions of tries. Halve the range of possible limits each time instead."),
    custom("50,000 crates in 40 crossings", smallest_and_enough(1987, 50_000, 40, 10_000), timeout=6),
    custom("50,000 crates in 20,000 crossings", smallest_and_enough(1962, 50_000, 20_000, 10_000), timeout=6),
    custom("40,000 light crates in 7 crossings", smallest_and_enough(7, 40_000, 7, 50), timeout=6),
]
