MENU = "1. Km/h to mph\n2. Knots to km/h\n3. Mach to km/h"

TESTS = [
    output("Mach 2, high up", inputs=["3", "2", "no"], expect="That's 2124.00 km/h.", match="last_line", visible=True),
    output("An airliner at 450 knots", inputs=["2", "450"], expect="That's 833.40 km/h.", match="last_line", visible=True),
    output("The menu comes first", inputs=["1", "12"], expect=MENU, match="contains",
           hint="Print the three menu lines exactly as in the brief, before asking for a choice."),
    output("An F1 car at 340 km/h", inputs=["1", "340"], expect="That's 211.27 mph.", match="last_line"),
    output("Mach 1 at sea level", inputs=["3", "1", "yes"], expect="That's 1225.00 km/h.", match="last_line",
           hint="At sea level, Mach 1 is 1225 km/h. Only yes means sea level."),
    output("80.5 km/h in the pit lane", inputs=["1", "80.5"], expect="That's 50.02 mph.", match="last_line",
           hint="Speeds can have a decimal point. Which conversion reads 80.5?"),
    output("Mach 0.8 at sea level", inputs=["3", "0.8", "yes"], expect="That's 980.00 km/h.", match="last_line"),
    output("Standing still", inputs=["2", "0"], expect="That's 0.00 km/h.", match="last_line"),
    output("A 4 is not on the menu", inputs=["4", "10", "no"], expect="No such option.", match="last_line",
           hint="Anything that isn't 1, 2 or 3 gets No such option. An else at the end catches it."),
    output("Nor is a 0", inputs=["0", "10", "no"], expect="No such option.", match="last_line"),
]
