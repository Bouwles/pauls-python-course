import numpy as np


def reference(Z, gamma, beta, running, training, momentum=0.9, eps=1e-5):
    if training:
        mean, var = Z.mean(axis=0), Z.var(axis=0)
        running["mean"] = momentum * running["mean"] + (1 - momentum) * mean
        running["var"] = momentum * running["var"] + (1 - momentum) * var
    else:
        mean, var = running["mean"], running["var"]
    return gamma * (Z - mean) / np.sqrt(var + eps) + beta


def load(ctx):
    m = ctx.module()
    if not callable(getattr(m, "batch_norm", None)):
        raise CheckFailed("There is no function called batch_norm.")
    return m


def batch(seed, rows=6, cols=3):
    rng = np.random.default_rng(seed)
    return rng.normal(5, 3, (rows, cols)) * np.array([1.0, 100.0, 0.1])[:cols]


def close(what, got, want, tol=1e-6):
    if got is None:
        raise CheckFailed(f"{what}: batch_norm gave back None.")
    got = np.asarray(got, dtype=float)
    if got.shape != np.shape(want):
        raise CheckFailed(f"{what}: the shape.", expected=str(np.shape(want)), actual=str(got.shape))
    if not np.allclose(got, want, atol=tol):
        actual = np.round(got, 4).tolist() if np.all(np.isfinite(got)) else str(np.round(got, 4).tolist())
        raise CheckFailed(what, expected=np.round(want, 4).tolist(), actual=actual)


def plain_training(ctx):
    m = load(ctx)
    Z = batch(1)
    running = {"mean": np.zeros(3), "var": np.ones(3)}
    out = m.batch_norm(Z, np.ones(3), np.zeros(3), running, True)
    close("Training, gamma 1 and beta 0: each column to mean 0", np.asarray(out).mean(axis=0), np.zeros(3))
    close("Training, gamma 1 and beta 0: each column to standard deviation 1", np.asarray(out).std(axis=0), np.ones(3), tol=1e-3)


def scaled_shifted(ctx):
    m = load(ctx)
    Z = batch(2)
    gamma, beta = np.array([2.0, 0.5, 1.0]), np.array([1.0, -1.0, 3.0])
    want = reference(Z, gamma, beta, {"mean": np.zeros(3), "var": np.ones(3)}, True)
    close("Training with gamma and beta", m.batch_norm(Z, gamma, beta, {"mean": np.zeros(3), "var": np.ones(3)}, True), want)


def running_updates(ctx):
    m = load(ctx)
    Z = batch(3)
    mine = {"mean": np.array([1.0, 2.0, 3.0]), "var": np.array([1.0, 1.0, 1.0])}
    want = {"mean": mine["mean"].copy(), "var": mine["var"].copy()}
    reference(Z, np.ones(3), np.zeros(3), want, True, momentum=0.8)
    m.batch_norm(Z, np.ones(3), np.zeros(3), mine, True, momentum=0.8)
    for key in ("mean", "var"):
        close(f"running['{key}'] after one training batch at momentum 0.8", mine[key], want[key])


def evaluation(ctx):
    m = load(ctx)
    Z = batch(4, rows=5)
    running = {"mean": np.array([4.0, 450.0, 0.06]), "var": np.array([9.0, 80000.0, 0.0009])}
    before = {k: v.copy() for k, v in running.items()}
    gamma, beta = np.array([1.5, 1.0, 0.5]), np.array([0.0, 0.2, -0.2])
    want = reference(Z, gamma, beta, before, False)
    close("Evaluation uses the running mean and variance", m.batch_norm(Z, gamma, beta, running, False), want)
    for key in ("mean", "var"):
        if not np.allclose(running[key], before[key]):
            raise CheckFailed(f"Evaluation shouldn't change running['{key}'].")


def one_evening(ctx):
    m = load(ctx)
    running = {"mean": np.array([2.0, -1.0]), "var": np.array([4.0, 0.25])}
    Z = np.array([[3.0, -0.5]])
    want = reference(Z, np.ones(2), np.zeros(2), {k: v.copy() for k, v in running.items()}, False)
    close("One evening on its own, at evaluation", m.batch_norm(Z, np.ones(2), np.zeros(2), running, False), want)


def default_eps(ctx):
    m = load(ctx)
    Z = np.array([[1.0, 5.0], [1.0, 7.0], [1.0, 9.0]])
    out = m.batch_norm(Z, np.ones(2), np.array([0.5, 0.0]), {"mean": np.zeros(2), "var": np.ones(2)}, True)
    close("A column where every number is the same gives beta, not nan", out,
          reference(Z, np.ones(2), np.array([0.5, 0.0]), {"mean": np.zeros(2), "var": np.ones(2)}, True))


TESTS = [
    custom("Training: every column to mean 0 and spread 1", plain_training, visible=True),
    custom("Training with gamma and beta", scaled_shifted, visible=True,
           hint="Normalise first, then multiply by gamma and add beta, column by column."),
    custom("The running numbers move a step towards the batch's", running_updates,
           hint="running['mean'] becomes momentum * running['mean'] + (1 - momentum) * this batch's mean. The same for the variance."),
    custom("Evaluation uses the running numbers", evaluation),
    custom("One evening on its own, at evaluation", one_evening),
    custom("A column with no spread at all", default_eps,
           hint="Add eps to the variance before the square root."),
]
