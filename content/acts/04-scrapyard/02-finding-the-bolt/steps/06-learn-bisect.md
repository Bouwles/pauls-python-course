---
id: learn-bisect
type: learn
title: Python's own binary search
concept: bisect
code: |
  import bisect

  parts = ["axle", "bolt-M8", "brake-pad", "chain"]
  print(bisect.bisect_left(parts, "brake-pad"))
  print(bisect.bisect_left(parts, "bolt-"))

  position = bisect.bisect_left(parts, "bush")
  parts.insert(position, "bush")
  print(parts)
---
The `bisect` module has binary search built in. It answers a slightly different question: not "where is it?" but "where would it go?"

`bisect.bisect_left(parts, name)` gives the first place `name` could go and keep the list in order. If `name` is there, that's where it is. If not, it's where it belongs. It halves as it goes, so it's O(log n).

That helps twice. To add a part in its place, find where it would go and `parts.insert(position, name)`. To find every name starting with `bolt-`, find where `bolt-` would go: a beginning sorts just before the names that carry on from it.

The example prints `2`, `1`, then the list with `bush` in place. The usual slip is to expect `-1` for a missing name. `bisect` always gives a place.
