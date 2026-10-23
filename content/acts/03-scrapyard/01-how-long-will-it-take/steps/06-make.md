---
id: make
type: make
title: Make the spares check count
files: [yard.py]
entry: yard.py
on_pass: { nell: "Four times the work for twice the parts. That's my old wheelbarrow, that is." }
hints:
  nudge: "Where, in Penhallow's loops, do two parts actually get compared? Put the counting there."
  plan:
    - "spares_by_pairs: her loops, plus a count that goes up at every comparison"
    - "spares_by_set: one loop, a set of parts seen, a count for every lookup"
    - "growth_ratio: make n different parts and 2n different parts, run the function on both, divide the steps"
    - "estimate: work out how many times bigger the growth makes it, then multiply"
    - Read the clock, do the job once, read it again, then scale up for the pier
  shape: |
    def spares_by_pairs(parts):
        found = set()
        comparisons = 0
        for first in range(len(parts)):
            for second in range(___, len(parts)):
                comparisons = ___
                if parts[first] == parts[second]:
                    found.add(parts[first])
        return ___, comparisons


    def growth_ratio(find_spares, n):
        _, steps_now = find_spares([f"part-{number}" for number in range(___)])
        _, steps_doubled = find_spares(___)
        return round(___, 1)


    def estimate(seconds, n_now, n_later, growth):
        if growth == "O(1)":
            scale = 1
        elif growth == "O(n)":
            scale = ___
        ...
        else:
            raise ___(f"unknown growth {growth}")
        return seconds * scale
---
Penhallow's spares check is in `yard.py`, with her notes. Write the four functions from the brief beside it, then finish the main block so it times `spares_by_pairs` on Nell's yard and estimates it for the pier. Moss's timing subgoals are there as comments.

`growth_ratio` takes a function as its first argument, as `sorted` takes one for `key=`. Inside, call it like any other.

For `estimate`, the growth says how much bigger the work gets. With `"O(n^2)"`, fifty times the parts is fifty squared times the time. `math.log(n)` is there for the two with a log in them.

The hidden checks try empty yards, three of a kind, and a hundred thousand parts, and they count every comparison your code makes.
