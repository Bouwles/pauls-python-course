MENU = "1. Knots to mph\n2. Knots to km/h\n3. Miles to km"

TESTS = [
    output("Eleven sea miles to the island", inputs=["3", "11", "yes"], expect="That's 20.37 km.", match="last_line", visible=True),
    output("Twelve knots in km/h", inputs=["2", "12"], expect="That's 22.22 km/h.", match="last_line", visible=True),
    output("The menu comes first", inputs=["1", "12"], expect=MENU, match="contains",
           hint="Print the three menu lines exactly as in the brief, before asking for a choice."),
    output("Twelve knots in mph", inputs=["1", "12"], expect="That's 13.81 mph.", match="last_line"),
    output("Eleven land miles", inputs=["3", "11", "no"], expect="That's 17.70 km.", match="last_line",
           hint="A land mile is 1.609344 km. Only yes means sea miles."),
    output("Half a knot", inputs=["1", "0.5"], expect="That's 0.58 mph.", match="last_line",
           hint="Amounts can have a decimal point. Which conversion reads 0.5?"),
    output("Two and a half sea miles", inputs=["3", "2.5", "yes"], expect="That's 4.63 km.", match="last_line"),
    output("Standing still", inputs=["2", "0"], expect="That's 0.00 km/h.", match="last_line"),
    output("A 4 is not on the menu", inputs=["4", "10", "no"], expect="No such option.", match="last_line",
           hint="Anything that isn't 1, 2 or 3 gets No such option. An else at the end catches it."),
    output("Nor is a 0", inputs=["0", "10", "no"], expect="No such option.", match="last_line"),
]
