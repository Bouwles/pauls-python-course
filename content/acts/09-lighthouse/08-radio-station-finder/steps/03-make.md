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
Write `find_stations` in `tuner.py`, as the brief describes. `smooth` is there for you to finish or replace.

The rule for a peak matters on a flat top: "higher than the one before, at least as high as the one after" picks the first reading of a plateau, once.

Then run `tuner.py`: it reads the dial and prints what it finds.
