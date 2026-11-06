---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya.proud: "The race's early errors, printed, then counted. I used a generator, so it's fast."
  - yahya.confused: "It says nought errors. I've read them out loud. There are two. Can you look?"
dialogue_after:
  - yahya.unimpressed: "So a generator only goes round once. Fast, but you only get the one go."
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
Yahya's program prints the errors from the start of Neil's race, then how many there were. Run it and look at the count.

Fix it so the count is the real one. The checks try other stretches of the race too.
