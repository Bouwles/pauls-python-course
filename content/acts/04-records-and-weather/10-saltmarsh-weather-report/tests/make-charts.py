def closing(fn):
    """Run a check, then close every figure it made."""
    def check(ctx):
        import matplotlib.pyplot as plt

        try:
            fn(ctx)
        finally:
            plt.close("all")
    return check


def need(module, name):
    """The learner's function, or a clear message that it isn't there yet."""
    function = getattr(module, name, None)
    if not callable(function):
        raise CheckFailed("charts.py needs a function called " + name + ".")
    return function


def tables(ctx):
    """The learner's charts module, and the tables their own summary.py makes."""
    charts = ctx.module()
    import station
    import summary

    book = station.load_station("ledger.csv")
    years = summary.yearly(book)
    return charts, {
        "years": years,
        "normal": float(years.loc[1961:1990, "temp"].mean()),
        "tens": summary.decades(years),
        "then": summary.normals(book, 1961, 1990),
        "now": summary.normals(book, 1995, 2024),
    }


def small_tables():
    import numpy as np
    import pandas as pd

    years = pd.DataFrame({"temp": np.linspace(10.0, 12.0, 21), "rain": 900.0, "sun": 1500.0}, index=range(2000, 2021))
    tens = pd.DataFrame({"temp": [10.5, 11.5, 12.0], "rain": [950.0, 1010.0, 880.0], "sun": 1500.0}, index=[2000, 2010, 2020])
    months = range(1, 13)
    then = pd.DataFrame({"temp": [5.0 + m for m in months], "rain": [100.0 - m for m in months], "sun": 100.0}, index=months)
    now = pd.DataFrame({"temp": [6.0 + m for m in months], "rain": [90.0 - m for m in months], "sun": 110.0}, index=months)
    return years, tens, then, now


def unpack(result, what, panels=1):
    from matplotlib.axes import Axes
    from matplotlib.figure import Figure

    if not isinstance(result, tuple) or len(result) != 2:
        raise CheckFailed(f"{what} should return two things: the figure, then the axes.", actual=type(result).__name__)
    fig, ax = result
    if not isinstance(fig, Figure):
        raise CheckFailed(f"{what} should return the figure from plt.subplots() first.", actual=type(fig).__name__)
    if panels == 1:
        if not isinstance(ax, Axes):
            raise CheckFailed(f"{what} should return one axes, second.", actual=type(ax).__name__)
        return fig, ax
    axes = list(ax) if not isinstance(ax, Axes) else [ax]
    if len(axes) != panels or not all(isinstance(a, Axes) for a in axes):
        raise CheckFailed(f"{what} should return the figure, then its {panels} axes.", actual=repr(ax))
    return fig, axes


def labelled(ax, which, words, what, example):
    text = (ax.get_xlabel() if which == "x" else ax.get_ylabel()).lower()
    if not any(word in text for word in words):
        raise CheckFailed(f"{what}: the {which} axis needs a label saying what it measures, and in what units.",
                          expected=example, actual=repr(text))


def titled(ax, what):
    if not ax.get_title().strip():
        raise CheckFailed(f"{what} needs a title that says what the chart shows.")


def keyed(ax, what):
    if ax.get_legend() is None:
        raise CheckFailed(f"{what} has more than one line, so it needs a key: ax.legend().")


def sourced(fig, what):
    if not any("source" in text.get_text().lower() for text in fig.texts):
        raise CheckFailed(f"{what} should say where its numbers came from, in small print: fig.text(0.01, 0.01, SOURCE, fontsize=8).")


def from_zero(ax, what):
    bottom = float(ax.get_ylim()[0])
    if bottom != 0:
        raise CheckFailed(f"{what}: an amount is drawn from zero, so the scale has to start at 0.", expected=0.0, actual=bottom)


def find_line(lines, ys):
    import numpy as np

    for line in lines:
        got = np.asarray(line.get_ydata(), dtype=float)
        if len(got) == len(ys) and np.allclose(got, ys, equal_nan=True):
            return line
    return None


def check_temperature(charts, years, normal, what):
    import numpy as np

    fig, ax = unpack(need(charts, "temperature_chart")(years, normal), what)
    lines = list(ax.lines)
    if len(lines) != 3:
        raise CheckFailed(f"{what} should have three lines: each year, the ten-year average, and the 1961 to 1990 average at 0.",
                          expected=3, actual=len(lines))
    difference = years["temp"] - normal
    if find_line(lines, difference.to_numpy()) is None:
        raise CheckFailed(f"{what}: one line should be each year's temperature minus the 1961 to 1990 average.")
    if find_line(lines, difference.rolling(10).mean().to_numpy()) is None:
        raise CheckFailed(f"{what}: one line should be the ten-year rolling average of the differences.")
    if not any(np.allclose(np.asarray(line.get_ydata(), dtype=float), 0) for line in lines):
        raise CheckFailed(f"{what}: one line should run right across at 0: ax.axhline(0).")
    labelled(ax, "x", ["year"], what, "year")
    labelled(ax, "y", ["degrees c", "°c"], what, "difference from the 1961 to 1990 average (degrees C)")
    titled(ax, what)
    keyed(ax, what)
    sourced(fig, what)


def check_rain(charts, tens, what):
    import numpy as np

    fig, ax = unpack(need(charts, "rain_chart")(tens), what)
    bars = list(ax.patches)
    if len(bars) != len(tens):
        raise CheckFailed(f"{what} should have one bar per decade.", expected=len(tens), actual=len(bars))
    if not np.allclose([bar.get_height() for bar in bars], tens["rain"].to_numpy()):
        raise CheckFailed(f"{what}: each bar should be that decade's average year of rain.",
                          expected=str(tens["rain"].round(1).tolist()[:4]), actual=str([round(b.get_height(), 1) for b in bars][:4]))
    from_zero(ax, what)
    labelled(ax, "x", ["decade"], what, "decade")
    labelled(ax, "y", ["mm"], what, "rain in an average year (mm)")
    titled(ax, what)
    sourced(fig, what)


def check_months(charts, then, now, what):
    fig, (temps, rain) = unpack(need(charts, "months_chart")(then, now), what, panels=2)
    for ax, column, side in [(temps, "temp", "left"), (rain, "rain", "right")]:
        where = f"{what}, {side} panel"
        if len(ax.lines) != 2:
            raise CheckFailed(f"{where} should have two lines: 1961 to 1990, and 1995 to 2024.", expected=2, actual=len(ax.lines))
        for table, period in [(then, "1961 to 1990"), (now, "1995 to 2024")]:
            if find_line(ax.lines, table[column].to_numpy()) is None:
                raise CheckFailed(f"{where}: one line should be each month's {column} for {period}.")
        labelled(ax, "x", ["month"], where, "month")
        titled(ax, where)
        keyed(ax, where)
    labelled(temps, "y", ["degrees c", "°c"], f"{what}, left panel", "temperature (degrees C)")
    labelled(rain, "y", ["mm"], f"{what}, right panel", "rain (mm)")
    from_zero(rain, f"{what}, right panel")
    sourced(fig, what)


@closing
def temperature_century(ctx):
    charts, t = tables(ctx)
    check_temperature(charts, t["years"], t["normal"], "temperature_chart")


@closing
def rain_century(ctx):
    charts, t = tables(ctx)
    check_rain(charts, t["tens"], "rain_chart")


@closing
def months_century(ctx):
    charts, t = tables(ctx)
    check_months(charts, t["then"], t["now"], "months_chart")


@closing
def small(ctx):
    years, tens, then, now = small_tables()
    charts = ctx.module()
    check_temperature(charts, years, 11.0, "temperature_chart on twenty-one years of its own")
    check_rain(charts, tens, "rain_chart on three decades of its own")
    check_months(charts, then, now, "months_chart on normals of its own")


@closing
def no_printing(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed("charts.py crashes when it runs on its own.", actual=f"{type(result.error).__name__}: {result.error}")


TESTS = [
    custom("The temperature, year by year", temperature_century, visible=True),
    custom("Rain, decade by decade", rain_century, visible=True),
    custom("Two thirty-year periods, month by month", months_century,
           hint="plt.subplots(1, 2) gives two axes. Draw both periods on each, and start the rain panel from zero."),
    custom("Tables of its own", small,
           hint="Draw whatever tables you're given. Nothing from the station book should be written into charts.py."),
    custom("charts.py runs on its own", no_printing),
]
