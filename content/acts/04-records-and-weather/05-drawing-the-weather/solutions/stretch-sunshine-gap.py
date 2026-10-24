import matplotlib.pyplot as plt
import pandas as pd


def sunshine_chart(station):
    """Each year's total sunshine, with the years nobody measured left as a gap."""
    totals = station.groupby("year")["sun"].sum(min_count=1)
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(totals.index, totals)
    ax.set_xlabel("year")
    ax.set_ylabel("sunshine (hours)")
    ax.set_title("Sunshine at Saltmarsh, by year")
    return fig, ax
