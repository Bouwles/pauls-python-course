---
id: tuner
type: make
title: The tuner
files: [tuner.py]
entry: tuner.py
on_pass: { caitlin.laughing.cheer: "Two stations. Neither of them is the crackle. Turn it up." }
hints:
  nudge: "Smooth first, then look for peaks in the smoothed list, not the raw one."
  plan:
    - Smooth the readings with the moving average from the worked example
    - Walk the inside of the smoothed list (not the first or last) and keep the indexes that are peaks at or above the floor
    - Sort those indexes by smoothed strength, strongest first
    - Turn each index into a frequency, start plus index times step, rounded to one place
  shape: |
    def find_stations(readings, start=88.0, step=0.1, window=5, floor=0.5):
        smoothed = smooth(readings, window)
        peaks = []
        for i in range(1, len(smoothed) - 1):
            if ___:
                peaks.append(i)
        peaks.sort(key=___, reverse=True)
        return [round(start + i * step, 1) for i in peaks]
---
Write `find_stations` in `tuner.py`, as the brief describes. `smooth` is there for you to finish, or replace with Paul's.

1. Smooth the readings with `window // 2` neighbours each side.
2. Walk the smoothed list from the second reading to the second last, and keep each peak at or above `floor`.
3. Sort the peaks by their smoothed strength, strongest first.
4. Turn each into a frequency, `start + i * step`, rounded to one decimal place.

Done: `python tuner.py` prints `[96.4, 101.7]`, and not the crackle at 90.3. The checks also try plain hiss and an empty dial, a flat-topped station, stations near the ends, and other floors and windows.
