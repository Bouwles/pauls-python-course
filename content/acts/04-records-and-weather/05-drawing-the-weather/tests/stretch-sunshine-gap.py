def gap(ctx):
    import io

    import matplotlib.pyplot as plt
    import numpy as np
    import pandas as pd

    station = pd.read_csv(io.StringIO(ctx.files["station.csv"]))
    try:
        fig, ax = ctx.module().sunshine_chart(station)
        if len(ax.lines) != 1:
            raise CheckFailed("One line: each year's sunshine.", expected=1, actual=len(ax.lines))
        xs = np.asarray(ax.lines[0].get_xdata(), dtype=float)
        ys = np.asarray(ax.lines[0].get_ydata(), dtype=float)
        if len(ys) != 100:
            raise CheckFailed("One point for every year, the missing ones included.", expected=100, actual=len(ys))
        missing = sorted(int(x) for x, y in zip(xs, ys) if np.isnan(y))
        if missing != [1941, 1942, 1943, 1944, 1945]:
            raise CheckFailed("The years with no record should be NaN, so the line has a gap.", expected="1941 to 1945", actual=str(missing))
        if not ax.get_xlabel() or not ax.get_ylabel() or not ax.get_title():
            raise CheckFailed("Label both axes and give the chart a title.")
    finally:
        plt.close("all")


TESTS = [custom("Five years left as a gap", gap, visible=True)]
