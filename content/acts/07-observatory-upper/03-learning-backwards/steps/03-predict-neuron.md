---
id: predict-neuron
type: predict
title: One neuron, two nights
concept: perceptron
dialogue:
  - aaesha.thinking: "It starts knowing nothing, and reads the log night by night."
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
A perceptron learns from two nights of the stargazing log, one after the other, starting from all zeros. It prints the weights and the bias after each night. Follow both updates.
