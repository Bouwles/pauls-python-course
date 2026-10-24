---
id: predict
type: predict
title: The top of the pile
concept: stacks
dialogue:
  - nell: "Last crate on the pile is the first one off. Nobody digs from the bottom."
code: |
  crates = []
  crates.append("hubcaps")
  crates.append("bells")
  crates.append("springs")
  top = crates.pop()
  print(top)
  print(crates)
question: What does this print?
options:
  - text: |-
      springs
      ['hubcaps', 'bells']
    correct: true
    feedback: "Right. `append` puts each crate on the end, and `pop()` with no position takes the one on the end: the last one on, the first one off."
  - text: |-
      hubcaps
      ['bells', 'springs']
    misconception: pop-takes-first
    feedback: "`pop()` with nothing in the brackets takes from the end, not the front. The end is the top of the pile, where the last crate went."
  - text: |-
      springs
      ['hubcaps', 'bells', 'springs']
    misconception: pop-only-looks
    feedback: "`pop()` doesn't just look at the top crate: it takes it off. The springs are in `top` now, and not in `crates`."
after: |
  Run it. Then pop twice more, and once more after that. Read the last line of the traceback.
---
A **stack** is a pile you only use from the top. Pushing puts something on the top; popping takes the top thing off. The last thing on is the first thing off.

A list makes a good stack if you only use its end: `append` pushes, and `pop()` pops.
