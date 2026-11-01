---
id: pips
type: pips
title: Fix Yahya's version
files: [main.py]
entry: main.py
dialogue:
  - yahya.pleased: "Can you look at mine? I walked it in hundreds, so a rate of 0.1 is safe. Done in a blink."
  - yahya.confused: "It says a hundred and fifty square metres is fifty-two million dollars. Something's off."
dialogue_after:
  - yahya.surprised: "So w was dollars per hundred square metres, and I fed it square metres. A hundred times too much."
  - yahya.pleased.thumbs: "Three hundred and eighty-seven thousand. Still fast. Now it's also right."
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
Yahya's walk is right. The trouble is after it.

He measured the areas in hundreds of square metres so a bigger rate would be safe and the walk would finish quickly, and the walk found the line. Then he priced a house. Run it: a house of 150 square metres should come out at about $387,000.

Find out why it doesn't, and fix it.
