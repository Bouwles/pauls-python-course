import re as _re

import numpy as _np

NEEDED = ("load_stars", "centre", "covariance", "principal_components", "explained_ratio",
          "components_needed", "project", "rebuild")
TABLE = [(1, 0.854, 0.854), (2, 0.145, 0.999), (3, 0.001, 0.999), (4, 0.000, 0.999)]
_RUN = {}


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"filters.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _pair(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. It should return two things.")
    try:
        first, second = value
    except (TypeError, ValueError):
        raise CheckFailed(f"{what} should return two things.", actual=repr(value)[:200])
    return _np.asarray(first, dtype=float), _np.asarray(second, dtype=float)


def _correlated(seed=6, n=80):
    rng = _np.random.default_rng(seed)
    mixing = _np.array([[3.0, 0.0, 0.0, 0.0], [1.0, 1.5, 0.0, 0.0], [0.5, -0.5, 0.8, 0.0], [0.2, 0.3, 0.1, 0.3]])
    return rng.normal(size=(n, 4)) @ mixing.T + _np.array([10.0, -4.0, 2.0, 50.0])


def centre_small(ctx):
    mod = _module(ctx, "centre")
    X = _np.array([[1.0, 10.0], [3.0, 20.0], [5.0, 60.0]])
    centred, means = _pair(mod.centre(X), "centre")
    if not _np.allclose(means, [3.0, 30.0]):
        raise CheckFailed("The column means are 3 and 30.", expected=[3.0, 30.0], actual=means.tolist())
    if centred.shape != (3, 2) or not _np.allclose(centred, [[-2.0, -20.0], [0.0, -10.0], [2.0, 30.0]]):
        raise CheckFailed("Take each column's mean off that column.", expected=[[-2.0, -20.0], [0.0, -10.0], [2.0, 30.0]],
                          actual=_np.round(centred, 3).tolist())


def covariance_matches(ctx):
    mod = _module(ctx, "centre", "covariance")
    X = _correlated()
    centred = X - X.mean(axis=0)
    got = mod.covariance(centred)
    if got is None:
        raise CheckFailed("covariance gave back None.")
    got = _np.asarray(got, dtype=float)
    want = _np.cov(X, rowvar=False)
    if got.shape != (4, 4) or not _np.allclose(got, want):
        raise CheckFailed("Four readings make a 4 by 4 covariance, and it should match np.cov(X, rowvar=False). Divide by n - 1.",
                          expected=_np.round(want, 3).tolist(), actual=_np.round(got, 3).tolist())


def components_ok(ctx):
    mod = _module(ctx, "centre", "covariance", "principal_components")
    X = _correlated()
    variances, components = _pair(mod.principal_components(X), "principal_components")
    cov = _np.cov(X, rowvar=False)
    want = _np.sort(_np.linalg.eigvalsh(cov))[::-1]
    if variances.shape != (4,) or not _np.allclose(variances, want):
        raise CheckFailed("The variances are the eigenvalues of the covariance, biggest first.",
                          expected=_np.round(want, 4).tolist(), actual=_np.round(variances, 4).tolist())
    if components.shape != (4, 4):
        raise CheckFailed("Four readings, so four components of four numbers each, as the columns of a 4 by 4 array.",
                          expected=(4, 4), actual=components.shape)
    for j in range(4):
        v = components[:, j]
        if not _np.allclose(cov @ v, variances[j] * v, atol=1e-8):
            raise CheckFailed(f"Column {j} of components isn't the eigenvector for variance {variances[j]:.3f}. "
                              "Are the eigenvectors in the columns, reordered along with the variances?")


def known_direction(ctx):
    mod = _module(ctx, "centre", "covariance", "principal_components")
    rng = _np.random.default_rng(2)
    along = rng.normal(0, 5, 60)
    across = rng.normal(0, 0.5, 60)
    X = _np.column_stack([0.6 * along - 0.8 * across, 0.8 * along + 0.6 * across]) + _np.array([100.0, 200.0])
    variances, components = _pair(mod.principal_components(X), "principal_components")
    first = components[:, 0]
    if abs(abs(float(first @ _np.array([0.6, 0.8]))) - 1) > 1e-3:
        raise CheckFailed("The readings spread mostly along (0.6, 0.8), so that, or its opposite, should be the first component.",
                          expected="(0.6, 0.8) or (-0.6, -0.8)", actual=_np.round(first, 3).tolist())


def ratios(ctx):
    mod = _module(ctx, "explained_ratio")
    got = mod.explained_ratio(_np.array([6.0, 3.0, 1.0]))
    if got is None or not _np.allclose(_np.asarray(got, dtype=float), [0.6, 0.3, 0.1]):
        raise CheckFailed("Each variance as a share of the total, 10.", expected=[0.6, 0.3, 0.1], actual=got)


def needed(ctx):
    mod = _module(ctx, "components_needed")
    cases = [(_np.array([0.5, 0.25, 0.25]), 0.75, 2), (_np.array([0.9, 0.06, 0.04]), 0.95, 2),
             (_np.array([0.9, 0.06, 0.04]), 0.5, 1), (_np.array([0.4, 0.3, 0.2, 0.1]), 0.99, 4)]
    for shares, share, want in cases:
        got = mod.components_needed(shares, share)
        if got != want:
            raise CheckFailed(f"With ratios {shares.tolist()}, the fewest components adding up to at least {share} is {want}.",
                              expected=want, actual=got)


def squash_and_rebuild(ctx):
    mod = _module(ctx, "centre", "covariance", "principal_components", "project", "rebuild")
    X = _correlated(seed=9, n=50)
    means = X.mean(axis=0)
    variances, components = _pair(mod.principal_components(X), "principal_components")
    Z = mod.project(X, means, components, 2)
    if Z is None or _np.asarray(Z).shape != (50, 2):
        raise CheckFailed("Fifty rows squashed onto two components: shape (50, 2).", expected=(50, 2), actual=None if Z is None else _np.asarray(Z).shape)
    want = (X - means) @ components[:, :2]
    if not _np.allclose(Z, want):
        raise CheckFailed("Take the means off, then multiply by the first k columns of components.")
    whole = mod.rebuild(mod.project(X, means, components, 4), means, components)
    if whole is None or not _np.allclose(whole, X):
        raise CheckFailed("Squashed onto every component, then rebuilt, the readings should come back exactly.")
    part = _np.asarray(mod.rebuild(Z, means, components), dtype=float)
    lost = _np.mean((part - X) ** 2)
    expected_loss = _np.sum(variances[2:]) * (len(X) - 1) / len(X) / X.shape[1]
    if part.shape != X.shape or abs(lost - expected_loss) > 1e-6:
        raise CheckFailed("Rebuilt from two components, the readings should keep every column, and lose only what the other two components held.",
                          expected=round(float(expected_loss), 5), actual=round(float(lost), 5))


def _output(ctx):
    if "result" not in _RUN:
        _RUN["result"] = ctx.run_program()
    result = _RUN["result"]
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    return result.output


def table(ctx):
    output = _output(ctx)
    rows = {int(m.group(1)): (float(m.group(2)), float(m.group(3)))
            for m in _re.finditer(r"^\s*(\d+)\s+(\d\.\d+)\s+(\d\.\d+)\s*$", output, _re.M)}
    for k, share, total in TABLE:
        if k not in rows:
            raise CheckFailed(f"There's no row for component {k}: its number, its share, then the running total.",
                              expected=f"{k:5}  {share:11.3f}  {total:7.3f}", actual=output)
        if abs(rows[k][0] - share) > 0.0015 or abs(rows[k][1] - total) > 0.0015:
            raise CheckFailed(f"Component {k}'s share is off. Is it the variance of the centred readings?",
                              expected=f"{k:5}  {share:11.3f}  {total:7.3f}", actual=f"{k:5}  {rows[k][0]:11.3f}  {rows[k][1]:7.3f}")


def _line(ctx, start, want, why):
    output = _output(ctx)
    lines = [line.strip() for line in output.splitlines() if line.strip().startswith(start)]
    if not lines:
        raise CheckFailed(f"There's no line starting {start!r}.", expected=want, actual=output)
    if lines[-1] != want:
        raise CheckFailed(why, expected=want, actual=lines[-1])


def for_99(ctx):
    _line(ctx, "Components for 99%:", "Components for 99%: 2", "Two components already hold more than 99% of the variance.")


def squashed(ctx):
    _line(ctx, "Squashed:", "Squashed: (200, 12) to (200, 2)", "Print the shape before and after squashing onto two components.")


def rebuilt(ctx):
    _line(ctx, "Rebuilt from 2", "Rebuilt from 2, mean squared error: 0.0021",
          "Rebuild the stars from their two numbers, and give the mean squared difference from the real readings, to four places.")


def svd(ctx):
    _line(ctx, "The SVD agrees:", "The SVD agrees: True",
          "The squared singular values of the centred readings, divided by n - 1, should equal your variances.")


TESTS = [
    custom("centre takes each column's mean off", centre_small, visible=True),
    custom("covariance matches np.cov", covariance_matches, visible=True,
           hint="If only this fails, divide by the number of rows minus one."),
    custom("principal_components gives eigenvalues biggest first, with their eigenvectors", components_ok,
           hint="If only this fails, remember np.linalg.eigh gives the smallest first, and its eigenvectors are columns: reorder both together."),
    custom("The first component follows the spread", known_direction,
           hint="If only this fails, centre the readings before working out the covariance."),
    custom("explained_ratio gives each share of the total", ratios),
    custom("components_needed counts up to the share", needed,
           hint="If only this fails, a running total exactly equal to the share is enough."),
    custom("project squashes, and rebuild puts it back", squash_and_rebuild),
    structure("Written from scratch", forbids_calls=["PCA"],
              message="Do it with the covariance and np.linalg.eigh. scikit-learn's PCA would do it for you, which isn't the point yet."),
    custom("Prints each component's share", table),
    custom("Two components keep 99%", for_99),
    custom("Squashes twelve readings to two", squashed),
    custom("Measures what squashing lost", rebuilt),
    custom("Agrees with the SVD", svd),
]
