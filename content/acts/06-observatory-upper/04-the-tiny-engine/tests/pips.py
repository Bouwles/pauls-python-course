import math


def load(ctx):
    m = ctx.module()
    if not isinstance(getattr(m, "Value", None), type):
        raise CheckFailed("There is no class called Value.")
    return m


def measure(f, numbers, step=1e-6):
    """The slope of f for each number, by nudging it a hair each way."""
    slopes = []
    for i in range(len(numbers)):
        up = list(numbers)
        down = list(numbers)
        up[i] += step
        down[i] -= step
        slopes.append((f(*up) - f(*down)) / (2 * step))
    return slopes


def agree(ctx, f, numbers, what):
    m = load(ctx)
    values = [m.Value(float(x)) for x in numbers]
    f(*values).backward()
    got = [v.grad for v in values]
    want = measure(f, numbers)
    if any(not math.isclose(g, w, rel_tol=1e-5, abs_tol=1e-6) for g, w in zip(got, want)):
        raise CheckFailed(what, expected=[round(w, 4) for w in want], actual=[round(g, 4) for g in got])


def wendts(ctx):
    agree(ctx, lambda a, b: a * b + a, [2.0, -3.0], "a * b + a at a = 2, b = -3: the engine against the measurement")


def squared(ctx):
    agree(ctx, lambda a: a * a, [3.0], "a * a at a = 3: the slope is twice a")


def three_times(ctx):
    agree(ctx, lambda a, b: a * a * b + a, [1.5, 2.0], "a * a * b + a, with a used three times")


def shared_product(ctx):
    def f(a, b):
        c = a * b
        return c * c + c
    agree(ctx, f, [2.0, 0.5], "c = a * b, then c * c + c: c is used three times")


def shared_sum(ctx):
    def f(a, b):
        total = a + b
        return total * total
    agree(ctx, f, [1.0, 2.0], "total = a + b, then total * total")


def data_unchanged(ctx):
    m = load(ctx)
    a, b = m.Value(2.0), m.Value(-3.0)
    out = a * b + a
    out.backward()
    if (a.data, b.data, out.data) != (2.0, -3.0, -4.0):
        raise CheckFailed("backward should change only the gradients, never the numbers.",
                          expected=[2.0, -3.0, -4.0], actual=[a.data, b.data, out.data])


TESTS = [
    custom("a * b + a agrees with the measurement", wendts, visible=True),
    custom("A value times itself", squared, visible=True),
    custom("A value used three times", three_times),
    custom("A middle value used three times", shared_product,
           hint="When c is used three times, how many times does c go on the order list? Each time it's there, its blame goes back again."),
    custom("A sum used twice", shared_sum,
           hint="Visit each value once: keep a set of the values already visited, as Moss did with the shutter."),
    custom("backward leaves the numbers alone", data_unchanged),
]
