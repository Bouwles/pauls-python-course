---
id: pips
type: pips
title: Fix Aaesha's version
dialogue:
  - aaesha.neutral: "Can you look at mine? I wrote the checker before anything else. It nudges every weight and measures."
  - aaesha.confused: "It says Neil's gradients are all exactly half what they should be. His are usually right. Something's off."
dialogue_after:
  - aaesha.surprised: "Up and down are two steps apart. I divided by one. And I left every weight a hair lower."
  - aaesha.laughing: "So Neil's gradients were right all along. My test had the typo."
hints:
  nudge: "Before trusting a checker, try it on something you can do by hand. What should the slope of `w ** 2` be, and what does Aaesha's give? Then look at `weights` afterwards."
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
A checker needs checking too, on something where you already know the answer. Aaesha's measures the slope of the sum of squares, which is twice each number.

`f` takes no arguments. It reads `weights` itself, so when the checker nudges an entry of the array in place, `f` sees the nudge. That's also why the checker has to put every entry back.

Run it, compare the two lines, and look at the weights afterwards. There are two bugs.
