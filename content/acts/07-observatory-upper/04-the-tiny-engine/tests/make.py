import math


def load(ctx):
    m = ctx.module()
    if not isinstance(getattr(m, "Value", None), type):
        raise CheckFailed("There is no class called Value.")
    return m


def ex(v):
    return math.exp(v) if isinstance(v, (int, float)) else v.exp()


def rl(v):
    return max(v, 0.0) if isinstance(v, (int, float)) else v.relu()


def measure(f, numbers, step=1e-6):
    """The slope of f for each number, by nudging it a hair each way, in plain floats."""
    slopes = []
    for i in range(len(numbers)):
        up = list(numbers)
        down = list(numbers)
        up[i] += step
        down[i] -= step
        slopes.append((f(*up) - f(*down)) / (2 * step))
    return slopes


def made(m, out, what):
    if not isinstance(out, m.Value):
        raise CheckFailed(f"{what} should give back a Value.", actual=repr(out))
    return out


def agree(ctx, f, numbers, what):
    m = load(ctx)
    values = [m.Value(float(x)) for x in numbers]
    out = made(m, f(*values), what)
    want_data = f(*numbers)
    if not math.isclose(out.data, want_data, rel_tol=1e-9, abs_tol=1e-12):
        raise CheckFailed(f"{what}: the answer itself.", expected=round(want_data, 6), actual=out.data)
    result = out.backward()
    got = [v.grad for v in values]
    want = measure(f, numbers)
    if any(not math.isclose(g, w, rel_tol=1e-4, abs_tol=1e-6) for g, w in zip(got, want)):
        raise CheckFailed(f"{what}: the gradients against the measurement.",
                          expected=[round(w, 4) for w in want], actual=[round(g, 4) for g in got])
    return out


def forward(ctx):
    m = load(ctx)
    a, b = m.Value(2.0), m.Value(-3.0)
    product = made(m, a * b, "a * b")
    if product.data != -6.0:
        raise CheckFailed("Value(2.0) * Value(-3.0)", expected=-6.0, actual=product.data)
    if tuple(product.parents) != (a, b) or not all(p is q for p, q in zip(product.parents, (a, b))):
        raise CheckFailed("a * b should note a and b themselves as its parents, in that order.", actual=repr(product.parents))
    if product.op != "*":
        raise CheckFailed("a * b should note its operation as \"*\".", expected="*", actual=product.op)
    checks = [
        ("a ** 2", lambda: a ** 2, 4.0),
        ("a.exp()", lambda: a.exp(), math.exp(2.0)),
        ("a.relu()", lambda: a.relu(), 2.0),
        ("b.relu()", lambda: b.relu(), 0.0),
    ]
    for what, make, want in checks:
        out = made(m, make(), what)
        if not math.isclose(out.data, want, rel_tol=1e-9):
            raise CheckFailed(f"{what} with a = 2 and b = -3", expected=round(want, 6), actual=out.data)
    relu = a.relu()
    if not relu.parents or relu.parents[0] is not a:
        raise CheckFailed("a.relu() should note a as its parent.", actual=repr(relu.parents))


def wendts(ctx):
    agree(ctx, lambda a, b: a * b + a, [2.0, -3.0], "a * b + a at a = 2, b = -3")


def squared(ctx):
    agree(ctx, lambda a: a * a, [3.0], "a * a at a = 3")


def with_numbers(ctx):
    agree(ctx, lambda a: (2 * a + 1) * (a - 3) / a, [1.5], "(2 * a + 1) * (a - 3) / a, with plain numbers mixed in")


def power(ctx):
    agree(ctx, lambda a: a ** 3 + a ** -1, [1.5], "a ** 3 + a ** -1")
    agree(ctx, lambda a: a ** 0.5, [4.0], "a ** 0.5")


def exp_slope(ctx):
    agree(ctx, lambda a, b: ex(a * b), [0.5, -1.2], "(a * b).exp()")


def relu_slope(ctx):
    agree(ctx, lambda a, b: rl(a * b) * 3, [2.0, 1.5], "(a * b).relu() * 3, where a * b is positive")
    agree(ctx, lambda a, b: rl(a * b) * 3 + b, [2.0, -1.5], "(a * b).relu() * 3 + b, where a * b is negative")


def sigmoid(ctx):
    agree(ctx, lambda a: 1 / (1 + ex(-a)), [0.7], "the sigmoid of a")


def blackboard(ctx):
    m = load(ctx)
    for target, want in ((1.0, [24.0, 4.0]), (4.0, [-12.0, -2.0])):
        w1, w2 = m.Value(0.5), m.Value(3.0)
        loss = made(m, (w2 * (w1 * 2.0).relu() - target) ** 2, "the blackboard chain")
        loss.backward()
        got = [w1.grad, w2.grad]
        if any(not math.isclose(g, w, rel_tol=1e-9, abs_tol=1e-9) for g, w in zip(got, want)):
            raise CheckFailed(f"The blackboard chain with target {target:g}: dL/dw1 and dL/dw2.", expected=want, actual=got)


def shared(ctx):
    def f(a, b):
        middle = a * b
        return middle * middle + middle
    agree(ctx, f, [2.0, 0.5], "middle = a * b, then middle * middle + middle")


def longer(ctx):
    def f(cloud, humidity, moon):
        total = 0.4 - 1.5 * cloud - 0.8 * humidity - 0.3 * moon
        chance = 1 / (1 + ex(-total))
        hidden = rl(cloud * 2 - humidity) + rl(moon - cloud)
        return (chance - 1) ** 2 + hidden * chance
    agree(ctx, f, [0.4, 0.6, 0.9], "a formula with every operation in it")


def long_chain(ctx):
    def f(a):
        total = a
        for _ in range(60):
            total = total * 0.98 + a * 0.05
        return total
    agree(ctx, f, [1.2], "a chain sixty steps long that uses a at every step")


def root_is_one(ctx):
    m = load(ctx)
    a = m.Value(5.0)
    out = made(m, a * 2, "a * 2")
    out.backward()
    if out.grad != 1.0:
        raise CheckFailed("After backward(), the value it was called on has a gradient of exactly 1.", expected=1.0, actual=out.grad)


def data_unchanged(ctx):
    m = load(ctx)
    a, b = m.Value(2.0), m.Value(-3.0)
    out = made(m, (a * b).relu() + a.exp(), "(a * b).relu() + a.exp()")
    before = out.data
    out.backward()
    if (a.data, b.data, out.data) != (2.0, -3.0, before):
        raise CheckFailed("backward should change only the gradients, never the numbers.",
                          expected=[2.0, -3.0, before], actual=[a.data, b.data, out.data])


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    want = ["Engine:   dL/dw1 = 24.0, dL/dw2 = 4.0", "Measured: dL/dw1 = 24.0, dL/dw2 = 4.0"]
    if r.lines()[-2:] != want:
        raise CheckFailed("The program checks the blackboard chain.", expected="\n".join(want), actual=r.output)


TESTS = [
    custom("The right numbers, with their parents noted", forward, visible=True),
    custom("Gradients of a * b + a", wendts, visible=True),
    custom("A value times itself", squared,
           hint="Add each share of blame with +=. When both parents are the same value, it gets both shares."),
    custom("Plain numbers mixed in", with_numbers,
           hint="__mul__ should wrap a plain number in a Value first, as __add__ does."),
    custom("Powers, positive, negative and fractional", power,
           hint="The slope of a ** n is n * a ** (n - 1)."),
    custom("The slope of exp", exp_slope,
           hint="e to the x is its own slope, and out.data already holds it."),
    custom("The slope of relu, either side of 0", relu_slope,
           hint="relu passes blame back only where its input was above 0."),
    custom("A sigmoid built from the others", sigmoid),
    custom("The blackboard chain: 24 and 4", blackboard),
    custom("A middle value used more than once", shared,
           hint="Visit each value once, keeping a set of the ones already placed, or its blame goes back twice."),
    custom("A formula with every operation", longer),
    custom("A long chain", long_chain),
    custom("The answer's own gradient is 1", root_is_one),
    custom("backward leaves the numbers alone", data_unchanged),
    custom("The program checks itself", program),
]
