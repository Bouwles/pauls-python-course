---
id: the-claim
type: reading
title: The claim
dialogue:
  - paul.thinking.point: "You drew the U with exam marks in the Model Room. This is what happens off its right-hand edge."
---
In the Exam Score Model, the validation curve made a U: too stiff, then about right, then too flexible. The highest degrees had enough weights to chase the noise in the marks, and they did.

The paper looks further right. Give a model more parameters than training examples and it can pass through every one of them in endless different ways. Choose the way with the smallest weights, the **minimum-norm** fit, and the test error, the paper says, comes down again: a second descent.

The worst place is the **interpolation threshold**, where the parameters only just match the examples. There, exactly one set of weights fits, and it is a wild one.

The model is **random features**: each example's inputs are mixed by many fixed random weights and passed through ReLU, and only the last layer of weights is fitted, by least squares. Fixed seeds make every random choice repeatable.
