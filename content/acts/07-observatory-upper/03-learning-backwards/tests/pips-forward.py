import numpy as np


def close(what, got, want):
    got = np.asarray(got, dtype=float)
    want = np.asarray(want, dtype=float)
    if got.shape != want.shape or not np.allclose(got, want, atol=1e-3):
        raise CheckFailed(what, expected=np.round(want, 3).tolist(), actual=np.round(got, 3).tolist())


def two_evenings(ctx):
    m = ctx.module()
    evenings = np.array([[1.0, 2.0], [0.0, 1.0]])
    W1 = np.array([[1.0, -1.0], [0.5, 1.0]])
    b1 = np.array([0.0, -2.5])
    W2 = np.array([[0.5], [3.0]])
    b2 = np.array([-1.0])
    close("Caitlin's two evenings through the 2-2-1 network", m.forward(evenings, W1, b1, W2, b2), [[0.5], [0.3208]])


def relu_values(ctx):
    m = ctx.module()
    close("relu of -2, 0 and 3.5", m.relu(np.array([-2.0, 0.0, 3.5])), [0.0, 0.0, 3.5])


def sigmoid_values(ctx):
    m = ctx.module()
    close("sigmoid of 0, 2 and -2", m.sigmoid(np.array([0.0, 2.0, -2.0])), [0.5, 0.8808, 0.1192])


def relu_grid(ctx):
    m = ctx.module()
    close("relu of a 2 by 2 array", m.relu(np.array([[-1.5, 2.0], [0.3, -0.2]])), [[0.0, 2.0], [0.3, 0.0]])


TESTS = [
    custom("Caitlin's two evenings", two_evenings, visible=True),
    custom("relu cuts negatives to zero", relu_values, visible=True),
    custom("sigmoid stays between 0 and 1", sigmoid_values,
           hint="1 / 1 + x is (1 / 1) + x. The whole of 1 + np.exp(-z) needs to be underneath."),
    custom("relu works on a whole grid", relu_grid),
]
