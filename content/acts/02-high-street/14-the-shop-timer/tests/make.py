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


def sanjays_functions(ctx):
    mod = fresh(ctx, 0.0, 0.5, 1.0, 1.25, 2.0, 2.1)
    mod.look_up_price("figs")
    mod.weigh(2, 0.90)
    mod.label("figs", 1.6)
    names = [name for name, seconds in mod.log]
    if names != ["look_up_price", "weigh", "label"]:
        raise CheckFailed("Each of Sanjay's three functions should be logged when it's called.", expected="['look_up_price', 'weigh', 'label']", actual=repr(names))


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
    custom("Sanjay's three functions are timed", sanjays_functions,
           hint="Put @timed on the line above each of Sanjay's three functions."),
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
    structure("Sorted with a key", check=sorts_with_key,
              hint="sorted(entries, key=lambda entry: entry[1], reverse=True)."),
]
