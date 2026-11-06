---
id: lamp
type: concept
title: Once round the loop
concept: for-loops
widget: lamp-loop
params: { count: 4 }
dialogue:
  - paul.neutral.point: "Watch the dots. Count the passes."
---
Watch this loop run, one pass at a time:

```python
for i in range(4):
    print(i)
```

Press **Start the loop**, then **Next pass** for each pass after that. One more dot lights up every time round, and `i` holds the next number from the range: 0, then 1, then 2, then 3.

Four passes, and the first is numbered 0. When the numbers run out, the loop is over.
