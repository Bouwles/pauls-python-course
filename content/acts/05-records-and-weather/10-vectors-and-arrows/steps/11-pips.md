---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya.proud.wave: "Can you look at mine? It's January as arrows, and I skipped np.radians, which is one call fewer per reading."
  - yahya.confused: "Due north at ten knots comes out spot on, but due east points south-east, and that can't be right."
dialogue_after:
  - yahya.unimpressed: "It wanted radians and I gave it degrees, and NumPy took my 90 as ninety radians without saying a word. Very quickly."
hints:
  nudge: "What does `np.sin` think 90 means: 90 degrees, or something else?"
  plan:
    - Run it and look at due east
    - Turn the bearings into radians before the sine and cosine
    - Run it again and check all four compass points
  shape: |
    def to_arrows(bearings, speeds):
        angles = np.___(bearings)
        east = speeds * np.sin(___)
        north = speeds * np.cos(___)
        return np.column_stack([east, north])
---
Yahya has written `to_arrows` for Riya's wind report, as fast as he could make it. North works. Nothing else does.

Run it, then fix `to_arrows`. The vane isn't bent.
