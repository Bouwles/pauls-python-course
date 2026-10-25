def check(ctx, before, after, expected, tol, what):
    import numpy as np

    p = float(ctx.module().two_sided_p(np.array(before, dtype=float), np.array(after, dtype=float), np.random.default_rng(3), 4000))
    if abs(p - expected) > tol:
        raise CheckFailed(what, expected=f"about {expected}", actual=f"{p:.4f}")


def both_ways(ctx):
    check(ctx, [1, 2, 3], [4, 5, 6], 0.1, 0.02, "Two of the 20 splits are as extreme: 1 2 3 against 4 5 6, and the reverse.")


def reversed_order(ctx):
    check(ctx, [4, 5, 6], [1, 2, 3], 0.1, 0.02, "The same split the other way round is just as extreme.")


TESTS = [
    custom("1 2 3 against 4 5 6", both_ways, visible=True),
    custom("4 5 6 against 1 2 3", reversed_order),
]
