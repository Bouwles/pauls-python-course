---
id: ferry
type: make
title: "Question 6: The ferry's load limit"
files: [ferry.py]
entry: ferry.py
on_pass: { paul.pleased: "Every crate across on time, nothing split, nothing left behind. Binary search on the answer, not the list." }
hints:
  nudge: "If a limit of 20 kg gets everything across in time, what do you know about 21 kg? And about 19?"
  plan:
    - "A helper: how many crossings one limit takes, loading the crates in order"
    - The answer is at least the heaviest crate, and at most all the crates together
    - While that range holds more than one limit, check the one in the middle
    - "Middle works: the answer is middle or lighter, so keep middle in the range"
    - "Middle doesn't: the answer is heavier than middle"
    - "No crates: 0"
  shape: |
    def crossings_needed(crates, limit):
        crossings = 1
        load = 0
        for weight in crates:
            if load + weight > limit:
                crossings += 1
                load = ___
            load += weight
        return crossings


    def smallest_limit(crates, days):
        if not crates:
            return 0
        low = ___(crates)
        high = ___(crates)
        while low < high:
            middle = (low + high) // 2
            if crossings_needed(crates, middle) <= days:
                high = ___
            else:
                low = ___
        return low
---
A river ferry takes crates downstream, one crossing a day, in the order they're stacked on the bank. Each crossing takes the next crates in order until the next one would put it over the load limit. A crate is never split.

Write `smallest_limit(crates, days)`: the smallest whole-number load limit, in kilos, that gets every crate across in `days` crossings or fewer. With no crates, it's 0.

**Limits:** up to 50,000 crates, each from 1 to 10,000 kg. `days` is at least 1.

```
smallest_limit([4, 8, 3, 5, 6], 3)    gives 11    [4] [8, 3] [5, 6]
smallest_limit([4, 8, 3, 5, 6], 5)    gives 8     the 8 kg crate needs a crossing of its own
```

Checking one limit is easy: load the crossings and count them. The question is how few limits you can get away with checking.
