---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I did the tip part already. Twenty pounds, ten per cent tip: twenty pounds ten."
  - pip: "Bea gave me a look. I think it was a look."
dialogue_after:
  - pip: "So the times went first, and the lifeboat tin got ten pence. Brackets. Fine."
hints:
  nudge: "On line 3, which happens first, the `*` or the `+`? Work out `20 * 1 + 10 / 100` by hand, in Python's order."
  plan:
    - Run it with 20 and 10, and compare with 22.00
    - Work out which part of the sum Python does first
    - Add brackets so the tip becomes a fraction before it multiplies
    - Rename each variable for what it holds
  shape: |
    bill = float(input("Bill? "))
    tip = float(input("Tip (%)? "))
    total = bill * (___)
    print(f"Total with tip: {total:.2f}")
---
Pip's program adds a tip to a bill. Run it with a bill of `20` and a tip of `10`. It should say `Total with tip: 22.00`.

Find out why it doesn't, then fix it. While you're in there, give the variables honest names. Moss won't accept `a`, `b` and `c`.
