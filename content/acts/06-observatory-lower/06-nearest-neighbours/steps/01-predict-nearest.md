---
id: predict-nearest
type: predict
title: Most like this one
concept: knn
dialogue:
  - aaesha.thinking: "A penguin from the Palmer data. I've hidden its name. Shallow bill, long flippers. I'd say Gentoo."
code: |
  import numpy as np

  # bill depth (mm), flipper length (mm), body mass (g)
  new = np.array([14.5, 212, 4600])
  penguins = np.array([
      [14.8, 215, 4900],     # penguin 1: Gentoo
      [18.0, 190, 4600],     # penguin 2: Adelie
      [15.0, 220, 5100],     # penguin 3: Gentoo
  ])

  distance = np.sqrt(((penguins - new) ** 2).sum(axis=1))
  print("Most like it: penguin", np.argmin(distance) + 1)
question: "Which penguin does the distance say is most like the new one?"
options:
  - text: "Most like it: penguin 1"
    misconception: distance-treats-features-fairly
    feedback: "To us, penguin 1 matches on the bill and the flippers. To the sum, a mass that's 300 grams out squares to 90,000, and swamps a bill that differs by tenths of a millimetre."
  - text: "Most like it: penguin 2"
    correct: true
    feedback: "Right. Penguin 2 weighs exactly the same, and mass is counted in thousands of grams. Its bill is 3.5 mm deeper and its flippers 22 mm shorter, which is the difference between an Adelie and a Gentoo, but those barely register."
  - text: "A ValueError: the measurements are in different units"
    misconception: numpy-checks-units
    error: ValueError
    feedback: "NumPy has no idea what a gram is. Every column is just numbers to it, which is precisely the problem."
after: |
  Run it, then print `distance` to see the three. Now put each column on the same footing: divide `penguins` and `new` by `np.array([2, 14, 800])`, roughly each measurement's spread, before measuring. Which penguin is nearest now?
---
**Nearest neighbours** names an animal by finding the ones already named that are most like it. "Most like" means nearest: subtract one animal's measurements from the other's, square the differences, add them up and take the square root. That's the straight-line distance, as on a map, but with three measurements instead of two. Psychologists have a theory that people name things the same way, by the remembered examples most like them.

Here are three penguins from the data, and a new one.
