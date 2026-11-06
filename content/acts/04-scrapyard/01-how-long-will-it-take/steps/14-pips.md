---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya.pleased.wave: "Can you look at mine? Neil's check has a loop inside a loop. Mine has one. So it's O(n)."
  - riya.confused: "Instant on his two hundred parts. Twenty thousand takes ages. Must be the computer."
dialogue_after:
  - riya.surprised: "So `in` was a loop the whole time. It just didn't say so."
hints:
  nudge: "Riya's loop runs once per part. What does `part in seen` do when `seen` is a list?"
  plan:
    - Find the line that walks along a list for every part
    - Swap the lists for something whose `in` doesn't walk
    - Check the answer is still sorted names, each named once
  shape: |
    seen = ___()
    found = ___()
    for part in parts:
        if part in seen:
            found.___(part)
        else:
            seen.___(part)
    return sorted(found)
---
Riya's spares check gives the right answers. Run it: it times itself on twenty thousand parts.

Count her loops the way you did in "Loops you can't see". `seen` and `found` are lists, so each `in` on them is a loop of its own.

Make it fast without changing what it returns: the names that appear more than once, in alphabetical order, each named once. The checks hand it thousands of parts that count every time two of them are compared.
