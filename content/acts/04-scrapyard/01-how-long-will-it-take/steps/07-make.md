---
id: make
type: make
title: Make the speed tester
files: [speed_tester.py]
entry: speed_tester.py
on_pass: { neil.laughing.cheer: "Twice the parts, four times the comparisons. I said it would fall over." }
hints:
  nudge: "Where, in Neil's loops, do two parts actually get compared? That's where the counting goes. And what does `scale` say for each growth when n doubles?"
  plan:
    - "spares_by_pairs: his loops, plus a count that goes up at every comparison"
    - "spares_by_set: one loop, a set of parts seen, a count for every lookup"
    - "time_once: read the clock, do the job once, read the clock again and subtract"
    - "scale: one branch per growth, and a ValueError for anything else"
    - "guess_growth: divide the two counts, then keep the growth whose scale from n to 2n is nearest"
    - "chart: find the biggest value, then one line per size with a bar in proportion"
  shape: |
    def spares_by_pairs(parts):
        found = set()
        comparisons = 0
        for first in range(len(parts)):
            for second in range(___, len(parts)):
                comparisons = ___
                if parts[first] == parts[second]:
                    found.add(parts[first])
        return ___, comparisons


    def guess_growth(n, steps_n, steps_2n):
        measured = ___
        best = GROWTHS[0]
        for growth in GROWTHS:
            if abs(scale(n, 2 * n, growth) - measured) < abs(___ - measured):
                best = growth
        return best


    def chart(sizes, values):
        biggest = max(values)
        lines = []
        for size, value in zip(sizes, values):
            bar = "#" * ___
            lines.append(f"{size:>6} | {bar:<{BAR_WIDTH}} {value}")
        return "\n".join(___)
---
Build the speed tester in `speed_tester.py`. Neil's spares check is at the top, with his notes. Write the six functions from the brief below it. The report and the main block are written, and Paul's timing subgoals are in there as comments.

```
By pairs, comparisons:
   200 | ##                                       19900
   400 | ##########                               79800
   800 | ######################################## 319600
Growth: O(n^2)
```

`time_once` takes a function as its first argument, as `sorted` takes one for `key=`. Inside, call it like any other.

`chart` gives back one string, its lines joined with `"\n"`. In an f-string, `{size:>6}` right-aligns a number in six characters and `{bar:<40}` pads text out to forty.

Your seconds will differ from the brief's, and from one run to the next. The hidden checks try empty stock lists, three of a kind, every growth and a hundred thousand parts, and count every comparison your code makes.
