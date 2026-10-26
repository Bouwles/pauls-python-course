import numpy as np


def load(ctx):
    m = ctx.module()
    if not callable(getattr(m, "train_with_patience", None)):
        raise CheckFailed("There is no function called train_with_patience.")
    return m


def run(ctx, m, X, T, X_val, T_val, hidden, rate, epochs, patience, seed=0):
    params = m.init_params(X.shape[1], hidden, seed)
    result = m.train_with_patience(X, T, X_val, T_val, params, rate, epochs, patience)
    if not isinstance(result, tuple) or len(result) != 3:
        raise CheckFailed("train_with_patience should return (train_losses, val_losses, best).", actual=repr(result)[:200])
    train_losses, val_losses, best = result
    return params, list(train_losses), list(val_losses), int(best)


def stops_on_time(m, val_losses, best, patience, epochs):
    lowest = int(np.argmin(val_losses))
    if best != lowest:
        raise CheckFailed("best should be the epoch with the lowest validation loss.", expected=lowest, actual=best)
    want = min(best + patience + 1, epochs)
    if len(val_losses) != want:
        raise CheckFailed(f"With the best at epoch {best} and patience {patience}, training should run {want} epochs.",
                          expected=want, actual=len(val_losses))


def hands_back_best(m, params, X_val, T_val, val_losses, best):
    got = m.mse(m.forward(X_val, params)[0], T_val)
    if abs(got - val_losses[best]) > 1e-9:
        raise CheckFailed("The weights handed back should score exactly the best validation loss.",
                          expected=str(round(val_losses[best], 6)), actual=str(round(got, 6)))


def seeing_stops(ctx):
    m = load(ctx)
    X, T, X_val, T_val = m.load_nights()
    params, train_losses, val_losses, best = run(ctx, m, X, T, X_val, T_val, 64, 0.1, 3000, 100)
    stops_on_time(m, val_losses, best, 100, 3000)


def seeing_best(ctx):
    m = load(ctx)
    X, T, X_val, T_val = m.load_nights()
    params, train_losses, val_losses, best = run(ctx, m, X, T, X_val, T_val, 64, 0.1, 3000, 100)
    hands_back_best(m, params, X_val, T_val, val_losses, best)


def small_problem(seed):
    rng = np.random.default_rng(seed)
    X = rng.uniform(0, 1, (8, 3))
    T = rng.normal(1, 0.5, (8, 1))
    X_val = rng.uniform(0, 1, (8, 3))
    T_val = rng.normal(1, 0.5, (8, 1))
    return X, T, X_val, T_val


def other_nights(ctx):
    m = load(ctx)
    X, T, X_val, T_val = small_problem(4)
    params, train_losses, val_losses, best = run(ctx, m, X, T, X_val, T_val, 20, 0.2, 2000, 7, seed=3)
    stops_on_time(m, val_losses, best, 7, 2000)
    hands_back_best(m, params, X_val, T_val, val_losses, best)


def never_runs_out(ctx):
    m = load(ctx)
    X, T, X_val, T_val = m.load_nights()
    params, train_losses, val_losses, best = run(ctx, m, X, T, X_val, T_val, 64, 0.01, 40, 100)
    if len(val_losses) != 40 or best != 39:
        raise CheckFailed("With a tiny rate the validation loss improves every epoch, so all 40 run and the last is the best.",
                          expected="40 epochs, best 39", actual=f"{len(val_losses)} epochs, best {best}")
    hands_back_best(m, params, X_val, T_val, val_losses, best)


TESTS = [
    custom("Stops 100 epochs after the best validation loss", seeing_stops, visible=True,
           hint="Patience runs out when the validation loss hasn't improved. The training loss improves for ever."),
    custom("Hands back the weights from the best epoch", seeing_best, visible=True,
           hint="params.copy() is a new dict holding the same arrays, and -= changes those arrays in place. Copy each array."),
    custom("Another network, patience 7", other_nights),
    custom("Patience that never runs out", never_runs_out),
]
