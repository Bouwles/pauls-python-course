---
id: fix-name
type: fix
title: Script two, the times
dialogue:
  - moss: "Penhallow's comments are better than her typing."
hints:
  nudge: "Read the end of the error message. Python has a suggestion."
  plan:
    - Read the last line of the error
    - Compare the name it complains about with the names defined above
    - Make the spelling match
  shape: |
    high_water = "06:42"
    low_water = "12:55"
    print("High water:", high_water)
    print("Low water:", ___)
---
A **NameError** means Python met a name nobody told it about. Usually it's a typo, or a variable used before it was given a value.

Fix it so it prints:

```
High water: 06:42
Low water: 12:55
```
