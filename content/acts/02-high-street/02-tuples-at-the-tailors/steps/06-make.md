---
id: make
type: make
title: Make the measurement book
on_pass: { caitlin.pleased: "Three players, three lines, and every number beside its owner." }
hints:
  nudge: "zip pairs each name with its tuple. What does enumerate add, and how will you get the chest, waist and leg out of each tuple?"
  plan:
    - Number the lines with enumerate, starting at 1
    - Walk both lists together with zip, unpacking each pair
    - Start with the first entry as the best so far
    - Keep the better one, both parts at once
    - Return both answers together
    - Unpack the answers where they land
  shape: |
    def print_book(names, sizes):
        for number, (name, size) in ___(___(names, sizes), start=1):
            chest, waist, leg = ___
            print(f"{number}. {name}: chest {chest}, waist {waist}, leg {leg}")


    def longest_leg(names, sizes):
        best_name, best_leg = names[0], sizes[0][2]
        for name, (chest, waist, leg) in zip(names, sizes):
            if leg ___ best_leg:
                best_name, best_leg = ___, ___
        return ___, ___


    print_book(names, sizes)
    name, leg = longest_leg(names, sizes)
    print(f"Longest leg: {name}, {leg} cm")
---
Write Caitlin's two functions, then use them to print the kit book:

```
1. Jon Hale: chest 112, waist 98, leg 84
2. Mae Grant: chest 96, waist 88, leg 74
3. Ray Lowe: chest 101, waist 95, leg 79
Longest leg: Jon Hale, 84 cm
```

`print_book` prints; `longest_leg` returns the name and the leg together. If two legs tie, the first in the book wins.

The checks call both functions with other players, so they must use their parameters, not Caitlin's lists.
