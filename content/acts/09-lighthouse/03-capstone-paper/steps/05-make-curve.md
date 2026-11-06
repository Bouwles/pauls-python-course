---
id: curve
type: make
title: Make the curve
files: [reproduce.py, descent.py, test_descent.py]
entry: reproduce.py
starter_from: pieces
timeout_ms: 30000
on_pass: { paul.thinking: "Down, up at forty, down again, first time. I'm suspicious. Try other seeds." }
hints:
  nudge: "Everything random comes from one generator, made from the seed. What has to be the same, and in the same order, for two people to get the same numbers?"
  plan:
    - Make the generator from the seed
    - Draw the data and the random weights in the agreed order
    - Turn both sets of examples into random features
    - Fit on the training features only
    - Score on both
    - For each width, take the median over the seeds
  shape: |
    def run_once(width, seed, n_train=40, noise=0.2, n_test=400):
        rng = np.random.default_rng(___)
        X_train = rng.normal(size=(n_train, FEATURES))
        y_train = true_answer(X_train) + rng.normal(0, ___, n_train)
        X_test = ___
        y_test = ___
        W = rng.normal(size=(FEATURES, ___)) / np.sqrt(FEATURES)
        train_features, test_features = relu_features(X_train, W), ___
        weights = fit_min_norm(___, y_train)
        return mse(train_features @ weights, y_train), ___


    def descent_curve(widths, seeds, n_train=40, noise=0.2):
        return [float(np.___([run_once(width, seed, n_train, noise)[1] for seed in seeds]))
                for width in widths]
---
`reproduce.py` runs the experiment. `run_once(width, seed)` is one trial: make the generator from the seed, draw the data and the random weights in the order the shape shows, fit on the training features, and return both errors. `descent_curve(widths, seeds)` is the whole sweep: for each width, the median test error over the seeds.

The median, not the mean: near the threshold one unlucky seed can be thousands of times worse than the rest, and the mean would tell only that seed's story.

Done: your numbers match Paul's to the last digit.

```text
features  test error
      15       0.399
      40      46.300
    2000       0.312
```

Press Run and it runs your tests in `test_descent.py`, then prints the table. The checks also try 20 training examples, where the peak should move to 20.
