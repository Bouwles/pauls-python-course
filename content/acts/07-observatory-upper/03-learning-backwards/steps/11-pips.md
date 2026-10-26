---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I wrote the checker. It nudges every weight and measures. Can't go wrong."
  - pip: "It says Wendt's gradients are all exactly half what they should be. So I've doubled hers."
dialogue_after:
  - pip: "Up and down are two steps apart. I divided by one. And I left every weight a hair lower."
  - pip: "I've un-doubled Wendt's gradients. She hadn't noticed. I'm not going to mention it."
hints:
  nudge: "Before trusting a checker, try it on something you can do by hand. What should the slope of `w ** 2` be, and what does Pip's give? Then look at `weights` afterwards."
  plan:
    - Compare the measured slope with the one worked out by hand
    - Work out how far apart the up and down nudges are
    - Divide by that distance
    - Put each entry back exactly as it was before moving to the next
  shape: |
    for index in np.ndindex(array.shape):
        original = array[index]
        array[index] = original + step
        up = f()
        array[index] = original - step
        down = f()
        array[index] = ___
        grad[index] = (up - down) / ___
---
A checker needs checking too, on something where you already know the answer. Pip's measures the slope of the sum of squares: twice each number.

`f` takes no arguments. It reads `weights` itself, so when the checker nudges an entry of the array in place, `f` sees the nudge. That is also why the checker has to undo every nudge.

Run it, compare the two lines, and look at the weights afterwards. There are two bugs.
