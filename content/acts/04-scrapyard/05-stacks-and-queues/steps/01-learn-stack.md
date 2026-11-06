---
id: learn-stack
type: learn
title: A pile used from the top
concept: stacks
dialogue:
  - paul.neutral.point: "Neil's crates. The last one on the pile is the first one off. Nobody digs from the bottom."
code: |
  plans = []
  plans.append("Monday's plan")
  plans.append("Tuesday's plan")
  plans.append("Wednesday's plan")
  print(plans.pop())
  print(plans.pop())
  print(plans)
---
A **stack** is a pile you only use from the top. **Pushing** puts something on the top; **popping** takes the top thing off. So the last thing on is the first thing off. Picture a pile of crates: you take the one you put down last.

A list makes a good stack if you only use its end. `append` pushes onto the end, and `pop()`, with nothing in the brackets, takes the end item off and hands it back. Both are O(1).

The example pushes three plans and pops two. It prints `Wednesday's plan`, `Tuesday's plan`, then `["Monday's plan"]`.

Stacks suit anything undone or closed newest first: an undo button, brackets in code, the calls waiting in a recursion. The usual slip is to expect `pop()` to take from the front.
