---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "January as arrows. Due north at ten knots: nought east, ten north. Spot on."
  - pip: "Due east comes out pointing south-east. And January's average is a westerly. I think the vane's bent."
dialogue_after:
  - pip: "Degrees in, radians wanted. NumPy took my 90 as ninety radians and never said a word."
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
Pip has written `to_arrows` for the wind report. North works. Nothing else does.

Run it, then fix `to_arrows`. The vane isn't bent.
