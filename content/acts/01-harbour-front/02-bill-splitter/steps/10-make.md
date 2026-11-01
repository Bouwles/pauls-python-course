---
id: make
type: make
title: Make the bill splitter
on_pass: { caitlin.pleased: "Forty-five fifty-four, six ways, seven fifty-nine. Quicker than the card machine." }
hints:
  nudge: "What does `input()` give you, and what does arithmetic need? And which comes first: adding the tip, or splitting the bill?"
  plan:
    - Ask for the text
    - Turn the text into numbers
    - Work out the total with the tip, then each share
    - Show it, rounded
  shape: |
    bill = ___(input("Bill? "))
    people = ___(input("People? "))
    tip = ___(input("Tip (%)? "))
    total = bill * (___)
    each = ___
    print(f"Total with tip: {total___}")
    print(f"Each pays: {each___}")
---
Write the bill splitter from scratch, for the class dinner and every table after it.

```
Bill? 41.40
People? 6
Tip (%)? 10
Total with tip: 45.54
Each pays: 7.59
```

The tip can have a decimal point: a 12.5 per cent service charge is common. The comments in the file are Paul's subgoals from the cable example. Use them.
