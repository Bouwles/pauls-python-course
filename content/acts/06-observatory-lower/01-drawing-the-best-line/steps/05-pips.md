---
id: pips
type: pips
title: Pip's Version
files: [main.py]
entry: main.py
dialogue:
  - pip: "I walked it in hundreds, like you said. Rate 0.1, two thousand steps, no explosions."
  - pip: "It says a hundred and fifty square metres is fifty-two million dollars. Seattle's dear. Is it that dear?"
dialogue_after:
  - pip: "So w was dollars per hundred square metres, and I fed it square metres. A hundred times too much."
  - pip: "Three hundred and eighty-seven thousand. That's a house, not a harbour."
hints:
  nudge: "The walk learnt `w` from `hundreds`. What units does the area in `w * area + b` have to be in, then?"
  plan:
    - Run it and compare the price with the line's slope of about 3,500 dollars a square metre
    - Work out which units `w` was learnt in
    - Give the new house's area in the same units
  shape: |
    area = 150.0
    price = w * (___) + b
---
Pip's walk is right. The trouble is after it.

He measured the areas in hundreds of square metres so the rate would be safe, and the walk found the line. Then he priced a house. Run it: a house of 150 square metres should come out at about $387,000.

Find out why it doesn't, and fix it.
