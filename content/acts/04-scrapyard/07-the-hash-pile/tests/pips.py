COUNTS = {"folders": 12, "labels": 300, "pencils": 40, "staples": 5000, "tape": 6}


def every_count(ctx):
    module = ctx.module()
    stock = module.Stock()
    for name, count in COUNTS.items():
        stock.put(name, count)
    for name, count in COUNTS.items():
        got = stock.get(name)
        if got != count:
            raise CheckFailed(f"After five puts, get(\"{name}\") should give {count}.", expected=count, actual=got)


def a_hundred_names(ctx):
    module = ctx.module()
    stock = module.Stock()
    names = [f"box-{number}" for number in range(100)]
    for number, name in enumerate(names):
        stock.put(name, number)
    lost = [name for number, name in enumerate(names) if stock.get(name) != number]
    if lost:
        raise CheckFailed(f"After a hundred puts, {len(lost)} names can't be found, starting with {lost[0]}.",
                          expected="every name found", actual=f"{len(lost)} lost")


def replaced_after_doubling(ctx):
    module = ctx.module()
    stock = module.Stock()
    for name, count in COUNTS.items():
        stock.put(name, count)
    stock.put("folders", 11)
    if stock.get("folders") != 11:
        raise CheckFailed("Putting folders again should replace its count.", expected=11, actual=stock.get("folders"))
    if stock.count != 5:
        raise CheckFailed("Putting a name that's already there isn't a new name: the count should stay at 5.",
                          expected=5, actual=stock.count)


def missing_name(ctx):
    module = ctx.module()
    stock = module.Stock()
    for name, count in COUNTS.items():
        stock.put(name, count)
    if stock.get("glue") is not None or stock.get("glue", 0) != 0:
        raise CheckFailed("get for a name that isn't there should give the default: None, or whatever default it's given.")


TESTS = [
    custom("All five counts come back", every_count, visible=True,
           hint="After the piles double, a name's pile is its hash's remainder by the new number of piles. Is it still in the pile it was put in?"),
    custom("A hundred names, all found", a_hundred_names, visible=True,
           hint="Every doubling has to move every pair to the pile it belongs in now."),
    custom("A count replaced after the piles double", replaced_after_doubling,
           hint="put looks along the name's pile to replace it. If the pair is still sitting in its old pile, put won't see it and adds a second one."),
    custom("A missing name gives the default", missing_name),
]
