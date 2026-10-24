SMALL_STATION = """year,month,temp,rain,sun
2001,6,14.2,40.0,201.0
2001,7,16.1,35.5,220.4
2002,7,15.0,80.2,
2002,8,16.4,61.0,180.0
2003,7,17.3,12.9,251.7
2003,12,7.9,140.0,48.2
"""


def station(ctx, text=None):
    import io

    import pandas as pd

    return pd.read_csv(io.StringIO(text if text is not None else ctx.files["station.csv"]))


def closing(fn):
    """Run a check, then close every figure it made."""
    def check(ctx):
        import matplotlib.pyplot as plt

        try:
            fn(ctx)
        finally:
            plt.close("all")
    return check


def unpack(result, what):
    from matplotlib.axes import Axes
    from matplotlib.figure import Figure

    if not isinstance(result, tuple) or len(result) != 2:
        raise CheckFailed(f"{what} should return two things: return fig, ax", actual=type(result).__name__)
    fig, ax = result
    if not isinstance(fig, Figure) or not isinstance(ax, Axes):
        raise CheckFailed(f"{what} should return the figure and the axes from plt.subplots(), in that order.",
                          actual=f"{type(fig).__name__}, {type(ax).__name__}")
    return fig, ax


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
    fig, ax = unpack(ctx.module().rain_bars(totals), what)
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
    totals = station(ctx).groupby("year")["rain"].sum()
    check_rain_bars(totals, ctx, "rain_bars on the whole century")


def find_line(lines, ys):
    import numpy as np

    for line in lines:
        got = np.asarray(line.get_ydata(), dtype=float)
        if len(got) == len(ys) and np.allclose(got, ys, equal_nan=True):
            return line
    return None


def check_warming(temps, ctx, what):
    import numpy as np

    fig, ax = unpack(ctx.module().warming_chart(temps), what)
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
    check_warming(station(ctx).groupby("year")["temp"].mean(), ctx, "warming_chart on the whole century")


def check_histogram(rain, ctx, what):
    import numpy as np

    fig, ax = unpack(ctx.module().rain_histogram(rain), what)
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
    check_histogram(station(ctx)["rain"], ctx, "rain_histogram on the whole century")


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
    fig, ax = unpack(ctx.module().july_scatter(table), what)
    julys = table[(table["month"] == 7) & table["sun"].notna()]
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
    table = station(ctx, SMALL_STATION)
    before = table.copy()
    check_scatter(table, ctx, "july_scatter")
    if not table.equals(before):
        raise CheckFailed("july_scatter changed the table it was given. Filter it into a new name instead.")


@closing
def scatter_century(ctx):
    check_scatter(station(ctx), ctx, "july_scatter on the whole century")


TESTS = [
    custom("Three years of rain, as bars from zero", rain_three_years, visible=True),
    custom("Twelve years of warming", warming_twelve_years, visible=True),
    custom("A century of rain", rain_century),
    custom("A century of warming", warming_century,
           hint="Take the century's average off every year first, then draw that, its rolling(10).mean(), and ax.axhline(0)."),
    custom("A few months in a histogram", histogram_few,
           hint="bins=range(0, 320, 20) gives edges at 0, 20, 40 and so on up to 300. A month of exactly 20 mm goes in the second bin."),
    custom("A century of months in a histogram", histogram_century),
    custom("Three Julys, one with no sunshine record", scatter_small,
           hint="Keep only the July rows, and leave out any July whose sunshine is missing."),
    custom("A century of Julys", scatter_century),
]
