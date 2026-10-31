import inspect as _inspect
import sys as _sys


def _bands(weight):
    if weight <= 100:
        return 60
    if weight <= 500:
        return 90
    return 150


def _checked(weight, destination):
    if destination not in ("local", "away"):
        raise ValueError("local or away")
    if weight <= 0 or weight > 2000:
        raise ValueError("1 g to 2 kg")


def real(weight, destination):
    _checked(weight, destination)
    price = _bands(weight)
    return price * 2 if destination == "away" else price


def never_doubles(weight, destination):
    _checked(weight, destination)
    return _bands(weight)


def adds_sixty_for_away(weight, destination):
    _checked(weight, destination)
    price = _bands(weight)
    return price + 60 if destination == "away" else price


def boundary_at_100(weight, destination):
    _checked(weight, destination)
    price = 60 if weight < 100 else 90 if weight <= 500 else 150
    return price * 2 if destination == "away" else price


def boundary_at_500(weight, destination):
    _checked(weight, destination)
    price = 60 if weight <= 100 else 90 if weight < 500 else 150
    return price * 2 if destination == "away" else price


def no_upper_limit(weight, destination):
    if destination not in ("local", "away") or weight <= 0:
        raise ValueError("no upper limit")
    price = _bands(weight)
    return price * 2 if destination == "away" else price


def refuses_2000(weight, destination):
    if destination not in ("local", "away") or weight <= 0 or weight >= 2000:
        raise ValueError("2000 refused")
    price = _bands(weight)
    return price * 2 if destination == "away" else price


def weightless_allowed(weight, destination):
    if destination not in ("local", "away") or weight < 0 or weight > 2000:
        raise ValueError("0 allowed")
    price = _bands(weight)
    return price * 2 if destination == "away" else price


def anywhere_is_local(weight, destination):
    if weight <= 0 or weight > 2000:
        raise ValueError("any destination")
    price = _bands(weight)
    return price * 2 if destination == "away" else price


def _tests(ctx):
    mod = ctx.module()
    tests = [(name, value) for name, value in vars(mod).items()
             if name.startswith("test_") and callable(value) and getattr(value, "__module__", None) == mod.__name__]
    for name, test in tests:
        needed = [p for p in _inspect.signature(test).parameters.values() if p.default is _inspect.Parameter.empty]
        if needed:
            raise CheckFailed(f"{name} takes arguments. The checks call each test with none, so no fixtures or parametrize here.")
    return mod, tests


def _outcomes(mod, tests, version):
    """Run every test against one version of postage. Gives back the names of those that failed."""
    module = _sys.modules.get("postage")
    saved_module = getattr(module, "postage", None)
    saved_learner = getattr(mod, "postage", None)
    if module is not None:
        module.postage = version
    if callable(saved_learner) and not _inspect.ismodule(saved_learner):
        mod.postage = version
    failed = []
    try:
        for name, test in tests:
            try:
                test()
            except KeyboardInterrupt:
                raise
            except BaseException:  # pytest.raises signals a missing error with its own exception
                failed.append(name)
    finally:
        if module is not None:
            module.postage = saved_module
        if callable(saved_learner) and not _inspect.ismodule(saved_learner):
            mod.postage = saved_learner
    return failed


def passes_on_real(ctx):
    mod, tests = _tests(ctx)
    if not tests:
        raise CheckFailed("There are no test functions yet. Their names start with test_.")
    failed = _outcomes(mod, tests, real)
    if failed:
        raise CheckFailed("These fail on the real postage, so they test something the docstring doesn't say.",
                          expected="every test passes", actual=", ".join(failed))


def at_least_six(ctx):
    _mod, tests = _tests(ctx)
    if len(tests) < 6:
        raise CheckFailed("Write at least six test functions: the docstring has more than six things to check.",
                          expected="6 or more", actual=len(tests))


def _catches(version, what):
    def check(ctx):
        mod, tests = _tests(ctx)
        if not tests or _outcomes(mod, tests, real):
            raise CheckFailed("First, every test has to pass on the real postage.")
        if not _outcomes(mod, tests, version):
            raise CheckFailed(f"A postage that {what} passes all your tests. Which test would notice?")
    return check


TESTS = [
    custom("Your tests pass on the real postage", passes_on_real, visible=True),
    custom("They catch a postage that never doubles for away", _catches(never_doubles, "never doubles the price for away"), visible=True),
    custom("At least six tests", at_least_six),
    custom("They catch 100 g charged at 90", _catches(boundary_at_100, "charges 90 for exactly 100 g"),
           hint="If only this fails, test exactly 100 g. Bugs live at the edges of bands."),
    custom("They catch 500 g charged at 150", _catches(boundary_at_500, "charges 150 for exactly 500 g"),
           hint="If only this fails, test exactly 500 g."),
    custom("They catch away costing 60 more, not twice", _catches(adds_sixty_for_away, "adds 60 for away instead of doubling"),
           hint="If only this fails: for a light letter, adding 60 and doubling give the same answer. Try a heavier parcel going away."),
    custom("They catch a parcel over 2 kg accepted", _catches(no_upper_limit, "accepts parcels over 2 kg"),
           hint="If only this fails, check that 2001 g is refused with a ValueError."),
    custom("They catch exactly 2 kg refused", _catches(refuses_2000, "refuses exactly 2000 g"),
           hint="If only this fails, check that exactly 2000 g is still accepted."),
    custom("They catch a parcel of 0 g accepted", _catches(weightless_allowed, "accepts a parcel weighing 0 g"),
           hint="If only this fails, check that 0 g is refused."),
    custom("They catch any destination treated as away or local", _catches(anywhere_is_local, "accepts any destination"),
           hint="If only this fails, check a destination that is neither local nor away."),
]
