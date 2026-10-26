import math


def hill_height(east, north):
    return 140 * math.exp(-((east / 500) ** 2 + ((north - 1000) / 350) ** 2) / 2)


def partial_slopes(f, east, north, step=1e-5):
    east_slope = (f(east + step, north) - f(east - step, north)) / (2 * step)
    north_slope = (f(east, north + step) - f(east, north - step)) / (2 * step)
    return east_slope, north_slope


def uphill(f, east, north):
    east_slope, north_slope = partial_slopes(f, east, north)
    return math.degrees(math.atan2(east_slope, north_slope)) % 360, math.hypot(east_slope, north_slope)


def steepest_point(f, size, spacing):
    """The (east, north) on the grid where the ground is steepest."""
    best, best_steepness = None, -1.0
    for east in range(-size, size + 1, spacing):
        for north in range(0, size + 1, spacing):
            steepness = uphill(f, east, north)[1]
            if steepness > best_steepness:
                best, best_steepness = (east, north), steepness
    return best
