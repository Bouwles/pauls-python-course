def mountain_bike(ctx):
    m = ctx.module()
    bike = m.Bike(3, "mountain", 6)
    bike.hire("Tom")
    if bike.rider != "Tom":
        raise CheckFailed("After hire(\"Tom\"), the bike's rider should be Tom.", expected="Tom", actual=bike.rider)
    if bike.cost(2) != 12:
        raise CheckFailed("Two hours at 6 an hour is 12.", expected=12, actual=bike.cost(2))


TESTS = [
    output("Bea on bike 7", expect="Bea 12", visible=True),
    custom("Tom on a mountain bike", mountain_bike,
           hint="If only this fails, check that every value the bike needs later is stored on self."),
]
