import re

import numpy as np


def shown(value):
    array = np.round(np.asarray(value, dtype=float), 4)
    return array.tolist() if np.all(np.isfinite(array)) else str(array.tolist())


def ref_step(x, h, params):
    h = np.tanh(x * params["Wx"] + h @ params["Wh"] + params["b"])
    return h, float(h @ params["Wy"] + params["by"])


def ref_run(xs, params):
    h = np.zeros(len(params["b"]))
    hiddens, guesses = [], []
    for x in xs:
        h, guess = ref_step(x, h, params)
        hiddens.append(h)
        guesses.append(guess)
    return np.array(hiddens), np.array(guesses)


def ref_forecast(xs, params, hours):
    hiddens, guesses = ref_run(xs, params)
    h, guess = hiddens[-1], guesses[-1]
    ahead = [guess]
    while len(ahead) < hours:
        h, guess = ref_step(guess, h, params)
        ahead.append(guess)
    return np.array(ahead[:hours])


def small_params(seed, hidden=3):
    rng = np.random.default_rng(seed)
    return {"Wx": rng.normal(0, 1, hidden), "Wh": rng.normal(0, 0.6, (hidden, hidden)),
            "b": rng.normal(0, 0.3, hidden), "Wy": rng.normal(0, 1, hidden), "by": np.array(-0.2)}


def load(ctx):
    m = ctx.module()
    for name in ("step", "run", "forecast"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def roll(m, hours=None):
    xs = (m.load_tides() - 2.5) / 2.0
    return xs if hours is None else xs[:hours]


def close(what, got, want, tol=1e-9):
    if got is None:
        raise CheckFailed(f"{what}: the function gave back None. Did it return its answer?")
    got = np.asarray(got, dtype=float)
    want = np.asarray(want, dtype=float)
    if got.shape != want.shape:
        raise CheckFailed(f"{what}: the shape.", expected=str(want.shape), actual=str(got.shape))
    if not np.allclose(got, want, atol=tol):
        raise CheckFailed(what, expected=shown(want), actual=shown(got))


def call_step(m, x, h, params):
    got = m.step(x, h, params)
    if not isinstance(got, tuple) or len(got) != 2:
        raise CheckFailed("step should return (h, guess).", actual=repr(got)[:120])
    return got


def call_run(m, xs, params):
    got = m.run(xs, params)
    if not isinstance(got, tuple) or len(got) != 2:
        raise CheckFailed("run should return (hiddens, guesses).", actual=repr(got)[:120])
    return got


def one_step(ctx):
    m = load(ctx)
    params = m.load_weights()
    h = np.linspace(-0.5, 0.5, 8)
    got_h, got_guess = call_step(m, 0.3, h, params)
    want_h, want_guess = ref_step(0.3, h, params)
    close("The new hidden state, from reading 0.3 and a memory", got_h, want_h)
    close("The guess at the next reading", got_guess, want_guess)


def a_day(ctx):
    m = load(ctx)
    params = m.load_weights()
    hiddens, guesses = call_run(m, roll(m, 24), params)
    want_h, want_g = ref_run(roll(m, 24), params)
    close("Hidden states for the first 24 hours: one row each", hiddens, want_h)
    close("Guesses for the first 24 hours", guesses, want_g)


def small_step(ctx):
    m = load(ctx)
    params = small_params(2)
    h = np.array([0.2, -0.4, 0.6])
    got_h, got_guess = call_step(m, -0.8, h, params)
    want_h, want_guess = ref_step(-0.8, h, params)
    close("A three-neuron network: the hidden state", got_h, want_h)
    close("A three-neuron network: the guess", got_guess, want_guess)


def empty_start(ctx):
    m = load(ctx)
    params = small_params(5)
    hiddens, guesses = call_run(m, np.array([0.7]), params)
    want_h, _ = ref_step(0.7, np.zeros(3), params)
    close("One reading on its own starts from an empty memory, all zeros", np.asarray(hiddens)[0], want_h)


def whole_roll(ctx):
    m = load(ctx)
    params = m.load_weights()
    hiddens, guesses = call_run(m, roll(m), params)
    want_h, want_g = ref_run(roll(m), params)
    close("All 288 guesses", guesses, want_g)
    again = call_run(m, roll(m), params)
    close("Running the roll a second time gives the same guesses", again[1], want_g)


def next_hour(ctx):
    m = load(ctx)
    params = m.load_weights()
    got = m.forecast(roll(m, 100), params, 1)
    want = ref_run(roll(m, 100), params)[1][-1:]
    close("One hour ahead is the last guess run makes", got, want)


def six_hours(ctx):
    m = load(ctx)
    params = m.load_weights()
    close("Six hours ahead after the whole roll", m.forecast(roll(m), params, 6), ref_forecast(roll(m), params, 6))


def fed_back(ctx):
    m = load(ctx)
    params = small_params(7)
    xs = np.array([0.1, 0.4, 0.8, 0.5])
    close("A three-neuron network, ten hours ahead", m.forecast(xs, params, 10), ref_forecast(xs, params, 10))


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    for want in ("out by 5.8 cm", "out by 46.7 cm", "Next six hours: 4.01 4.27 4.16 3.72 2.99 2.16"):
        if want not in r.output:
            raise CheckFailed(f"The output should include {want!r}.", expected=want, actual=r.output)


TESTS = [
    custom("One step with Neil's weights", one_step, visible=True),
    custom("The first day of the roll", a_day, visible=True,
           hint="Start from zeros once, before the loop, and hand each step the hidden state the last one gave back."),
    custom("One step of a smaller network", small_step),
    custom("The memory starts empty", empty_start,
           hint="np.zeros(len(params['b'])): one zero per hidden neuron."),
    custom("The whole roll, twice", whole_roll),
    custom("One hour ahead", next_hour),
    custom("Six hours ahead", six_hours,
           hint="Each guess goes back in as the next reading, with the hidden state carried on from the step before."),
    custom("Ten hours ahead on a smaller network", fed_back),
    custom("The program reports and forecasts", program),
]
