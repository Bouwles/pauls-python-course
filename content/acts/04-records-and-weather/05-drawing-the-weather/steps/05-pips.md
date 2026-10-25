---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Two charts for the noticeboard. I zoomed in on the warming so people actually notice it."
  - pip: "And the driest year and the wettest look the same. So the rain hardly varies. Science."
dialogue_after:
  - pip: "So the 2020s weren't nineteen times warmer than the 1960s. A degree and a half. Not a cliff."
  - pip: "And 1960 had nearly twice the rain of 1982. The panels were both just filling their boxes."
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
Priya caught both of Pip's charts before they went up. "The warming is real," she said. "These charts would be lying about it anyway."

Run it. Look at how tall the 1960s bar is next to the 2020s. Then look at the two rain panels, 1982 and 1960, and at the numbers up the side of each.

Fix both functions so that the charts are honest.
