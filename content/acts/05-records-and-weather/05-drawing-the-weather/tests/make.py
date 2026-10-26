SMALL_STATION = """month,tmax,tmin,frost,rain,sun,estimated
2001-06,17.0,9.4,0,40.0,201.0,
2001-07,19.2,11.0,0,35.5,220.4,
2002-07,18.1,10.9,0,80.2,,
2002-08,19.5,11.3,0,61.0,180.0,
2003-07,20.6,12.0,0,12.9,251.7,
2003-12,9.8,4.0,6,140.0,48.2,
"""


def load(text):
    import io

    import pandas as pd

    station = pd.read_csv(io.StringIO(text), parse_dates=["month"], index_col="month")
    station["temp"] = (station["tmax"] + station["tmin"]) / 2
    return station


def the_station(ctx):
    return load(ctx.files["stornoway.csv"])


def reference_years(station):
    import pandas as pd

    by_year = station.resample("YS")
    years = pd.DataFrame({
        "temp": by_year["temp"].mean().where(by_year["temp"].count() == 12),
        "rain": by_year["rain"].sum(min_count=12),
        "sun": by_year["sun"].sum(min_count=12),
    })
    years.index = years.index.year
    return years


def drawn(ctx, name, *args):
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots()
    getattr(ctx.module(), name)(ax, *args)
    return ax


def closing(fn):
    """Run a check, then close every figure it made."""
    def check(ctx):
        import matplotlib.pyplot as plt

        try:
            fn(ctx)
        finally:
            plt.close("all")
    return check


def label_has(ax, which, words, what, example):
    text = (ax.get_xlabel() if which == "x" else ax.get_ylabel()).lower()
    if not any(word in text for word in words):
        raise CheckFailed(f"{what}: the {which} axis needs a label that says what it measures, and in what units.",
                          expected=example, actual=repr(text))


def titled(ax, what):
    if not ax.get_title().strip():
        raise CheckFailed(f"{what} needs a title that says what the chart shows.")


def bars_of(ax, xs, heights, what):
    import numpy as np

    bars = list(ax.patches)
    if len(bars) != len(heights):
        raise CheckFailed(f"{what} should have one bar for each value.", expected=len(heights), actual=len(bars))
    got_x = [b.get_x() + b.get_width() / 2 for b in bars]
    got_h = [b.get_height() for b in bars]
    if not np.allclose(got_h, heights) or (xs is not None and not np.allclose(got_x, xs)):
        raise CheckFailed(f"{what}: the bars are in the wrong places or the wrong heights.",
                          expected=f"heights {list(heights)[:5]}...", actual=f"heights {got_h[:5]}...")


def starts_at_zero(ax, what):
    bottom = float(ax.get_ylim()[0])
    if bottom != 0:
        raise CheckFailed(f"{what}: a bar's length is its value, so the scale has to start at 0.", expected=0.0, actual=bottom)


def check_rain_bars(totals, ctx, what):
    ax = drawn(ctx, "rain_bars", totals)
    bars_of(ax, list(totals.index), list(totals), what)
    starts_at_zero(ax, what)
    label_has(ax, "x", ["year"], what, "year")
    label_has(ax, "y", ["mm"], what, "rain (mm)")
    titled(ax, what)


@closing
def rain_three_years(ctx):
    import pandas as pd

    totals = pd.Series([900.0, 1100.0, 950.0], index=[2001, 2002, 2003])
    check_rain_bars(totals, ctx, "rain_bars")


@closing
def rain_century(ctx):
    check_rain_bars(reference_years(the_station(ctx))["rain"], ctx, "rain_bars on the whole century")


def find_line(lines, ys):
    import numpy as np

    for line in lines:
        got = np.asarray(line.get_ydata(), dtype=float)
        if len(got) == len(ys) and np.allclose(got, ys, equal_nan=True):
            return line
    return None


def check_warming(temps, ctx, what):
    import numpy as np

    ax = drawn(ctx, "warming_chart", temps)
    lines = list(ax.lines)
    if len(lines) != 3:
        raise CheckFailed(f"{what} should have three lines: each year, the ten-year average, and the century average at 0.",
                          expected=3, actual=len(lines))
    difference = temps - temps.mean()
    each = find_line(lines, difference.to_numpy())
    if each is None:
        raise CheckFailed(f"{what}: one line should be each year's temperature minus the century's average.")
    if not np.allclose(np.asarray(each.get_xdata(), dtype=float), temps.index.to_numpy(dtype=float)):
        raise CheckFailed(f"{what}: draw each year's difference against its year.")
    if find_line(lines, difference.rolling(10).mean().to_numpy()) is None:
        raise CheckFailed(f"{what}: one line should be the ten-year average of the differences, from .rolling(10).mean().")
    if not any(np.allclose(np.asarray(line.get_ydata(), dtype=float), 0) for line in lines):
        raise CheckFailed(f"{what}: one line should mark the century average, at 0. ax.axhline(0) draws it.")
    legend = ax.get_legend()
    if legend is None:
        raise CheckFailed(f"{what}: three lines need a key. Give each a label= and call ax.legend().")
    names = [t.get_text() for t in legend.get_texts()]
    if len(names) != 3 or any(not name.strip() for name in names):
        raise CheckFailed(f"{what}: the key should name all three lines.", actual=str(names))
    label_has(ax, "x", ["year"], what, "year")
    label_has(ax, "y", ["degrees", "\N{DEGREE SIGN}c"], what, "difference from average (degrees C)")
    titled(ax, what)


@closing
def warming_twelve_years(ctx):
    import pandas as pd

    temps = pd.Series([10.9, 11.2, 10.7, 11.0, 11.4, 11.1, 11.6, 11.3, 11.8, 11.5, 12.0, 11.7], index=range(2001, 2013))
    check_warming(temps, ctx, "warming_chart")


@closing
def warming_century(ctx):
    check_warming(reference_years(the_station(ctx))["temp"], ctx, "warming_chart on the whole century")


def check_histogram(rain, ctx, what):
    import numpy as np

    ax = drawn(ctx, "rain_histogram", rain)
    counts, _ = np.histogram(rain, bins=range(0, 320, 20))
    bars = list(ax.patches)
    if len(bars) != 15:
        raise CheckFailed(f"{what}: bins 20 mm wide from 0 to 300 make 15 bars. bins=range(0, 320, 20) gives those edges.",
                          expected=15, actual=len(bars))
    if abs(bars[0].get_x()) > 1e-9 or abs(bars[0].get_width() - 20) > 1e-9:
        raise CheckFailed(f"{what}: the first bin should run from 0 to 20 mm.", actual=f"from {bars[0].get_x():g}, {bars[0].get_width():g} wide")
    heights = [b.get_height() for b in bars]
    if not np.allclose(heights, counts):
        raise CheckFailed(f"{what}: each bar should count the months in its bin.", expected=str(counts.tolist()), actual=str(heights))
    label_has(ax, "x", ["mm"], what, "rain in the month (mm)")
    label_has(ax, "y", ["month"], what, "months")
    titled(ax, what)


@closing
def histogram_few(ctx):
    check_histogram([5.0, 25.0, 30.0, 61.5, 299.0, 150.0, 19.9, 20.0], ctx, "rain_histogram")


@closing
def histogram_century(ctx):
    check_histogram(the_station(ctx)["rain"], ctx, "rain_histogram on the whole century")


def dots(ax):
    import numpy as np

    if not ax.collections:
        raise CheckFailed("Draw the dots with ax.scatter.")
    offsets = ax.collections[0].get_offsets()
    keep = ~np.ma.getmaskarray(offsets).any(axis=1)
    points = np.asarray(np.ma.getdata(offsets), dtype=float)[keep]
    points = points[~np.isnan(points).any(axis=1)]
    return sorted(map(tuple, np.round(points, 3)))


def check_scatter(table, ctx, what):
    ax = drawn(ctx, "july_scatter", table)
    julys = table[(table.index.month == 7) & table["sun"].notna()]
    expected = sorted(zip(julys["sun"].round(3), julys["temp"].round(3)))
    got = dots(ax)
    if len(got) != len(expected):
        raise CheckFailed(f"{what}: one dot for each July with a sunshine record.", expected=len(expected), actual=len(got))
    if got != [tuple(map(float, p)) for p in expected]:
        raise CheckFailed(f"{what}: each dot should be a July's sunshine across, and its temperature up.")
    label_has(ax, "x", ["hour"], what, "sunshine (hours)")
    label_has(ax, "y", ["degrees", "\N{DEGREE SIGN}c"], what, "temperature (degrees C)")
    titled(ax, what)


@closing
def scatter_small(ctx):
    table = load(SMALL_STATION)
    before = table.copy()
    check_scatter(table, ctx, "july_scatter")
    if not table.equals(before):
        raise CheckFailed("july_scatter changed the table it was given. Filter it into a new name instead.")


@closing
def scatter_century(ctx):
    check_scatter(the_station(ctx), ctx, "july_scatter on the whole century")


def same_years(got, expected, what):
    import numpy as np
    import pandas as pd

    if not isinstance(got, pd.DataFrame):
        raise CheckFailed(f"{what} should give back a DataFrame.", actual=type(got).__name__)
    for column in ["temp", "rain", "sun"]:
        if column not in got.columns:
            raise CheckFailed(f"{what} needs a {column} column.", actual=str(list(got.columns)))
    if list(got.index) != list(expected.index):
        raise CheckFailed(f"{what} should have one row a year, labelled by the year as a number.",
                          expected=str(list(expected.index)[:4]), actual=str(list(got.index)[:4]))
    for column in ["temp", "rain", "sun"]:
        if not np.allclose(got[column].to_numpy(dtype=float), expected[column].to_numpy(dtype=float), equal_nan=True):
            raise CheckFailed(f"{what}: the {column} column is wrong.",
                              expected=str(expected[column].round(2).tolist()[:5]), actual=str(got[column].round(2).tolist()[:5]))


def years_small(ctx):
    table = load(SMALL_STATION)
    same_years(ctx.module().yearly(table), reference_years(table), "yearly on a few months")


def years_century(ctx):
    station = the_station(ctx)
    got = ctx.module().yearly(station)
    same_years(got, reference_years(station), "yearly on the century")


def a_missing_month(ctx):
    import math

    got = ctx.module().yearly(the_station(ctx))
    if not math.isnan(got.loc[1927, "temp"]):
        raise CheckFailed("April 1927 has no temperature, so 1927's mean would be eleven months passed off as twelve. It should be NaN.",
                          expected="nan", actual=got.loc[1927, "temp"])
    if math.isnan(got.loc[1927, "rain"]):
        raise CheckFailed("1927 has all twelve months of rain, so its total is fine.")


@closing
def the_dashboard(ctx):
    import matplotlib.pyplot as plt
    from matplotlib.figure import Figure

    fig = ctx.module().dashboard(the_station(ctx))
    if not isinstance(fig, Figure):
        raise CheckFailed("dashboard should give back the figure from plt.subplots(2, 2).", actual=type(fig).__name__)
    axes = fig.get_axes()
    if len(axes) != 4:
        raise CheckFailed("The dashboard is four charts, two by two.", expected=4, actual=len(axes))
    kinds = sorted([len(ax.lines) >= 3, len(ax.patches) == 100, len(ax.patches) == 15, bool(ax.collections)].index(True)
                   if any([len(ax.lines) >= 3, len(ax.patches) == 100, len(ax.patches) == 15, bool(ax.collections)]) else -1
                   for ax in axes)
    if kinds != [0, 1, 2, 3]:
        raise CheckFailed("The four panels should be the warming chart, the rain bars, the histogram and the Julys.")
    title = fig._suptitle.get_text() if fig._suptitle is not None else ""
    if "Stornoway" not in title or "Met Office" not in title:
        raise CheckFailed("The whole page needs a title that names the station and where the data came from.",
                          expected="Stornoway, ... Data: Met Office ...", actual=repr(title))


def saved(tree, source):
    import ast

    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "savefig":
            if node.args and isinstance(node.args[0], ast.Constant) and node.args[0].value == "dashboard.png":
                return None
    return "Save the dashboard with fig.savefig(\"dashboard.png\"), so it can be pinned up."


HEADLINES = """Stornoway, 1925 to 2024: 1200 months
Warmest year: 2014 (9.52 degrees C). Coldest: 1979 (7.19 degrees C)
Wettest year: 1999 (1547 mm). Driest: 1968 (800 mm)
Last thirty years against the first thirty: +0.56 degrees C
Left out for a missing month: temperature 1927; sunshine 1925, 1926, 1927, 1928, 2004, 2007
Saved dashboard.png"""

TESTS = [
    custom("A century, year by year", years_century, visible=True,
           hint="Resample the months into years: the mean of the temperatures, the sums of the rain and the sunshine."),
    output("The headlines", expect=HEADLINES, visible=True),
    custom("Years from a few months", years_small),
    custom("A year with a month missing", a_missing_month,
           hint="Count each year's temperatures too. Where there aren't twelve, .where() turns the mean into NaN; sum(min_count=12) does the same for a total."),
    custom("Three years of rain, as bars from zero", rain_three_years),
    custom("Twelve years of warming", warming_twelve_years),
    custom("A century of rain", rain_century),
    custom("A century of warming", warming_century,
           hint="Take the century's average off every year first, then draw that, its rolling(10).mean(), and ax.axhline(0)."),
    custom("A few months in a histogram", histogram_few,
           hint="bins=range(0, 320, 20) gives edges at 0, 20, 40 and so on up to 300. A month of exactly 20 mm goes in the second bin."),
    custom("A century of months in a histogram", histogram_century),
    custom("Three Julys, one with no sunshine record", scatter_small,
           hint="Keep only the July rows, where station.index.month is 7, and leave out any July whose sunshine is missing."),
    custom("A century of Julys", scatter_century),
    custom("The dashboard", the_dashboard,
           hint="plt.subplots(2, 2) gives four axes; hand each chart function its own, and give the figure a suptitle."),
    structure("Saved as a picture", check=saved),
]
