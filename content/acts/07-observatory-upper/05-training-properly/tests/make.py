import io

import numpy as np

KEYS = ("W1", "b1", "W2", "b2")


def load(ctx):
    m = ctx.module()
    for name in ("init_params", "train"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    for name in ("Momentum", "Adam"):
        if not isinstance(getattr(m, name, None), type):
            raise CheckFailed(f"There is no class called {name}.")
    return m


def toy(seed):
    rng = np.random.default_rng(seed)
    params = {"W1": rng.normal(0, 1, (3, 2)), "b1": rng.normal(0, 1, 2),
              "W2": rng.normal(0, 1, (2, 1)), "b2": rng.normal(0, 1, 1)}
    grads = [{k: rng.normal(0, 1, v.shape) for k, v in params.items()} for _ in range(3)]
    return params, grads


def copy(params):
    return {k: np.array(v, dtype=float) for k, v in params.items()}


def close(what, got, want, tol=1e-9):
    for k in KEYS:
        g = np.asarray(got[k], dtype=float)
        if g.shape != want[k].shape or not np.allclose(g, want[k], atol=tol, rtol=1e-7):
            raise CheckFailed(f"{what}: params['{k}'].", expected=np.round(want[k], 5).tolist(), actual=np.round(g, 5).tolist())


def ref_momentum(params, grads, rate, beta):
    p = copy(params)
    velocity = {k: np.zeros_like(v) for k, v in p.items()}
    for g in grads:
        for k in p:
            velocity[k] = beta * velocity[k] + g[k]
            p[k] = p[k] - rate * velocity[k]
    return p


def ref_adam(params, grads, rate, b1=0.9, b2=0.999, eps=1e-8):
    p = copy(params)
    m = {k: np.zeros_like(v) for k, v in p.items()}
    v = {k: np.zeros_like(x) for k, x in p.items()}
    for t, g in enumerate(grads, start=1):
        for k in p:
            m[k] = b1 * m[k] + (1 - b1) * g[k]
            v[k] = b2 * v[k] + (1 - b2) * g[k] ** 2
            p[k] = p[k] - rate * (m[k] / (1 - b1 ** t)) / (np.sqrt(v[k] / (1 - b2 ** t)) + eps)
    return p


def run_optimiser(optimiser, params, grads):
    p = copy(params)
    for g in grads:
        optimiser.step(p, {k: x.copy() for k, x in g.items()})
    return p


def shapes(ctx):
    m = load(ctx)
    params = m.init_params(4, 16, 3, np.random.default_rng(6))
    if not isinstance(params, dict) or sorted(params) != sorted(KEYS):
        raise CheckFailed("init_params should give back a dict with W1, b1, W2 and b2.", actual=repr(params)[:200])
    want = {"W1": (4, 16), "b1": (16,), "W2": (16, 3), "b2": (3,)}
    for k, shape in want.items():
        if np.shape(params[k]) != shape:
            raise CheckFailed(f"params['{k}'] has the wrong shape.", expected=str(shape), actual=str(np.shape(params[k])))
    if np.any(params["b1"] != 0) or np.any(params["b2"] != 0):
        raise CheckFailed("Every bias should start at 0.")
    if np.allclose(params["W1"], params["W1"][0, 0]):
        raise CheckFailed("The weights in W1 should be different from each other: random, not all the same.")


def exact_init(ctx):
    m = load(ctx)
    got = m.init_params(3, 5, 2, np.random.default_rng(11))
    rng = np.random.default_rng(11)
    want = {"W1": rng.normal(0, np.sqrt(2 / 3), (3, 5)), "b1": np.zeros(5),
            "W2": rng.normal(0, np.sqrt(1 / 5), (5, 2)), "b2": np.zeros(2)}
    close("init_params(3, 5, 2) with seed 11", got, want)


def spread(ctx):
    m = load(ctx)
    params = m.init_params(400, 300, 10, np.random.default_rng(3))
    s1, s2 = float(np.std(params["W1"])), float(np.std(params["W2"]))
    if abs(s1 - np.sqrt(2 / 400)) > 0.003:
        raise CheckFailed("With 400 inputs, W1's spread should be np.sqrt(2 / 400).", expected=round(np.sqrt(2 / 400), 4), actual=round(s1, 4))
    if abs(s2 - np.sqrt(1 / 300)) > 0.003:
        raise CheckFailed("With 300 hidden neurons, W2's spread should be np.sqrt(1 / 300).", expected=round(np.sqrt(1 / 300), 4), actual=round(s2, 4))


def momentum_one(ctx):
    m = load(ctx)
    params, grads = toy(1)
    close("One momentum step is a plain step", run_optimiser(m.Momentum(0.1), params, grads[:1]), ref_momentum(params, grads[:1], 0.1, 0.9))


def momentum_three(ctx):
    m = load(ctx)
    params, grads = toy(2)
    close("Three momentum steps, beta 0.9", run_optimiser(m.Momentum(0.1), params, grads), ref_momentum(params, grads, 0.1, 0.9))
    close("Three momentum steps, beta 0.5", run_optimiser(m.Momentum(0.2, beta=0.5), params, grads), ref_momentum(params, grads, 0.2, 0.5))


def momentum_separate(ctx):
    m = load(ctx)
    a, grads_a = toy(3)
    b, grads_b = toy(4)
    first, second = m.Momentum(0.1), m.Momentum(0.1)
    pa, pb = copy(a), copy(b)
    for ga, gb in zip(grads_a, grads_b):
        first.step(pa, ga)
        second.step(pb, gb)
    close("Two Momentum optimisers, each with its own brain", pa, ref_momentum(a, grads_a, 0.1, 0.9))


def adam_first(ctx):
    m = load(ctx)
    params = {"W1": np.zeros((2, 2)), "b1": np.zeros(2), "W2": np.zeros((2, 1)), "b2": np.zeros(1)}
    grads = {"W1": np.array([[1000.0, -0.001], [3.0, -50.0]]), "b1": np.array([0.2, -7.0]),
             "W2": np.array([[1e-4], [-2.0]]), "b2": np.array([40.0])}
    got = run_optimiser(m.Adam(0.01), params, [grads])
    want = {k: -0.01 * np.sign(g) for k, g in grads.items()}
    close("Adam's first step moves every weight by about the rate, however big its gradient", got, want, tol=1e-5)


def adam_three(ctx):
    m = load(ctx)
    params, grads = toy(5)
    close("Three Adam steps", run_optimiser(m.Adam(0.05), params, grads), ref_adam(params, grads, 0.05))
    close("Three Adam steps with beta1 0.5 and beta2 0.9",
          run_optimiser(m.Adam(0.05, beta1=0.5, beta2=0.9), params, grads), ref_adam(params, grads, 0.05, 0.5, 0.9))


class Counting:
    def __init__(self):
        self.sizes = []

    def step(self, params, grads):
        self.sizes.append(grads["W1"].shape)


def counts_steps(ctx):
    m = load(ctx)
    rng = np.random.default_rng(0)
    X, T = rng.uniform(0, 1, (10, 4)), rng.uniform(0, 1, (10, 3))
    params = m.init_params(4, 5, 3, np.random.default_rng(1))
    counter = Counting()
    losses = m.train(X, T, params, counter, 3, 4, np.random.default_rng(2))
    if len(counter.sizes) != 9:
        raise CheckFailed("Ten rows in batches of 4 is three steps an epoch: nine steps in three epochs.", expected=9, actual=len(counter.sizes))
    if losses is None or len(losses) != 3:
        raise CheckFailed("Three epochs should give back three losses.", actual=repr(losses))


def every_number(ctx):
    m = load(ctx)
    rng = np.random.default_rng(8)
    X, T = rng.uniform(0, 1, (12, 4)), (rng.uniform(0, 1, (12, 3)) > 0.5).astype(float)
    start = m.init_params(4, 6, 3, np.random.default_rng(9))
    params = copy(start)
    losses = m.train(X, T, params, m.Momentum(0.5), 2, 5, np.random.default_rng(10))

    def fwd(Xb, p):
        Z1 = Xb @ p["W1"] + p["b1"]
        H = np.maximum(0, Z1)
        P = 1 / (1 + np.exp(-(H @ p["W2"] + p["b2"])))
        return P, Z1, H

    want = copy(start)
    velocity = {k: np.zeros_like(v) for k, v in want.items()}
    want_losses = []
    batch_rng = np.random.default_rng(10)
    for _ in range(2):
        order = batch_rng.permutation(12)
        for s in range(0, 12, 5):
            rows = order[s:s + 5]
            P, Z1, H = fwd(X[rows], want)
            dZ2 = 2 * (P - T[rows]) / P.size * P * (1 - P)
            dZ1 = (dZ2 @ want["W2"].T) * (Z1 > 0)
            g = {"W1": X[rows].T @ dZ1, "b1": dZ1.sum(axis=0), "W2": H.T @ dZ2, "b2": dZ2.sum(axis=0)}
            for k in want:
                velocity[k] = 0.9 * velocity[k] + g[k]
                want[k] = want[k] - 0.5 * velocity[k]
        want_losses.append(np.mean((fwd(X, want)[0] - T) ** 2))
    got_losses = [float(l) for l in (losses or [])]
    if len(got_losses) != 2 or not np.allclose(got_losses, want_losses, atol=1e-9):
        raise CheckFailed("Two epochs: the loss on every row after each one.", expected=np.round(want_losses, 6).tolist(), actual=np.round(got_losses, 6).tolist())
    close("Two epochs with momentum, batches of 5", params, want)


def learns(ctx):
    m = load(ctx)
    log = np.loadtxt(io.StringIO(ctx.files["evenings.csv"]), delimiter=",", skiprows=1)
    X, T = log[:, :4], log[:, 4:]
    params = m.init_params(4, 16, 3, np.random.default_rng(5))
    losses = m.train(X, T, params, m.Adam(0.05), 30, 32, np.random.default_rng(3))
    first, last = float(losses[0]), float(losses[-1])
    P = 1 / (1 + np.exp(-(np.maximum(0, X @ params["W1"] + params["b1"]) @ params["W2"] + params["b2"])))
    right = float(np.mean(np.all((P > 0.5) == (T > 0.5), axis=1)))
    if not last < first or right < 0.9:
        raise CheckFailed("Thirty epochs of Adam on Paul's whole log should get all three answers right on at least 90% of evenings.",
                          expected="at least 90%", actual=f"{right:.0%}, loss from {first:.4f} to {last:.4f}")


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    want = ["From small random weights, 30 epochs in batches of 32:",
            "sgd       loss 0.0468, every answer right on 89% of evenings",
            "momentum  loss 0.0119, every answer right on 96% of evenings",
            "adam      loss 0.0092, every answer right on 97% of evenings",
            "From every weight at 0:",
            "adam      loss 0.1756, every answer right on 40% of evenings"]
    if r.lines()[-6:] != want:
        raise CheckFailed("The program trains the network four ways.", expected="\n".join(want), actual=r.output)


TESTS = [
    custom("init_params: the right shapes, biases at 0", shapes, visible=True),
    custom("One momentum step is a plain step", momentum_one, visible=True),
    custom("init_params: W1, then W2, from the rng it's given", exact_init,
           hint="Draw W1 first and W2 second, each with rng.normal(0, spread, shape), using the rng passed in."),
    custom("init_params: spread scaled to the inputs", spread,
           hint="The spread is the square root: np.sqrt(2 / n_in) for W1, np.sqrt(1 / n_hidden) for W2."),
    custom("Three momentum steps", momentum_three,
           hint="Keep each weight's velocity between steps: beta times the old velocity, plus the new gradient."),
    custom("Each optimiser keeps its own velocities", momentum_separate,
           hint="Keep the velocities on self, made in __init__, not in a variable outside the class."),
    custom("Adam's first step", adam_first,
           hint="On the first step, m_hat is g and v_hat is g ** 2, so each weight moves by rate times g / abs(g)."),
    custom("Three Adam steps", adam_three,
           hint="t goes up once per call to step, not once per weight array."),
    custom("train takes one step per batch", counts_steps),
    custom("train: two epochs, every number", every_number,
           hint="Call batches(X, T, batch_size, rng) once per epoch, and note the loss on all of X after the epoch's last step."),
    custom("It learns Paul's whole log", learns),
    custom("The program trains the network four ways", program),
]
