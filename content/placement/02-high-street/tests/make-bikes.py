def same(what, got, want):
    if got != want or type(got) is not type(want):
        raise CheckFailed(what, expected=repr(want), actual=repr(got))


def raises_value_error(what, action):
    try:
        action()
    except ValueError:
        return
    except Exception as problem:
        raise CheckFailed(f"{what} should raise ValueError, not {type(problem).__name__}.")
    raise CheckFailed(f"{what} should raise ValueError.")


def numbers(bikes):
    return [bike.number for bike in bikes]


def riyas_tandem(ctx):
    bikes = ctx.module()
    tandem = bikes.Bike(3, "tandem", 6.0)
    tandem.hire("Riya")
    same("str of bike 3, out with Riya", str(tandem), "Bike 3: tandem, out with Riya")
    charge = tandem.give_back(2)
    if charge != 12:
        raise CheckFailed("Two hours on a 6.00 tandem.", expected="12.0", actual=repr(charge))
    same("str of bike 3, back in", str(tandem), "Bike 3: tandem, in")


def shed_of_three(ctx):
    bikes = ctx.module()
    shed = bikes.Shed([bikes.Bike(5, "road", 4.0), bikes.Bike(2, "tandem", 6.0), bikes.Bike(9, "cargo", 5.0)])
    same("len(shed)", len(shed), 3)
    same("2 in shed", 2 in shed, True)
    same("4 in shed", 4 in shed, False)


def new_bike(ctx):
    bikes = ctx.module()
    bike = bikes.Bike(7, "road", 4.5)
    same("bike.number", bike.number, 7)
    same("bike.kind", bike.kind, "road")
    same("bike.rate", bike.rate, 4.5)
    same("A new bike's rider", bike.rider, None)
    same("str of a new bike", str(bike), "Bike 7: road, in")


def hired_twice(ctx):
    bikes = ctx.module()
    bike = bikes.Bike(4, "road", 4.0)
    bike.hire("Neil")
    raises_value_error("Hiring bike 4 while Neil has it", lambda: bike.hire("Yahya"))
    same("The rider after a refused hire", bike.rider, "Neil")


def not_out(ctx):
    bikes = ctx.module()
    bike = bikes.Bike(4, "road", 4.0)
    raises_value_error("Giving back a bike that's in the shed", lambda: bike.give_back(1))


def charge(hours, rate, expected, message):
    def check(ctx):
        bikes = ctx.module()
        bike = bikes.Bike(8, "cargo", rate)
        bike.hire("Caitlin")
        got = bike.give_back(hours)
        if not isinstance(got, (int, float)) or abs(got - expected) > 1e-9:
            raise CheckFailed(message, expected=repr(expected), actual=repr(got))
    return check


def hire_again(ctx):
    bikes = ctx.module()
    bike = bikes.Bike(1, "road", 4.0)
    bike.hire("Aaesha")
    bike.give_back(1)
    same("The rider once it's back", bike.rider, None)
    bike.hire("Paul")
    same("str after a second hire", str(bike), "Bike 1: road, out with Paul")


def equality(ctx):
    bikes = ctx.module()
    same("Bike(3, \"tandem\", 6.0) == Bike(3, \"road\", 4.0)", bikes.Bike(3, "tandem", 6.0) == bikes.Bike(3, "road", 4.0), True)
    same("Bike(3, \"tandem\", 6.0) == Bike(4, \"tandem\", 6.0)", bikes.Bike(3, "tandem", 6.0) == bikes.Bike(4, "tandem", 6.0), False)


def not_a_bike(ctx):
    bikes = ctx.module()
    bike = bikes.Bike(3, "tandem", 6.0)
    try:
        number = bike == 3
        text = bike == "Bike 3: tandem, in"
    except Exception as problem:
        raise CheckFailed(f"Comparing a bike with something that isn't a bike crashed: {type(problem).__name__}: {problem}")
    same("Bike 3 == 3", number, False)
    same("Bike 3 == \"Bike 3: tandem, in\"", text, False)


def sorting(ctx):
    bikes = ctx.module()
    pile = [bikes.Bike(12, "road", 4.0), bikes.Bike(3, "tandem", 6.0), bikes.Bike(7, "cargo", 5.0), bikes.Bike(1, "road", 4.0)]
    same("Bike numbers after sorted()", numbers(sorted(pile)), [1, 3, 7, 12])


def available(ctx):
    bikes = ctx.module()
    pile = [bikes.Bike(9, "road", 4.0), bikes.Bike(2, "tandem", 6.0), bikes.Bike(5, "cargo", 5.0),
            bikes.Bike(1, "road", 4.0), bikes.Bike(7, "road", 4.0)]
    shed = bikes.Shed(pile)
    pile[2].hire("Riya")
    got = shed.available()
    if not isinstance(got, list):
        raise CheckFailed("available() should give back a list.", actual=repr(got))
    same("Bike numbers in the shed, with 5 out", numbers(got), [1, 2, 7, 9])


def own_list(ctx):
    bikes = ctx.module()
    pile = [bikes.Bike(5, "road", 4.0), bikes.Bike(2, "tandem", 6.0)]
    shed = bikes.Shed(pile)
    pile.append(bikes.Bike(6, "road", 4.0))
    same("len(shed) after someone else's list grew", len(shed), 2)
    same("6 in shed", 6 in shed, False)


def empty_shed(ctx):
    bikes = ctx.module()
    shed = bikes.Shed([])
    same("len of an empty shed", len(shed), 0)
    same("1 in an empty shed", 1 in shed, False)
    same("available() in an empty shed", shed.available(), [])


TESTS = [
    custom("Riya's tandem", riyas_tandem, visible=True),
    custom("A shed of three", shed_of_three, visible=True),
    custom("A new bike", new_bike),
    custom("Hired twice", hired_twice,
           hint="Check the rider before hiring. If there already is one, raise ValueError and leave the rider alone."),
    custom("Given back when it isn't out", not_out),
    custom("Three hours on the cargo bike", charge(3, 5.0, 15.0, "Three hours at 5.00 an hour.")),
    custom("Twenty minutes still costs an hour", charge(1 / 3, 5.0, 5.0, "Less than an hour is charged as one hour."),
           hint="Never less than one hour's worth: max(hours, 1)."),
    custom("Half past one", charge(1.5, 4.0, 6.0, "An hour and a half at 4.00 an hour.")),
    custom("Back in, and out again", hire_again),
    custom("Same number, same bike", equality),
    custom("A bike isn't a number", not_a_bike,
           hint="In __eq__, if the other thing isn't a Bike, give back NotImplemented (or False) before reading its number."),
    custom("Sorted by number", sorting,
           hint="sorted() compares with <. Give Bike a __lt__ that compares numbers."),
    custom("What's in the shed", available,
           hint="Only the bikes that are in, sorted by number. The shed holds the same bike objects, so a bike hired elsewhere is out in the shed too."),
    custom("The shed keeps its own list", own_list,
           hint="Copy the list you're given, so someone else's list growing doesn't change the shed."),
    custom("An empty shed", empty_shed),
]
