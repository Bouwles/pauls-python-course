---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I did Bea's shortbread. The list part is perfect."
  - pip: "The total says nought grams. I've added it up by hand. It isn't nought."
dialogue_after:
  - pip: "So it only goes round once. Somebody should put that on the label."
hints:
  nudge: "By the time `sum` runs, the `for` loop has had every value out of `scaled`. What's left for `sum` to add up?"
  plan:
    - Run it and look at the total
    - Find the second place `scaled` is used
    - Give the total a fresh pass of its own, or keep the values in a list
  shape: |
    scaled = ___(scale(recipe, batches))
    for name, grams in scaled:
        print(f"{name}: {grams} g")
    total = sum(grams for name, grams in scaled)
    print(f"Total: {total} g")
---
Pip's shortbread scaler prints each ingredient, then the total weight. Run it and look at the total.

Fix it so the total is the real one. The check also tries other numbers of batches.
