---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Mine has a menu. Two options. Very tidy."
  - pip: "Every option says no such option. Ferro called it mutiny, then went quiet in the beard."
dialogue_after:
  - pip: "So \"1\" isn't 1. One's text and one's a number. They look the same to me."
hints:
  nudge: "What type does `input()` give you? And what type is the `1` on the `if` line?"
  plan:
    - Run it, type 1, and see which branch runs
    - Check what type `choice` is with `type()`
    - Compare text with text, or turn the choice into a number first
  shape: |
    choice = input("Choose 1 or 2: ")
    knots = float(input("How many? "))
    if choice == ___:
        print(f"That's {knots * 1.15078:.2f} mph.")
    elif choice == ___:
        print(f"That's {knots * 1.852:.2f} km/h.")
    else:
        print("No such option.")
---
Pip's converter only does knots. Run it, choose `1` and type `12`. It should say `That's 13.81 mph.`

Find out why every choice ends up at `No such option.`, then fix it.
