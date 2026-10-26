import numpy as np


def shown(value):
    array = np.round(np.asarray(value, dtype=float), 4)
    return array.tolist() if np.all(np.isfinite(array)) else str(array.tolist())


def ref_run(xs, params):
    h = np.zeros(len(params["b"]))
    hiddens, guesses = [], []
    for x in xs:
        h = np.tanh(x * params["Wx"] + h @ params["Wh"] + params["b"])
        hiddens.append(h)
        guesses.append(float(h @ params["Wy"] + params["by"]))
    return np.array(hiddens), np.array(guesses)


def ref_error(heights, params, mean=2.5, scale=2.0):
    hiddens, guesses = ref_run((heights - mean) / scale, params)
    return float(np.mean(np.abs(guesses[:-1] * scale + mean - heights[1:])))


def small_params(seed, hidden=3):
    rng = np.random.default_rng(seed)
    return {"Wx": rng.normal(0, 1, hidden), "Wh": rng.normal(0, 0.6, (hidden, hidden)),
            "b": rng.normal(0, 0.3, hidden), "Wy": rng.normal(0, 1, hidden), "by": np.array(0.1)}


def load(ctx):
    m = ctx.module()
    for name in ("run", "one_hour_error"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def check_run(m, xs, params, what):
    got = m.run(xs, params)
    if not isinstance(got, tuple) or len(got) != 2:
        raise CheckFailed("run should return (hiddens, guesses).", actual=repr(got)[:120])
    want_h, want_g = ref_run(xs, params)
    hiddens = np.asarray(got[0], dtype=float)
    if hiddens.shape != want_h.shape:
        raise CheckFailed(f"{what}: one row of hidden state per reading.", expected=str(want_h.shape), actual=str(hiddens.shape))
    if not np.allclose(hiddens, want_h, atol=1e-9):
        hour = int(np.argmax(np.any(np.abs(hiddens - want_h) > 1e-9, axis=1)))
        raise CheckFailed(f"{what}: the hidden state at hour {hour}.", expected=shown(want_h[hour]), actual=shown(hiddens[hour]))


def carries(ctx):
    m = load(ctx)
    heights = m.load_tides()[:12]
    check_run(m, (heights - 2.5) / 2.0, m.load_weights(), "Twelve hours of the roll")


def marked_next(ctx):
    m = load(ctx)
    heights = m.load_tides()
    params = m.load_weights()
    got = m.one_hour_error(heights, params)
    want = ref_error(heights, params)
    if got is None or abs(float(got) - want) > 1e-9:
        raise CheckFailed("The whole roll: each guess against the reading an hour later, in metres.",
                          expected=round(want, 4), actual=None if got is None else shown(got))


def small_network(ctx):
    m = load(ctx)
    check_run(m, np.array([0.5, -0.2, 0.1, 0.9, -0.7]), small_params(4), "A three-neuron network, five readings")


def short_roll(ctx):
    m = load(ctx)
    heights = np.array([1.0, 1.8, 2.9, 3.6, 3.9, 3.5, 2.6])
    params = small_params(9)
    got = m.one_hour_error(heights, params)
    want = ref_error(heights, params)
    if got is None or abs(float(got) - want) > 1e-9:
        raise CheckFailed("Seven readings, a three-neuron network.", expected=round(want, 4), actual=None if got is None else shown(got))


TESTS = [
    custom("The memory carries from hour to hour", carries, visible=True,
           hint="An empty memory once, before the first hour. Inside the loop, h is whatever the last step handed back."),
    custom("Each guess is marked against the next hour", marked_next, visible=True,
           hint="The guess made at hour t is for hour t + 1. The last guess has nothing to be marked against yet."),
    custom("A smaller network", small_network),
    custom("A short roll", short_roll),
]
