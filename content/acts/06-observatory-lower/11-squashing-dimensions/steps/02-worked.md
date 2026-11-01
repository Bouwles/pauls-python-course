---
id: worked
type: worked
title: How Paul would sort it
dialogue:
  - riya.thinking: "My art supplies come in small, middling and big boxes. I know which is which. I couldn't say why."
  - paul.pleased: "Then we won't tell it either. Three heaps, from the weights alone."
code: |
  import random

  # Riya's art supplies, delivered to the Makerspace and weighed at the door, in kg
  weights = [2.1, 11.8, 2.4, 25.0, 1.9, 12.5, 2.2, 24.1, 11.2, 26.3, 12.0, 1.8, 6.5, 18.0]
  k = 3
  SEED = 11

  centres = random.Random(SEED).sample(weights, k)
  print("Start:", centres)

  labels = []
  while True:
      new_labels = []
      for weight in weights:
          nearest = min(range(k), key=lambda j: abs(weight - centres[j]))
          new_labels.append(nearest)
      if new_labels == labels:
          break
      labels = new_labels
      for j in range(k):
          heap = [w for w, label in zip(weights, labels) if label == j]
          if heap:
              centres[j] = sum(heap) / len(heap)
      print("Centres:", [round(c, 1) for c in centres])

  spread = sum((w - centres[label]) ** 2 for w, label in zip(weights, labels))
  print(f"Inertia: {spread:.2f}")
subgoals:
  - label: The weights
    lines: [3, 6]
  - label: Start from k different boxes
    lines: [8, 9]
  - label: Assign each to its nearest centre
    lines: [13, 16]
  - label: Stop when nothing changes
    lines: [17, 19]
  - label: Move each centre to the middle of its heap
    lines: [20, 24]
  - label: Measure the inertia
    lines: [26, 27]
explain:
  prompt: "With `SEED = 7`, the same boxes end with an inertia of 64.82, not 49.84. Why can the same method give a worse answer?"
  answer: "Each step can only lower the inertia, so k-means walks downhill from wherever it starts and stops in the first hollow it reaches. From seed 7, the 18 kg box settles in with the heavy boxes and the 6.5 kg box with the middling ones. Every box is then nearest its own centre, so nothing changes and the loop stops, though another arrangement is tighter. So run it from several starts and keep the lowest inertia."
  concept: k-means
---
`random.Random(SEED).sample(weights, k)` picks k different boxes to start from, the same ones every time for one seed.

The **inertia** is how tight the heaps are: each box's distance to its own centre, squared, all added up. Both steps can only lower it or leave it alone, so the loop always stops.

`centres` is a list of numbers, so the step-through visualiser draws it as three bars. Press Step through and watch them settle: a middling centre slides all the way down to the light boxes. Then change `SEED` to 7 and run it again.
