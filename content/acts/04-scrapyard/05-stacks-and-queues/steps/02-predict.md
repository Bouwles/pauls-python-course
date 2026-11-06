---
id: predict
type: predict
title: The top of the pile
concept: stacks
code: |
  crates = []
  crates.append("sprockets")
  crates.append("brake pads")
  crates.append("spark plugs")
  top = crates.pop()
  print(top)
  print(crates)
question: What does this print?
options:
  - text: |-
      spark plugs
      ['sprockets', 'brake pads']
    correct: true
    feedback: "Right. `append` puts each crate on the end, and `pop()` with no position takes the one on the end: the last one on, the first one off."
  - text: |-
      sprockets
      ['brake pads', 'spark plugs']
    misconception: pop-takes-first
    feedback: "`pop()` with nothing in the brackets takes from the end, not the front. The end is the top of the pile, where the last crate went."
  - text: |-
      spark plugs
      ['sprockets', 'brake pads', 'spark plugs']
    misconception: pop-only-looks
    feedback: "`pop()` doesn't just look at the top crate: it takes it off. The spark plugs are in `top` now, and not in `crates`."
after: |
  Run it. Then pop twice more, and once more after that. Read the last line of the traceback.
---
Neil's crates on a stack, with one popped off the top.
