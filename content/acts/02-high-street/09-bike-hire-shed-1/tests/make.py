def bike(ctx, *args):
    m = ctx.module()
    if not hasattr(m, "Bike"):
        raise CheckFailed("There is no class called Bike.")
    return m.Bike(*args)


def attribute(b, name):
    if not hasattr(b, name):
        raise CheckFailed(f"The bike has no {name} attribute. Set self.{name} in __init__.")
    return getattr(b, name)


def expect_equal(what, got, want):
    if got != want or type(got) is bool and type(want) is not bool:
        raise CheckFailed(what, expected=want, actual=got)


def new_bike(ctx):
    b = bike(ctx, 7, "town", 4)
    for name, want in [("number", 7), ("kind", "town"), ("rate", 4), ("hours", 0)]:
        expect_equal(f"A new bike's {name} should be {want!r}.", attribute(b, name), want)
    if attribute(b, "rider") is not None:
        raise CheckFailed("A new bike's rider should be None.", expected=None, actual=b.rider)


def bea_hires(ctx):
    b = bike(ctx, 7, "town", 4)
    result = b.hire("Bea")
    if result is not True:
        raise CheckFailed("hire should return True when the bike was free.", expected=True, actual=result)
    expect_equal("After hire(\"Bea\"), the rider should be Bea.", b.rider, "Bea")
    cost = b.give_back(3)
    expect_equal("Three hours at 4 an hour costs 12.", cost, 12)
    if b.rider is not None:
        raise CheckFailed("After give_back, the rider should be None again.", expected=None, actual=b.rider)
    expect_equal("After three hours, the bike's hours should be 3.", b.hours, 3)


def describes(ctx):
    b = bike(ctx, 21, "mountain", 6.5)
    expect_equal("describe() for a free bike", b.describe(), "Bike 21, mountain, £6.50 an hour, free")
    b.hire("Old Tom")
    expect_equal("describe() for a bike that is out", b.describe(), "Bike 21, mountain, £6.50 an hour, out with Old Tom")


def already_out(ctx):
    b = bike(ctx, 4, "town", 5)
    b.hire("Gwen")
    result = b.hire("Pip")
    if result is not False:
        raise CheckFailed("Hiring a bike that is already out should return False.", expected=False, actual=result)
    expect_equal("The bike should still be with Gwen.", b.rider, "Gwen")


def hours_add_up(ctx):
    b = bike(ctx, 9, "town", 3)
    b.hire("Mira")
    first = b.give_back(2)
    b.hire("Mira")
    second = b.give_back(4)
    expect_equal("Two hours at 3 an hour", first, 6)
    expect_equal("Four hours at 3 an hour", second, 12)
    expect_equal("Two rides of 2 and 4 hours make 6 hours in total.", b.hours, 6)


def two_bikes(ctx):
    m = ctx.module()
    red = m.Bike(1, "town", 4)
    blue = m.Bike(2, "mountain", 6)
    red.hire("Agnes")
    if blue.rider is not None:
        raise CheckFailed("Hiring one bike changed the other one's rider.", expected=None, actual=blue.rider)
    red.give_back(5)
    expect_equal("The other bike's hours should still be 0.", blue.hours, 0)


def half_hour(ctx):
    b = bike(ctx, 12, "town", 5.5)
    b.hire("Sanjay")
    cost = b.give_back(0.5)
    if abs(cost - 2.75) > 1e-9:
        raise CheckFailed("Half an hour at 5.50 an hour is 2.75.", expected=2.75, actual=cost)


TESTS = [
    custom("A new bike", new_bike, visible=True),
    custom("Bea hires bike 7 for three hours", bea_hires, visible=True),
    custom("describe(), free and out", describes,
           hint="If only this fails, compare your line with the brief, character by character. The rate has two decimal places."),
    custom("A bike that is out can't be hired again", already_out,
           hint="Check the rider before you change anything, and return False without touching the bike."),
    custom("Hours add up", hours_add_up,
           hint="give_back adds to self.hours; it doesn't replace it."),
    custom("Two bikes keep their own riders", two_bikes,
           hint="If only this fails, make sure every attribute is set on self inside __init__."),
    custom("Half an hour on a £5.50 bike", half_hour,
           hint="give_back should work for part of an hour too: hours times the rate, nothing rounded."),
]
