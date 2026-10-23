def set_up_properly(ctx):
    m = ctx.module()
    e = m.ElectricBike(4, 5, charge=60)
    got = (getattr(e, "number", "missing"), getattr(e, "rate", "missing"), getattr(e, "rider", "missing"), getattr(e, "charge", "missing"))
    if got != (4, 5, None, 60):
        raise CheckFailed("ElectricBike(4, 5, charge=60) should have number 4, rate 5, no rider and charge 60.",
                          expected=(4, 5, None, 60), actual=got)


def never_none(ctx):
    m = ctx.module()
    result = m.Bike(3, 4) == 3
    if result is not False:
        raise CheckFailed("A bike compared with the number 3 should give False.", expected=False, actual=result)


TESTS = [
    output("Gwen's electric bike", expect="True\nTrue\nFalse", visible=True),
    custom("An electric bike with 60% charge", set_up_properly,
           hint="If only this fails, check ElectricBike passes number and rate on to the parent."),
    custom("A bike is not the number 3", never_none,
           hint="A method that reaches its end without a return gives None. Return NotImplemented for things that aren't bikes."),
]
