def classes(ctx):
    m = ctx.module()
    for name in ("Bike", "ElectricBike", "Shed"):
        if not hasattr(m, name):
            raise CheckFailed(f"There is no class called {name}.")
    return m


def same(what, got, want):
    if got != want or type(got) is not type(want):
        raise CheckFailed(what, expected=want, actual=got)


def shows_itself(ctx):
    m = classes(ctx)
    bike = m.Bike(7, 4)
    same("str() of bike 7", str(bike), "Bike 7")
    same("repr() of bike 7", repr(bike), "Bike(7, 4)")
    same("A list of two bikes", repr([bike, m.Bike(12, 5)]), "[Bike(7, 4), Bike(12, 5)]")


def electric_ride(ctx):
    m = classes(ctx)
    volt = m.ElectricBike(9, 6)
    same("Hiring a free electric bike", volt.hire("Gwen"), True)
    same("Gwen has it", volt.rider, "Gwen")
    cost = volt.give_back(2)
    same("Two hours at 6, plus the £2 battery fee", cost, 14)
    same("The charge after two hours", volt.charge, 80)
    same("str() of the electric bike", str(volt), "Electric bike 9 (80%)")
    if volt.rider is not None:
        raise CheckFailed("After give_back, the electric bike should have no rider.", expected=None, actual=volt.rider)


def equal_numbers(ctx):
    m = classes(ctx)
    same("Bike 7 at 4 and bike 7 at 5 are the same bike", m.Bike(7, 4) == m.Bike(7, 5), True)
    same("Bike 7 and bike 8 are different bikes", m.Bike(7, 4) == m.Bike(8, 4), False)
    same("Bike 7 is in a list holding another bike 7", m.Bike(7, 4) in [m.Bike(3, 4), m.Bike(7, 9)], True)


def other_things(ctx):
    m = classes(ctx)
    same("A bike compared with the text 'Bike 7'", m.Bike(7, 4) == "Bike 7", False)
    same("A bike compared with the number 7", m.Bike(7, 4) == 7, False)
    same("A bike is not equal to None", m.Bike(7, 4) != None, True)


def electric_setup(ctx):
    m = classes(ctx)
    e = m.ElectricBike(4, 5, charge=60)
    got = (getattr(e, "number", "missing"), getattr(e, "rate", "missing"), getattr(e, "rider", "missing"), getattr(e, "charge", "missing"))
    same("ElectricBike(4, 5, charge=60): number, rate, rider, charge", got, (4, 5, None, 60))
    if not isinstance(e, m.Bike):
        raise CheckFailed("An ElectricBike should be a kind of Bike: class ElectricBike(Bike).")
    same("A new electric bike's default charge", m.ElectricBike(2, 3).charge, 100)


def runs_flat(ctx):
    m = classes(ctx)
    e = m.ElectricBike(3, 5, charge=30)
    e.hire("Tom")
    same("Four hours at 5, plus the fee", e.give_back(4), 22)
    same("The charge never goes below 0", e.charge, 0)
    same("str() of a flat bike", str(e), "Electric bike 3 (0%)")


def shed_holds(ctx):
    m = classes(ctx)
    shed = m.Shed()
    same("An empty shed's len()", len(shed), 0)
    a, b, c = m.Bike(1, 4), m.ElectricBike(2, 6), m.Bike(3, 5)
    for bike in (a, b, c):
        shed.add(bike)
    same("len() after three bikes", len(shed), 3)
    b.hire("Mira")
    free = shed.free()
    if len(free) != 2 or free[0] is not a or free[1] is not c:
        raise CheckFailed("free() should give the bikes with no rider, in the order they were added.",
                          expected="[Bike(1, 4), Bike(3, 5)]", actual=repr(free))


def kat_way(ctx):
    m = classes(ctx)
    shed = m.Shed()
    bike = m.Bike(5, 4)
    shed.add(bike)
    bikes = getattr(shed, "bikes", None)
    if not isinstance(bikes, list) or isinstance(shed, list) or bikes != [bike]:
        raise CheckFailed("Kat's way: the shed keeps its bikes in a list, self.bikes, rather than being a list itself.")


TESTS = [
    custom("Bike 7 shows itself", shows_itself, visible=True),
    custom("Gwen rides electric bike 9 for two hours", electric_ride, visible=True),
    custom("Bikes with the same number are equal", equal_numbers,
           hint="If only this fails, __eq__ should compare the two numbers."),
    custom("A bike is never equal to something else", other_things,
           hint="For anything that isn't a bike, return NotImplemented. A method that falls off its end returns None."),
    custom("An electric bike is set up properly", electric_setup,
           hint="If only this fails, ElectricBike's __init__ needs super().__init__(number, rate)."),
    custom("An electric bike runs flat", runs_flat,
           hint="The charge drops 10 an hour but stops at 0. max(0, ...) does that."),
    custom("A shed of three bikes", shed_holds,
           hint="free() gives back the bikes themselves, in the order they were added, leaving out any with a rider. len(shed) needs __len__."),
    custom("The shed has a list of bikes", kat_way,
           hint="Keep the bikes in self.bikes, a list made in __init__."),
]
