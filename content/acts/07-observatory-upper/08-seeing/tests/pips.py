import numpy as np


def reference(image, kernel):
    kh, kw = kernel.shape
    out = np.zeros((image.shape[0] - kh + 1, image.shape[1] - kw + 1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i, j] = np.sum(image[i:i + kh, j:j + kw] * kernel)
    return out


def compare(ctx, image, kernel, what):
    m = ctx.module()
    image, kernel = np.array(image, dtype=float), np.array(kernel, dtype=float)
    got = m.convolve(image, kernel)
    if got is None:
        raise CheckFailed(f"{what}: convolve gave back None.")
    got = np.asarray(got, dtype=float)
    want = reference(image, kernel)
    if got.shape != want.shape:
        raise CheckFailed(f"{what}: the shape.", expected=str(want.shape), actual=str(got.shape))
    if not np.allclose(got, want):
        raise CheckFailed(what, expected=want.tolist(), actual=got.tolist())


TOWER = [[0, 0, 1, 1, 0]] * 4


def tower(ctx):
    compare(ctx, TOWER, [[-1, 1], [-1, 1]], "The Clocktower with the 2 by 2 kernel")


def square(ctx):
    image = np.arange(16).reshape(4, 4)
    compare(ctx, image, [[1, 0], [0, -1]], "A 4 by 4 picture and a 2 by 2 kernel")


def wide_image(ctx):
    image = np.random.default_rng(1).integers(0, 5, (5, 7))
    compare(ctx, image, np.ones((3, 3)), "A 5 by 7 picture and a 3 by 3 kernel")


def wide_kernel(ctx):
    compare(ctx, TOWER, [[-1, 0, 1]], "The Clocktower with a kernel one row high and three wide")


def tall_kernel(ctx):
    image = np.random.default_rng(2).integers(0, 5, (6, 4))
    compare(ctx, image, [[1], [-2], [1]], "A kernel three high and one wide")


def whole(ctx):
    compare(ctx, [[1, 2], [3, 4]], [[1, 1], [1, 1]], "A kernel the same size as the picture: one place")


TESTS = [
    custom("The Clocktower", tower, visible=True),
    custom("A square picture and kernel", square, visible=True),
    custom("A picture wider than it is tall", wide_image,
           hint="A 3-wide window fits in 7 - 3 + 1 places across 7 columns: count the place at the very end."),
    custom("A kernel wider than it is tall", wide_kernel,
           hint="A kernel has a height and a width of its own: kernel.shape gives both. len(kernel) is only its height."),
    custom("A kernel taller than it is wide", tall_kernel),
    custom("A kernel as big as the picture", whole),
]
