import math


def path_height(metres):
    """The hill path's height in metres, this many metres along it from the station."""
    return 140 * math.exp(-((metres - 1000) / 350) ** 2 / 2)


def slope(f, x, step=1e-5):
    """The slope of f at x, measured a small step either side."""
    # The two nudges are 2 * step apart, so that's the run.
    return (f(x + step) - f(x - step)) / (2 * step)


stile = 650
print(f"Slope at the stile: {slope(path_height, stile):.3f}")
print(f"That's 1 in {1 / slope(path_height, stile):.0f}")
