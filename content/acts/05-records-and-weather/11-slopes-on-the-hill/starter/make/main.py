# Priya's hill survey: the path, the hill, and the thermometer on top.
import math

try:
    from workshop import show_hill
except ImportError:
    # Outside the browser there's no hill to draw; the numbers are the same.
    def show_hill(*args, **kwargs):
        pass

GORSE = (300.0, 600.0)  # where the thermometer cable leaves the path, metres east and north


def hill_height(east, north):
    """Penhallow's survey: the hill's height in metres, at metres east and north of the station."""
    # Surveyed in the spring of '82, for the cable up to the machine. The
    # steepest stretch of the path is exactly where the cable had to go.
    # It always is. A.P.
    return 140 * math.exp(-((east / 500) ** 2 + ((north - 1000) / 350) ** 2) / 2)


def path_height(metres):
    """The path runs due north from the station to the top. Its height, this many metres along."""
    return hill_height(0.0, metres)


def slope(f, x, step=1e-5):
    """The slope of f at x, measured a small step either side."""


def partial_slopes(f, east, north, step=1e-5):
    """The slopes of f(east, north) stepping east, then stepping north: (east_slope, north_slope)."""


def uphill(f, east, north):
    """Straight uphill from (east, north): (bearing, steepness) of the arrow of the two slopes."""


def miss_slopes(gain, offset, reading, true):
    """The slopes of (gain * reading + offset - true) ** 2, for gain and for offset: (gain_slope, offset_slope)."""
    # Find the inner value

    # Each link's slope

    # Multiply the slopes, the outer one at the inner value


if __name__ == "__main__":
    steepest = 0
    for metres in range(0, 1001, 10):
        rise = slope(path_height, metres)
        show_hill(metres, path_height(metres), curve=path_height, title=f"slope {rise:.3f}")
        if rise > slope(path_height, steepest):
            steepest = metres
    rise = slope(path_height, steepest)
    print(f"Steepest on the path: {steepest} m from the station, slope {rise:.3f}, about 1 in {1 / rise:.0f}")

    east_slope, north_slope = partial_slopes(hill_height, 0.0, 1000.0)
    print(f"At the top: slopes {abs(east_slope):.3f} east, {abs(north_slope):.3f} north")

    bearing, steepness = uphill(hill_height, *GORSE)
    print(f"From the gorse: straight uphill is {bearing:03.0f} degrees, slope {steepness:.3f}")

    reading, true = 8.5, 10.0
    print(f"Thermometer check (reads {reading}, should be {true}):")
    for name, value in zip(["gain", "offset"], miss_slopes(1.0, 0.0, reading, true)):
        way = "up" if value < 0 else "down"
        print(f"  {name} slope {value:.1f}: turn the {name} {way}")
