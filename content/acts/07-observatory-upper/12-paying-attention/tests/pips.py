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


def qkv(seed, n=4, size=4):
    rng = np.random.default_rng(seed)
    return rng.normal(size=(n, size)), rng.normal(size=(n, size)), rng.normal(size=(n, size))


def causal(n):
    return np.triu(np.ones((n, n), dtype=bool), k=1)


def passes(ctx, weights, why):
    m = ctx.module()
    try:
        m.check_weights(weights)
    except AssertionError as error:
        raise CheckFailed(why, expected="no AssertionError", actual=f"AssertionError: {error}")


def fails(ctx, weights, why):
    m = ctx.module()
    try:
        m.check_weights(weights)
    except AssertionError:
        return
    raise CheckFailed(why, expected="an AssertionError", actual="check_weights let it through")


def runs_clean(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program stopped: {type(r.error).__name__}: {r.error}. Is the attention wrong, or the test?")
    if "Every check passed." not in r.output:
        raise CheckFailed("The program should end by saying every check passed.", expected="Every check passed.", actual=r.output)


def right_weights_pass(ctx):
    Q, K, V = qkv(1, n=5, size=8)
    weights = ref_attention(Q, K, V, causal(5))[1]
    passes(ctx, weights, "Five characters, nothing looking ahead, every row adding up to 1: the test should pass these.")


def columns_caught(ctx):
    # Every column adds up to 1, but the rows don't: the weights a softmax down the columns would give
    weights = np.array([[1.0, 0.0, 0.0], [0.0, 0.5, 0.0], [0.0, 0.5, 1.0]])
    fails(ctx, weights, "These weights' columns add up to 1, but the second row adds up to 0.5. The test should catch them.")


def looking_ahead_caught(ctx):
    weights = np.array([[0.5, 0.5, 0.0], [0.5, 0.5, 0.0], [0.2, 0.3, 0.5]])
    fails(ctx, weights, "Every row adds up to 1, but the first character looks at the second. The test should catch that.")


def attention_unchanged(ctx):
    m = ctx.module()
    Q, K, V = qkv(9, n=3, size=9)
    got = m.attention(Q, K, V, causal(3))
    if not isinstance(got, tuple) or len(got) != 2:
        raise CheckFailed("attention should return (output, weights).", actual=repr(got)[:120])
    want_out, want_w = ref_attention(Q, K, V, causal(3))
    if not np.allclose(np.asarray(got[1], dtype=float), want_w) or not np.allclose(np.asarray(got[0], dtype=float), want_out):
        raise CheckFailed("Aaesha's attention was right all along. Leave it as it was.", expected=shown(want_w), actual=shown(got[1]))


TESTS = [
    custom("Every check passes", runs_clean, visible=True,
           hint="Read which assert fails, then the two lines above it. Which way does one query's attention run?"),
    custom("The test passes weights that are right", right_weights_pass, visible=True,
           hint="A row is one query. Its weights run along the row, axis=1."),
    custom("The test still catches columns that add up instead of rows", columns_caught,
           hint="Keep the check that each query adds up to 1. Just point it the right way."),
    custom("The test still catches looking ahead", looking_ahead_caught,
           hint="Keep the second assert as it was."),
    custom("The attention itself is unchanged", attention_unchanged),
]
