import copy as _copy


def stock(ctx):
    ctx.module()
    import importlib
    return importlib.import_module("stock")


ORIGINAL = {
    "bread": {"baked": 40, "sold": 0},
    "buns": {"baked": 60, "sold": 0},
    "lardy cake": {"baked": 12, "sold": 0},
}


def friday_stays(ctx):
    s = stock(ctx)
    friday = s.new_day()
    s.sell(friday, "bread", 30)
    sunday = s.new_day()
    if s.left(sunday, "bread") != 40:
        raise CheckFailed("A new day should start with all 40 loaves, whatever happened the day before.",
                          expected=40, actual=s.left(sunday, "bread"))


def standard_unchanged(ctx):
    s = stock(ctx)
    day = s.new_day()
    s.sell(day, "lardy cake", 4)
    s.bake_more(day, "bread", 10)
    if s.STANDARD_BAKE != ORIGINAL:
        raise CheckFailed("Selling and baking on a day's sheet changed STANDARD_BAKE.",
                          expected=ORIGINAL, actual=_copy.deepcopy(s.STANDARD_BAKE))


def nothing_shared(ctx):
    s = stock(ctx)
    monday = s.new_day()
    tuesday = s.new_day()
    for item in ORIGINAL:
        if monday[item] is tuesday[item] or monday[item] is s.STANDARD_BAKE[item]:
            raise CheckFailed(f"Two days share the same counts dictionary for {item}. Each day needs its own.")


TESTS = [
    output("Saturday's sheet", expect="bread: 35 left of 40\nbuns: 60 left of 60\nlardy cake: 12 left of 12", visible=True),
    custom("Friday's sales stay on Friday", friday_stays, visible=True),
    custom("The standard bake never changes", standard_unchanged,
           hint="If only this fails, a day's sheet still shares something with STANDARD_BAKE."),
    custom("Two days share nothing", nothing_shared,
           hint="If only this fails, check the copy goes all the way down to the inner dictionaries."),
]
