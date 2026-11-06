---
id: learn-tracing
type: learn
title: Following a loop on paper
concept: tracing-loops
code: |
  total = 0
  for n in range(1, 5):
      total = total + n
      print(n, total)
---
To **trace** a loop, you follow it the way Python does, one pass at a time, and write down each variable as it changes: one row per pass.

```text
n   total
1   1
2   3
3   6
4   10
```

`total = total + n` takes what `total` already holds, adds `n`, and keeps the answer. So `total` builds up pass by pass, from the 0 it started at. A quiz score works the same way.

A `print()` inside the loop, like line 4 of the example, shows the same table on screen.

The usual mistake is thinking `total` ends up holding only the last number added. It holds them all, added up.
