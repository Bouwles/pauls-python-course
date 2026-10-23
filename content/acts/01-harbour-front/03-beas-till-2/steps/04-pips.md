---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Done already. Look."
  - pip: "It crashes. I think Python is broken."
dialogue_after:
  - pip: "So the number was text the whole time. That's a bit sneaky of it."
hints:
  nudge: "What type is `qty` on line 4? What does multiplying need?"
  plan:
    - Find the line the traceback points at
    - Work out what type each side of the `*` is
    - Turn the quantity into a whole number where it is read
  shape: |
    item = input("Item? ")
    qty = ___(input("How many? "))
    if item == "bread":
        total = qty * 2.40
    else:
        total = qty * 0.85
    print(f"That's {total:.2f}, please.")
---
Pip's till chooses a price with `if` and `else`: if the item is bread, one price, otherwise the other. The Ferry job covers `if` properly.

Run it with `bread` and `3`. Read the traceback. Then fix it.
