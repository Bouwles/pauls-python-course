def census(ctx):
    import io

    import pandas as pd

    return pd.read_csv(io.StringIO(ctx.files["census.csv"]))


def check_share(ctx, year, age, expected):
    share = ctx.module().share_under(census(ctx), year, age)
    if not isinstance(share, (int, float)) or abs(share - expected) > 0.001:
        raise CheckFailed(f"share_under(census, {year}, {age}) should be about {expected:.3f}.", expected=f"{expected:.3f}", actual=repr(share))


def young_1921(ctx):
    check_share(ctx, 1921, 16, 37 / 90)


def young_2011(ctx):
    check_share(ctx, 2011, 16, 20 / 68)


TESTS = [
    custom("Under 16 in 1921", young_1921, visible=True),
    custom("Under 16 in 2011", young_2011),
]
