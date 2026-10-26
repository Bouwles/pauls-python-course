---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Penhallow's check has a loop inside a loop. Mine has one loop. So mine's O(n)."
  - pip: "Twenty thousand parts and it still takes ages. Must be the computer."
dialogue_after:
  - pip: "So `in` was a loop the whole time. It just didn't say so."
hints:
  nudge: "Pip's loop runs once per part. What does `part in seen` do when `seen` is a list?"
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
Pip's spares check gives the right answers. Run it: it times itself on twenty thousand parts.

Count the loops properly. A `for` you can see is one loop, but `x in some_list` is another, and so are `.count()`, `.index()` and `.remove()` on a list. A hidden loop inside a visible one is O(n²), with only one `for` in sight.

The checks hand it thousands of parts that count every time two of them are compared.
