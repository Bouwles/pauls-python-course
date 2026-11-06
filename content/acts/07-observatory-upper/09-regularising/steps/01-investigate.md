---
id: investigate
type: investigate
title: Perfect, on paper
concept: overfitting
dialogue:
  - riya.proud.point: "Sixty-four neurons, three thousand epochs. Look at that training loss."
  - aaesha.unimpressed: "I'm looking at the other line."
code: |
  import matplotlib.pyplot as plt

  from net import backward, forward, init_params, load_nights, mse

  X, T, X_val, T_val = load_nights()       # 24 nights to learn from, 36 to check on
  params = init_params(6, 64)

  train_losses, val_losses = [], []
  for epoch in range(3000):
      P, cache = forward(X, params)
      grads = backward(X, T, params, cache)
      for name in params:
          params[name] -= 0.1 * grads[name]
      train_losses.append(mse(forward(X, params)[0], T))
      val_losses.append(mse(forward(X_val, params)[0], T_val))

  print(f"Training loss at the end: {train_losses[-1]:.4f}")
  print(f"Validation loss at the end: {val_losses[-1]:.4f}")

  plt.plot(train_losses, label="training: 24 nights")
  plt.plot(val_losses, label="validation: 36 nights it never saw")
  plt.yscale("log")
  plt.xlabel("epoch")
  plt.ylabel("mean squared error")
  plt.legend()
  plt.show()
tasks:
  - id: training-loss
    prompt: "Run it. What is the training loss at the end?"
    kind: answer
    accept: ["0.0000", "0", "0.0", "0.00", "0.000"]
    feedback: "Zero, to four places. It fits Neil's 24 nights exactly, noise and all."
    wrong: "Read the first line of the output."
  - id: best-epoch
    prompt: "Add `print(val_losses.index(min(val_losses)))` and run it again. At which epoch was the validation loss lowest?"
    kind: answer
    accept: ["98", "epoch 98"]
    feedback: "Epoch 98, at about 0.18. After that, every step that helped the 24 nights made the other 36 worse. By the end it's 0.2455."
    wrong: "Epochs count from 0, like the list. Print the index of the smallest validation loss."
---
Riya's network is the seeing network from `net.py`. Six readings go in: the wind, the jet stream overhead, humidity, how fast the air cooled, the moon and the pressure. Out comes the seeing: how much the stars shimmer, in arcseconds. Smaller is steadier.

Neil rated 60 nights. The first 24 are for learning; the other 36 only check. The chart shows both losses against epochs, like the validation curve for the exam scores.

Riya's network has 513 weights and biases with which to fit 24 nights. It can learn the noise, so it does.
