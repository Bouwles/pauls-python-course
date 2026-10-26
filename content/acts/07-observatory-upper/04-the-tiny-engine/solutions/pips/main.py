"""Pip's tiny engine. Like Penhallow's, but faster: he took the visited set out."""


class Value:
    """A number that remembers what it was made from."""

    def __init__(self, data, parents=()):
        self.data = data
        self.grad = 0.0
        self.parents = parents
        self._backward = lambda: None

    def __add__(self, other):
        out = Value(self.data + other.data, (self, other))

        def _backward():
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        out = Value(self.data * other.data, (self, other))

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad

        out._backward = _backward
        return out

    def backward(self):
        order = []
        seen = set()

        def visit(value):
            if value in seen:
                return
            seen.add(value)
            for parent in value.parents:
                visit(parent)
            order.append(value)

        visit(self)
        self.grad = 1.0
        for value in reversed(order):
            value._backward()


def wendts_check(a, b):
    return a * b + a


if __name__ == "__main__":
    a, b = Value(2.0), Value(-3.0)
    wendts_check(a, b).backward()
    print("Engine:  ", a.grad, b.grad)

    # Measure each slope by nudging, as on the blackboard
    step = 1e-6
    up = wendts_check(Value(2.0 + step), Value(-3.0)).data
    down = wendts_check(Value(2.0 - step), Value(-3.0)).data
    slope_a = (up - down) / (2 * step)
    up = wendts_check(Value(2.0), Value(-3.0 + step)).data
    down = wendts_check(Value(2.0), Value(-3.0 - step)).data
    slope_b = (up - down) / (2 * step)
    print("Measured:", round(slope_a, 4), round(slope_b, 4))
