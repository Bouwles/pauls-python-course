---
id: make
type: make
title: Make the tower weigher
files: [tower.py]
entry: tower.py
on_pass: { nell: "Four crates deep. I'd have said three, and I'd have been wrong." }
hints:
  nudge: "What's the answer for a crate with nothing in it? And how does a crate's answer come from the answers for the crates inside it?"
  plan:
    - "weigh: start at nought, add each part, and for each crate inside add what weigh gives back for it"
    - "count_parts: the same shape, adding 1 for each part"
    - "depth: one more than the deepest crate inside, or 1 if there are none"
    - "packings: worked out before? Hand that back"
    - The smallest cases, answered straight away
    - Otherwise, work it out from smaller cases
    - Write it down, then hand it back
  shape: |
    def weigh(crate):
        total = 0
        for thing in crate:
            if isinstance(thing, list):
                total = total + ___
            else:
                total = total + ___
        return total


    def depth(crate):
        deepest_inside = 0
        for thing in crate:
            if isinstance(thing, list):
                deepest_inside = max(deepest_inside, ___)
        return ___


    known_packings = {}


    def packings(length):
        if length in known_packings:
            return ___
        ...
        known_packings[length] = ___
        return answer
---
Write `weigh`, `count_parts` and `depth` in `tower.py`. Each is the junk tower's shape: deal with the parts you can see, and hand each crate inside to the same function.

Then make Penhallow's `packings` quick without changing a single answer. It's right as it stands. The first crate is 1 m or 2 m, and it counts the ways to fill what's left of the bed after each, but it works the same short beds out millions of times. Memoise it, with a dictionary as Moss did or with `@functools.cache`.

The hidden checks weigh empty crates, crates of empty crates and a tower two hundred crates deep, and count every call `packings` makes for a 30 m lorry.
