---
id: fix-name
type: fix
title: Script two, the times
dialogue:
  - neil.laughing: "My first week here. I time laps to the hundredth, and I couldn't spell time."
hints:
  nudge: "Read the end of the error message. Python has a suggestion."
  plan:
    - Read the last line of the error
    - Compare the name it complains about with the names defined above
    - Make the spelling match
  shape: |
    clock_time = "03:14"
    real_time = "09:30"
    print("Clock says:", clock_time)
    print("Actually:", ___)
---
A **NameError** means Python met a name nobody told it about. Usually it's a typo, or a variable used before it was given a value.

Fix it so it prints:

```
Clock says: 03:14
Actually: 09:30
```
