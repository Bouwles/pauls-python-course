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
    - "Work out the answer: the total with the tip, then each share"
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
Now the bill splitter, for the class dinner and every table after it. It asks three questions, then prints two lines:

```text
Bill? 41.40
People? 6
Tip (%)? 10
Total with tip: 45.54
Each pays: 7.59
```

Your file starts with the four steps from Paul's cable program, as comments. Under each, write the lines that do it:

1. Ask for the bill, the people and the tip with `input()`.
2. Turn them into numbers: `float()` for the bill and the tip, which can have a decimal point (a 12.5 per cent service charge is common), and `int()` for the people.
3. Add the tip, as in Yahya's fix, then share the `total` out as `each`.
4. Show both with `:.2f`.

The checks try the class dinner and other tables, including one person paying the lot, a share like 2.40 that ends in a zero, and a 12.5 per cent tip.
