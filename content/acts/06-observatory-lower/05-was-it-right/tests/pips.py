import numpy as _np


def _reference(X, y, rate, steps):
    w = _np.zeros(X.shape[1])
    b = 0.0
    for step in range(steps):
        chance = 1 / (1 + _np.exp(-(X @ w + b)))
        w = w - rate * X.T @ (chance - y) / len(y)
        b = b - rate * _np.mean(chance - y)
    return w, b


def _train(ctx, X, y, rate, steps):
    mod = ctx.module()
    if not callable(getattr(mod, "train", None)):
        raise CheckFailed("risk.py needs its train function.")
    result = mod.train(X, y, rate, steps)
    try:
        w, b = result
    except (TypeError, ValueError):
        raise CheckFailed("train should still return w and b.", actual=repr(result)[:200])
    return _np.asarray(w, dtype=float), float(b)


def small_log(ctx):
    X = _np.array([[-1.5], [-0.5], [0.0], [0.5], [1.5], [-1.0]])
    y = _np.array([0.0, 0.0, 1.0, 1.0, 1.0, 1.0])
    want_w, want_b = _reference(X, y, 0.5, 300)
    w, b = _train(ctx, X, y, 0.5, 300)
    if not (_np.allclose(w, want_w, atol=1e-6) and abs(b - want_b) < 1e-6):
        raise CheckFailed("Six respondents, rate 0.5, 300 steps: logistic regression should land somewhere else.",
                          expected=f"w {_np.round(want_w, 3).tolist()}, b {want_b:.3f}",
                          actual=f"w {_np.round(w, 3).tolist()}, b {b:.3f}")


def confident_when_clear(ctx):
    rng = _np.random.default_rng(9)
    X = rng.normal(size=(40, 2))
    y = (X[:, 0] - X[:, 1] + rng.normal(0, 0.3, 40) > 0).astype(float)
    w, b = _train(ctx, X, y, 1.0, 500)
    chance = 1 / (1 + _np.exp(-(_np.array([2.5, -2.5]) @ w + b)))
    if not chance > 0.95:
        raise CheckFailed("On answers that point clearly one way, a trained model should be nearly sure.",
                          expected="over 95%", actual=f"{chance:.0%}")


TESTS = [
    output("The average chance is near the real rate", expect="Average chance: 12%", match="contains", visible=True,
           hint="About one respondent in eight has diabetes or prediabetes. A model that says 53% on average has learnt something else."),
    custom("train() on six respondents matches logistic regression", small_log, visible=True),
    output("The chances use the range", expect="Chances from 0% to 82%", match="contains",
           hint="If only this fails, the walk is fitting something other than chances. What goes into the miss?"),
    custom("Nearly sure when the answers are clear", confident_when_clear),
]
