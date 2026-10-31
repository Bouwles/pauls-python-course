import re

import numpy as np


class Net:
    """The network from net.py, as loaded alongside the learner's file."""
    module = None

    def __getattr__(self, name):
        return getattr(Net.module, name)


net = Net()


def load(ctx):
    m = ctx.module()
    for name in ("dropout_mask", "with_weight_decay", "train"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    import net as loaded
    Net.module = loaded
    return m


def shown(value, places=6):
    """A value safe to report: NaN and infinity become text."""
    array = np.asarray(value, dtype=float)
    if not np.all(np.isfinite(array)):
        return str(np.round(array, places).tolist())
    rounded = np.round(array, places)
    return rounded.tolist() if rounded.ndim else float(rounded)


def as_mask(got):
    if got is None:
        raise CheckFailed("dropout_mask gave back None. It should return the mask.")
    return np.asarray(got, dtype=float)


def small_problem(seed, rows=10, inputs=3):
    rng = np.random.default_rng(seed)
    X = rng.uniform(0, 1, (rows, inputs))
    T = rng.normal(1, 0.5, (rows, 1))
    X_val = rng.uniform(0, 1, (rows, inputs))
    T_val = rng.normal(1, 0.5, (rows, 1))
    return X, T, X_val, T_val


def reference(X, T, X_val, T_val, params, rate, epochs, decay=0.0):
    """Plain gradient descent with weight decay: no dropout, no patience."""
    train_losses, val_losses = [], []
    for _ in range(epochs):
        P, cache = net.forward(X, params)
        grads = net.backward(X, T, params, cache)
        for name in params:
            if name.startswith("W"):
                grads[name] = grads[name] + decay * params[name]
            params[name] -= rate * grads[name]
        train_losses.append(net.mse(net.forward(X, params)[0], T))
        val_losses.append(net.mse(net.forward(X_val, params)[0], T_val))
    return train_losses, val_losses


def call_train(m, *args, **kwargs):
    result = m.train(*args, **kwargs)
    if not isinstance(result, tuple) or len(result) != 3:
        raise CheckFailed("train should return (train_losses, val_losses, best).", actual=repr(result)[:200])
    train_losses, val_losses, best = result
    return list(train_losses), list(val_losses), int(best)


def mask_halves(ctx):
    m = load(ctx)
    mask = as_mask(m.dropout_mask((200, 100), 0.5, np.random.default_rng(1)))
    if mask.shape != (200, 100):
        raise CheckFailed("The mask should have the shape it was asked for.", expected="(200, 100)", actual=str(mask.shape))
    values = sorted(set(np.round(mask.ravel(), 9).tolist()))
    if values != [0.0, 2.0]:
        raise CheckFailed("At rate 0.5, every entry should be 0 or 2: the survivors scaled up by 1 / (1 - 0.5).", expected=[0.0, 2.0], actual=shown(values[:6]))
    zeros = float(np.mean(mask == 0))
    if abs(zeros - 0.5) > 0.02:
        raise CheckFailed("About half the entries should be 0.", expected="close to 0.5", actual=shown(zeros, 3))


def mask_rates(ctx):
    m = load(ctx)
    mask = as_mask(m.dropout_mask((400, 50), 0.2, np.random.default_rng(2)))
    values = sorted(set(np.round(mask.ravel(), 9).tolist()))
    if values != [0.0, 1.25]:
        raise CheckFailed("At rate 0.2, every entry should be 0 or 1.25.", expected=[0.0, 1.25], actual=shown(values[:6]))
    zeros = float(np.mean(mask == 0))
    if abs(zeros - 0.2) > 0.02:
        raise CheckFailed("About a fifth of the entries should be 0.", expected="close to 0.2", actual=shown(zeros, 3))
    none = as_mask(m.dropout_mask((5, 4), 0.0, np.random.default_rng(3)))
    if not np.array_equal(none, np.ones((5, 4))):
        raise CheckFailed("At rate 0, nothing is dropped: every entry is 1.", actual=shown(none))


def mask_seeded(ctx):
    m = load(ctx)
    first = as_mask(m.dropout_mask((30, 10), 0.5, np.random.default_rng(7)))
    again = as_mask(m.dropout_mask((30, 10), 0.5, np.random.default_rng(7)))
    if not np.array_equal(first, again):
        raise CheckFailed("The same seed should give the same mask. Draw the randomness from the rng you're given.")
    rng = np.random.default_rng(7)
    one = as_mask(m.dropout_mask((30, 10), 0.5, rng))
    two = as_mask(m.dropout_mask((30, 10), 0.5, rng))
    if np.array_equal(one, two):
        raise CheckFailed("Two masks drawn one after the other from the same rng should differ.")


def decay_weights(ctx):
    m = load(ctx)
    params = {"W1": np.array([[1.0, -2.0], [0.5, 0.0]]), "b1": np.array([3.0, -1.0]),
              "W2": np.array([[2.0], [-4.0]]), "b2": np.array([5.0])}
    grads = {"W1": np.array([[0.1, 0.2], [0.3, 0.4]]), "b1": np.array([0.5, 0.6]),
             "W2": np.array([[0.7], [0.8]]), "b2": np.array([0.9])}
    got = m.with_weight_decay(grads, params, 0.1)
    if not isinstance(got, dict):
        raise CheckFailed("with_weight_decay should return a dict of gradients.", actual=repr(got)[:120])
    want = {"W1": [[0.2, 0.0], [0.35, 0.4]], "b1": [0.5, 0.6], "W2": [[0.9], [0.4]], "b2": [0.9]}
    for name, value in want.items():
        if name not in got or not np.allclose(got[name], value):
            what = "a bias: leave it alone" if name.startswith("b") else "a weight: add 0.1 times the weight"
            raise CheckFailed(f"The gradient for {name}, {what}.", expected=value,
                              actual=None if name not in got else shown(got[name], 4))


def decay_leaves_grads(ctx):
    m = load(ctx)
    params = {"W1": np.ones((2, 2)), "b1": np.ones(2), "W2": np.ones((2, 1)), "b2": np.ones(1)}
    grads = {name: np.full_like(value, 0.5) for name, value in params.items()}
    got = m.with_weight_decay(grads, params, 0.3)
    if not isinstance(got, dict):
        raise CheckFailed("with_weight_decay should return a new dict of gradients.", actual=repr(got)[:120])
    for name, value in grads.items():
        if not np.allclose(value, 0.5):
            raise CheckFailed(f"with_weight_decay changed the gradients it was given ({name}). Build new arrays instead.")
    for name, value in params.items():
        if not np.allclose(value, 1.0):
            raise CheckFailed(f"with_weight_decay changed params['{name}']. It should only work out gradients.")


def compare(what, got, want, tol=1e-9):
    if len(got) != len(want):
        raise CheckFailed(f"{what}: one loss per epoch.", expected=len(want), actual=len(got))
    if not np.allclose(got, want, atol=tol, rtol=0):
        first = int(np.argmax(np.abs(np.array(got) - np.array(want)) > tol))
        raise CheckFailed(f"{what}: the losses part company at epoch {first}.",
                          expected=shown(want[first]), actual=shown(got[first]))


def plain(ctx):
    m = load(ctx)
    X, T, X_val, T_val = small_problem(5)
    params = net.init_params(3, 6, 1)
    mine = {k: v.copy() for k, v in params.items()}
    want_train, want_val = reference(X, T, X_val, T_val, mine, 0.2, 60)
    got_train, got_val, best = call_train(m, X, T, X_val, T_val, params, 0.2, 60)
    compare("Training losses with nothing switched on", got_train, want_train)
    compare("Validation losses with nothing switched on", got_val, want_val)
    for name in params:
        if not np.allclose(params[name], mine[name]):
            raise CheckFailed(f"After training, params['{name}'] isn't where 60 steps of gradient descent leave it. train changes params in place.")


def decayed(ctx):
    m = load(ctx)
    X, T, X_val, T_val = small_problem(8)
    params = net.init_params(3, 6, 2)
    mine = {k: v.copy() for k, v in params.items()}
    want_train, want_val = reference(X, T, X_val, T_val, mine, 0.2, 60, decay=0.05)
    got_train, got_val, best = call_train(m, X, T, X_val, T_val, params, 0.2, 60, decay=0.05)
    compare("Training losses with weight decay 0.05", got_train, want_train)
    compare("Validation losses with weight decay 0.05", got_val, want_val)


def dropped(ctx):
    m = load(ctx)
    X, T, X_val, T_val = small_problem(11, rows=12)
    clean = net.init_params(3, 8, 4)
    plain_train, plain_val, _ = call_train(m, X, T, X_val, T_val, clean, 0.2, 30)
    params = net.init_params(3, 8, 4)
    got_train, got_val, _ = call_train(m, X, T, X_val, T_val, params, 0.2, 30, drop=0.5, seed=9)
    if np.allclose(got_train, plain_train):
        raise CheckFailed("With drop=0.5, training should go differently from training with no dropout.")
    if abs(got_val[-1] - net.mse(net.forward(X_val, params)[0], T_val)) > 1e-9:
        raise CheckFailed("The validation loss is measured with every neuron awake: no dropout mask.")
    if abs(got_train[-1] - net.mse(net.forward(X, params)[0], T)) > 1e-9:
        raise CheckFailed("The training loss you record is measured after the step, with every neuron awake.")
    again = net.init_params(3, 8, 4)
    again_train, _, _ = call_train(m, X, T, X_val, T_val, again, 0.2, 30, drop=0.5, seed=9)
    if not np.allclose(again_train, got_train):
        raise CheckFailed("Two runs with the same seed should train exactly alike. Make one rng from seed, before the first epoch.")


def stops_early(ctx):
    m = load(ctx)
    X, T, X_val, T_val = net.load_nights()
    params = net.init_params(6, 64)
    got_train, got_val, best = call_train(m, X, T, X_val, T_val, params, 0.1, 3000, patience=100)
    if best != 98 or len(got_val) != 199:
        raise CheckFailed("Riya's network with patience 100: the best epoch is 98, so training stops after 199 epochs.",
                          expected="best 98, 199 epochs", actual=f"best {best}, {len(got_val)} epochs")
    score = net.mse(net.forward(X_val, params)[0], T_val)
    if abs(score - got_val[98]) > 1e-9:
        raise CheckFailed("After stopping, params should hold the weights from the best epoch.", expected=shown(got_val[98], 4), actual=shown(score, 4))


def patience_with_decay(ctx):
    m = load(ctx)
    X, T, X_val, T_val = small_problem(13)
    params = net.init_params(3, 10, 5)
    got_train, got_val, best = call_train(m, X, T, X_val, T_val, params, 0.3, 1500, decay=0.01, patience=20)
    lowest = int(np.argmin(got_val))
    if best != lowest or len(got_val) != min(best + 21, 1500):
        raise CheckFailed("With patience 20, stop 20 epochs after the lowest validation loss.",
                          expected=f"best {lowest}, {min(lowest + 21, 1500)} epochs", actual=f"best {best}, {len(got_val)} epochs")
    score = net.mse(net.forward(X_val, params)[0], T_val)
    if abs(score - got_val[best]) > 1e-9:
        raise CheckFailed("After stopping, params should hold the best epoch's weights.", expected=shown(got_val[best]), actual=shown(score))


def no_patience_keeps_last(ctx):
    m = load(ctx)
    X, T, X_val, T_val = net.load_nights()
    params = net.init_params(6, 16, 3)
    got_train, got_val, best = call_train(m, X, T, X_val, T_val, params, 0.1, 400)
    if len(got_val) != 400:
        raise CheckFailed("Without patience, every epoch runs.", expected=400, actual=len(got_val))
    if best != int(np.argmin(got_val)):
        raise CheckFailed("best is still the epoch with the lowest validation loss.", expected=int(np.argmin(got_val)), actual=best)
    score = net.mse(net.forward(X_val, params)[0], T_val)
    if abs(score - got_val[-1]) > 1e-9:
        raise CheckFailed("Without patience, train leaves the last epoch's weights.", expected=shown(got_val[-1]), actual=shown(score))


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    want = {"Riya's": (0.0, 0.2455), "weight decay": (0.0451, 0.1340), "early stopping": (0.0603, 0.1842)}
    for label, (training, validation) in want.items():
        line = next((l for l in r.lines() if l.startswith(label)), None)
        if line is None:
            raise CheckFailed(f"There should be a line starting {label!r}.", actual=r.output)
        numbers = [float(n) for n in re.findall(r"\d+\.\d+", line.split(label, 1)[1])]
        if len(numbers) < 2 or abs(numbers[-2] - training) > 0.0002 or abs(numbers[-1] - validation) > 0.0002:
            raise CheckFailed(f"The {label} line: training then validation loss.", expected=f"{training:.4f} {validation:.4f}", actual=line)
    if not any(l.startswith("dropout") for l in r.lines()):
        raise CheckFailed("There should be a line for dropout.", actual=r.output)


TESTS = [
    custom("A dropout mask at rate 0.5: zeros and twos", mask_halves, visible=True),
    custom("Weight decay on the weights, not the biases", decay_weights, visible=True),
    custom("Dropout masks at rate 0.2 and rate 0", mask_rates),
    custom("Dropout masks come from the rng", mask_seeded),
    custom("with_weight_decay leaves its arguments alone", decay_leaves_grads,
           hint="grads[name] + decay * params[name] makes a new array; += would change the one you were given."),
    custom("Training with nothing switched on is plain gradient descent", plain,
           hint="Record each loss after the step, with no dropout: the training loss, then the validation loss."),
    custom("Training with weight decay", decayed),
    custom("Training with dropout", dropped,
           hint="Dropout is for the training step only. Score both sets of nights with every neuron awake."),
    custom("Early stopping on Riya's network", stops_early,
           hint="Keep a copy of every array at each new best, and put them back when patience runs out."),
    custom("Early stopping with weight decay switched on too", patience_with_decay),
    custom("Without patience, the last weights stay", no_patience_keeps_last),
    custom("The program compares all four", program),
]
