---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya.pleased: "I started Neil's converter. A menu, because nobody remembers which number is which."
  - riya.confused: "Every option says no such option. Can you look at it? Something's off."
dialogue_after:
  - riya.surprised: "So \"1\" isn't 1. They look identical. Like two blacks that turn out not to match."
hints:
  nudge: "What type does `input()` give you? And what type is the `1` on the `if` line?"
  plan:
    - Run it, type 1, and see which block runs
    - Check what type `choice` is with `type()`
    - Compare text with text, or turn the choice into a number first
  shape: |
    choice = input("Choose 1 or 2: ")
    speed = float(input("Speed? "))
    if choice == ___:
        print(f"That's {speed / 1.609344:.2f} mph.")
    elif choice == ___:
        print(f"That's {speed * 1.852:.2f} km/h.")
    else:
        print("No such option.")
---
Riya's converter only does the first two options. Run it, choose `1` and type `300`. It should say `That's 186.41 mph.`

Work out why every choice ends up at `No such option.`, then fix it.
