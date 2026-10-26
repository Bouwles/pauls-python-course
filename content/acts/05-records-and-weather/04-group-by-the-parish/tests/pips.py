SMALL = """year,parish,household,name,relation,age,occupation
1901,Harbour,1,Jory Pascoe,head,61,fisherman
1901,Harbour,1,Wenna Pascoe,wife,58,net maker
1901,Harbour,2,Tom Kitto,head,30,fisherman
1901,Marsh,3,Ann Hollis,head,45,baker
1901,Marsh,3,Ned Hollis,son,19,cooper
1911,Harbour,1,Tom Kitto,head,40,fisherman
1911,Harbour,1,Jenny Kitto,wife,33,lacemaker
1911,Hill,2,Ned Hollis,head,29,cooper
1911,Hill,2,Mary Hollis,wife,27,home duties
1911,Hill,2,Ann Hollis,mother,55,retired
"""


def load(text):
    import io

    import pandas as pd

    return pd.read_csv(io.StringIO(text))


def how_many(ctx):
    count = len(ctx.module().household_sizes(load(ctx.files["census.csv"])))
    if count != 101:
        raise CheckFailed("Four censuses of 23, 26, 26 and 26 households make 101 households in all.", expected=101, actual=count)


def average(ctx):
    value = ctx.module().average_household(load(ctx.files["census.csv"]))
    if abs(float(value) - 319 / 101) > 0.001:
        raise CheckFailed("319 people in 101 households is about 3.16 people each.", expected="3.16", actual=f"{float(value):.2f}")


def largest(ctx):
    value = ctx.module().largest_household(load(ctx.files["census.csv"]))
    if int(value) != 7:
        raise CheckFailed("The biggest households in the census had 7 people in them.", expected=7, actual=int(value))


def smaller(ctx):
    module = ctx.module()
    table = load(SMALL)
    found = (len(module.household_sizes(table)), round(float(module.average_household(table)), 2), int(module.largest_household(table)))
    if found != (5, 2.0, 3):
        raise CheckFailed("In the smaller census: five households, two people each on average, three at most.",
                          expected="(5, 2.0, 3)", actual=str(found))


TESTS = [
    custom("101 households", how_many, visible=True),
    custom("About three people to a household", average, visible=True),
    custom("Seven in the biggest", largest),
    custom("A smaller census", smaller, hint="Household 1 in 1901 and household 1 in 1911 are different households."),
]
