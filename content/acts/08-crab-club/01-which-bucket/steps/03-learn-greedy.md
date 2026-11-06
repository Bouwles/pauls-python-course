---
id: learn-greedy
type: learn
title: Always the best so far
concept: bandits
code: |
  estimates = [0.25, 0.0, 0.0]
  print(estimates.index(max(estimates)))

  estimates = [0.0, 0.0, 0.0]
  print(estimates.index(max(estimates)))
---
The simplest plan is to show every visitor the screen with the best estimate so far. That plan is called **greedy**.

`estimates.index(max(estimates))` finds that screen: `max` gives the biggest estimate, and `.index` gives its position. When two tie, `.index` gives the first. The example prints `0`, then `0` again.

Greedy has a flaw. A screen's estimate only changes when someone is shown it. A screen nobody has seen stays at 0.0, so once any screen scores above zero, greedy may never try the others, however good they are.

The usual mistake is expecting greedy to find the best screen by itself. It can only learn about what it tries.
