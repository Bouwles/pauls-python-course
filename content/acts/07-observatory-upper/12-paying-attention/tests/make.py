import numpy as np


def ref_softmax(scores):
    exps = np.exp(scores - scores.max(axis=-1, keepdims=True))
    return exps / exps.sum(axis=-1, keepdims=True)


def ref_attention(Q, K, V, mask=None):
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    if mask is not None:
        scores = np.where(mask, -np.inf, scores)
    weights = ref_softmax(scores)
    return weights @ V, weights


def shown(value):
    array = np.round(np.asarray(value, dtype=float), 3)
    return array.tolist() if np.all(np.isfinite(array)) else str(array.tolist())


def load(ctx):
    m = ctx.module()
    for name in ("softmax", "causal_mask", "attention", "self_attention"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def pair(what, got):
    if not isinstance(got, tuple) or len(got) != 2:
        raise CheckFailed(f"{what} should return (output, weights).", actual=repr(got)[:120])
    return np.asarray(got[0], dtype=float), np.asarray(got[1], dtype=float)


def close(what, got, want, tol=1e-9):
    got = np.asarray(got, dtype=float)
    if got.shape != np.shape(want):
        raise CheckFailed(f"{what}: the shape.", expected=str(np.shape(want)), actual=str(got.shape))
    if not np.allclose(got, want, atol=tol):
        raise CheckFailed(what, expected=shown(want), actual=shown(got))


def three(seed, n, size):
    rng = np.random.default_rng(seed)
    return rng.normal(size=(n, size)), rng.normal(size=(n, size)), rng.normal(size=(n, size))


def by_hand(ctx):
    m = load(ctx)
    Q = np.array([[1.0, 0.0, 2.0, 1.0]])
    K = np.array([[1.0, 0.0, 1.0, 0.0], [0.0, 1.0, 0.0, 1.0], [2.0, 0.0, 2.0, 2.0]])
    V = np.array([[10.0, 0.0], [0.0, 10.0], [5.0, 5.0]])
    output, weights = pair("attention", m.attention(Q, K, V))
    want_out, want_w = ref_attention(Q, K, V)
    close("One query, three keys: the weights", weights, want_w)
    close("One query, three keys: the output", output, want_out)


def mask_shape(ctx):
    m = load(ctx)
    got = m.causal_mask(4)
    want = np.triu(np.ones((4, 4), dtype=bool), k=1)
    if got is None or np.shape(got) != (4, 4) or not np.array_equal(np.asarray(got, dtype=bool), want):
        raise CheckFailed("causal_mask(4): True above the diagonal, where a query would look ahead.",
                          expected=want.astype(int).tolist(), actual=None if got is None else np.asarray(got).astype(int).tolist())


def softmax_rows(ctx):
    m = load(ctx)
    scores = np.array([[1.0, 2.0, 3.0], [500.0, 500.0, -np.inf], [0.0, -np.inf, -np.inf]])
    close("softmax along each row, with very large scores and minus infinities", m.softmax(scores.copy()), ref_softmax(scores))


def masked_weights(ctx):
    m = load(ctx)
    Q, K, V = three(3, 5, 4)
    mask = np.triu(np.ones((5, 5), dtype=bool), k=1)
    output, weights = pair("attention", m.attention(Q, K, V, mask))
    want_out, want_w = ref_attention(Q, K, V, mask)
    if np.any(np.abs(weights[mask]) > 1e-12):
        raise CheckFailed("With the mask, no query gives any weight to a later key.", actual=shown(weights))
    close("Five characters, masked: the weights", weights, want_w)
    close("Five characters, masked: the output", output, want_out)


def unmasked(ctx):
    m = load(ctx)
    Q, K, V = three(4, 6, 8)
    output, weights = pair("attention", m.attention(Q, K, V))
    want_out, want_w = ref_attention(Q, K, V)
    close("Six characters, key size 8, no mask", output, want_out)


def different_value_size(ctx):
    m = load(ctx)
    rng = np.random.default_rng(6)
    Q, K, V = rng.normal(size=(3, 4)), rng.normal(size=(5, 4)), rng.normal(size=(5, 7))
    output, weights = pair("attention", m.attention(Q, K, V))
    want_out, want_w = ref_attention(Q, K, V)
    close("Three queries, five keys, values of size 7: the weights are (3, 5)", weights, want_w)
    close("And the output is (3, 7)", output, want_out)


def self_attn(ctx):
    m = load(ctx)
    rng = np.random.default_rng(8)
    X = rng.normal(size=(6, 5))
    Wq, Wk, Wv = rng.normal(size=(5, 3)), rng.normal(size=(5, 3)), rng.normal(size=(5, 4))
    mask = np.triu(np.ones((6, 6), dtype=bool), k=1)
    output, weights = pair("self_attention", m.self_attention(X, Wq, Wk, Wv))
    want_out, want_w = ref_attention(X @ Wq, X @ Wk, X @ Wv, mask)
    close("Self-attention on six characters, causal by default", output, want_out)
    output, weights = pair("self_attention", m.self_attention(X, Wq, Wk, Wv, causal=False))
    want_out, want_w = ref_attention(X @ Wq, X @ Wk, X @ Wv)
    close("Self-attention with causal=False looks both ways", output, want_out)


def no_peeking(ctx):
    m = load(ctx)
    rng = np.random.default_rng(10)
    X = rng.normal(size=(7, 4))
    Wq, Wk, Wv = rng.normal(size=(3, 4, 4))
    first, _ = pair("self_attention", m.self_attention(X, Wq, Wk, Wv))
    changed = X.copy()
    changed[-1] = rng.normal(size=4) * 5
    second, _ = pair("self_attention", m.self_attention(changed, Wq, Wk, Wv))
    if not np.allclose(first[:-1], second[:-1]):
        raise CheckFailed("Changing the last character should change only the last row of output: nothing earlier may look ahead.")


TESTS = [
    custom("One query against three keys", by_hand, visible=True),
    custom("The causal mask", mask_shape, visible=True),
    custom("Softmax along each row", softmax_rows,
           hint="Subtract each row's largest score, with axis=-1 and keepdims=True, before np.exp."),
    custom("Masked attention looks only back", masked_weights,
           hint="Set the masked scores to -np.inf before softmax, so their weights come out as exactly 0. A score of 0 still gets a weight."),
    custom("Unmasked attention", unmasked),
    custom("Keys and values of other sizes", different_value_size),
    custom("Self-attention makes its own queries, keys and values", self_attn),
    custom("Nothing earlier changes when a later character does", no_peeking),
]
