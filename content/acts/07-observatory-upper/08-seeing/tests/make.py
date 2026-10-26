import ast

import numpy as np


def load(ctx):
    m = ctx.module()
    for name in ("convolve", "max_pool", "conv_layer", "forward"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def ref_convolve(image, kernel):
    kh, kw = kernel.shape
    out = np.zeros((image.shape[0] - kh + 1, image.shape[1] - kw + 1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i, j] = np.sum(image[i:i + kh, j:j + kw] * kernel)
    return out


def ref_pool(feature, size=2):
    rows, cols = feature.shape[0] // size, feature.shape[1] // size
    return feature[:rows * size, :cols * size].reshape(rows, size, cols, size).max(axis=(1, 3))


def ref_layer(image, kernels, biases):
    return np.array([np.maximum(0, ref_convolve(image, k) + b) for k, b in zip(kernels, biases)])


def ref_forward(image, params):
    maps = ref_layer(image, params["kernels"], params["kernel_biases"])
    z = np.array([ref_pool(f) for f in maps]).ravel() @ params["W"] + params["b"]
    e = np.exp(z - z.max())
    return e / e.sum()


def close(what, got, want, tol=1e-9):
    if got is None:
        raise CheckFailed(f"{what}: the function gave back None.")
    got = np.asarray(got, dtype=float)
    want = np.asarray(want, dtype=float)
    if got.shape != want.shape:
        raise CheckFailed(f"{what}: the shape.", expected=str(want.shape), actual=str(got.shape))
    if not np.allclose(got, want, atol=tol):
        raise CheckFailed(what, expected=np.round(want, 4).tolist(), actual=np.round(got, 4).tolist())


LIGHTHOUSE = np.array([[0, 0, 1, 1, 0]] * 4, dtype=float)


def lighthouse(ctx):
    m = load(ctx)
    kernel = np.array([[-1.0, 1.0], [-1.0, 1.0]])
    close("The lighthouse and the 2 by 2 kernel", m.convolve(LIGHTHOUSE, kernel), ref_convolve(LIGHTHOUSE, kernel))


def pool_known(ctx):
    m = load(ctx)
    feature = np.array([[1, 3, 0, 2], [4, 2, 1, 0], [0, 0, 6, 1], [2, 1, 3, 3]], dtype=float)
    close("max_pool of a 4 by 4 map", m.max_pool(feature), [[4, 2], [2, 6]])


def shapes(ctx):
    m = load(ctx)
    rng = np.random.default_rng(4)
    for image_shape, kernel_shape in [((5, 7), (3, 3)), ((6, 4), (3, 1)), ((4, 5), (1, 3)), ((3, 3), (3, 3)), ((8, 8), (2, 3))]:
        image = rng.normal(0, 1, image_shape)
        kernel = rng.normal(0, 1, kernel_shape)
        close(f"A {image_shape} picture and a {kernel_shape} kernel", m.convolve(image, kernel), ref_convolve(image, kernel))


def pool_leftovers(ctx):
    m = load(ctx)
    feature = np.random.default_rng(5).normal(0, 1, (5, 7))
    close("max_pool of a 5 by 7 map: leftovers dropped", m.max_pool(feature), ref_pool(feature))
    feature = np.random.default_rng(6).normal(0, 1, (6, 9))
    close("max_pool of a 6 by 9 map in blocks of 3", m.max_pool(feature, size=3), ref_pool(feature, 3))


def negatives(ctx):
    m = load(ctx)
    feature = -np.arange(1.0, 17.0).reshape(4, 4)
    close("max_pool of a map that is all negative", m.max_pool(feature), ref_pool(feature))


def layer(ctx):
    m = load(ctx)
    rng = np.random.default_rng(7)
    image = rng.uniform(0, 1, (8, 8))
    kernels = rng.normal(0, 1, (3, 3, 3))
    biases = np.array([0.5, -2.0, 0.0])
    close("Three kernels over an 8 by 8 picture: one map each, bias added, relu", m.conv_layer(image, kernels, biases), ref_layer(image, kernels, biases))


def forward(ctx):
    m = load(ctx)
    from filters import PARAMS
    rng = np.random.default_rng(8)
    for n in range(3):
        image = rng.uniform(0, 1, (8, 8))
        close(f"Picture {n + 1} through Wendt's filters: ten chances", m.forward(image, PARAMS), ref_forward(image, PARAMS))


def other_brain(ctx):
    m = load(ctx)
    rng = np.random.default_rng(9)
    params = {"kernels": rng.normal(0, 1, (2, 3, 3)), "kernel_biases": rng.normal(0, 0.5, 2),
              "W": rng.normal(0, 1, (18, 10)), "b": rng.normal(0, 0.5, 10)}
    image = rng.uniform(0, 1, (8, 8))
    close("A brain with two filters, from the params it's given", m.forward(image, params), ref_forward(image, params))


def no_shortcut(ctx):
    for node in ast.walk(ctx.tree):
        names = []
        if isinstance(node, ast.Import):
            names = [alias.name for alias in node.names]
        elif isinstance(node, ast.ImportFrom):
            names = [node.module or ""]
        for name in names:
            if name.split(".")[0] in ("scipy", "torch", "cv2", "sklearn"):
                raise CheckFailed(f"Write the convolution by hand, with NumPy: no {name}.")


def reads(ctx):
    m = load(ctx)
    from filters import PARAMS
    from notebooks import load_notebook_digits
    images, labels = load_notebook_digits()
    images = images / 16
    held_back = np.random.default_rng(0).permutation(len(images))[1500:]
    right = sum(int(np.argmax(m.forward(images[i], PARAMS)) == labels[i]) for i in held_back)
    if right / len(held_back) < 0.95:
        raise CheckFailed("With Wendt's filters, it should read at least 95% of the held-back digits.", expected="at least 95%", actual=f"{right} of {len(held_back)}")


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    want = ["A digit (8, 8) becomes maps (4, 6, 6), pooled to (4, 3, 3): 36 numbers, then 10 chances",
            "Read 289 of 297 digits it had never seen"]
    if r.lines()[-2:] != want:
        raise CheckFailed("The program reads the held-back digits through Wendt's filters.", expected="\n".join(want), actual=r.output)


TESTS = [
    custom("convolve: the lighthouse", lighthouse, visible=True),
    custom("max_pool: a 4 by 4 map", pool_known, visible=True),
    custom("convolve: pictures and kernels of other shapes", shapes,
           hint="Take the kernel's height and width from kernel.shape. A window fits image height - kernel height + 1 places down."),
    custom("max_pool: leftovers dropped, other block sizes", pool_leftovers,
           hint="feature.shape[0] // size whole blocks fit down; any rows past that are dropped."),
    custom("max_pool: a map that is all negative", negatives,
           hint="Start each block from its own numbers, not from 0: the biggest of four negative numbers is still negative."),
    custom("conv_layer: a map for each kernel", layer,
           hint="Each kernel gets its own bias, added to its whole map, then relu."),
    custom("forward: ten chances through Wendt's filters", forward),
    custom("forward uses the params it's given", other_brain,
           hint="Read the kernels, biases, W and b from params, so any size of brain works."),
    custom("The convolution is done by hand", no_shortcut),
    custom("It reads digits it has never seen", reads, timeout=60),
    custom("The program reads the held-back digits", program, timeout=60),
]
