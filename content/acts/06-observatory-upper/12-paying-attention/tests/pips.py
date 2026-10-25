import numpy as np


def ref_attention(Q, K, V, mask=None):
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    if mask is not None:
        scores = np.where(mask, -np.inf, scores)
    exps = np.exp(scores - scores.max(axis=-1, keepdims=True))
    weights = exps / exps.sum(axis=-1, keepdims=True)
    return weights @ V, weights


def shown(value):
    array = np.round(np.asarray(value, dtype=float), 3)
    return array.tolist() if np.all(np.isfinite(array)) else str(array.tolist())


def call(ctx, Q, K, V, mask=None):
    m = ctx.module()
    got = m.attention(Q, K, V, mask)
    if not isinstance(got, tuple) or len(got) != 2:
        raise CheckFailed("attention should return (output, weights).", actual=repr(got)[:120])
    return np.asarray(got[0], dtype=float), np.asarray(got[1], dtype=float)


def qkv(seed, n=4, size=4):
    rng = np.random.default_rng(seed)
    return rng.normal(size=(n, size)), rng.normal(size=(n, size)), rng.normal(size=(n, size))


def rows_sum(ctx):
    Q, K, V = qkv(1)
    output, weights = call(ctx, Q, K, V)
    if not np.allclose(weights.sum(axis=1), 1):
        raise CheckFailed("Each query shares out its attention over the keys: every row of weights adds up to 1.",
                          expected=[1.0] * 4, actual=shown(weights.sum(axis=1)))


def scaled(ctx):
    Q, K, V = qkv(2)
    output, weights = call(ctx, Q, K, V)
    want_out, want_w = ref_attention(Q, K, V)
    if not np.allclose(weights, want_w):
        raise CheckFailed("The weights, with the scores divided by the square root of the key size, 4.", expected=shown(want_w), actual=shown(weights))
    if not np.allclose(output, want_out):
        raise CheckFailed("The output: the weights times the values.", expected=shown(want_out), actual=shown(output))


def masked(ctx):
    Q, K, V = qkv(5, n=5, size=8)
    mask = np.triu(np.ones((5, 5), dtype=bool), k=1)
    output, weights = call(ctx, Q, K, V, mask)
    want_out, want_w = ref_attention(Q, K, V, mask)
    if not np.allclose(weights, want_w) or not np.allclose(output, want_out):
        raise CheckFailed("Five characters, key size 8, nothing looking ahead.", expected=shown(want_w), actual=shown(weights))


def other_size(ctx):
    Q, K, V = qkv(9, n=3, size=9)
    output, weights = call(ctx, Q, K, V)
    want_out, want_w = ref_attention(Q, K, V)
    if not np.allclose(output, want_out):
        raise CheckFailed("Key size 9: divide by 3.", expected=shown(want_out), actual=shown(output))


TESTS = [
    custom("Every row of weights adds up to 1", rows_sum, visible=True,
           hint="A row is one query. Softmax along the last axis, across the keys."),
    custom("Scores scaled by the square root of the key size", scaled, visible=True,
           hint="Moss divided by np.sqrt(4), which is 2. Pip divides by 4."),
    custom("With the causal mask", masked),
    custom("A key size of 9", other_size),
]
