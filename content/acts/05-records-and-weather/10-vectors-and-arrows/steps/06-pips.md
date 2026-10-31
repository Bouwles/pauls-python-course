---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya: "Can you look at mine? January as arrows. I skipped np.radians: one call fewer per reading."
  - yahya: "Due north at ten knots, spot on. Due east comes out pointing south-east. Something's off."
dialogue_after:
  - yahya: "Degrees in, radians wanted. NumPy took my 90 as ninety radians and never said a word. Very quickly."
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
Yahya has written `to_arrows` for the wind report, as fast as he could make it. North works. Nothing else does.

Run it, then fix `to_arrows`. The vane isn't bent.
