---
id: predict-neuron
type: predict
title: One neuron, two nights
concept: perceptron
dialogue:
  - aaesha.neutral.point: "A brain cell adds up what reaches it, and fires if the total is high enough. This copies that."
  - aaesha.thinking: "This one decides if a stargazing night goes ahead. It starts knowing nothing, and reads the log night by night."
code: |
  import numpy as np

  weights = np.zeros(3)       # cloud, humidity, moon
  bias = 0.0
  rate = 0.5

  nights = np.array([[0.2, 0.4, 0.0],     # clear: the night went ahead
                     [0.8, 0.6, 1.0]])    # cloudy, full moon: it didn't
  went_ahead = [1, 0]

  for night, label in zip(nights, went_ahead):
      guess = 1 if np.dot(weights, night) + bias > 0 else 0
      error = label - guess
      weights = weights + rate * error * night
      bias = bias + rate * error
      print(weights, bias)
question: What does this print?
options:
  - text: |-
      [0.1 0.2 0. ] 0.5
      [-0.3 -0.1 -0.5] 0.0
    correct: true
    feedback: "Right. The first night totals exactly 0, which is not above 0, so it guesses 0 and is wrong: every weight moves towards that clear night. Now all its weights are positive, so it says yes to the cloudy night too, is wrong again, and moves the other way."
  - text: |-
      [0.1 0.2 0. ] 0.5
      [0.1 0.2 0. ] 0.5
    misconception: neuron-knows-cloud-is-bad
    feedback: "The neuron doesn't know cloud is bad yet. After one clear night every weight is positive, so more of anything means a bigger total. The cloudy night totals 0.7, it says go ahead, and it's wrong."
  - text: |-
      [0. 0. 0.] 0.0
      [-0.4 -0.3 -0.5] -0.5
    misconception: step-at-zero-says-yes
    feedback: "A total of exactly 0 is not above 0, so the first guess is 0, not 1. That makes the first night a mistake, and the weights move."
after: |
  Run it. Then swap the two nights round and predict again before you run it.
---
This neuron multiplies each reading by a **weight**, adds them up and adds a **bias**. If the total is above 0, it says 1: the night goes ahead. Otherwise 0. That is a **perceptron**, which Frank Rosenblatt published in 1958 as a model of how a brain might learn.

`np.dot(weights, night)` does the multiplying and adding in one go: one number.

It learns from the log. When it guesses right, nothing changes. When it's wrong, `error = label - guess` is 1 or -1, every weight moves by `rate * error * reading`, and the bias by `rate * error`.
