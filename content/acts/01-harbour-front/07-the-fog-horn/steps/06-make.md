---
id: make
type: make
title: Make the fog log
on_pass: { tom: "Two hundred, one fifty, four hundred. Two fifty. About what I'd have guessed." }
hints:
  nudge: "You need two running totals: how many readings, and how many metres. What should happen if there were no readings at all?"
  plan:
    - Start the totals at zero
    - Ask before the loop
    - Loop until the sentinel
    - Add to the totals
    - Ask again at the bottom
    - Report after the loop, unless there was nothing to report
  shape: |
    total = 0
    count = 0
    reading = input("Visibility in metres? ")
    while reading != ___:
        total = total + ___
        count = ___
        reading = ___
    if count == ___:
        print("No fog tonight.")
    else:
        print(f"Readings: {count}")
        print(f"Average: {___:.1f} metres")
---
Write Tom's fog log. Keep asking until he types `clear`, then report.

```
Visibility in metres? 200
Visibility in metres? 150
Visibility in metres? 400
Visibility in metres? clear
Readings: 3
Average: 250.0 metres
```

If `clear` is the first thing he types, print `No fog tonight.` and nothing else.

Moss's labels are in the file, under the old comments at the top. Read those too.
