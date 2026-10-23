---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I did the night fare. Before seven and after nineteen. Exactly what Ferro said."
  - pip: "Nobody has paid it yet, though. Ferro's started calling it mutiny."
dialogue_after:
  - pip: "So and means both at once. No hour is both. That's fair, actually."
hints:
  nudge: "Take hour 20. Is it before 7? Is it 19 or later? Does `and` need one of those to be true, or both?"
  plan:
    - Run it with 20 and see which fare comes out
    - Work out each side of the test for 20
    - Use the operator that needs only one side to be true
  shape: |
    hour = int(input("Hour of sailing? "))
    if hour < 7 ___ hour >= 19:
        fare = 4.00
    else:
        fare = 3.00
    print(f"Adult fare: {fare:.2f}")
---
Pip's program only does adults. Run it for the evening crossing, hour `20`. It should cost 4.00.

Find out why it doesn't, then fix it. The night is before 7, or 19 and later.
