---
id: make
type: make
title: Penhallow's brain
files: [brain.py]
entry: brain.py
on_pass: { wendt: "A foggy afternoon: lamp and horn. Tom would say the same. He'd say it slower." }
hints:
  nudge: "What shape is `evenings @ W1`, and what does adding `b1` do to each of its rows?"
  plan:
    - "Bend and squash: the two activations, for whole arrays"
    - "Layer one: multiply, add the bias, bend"
    - "Layer two: multiply, add the bias, squash"
    - "Read off the answers: for each row, the names whose output is above 0.5"
  shape: |
    def relu(z):
        return np.___(0, z)


    def sigmoid(z):
        return 1 / (1 + ___)


    def forward(evenings, W1, b1, W2, b2):
        hidden = relu(___ @ ___ + ___)
        return sigmoid(___)


    def decisions(outputs):
        return [[name for name, chance in zip(ANSWERS, row) if ___] for row in outputs]
---
Write the forward pass for Penhallow's brain. Her weights are at the top of `brain.py`: `W1` is (4, 5) and `W2` is (5, 3), so four readings go in and three answers come out. The comments are the subgoals from the captain's network.

```
Evening 1: lamp
Evening 2: lamp, horn
Evening 3: lamp, gate
Evening 4: nothing
```

`decisions(np.array([[0.9, 0.2, 0.7]]))` gives `[["lamp", "gate"]]`.

The checks put her evenings through her weights, try brains of other sizes with random weights, and look for a loop in `forward`: one `@` handles every evening at once.
