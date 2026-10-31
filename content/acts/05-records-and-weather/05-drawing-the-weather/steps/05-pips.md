---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin: "Can you look at mine? Two charts for the wall. I zoomed in on the warming so people notice it."
  - caitlin: "And the driest year and the wettest look the same. So the rain hardly varies. Done."
dialogue_after:
  - caitlin: "So the 2020s weren't seven times warmer than the 1960s. About a degree. Not a cliff."
  - caitlin: "And 1999 had nearly twice the rain of 1968. The panels were both just filling their boxes."
hints:
  nudge: "Where does each bar start from, and what does that do to how long the bars look? And what scale does each rain panel choose for itself?"
  plan:
    - Run it and look at both charts
    - Start the decade bars from zero
    - Give the two rain panels one scale between them
  shape: |
    ax.set_ylim(bottom=___)

    fig, axes = plt.subplots(1, 2, figsize=(10, 3), ___=True)
---
Aaesha caught both of Caitlin's charts before they went up. "The warming is real," she said. "That chart starts at 7.8. It's lying about it anyway."

Run it. Look at how tall the 1960s bar is next to the 2020s. Then look at the two rain panels, 1968 and 1999, and at the numbers up the side of each.

Fix both functions so that the charts are honest.
