---
id: make-forward
type: make
title: The forward pass
files: [network.py]
entry: network.py
on_pass: { aaesha.pleased: "A foggy afternoon: lights and beacon. Exactly Paul's call. He just takes longer over it." }
hints:
  nudge: "What shape is `X @ params[\"W1\"]`, and what does adding `params[\"b1\"]` do to each of its rows?"
  plan:
    - "Bend and squash: the two activations, for whole arrays"
    - "Layer one: multiply, add the bias, bend"
    - "Layer two: multiply, add the bias, squash"
    - Keep every value on the way
    - "Read off the answers: for each row, the names whose output is above 0.5"
  shape: |
    def relu(z):
        return np.___(0, z)


    def sigmoid(z):
        return 1 / (1 + ___)


    def forward(X, params):
        Z1 = X @ params["W1"] + ___
        H = relu(___)
        P = sigmoid(___ @ params["W2"] + ___)
        return P, {"Z1": ___, "H": ___, "P": ___}


    def decisions(P):
        return [[name for name, chance in zip(ANSWERS, row) if ___] for row in P]
---
Neil's weights are at the top of `network.py`, in a dict, `NEILS_WEIGHTS`, under `"W1"`, `"b1"`, `"W2"` and `"b2"`. `W1` is (4, 5) and `W2` is (5, 3): four readings in, five hidden neurons, three answers out. Write the forward pass. The comments are the subgoals from the stairs light.

`forward(X, params)` returns two things: the answers `P`, one row per evening, and a dict of what it worked out on the way, `{"Z1": Z1, "H": H, "P": P}`. `Z1` is before the ReLU and `H` after it. Nothing needs the dict yet. Backpropagation will.

```text
Evening 1: lights
Evening 2: lights, beacon
Evening 3: lights, shutters
Evening 4: nothing
```

`decisions(np.array([[0.9, 0.2, 0.7]]))` gives `[["lights", "shutters"]]`.

The checks put Paul's evenings through Neil's weights, try networks of other sizes, and look for a loop in `forward`: one `@` handles every evening at once.
