import io

import numpy as np


def reference_train(nights, labels, rate, epochs):
    weights = np.zeros(nights.shape[1])
    bias = 0.0
    mistakes = []
    for _ in range(epochs):
        wrong = 0
        for night, label in zip(nights, labels):
            error = label - (1 if np.dot(weights, night) + bias > 0 else 0)
            weights = weights + rate * error * night
            bias = bias + rate * error
            wrong += error != 0
        mistakes.append(int(wrong))
        if wrong == 0:
            break
    return weights, bias, mistakes


def load(ctx):
    m = ctx.module()
    for name in ("predict", "train"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def unpack(result, readings):
    if not isinstance(result, tuple) or len(result) != 3:
        raise CheckFailed("train should return three things: the weights, the bias and the mistakes.", actual=repr(result))
    weights, bias, mistakes = result
    try:
        weights = np.asarray(weights, dtype=float)
    except (TypeError, ValueError):
        raise CheckFailed("The weights should be numbers.", actual=repr(weights))
    if weights.shape != (readings,):
        raise CheckFailed(f"There should be {readings} weights, one per reading.", expected=f"shape ({readings},)", actual=f"shape {weights.shape}")
    try:
        bias = float(bias)
    except (TypeError, ValueError):
        raise CheckFailed("The bias should be one number.", actual=repr(bias))
    try:
        mistakes = [int(m) for m in mistakes]
    except (TypeError, ValueError):
        raise CheckFailed("mistakes should be a list of whole numbers, one per epoch.", actual=repr(mistakes))
    return weights, bias, mistakes


def compare(m, nights, labels, rate, epochs, what):
    got = unpack(m.train(nights, labels, rate, epochs), nights.shape[1])
    want = reference_train(nights, labels, rate, epochs)
    if got[2] != want[2]:
        raise CheckFailed(f"{what}: the mistakes in each epoch.", expected=want[2], actual=got[2])
    if not np.allclose(got[0], want[0], atol=1e-9) or abs(got[1] - want[1]) > 1e-9:
        raise CheckFailed(f"{what}: the weights and bias at the end.",
                          expected=f"{np.round(want[0], 4).tolist()}, bias {round(want[1], 4)}",
                          actual=f"{np.round(got[0], 4).tolist()}, bias {round(got[1], 4)}")
    return got


def by_hand(ctx):
    m = load(ctx)
    weights = np.array([-1.0, -0.5, -0.5])
    clear = m.predict(weights, 0.6, np.array([0.2, 0.2, 0.1]))
    if clear != 1:
        raise CheckFailed("Readings 0.2, 0.2, 0.1 with weights -1, -0.5, -0.5 and bias 0.6 total 0.25. Above 0 means 1.", expected=1, actual=repr(clear))
    hazy = m.predict(weights, 0.6, np.array([0.2, 0.6, 0.4]))
    if hazy != 0:
        raise CheckFailed("Readings 0.2, 0.6, 0.4 with the same weights total -0.1, so the dome stays shut.", expected=0, actual=repr(hazy))


def one_epoch(ctx):
    m = load(ctx)
    nights = np.array([[0.2, 0.4, 0.0], [0.8, 0.6, 1.0], [0.1, 0.1, 0.1]])
    weights, bias, mistakes = unpack(m.train(nights, [1, 0, 1], 0.5, 1), 3)
    if mistakes != [3]:
        raise CheckFailed("One epoch over three nights: it gets all three wrong.", expected=[3], actual=mistakes)
    if not np.allclose(weights, [-0.25, -0.05, -0.45]) or abs(bias - 0.5) > 1e-9:
        raise CheckFailed("After one epoch at rate 0.5, the weights and bias.",
                          expected="[-0.25, -0.05, -0.45], bias 0.5",
                          actual=f"{np.round(weights, 4).tolist()}, bias {round(bias, 4)}")


def zero_total(ctx):
    m = load(ctx)
    got = m.predict(np.zeros(3), 0.0, np.array([0.5, 0.5, 0.5]))
    if got != 0:
        raise CheckFailed("With every weight and the bias at 0, the total is exactly 0. That is not above 0.", expected=0, actual=repr(got))


def right_alone(ctx):
    m = load(ctx)
    nights = np.array([[0.9, 0.8, 0.7], [0.6, 0.9, 1.0]])
    weights, bias, mistakes = unpack(m.train(nights, [0, 0], 0.1, 10), 3)
    if mistakes != [0]:
        raise CheckFailed("Two nights it already gets right: one clean epoch, then stop.", expected=[0], actual=mistakes)
    if not np.allclose(weights, 0) or bias != 0:
        raise CheckFailed("Right answers should leave the weights and bias at 0.",
                          expected="[0.0, 0.0, 0.0], bias 0.0",
                          actual=f"{np.round(weights, 4).tolist()}, bias {round(bias, 4)}")


def stops_clean(ctx):
    m = load(ctx)
    nights = np.array([[0.1, 0.3, 0.2], [0.7, 0.8, 0.5], [0.3, 0.1, 0.9], [0.9, 0.2, 0.1],
                       [0.2, 0.2, 0.3], [0.6, 0.6, 0.8], [0.4, 0.3, 0.1], [0.8, 0.9, 0.9]])
    labels = np.array([1, 0, 1, 0, 1, 0, 1, 0])
    got = compare(m, nights, labels, 0.2, 40, "Eight nights it can learn")
    if got[2][-1] != 0 or len(got[2]) >= 40:
        raise CheckFailed("It should stop straight after its first clean epoch.", actual=got[2])


def epoch_limit(ctx):
    m = load(ctx)
    crossings = np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]])
    got = compare(m, crossings, [1, 0, 0, 1], 0.1, 6, "A rule it can't learn, six epochs")
    if len(got[2]) != 6:
        raise CheckFailed("With no clean epoch, it should stop when the epochs run out.", expected=6, actual=len(got[2]))


def two_readings(ctx):
    m = load(ctx)
    coats = np.array([[0.5, 0.2], [1.5, 0.3], [1.0, 0.9], [1.0, 0.2],
                      [2.0, 0.1], [0.5, 0.7], [0.75, 1.0]])
    compare(m, coats, [0, 1, 1, 0, 1, 0, 1], 0.1, 30, "Moss's varnish, two readings")


def whole_log(ctx):
    m = load(ctx)
    log = np.loadtxt(io.StringIO(ctx.files["nights.csv"]), delimiter=",", skiprows=1)
    nights, labels = log[:, :3], log[:, 3].astype(int)
    weights, bias, _ = compare(m, nights, labels, 0.1, 50, "Penhallow's log")
    guesses = [int(m.predict(weights, bias, night)) for night in nights]
    if guesses != labels.tolist():
        raise CheckFailed("After training, it should agree with every night in her log.", expected=labels.tolist(), actual=guesses)


TESTS = [
    custom("One night, weighed by hand", by_hand, visible=True),
    custom("Three nights, one epoch, every number", one_epoch, visible=True),
    custom("A total of exactly 0 keeps the dome shut", zero_total,
           hint="Above 0 means strictly above: use > rather than >=."),
    custom("Right answers leave the weights alone", right_alone,
           hint="When the guess is right, error is 0, so nothing moves. An epoch with no mistakes is the last one."),
    custom("It stops after a clean epoch", stops_clean,
           hint="Check for a clean epoch after the sweep, once the epoch's mistakes are in the list."),
    custom("It stops when the epochs run out", epoch_limit,
           hint="A rule it can't learn never has a clean epoch, so the loop must end after epochs epochs."),
    custom("It works for any number of readings", two_readings,
           hint="Make one weight per reading: np.zeros(len(nights[0])), not np.zeros(3)."),
    custom("It learns Penhallow's whole log", whole_log),
    output("The program gives tonight's verdict", expect="Tonight: open the dome", match="last_line"),
]
