def gap(ctx):
    import io

    import matplotlib.pyplot as plt
    import numpy as np
    import pandas as pd

    station = pd.read_csv(io.StringIO(ctx.files["stornoway.csv"]), parse_dates=["month"], index_col="month")
    station["temp"] = (station["tmax"] + station["tmin"]) / 2
    sun = station.resample("YS")["sun"].sum(min_count=12)
    sun.index = sun.index.year
    try:
        fig, ax = plt.subplots()
        ctx.module().sunshine_chart(ax, sun)
        if len(ax.lines) != 1:
            raise CheckFailed("One line: each year's sunshine.", expected=1, actual=len(ax.lines))
        xs = np.asarray(ax.lines[0].get_xdata(), dtype=float)
        ys = np.asarray(ax.lines[0].get_ydata(), dtype=float)
        if len(ys) != 100:
            raise CheckFailed("One point for every year, the missing ones included.", expected=100, actual=len(ys))
        missing = sorted(int(x) for x, y in zip(xs, ys) if np.isnan(y))
        if missing != [1925, 1926, 1927, 1928, 2004, 2007]:
            raise CheckFailed("The years with a month of sunshine missing should be NaN, so the line has gaps.",
                              expected="1925 to 1928, 2004 and 2007", actual=str(missing))
        if not ax.get_xlabel() or not ax.get_ylabel() or not ax.get_title():
            raise CheckFailed("Label both axes and give the chart a title.")
    finally:
        plt.close("all")


TESTS = [custom("Six years left as gaps", gap, visible=True)]
