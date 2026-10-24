---
id: predict-step
type: predict
title: One step
concept: k-means
dialogue:
  - wendt: "Nobody labelled these stars. No answers to learn from. Just where they are."
  - pip: "Then what does it learn."
  - wendt: "Where the crowds are. Well, where the middles of the crowds are."
code: |
  import numpy as np

  stars = np.array([[1.0, 1.0], [2.0, 1.0], [1.0, 2.0], [8.0, 8.0], [9.0, 8.0]])
  centres = np.array([[1.0, 1.0], [2.0, 1.0]])

  # Each star joins its nearest centre
  distances = np.linalg.norm(stars[:, np.newaxis, :] - centres[np.newaxis, :, :], axis=2)
  labels = distances.argmin(axis=1)

  # Each centre moves to the mean of its stars
  centres = np.array([stars[labels == j].mean(axis=0) for j in range(2)])
  print(centres[1].round(2))
question: "After one step, where is the second centre?"
options:
  - text: "[8.5 8. ]"
    misconception: k-means-one-step
    feedback: "That's the middle of the far clump, where it will end up eventually. But (2, 1) is a star in the near clump, and it's its own nearest centre, so it joins centre 1 along with both far stars. The mean of all three is (6.33, 5.67), half way across the gap."
  - text: "[6.33 5.67]"
    correct: true
    feedback: "Right. Centre 1 gets the star it sits on, (2, 1), and both far stars, which are nearer to it than to centre 0. The mean of those three is out in the gap. One more step and the near star leaves it."
  - text: "[2. 1.]"
    misconception: centres-are-points
    feedback: "A centre isn't tied to a star. It moves to the mean of whichever stars chose it, which can be somewhere no star is: here, (6.33, 5.67)."
after: |
  Run it, then print `labels`. Add a second assign-and-move by copying the four lines again, and print the centres after that.
---
**k-means** sorts points into k groups without being told what the groups are. It keeps k centres and repeats two steps: every point joins its nearest centre, then every centre moves to the mean of its points. It stops when no point changes group.

Five stars, two centres to start from, both badly placed. Follow one step.
