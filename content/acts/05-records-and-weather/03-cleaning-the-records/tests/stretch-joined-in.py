def crew(ctx):
    import io

    import pandas as pd

    return ctx.module().clean_register(pd.read_csv(io.StringIO(ctx.files["register.csv"])))


def check(ctx, year, expected):
    names = ctx.module().joined_in(crew(ctx), year)
    if names != expected:
        raise CheckFailed(f"joined_in(crew, {year}) should list who joined that year, earliest first.", expected=repr(expected), actual=repr(names))


def storm_year(ctx):
    check(ctx, 1987, ["Claire Tregear", "Stephen Teague", "Simon Penrose"])


def year_1931(ctx):
    check(ctx, 1931, ["Arthur Abbott", "Frederick Bolitho"])


TESTS = [
    custom("The year of the storm", storm_year, visible=True),
    custom("1931", year_1931),
]
