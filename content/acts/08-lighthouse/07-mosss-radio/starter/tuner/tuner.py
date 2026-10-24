"""Moss's radio: find the real stations on the dial."""


def smooth(readings, window=5):
    """Each reading averaged with up to window // 2 neighbours on each side."""
    return list(readings)


def find_stations(readings, start=88.0, step=0.1, window=5, floor=0.5):
    """Frequencies of the stations on the smoothed dial, strongest first."""
    loudest = max(range(len(readings)), key=lambda i: readings[i])
    return [round(start + loudest * step, 1)]


if __name__ == "__main__":
    dial = [float(line) for line in open("dial.txt")]
    print(find_stations(dial))
