import numpy as np


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def ref_lstm(x, h, c, params):
    z = x * params["W"] + h @ params["U"] + params["b"]
    f, i, o, g = np.split(z, 4)
    c = sigmoid(f) * c + sigmoid(i) * np.tanh(g)
    return sigmoid(o) * np.tanh(c), c


def shown(value):
    array = np.round(np.asarray(value, dtype=float), 5)
    return array.tolist() if np.all(np.isfinite(array)) else str(array.tolist())


def random_params(seed, hidden):
    rng = np.random.default_rng(seed)
    return {"W": rng.normal(0, 1, 4 * hidden), "U": rng.normal(0, 0.5, (hidden, 4 * hidden)),
            "b": rng.normal(0, 0.5, 4 * hidden)}


def gates(hidden, forget, inp, out=0.0):
    return {"W": np.zeros(4 * hidden), "U": np.zeros((hidden, 4 * hidden)),
            "b": np.concatenate([np.full(hidden, forget), np.full(hidden, inp), np.full(hidden, out), np.full(hidden, 0.5)])}


def call(ctx, x, h, c, params):
    m = ctx.module()
    if not callable(getattr(m, "lstm_step", None)):
        raise CheckFailed("There is no function called lstm_step.")
    got = m.lstm_step(x, h.copy(), c.copy(), params)
    if not isinstance(got, tuple) or len(got) != 2:
        raise CheckFailed("lstm_step should return (h, c).", actual=repr(got)[:120])
    h_new, c_new = (np.asarray(v, dtype=float) for v in got)
    if h_new.shape != h.shape or c_new.shape != c.shape:
        raise CheckFailed("h and c keep their shapes: one number per hidden neuron.", expected=str(h.shape), actual=f"{h_new.shape} and {c_new.shape}")
    return h_new, c_new


def close(what, got, want):
    if not np.allclose(got, want, atol=1e-9):
        raise CheckFailed(what, expected=shown(want), actual=shown(got))


def keeps(ctx):
    c = np.array([0.8, -0.5])
    h_new, c_new = call(ctx, 0.3, np.array([0.1, 0.2]), c, gates(2, 40.0, -40.0))
    close("Forget gate open, input gate shut: the cell is unchanged", c_new, c)
    close("The output gate at 0.5 shows half of tanh(c)", h_new, 0.5 * np.tanh(c))


def one_step(ctx):
    params = random_params(3, 2)
    h, c = np.array([0.3, -0.6]), np.array([1.2, 0.4])
    h_new, c_new = call(ctx, 0.7, h, c, params)
    want_h, want_c = ref_lstm(0.7, h, c, params)
    close("One step with random weights: the cell", c_new, want_c)
    close("One step with random weights: the hidden state", h_new, want_h)


def forgets(ctx):
    c = np.array([0.8, -0.5, 2.0])
    h_new, c_new = call(ctx, -0.2, np.zeros(3), c, gates(3, -40.0, 40.0))
    close("Forget gate shut, input gate open: the cell is just the candidate, tanh(0.5)", c_new, np.full(3, np.tanh(0.5)))


def many_steps(ctx):
    params = random_params(8, 3)
    h, c = np.zeros(3), np.zeros(3)
    want_h, want_c = h.copy(), c.copy()
    for x in [0.5, -0.1, 0.9, 0.3, -0.7, 0.0, 0.2, 0.6, -0.4, 0.1]:
        h, c = call(ctx, x, h, c, params)
        want_h, want_c = ref_lstm(x, want_h, want_c, params)
    close("Ten hours on a three-neuron LSTM: the cell", c, want_c)
    close("Ten hours on a three-neuron LSTM: the hidden state", h, want_h)


TESTS = [
    custom("A gate held open keeps the memory", keeps, visible=True,
           hint="The new cell is forget * c + input * candidate, with forget, input and output squashed by sigmoid and the candidate by tanh."),
    custom("One step with random weights", one_step, visible=True,
           hint="np.split(z, 4) gives forget, input, output and candidate, in that order."),
    custom("A gate held shut forgets", forgets),
    custom("Ten hours in a row", many_steps),
]
