"""Moss's radio: find the real stations on the dial."""


def smooth(readings, window=5):
    """Each reading averaged with up to window // 2 neighbours on each side."""
    half = window // 2
    smoothed = []
    for i in range(len(readings)):
        nearby = readings[max(0, i - half): i + half + 1]
        smoothed.append(sum(nearby) / len(nearby))
    return smoothed


def find_stations(readings, start=88.0, step=0.1, window=5, floor=0.5):
    """Frequencies of the stations on the smoothed dial, strongest first."""
    smoothed = smooth(readings, window)
    peaks = []
    for i in range(1, len(smoothed) - 1):
        if smoothed[i] > smoothed[i - 1] and smoothed[i] >= smoothed[i + 1] and smoothed[i] >= floor:
            peaks.append(i)
    peaks.sort(key=lambda i: smoothed[i], reverse=True)
    return [round(start + i * step, 1) for i in peaks]


if __name__ == "__main__":
    dial = [float(line) for line in open("dial.txt")]
    print(find_stations(dial))
