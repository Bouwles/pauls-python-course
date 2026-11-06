---
id: predict-step
type: predict
title: One step
concept: k-means
dialogue:
  - caitlin.confused: "If nobody labelled them, what does it learn?"
  - yahya.thinking.point: "Where the crowds are. Well, where the middles of the crowds are."
code: |
  import numpy as np

  # Five customers: thousands spent on fresh food, and on groceries
  customers = np.array([[1.0, 1.0], [2.0, 1.0], [1.0, 2.0], [8.0, 8.0], [9.0, 8.0]])
  centres = np.array([[1.0, 1.0], [2.0, 1.0]])

  # Each customer joins its nearest centre
  distances = np.linalg.norm(customers[:, np.newaxis, :] - centres[np.newaxis, :, :], axis=2)
  labels = distances.argmin(axis=1)

  # Each centre moves to the mean of its customers
  centres = np.array([customers[labels == j].mean(axis=0) for j in range(2)])
  print(centres[1].round(2))
question: "After one step, where is the second centre?"
options:
  - text: "[8.5 8. ]"
    misconception: k-means-one-step
    feedback: "That's the middle of the far clump, where it will end up eventually. But (2, 1) is a customer in the near clump, and it's its own nearest centre, so it joins centre 1 along with both far customers. The mean of all three is (6.33, 5.67), half way across the gap."
  - text: "[6.33 5.67]"
    correct: true
    feedback: "Right. Centre 1 gets the customer it sits on, (2, 1), and both far customers, which are nearer to it than to centre 0. The mean of those three is out in the gap. One more step and the near customer leaves it."
  - text: "[2. 1.]"
    misconception: centres-are-points
    feedback: "A centre isn't tied to a customer. It moves to the mean of whichever customers chose it, which can be somewhere no customer is: here, (6.33, 5.67)."
after: |
  Run it, then print `labels`. Add a second assign-and-move by copying the four lines again, and print the centres after that.
---
Five customers in two columns, and two centres to start from, both in the near clump. Follow one join-and-move step: which customers join each centre, then where the second centre moves.
