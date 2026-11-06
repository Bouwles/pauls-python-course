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
Neil's script puts the Clocktower clock, stuck at 3:14, next to the real time. Run it and read the last line of the traceback, all the way to the end.

Fix it so it prints:

```text
Clock says: 03:14
Actually: 09:30
```
