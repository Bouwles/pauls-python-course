---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya: "I started Yahya's converter. A menu, because nobody remembers which number is which."
  - riya: "Every option says no such option. Can you look at it? Something's off."
dialogue_after:
  - riya: "So \"1\" isn't 1. One's text and one's a number. They look the same to me."
hints:
  nudge: "What type does `input()` give you? And what type is the `1` on the `if` line?"
  plan:
    - Run it, type 1, and see which branch runs
    - Check what type `choice` is with `type()`
    - Compare text with text, or turn the choice into a number first
  shape: |
    choice = input("Choose 1 or 2: ")
    amount = float(input("How many? "))
    if choice == ___:
        print(f"That's {amount / 1.609344:.2f} miles.")
    elif choice == ___:
        print(f"That's {amount * 1.609344:.2f} min per mile.")
    else:
        print("No such option.")
---
Riya's converter only does the first two. Run it, choose `1` and type `12`. It should say `That's 7.46 miles.`

Find out why every choice ends up at `No such option.`, then fix it.
