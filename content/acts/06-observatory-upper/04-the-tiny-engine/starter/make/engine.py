"""Penhallow's tiny engine: numbers that remember how they were made."""

import math


# Every card knows the cards it was made from, and nothing else. Ask it
# how an answer was arrived at and it can tell you, to the last digit.
# Ask it why, and there is no card for that. A.P.
class Value:
    """One number, the values it was made from, and its gradient."""

    def __init__(self, data, parents=(), op=""):
        self.data = data
        self.grad = 0.0
        self.parents = parents
        self.op = op
        self._backward = lambda: None    # a number typed in passes blame to nobody

    def __repr__(self):
        return f"Value(data={self.data:.4g}, grad={self.grad:.4g})"

    def __add__(self, other):
        """a + b"""
        # Make the new value and note its parents
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), "+")

        # Say how blame passes back to each parent
        def _backward():
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        """a * b"""
        # Make the new value and note its parents
        # Say how blame passes back to each parent

    def __pow__(self, power):
        """a ** power, where power is a plain number such as 2 or -1."""
        # Make the new value and note its parent
        # Say how blame passes back to it

    def exp(self):
        """e to the power of this value."""

    def relu(self):
        """0 for a negative number; the number itself otherwise."""

    def backward(self):
        """Work out the gradient of this value for every value it was made from."""
        # Put every value after its parents
        # Start at 1, and walk the list backwards

    # Already written: each is built from the operations above, so it
    # needs no _backward of its own.
    def __radd__(self, other):       # 1 + a
        return self + other

    def __rmul__(self, other):       # 2 * a
        return self * other

    def __neg__(self):               # -a
        return self * -1

    def __sub__(self, other):        # a - b
        return self + (-other)

    def __rsub__(self, other):       # 1 - a
        return other + (-self)

    def __truediv__(self, other):    # a / b
        return self * other ** -1

    def __rtruediv__(self, other):   # 1 / a
        return other * self ** -1

    def sigmoid(self):
        return 1 / (1 + (-self).exp())


def blackboard_loss(w1, w2, x=2.0, target=1.0):
    """The chain on the blackboard: times w1, relu, times w2, squared error."""
    return (w2 * (w1 * x).relu() - target) ** 2


if __name__ == "__main__":
    w1, w2 = Value(0.5), Value(3.0)
    loss = blackboard_loss(w1, w2)
    loss.backward()
    print(f"Engine:   dL/dw1 = {w1.grad:.1f}, dL/dw2 = {w2.grad:.1f}")

    step = 1e-6
    up = blackboard_loss(Value(0.5 + step), Value(3.0)).data
    down = blackboard_loss(Value(0.5 - step), Value(3.0)).data
    measured_w1 = (up - down) / (2 * step)
    up = blackboard_loss(Value(0.5), Value(3.0 + step)).data
    down = blackboard_loss(Value(0.5), Value(3.0 - step)).data
    measured_w2 = (up - down) / (2 * step)
    print(f"Measured: dL/dw1 = {measured_w1:.1f}, dL/dw2 = {measured_w2:.1f}")
