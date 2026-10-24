---
id: make
type: make
title: Make the wind report
on_pass: { priya: "From 350 at 11.4 knots. That's January. I'll sign that one." }
hints:
  nudge: "Every one of these starts from the arrows, never the bearings. Which ones need the mean arrow, and which need a dot product?"
  plan:
    - Find each arrow's angle with arctan2, east first, then make it a bearing
    - Average the arrows, then find the mean arrow's bearing and length
    - Divide the mean arrow's length by the mean of every arrow's length
    - Divide the dot product by both lengths, then take the arccos
    - One-knot arrows for the new directions
    - Stack them into a matrix
    - Move every arrow with one @
  shape: |
    def to_bearings(arrows):
        return np.degrees(np.arctan2(arrows[:, ___], arrows[:, ___])) % ___


    def prevailing(arrows):
        mean_arrow = arrows.mean(axis=___)
        bearing = ___
        return bearing, np.linalg.norm(___)


    def steadiness(arrows):
        return np.linalg.norm(___) / np.linalg.norm(arrows, axis=___).mean()


    def angle_between(a, b):
        cosine = np.dot(a, b) / (___ * ___)
        return np.degrees(np.arccos(np.clip(cosine, -1, 1)))


    def along_and_across(arrows, heading):
        angle = np.radians(heading)
        ahead = [np.sin(angle), np.cos(angle)]
        starboard = [___, ___]
        frame = np.array([ahead, starboard])
        return arrows @ ___
---
Write Priya's five functions. The loader, Pip's `to_arrows` (fixed) and the report are done.

```
January 2024: 31 days
Average of the bearings: 197 degrees
Prevailing wind: from 350 degrees at 11.4 knots
Steadiness: 0.81
Biggest swing overnight: 120 degrees, 2024-01-28 to 2024-01-29
Ferry on 040: worst headwind 25.1 knots on 2024-01-26
Ferry on 040: worst crosswind 23.1 knots on 2024-01-15
```

- **Steadiness** is the mean arrow's length over the mean speed: 1 if the wind never moved, near 0 if it went all round the compass.
- The angle between two arrows comes from the dot product: `np.dot(a, b)` is their lengths multiplied, times the cosine of the angle. `np.arccos` turns a cosine back into an angle.
- For `along_and_across`, ahead is the one-knot arrow for the heading. **Starboard**, the right-hand side, is a quarter turn clockwise from it: `(cos, -sin)` of the heading.

No loops. The checks try other headings.
