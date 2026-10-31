import ast as _ast

ENTRIES = [("weigh", 0.2), ("label", 0.05), ("restock", 1.5), ("weigh", 0.4)]


def ticking(*readings):
    """A clock that gives these readings, in order."""
    remaining = list(readings)

    def clock():
        if not remaining:
            raise CheckFailed("clock() was read more often than expected. Read it once before the call and once after.")
        return remaining.pop(0)
    return clock


def restock(crates, per_crate=12):
    return crates * per_crate


def fresh(ctx, *readings):
    mod = ctx.module()
    if not callable(getattr(mod, "timed", None)):
        raise CheckFailed("There's no decorator called timed yet.")
    mod.clock = ticking(*readings)
    mod.log.clear()
    return mod


def need(ctx, *names):
    mod = ctx.module()
    for name in names:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"There's no function called {name} yet.")
    return mod


def close(a, b):
    return abs(a - b) < 1e-9


def one_call(ctx):
    mod = fresh(ctx, 10.0, 10.5)
    mod.timed(restock)(3)
    if len(mod.log) != 1 or mod.log[0][0] != "restock" or not close(mod.log[0][1], 0.5):
        raise CheckFailed("One call should log one entry: the function's name and how long it took.", expected="[('restock', 0.5)]", actual=repr(mod.log))


def slowest_first(ctx):
    mod = need(ctx, "slowest")
    got = mod.slowest(list(ENTRIES), 2)
    if got != ["restock", "weigh"]:
        raise CheckFailed("slowest(entries, 2) should give the names of the two slowest calls.", expected="['restock', 'weigh']", actual=repr(got))


def gives_answer(ctx):
    mod = fresh(ctx, 0.0, 1.0)
    got = mod.timed(restock)(3)
    if got != 36:
        raise CheckFailed("The timed function should still hand back its own answer.", expected="36", actual=repr(got))


def passes_arguments(ctx):
    mod = fresh(ctx, 0.0, 1.0)
    got = mod.timed(restock)(2, per_crate=6)
    if got != 12:
        raise CheckFailed("restock(2, per_crate=6) should be 12 with or without the decorator.", expected="12", actual=repr(got))


def three_in_order(ctx):
    mod = fresh(ctx, 0.0, 0.25, 1.0, 3.0, 3.0, 3.5)
    timed_restock = mod.timed(restock)
    for crates in (1, 2, 3):
        timed_restock(crates)
    names = [name for name, seconds in mod.log]
    times = [seconds for name, seconds in mod.log]
    want = [0.25, 2.0, 0.5]
    if names != ["restock"] * 3 or len(times) != 3 or not all(close(a, b) for a, b in zip(times, want)):
        raise CheckFailed("Three calls, three entries, in the order they happened.", expected="[('restock', 0.25), ('restock', 2.0), ('restock', 0.5)]", actual=repr(mod.log))


def keeps_name(ctx):
    mod = fresh(ctx)
    got = mod.timed(restock).__name__
    if got != "restock":
        raise CheckFailed("After decorating, the function should still be called restock.", expected="restock", actual=got)


def tills_functions(ctx):
    mod = fresh(ctx, 0.0, 0.5, 1.0, 1.25, 2.0, 2.1)
    mod.look_up_price("figs")
    mod.weigh(2, 0.90)
    mod.label("figs", 1.6)
    names = [name for name, seconds in mod.log]
    if names != ["look_up_price", "weigh", "label"]:
        raise CheckFailed("Each of the till's three functions should be logged when it's called.", expected="['look_up_price', 'weigh', 'label']", actual=repr(names))


def more_than_there_are(ctx):
    mod = need(ctx, "slowest")
    got = mod.slowest(list(ENTRIES), 10)
    want = ["restock", "weigh", "weigh", "label"]
    if got != want:
        raise CheckFailed("Asked for more than there are, slowest gives all of them, slowest first.", expected=repr(want), actual=repr(got))


def empty_log(ctx):
    mod = need(ctx, "slowest", "slow_calls")
    if mod.slowest([], 3) != [] or mod.slow_calls([], 0.1) != []:
        raise CheckFailed("An empty log has no slow calls.", expected="[] and []", actual=f"{mod.slowest([], 3)!r} and {mod.slow_calls([], 0.1)!r}")


def leaves_log_alone(ctx):
    mod = need(ctx, "slowest")
    entries = list(ENTRIES)
    mod.slowest(entries, 2)
    if entries != ENTRIES:
        raise CheckFailed("slowest changed the order of the log it was given.", expected=repr(ENTRIES), actual=repr(entries))


def over_the_limit(ctx):
    mod = need(ctx, "slow_calls")
    got = mod.slow_calls(list(ENTRIES), 0.3)
    want = [("restock", 1.5), ("weigh", 0.4)]
    if got != want:
        raise CheckFailed("slow_calls should give a list of the entries over the limit, in log order.", expected=repr(want), actual=repr(got))


def on_the_limit(ctx):
    mod = need(ctx, "slow_calls")
    got = mod.slow_calls([("weigh", 0.3), ("label", 0.31)], 0.3)
    if got != [("label", 0.31)]:
        raise CheckFailed("A call that took exactly the limit isn't longer than it.", expected="[('label', 0.31)]", actual=repr(got))


class Flaky:
    """Fails with ConnectionError a given number of times, then works. Counts its calls."""

    def __init__(self, failures, error=ConnectionError):
        self.failures = failures
        self.error = error
        self.calls = 0
        self.__name__ = "take_card"

    def __call__(self, amount, note=""):
        self.calls += 1
        if self.calls <= self.failures:
            raise self.error("The card reader isn't answering.")
        return f"Paid £{amount:.2f} by card{note}"


def retried(ctx, failures, error=ConnectionError):
    mod = ctx.module()
    if not callable(getattr(mod, "retry", None)):
        raise CheckFailed("There's no decorator called retry yet.")
    flaky = Flaky(failures, error)
    return mod, flaky, mod.retry(flaky)


def works_first_time(ctx):
    mod, flaky, card = retried(ctx, 0)
    got = card(6.55)
    if got != "Paid £6.55 by card" or flaky.calls != 1:
        raise CheckFailed("When the reader answers first time, it's called once and its answer comes back.", expected="1 call", actual=f"{flaky.calls} calls, {got!r}")


def works_third_time(ctx):
    mod, flaky, card = retried(ctx, 2)
    got = card(4.0, note=" (third go)")
    if got != "Paid £4.00 by card (third go)" or flaky.calls != 3:
        raise CheckFailed("Two failures, then it answers: three calls, and the answer comes back.", expected="3 calls", actual=f"{flaky.calls} calls, {got!r}")


def gives_up(ctx):
    mod, flaky, card = retried(ctx, 5)
    try:
        card(1.0)
    except ConnectionError:
        if flaky.calls != 3:
            raise CheckFailed("It should try three times in all, then let the error out.", expected="3 calls", actual=f"{flaky.calls} calls")
        return
    raise CheckFailed("After three failures, the ConnectionError should come out for the till to deal with.", expected="ConnectionError", actual="no error")


def other_errors(ctx):
    mod, flaky, card = retried(ctx, 1, error=ValueError)
    try:
        card(1.0)
    except ValueError:
        if flaky.calls != 1:
            raise CheckFailed("Only a ConnectionError is worth another go. A ValueError should come straight out.", expected="1 call", actual=f"{flaky.calls} calls")
        return
    raise CheckFailed("A ValueError isn't the reader being slow. Let it straight out.", expected="ValueError", actual="no error")


def retry_keeps_name(ctx):
    mod, flaky, card = retried(ctx, 0)
    if getattr(card, "__name__", None) != "take_card":
        raise CheckFailed("After decorating, the function should keep its own name.", expected="take_card", actual=getattr(card, "__name__", None))


def sorts_with_key(tree, source):
    for node in _ast.walk(tree):
        if isinstance(node, _ast.Call) and any(k.arg == "key" for k in node.keywords):
            return None
    return "Let sorted() do the sorting, with key= saying what to sort by."


TESTS = [
    custom("One call, one entry: name and time", one_call, visible=True,
           hint="Read the time with clock(), not time.perf_counter(), or the checks can't swap the clock."),
    custom("slowest names the slowest calls first", slowest_first, visible=True),
    custom("The decorated function still gives back its answer", gives_answer,
           hint="The wrapper has to return what the real function returned."),
    custom("Arguments get through, keyword ones too", passes_arguments,
           hint="def wrapper(*args, **kwargs), then func(*args, **kwargs), passes everything through."),
    custom("Three calls, logged in order", three_in_order,
           hint="Append one entry per call, after the call, with end minus start."),
    custom("A decorated function keeps its own name", keeps_name,
           hint="Put @functools.wraps(func) on the line above def wrapper."),
    custom("The till's three functions are timed", tills_functions,
           hint="Put @timed on the line above each of the till's three functions."),
    custom("slowest when asked for more than there are", more_than_there_are,
           hint="A slice past the end is fine: by_time[:10] on four entries gives all four."),
    custom("An empty log", empty_log,
           hint="With no entries, both helpers should give an empty list, not crash."),
    custom("slowest leaves the log as it was", leaves_log_alone,
           hint="list.sort() reorders the caller's list. sorted() makes a new one."),
    custom("slow_calls keeps the slow ones, in order", over_the_limit,
           hint="filter() hands back a lazy filter object. Wrap it in list()."),
    custom("Exactly on the limit isn't over it", on_the_limit,
           hint="Longer than the limit means >, not >=."),
    custom("retry: the reader answers first time", works_first_time),
    custom("retry: the reader answers on the third go", works_third_time,
           hint="Loop over the tries. return as soon as the call works; catch ConnectionError and go round again."),
    custom("retry: three goes, then give up", gives_up,
           hint="On the last try, don't swallow the error: a bare raise inside except sends it on."),
    custom("retry: other errors come straight out", other_errors,
           hint="Catch ConnectionError only. Anything else isn't a slow reader, and a second go won't help."),
    custom("retry keeps the function's name", retry_keeps_name, hint="@functools.wraps(func) again."),
    structure("Sorted with a key", check=sorts_with_key,
              hint="sorted(entries, key=lambda entry: entry[1], reverse=True)."),
]
