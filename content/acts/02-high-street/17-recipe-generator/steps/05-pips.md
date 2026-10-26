---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "This morning's errors, printed, then counted. The printing part is perfect."
  - pip: "It says nought errors. I've read them out loud. There are two."
dialogue_after:
  - pip: "So it only goes round once. Somebody should put that on the label."
hints:
  nudge: "By the time `len(list(found))` runs, the `for` loop has had every value out of `found`. What's left to count?"
  plan:
    - Run it and look at the count
    - Find the second place `found` is used
    - Keep the errors in a list, since this program needs them twice
  shape: |
    found = ___(errors(log))
    for line in found:
        print(line)
    print(len(found), "errors")
---
Pip's program prints this morning's errors, then how many there were. Run it and look at the count.

Fix it so the count is the real one. The checks try other mornings too.
