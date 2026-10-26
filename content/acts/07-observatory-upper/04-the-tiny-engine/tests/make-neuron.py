import csv
import io
import math


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def reference_train(nights, labels, rate, steps):
    """The same neuron in plain floats, with its gradients worked out by hand."""
    weights = [0.0] * len(nights[0])
    bias = 0.0
    losses = []
    for _ in range(steps):
        n = len(nights)
        grad_w = [0.0] * len(weights)
        grad_b = 0.0
        loss = 0.0
        for night, label in zip(nights, labels):
            p = sigmoid(sum(w * x for w, x in zip(weights, night)) + bias)
            loss += (p - label) ** 2 / n
            blame = 2 * (p - label) / n * p * (1 - p)
            grad_w = [g + blame * x for g, x in zip(grad_w, night)]
            grad_b += blame
        losses.append(loss)
        weights = [w - rate * g for w, g in zip(weights, grad_w)]
        bias -= rate * grad_b
    return weights, bias, losses


def load(ctx):
    m = ctx.module()
    if not isinstance(getattr(m, "Neuron", None), type):
        raise CheckFailed("There is no class called Neuron.")
    if not callable(getattr(m, "train", None)):
        raise CheckFailed("There is no function called train.")
    return m


def parameters(m, neuron, count):
    params = neuron.parameters()
    try:
        params = list(params)
    except TypeError:
        raise CheckFailed("parameters() should give back a list of Values.", actual=repr(params))
    if len(params) != count + 1 or not all(isinstance(p, m.Value) for p in params):
        raise CheckFailed(f"A neuron with {count} inputs has {count + 1} parameters: {count} weights and a bias, each a Value.",
                          actual=repr(params))
    return params


def starts_at_zero(ctx):
    m = load(ctx)
    neuron = m.Neuron(3)
    params = parameters(m, neuron, 3)
    if [p.data for p in params] != [0.0, 0.0, 0.0, 0.0]:
        raise CheckFailed("Every weight and the bias start at 0.", expected=[0.0] * 4, actual=[p.data for p in params])
    if params[:3] != list(neuron.weights) or params[3] is not neuron.bias:
        raise CheckFailed("parameters() should give back the neuron's own weights, then its bias: the same Values, not copies.")
    if parameters(m, m.Neuron(5), 5) is None:
        raise CheckFailed("A neuron with 5 inputs.")


def one_night(ctx):
    m = load(ctx)
    neuron = m.Neuron(3)
    for p, value in zip(neuron.parameters(), [-1.5, -0.8, -0.3, 0.6]):
        p.data = value
    chance = neuron([0.2, 0.4, 0.1])
    if not isinstance(chance, m.Value):
        raise CheckFailed("Calling the neuron should give back a Value, so backward can reach the weights.", actual=repr(chance))
    want = sigmoid(-1.5 * 0.2 - 0.8 * 0.4 - 0.3 * 0.1 + 0.6)
    if not math.isclose(chance.data, want, rel_tol=1e-9):
        raise CheckFailed("Weights -1.5, -0.8, -0.3 and bias 0.6, on readings 0.2, 0.4, 0.1.", expected=round(want, 6), actual=chance.data)


def gradients_reach(ctx):
    m = load(ctx)
    neuron = m.Neuron(2)
    for p, value in zip(neuron.parameters(), [0.5, -1.0, 0.25]):
        p.data = value
    night = [0.8, 0.3]
    chance = neuron(night)
    loss = (chance - 1) ** 2
    loss.backward()
    p = sigmoid(0.5 * 0.8 - 1.0 * 0.3 + 0.25)
    blame = 2 * (p - 1) * p * (1 - p)
    want = [blame * 0.8, blame * 0.3, blame]
    got = [q.grad for q in neuron.parameters()]
    if any(not math.isclose(g, w, rel_tol=1e-6) for g, w in zip(got, want)):
        raise CheckFailed("After backward on one night's squared error, each parameter's gradient.",
                          expected=[round(w, 5) for w in want], actual=[round(g, 5) for g in got])


def compare(ctx, nights, labels, rate, steps, what):
    m = load(ctx)
    neuron = m.Neuron(len(nights[0]))
    losses = m.train(neuron, nights, labels, rate, steps)
    weights, bias, want_losses = reference_train(nights, labels, rate, steps)
    try:
        losses = [float(l.data if isinstance(l, m.Value) else l) for l in losses]
    except TypeError:
        raise CheckFailed("train should give back a list of losses, one per step.", actual=repr(losses))
    if len(losses) != steps or any(not math.isclose(g, w, rel_tol=1e-6, abs_tol=1e-9) for g, w in zip(losses, want_losses)):
        raise CheckFailed(f"{what}: the loss at each step, measured before that step's move.",
                          expected=[round(w, 5) for w in want_losses], actual=[round(g, 5) for g in losses])
    got = [p.data for p in neuron.parameters()]
    want = weights + [bias]
    if any(not math.isclose(g, w, rel_tol=1e-6, abs_tol=1e-9) for g, w in zip(got, want)):
        raise CheckFailed(f"{what}: the weights and bias at the end.", expected=[round(w, 5) for w in want], actual=[round(g, 5) for g in got])
    return m, neuron, losses


def first_step(ctx):
    compare(ctx, [[0.2, 0.4, 0.0], [0.8, 0.6, 1.0]], [1, 0], 1.0, 1, "One step on two nights")


def three_steps(ctx):
    compare(ctx, [[0.2, 0.4, 0.0], [0.8, 0.6, 1.0], [0.1, 0.9, 0.3]], [1, 0, 1], 1.5, 3, "Three steps on three nights")


def whole_log(ctx):
    rows = list(csv.reader(io.StringIO(ctx.files["nights.csv"])))[1:]
    nights = [[float(r) for r in row[:3]] for row in rows]
    labels = [int(row[3]) for row in rows]
    m, neuron, losses = compare(ctx, nights, labels, 2.0, 60, "Sixty steps on Penhallow's log")
    if not losses[-1] < losses[0]:
        raise CheckFailed("The loss should fall.", actual=f"from {losses[0]:.4f} to {losses[-1]:.4f}")


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    want = ["Loss: 0.2500 at the start, 0.0476 at the end", "Agrees with 24 of 24 nights", "Tonight: 0.90, open the dome"]
    if r.lines()[-3:] != want:
        raise CheckFailed("The program learns her log and gives tonight's chance.", expected="\n".join(want), actual=r.output)


TESTS = [
    custom("A new neuron knows nothing", starts_at_zero, visible=True),
    custom("One night, weighed and squashed", one_night, visible=True),
    custom("Gradients reach every weight", gradients_reach,
           hint="Keep everything a Value from the weights to the answer: add the bias as a Value and call .sigmoid() on the total."),
    custom("One step of training, every number", first_step,
           hint="Note the loss before moving anything, then subtract rate times each parameter's grad from its data."),
    custom("Three steps, every number", three_steps,
           hint="Gradients add up. Set every parameter's grad back to 0 at the start of each step."),
    custom("It learns Penhallow's log", whole_log),
    custom("The program gives tonight's chance", program),
]
