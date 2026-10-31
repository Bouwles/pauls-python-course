---
id: lamp
type: concept
title: Once round the loop
concept: for-loops
widget: lamp-loop
params: { count: 4 }
dialogue:
  - paul: "Watch the dots. Count the passes."
---
One more dot lights up for every pass of this loop:

```python
for i in range(4):
    print(i)
```

Each time round, `i` holds a new number. Watch it: 0, then 1, then 2, then 3. Four sweeps, and the first one is numbered 0.

`range(4)` means the numbers from 0 up to 4, but not 4 itself. When they run out, the light stops and the loop is over.
