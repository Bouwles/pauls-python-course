---
id: make
type: make
title: Make the fare machine
on_pass: { ferro: "Seventy, on the five o'clock. One fifty. My mother will approve." }
hints:
  nudge: "Which band does a passenger fall into, youngest first? And in which band, only one, does the hour matter?"
  plan:
    - Ask for the numbers
    - Choose the band, youngest first
    - Decide again inside the band that has a special case
    - Catch everything else
    - Show the result
  shape: |
    age = int(input("Age? "))
    hour = int(input("Hour of sailing? "))
    if age < ___:
        fare = 0.00
    elif age < ___:
        fare = 1.50
    elif age < ___:
        if hour < ___ or hour >= ___:
            fare = 4.00
        else:
            fare = 3.00
    else:
        fare = 1.50
    print(f"Fare: {fare:.2f}")
---
Write Ferro's fare machine.

- Under 5: free.
- 5 to 15, or 65 and over: 1.50.
- 16 to 64: 3.00 by day, 4.00 at night (before 7, or 19 and later).

```
Age? 34
Hour of sailing? 20
Fare: 4.00
```

The comments in the file are Moss's labels from the mooring fees. The checks try the ages and hours on every boundary, so look hard at `<` and `<=`.
